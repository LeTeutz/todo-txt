"""The invariant behind the destructive-edit promise.

`RELEASE-NOTES.md` tells the user that an AI edit removing a line is held back
for approval. Mechanically that reduces to one property of `_classify_edit`:

    tier 2 (auto-apply)  =>  no non-blank line lost an occurrence

WHAT THIS FILE ADDS, precisely. The multiplicity regression is already covered
by an example: `test_classifier_catches_duplicate_line_removal` in
`test_ai_staging_apply.py` removes one copy of a duplicated line while keeping
the line and char counts non-decreasing, and it fails immediately if the
multiset comparison in `_classify_edit` is weakened back to set membership.
Both mutations were tried and that example catches both, so this file is NOT
what protects that case.

What it adds instead is the property stated generally, over generated pairs
rather than chosen ones -- so a future refactor that opens a case nobody wrote
down fails here -- plus five content-destroying shapes the examples do not
enumerate: a line rewritten in place, an NFC-to-NFD re-encoding, a line
replaced by a zero-width space, a stripped trailing newline, and a mass
replacement with a net line delta of zero. Each keeps the line count and most
grow the byte count, so a classifier comparing only sizes would wave them
through.

Also pinned here are the two shapes that ARE reachable at tier 2 and are
deliberate, so that neither is later mistaken for a removal bug: reordering
lines, and dropping a blank line while adding text.
"""

from __future__ import annotations

import collections
import random
import sys
import unicodedata
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import todo_txt_handlers as handlers  # noqa: E402

_BASE = "x 2026-08-01 done thing\n(A) call the bank +admin\nbuy milk @errands\n"

# Deliberately includes a duplicate, a blank and a whitespace-only entry: those
# are the three shapes where "did a line survive" stops being obvious.
_ALPHABET = ["a", "b", "dup", "dup", "(A) task", "x done", "", "   ", "long line here"]

_SWEEP_PAIRS = 5000
_SEED = 20260812  # fixed: a flaky invariant test gets muted, and a muted gate is none


def _nonblank_counts(text: str) -> collections.Counter:
    return collections.Counter(line for line in text.splitlines() if line.strip())


def _lost_lines(old: str, new: str) -> dict[str, tuple[int, int]]:
    """Non-blank lines whose occurrence count decreased, old count -> new count."""
    before, after = _nonblank_counts(old), _nonblank_counts(new)
    return {
        line: (count, after[line]) for line, count in before.items() if after[line] < count
    }


def _mutate(lines: list[str], rng: random.Random) -> list[str]:
    out = list(lines)
    for _ in range(rng.randint(1, 4)):
        op = rng.choice(["delete", "insert", "extend", "swap", "append", "dedupe", "deblank"])
        if op == "delete" and out:
            out.pop(rng.randrange(len(out)))
        elif op == "insert":
            out.insert(rng.randrange(len(out) + 1), rng.choice(_ALPHABET))
        elif op == "extend" and out:
            index = rng.randrange(len(out))
            out[index] = out[index] + rng.choice(["!", " @ctx", "", "   "])
        elif op == "swap" and len(out) > 1:
            i, j = rng.sample(range(len(out)), 2)
            out[i], out[j] = out[j], out[i]
        elif op == "append":
            out.append(rng.choice(_ALPHABET) * rng.randint(1, 4))
        elif op == "dedupe":
            seen: set[str] = set()
            out = [line for line in out if not (line in seen or seen.add(line))]
        elif op == "deblank":
            out = [line for line in out if line.strip()]
    return out


def _generated_pairs() -> list[tuple[str, str]]:
    rng = random.Random(_SEED)
    pairs = []
    for _ in range(_SWEEP_PAIRS):
        old_lines = [rng.choice(_ALPHABET) for _ in range(rng.randint(0, 8))]
        new_lines = _mutate(old_lines, rng)
        pairs.append(
            (
                "\n".join(old_lines) + ("\n" if old_lines else ""),
                "\n".join(new_lines) + ("\n" if new_lines else ""),
            )
        )
    return pairs


@pytest.fixture(scope="module")
def classified() -> list[tuple[str, str, dict]]:
    return [(old, new, handlers._classify_edit(old, new)) for old, new in _generated_pairs()]


