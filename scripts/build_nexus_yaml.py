#!/usr/bin/env python3

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
    except Exception:
        _die(
            "Python package 'pyyaml' is not installed. Run: python3 -m pip install -r scripts/requirements.txt",
            code=2,
        )

    if not path.exists():
        _die(f"YAML file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _write_json(path: Path, obj: Any) -> None:
    _write_text(path, json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


def _as_str(x: Any, field: str) -> str:
    if x is None:
        return ""
    if not isinstance(x, str):
        _die(f"Field '{field}' must be a string")
    return x


def _build_projects(cfg: dict[str, Any], projects_fallback_yaml: Path) -> list[dict[str, Any]]:
    core = cfg.get("core_node")
    if not isinstance(core, dict):
        _die("nexus.yaml must contain a mapping 'core_node'")

    projects: list[dict[str, Any]] = []

    core_entry: dict[str, Any] = {
        "id": _as_str(core.get("id"), "core_node.id"),
        "title": _as_str(core.get("title"), "core_node.title"),
    }

    subtitle = core.get("subtitle")
    if isinstance(subtitle, str) and subtitle.strip():
        core_entry["subtitle"] = subtitle.strip()

    url = core.get("url")
    if isinstance(url, str) and url.strip():
        core_entry["url"] = url.strip()

    color = core.get("color")
    if isinstance(color, str) and color.strip():
        core_entry["color"] = color.strip()

    desc = core.get("description")
    if isinstance(desc, list) and all(isinstance(x, str) for x in desc):
        core_entry["text"] = [x.strip() for x in desc if x.strip()]

    if not core_entry["id"] or not core_entry["title"]:
        _die("core_node.id and core_node.title are required")

    projects.append(core_entry)

    cfg_projects = cfg.get("projects")

    if cfg_projects is None:
        parsed = _load_yaml(projects_fallback_yaml)
        if not isinstance(parsed, list):
            _die(f"Fallback projects YAML must be a list: {projects_fallback_yaml}")
        cfg_projects = parsed

    if not isinstance(cfg_projects, list):
        _die("'projects' must be a list (or omitted to use fallback projects_public.yaml)")

    for idx, p in enumerate(cfg_projects):
        if not isinstance(p, dict):
            _die(f"projects[{idx}] must be a mapping")

        pid = _as_str(p.get("id"), f"projects[{idx}].id").strip()
        title = _as_str(p.get("title"), f"projects[{idx}].title").strip()
        if not pid or not title:
            _die(f"projects[{idx}] requires non-empty id/title")

        out: dict[str, Any] = {"id": pid, "title": title}

        for key in ("subtitle", "url", "color"):
            v = p.get(key)
            if isinstance(v, str) and v.strip():
                out[key] = v.strip()

        projects.append(out)

    # De-duplicate by id (first wins).
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for p in projects:
        pid = str(p.get("id", ""))
        if pid in seen:
            continue
        seen.add(pid)
        deduped.append(p)

    return deduped


def _render_projects_js(projects: list[dict[str, Any]]) -> str:
    payload = json.dumps(projects, indent=2, ensure_ascii=False)
    return (
        "// data/projects.js\n"
        "// Generated from data/nexus.yaml by scripts/build_nexus_yaml.py\n\n"
        "window.CALYR_PROJECTS = "
        + payload
        + ";\n"
    )


def _build_contact_html(cfg: dict[str, Any]) -> str:
    identity = cfg.get("identity")
    if not isinstance(identity, dict):
        return ""

    name = identity.get("name")
    role = identity.get("role")

    contact = identity.get("contact")
    email = ""
    bluesky = ""
    if isinstance(contact, dict):
        email = str(contact.get("email") or "").strip()
        bluesky = str(contact.get("bluesky") or "").strip()

    # Keep the block minimal; Nexus already has a top-nav contact.
    lines: list[str] = [
        '<section class="nexus-block" aria-label="Contact">',
        '  <h2 class="nexus-h2">Contact</h2>',
        "",
        '  <p class="nexus-body">',
        f"    {name}<br>" if isinstance(name, str) and name.strip() else "",
        f"    {role}<br>" if isinstance(role, str) and role.strip() else "",
        "  </p>",
    ]

    if email:
        lines += [
            "",
            '  <p class="nexus-body">',
            f'    <a href="mailto:{email}" class="glow-link">{email}</a>',
            "  </p>",
        ]

    if bluesky:
        lines += [
            "",
            '  <p class="nexus-body">',
            f'    <a href="{bluesky}" class="glow-link">Bluesky</a>',
            "  </p>",
        ]

    lines.append("</section>")

    # Remove empty strings introduced above.
    return "\n".join([ln for ln in lines if ln != ""]) + "\n"


def _inject_contact_into_nexus_page(cfg: dict[str, Any], src_nexus_html: Path) -> None:
    marker = "<!-- CALYR_CONTACT_BLOCK -->"
    if not src_nexus_html.exists():
        return

    html = src_nexus_html.read_text(encoding="utf-8")
    if marker not in html:
        return

    contact_html = _build_contact_html(cfg)
    html = html.replace(marker, contact_html)
    src_nexus_html.write_text(html, encoding="utf-8")


def _write_nexus_edges(cfg: dict[str, Any], out_edges_json: Path) -> None:
    nexus = cfg.get("nexus")
    if not isinstance(nexus, dict):
        return
    conns = nexus.get("connections")
    if not isinstance(conns, list):
        return

    edges: list[dict[str, str]] = []
    for idx, c in enumerate(conns):
        if not isinstance(c, dict):
            _die(f"nexus.connections[{idx}] must be a mapping")
        a = str(c.get("from") or "").strip()
        b = str(c.get("to") or "").strip()
        if not a or not b:
            _die(f"nexus.connections[{idx}] requires 'from' and 'to'")
        edges.append({"from": a, "to": b})

    _write_json(out_edges_json, edges)


def main(argv: list[str]) -> int:
    root = Path(__file__).resolve().parent.parent
    yaml_path = root / "src" / "data" / "nexus.yaml"

    cfg_raw = _load_yaml(yaml_path)
    if not isinstance(cfg_raw, dict):
        _die("nexus.yaml must contain a top-level mapping")

    projects_fallback_yaml = root / "src" / "data" / "projects_public.yaml"
    projects = _build_projects(cfg_raw, projects_fallback_yaml=projects_fallback_yaml)

    out_projects_js = root / "src" / "data" / "projects.js"
    out_projects_json = root / "src" / "data" / "projects.json"

    _write_text(out_projects_js, _render_projects_js(projects))
    _write_json(out_projects_json, projects)

    # Optional: keep a Nexus-specific edge list in sync.
    out_edges_json = root / "src" / "data" / "nexus" / "edges.json"
    _write_nexus_edges(cfg_raw, out_edges_json=out_edges_json)

    # Optional: inject identity contact into the generated Nexus page (build-time).
    _inject_contact_into_nexus_page(cfg_raw, src_nexus_html=root / "src" / "pages" / "nexus.html")

    print(f"✔ projects.js generated ({out_projects_js.relative_to(root)})")
    print(f"✔ projects.json generated ({out_projects_json.relative_to(root)})")
    if out_edges_json.exists():
        print(f"✔ nexus edges updated ({out_edges_json.relative_to(root)})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
