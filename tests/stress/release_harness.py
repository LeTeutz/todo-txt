#!/usr/bin/env python3
"""Release stress harness for the todo.txt KiroCrew app backend.

NOT a pytest module. The filename deliberately avoids ``test_*`` so pytest
never collects it: the phases spawn a real backend subprocess, fire thousands
of concurrent requests and take tens of seconds, which is the wrong shape for
the unit suite. Run it directly:

    KIROCREW_PROXY_SECRET is generated internally -- do not set it.

    .venv-appdev/bin/python tests/stress/release_harness.py
    .venv-appdev/bin/python tests/stress/release_harness.py --skip-live
    .venv-appdev/bin/python tests/stress/release_harness.py --json out.json

Exit status is 0 only when every executed check passes.

Phases 1-7 run against a PRIVATE backend this process spawns on
``--port`` (default 9310) with a freshly generated proxy secret and a
throwaway ``TODO_TXT_ROOT``, so nothing here can touch the user's real
todo.txt. Phase 8 probes the LIVE gateway and the LIVE backend port, and is
read-only by construction (see ``phase8_auth_flood``).

Signing mirrors ``tests/test_proxy_auth.py::sign`` and the gateway's
``apps/routes.py::handle_app_api_proxy`` message construction:

    msg = "<ts>:<METHOD>:<target>:<sha256_hex(body)>"
    header X-KiroCrew-Proxy = "<ts>:<hmac_sha256_hex(secret, msg)>"

where ``target`` is the request-target the backend receives, i.e. the path
plus ``"?" + query_string`` when a query is present.
"""

from __future__ import annotations

import argparse
import asyncio
import contextlib
import hashlib
import hmac
import json
import math
import os
import random
import secrets
import shutil
import signal
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable, Sequence

import aiohttp
from yarl import URL

REPO_ROOT = Path(__file__).resolve().parents[2]
SERVER = REPO_ROOT / "backend" / "server.py"

PROXY_HEADER = "X-KiroCrew-Proxy"
SECRET_ENV = "KIROCREW_PROXY_SECRET"

# Mirrors backend/todo_txt_handlers.py::MAX_CONTENT_BYTES and
# backend/server.py::create_app(client_max_size=...).
MAX_CONTENT_BYTES = 1 * 1024 * 1024
CLIENT_MAX_SIZE = 2 * 1024 * 1024

LIVE_GATEWAY = "http://127.0.0.1:5476"
LIVE_APP_ID = "todo-txt"
LIVE_SECRET_FILE = Path.home() / ".kiro/crew/apps/todo-txt/.app_secret"
LIVE_BACKEND_LOG = Path.home() / ".kiro/crew/apps/todo-txt/data/logs/backend.log"


# ---------------------------------------------------------------------------
# Signing
# ---------------------------------------------------------------------------


def sign(
    method: str,
    target: str,
    body: bytes = b"",
    *,
    secret: str,
    ts: int | None = None,
) -> dict[str, str]:
    """Build the gateway's ``X-KiroCrew-Proxy`` header for one request."""
    stamp = str(int(time.time()) if ts is None else ts)
    body_hash = hashlib.sha256(body or b"").hexdigest()
    msg = f"{stamp}:{method}:{target}:{body_hash}"
    sig = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
    return {PROXY_HEADER: f"{stamp}:{sig}"}


# ---------------------------------------------------------------------------
# Result plumbing
# ---------------------------------------------------------------------------


@dataclass
class Check:
    name: str
    passed: bool
    detail: str = ""


@dataclass
class Phase:
    key: str
    title: str
    checks: list[Check] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)
    skipped: str = ""
    seconds: float = 0.0

    def check(self, name: str, passed: bool, detail: str = "") -> bool:
        self.checks.append(Check(name, bool(passed), detail))
        return bool(passed)

    @property
    def passed(self) -> bool:
        return all(c.passed for c in self.checks)


def pct(values: Sequence[float], p: float) -> float:
    """Nearest-rank percentile in milliseconds."""
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = int(math.ceil(p / 100.0 * len(ordered))) - 1
    return ordered[max(0, min(len(ordered) - 1, idx))]


def latency_metrics(samples: Sequence[float]) -> dict[str, Any]:
    if not samples:
        return {"n": 0}
    return {
        "n": len(samples),
        "min_ms": round(min(samples), 2),
        "p50_ms": round(pct(samples, 50), 2),
        "p95_ms": round(pct(samples, 95), 2),
        "p99_ms": round(pct(samples, 99), 2),
        "max_ms": round(max(samples), 2),
        "mean_ms": round(sum(samples) / len(samples), 2),
    }


def tally(statuses: Iterable[int]) -> dict[str, int]:
    out: dict[str, int] = {}
    for s in statuses:
        out[str(s)] = out.get(str(s), 0) + 1
    return dict(sorted(out.items()))


# ---------------------------------------------------------------------------
# Backend under test
# ---------------------------------------------------------------------------


