"""todo.txt app API handlers — single plain-text file, atomic writes, backup rotation.

Routes (registered by ``server.py::create_app`` under the request-target the
KiroCrew gateway forwards):
  GET  /api/content   — read the todo file (empty string if missing);
                        ``?if_none_mtime=<float>`` answers ``{unchanged:true}``
  PUT  /api/content   — atomic write with 1MB cap + rotating backups
  GET  /api/backups   — list last 20 backups with sizes/timestamps
  POST /api/ai-edit   — LLM-driven edit with tiered safeguards
  GET  /api/settings  — read the active root + resolved file paths
  PUT  /api/settings  — set the root (``{"root": null}`` restores the default)

The dashboard-side paths are ``/apps/todo-txt/api/...``; the gateway's reverse
proxy strips ``/apps/todo-txt`` and forwards ``/api/...`` to this backend.

The DEFAULT root resolves to ``$TODO_TXT_ROOT``, else the KiroCrew app data
directory (``$KIROCREW_HOME/apps/<app>/data/``, per
``kiro_crew.apps.manager.app_data_dir``), else its literal default
``~/.kiro/crew/apps/todo-txt/data/``. The ACTIVE root is the validated
``root`` in ``<default root>/settings.json`` when one is stored, else the
default — see ``validate_root`` for the fail-closed path policy, which is a
security boundary rather than input tidying.
Subdirectories ``backup/`` and ``ai-snapshots/`` are created on startup.

Tiered AI-edit safeguards:
  Tier 1 (always):     snapshot current file to ai-snapshots/ before any write.
  Tier 2 (additive):   output_lines ≥ input_lines AND output_chars ≥ input_chars
                       AND no full existing line is removed → apply silently.
  Tier 3 (destructive): any line/char reduction or full-line removal →
                       apply if YOLO on, else stage and return proposed+diff.
  Tier 4 (hard limits): empty-while-input-nonempty, >50% line reduction, >1MB,
                       malformed response → reject unconditionally.
"""

from __future__ import annotations

import asyncio
import collections
import difflib
import errno
import json
import logging
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from aiohttp import web

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

TODO_FILENAME = "todo.txt"
DONE_FILENAME = "done.txt"
REPORT_FILENAME = "report.txt"
BACKUP_DIRNAME = "backup"
AI_SNAPSHOTS_DIRNAME = "ai-snapshots"
SETTINGS_FILENAME = "settings.json"

# Locations that must never become the todo.txt root, expressed relative to
# ``$HOME``. The four dot-directories are already covered by the broader
# "no hidden directory at the top of $HOME" rule in ``validate_root`` — they
# are repeated here as defence in depth and as documentation of intent, so a
# future relaxation of the general rule cannot silently open them up.
# ``Library/Keychains`` is the case the general rule CANNOT catch: a
# credential store with no leading dot.
_ROOT_DENY_HOME_RELATIVE: tuple[str, ...] = (
    ".ssh",
    ".aws",
    ".gnupg",
    ".kiro",
    "Library/Keychains",
)

# Allowlist mapping for the three-file GET/PUT API. Keys are the public
# ``name`` query parameter values; values are the on-disk filenames. Only
# these three files are addressable; everything else returns 400.
THREE_FILE_NAMES: dict[str, str] = {
    "todo": TODO_FILENAME,
    "done": DONE_FILENAME,
    "report": REPORT_FILENAME,
}

# The two files a destructive command may target. ``report`` is append-only
# (the snapshot endpoint owns it), so it is addressable for read and list but
# never for clear or move.
EDITABLE_FILE_NAMES: tuple[str, ...] = ("todo", "done")

MAX_CONTENT_BYTES = 1 * 1024 * 1024  # 1 MB hard cap (returns 413 on overflow)
BACKUP_MIN_INTERVAL_SECS = 5 * 60    # 5 minutes between user-save backups
BACKUP_RETENTION_COUNT = 20          # keep newest N backups

# Tolerance for every mtime comparison — the optimistic-concurrency check on
# write and the ``if_none_mtime`` short-circuit on read. Wide enough to absorb
# float round-tripping through JSON, narrow enough that a real edit is never
# mistaken for "unchanged".
MTIME_EPSILON = 0.001

AI_SNAPSHOT_RETENTION_COUNT = 50     # keep newest N AI snapshots
# Per-request LLM budget. The KiroCrew adapter runs the edit through a spawned
# background agent (token exchange + spawn + poll), so the budget covers a full
# agent turn — not a raw model round-trip. Tests monkeypatch `_llm_call` and
# never wait on this.
AI_LLM_TIMEOUT_SECS = 90.0
AI_LLM_TEMPERATURE = 0.1             # low temperature for deterministic edits
AI_MAX_LINE_REDUCTION_PCT = 50       # >50% line reduction → Tier 4 reject

# Serialize all write-side operations so atomic-write + backup rotation cannot
# race with each other or with GET /content reads mid-rename.
_io_lock = asyncio.Lock()


# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

def _default_root_dir() -> Path:
    """Resolve the DEFAULT todo.txt root directory.

    Resolution order:
      1. ``$TODO_TXT_ROOT`` — explicit override (tests, custom setups).
      2. ``$KIROCREW_HOME/apps/<$KIROCREW_APP_NAME>/data`` — the KiroCrew
         app-scoped data directory. Both env vars are injected by the gateway
         when it spawns this backend (``apps/backend.py``), and the layout
         matches ``kiro_crew.apps.manager.app_data_dir``.
      3. ``~/.kiro/crew/apps/todo-txt/data`` — the same location computed
         from its defaults, for a backend started outside the gateway.

    This is where ``settings.json`` always lives, and the fallback whenever a
    stored root override is absent or no longer passes validation. It is
    deliberately independent of the override so a bad stored value can never
    make the app unable to find its own configuration.
    """
    env = os.environ.get("TODO_TXT_ROOT")
    if env:
        return Path(env).expanduser()
    app_name = os.environ.get("KIROCREW_APP_NAME", "todo-txt")
    home = os.environ.get("KIROCREW_HOME")
    if home:
        return Path(home).expanduser() / "apps" / app_name / "data"
    return Path.home() / ".kiro" / "crew" / "apps" / app_name / "data"


def _home_dir() -> Path:
    """The user's home directory with symlinks resolved.

    Isolated in a function for two reasons: the root validator compares
    against it on every call, and the security tests need to point it at a
    temp tree rather than the real ``$HOME`` (monkeypatching this is how a
    denylist case can be exercised without touching the user's actual
    ``~/.ssh``). Deliberately NOT env-overridable — an env var that relocates
    a security boundary would be a way to walk around it.
    """
    try:
        return Path.home().resolve()
    except (OSError, RuntimeError):  # pragma: no cover — resolve() on ~ is safe
        return Path.home()


def _settings_path() -> Path:
    """Where the ``{root}`` override is persisted.

    ALWAYS under the DEFAULT root, never under the configured one: a settings
    file that lived inside the directory it points at could not be read back
    after a bad write, and changing the root would orphan it.
    """
    return _default_root_dir() / SETTINGS_FILENAME


def _is_within(path: Path, ancestor: Path) -> bool:
    """True if *path* is *ancestor* itself or lies underneath it.

    Both arguments must already be resolved — this is pure path algebra and
    performs no filesystem access, so an unresolved symlink in either
    argument would let a denied location masquerade as an allowed one.
    """
    if path == ancestor:
        return True
    try:
        path.relative_to(ancestor)
        return True
    except ValueError:
        return False


def validate_root(raw: Any) -> tuple[Path | None, str | None]:
    """Validate a candidate todo.txt root.

    Returns ``(resolved_path, None)`` when the value is acceptable, or
    ``(None, reason)`` where *reason* is the message to hand back with a 400.

    This is a **security boundary**, not input tidying. The root is a
    caller-supplied path that the app will then read, write, back up, and hand
    to ``open()``, so it fails CLOSED: anything not positively recognised as
    allowed is rejected. The rules, in order:

    1. A non-string, empty, or NUL-bearing value is rejected outright (a NUL
       truncates the path at the C boundary, so ``~/ok\\0/../../.ssh`` could
       validate as one path and open as another).
    2. ``~`` is expanded, then the path MUST be absolute. Rejecting relative
       paths here — rather than resolving them — keeps the meaning independent
       of this process's cwd.
    3. **Symlinks are resolved BEFORE any policy check.** Every rule below
       compares the resolved path, so ``~/notes`` symlinked to ``~/.ssh`` is
       judged as ``~/.ssh``. ``resolve()`` is non-strict, so a root that does
       not exist yet still has its existing ancestors resolved.
    4. The app's own data dir (the default root) is allowed unconditionally —
       it is the default, and it lives under ``~/.kiro``, which rule 6 denies.
       This exception is also what keeps a temp-dir ``$TODO_TXT_ROOT`` (tests,
       custom installs) legal when it sits outside ``$HOME``.
    5. Everything else must be a strict descendant of ``$HOME``. ``$HOME``
       itself is refused because the app creates ``backup/`` and
       ``ai-snapshots/`` beside the three files, and scattering those into the
       home directory is not something a path setting should be able to do.
    6. An explicit denylist of credential stores: ``~/.ssh``, ``~/.aws``,
       ``~/.gnupg``, ``~/.kiro`` and ``~/Library/Keychains``. Checked before
       rule 7 so the specific reason is the one reported.
    7. Any dotfile directory at the top of ``$HOME`` is denied. This is the
       broad rule that generalises rule 6 to every future dot-directory nobody
       thought to enumerate — which is the point of stating it as a class.
       ``~/Library/Keychains`` is the case it CANNOT catch: a credential store
       with no leading dot, hence its place on the explicit list.
    8. Existence and type are checked LAST: an existing non-directory is
       rejected (a root pointing at a regular file would create the three files
       as ``<file>/todo.txt``), but only after the location policy has accepted
       the path, so the endpoint cannot be used as an existence oracle for
       arbitrary absolute paths.
    """
    if not isinstance(raw, str):
        return None, "'root' must be a string"
    text = raw.strip()
    if not text:
        return None, "'root' must not be empty"
    if "\x00" in text:
        return None, "'root' must not contain NUL bytes"
    # NUL is not the only character that has no business in a root path. A
    # newline, tab or other C0 control is legal in a POSIX filename, so
    # `set-root ~/notes<newline>rm -rf x` was accepted and CREATED a directory
    # with a control character in its name — impossible to type back, confusing
    # in any listing, and almost always a paste accident rather than intent.
    # Nothing is executed (paths are handled through pathlib, never a shell),
    # so this is robustness rather than injection, but the value is still
    # refused so a mistake surfaces as an error instead of a stray directory.
    control = next((c for c in text if ord(c) < 0x20 or ord(c) == 0x7F), None)
    if control is not None:
        return None, (
            "'root' must not contain control characters "
            f"(found {control!r}) — check for a stray newline in a pasted path"
        )

    candidate = Path(text).expanduser()
    if not candidate.is_absolute():
        return None, "'root' must be an absolute path"

    try:
        resolved = candidate.resolve()
    except (OSError, RuntimeError) as exc:
        # RuntimeError is the symlink-loop case on some platforms.
        return None, f"'root' could not be resolved: {exc}"

    # Rule 4 — the app's own data dir, always allowed, checked first.
    try:
        default_root = _default_root_dir().resolve()
    except (OSError, RuntimeError):  # pragma: no cover — defensive
        default_root = _default_root_dir()

    # ...but NOT the app's own machinery inside it. Rule 4 is deliberately not
    # a blanket subtree exception: a blanket exception would let the root
    # become the very backup/ or ai-snapshots/ directory the app writes into,
    # so live files would sit among their own backups, the backup listing
    # would show a live file's siblings, and each rotation would nest another
    # backup/backup/ level. Denied by name, before the exception applies.
    for reserved in (BACKUP_DIRNAME, AI_SNAPSHOTS_DIRNAME):
        if _is_within(resolved, default_root / reserved):
            return None, (
                f"'root' must not be the app's own {reserved}/ directory"
            )

    if not _is_within(resolved, default_root):
        home = _home_dir()
        if not _is_within(resolved, home):
            return None, "'root' must be inside your home directory"
        if resolved == home:
            return None, (
                "'root' must be a directory inside your home directory, "
                "not the home directory itself"
            )

        # The explicit denylist runs BEFORE the general hidden-directory rule
        # so the specific message wins ("not inside ~/.ssh" is more useful than
        # "not inside a hidden directory") and so the list is live code rather
        # than unreachable-by-ordering documentation.
        for denied in _ROOT_DENY_HOME_RELATIVE:
            if _is_within(resolved, home / denied):
                return None, f"'root' must not be inside ~/{denied}"

        rel_parts = resolved.relative_to(home).parts
        if rel_parts and rel_parts[0].startswith("."):
            return None, (
                f"'root' must not be inside a hidden directory (~/{rel_parts[0]})"
            )

    # Existence and type are checked LAST, after the location policy has
    # already accepted the path. Checking earlier would turn the endpoint into
    # an existence oracle for arbitrary absolute paths: "/etc/shadow" would
    # answer "not a directory" while "/etc/nothing-here" answered "outside your
    # home directory", which is a difference a caller should not be able to
    # observe.
    if resolved.exists() and not resolved.is_dir():
        return None, "'root' must be a directory"

    return resolved, None


def _configured_root() -> Path | None:
    """The validated root override from ``settings.json``, or ``None``.

    Fails CLOSED in every direction: a missing file, an unreadable file,
    malformed JSON, a non-object payload, a non-string ``root``, and a value
    that no longer passes ``validate_root`` all resolve to ``None``, which puts
    the app back on its default root rather than on a path it cannot vouch for.

    Validation runs on every READ, not only on write, because legality is not a
    property the file can preserve: a directory that was a legal root when the
    setting was stored can later be replaced by a symlink into ``~/.ssh``, and
    the file could also have been hand-edited. Re-validating is a few stat
    calls against a file that is always in page cache, which is why there is no
    cache here — a cache would be exactly the window this re-check closes.
    """
    try:
        raw = _settings_path().read_text(encoding="utf-8")
    except OSError:
        return None
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        logger.warning(
            "todo-txt: %s is not valid JSON - falling back to the default root",
            SETTINGS_FILENAME,
        )
        return None
    if not isinstance(data, dict):
        return None
    stored = data.get("root")
    if stored is None:
        return None
    resolved, reason = validate_root(stored)
    if resolved is None:
        logger.warning(
            "todo-txt: stored root rejected (%s) - falling back to the "
            "default root",
            reason,
        )
        return None
    return resolved


def _root_dir() -> Path:
    """The ACTIVE todo.txt root — the stored override, else the default."""
    override = _configured_root()
    if override is not None:
        return override
    return _default_root_dir()


def _todo_path() -> Path:
    return _root_dir() / TODO_FILENAME


def _three_file_path(name: str) -> Path | None:
    """Resolve the on-disk path for a public three-file name.

    Returns ``None`` if ``name`` is not in the allowlist. Never returns paths
    outside ``_root_dir()`` — callers rely on the allowlist for safety.
    """
    filename = THREE_FILE_NAMES.get(name)
    if filename is None:
        return None
    return _root_dir() / filename


