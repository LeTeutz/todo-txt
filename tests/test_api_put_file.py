"""Tests for todo_txt_handlers.api_put_file — three-file PUT endpoint.

Verifies:
  - PUT /api/file?name=todo       → writes todo.txt + rotates backup/todo-*.txt
  - PUT /api/file?name=done       → writes done.txt + rotates backup/done-*.txt
  - PUT /api/file?name=report     → 405 append-only
  - PUT /api/file?name=evil       → 400 with error+allowed list
  - PUT /api/file (no name)       → 400
  - missing/invalid JSON          → 400
  - content > 1 MB                → 413
  - backup rotation isolates todo vs done families
  - second write within 5 min skips rotation
"""

from __future__ import annotations

import importlib.util
import json
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
        "todo_txt_handlers_under_test_put", _MODULE_PATH
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
    """aiohttp TestClient with the /api/file PUT+GET routes registered.

    ``client_max_size`` is raised well above our MAX_CONTENT_BYTES so
    aiohttp itself does not short-circuit the oversized-body test —
    we need our handler to be the one returning 413.
    """
    app = web.Application(client_max_size=handlers.MAX_CONTENT_BYTES * 4)
    app.router.add_get("/api/file", handlers.api_get_file)
    app.router.add_put("/api/file", handlers.api_put_file)
    app.router.add_post("/api/file", handlers.api_put_file)
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


# ---------------------------------------------------------------------------
# Happy-path writes
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_put_file_writes_todo(client, tmp_path):
    payload = {"content": "(A) buy milk +groceries\n(B) call mom\n"}
    resp = await client.put("/api/file?name=todo", json=payload)
    assert resp.status == 200
    body = await resp.json()
    assert body["status"] == "ok"
    assert body["name"] == "todo"
    assert body["path"].endswith("todo.txt")
    assert body["bytes"] == len(payload["content"].encode("utf-8"))
    assert body["mtime"] > 0.0
    # Disk matches.
    assert (tmp_path / "todo.txt").read_text(encoding="utf-8") == payload["content"]


@pytest.mark.asyncio
async def test_put_file_writes_done(client, tmp_path):
    payload = {"content": "x 2026-05-07 ship it\n"}
    resp = await client.put("/api/file?name=done", json=payload)
    assert resp.status == 200
    body = await resp.json()
    assert body["status"] == "ok"
    assert body["name"] == "done"
    assert body["path"].endswith("done.txt")
    assert (tmp_path / "done.txt").read_text(encoding="utf-8") == payload["content"]


@pytest.mark.asyncio
async def test_post_file_writes_done_for_unload_beacon(client, tmp_path):
    done_path = tmp_path / "done.txt"
    done_path.write_text("old\n", encoding="utf-8")
    payload = {
        "content": "x 2026-05-08 beacon save\n",
        "base_mtime": done_path.stat().st_mtime,
    }

    resp = await client.post(
        "/api/file?name=done",
        json=payload,
    )

    assert resp.status == 200
    body = await resp.json()
    assert body["status"] == "ok"
    assert body["name"] == "done"
    assert done_path.read_text(encoding="utf-8") == payload["content"]


@pytest.mark.asyncio
async def test_put_file_overwrites_existing_todo(client, tmp_path):
    (tmp_path / "todo.txt").write_text("old\n", encoding="utf-8")
    resp = await client.put(
        "/api/file?name=todo",
        json={"content": "new\n"},
    )
    assert resp.status == 200
    assert (tmp_path / "todo.txt").read_text(encoding="utf-8") == "new\n"


# ---------------------------------------------------------------------------
# Report is append-only
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_put_file_rejects_report_with_405(client, tmp_path):
    (tmp_path / "report.txt").write_text("existing\n", encoding="utf-8")
    resp = await client.put(
        "/api/file?name=report",
        json={"content": "replaced\n"},
    )
    assert resp.status == 405
    body = await resp.json()
    assert body["error"] == "report is append-only"
    # On-disk content is untouched.
    assert (tmp_path / "report.txt").read_text(encoding="utf-8") == "existing\n"


