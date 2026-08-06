"""Backup and recovery guarantees — todo_txt_handlers.

Each test pins one invariant of the recovery flow, and each guards a failure
mode in which a destructive operation leaves data unrecoverable:

  * ``POST /api/backups/done-*.txt/restore`` must write DONE.txt. A restore
    that ignores the backup's file family pours done-content into todo.txt
    and destroys the active list.
  * ``GET /api/backups`` must be able to list the done family. A listing
    hardwired to the todo family leaves done.txt backups present on disk but
    invisible to the UI, so done.txt has no recovery path at all.
  * ``POST /api/clear`` — the single most destructive endpoint — must take an
    UNCONDITIONAL backup rather than reuse the 5-minute throttled rotation.
    Under the throttled path a clear issued shortly after a rotation captures
    NOTHING, and up to 5 minutes of edits are unrecoverable.
  * ``POST /api/ai-snapshots/{ts}/restore`` must likewise take an
    unconditional safety copy, matching ``/api/backups/{name}/restore``. A
    throttled safety copy lets a snapshot restore silently destroy work done
    after the snapshot was taken.
  * A backup's mtime must be its own creation time. Sorting, the 5-minute
    gate, retention pruning and the UI's timestamp column all key off backup
    mtime, so copying with ``shutil.copy2`` — which PRESERVES THE SOURCE
    MTIME — makes a backup of an old-mtime file (external edits, a
    Dropbox- or git-synced root) sort as ancient. Once 20 newer-mtime
    backups exist it can be PRUNED THE INSTANT IT IS CREATED.
"""

from __future__ import annotations

import importlib.util
import json
import os
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
        "todo_txt_handlers_under_test_backup_recovery", _MODULE_PATH
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


