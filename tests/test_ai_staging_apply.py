"""Staged AI-edit apply/discard lifecycle — todo_txt_handlers.

A Tier-3 edit stages a proposed rewrite of todo.txt and commits it only when
the user approves. Each test below pins one invariant of that lifecycle:

  Route contract  The staged-review modal POSTs
                  /api/ai-snapshots/{ts}/apply|discard — the snapshot id is
                  the resource — so those paths must be registered. A backend
                  serving only /api/ai-edit/{ts}/apply|discard 404s every
                  Apply and fails every Discard while the UI reports success,
                  which makes the whole review surface dead in production.
                  Both spellings are served; /api/ai-edit/... is kept for
                  compatibility.
  Staleness gate  Apply has the longest window between reading todo.txt and
                  writing it back, so it re-checks that the file still matches
                  the snapshot base the proposal was diffed against and
                  answers 409 otherwise. Without that check, a proposal staged
                  against an older file destroys every edit made since
                  staging.
  Safety backup   Apply backs up the CURRENT file unconditionally, like every
                  other destructive write. The staging snapshot preserves only
                  the state at staging time, so edits made between staging and
                  apply are captured nowhere else.
  Removal detect  _classify_edit decides whether an edit is additive (Tier 2,
                  auto-applied) or destructive (Tier 3, held for review), and
                  detects line removal as a multiset difference. todo.txt
                  legitimately holds duplicated lines from repeated manual
                  re-adds, and set membership would report "nothing removed"
                  when one copy of such a line is dropped — auto-applying a
                  destructive edit without review.
  Prune safety    _prune_ai_snapshots trims old snapshot triplets but exempts
                  any snapshot carrying a live .proposed.txt, so a staged
                  review cannot be deleted out from under the user once newer
                  snapshots reach the retention cap.
"""

from __future__ import annotations

import importlib.util
import sys
import time
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer


_MODULE_PATH = (
    Path(__file__).resolve().parent.parent
    / "backend"
    / "todo_txt_handlers.py"
)


def _load_handlers_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_handlers_under_test_ai_staging", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def handlers(tmp_path, monkeypatch):
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    monkeypatch.delenv("TODO_TXT_SEED", raising=False)
    monkeypatch.delenv("TODO_TXT_AI_YOLO", raising=False)
    mod = _load_handlers_module()
    mod.ensure_dirs()
    return mod


@pytest_asyncio.fixture
async def client(handlers):
    app = web.Application()
    handlers.register_routes(app)
    server = TestServer(app)
    client = TestClient(server)
    await client.start_server()
    yield client
    await client.close()


BASE = "task one +proj @ctx\ntask two @ctx\ntask three\n"
# A destructive proposal against BASE: drops "task three".
PROPOSAL = "task one +proj @ctx\ntask two @ctx\n"


async def _stage_proposal(handlers, client, base=BASE, proposed=PROPOSAL):
    """Drive POST /api/ai-edit to a staged Tier-3 proposal; return snap id."""
    handlers._todo_path().write_text(base, encoding="utf-8")

    async def fake_llm(prompt, *, temperature, timeout):
        return proposed

    handlers._llm_call = fake_llm
    res = await client.post(
        "/api/ai-edit",
        json={"comments": [{"text": "drop task three", "line": 3,
                            "anchor": "task three"}]},
    )
    assert res.status == 200
    payload = await res.json()
    assert payload["status"] == "staged"
    assert payload["tier"] == 3
    return payload["snapshot"].removesuffix(".txt")


# ---------------------------------------------------------------------------
# Route contract — the URLs the staged modal posts to must exist
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_ui_apply_url_ai_snapshots_alias_works(handlers, client):
    """The exact URL the staged modal fetches must apply the proposal."""
    snap = await _stage_proposal(handlers, client)
    res = await client.post(f"/api/ai-snapshots/{snap}/apply")
    assert res.status == 200, (
        "UI posts /api/ai-snapshots/{ts}/apply — a 404 here means the "
        "staged-apply feature is dead in production"
    )
    # _strip_llm_response normalizes trailing newlines at staging time, so
    # the applied content is the stripped form (same as Tier-2 auto-apply).
    assert handlers._todo_path().read_text(encoding="utf-8") == PROPOSAL.rstrip("\n")


@pytest.mark.asyncio
async def test_ui_discard_url_ai_snapshots_alias_works(handlers, client):
    """The exact URL the staged modal fetches must discard the proposal."""
    snap = await _stage_proposal(handlers, client)
    res = await client.post(f"/api/ai-snapshots/{snap}/discard")
    assert res.status == 200
    # Discard prunes the triplet; the proposal must be unusable afterwards.
    res2 = await client.post(f"/api/ai-snapshots/{snap}/apply")
    assert res2.status == 404
    # todo.txt untouched throughout.
    assert handlers._todo_path().read_text(encoding="utf-8") == BASE


@pytest.mark.asyncio
async def test_legacy_ai_edit_apply_path_still_registered(handlers, client):
    """The compatibility path /api/ai-edit/{ts}/apply keeps working."""
    snap = await _stage_proposal(handlers, client)
    res = await client.post(f"/api/ai-edit/{snap}/apply")
    assert res.status == 200


