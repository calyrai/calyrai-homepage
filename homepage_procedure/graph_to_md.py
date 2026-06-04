#!/usr/bin/env python3
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent
GRAPH_PATH = ROOT / "homepage_graph.yaml"
OUT_MD = ROOT / "homepage_full.md"


def _join_lines(lines):
    return "\n".join(lines).strip()


def _nav_block(items):
    out = []
    for it in items:
        out.append(f"- {it.get('label', '')}|{it.get('href', '#')}")
    return "\n".join(out)


def _require_node(nodes, node_id):
    node = nodes.get(node_id)
    if not isinstance(node, dict):
        raise ValueError(f"Missing node in graph.flow: {node_id}")
    return node


def main():
    data = yaml.safe_load(GRAPH_PATH.read_text(encoding="utf-8")) or {}
    graph = data.get("graph", {})
    nodes = graph.get("nodes", {})
    flow = graph.get("flow", [])

    if not isinstance(flow, list) or not flow:
        raise ValueError("graph.flow must be a non-empty list")

    flow_nodes = [_require_node(nodes, node_id) for node_id in flow]

    hero_nodes = [n for n in flow_nodes if n.get("type") == "hero"]
    nav_nodes = [n for n in flow_nodes if n.get("type") == "nav"]
    section_nodes = [n for n in flow_nodes if n.get("type") == "section"]

    if len(hero_nodes) < 2:
        raise ValueError("graph.flow must include at least two hero nodes (title, subtitle)")
    if len(nav_nodes) < 2:
        raise ValueError("graph.flow must include at least two nav nodes (top, bottom)")

    anim = nodes.get("animation", {}).get("params", {})

    lines = []
    lines.append("# CALYRAI Homepage Full Source")
    lines.append("")
    lines.append("## Hero Title")
    lines.append(hero_nodes[0].get("text", ""))
    lines.append("")
    lines.append("## Hero Subtitle")
    lines.append(hero_nodes[1].get("text", ""))
    lines.append("")
    lines.append("## Top Nav")
    lines.append(_nav_block(nav_nodes[0].get("items", [])))

    for sec in section_nodes:
        lines.append("")
        lines.append(f"## Section {sec.get('title', '').strip()}")
        lines.append(_join_lines(sec.get("body", [])))

    lines.append("")
    lines.append("## Bottom Nav")
    lines.append(_nav_block(nav_nodes[-1].get("items", [])))
    lines.append("")
    lines.append("## Animation")
    for key, value in anim.items():
        lines.append(f"{key}: {value}")

    OUT_MD.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    print(f"Wrote {OUT_MD}")


if __name__ == "__main__":
    main()
