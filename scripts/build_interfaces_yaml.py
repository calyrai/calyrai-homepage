#!/usr/bin/env python3

from __future__ import annotations

import json
from pathlib import Path
import sys


def _read_yaml(path: Path) -> dict:
    try:
        import yaml  # type: ignore
    except Exception as exc:
        print(f"ERROR: pyyaml is required ({exc})", file=sys.stderr)
        raise SystemExit(2)

    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        print(f"ERROR: failed to parse YAML {path}: {exc}", file=sys.stderr)
        raise SystemExit(1)

    if not isinstance(data, dict):
        print(f"ERROR: YAML root must be a mapping: {path}", file=sys.stderr)
        raise SystemExit(1)
    return data


def _write_js(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    js = "// Generated from data/interfaces.yaml by scripts/build_interfaces_yaml.py\n\n"
    js += "window.CALYR_INTERFACES = " + json.dumps(payload, indent=2, ensure_ascii=False) + ";\n"
    path.write_text(js, encoding="utf-8")


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    src = root / "data" / "interfaces.yaml"
    raw = _read_yaml(src)
    items = raw.get("interfaces")
    if not isinstance(items, list):
        print("ERROR: 'interfaces' must be a list", file=sys.stderr)
        return 1

    payload = {
        "schema_version": raw.get("schema_version", 1),
        "interfaces": {item["id"]: item for item in items if isinstance(item, dict) and "id" in item},
    }

    _write_js(root / "data" / "interfaces.js", payload)
    _write_js(root / "src" / "data" / "interfaces.js", payload)
    print("Generated interfaces.js in data/ and src/data/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())