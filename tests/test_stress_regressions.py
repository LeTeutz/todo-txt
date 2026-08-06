"""Write-path tests: concurrency, encoding fidelity, and input validation.

Each group below pins one invariant of the write handlers, together with the
failure mode it prevents:

  * ``archive`` running concurrently with ``move`` conserves every task line.
    ``api_move`` was once the only write handler that did not take ``_io_lock``,
    so a move could interleave with an archive's read-modify-write and leave
    the same task in both files.                                     (integrity)
  * A lone surrogate in ``content`` is a bad request. It survives
    ``json.loads`` but not ``str.encode``, so it used to escape as a 500 from
    an otherwise well-formed JSON body.                                    (500)
  * ``/api/move`` honours ``base_mtime``. Without it, a stale line number moved
    a different task than the user clicked.                        (integrity)
  * ``/api/move`` enforces the size cap and takes a backup, like every other
    write path. It used to do neither.                             (durability)
  * Reads do not apply universal-newline translation. They once did, so opening
    a CRLF file and saving it rewrote every line ending.             (fidelity)
  * ``/api/move`` tolerates undecodable bytes. Reading with strict UTF-8 made it
    500 on input that every other read path replaces.                      (500)
  * ``item`` must be a real integer. ``item: true`` passes
    ``isinstance(item, int)`` and was accepted as line 1.          (validation)

``base_mtime`` coercion and the NaN conflict-check bypass are covered by
``tests/test_mtime_conflict.py``.
"""

from __future__ import annotations

import asyncio
import importlib.util
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer

_MODULE_PATH = (
    Path(__file__).resolve().parent.parent / "backend" / "todo_txt_handlers.py"
)


def _load_handlers_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_handlers_under_test_findings", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules["todo_txt_handlers_under_test_findings"] = module
    spec.loader.exec_module(module)
    return module


handlers = _load_handlers_module()


@pytest_asyncio.fixture
async def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Full route table against an isolated ``TODO_TXT_ROOT``."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    app = web.Application()
    handlers.register_routes(app)
    server = TestServer(app)
    async with TestClient(server) as cl:
        yield cl


def _bytes(tmp_path: Path, name: str) -> bytes:
    p = tmp_path / name
    return p.read_bytes() if p.is_file() else b""


def _lines(tmp_path: Path, name: str) -> list[str]:
    return [
        ln
        for ln in _bytes(tmp_path, name).decode("utf-8", errors="replace").splitlines()
        if ln.strip()
    ]


# ---------------------------------------------------------------------------
# archive ∥ move must not duplicate or lose lines
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_archive_parallel_move_conserves_every_line(
    client: TestClient, tmp_path: Path
) -> None:
    """No line may be duplicated or lost when moves race archives.

    ``api_archive`` holds ``_io_lock`` but yields the event loop at its
    ``run_in_executor`` hop. While ``api_move`` did its I/O inline and took no
    lock, a queued move ran to completion in that window — between archive's
    read and its write — and the same task ended up in BOTH files.
    """
    seeded: list[str] = []
    for i in range(40):
        if i % 2 == 0:
            seeded.append(f"x 2026-05-01 done-task-{i}")
        else:
            seeded.append(f"active-task-{i}")
    (tmp_path / "todo.txt").write_text("\n".join(seeded) + "\n", encoding="utf-8")

    async def do_archive() -> None:
        await client.post("/api/archive", json={})

    async def do_move(item: int) -> None:
        await client.post(
            "/api/move", json={"item": item, "from": "todo", "to": "done"}
        )

    tasks = [do_archive() for _ in range(4)] + [
        do_move((i % 12) + 1) for i in range(20)
    ]
    await asyncio.gather(*tasks, return_exceptions=False)

    surviving = _lines(tmp_path, "todo.txt") + _lines(tmp_path, "done.txt")
    duplicated = sorted({ln for ln in surviving if surviving.count(ln) > 1})
    assert duplicated == [], f"lines present in both files: {duplicated[:5]}"
    assert sorted(surviving) == sorted(seeded), (
        f"line count changed: {len(surviving)} survived of {len(seeded)}"
    )


