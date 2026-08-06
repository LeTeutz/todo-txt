"""Tests for todo_txt_handlers.api_move — POST /api/move.

Verifies:
  - Single line move todo->done (success)
  - Single line move done->todo (reverse)
  - Out-of-range item# returns 400
  - Same src/dest returns 400
  - Invalid src/dest names return 400
  - Invalid JSON body returns 400
  - Missing 'item' returns 400
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
        "todo_txt_handlers_under_test_move", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["todo_txt_handlers_under_test_move"] = module
    spec.loader.exec_module(module)
    return module


handlers = _load_handlers_module()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Return an aiohttp test client bound to api_move with isolated root."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    app = web.Application()
    app.router.add_post(
        "/api/move", handlers.api_move
    )
    server = TestServer(app)
    async with TestClient(server) as cl:
        yield cl


async def _write(tmp_path: Path, name: str, content: str) -> None:
    (tmp_path / name).write_text(content, encoding="utf-8")


async def _read(tmp_path: Path, name: str) -> str:
    p = tmp_path / name
    return p.read_text(encoding="utf-8") if p.is_file() else ""


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_move_single_line_todo_to_done(
    client: TestClient, tmp_path: Path
) -> None:
    await _write(tmp_path, "todo.txt", "Line one\nLine two\nLine three\n")
    resp = await client.post(
        "/api/move",
        json={"item": 2, "from": "todo", "to": "done"},
    )
    assert resp.status == 200
    body = await resp.json()
    # mtime/dest_mtime were added with the conflict guard so a client can
    # refresh its optimistic-concurrency token without a re-GET.
    assert {k: v for k, v in body.items() if k not in ("mtime", "dest_mtime")} == {
        "moved": True,
        "from": "todo",
        "to": "done",
        "line": "Line two",
    }
    assert isinstance(body["mtime"], float)
    assert isinstance(body["dest_mtime"], float)
    assert await _read(tmp_path, "todo.txt") == "Line one\nLine three\n"
    assert await _read(tmp_path, "done.txt") == "Line two\n"


@pytest.mark.asyncio
async def test_move_single_line_done_to_todo(
    client: TestClient, tmp_path: Path
) -> None:
    await _write(tmp_path, "done.txt", "x 2026-05-01 Finished\n")
    await _write(tmp_path, "todo.txt", "Active\n")
    resp = await client.post(
        "/api/move",
        json={"item": 1, "from": "done", "to": "todo"},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["moved"] is True
    assert body["line"] == "x 2026-05-01 Finished"
    assert await _read(tmp_path, "done.txt") == ""
    assert await _read(tmp_path, "todo.txt") == "Active\nx 2026-05-01 Finished\n"


@pytest.mark.asyncio
async def test_move_out_of_range(
    client: TestClient, tmp_path: Path
) -> None:
    await _write(tmp_path, "todo.txt", "Only one line\n")
    resp = await client.post(
        "/api/move",
        json={"item": 99, "from": "todo", "to": "done"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert "out of range" in body["error"]
    # File unchanged on rejection
    assert await _read(tmp_path, "todo.txt") == "Only one line\n"


@pytest.mark.asyncio
async def test_move_same_src_dest(
    client: TestClient, tmp_path: Path
) -> None:
    await _write(tmp_path, "todo.txt", "A\nB\n")
    resp = await client.post(
        "/api/move",
        json={"item": 1, "from": "todo", "to": "todo"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert "source and destination" in body["error"]


@pytest.mark.asyncio
async def test_move_invalid_filename(
    client: TestClient, tmp_path: Path
) -> None:
    await _write(tmp_path, "todo.txt", "A\n")
    resp = await client.post(
        "/api/move",
        json={"item": 1, "from": "todo", "to": "report"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert "todo" in body["error"].lower() and "done" in body["error"].lower()


@pytest.mark.asyncio
async def test_move_invalid_json(
    client: TestClient, tmp_path: Path
) -> None:
    resp = await client.post(
        "/api/move", data="not json"
    )
    assert resp.status == 400
    body = await resp.json()
    assert body["error"] == "invalid JSON body"


@pytest.mark.asyncio
async def test_move_missing_item(
    client: TestClient, tmp_path: Path
) -> None:
    resp = await client.post(
        "/api/move",
        json={"from": "todo", "to": "done"},
    )
    assert resp.status == 400
    body = await resp.json()
    assert "integer" in body["error"]
