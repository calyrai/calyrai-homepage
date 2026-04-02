#!/usr/bin/env python3

from __future__ import annotations

import json
import math
import random
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = ROOT / "src" / "data" / "epistemic_damage_publications.yaml"
OUT_PATHS = [
    ROOT / "src" / "data" / "epistemic_damage_publications.json",
    ROOT / "data" / "epistemic_damage_publications.json",
]

VIEWBOX_WIDTH = 1120
VIEWBOX_HEIGHT = 520
PADDING = 90
OPENALEX_BASE = "https://api.openalex.org"
MAILTO = "rupert.tscheliessnig@calyr.ai"


def read_yaml(path: Path) -> dict:
    loaded = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(loaded, dict):
        raise ValueError("Publication graph source must be a YAML mapping")
    return loaded


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def build_neighbors(edges: list[dict]) -> dict[str, set[str]]:
    neighbors: dict[str, set[str]] = {}
    for edge in edges:
        src = str(edge.get("from", "")).strip()
        dst = str(edge.get("to", "")).strip()
        if not src or not dst:
            continue
        neighbors.setdefault(src, set()).add(dst)
        neighbors.setdefault(dst, set()).add(src)
    return neighbors


def safe_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def openalex_url(path: str, params: dict[str, object] | None = None) -> str:
    query = {"mailto": MAILTO}
    if params:
        query.update(params)
    encoded = urllib.parse.urlencode(query, safe=":/|,._-", doseq=True)
    return f"{OPENALEX_BASE}/{path}?{encoded}"


