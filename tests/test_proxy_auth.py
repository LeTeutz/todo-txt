"""Proxy HMAC verification tests — the CWE-306 fix.

This backend binds a plain loopback socket, so without verifying the gateway's
``X-KiroCrew-Proxy`` signature any other local process (another app's backend,
a third-party app, the prompt-injectable agent) could drive the full
read/write/archive API directly and bypass the gateway's token auth and
per-app scope enforcement.

The suite pins both halves of the contract:
  * the pure verifier (`_verify_proxy_request`) against the gateway's message
    construction, and
  * the middleware wired into the real `create_app()`, which is what actually
    decides whether a socket peer gets served.

Signing here mirrors ``apps/routes.py::handle_app_api_proxy`` in the KiroCrew
repo: ``msg = "<ts>:<method>:<target>:<sha256_hex(body)>"`` where ``target`` is
the request-target the backend receives (path + optional query string).
"""

from __future__ import annotations

import hashlib
import hmac
import importlib.util
import json
import sys
import time
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp.test_utils import TestClient, TestServer


_SERVER_PATH = Path(__file__).resolve().parent.parent / "backend" / "server.py"

SECRET = "test-proxy-secret"
HEADER = "X-KiroCrew-Proxy"
SECRET_ENV = "KIROCREW_PROXY_SECRET"


def _load_server_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_server_proxy_auth", _SERVER_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def sign(
    method: str,
    target: str,
    body: bytes = b"",
    *,
    secret: str = SECRET,
    ts: int | None = None,
) -> dict[str, str]:
    """Build the gateway's ``X-KiroCrew-Proxy`` header for one request."""
    stamp = str(int(time.time()) if ts is None else ts)
    body_hash = hashlib.sha256(body or b"").hexdigest()
    msg = f"{stamp}:{method}:{target}:{body_hash}"
    sig = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
    return {HEADER: f"{stamp}:{sig}"}


@pytest_asyncio.fixture
async def client(tmp_path, monkeypatch):
    """Real `create_app()` with the proxy secret provisioned."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    monkeypatch.setenv(SECRET_ENV, SECRET)
    server = _load_server_module()
    c = TestClient(TestServer(server.create_app()))
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


@pytest_asyncio.fixture
async def client_no_secret(tmp_path, monkeypatch):
    """Real `create_app()` with the proxy secret absent from the environment."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    monkeypatch.delenv(SECRET_ENV, raising=False)
    server = _load_server_module()
    c = TestClient(TestServer(server.create_app()))
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


# ---------------------------------------------------------------------------
# Pure verifier
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def verify():
    return _load_server_module()._verify_proxy_request


def test_verifier_accepts_valid_signature(verify):
    hdr = sign("GET", "/api/content")[HEADER]
    assert verify(
        hdr, method="GET", target="/api/content", body=b"", secret=SECRET
    )


def test_verifier_binds_body(verify):
    body = json.dumps({"content": "x\n", "mtime": 0}).encode()
    hdr = sign("PUT", "/api/content", body)[HEADER]
    assert verify(
        hdr, method="PUT", target="/api/content", body=body, secret=SECRET
    )
    # Same signature, one byte different in the body -> reject.
    assert not verify(
        hdr,
        method="PUT",
        target="/api/content",
        body=body + b" ",
        secret=SECRET,
    )


def test_verifier_binds_method_and_target(verify):
    hdr = sign("GET", "/api/content")[HEADER]
    assert not verify(
        hdr, method="POST", target="/api/content", body=b"", secret=SECRET
    )
    assert not verify(
        hdr, method="GET", target="/api/file", body=b"", secret=SECRET
    )


def test_verifier_binds_query_string(verify):
    hdr = sign("GET", "/api/file?name=todo")[HEADER]
    assert verify(
        hdr, method="GET", target="/api/file?name=todo", body=b"", secret=SECRET
    )
    assert not verify(
        hdr, method="GET", target="/api/file?name=done", body=b"", secret=SECRET
    )


@pytest.mark.parametrize("skew", [61, 120, 3600, -61, -3600])
def test_verifier_rejects_stale_timestamp(verify, skew):
    ts = int(time.time()) + skew
    hdr = sign("GET", "/api/content", ts=ts)[HEADER]
    assert not verify(
        hdr, method="GET", target="/api/content", body=b"", secret=SECRET
    )


@pytest.mark.parametrize("skew", [0, 59, -59])
def test_verifier_accepts_within_skew_window(verify, skew):
    ts = int(time.time()) + skew
    hdr = sign("GET", "/api/content", ts=ts)[HEADER]
    assert verify(
        hdr, method="GET", target="/api/content", body=b"", secret=SECRET
    )


