"""
Builders Layer — Nexus Artifact Construction

Constructs the Nexus JSON artifacts:
    • nexus.ast.json   → Abstract syntax tree (fully resolved homepage)
    • nexus.graph.json → Knowledge graph (for ReactFlow, Oracle, Delphi)
    • nexus.theme.json → Design system (colors, typography, spacing)
    • nexus.index.json → Search index (for discovery, autocomplete)
    • nexus.flowchart.json → Authored page flow definitions with Mermaid output

Each builder is independent and responsible for one artifact.
"""

import copy
import re
from typing import Any

from .schema import GRAPH_EDGES_KEY, NODE_LIST_FIELDS, NODE_STRUCTURED_FIELDS, NODE_TEXT_FIELDS, NODE_TYPE_RULES

_TEMPLATE_RE = re.compile(r'\{\{\s*([^}]+)\s*\}\}')


class ASTBuilder:
    """Builds the abstract syntax tree for rendering."""

    def __init__(self, source: dict[str, Any], resolved: dict[str, Any]) -> None:
        """
        Initialize AST builder.
        
        Args:
            source: Raw YAML sources
            resolved: Resolved node data from Resolver
        """
        self.source = source
        self.resolved = resolved
        self.structure = source.get("structure", {})
        self.content = source.get("content", {})

    def build(self) -> dict[str, Any]:
        """
        Build fully resolved homepage AST.
        
        Recursively traverses structure hierarchy and enriches with resolved node data.
        
        Returns:
            dict[str, Any]: Root page node with all children recursively populated
        """
        homepage_def = self.structure.get("homepage", {})

        # Preferred schema: explicit recursive children
        if isinstance(homepage_def, dict) and "children" in homepage_def:
            return self._build_node("homepage", homepage_def)

        # Legacy/layout schema: header/hero/grid/footer blocks
        return self._build_homepage_from_layout(homepage_def)

    def _build_homepage_from_layout(self, homepage_def: dict[str, Any]) -> dict[str, Any]:
        """
        Build AST from layout-style homepage definitions.

        Supported layout keys:
            - header: [node ids]
            - hero: [node ids]
            - grid: { tiles: [node ids] }
            - footer: [node ids]

        The grid is mapped to two semantic sections for the current homepage:
            first 6 tiles  -> platforms section
            remaining tiles -> architecture section
        """
        page_node = self._build_node("homepage", {})
        children: list[dict[str, Any]] = []

        # Header nodes (optional)
        for node_id in self._layout_ids(homepage_def, "header"):
            child_def = self.structure.get(node_id, {})
            children.append(self._build_node(node_id, child_def))

        # Hero nodes
        for node_id in self._layout_ids(homepage_def, "hero"):
            child_def = self.structure.get(node_id, {})
            children.append(self._build_node(node_id, child_def))

        # Grid nodes -> semantic sections
        grid_def = homepage_def.get("grid", {}) if isinstance(homepage_def, dict) else {}
        tiles = grid_def.get("tiles", []) if isinstance(grid_def, dict) else []

        # Optional movie section rendered above platforms/architecture
        if "movie" in self.content or "movie" in self.structure:
            children.append(self._build_node("movie", {"children": []}))

        if isinstance(tiles, list) and tiles:
            platforms_tiles = tiles[:6]
            architecture_tiles = tiles[6:]

            if platforms_tiles:
                children.append(self._build_node("platforms", {"children": platforms_tiles}))

            if architecture_tiles:
                children.append(self._build_node("architecture", {"children": architecture_tiles}))

        # Footer wrapper with optional footer children
        footer_ids = self._layout_ids(homepage_def, "footer")
        if footer_ids:
            children.append(self._build_node("footer", {"children": footer_ids}))

        if children:
            page_node["children"] = children

        return page_node

    def _layout_ids(self, homepage_def: Any, key: str) -> list[str]:
        """Return valid string node IDs from a layout list key."""
        if not isinstance(homepage_def, dict):
            return []

        values = homepage_def.get(key, [])
        if not isinstance(values, list):
            return []
        return [item for item in values if isinstance(item, str)]

    def _build_node(
        self, node_id: str, node_def: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Build a node (page, section, or element).
        
        Recursively processes children and enriches with resolved data.
        
        Args:
            node_id: Node identifier
            node_def: Node definition from structure (may contain children)
            
        Returns:
            dict[str, Any]: Fully populated node with type, content, relations, children
        """
        # Determine semantic type
        node_type = self._infer_type(node_id)

        # Start with type and ID
        node: dict[str, Any] = {
            "type": node_type,
            "id": node_id,
        }

        # Add content if available in resolved data
        resolved = self.resolved.get(node_id)
        if isinstance(resolved, dict):
            node.update(self._extract_node_content(resolved))
            self._add_relations(node, resolved)
        node["meta"] = self._build_node_meta(node_id, node_type, node_def, resolved)

        # Recursively add children
        children = self._build_children(node_def)
        if children:
            node["children"] = children

        return node

    def _extract_node_content(self, resolved: dict[str, Any]) -> dict[str, Any]:
        """Extract normalized content fields from a resolved node."""
        payload: dict[str, Any] = {}
        for field in NODE_TEXT_FIELDS:
            payload[field] = resolved.get(field, "")
        for field in NODE_LIST_FIELDS:
            value = resolved.get(field, [])
            payload[field] = value if isinstance(value, list) else []
        for field in NODE_STRUCTURED_FIELDS:
            value = resolved.get(field, {})
            payload[field] = copy.deepcopy(value) if isinstance(value, dict) else {}
        return payload

    def _add_relations(self, node: dict[str, Any], resolved: dict[str, Any]) -> None:
        """Attach relations when incoming/outgoing references exist."""
        relations = resolved.get("relations", {})
        if not isinstance(relations, dict):
            return
        if relations.get("incoming") or relations.get("outgoing"):
            node["relations"] = relations

    def _build_children(self, node_def: Any) -> list[dict[str, Any]]:
        """Recursively build child nodes from structure definition."""
        if not isinstance(node_def, dict):
            return []

        children = node_def.get("children", [])
        if not isinstance(children, list):
            return []

        built_children: list[dict[str, Any]] = []
        for child_id in children:
            if not isinstance(child_id, str):
                continue
            child_def = self.structure.get(child_id, {})
            built_children.append(self._build_node(child_id, child_def))
        return built_children

    def _infer_type(self, node_id: str) -> str:
        """
        Infer node semantic type from ID.
        
        Uses lookup table for deterministic, consistent typing.
        Falls back to "element" for unknown IDs.
        
        Args:
            node_id: Node identifier
            
        Returns:
            str: Semantic type (page, section, hero, tile, element)
        """
        return NODE_TYPE_RULES.get(node_id, "element")

    def _build_node_meta(self, node_id: str, node_type: str, node_def: Any, resolved: Any) -> dict[str, Any]:
        """Build trace metadata so generated nodes explain their origin."""
        transformations = ["ApplyNodeTypeInference", "AttachResolvedContent"]

        if node_id == "homepage":
            transformations.insert(0, "BuildHomepageRoot")
        elif node_id in {"movie", "platforms", "architecture", "footer"}:
            transformations.insert(0, "SplitGridIntoSemanticSections")

        if isinstance(node_def, dict) and node_def.get("children"):
            transformations.append("BuildChildNodes")

        meta: dict[str, Any] = {
            "source": {
                "contentNodeId": node_id if node_id in self.content else None,
                "structureNodeId": node_id if node_id in self.structure or node_id == "homepage" else None,
            },
            "nodeType": node_type,
            "transformations": transformations,
        }

        if isinstance(resolved, dict):
            authored_blocks = {
                field: copy.deepcopy(resolved.get(field, {}))
                for field in NODE_STRUCTURED_FIELDS
                if isinstance(resolved.get(field), dict) and resolved.get(field)
            }
            if authored_blocks:
                meta["authored"] = authored_blocks

        return meta


class FlowchartBuilder:
    """Build flowchart-friendly artifacts from YAML-authored page flow definitions."""

    def __init__(self, source: dict[str, Any], resolved: dict[str, Any]) -> None:
        self.flowchart = source.get("flowchart", {})
        self.resolved = resolved

    def build(self) -> dict[str, Any]:
        flows = {}
        if not isinstance(self.flowchart, dict):
            return {"flows": flows}

        for flow_id, flow_def in self.flowchart.items():
            if not isinstance(flow_def, dict):
                continue
            flows[flow_id] = self._build_flow(flow_id, flow_def)

        return {"flows": flows}

    def _build_flow(self, flow_id: str, flow_def: dict[str, Any]) -> dict[str, Any]:
        direction = flow_def.get("direction", "TD")
        nodes = [
            self._build_flow_node(node_def)
            for node_def in flow_def.get("nodes", [])
            if isinstance(node_def, dict)
        ]
        edges = [
            self._build_flow_edge(edge)
            for edge in flow_def.get("edges", [])
            if isinstance(edge, (list, tuple)) and len(edge) >= 2
        ]
        return {
            "id": flow_id,
            "title": flow_def.get("title", flow_id),
            "direction": direction,
            "nodes": nodes,
            "edges": edges,
            "mermaid": self._build_mermaid(direction, nodes, edges),
        }

    def _build_flow_node(self, node_def: dict[str, Any]) -> dict[str, Any]:
        ref = node_def.get("ref")
        resolved = self.resolved.get(ref, {}) if isinstance(ref, str) else {}
        label = node_def.get("label") or resolved.get("title") or ref or node_def.get("id", "")
        return {
            "id": node_def.get("id"),
            "ref": ref,
            "label": label,
            "kind": node_def.get("kind", "step"),
            "intent": copy.deepcopy(node_def.get("intent", {})) if isinstance(node_def.get("intent"), dict) else {},
            "explain": copy.deepcopy(node_def.get("explain", {})) if isinstance(node_def.get("explain"), dict) else {},
        }

    def _build_flow_edge(self, edge: list[Any] | tuple[Any, ...]) -> dict[str, Any]:
        payload = {
            "source": edge[0],
            "target": edge[1],
        }
        if len(edge) >= 3 and isinstance(edge[2], str):
            payload["label"] = edge[2]
        return payload

    def _build_mermaid(self, direction: str, nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> str:
        lines = [f"flowchart {direction}"]
        for node in nodes:
            node_id = self._mermaid_id(node.get("id", "node"))
            label = self._escape_mermaid_label(node.get("label", node_id))
            lines.append(f"    {node_id}{self._node_shape(node.get('kind'), label)}")
        for edge in edges:
            source = self._mermaid_id(edge.get("source", "source"))
            target = self._mermaid_id(edge.get("target", "target"))
            label = edge.get("label")
            connector = f" -->|{self._escape_mermaid_label(label)}| " if label else " --> "
            lines.append(f"    {source}{connector}{target}")
        return "\n".join(lines)

    def _node_shape(self, kind: Any, label: str) -> str:
        if kind in {"start", "terminal"}:
            return f"([{label}])"
        if kind == "decision":
            return f"{{{label}}}"
        return f"[{label}]"

    def _mermaid_id(self, raw: Any) -> str:
        return re.sub(r"[^A-Za-z0-9_]", "_", str(raw or "node"))

    def _escape_mermaid_label(self, value: Any) -> str:
        return str(value).replace('"', "'")


class GraphBuilder:
    """Builds the knowledge graph for visualization and navigation."""

    def __init__(self, source: dict[str, Any], resolved: dict[str, Any]) -> None:
        self.resolved = resolved
        self.graph = source.get("graph", {})

    def build(self) -> dict[str, Any]:
        """
        Build knowledge graph for ReactFlow, Oracle, Delphi.
        
        Format:
            {
              "nodes": [
                {"id": "core", "label": "Calyrai core", "data": {...}},
                ...
              ],
              "edges": [
                {"source": "core", "target": "brix", "id": "core→brix"},
                ...
              ]
            }
        
        Returns:
            dict[str, Any]: Graph with nodes and edges
        """
        nodes = self._build_nodes()
        edges = self._build_edges()

        return {
            "nodes": nodes,
            "edges": edges,
        }

    def _build_nodes(self) -> list[dict[str, Any]]:
        """Build graph nodes from resolved data."""
        return [
            {
                "id": nid,
                "label": r.get("title", nid),
                "data": {"title": r.get("title", ""), "summary": r.get("summary", ""), "icon": r.get("icon", "")},
            }
            for nid, r in self.resolved.items()
        ]

    def _build_edges(self) -> list[dict[str, Any]]:
        """Build graph edges from structure."""
        raw = self.graph.get(GRAPH_EDGES_KEY, [])
        if not isinstance(raw, list):
            return []
        return [
            {"source": s, "target": t, "id": f"{s}→{t}"}
            for edge in raw
            if isinstance(edge, (list, tuple)) and len(edge) == 2
            for s, t in (edge,)
        ]


class ThemeBuilder:
    """Builds the compiled design system."""

    def __init__(self, source: dict[str, Any]) -> None:
        """
        Initialize theme builder.
        
        Args:
            source: Raw YAML sources
        """
        self.theme = source.get("theme", {})

    def build(self) -> dict[str, Any]:
        """Build compiled design system with {{ }} template variable resolution."""
        skin = self.theme.get('skin', {})
        context = {'colors': skin.get('colors', {}), **skin}
        return self._resolve_with_context(copy.deepcopy(self.theme), context)

    def _resolve_with_context(self, obj: Any, context: dict[str, Any], max_depth: int = 5) -> Any:
        """Recursively resolve {{ }} templates; stops at max_depth to prevent loops."""
        if max_depth <= 0:
            return obj
        if isinstance(obj, dict):
            return {k: self._resolve_with_context(v, context, max_depth - 1) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._resolve_with_context(item, context, max_depth - 1) for item in obj]
        if isinstance(obj, str):
            return _TEMPLATE_RE.sub(lambda m: self._lookup(context, m.group(1).strip()), obj)
        return obj

    def _lookup(self, context: dict[str, Any], path: str) -> str:
        """Resolve a dot-notation path against context; returns comment string if missing."""
        current: Any = context
        for key in path.split('.'):
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return f"/* UNRESOLVED: {path} */"
        return str(current)


class IndexBuilder:
    """Builds the searchable index for discovery."""

    def __init__(self, resolved: dict[str, Any]) -> None:
        """
        Initialize index builder.
        
        Args:
            resolved: Resolved node data from Resolver
        """
        self.resolved = resolved

    def build(self) -> dict[str, Any]:
        """Build searchable index keyed by node ID."""
        return {
            nid: {
                "title": r.get("title", ""),
                "summary": r.get("summary", ""),
                "body_preview": r.get("body", "")[:200],
                "route": r.get("route", ""),
                "icon": r.get("icon", ""),
                "keywords": self._extract_keywords(r.get("title", ""), r.get("summary", "")),
            }
            for nid, r in self.resolved.items()
        }

    def _extract_keywords(self, *texts: str) -> list[str]:
        """Tokenize and deduplicate words from all text fields."""
        return sorted({w for t in texts if t for w in t.lower().split()})
