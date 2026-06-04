#!/usr/bin/env python3
"""Compile homepage knowledge graph + projection rules into v2/homepage.yaml."""

from pathlib import Path
from typing import Any, Dict, List
from datetime import datetime, timezone
import json
import yaml

ROOT = Path(__file__).resolve().parents[1]
GRAPH_PATH = ROOT / "content" / "homepage_knowledge_graph.yaml"
RULES_PATH = ROOT / "content" / "homepage_projection_rules.yaml"
OUT_PATH = ROOT / "v2" / "homepage.yaml"
STATE_PATH = ROOT / ".build" / "animation_state.json"
CHANGELOG_PATH = ROOT / "content" / "animation_change_log.md"


def block_lines(text: str, indent: int) -> List[str]:
    pad = "  " * indent
    out = [f"{pad}|"]
    for ln in str(text or "").splitlines():
        out.append(f"{pad}  {ln}")
    return out


def dump_scalar(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return f'"{str(value).replace("\"", "\\\"")}"'


def get_system_section(system_id: str, systems: Dict[str, Any]) -> Dict[str, Any]:
    node = systems.get(system_id, {}) if isinstance(systems, dict) else {}
    title = node.get("title", system_id.capitalize())
    role = node.get("role", "")
    purpose = node.get("purpose", "")
    inputs = node.get("inputs", [])
    outputs = node.get("outputs", [])

    body_lines = []
    if role:
        body_lines.append(f"Role: {role}.")
    if purpose:
        body_lines.extend([ln.strip() for ln in str(purpose).splitlines() if ln.strip()])
    if inputs:
        body_lines.append(f"Inputs: {', '.join(map(str, inputs))}.")
    if outputs:
        body_lines.append(f"Outputs: {', '.join(map(str, outputs))}.")

    return {
        "title": title,
        "body": "\n".join(body_lines).strip() or title,
    }


def project(graph: Dict[str, Any], rules: Dict[str, Any]) -> str:
    homepage = graph.get("homepage", {}) if isinstance(graph, dict) else {}
    projection = (rules.get("projection", {}) or {}).get("homepage_v2", {})

    identity = homepage.get("identity", {}) if isinstance(homepage.get("identity"), dict) else {}
    systems = homepage.get("systems", {}) if isinstance(homepage.get("systems"), dict) else {}
    animation = homepage.get("animation", {}) if isinstance(homepage.get("animation"), dict) else {}

    layout = projection.get("layout", {}) if isinstance(projection.get("layout"), dict) else {}
    layers = projection.get("layers", {}) if isinstance(projection.get("layers"), dict) else {}
    nav = projection.get("nav", {}) if isinstance(projection.get("nav"), dict) else {}

    section_order = projection.get("section_order", []) if isinstance(projection.get("section_order"), list) else []
    section_colors = projection.get("section_colors", {}) if isinstance(projection.get("section_colors"), dict) else {}

    lines: List[str] = []

    lines.append("layout:")
    lines.append(f"  mode: {dump_scalar(layout.get('mode', 'design'))}")
    lines.append("  grid:")
    grid = layout.get("grid", {}) if isinstance(layout.get("grid"), dict) else {}
    lines.append(f"    spacing_cm: {dump_scalar(grid.get('spacing_cm', 1))}")
    lines.append(f"    color: {dump_scalar(grid.get('color', '#fff'))}")
    lines.append(f"    dot_radius_px: {dump_scalar(grid.get('dot_radius_px', 0.7))}")

    lines.append("layers:")
    for key in ["swirl_joystick", "particle_field"]:
        cfg = layers.get(key, {}) if isinstance(layers.get(key), dict) else {}
        lines.append(f"  {key}:")
        for k, v in cfg.items():
            lines.append(f"    {k}: {dump_scalar(v)}")

    lines.append("hero:")
    lines.append(f"  title: {dump_scalar(identity.get('hero_title', 'Adaptive surrogate systems for complex reality.'))}")
    lines.append("  subtitle: |")
    for ln in str(identity.get("hero_subtitle", "")).splitlines():
        lines.append(f"    {ln}")
    lines.append("  cta:")
    lines.append("    text: \"Explore the system\"")
    lines.append("    href: \"#explore\"")

    lines.append("nav:")
    lines.append("  top:")
    for item in nav.get("top", []):
        lines.append(f"    - label: {dump_scalar(item.get('label', ''))}")
        lines.append(f"      href: {dump_scalar(item.get('href', '#'))}")
    lines.append("  bottom:")
    for item in nav.get("bottom", []):
        lines.append(f"    - label: {dump_scalar(item.get('label', ''))}")
        lines.append(f"      href: {dump_scalar(item.get('href', '#'))}")

    lines.append("explore_sections:")
    for sid in section_order:
        sec = get_system_section(str(sid), systems)
        lines.append(f"  - title: {dump_scalar(sec['title'])}")
        lines.append(f"    color: {dump_scalar(section_colors.get(str(sid), '#ffffff'))}")
        lines.append("    body: |")
        for ln in sec["body"].splitlines():
            lines.append(f"      {ln}")

    particle_runtime = animation.get("particle_runtime", {}) if isinstance(animation.get("particle_runtime"), dict) else {}
    flow_patterns = animation.get("flow_patterns", {}) if isinstance(animation.get("flow_patterns"), dict) else {}
    flow_presets = flow_patterns.get("presets", {}) if isinstance(flow_patterns.get("presets"), dict) else {}
    reactgraph_capture = animation.get("reactgraph_capture", {}) if isinstance(animation.get("reactgraph_capture"), dict) else {}

    lines.append("animation:")
    lines.append("  particle_runtime:")
    for key, value in particle_runtime.items():
        lines.append(f"    {key}: {dump_scalar(value)}")

    lines.append("  flow_patterns:")
    lines.append(f"    mode: {dump_scalar(flow_patterns.get('mode', 'auto'))}")
    lines.append(f"    adaptivity: {dump_scalar(flow_patterns.get('adaptivity', 0.7))}")
    lines.append(f"    blend_strength: {dump_scalar(flow_patterns.get('blend_strength', 0.75))}")
    lines.append("    presets:")
    for pname in ["spiral", "beam", "vortex", "weave", "radial"]:
        preset = flow_presets.get(pname, {}) if isinstance(flow_presets.get(pname), dict) else {}
        lines.append(f"      {pname}:")
        for k, v in preset.items():
            lines.append(f"        {k}: {dump_scalar(v)}")

    lines.append("  reactgraph_capture:")
    for key, value in reactgraph_capture.items():
        lines.append(f"    {key}: {dump_scalar(value)}")

    return "\n".join(lines) + "\n"


def flatten(d: Dict[str, Any], parent: str = "") -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k, v in d.items():
        key = f"{parent}.{k}" if parent else str(k)
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out


def load_state() -> Dict[str, Any]:
    if not STATE_PATH.exists():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(state: Dict[str, Any]) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")


def append_change_log(changes: List[str]) -> None:
    if not changes:
        return
    ts = datetime.now(timezone.utc).isoformat()
    lines = [f"\n## {ts}", ""]
    lines.extend([f"- {c}" for c in changes])
    if not CHANGELOG_PATH.exists():
        CHANGELOG_PATH.write_text("# Animation Change Log\n", encoding="utf-8")
    with CHANGELOG_PATH.open("a", encoding="utf-8") as fp:
        fp.write("\n".join(lines) + "\n")


def monitor_animation_changes(graph: Dict[str, Any]) -> None:
    homepage = graph.get("homepage", {}) if isinstance(graph, dict) else {}
    animation = homepage.get("animation", {}) if isinstance(homepage.get("animation"), dict) else {}
    current_flat = flatten(animation)

    previous_state = load_state()
    previous_flat = previous_state.get("animation", {}) if isinstance(previous_state, dict) else {}

    all_keys = sorted(set(current_flat.keys()) | set(previous_flat.keys()))
    changes: List[str] = []
    for key in all_keys:
        old = previous_flat.get(key, "<missing>")
        new = current_flat.get(key, "<missing>")
        if old != new:
            changes.append(f"{key}: {old} -> {new}")

    if changes:
        append_change_log(changes)

    save_state({"animation": current_flat})


def main() -> None:
    graph = yaml.safe_load(GRAPH_PATH.read_text(encoding="utf-8")) or {}
    rules = yaml.safe_load(RULES_PATH.read_text(encoding="utf-8")) or {}
    monitor_animation_changes(graph)
    output = project(graph, rules)
    OUT_PATH.write_text(output, encoding="utf-8")
    print(f"Wrote {OUT_PATH} from graph")


if __name__ == "__main__":
    main()
