"""The destructive command surface: archive, clear, move, restore.

These are the only handlers that remove content from the live task files, so
each one is exercised against partial failure, concurrency, and hostile input.
The invariants they must hold:

Atomicity
    ``_do_archive`` and ``_do_move`` each rewrite two files. An implementation
    that shrinks the source first and appends to the destination second loses
    lines when the second write fails: they are gone from the source and never
    arrived at the destination, and the caller sees only a 500 with no hint
    that content has already been destroyed. Either both writes land, or
    neither does.

Backups precede destruction
    Backup filenames are derived from a timestamp. Truncated to milliseconds,
    two destructive ops in the same millisecond collide on one name and the
    second silently overwrites the first — a double-fired clear then replaces
    the only copy of the user's tasks with a copy of the empty file it just
    wrote. A backup that cannot be written is fatal to the operation:
    swallowing the error and destroying content anyway leaves nothing to
    recover on a full or read-only disk.

Conflict tokens
    ``archive`` and ``clear`` destroy content the caller may never have seen,
    so they honour ``base_mtime`` like every other write path, and hand back a
    fresh token for each file they rewrote. Without a returned token the client
    must re-GET, and a save queued in that window resurrects the archived
    lines.

Scope
    ``clear`` empties the file named by ``?name=`` rather than a hardcoded one,
    and the emptied file stays empty — first-run seeding must not refill it on
    the next request.

Fidelity
    A moved line keeps the destination file's line terminator instead of
    normalising to LF and leaving a mixed-terminator file behind.

Concurrency
    Every pair and triple of handlers that touches the two task files is raced
    repeatedly. The core invariant is that the multiset of task lines across
    todo.txt and done.txt is conserved. Where an operation destroys by design,
    the weaker invariant still holds absolutely: nothing is duplicated, and
    anything that left the live files is recoverable from ``backup/``.
"""

from __future__ import annotations

import asyncio
import collections
import errno
import importlib.util
import shutil
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer

_MODULE_PATH = (
    Path(__file__).resolve().parent.parent / "backend" / "todo_txt_handlers.py"
)

# Every race is run this many times. A 1-in-20 interleaving is a real bug, so
# a single green pass proves nothing.
TRIALS = 25


def _load_handlers_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_handlers_under_test_destructive", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["todo_txt_handlers_under_test_destructive"] = module
    spec.loader.exec_module(module)
    return module