# ---------------------------------------------------------------------------
# Bad-name rejections
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_put_file_rejects_unknown_name(client):
    resp = await client.put(
        "/api/file?name=evil",
        json={"content": "x\n"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "invalid name"
    assert sorted(body["allowed"]) == ["done", "report", "todo"]


@pytest.mark.asyncio
async def test_put_file_rejects_missing_name(client):
    resp = await client.put(
        "/api/file",
        json={"content": "x\n"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "invalid name"


# ---------------------------------------------------------------------------
# Body validation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_put_file_rejects_invalid_json(client):
    resp = await client.put(
        "/api/file?name=todo",
        data="not-json",
        headers={"Content-Type": "application/json"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "invalid JSON body"


@pytest.mark.asyncio
async def test_put_file_rejects_missing_content_field(client):
    resp = await client.put(
        "/api/file?name=todo",
        json={"not_content": "x"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "missing 'content' field"


@pytest.mark.asyncio
async def test_put_file_rejects_non_string_content(client):
    resp = await client.put(
        "/api/file?name=todo",
        json={"content": 42},
    )
    assert resp.status == 400
    body = await resp.json()
    assert "string" in body["error"]


@pytest.mark.asyncio
async def test_put_file_rejects_oversized_body(client, handlers):
    # 1 MB cap + 1 byte
    too_big = "a" * (handlers.MAX_CONTENT_BYTES + 1)
    resp = await client.put(
        "/api/file?name=todo",
        json={"content": too_big},
    )
    assert resp.status == 413
    body = await resp.json()
    assert body["error"] == "too large"
    assert body["limit"] == handlers.MAX_CONTENT_BYTES


# ---------------------------------------------------------------------------
# Backup rotation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_put_file_todo_no_backup_on_first_write(client, tmp_path):
    """First write has no prior file to back up → no backup created."""
    resp = await client.put(
        "/api/file?name=todo",
        json={"content": "first\n"},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["backup"] is None
    backup_dir = tmp_path / "backup"
    todo_backups = (
        list(backup_dir.glob("todo-*.txt")) if backup_dir.is_dir() else []
    )
    assert todo_backups == []


@pytest.mark.asyncio
async def test_put_file_rotates_backup_after_first_save(client, tmp_path, handlers, monkeypatch):
    """Second save (>=5 min later) produces a todo-*.txt backup of prior content."""
    # Seed the file so rotation has something to copy.
    (tmp_path / "todo.txt").write_text("prior-content\n", encoding="utf-8")

    # Short-circuit the 5-minute gate.
    monkeypatch.setattr(handlers, "BACKUP_MIN_INTERVAL_SECS", 0)

    resp = await client.put(
        "/api/file?name=todo",
        json={"content": "new-content\n"},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["backup"] is not None
    assert body["backup"].startswith("todo-")
    assert body["backup"].endswith(".txt")

    backup_dir = tmp_path / "backup"
    todo_backups = list(backup_dir.glob("todo-*.txt"))
    assert len(todo_backups) == 1
    assert todo_backups[0].read_text(encoding="utf-8") == "prior-content\n"


@pytest.mark.asyncio
async def test_put_file_done_backups_use_done_prefix(client, tmp_path, handlers, monkeypatch):
    """Done-file writes create backup/done-*.txt, not todo-*.txt."""
    (tmp_path / "done.txt").write_text("archived\n", encoding="utf-8")
    monkeypatch.setattr(handlers, "BACKUP_MIN_INTERVAL_SECS", 0)

    resp = await client.put(
        "/api/file?name=done",
        json={"content": "archived\nmore\n"},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["backup"] is not None
    assert body["backup"].startswith("done-")

    backup_dir = tmp_path / "backup"
    done_backups = list(backup_dir.glob("done-*.txt"))
    todo_backups = list(backup_dir.glob("todo-*.txt"))
    assert len(done_backups) == 1
    assert done_backups[0].read_text(encoding="utf-8") == "archived\n"
    # Todo family is untouched by done writes.
    assert todo_backups == []


@pytest.mark.asyncio
async def test_put_file_skips_rotation_within_interval(client, tmp_path, handlers, monkeypatch):
    """Two saves within BACKUP_MIN_INTERVAL_SECS share one backup."""
    (tmp_path / "todo.txt").write_text("v0\n", encoding="utf-8")
    # Keep the default 5-min gate (no monkeypatch).

    # First save → creates backup of v0.
    # Re-patch to 0 only for the first save so we get one backup.
    monkeypatch.setattr(handlers, "BACKUP_MIN_INTERVAL_SECS", 0)
    r1 = await client.put(
        "/api/file?name=todo",
        json={"content": "v1\n"},
    )
    assert r1.status == 200
    assert (await r1.json())["backup"] is not None

    # Now restore a large interval so the second save skips.
    monkeypatch.setattr(handlers, "BACKUP_MIN_INTERVAL_SECS", 10_000)
    r2 = await client.put(
        "/api/file?name=todo",
        json={"content": "v2\n"},
    )
    assert r2.status == 200
    assert (await r2.json())["backup"] is None

    backup_dir = tmp_path / "backup"
    todo_backups = list(backup_dir.glob("todo-*.txt"))
    assert len(todo_backups) == 1
