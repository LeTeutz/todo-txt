"""The published docs must account for every knob this app reads.

WHY THIS FILE EXISTS: `TODO_TXT_AI_YOLO` shipped as a tested, deliberate escape
hatch that makes a line-removing AI edit apply instead of staging for approval --
while `RELEASE-NOTES.md` and the store listing both stated the review guarantee
without qualification. Nothing was broken; the promise was simply wider than the
code. No suite could catch that, because every test exercised the default path
and the default path was correct.

The gap closes only by coupling the docs to the code: an environment variable
this app defines is either explained to the reader or explicitly recorded as an
internal seam, with the reason it needs no explanation.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

_APP_ROOT = Path(__file__).resolve().parent.parent
_BACKEND = _APP_ROOT / "backend"
_DOCS = ("RELEASE-NOTES.md", "README.md")

# Injected by the gateway, documented by the platform rather than by this app.
# Reading one is not a knob this app offers, so these are out of scope here.
_GATEWAY_OWNED = frozenset(
    {
        "KIROCREW_APP_NAME",
        "KIROCREW_GATEWAY_URL",
        "KIROCREW_HOME",
        "KIROCREW_PROXY_SECRET",
        "LOG_LEVEL",
        "PORT",
    }
)

# App-owned variables that deliberately stay out of the user-facing docs. Each
# entry needs a reason, and the reason has to be about the READER: documenting a
# seam nobody should set is noise, and noise is what makes the rest ignorable.
_INTERNAL_SEAMS = {
    "TODO_TXT_SEED": (
        "Forces the starter example into a custom root. Cannot destroy anything "
        "-- the seed writes only when todo.txt is absent, or is zero bytes on an "
        "install that has never seeded -- so it is a dev and test seam, not a "
        "setting a user has any reason to reach for."
    ),
}


def _env_names_read_by_backend() -> set[str]:
    pattern = re.compile(r"""os\.(?:environ\.get|getenv)\(\s*["']([A-Z_][A-Z0-9_]*)["']""")
    names: set[str] = set()
    for source in sorted(_BACKEND.glob("*.py")):
        names |= set(pattern.findall(source.read_text(encoding="utf-8")))
    return names


def _documented(name: str) -> list[str]:
    return [doc for doc in _DOCS if name in (_APP_ROOT / doc).read_text(encoding="utf-8")]


def test_the_scan_finds_the_env_vars_it_is_supposed_to_guard():
    """Guard the guard. A regex that silently matches nothing would make every
    assertion below vacuously true, which is worse than having no check at all.
    """
    names = _env_names_read_by_backend()
    assert "TODO_TXT_ROOT" in names, f"the scan missed a known variable: {sorted(names)}"
    assert "TODO_TXT_AI_YOLO" in names, f"the scan missed a known variable: {sorted(names)}"
    assert len(names) >= 7, f"the scan found suspiciously few variables: {sorted(names)}"


def test_every_app_owned_env_var_is_documented_or_declared_internal():
    app_owned = sorted(_env_names_read_by_backend() - _GATEWAY_OWNED)
    undocumented = [
        name
        for name in app_owned
        if name not in _INTERNAL_SEAMS and not _documented(name)
    ]
    assert undocumented == [], (
        "these variables change how the app behaves but appear in neither "
        f"RELEASE-NOTES.md nor README.md: {undocumented}. Document them, or add "
        "each to _INTERNAL_SEAMS with the reason a reader does not need it."
    )


def test_the_destructive_edit_escape_hatch_is_documented_where_the_promise_is():
    """The specific instance this file was written for.

    Naming the variable somewhere in the repo is not enough: a reader who finds
    the unconditional guarantee must find its one exception in the same
    document, or the guarantee misleads them.
    """
    handler = (_BACKEND / "todo_txt_handlers.py").read_text(encoding="utf-8")
    if "TODO_TXT_AI_YOLO" not in handler:
        pytest.skip("the escape hatch no longer exists, so there is nothing to document")
    notes = (_APP_ROOT / "RELEASE-NOTES.md").read_text(encoding="utf-8")
    assert "TODO_TXT_AI_YOLO" in notes, (
        "RELEASE-NOTES.md promises that a line-removing AI edit is held back for "
        "approval. TODO_TXT_AI_YOLO makes it apply directly, so the promise is "
        "wrong unless the exception is stated in the same document."
    )


def test_internal_seams_are_still_read_by_the_backend():
    """An allowlist that outlives its variable is how an exemption becomes a
    place for a real gap to hide.
    """
    names = _env_names_read_by_backend()
    stale = [name for name in _INTERNAL_SEAMS if name not in names]
    assert stale == [], f"_INTERNAL_SEAMS names variables the backend no longer reads: {stale}"