# ---------------------------------------------------------------------------
# a lone surrogate is a 400, not a 500
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_lone_surrogate_content_is_rejected_not_500(
    client: TestClient, tmp_path: Path
) -> None:
    """``json.loads`` accepts ``\\ud800``; ``str.encode`` cannot."""
    payload = '{"content": "pre\\ud800post"}'

    resp = await client.put(
        "/api/content", data=payload, headers={"Content-Type": "application/json"}
    )
    assert resp.status == 400
    assert "surrogate" in (await resp.json())["error"]

    resp = await client.put(
        "/api/file?name=done",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    assert resp.status == 400
    assert "surrogate" in (await resp.json())["error"]

    # Nothing was written, so nothing was half-encoded either.
    assert _bytes(tmp_path, "todo.txt") == b""


@pytest.mark.asyncio
async def test_valid_astral_content_still_saves(client: TestClient, tmp_path: Path) -> None:
    """The surrogate guard must not reject a legitimate surrogate PAIR."""
    resp = await client.put("/api/content", json={"content": "emoji 😀 ok\n"})
    assert resp.status == 200
    assert _bytes(tmp_path, "todo.txt").decode("utf-8") == "emoji 😀 ok\n"


# ---------------------------------------------------------------------------
# /api/move honours base_mtime
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_move_with_stale_base_mtime_conflicts(
    client: TestClient, tmp_path: Path
) -> None:
    """A stale view must 409, not move whichever task now sits at that index."""
    todo = tmp_path / "todo.txt"
    todo.write_text("alpha\nbravo\ncharlie\n", encoding="utf-8")

    resp = await client.get("/api/content")
    stale_mtime = (await resp.json())["mtime"]

    # An external edit deletes "alpha": the user's item 2 ("bravo") is now
    # "charlie".
    await asyncio.sleep(0.01)
    todo.write_text("bravo\ncharlie\n", encoding="utf-8")

    resp = await client.post(
        "/api/move",
        json={"item": 2, "from": "todo", "to": "done", "base_mtime": stale_mtime},
    )
    assert resp.status == 409
    body = await resp.json()
    assert body["error"] == "conflict"
    assert body["content"] == "bravo\ncharlie\n"

    # Refused, not partially applied.
    assert todo.read_text(encoding="utf-8") == "bravo\ncharlie\n"
    assert _bytes(tmp_path, "done.txt") == b""


@pytest.mark.asyncio
async def test_move_with_current_base_mtime_succeeds(
    client: TestClient, tmp_path: Path
) -> None:
    (tmp_path / "todo.txt").write_text("alpha\nbravo\n", encoding="utf-8")
    current = (await (await client.get("/api/content")).json())["mtime"]

    resp = await client.post(
        "/api/move",
        json={"item": 1, "from": "todo", "to": "done", "base_mtime": current},
    )
    assert resp.status == 200
    body = await resp.json()
    assert body["line"] == "alpha"
    # The response carries fresh tokens so the client need not re-GET.
    assert body["mtime"] != current


# ---------------------------------------------------------------------------
# /api/move is capped and backs both files up
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_move_enforces_the_size_cap(client: TestClient, tmp_path: Path) -> None:
    """A file the PUT endpoint refuses at 1 MB must not be rewritable via move."""
    big = ("x" * 999 + "\n") * 1200  # ~1.2 MB
    (tmp_path / "todo.txt").write_text(big, encoding="utf-8")
    before = _bytes(tmp_path, "todo.txt")

    resp = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert resp.status == 413
    body = await resp.json()
    assert body["limit"] == handlers.MAX_CONTENT_BYTES
    assert body["file"] == "todo"
    assert _bytes(tmp_path, "todo.txt") == before


@pytest.mark.asyncio
async def test_move_backs_up_both_files(client: TestClient, tmp_path: Path) -> None:
    (tmp_path / "todo.txt").write_text("alpha\nbravo\n", encoding="utf-8")
    (tmp_path / "done.txt").write_text("x 2026-05-01 old\n", encoding="utf-8")

    resp = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert resp.status == 200

    backups = sorted(p.name for p in (tmp_path / "backup").glob("*.txt"))
    assert any(n.startswith("todo-") for n in backups), backups
    assert any(n.startswith("done-") for n in backups), backups


# ---------------------------------------------------------------------------
# line terminators survive an open + save round trip
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_crlf_survives_read_and_save(client: TestClient, tmp_path: Path) -> None:
    """CRLF terminators must survive a read and the save that follows it.

    ``Path.read_text`` translated CRLF to LF, and the next save persisted the
    translation — rewriting every line ending in a file the user only opened.
    """
    (tmp_path / "todo.txt").write_bytes(b"line1\r\nline2\r\n")

    resp = await client.get("/api/content")
    content = (await resp.json())["content"]
    assert content == "line1\r\nline2\r\n"

    resp = await client.put("/api/content", json={"content": content})
    assert resp.status == 200
    assert _bytes(tmp_path, "todo.txt") == b"line1\r\nline2\r\n"


@pytest.mark.asyncio
async def test_crlf_survives_the_file_endpoint_and_archive(
    client: TestClient, tmp_path: Path
) -> None:
    (tmp_path / "todo.txt").write_bytes(
        b"x 2026-05-01 finished\r\nstill active\r\n"
    )

    resp = await client.get("/api/file?name=todo")
    assert (await resp.json())["content"] == (
        "x 2026-05-01 finished\r\nstill active\r\n"
    )

    resp = await client.post("/api/archive", json={})
    assert resp.status == 200
    assert _bytes(tmp_path, "todo.txt") == b"still active\r\n"
    assert _bytes(tmp_path, "done.txt") == b"x 2026-05-01 finished\r\n"


@pytest.mark.asyncio
async def test_crlf_survives_a_move(client: TestClient, tmp_path: Path) -> None:
    (tmp_path / "todo.txt").write_bytes(b"alpha\r\nbravo\r\n")

    resp = await client.post(
        "/api/move", json={"item": 1, "from": "todo", "to": "done"}
    )
    assert resp.status == 200
    assert (await resp.json())["line"] == "alpha"
    assert _bytes(tmp_path, "todo.txt") == b"bravo\r\n"


# ---------------------------------------------------------------------------
# move tolerates undecodable bytes
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_move_degrades_on_invalid_utf8(
    client: TestClient, tmp_path: Path
) -> None:
    """Every other read path replaces bad bytes; move used to 500."""
    (tmp_path / "todo.txt").write_bytes(b"clean line\nbro\xffken line\n")

    resp = await client.post(
        "/api/move", json={"item": 2, "from": "todo", "to": "done"}
    )
    assert resp.status == 200
    assert "\ufffd" in (await resp.json())["line"]
    assert _bytes(tmp_path, "todo.txt") == b"clean line\n"


# ---------------------------------------------------------------------------
# bool is not an item number
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_move_rejects_bool_item(client: TestClient, tmp_path: Path) -> None:
    """``isinstance(True, int)`` is True, so ``item: true`` meant line 1."""
    (tmp_path / "todo.txt").write_text("alpha\nbravo\n", encoding="utf-8")

    for value in (True, False):
        resp = await client.post(
            "/api/move", json={"item": value, "from": "todo", "to": "done"}
        )
        assert resp.status == 400
        assert "integer" in (await resp.json())["error"]

    assert _bytes(tmp_path, "todo.txt") == b"alpha\nbravo\n"
    assert _bytes(tmp_path, "done.txt") == b""