def _backup_dir() -> Path:
    return _root_dir() / BACKUP_DIRNAME


def _ai_snapshots_dir() -> Path:
    return _root_dir() / AI_SNAPSHOTS_DIRNAME


# ---------------------------------------------------------------------------
# First-run seed
# ---------------------------------------------------------------------------
# Shown once when todo.txt is missing on startup. Demonstrates the full
# syntax surface so new users see real content instead of a blank file.
def _starter_example(today: date | None = None) -> str:
    """The starter file, dated RELATIVE to the day it is written.

    Every date is derived from the install day rather than hardcoded to a fixed
    one. Hardcoded dates make a brand-new install open on tasks created months
    in the past, with two `due:` dates already overdue and rendered in the
    app's own overdue tint -- and the older the release, the worse it reads.
    Deriving from the install day means the first screen always looks like a
    file someone started today: one task due in a few days, one due later this
    week, one completed yesterday, and a threshold far enough out that
    `threshold hide` has something to hide.

    Kept in sync with ``ui/src/utils/starterExample.ts`` -- change both.
    """
    d = today or date.today()

    def iso(offset: int) -> str:
        return (d + timedelta(days=offset)).isoformat()

    created = iso(0)
    return (
        f"{created} todo.txt \u2014 a plain-text format for tasks\n"
        f"(A) {created} ship the feature +kirocrew @work due:{iso(3)}\n"
        f"(B) {created} write tests for the new command palette +kirocrew @work\n"
        f"(C) {created} clean up garage @home\n"
        # Completed yesterday, created the day before: a done line with both
        # dates, which is what done.txt entries look like.
        f"x {iso(-1)} {iso(-2)} pay the electric bill +home @admin\n"
        f"{created} call the dentist @phone @admin due:{iso(2)}\n"
        f"{created} review quarterly goals +work @planning id:q4review\n"
        # `rec:` needs a due:/t: to anchor to. Without one the engine
        # deliberately invents no deadline, so the next instance is
        # identical to this line and reads as a duplicate. The starter
        # therefore anchors its recurring task.
        f"{created} weekly review +work @meta due:{iso(7)} rec:+1w\n"
        f"{created} renew passport +admin @errands t:{iso(90)} rec:+10y\n"
        f"{created} someday: learn the tin whistle +music h:1\n"
        f"{created} buy +groceries for the week @errands\n"
        f"{created} press Ctrl+K to explore the command palette @hint\n"
    )


def _should_seed() -> bool:
    """Determine whether the starter example should be written.

    Seeding is gated by TWO conditions:
      1. Explicit opt-in via ``TODO_TXT_SEED=1`` env var, OR
      2. The root is the DEFAULT path (the KiroCrew app data dir) AND no
         ``.seeded`` marker exists yet.

    When ``TODO_TXT_ROOT`` is set to a custom directory, or the user has
    pointed the app at their own directory via ``settings.json``, seeding
    NEVER fires unless ``TODO_TXT_SEED=1`` is also set. Writing ten example
    tasks into a directory the user nominated — very possibly one that already
    holds a real todo.txt this app has not read yet — is the opposite of what
    "use my file" means.
    """
    if os.environ.get("TODO_TXT_SEED", "").strip() == "1":
        return True
    # Custom root? Never auto-seed.
    if os.environ.get("TODO_TXT_ROOT"):
        return False
    if _configured_root() is not None:
        return False
    # Default root — seed once (marker gate).
    marker = _root_dir() / ".seeded"
    return not marker.exists()


def ensure_dirs() -> None:
    """Create root + backup/ + ai-snapshots/ directories if missing,
    and seed todo.txt with the starter example on first install.

    Seed fires exactly once per install, gated by ``_should_seed()``.
    When it fires, the ``.seeded`` marker is written so the user can
    intentionally wipe content without a re-seed on next boot.
    """
    try:
        _root_dir().mkdir(parents=True, exist_ok=True)
        _backup_dir().mkdir(parents=True, exist_ok=True)
        _ai_snapshots_dir().mkdir(parents=True, exist_ok=True)
        if _should_seed():
            marker = _root_dir() / ".seeded"
            todo = _todo_path()
            # Seed if todo.txt is absent, or if it is 0 bytes AND this install
            # has never seeded before. A bare "0 bytes" test resurrects the
            # seed: every handler calls ensure_dirs(), so the request after a
            # clear (or after the user selected all and deleted) finds an empty
            # file and writes ten starter tasks back into it — silently undoing
            # the destructive action the user had just confirmed, and giving the
            # next archive/move invented content to operate on. The marker is
            # the "we have already introduced ourselves" signal, so an empty
            # file past that point is the user's deliberate state, not a fresh
            # install.
            marker_exists = marker.exists()
            if not todo.exists():
                needs_seed = True
            else:
                needs_seed = todo.stat().st_size == 0 and not marker_exists
            if needs_seed:
                try:
                    todo.write_text(_starter_example(), encoding="utf-8")
                    logger.info(
                        "todo-txt: seeded todo.txt with starter example"
                    )
                except OSError as seed_err:
                    logger.warning(
                        "todo-txt: seed write failed: %s", seed_err
                    )
            # Write the marker regardless so we never re-seed. This
            # preserves the user's intent when they clear content after
            # their first exploration.
            try:
                marker.write_text("1", encoding="utf-8")
            except OSError:
                pass  # non-fatal — worst case we re-attempt seed next boot
    except OSError as exc:  # pragma: no cover — surfaces as 500 from caller
        logger.exception("todo-txt: failed to create directories: %s", exc)
        raise


# ---------------------------------------------------------------------------
# Backup rotation
# ---------------------------------------------------------------------------

def _list_backups_sorted_newest_first(prefix: str = "todo") -> list[Path]:
    """Return backup files sorted newest-first by mtime.

    Only files matching ``<prefix>-*.txt`` are considered backups. The
    default prefix ``"todo"`` preserves legacy behaviour; pass ``"done"``
    for done-file backups.
    """
    backup_dir = _backup_dir()
    if not backup_dir.is_dir():
        return []
    entries: list[Path] = []
    file_prefix = f"{prefix}-"
    for p in backup_dir.iterdir():
        if not p.is_file():
            continue
        name = p.name
        if not (name.startswith(file_prefix) and name.endswith(".txt")):
            continue
        entries.append(p)
    entries.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return entries


def _rotate_backups_if_due(
    source_path: Path | None = None,
    prefix: str = "todo",
) -> Path | None:
    """If the newest backup for ``prefix`` is >5 min old (or none exists),
    copy ``source_path`` into ``backup/<prefix>-<ts>.txt`` and prune to
    newest N.

    When ``source_path`` is ``None`` the todo file is used (legacy default).
    Backup families are isolated by prefix, so todo and done rotations have
    independent 20-file retention windows.

    Returns the newly-created backup path, or ``None`` if no rotation
    occurred (either too recent, or the source file does not exist).
    """
    if source_path is None:
        source_path = _todo_path()
    if not source_path.is_file():
        return None

    newest = _list_backups_sorted_newest_first(prefix)
    now = time.time()
    if newest:
        newest_mtime = newest[0].stat().st_mtime
        if (now - newest_mtime) < BACKUP_MIN_INTERVAL_SECS:
            return None  # too soon — skip rotation

    # Create backup with integer-ms timestamp for stable lexical sort.
    try:
        # A freshly-created file, NOT shutil.copyfile/copy2 into a precomputed
        # name: copy2 preserves the SOURCE mtime (a synced root's day-old
        # mtime makes a new backup sort as ancient and be pruned by the very
        # next line), and a precomputed name can collide with a backup taken
        # in the same millisecond and truncate it. See _copy_to_new_backup.
        backup_path = _copy_to_new_backup(source_path, prefix)
    except OSError as exc:
        logger.warning("todo-txt: backup copy failed (%s); continuing without backup", exc)
        return None

    # Prune oldest beyond retention, per-prefix.
    _prune_backup_family(prefix)
    return backup_path


# ---------------------------------------------------------------------------
# Backup naming + copy primitives
# ---------------------------------------------------------------------------


class BackupFailed(OSError):
    """A destructive command could not secure a recoverable copy.

    Subclasses ``OSError`` so the existing ``except OSError`` in every handler
    turns it into a 500 — the point is that the destructive write never runs,
    not that a new error shape reaches the client.
    """


def _open_unique_backup(stem: str, ts_ms: int) -> tuple[Path, int]:
    """Claim an unused ``backup/<stem>-<ts_ms>[-n].txt`` and return (path, fd).

    Without a collision check, a name of the form ``<stem>-<ts_ms>.txt`` plus a
    plain ``shutil.copyfile`` lets two destructive ops inside the same
    millisecond produce the same name, and the second TRUNCATES the first. That
    is reachable with no unusual timing at all: the files are small,
    ``_io_lock`` serializes the two ops back to back, and a double-fired clear
    would then replace the only copy of the user's tasks with a copy of the
    empty file the first clear had just written.

    ``O_CREAT | O_EXCL`` makes the claim atomic against a concurrent writer
    (another process on a shared root included) rather than relying on an
    ``exists()`` check that is a race by construction.
    """
    backup_dir = _backup_dir()
    backup_dir.mkdir(parents=True, exist_ok=True)
    for n in range(0, 1000):
        suffix = "" if n == 0 else f"-{n}"
        candidate = backup_dir / f"{stem}-{ts_ms}{suffix}.txt"
        try:
            fd = os.open(
                candidate, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644
            )
        except FileExistsError:
            continue
        return candidate, fd
    raise BackupFailed(
        errno.EEXIST,
        f"no free backup name for {stem}-{ts_ms} after 1000 attempts",
    )


def _copy_to_new_backup(source: Path, stem: str) -> Path:
    """Copy ``source`` into a freshly-claimed backup file and return its path.

    Writing into a file we just created keeps the wall-clock mtime that every
    consumer of backup mtime depends on — sort order, the 5-minute gate,
    retention pruning, the UI column — where ``shutil.copy2`` would carry the
    SOURCE mtime across instead. Claiming the name exclusively adds collision
    safety on top of that. A partially-written backup is unlinked rather than
    left behind looking like a valid recovery point.
    """
    ts_ms = int(time.time() * 1000)
    backup_path, fd = _open_unique_backup(stem, ts_ms)
    try:
        with os.fdopen(fd, "wb") as dst, open(source, "rb") as src:
            shutil.copyfileobj(src, dst)
    except BaseException:
        try:
            backup_path.unlink()
        except OSError:
            pass
        raise
    return backup_path


def _write_new_backup(content: str, stem: str) -> Path:
    """Write ``content`` into a freshly-claimed backup file. Same guarantees as
    ``_copy_to_new_backup`` for callers that already hold the text."""
    ts_ms = int(time.time() * 1000)
    backup_path, fd = _open_unique_backup(stem, ts_ms)
    try:
        with os.fdopen(fd, "wb") as dst:
            dst.write(content.encode("utf-8"))
    except BaseException:
        try:
            backup_path.unlink()
        except OSError:
            pass
        raise
    return backup_path


def _prune_backup_family(stem: str) -> None:
    """Trim a backup family to the newest ``BACKUP_RETENTION_COUNT`` entries."""
    for stale in _list_backups_sorted_newest_first(stem)[
        BACKUP_RETENTION_COUNT:
    ]:
        try:
            stale.unlink()
        except OSError as exc:
            logger.warning("todo-txt: failed to prune backup %s: %s", stale, exc)


# ---------------------------------------------------------------------------
# Atomic write
# ---------------------------------------------------------------------------

def _atomic_write(target: Path, content: str) -> None:
    """Write ``content`` to ``target`` atomically via tmp + fsync + rename.

    The temp file is created in the same directory to guarantee
    ``os.replace`` is atomic (same filesystem).
    """
    target.parent.mkdir(parents=True, exist_ok=True)
    data = content.encode("utf-8")
    tmp_fd, tmp_path = tempfile.mkstemp(
        prefix=".todo-", suffix=".tmp", dir=str(target.parent)
    )
    try:
        with os.fdopen(tmp_fd, "wb") as fh:
            fh.write(data)
            fh.flush()
            try:
                os.fsync(fh.fileno())
            except OSError as exc:
                # On some filesystems (e.g. certain network mounts) fsync may
                # not be supported. Log but do not abort the write.
                if exc.errno not in (errno.EINVAL, errno.ENOTSUP):
                    raise
                logger.debug("todo-txt: fsync unsupported (%s); continuing", exc)
        os.replace(tmp_path, target)
        # Set permissions to 0644 (world-readable, owner-writable) after
        # replace — the temp file inherits restrictive umask defaults.
        try:
            os.chmod(target, 0o644)
        except OSError:
            pass  # non-fatal — some filesystems don't support chmod
        tmp_path = None  # transferred ownership
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


# ---------------------------------------------------------------------------
# Text I/O guards
# ---------------------------------------------------------------------------

def _read_text_preserving(path: Path) -> str:
    """Read ``path`` as UTF-8 text with its line terminators left verbatim.

    ``Path.read_text()`` opens in universal-newline mode, so a CRLF file comes
    back as LF and the next save persists the translation — an editor silently
    rewriting every line ending of a file it was only asked to open. Opening
    with ``newline=""`` disables the translation, which is also what makes the
    ``splitlines(keepends=True)`` round-tripping in ``_do_archive`` and
    ``_do_move`` actually terminator-preserving: the mangling would otherwise
    happen upstream of them, here at the read.

    Undecodable bytes degrade to ``errors="replace"`` rather than raising:
    ``UnicodeDecodeError`` is a ``ValueError``, so at call sites that only guard
    ``OSError`` it would escape as an opaque 500. The byte read needs no
    ``newline=""`` — no translation happens on ``bytes.decode``.
    """
    try:
        with open(path, "r", encoding="utf-8", newline="") as fh:
            return fh.read()
    except UnicodeDecodeError:
        return path.read_bytes().decode("utf-8", errors="replace")


def _dominant_terminator(text: str) -> str:
    """The line terminator ``text`` predominantly uses — ``"\\r\\n"`` or ``"\\n"``.

    Used wherever a line has to be *appended* to an existing file: a repaired
    separator or a re-terminated last line written as LF into a CRLF file
    leaves one mixed-terminator line behind, which is the same class of silent
    rewrite the newline-preserving read exists to prevent. Empty text
    defaults to LF.
    """
    crlf = text.count("\r\n")
    lf = text.count("\n") - crlf
    return "\r\n" if crlf > lf else "\n"


