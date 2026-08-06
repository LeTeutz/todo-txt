"""todo.txt app backend — aiohttp entry point.

Started as a subprocess by the KiroCrew gateway's app backend loader.
The gateway:
  * Spawns ``python3 backend/server.py`` with ``PORT=<free-port>`` and
    ``KIROCREW_PROXY_SECRET=<per-app secret>`` env vars.
  * Reverse-proxies ``/apps/todo-txt/api/*`` to
    ``http://127.0.0.1:<PORT>/api/*``, signing every forwarded request with
    ``X-KiroCrew-Proxy``. The forwarded request-target is always ``/api/...``
    (see ``apps/routes.py::handle_app_api_proxy`` in the KiroCrew repo:
    ``target = f"{backend_url}/api/{path}"``), so routes register under
    ``/api/...`` directly — there is no path-rewrite layer.
  * Polls ``/health`` (declared in ``app.json -> backend.healthCheck``)
    directly and *unsigned*, so that one path is exempt from verification.

Because this process binds a plain loopback socket, the HMAC is the only thing
standing between the API and any other local process (another app's backend, a
third-party app, or the prompt-injectable agent). See ``_proxy_auth``.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import os
import signal
import sys
import time
from pathlib import Path

from aiohttp import web

_APP_ROOT = Path(__file__).resolve().parent.parent
if str(_APP_ROOT) not in sys.path:
    sys.path.insert(0, str(_APP_ROOT))

# Import from sibling module in backend/
sys.path.insert(0, str(Path(__file__).resolve().parent))
import todo_txt_handlers  # noqa: E402

logger = logging.getLogger("todo-txt.server")


async def health(_: web.Request) -> web.Response:
    """Liveness probe for the gateway's backend monitor."""
    return web.json_response({"ok": True, "app": "todo-txt"})


# --------------------------------------------------------------------------
# Gateway proxy authentication (HMAC)
# --------------------------------------------------------------------------
# NOTE: `_verify_proxy_request` below is a deliberate inline mirror of
# `kirocrew-client.verify_proxy_request` — byte-for-byte the same message
# construction, skew window, and constant-time compare as the gateway-side
# signer and as `src/kiro_crew/apps/proxy_auth.py` in the KiroCrew repo. It is
# inlined only because the published `kirocrew-client` (v0.1.0) does NOT yet
# export `verify_proxy_request` — its `__init__` exports only
# `KiroCrewClient`/`KiroCrewError`/`ErrorCode`, and the App Kit reference docs
# flag the verifier as an API that "MUST be regenerated in lockstep" with the
# body-bound signature change. Once a client release ships the verifier,
# DELETE this block and swap in:
#
#     from kirocrew_client import verify_proxy_request
#
# Keep the two in lockstep until then: a drift in the signed message means
# every proxied request 401s, which reads as an auth bug rather than a
# version-skew bug.
_PROXY_HEADER = "X-KiroCrew-Proxy"
_PROXY_SECRET_ENV = "KIROCREW_PROXY_SECRET"
_MAX_SKEW_SECONDS = 60


def _proxy_secret() -> str:
    """The per-app proxy secret the gateway injects into our environment."""
    return os.environ.get(_PROXY_SECRET_ENV, "")


def _verify_proxy_request(
    header_value: str,
    *,
    method: str,
    target: str,
    body: bytes,
    secret: str | None = None,
    now: float | None = None,
) -> bool:
    """Return ``True`` iff *header_value* is a valid, fresh gateway signature.

    The gateway signs ``"<ts>:<method>:<target>:<sha256_hex(body)>"`` with the
    per-app secret and sends ``X-KiroCrew-Proxy: <ts>:<hmac_sha256_hex>``.
    ``target`` is the request-target this backend actually receives (path plus
    query string) — under the gateway contract that is always ``/api/...``.

    Fails closed: a missing secret, absent or malformed header, non-numeric or
    stale (>±60s) timestamp, tampered body, and signature mismatch all return
    ``False``. The comparison is constant-time.
    """
    key = _proxy_secret() if secret is None else secret
    if not key or not header_value or ":" not in header_value:
        return False
    ts_str, _, sig = header_value.partition(":")
    if not ts_str.isdigit() or not sig:
        return False
    clock = time.time() if now is None else now
    if abs(clock - int(ts_str)) > _MAX_SKEW_SECONDS:
        return False
    body_hash = hashlib.sha256(body or b"").hexdigest()
    msg = f"{ts_str}:{method}:{target}:{body_hash}"
    expected = hmac.new(key.encode(), msg.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig)


