"""Gateway path contract and parameterized-route resolution.

The KiroCrew gateway's reverse proxy (``apps/routes.py::handle_app_api_proxy``)
forwards every app API request as ``target = f"{backend_url}/api/{path}"`` —
the backend receives ``/api/...`` and nothing else. Routes therefore register
under ``/api/...`` directly and there is NO rewrite middleware.

Registering the gateway's real shape directly is also what keeps parameterized
routes working. An earlier design registered routes under the full ``/api/...``
prefix but additionally normalized other incoming shapes with a
``_gateway_proxy_rewrite`` middleware that re-dispatched via
``match_info.handler(clone)``. The clone carried no resolved ``match_info``, so
parameterized routes (``/api/backups/{name}``, ``/api/ai-edit/{ts}/apply``, …)
read EMPTY captures, and ``GET /api/backups/nope.txt`` answered 400 "invalid
backup name" instead of 404 "backup not found". A middleware that re-dispatches
handlers cannot preserve captures, so the tests below pin both the path
contract and the capture resolution that rides on it.

Every request here is HMAC-signed, because ``create_app()`` mounts
``_proxy_auth`` as the outermost middleware: the path contract must hold
*through* the auth layer.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp.test_utils import TestClient, TestServer

from test_proxy_auth import SECRET, SECRET_ENV, sign


_SERVER_PATH = Path(__file__).resolve().parent.parent / "backend" / "server.py"


def _load_server_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_server_under_test", _SERVER_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest_asyncio.fixture
async def client(tmp_path, monkeypatch):
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    monkeypatch.setenv(SECRET_ENV, SECRET)
    server = _load_server_module()
    app = server.create_app()
    test_server = TestServer(app)
    c = TestClient(test_server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


@pytest.mark.asyncio
async def test_gateway_shape_is_served(client):
    """``/api/content`` — the shape the gateway forwards — must 200."""
    res = await client.get("/api/content", headers=sign("GET", "/api/content"))
    assert res.status == 200
    body = await res.json()
    assert "content" in body
    assert "mtime" in body


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "path",
    [
        "/apps/todo-txt/api/content",  # pre-strip dashboard shape
        "/content",                    # legacy full-strip shape
    ],
)
async def test_non_gateway_shapes_404(client, path):
    """Only the gateway's forwarded shape exists on this backend.

    A backend that also answers the pre-strip and full-strip shapes serves
    ghost aliases: a change in what the gateway forwards would then be
    absorbed silently instead of failing loudly in e2e.
    """
    res = await client.get(path, headers=sign("GET", path))
    assert res.status == 404


@pytest.mark.asyncio
async def test_query_string_survives(client):
    """`?name=todo` must reach the handler intact (and stay HMAC-bound)."""
    target = "/api/file?name=todo"
    res = await client.get(target, headers=sign("GET", target))
    assert res.status == 200
    body = await res.json()
    assert "content" in body


@pytest.mark.asyncio
async def test_parameterized_route_resolves_match_info(client):
    """``{name}`` captures must reach the handler.

    The status code is the tell. A handler dispatched with an empty
    ``match_info`` — as happens when a middleware re-dispatches the handler
    itself rather than letting the router resolve the route — sees no name at
    all and answers **400 "invalid backup name"**. When the capture resolves,
    a missing backup is a clean **404**, which is what separates "the route
    matched but the file is absent" from "the name never arrived".
    """
    target = "/api/backups/nope.txt"
    res = await client.get(target, headers=sign("GET", target))
    assert res.status == 404, (
        f"GET {target} returned {res.status}; expected 404 'backup not found' "
        "- a 400 here means match_info captures were lost again."
    )
    body = await res.json()
    assert "not found" in body.get("error", "").lower()


@pytest.mark.asyncio
async def test_parameterized_post_route_resolves_match_info(client):
    """Same property for a POST parameterized route (restore path).

    The name is family-valid (``todo-``) but missing on disk. Restore rejects
    names outside the todo/done families with 400 BEFORE the existence check,
    so only an in-family name can tell a resolved capture (404) apart from an
    empty one (400) — which is the property under test.
    """
    target = "/api/backups/todo-nope.txt/restore"
    res = await client.post(target, headers=sign("POST", target))
    assert res.status == 404, (
        f"POST {target} returned {res.status}; expected 404 for a missing "
        "backup — 400 means the {name} capture came back empty."
    )


@pytest.mark.asyncio
async def test_health_passes_through(client):
    """`/health` stays unsigned and un-prefixed (gateway liveness probe)."""
    res = await client.get("/health")
    assert res.status == 200
    body = await res.json()
    assert body["ok"] is True