def test_the_sweep_actually_reaches_every_tier(classified):
    """Guard the guard. A generator that only ever produces additive edits would
    make the invariant below hold vacuously, which is the failure this whole
    file exists to avoid.
    """
    tiers = collections.Counter(result["tier"] for _, _, result in classified)
    assert set(tiers) == {2, 3, 4}, f"the sweep never exercised some tier: {dict(tiers)}"
    for tier in (2, 3, 4):
        assert tiers[tier] >= 50, f"tier {tier} seen only {tiers[tier]} times: {dict(tiers)}"


def test_an_auto_applied_edit_never_loses_a_non_blank_line(classified):
    """THE invariant. Everything the release notes promise about destructive AI
    edits rests on this one line.
    """
    violations = [
        (old, new, _lost_lines(old, new))
        for old, new, result in classified
        if result["tier"] == 2 and _lost_lines(old, new)
    ]
    assert violations == [], (
        f"{len(violations)} auto-applied edits lost a non-blank line. First: "
        f"old={violations[0][0]!r} new={violations[0][1]!r} lost={violations[0][2]}"
    )


def test_the_flags_never_disagree_with_the_tier(classified):
    """`additive` and `reject` are what the handler branches on, so a tier that
    disagrees with its own flags would route an edit past the wrong gate.
    """
    disagreements = [
        (result["tier"], result["additive"], result["reject"])
        for _, _, result in classified
        if result["additive"] != (result["tier"] == 2) or result["reject"] != (result["tier"] == 4)
    ]
    assert disagreements == [], f"tier/flag disagreements: {disagreements[:5]}"


@pytest.mark.parametrize(
    "label, old, new",
    [
        (
            "a line rewritten in place, even when the text grows",
            _BASE,
            _BASE.replace("buy milk @errands", "buy oat milk and bread @errands @shop"),
        ),
        (
            "a line re-encoded from NFC to NFD",
            "caf\u00e9 +proj\nb\n",
            unicodedata.normalize("NFD", "caf\u00e9 +proj") + "\nb\n",
        ),
        (
            "a line's content replaced by a zero-width space",
            "real task +proj\nb\n",
            "\u200b\nb\npadding to keep the byte count up\n",
        ),
        ("the trailing newline stripped", "a\nb\n", "a\nb"),
        (
            "a mass replacement with a net line delta of zero",
            "\n".join(f"old{i}" for i in range(90)) + "\n",
            "\n".join(f"new{i}" for i in range(90)) + "\n",
        ),
    ],
)
def test_content_destroying_edits_stage_rather_than_apply(label, old, new):
    """Each of these keeps the line count and often grows the byte count, so a
    classifier that only compared sizes would wave them through.
    """
    result = handlers._classify_edit(old, new)
    assert result["tier"] == 3, f"{label} classified as tier {result['tier']}"
    assert not result["additive"]
    assert not result["reject"]


def test_exactly_fifty_percent_reduction_stages_instead_of_rejecting():
    """The Tier 4 threshold is `> 50`, so the boundary itself must still reach
    the user as a reviewable diff rather than being refused outright.
    """
    old = "\n".join(f"t{i}" for i in range(100)) + "\n"
    new = "\n".join(f"t{i}" for i in range(50)) + "\n"
    assert handlers._classify_edit(old, new)["tier"] == 3


@pytest.mark.parametrize(
    "label, old, new",
    [
        ("lines reordered, every line surviving", "a\nb\nc\n", "c\nb\na\n"),
        ("a blank line dropped while text is added", "a\n\nb\n", "a\nb\nc-longer-line\n"),
    ],
)
def test_deliberately_auto_applied_shapes(label, old, new):
    """These DO auto-apply, and that is the design rather than an oversight.

    The invariant is "no non-blank line loses an occurrence", not "the file is
    unchanged apart from additions". Reordering keeps every task, and a blank
    line is layout rather than data in the todo.txt format. Both are recorded
    here so that neither is read as an instance of the bug this file guards,
    and so that changing either is a deliberate decision with a failing test
    attached.
    """
    result = handlers._classify_edit(old, new)
    assert result["tier"] == 2, f"{label} no longer auto-applies"
    assert _lost_lines(old, new) == {}