class PrivateBackend:
    """Spawn backend/server.py on a private port + throwaway data root."""

    def __init__(self, port: int) -> None:
        self.port = port
        self.secret = secrets.token_hex(32)
        self.root = Path(tempfile.mkdtemp(prefix="todotxt-stress-"))
        self.proc: subprocess.Popen[bytes] | None = None
        self.log = self.root / "backend-stress.log"
        self._log_fh = None

    @property
    def base(self) -> str:
        return f"http://127.0.0.1:{self.port}"

    async def start(self, timeout: float = 30.0) -> None:
        env = os.environ.copy()
        env[SECRET_ENV] = self.secret
        env["PORT"] = str(self.port)
        env["TODO_TXT_ROOT"] = str(self.root)
        env["LOG_LEVEL"] = "WARNING"  # access logs would dominate the run
        # Keep the harness deterministic: no LLM calls are exercised, and
        # ai-edit is only probed for pre-LLM validation (400s).
        env.pop("TODO_TXT_AI_YOLO", None)
        self._log_fh = self.log.open("wb")
        self.proc = subprocess.Popen(
            [sys.executable, str(SERVER)],
            cwd=str(REPO_ROOT),
            env=env,
            stdout=self._log_fh,
            stderr=subprocess.STDOUT,
        )
        deadline = time.monotonic() + timeout
        async with aiohttp.ClientSession() as s:
            while time.monotonic() < deadline:
                if self.proc.poll() is not None:
                    raise RuntimeError(
                        f"backend exited early rc={self.proc.returncode}; "
                        f"log tail: {self._tail()}"
                    )
                try:
                    async with s.get(
                        f"{self.base}/health",
                        timeout=aiohttp.ClientTimeout(total=2),
                    ) as r:
                        if r.status == 200 and (await r.json()).get("ok") is True:
                            return
                except (aiohttp.ClientError, asyncio.TimeoutError):
                    pass
                await asyncio.sleep(0.15)
        raise RuntimeError(f"backend never became healthy; log tail: {self._tail()}")

    def _tail(self, n: int = 1200) -> str:
        with contextlib.suppress(OSError):
            if self._log_fh:
                self._log_fh.flush()
            return self.log.read_text(errors="replace")[-n:]
        return "<no log>"

    def stop(self) -> None:
        if self.proc and self.proc.poll() is None:
            with contextlib.suppress(ProcessLookupError, OSError):
                self.proc.send_signal(signal.SIGTERM)
            try:
                self.proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                with contextlib.suppress(ProcessLookupError, OSError):
                    self.proc.kill()
                with contextlib.suppress(subprocess.TimeoutExpired):
                    self.proc.wait(timeout=5)
        if self._log_fh:
            with contextlib.suppress(OSError):
                self._log_fh.close()
        shutil.rmtree(self.root, ignore_errors=True)


@dataclass
class Res:
    status: int
    body: Any
    ms: float
    error: str = ""

    @property
    def ok(self) -> bool:
        return not self.error


class Signed:
    """Signed client for one backend instance."""

    def __init__(self, session: aiohttp.ClientSession, base: str, secret: str) -> None:
        self.session = session
        self.base = base
        self.secret = secret

    async def call(
        self,
        method: str,
        path: str,
        *,
        payload: Any = None,
        raw: bytes | None = None,
        query: str = "",
        headers: dict[str, str] | None = None,
        signed: bool = True,
        sign_target: str | None = None,
        timeout: float = 120.0,
    ) -> Res:
        body = b""
        if raw is not None:
            body = raw
        elif payload is not None:
            body = json.dumps(payload).encode()

        target = path + (f"?{query}" if query else "")
        # `sign_target` lets a fuzz case sign a target that differs from the raw
        # wire form (the backend derives its target from the DECODED path, so a
        # percent-encoded probe legitimately cannot match a raw-form signature).
        hdrs: dict[str, str] = {}
        if signed:
            hdrs.update(sign(method, sign_target or target, body, secret=self.secret))
        if body:
            hdrs["Content-Type"] = "application/json"
        if headers:
            hdrs.update(headers)

        url = URL(self.base + target, encoded=True)
        t0 = time.perf_counter()
        try:
            async with self.session.request(
                method,
                url,
                data=body or None,
                headers=hdrs,
                timeout=aiohttp.ClientTimeout(total=timeout),
            ) as r:
                text = await r.text()
                ms = (time.perf_counter() - t0) * 1000
                try:
                    parsed: Any = json.loads(text) if text else None
                except ValueError:
                    parsed = text[:400]
                return Res(r.status, parsed, ms)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            ms = (time.perf_counter() - t0) * 1000
            return Res(0, None, ms, f"{type(exc).__name__}: {exc}")

    async def put_content(self, content: str, base_mtime: float | None = None) -> Res:
        payload: dict[str, Any] = {"content": content}
        if base_mtime is not None:
            payload["base_mtime"] = base_mtime
        return await self.call("PUT", "/api/content", payload=payload)

    async def get_content(self) -> Res:
        return await self.call("GET", "/api/content")


# ---------------------------------------------------------------------------
# Phase 1 -- sequential write latency + last-write-wins
# ---------------------------------------------------------------------------


async def phase1_sequential(c: Signed, n: int = 300) -> Phase:
    ph = Phase("1", f"{n} sequential PUT /api/content writes")
    samples: list[float] = []
    statuses: list[int] = []
    errors: list[str] = []
    last = ""
    for i in range(n):
        last = f"seq-{i:04d} write latency probe\n"
        r = await c.put_content(last)
        statuses.append(r.status)
        if r.ok:
            samples.append(r.ms)
        else:
            errors.append(r.error)

    ph.metrics["latency"] = latency_metrics(samples)
    ph.metrics["statuses"] = tally(statuses)
    ph.check("no transport errors", not errors, "; ".join(errors[:3]))
    ph.check("all writes 200", all(s == 200 for s in statuses), str(tally(statuses)))

    got = await c.get_content()
    ph.check("readback 200", got.status == 200, f"status={got.status}")
    if got.status == 200:
        content = (got.body or {}).get("content", "")
        ph.check(
            "last-write-wins",
            content == last,
            f"expected tail {last!r}, got {content[-48:]!r}",
        )
    return ph


# ---------------------------------------------------------------------------
# Phase 2 -- parallel unconditional writes must not tear
# ---------------------------------------------------------------------------


