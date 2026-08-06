"""Settings / set-root flow under hostile and edge-case input.

``validate_root`` refuses NUL bytes, relative paths, symlinks into ~/.ssh,
$HOME itself, and non-directories, and the policy re-runs on every READ so a
directory swapped for a symlink after the fact is caught. These tests cover
the SWITCH instead — the state transition the validator does not protect on
its own. Three invariants are pinned here:

  Transactional switch. Persisting the new root BEFORE creating its layout
      leaves an unwritable-but-legal target pointing the app at a root it
      cannot use: the handler returns 500 (implying nothing changed) while
      every subsequent read and write also 500s. The user's data stays
      intact in the old root but is unreachable through the UI, and recovery
      demands knowing to type `set-root default` into a palette on a page
      that can no longer load. The target is therefore preflighted for
      writability BEFORE the setting is stored, and a late failure rolls the
      setting back.
  Staged apply fails CLOSED on a missing base. If `base is None` skips the
      staleness comparison, the proposal is applied blindly over whatever
      the user has since written. A missing base must be a refusal.
  Rule 4 is not a blanket subtree exception. Allowing the app's own data dir
      unconditionally would also permit the root to be set to the app's own
      `backup/` or `ai-snapshots/` directory — nesting live files among
      their own backups, making the backup listing show a live file's
      siblings, and recursing backup/backup/ on every rotation. Both are
      denied explicitly.
"""

from __future__ import annotations

import importlib.util
import json
import os
import sys
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
        "todo_txt_handlers_under_test_settings_attack", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def handlers(tmp_path, monkeypatch):
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path / "appdata"))
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


@pytest.fixture
def fake_home(tmp_path, monkeypatch, handlers):
    """A writable stand-in for $HOME so root candidates pass rule 5."""
    home = tmp_path / "home"
    home.mkdir()
    monkeypatch.setattr(handlers, "_home_dir", lambda: home.resolve())
    return home.resolve()


# ---------------------------------------------------------------------------
# The switch must be transactional
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_unwritable_root_is_refused_without_changing_state(
    handlers, client, fake_home
):
    """A legal-but-unwritable target must not become the active root."""
    before = await (await client.get("/api/settings")).json()
    assert before["is_default"] is True

    target = fake_home / "readonly-notes"
    target.mkdir()
    os.chmod(target, 0o555)
    try:
        res = await client.put("/api/settings", json={"root": str(target)})
        assert res.status == 400, (
            "an unwritable root was accepted; the app is now pointed at a "
            "directory it cannot read or write"
        )
        payload = await res.json()
        assert payload.get("code") == "invalid_root"

        after = await (await client.get("/api/settings")).json()
        assert after["root"] == before["root"], (
            "PUT failed but the active root moved anyway — the app is bricked "
            "and the user's data is unreachable through the UI"
        )
        assert after["is_default"] is True

        # And the app still works on its original root.
        assert (await client.get("/api/content")).status == 200
        w = await client.put(
            "/api/content", json={"content": "still alive\n", "base_mtime": 0}
        )
        assert w.status in (200, 409)
    finally:
        os.chmod(target, 0o755)


@pytest.mark.asyncio
async def test_settings_file_not_written_when_target_unusable(
    handlers, client, fake_home
):
    """The rejected switch must leave settings.json free of the bad root."""
    target = fake_home / "readonly-notes-2"
    target.mkdir()
    os.chmod(target, 0o555)
    try:
        await client.put("/api/settings", json={"root": str(target)})
        settings_file = handlers._settings_path()
        if settings_file.is_file():
            stored = json.loads(settings_file.read_text(encoding="utf-8"))
            assert stored.get("root") != str(target), (
                "the unusable root was persisted — it survives a restart"
            )
        assert handlers._configured_root() is None
    finally:
        os.chmod(target, 0o755)


@pytest.mark.asyncio
async def test_writable_root_switch_succeeds(handlers, client, fake_home):
    """A writable target becomes the active root and gets its full layout."""
    target = fake_home / "notes"
    target.mkdir()
    res = await client.put("/api/settings", json={"root": str(target)})
    assert res.status == 200
    payload = await res.json()
    assert payload["root"] == str(target)
    assert payload["is_default"] is False
    # Layout created, and the preflight left no litter behind.
    assert (target / "backup").is_dir()
    assert (target / "ai-snapshots").is_dir()
    leftovers = [
        p.name for p in target.iterdir()
        if p.name.startswith(".todo-txt-writable")
    ]
    assert leftovers == [], f"preflight probe files left behind: {leftovers}"
    # Reset restores the default.
    res2 = await client.put("/api/settings", json={"root": None})
    assert res2.status == 200
    assert (await res2.json())["is_default"] is True


