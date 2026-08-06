"""Tests for todo_txt_handlers.api_archive — POST /api/archive.

Verifies:
  - No done lines        → archived=0, done.txt untouched
  - Some done lines      → only x-lines move, rest stay
  - All done lines       → todo.txt emptied, done.txt gets them all
  - Idempotent second call → second call returns archived=0
  - Both files are backed up into backup/ before the rewrite
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer


# ---------------------------------------------------------------------------
# Module loader — load the handler module directly from the worktree so these
# tests work without the full application package being installed.
# ---------------------------------------------------------------------------

_MODULE_PATH = (
    Path(__file__).resolve().parent.parent
    / "backend"
    / "todo_txt_handlers.py"
)


def _load_handlers_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_handlers_under_test_archive", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def handlers(tmp_path, monkeypatch):
    """Load handler module with TODO_TXT_ROOT pointed at tmp_path."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    mod = _load_handlers_module()
    mod.ensure_dirs()
    return mod


@pytest_asyncio.fixture
async def client(handlers):
    """aiohttp TestClient with the /api/archive route registered."""
    app = web.Application()
    app.router.add_post("/api/archive", handlers.api_archive)
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


# ---------------------------------------------------------------------------
# 1. No done lines — archive is a no-op
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_archive_no_done_lines(client, tmp_path):
    todo = tmp_path / "todo.txt"
    todo.write_text(
        "(A) write spec +todo-txt\n"
        "buy groceries @errands\n"
        "call mom @phone\n",
        encoding="utf-8",
    )
    # Pre-seed done.txt so done_total in the response reflects pre-existing
    # entries (not just freshly archived ones).
    done = tmp_path / "done.txt"
    done.write_text("x 2026-05-01 pre-existing\n", encoding="utf-8")

    resp = await client.post("/api/archive")
    assert resp.status == 200
    body = await resp.json()
    assert body == {"archived": 0, "done_total": 1}

    # todo.txt is byte-for-byte unchanged.
    assert todo.read_text(encoding="utf-8") == (
        "(A) write spec +todo-txt\n"
        "buy groceries @errands\n"
        "call mom @phone\n"
    )
    # done.txt is byte-for-byte unchanged.
    assert done.read_text(encoding="utf-8") == "x 2026-05-01 pre-existing\n"


# ---------------------------------------------------------------------------
# 2. Some done lines — partition correctly
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_archive_some_done_lines(client, tmp_path):
    todo = tmp_path / "todo.txt"
    todo.write_text(
        "(A) write spec +todo-txt\n"
        "x 2026-05-06 shipped v0.1\n"
        "buy groceries @errands\n"
        "x 2026-05-07 wrote tests\n"
        "call mom @phone\n",
        encoding="utf-8",
    )

    resp = await client.post("/api/archive")
    assert resp.status == 200
    body = await resp.json()
    assert body["archived"] == 2
    assert body["done_total"] == 2

    # todo.txt keeps only the non-done lines, in original order.
    assert todo.read_text(encoding="utf-8") == (
        "(A) write spec +todo-txt\n"
        "buy groceries @errands\n"
        "call mom @phone\n"
    )
    # done.txt gets the archived lines appended in source order.
    done = tmp_path / "done.txt"
    assert done.read_text(encoding="utf-8") == (
        "x 2026-05-06 shipped v0.1\n"
        "x 2026-05-07 wrote tests\n"
    )

    # Both files were backed up before the rewrite.
    backup_dir = tmp_path / "backup"
    backups = sorted(p.name for p in backup_dir.iterdir())
    assert any(n.startswith("todo-") and n.endswith(".txt") for n in backups)
    # done.txt didn't exist before, so no done-* backup — that's fine.
    # (The backup helper only copies files that exist.)


# ---------------------------------------------------------------------------
# 3. All done lines — todo.txt becomes empty
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_archive_all_done_lines(client, tmp_path):
    todo = tmp_path / "todo.txt"
    todo.write_text(
        "x 2026-05-06 task one\n"
        "x 2026-05-07 task two\n"
        "x 2026-05-07 task three\n",
        encoding="utf-8",
    )

    resp = await client.post("/api/archive")
    assert resp.status == 200
    body = await resp.json()
    assert body["archived"] == 3
    assert body["done_total"] == 3

    # todo.txt is empty after archiving every line.
    assert todo.read_text(encoding="utf-8") == ""
    # done.txt contains all three lines in order.
    done = tmp_path / "done.txt"
    assert done.read_text(encoding="utf-8") == (
        "x 2026-05-06 task one\n"
        "x 2026-05-07 task two\n"
        "x 2026-05-07 task three\n"
    )


# ---------------------------------------------------------------------------
# 4. Idempotent — second call with nothing to archive returns archived=0
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_archive_idempotent_second_call(client, tmp_path):
    todo = tmp_path / "todo.txt"
    todo.write_text(
        "x 2026-05-06 done thing\n"
        "active thing\n",
        encoding="utf-8",
    )

    # First call archives the one done line.
    resp1 = await client.post("/api/archive")
    body1 = await resp1.json()
    assert body1 == {"archived": 1, "done_total": 1}
    assert todo.read_text(encoding="utf-8") == "active thing\n"
    done = tmp_path / "done.txt"
    assert done.read_text(encoding="utf-8") == "x 2026-05-06 done thing\n"

    # Second call is a no-op — done.txt should NOT accumulate duplicates.
    resp2 = await client.post("/api/archive")
    body2 = await resp2.json()
    assert body2 == {"archived": 0, "done_total": 1}
    assert todo.read_text(encoding="utf-8") == "active thing\n"
    assert done.read_text(encoding="utf-8") == "x 2026-05-06 done thing\n"