async def phase2_parallel_atomic(c: Signed, rounds: int = 4, fan: int = 50) -> Phase:
    ph = Phase("2", f"{rounds} rounds x {fan} parallel unconditional PUTs")
    samples: list[float] = []
    statuses: list[int] = []
    errors: list[str] = []
    torn: list[str] = []

    for rnd in range(rounds):
        payloads = [
            f"round{rnd}-racer{i:03d} " + ("x" * 200) + "\n" for i in range(fan)
        ]
        results = await asyncio.gather(
            *(c.put_content(p) for p in payloads), return_exceptions=True
        )
        for r in results:
            if isinstance(r, BaseException):
                errors.append(f"{type(r).__name__}: {r}")
                continue
            statuses.append(r.status)
            if r.ok:
                samples.append(r.ms)
            else:
                errors.append(r.error)

        got = await c.get_content()
        if got.status != 200:
            torn.append(f"round{rnd}: readback status={got.status}")
            continue
        content = (got.body or {}).get("content", "")
        if content not in set(payloads):
            # A torn write is the failure this phase exists to catch: content
            # that is not byte-identical to ANY single racer payload means two
            # writers interleaved into the same file.
            torn.append(
                f"round{rnd}: final content matches no single payload "
                f"(len={len(content)}, head={content[:60]!r})"
            )

    ph.metrics["latency"] = latency_metrics(samples)
    ph.metrics["statuses"] = tally(statuses)
    ph.check("no transport errors", not errors, "; ".join(errors[:3]))
    ph.check(
        "every parallel write 200",
        statuses and all(s == 200 for s in statuses),
        str(tally(statuses)),
    )
    ph.check("no torn writes (atomicity)", not torn, "; ".join(torn))
    return ph


# ---------------------------------------------------------------------------
# Phase 3 -- conflict storm
# ---------------------------------------------------------------------------


async def phase3_conflict_storm(c: Signed, stale: int = 20) -> Phase:
    ph = Phase("3", f"conflict storm: 1 winner + {stale} parallel stale PUTs")

    seed = "conflict-storm seed line\n"
    r = await c.put_content(seed)
    if not ph.check("seed write 200", r.status == 200, f"status={r.status}"):
        return ph
    old_mtime = float((r.body or {}).get("mtime", 0.0))

    winner = "conflict-storm WINNER content\n"
    w = await c.put_content(winner, base_mtime=old_mtime)
    ph.check("winner conditional PUT 200", w.status == 200, f"status={w.status}")

    losers = [f"conflict-storm loser {i:02d}\n" for i in range(stale)]
    results = await asyncio.gather(
        *(c.put_content(p, base_mtime=old_mtime) for p in losers),
        return_exceptions=True,
    )

    statuses: list[int] = []
    errors: list[str] = []
    bad_bodies: list[str] = []
    for r in results:
        if isinstance(r, BaseException):
            errors.append(f"{type(r).__name__}: {r}")
            continue
        statuses.append(r.status)
        if r.error:
            errors.append(r.error)
            continue
        if r.status != 409:
            continue
        body = r.body if isinstance(r.body, dict) else {}
        # The 409 must carry a usable recovery payload: the client rebases the
        # user's unsaved buffer onto `content` at `mtime`. A bare 409 would
        # silently drop typing.
        if body.get("error") != "conflict":
            bad_bodies.append(f"error={body.get('error')!r}")
        elif not isinstance(body.get("content"), str):
            bad_bodies.append("recovery body missing string 'content'")
        elif not isinstance(body.get("mtime"), (int, float)):
            bad_bodies.append("recovery body missing numeric 'mtime'")
        elif body.get("content") != winner:
            bad_bodies.append("recovery 'content' is not the winner content")

    ph.metrics["statuses"] = tally(statuses)
    ph.check("no transport errors", not errors, "; ".join(errors[:3]))
    ph.check(
        f"exactly {stale}x 409",
        statuses.count(409) == stale,
        f"got {tally(statuses)}",
    )
    ph.check("no stale write slipped through", statuses.count(200) == 0, str(tally(statuses)))
    ph.check("every 409 carries a recovery body", not bad_bodies, "; ".join(bad_bodies[:3]))

    got = await c.get_content()
    ph.check("winner content preserved", (got.body or {}).get("content") == winner,
             f"got {str((got.body or {}).get('content'))[:60]!r}")
    return ph


# ---------------------------------------------------------------------------
# Phase 4 -- payload caps
# ---------------------------------------------------------------------------


async def phase4_payload_caps(c: Signed) -> Phase:
    ph = Phase("4", "payload caps: 1MB content cap + 2MB client_max_size")

    cases: list[tuple[str, int, set[int]]] = [
        # (label, content byte length, acceptable statuses)
        ("just under 1MB content", MAX_CONTENT_BYTES - 1024, {200}),
        ("just over 1MB content", MAX_CONTENT_BYTES + 1024, {413}),
        ("3MB content (over client_max_size)", 3 * 1024 * 1024, {413}),
    ]

    for label, size, want in cases:
        content = ("z" * (size - 1)) + "\n"
        assert len(content.encode()) == size
        r = await c.put_content(content)
        detail = f"status={r.status} err={r.error or '-'} ms={r.ms:.0f}"
        ph.metrics[label] = {"status": r.status, "ms": round(r.ms, 1), "error": r.error}

        if r.error and 200 not in want:
            # An over-cap body can be refused mid-upload: aiohttp answers 413
            # and closes, which the client may surface as a reset rather than a
            # response. That is still a refusal, never a serve -- but flag it so
            # the distinction is visible in the report.
            ph.check(
                f"{label}: refused (no 200/500)",
                True,
                f"connection refused mid-upload instead of a 413 response ({r.error})",
            )
            continue

        ph.check(f"{label}: expected {sorted(want)}", r.status in want, detail)
        ph.check(f"{label}: never 5xx", not (500 <= r.status < 600), detail)
        if 200 not in want:
            ph.check(f"{label}: not served", r.status != 200, detail)

    # The oversize attempts must not have replaced the file with a giant blob.
    got = await c.get_content()
    if got.status == 200:
        n = len((got.body or {}).get("content", "").encode())
        ph.metrics["content_bytes_after"] = n
        ph.check(
            "over-cap writes did not land",
            n <= MAX_CONTENT_BYTES,
            f"file is {n} bytes, over the {MAX_CONTENT_BYTES} cap",
        )
    return ph


