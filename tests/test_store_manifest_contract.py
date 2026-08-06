"""Store-page manifest contract — THREE path conventions, all different.

This file exists because one manifest carries keys whose path forms look
interchangeable and are not. Each rule was learned by shipping the wrong one:

  1. `ui.entry` resolves RELATIVE TO ui/. An app-root-relative value produced
     `/apps/todo-txt/ui/ui/dist/index.mjs` and the page failed to mount on the
     first live install.

  2. `iconPath`, `heroImage*` and `screenshots` must be REPO-RELATIVE
     (`ui/brand/...`). For a registry entry the gateway rewrites them into blob
     proxy URLs as `/api/apps/blob?repo=<repo>&path=<the manifest value>`
     (apps/registry.py), so an absolute `/apps/todo-txt/...` value makes the
     proxy look for that path INSIDE the repo, where it does not exist — every
     hero and screenshot 404s and the card falls back to a name-seeded gradient.
     `iconUrl` is DERIVED from `iconPath` there, so `iconPath` is the field that
     matters for a published app.

  3. `iconUrl` stays ABSOLUTE (`/apps/todo-txt/...`). It is what a LOCAL sideload
     uses, where nothing rewrites anything and the browser resolves it verbatim.
     For a registry install the derived value wins, so keeping it absolute costs
     nothing and keeps a dev install's icon working.

  4. THE ICON IS TWO FILES, and which one a field names is not cosmetic.
     `iconPath` / `iconUrl` name the 512px PNG because that is what the store
     requires of an app icon (square, at least 256 across, transparent), and
     because those fields feed card-sized surfaces. The RAIL icon is
     `ui.pages[].iconUrl`, which stays the SVG: it is resolved under
     `/apps/todo-txt/ui/` on both install paths, it is never rewritten by the
     blob proxy, and it renders at 16-34 px where a downscaled 512px raster
     reads softer than the vector. The PNG is rasterized FROM the SVG through an
     img tag, so both files carry the same baked literal colours.

THE TRADE-OFF THIS ENCODES: a sideloaded app renders hero art only with absolute
paths; a REGISTRY app only with repo-relative ones. One value cannot satisfy
both, and the publishing guide says so outright ("Path form depends on
distribution"). Publication wins — real users install from the registry, and a
dev sideload showing a placeholder banner is cosmetic.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

_MANIFEST = Path(__file__).resolve().parent.parent / "app.json"
_APP_ROOT = Path(__file__).resolve().parent.parent
_MOUNT_PREFIX = "/apps/todo-txt/"
_HERO_FIELDS = (
    "heroImage",
    "heroImageDark",
    "heroImageDetail",
    "heroImageDetailDark",
)
_LIST_ASSET_FIELDS = ("screenshots", "screenshotsDark")


@pytest.fixture(scope="module")
def manifest() -> dict:
    return json.loads(_MANIFEST.read_text(encoding="utf-8"))


def _asset_paths(manifest: dict) -> list[tuple[str, str]]:
    """Every (field, value) pair the store renders as an image."""
    pairs: list[tuple[str, str]] = []
    for field in ("iconUrl", "iconPath") + _HERO_FIELDS:
        value = manifest.get(field)
        if isinstance(value, str) and value:
            pairs.append((field, value))
    for field in _LIST_ASSET_FIELDS:
        values = manifest.get(field)
        if isinstance(values, list):
            for index, value in enumerate(values):
                if isinstance(value, str) and value:
                    pairs.append((f"{field}[{index}]", value))
    return pairs


def test_manifest_declares_store_assets(manifest):
    """Guard the guard: if the fields vanish, the checks below go vacuous."""
    pairs = _asset_paths(manifest)
    assert len(pairs) >= 9, (
        f"expected the full store asset set, found {len(pairs)}: "
        f"{[p[0] for p in pairs]}"
    )


def test_registry_asset_paths_are_repo_relative(manifest):
    """Rule 2 — the blob proxy resolves these INSIDE the repo."""
    offenders = []
    for field in ("iconPath",) + _HERO_FIELDS:
        value = manifest.get(field)
        if isinstance(value, str) and value.startswith("/"):
            offenders.append((field, value))
    for index, value in enumerate(manifest.get("screenshots") or []):
        if isinstance(value, str) and value.startswith("/"):
            offenders.append((f"screenshots[{index}]", value))
    assert offenders == [], (
        "these are rewritten to /api/apps/blob?...&path=<value> for a registry "
        "app, so an absolute value names a path that does not exist in the repo "
        f"and the store card falls back to a gradient: {offenders}"
    )


def test_icon_url_stays_absolute_for_a_local_sideload(manifest):
    """Rule 3 — the one asset field that must NOT be repo-relative."""
    icon_url = manifest.get("iconUrl")
    assert isinstance(icon_url, str) and icon_url.startswith(_MOUNT_PREFIX), (
        "iconUrl is used verbatim by a local sideload, where nothing rewrites "
        f"it; expected a {_MOUNT_PREFIX} path, got {icon_url!r}"
    )


def test_every_store_asset_exists_on_disk(manifest):
    """A correct URL pointing at a missing file fails just as silently."""
    missing = []
    for field, value in _asset_paths(manifest):
        relative = (
            value[len(_MOUNT_PREFIX):] if value.startswith(_MOUNT_PREFIX) else value
        )
        if not (_APP_ROOT / relative).is_file():
            missing.append((field, value))
    assert missing == [], f"declared store assets not present on disk: {missing}"


def test_ui_entry_stays_relative_to_the_ui_dir(manifest):
    """Rule 1 — the OTHER convention, pinned so the two cannot be conflated."""
    ui = manifest.get("ui") or {}
    entry = ui.get("entry") or ui.get("entryPoint")
    assert isinstance(entry, str) and entry, "ui.entry must be declared"
    assert not entry.startswith("/"), "ui.entry must NOT be absolute"
    assert not entry.startswith("ui/"), (
        "ui.entry is resolved relative to ui/ — an app-root-relative value "
        "produces /apps/todo-txt/ui/ui/... and the page fails to mount"
    )
    assert (_APP_ROOT / "ui" / entry).is_file(), (
        f"ui.entry {entry!r} does not exist under ui/"
    )


def test_no_setup_hooks_that_can_fail_an_install(manifest):
    """`setup.onInstall` was dropped deliberately, and should stay dropped.

    ui/dist is committed AND the registry install path already runs a detected
    npm build before onInstall would fire, so the hook was redundant — while a
    cold `npm install` under a 300s `set -euo pipefail` cap was the least
    reliable step in the whole install. `setup.onUpdate` is worse than
    redundant: it round-trips through the manifest but no code path executes it,
    so work placed there silently never runs.
    """
    setup = manifest.get("setup") or {}
    assert "onInstall" not in setup, (
        "an onInstall hook re-runs a cold npm install at install time; the "
        "platform already builds, and ui/dist is committed"
    )
    assert "onUpdate" not in setup, "setup.onUpdate never executes; do not rely on it"


def test_declares_a_gateway_version_floor(manifest):
    """An old gateway should get a clear error, not a confusing failure."""
    assert manifest.get("minKiroCrewVersion"), (
        "declare minKiroCrewVersion so a too-old gateway refuses cleanly"
    )


# ---------------------------------------------------------------------------
# The icon must PARSE, and it must carry its own colours.
#
# The second half reverses what this file used to assert, so it is worth stating
# why. A sideloaded app's icon is rendered by the dashboard as a plain img tag
# pointing at /apps/NAME/ui/..., NOT inlined into a span. The dashboard does
# have an inline path that drives `--ico-a` / `--ico-b`, but it is gated on the
# icon URL matching `^/app-assets/[\w-]+/[\w-]+\.svg$` — a shape only BUILTIN
# apps have. A sideloaded URL fails it three ways (wrong prefix, an extra path
# segment, a slash in the final segment), so the tone properties are
# structurally unreachable for this app.
#
# An svg inside an img resolves currentColor against its OWN document, where
# `color` is initial — black. So the previous chain, which ended in
# currentColor, painted the icon black on a near-black rail: present, correctly
# shaped, and completely invisible. The old guard here BANNED hex literals in
# the markup, which made the only real fix untestable and let four rounds of
# redesign chase the artwork instead of the delivery path.
#
# So: the var() chain stays in front (free, and it themes if ever inlined), and
# every chain must terminate in a literal colour that reads on a near-black rail
# and a white one alike.
#
# The parse check is a separate lesson: an XML comment may not contain a double
# hyphen, and a comment documenting `--ico-a` made the file malformed. A
# malformed icon does not raise anywhere — it renders as a broken image.
# ---------------------------------------------------------------------------

_ICON = _APP_ROOT / "ui" / "brand" / "icon.svg"

# Every var() chain in the icon, innermost fallback last.
_TONE_CHAINS = (
    "var(--ico-a, var(--muted, #7f7f88))",
    "var(--ico-b, var(--accent, #00c98d))",
)


def test_icon_is_well_formed_xml():
    import xml.etree.ElementTree as ET

    ET.parse(_ICON)  # raises ParseError if malformed


def test_icon_declares_a_square_size_of_at_least_256():
    """A store icon must be square and at least 256 across.

    The geometry lives on a 24 grid because the rail renders it at 16-34 px, and
    an svg needs no raster at any size -- but the declared width/height are what
    a reviewer and a layout without CSS constraints both read, and 24x24 reads
    as an icon too small for a store card. viewBox is deliberately NOT asserted:
    the drawing grid and the declared size are independent, and coupling them
    would force every stroke width to be retuned.
    """
    import re

    text = _ICON.read_text(encoding="utf-8")
    head = text[: text.index(">") + 1]
    width = re.search(r'\bwidth="(\d+)"', head)
    height = re.search(r'\bheight="(\d+)"', head)
    assert width and height, "the icon must declare explicit width and height"
    assert int(width.group(1)) == int(height.group(1)), (
        f"the icon must be square, found {width.group(1)}x{height.group(1)}"
    )
    assert int(width.group(1)) >= 256, (
        f"a store icon must be at least 256 across, found {width.group(1)}"
    )


# ---------------------------------------------------------------------------
# The PNG store icon (rule 4 in the module docstring).
#
# The store asks for a square PNG with transparency, 256x256 or larger. These
# checks read the actual file header rather than trusting the filename, because
# a resized or flattened export is exactly the kind of change that looks right
# in a diff and ships a black square on a black card.
# ---------------------------------------------------------------------------

_ICON_PNG = _APP_ROOT / "ui" / "brand" / "icon-512.png"


def _png_header(path: Path) -> tuple[int, int, int, int]:
    """(width, height, bit depth, colour type) from IHDR."""
    import struct

    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name} is not a PNG"
    width, height, depth, colour_type = struct.unpack(">IIBB", data[16:26])
    return width, height, depth, colour_type


def test_png_icon_is_square_and_at_least_256():
    width, height, _, _ = _png_header(_ICON_PNG)
    assert width == height, f"the store icon must be square, found {width}x{height}"
    assert width >= 256, f"a store icon must be at least 256 across, found {width}"


def test_png_icon_carries_an_alpha_channel():
    """Colour type 6 is RGBA, 4 is greyscale+alpha. A flattened export (2 or 0)
    would paint the icon's background onto every card that renders it.
    """
    _, _, _, colour_type = _png_header(_ICON_PNG)
    assert colour_type in (4, 6), (
        f"the store icon must keep its alpha channel, found colour type {colour_type}"
    )


def test_png_icon_carries_no_embedded_metadata():
    """A raster exported from a screenshot or an editor can carry the author,
    the tool, a timestamp or a full history in tEXt/iTXt/eXIf. None of that
    belongs in a published asset.
    """
    import struct

    data = _ICON_PNG.read_bytes()
    offset, found = 8, []
    while offset < len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        kind = data[offset + 4 : offset + 8].decode("ascii", "replace")
        if kind in ("tEXt", "iTXt", "zTXt", "eXIf", "tIME"):
            found.append(kind)
        offset += 12 + length
    assert found == [], f"the store icon carries metadata chunks: {found}"


# The digest of the SVG's drawing instructions at the time the PNG was last
# rendered. Update it in the same commit that regenerates the PNG, never on its
# own -- moving this line without re-rendering is exactly the drift the check
# exists to catch.
_ICON_GEOMETRY_SHA = "d5d1d2333f3f7662f5d7c4a3a5a72ec7a3e68efac0fecdcecf56d077ece1b4bc"


def _icon_geometry_digest() -> str:
    """Digest the icon's viewBox and path elements, and nothing else.

    Comments are excluded deliberately: the icon carries a long doc block that
    is edited far more often than the artwork, and tripping this check on a
    comment edit would train whoever hits it to update the constant without
    looking. What the raster actually bakes is the drawing grid, the path data,
    the stroke colours and the stroke widths -- so that is what is covered.
    """
    import hashlib
    import re

    markup = re.sub(
        r"<!--.*?-->", "", _ICON.read_text(encoding="utf-8"), flags=re.DOTALL
    )
    view_box = re.search(r'viewBox="([^"]+)"', markup)
    assert view_box, "the icon must declare a viewBox"
    elements = re.findall(r"<path\b[^>]*>", markup, flags=re.DOTALL)
    assert elements, "the icon must contain at least one path"
    payload = "|".join(
        [view_box.group(1)] + [re.sub(r"\s+", " ", el).strip() for el in elements]
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def test_png_icon_is_not_stale_relative_to_the_svg():
    """The one failure mode the two-file icon introduces.

    The PNG is generated FROM the SVG, so editing the artwork without
    re-rendering leaves the store showing the previous mark -- silently, since
    both files are valid and every other check still passes.
    """
    actual = _icon_geometry_digest()
    assert actual == _ICON_GEOMETRY_SHA, (
        "the icon's geometry changed but ui/brand/icon-512.png was not "
        "regenerated. Run `npm run icon:png` in ui/, confirm the render, then "
        f"set _ICON_GEOMETRY_SHA to '{actual}'"
    )


def test_store_icon_fields_name_the_png_and_the_rail_keeps_the_svg(manifest):
    """Rule 4. Unifying these onto one file is the tempting wrong move: the PNG
    on the rail is a soft downscale, and the SVG on a store card is an asset the
    store's own requirements reject.
    """
    assert manifest["iconPath"].endswith("icon-512.png"), (
        "iconPath feeds card-sized store surfaces and must name the PNG"
    )
    assert manifest["iconUrl"].endswith("icon-512.png"), (
        "iconUrl is the sideload form of the same asset"
    )
    rail_icons = [
        page.get("iconUrl") for page in manifest["ui"]["pages"] if page.get("iconUrl")
    ]
    assert rail_icons and all(value.endswith(".svg") for value in rail_icons), (
        f"the rail renders at 16-34 px and must stay vector, found {rail_icons}"
    )


def test_icon_has_no_double_hyphen_in_comments():
    """The specific way the icon broke once. Cheaper to assert than to explain."""
    import re

    text = _ICON.read_text(encoding="utf-8")
    for comment in re.findall(r"<!--(.*?)-->", text, re.DOTALL):
        assert "--" not in comment, (
            "an XML comment may not contain a double hyphen; this makes the "
            "icon malformed and it silently renders as a broken image"
        )


def test_icon_has_no_embedded_style_block():
    """A <style> inside the svg overrides the inherited colour unconditionally,
    so it would defeat the tone properties on any surface that DOES inline.
    """
    text = _ICON.read_text(encoding="utf-8")
    assert "<style" not in text, (
        "an embedded <style> can override the inherited colour and stop the "
        "icon following the dashboard theme where inlining is available"
    )


def test_icon_never_bottoms_out_at_currentColor():
    """THE regression that made the icon invisible in the sidebar.

    Rendered through an img tag, currentColor resolves against the svg's own
    document, where `color` is initial — black. Black strokes on a near-black
    rail read as an empty slot, with no console error and no broken-image glyph
    to hint at it.
    """
    import re

    text = _ICON.read_text(encoding="utf-8")
    markup = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    for attr, value in re.findall(r'(stroke|fill)="([^"]+)"', markup):
        if value == "none":
            continue
        assert "currentColor" not in value, (
            f'{attr}="{value}" bottoms out at currentColor; inside an img tag '
            f"that is black, which is invisible on the dark rail. End the "
            f"chain in a literal colour instead."
        )


def test_icon_bakes_a_literal_colour_as_its_last_resort():
    """Each painted shape must survive with no custom properties defined at all,
    because that is the ONLY context a sideloaded app icon is ever rendered in.
    """
    import re

    text = _ICON.read_text(encoding="utf-8")
    markup = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    painted = [v for a, v in re.findall(r'(stroke|fill)="([^"]+)"', markup) if v != "none"]
    assert painted, "the icon paints nothing"
    for value in painted:
        assert re.search(r"#[0-9a-fA-F]{3,8}\b", value), (
            f'{value!r} has no literal colour to fall back on; with no tone '
            f"properties defined the shape would not be painted"
        )


def test_icon_still_prefers_the_dashboard_tone_properties():
    """Keep the themed path in front of the literals.

    The literals are a fallback for the img delivery path, not a decision to
    stop theming. If a future dashboard inlines app icons — or this app ships as
    a builtin, whose URLs DO match the inline gate — the tones should take over
    on their own, with the brackets as structure (ico-a) and the x as the
    payload (ico-b).
    """
    text = _ICON.read_text(encoding="utf-8")
    for chain in _TONE_CHAINS:
        assert chain in text, f"expected the full fallback chain {chain!r}"