def _measure_content(content: str, field: str = "content") -> tuple[int, web.Response | None]:
    """Return ``(utf8_byte_length, None)``, or ``(length, response)`` to send.

    Folds the two ways a caller-supplied string is rejected into one guard:

    * **Unencodable** — ``"a\\ud800b"`` is a lone surrogate. ``json.loads``
      accepts it happily, so without this guard it reaches
      ``content.encode("utf-8")`` in the cap check and raises
      ``UnicodeEncodeError`` out of a handler that only guards ``OSError`` — a
      reachable 500 from a well-formed request body. Here it is a named 400,
      and rejecting it at this point also stops it before ``_atomic_write``,
      which would otherwise raise the same error mid-write.
    * **Oversized** — the shared 1 MB / 413 ceiling.
    """
    try:
        byte_len = len(content.encode("utf-8"))
    except UnicodeEncodeError:
        return 0, web.json_response(
            {
                "error": f"'{field}' contains unpaired surrogate code points",
                "field": field,
            },
            status=400,
        )
    if byte_len > MAX_CONTENT_BYTES:
        return byte_len, web.json_response(
            {"error": "too large", "limit": MAX_CONTENT_BYTES, "bytes": byte_len},
            status=413,
        )
    return byte_len, None


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

def _coerce_if_none_mtime(
    request: web.Request,
) -> tuple[float | None, web.Response | None]:
    """Validate the optional ``if_none_mtime`` conditional-read token.

    Returns ``(value, None)`` — ``value`` is ``None`` when the caller omitted
    the parameter and the full body should be sent — or ``(None, response)``
    carrying the 400 to return.

    A malformed token is a 400 rather than a silent "send everything" or a
    silent "unchanged". The dangerous direction is answering ``unchanged`` on a
    value we did not understand: the UI's poll would then never notice an
    external edit, which is the single failure this parameter exists to serve.
    Rejecting loudly keeps the poll honest, matching how ``base_mtime`` refuses
    a non-finite token rather than letting NaN defeat the conflict check.
    """
    raw = request.rel_url.query.get("if_none_mtime")
    if raw is None or raw.strip() == "":
        return None, None
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return None, web.json_response(
            {"error": "'if_none_mtime' must be a number"}, status=400
        )
    if not math.isfinite(value):
        return None, web.json_response(
            {"error": "'if_none_mtime' must be a finite number"}, status=400
        )
    return value, None


def _mtime_matches(current: float, token: float | None) -> bool:
    """True when *token* is the mtime the caller already holds."""
    if token is None:
        return False
    return abs(current - token) <= MTIME_EPSILON


async def api_get_content(request: web.Request) -> web.Response:
    """GET /api/content — return {content, mtime}.

    Empty string if the file does not yet exist. ``mtime`` is a float
    seconds-since-epoch, or ``0`` when the file is absent.

    With ``?if_none_mtime=<float>``, a file whose mtime still matches answers
    ``{"unchanged": true, "mtime": <float>}`` and sends no content. This is
    what makes the UI's 5-second external-change poll cheap: the common case is
    "nothing happened", and shipping the whole file back every five seconds to
    discover that is pure waste on a 1 MB budget.
    """
    todo_path = _todo_path()
    if_none, bad_token = _coerce_if_none_mtime(request)
    if bad_token is not None:
        return bad_token
    try:
        ensure_dirs()
        if not todo_path.is_file():
            # An absent file is mtime 0. A caller polling with 0 already knows
            # that, so it is genuinely unchanged.
            if _mtime_matches(0.0, if_none):
                return web.json_response({"unchanged": True, "mtime": 0.0})
            return web.json_response({"content": "", "mtime": 0.0})
        mtime = todo_path.stat().st_mtime
        if _mtime_matches(mtime, if_none):
            return web.json_response({"unchanged": True, "mtime": mtime})
        data = _read_text_preserving(todo_path)
        # Re-stat AFTER the read: statting first would let a write that lands
        # mid-read pair fresh content with a stale mtime, and the client would
        # then treat the next real change as already seen.
        mtime = todo_path.stat().st_mtime
        return web.json_response({"content": data, "mtime": mtime})
    except OSError as exc:
        logger.exception("todo-txt: read failed: %s", exc)
        return web.json_response(
            {"error": f"read failed: {exc}"}, status=500
        )


async def api_get_file(request: web.Request) -> web.Response:
    """GET /api/file?name=<todo|done|report> — three-file read.

    Returns ``{content, path, size, mtime}``. Creates an empty file on disk
    if it is missing so callers always get a stable path + mtime=0 response.

    Accepts the same ``?if_none_mtime=<float>`` conditional read as
    ``/api/content`` — the UI polls this route for the done and report tabs, so
    without it two of the three tabs would keep paying full content transfer
    every five seconds.

    Responses:
      200 ``{"content": str, "path": str, "size": int, "mtime": float}``
      200 ``{"unchanged": true, "mtime": float}``  — if_none_mtime still matches
      400 ``{"error": "invalid name"}``  — missing or non-allowlisted name
      400 ``{"error": "'if_none_mtime' must be a number"}``
      500 ``{"error": "..."}``           — disk I/O failure
    """
    name = request.rel_url.query.get("name")
    path = _three_file_path(name) if name is not None else None
    if path is None:
        return web.json_response(
            {"error": "invalid name", "allowed": sorted(THREE_FILE_NAMES.keys())},
            status=400,
        )

    if_none, bad_token = _coerce_if_none_mtime(request)
    if bad_token is not None:
        return bad_token

    try:
        ensure_dirs()
        # Create an empty file if missing so the response always carries a
        # real path. Use exclusive-create then swallow FileExistsError to
        # avoid clobbering concurrent writes.
        if not path.exists():
            try:
                with open(path, "x", encoding="utf-8"):
                    pass
            except FileExistsError:
                pass

        current_mtime = path.stat().st_mtime
        if _mtime_matches(current_mtime, if_none):
            return web.json_response({"unchanged": True, "mtime": current_mtime})

        data = _read_text_preserving(path)

        stat = path.stat()
        return web.json_response(
            {
                "content": data,
                "path": str(path),
                "size": stat.st_size,
                "mtime": stat.st_mtime,
            }
        )
    except OSError as exc:
        logger.exception("todo-txt: file read failed: %s", exc)
        return web.json_response(
            {"error": f"read failed: {exc}"}, status=500
        )


def _coerce_base_mtime(
    body: dict,
) -> tuple[float | None, web.Response | None]:
    """Validate the optional ``base_mtime`` optimistic-concurrency token.

    Returns ``(value, None)`` on success — ``value`` is ``None`` when the caller
    omitted the token and no conflict check should run — or ``(None, response)``
    carrying the 400 to return.

    Validating here rather than at the comparison site closes two failure modes
    that a bare ``float(base_mtime)`` in the conflict check cannot:

    * A non-numeric token (``"abc"``, ``""``, ``[]``, ``{}``) raises
      ``ValueError``/``TypeError`` straight out of the handler — the surrounding
      ``try`` only catches ``OSError`` — so a malformed field surfaces as an
      opaque 500 instead of naming the bad input.
    * A NaN token silently *defeats* the check. Every comparison against NaN is
      False, so ``abs(current - nan) > 0.001`` is False, the 409 branch is never
      taken and the stale write lands as last-write-wins — precisely the
      cross-client data loss the conflict check exists to prevent. Rejecting
      non-finite values keeps the guard fail-closed.

    ``bool`` is excluded deliberately: it is an ``int`` subclass, so ``True``
    would otherwise coerce to mtime ``1.0`` and compare as a real timestamp.
    """
    raw = body.get("base_mtime")
    if raw is None:
        return None, None
    if isinstance(raw, bool) or not isinstance(raw, (int, float)):
        return None, web.json_response(
            {"error": "'base_mtime' must be a number"}, status=400
        )
    value = float(raw)
    if not math.isfinite(value):
        return None, web.json_response(
            {"error": "'base_mtime' must be a finite number"}, status=400
        )
    return value, None


async def api_put_content(request: web.Request) -> web.Response:
    """PUT or POST /api/content — atomic write with size cap + backup rotation.

    Accepts both PUT (primary save path) and POST (navigator.sendBeacon
    save-before-unload path: beacons are always POST, so a PUT-only route
    would 405 and drop the last few hundred milliseconds of typing).
    Both methods share this handler; payload shape and behavior are
    identical.

    Body: ``{"content": str}``.
    Responses:
      200 ``{"status": "ok", "mtime": float, "bytes": int, "backup": str|null}``
      400 ``{"error": "..."}``     — malformed JSON or missing content key
      413 ``{"error": "too large"}`` — body exceeds 1 MB cap
      500 ``{"error": "..."}``     — disk I/O failure
    """
    try:
        body = await request.json()
    except (json.JSONDecodeError, ValueError):
        return web.json_response({"error": "invalid JSON body"}, status=400)

    if not isinstance(body, dict) or "content" not in body:
        return web.json_response(
            {"error": "missing 'content' field"}, status=400
        )

    content = body.get("content")
    if not isinstance(content, str):
        return web.json_response(
            {"error": "'content' must be a string"}, status=400
        )

    byte_len, bad_content = _measure_content(content)
    if bad_content is not None:
        return bad_content

    base_mtime, bad_mtime = _coerce_base_mtime(body)
    if bad_mtime is not None:
        return bad_mtime

    async with _io_lock:
        try:
            ensure_dirs()
            # Conflict detection: if caller provides base_mtime, compare to
            # current file mtime. Return 409 if they differ.
            if base_mtime is not None:
                todo_path = _todo_path()
                if todo_path.is_file():
                    current_mtime = todo_path.stat().st_mtime
                    if abs(current_mtime - base_mtime) > MTIME_EPSILON:
                        current_content = _read_text_preserving(todo_path)
                        return web.json_response(
                            {
                                "error": "conflict",
                                "mtime": current_mtime,
                                "content": current_content,
                            },
                            status=409,
                        )
            # Rotate BEFORE the write so the backup captures the last-saved
            # state rather than the one we're about to overwrite with.
            loop = asyncio.get_event_loop()
            backup_path = await loop.run_in_executor(None, _rotate_backups_if_due)
            await loop.run_in_executor(None, _atomic_write, _todo_path(), content)
            mtime = _todo_path().stat().st_mtime
        except OSError as exc:
            logger.exception("todo-txt: write failed: %s", exc)
            return web.json_response(
                {"error": f"write failed: {exc}"}, status=500
            )

    return web.json_response(
        {
            "status": "ok",
            "mtime": mtime,
            "bytes": byte_len,
            "backup": str(backup_path.name) if backup_path else None,
        }
    )


async def api_put_file(request: web.Request) -> web.Response:
    """PUT or POST /api/file?name=<todo|done> — atomic write.

    POST supports navigator.sendBeacon during unload; payload validation and
    conflict handling are identical to the normal PUT path.

    Body: ``{"content": str}``.
    ``report`` is append-only (clients use the snapshot endpoint); a PUT
    against ``name=report`` returns 405.

    Responses:
      200 ``{"status": "ok", "name": str, "path": str, "mtime": float,
            "bytes": int, "backup": str|null}``
      400 ``{"error": "invalid name"|"invalid JSON body"|...}``
      405 ``{"error": "report is append-only"}``
      413 ``{"error": "too large"}``
      500 ``{"error": "..."}``

    Applies the same 1 MB cap, per-file 20-entry backup rotation, and
    atomic temp-file write as ``api_put_content``. Backup families are
    isolated per filename (``todo-<ts>.txt`` vs ``done-<ts>.txt``).
    """
    name = request.rel_url.query.get("name")
    if name is None or name not in THREE_FILE_NAMES:
        return web.json_response(
            {
                "error": "invalid name",
                "allowed": sorted(THREE_FILE_NAMES.keys()),
            },
            status=400,
        )
    if name == "report":
        return web.json_response(
            {"error": "report is append-only"},
            status=405,
        )

    try:
        body = await request.json()
    except (json.JSONDecodeError, ValueError):
        return web.json_response({"error": "invalid JSON body"}, status=400)

    if not isinstance(body, dict) or "content" not in body:
        return web.json_response(
            {"error": "missing 'content' field"}, status=400
        )

    content = body.get("content")
    if not isinstance(content, str):
        return web.json_response(
            {"error": "'content' must be a string"}, status=400
        )

    byte_len, bad_content = _measure_content(content)
    if bad_content is not None:
        return bad_content

    target_path = _three_file_path(name)
    assert target_path is not None  # guarded by allowlist check above

    base_mtime, bad_mtime = _coerce_base_mtime(body)
    if bad_mtime is not None:
        return bad_mtime

    async with _io_lock:
        try:
            ensure_dirs()
            # Conflict detection: if caller provides base_mtime, compare to
            # current file mtime. Return 409 if they differ.
            if base_mtime is not None:
                if target_path.is_file():
                    current_mtime = target_path.stat().st_mtime
                    if abs(current_mtime - base_mtime) > MTIME_EPSILON:
                        current_content = _read_text_preserving(target_path)
                        return web.json_response(
                            {
                                "error": "conflict",
                                "mtime": current_mtime,
                                "content": current_content,
                            },
                            status=409,
                        )
            # Rotate BEFORE the write so the backup captures the last-saved
            # state rather than the one we're about to overwrite with.
            loop = asyncio.get_event_loop()
            backup_path = await loop.run_in_executor(
                None, _rotate_backups_if_due, target_path, name
            )
            await loop.run_in_executor(None, _atomic_write, target_path, content)
            mtime = target_path.stat().st_mtime
        except OSError as exc:
            logger.exception("todo-txt: file write failed: %s", exc)
            return web.json_response(
                {"error": f"write failed: {exc}"}, status=500
            )

    return web.json_response(
        {
            "status": "ok",
            "name": name,
            "path": str(target_path),
            "mtime": mtime,
            "bytes": byte_len,
            "backup": str(backup_path.name) if backup_path else None,
        }
    )


async def api_list_backups(request: web.Request) -> web.Response:
    """GET /api/backups?file=<todo|done> — newest-first list of backups.

    ``file`` selects the backup family (default ``todo``, which is what a
    caller that omits it means). Without the parameter, done.txt backups —
    which archive/move/restore all create — would be invisible: present on
    disk but with no recovery path.

    Returns ``{"file": str, "backups": [{"name", "bytes", "mtime"}, ...]}``
    truncated to the retention count (20).
    """
    family = request.rel_url.query.get("file", "todo")
    if family not in _BACKUP_FAMILIES:
        return web.json_response(
            {
                "error": "invalid file",
                "allowed": list(_BACKUP_FAMILIES),
            },
            status=400,
        )
    try:
        ensure_dirs()
        entries = _list_backups_sorted_newest_first(family)[
            :BACKUP_RETENTION_COUNT
        ]
        payload: list[dict[str, Any]] = []
        for p in entries:
            try:
                st = p.stat()
            except OSError:
                continue
            payload.append(
                {
                    "name": p.name,
                    "bytes": st.st_size,
                    "mtime": st.st_mtime,
                }
            )
        return web.json_response({"file": family, "backups": payload})
    except OSError as exc:
        logger.exception("todo-txt: list backups failed: %s", exc)
        return web.json_response(
            {"error": f"list backups failed: {exc}"}, status=500
        )


# ---------------------------------------------------------------------------
# Backup restore
# ---------------------------------------------------------------------------


_BACKUP_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.txt$")

# The file families a backup can belong to. Derived from the name prefix and
# used to route restores to the RIGHT file: restoring a done-family backup into
# todo.txt would silently replace the live task list with completed-task
# content — the same class of loss the archive write ordering guards against.
_BACKUP_FAMILIES = ("todo", "done")