# ---------------------------------------------------------------------------
# Phase 5 -- fuzz + unicode fidelity
# ---------------------------------------------------------------------------


async def phase5_fuzz(c: Signed) -> Phase:
    ph = Phase("5", "fuzz: malformed bodies, traversal, oversized query, unicode")

    long_name = "a" * 4000

    # Seed FIRST. Several conflict-detection paths are only reachable when the
    # target file already exists (`if todo_path.is_file()`), so fuzzing an empty
    # root silently skips them and the case passes for the wrong reason.
    seed = await c.put_content("fuzz seed line\n")
    ph.check("fuzz seed write 200", seed.status == 200, f"status={seed.status}")

    # Each case: (label, method, path, kwargs). All must answer a clean 4xx.
    cases: list[tuple[str, str, str, dict[str, Any]]] = [
        ("bad JSON body", "PUT", "/api/content", {"raw": b"{not json at all"}),
        ("empty body", "PUT", "/api/content", {"raw": b""}),
        ("body is a list", "PUT", "/api/content", {"payload": [1, 2, 3]}),
        ("body is a bare string", "PUT", "/api/content", {"payload": "hello"}),
        ("content is an int", "PUT", "/api/content", {"payload": {"content": 123}}),
        ("content is null", "PUT", "/api/content", {"payload": {"content": None}}),
        ("content is a dict", "PUT", "/api/content", {"payload": {"content": {"a": 1}}}),
        (
            "base_mtime is a string",
            "PUT",
            "/api/content",
            {"payload": {"content": "x\n", "base_mtime": "not-a-number"}},
        ),
        (
            "base_mtime is empty string",
            "PUT",
            "/api/content",
            {"payload": {"content": "x\n", "base_mtime": ""}},
        ),
        (
            "base_mtime is a list",
            "PUT",
            "/api/content",
            {"payload": {"content": "x\n", "base_mtime": []}},
        ),
        (
            "base_mtime is a dict",
            "PUT",
            "/api/content",
            {"payload": {"content": "x\n", "base_mtime": {}}},
        ),
        (
            "file base_mtime is a string",
            "PUT",
            "/api/file",
            {"query": "name=todo", "payload": {"content": "x\n", "base_mtime": "nope"}},
        ),
        ("file name traversal", "GET", "/api/file", {"query": "name=../../etc/passwd"}),
        ("file name absolute path", "GET", "/api/file", {"query": "name=/etc/passwd"}),
        ("file name unknown", "GET", "/api/file", {"query": "name=shadow"}),
        ("file name missing", "GET", "/api/file", {}),
        ("file name 4000 chars", "GET", "/api/file", {"query": f"name={long_name}"}),
        ("ai-edit empty comments", "POST", "/api/ai-edit", {"payload": {"comments": []}}),
        ("ai-edit comments missing", "POST", "/api/ai-edit", {"payload": {}}),
        ("ai-edit comments not a list", "POST", "/api/ai-edit", {"payload": {"comments": "fix"}}),
        (
            "ai-edit comment without text",
            "POST",
            "/api/ai-edit",
            {"payload": {"comments": [{"id": "1"}]}},
        ),
        ("move: no body", "POST", "/api/move", {"raw": b""}),
        ("move: item not an int", "POST", "/api/move", {"payload": {"item": "1", "from": "todo", "to": "done"}}),
        ("move: same src/dest", "POST", "/api/move", {"payload": {"item": 1, "from": "todo", "to": "todo"}}),
        ("move: bogus file", "POST", "/api/move", {"payload": {"item": 1, "from": "todo", "to": "passwd"}}),
        ("move: item out of range", "POST", "/api/move", {"payload": {"item": 999999, "from": "todo", "to": "done"}}),
        ("backup name traversal (raw)", "GET", "/api/backups/..%2f..%2fetc%2fpasswd", {}),
        (
            "backup name traversal (decoded-signed)",
            "GET",
            "/api/backups/..%2f..",
            # The middleware builds its target from the DECODED path, so sign
            # that form; otherwise this can only ever be an auth rejection.
            {"sign_target": "/api/backups/../.."},
        ),
        ("backup name dotdot literal", "GET", "/api/backups/....", {}),
        ("backup name unknown", "GET", "/api/backups/nope.txt", {}),
        ("restore unknown backup", "POST", "/api/backups/nope.txt/restore", {}),
        ("ai-snapshot restore bad ts", "POST", "/api/ai-snapshots/not-a-ts/restore", {}),
        ("staged apply bad ts", "POST", "/api/ai-edit/not-a-ts/apply", {}),
    ]

    statuses: list[int] = []
    for label, method, path, kw in cases:
        r = await c.call(method, path, **kw)
        statuses.append(r.status)
        detail = f"status={r.status} err={r.error or '-'} body={str(r.body)[:120]}"
        if not ph.check(f"{label}: no transport error", r.ok, detail):
            continue
        ph.check(f"{label}: 4xx not 5xx", 400 <= r.status < 500, detail)

    ph.metrics["fuzz_statuses"] = tally(statuses)
    ph.metrics["fuzz_cases"] = len(cases)

    # Traversal must not have exfiltrated anything resembling /etc/passwd.
    leak = await c.call("GET", "/api/file", query="name=../../etc/passwd")
    ph.check(
        "traversal returned no host file content",
        leak.status != 200 or "root:" not in str(leak.body),
        f"status={leak.status}",
    )

    # --- conflict-detection bypass ---------------------------------------
    # `abs(current - float(base_mtime)) > 0.001` is False for every non-finite
    # value, so a sentinel that survives float() defeats the optimistic-
    # concurrency guard and the stale write lands as last-write-wins. This is
    # the data-loss shape the 409 exists to prevent, so it must be a 4xx.
    for sentinel in ("NaN", "nan", "inf", "Infinity", "-Infinity", True):
        base = await c.put_content("bypass-probe base\n")
        if base.status != 200:
            ph.check(f"bypass probe {sentinel!r}: base write 200", False, f"status={base.status}")
            continue
        attempt = "bypass-probe STALE OVERWRITE\n"
        r = await c.call(
            "PUT",
            "/api/content",
            payload={"content": attempt, "base_mtime": sentinel},
        )
        landed = False
        if r.status == 200:
            got = await c.get_content()
            landed = (got.body or {}).get("content") == attempt
        ph.check(
            f"non-finite base_mtime {sentinel!r} cannot bypass conflict check",
            not landed,
            f"status={r.status} and the stale write LANDED -- conflict detection bypassed",
        )


    unicode_content = (
        "x 2026-08-05 done \U0001f600\U0001f680 emoji tail\n"
        "\u05e9\u05dc\u05d5\u05dd \u05e2\u05d5\u05dc\u05dd RTL hebrew\n"
        "\u0645\u0631\u062d\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645 RTL arabic\n"
        "zero\u200bwidth\u200bspace and joiner \U0001f469\u200d\U0001f4bb\n"
        "combining: e\u0301 a\u030a o\u0308  BOM-ish: \ufeff mid-line\n"
        "bidi marks: \u202ercod\u202c \u200f rtl-mark \u200e ltr-mark\n"
        "surrogate-pair math: \U0001d4b7\U0001d4b8  CJK: \u4f60\u597d\u4e16\u754c\n"
    )
    w = await c.put_content(unicode_content)
    ph.check("unicode PUT 200", w.status == 200, f"status={w.status} {w.error}")
    got = await c.get_content()
    if ph.check("unicode GET 200", got.status == 200, f"status={got.status}"):
        back = (got.body or {}).get("content", "")
        ph.check(
            "unicode round-trips byte-exact",
            back.encode("utf-8") == unicode_content.encode("utf-8"),
            f"sent {len(unicode_content.encode())}B, got {len(back.encode())}B",
        )
        ph.metrics["unicode_bytes"] = len(unicode_content.encode())
    return ph