def _write(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Restore must honor the backup's file family
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_restore_done_backup_targets_done_txt(client, tmp_path, handlers):
    """Restoring a done-family backup must write DONE.txt, never todo.txt."""
    todo_before = "(A) active task +work\n"
    _write(tmp_path / "todo.txt", todo_before)
    done_backup = tmp_path / "backup" / f"done-{int(time.time() * 1000)}.txt"
    done_backup_content = "x 2026-08-01 archived thing @home\n"
    _write(done_backup, done_backup_content)
    _write(tmp_path / "done.txt", "x 2026-08-02 newer state\n")

    res = await client.post(f"/api/backups/{done_backup.name}/restore")
    assert res.status == 200
    payload = await res.json()

    # todo.txt must be untouched; a family-blind restore clobbers it.
    assert (tmp_path / "todo.txt").read_text(encoding="utf-8") == todo_before
    # done.txt got the restored content.
    assert (
        tmp_path / "done.txt"
    ).read_text(encoding="utf-8") == done_backup_content
    assert payload.get("file") == "done"


@pytest.mark.asyncio
async def test_restore_unknown_family_rejected(client, tmp_path):
    """A backup name outside the todo-/done- families must 400, not guess."""
    stray = tmp_path / "backup" / "settings-123.txt"
    _write(stray, "not a real backup\n")
    res = await client.post(f"/api/backups/{stray.name}/restore")
    assert res.status == 400


@pytest.mark.asyncio
async def test_restore_safety_backup_lands_in_same_family(
    client, tmp_path
):
    """The pre-restore safety copy of done.txt must join the DONE family."""
    done_backup = tmp_path / "backup" / f"done-{int(time.time() * 1000)}.txt"
    _write(done_backup, "x 2026-08-01 old\n")
    current_done = "x 2026-08-03 current done state\n"
    _write(tmp_path / "done.txt", current_done)

    res = await client.post(f"/api/backups/{done_backup.name}/restore")
    assert res.status == 200

    safety = [
        p
        for p in (tmp_path / "backup").iterdir()
        if p.name.startswith("done-restore-")
    ]
    assert len(safety) == 1
    assert safety[0].read_text(encoding="utf-8") == current_done
    # No todo-family safety copy should appear from a done restore.
    assert not any(
        p.name.startswith("todo-restore-")
        for p in (tmp_path / "backup").iterdir()
    )


# ---------------------------------------------------------------------------
# Done-family backups must be listable
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_backups_supports_done_family(client, tmp_path):
    _write(tmp_path / "backup" / "done-1700000000000.txt", "x done stuff\n")
    _write(tmp_path / "backup" / "todo-1700000000001.txt", "todo stuff\n")

    res = await client.get("/api/backups?file=done")
    assert res.status == 200
    names = [b["name"] for b in (await res.json())["backups"]]
    assert names == ["done-1700000000000.txt"]

    # Default stays the todo family (back-compat).
    res = await client.get("/api/backups")
    assert res.status == 200
    names = [b["name"] for b in (await res.json())["backups"]]
    assert names == ["todo-1700000000001.txt"]


@pytest.mark.asyncio
async def test_list_backups_rejects_unknown_family(client):
    res = await client.get("/api/backups?file=report")
    assert res.status == 400


# ---------------------------------------------------------------------------
# Clear must take an UNCONDITIONAL backup
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_clear_backs_up_latest_state_even_within_throttle_window(
    client, tmp_path
):
    """Save (rotation fires) → save again (throttled) → clear.

    The pre-clear state exists ONLY in todo.txt at that point, so clear must
    capture it unconditionally. Reusing the throttled rotation here captures
    nothing and the state is gone for good.
    """
    r1 = await client.put("/api/content", json={"content": "first state\n"})
    assert r1.status == 200
    r2 = await client.put(
        "/api/content", json={"content": "precious final state\n"}
    )
    assert r2.status == 200

    res = await client.post("/api/clear")
    assert res.status == 200
    payload = await res.json()

    assert (tmp_path / "todo.txt").read_text(encoding="utf-8") == ""
    backups = list((tmp_path / "backup").glob("todo-*.txt"))
    contents = {p.read_text(encoding="utf-8") for p in backups}
    assert "precious final state\n" in contents, (
        "clear destroyed the only copy of the latest state — backups on "
        f"disk captured: {contents!r}"
    )
    assert payload.get("backup"), "clear must report the backup it took"


# ---------------------------------------------------------------------------
# AI-snapshot restore must take an UNCONDITIONAL safety backup
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_ai_snapshot_restore_backs_up_current_state(
    client, tmp_path, handlers
):
    """Rotation fired recently → snapshot restore must STILL back up the
    current state before overwriting it."""
    # Seed a snapshot capturing some pre-edit state.
    snap_path = handlers._write_ai_snapshot(
        "pre-edit state\n",
        comments=[],
        classification={
            "tier": 2,
            "reason": "test",
            "additive": True,
            "reject": False,
            "line_delta": 0,
            "char_delta": 0,
            "diff": "",
        },
        proposed_content=None,
    )
    snap_id = snap_path.stem

    # Prime the throttle: a fresh save fires a rotation right now.
    r = await client.put("/api/content", json={"content": "mid state\n"})
    assert r.status == 200
    # The state that only exists on disk (post-rotation edits).
    r = await client.put(
        "/api/content", json={"content": "current precious state\n"}
    )
    assert r.status == 200

    res = await client.post(f"/api/ai-snapshots/{snap_id}/restore")
    assert res.status == 200

    assert (
        tmp_path / "todo.txt"
    ).read_text(encoding="utf-8") == "pre-edit state\n"
    contents = {
        p.read_text(encoding="utf-8")
        for p in (tmp_path / "backup").glob("todo-*.txt")
    }
    assert "current precious state\n" in contents, (
        "snapshot restore destroyed the only copy of the current state"
    )


# ---------------------------------------------------------------------------
# Backup mtime must be creation time, not source mtime
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_backup_mtime_is_creation_time(client, tmp_path):
    """A backup of an old-mtime file (an external or sync-managed root)
    must not masquerade as an ancient backup."""
    todo = tmp_path / "todo.txt"
    _write(todo, "x 2026-08-01 synced from dropbox three days ago\n")
    three_days_ago = time.time() - 3 * 86400
    os.utime(todo, (three_days_ago, three_days_ago))

    res = await client.post("/api/archive")  # unconditional backup path
    assert res.status == 200

    backups = list((tmp_path / "backup").glob("todo-*.txt"))
    assert backups, "archive must back up todo.txt"
    age = time.time() - backups[0].stat().st_mtime
    assert age < 60, (
        f"backup mtime is {age / 3600:.1f}h old — copy2 preserved the "
        "source mtime; sorting/gating/pruning all key off this"
    )


@pytest.mark.asyncio
async def test_fresh_backup_survives_pruning_with_old_source_mtime(
    client, tmp_path
):
    """20 recent backups + an old-mtime source: the NEW backup must survive
    the prune. A backup that inherits the source mtime sorts as the oldest
    entry and is deleted the instant it is created."""
    backup_dir = tmp_path / "backup"
    now = time.time()
    for i in range(20):
        p = backup_dir / f"todo-{1700000000000 + i}.txt"
        _write(p, f"recent backup {i}\n")
        os.utime(p, (now - 100 + i, now - 100 + i))

    todo = tmp_path / "todo.txt"
    precious = "x 2026-08-01 the only copy of this state\n"
    _write(todo, precious)
    week_ago = now - 7 * 86400
    os.utime(todo, (week_ago, week_ago))

    res = await client.post("/api/archive")
    assert res.status == 200

    contents = {
        p.read_text(encoding="utf-8")
        for p in backup_dir.glob("todo-*.txt")
    }
    assert precious in contents, (
        "the just-created backup was pruned in the same call that created "
        "it — the destructive op proceeded with NO recoverable copy"
    )