def test_verifier_rejects_wrong_secret(verify):
    hdr = sign("GET", "/api/content", secret="attacker-secret")[HEADER]
    assert not verify(
        hdr, method="GET", target="/api/content", body=b"", secret=SECRET
    )


def test_verifier_fails_closed_without_secret(verify):
    """No secret configured -> nothing verifies, however well-formed."""
    hdr = sign("GET", "/api/content", secret="")[HEADER]
    assert not verify(
        hdr, method="GET", target="/api/content", body=b"", secret=""
    )


@pytest.mark.parametrize(
    "hdr", ["", "no-colon", "abc:def", ":sig", "123:", "  :  "]
)
def test_verifier_rejects_malformed_header(verify, hdr):
    assert not verify(
        hdr, method="GET", target="/api/content", body=b"", secret=SECRET
    )


# ---------------------------------------------------------------------------
# Middleware, wired into the real app
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_signed_get_passes(client):
    res = await client.get("/api/content", headers=sign("GET", "/api/content"))
    assert res.status == 200, await res.text()
    assert "content" in await res.json()


@pytest.mark.asyncio
async def test_signed_put_with_body_passes(client):
    """A signed body-bearing write must survive `_gateway_proxy_rewrite`.

    Regression guard: reading the body for the HMAC makes aiohttp's
    ``request.clone()`` raise, so the rewrite must carry the cached bytes
    across or every PUT/POST 500s under the gateway's stripped-path contract.
    """
    body = json.dumps({"content": "buy milk\n", "mtime": 0}).encode()
    res = await client.put(
        "/api/content",
        data=body,
        headers={
            **sign("PUT", "/api/content", body),
            "Content-Type": "application/json",
        },
    )
    assert res.status == 200, await res.text()
    assert (await res.json())["status"] == "ok"


@pytest.mark.asyncio
async def test_signed_request_with_query_string_passes(client):
    target = "/api/file?name=todo"
    res = await client.get(target, headers=sign("GET", target))
    assert res.status == 200, await res.text()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "path",
    [
        "/api/content",
        "/api/content",
        "/content",
    ],
)
async def test_unsigned_request_rejected_on_every_path_shape(client, path):
    """Every gateway path shape must 401 unsigned — no route is exempt."""
    res = await client.get(path)
    assert res.status == 401, (
        f"GET {path} unsigned returned {res.status}; the proxy-auth middleware "
        "must reject every route except /health (CWE-306)."
    )
    assert (await res.json())["code"] == "invalid_proxy_signature"


@pytest.mark.asyncio
async def test_unsigned_write_rejected(client, tmp_path):
    """An unsigned write must be refused *and* must not touch the file."""
    body = json.dumps({"content": "attacker\n", "mtime": 0}).encode()
    res = await client.put(
        "/api/content", data=body, headers={"Content-Type": "application/json"}
    )
    assert res.status == 401
    assert not list(tmp_path.rglob("todo.txt")) or all(
        "attacker" not in p.read_text()
        for p in tmp_path.rglob("todo.txt")
    )


@pytest.mark.asyncio
async def test_expired_timestamp_rejected(client):
    stale = int(time.time()) - 120
    res = await client.get(
        "/api/content", headers=sign("GET", "/api/content", ts=stale)
    )
    assert res.status == 401, await res.text()


@pytest.mark.asyncio
async def test_tampered_body_rejected(client):
    """Signature over the original body must not validate a swapped body."""
    signed_body = json.dumps({"content": "original\n", "mtime": 0}).encode()
    headers = {
        **sign("PUT", "/api/content", signed_body),
        "Content-Type": "application/json",
    }
    tampered = json.dumps({"content": "tampered\n", "mtime": 0}).encode()
    res = await client.put("/api/content", data=tampered, headers=headers)
    assert res.status == 401, await res.text()


@pytest.mark.asyncio
async def test_wrong_secret_rejected(client):
    res = await client.get(
        "/api/content",
        headers=sign("GET", "/api/content", secret="attacker-secret"),
    )
    assert res.status == 401, await res.text()


@pytest.mark.asyncio
async def test_health_passes_unsigned(client):
    """The gateway's liveness probe is unsigned — it must stay exempt."""
    res = await client.get("/health")
    assert res.status == 200
    assert (await res.json())["ok"] is True


@pytest.mark.asyncio
async def test_unset_secret_fails_closed(client_no_secret):
    """No secret in the environment -> 503, never a served API response."""
    res = await client_no_secret.get(
        "/api/content", headers=sign("GET", "/api/content")
    )
    assert res.status == 503, await res.text()
    assert (await res.json())["code"] == "proxy_secret_missing"


@pytest.mark.asyncio
async def test_unset_secret_still_serves_health(client_no_secret):
    """Fail-closed must not take the liveness probe down with it."""
    res = await client_no_secret.get("/health")
    assert res.status == 200