def _backup_family(name: str) -> str | None:
    """Return the file family (``"todo"`` / ``"done"``) a backup name
    belongs to, or ``None`` for names outside both families (e.g. a stray
    file dropped into backup/). Families are prefix-delimited by ``-`` so
    ``todo-restore-<ts>.txt`` is still the todo family."""
    for family in _BACKUP_FAMILIES:
        if name.startswith(f"{family}-"):
            return family
    return None


def _resolve_backup_path(name: str) -> Path | None:
    """Validate and resolve a backup file name to a Path within the
    backup directory. Returns None if the name fails validation or the
    resolved path escapes the backup root (basic traversal guard)."""
    if not _BACKUP_NAME_RE.match(name):
        return None
    candidate = (_backup_dir() / name).resolve()
    try:
        backup_root = _backup_dir().resolve()
    except OSError:
        return None
    # Reject traversal — resolved path must be inside backup_root.
    try:
        candidate.relative_to(backup_root)
    except ValueError:
        return None
    return candidate


async def api_get_backup(request: web.Request) -> web.Response:
    """GET /api/backups/{name} — preview a backup.

    Returns ``{"name", "content", "bytes", "mtime"}``. 400 on invalid
    name, 404 if the file doesn't exist.
    """
    name = request.match_info.get("name", "")
    path = _resolve_backup_path(name)
    if path is None:
        return web.json_response({"error": "invalid backup name"}, status=400)
    if not path.is_file():
        return web.json_response({"error": "backup not found"}, status=404)
    try:
        loop = asyncio.get_event_loop()
        content = await loop.run_in_executor(
            None, _read_text_preserving, path
        )
        st = path.stat()
        return web.json_response(
            {
                "name": name,
                "content": content,
                "bytes": st.st_size,
                "mtime": st.st_mtime,
            }
        )
    except OSError as exc:
        logger.exception("todo-txt: read backup failed: %s", exc)
        return web.json_response({"error": f"read backup failed: {exc}"}, status=500)


async def api_restore_backup(request: web.Request) -> web.Response:
    """POST /api/backups/{name}/restore — restore a backup.

    The backup's FILE FAMILY (``todo-*`` → todo.txt, ``done-*`` → done.txt)
    decides which file is written — a done backup restores done.txt, never
    todo.txt. Names outside both families are rejected (400) rather than
    guessed at. Before the overwrite we take an unthrottled safety backup of
    the target file IN THE SAME FAMILY, so the restore itself is reversible.
    """
    name = request.match_info.get("name", "")
    path = _resolve_backup_path(name)
    if path is None:
        return web.json_response({"error": "invalid backup name"}, status=400)
    family = _backup_family(name)
    if family is None:
        return web.json_response(
            {
                "error": "backup name outside the todo/done families",
                "allowed_prefixes": [f"{f}-" for f in _BACKUP_FAMILIES],
            },
            status=400,
        )
    if not path.is_file():
        return web.json_response({"error": "backup not found"}, status=404)
    target_path = _root_dir() / THREE_FILE_NAMES[family]
    async with _io_lock:
        try:
            loop = asyncio.get_event_loop()
            # Read the backup content.
            content = await loop.run_in_executor(
                None, _read_text_preserving, path
            )
            # Take a safety backup of the CURRENT target so the restore is
            # reversible — unthrottled, in the same family as the target.
            if target_path.exists():
                current = await loop.run_in_executor(
                    None, _read_text_preserving, target_path
                )
                await loop.run_in_executor(
                    None,
                    _create_backup_now,
                    current,
                    family,
                )
            # Atomically replace the target with the backup content.
            await loop.run_in_executor(
                None, _atomic_write, target_path, content
            )
            mtime = target_path.stat().st_mtime
            return web.json_response(
                {
                    "restored": name,
                    "file": family,
                    "mtime": mtime,
                    "bytes": len(content.encode("utf-8")),
                }
            )
        except OSError as exc:
            logger.exception("todo-txt: restore backup failed: %s", exc)
            return web.json_response(
                {"error": f"restore failed: {exc}"}, status=500
            )


def _create_backup_now(content: str, prefix: str) -> None:
    """Unthrottled backup write. Used by the restore flow to guarantee
    a pre-restore safety copy regardless of the last-backup timestamp.

    Goes through the collision-safe claim helper: a name computed up front as
    ``<prefix>-restore-<ms>.txt`` collides for two restores landing in the same
    millisecond, and the second safety copy would replace the first."""
    ensure_dirs()
    _write_new_backup(content, f"{prefix}-restore")
    # Rotation: keep newest N for the ACTUAL family prefix.
    _prune_backup_family(prefix)


# ---------------------------------------------------------------------------
# AI-edit: LLM adapter, prompt builder, classification, snapshots
# ---------------------------------------------------------------------------

# Module-level LLM call hook. Tests monkeypatch this with a fixture response.
# Production wiring assigns _llm_call to the KiroCrew gateway-backed adapter
# (see backend/llm_adapter.py — token exchange + a silent app-agent spawn).
#
# Contract: called with (prompt: str, *, temperature: float, timeout: float)
# and must return the raw string response. May raise TimeoutError / RuntimeError.
async def _llm_call_default(
    prompt: str, *, temperature: float, timeout: float
) -> str:
    """Default LLM adapter — imports llm_adapter at call time.

    Kept as a thin indirection so tests can monkeypatch ``_llm_call`` without
    pulling in the adapter (or a live gateway) at import time. If the gateway
    is unreachable or the app has no credentials, raises ``RuntimeError``
    which the handler translates to a 503 response.
    """
    # App-local adapter: it calls back into the KiroCrew gateway over
    # authenticated loopback HTTP (X-App-Secret token exchange, then a
    # silent spawn of this app's own restricted agent). Keeping the adapter
    # inside the app keeps it portable — fixing the LLM path never requires
    # a gateway restart or a KiroCrew rebuild.
    try:
        # Absolute-style import: server.py runs as __main__ (not as a
        # package), so `from .llm_adapter import X` fails with
        # "attempted relative import with no known parent package".
        # sys.path is set by server.py to include this backend dir.
        import llm_adapter
        complete = llm_adapter.complete
    except Exception as exc:  # pragma: no cover — exercised via monkeypatch in tests
        raise RuntimeError(
            f"LLM adapter unavailable: {exc}. "
            "Check backend/llm_adapter.py under the installed app "
            "(~/.kiro/crew/apps/todo-txt/)."
        ) from exc
    result = await complete(prompt, temperature=temperature, timeout=timeout)
    if not isinstance(result, str):
        raise RuntimeError(f"LLM returned non-string: {type(result).__name__}")
    return result


# Tests override this module attribute directly.
_llm_call = _llm_call_default


def _build_ai_edit_prompt(content: str, comments: list[dict[str, Any]]) -> str:
    """Build the LLM prompt.

    Structure:
        Line-numbered current file contents, followed by the user's inline
        comments anchored by line number + anchor text, followed by a rules
        block instructing the model to return the FULL updated file and to
        NOT reformat, reorder, or wrap lines.
    """
    numbered_lines: list[str] = []
    # Split preserving the exact text the viewer shows; splitlines() drops the
    # trailing newline which is what we want for a numbered display.
    for idx, line in enumerate(content.splitlines(), start=1):
        numbered_lines.append(f"{idx:>4}  {line}")
    numbered = "\n".join(numbered_lines) if numbered_lines else "(empty file)"

    comment_blocks: list[str] = []
    for i, c in enumerate(comments, start=1):
        line_no = c.get("line")
        anchor = c.get("anchor", "")
        text = c.get("text", "")
        comment_blocks.append(
            f"Comment #{i}:\n"
            f"  line: {line_no}\n"
            f"  anchor: {anchor!r}\n"
            f"  instruction: {text}"
        )
    comments_section = "\n\n".join(comment_blocks) if comment_blocks else "(none)"

    return (
        "You are editing a plain-text todo.txt file.\n"
        "\n"
        "=== CURRENT FILE (line-numbered for reference; line numbers are NOT part of content) ===\n"
        f"{numbered}\n"
        "\n"
        "=== USER COMMENTS (apply each instruction to the anchored line) ===\n"
        f"{comments_section}\n"
        "\n"
        "=== RULES ===\n"
        "1. Return the FULL updated file contents.\n"
        "2. Do NOT reformat, reorder, or wrap lines unless a comment explicitly asks.\n"
        "3. Do NOT add line numbers; return the raw file text only.\n"
        "4. Preserve all lines the user did not ask to change, byte-for-byte.\n"
        "5. Respect the todo.txt format: `(A) ` priority first, then `YYYY-MM-DD`\n"
        "   creation date, then body with `+project` / `@context` / `key:value`.\n"
        "   Complete tasks start with lowercase `x YYYY-MM-DD `.\n"
        "6. Do not wrap the output in markdown fences or commentary.\n"
        "\n"
        "=== OUTPUT (the updated file, nothing else) ===\n"
    )


# Markdown fence detector used to strip defensive ```…``` wrappers.
_FENCE_RE = re.compile(
    r"\A\s*```(?:[a-zA-Z0-9_+-]*)?\s*\n(.*?)\n?```\s*\Z",
    re.DOTALL,
)


def _strip_llm_response(raw: str) -> str:
    """Strip surrounding whitespace and defensive markdown fences from LLM output."""
    if raw is None:
        return ""
    stripped = raw.strip()
    m = _FENCE_RE.match(stripped)
    if m:
        stripped = m.group(1)
    return stripped.strip("\n")


def _classify_edit(old: str, new: str) -> dict[str, Any]:
    """Classify an AI-proposed edit against the current content.

    Returns a dict with keys:
      tier: 2 | 3 | 4
      reason: short string explaining the classification
      reject: bool — True only for Tier 4
      additive: bool — True only for Tier 2
      line_delta: int (new_lines - old_lines)
      char_delta: int (new_chars - old_chars)
      removed_lines: list[str] — non-blank lines in old that no longer appear in new
      diff: unified diff string (current vs proposed)
    """
    old_lines = old.splitlines()
    new_lines = new.splitlines()
    # MULTISET, not set: todo.txt legitimately contains duplicated lines
    # (repeated manual re-adds). With plain set membership, removing one
    # copy of a duplicated line leaves the survivor in the set, so the
    # deletion classifies as "additive" Tier 2 and auto-applies without
    # review. Counting occurrences catches any decrease.
    new_counts = collections.Counter(new_lines)
    old_counts = collections.Counter(old_lines)
    removed_lines = [
        ln
        for ln, cnt in old_counts.items()
        if new_counts[ln] < cnt and ln.strip()
    ]

    line_delta = len(new_lines) - len(old_lines)
    char_delta = len(new) - len(old)

    diff = "\n".join(
        difflib.unified_diff(
            old_lines,
            new_lines,
            fromfile="current",
            tofile="proposed",
            lineterm="",
        )
    )

    # ---- Tier 4: hard limits (always reject) ----
    if old.strip() != "" and new.strip() == "":
        return {
            "tier": 4,
            "reason": "LLM emptied a non-empty file",
            "reject": True,
            "additive": False,
            "line_delta": line_delta,
            "char_delta": char_delta,
            "removed_lines": removed_lines,
            "diff": diff,
        }

    if len(new.encode("utf-8")) > MAX_CONTENT_BYTES:
        return {
            "tier": 4,
            "reason": f"proposed output exceeds {MAX_CONTENT_BYTES} bytes",
            "reject": True,
            "additive": False,
            "line_delta": line_delta,
            "char_delta": char_delta,
            "removed_lines": removed_lines,
            "diff": diff,
        }

    if old_lines:
        reduction_pct = max(0, -line_delta) / len(old_lines) * 100
        if reduction_pct > AI_MAX_LINE_REDUCTION_PCT:
            return {
                "tier": 4,
                "reason": (
                    f"line reduction {reduction_pct:.0f}% exceeds "
                    f"{AI_MAX_LINE_REDUCTION_PCT}% limit"
                ),
                "reject": True,
                "additive": False,
                "line_delta": line_delta,
                "char_delta": char_delta,
                "removed_lines": removed_lines,
                "diff": diff,
            }

    # ---- Tier 2: additive (line count + char count + no full-line removal) ----
    # "no full existing line fully removed": every non-blank old line must
    # keep AT LEAST its old occurrence count in the new content (multiset —
    # see removed_lines above).
    no_line_removed = not removed_lines
    if (
        len(new_lines) >= len(old_lines)
        and len(new) >= len(old)
        and no_line_removed
    ):
        return {
            "tier": 2,
            "reason": "additive edit (no removals, no char shrink)",
            "reject": False,
            "additive": True,
            "line_delta": line_delta,
            "char_delta": char_delta,
            "removed_lines": [],
            "diff": diff,
        }

    # ---- Tier 3: destructive (everything else within hard-limits) ----
    return {
        "tier": 3,
        "reason": "destructive edit (line or char reduction, or full-line removed)",
        "reject": False,
        "additive": False,
        "line_delta": line_delta,
        "char_delta": char_delta,
        "removed_lines": removed_lines,
        "diff": diff,
    }


def _list_ai_snapshots_sorted_newest_first() -> list[Path]:
    """Return ``ai-<ts>-<uniq>.txt`` snapshot files sorted newest-first by mtime."""
    snap_dir = _ai_snapshots_dir()
    if not snap_dir.is_dir():
        return []
    entries: list[Path] = []
    for p in snap_dir.iterdir():
        if not p.is_file():
            continue
        name = p.name
        if not (name.startswith("ai-") and name.endswith(".txt")):
            continue
        # Exclude the proposed-companion file written alongside staged edits.
        if name.endswith(".proposed.txt"):
            continue
        entries.append(p)
    entries.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return entries


def _comment_preview(comments: list[dict[str, Any]]) -> str:
    """First comment text truncated for display in the UI."""
    if not comments:
        return ""
    first = comments[0].get("text", "")
    if len(first) > 80:
        return first[:77] + "..."
    return first


def _write_ai_snapshot(
    current_content: str,
    *,
    comments: list[dict[str, Any]],
    classification: dict[str, Any],
    proposed_content: str | None,
) -> Path:
    """Write an ai-snapshot of the CURRENT file state + sidecar metadata.

    The ``.txt`` file captures the pre-edit content so rollback is always
    possible. The sidecar ``.meta.json`` records triggering comments, delta,
    classification, and (when the edit was staged) the proposed content.

    Returns the snapshot ``.txt`` path.
    """
    snap_dir = _ai_snapshots_dir()
    snap_dir.mkdir(parents=True, exist_ok=True)
    ts_ms = int(time.time() * 1000)
    # uuid suffix prevents collisions when two snapshots land in the same ms.
    uniq = uuid.uuid4().hex[:6]
    snap_name = f"ai-{ts_ms}-{uniq}.txt"
    meta_name = f"ai-{ts_ms}-{uniq}.meta.json"
    snap_path = snap_dir / snap_name
    meta_path = snap_dir / meta_name

    snap_path.parent.mkdir(parents=True, exist_ok=True)
    _atomic_write(snap_path, current_content)
    meta: dict[str, Any] = {
        "ts_ms": ts_ms,
        "snapshot_file": snap_name,
        "comments": comments,
        "line_delta": classification["line_delta"],
        "char_delta": classification["char_delta"],
        "classification": {
            "tier": classification["tier"],
            "reason": classification["reason"],
            "additive": classification["additive"],
            "rejected": classification["reject"],
        },
        "comment_preview": _comment_preview(comments),
        "diff": classification.get("diff", ""),
    }
    if proposed_content is not None:
        meta["proposed_file"] = f"ai-{ts_ms}-{uniq}.proposed.txt"
        _atomic_write(
            snap_dir / meta["proposed_file"], proposed_content
        )
    _atomic_write(meta_path, json.dumps(meta, indent=2))
    return snap_path