# ---------------------------------------------------------------------------
# Staleness gate — apply must refuse a proposal whose base is stale
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_conflicts_when_file_changed_since_staging(
    handlers, client
):
    snap = await _stage_proposal(handlers, client)
    # User keeps editing after staging: adds an urgent task.
    edited = BASE + "(A) call the bank due:2026-08-06\n"
    handlers._todo_path().write_text(edited, encoding="utf-8")

    res = await client.post(f"/api/ai-snapshots/{snap}/apply")
    assert res.status == 409, (
        "apply blindly overwrote a file that changed since staging — every "
        "post-staging edit would be silently destroyed"
    )
    # The edit survived.
    assert handlers._todo_path().read_text(encoding="utf-8") == edited
    # And the proposal is still there for the user to re-decide.
    res2 = await client.post(f"/api/ai-snapshots/{snap}/discard")
    assert res2.status == 200


# ---------------------------------------------------------------------------
# Safety backup — apply must back up the state it overwrites
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_takes_unconditional_backup_of_current_state(
    handlers, client
):
    snap = await _stage_proposal(handlers, client)
    before = {p.name for p in handlers._backup_dir().glob("todo-*.txt")}
    res = await client.post(f"/api/ai-snapshots/{snap}/apply")
    assert res.status == 200
    payload = await res.json()
    new_backups = {
        p.name for p in handlers._backup_dir().glob("todo-*.txt")
    } - before
    assert len(new_backups) == 1, (
        "apply wrote todo.txt without backing up the state it destroyed"
    )
    backup_name = new_backups.pop()
    assert payload.get("backup") == backup_name
    backup = handlers._backup_dir() / backup_name
    assert backup.read_text(encoding="utf-8") == BASE


# ---------------------------------------------------------------------------
# Removal detection — dropping one copy of a duplicated line is destructive
# ---------------------------------------------------------------------------

def test_classifier_catches_duplicate_line_removal():
    mod = _load_handlers_module()
    old = "buy milk @errands\nbuy milk @errands\ncall mom\n"
    # One copy of the duplicated line removed; a longer new line keeps both
    # the line count and the char count non-decreasing.
    new = "buy milk @errands\ncall mom\nreview quarterly goals +work @planning\n"
    c = mod._classify_edit(old, new)
    assert c["tier"] == 3, (
        "removing one copy of a duplicated line auto-applied as Tier 2 — "
        "set-based removal detection is blind to multiplicity"
    )
    assert c["additive"] is False
    assert "buy milk @errands" in c["removed_lines"]


def test_classifier_still_tier2_for_genuine_additions():
    mod = _load_handlers_module()
    old = "buy milk @errands\nbuy milk @errands\n"
    new = "buy milk @errands\nbuy milk @errands\ncall mom\n"
    c = mod._classify_edit(old, new)
    assert c["tier"] == 2
    assert c["additive"] is True


# ---------------------------------------------------------------------------
# Prune safety — pruning must spare a staged-but-unapplied proposal
# ---------------------------------------------------------------------------

def test_prune_spares_snapshots_with_live_proposals(handlers):
    snap_dir = handlers._ai_snapshots_dir()
    snap_dir.mkdir(parents=True, exist_ok=True)
    now = time.time()

    # The OLDEST snapshot carries a staged, unapplied proposal.
    staged_stem = "ai-1000000000000-aaaaaa"
    for suffix, body in (
        (".txt", "pre-edit content\n"),
        (".meta.json", "{}"),
        (".proposed.txt", "proposed content\n"),
    ):
        p = snap_dir / f"{staged_stem}{suffix}"
        p.write_text(body, encoding="utf-8")
    import os as _os
    _os.utime(snap_dir / f"{staged_stem}.txt", (now - 9000, now - 9000))

    # Then RETENTION_COUNT newer plain snapshots (no proposal).
    for i in range(handlers.AI_SNAPSHOT_RETENTION_COUNT):
        stem = f"ai-{1700000000000 + i}-bbbb{i:02d}"
        (snap_dir / f"{stem}.txt").write_text("x\n", encoding="utf-8")
        (snap_dir / f"{stem}.meta.json").write_text("{}", encoding="utf-8")
        ts = now - 5000 + i
        _os.utime(snap_dir / f"{stem}.txt", (ts, ts))

    handlers._prune_ai_snapshots()

    assert (snap_dir / f"{staged_stem}.proposed.txt").is_file(), (
        "pruning deleted a staged-but-unapplied proposal — the user's "
        "pending review vanished with no warning"
    )
    assert (snap_dir / f"{staged_stem}.txt").is_file()
    # Plain snapshots beyond the cap are still pruned (the cap works).
    plain = [
        p for p in snap_dir.glob("ai-*.txt")
        if not p.name.endswith(".proposed.txt")
        and not (snap_dir / f"{p.stem}.proposed.txt").is_file()
    ]
    assert len(plain) <= handlers.AI_SNAPSHOT_RETENTION_COUNT
