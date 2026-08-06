"""LLM adapter for the todo.txt AI-edit feature — KiroCrew gateway backed.

The app never holds model credentials of its own: it calls back into the local
KiroCrew gateway, which owns model access, using the app's own identity. No
provider SDK and no API key is bundled here.

Flow (all loopback HTTP, all authenticated):

  1. **Token exchange** — ``POST {gateway}/api/apps/todo-txt/token`` with the
     ``X-App-Secret`` header carrying ``$KIROCREW_PROXY_SECRET`` (the per-app
     secret the gateway injected at spawn; the same value it signs the reverse
     proxy with). Returns an app-scoped bearer token whose reach is confined
     by the manifest's ``permissions.api`` allowlist (deny-by-default,
     CWE-269 — see ``token_auth.py`` in the KiroCrew repo).
  2. **Spawn** — ``POST {gateway}/api/spawn`` with the prompt as the task,
     naming this app's OWN restricted agent (``todo-txt-ai-edit``, shipped in
     ``agents/ai-edit.json`` and materialized by the gateway at install).
     ``silent=true`` keeps the run out of the user's chat surfaces.
  3. **Poll** — ``GET {gateway}/api/spawn/{id}`` until ``done``, then return
     the result text.

Gateway discovery: ``$KIROCREW_HOME/config.json`` → ``dashboard.url``
(defaults to ``http://127.0.0.1:5476``). The gateway passes
``KIROCREW_HOME`` at spawn, so a gateway-started backend always resolves the
same instance that started it.

Design notes:
  * ``temperature`` is accepted for contract compatibility but not forwarded:
    the spawn API takes no sampling knobs — determinism guidance lives in the
    agent's prompt (``agents/ai-edit.json``), and the tiered safeguards in
    ``todo_txt_handlers`` are the real protection against wild edits.
  * The app token is short-lived and never persisted; it is re-minted per
    edit. The token travels as a query parameter because the gateway's mixed
    internal paths authenticate via ``?token=`` or cookie (``token_auth.py``),
    and loopback HTTP leaves no wire for it to leak onto.
  * If anything is missing (no secret, no gateway, refusal), raise
    ``RuntimeError`` — the caller turns it into a clean "AI unavailable"
    toast. A timeout raises ``TimeoutError`` → 504.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from pathlib import Path
from typing import Any

import aiohttp

logger = logging.getLogger("todo-txt.llm")

APP_NAME = os.environ.get("KIROCREW_APP_NAME", "todo-txt")

#: The app's own restricted agent (agents/ai-edit.json), materialized by the
#: gateway as ``<app>--<agent>.json`` in ``~/.kiro/agents/``. The registered
#: agent NAME is the in-file ``name`` field — this constant must match it.
AI_EDIT_AGENT = "todo-txt-ai-edit"

DEFAULT_GATEWAY_URL = "http://127.0.0.1:5476"

#: Poll cadence while waiting for the spawned agent to finish.
_POLL_INTERVAL_SECS = 1.0

#: Per-HTTP-request timeout (token exchange, spawn, each poll). The overall
#: budget is the caller's ``timeout``; this only bounds a single hop so one
#: hung connection cannot eat the entire budget.
_HTTP_STEP_TIMEOUT_SECS = 10.0


def _gateway_base_url() -> str:
    """Resolve the local gateway's base URL.

    Reads ``$KIROCREW_HOME/config.json`` → ``dashboard.url``; falls back to
    the stock default. Never raises — a broken config falls back too, and the
    subsequent connect error is the more actionable failure.
    """
    override = os.environ.get("KIROCREW_GATEWAY_URL", "").strip()
    if override:
        return override.rstrip("/")
    home = os.environ.get("KIROCREW_HOME", "").strip()
    candidates = [Path(home)] if home else [Path.home() / ".kiro" / "crew"]
    for base in candidates:
        cfg = base / "config.json"
        try:
            data = json.loads(cfg.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        url = ((data.get("dashboard") or {}).get("url") or "").strip()
        if url:
            return url.rstrip("/")
    return DEFAULT_GATEWAY_URL


def _app_secret() -> str:
    return os.environ.get("KIROCREW_PROXY_SECRET", "")


async def _exchange_token(session: aiohttp.ClientSession, base: str) -> str:
    """Mint an app-scoped token from the per-app secret.

    The exchange endpoint is deliberately exempt from cookie/token auth
    (the secret IS the credential); everything after this call rides the
    returned token.
    """
    secret = _app_secret()
    if not secret:
        raise RuntimeError(
            "KIROCREW_PROXY_SECRET is not set — this backend was started "
            "outside the KiroCrew gateway, so it has no app identity to "
            "authenticate the AI call with."
        )
    try:
        async with session.post(
            f"{base}/api/apps/{APP_NAME}/token",
            headers={"X-App-Secret": secret},
            timeout=aiohttp.ClientTimeout(total=_HTTP_STEP_TIMEOUT_SECS),
        ) as resp:
            if resp.status != 200:
                raise RuntimeError(
                    f"gateway refused the app token exchange "
                    f"(HTTP {resp.status})"
                )
            payload: dict[str, Any] = await resp.json()
    except aiohttp.ClientError as exc:
        raise RuntimeError(f"gateway unreachable at {base}: {exc}") from exc
    token = str(payload.get("token") or "")
    if not token:
        raise RuntimeError("gateway token exchange returned no token")
    return token


async def complete(
    prompt: str,
    *,
    temperature: float = 0.1,  # noqa: ARG001 — kept for contract compatibility
    timeout: float = 90.0,
) -> str:
    """Run *prompt* through the app's restricted agent; return its reply text.

    Raises ``RuntimeError`` when the gateway is unreachable, refuses the
    spawn, or the agent errors; raises ``TimeoutError`` when the agent does
    not finish within *timeout* seconds.
    """
    base = _gateway_base_url()
    deadline = time.monotonic() + max(timeout, 1.0)

    async with aiohttp.ClientSession() as session:
        token = await _exchange_token(session, base)
        auth = {"token": token}

        # --- spawn ---------------------------------------------------------
        try:
            async with session.post(
                f"{base}/api/spawn",
                params=auth,
                json={"task": prompt, "agent": AI_EDIT_AGENT, "silent": True},
                timeout=aiohttp.ClientTimeout(total=_HTTP_STEP_TIMEOUT_SECS),
            ) as resp:
                body: dict[str, Any] = await resp.json()
                if resp.status != 200:
                    raise RuntimeError(
                        f"gateway declined the AI-edit spawn "
                        f"(HTTP {resp.status}): {body.get('error', '')}"
                    )
        except aiohttp.ClientError as exc:
            raise RuntimeError(f"spawn request failed: {exc}") from exc
        spawn_id = str(body.get("id") or "")
        if not spawn_id:
            raise RuntimeError(f"spawn returned no id: {body!r}")

        # --- poll ----------------------------------------------------------
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise TimeoutError(
                    f"AI-edit agent did not finish within {timeout:.0f}s "
                    f"(spawn id {spawn_id})"
                )
            await asyncio.sleep(min(_POLL_INTERVAL_SECS, max(remaining, 0.05)))
            try:
                async with session.get(
                    f"{base}/api/spawn/{spawn_id}",
                    params=auth,
                    timeout=aiohttp.ClientTimeout(total=_HTTP_STEP_TIMEOUT_SECS),
                ) as resp:
                    if resp.status != 200:
                        # Transient poll failure — retry until the deadline.
                        logger.warning(
                            "spawn poll returned HTTP %s for %s",
                            resp.status,
                            spawn_id,
                        )
                        continue
                    status: dict[str, Any] = await resp.json()
            except aiohttp.ClientError as exc:
                logger.warning("spawn poll failed for %s: %s", spawn_id, exc)
                continue
            if not status.get("done"):
                continue
            error = str(status.get("error") or "")
            if error:
                raise RuntimeError(f"AI-edit agent failed: {error}")
            result = status.get("result")
            if not isinstance(result, str) or not result.strip():
                raise RuntimeError(
                    f"AI-edit agent returned no text (spawn id {spawn_id})"
                )
            return _strip_code_fences(result)


def _strip_code_fences(text: str) -> str:
    """Unwrap a single markdown code fence if the agent added one.

    The agent prompt forbids fences, but a fenced reply is a plausible model
    slip and silently breaks the tiered parser (every line would differ).
    Only a fence that wraps the WHOLE reply is stripped; interior backticks
    are content and pass through untouched.
    """
    s = text.strip()
    if not s.startswith("```"):
        return text
    lines = s.splitlines()
    if len(lines) < 2 or lines[-1].strip() != "```":
        return text
    # Drop the opening fence (with any language tag) and the closing fence.
    inner = "\n".join(lines[1:-1])
    # Preserve the trailing newline convention of the original reply.
    return inner + ("\n" if text.endswith("\n") else "")