def _prune_ai_snapshots() -> None:
    """Delete snapshots beyond ``AI_SNAPSHOT_RETENTION_COUNT``.

    Each snapshot has up to three related files (txt, meta.json, proposed.txt)
    sharing the ``ai-<ts>-<uniq>`` stem — all are deleted together.

    Snapshots that still carry a LIVE ``.proposed.txt`` (staged but not yet
    applied/discarded) are exempt: pruning one would silently delete the
    user's pending review. They rejoin the prune pool the moment apply or
    discard consumes the proposal sidecar.
    """
    snaps = [
        p
        for p in _list_ai_snapshots_sorted_newest_first()
        if not (p.parent / f"{p.stem}.proposed.txt").is_file()
    ]
    for stale in snaps[AI_SNAPSHOT_RETENTION_COUNT:]:
        stem = stale.stem  # e.g. "ai-1234567890-abcdef"
        for suffix in (".txt", ".meta.json", ".proposed.txt"):
            peer = stale.parent / f"{stem}{suffix}"
            if peer.exists():
                try:
                    peer.unlink()
                except OSError as exc:
                    logger.warning(
                        "todo-txt: failed to prune ai-snapshot %s: %s", peer, exc
                    )


def _yolo_on() -> bool:
    """Return True if YOLO mode is enabled for destructive AI edits.

    Controlled by env var ``TODO_TXT_AI_YOLO`` (truthy: 1/true/yes/on).
    Kept env-driven rather than part of the settings endpoint so the handler
    stays self-contained and testable, and so the escape hatch around
    destructive-edit review is something the operator sets deliberately.
    """
    raw = os.environ.get("TODO_TXT_AI_YOLO", "")
    return raw.strip().lower() in {"1", "true", "yes", "on"}


async def api_ai_edit(request: web.Request) -> web.Response:
    """POST /api/ai-edit — apply inline comments via LLM.

    Request body: ``{"comments": InlineComment[]}``
    InlineComment: ``{id, anchor, text, line, column}``

    Response:
      200 applied:   ``{"status":"applied", "tier":2|3, "mtime":float, "bytes":int,
                        "snapshot":str, "line_delta":int, "char_delta":int}``
      200 staged:    ``{"status":"staged", "tier":3, "proposed":str, "diff":str,
                        "snapshot":str, "line_delta":int, "char_delta":int,
                        "reason":str}``
      400 bad body:  ``{"error":"..."}``
      409 tier4:     ``{"status":"rejected", "tier":4, "reason":str,
                        "snapshot":str, "diff":str}``
      503 no-llm:    ``{"error":"LLM unavailable: ..."}``
      504 timeout:   ``{"error":"LLM timed out after 5.0s"}``
      500 io:        ``{"error":"..."}``
    """
    try:
        body = await request.json()
    except (json.JSONDecodeError, ValueError):
        return web.json_response({"error": "invalid JSON body"}, status=400)

    if not isinstance(body, dict):
        return web.json_response({"error": "body must be an object"}, status=400)
    comments = body.get("comments")
    if not isinstance(comments, list) or not comments:
        return web.json_response(
            {"error": "'comments' must be a non-empty list"}, status=400
        )
    for c in comments:
        if not isinstance(c, dict) or "text" not in c:
            return web.json_response(
                {"error": "each comment requires 'text' field"},
                status=400,
            )

    # Read current content under lock, then release for the LLM call.
    async with _io_lock:
        try:
            ensure_dirs()
            todo_path = _todo_path()
            current = (
                _read_text_preserving(todo_path)
                if todo_path.is_file()
                else ""
            )
        except OSError as exc:
            logger.exception("todo-txt: read for ai-edit failed: %s", exc)
            return web.json_response(
                {"error": f"read failed: {exc}"}, status=500
            )

    # LLM call happens OUTSIDE the lock to avoid blocking writes.
    prompt = _build_ai_edit_prompt(current, comments)

    try:
        raw = await asyncio.wait_for(
            _llm_call(
                prompt,
                temperature=AI_LLM_TEMPERATURE,
                timeout=AI_LLM_TIMEOUT_SECS,
            ),
            timeout=AI_LLM_TIMEOUT_SECS,
        )
    except asyncio.TimeoutError:
        return web.json_response(
            {"error": f"LLM timed out after {AI_LLM_TIMEOUT_SECS}s"},
            status=504,
        )
    except RuntimeError as exc:
        return web.json_response(
            {"error": f"LLM unavailable: {exc}"}, status=503
        )
    except Exception as exc:  # noqa: BLE001 — LLM adapters vary
        logger.exception("todo-txt: LLM call failed: %s", exc)
        return web.json_response(
            {"error": f"LLM call failed: {exc}"}, status=502
        )

    proposed = _strip_llm_response(raw)

    # Classification covers Tier 4 (empty-while-input-nonempty, >50% line
    # reduction, >1MB). A truly empty-in / empty-out flow is a harmless no-op.
    classification = _classify_edit(current, proposed)

    # Re-acquire lock for snapshot write + file write; detect concurrent change.
    async with _io_lock:
        # Re-read and detect concurrent modification.
        try:
            todo_path = _todo_path()
            current_now = (
                _read_text_preserving(todo_path)
                if todo_path.is_file()
                else ""
            )
        except OSError as exc:
            logger.exception("todo-txt: re-read for ai-edit failed: %s", exc)
            return web.json_response(
                {"error": f"read failed: {exc}"}, status=500
            )

        if current_now != current:
            return web.json_response(
                {
                    "error": "conflict: file was modified during AI edit",
                    "hint": "retry the edit against the new content",
                },
                status=409,
            )

        # Tier 1: snapshot BEFORE any write, even for rejected edits.
        loop = asyncio.get_event_loop()
        try:
            snap_path = await loop.run_in_executor(
                None,
                lambda: _write_ai_snapshot(
                    current,
                    comments=comments,
                    classification=classification,
                    proposed_content=(
                        proposed
                        if classification["tier"] == 3 and not _yolo_on()
                        else None
                    ),
                ),
            )
            await loop.run_in_executor(None, _prune_ai_snapshots)
        except OSError as exc:
            logger.exception("todo-txt: snapshot failed: %s", exc)
            return web.json_response(
                {"error": f"snapshot failed: {exc}"}, status=500
            )

        snap_name = snap_path.name

        # ---- Tier 4: reject outright ----
        if classification["reject"]:
            return web.json_response(
                {
                    "status": "rejected",
                    "tier": 4,
                    "reason": classification["reason"],
                    "snapshot": snap_name,
                    "diff": classification["diff"],
                    "line_delta": classification["line_delta"],
                    "char_delta": classification["char_delta"],
                },
                status=409,
            )

        # ---- Tier 3 without YOLO: stage (don't write) ----
        if classification["tier"] == 3 and not _yolo_on():
            return web.json_response(
                {
                    "status": "staged",
                    "tier": 3,
                    "proposed": proposed,
                    "diff": classification["diff"],
                    "snapshot": snap_name,
                    "line_delta": classification["line_delta"],
                    "char_delta": classification["char_delta"],
                    "reason": classification["reason"],
                }
            )

        # ---- Tier 2 or Tier 3-YOLO: write ----
        try:
            await loop.run_in_executor(
                None, _atomic_write, _todo_path(), proposed
            )
            mtime = _todo_path().stat().st_mtime
        except OSError as exc:
            logger.exception("todo-txt: ai-edit write failed: %s", exc)
            return web.json_response(
                {"error": f"write failed: {exc}"}, status=500
            )

    return web.json_response(
        {
            "status": "applied",
            "tier": classification["tier"],
            "mtime": mtime,
            "bytes": len(proposed.encode("utf-8")),
            "snapshot": snap_name,
            "line_delta": classification["line_delta"],
            "char_delta": classification["char_delta"],
        }
    )


# ---------------------------------------------------------------------------
# POST /api/clear  and  POST /api/open-external
# ---------------------------------------------------------------------------

async def api_clear(request: web.Request) -> web.Response:
    """POST /api/clear?name=<todo|done> — truncate a task file to empty.

    Clear is the single most destructive endpoint in the app (it empties the
    file), so the current content is backed up UNCONDITIONALLY before the
    write — not via the 5-minute rotation gate. Going through that gate means
    a clear issued within 5 minutes of the last rotation captures NOTHING,
    leaving up to 5 minutes of edits unrecoverable. If that backup cannot be
    written the clear is REFUSED (500): a clear with no recoverable copy is
    just data loss. The ``backup/`` and ``ai-snapshots/`` directories are
    NEVER pruned or touched by this endpoint beyond normal per-family
    retention.

    ``name`` selects the file and defaults to ``todo``, which is what a caller
    that omits it means. The parameter has to exist because the endpoint is
    generic while the UI is not: with a hardcoded target, a clear issued from
    the Done tab empties todo.txt — the file the user is NOT looking at.
    ``report`` is not clearable (append-only).

    Body is optional: ``{"base_mtime": float}`` opts into the same conflict
    check as PUT /api/content, keyed on the target file.

    Responses:
      200 ``{"status": "ok", "name": str, "mtime": float, "bytes": 0,
            "backup": str|null}``
      400 ``{"error": "..."}``  — invalid ``name`` or ``base_mtime``
      409 ``{"error": "conflict", "mtime": float, "content": str}``
      500 ``{"error": "..."}``  — disk I/O failure (nothing was written)
    """
    name = request.rel_url.query.get("name", "todo")
    if name not in EDITABLE_FILE_NAMES:
        return web.json_response(
            {
                "error": "invalid name",
                "allowed": list(EDITABLE_FILE_NAMES),
            },
            status=400,
        )

    body = await _optional_json_object(request)
    base_mtime, bad_mtime = _coerce_base_mtime(body)
    if bad_mtime is not None:
        return bad_mtime

    async with _io_lock:
        try:
            ensure_dirs()
            target = _root_dir() / THREE_FILE_NAMES[name]
            loop = asyncio.get_event_loop()
            if base_mtime is not None and target.is_file():
                current_mtime = target.stat().st_mtime
                if abs(current_mtime - base_mtime) > MTIME_EPSILON:
                    current_content = await loop.run_in_executor(
                        None, _read_text_preserving, target
                    )
                    return web.json_response(
                        {
                            "error": "conflict",
                            "mtime": current_mtime,
                            "content": current_content,
                        },
                        status=409,
                    )
            # Unconditional, REQUIRED backup BEFORE the write — clear must
            # always be recoverable (backup is None only when the file
            # doesn't exist, in which case there is nothing to lose).
            backup_path = await loop.run_in_executor(
                None, _backup_file_unconditional, target, name, True
            )
            await loop.run_in_executor(None, _atomic_write, target, "")
            mtime = target.stat().st_mtime
        except OSError as exc:
            logger.exception("todo-txt: clear failed: %s", exc)
            return web.json_response(
                {"error": f"clear failed: {exc}"}, status=500
            )

    return web.json_response(
        {
            "status": "ok",
            "name": name,
            "mtime": mtime,
            "bytes": 0,
            "backup": str(backup_path.name) if backup_path else None,
        }
    )


# ---------------------------------------------------------------------------
# Archive (POST /api/archive)
# ---------------------------------------------------------------------------

# A completed todo.txt line begins with a lowercase ``x`` followed by a
# single space, a YYYY-MM-DD completion date, and a trailing space before
# the task body. This mirrors the todo.txt format spec.
_DONE_LINE_RE = re.compile(r"^x \d{4}-\d{2}-\d{2} ")


def _backup_file_unconditional(
    source: Path, stem: str, required: bool = False
) -> Path | None:
    """Copy ``source`` into ``backup/<stem>-<ms>.txt`` if it exists.

    Unlike ``_rotate_backups_if_due`` this is NOT gated by the 5-minute
    interval — archive is an explicit destructive user action and both
    todo.txt and done.txt must be captured unconditionally before the
    rewrite. Backup retention pruning fires after copy to keep each family
    capped at 20.

    ``required=True`` makes the backup a PRECONDITION of the destructive
    write: a failure raises ``BackupFailed`` instead of logging a warning and
    returning ``None``. Swallowing it means that on a full or read-only disk
    — exactly when a backup matters — clear/archive/move destroy the content
    anyway and answer 200 with ``backup: null``. The recoverable copy is the
    whole guarantee; without it the operation must not happen.

    Returns ``None`` only when ``source`` does not exist (nothing to lose).
    """
    if not source.is_file():
        return None
    try:
        backup_path = _copy_to_new_backup(source, stem)
    except OSError as exc:
        if required:
            raise BackupFailed(
                exc.errno or errno.EIO,
                f"could not back up {source.name} before overwriting it "
                f"({exc.strerror or exc}); refusing to continue",
            ) from exc
        logger.warning(
            "todo-txt: archive backup of %s failed (%s); continuing without backup",
            source,
            exc,
        )
        return None
    # Prune oldest beyond retention for THIS family.
    _prune_backup_family(stem)
    return backup_path


def _count_nonblank_lines(text: str) -> int:
    """Count lines that are not blank (after stripping trailing whitespace)."""
    return sum(1 for line in text.splitlines() if line.strip())


def _file_mtime(path: Path) -> float:
    """``path``'s mtime, or ``0`` when it does not exist.

    Matches the ``mtime: 0`` convention GET /api/content already uses for an
    absent file, so a client can feed the value straight back as a conflict
    token.
    """
    try:
        return path.stat().st_mtime
    except OSError:
        return 0.0


def _with_tokens(
    payload: dict[str, Any],
    base_mtime: float | None,
    todo_path: Path,
    done_path: Path,
) -> dict[str, Any]:
    """Add post-write ``mtime``/``done_mtime`` to an archive payload — but only
    for a caller that sent a ``base_mtime``.

    Archive rewrites BOTH task files, so a client handed no mtime for either
    has to re-GET to learn its new conflict token. Anything queued in that
    window (the editor's debounced save) still carries the pre-archive token:
    with no token at all it resurrects the archived lines, and with a stale one
    it 409s and forces a conflict dialog the user did not cause.

    The fields are conditional because the documented 200 body is exactly
    ``{"archived", "done_total"}`` and callers assert on that shape. Sending a
    token is the caller declaring it participates in optimistic concurrency, so
    that is the signal used to hand the next one back. A client that wants the
    tokens sends ``base_mtime``; one that does not gets the two-field body.
    """
    if base_mtime is None:
        return payload
    payload["mtime"] = _file_mtime(todo_path)
    payload["done_mtime"] = _file_mtime(done_path)
    return payload


