"""Tier-4 reject coverage for the AI-edit safeguard classifier.

Tier 4 (hard limits) must reject an LLM edit UNCONDITIONALLY when it:
  - empties a non-empty file,
  - reduces line count by more than AI_MAX_LINE_REDUCTION_PCT (50%), or
  - exceeds the MAX_CONTENT_BYTES (1MB) size cap.

These tests pin those branches of `_classify_edit` so a future refactor can't
silently weaken the guardrail, plus two boundary cases proving the classifier
does NOT over-reject (a 40% reduction stays Tier 3; an additive edit is Tier 2).
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

_MODULE_PATH = (
    Path(__file__).resolve().parent.parent / "backend" / "todo_txt_handlers.py"
)


def _load():
    spec = importlib.util.spec_from_file_location("tth_tier4_under_test", _MODULE_PATH)
    assert spec is not None and spec.loader is not None
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    return mod


mod = _load()


def test_tier4_empties_nonempty_file():
    c = mod._classify_edit("buy milk\ncall mom\n", "   ")
    assert c["tier"] == 4
    assert c["reject"] is True


def test_tier4_over_50pct_line_reduction():
    old = "\n".join(f"task {i}" for i in range(10)) + "\n"  # 10 lines
    new = "task 0\ntask 1\ntask 2\ntask 3\n"  # 4 lines -> 60% reduction
    c = mod._classify_edit(old, new)
    assert c["tier"] == 4
    assert c["reject"] is True
    assert "reduction" in c["reason"]


def test_tier4_exceeds_size_cap():
    old = "x\n"
    new = "y" * (mod.MAX_CONTENT_BYTES + 1)
    c = mod._classify_edit(old, new)
    assert c["tier"] == 4
    assert c["reject"] is True


def test_just_under_50pct_reduction_is_tier3_not_rejected():
    old = "\n".join(f"task {i}" for i in range(10)) + "\n"  # 10 lines
    new = "\n".join(f"task {i}" for i in range(6)) + "\n"  # 6 lines -> 40%
    c = mod._classify_edit(old, new)
    assert c["reject"] is False
    assert c["tier"] == 3


def test_additive_edit_is_tier2_not_rejected():
    c = mod._classify_edit("buy milk\n", "buy milk\ncall mom\n")
    assert c["tier"] == 2
    assert c["reject"] is False
    assert c["additive"] is True
