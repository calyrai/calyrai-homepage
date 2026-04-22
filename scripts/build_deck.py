#!/usr/bin/env python3
"""Build a deck JS payload from a deck YAML source.

Usage:
    python3 scripts/build_deck.py
    python3 scripts/build_deck.py --check
    python3 scripts/build_deck.py data/my-deck.yaml data/my-deck.js
    python3 scripts/build_deck.py data/my-deck.yaml --check

Requires pyyaml:  pip install pyyaml
"""

from __future__ import annotations

import json
import sys
import argparse
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
    valid_types = {"title", "statement", "equation", "coupling", "platforms", "papers", "figure"}
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
        "figure":    ["kicker", "headline", "image"],
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


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("yaml_path", nargs="?", help="Path to the source YAML deck")
    parser.add_argument("out_path", nargs="?", help="Path to the generated JS payload")
    parser.add_argument("--check", action="store_true", help="Print the JS without writing it")
    return parser.parse_args(argv)


# ── main ─────────────────────────────────────────────────────────────────────

def main(argv: list[str]) -> int:
    args = _parse_args(argv)
    check_only = args.check

    # Locate repo root: walk up from this script's location.
    root = Path(__file__).resolve().parent.parent  # apps/homepage/
    yaml_path = (root / args.yaml_path).resolve() if args.yaml_path else root / "data" / "deck.yaml"
    if args.out_path:
        out_path = (root / args.out_path).resolve()
    elif args.yaml_path:
        out_path = yaml_path.with_suffix(".js")
    else:
        out_path = root / "data" / "deck.js"

    if yaml_path.suffix.lower() != ".yaml":
        _die(f"YAML source must end with .yaml, got: {yaml_path}")
    if out_path.suffix.lower() != ".js":
        _die(f"Output path must end with .js, got: {out_path}")

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

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(js, encoding="utf-8")
    print(f"✔ deck.js written ({len(slides)} slides) → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
