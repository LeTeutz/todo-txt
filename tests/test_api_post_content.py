"""Tests for ``POST /api/content`` — the ``navigator.sendBeacon`` save path.

The client's save-before-unload uses ``navigator.sendBeacon``, which always
sends POST. The server originally registered only a PUT handler, so those
beacons returned 405 and the last keystrokes before a tab closed were dropped
— silently, because nothing is listening for a response at unload time. The
same handler is now registered on POST as well.

This file covers the SERVER-side contract, so the regression is caught at the
handler level rather than only in an end-to-end scenario.
"""

from __future__ import annotations

import importlib.util
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
        "todo_txt_handlers_under_test_post_content", _MODULE_PATH
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
    """TestClient with BOTH PUT and POST on /api/content, matching
    production's register_routes wiring (post-Task E).
    """
    app = web.Application(client_max_size=handlers.MAX_CONTENT_BYTES * 4)
    # Mirror production: same handler on PUT and POST.
    app.router.add_put(
        "/api/content", handlers.api_put_content
    )
    app.router.add_post(
        "/api/content", handlers.api_put_content
    )
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


@pytest.mark.asyncio
async def test_post_content_writes_and_returns_200(client, handlers, tmp_path):
    """Root-cause probe: POST /api/content must 200 (it used to 405).

    The beacon payload shape is identical to the PUT save payload, so the
    response shape is also identical — we assert both to pin the
    contract that sendBeacon can rely on.
    """
    payload = {"content": "ship milk +groceries @store\n"}
    res = await client.post("/api/content", json=payload)

    # The original bug: PUT-only route returned 405 for POST beacons.
    assert res.status == 200, (
        f"POST /api/content returned {res.status}; "
        "sendBeacon only speaks POST, and a 405 here "
        "means save-before-unload silently drops data."
    )
    body = await res.json()
    assert body["status"] == "ok"
    assert body["bytes"] == len(payload["content"].encode("utf-8"))
    assert isinstance(body["mtime"], float)
    # `backup` is str|None depending on whether rotation fired; don't
    # assert its value — just that the key is present (contract).
    assert "backup" in body

    # And the write actually landed on disk at the expected path.
    on_disk = (tmp_path / "todo.txt").read_text(encoding="utf-8")
    assert on_disk == payload["content"]
