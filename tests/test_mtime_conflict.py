"""Tests for base_mtime conflict detection on PUT /api/content and PUT /api/file.

Verifies:
  - PUT with correct base_mtime succeeds
  - PUT with stale base_mtime returns 409 with current mtime and content
  - PUT without base_mtime (legacy) still works as before
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
        "todo_txt_handlers_under_test_mtime", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def handlers(tmp_path, monkeypatch):
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    mod = _load_handlers_module()
    mod.ensure_dirs()
    return mod


@pytest_asyncio.fixture
async def client(handlers):
    app = web.Application(client_max_size=4 * 1024 * 1024)
    app.router.add_put("/api/content", handlers.api_put_content)
    app.router.add_put("/api/file", handlers.api_put_file)
    app.router.add_get("/api/content", handlers.api_get_content)
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


@pytest.mark.asyncio
async def test_put_content_correct_base_mtime_succeeds(client, tmp_path):
    """PUT with matching base_mtime writes successfully."""
    todo = tmp_path / "todo.txt"
    todo.write_text("original\n", encoding="utf-8")
    mtime = todo.stat().st_mtime

    resp = await client.put(
        "/api/content",
        json={"content": "updated\n", "base_mtime": mtime},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["status"] == "ok"
    assert body["mtime"] > 0
    assert todo.read_text() == "updated\n"


@pytest.mark.asyncio
async def test_put_content_stale_base_mtime_returns_409(client, tmp_path):
    """PUT with stale base_mtime returns 409 with conflict info."""
    todo = tmp_path / "todo.txt"
    todo.write_text("current content\n", encoding="utf-8")
    current_mtime = todo.stat().st_mtime

    # Pass a stale mtime (off by more than 0.001s).
    stale_mtime = current_mtime - 10.0

    resp = await client.put(
        "/api/content",
        json={"content": "new stuff\n", "base_mtime": stale_mtime},
    )
    assert resp.status == 409
    body = await resp.json()
    assert body["error"] == "conflict"
    assert body["mtime"] == current_mtime
    assert body["content"] == "current content\n"
    # File unchanged.
    assert todo.read_text() == "current content\n"


@pytest.mark.asyncio
async def test_put_content_no_base_mtime_overwrites(client, tmp_path):
    """PUT without base_mtime keeps legacy overwrite behavior."""
    todo = tmp_path / "todo.txt"
    todo.write_text("old\n", encoding="utf-8")

    resp = await client.put(
        "/api/content",
        json={"content": "new\n"},
    )
    assert resp.status == 200
    assert todo.read_text() == "new\n"


@pytest.mark.asyncio
async def test_put_file_stale_base_mtime_returns_409(client, tmp_path):
    """PUT /api/file?name=todo with stale base_mtime returns 409."""
    todo = tmp_path / "todo.txt"
    todo.write_text("file content\n", encoding="utf-8")
    current_mtime = todo.stat().st_mtime
    stale_mtime = current_mtime - 5.0

    resp = await client.put(
        "/api/file?name=todo",
        json={"content": "overwrite\n", "base_mtime": stale_mtime},
    )
    assert resp.status == 409
    body = await resp.json()
    assert body["error"] == "conflict"
    assert body["mtime"] == current_mtime
    assert body["content"] == "file content\n"
    assert todo.read_text() == "file content\n"


@pytest.mark.asyncio
async def test_put_file_correct_base_mtime_succeeds(client, tmp_path):
    """PUT /api/file?name=done with correct base_mtime writes successfully."""
    done = tmp_path / "done.txt"
    done.write_text("x 2026-01-01 old\n", encoding="utf-8")
    mtime = done.stat().st_mtime

    resp = await client.put(
        "/api/file?name=done",
        json={"content": "x 2026-01-01 updated\n", "base_mtime": mtime},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["status"] == "ok"
    assert done.read_text() == "x 2026-01-01 updated\n"


# ---------------------------------------------------------------------------
# base_mtime validation — found by tests/stress/release_harness.py phase 5
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "bad",
    ["not-a-number", "", "1.0", [], {}, True, False],
    ids=["word", "empty", "numeric-string", "list", "dict", "true", "false"],
)
@pytest.mark.asyncio
async def test_put_content_rejects_non_numeric_base_mtime(client, tmp_path, bad):
    """A malformed conflict token must be a named 400, never an opaque 500.

    The comparison site used to call ``float(base_mtime)`` directly inside a
    ``try`` that only caught ``OSError``, so these values raised
    ``ValueError``/``TypeError`` out of the handler as a 500. Booleans are
    included because ``bool`` is an ``int`` subclass and would otherwise coerce
    to a real-looking mtime of 1.0/0.0.
    """
    todo = tmp_path / "todo.txt"
    todo.write_text("original\n", encoding="utf-8")

    resp = await client.put(
        "/api/content", json={"content": "attacker\n", "base_mtime": bad}
    )
    assert resp.status == 400, await resp.text()
    assert "base_mtime" in (await resp.json())["error"]
    # The rejected write must not have landed.
    assert todo.read_text(encoding="utf-8") == "original\n"


@pytest.mark.parametrize(
    "bad",
    [float("nan"), float("inf"), float("-inf")],
    ids=["nan", "inf", "-inf"],
)
@pytest.mark.asyncio
async def test_put_content_rejects_non_finite_base_mtime(client, tmp_path, bad):
    """NaN must not be able to bypass conflict detection.

    Every comparison against NaN is False, so ``abs(current - nan) > 0.001``
    was False and the 409 branch was skipped entirely: a stale client could
    defeat the optimistic-concurrency guard and overwrite another client's work
    by sending ``base_mtime: NaN``. Non-finite tokens are now fail-closed 400s.
    """
    todo = tmp_path / "todo.txt"
    todo.write_text("original\n", encoding="utf-8")

    resp = await client.put(
        "/api/content",
        data=json.dumps({"content": "attacker\n", "base_mtime": bad}),
        headers={"Content-Type": "application/json"},
    )
    assert resp.status == 400, await resp.text()
    assert todo.read_text(encoding="utf-8") == "original\n"


@pytest.mark.asyncio
async def test_put_file_rejects_non_numeric_base_mtime(client, tmp_path):
    """/api/file shares the conflict-check code path, so it shares the guard."""
    done = tmp_path / "done.txt"
    done.write_text("x 2026-01-01 old\n", encoding="utf-8")

    resp = await client.put(
        "/api/file?name=done",
        json={"content": "x 2026-01-01 attacker\n", "base_mtime": "nope"},
    )
    assert resp.status == 400, await resp.text()
    assert done.read_text(encoding="utf-8") == "x 2026-01-01 old\n"


@pytest.mark.asyncio
async def test_put_content_accepts_integer_base_mtime(client, tmp_path):
    """An integer timestamp is a legitimate number and must still be honoured."""
    todo = tmp_path / "todo.txt"
    todo.write_text("original\n", encoding="utf-8")
    stale = int(todo.stat().st_mtime) - 5000

    resp = await client.put(
        "/api/content", json={"content": "updated\n", "base_mtime": stale}
    )
    # Numeric but stale -> the normal conflict path, not a validation error.
    assert resp.status == 409, await resp.text()
    assert (await resp.json())["error"] == "conflict"