def _do_archive(base_mtime: float | None = None) -> tuple[dict[str, Any], int]:
    """Blocking implementation of archive — runs inside ``_io_lock``.

    Reads todo.txt, partitions each line (keeping the trailing newline) into
    done-matching vs. kept. Backs up both files before write, then rewrites
    done.txt and todo.txt in an order that cannot lose a line.
    Returns ``(payload, status)`` so the caller can hand the tuple straight to
    ``web.json_response`` — the 409 path needs a status of its own.

    Two invariants this function owns:

    * **Conservation.** The multiset of lines across todo.txt + done.txt is
      unchanged by an archive. Not just on the happy path: the write order is
      done.txt FIRST, todo.txt second, with a rollback of done.txt if the
      second write fails. The opposite order (todo.txt first) means a failing
      second write has already deleted the archived lines from todo.txt and
      never appended them to done.txt — they exist in NEITHER file, and the
      500 gives no hint that content is already gone. Ordering alone makes the
      failure mode duplication instead of loss (visible, and the next archive
      is a no-op on it); the rollback removes the duplication too.
    * **Recoverability.** Both files are copied into ``backup/`` BEFORE any
      write, and the copies are ``required`` — if a backup cannot be taken the
      archive does not happen at all.
    """
    ensure_dirs()
    todo_path = _todo_path()
    done_path = _root_dir() / DONE_FILENAME

    todo_content = ""
    if todo_path.is_file():
        todo_content = _read_text_preserving(todo_path)

    # Optimistic concurrency, same contract and same 409 shape as
    # PUT /api/content and POST /api/move. Archive selects lines by CONTENT
    # rather than by index, so a stale view does not archive the wrong task —
    # but it does destructively rewrite both files from a base the caller has
    # never seen, which is the same reason PUT refuses.
    if base_mtime is not None and todo_path.is_file():
        current_mtime = todo_path.stat().st_mtime
        if abs(current_mtime - base_mtime) > MTIME_EPSILON:
            return {
                "error": "conflict",
                "mtime": current_mtime,
                "content": todo_content,
            }, 409

    # splitlines(keepends=True) preserves line terminators so round-tripping
    # keeps trailing newlines intact and does not mangle CRLF on Windows —
    # which holds only because the read above disables newline translation.
    kept_lines: list[str] = []
    done_lines: list[str] = []
    for line in todo_content.splitlines(keepends=True):
        # Strip only the terminator for the regex match so a trailing "\r\n"
        # or "\n" does not interfere.
        stripped = line.rstrip("\r\n")
        if _DONE_LINE_RE.match(stripped):
            done_lines.append(line)
        else:
            kept_lines.append(line)

    archived = len(done_lines)

    # Fast path: nothing to archive — still compute done_total so callers
    # get an accurate post-state count, but skip writes and backups.
    if archived == 0:
        done_existing = ""
        if done_path.is_file():
            done_existing = _read_text_preserving(done_path)
        return _with_tokens(
            {
                "archived": 0,
                "done_total": _count_nonblank_lines(done_existing),
            },
            base_mtime,
            todo_path,
            done_path,
        ), 200

    # Back up BOTH files before any write, so the pre-archive state is
    # recoverable even if the append or rewrite partially fails. required=True
    # — an archive we cannot undo must not run.
    _backup_file_unconditional(todo_path, "todo", required=True)
    _backup_file_unconditional(done_path, "done", required=True)

    new_todo = "".join(kept_lines)

    # Append done lines to done.txt. Read existing content first so we can
    # guarantee there is a newline between the last existing entry and the
    # first new one — some callers may have written done.txt without a
    # trailing newline.
    prior_done: str | None = None
    if done_path.is_file():
        prior_done = _read_text_preserving(done_path)
    done_existing = prior_done or ""
    term = _dominant_terminator(prior_done or todo_content)
    if done_existing and not done_existing.endswith("\n"):
        done_existing += term

    # Ensure each appended done line ends with a newline (splitlines keepends
    # preserves whatever was there, but the last archived line may have had
    # no trailing newline in the source file).
    normalised_done_lines: list[str] = []
    for line in done_lines:
        if not line.endswith("\n"):
            line = line + term
        normalised_done_lines.append(line)

    new_done = done_existing + "".join(normalised_done_lines)

    # WRITE ORDER IS LOAD-BEARING — see the docstring. Grow done.txt first,
    # shrink todo.txt second, and undo the growth if the shrink fails.
    _atomic_write(done_path, new_done)
    try:
        _atomic_write(todo_path, new_todo)
    except OSError:
        try:
            if prior_done is None:
                done_path.unlink()
            else:
                _atomic_write(done_path, prior_done)
        except OSError as undo_exc:  # pragma: no cover — needs two failures
            logger.error(
                "todo-txt: archive rollback of done.txt failed (%s); the "
                "archived lines are now in BOTH files — recover from backup/",
                undo_exc,
            )
        raise

    return _with_tokens(
        {
            "archived": archived,
            "done_total": _count_nonblank_lines(new_done),
        },
        base_mtime,
        todo_path,
        done_path,
    ), 200


async def _optional_json_object(request: web.Request) -> dict:
    """Parse an OPTIONAL JSON object body, tolerating everything else.

    ``archive``, ``clear`` and ``report/snapshot`` documented their body as
    "ignored", and callers exercise that: the palette posts ``{}``, a beacon
    posts nothing at all, and a bare ``POST`` arrives with no Content-Type. So
    an absent, empty, or unparseable body degrades to ``{}`` rather than 400.

    What is NOT tolerated is a well-formed object carrying a bad
    ``base_mtime`` — that is validated strictly by ``_coerce_base_mtime``,
    because a token we cannot parse must never degrade into "no conflict
    check". A NaN token defeats the check outright.
    """
    if not request.can_read_body:
        return {}
    try:
        raw = await request.read()
    except web.HTTPException:
        # Over aiohttp's client_max_size, chiefly. This MUST propagate: turning
        # it into ``{}`` would mean an oversized body silently degraded into
        # "no conflict check", which is the fail-open direction the strict
        # base_mtime validation exists to prevent.
        raise
    except Exception:  # pragma: no cover — client disconnect mid-body
        return {}
    if not raw.strip():
        return {}
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, ValueError, UnicodeDecodeError):
        return {}
    return parsed if isinstance(parsed, dict) else {}


async def api_archive(request: web.Request) -> web.Response:
    """POST /api/archive — move completed tasks to done.txt.

    Reads ``todo.txt``, selects every line matching ``^x YYYY-MM-DD ``
    (the todo.txt completion marker), removes those lines from
    ``todo.txt``, and appends them to ``done.txt``. Both files are backed
    up unconditionally into ``backup/`` before the rewrite so the
    operation is fully recoverable — and if a backup cannot be taken, the
    archive is refused rather than performed unrecoverably.

    Body is optional: ``{"base_mtime": float}`` opts into the same
    optimistic-concurrency check as PUT /api/content, keyed on todo.txt.
    Everything else in the body is ignored.

    Responses:
      200 ``{"archived": int, "done_total": int, "mtime": float,
            "done_mtime": float}``
      400 ``{"error": "..."}``      — malformed ``base_mtime``
      409 ``{"error": "conflict", "mtime": float, "content": str}``
      500 ``{"error": "..."}`` — disk I/O failure (nothing was written)
    """
    body = await _optional_json_object(request)
    base_mtime, bad_mtime = _coerce_base_mtime(body)
    if bad_mtime is not None:
        return bad_mtime

    async with _io_lock:
        try:
            loop = asyncio.get_event_loop()
            payload, status = await loop.run_in_executor(
                None, _do_archive, base_mtime
            )
        except OSError as exc:
            logger.exception("todo-txt: archive failed: %s", exc)
            return web.json_response(
                {"error": f"archive failed: {exc}"}, status=500
            )
    return web.json_response(payload, status=status)


# ---------------------------------------------------------------------------
# Report snapshot (POST /api/report/snapshot)
# ---------------------------------------------------------------------------


def _count_active_lines(text: str) -> int:
    """Count lines that are non-blank and not comments.

    A line is considered a comment when its first non-whitespace character is
    ``#``. This is an app-level convention — the todo.txt spec has no
    standard comment syntax — so only leading-``#`` lines are filtered.
    """
    count = 0
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("#"):
            continue
        count += 1
    return count


def _utc_iso_timestamp() -> str:
    """Return the current UTC time as ``YYYY-MM-DDTHH:MM:SSZ``.

    Seconds precision, ``Z`` suffix. Stable and sortable lexicographically so
    ``report.txt`` rows stay in chronological order without any explicit
    sort step.
    """
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _do_report_snapshot() -> dict[str, Any]:
    """Blocking implementation of report snapshot — runs inside ``_io_lock``.

    Reads ``todo.txt`` + ``done.txt``, counts active (non-blank, non-comment)
    lines in each, and appends ``<ISO-timestamp> <active> <done>\\n`` to
    ``report.txt``. Returns ``{"snapshot": "<ISO> <active> <done>"}``.

    Missing ``todo.txt`` / ``done.txt`` are treated as empty (count = 0).
    ``report.txt`` is created if missing. A missing trailing newline on an
    existing ``report.txt`` is repaired before append so rows never run
    together.
    """
    ensure_dirs()
    todo_path = _todo_path()
    done_path = _root_dir() / DONE_FILENAME
    report_path = _root_dir() / REPORT_FILENAME

    def _read(path: Path) -> str:
        if not path.is_file():
            return ""
        return _read_text_preserving(path)

    todo_content = _read(todo_path)
    done_content = _read(done_path)

    active = _count_active_lines(todo_content)
    done = _count_active_lines(done_content)

    ts = _utc_iso_timestamp()
    snapshot_line = f"{ts} {active} {done}"

    existing = _read(report_path)
    if existing and not existing.endswith("\n"):
        existing += "\n"
    new_report = existing + snapshot_line + "\n"
    _atomic_write(report_path, new_report)

    return {"snapshot": snapshot_line}


async def api_report_snapshot(request: web.Request) -> web.Response:
    """POST /api/report/snapshot — append a snapshot row.

    Reads ``todo.txt`` and ``done.txt``, counts lines that are non-blank and
    not comments (leading ``#``), then appends
    ``<ISO-timestamp> <active> <done>\\n`` to ``report.txt``.

    The request body is ignored (snapshot is a deterministic single-action
    call with no parameters).

    Responses:
      200 ``{"snapshot": "<ISO> <active> <done>"}``
      500 ``{"error": "..."}`` — disk I/O failure
    """
    async with _io_lock:
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, _do_report_snapshot)
        except OSError as exc:
            logger.exception("todo-txt: report snapshot failed: %s", exc)
            return web.json_response(
                {"error": f"report snapshot failed: {exc}"}, status=500
            )
    return web.json_response(result)


def _detect_open_command() -> str | None:
    """Return the platform's native file-open binary name, or ``None``.

    Resolution:
      * macOS  → ``open``
      * Windows → ``start`` (treated as always available via ``os.startfile``)
      * Linux/BSD/other → ``xdg-open``

    On non-Windows platforms the binary is looked up via ``shutil.which`` so
    the handler can return 501 on minimal headless hosts that lack the opener.
    """
    if sys.platform == "darwin":
        candidate = "open"
    elif sys.platform.startswith("win"):
        # ``os.startfile`` is the canonical Windows opener; bypass PATH check.
        return "start"
    else:
        candidate = "xdg-open"
    return candidate if shutil.which(candidate) else None