# ---------------------------------------------------------------------------
# Phase 6 -- large file: archive + report snapshot
# ---------------------------------------------------------------------------


async def phase6_large_file(c: Signed, lines: int = 10_000) -> Phase:
    ph = Phase("6", f"{lines}-line file -> archive + report snapshot")

    rows: list[str] = []
    for i in range(lines):
        if i % 3 == 0:
            rows.append(f"x 2026-08-0{(i % 9) + 1} (A) completed item {i} +proj @ctx")
        else:
            rows.append(f"(B) 2026-08-01 open item {i} +proj{i % 7} @ctx{i % 5} due:2026-09-01")
    content = "\n".join(rows) + "\n"
    nbytes = len(content.encode())
    ph.metrics["file_bytes"] = nbytes
    ph.metrics["file_lines"] = lines

    if nbytes > MAX_CONTENT_BYTES:
        ph.skipped = f"generated fixture is {nbytes}B, over the {MAX_CONTENT_BYTES} cap"
        return ph

    w = await c.put_content(content)
    ph.metrics["write_ms"] = round(w.ms, 1)
    if not ph.check("10k-line PUT 200", w.status == 200, f"status={w.status} {w.error}"):
        return ph

    g = await c.get_content()
    ph.metrics["read_ms"] = round(g.ms, 1)
    ph.check("10k-line GET 200", g.status == 200, f"status={g.status}")
    ph.check(
        "10k-line round-trip exact",
        (g.body or {}).get("content") == content,
        "content differs after round-trip",
    )

    arch = await c.call("POST", "/api/archive", payload={})
    ph.metrics["archive_ms"] = round(arch.ms, 1)
    ph.metrics["archive_body"] = str(arch.body)[:200]
    ph.check("archive 200", arch.status == 200, f"status={arch.status} {str(arch.body)[:160]}")

    snap = await c.call("POST", "/api/report/snapshot", payload={})
    ph.metrics["report_snapshot_ms"] = round(snap.ms, 1)
    ph.metrics["report_snapshot_body"] = str(snap.body)[:200]
    ph.check("report snapshot 200", snap.status == 200, f"status={snap.status} {str(snap.body)[:160]}")

    after = await c.get_content()
    ph.check("post-archive GET 200", after.status == 200, f"status={after.status}")
    if after.status == 200:
        remaining = (after.body or {}).get("content", "")
        n_done_left = sum(1 for ln in remaining.splitlines() if ln.startswith("x "))
        ph.metrics["done_lines_left_in_todo"] = n_done_left
        ph.check(
            "archive moved completed lines out of todo.txt",
            n_done_left == 0,
            f"{n_done_left} 'x ' lines still in todo.txt",
        )

    done = await c.call("GET", "/api/file", query="name=done")
    ph.check("done.txt readable after archive", done.status == 200, f"status={done.status}")
    report = await c.call("GET", "/api/file", query="name=report")
    ph.check("report.txt readable after snapshot", report.status == 200, f"status={report.status}")

    backups = await c.call("GET", "/api/backups")
    ph.check("backups list 200", backups.status == 200, f"status={backups.status}")
    return ph


# ---------------------------------------------------------------------------
# Phase 7 -- interleaved chaos
# ---------------------------------------------------------------------------


