#!/usr/bin/env python3

from __future__ import annotations

import hashlib
import json
import math
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

WIKI_LINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
HEADING_RE = re.compile(r"^(#{2,3})\s+(.+?)\s*$")


@dataclass
class Section:
    id: str
    title: str
    level: int
    text: str


@dataclass
class Paper:
    id: str
    title: str
    subtitle: str
    glyph: str
    cluster: str
    tags: list[str]
    abstract: str
    references: list[str]
    path: str
    raw_body: str
    sections: list[Section]


def slugify(value: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return base or "untitled"


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    frontmatter_text = text[4:end]
    body = text[end + 5 :]
    loaded = yaml.safe_load(frontmatter_text) or {}
    if not isinstance(loaded, dict):
        return {}, body
    return loaded, body


def parse_sections(body: str) -> list[Section]:
    lines = body.splitlines()
    matches: list[tuple[int, int, str]] = []
    for idx, line in enumerate(lines):
        m = HEADING_RE.match(line)
        if not m:
            continue
        level = len(m.group(1))
        title = m.group(2).strip()
        matches.append((idx, level, title))

    sections: list[Section] = []
    for i, (start_idx, level, title) in enumerate(matches):
        end_idx = matches[i + 1][0] if i + 1 < len(matches) else len(lines)
        text = "\n".join(lines[start_idx + 1 : end_idx]).strip()
        sections.append(Section(id=slugify(title), title=title, level=level, text=text))
    return sections


def build_deeper_structure(sections: list[Section]) -> list[dict[str, Any]]:
    grouped: list[dict[str, Any]] = []
    current_parent: dict[str, Any] | None = None
    for section in sections:
        node = {
            "id": section.id,
            "title": section.title,
            "level": section.level,
            "children": [],
        }
        if section.level == 2:
            grouped.append(node)
            current_parent = node
            continue
        if section.level == 3 and current_parent is not None:
            current_parent["children"].append(node)
            continue
        grouped.append(node)
        current_parent = node
    return grouped


def extract_abstract(meta: dict[str, Any], sections: list[Section]) -> str:
    abstract = str(meta.get("abstract", "")).strip()
    if abstract:
        return abstract
    for section in sections:
        if section.id == "abstract" and section.text:
            first_paragraph = section.text.split("\n\n", 1)[0].strip()
            if first_paragraph:
                return first_paragraph
    return ""


def to_str_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value:
        s = str(item).strip()
        if s:
            out.append(s)
    return out


def load_paper(path: Path, root: Path) -> Paper:
    raw = path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(raw)

    paper_id = str(meta.get("id", "")).strip() or slugify(path.stem)
    title = str(meta.get("title", "")).strip() or path.stem
    subtitle = str(meta.get("subtitle", "")).strip()
    glyph = str(meta.get("glyph", "")).strip()
    cluster = str(meta.get("cluster", "")).strip()
    tags = to_str_list(meta.get("tags"))
    references = to_str_list(meta.get("references"))
    sections = parse_sections(body)
    abstract = extract_abstract(meta, sections)
    if not subtitle:
        subtitle = abstract[:140].strip() if abstract else f"{title} paper"

    return Paper(
        id=paper_id,
        title=title,
        subtitle=subtitle,
        glyph=glyph,
        cluster=cluster,
        tags=tags,
        abstract=abstract,
        references=references,
        path=str(path.relative_to(root)).replace("\\", "/"),
        raw_body=body,
        sections=sections,
    )


def parse_link_target(raw: str, current_paper_id: str) -> tuple[str, str]:
    target = raw.strip()
    if "|" in target:
        target = target.split("|", 1)[0].strip()

    if target.endswith(".md"):
        target = slugify(Path(target).stem)

    if target.startswith("#"):
        return current_paper_id, slugify(target[1:])

    if "#" in target:
        paper, section = target.split("#", 1)
        return slugify(paper), slugify(section)

    return slugify(target), ""


def collect_links(text: str) -> list[str]:
    return [m.group(1).strip() for m in WIKI_LINK_RE.finditer(text)]


def _paper_id_from_node_id(node_id: str) -> str:
    return node_id.split("::", 1)[0] if "::" in node_id else node_id


def _degree_to_color(normalized_degree: float) -> str:
    # Map low connectivity to cyan and high connectivity to magenta.
    hue = 190.0 + (320.0 - 190.0) * normalized_degree
    return f"hsl({hue:.1f} 78% 58%)"


def _stable_angle(paper_id: str) -> float:
    digest = hashlib.sha1(paper_id.encode("utf-8")).digest()
    raw = int.from_bytes(digest[:4], "big")
    return (raw / 0xFFFFFFFF) * math.tau


def build_graph(papers: list[Paper]) -> dict[str, Any]:
    paper_ids = {paper.id for paper in papers}
    papers_by_id = {paper.id: paper for paper in papers}

    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []

    for paper in papers:
        nodes.append(
            {
                "id": paper.id,
                "type": "paper",
                "title": paper.title,
                "subtitle": paper.subtitle,
                "glyph": paper.glyph,
                "cluster": paper.cluster,
                "tags": paper.tags,
                "abstract": paper.abstract,
                "path": paper.path,
                "deeper_structure": build_deeper_structure(paper.sections),
            }
        )

        section_ids: set[str] = set()
        for section in paper.sections:
            section_node_id = f"{paper.id}::{section.id}"
            section_ids.add(section_node_id)
            nodes.append(
                {
                    "id": section_node_id,
                    "type": "section",
                    "paper_id": paper.id,
                    "section_id": section.id,
                    "title": section.title,
                    "level": section.level,
                }
            )
            edges.append(
                {
                    "id": f"contains:{paper.id}->{section_node_id}",
                    "type": "contains",
                    "source": paper.id,
                    "target": section_node_id,
                }
            )

        for ref in paper.references:
            target_id = slugify(ref)
            edges.append(
                {
                    "id": f"paper_ref:{paper.id}->{target_id}",
                    "type": "paper_ref",
                    "source": paper.id,
                    "target": target_id,
                    "resolved": target_id in paper_ids,
                }
            )

        for raw_link in collect_links(paper.raw_body):
            target_paper, target_section = parse_link_target(raw_link, paper.id)
            if target_section:
                edges.append(
                    {
                        "id": f"paper_link:{paper.id}->{target_paper}::{target_section}",
                        "type": "paper_link",
                        "source": paper.id,
                        "target": f"{target_paper}::{target_section}",
                        "resolved": f"{target_paper}::{target_section}" in section_ids or target_paper in paper_ids,
                    }
                )
            else:
                edges.append(
                    {
                        "id": f"paper_link:{paper.id}->{target_paper}",
                        "type": "paper_link",
                        "source": paper.id,
                        "target": target_paper,
                        "resolved": target_paper in paper_ids,
                    }
                )

        for section in paper.sections:
            source_section_node_id = f"{paper.id}::{section.id}"
            for raw_link in collect_links(section.text):
                target_paper, target_section = parse_link_target(raw_link, paper.id)
                target_node = f"{target_paper}::{target_section}" if target_section else target_paper
                edges.append(
                    {
                        "id": f"section_link:{source_section_node_id}->{target_node}",
                        "type": "section_link",
                        "source": source_section_node_id,
                        "target": target_node,
                    }
                )

    unique_edges: dict[str, dict[str, Any]] = {}
    for edge in edges:
        unique_edges[edge["id"]] = edge

    adjacency: dict[str, set[str]] = {paper_id: set() for paper_id in paper_ids}
    for edge in unique_edges.values():
        src_paper = _paper_id_from_node_id(edge["source"])
        dst_paper = _paper_id_from_node_id(edge["target"])
        if src_paper == dst_paper:
            continue
        if src_paper in adjacency and dst_paper in adjacency:
            adjacency[src_paper].add(dst_paper)
            adjacency[dst_paper].add(src_paper)

    degrees = {paper_id: len(neighbors) for paper_id, neighbors in adjacency.items()}
    max_degree = max(degrees.values(), default=1)
    min_radius = 120.0
    max_radius = 520.0

    for node in nodes:
        if node["type"] != "paper":
            continue
        paper_id = node["id"]
        degree = degrees.get(paper_id, 0)
        normalized_degree = degree / max_degree if max_degree else 0.0

        # Highly connected papers are placed nearer the center.
        radius = max_radius - (max_radius - min_radius) * normalized_degree
        angle = _stable_angle(paper_id)
        x = round(math.cos(angle) * radius, 2)
        y = round(math.sin(angle) * radius, 2)

        node["position"] = {"x": x, "y": y}
        node["color"] = _degree_to_color(normalized_degree)
        node["connectivity"] = {
            "degree": degree,
            "normalized_degree": round(normalized_degree, 4),
            "neighbors": sorted(adjacency.get(paper_id, set())),
        }

        paper = papers_by_id.get(paper_id)
        if paper is not None and not node.get("subtitle"):
            node["subtitle"] = paper.subtitle

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "paper_count": len([n for n in nodes if n["type"] == "paper"]),
            "section_count": len([n for n in nodes if n["type"] == "section"]),
            "edge_count": len(unique_edges),
        },
        "nodes": nodes,
        "edges": list(unique_edges.values()),
    }


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    papers_dir = root / "knowledge_network" / "papers"
    out_path = root / "knowledge_network" / "build" / "atlas.json"

    if not papers_dir.exists():
        raise FileNotFoundError(f"Missing papers directory: {papers_dir}")

    papers = [load_paper(path, root) for path in sorted(papers_dir.rglob("*.md"))]
    graph = build_graph(papers)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(graph, ensure_ascii=True, indent=2), encoding="utf-8")

    print(f"Generated {out_path}")
    print(
        "Nodes: "
        f"{graph['stats']['paper_count']} papers, "
        f"{graph['stats']['section_count']} sections | "
        f"Edges: {graph['stats']['edge_count']}"
    )


if __name__ == "__main__":
    main()
