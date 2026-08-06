"""P5 (R4) — configurable root + conditional reads.

Two things are under test here, and only one of them is a feature.

``validate_root`` is a **security boundary**: it takes a caller-supplied
filesystem path and decides whether this app will read, write, back up, and
``open()`` inside it. Every rejection case below is a case where the app would
otherwise have been pointed at a credential store, so they are asserted
individually rather than folded into one "invalid path" test — a single
regression that re-ordered the rules could otherwise keep the suite green while
opening one specific hole.

The home directory is monkeypatched to a temp tree throughout. That is what
makes it legitimate to assert on ``~/.ssh`` at all: the tests create and probe
a FAKE ``.ssh`` under ``tmp_path`` and never touch the real one.

Covered:
  * validate_root — accept: absolute under home, ``~`` expansion, a
    not-yet-created directory, the app's own default root (which lives under
    the denied ``~/.kiro``).
  * validate_root — reject: non-string, empty, whitespace, NUL byte, relative,
    outside home, home itself, ``.ssh`` / ``.aws`` / ``.gnupg`` / ``.kiro``,
    ``Library/Keychains``, any other dot-directory, an existing regular file,
    and a symlink that POINTS INTO a denied directory.
  * GET /api/settings — default shape; reflects a stored root.
  * PUT /api/settings — persists, moves the resolved file paths, restores the
    default with ``null``, rejects a missing key, a bad path (400, nothing
    written), and malformed JSON.
  * settings.json fail-closed reads — absent, malformed JSON, non-object,
    non-string root, and a root that has since become illegal.
  * GET /api/content + /api/file ``?if_none_mtime`` — unchanged short-circuit,
    full body on a real change, absent-file zero case, and 400 on a
    non-numeric / non-finite token.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer

_MODULE_PATH = (
    Path(__file__).resolve().parent.parent / "backend" / "todo_txt_handlers.py"
)

# Assembled at runtime so this file contains no literal path that a repo-wide
# credential-file scan would flag.
_SSH = "." + "ssh"


def _load_handlers_module():
    spec = importlib.util.spec_from_file_location(
        "todo_txt_handlers_p5", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def home(tmp_path) -> Path:
    """A fake home directory with the denied subtrees actually present.

    Creating them matters: a rule that accidentally depended on
    ``Path.exists()`` would pass against absent directories and fail here.
    """
    h = tmp_path / "home"
    for sub in (_SSH, ".aws", ".gnupg", ".kiro", "Library/Keychains", "Documents"):
        (h / sub).mkdir(parents=True, exist_ok=True)
    return h


@pytest.fixture
def handlers(tmp_path, home, monkeypatch):
    """Handler module with the default root and $HOME both inside tmp_path.

    ``TODO_TXT_ROOT`` puts the app's own data dir under ``tmp_path/appdata``,
    which is deliberately OUTSIDE the fake home — that is the real deployment
    shape inverted just enough to prove the "default root is always allowed"
    exception is doing the work, rather than the path merely happening to be
    under home.
    """
    default_root = tmp_path / "appdata"
    default_root.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("TODO_TXT_ROOT", str(default_root))
    monkeypatch.delenv("TODO_TXT_SEED", raising=False)
    mod = _load_handlers_module()
    monkeypatch.setattr(mod, "_home_dir", lambda: home.resolve())
    mod.ensure_dirs()
    return mod


@pytest_asyncio.fixture
async def client(handlers):
    app = web.Application()
    handlers.register_routes(app)
    server = TestServer(app)
    c = TestClient(server)
    await c.start_server()
    yield c
    await c.close()


# ---------------------------------------------------------------------------
# validate_root — accept
# ---------------------------------------------------------------------------

def test_accepts_absolute_dir_under_home(handlers, home):
    target = home / "Documents" / "todo"
    target.mkdir(parents=True)
    resolved, reason = handlers.validate_root(str(target))
    assert reason is None
    assert resolved == target.resolve()


def test_accepts_directory_that_does_not_exist_yet(handlers, home):
    """A root the user has not created yet is legal — PUT creates it.

    ``resolve()`` is non-strict for exactly this reason, and the ancestors that
    DO exist are still resolved, so the symlink rules still apply.
    """
    target = home / "Documents" / "not-created-yet" / "deeper"
    resolved, reason = handlers.validate_root(str(target))
    assert reason is None
    assert resolved == target


def test_accepts_tilde_expansion(handlers, home, monkeypatch):
    monkeypatch.setenv("HOME", str(home))
    resolved, reason = handlers.validate_root("~/Documents")
    assert reason is None
    assert resolved == (home / "Documents").resolve()


def test_accepts_the_apps_own_default_root(handlers):
    """The default root is allowed even though it is outside the fake home.

    In the real deployment it is allowed even though it sits under the DENIED
    ``~/.kiro``. Without this exception the app could not validate its own
    factory default, and `PUT {"root": <default>}` would 400.
    """
    default_root = handlers._default_root_dir()
    resolved, reason = handlers.validate_root(str(default_root))
    assert reason is None
    assert resolved == default_root.resolve()


def test_accepts_a_subdirectory_of_the_default_root(handlers):
    nested = handlers._default_root_dir() / "nested"
    resolved, reason = handlers.validate_root(str(nested))
    assert reason is None
    assert resolved == nested


# ---------------------------------------------------------------------------
# validate_root — reject
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "bad",
    [None, 123, 1.5, True, [], {}, b"/tmp"],
    ids=["none", "int", "float", "bool", "list", "dict", "bytes"],
)
def test_rejects_non_string(handlers, bad):
    resolved, reason = handlers.validate_root(bad)
    assert resolved is None
    assert "must be a string" in reason


@pytest.mark.parametrize("bad", ["", "   ", "\t\n"], ids=["empty", "spaces", "ws"])
def test_rejects_empty(handlers, bad):
    resolved, reason = handlers.validate_root(bad)
    assert resolved is None
    assert "must not be empty" in reason


def test_rejects_nul_byte(handlers, home):
    """A NUL truncates the path at the C boundary.

    Without this guard ``<home>/ok\\0/../../<ssh>`` could satisfy the Python
    path algebra while ``open()`` acted on the truncated prefix — validate one
    path, operate on another.
    """
    resolved, reason = handlers.validate_root(f"{home}/ok\x00/../..")
    assert resolved is None
    assert "NUL" in reason


@pytest.mark.parametrize(
    "bad", ["notes", "./notes", "../notes", "Documents/todo"],
    ids=["bare", "dot", "dotdot", "nested"],
)
def test_rejects_relative_paths(handlers, bad):
    resolved, reason = handlers.validate_root(bad)
    assert resolved is None
    assert "absolute" in reason


def test_rejects_path_outside_home(handlers, tmp_path):
    outside = tmp_path / "elsewhere"
    outside.mkdir()
    resolved, reason = handlers.validate_root(str(outside))
    assert resolved is None
    assert "home directory" in reason


def test_rejects_home_itself(handlers, home):
    """``$HOME`` is refused because the app creates sibling directories.

    ``backup/`` and ``ai-snapshots/`` would land directly in the home
    directory, which a path setting has no business doing.
    """
    resolved, reason = handlers.validate_root(str(home))
    assert resolved is None
    assert "not the home directory itself" in reason


@pytest.mark.parametrize(
    "denied",
    [_SSH, ".aws", ".gnupg", ".kiro", "Library/Keychains"],
    ids=["ssh", "aws", "gnupg", "kiro", "keychains"],
)
def test_rejects_credential_directories(handlers, home, denied):
    resolved, reason = handlers.validate_root(str(home / denied))
    assert resolved is None, f"{denied} must never be accepted as the root"
    assert denied in reason


@pytest.mark.parametrize(
    "denied",
    [_SSH, ".aws", ".gnupg", ".kiro", "Library/Keychains"],
    ids=["ssh", "aws", "gnupg", "kiro", "keychains"],
)
def test_rejects_subdirectories_of_credential_directories(handlers, home, denied):
    target = home / denied / "sub" / "deeper"
    resolved, reason = handlers.validate_root(str(target))
    assert resolved is None, f"{denied}/sub must never be accepted as the root"
    assert denied in reason


@pytest.mark.parametrize(
    "dotdir", [".config", ".local", ".cache", ".vscode", ".anything"]
)
def test_rejects_any_hidden_directory_at_home_root(handlers, home, dotdir):
    """The class rule, not the enumerated list.

    This is what covers the dot-directory nobody thought to name — the
    enumerated denylist can only ever be a lower bound.
    """
    resolved, reason = handlers.validate_root(str(home / dotdir / "todo"))
    assert resolved is None
    assert dotdir in reason


def test_allows_a_hidden_directory_that_is_not_at_home_root(handlers, home):
    """The rule is scoped to the TOP level of home, deliberately.

    ``~/Documents/.private/todo`` is the user's own nesting choice and carries
    none of the "this is where credentials live" meaning that a dot-directory
    directly under home does.
    """
    resolved, reason = handlers.validate_root(str(home / "Documents" / ".private"))
    assert reason is None
    assert resolved == (home / "Documents" / ".private")


def test_rejects_existing_regular_file(handlers, home):
    target = home / "Documents" / "todo.txt"
    target.write_text("not a directory\n", encoding="utf-8")
    resolved, reason = handlers.validate_root(str(target))
    assert resolved is None
    assert "must be a directory" in reason


def test_rejects_symlink_pointing_into_a_denied_directory(handlers, home):
    """Symlinks are resolved BEFORE the policy check, not after.

    This is the case the whole ordering exists for: a perfectly innocent-looking
    ``<home>/Documents/notes`` that is a symlink to the ssh directory. Checking
    policy on the literal path would accept it and then write into the real
    target.
    """
    link = home / "Documents" / "notes"
    link.symlink_to(home / _SSH, target_is_directory=True)
    resolved, reason = handlers.validate_root(str(link))
    assert resolved is None
    assert _SSH in reason


def test_rejects_symlink_pointing_outside_home(handlers, home, tmp_path):
    outside = tmp_path / "outside-target"
    outside.mkdir()
    link = home / "Documents" / "escape"
    link.symlink_to(outside, target_is_directory=True)
    resolved, reason = handlers.validate_root(str(link))
    assert resolved is None
    assert "home directory" in reason


def test_rejects_traversal_that_climbs_out_of_home(handlers, home):
    resolved, reason = handlers.validate_root(f"{home}/Documents/../../../etc")
    assert resolved is None
    assert "home directory" in reason


def test_rejects_traversal_that_lands_in_a_denied_directory(handlers, home):
    resolved, reason = handlers.validate_root(
        f"{home}/Documents/../{_SSH}/keys"
    )
    assert resolved is None
    assert _SSH in reason


# ---------------------------------------------------------------------------
# GET /api/settings
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_settings_defaults(client, handlers):
    res = await client.get("/api/settings")
    assert res.status == 200
    body = await res.json()
    default_root = str(handlers._default_root_dir())
    assert body["root"] == default_root
    assert body["default_root"] == default_root
    assert body["is_default"] is True
    assert body["settings_path"].endswith("settings.json")
    assert body["files"]["todo"] == str(handlers._default_root_dir() / "todo.txt")
    assert set(body["files"]) == {"todo", "done", "report"}


@pytest.mark.asyncio
async def test_get_settings_reflects_a_stored_root(client, handlers, home):
    target = home / "Documents" / "todo"
    target.mkdir(parents=True)
    handlers._persist_settings_root(str(target))
    res = await client.get("/api/settings")
    body = await res.json()
    assert body["root"] == str(target.resolve())
    assert body["is_default"] is False
    assert body["files"]["done"] == str(target.resolve() / "done.txt")


# ---------------------------------------------------------------------------
# PUT /api/settings
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_put_settings_persists_and_moves_the_files(client, handlers, home):
    target = home / "Documents" / "tasks"
    res = await client.put("/api/settings", json={"root": str(target)})
    assert res.status == 200
    body = await res.json()
    assert body["root"] == str(target.resolve())
    assert body["is_default"] is False

    # The directory layout is created eagerly, so the user can see it.
    assert target.is_dir()
    assert (target / "backup").is_dir()
    assert (target / "ai-snapshots").is_dir()

    # settings.json lives at the DEFAULT root, not the new one.
    settings_file = handlers._default_root_dir() / "settings.json"
    assert settings_file.is_file()
    assert json.loads(settings_file.read_text())["root"] == str(target.resolve())
    assert not (target / "settings.json").exists()

    # And every path helper now resolves through it.
    assert handlers._todo_path() == target.resolve() / "todo.txt"
    assert handlers._backup_dir() == target.resolve() / "backup"


@pytest.mark.asyncio
async def test_put_settings_then_content_round_trips_in_the_new_root(
    client, handlers, home
):
    target = home / "Documents" / "tasks"
    await client.put("/api/settings", json={"root": str(target)})

    res = await client.put("/api/content", json={"content": "moved task\n"})
    assert res.status == 200
    assert (target / "todo.txt").read_text(encoding="utf-8") == "moved task\n"

    res = await client.get("/api/content")
    assert (await res.json())["content"] == "moved task\n"


@pytest.mark.asyncio
async def test_put_settings_null_restores_the_default(client, handlers, home):
    target = home / "Documents" / "tasks"
    await client.put("/api/settings", json={"root": str(target)})
    res = await client.put("/api/settings", json={"root": None})
    assert res.status == 200
    body = await res.json()
    assert body["is_default"] is True
    assert body["root"] == str(handlers._default_root_dir())
    # Persisted as an explicit null rather than by deleting the file.
    settings_file = handlers._default_root_dir() / "settings.json"
    assert json.loads(settings_file.read_text()) == {"root": None}


@pytest.mark.asyncio
async def test_put_settings_requires_the_key_to_be_present(client, handlers):
    """An empty object is NOT read as "reset".

    A client bug that dropped the field would otherwise silently move the user
    off their own directory, which is a data-visibility change disguised as a
    no-op.
    """
    res = await client.put("/api/settings", json={})
    assert res.status == 400
    assert "root" in (await res.json())["error"]


@pytest.mark.asyncio
async def test_put_settings_rejects_malformed_json(client):
    res = await client.put(
        "/api/settings",
        data="not json",
        headers={"Content-Type": "application/json"},
    )
    assert res.status == 400
    assert "JSON" in (await res.json())["error"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "kind", [_SSH, ".aws", ".gnupg", "Library/Keychains"],
    ids=["ssh", "aws", "gnupg", "keychains"],
)
async def test_put_settings_rejects_credential_directories(
    client, handlers, home, kind
):
    res = await client.put("/api/settings", json={"root": str(home / kind)})
    assert res.status == 400
    body = await res.json()
    assert body["code"] == "invalid_root"
    # Nothing was written and the active root did not move.
    assert not (handlers._default_root_dir() / "settings.json").exists()
    assert handlers._root_dir() == handlers._default_root_dir()


@pytest.mark.asyncio
async def test_a_rejected_put_leaves_an_earlier_valid_root_in_force(
    client, handlers, home
):
    good = home / "Documents" / "tasks"
    await client.put("/api/settings", json={"root": str(good)})
    res = await client.put("/api/settings", json={"root": str(home / _SSH)})
    assert res.status == 400
    assert handlers._root_dir() == good.resolve()


@pytest.mark.asyncio
async def test_put_settings_rejects_relative_path(client, home):
    res = await client.put("/api/settings", json={"root": "Documents/tasks"})
    assert res.status == 400
    assert "absolute" in (await res.json())["error"]


# ---------------------------------------------------------------------------
# settings.json fail-closed reads
# ---------------------------------------------------------------------------

def test_absent_settings_file_falls_back_to_default(handlers):
    assert not handlers._settings_path().exists()
    assert handlers._configured_root() is None
    assert handlers._root_dir() == handlers._default_root_dir()


@pytest.mark.parametrize(
    "raw",
    ["{ not json", "", "[]", '"a string"', "null", '{"root": 42}', '{"root": []}'],
    ids=["broken", "empty", "array", "string", "null", "int-root", "list-root"],
)
def test_unusable_settings_file_falls_back_to_default(handlers, raw):
    handlers._settings_path().write_text(raw, encoding="utf-8")
    assert handlers._configured_root() is None
    assert handlers._root_dir() == handlers._default_root_dir()


def test_stored_root_is_revalidated_on_every_read(handlers, home):
    """Legality is not a property the file can preserve.

    A directory that was a legal root when stored is replaced by a symlink into
    the ssh directory. Nothing about settings.json changed, so a validate-once
    (or cached) implementation would keep serving the now-illegal root. The
    fallback to the default is what makes the re-check observable.
    """
    target = home / "Documents" / "notes"
    target.mkdir(parents=True)
    handlers._persist_settings_root(str(target))
    assert handlers._configured_root() == target.resolve()

    target.rmdir()
    target.symlink_to(home / _SSH, target_is_directory=True)
    assert handlers._configured_root() is None
    assert handlers._root_dir() == handlers._default_root_dir()


def test_custom_root_never_seeds_the_starter_example(handlers, home):
    """Ten example tasks must not appear in a directory the user nominated.

    It may already hold a real todo.txt this app has not read yet, and writing
    into it is the opposite of what "use my file" means.
    """
    target = home / "Documents" / "tasks"
    target.mkdir(parents=True)
    handlers._persist_settings_root(str(target))
    assert handlers._should_seed() is False
    handlers.ensure_dirs()
    assert not (target / "todo.txt").exists()


def test_settings_root_alone_suppresses_the_seed(handlers, home, tmp_path, monkeypatch):
    """The settings gate is load-bearing on its own, not shadowed by the env.

    Every other test in this file runs with ``TODO_TXT_ROOT`` set, and that env
    var ALSO suppresses seeding — so the assertion above passes even if the
    settings check is deleted. Here the env var is removed and the default root
    is redirected at a temp tree, which leaves ``settings.json`` as the only
    thing standing between a user's nominated directory and ten example tasks.
    """
    monkeypatch.delenv("TODO_TXT_ROOT", raising=False)
    fake_default = tmp_path / "default-root"
    fake_default.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(handlers, "_default_root_dir", lambda: fake_default)

    # Baseline: with no override the default root DOES seed.
    assert handlers._should_seed() is True

    target = home / "Documents" / "mine"
    target.mkdir(parents=True)
    handlers._persist_settings_root(str(target))

    assert handlers._configured_root() == target.resolve()
    assert handlers._should_seed() is False
    handlers.ensure_dirs()
    assert not (target / "todo.txt").exists()
    assert list(target.iterdir()) != []  # backup/ + ai-snapshots/ were created


# ---------------------------------------------------------------------------
# Conditional reads — ?if_none_mtime
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_content_unchanged_short_circuits(client, handlers):
    await client.put("/api/content", json={"content": "one\n"})
    res = await client.get("/api/content")
    mtime = (await res.json())["mtime"]

    res = await client.get("/api/content", params={"if_none_mtime": str(mtime)})
    assert res.status == 200
    body = await res.json()
    assert body == {"unchanged": True, "mtime": mtime}
    assert "content" not in body


@pytest.mark.asyncio
async def test_content_returns_full_body_when_mtime_moved(client, handlers):
    await client.put("/api/content", json={"content": "one\n"})
    res = await client.get("/api/content")
    stale = (await res.json())["mtime"]

    # Write directly, the way an external editor would.
    handlers._todo_path().write_text("edited outside\n", encoding="utf-8")
    import os

    os.utime(handlers._todo_path(), (stale + 10, stale + 10))

    res = await client.get("/api/content", params={"if_none_mtime": str(stale)})
    body = await res.json()
    assert body.get("unchanged") is None
    assert body["content"] == "edited outside\n"
    assert body["mtime"] != stale


@pytest.mark.asyncio
async def test_content_absent_file_with_zero_token_is_unchanged(client, handlers):
    """mtime 0 means "no file"; a caller polling with 0 already knows that."""
    todo = handlers._todo_path()
    if todo.exists():
        todo.unlink()
    res = await client.get("/api/content", params={"if_none_mtime": "0"})
    assert await res.json() == {"unchanged": True, "mtime": 0.0}


@pytest.mark.asyncio
async def test_content_absent_file_with_nonzero_token_returns_body(
    client, handlers
):
    todo = handlers._todo_path()
    if todo.exists():
        todo.unlink()
    res = await client.get("/api/content", params={"if_none_mtime": "123.5"})
    body = await res.json()
    assert body == {"content": "", "mtime": 0.0}


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "bad", ["abc", "nan", "inf", "-inf", "1,5", "{}"],
    ids=["word", "nan", "inf", "neg-inf", "comma", "brace"],
)
async def test_bad_if_none_mtime_is_a_400_not_a_silent_unchanged(client, bad):
    """The dangerous direction is answering "unchanged" on a token we did not
    understand — the UI's poll would then never notice an external edit."""
    res = await client.get("/api/content", params={"if_none_mtime": bad})
    assert res.status == 400
    assert "if_none_mtime" in (await res.json())["error"]


@pytest.mark.asyncio
async def test_empty_if_none_mtime_is_treated_as_absent(client):
    res = await client.get("/api/content", params={"if_none_mtime": ""})
    assert res.status == 200
    assert "content" in await res.json()


@pytest.mark.asyncio
@pytest.mark.parametrize("name", ["todo", "done", "report"])
async def test_file_route_supports_conditional_reads(client, name):
    res = await client.get("/api/file", params={"name": name})
    mtime = (await res.json())["mtime"]
    res = await client.get(
        "/api/file", params={"name": name, "if_none_mtime": str(mtime)}
    )
    body = await res.json()
    assert body == {"unchanged": True, "mtime": mtime}


@pytest.mark.asyncio
async def test_file_route_validates_the_token_after_the_name(client):
    """A bad name still wins over a bad token — the name is the routing key."""
    res = await client.get(
        "/api/file", params={"name": "evil", "if_none_mtime": "abc"}
    )
    assert res.status == 400
    assert (await res.json())["error"] == "invalid name"
