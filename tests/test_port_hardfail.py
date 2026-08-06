"""Tests for server.py _parse_port hard-fail behavior.

Verifies:
  - Missing PORT raises SystemExit(2)
  - Non-integer PORT raises SystemExit(2)
  - Valid PORT returns the integer
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest


_MODULE_PATH = (
    Path(__file__).resolve().parent.parent / "backend" / "server.py"
)


def _load_server_module():
    spec = importlib.util.spec_from_file_location(
        "server_under_test_port", _MODULE_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def server_mod(tmp_path, monkeypatch):
    monkeypatch.setenv("TODO_TXT_ROOT", str(tmp_path))
    return _load_server_module()


def test_parse_port_missing_exits(server_mod, monkeypatch):
    monkeypatch.delenv("PORT", raising=False)
    with pytest.raises(SystemExit) as exc_info:
        server_mod._parse_port()
    assert exc_info.value.code == 2


def test_parse_port_non_integer_exits(server_mod, monkeypatch):
    monkeypatch.setenv("PORT", "abc")
    with pytest.raises(SystemExit) as exc_info:
        server_mod._parse_port()
    assert exc_info.value.code == 2


def test_parse_port_zero_exits(server_mod, monkeypatch):
    monkeypatch.setenv("PORT", "0")
    with pytest.raises(SystemExit) as exc_info:
        server_mod._parse_port()
    assert exc_info.value.code == 2


def test_parse_port_valid(server_mod, monkeypatch):
    monkeypatch.setenv("PORT", "8911")
    assert server_mod._parse_port() == 8911


def test_parse_port_out_of_range_exits(server_mod, monkeypatch):
    monkeypatch.setenv("PORT", "99999")
    with pytest.raises(SystemExit) as exc_info:
        server_mod._parse_port()
    assert exc_info.value.code == 2