async def api_open_external(request: web.Request) -> web.Response:
    """POST /api/open-external — launch host's default editor.

    Uses ``xdg-open`` (Linux/BSD), ``open`` (macOS), or ``os.startfile``
    (Windows) on the canonical ``$TODO_TXT_ROOT/todo.txt`` path. If the
    file does not yet exist it is created as an empty file first so the
    opener does not fail on a missing target.

    Request body is ignored.

    Responses:
      200 ``{"status": "ok", "command": str, "path": str}``
      501 ``{"error": "..."}``  — opener binary not installed
      500 ``{"error": "..."}``  — file creation or spawn failure
    """
    try:
        ensure_dirs()
        path = _todo_path()
        if not path.exists():
            # Precreate through the atomic-write path so the on-disk layout
            # is identical to any other write (permissions, parent dirs).
            try:
                _atomic_write(path, "")
            except OSError as exc:
                logger.exception(
                    "todo-txt: open-external precreate failed: %s", exc
                )
                return web.json_response(
                    {"error": f"cannot create file: {exc}"}, status=500
                )
    except OSError as exc:
        logger.exception("todo-txt: open-external ensure_dirs failed: %s", exc)
        return web.json_response(
            {"error": f"filesystem error: {exc}"}, status=500
        )

    cmd = _detect_open_command()
    if cmd is None:
        return web.json_response(
            {
                "error": (
                    "no opener binary available on PATH "
                    "(install xdg-open on Linux, or ensure 'open' is on PATH on macOS)"
                )
            },
            status=501,
        )

    try:
        loop = asyncio.get_event_loop()
        if sys.platform.startswith("win"):
            # os.startfile respects Windows shell associations and detaches
            # automatically; no subprocess needed.
            await loop.run_in_executor(
                None, lambda: os.startfile(str(path))  # type: ignore[attr-defined]
            )
        else:
            # Detach so the launched app outlives the aiohttp worker and
            # does not inherit its stdio pipes.
            await loop.run_in_executor(
                None,
                lambda: subprocess.Popen(  # noqa: S603 — intentional
                    [cmd, str(path)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    stdin=subprocess.DEVNULL,
                    start_new_session=True,
                ),
            )
    except FileNotFoundError:
        # Binary resolved via shutil.which but vanished before exec (race
        # with package removal, unusual but possible).
        return web.json_response(
            {"error": f"{cmd} not found at exec time"},
            status=501,
        )
    except OSError as exc:
        logger.exception("todo-txt: open-external spawn failed: %s", exc)
        return web.json_response(
            {"error": f"open failed: {exc}"}, status=500
        )

    return web.json_response(
        {"status": "ok", "command": cmd, "path": str(path)}
    )


# ---------------------------------------------------------------------------
# AI snapshot listing + restore + stage apply/discard
# ---------------------------------------------------------------------------

# Strict pattern for snapshot identifiers.  Filenames are written as
# ``ai-<ts_ms>-<uniq>.txt`` / ``ai-<ts_ms>-<uniq>.meta.json`` /
# ``ai-<ts_ms>-<uniq>.proposed.txt`` (see ``_write_ai_snapshot``), so the
# stem portion is a well-defined grammar.  Anything that does not match is
# rejected with 400 — this prevents path-traversal via ``..`` or ``/``.
_SNAPSHOT_ID_RE = re.compile(r"^ai-\d+-[0-9a-f]{6}$")


def _validate_snapshot_id(ts_param: str | None) -> str | None:
    """Return the validated snapshot stem (``ai-<ts>-<uniq>``) or ``None``.

    Accepts both the bare stem and the ``.txt``-suffixed form that
    ``api_ai_edit`` returns in its ``snapshot`` field.  Refuses any input
    containing path separators, null bytes, or the ``.meta.json`` /
    ``.proposed.txt`` suffixes (those are not valid snapshot identifiers).
    """
    if not isinstance(ts_param, str) or not ts_param:
        return None
    if "\x00" in ts_param or "/" in ts_param or "\\" in ts_param:
        return None
    # Clients may pass the full filename returned by /ai-edit; strip the
    # primary ``.txt`` extension for convenience.  Reject the meta / proposed
    # suffixes explicitly — those are sidecar files, not snapshot ids.
    if ts_param.endswith(".meta.json") or ts_param.endswith(".proposed.txt"):
        return None
    if ts_param.endswith(".txt"):
        ts_param = ts_param[: -len(".txt")]
    if not _SNAPSHOT_ID_RE.match(ts_param):
        return None
    return ts_param


def _snapshot_paths_for(snap_id: str) -> tuple[Path, Path, Path]:
    """Return ``(snapshot_txt, meta_json, proposed_txt)`` paths for a stem.

    The caller is responsible for validating ``snap_id`` with
    ``_validate_snapshot_id`` first; this helper does not repeat the check.
    """
    snap_dir = _ai_snapshots_dir()
    return (
        snap_dir / f"{snap_id}.txt",
        snap_dir / f"{snap_id}.meta.json",
        snap_dir / f"{snap_id}.proposed.txt",
    )


async def api_list_ai_snapshots(request: web.Request) -> web.Response:
    """GET /api/ai-snapshots — newest-first list of AI snapshots.

    Returns up to ``AI_SNAPSHOT_RETENTION_COUNT`` (50) entries, each assembled
    from the sidecar ``.meta.json``.  Snapshots with missing or corrupt meta
    files are skipped with a log warning so the listing stays robust.

    Response: ``{"snapshots": [{"snapshot": str, "ts_ms": int,
                                 "comment_preview": str,
                                 "line_delta": int, "char_delta": int,
                                 "classification": {...},
                                 "has_proposed": bool}, ...]}``
    """
    try:
        ensure_dirs()
        snaps = _list_ai_snapshots_sorted_newest_first()[
            :AI_SNAPSHOT_RETENTION_COUNT
        ]
        payload: list[dict[str, Any]] = []
        for p in snaps:
            stem = p.stem  # e.g. "ai-1712345678901-abcdef"
            meta_path = p.parent / f"{stem}.meta.json"
            proposed_path = p.parent / f"{stem}.proposed.txt"
            if not meta_path.is_file():
                logger.warning(
                    "todo-txt: missing meta sidecar for snapshot %s", stem
                )
                continue
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                logger.warning(
                    "todo-txt: corrupt meta for snapshot %s: %s", stem, exc
                )
                continue
            payload.append(
                {
                    "snapshot": stem,
                    "ts_ms": meta.get("ts_ms", 0),
                    "comment_preview": meta.get("comment_preview", ""),
                    "line_delta": meta.get("line_delta", 0),
                    "char_delta": meta.get("char_delta", 0),
                    "classification": meta.get("classification", {}),
                    "has_proposed": proposed_path.is_file(),
                }
            )
        return web.json_response({"snapshots": payload})
    except OSError as exc:
        logger.exception("todo-txt: list ai-snapshots failed: %s", exc)
        return web.json_response(
            {"error": f"list ai-snapshots failed: {exc}"}, status=500
        )


async def api_restore_ai_snapshot(request: web.Request) -> web.Response:
    """POST /api/ai-snapshots/{ts}/restore — roll back to a snapshot.

    Copies the snapshot's pre-edit content back to ``todo.txt`` through the
    normal ``PUT /content`` path so the user-save backup rotation fires on
    the state being overwritten.  The snapshot files themselves are left in
    place so the same snapshot can be restored again if the user wishes.

    Responses:
      200 ``{"status":"ok", "mtime":float, "bytes":int, "backup":str|null,
             "restored_from":str}``
      400 ``{"error":"invalid snapshot id"}``
      404 ``{"error":"snapshot not found"}``
      500 ``{"error":"..."}``  — disk I/O failure
    """
    snap_id = _validate_snapshot_id(request.match_info.get("ts"))
    if snap_id is None:
        return web.json_response(
            {"error": "invalid snapshot id"}, status=400
        )

    snap_path, _, _ = _snapshot_paths_for(snap_id)
    if not snap_path.is_file():
        return web.json_response(
            {"error": "snapshot not found"}, status=404
        )

    async with _io_lock:
        try:
            content = _read_text_preserving(snap_path)
        except OSError as exc:
            logger.exception("todo-txt: restore read failed: %s", exc)
            return web.json_response(
                {"error": f"restore read failed: {exc}"}, status=500
            )

        byte_len = len(content.encode("utf-8"))
        if byte_len > MAX_CONTENT_BYTES:
            # Shouldn't happen — snapshots are always written under the same
            # 1 MB cap — but guard against manual tampering / corruption.
            return web.json_response(
                {
                    "error": "snapshot exceeds size cap",
                    "limit": MAX_CONTENT_BYTES,
                    "bytes": byte_len,
                },
                status=500,
            )

        try:
            ensure_dirs()
            loop = asyncio.get_event_loop()
            # UNCONDITIONAL safety backup of the current state before it is
            # overwritten. This restore is a destructive rollback — the same
            # guarantee /api/backups/{name}/restore gives. The throttled
            # rotation can skip entirely (last rotation <5 min ago) and
            # silently destroy every edit made since the snapshot.
            backup_path = await loop.run_in_executor(
                None, _backup_file_unconditional, _todo_path(), "todo"
            )
            await loop.run_in_executor(
                None, _atomic_write, _todo_path(), content
            )
            mtime = _todo_path().stat().st_mtime
        except OSError as exc:
            logger.exception("todo-txt: restore write failed: %s", exc)
            return web.json_response(
                {"error": f"restore write failed: {exc}"}, status=500
            )

    return web.json_response(
        {
            "status": "ok",
            "mtime": mtime,
            "bytes": byte_len,
            "backup": backup_path.name if backup_path else None,
            "restored_from": snap_id,
        }
    )


async def api_apply_staged_ai_edit(request: web.Request) -> web.Response:
    """POST /api/ai-edit/{ts}/apply — commit a staged destructive proposal.

    For Tier-3 edits that were staged (YOLO off), this writes the
    ``.proposed.txt`` companion to ``todo.txt`` and deletes the proposal
    sidecar.  The pre-edit snapshot ``.txt`` and ``.meta.json`` are preserved
    so the user can still roll back via ``/ai-snapshots/{ts}/restore``.

    Responses:
      200 ``{"status":"applied", "mtime":float, "bytes":int, "snapshot":str}``
      400 ``{"error":"invalid snapshot id"}``
      404 ``{"error":"no staged proposal"}``
      500 ``{"error":"..."}``  — disk I/O failure
    """
    snap_id = _validate_snapshot_id(request.match_info.get("ts"))
    if snap_id is None:
        return web.json_response(
            {"error": "invalid snapshot id"}, status=400
        )

    _, _, proposed_path = _snapshot_paths_for(snap_id)
    if not proposed_path.is_file():
        return web.json_response(
            {"error": "no staged proposal"}, status=404
        )

    async with _io_lock:
        try:
            proposed = _read_text_preserving(proposed_path)
        except OSError as exc:
            logger.exception("todo-txt: apply read failed: %s", exc)
            return web.json_response(
                {"error": f"apply read failed: {exc}"}, status=500
            )

        byte_len = len(proposed.encode("utf-8"))
        if byte_len > MAX_CONTENT_BYTES:
            return web.json_response(
                {
                    "error": "proposal exceeds size cap",
                    "limit": MAX_CONTENT_BYTES,
                    "bytes": byte_len,
                },
                status=500,
            )

        # STALENESS GATE: a staged diff is only valid against the base it
        # was computed from (the snapshot .txt). This is the endpoint with the
        # LONGEST stage→commit window — the proposal persists on disk across
        # reloads, where /api/ai-edit re-reads and 409s within a single
        # request — so it needs the check most: applying a stale proposal
        # silently destroys every edit made since staging.
        snap_path, _, _ = _snapshot_paths_for(snap_id)
        try:
            base = (
                _read_text_preserving(snap_path)
                if snap_path.is_file()
                else None
            )
            todo_path = _todo_path()
            current = (
                _read_text_preserving(todo_path)
                if todo_path.is_file()
                else ""
            )
        except OSError as exc:
            logger.exception("todo-txt: apply base read failed: %s", exc)
            return web.json_response(
                {"error": f"apply base read failed: {exc}"}, status=500
            )
        if base is None:
            # FAIL CLOSED. No base means nothing to compare the proposal
            # against, so its safety cannot be established — refuse rather
            # than write blind. Reachable when the pre-edit snapshot is
            # removed while the proposal sidecar survives (manual cleanup, a
            # sync tool, corruption) or after a root switch.
            return web.json_response(
                {
                    "error": (
                        "conflict: the snapshot this edit was staged "
                        "against is gone"
                    ),
                    "hint": "discard the proposal and re-run the AI edit",
                },
                status=409,
            )
        if current != base:
            return web.json_response(
                {
                    "error": (
                        "conflict: todo.txt was modified after this edit "
                        "was staged"
                    ),
                    "hint": (
                        "re-run the AI edit against the current content, "
                        "or discard the stale proposal"
                    ),
                },
                status=409,
            )

        try:
            ensure_dirs()
            loop = asyncio.get_event_loop()
            # UNCONDITIONAL safety backup of the state being overwritten.
            # The ai-snapshot .txt preserves the content at STAGING time —
            # with the staleness gate above they currently coincide, but the
            # backup keeps apply's guarantee independent of that invariant
            # (same contract as restore/clear/archive: every destructive
            # write leaves a recoverable copy of what it destroyed).
            backup_path = await loop.run_in_executor(
                None, _backup_file_unconditional, _todo_path(), "todo"
            )
            await loop.run_in_executor(
                None, _atomic_write, _todo_path(), proposed
            )
            mtime = _todo_path().stat().st_mtime
        except OSError as exc:
            logger.exception("todo-txt: apply write failed: %s", exc)
            return web.json_response(
                {"error": f"apply write failed: {exc}"}, status=500
            )

        # Proposal consumed — remove the sidecar so the same ts cannot be
        # applied twice.  Keep the pre-edit .txt + .meta.json for rollback.
        try:
            proposed_path.unlink()
        except OSError as exc:
            logger.warning(
                "todo-txt: failed to cleanup proposed file %s: %s",
                proposed_path,
                exc,
            )

    return web.json_response(
        {
            "status": "applied",
            "mtime": mtime,
            "bytes": byte_len,
            "snapshot": snap_id,
            "backup": backup_path.name if backup_path else None,
        }
    )


async def api_discard_staged_ai_edit(request: web.Request) -> web.Response:
    """POST /api/ai-edit/{ts}/discard — prune an unused staged snapshot.

    The user rejected the Tier-3 proposal.  Since no write ever touched
    ``todo.txt``, the pre-edit snapshot has no rollback value — prune the
    full triplet (``.txt``, ``.meta.json``, ``.proposed.txt``) together so
    the ai-snapshots listing reflects reality.

    Responses:
      200 ``{"status":"discarded", "snapshot":str}``
      400 ``{"error":"invalid snapshot id"}``
      404 ``{"error":"no staged proposal"}``
    """
    snap_id = _validate_snapshot_id(request.match_info.get("ts"))
    if snap_id is None:
        return web.json_response(
            {"error": "invalid snapshot id"}, status=400
        )

    snap_path, meta_path, proposed_path = _snapshot_paths_for(snap_id)
    if not proposed_path.is_file():
        return web.json_response(
            {"error": "no staged proposal"}, status=404
        )

    async with _io_lock:
        for p in (proposed_path, meta_path, snap_path):
            if p.exists():
                try:
                    p.unlink()
                except OSError as exc:
                    logger.warning(
                        "todo-txt: failed to unlink %s during discard: %s",
                        p,
                        exc,
                    )

    return web.json_response(
        {"status": "discarded", "snapshot": snap_id}
    )


# ---------------------------------------------------------------------------
# Move (POST /api/move)
# ---------------------------------------------------------------------------

_MOVE_VALID_FILES = set(EDITABLE_FILE_NAMES)


def _do_move(
    item: int, src: str, dest: str, base_mtime: float | None
) -> tuple[dict[str, Any], int]:
    """Blocking implementation of move — runs inside ``_io_lock``.

    Returns ``(payload, status)`` so the caller can hand the tuple straight to
    ``web.json_response``. Every read/write happens here, under the lock, in one
    executor hop. Doing this I/O inline on the event loop with no lock makes
    move the one write handler that can interleave with ``archive``: ``archive``
    holds the lock but yields at its ``run_in_executor`` hop, so a queued move
    runs to completion between archive's read and its write and the same task
    lands in BOTH files. Both are palette commands, so that interleaving is
    user-reachable. The lock and the executor hop must arrive together: moving
    this I/O off the loop without the lock converts the duplication into
    outright line loss.

    Like archive, this holds two invariants: the multiset of lines across the
    two files is CONSERVED (write destination first, source second, roll the
    destination back if the source write fails — the opposite order deletes the
    line from the source and then fails to deliver it, losing it outright), and
    both files are backed up as a PRECONDITION of the write.
    """
    ensure_dirs()
    root = _root_dir()
    src_path = root / THREE_FILE_NAMES[src]
    dest_path = root / THREE_FILE_NAMES[dest]

    src_content = _read_text_preserving(src_path) if src_path.is_file() else ""

    # Optimistic concurrency, same contract and same 409 shape as
    # PUT /api/content. It matters more here than on a full-content write:
    # ``item`` is a line NUMBER into the caller's view of the source file, so a
    # stale view does not fail — it silently moves a different task. An external
    # edit deletes line 1, the user clicks "bravo", and "charlie" moves.
    if base_mtime is not None and src_path.is_file():
        current_mtime = src_path.stat().st_mtime
        if abs(current_mtime - base_mtime) > MTIME_EPSILON:
            return {
                "error": "conflict",
                "mtime": current_mtime,
                "content": src_content,
            }, 409

    src_lines = src_content.splitlines(keepends=True)

    if item < 1 or item > len(src_lines):
        return {
            "error": f"item {item} out of range (file has {len(src_lines)} lines)"
        }, 400

    # Extract the line (0-based index).
    moved_line_raw = src_lines.pop(item - 1)
    moved_line = moved_line_raw.rstrip("\r\n")

    new_src = "".join(src_lines)

    prior_dest: str | None = None
    if dest_path.is_file():
        prior_dest = _read_text_preserving(dest_path)
    dest_content = prior_dest or ""
    # Terminator fidelity: the moved line's own ending if it had one, else the
    # destination's dominant style. Unconditionally appending "\n" rewrites a
    # CRLF line as LF and leaves the destination with mixed terminators — the
    # same silent-rewrite class the newline-preserving read exists to prevent.
    if moved_line_raw.endswith("\r\n"):
        term = "\r\n"
    elif moved_line_raw.endswith("\n"):
        term = "\n"
    else:
        term = _dominant_terminator(prior_dest or src_content)
    if dest_content and not dest_content.endswith("\n"):
        dest_content += _dominant_terminator(dest_content)
    new_dest = dest_content + moved_line + term

    # The same 1 MB ceiling every other write path enforces. Checked on the
    # post-move bytes, before either write: without it, a file that
    # PUT /api/content refuses at 1 MB could still be rewritten here at any
    # size.
    for label, text in (("from", new_src), ("to", new_dest)):
        byte_len = len(text.encode("utf-8"))
        if byte_len > MAX_CONTENT_BYTES:
            return {
                "error": "too large",
                "limit": MAX_CONTENT_BYTES,
                "bytes": byte_len,
                "file": src if label == "from" else dest,
            }, 413

    # Back up BOTH files before either write, exactly as archive does: a move
    # is a destructive two-file edit, so a failure between the two writes must
    # still leave a recoverable copy of each side.
    # required=True — a move we cannot undo must not run.
    _backup_file_unconditional(src_path, src, required=True)
    _backup_file_unconditional(dest_path, dest, required=True)

    # WRITE ORDER IS LOAD-BEARING — deliver to the destination first, remove
    # from the source second, and undo the delivery if the removal fails.
    _atomic_write(dest_path, new_dest)
    try:
        _atomic_write(src_path, new_src)
    except OSError:
        try:
            if prior_dest is None:
                dest_path.unlink()
            else:
                _atomic_write(dest_path, prior_dest)
        except OSError as undo_exc:  # pragma: no cover — needs two failures
            logger.error(
                "todo-txt: move rollback of %s failed (%s); the moved line is "
                "now in BOTH files — recover from backup/",
                dest_path.name,
                undo_exc,
            )
        raise

    return {
        "moved": True,
        "from": src,
        "to": dest,
        "line": moved_line,
        "mtime": src_path.stat().st_mtime,
        "dest_mtime": dest_path.stat().st_mtime,
    }, 200


# ---------------------------------------------------------------------------
# Settings — the configurable root
# ---------------------------------------------------------------------------

def _settings_payload() -> dict[str, Any]:
    """The shape both GET and PUT /api/settings answer with.

    Reports the resolved absolute path of each of the three files rather than
    only the root, because "where is my data" is the actual question the UI's
    ``where`` command asks, and deriving those paths client-side would fork the
    filename knowledge across two languages.
    """
    root = _root_dir()
    return {
        "root": str(root),
        "default_root": str(_default_root_dir()),
        "is_default": _configured_root() is None,
        "settings_path": str(_settings_path()),
        "files": {
            name: str(root / filename)
            for name, filename in THREE_FILE_NAMES.items()
        },
    }


async def api_get_settings(request: web.Request) -> web.Response:
    """GET /api/settings — report the active root and resolved file paths.

    Responses:
      200 ``{"root", "default_root", "is_default", "settings_path", "files"}``
    """
    return web.json_response(_settings_payload())


async def api_put_settings(request: web.Request) -> web.Response:
    """PUT or POST /api/settings — set the todo.txt root directory.

    Body: ``{"root": "<absolute path>"}``, or ``{"root": null}`` to restore the
    default. The key must be PRESENT: an empty object is rejected rather than
    read as "reset", so a client bug that drops the field cannot silently move
    the user off their own directory.

    ``root`` runs through ``validate_root`` — see that function for the
    fail-closed policy. A rejected value returns 400 with the reason and
    nothing is written; the previous setting stays in force.

    The write goes through the same ``_io_lock`` + atomic-write discipline as
    every content write. The lock matters more here than it looks: this handler
    changes where every OTHER write path resolves to, so overlapping it with an
    in-flight save could land that save's content in one root and its backup in
    another.

    Responses:
      200 ``{"root", "default_root", "is_default", "settings_path", "files"}``
      400 ``{"error": "...", "code": "invalid_root"}``  — rejected path
      400 ``{"error": "..."}``                          — malformed body
      500 ``{"error": "..."}``                          — disk I/O failure
    """
    try:
        body = await request.json()
    except (json.JSONDecodeError, ValueError):
        return web.json_response({"error": "invalid JSON body"}, status=400)

    if not isinstance(body, dict) or "root" not in body:
        return web.json_response(
            {"error": "missing 'root' field (send null to restore the default)"},
            status=400,
        )

    requested = body.get("root")
    if requested is None:
        stored: str | None = None
    else:
        resolved, reason = validate_root(requested)
        if resolved is None:
            # Log the REASON, never the rejected path — a rejected value is
            # attacker- or typo-supplied and may name a credential directory.
            logger.warning("todo-txt: rejected root (%s)", reason)
            return web.json_response(
                {"error": reason, "code": "invalid_root"}, status=400
            )
        # PREFLIGHT, before anything is persisted. `validate_root` answers
        # "is this path ALLOWED"; it cannot answer "can we actually use it".
        # Persisting first and creating the layout afterwards means a legal
        # but unwritable target (mode 0555, a read-only mount, a stale
        # network share) returns 500 — implying nothing changed — while the
        # app is left pointed at a root where every read and write fails:
        # the data still on disk in the old root, unreachable through a UI
        # that can no longer load enough to fix the setting.
        writable, why = await asyncio.get_event_loop().run_in_executor(
            None, _probe_root_writable, resolved
        )
        if not writable:
            logger.warning("todo-txt: root not usable (%s)", why)
            return web.json_response(
                {"error": why, "code": "invalid_root"}, status=400
            )
        stored = str(resolved)

    async with _io_lock:
        previous = _read_stored_root_raw()
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _persist_settings_root, stored)
            # Create the three-file layout in the new location straight away so
            # the very next read finds a directory rather than racing to make
            # one, and so a typo'd-but-legal path is visible on disk instead of
            # only in a config file.
            await loop.run_in_executor(None, ensure_dirs)
        except OSError as exc:
            # ROLL BACK: the preflight passed but creation still failed (a
            # race, a full disk, a revoked mount). Restoring the previous
            # value keeps the 500 honest — "nothing changed" — instead of
            # leaving the app on a root it just proved it cannot use.
            logger.exception("todo-txt: settings write failed: %s", exc)
            try:
                await loop.run_in_executor(
                    None, _persist_settings_root, previous
                )
            except OSError:  # pragma: no cover — defensive
                logger.exception(
                    "todo-txt: settings rollback ALSO failed; active root "
                    "may be unusable"
                )
            return web.json_response(
                {"error": f"settings write failed: {exc}"}, status=500
            )

    return web.json_response(_settings_payload())