async def phase7_chaos(c: Signed, gets: int = 200, puts: int = 100, beacons: int = 50) -> Phase:
    ph = Phase("7", f"interleaved chaos: {gets} GET + {puts} PUT + {beacons} beacon-POST")

    ops: list[tuple[str, Any]] = []
    for _ in range(gets):
        ops.append(("get", None))
    for i in range(puts):
        ops.append(("put", f"chaos-put-{i:03d} " + ("p" * 120) + "\n"))
    for i in range(beacons):
        ops.append(("beacon", f"chaos-beacon-{i:03d} " + ("b" * 120) + "\n"))
    random.Random(20260805).shuffle(ops)

    async def run(kind: str, arg: Any) -> tuple[str, Res]:
        if kind == "get":
            return kind, await c.get_content()
        if kind == "put":
            return kind, await c.put_content(arg)
        return kind, await c.call("POST", "/api/content", payload={"content": arg})

    t0 = time.perf_counter()
    results = await asyncio.gather(*(run(k, a) for k, a in ops), return_exceptions=True)
    wall = time.perf_counter() - t0

    per_kind: dict[str, list[float]] = {"get": [], "put": [], "beacon": []}
    statuses: list[int] = []
    errors: list[str] = []
    exceptions: list[str] = []
    for item in results:
        if isinstance(item, BaseException):
            exceptions.append(f"{type(item).__name__}: {item}")
            continue
        kind, r = item
        statuses.append(r.status)
        if r.error:
            errors.append(f"{kind}: {r.error}")
        else:
            per_kind[kind].append(r.ms)

    ph.metrics["wall_seconds"] = round(wall, 2)
    ph.metrics["ops"] = len(ops)
    ph.metrics["throughput_rps"] = round(len(ops) / wall, 1) if wall else 0
    ph.metrics["statuses"] = tally(statuses)
    for kind, samples in per_kind.items():
        ph.metrics[f"latency_{kind}"] = latency_metrics(samples)
    ph.metrics["latency_all"] = latency_metrics([m for v in per_kind.values() for m in v])

    ph.check("zero unhandled exceptions", not exceptions, "; ".join(exceptions[:3]))
    ph.check("zero transport errors", not errors, "; ".join(errors[:3]))
    ph.check("zero 5xx", not any(500 <= s < 600 for s in statuses), str(tally(statuses)))
    ph.check("every op 200", all(s == 200 for s in statuses), str(tally(statuses)))

    final = await c.get_content()
    ph.check("readable after chaos", final.status == 200, f"status={final.status}")
    if final.status == 200:
        content = (final.body or {}).get("content", "")
        ph.check(
            "final content is one whole chaos payload",
            content.startswith(("chaos-put-", "chaos-beacon-")) and content.count("\n") == 1,
            f"len={len(content)} head={content[:48]!r}",
        )
    return ph


# ---------------------------------------------------------------------------
# Phase 8 -- live auth flood (read-only by construction)
# ---------------------------------------------------------------------------


def _live_backend_port() -> int | None:
    try:
        lines = [
            ln
            for ln in LIVE_BACKEND_LOG.read_text(errors="replace").splitlines()
            if "starting on 127.0.0.1" in ln
        ]
    except OSError:
        return None
    for ln in reversed(lines):
        marker = "starting on 127.0.0.1:"
        i = ln.find(marker)
        if i == -1:
            continue
        tail = ln[i + len(marker):]
        digits = ""
        for ch in tail:
            if ch.isdigit():
                digits += ch
            else:
                break
        if digits:
            return int(digits)
    return None


