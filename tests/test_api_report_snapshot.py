"""Tests for todo_txt_handlers.api_report_snapshot — POST /api/report/snapshot.

Verifies:
  - Empty files              → active=0, done=0, single snapshot row written
  - Populated files          → counts non-blank/non-comment lines correctly
  - Multiple snapshots       → appended in order, trailing newline repaired,
                               all rows present and chronologically sorted
"""

from __future__ import annotations

import importlib.util
import re
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
        "todo_txt_handlers_under_test_report_snapshot", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def handlers(tmp_path, monkeypatch):
    """Load handler module with TODO_TXT_ROOT pointed at tmp_path."""
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    mod = _load_handlers_module()
    mod.ensure_dirs()
    return mod


@pytest_asyncio.fixture
async def client(handlers):
    """aiohttp TestClient with the /api/report/snapshot route registered."""
    app = web.Application()
    app.router.add_post(
        "/api/report/snapshot", handlers.api_report_snapshot
    )
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    try:
        yield c
    finally:
        await c.close()


# ISO-8601 UTC timestamp with Z suffix, second precision.
_ISO_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
# Row format: "<ISO> <active> <done>"
_ROW_RE = re.compile(r"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) (\d+) (\d+)$")


# ---------------------------------------------------------------------------
# 1. Empty files — both counts are 0, report.txt gets a single row
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_snapshot_empty_files(client, tmp_path):
    # No todo.txt, no done.txt, no report.txt — all three missing.
    resp = await client.post("/api/report/snapshot")
    assert resp.status == 200
    body = await resp.json()

    assert set(body.keys()) == {"snapshot"}
    m = _ROW_RE.match(body["snapshot"])
    assert m is not None, f"snapshot does not match format: {body['snapshot']!r}"
    ts, active, done = m.group(1), m.group(2), m.group(3)
    assert _ISO_RE.match(ts)
    assert active == "0"
    assert done == "0"

    # report.txt was created and holds exactly one row + trailing newline.
    report = tmp_path / "report.txt"
    content = report.read_text(encoding="utf-8")
    assert content == body["snapshot"] + "\n"
    assert content.count("\n") == 1


# ---------------------------------------------------------------------------
# 2. Populated files — counts ignore blank and comment lines
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_snapshot_populated_files(client, tmp_path):
    # 4 active tasks (1 blank + 1 comment ignored), 2 completed.
    todo = tmp_path / "todo.txt"
    todo.write_text(
        "(A) write spec +todo-txt\n"
        "\n"
        "# this is a comment, not a task\n"
        "buy groceries @errands\n"
        "call mom @phone\n"
        "  # indented comment also ignored\n"
        "finalise report +todo-txt @home\n",
        encoding="utf-8",
    )
    done = tmp_path / "done.txt"
    done.write_text(
        "x 2026-05-06 shipped v0.1\n"
        "\n"
        "x 2026-05-07 wrote tests\n",
        encoding="utf-8",
    )

    resp = await client.post("/api/report/snapshot")
    assert resp.status == 200
    body = await resp.json()

    m = _ROW_RE.match(body["snapshot"])
    assert m is not None
    ts, active, done_count = m.group(1), m.group(2), m.group(3)
    assert _ISO_RE.match(ts)
    # 4 active tasks: write spec, buy groceries, call mom, finalise report
    assert active == "4"
    # 2 done tasks: shipped v0.1, wrote tests
    assert done_count == "2"

    # report.txt holds exactly this one row.
    report = tmp_path / "report.txt"
    assert report.read_text(encoding="utf-8") == body["snapshot"] + "\n"


# ---------------------------------------------------------------------------
# 3. Multiple snapshots — appended in order, existing rows preserved,
#    trailing-newline repair works for reports written without one
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_snapshot_multiple_appended(client, tmp_path):
    # Seed report.txt with a pre-existing row that is MISSING a trailing
    # newline — the handler must repair this before appending so rows
    # never run together.
    report = tmp_path / "report.txt"
    report.write_text(
        "2026-05-01T12:00:00Z 3 7",  # no trailing newline on purpose
        encoding="utf-8",
    )

    # Mutate todo.txt between snapshots so the two new rows differ.
    todo = tmp_path / "todo.txt"
    done = tmp_path / "done.txt"

    todo.write_text(
        "(A) task one\n"
        "task two\n",
        encoding="utf-8",
    )
    done.write_text("x 2026-05-06 earlier task\n", encoding="utf-8")

    resp1 = await client.post("/api/report/snapshot")
    assert resp1.status == 200
    body1 = await resp1.json()
    m1 = _ROW_RE.match(body1["snapshot"])
    assert m1 is not None
    assert m1.group(2) == "2"  # active
    assert m1.group(3) == "1"  # done

    # Change the files, then snapshot again.
    todo.write_text(
        "(A) task one\n"
        "task two\n"
        "task three\n"
        "task four\n",
        encoding="utf-8",
    )
    done.write_text(
        "x 2026-05-06 earlier task\n"
        "x 2026-05-07 another one\n"
        "x 2026-05-07 third done\n",
        encoding="utf-8",
    )

    resp2 = await client.post("/api/report/snapshot")
    assert resp2.status == 200
    body2 = await resp2.json()
    m2 = _ROW_RE.match(body2["snapshot"])
    assert m2 is not None
    assert m2.group(2) == "4"  # active
    assert m2.group(3) == "3"  # done

    # Final report.txt has 3 rows: the pre-existing one + the two new ones,
    # each on its own line with a trailing newline on the whole file.
    final = report.read_text(encoding="utf-8")
    assert final.endswith("\n")
    lines = final.rstrip("\n").split("\n")
    assert len(lines) == 3
    assert lines[0] == "2026-05-01T12:00:00Z 3 7"
    assert lines[1] == body1["snapshot"]
    assert lines[2] == body2["snapshot"]

    # Every row (old and new) matches the ISO + active + done format,
    # and timestamps are lexicographically non-decreasing (chronological).
    prev_ts = ""
    for line in lines:
        m = _ROW_RE.match(line)
        assert m is not None, f"row does not match format: {line!r}"
        assert m.group(1) >= prev_ts
        prev_ts = m.group(1)