@web.middleware
async def _proxy_auth(request: web.Request, handler) -> web.StreamResponse:
    """Verify the gateway's HMAC on every request except ``/health``.

    Registered as the OUTERMOST (and only) middleware so nothing reaches the
    route table unverified.

    ``/health`` is the sole exemption: the gateway's own liveness probe hits
    this backend directly and unsigned, so authenticating it would make the
    app look permanently unhealthy.
    """
    if request.path == "/health":
        return await handler(request)

    secret = _proxy_secret()
    if not secret:
        # Fail CLOSED. An unset secret means we cannot distinguish the gateway
        # from any other local process, so serving the API would be exactly
        # the CWE-306 exposure the HMAC exists to close.
        logger.error(
            "%s is not set - refusing all API requests (503). The KiroCrew "
            "gateway injects this per-app secret when it spawns the backend; "
            "an empty value means this process was started outside the "
            "gateway or the app has no secret provisioned.",
            _PROXY_SECRET_ENV,
        )
        return web.json_response(
            {
                "error": f"{_PROXY_SECRET_ENV} is not configured",
                "code": "proxy_secret_missing",
            },
            status=503,
        )

    target = request.path + (
        f"?{request.query_string}" if request.query_string else ""
    )
    body = await request.read() if request.can_read_body else b""
    if not _verify_proxy_request(
        request.headers.get(_PROXY_HEADER, ""),
        method=request.method,
        target=target,
        body=body,
        secret=secret,
    ):
        # Log the path only — query strings carry file names.
        logger.warning(
            "Rejected unsigned or invalid proxy request: %s %s",
            request.method,
            request.path,
        )
        return web.json_response(
            {
                "error": "invalid or missing proxy signature",
                "code": "invalid_proxy_signature",
            },
            status=401,
        )
    return await handler(request)


def create_app() -> web.Application:
    """Build the aiohttp application with all todo.txt routes mounted.

    Routes register under ``/api/...`` — exactly the request-target the
    gateway's reverse proxy forwards, so no path-rewrite layer sits in front of
    the route table. Re-dispatching a stripped path onto a differently-shaped
    route table (cloning the request and calling ``match_info.handler(clone)``)
    is deliberately avoided: the clone carries no resolved ``match_info``, so
    parameterized routes like ``/api/backups/{name}`` would read empty
    captures. Registering the real shape directly leaves path resolution to
    aiohttp, where it belongs.
    """
    app = web.Application(
        client_max_size=2 * 1024 * 1024,
        middlewares=[_proxy_auth],
    )
    app.router.add_get("/health", health)
    todo_txt_handlers.register_routes(app)
    return app


def _parse_port() -> int:
    raw = os.environ.get("PORT", "").strip()
    if not raw:
        print(
            "ERROR: PORT environment variable is required but not set. "
            "The gateway must provide PORT=<free-port> when spawning the backend.",
            file=sys.stderr,
        )
        raise SystemExit(2)
    try:
        port = int(raw)
    except ValueError:
        print(
            f"ERROR: PORT environment variable is not a valid integer: {raw!r}",
            file=sys.stderr,
        )
        raise SystemExit(2)
    if port < 1 or port > 65535:
        print(
            f"ERROR: PORT must be 1-65535, got: {port}",
            file=sys.stderr,
        )
        raise SystemExit(2)
    return port


def main() -> None:
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO"),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    port = _parse_port()
    app = create_app()
    if not _proxy_secret():
        logger.warning(
            "%s is not set - every API route will return 503 until the "
            "gateway provides it (only /health will answer).",
            _PROXY_SECRET_ENV,
        )
    logger.info(
        "todo.txt backend starting on 127.0.0.1:%d (pid %d)", port, os.getpid()
    )

    def _stop(_signum: int, _frame: object) -> None:
        raise SystemExit(0)

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            signal.signal(sig, _stop)
        except ValueError:
            pass

    web.run_app(
        app,
        host="127.0.0.1",
        port=port,
        print=lambda *_, **__: None,
        access_log=logger,
    )


if __name__ == "__main__":
    main()