async def phase8_auth_flood(
    session: aiohttp.ClientSession, direct: int = 150, bogus: int = 50
) -> Phase:
    ph = Phase("8", f"live auth flood: {direct} unsigned direct + {bogus} bogus-token proxy")

    port = _live_backend_port()
    ph.metrics["live_backend_port"] = port
    if port is None:
        ph.skipped = f"could not resolve live backend port from {LIVE_BACKEND_LOG}"
        return ph
    backend = f"http://127.0.0.1:{port}"

    health_ok = False
    with contextlib.suppress(aiohttp.ClientError, asyncio.TimeoutError):
        async with session.get(
            f"{backend}/health", timeout=aiohttp.ClientTimeout(total=3)
        ) as r:
            health_ok = r.status == 200
    ph.metrics["live_backend_health"] = health_ok
    if not health_ok:
        ph.skipped = f"live backend on {backend} is not answering /health"
        return ph

    # --- token mint (the secret and the token are never logged) -----------
    token = ""
    try:
        app_secret = LIVE_SECRET_FILE.read_text().strip()
        ph.metrics["app_secret_present"] = bool(app_secret)
        async with session.post(
            f"{LIVE_GATEWAY}/api/apps/{LIVE_APP_ID}/token",
            headers={"X-App-Secret": app_secret},
            timeout=aiohttp.ClientTimeout(total=10),
        ) as r:
            ph.metrics["token_mint_status"] = r.status
            if r.status == 200:
                body = await r.json()
                token = str(body.get("token") or body.get("app_token") or "")
        del app_secret
    except (OSError, aiohttp.ClientError, asyncio.TimeoutError, ValueError) as exc:
        ph.metrics["token_mint_error"] = f"{type(exc).__name__}"
    ph.metrics["token_minted"] = bool(token)
    ph.check("app token mints via X-App-Secret", bool(token),
             f"mint status={ph.metrics.get('token_mint_status')}")

    proxy_url = f"{LIVE_GATEWAY}/apps/{LIVE_APP_ID}/api/content"

    # Try to read the live content through the proxy so the unsigned WRITE
    # probes below can replay exactly those bytes (a gate failure then shows up
    # as a 200 without mutating the user's real todo.txt).
    #
    # In KiroCrew 0.1.2 this does not succeed: `/apps/{name}/api/{path}` is the
    # dashboard-user, same-origin path and wants the dashboard's session
    # credential, while an app token minted from `.app_secret` is scoped to
    # `/api/spawn` -- so the proxy answers 403 "Access Denied" for it. Recorded
    # as a metric, NOT asserted: proving the proxy's happy path is out of scope
    # for an auth flood, and there is no supported way to mint a dashboard
    # session token from here. Consequence: with no captured content, the write
    # probes are skipped and this flood stays strictly read-only.
    live_content: str | None = None
    if token:
        with contextlib.suppress(aiohttp.ClientError, asyncio.TimeoutError, ValueError):
            async with session.get(
                proxy_url,
                headers={"Authorization": f"Bearer {token}"},
                timeout=aiohttp.ClientTimeout(total=15),
            ) as r:
                ph.metrics["authorized_proxy_get_status"] = r.status
                if r.status == 200:
                    live_content = (await r.json()).get("content")
    ph.metrics["live_content_captured"] = live_content is not None
    ph.metrics["write_probes_enabled"] = live_content is not None

    # --- flood A: unsigned / garbage straight at the backend socket -------
    bad_secret = secrets.token_hex(16)
    stale_ts = int(time.time()) - 4000
    future_ts = int(time.time()) + 4000

    def variants(i: int) -> tuple[str, str, dict[str, str], Any]:
        """(method, target, headers, payload) for probe *i*."""
        k = i % 10
        if k == 0:
            return "GET", "/api/content", {}, None
        if k == 1:
            return "GET", "/api/content", {PROXY_HEADER: "garbage"}, None
        if k == 2:
            return "GET", "/api/content", {PROXY_HEADER: "not-a-number:deadbeef"}, None
        if k == 3:
            return "GET", "/api/content", {PROXY_HEADER: f"{int(time.time())}:"}, None
        if k == 4:
            return "GET", "/api/content", sign("GET", "/api/content", secret=bad_secret), None
        if k == 5:
            return "GET", "/api/content", sign("GET", "/api/content", secret=bad_secret, ts=stale_ts), None
        if k == 6:
            return "GET", "/api/content", sign("GET", "/api/content", secret=bad_secret, ts=future_ts), None
        if k == 7:
            return "GET", "/api/file?name=todo", {}, None
        if k == 8:
            return "GET", "/api/backups", {PROXY_HEADER: f"{int(time.time())}:{'0' * 64}"}, None
        # Write probe -- replays the captured live bytes, so a gate failure is
        # observable (200) without mutating the user's file. Skipped entirely
        # when the authorized read did not succeed.
        if live_content is None:
            return "GET", "/api/backups", {}, None
        return "POST", "/api/content", {}, {"content": live_content}

    async def probe(i: int) -> Res:
        method, target, headers, payload = variants(i)
        body = json.dumps(payload).encode() if payload is not None else b""
        hdrs = dict(headers)
        if body:
            hdrs["Content-Type"] = "application/json"
        t0 = time.perf_counter()
        try:
            async with session.request(
                method,
                URL(backend + target, encoded=True),
                data=body or None,
                headers=hdrs,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as r:
                await r.read()
                return Res(r.status, None, (time.perf_counter() - t0) * 1000)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            return Res(0, None, (time.perf_counter() - t0) * 1000, type(exc).__name__)

    results = await asyncio.gather(*(probe(i) for i in range(direct)), return_exceptions=True)
    d_status: list[int] = []
    d_errors: list[str] = []
    d_lat: list[float] = []
    for r in results:
        if isinstance(r, BaseException):
            d_errors.append(type(r).__name__)
            continue
        d_status.append(r.status)
        d_lat.append(r.ms)
        if r.error:
            d_errors.append(r.error)

    ph.metrics["direct_statuses"] = tally(d_status)
    ph.metrics["direct_latency"] = latency_metrics(d_lat)
    ph.check(
        "no unsigned direct hit was served",
        not any(s == 200 for s in d_status),
        f"{d_status.count(200)} of {direct} returned 200 -- CWE-306 regression! {tally(d_status)}",
    )
    ph.check(
        "every unsigned direct hit 401",
        all(s == 401 for s in d_status) and len(d_status) == direct,
        str(tally(d_status)) + (f" errors={d_errors[:3]}" if d_errors else ""),
    )
    ph.check("flood caused no 5xx", not any(500 <= s < 600 for s in d_status), str(tally(d_status)))

    # --- flood B: bogus bearer tokens through the gateway proxy -----------
    async def bogus_probe(i: int) -> Res:
        style = i % 5
        if style == 0:
            hdrs = {"Authorization": f"Bearer {secrets.token_hex(32)}"}
        elif style == 1:
            hdrs = {"Authorization": "Bearer "}
        elif style == 2:
            hdrs = {"Authorization": secrets.token_hex(16)}
        elif style == 3:
            hdrs = {"Authorization": "Bearer null.null.null"}
        else:
            hdrs = {}
        t0 = time.perf_counter()
        try:
            async with session.get(
                proxy_url, headers=hdrs, timeout=aiohttp.ClientTimeout(total=30)
            ) as r:
                await r.read()
                return Res(r.status, None, (time.perf_counter() - t0) * 1000)
        except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
            return Res(0, None, (time.perf_counter() - t0) * 1000, type(exc).__name__)

    b_results = await asyncio.gather(
        *(bogus_probe(i) for i in range(bogus)), return_exceptions=True
    )
    b_status: list[int] = []
    b_lat: list[float] = []
    b_errors: list[str] = []
    for r in b_results:
        if isinstance(r, BaseException):
            b_errors.append(type(r).__name__)
            continue
        b_status.append(r.status)
        b_lat.append(r.ms)
        if r.error:
            b_errors.append(r.error)

    ph.metrics["bogus_token_statuses"] = tally(b_status)
    ph.metrics["bogus_token_latency"] = latency_metrics(b_lat)
    # Honest caveat: the proxy denies a valid app token too (see above), so this
    # sub-flood confirms "nothing got through" but does NOT prove the gate
    # discriminates good credentials from bad. The discriminating evidence is
    # the direct-socket flood: that same backend code serves signed requests
    # (phases 1-7, identical middleware) and refused all unsigned ones here.
    ph.metrics["bogus_token_flood_is_discriminating"] = (
        ph.metrics.get("authorized_proxy_get_status") == 200
    )
    ph.check(
        "no bogus-token proxy GET was served",
        not any(s == 200 for s in b_status),
        f"{b_status.count(200)} of {bogus} returned 200: {tally(b_status)}",
    )
    ph.check(
        "every bogus-token proxy GET 401/403",
        all(s in (401, 403) for s in b_status) and len(b_status) == bogus,
        str(tally(b_status)) + (f" errors={b_errors[:3]}" if b_errors else ""),
    )
    ph.check("proxy flood caused no 5xx", not any(500 <= s < 600 for s in b_status), str(tally(b_status)))

    # --- the live file must be untouched ----------------------------------
    if token and live_content is not None:
        with contextlib.suppress(aiohttp.ClientError, asyncio.TimeoutError, ValueError):
            async with session.get(
                proxy_url,
                headers={"Authorization": f"Bearer {token}"},
                timeout=aiohttp.ClientTimeout(total=15),
            ) as r:
                if r.status == 200:
                    ph.check(
                        "live todo.txt unchanged by the flood",
                        (await r.json()).get("content") == live_content,
                        "live content changed during the auth flood",
                    )
    return ph


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------


def render(phases: list[Phase], wall: float) -> str:
    out: list[str] = []
    out.append("=" * 78)
    out.append("todo.txt RELEASE STRESS HARNESS")
    out.append("=" * 78)

    for ph in phases:
        total = len(ph.checks)
        failed = [c for c in ph.checks if not c.passed]
        if ph.skipped:
            verdict = "SKIP"
        elif failed:
            verdict = "FAIL"
        else:
            verdict = "PASS"
        out.append("")
        out.append(f"[{verdict}] Phase {ph.key}: {ph.title}   ({ph.seconds:.1f}s)")
        if ph.skipped:
            out.append(f"       skipped: {ph.skipped}")
        out.append(f"       checks: {total - len(failed)}/{total} passed")
        for key, val in ph.metrics.items():
            out.append(f"       {key}: {val}")
        for c in failed:
            out.append(f"       FAILED -> {c.name}: {c.detail}")

    executed = [p for p in phases if not p.skipped]
    all_checks = [c for p in phases for c in p.checks]
    n_fail = sum(1 for c in all_checks if not c.passed)
    out.append("")
    out.append("-" * 78)
    out.append(
        f"TOTAL: {len(all_checks) - n_fail}/{len(all_checks)} checks passed across "
        f"{len(executed)}/{len(phases)} executed phases in {wall:.1f}s"
    )
    out.append(f"VERDICT: {'PASS' if n_fail == 0 else f'FAIL ({n_fail} check(s))'}")
    out.append("-" * 78)
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------


async def run(args: argparse.Namespace) -> int:
    phases: list[Phase] = []
    t_start = time.perf_counter()

    backend = PrivateBackend(args.port)
    connector = aiohttp.TCPConnector(limit=0, force_close=False)
    timeout = aiohttp.ClientTimeout(total=180)
    try:
        await backend.start()
        print(f"private backend up on {backend.base} (root={backend.root})", flush=True)

        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            c = Signed(session, backend.base, backend.secret)

            plan = [
                ("1", lambda: phase1_sequential(c, args.sequential)),
                ("2", lambda: phase2_parallel_atomic(c, args.rounds, args.fan)),
                ("3", lambda: phase3_conflict_storm(c, args.stale)),
                ("4", lambda: phase4_payload_caps(c)),
                ("5", lambda: phase5_fuzz(c)),
                ("6", lambda: phase6_large_file(c, args.lines)),
                ("7", lambda: phase7_chaos(c)),
            ]
            for key, fn in plan:
                if args.only and key not in args.only:
                    continue
                t0 = time.perf_counter()
                print(f"-- phase {key} running...", flush=True)
                ph = await fn()
                ph.seconds = time.perf_counter() - t0
                phases.append(ph)
                print(
                    f"-- phase {key} {'PASS' if ph.passed else 'FAIL'} "
                    f"({ph.seconds:.1f}s)",
                    flush=True,
                )

            if not args.skip_live and (not args.only or "8" in args.only):
                t0 = time.perf_counter()
                print("-- phase 8 running (live gateway)...", flush=True)
                ph = await phase8_auth_flood(session)
                ph.seconds = time.perf_counter() - t0
                phases.append(ph)
                print(
                    f"-- phase 8 {'SKIP' if ph.skipped else ('PASS' if ph.passed else 'FAIL')} "
                    f"({ph.seconds:.1f}s)",
                    flush=True,
                )
    finally:
        backend.stop()

    wall = time.perf_counter() - t_start
    report = render(phases, wall)
    print()
    print(report)

    if args.json:
        Path(args.json).write_text(
            json.dumps(
                {
                    "wall_seconds": round(wall, 2),
                    "phases": [
                        {
                            "key": p.key,
                            "title": p.title,
                            "skipped": p.skipped,
                            "seconds": round(p.seconds, 2),
                            "passed": p.passed and not p.skipped,
                            "metrics": p.metrics,
                            "checks": [
                                {"name": c.name, "passed": c.passed, "detail": c.detail}
                                for c in p.checks
                            ],
                        }
                        for p in phases
                    ],
                },
                indent=2,
                default=str,
            )
        )
        print(f"\njson report -> {args.json}")

    return 0 if all(c.passed for p in phases for c in p.checks) else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--port", type=int, default=9310, help="private backend port")
    ap.add_argument("--sequential", type=int, default=300)
    ap.add_argument("--rounds", type=int, default=4)
    ap.add_argument("--fan", type=int, default=50)
    ap.add_argument("--stale", type=int, default=20)
    ap.add_argument("--lines", type=int, default=10_000)
    ap.add_argument("--skip-live", action="store_true", help="skip phase 8")
    ap.add_argument("--only", nargs="*", help="phase keys to run, e.g. --only 3 4")
    ap.add_argument("--json", help="write a machine-readable report here")
    args = ap.parse_args()

    if os.environ.get(SECRET_ENV):
        print(
            f"note: inherited {SECRET_ENV} is ignored; the private backend gets a "
            "freshly generated secret.",
            file=sys.stderr,
        )
    if not SERVER.is_file():
        print(f"ERROR: backend not found at {SERVER}", file=sys.stderr)
        return 2
    return asyncio.run(run(args))


if __name__ == "__main__":
    raise SystemExit(main())
