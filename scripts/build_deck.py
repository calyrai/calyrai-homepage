#!/usr/bin/env python3
"""Build data/deck.js from data/deck.yaml.

Usage:
    python3 scripts/build_deck.py          # from any directory inside the repo
    python3 scripts/build_deck.py --check  # dry-run: print JS, do not write

Requires pyyaml:  pip install pyyaml
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


# ── helpers ──────────────────────────────────────────────────────────────────

def _die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(code)


def _load_yaml(path: Path) -> Any:
    try:
        import yaml  # type: ignore
    except ImportError:
        _die("pyyaml is not installed. Run: pip install pyyaml", code=2)

    if not path.exists():
        _die(f"YAML file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _validate_slide(idx: int, s: Any) -> dict[str, Any]:
    if not isinstance(s, dict):
        _die(f"slides[{idx}] must be a mapping")

    stype = s.get("type")
    valid_types = {"title", "statement", "equation", "coupling", "platforms", "papers"}
    if stype not in valid_types:
        _die(f"slides[{idx}].type must be one of {sorted(valid_types)}, got: {stype!r}")

    # Required fields per type
    required: dict[str, list[str]] = {
        "title":     ["kicker", "headline", "tagline"],
        "statement": ["kicker", "headline"],
        "equation":  ["kicker", "eq"],
        "coupling":  ["kicker", "headline"],
        "platforms": ["kicker", "title", "items"],
        "papers":    ["kicker", "title", "items"],
    }
    for field in required[stype]:
        if field not in s:
            _die(f"slides[{idx}] (type={stype!r}) is missing required field: {field!r}")

    # Validate links if present
    links = s.get("links")
    if links is not None:
        if not isinstance(links, list):
            _die(f"slides[{idx}].links must be a list")
        for li, lnk in enumerate(links):
            if not isinstance(lnk, dict):
                _die(f"slides[{idx}].links[{li}] must be a mapping")
            if "label" not in lnk:
                _die(f"slides[{idx}].links[{li}] is missing 'label'")
            if "href" not in lnk and "slide" not in lnk:
                _die(f"slides[{idx}].links[{li}] must have 'href' or 'slide'")

    # Validate items for platforms / papers
    items = s.get("items")
    if items is not None and not isinstance(items, list):
        _die(f"slides[{idx}].items must be a list")

    return dict(s)


def _render_js(slides: list[dict[str, Any]]) -> str:
    payload = json.dumps(slides, indent=2, ensure_ascii=False)
    lines = [
        "// data/deck.js",
        "// Generated from data/deck.yaml by scripts/build_deck.py",
        "// DO NOT EDIT DIRECTLY — edit deck.yaml instead.",
        "",
        "window.CALYR_DECK = " + payload + ";",
        "",
    ]
    return "\n".join(lines)


# ── main ─────────────────────────────────────────────────────────────────────

def main(argv: list[str]) -> int:
    check_only = "--check" in argv

    # Locate repo root: walk up from this script's location.
    root = Path(__file__).resolve().parent.parent  # apps/homepage/
    yaml_path = root / "data" / "deck.yaml"
    out_path  = root / "data" / "deck.js"

    raw = _load_yaml(yaml_path)
    if not isinstance(raw, dict):
        _die("deck.yaml must contain a top-level mapping")

    slides_raw = raw.get("slides")
    if not isinstance(slides_raw, list):
        _die("deck.yaml must contain a 'slides' list")

    slides = [_validate_slide(i, s) for i, s in enumerate(slides_raw)]
    js = _render_js(slides)

    if check_only:
        print(js)
        return 0

    out_path.write_text(js, encoding="utf-8")
    print(f"✔ deck.js written ({len(slides)} slides) → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