# ---------------------------------------------------------------------------
# The staged-apply staleness gate must fail CLOSED
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_refuses_when_snapshot_base_missing(handlers, client):
    """No base to diff against = no apply (the gate must not fail open)."""
    base_content = "task one\ntask two\ntask three\n"
    handlers._todo_path().write_text(base_content, encoding="utf-8")

    async def fake_llm(prompt, *, temperature, timeout):
        return "task one\ntask two\n"

    handlers._llm_call = fake_llm
    res = await client.post(
        "/api/ai-edit",
        json={"comments": [{"text": "drop the last one", "line": 3}]},
    )
    payload = await res.json()
    assert payload["status"] == "staged"
    snap_id = payload["snapshot"].removesuffix(".txt")

    # The pre-edit snapshot disappears (manual cleanup, sync tool, corruption)
    # while the proposal sidecar remains.
    snap_path, _, proposed_path = handlers._snapshot_paths_for(snap_id)
    snap_path.unlink()
    assert proposed_path.is_file()

    # Meanwhile the user has edited the file.
    edited = base_content + "(A) urgent thing\n"
    handlers._todo_path().write_text(edited, encoding="utf-8")

    res2 = await client.post(f"/api/ai-snapshots/{snap_id}/apply")
    assert res2.status == 409, (
        "apply proceeded with no base to compare against — a missing "
        "snapshot silently disabled the staleness gate"
    )
    assert handlers._todo_path().read_text(encoding="utf-8") == edited


# ---------------------------------------------------------------------------
# The root must not nest inside the app's own machinery
# ---------------------------------------------------------------------------

def test_root_cannot_be_the_apps_backup_dir(handlers):
    resolved, reason = handlers.validate_root(str(handlers._backup_dir()))
    assert resolved is None, (
        "root accepted the app's own backup/ dir — live files would sit "
        "among their own backups and rotation would recurse backup/backup/"
    )
    assert "backup" in reason


def test_root_cannot_be_the_apps_ai_snapshots_dir(handlers):
    resolved, reason = handlers.validate_root(
        str(handlers._ai_snapshots_dir())
    )
    assert resolved is None
    assert "snapshot" in reason.lower()


def test_default_root_itself_is_allowed(handlers):
    """The app's own default data dir is a valid root, unlike its subdirs."""
    resolved, reason = handlers.validate_root(
        str(handlers._default_root_dir())
    )
    assert reason is None
    assert resolved == handlers._default_root_dir().resolve()


@pytest.mark.parametrize(
    "bad, label",
    [
        ("\n", "newline"),
        ("\r", "carriage return"),
        ("\t", "tab"),
        ("\x1b", "escape"),
        ("\x7f", "delete"),
    ],
)
def test_root_rejects_control_characters(handlers, fake_home, bad, label):
    """A control character in the path is refused, not silently honoured.

    Only NUL was rejected, so a path carrying a newline passed validation and
    the directory was then CREATED with that character in its name — a
    directory the user cannot type back and will not recognise in a listing.

    This is robustness, not injection: paths are handled through ``pathlib``
    and never reach a shell, so the text after a newline is inert. The reason
    to refuse it is that such a value is a paste accident essentially every
    time, and failing loudly beats leaving a stray directory behind.
    """
    target = fake_home / f"notes{bad}rm -rf x"
    resolved, reason = handlers.validate_root(str(target))
    assert resolved is None, (
        f"a {label} in the path was accepted; the directory would be created"
    )
    assert "control character" in reason


def test_root_still_accepts_ordinary_unicode(handlers, fake_home):
    """The control-character guard must not reject legitimate non-ASCII names.

    Accented characters, CJK and emoji are all valid directory names and are
    what a real user's Documents folder actually looks like. Rejecting them
    would be a worse bug than the one the guard above fixes.
    """
    for name in ("notităe", "待办事项", "todo-📝"):
        target = fake_home / name
        target.mkdir(parents=True, exist_ok=True)
        resolved, reason = handlers.validate_root(str(target))
        assert reason is None, f"{name!r} was rejected: {reason}"
        assert resolved == target.resolve()