handlers = _load_handlers_module()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """An isolated todo.txt root with seeding disabled."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    monkeypatch.delenv("TODO_TXT_SEED", raising=False)
    handlers.ensure_dirs()
    return tmp_path


@pytest_asyncio.fixture
async def client(root: Path):
    """Test client with the full destructive surface wired up.

    ``_io_lock`` is rebound per test. It is a module-level ``asyncio.Lock``
    created at import time, and ``Lock.acquire`` only latches onto a loop on a
    CONTENDED acquire — so the first test that actually races two handlers
    binds the lock to that test's loop, and every later contended acquire on a
    fresh loop raises ``RuntimeError: bound to a different event loop`` (a 500
    on every concurrent write). Harmless in production, where the backend owns
    one loop for its lifetime; fatal to a suite that builds a loop per test.
    """
    handlers._io_lock = asyncio.Lock()
    app = web.Application()
    app.router.add_get("/api/content", handlers.api_get_content)
    app.router.add_get("/api/file", handlers.api_get_file)
    app.router.add_put("/api/content", handlers.api_put_content)
    app.router.add_put("/api/file", handlers.api_put_file)
    app.router.add_post("/api/clear", handlers.api_clear)
    app.router.add_post("/api/archive", handlers.api_archive)
    app.router.add_post("/api/move", handlers.api_move)
    app.router.add_post("/api/report/snapshot", handlers.api_report_snapshot)
    app.router.add_get("/api/backups", handlers.api_list_backups)
    app.router.add_post(
        "/api/backups/{name}/restore", handlers.api_restore_backup
    )
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _write(path: Path, text: str) -> None:
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)


def _read(path: Path) -> str:
    if not path.is_file():
        return ""
    with open(path, "r", encoding="utf-8", newline="") as fh:
        return fh.read()


def _lines(text: str) -> list[str]:
    """Content lines, terminators stripped, blanks dropped."""
    return [ln.rstrip("\r\n") for ln in text.splitlines() if ln.strip()]


def _union(root: Path) -> collections.Counter:
    """Multiset of task lines across todo.txt + done.txt.

    The archive/move invariant: this multiset is CONSERVED. A missing entry is
    line loss; a count of 2 is duplication. Both are silent corruption.
    """
    return collections.Counter(
        _lines(_read(root / "todo.txt")) + _lines(_read(root / "done.txt"))
    )


def _backup_texts(root: Path, family: str | None = None) -> list[str]:
    backup_dir = root / "backup"
    if not backup_dir.is_dir():
        return []
    out = []
    for p in sorted(backup_dir.iterdir()):
        if not p.is_file() or not p.name.endswith(".txt"):
            continue
        if family and not p.name.startswith(f"{family}-"):
            continue
        out.append(_read(p))
    return out


def _failing_write_on_call(n: int, real):
    """Return an ``_atomic_write`` stand-in that raises on its *n*-th call."""
    state = {"calls": 0}

    def _patched(target: Path, content: str) -> None:
        state["calls"] += 1
        if state["calls"] == n:
            raise OSError(errno.ENOSPC, "No space left on device")
        real(target, content)

    return _patched


SAMPLE_TODO = (
    "(A) alpha task +proj\n"
    "x 2026-01-01 bravo done earlier\n"
    "charlie task @ctx\n"
    "x 2026-01-02 delta done later\n"
    "echo task\n"
)


# ===========================================================================
# Partial-failure atomicity. A half-applied archive or move is silent
# corruption of the user's only live copy.
# ===========================================================================


@pytest.mark.asyncio
async def test_archive_surviving_a_failed_second_write_loses_no_line(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """Archive must never leave a line in NEITHER file.

    The second ``_atomic_write`` is made to raise ENOSPC. An implementation
    that rewrites todo.txt without the two ``x`` lines before appending to
    done.txt loses those lines entirely: the shortened todo.txt is already on
    disk and done.txt was never touched.
    """
    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    before = _union(root)

    monkeypatch.setattr(
        handlers,
        "_atomic_write",
        _failing_write_on_call(2, handlers._atomic_write),
    )
    res = await client.post("/api/archive")
    assert res.status == 500

    after = _union(root)
    missing = before - after
    assert not missing, f"archive LOST lines on partial failure: {sorted(missing)}"


@pytest.mark.asyncio
async def test_archive_failed_first_write_changes_nothing(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """The first write failing must be a clean no-op, not a half-archive."""
    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    todo_before = _read(root / "todo.txt")
    done_before = _read(root / "done.txt")

    monkeypatch.setattr(
        handlers,
        "_atomic_write",
        _failing_write_on_call(1, handlers._atomic_write),
    )
    res = await client.post("/api/archive")
    assert res.status == 500
    assert _read(root / "todo.txt") == todo_before
    assert _read(root / "done.txt") == done_before


@pytest.mark.asyncio
async def test_archive_partial_failure_never_duplicates(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """The rollback must not leave the archived lines in BOTH files either."""
    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    before = _union(root)

    monkeypatch.setattr(
        handlers,
        "_atomic_write",
        _failing_write_on_call(2, handlers._atomic_write),
    )
    await client.post("/api/archive")

    after = _union(root)
    dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
    assert not dupes, f"archive DUPLICATED lines on partial failure: {dupes}"


@pytest.mark.asyncio
async def test_move_surviving_a_failed_second_write_loses_no_line(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """Move must never delete the line it failed to deliver.

    The second ``_atomic_write`` raises. An implementation that rewrites the
    source without ``charlie task @ctx`` before writing the destination
    deletes the task outright when that destination write fails.
    """
    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    before = _union(root)

    monkeypatch.setattr(
        handlers,
        "_atomic_write",
        _failing_write_on_call(2, handlers._atomic_write),
    )
    res = await client.post(
        "/api/move", json={"item": 3, "from": "todo", "to": "done"}
    )
    assert res.status == 500

    after = _union(root)
    missing = before - after
    assert not missing, f"move LOST lines on partial failure: {sorted(missing)}"
    dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
    assert not dupes, f"move DUPLICATED lines on partial failure: {dupes}"


@pytest.mark.asyncio
async def test_move_failed_first_write_changes_nothing(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    todo_before = _read(root / "todo.txt")
    done_before = _read(root / "done.txt")

    monkeypatch.setattr(
        handlers,
        "_atomic_write",
        _failing_write_on_call(1, handlers._atomic_write),
    )
    res = await client.post(
        "/api/move", json={"item": 3, "from": "todo", "to": "done"}
    )
    assert res.status == 500
    assert _read(root / "todo.txt") == todo_before
    assert _read(root / "done.txt") == done_before


# ===========================================================================
# Backup guarantees.
# ===========================================================================


def test_same_millisecond_backups_do_not_overwrite_each_other(
    root: Path, monkeypatch: pytest.MonkeyPatch
):
    """Two backups taken in the same millisecond need distinct names.

    With a filename of ``<stem>-<int(time*1000)>.txt``, two destructive ops
    inside one millisecond — trivially reachable, since the files are tiny and
    the ops are serialized by ``_io_lock`` with nothing but a copy in between —
    produce the same name, and ``shutil.copyfile`` happily truncates the first
    backup. A frozen clock forces the collision.
    """
    monkeypatch.setattr(handlers.time, "time", lambda: 1_760_000_000.123456)

    _write(root / "todo.txt", "first state\n")
    first = handlers._backup_file_unconditional(root / "todo.txt", "todo")
    _write(root / "todo.txt", "second state\n")
    second = handlers._backup_file_unconditional(root / "todo.txt", "todo")

    assert first is not None and second is not None
    assert first != second, "same-millisecond backups collided on one name"
    assert _read(first) == "first state\n"
    assert _read(second) == "second state\n"


@pytest.mark.asyncio
async def test_double_clear_in_one_millisecond_keeps_the_content_backup(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """A double-fired clear must not erase its own evidence.

    Two clears in the same millisecond. The second backs up the *empty* file
    the first just wrote; with a colliding name that empty copy replaces the
    only backup holding the user's tasks.
    """
    monkeypatch.setattr(handlers.time, "time", lambda: 1_760_000_000.5)
    _write(root / "todo.txt", "precious task\n")

    assert (await client.post("/api/clear")).status == 200
    assert (await client.post("/api/clear")).status == 200

    assert _read(root / "todo.txt") == ""
    assert any(
        "precious task" in text for text in _backup_texts(root, "todo")
    ), "clear destroyed the content and then overwrote its own backup"


@pytest.mark.asyncio
async def test_clear_refuses_when_the_backup_cannot_be_written(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """No backup, no destruction.

    A ``_backup_file_unconditional`` that swallows the OSError and returns
    None lets clear empty todo.txt on a full disk anyway and answer 200 with
    ``backup: null``. It fails closed instead — the content is the thing worth
    keeping, not the click.
    """
    _write(root / "todo.txt", "precious task\n")

    def _boom(src, dst, *a, **kw):
        raise OSError(errno.ENOSPC, "No space left on device")

    monkeypatch.setattr(shutil, "copyfile", _boom)
    monkeypatch.setattr(shutil, "copyfileobj", _boom)

    res = await client.post("/api/clear")
    assert res.status == 500
    assert _read(root / "todo.txt") == "precious task\n", (
        "clear destroyed content it could not back up"
    )


@pytest.mark.asyncio
async def test_archive_refuses_when_the_backup_cannot_be_written(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """Archive holds the same contract: no backup, no destruction."""
    _write(root / "todo.txt", SAMPLE_TODO)
    before = _read(root / "todo.txt")

    def _boom(src, dst, *a, **kw):
        raise OSError(errno.EROFS, "Read-only file system")

    monkeypatch.setattr(shutil, "copyfile", _boom)
    monkeypatch.setattr(shutil, "copyfileobj", _boom)

    res = await client.post("/api/archive")
    assert res.status == 500
    assert _read(root / "todo.txt") == before


@pytest.mark.asyncio
async def test_move_refuses_when_the_backup_cannot_be_written(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """Move holds the same contract: no backup, no destruction."""
    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    before = _union(root)

    def _boom(src, dst, *a, **kw):
        raise OSError(errno.ENOSPC, "No space left on device")

    monkeypatch.setattr(shutil, "copyfile", _boom)
    monkeypatch.setattr(shutil, "copyfileobj", _boom)

    res = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert res.status == 500
    assert _union(root) == before


@pytest.mark.asyncio
async def test_archive_backs_up_both_families_with_wallclock_mtime(
    client: TestClient, root: Path
):
    """Archive's done-side backup lands in the done family with a fresh mtime.

    Copying the source's mtime onto the backup (as ``shutil.copy2`` does) makes
    the backup of an ancient file eligible for age-based pruning the moment it
    is created."""
    import os
    import time as _t

    _write(root / "todo.txt", SAMPLE_TODO)
    _write(root / "done.txt", "x 2025-12-31 ancient\n")
    ancient = _t.time() - 90 * 86400
    os.utime(root / "done.txt", (ancient, ancient))
    os.utime(root / "todo.txt", (ancient, ancient))

    assert (await client.post("/api/archive")).status == 200

    todo_backups = list((root / "backup").glob("todo-*.txt"))
    done_backups = list((root / "backup").glob("done-*.txt"))
    assert todo_backups, "archive took no todo-family backup"
    assert done_backups, "archive took no done-family backup"
    for p in todo_backups + done_backups:
        assert p.stat().st_mtime > ancient + 86400, (
            f"{p.name} inherited the source mtime — prunable on creation"
        )
    assert any("ancient" in _read(p) for p in done_backups)
    assert any("bravo done earlier" in _read(p) for p in todo_backups)


@pytest.mark.asyncio
async def test_clear_touches_only_todo_and_leaves_backups_alone(
    client: TestClient, root: Path
):
    """Clear must not touch done.txt or report.txt, or prune the backup/ and
    ai-snapshots/ directories."""
    _write(root / "todo.txt", "alpha\n")
    _write(root / "done.txt", "x 2026-01-01 bravo\n")
    _write(root / "report.txt", "2026-01-01T00:00:00Z 1 1\n")
    (root / "backup" / "todo-1.txt").write_text("older\n", encoding="utf-8")
    (root / "ai-snapshots").mkdir(exist_ok=True)
    (root / "ai-snapshots" / "keep.txt").write_text("x\n", encoding="utf-8")

    assert (await client.post("/api/clear")).status == 200

    assert _read(root / "todo.txt") == ""
    assert _read(root / "done.txt") == "x 2026-01-01 bravo\n"
    assert _read(root / "report.txt") == "2026-01-01T00:00:00Z 1 1\n"
    assert (root / "backup" / "todo-1.txt").is_file()
    assert (root / "ai-snapshots" / "keep.txt").is_file()


# ===========================================================================
# The conflict token on destructive commands.
# ===========================================================================


@pytest.mark.asyncio
async def test_archive_rejects_a_stale_base_mtime(
    client: TestClient, root: Path
):
    """Archive destroys lines from a file the caller may not have read.

    PUT /api/content 409s on a stale token, and archive must do the same.
    Otherwise a user looking at a stale view clicks Archive and completed tasks
    they have never seen are moved out from under an external editor's write.
    """
    _write(root / "todo.txt", SAMPLE_TODO)
    stale = (root / "todo.txt").stat().st_mtime - 500.0

    res = await client.post("/api/archive", json={"base_mtime": stale})
    assert res.status == 409, "archive ignored a stale base_mtime"
    body = await res.json()
    assert body["error"] == "conflict"
    assert "content" in body and "mtime" in body
    assert _read(root / "todo.txt") == SAMPLE_TODO


@pytest.mark.asyncio
async def test_clear_rejects_a_stale_base_mtime(client: TestClient, root: Path):
    """The same token check on the most destructive endpoint in the app."""
    _write(root / "todo.txt", "precious task\n")
    stale = (root / "todo.txt").stat().st_mtime - 500.0

    res = await client.post("/api/clear", json={"base_mtime": stale})
    assert res.status == 409, "clear ignored a stale base_mtime"
    assert _read(root / "todo.txt") == "precious task\n"


@pytest.mark.asyncio
async def test_archive_and_clear_accept_a_fresh_base_mtime(
    client: TestClient, root: Path
):
    _write(root / "todo.txt", SAMPLE_TODO)
    fresh = (root / "todo.txt").stat().st_mtime
    res = await client.post("/api/archive", json={"base_mtime": fresh})
    assert res.status == 200

    fresh = (root / "todo.txt").stat().st_mtime
    res = await client.post("/api/clear", json={"base_mtime": fresh})
    assert res.status == 200
    assert _read(root / "todo.txt") == ""


@pytest.mark.asyncio
@pytest.mark.parametrize("bad", ["abc", [], {}, True, float("nan")])
@pytest.mark.parametrize("endpoint", ["/api/archive", "/api/clear"])
async def test_destructive_commands_reject_a_malformed_base_mtime(
    client: TestClient, root: Path, endpoint: str, bad
):
    """A token we cannot parse must not degrade to "no check".

    That is how a NaN token defeats the conflict comparison on PUT: every
    comparison against NaN is false, so the check reports agreement and the
    destructive write proceeds unguarded.
    """
    _write(root / "todo.txt", SAMPLE_TODO)
    res = await client.post(endpoint, json={"base_mtime": bad})
    assert res.status == 400
    assert _read(root / "todo.txt") == SAMPLE_TODO


@pytest.mark.asyncio
async def test_archive_with_no_body_still_works(client: TestClient, root: Path):
    """Back-compat: the UI posts an empty body and no Content-Type."""
    _write(root / "todo.txt", SAMPLE_TODO)
    res = await client.post("/api/archive")
    assert res.status == 200
    res = await client.post("/api/archive", data=b"")
    assert res.status == 200
    res = await client.post("/api/clear", data=b"not json at all")
    assert res.status == 200


@pytest.mark.asyncio
@pytest.mark.parametrize("endpoint", ["/api/archive", "/api/clear"])
async def test_an_oversized_body_is_refused_not_ignored(
    client: TestClient, root: Path, endpoint: str
):
    """An over-cap body must not degrade into "no conflict check".

    The tolerant body parser exists for callers that legitimately send nothing;
    it must not become a way to make the body unreadable and so slip a
    destructive call past the token check.
    """
    _write(root / "todo.txt", SAMPLE_TODO)
    res = await client.post(endpoint, data=b"x" * (2 * 1024 * 1024))
    assert res.status == 413
    assert _read(root / "todo.txt") == SAMPLE_TODO


@pytest.mark.asyncio
async def test_archive_returns_mtimes_for_both_files(
    client: TestClient, root: Path
):
    """Archive hands back a usable token for each file it rewrote.

    Without one the client must re-GET, and a save queued in that window
    resurrects the archived lines.

    The tokens are opt-in: sending ``base_mtime`` is the caller declaring it
    does optimistic concurrency, and that is what earns the next token back.
    The original body (exactly ``archived`` + ``done_total``) is preserved for
    callers that send nothing.
    """
    _write(root / "todo.txt", SAMPLE_TODO)
    token = (root / "todo.txt").stat().st_mtime
    res = await client.post("/api/archive", json={"base_mtime": token})
    body = await res.json()
    assert body["archived"] == 2
    assert body["mtime"] == pytest.approx(
        (root / "todo.txt").stat().st_mtime, abs=0.01
    )
    assert body["done_mtime"] == pytest.approx(
        (root / "done.txt").stat().st_mtime, abs=0.01
    )
    # The returned token must be usable directly as the next conflict base.
    res = await client.put(
        "/api/content", json={"content": "kept\n", "base_mtime": body["mtime"]}
    )
    assert res.status == 200


@pytest.mark.asyncio
async def test_archive_keeps_the_historical_body_without_a_token(
    client: TestClient, root: Path
):
    """The opt-in half of that contract: no token in, no token out, and the
    original body shape exactly."""
    _write(root / "todo.txt", SAMPLE_TODO)
    body = await (await client.post("/api/archive")).json()
    assert body == {"archived": 2, "done_total": 2}


@pytest.mark.asyncio
async def test_archive_returns_mtimes_on_the_nothing_to_do_path(
    client: TestClient, root: Path
):
    _write(root / "todo.txt", "alpha\n")
    token = (root / "todo.txt").stat().st_mtime
    body = await (
        await client.post("/api/archive", json={"base_mtime": token})
    ).json()
    assert body["archived"] == 0
    assert body["mtime"] == pytest.approx(
        (root / "todo.txt").stat().st_mtime, abs=0.01
    )
    assert body["done_mtime"] == 0  # done.txt absent


# ===========================================================================
# Clear's scope.
# ===========================================================================


@pytest.mark.asyncio
async def test_clear_can_target_the_done_file(client: TestClient, root: Path):
    """Clear empties the file named by ``?name=``, not a hardcoded one.

    A destructive handler whose target is fixed while the caller believes it
    acts on the file in front of them empties the wrong file. Nothing in the
    current UI passes a name to clear, which is the only reason an ignored
    ``?name=`` would go unnoticed.
    """
    _write(root / "todo.txt", "alpha\n")
    _write(root / "done.txt", "x 2026-01-01 bravo\n")

    res = await client.post("/api/clear?name=done")
    assert res.status == 200
    body = await res.json()
    assert body.get("name") == "done"
    assert _read(root / "done.txt") == ""
    assert _read(root / "todo.txt") == "alpha\n", (
        "clear?name=done emptied the WRONG file"
    )
    assert any("bravo" in t for t in _backup_texts(root, "done"))


@pytest.mark.asyncio
@pytest.mark.parametrize("name", ["report", "../todo", "settings", ""])
async def test_clear_rejects_names_outside_the_two_editable_files(
    client: TestClient, root: Path, name: str
):
    _write(root / "todo.txt", "alpha\n")
    res = await client.post(f"/api/clear?name={name}")
    assert res.status == 400
    assert _read(root / "todo.txt") == "alpha\n"


@pytest.mark.asyncio
async def test_clear_is_not_undone_by_a_reseed(
    client: TestClient, root: Path, monkeypatch: pytest.MonkeyPatch
):
    """An emptied todo.txt must stay empty across the next request.

    Every handler calls ``ensure_dirs()``. If that re-seeds any 0-byte
    todo.txt, the request after a clear resurrects the starter tasks into the
    file the user just emptied — and the next archive or move then operates on
    invented content.
    """
    monkeypatch.setenv("TODO_TXT_SEED", "1")
    handlers.ensure_dirs()  # first-run seed + .seeded marker
    _write(root / "todo.txt", "my real task\n")

    assert (await client.post("/api/clear")).status == 200
    assert _read(root / "todo.txt") == ""

    # Any subsequent request runs ensure_dirs() again.
    await client.post("/api/report/snapshot")
    assert _read(root / "todo.txt") == "", (
        "clear was undone — ensure_dirs() re-seeded the emptied file"
    )


# ===========================================================================
# Terminator fidelity and move index semantics.
# ===========================================================================


@pytest.mark.asyncio
async def test_move_preserves_a_crlf_terminator(client: TestClient, root: Path):
    """A moved line takes the destination's terminator, not a normalised LF —
    otherwise moving out of a CRLF file leaves a mixed-terminator file."""
    _write(root / "todo.txt", "alpha\r\nbravo\r\n")
    _write(root / "done.txt", "x 2026-01-01 old\r\n")

    res = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert res.status == 200
    done = _read(root / "done.txt")
    assert done == "x 2026-01-01 old\r\nalpha\r\n", (
        f"terminator mangled: {done!r}"
    )
    assert _read(root / "todo.txt") == "bravo\r\n"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "item",
    [0, -1, -999, 99, 10**9, 1.5, True, False, "1", None, [1], {"a": 1}],
)
async def test_move_rejects_hostile_item_values(
    client: TestClient, root: Path, item
):
    """Index validation: 1-based bounds, bool-as-int, float, string, null,
    container."""
    _write(root / "todo.txt", "alpha\nbravo\n")
    before = _union(root)
    res = await client.post(
        "/api/move", json={"item": item, "from": "todo", "to": "done"}
    )
    assert res.status == 400, f"item={item!r} was accepted"
    assert _union(root) == before


@pytest.mark.asyncio
async def test_move_from_an_empty_or_missing_source(
    client: TestClient, root: Path
):
    """Out-of-range on an empty file, and on a file that is absent."""
    res = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert res.status == 400
    _write(root / "todo.txt", "")
    res = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert res.status == 400


@pytest.mark.asyncio
async def test_move_the_last_line_without_a_trailing_newline(
    client: TestClient, root: Path
):
    """An unterminated last line round-trips without merging into a
    neighbour."""
    _write(root / "todo.txt", "alpha\nbravo")
    _write(root / "done.txt", "x 2026-01-01 old")  # also unterminated
    res = await client.post(
        "/api/move", json={"item": 2, "from": "todo", "to": "done"}
    )
    assert res.status == 200
    assert _read(root / "todo.txt") == "alpha\n"
    assert _read(root / "done.txt") == "x 2026-01-01 old\nbravo\n"


@pytest.mark.asyncio
async def test_move_a_blank_line_conserves_the_task_multiset(
    client: TestClient, root: Path
):
    """Moving a blank line is a no-op on the task multiset."""
    _write(root / "todo.txt", "alpha\n\nbravo\n")
    before = _union(root)
    res = await client.post(
        "/api/move", json={"item": 2, "from": "todo", "to": "done"}
    )
    assert res.status == 200
    assert _union(root) == before


@pytest.mark.asyncio
async def test_move_src_equals_dest_is_refused(client: TestClient, root: Path):
    """A self-move would read and write the same file twice, and the second
    write would resurrect the line it just removed."""
    _write(root / "todo.txt", "alpha\nbravo\n")
    for f in ("todo", "done"):
        res = await client.post(
            "/api/move", json={"item": 1, "from": f, "to": f}
        )
        assert res.status == 400
    assert _read(root / "todo.txt") == "alpha\nbravo\n"


@pytest.mark.asyncio
async def test_move_rejects_hostile_payload_content(
    client: TestClient, root: Path
):
    """NUL bytes and a very long line survive a round trip; the post-move byte
    cap still fires."""
    long_line = "z" * 200_000
    _write(root / "todo.txt", f"alpha\x00nul\n{long_line}\n")
    res = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert res.status == 200
    assert "alpha\x00nul" in _read(root / "done.txt")

    # Over-cap destination → 413, and nothing is written.
    _write(root / "done.txt", "y" * (handlers.MAX_CONTENT_BYTES - 10) + "\n")
    before = _union(root)
    res = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert res.status == 413
    assert _union(root) == before


@pytest.mark.asyncio
async def test_archive_conserves_the_multiset_on_hostile_content(
    client: TestClient, root: Path
):
    """CRLF, blank lines, an unterminated last x-line, a fake done marker
    (``x`` with no date) and a NUL all conserve the multiset."""
    _write(
        root / "todo.txt",
        "alpha\r\n"
        "x 2026-01-01 bravo\r\n"
        "\r\n"
        "x not-a-date charlie\r\n"
        "delta\x00nul\r\n"
        "x 2026-01-02 echo",  # unterminated
    )
    before = _union(root)
    res = await client.post("/api/archive")
    assert res.status == 200
    assert (await res.json())["archived"] == 2
    after = _union(root)
    assert after == before, f"multiset changed: {before} -> {after}"
    # The fake marker stays in todo.txt; the real ones leave it.
    assert "x not-a-date charlie" in _read(root / "todo.txt")
    assert "x 2026-01-01 bravo" in _read(root / "done.txt")


# ===========================================================================
# Concurrency — every pair and triple that touches the two task files.
# ===========================================================================


def _assert_conserved(before: collections.Counter, root: Path, label: str):
    after = _union(root)
    missing = before - after
    dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
    assert not missing, f"{label}: lines LOST {sorted(missing)}"
    assert not dupes, f"{label}: lines DUPLICATED {dupes}"


async def _race(trial: int, *coros):
    """Run *coros* concurrently, ROTATING which one is queued first.

    ``_io_lock`` hands the lock to whoever queued first, so a fixed dispatch
    order exercises exactly one interleaving and a race test can be quietly
    vacuous — every trial returns the same result and nothing is really being
    raced. Results come back in the argument order regardless of dispatch
    order.
    """
    n = len(coros)
    order = [(trial + i) % n for i in range(n)]
    results = await asyncio.gather(*(coros[i] for i in order))
    out: list = [None] * n
    for pos, i in enumerate(order):
        out[i] = results[pos]
    return out


@pytest.mark.asyncio
async def test_race_archive_and_move(client: TestClient, root: Path):
    """Archive against move: the multiset is conserved on every interleaving."""
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        await _race(
            trial,
            client.post("/api/archive"),
            client.post(
                "/api/move", json={"item": 3, "from": "todo", "to": "done"}
            ),
        )
        _assert_conserved(before, root, f"archive|move trial {trial}")


@pytest.mark.asyncio
async def test_race_move_both_directions(client: TestClient, root: Path):
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        await _race(
            trial,
            client.post(
                "/api/move", json={"item": 1, "from": "todo", "to": "done"}
            ),
            client.post(
                "/api/move", json={"item": 1, "from": "done", "to": "todo"}
            ),
        )
        _assert_conserved(before, root, f"move|move trial {trial}")


@pytest.mark.asyncio
async def test_race_archive_and_put_content(client: TestClient, root: Path):
    """A queued save must not resurrect archived lines into todo.txt.

    The save carries the token it read, so it either lands first or 409s —
    what must never happen is the same task in both files.
    """
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        token = (root / "todo.txt").stat().st_mtime
        await _race(
            trial,
            client.post("/api/archive"),
            client.put(
                "/api/content",
                json={"content": SAMPLE_TODO, "base_mtime": token},
            ),
        )
        _assert_conserved(before, root, f"archive|put trial {trial}")


@pytest.mark.asyncio
async def test_race_move_and_put_file(client: TestClient, root: Path):
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        token = (root / "done.txt").stat().st_mtime
        await _race(
            trial,
            client.post(
                "/api/move", json={"item": 1, "from": "todo", "to": "done"}
            ),
            client.put(
                "/api/file?name=done",
                json={
                    "content": "x 2025-12-31 ancient\n",
                    "base_mtime": token,
                },
            ),
        )
        _assert_conserved(before, root, f"move|put-file trial {trial}")


@pytest.mark.asyncio
async def test_race_archive_clear_and_move_triple(
    client: TestClient, root: Path
):
    """Triple race. clear destroys by design, so the invariant is weaker but
    still absolute: nothing is DUPLICATED, and anything that left the live
    files is recoverable from backup/."""
    for trial in range(TRIALS):
        for p in (root / "backup").iterdir():
            p.unlink()
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        await _race(
            trial,
            client.post("/api/archive"),
            client.post("/api/clear"),
            client.post(
                "/api/move", json={"item": 1, "from": "todo", "to": "done"}
            ),
        )
        after = _union(root)
        dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
        assert not dupes, f"triple trial {trial}: DUPLICATED {dupes}"
        recoverable = set()
        for text in _backup_texts(root):
            recoverable.update(_lines(text))
        for line in before:
            assert line in after or line in recoverable, (
                f"triple trial {trial}: {line!r} is in no live file and no backup"
            )


@pytest.mark.asyncio
async def test_race_move_and_backup_restore(client: TestClient, root: Path):
    """Restore rewrites a whole file while move is editing both. The restored
    content is a past state, so conservation cannot hold — but a line must
    never end up in BOTH files."""
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        (root / "backup" / f"done-{trial}.txt").write_text(
            "x 2025-12-31 ancient\n", encoding="utf-8"
        )
        await _race(
            trial,
            client.post(
                "/api/move", json={"item": 1, "from": "todo", "to": "done"}
            ),
            client.post(f"/api/backups/done-{trial}.txt/restore"),
        )
        todo = set(_lines(_read(root / "todo.txt")))
        done = set(_lines(_read(root / "done.txt")))
        assert not (todo & done), (
            f"move|restore trial {trial}: duplicated across files "
            f"{sorted(todo & done)}"
        )


@pytest.mark.asyncio
async def test_race_archive_and_report_snapshot(client: TestClient, root: Path):
    """report.txt is append-only; the race must not corrupt a row or the two
    task files."""
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        await _race(
            trial,
            client.post("/api/archive"),
            client.post("/api/report/snapshot"),
        )
        _assert_conserved(before, root, f"archive|report trial {trial}")
    rows = [r for r in _read(root / "report.txt").splitlines() if r.strip()]
    assert len(rows) == TRIALS
    for row in rows:
        parts = row.split()
        assert len(parts) == 3 and parts[1].isdigit() and parts[2].isdigit()


@pytest.mark.asyncio
async def test_clear_on_a_missing_file_is_a_no_op_200(
    client: TestClient, root: Path
):
    """``required=True`` must not turn "nothing to back up" into an error — a
    missing file has nothing to lose."""
    (root / "todo.txt").unlink(missing_ok=True)
    res = await client.post("/api/clear")
    assert res.status == 200
    body = await res.json()
    assert body["backup"] is None
    assert _read(root / "todo.txt") == ""


@pytest.mark.asyncio
async def test_race_clear_and_put_content(client: TestClient, root: Path):
    """Clear's empty write and a concurrent save cannot interleave into a
    half-written file — every observed state is one or the other."""
    for trial in range(TRIALS):
        _write(root / "todo.txt", "alpha\nbravo\n")
        await _race(
            trial,
            client.post("/api/clear"),
            client.put("/api/content", json={"content": "charlie\n"}),
        )
        assert _read(root / "todo.txt") in ("", "charlie\n")


@pytest.mark.asyncio
async def test_race_archive_and_archive(client: TestClient, root: Path):
    """Two archives in flight must not double-append. The second one finds
    nothing to do; it does not re-append what the first moved."""
    for trial in range(TRIALS):
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        results = await _race(
            trial, client.post("/api/archive"), client.post("/api/archive")
        )
        bodies = [await r.json() for r in results]
        assert sorted(b["archived"] for b in bodies) == [0, 2], bodies
        _assert_conserved(before, root, f"archive|archive trial {trial}")


@pytest.mark.asyncio
async def test_race_clear_and_move(client: TestClient, root: Path):
    """clear empties todo.txt while move is taking a line out of it. Nothing
    may be duplicated, and anything that left the live files must be in
    backup/."""
    for trial in range(TRIALS):
        for p in (root / "backup").iterdir():
            p.unlink()
        _write(root / "todo.txt", SAMPLE_TODO)
        _write(root / "done.txt", "x 2025-12-31 ancient\n")
        before = _union(root)
        await _race(
            trial,
            client.post("/api/clear"),
            client.post(
                "/api/move", json={"item": 1, "from": "todo", "to": "done"}
            ),
        )
        after = _union(root)
        dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
        assert not dupes, f"clear|move trial {trial}: DUPLICATED {dupes}"
        recoverable = set()
        for text in _backup_texts(root):
            recoverable.update(_lines(text))
        for line in before:
            assert line in after or line in recoverable, (
                f"clear|move trial {trial}: {line!r} lost — not in a live "
                "file and not in any backup"
            )


@pytest.mark.asyncio
async def test_race_archive_and_staged_ai_edit_apply(
    client: TestClient, root: Path
):
    """Apply writes a whole-file proposal while archive rewrites both files.

    Apply's staleness gate (``current == base``) is what keeps this safe: if
    archive lands first the proposal is stale and must 409 rather than write
    the pre-archive content back over todo.txt and resurrect the archived
    lines into a duplicate.
    """
    app = web.Application()
    app.router.add_post("/api/archive", handlers.api_archive)
    app.router.add_post(
        "/api/ai-edit/{ts}/apply", handlers.api_apply_staged_ai_edit
    )
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    seen: set[int] = set()
    try:
        for trial in range(TRIALS):
            snap_id = f"ai-{1_760_000_000_000 + trial}-abc123"
            snap, _meta, proposed = handlers._snapshot_paths_for(snap_id)
            snap.parent.mkdir(parents=True, exist_ok=True)
            _write(root / "todo.txt", SAMPLE_TODO)
            _write(root / "done.txt", "x 2025-12-31 ancient\n")
            _write(snap, SAMPLE_TODO)  # base == current
            _write(proposed, SAMPLE_TODO + "foxtrot added by AI\n")
            before = _union(root)

            # Alternate dispatch order: whoever is queued first takes the lock
            # first, so a fixed order only ever exercises one interleaving —
            # apply would then 409 on every trial and the race would go
            # untested.
            calls = [
                c.post("/api/archive"),
                c.post(f"/api/ai-edit/{snap_id}/apply"),
            ]
            if trial % 2:
                calls.reverse()
            await asyncio.gather(*calls)

            applied = not proposed.is_file()  # consumed only on success
            seen.add(200 if applied else 409)
            after = _union(root)
            dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
            # foxtrot is new content, not a duplicate — exclude it.
            dupes.pop("foxtrot added by AI", None)
            assert not dupes, (
                f"archive|apply trial {trial}: DUPLICATED {dupes} "
                f"(applied={applied})"
            )
            missing = before - after
            assert not missing, (
                f"archive|apply trial {trial}: LOST {sorted(missing)}"
            )
            proposed.unlink(missing_ok=True)
    finally:
        await c.close()
    assert seen == {200, 409}, (
        f"only one interleaving was exercised: {seen} — the race is untested"
    )


@pytest.mark.asyncio
async def test_race_archive_and_a_root_switch(
    client: TestClient, root: Path, tmp_path: Path, monkeypatch
):
    """``_root_dir()`` is re-read from settings.json on every call, and
    ``_do_archive`` calls it several times — so a root switch landing mid-flight
    could back up in one root and write in another. It cannot: the settings
    write holds ``_io_lock`` for the whole persist + ensure_dirs.

    Asserted across BOTH roots: no line is lost, and no line ends up in two
    files at once.
    """
    monkeypatch.delenv("TODO_TXT_ROOT", raising=False)
    monkeypatch.setattr(handlers, "_default_root_dir", lambda: root)
    other = tmp_path / "other-root"
    other.mkdir()

    app = web.Application()
    app.router.add_post("/api/archive", handlers.api_archive)
    app.router.add_put("/api/settings", handlers.api_put_settings)
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        for trial in range(TRIALS):
            handlers._persist_settings_root(str(root))
            _write(root / "todo.txt", SAMPLE_TODO)
            _write(root / "done.txt", "x 2025-12-31 ancient\n")
            for p in (other / "todo.txt", other / "done.txt"):
                p.unlink(missing_ok=True)
            before = _union(root)

            await _race(
                trial,
                c.post("/api/archive"),
                c.put("/api/settings", json={"root": str(other)}),
            )

            after = _union(root) + _union(other)
            missing = before - after
            dupes = {k: v for k, v in after.items() if v > before.get(k, 0)}
            assert not missing, f"root-switch trial {trial}: LOST {sorted(missing)}"
            assert not dupes, f"root-switch trial {trial}: DUPLICATED {dupes}"
    finally:
        await c.close()
        handlers._persist_settings_root(str(root))
