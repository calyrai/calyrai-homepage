#!/usr/bin/env python3
"""Build data/publications.js from data/publications.yaml.

Usage:
    python3 scripts/build_publications.py         # write data/publications.js
    python3 scripts/build_publications.py --check # dry-run, print JS only

Requires pyyaml:  pip install pyyaml
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


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


_VALID_STATUS = {"active", "progress", "staged"}


def _validate_network(raw: Any, manuscripts: list[dict[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {"title": "Publication Network", "subtitle": "", "edges": []}
    if raw is None:
        return out
    if not isinstance(raw, dict):
        _die("publications.yaml field 'network' must be a mapping")

    ids = {m["id"] for m in manuscripts}
    title = raw.get("title")
    subtitle = raw.get("subtitle")
    edges = raw.get("edges", [])

    if isinstance(title, str) and title.strip():
        out["title"] = title.strip()
    if isinstance(subtitle, str):
        out["subtitle"] = subtitle.strip()
    if not isinstance(edges, list):
        _die("publications.yaml field 'network.edges' must be a list")

    validated_edges = []
    for ei, edge in enumerate(edges):
        if not isinstance(edge, dict):
            _die(f"network.edges[{ei}] must be a mapping")
        src = edge.get("from")
        dst = edge.get("to")
        if not src or not dst:
            _die(f"network.edges[{ei}] must contain 'from' and 'to'")
        src = str(src)
        dst = str(dst)
        if src not in ids:
            _die(f"network.edges[{ei}].from references unknown manuscript id: {src!r}")
        if dst not in ids:
            _die(f"network.edges[{ei}].to references unknown manuscript id: {dst!r}")
        validated_edges.append({"from": src, "to": dst})
    out["edges"] = validated_edges
    return out


def _validate(idx: int, m: Any) -> dict[str, Any]:
    if not isinstance(m, dict):
        _die(f"manuscripts[{idx}] must be a mapping")
    for req in ("id", "title", "status"):
        if not m.get(req):
            _die(f"manuscripts[{idx}] is missing required field: {req!r}")
    status = m["status"]
    if status not in _VALID_STATUS:
        _die(f"manuscripts[{idx}].status must be one of {sorted(_VALID_STATUS)}, got: {status!r}")
    pdfs = m.get("pdfs", [])
    if not isinstance(pdfs, list):
        _die(f"manuscripts[{idx}].pdfs must be a list")
    for pi, pdf in enumerate(pdfs):
        if not isinstance(pdf, dict) or not pdf.get("label") or not pdf.get("path"):
            _die(f"manuscripts[{idx}].pdfs[{pi}] must have 'label' and 'path'")
    out: dict[str, Any] = {
        "id":     str(m["id"]),
        "title":  str(m["title"]),
        "topic":  str(m.get("topic", "")),
        "status": status,
        "pdfs":   [{"label": str(p["label"]), "path": str(p["path"])} for p in pdfs],
    }
    if "published" in m:
        if not isinstance(m["published"], bool):
            _die(f"manuscripts[{idx}].published must be a boolean when present")
        out["published"] = m["published"]
    for optional in ("doi", "arxiv", "archive_url", "method", "abstract"):
        value = m.get(optional)
        if isinstance(value, str) and value.strip():
            out[optional] = value.strip()
    desc = m.get("description")
    if isinstance(desc, str) and desc.strip():
        out["description"] = desc.strip()
    return out


def _render_js(manuscripts: list[dict[str, Any]], network: dict[str, Any]) -> str:
    manuscripts_payload = json.dumps(manuscripts, indent=2, ensure_ascii=False)
    network_payload = json.dumps(network, indent=2, ensure_ascii=False)
    return "\n".join([
        "// data/publications.js",
        "// Generated from data/publications.yaml by scripts/build_publications.py",
        "// DO NOT EDIT DIRECTLY — edit publications.yaml instead.",
        "",
        "window.CALYR_PUBLICATION_NETWORK = " + network_payload + ";",
        "window.CALYR_PUBLICATIONS = " + manuscripts_payload + ";",
        "",
    ])


def main(argv: list[str]) -> int:
    check_only = "--check" in argv
    root = Path(__file__).resolve().parent.parent  # apps/homepage/
    yaml_path = root / "data" / "publications.yaml"
    out_path  = root / "data" / "publications.js"

    raw = _load_yaml(yaml_path)
    if not isinstance(raw, dict):
        _die("publications.yaml must contain a top-level mapping")

    items_raw = raw.get("manuscripts")
    if not isinstance(items_raw, list):
        _die("publications.yaml must contain a 'manuscripts' list")

    manuscripts = [_validate(i, m) for i, m in enumerate(items_raw)]
    network = _validate_network(raw.get("network"), manuscripts)
    js = _render_js(manuscripts, network)

    if check_only:
        print(js)
        return 0

    out_path.write_text(js, encoding="utf-8")
    print(f"✔ publications.js written ({len(manuscripts)} entries) → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