def _read_stored_root_raw() -> str | None:
    """The raw ``root`` value in settings.json, unvalidated, or ``None``.

    Deliberately skips ``validate_root``: this is the rollback value, and the
    goal is to restore the file byte-for-byte to what it said before, not to
    re-judge it.
    """
    try:
        data = json.loads(_settings_path().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, ValueError):
        return None
    if not isinstance(data, dict):
        return None
    stored = data.get("root")
    return stored if isinstance(stored, str) else None


def _probe_root_writable(root: Path) -> tuple[bool, str | None]:
    """Can the app actually create its layout under *root*?

    Creates the directory if needed, writes and removes a probe file, and
    cleans up any directory it had to create so a rejected candidate is left
    exactly as it was found. Returns ``(True, None)`` or ``(False, reason)``.
    """
    created: list[Path] = []
    try:
        cursor = root
        # Remember which ancestors we create, deepest last, so cleanup can
        # unwind them in reverse if the probe fails.
        missing: list[Path] = []
        while not cursor.exists() and cursor != cursor.parent:
            missing.append(cursor)
            cursor = cursor.parent
        for path in reversed(missing):
            path.mkdir()
            created.append(path)

        probe = root / ".todo-txt-writable-probe"
        probe.write_text("", encoding="utf-8")
        probe.unlink()
        return True, None
    except OSError as exc:
        if isinstance(exc, PermissionError) or exc.errno == errno.EACCES:
            return False, "'root' is not writable"
        return False, f"'root' could not be prepared: {exc.strerror or exc}"
    finally:
        for path in reversed(created):
            try:
                path.rmdir()
            except OSError:
                break


def _persist_settings_root(root: str | None) -> None:
    """Write ``{"root": ...}`` to settings.json atomically.

    ``root=None`` is persisted as an explicit JSON ``null`` rather than by
    deleting the file: the reset then goes through the same single atomic
    rename as any other value (no unlink/recreate window where a concurrent
    reader sees no file at all), and the file stays legible to a human who
    wants to know what the app thinks its root is.

    Also creates the DEFAULT root directory first — on a fresh install nothing
    has created it yet, and the settings file lives there by definition.
    """
    target = _settings_path()
    target.parent.mkdir(parents=True, exist_ok=True)
    _atomic_write(target, json.dumps({"root": root}, indent=2) + "\n")


async def api_move(request: web.Request) -> web.Response:
    """POST /api/move — move a line between todo.txt and done.txt.

    Body: ``{"item": int, "from": "todo"|"done", "to": "todo"|"done",
    "base_mtime": float|null}``. ``item`` is a 1-based line number in the
    source file; ``base_mtime`` is the optional optimistic-concurrency token
    for the SOURCE file, and is strongly recommended — without it a stale line
    number moves whichever task now occupies that position.

    Responses:
      200 ``{"moved": true, "from": str, "to": str, "line": str,
            "mtime": float, "dest_mtime": float}``
      400 ``{"error": "..."}``       — invalid JSON, missing/bad fields, out of range
      409 ``{"error": "conflict", "mtime": float, "content": str}``
      413 ``{"error": "too large", "limit": int, "bytes": int, "file": str}``
      500 ``{"error": "..."}``       — disk I/O failure
    """
    try:
        body = await request.json()
    except (json.JSONDecodeError, ValueError):
        return web.json_response({"error": "invalid JSON body"}, status=400)

    if not isinstance(body, dict):
        return web.json_response({"error": "invalid JSON body"}, status=400)

    item = body.get("item")
    # ``bool`` is an ``int`` subclass, so ``item: true`` passed this check and
    # was silently accepted as line 1. Reject it explicitly, matching the same
    # exclusion in _coerce_base_mtime.
    if isinstance(item, bool) or not isinstance(item, int):
        return web.json_response(
            {"error": "'item' must be an integer"}, status=400
        )

    src = body.get("from")
    dest = body.get("to")

    if src not in _MOVE_VALID_FILES or dest not in _MOVE_VALID_FILES:
        return web.json_response(
            {"error": "from/to must be 'todo' or 'done'"}, status=400
        )

    if src == dest:
        return web.json_response(
            {"error": "source and destination must differ"}, status=400
        )

    base_mtime, bad_mtime = _coerce_base_mtime(body)
    if bad_mtime is not None:
        return bad_mtime

    async with _io_lock:
        try:
            loop = asyncio.get_event_loop()
            payload, status = await loop.run_in_executor(
                None, _do_move, item, src, dest, base_mtime
            )
        except OSError as exc:
            logger.exception("todo-txt: move failed: %s", exc)
            return web.json_response(
                {"error": f"move failed: {exc}"}, status=500
            )

    return web.json_response(payload, status=status)


# ---------------------------------------------------------------------------
# Route registration helper
# ---------------------------------------------------------------------------

def register_routes(app: web.Application) -> None:
    """Register todo-txt routes on ``app``.

    Call this from the main server wiring. Ensures directories exist before any
    request is served.
    """
    ensure_dirs()
    app.router.add_get("/api/content", api_get_content)
    app.router.add_get("/api/file", api_get_file)
    app.router.add_put("/api/content", api_put_content)
    # POST on the same path powers the navigator.sendBeacon save-before-unload
    # flush — beacons only speak POST, so a PUT-only route would 405 and drop
    # the last few hundred milliseconds of typing. Same handler, same payload
    # shape.
    app.router.add_post("/api/content", api_put_content)
    app.router.add_put("/api/file", api_put_file)
    # done.txt uses this POST route for the same conflict-safe unload beacon.
    app.router.add_post("/api/file", api_put_file)
    app.router.add_get("/api/backups", api_list_backups)
    app.router.add_get(
        "/api/backups/{name}", api_get_backup
    )
    app.router.add_post(
        "/api/backups/{name}/restore", api_restore_backup
    )
    app.router.add_post("/api/ai-edit", api_ai_edit)
    app.router.add_post("/api/clear", api_clear)
    app.router.add_post("/api/archive", api_archive)
    app.router.add_post(
        "/api/report/snapshot", api_report_snapshot
    )
    app.router.add_post(
        "/api/open-external", api_open_external
    )
    app.router.add_post(
        "/api/move", api_move
    )
    # Settings — the configurable root. POST is accepted alongside PUT for
    # symmetry with /api/content, whose POST exists for sendBeacon.
    app.router.add_get("/api/settings", api_get_settings)
    app.router.add_put("/api/settings", api_put_settings)
    app.router.add_post("/api/settings", api_put_settings)
    # Snapshot management — listing + rollback + stage apply/discard.
    app.router.add_get(
        "/api/ai-snapshots", api_list_ai_snapshots
    )
    app.router.add_post(
        "/api/ai-snapshots/{ts}/restore",
        api_restore_ai_snapshot,
    )
    app.router.add_post(
        "/api/ai-edit/{ts}/apply",
        api_apply_staged_ai_edit,
    )
    app.router.add_post(
        "/api/ai-edit/{ts}/discard",
        api_discard_staged_ai_edit,
    )
    # ALIASES the UI actually calls. The staged modal POSTs
    # /api/ai-snapshots/{ts}/apply|discard — the snapshot id IS the resource
    # there, matching .../restore — so registering only the /api/ai-edit/...
    # spellings above would 404 every Apply click and fail every Discard
    # silently while the UI reported success. Both spellings stay registered;
    # same handlers, same auth, same contract.
    app.router.add_post(
        "/api/ai-snapshots/{ts}/apply",
        api_apply_staged_ai_edit,
    )
    app.router.add_post(
        "/api/ai-snapshots/{ts}/discard",
        api_discard_staged_ai_edit,
    )


__all__ = [
    "api_get_content",
    "api_get_file",
    "api_put_content",
    "api_put_file",
    "api_list_backups",
    "api_get_backup",
    "api_restore_backup",
    "api_ai_edit",
    "api_clear",
    "api_archive",
    "api_report_snapshot",
    "api_open_external",
    "api_move",
    "api_list_ai_snapshots",
    "api_restore_ai_snapshot",
    "api_apply_staged_ai_edit",
    "api_discard_staged_ai_edit",
    "register_routes",
    "ensure_dirs",
    "MAX_CONTENT_BYTES",
    "BACKUP_MIN_INTERVAL_SECS",
    "BACKUP_RETENTION_COUNT",
    "AI_SNAPSHOT_RETENTION_COUNT",
    "AI_LLM_TIMEOUT_SECS",
    "AI_LLM_TEMPERATURE",
    "AI_MAX_LINE_REDUCTION_PCT",
]
