#!/usr/bin/env python3

from __future__ import annotations

import json
import re
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
SOURCE_YAML = ROOT / "src" / "data" / "epistemic_damage_homepage.yaml"
TARGET_JSONS = [
    ROOT / "src" / "data" / "epistemic_damage_homepage.json",
    ROOT / "data" / "epistemic_damage_homepage.json",
]
HTML_TARGETS = [
    ROOT / "src" / "projects" / "epistemic_damage.html",
    ROOT / "projects" / "epistemic_damage.html",
    ROOT / "public" / "projects" / "epistemic_damage.html",
]
SCRIPT_ID = "epistemic-damage-homepage-json"


def load_yaml() -> dict[str, object]:
    payload = yaml.safe_load(SOURCE_YAML.read_text(encoding="utf-8")) or {}
    if not isinstance(payload, dict):
        raise SystemExit("epistemic_damage_homepage.yaml must contain a mapping at the top level")
    return payload


def write_json(payload: dict[str, object]) -> None:
    content = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    for path in TARGET_JSONS:
      path.parent.mkdir(parents=True, exist_ok=True)
      path.write_text(content, encoding="utf-8")


def sync_embedded_json(payload: dict[str, object]) -> None:
    replacement = (
        f'<script id="{SCRIPT_ID}" type="application/json">\n'
        f'{json.dumps(payload, indent=2, ensure_ascii=False)}\n'
        f'</script>'
    )
    pattern = re.compile(
        rf'<script id="{re.escape(SCRIPT_ID)}" type="application/json">\s*.*?\s*</script>',
        re.DOTALL,
    )

    for path in HTML_TARGETS:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        updated = pattern.sub(lambda _match: replacement, text, count=1)
        if updated != text:
            path.write_text(updated, encoding="utf-8")


def main() -> int:
    payload = load_yaml()
    write_json(payload)
    sync_embedded_json(payload)
    print(f"Built homepage metadata from {SOURCE_YAML}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