def fetch_json(url: str) -> dict | list | None:
    request = urllib.request.Request(url, headers={"User-Agent": f"CalyrGraph/1.0 ({MAILTO})"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_openalex_id(value: str | None) -> str | None:
    if not value:
        return None
    text = str(value).strip()
    if not text:
        return None
    if text.startswith("https://openalex.org/"):
        return text
    if text.startswith("W"):
        return f"https://openalex.org/{text}"
    return None


def resolve_openalex_id_for_node(node: dict) -> str | None:
    binding = normalize_openalex_id(str(node.get("binding", "")))
    if binding:
        return binding

    doi = str(node.get("doi", "")).strip()
    if not doi:
        return None

    payload = fetch_json(
        openalex_url(
            "works",
            {
                "filter": f"doi:{doi}",
                "per-page": 1,
                "select": "id,doi,display_name,publication_year,publication_date,cited_by_count,referenced_works,primary_location",
            },
        )
    )
    if not isinstance(payload, dict):
        return None
    results = payload.get("results", [])
    if not results:
        return None
    first = results[0]
    return normalize_openalex_id(first.get("id"))


def fetch_openalex_work(identifier: str) -> dict | None:
    normalized = normalize_openalex_id(identifier) or identifier
    if normalized.startswith("https://openalex.org/"):
        path = normalized.replace("https://openalex.org/", "works/")
    else:
        return None

    payload = fetch_json(
        openalex_url(
            path,
            {
                "select": "id,display_name,publication_year,publication_date,doi,cited_by_count,referenced_works,primary_location",
            },
        )
    )
    return payload if isinstance(payload, dict) else None


def source_name(work: dict) -> str:
    location = work.get("primary_location") or {}
    source = location.get("source") or {}
    return str(source.get("display_name") or "Unknown source")


def make_subtitle(work: dict) -> str:
    return f"{source_name(work)}, {work.get('publication_year', 'n.d.')}"


def score_from_citations(count: int, floor: float = 0.42, ceiling: float = 0.82) -> float:
    scaled = floor + (math.log10(max(count, 0) + 1) / 4.2)
    return round(clamp(scaled, floor, ceiling), 2)


def radius_from_impact(node: dict) -> float:
    cited_by_count = int(node.get("cited_by_count") or 0)
    if cited_by_count > 0:
        impact = clamp(math.log10(cited_by_count + 1) / 3.6, 0.0, 1.0)
        return round(10.5 + impact * 13.5, 2)

    score = float(node.get("score", 0.65))
    return round(9.0 + score * 8.0, 2)


def edge_exists(edges: list[dict], src: str, dst: str, label: str | None = None) -> bool:
    for edge in edges:
        if edge.get("from") == src and edge.get("to") == dst:
            if label is None or edge.get("label") == label:
                return True
    return False


def inject_latest_citations(source: dict, nodes: list[dict], edges: list[dict], resolved_ids: dict[str, str]) -> None:
    generation = source.get("graph_generation") or {}
    roots = generation.get("latest_citation_roots") or ["seed_corpus", "reference_set"]
    latest_limit = int(generation.get("latest_citations_limit") or 6)
    root_ids = [resolved_ids[root] for root in roots if root in resolved_ids]
    if not root_ids:
        return

    payload = fetch_json(
        openalex_url(
            "works",
            {
                "filter": f"cites:{'|'.join(root_ids)}",
                "sort": "publication_date:desc",
                "per-page": latest_limit,
                "select": "id,display_name,publication_year,publication_date,doi,cited_by_count,primary_location",
            },
        )
    )
    if not isinstance(payload, dict):
        return

    existing_ids = {str(node.get("id")) for node in nodes}
    for work in payload.get("results", []):
        work_id = normalize_openalex_id(work.get("id"))
        if not work_id:
            continue
        node_id = f"latest_{safe_slug(work_id.rsplit('/', 1)[-1])}"
        if node_id in existing_ids:
            continue

        nodes.append(
            {
                "id": node_id,
                "label": str(work.get("publication_year") or "Latest"),
                "title": str(work.get("display_name") or "Latest citing paper"),
                "subtitle": make_subtitle(work),
                "kind": "citations",
                "year": work.get("publication_year"),
                "status": "latest",
                "doi": str(work.get("doi") or "").replace("https://doi.org/", "") or None,
                "binding": work_id,
                "score": score_from_citations(int(work.get("cited_by_count") or 0), floor=0.4, ceiling=0.72),
                "cited_by_count": int(work.get("cited_by_count") or 0),
                "cluster": "downstream-latest",
                "depth": 3,
                "publication_date": work.get("publication_date"),
            }
        )
        existing_ids.add(node_id)
        if not edge_exists(edges, "citation_frontier", node_id):
            edges.append(
                {
                    "from": "citation_frontier",
                    "to": node_id,
                    "label": "latest citation",
                    "weight": 0.74,
                }
            )


def analyze_crossreferences(source: dict, nodes: list[dict], resolved_ids: dict[str, str]) -> tuple[list[dict], dict[str, str], dict[str, dict]]:
    generation = source.get("graph_generation") or {}
    candidate_kinds = set(generation.get("crossreference_kinds") or ["seed", "references", "upstream"])
    candidates = [node for node in nodes if str(node.get("kind")) in candidate_kinds and str(node.get("id")) in resolved_ids]

    reference_sets: dict[str, set[str]] = {}
    node_meta: dict[str, dict] = {}
    for node in candidates:
        node_id = str(node.get("id"))
        work = fetch_openalex_work(resolved_ids[node_id])
        if not work:
            continue
        reference_sets[node_id] = {normalize_openalex_id(ref) for ref in work.get("referenced_works", []) if normalize_openalex_id(ref)}
        node_meta[node_id] = work

    parent: dict[str, str] = {str(node.get("id")): str(node.get("id")) for node in candidates}

    def find(node_id: str) -> str:
        while parent[node_id] != node_id:
            parent[node_id] = parent[parent[node_id]]
            node_id = parent[node_id]
        return node_id

    def union(left: str, right: str) -> None:
        left_root = find(left)
        right_root = find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    analysis_links: list[dict] = []
    node_ids = [str(node.get("id")) for node in candidates if str(node.get("id")) in reference_sets]
    reverse_lookup = {resolved_ids[node_id]: node_id for node_id in node_ids}

    for index, left in enumerate(node_ids):
        for right in node_ids[index + 1 :]:
            left_refs = reference_sets.get(left, set())
            right_refs = reference_sets.get(right, set())
            direct = resolved_ids.get(right) in left_refs or resolved_ids.get(left) in right_refs
            overlap = len(left_refs & right_refs)
            strength = 0.0
            if direct:
                strength += 2.4
            if overlap >= 2:
                strength += min(overlap * 0.45, 2.4)

            if strength >= 1.9:
                union(left, right)
                analysis_links.append(
                    {
                        "from": left,
                        "to": right,
                        "strength": round(strength, 2),
                        "type": "crossreference",
                    }
                )

    components: dict[str, list[str]] = {}
    for node_id in node_ids:
        components.setdefault(find(node_id), []).append(node_id)

    cluster_map: dict[str, str] = {}
    cluster_summary: dict[str, dict] = {}
    cluster_index = 1
    for component in components.values():
        labels: dict[str, int] = {}
        for node_id in component:
            source_cluster = str(next((node.get("cluster") for node in nodes if node.get("id") == node_id), "crossref"))
            labels[source_cluster] = labels.get(source_cluster, 0) + 1
        best_cluster = max(labels.items(), key=lambda item: item[1])[0] if labels else f"crossref-{cluster_index}"
        if best_cluster == "framework":
            best_cluster = f"crossref-{cluster_index}"
        if len(component) == 1:
            best_cluster = str(next((node.get("cluster") for node in nodes if node.get("id") == component[0]), best_cluster))
        for node_id in component:
            cluster_map[node_id] = best_cluster
        cluster_summary[best_cluster] = {
            "size": len(component),
            "members": component,
        }
        cluster_index += 1

    return analysis_links, cluster_map, cluster_summary


def analyze_citation_connections(nodes: list[dict], edges: list[dict], resolved_ids: dict[str, str]) -> list[dict]:
    candidates = [
        node for node in nodes
        if str(node.get("kind")) == "citations" and str(node.get("id")) in resolved_ids
    ]

    reference_sets: dict[str, set[str]] = {}
    for node in candidates:
        node_id = str(node.get("id"))
        work = fetch_openalex_work(resolved_ids[node_id])
        if not work:
            continue
        reference_sets[node_id] = {
            normalize_openalex_id(ref)
            for ref in work.get("referenced_works", [])
            if normalize_openalex_id(ref)
        }

    links: list[dict] = []
    node_ids = [str(node.get("id")) for node in candidates if str(node.get("id")) in reference_sets]
    for index, left in enumerate(node_ids):
        for right in node_ids[index + 1 :]:
            left_refs = reference_sets.get(left, set())
            right_refs = reference_sets.get(right, set())
            direct = resolved_ids.get(right) in left_refs or resolved_ids.get(left) in right_refs
            overlap = len(left_refs & right_refs)
            if not direct and overlap < 3:
                continue

            strength = 0.0
            if direct:
                strength += 2.6
            if overlap >= 3:
                strength += min(overlap * 0.3, 1.8)

            if strength < 1.9:
                continue

            if not edge_exists(edges, left, right):
                edges.append(
                    {
                        "from": left,
                        "to": right,
                        "weight": round(min(0.58 + (strength / 8.0), 0.88), 2),
                    }
                )

            links.append(
                {
                    "from": left,
                    "to": right,
                    "strength": round(strength, 2),
                    "type": "citation-connectivity",
                }
            )

    return links


def force_layout(nodes: list[dict], edges: list[dict], analysis_links: list[dict], root_id: str) -> dict[str, tuple[float, float]]:
    node_ids = [str(node["id"]) for node in nodes if node.get("id")]
    neighbors = build_neighbors(edges)
    rng = random.Random(7)
    cluster_names = list(dict.fromkeys(str(node.get("cluster", node.get("kind", "default"))) for node in nodes))
    cluster_centers: dict[str, tuple[float, float]] = {}
    for index, cluster_name in enumerate(cluster_names):
        angle = ((index + 1) / (len(cluster_names) + 1)) * math.pi * 1.14 - math.pi * 0.1
        cluster_centers[cluster_name] = (
            VIEWBOX_WIDTH * (0.52 + 0.22 * math.cos(angle)),
            VIEWBOX_HEIGHT * (0.53 + 0.24 * math.sin(angle)),
        )

    positions: dict[str, list[float]] = {}
    root_y = VIEWBOX_HEIGHT * 0.50
    node_map = {str(node.get("id")): node for node in nodes}
    for index, node_id in enumerate(node_ids):
        node = node_map[node_id]
        depth = int(node.get("depth", 0))
        cluster_name = str(node.get("cluster", node.get("kind", "default")))
        center_x, center_y = cluster_centers.get(cluster_name, (VIEWBOX_WIDTH * 0.5, VIEWBOX_HEIGHT * 0.5))
        if node_id == root_id:
            positions[node_id] = [VIEWBOX_WIDTH * 0.14, root_y]
            continue

        ring = 70 + (depth * 58) + (index % 4) * 18
        angle = (index / max(1, len(node_ids) - 1)) * math.tau
        positions[node_id] = [
            center_x + math.cos(angle) * ring + rng.uniform(-28, 28),
            center_y + math.sin(angle) * (ring * 0.64) + rng.uniform(-22, 22),
        ]

    analysis_pairs = [
        (str(link.get("from")), str(link.get("to")), float(link.get("strength", 1.0)))
        for link in analysis_links
        if str(link.get("from")) in positions and str(link.get("to")) in positions
    ]

    for _ in range(320):
        displacements = {node_id: [0.0, 0.0] for node_id in node_ids}

        for i, node_a in enumerate(node_ids):
            for node_b in node_ids[i + 1 :]:
                dx = positions[node_a][0] - positions[node_b][0]
                dy = positions[node_a][1] - positions[node_b][1]
                distance_sq = dx * dx + dy * dy + 0.01
                distance = math.sqrt(distance_sq)
                force = 14500 / distance_sq
                ux = dx / distance
                uy = dy / distance
                displacements[node_a][0] += ux * force
                displacements[node_a][1] += uy * force
                displacements[node_b][0] -= ux * force
                displacements[node_b][1] -= uy * force

        for edge in edges:
            src = str(edge.get("from", "")).strip()
            dst = str(edge.get("to", "")).strip()
            if src not in positions or dst not in positions:
                continue
            dx = positions[dst][0] - positions[src][0]
            dy = positions[dst][1] - positions[src][1]
            distance = math.sqrt(dx * dx + dy * dy) + 0.01
            target = 150 + max(int(node_map[src].get("depth", 0)), int(node_map[dst].get("depth", 0))) * 22
            spring = (distance - target) * (0.022 + float(edge.get("weight", 0.6)) * 0.012)
            ux = dx / distance
            uy = dy / distance
            displacements[src][0] += ux * spring
            displacements[src][1] += uy * spring
            displacements[dst][0] -= ux * spring
            displacements[dst][1] -= uy * spring

        for src, dst, strength in analysis_pairs:
            dx = positions[dst][0] - positions[src][0]
            dy = positions[dst][1] - positions[src][1]
            distance = math.sqrt(dx * dx + dy * dy) + 0.01
            target = 108 + (1.0 - min(strength / 4.0, 0.9)) * 56
            spring = (distance - target) * (0.018 + min(strength, 3.5) * 0.006)
            ux = dx / distance
            uy = dy / distance
            displacements[src][0] += ux * spring
            displacements[src][1] += uy * spring
            displacements[dst][0] -= ux * spring
            displacements[dst][1] -= uy * spring

        for node_id in node_ids:
            node = node_map[node_id]
            cluster_name = str(node.get("cluster", node.get("kind", "default")))
            center_x, center_y = cluster_centers.get(cluster_name, (VIEWBOX_WIDTH * 0.5, VIEWBOX_HEIGHT * 0.5))
            depth = int(node.get("depth", 0))
            target_x = center_x * 0.7 + (VIEWBOX_WIDTH * min(0.18 + depth * 0.16, 0.86)) * 0.3
            target_y = center_y * 0.72 + (VIEWBOX_HEIGHT * (0.5 + ((depth % 2) * 0.08 - 0.04))) * 0.28

            if node_id == root_id:
                positions[node_id][0] = VIEWBOX_WIDTH * 0.18
                positions[node_id][1] = root_y
                continue

            displacements[node_id][0] += (target_x - positions[node_id][0]) * 0.009
            displacements[node_id][1] += (target_y - positions[node_id][1]) * 0.009

            positions[node_id][0] += displacements[node_id][0]
            positions[node_id][1] += displacements[node_id][1]
            positions[node_id][0] = clamp(positions[node_id][0], PADDING, VIEWBOX_WIDTH - PADDING)
            positions[node_id][1] = clamp(positions[node_id][1], PADDING * 0.65, VIEWBOX_HEIGHT - PADDING * 0.65)

    return {node_id: (round(pos[0], 2), round(pos[1], 2)) for node_id, pos in positions.items()}


def build_graph_payload(source: dict) -> dict:
    nodes = list(source.get("nodes", []))
    edges = list(source.get("edges", []))
    legend = list(source.get("legend", []))
    color_by_kind = {str(entry.get("kind")): entry.get("color") for entry in legend}
    root_id = str(source.get("root_id") or (nodes[0]["id"] if nodes else ""))

    resolved_ids: dict[str, str] = {}
    for node in nodes:
        node_id = str(node.get("id", "")).strip()
        if not node_id:
            continue
        resolved = resolve_openalex_id_for_node(node)
        if resolved:
            resolved_ids[node_id] = resolved

    inject_latest_citations(source, nodes, edges, resolved_ids)
    for node in nodes:
        node_id = str(node.get("id", "")).strip()
        if node_id not in resolved_ids:
            resolved = resolve_openalex_id_for_node(node)
            if resolved:
                resolved_ids[node_id] = resolved

    analysis_links, auto_clusters, cluster_summary = analyze_crossreferences(source, nodes, resolved_ids)
    citation_analysis_links = analyze_citation_connections(nodes, edges, resolved_ids)
    for node in nodes:
        node_id = str(node.get("id", "")).strip()
        if node_id in auto_clusters:
            node["cluster"] = auto_clusters[node_id]

    all_analysis_links = [*analysis_links, *citation_analysis_links]
    positions = force_layout(nodes, edges, all_analysis_links, root_id=root_id)

    enriched_nodes = []
    for node in nodes:
        node_id = str(node.get("id", "")).strip()
        if not node_id:
            continue
        x, y = positions.get(node_id, (VIEWBOX_WIDTH / 2, VIEWBOX_HEIGHT / 2))
        enriched = dict(node)
        enriched["x"] = x
        enriched["y"] = y
        enriched["radius"] = radius_from_impact(node)
        enriched["color"] = color_by_kind.get(str(node.get("kind")), "#24f3ff")
        enriched["cluster"] = str(node.get("cluster", node.get("kind", "default")))
        enriched["depth"] = int(node.get("depth", 0))
        if node_id in resolved_ids:
            enriched["openalex_id"] = resolved_ids[node_id]
        enriched_nodes.append(enriched)

    generated_at = datetime.now(timezone.utc)
    return {
        "title": source.get("title", "Publication Network"),
        "summary": source.get("summary", ""),
        "source_binding": source.get("source_binding", ""),
        "data_sources": list(source.get("data_sources", [])),
        "scan_note": source.get("scan_note", ""),
        "generated_at": generated_at.strftime("%Y-%m-%d %H:%M UTC"),
        "latest_citation_scan_upto": generated_at.strftime("%Y-%m-%d"),
        "crossreference_analysis": {
            "database": "OpenAlex",
            "candidate_count": len([node for node in nodes if str(node.get("kind")) in set((source.get("graph_generation") or {}).get("crossreference_kinds") or ["seed", "references", "upstream"])]),
            "analysis_links": len(all_analysis_links),
            "cluster_count": len(cluster_summary),
        },
        "viewbox": {"width": VIEWBOX_WIDTH, "height": VIEWBOX_HEIGHT},
        "legend": legend,
        "nodes": enriched_nodes,
        "edges": edges,
        "analysis_links": all_analysis_links,
    }


def write_json(payload: dict, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> int:
    payload = build_graph_payload(read_yaml(SRC_PATH))
    for out_path in OUT_PATHS:
        write_json(payload, out_path)
    print(f"Built publication graph -> {OUT_PATHS[0]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
