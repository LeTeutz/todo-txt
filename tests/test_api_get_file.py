"""Tests for todo_txt_handlers.api_get_file — three-file GET endpoint.

Verifies:
  - GET /api/file?name=todo    → reads todo.txt (creates empty if missing)
  - GET /api/file?name=done    → reads done.txt (creates empty if missing)
  - GET /api/file?name=report  → reads report.txt (creates empty if missing)
  - GET /api/file?name=evil    → 400 with error+allowed list
  - GET /api/file (no name)    → 400 with error+allowed list
  - existing file content is returned verbatim with correct size/mtime
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
        "todo_txt_handlers_under_test", _MODULE_PATH
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
    """aiohttp TestClient with the /api/file route registered."""
    app = web.Application()
    app.router.add_get("/api/file", handlers.api_get_file)
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


# ---------------------------------------------------------------------------
# Valid names — one test each for todo / done / report
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_file_todo_creates_empty_when_missing(client, tmp_path):
    resp = await client.get("/api/file?name=todo")
    assert resp.status == 200
    body = await resp.json()
    assert body["content"] == ""
    assert body["size"] == 0
    assert body["path"].endswith("todo.txt")
    assert body["mtime"] >= 0.0
    # File was materialised on disk.
    assert (tmp_path / "todo.txt").exists()


@pytest.mark.asyncio
async def test_get_file_done_returns_existing_content(client, tmp_path):
    (tmp_path / "done.txt").write_text(
        "x 2026-05-07 ship it\nx 2026-05-06 wrote spec\n",
        encoding="utf-8",
    )
    resp = await client.get("/api/file?name=done")
    assert resp.status == 200
    body = await resp.json()
    assert body["content"] == (
        "x 2026-05-07 ship it\nx 2026-05-06 wrote spec\n"
    )
    assert body["size"] == len(body["content"].encode("utf-8"))
    assert body["path"].endswith("done.txt")
    assert body["mtime"] > 0.0


@pytest.mark.asyncio
async def test_get_file_report_returns_report_path(client, tmp_path):
    (tmp_path / "report.txt").write_text(
        "2026-05-06T00:00:00Z 3 1\n2026-05-07T00:00:00Z 2 2\n",
        encoding="utf-8",
    )
    resp = await client.get("/api/file?name=report")
    assert resp.status == 200
    body = await resp.json()
    assert "2026-05-06T00:00:00Z 3 1" in body["content"]
    assert body["path"].endswith("report.txt")
    assert body["size"] > 0


# ---------------------------------------------------------------------------
# Invalid name — 400
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_file_rejects_unknown_name(client):
    resp = await client.get("/api/file?name=evil")
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "invalid name"
    assert sorted(body["allowed"]) == ["done", "report", "todo"]


@pytest.mark.asyncio
async def test_get_file_rejects_missing_name(client):
    resp = await client.get("/api/file")
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "invalid name"
