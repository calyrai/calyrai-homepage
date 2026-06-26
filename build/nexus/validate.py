"""
Validation Layer — Cross-Reference Validation

Validates the coherence of YAML source files:
    • Structure references are defined in content
    • Content entries are used in structure
    • Graph nodes/edges point to valid content nodes
    • All node IDs consistent across layers

ValidationError states:
    • ERRORS: Issues that prevent compilation (break contracts)
    • WARNINGS: Issues that may indicate problems (unused/missing nodes)
"""

from typing import Any

from .schema import (
    GRAPH_EDGES_KEY,
    GRAPH_NODES_KEY,
    SKIP_STRUCTURE_CHECK,
    STRUCTURE_NODE_LIST_KEYS,
)


class Validator:
    """Validates YAML source coherence across all layers."""

    def __init__(self, source: dict[str, Any]) -> None:
        self.structure = source.get("structure", {})
        self.content = source.get("content", {})
        self.graph = source.get("graph", {})
        self.flowchart = source.get("flowchart", {})
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def validate(self) -> bool:
        """
        Run all validations.
        
        Returns:
            bool: True if no errors (warnings are acceptable)
        """
        self._check_homepage_schema()
        self._check_graph_validity()
        self._check_flowchart_validity()
        structure_node_ids = self._extract_all_node_ids()
        self._check_structure_completeness(structure_node_ids)
        self._check_content_completeness(structure_node_ids)
        return len(self.errors) == 0

    def _check_homepage_schema(self) -> None:
        """Validate homepage strict structure schema."""
        homepage = self.structure.get("homepage")
        if not isinstance(homepage, dict):
            self.errors.append("structure.homepage must be a mapping")
            return

        children = homepage.get("children")
        if isinstance(children, list):
            return

        self.errors.append(
            "structure.homepage must declare explicit 'children'."
        )

    def _check_flowchart_validity(self) -> None:
        """Verify flowchart definitions reference valid authored nodes."""
        if not isinstance(self.flowchart, dict):
            self.errors.append("Flowchart source must be a mapping")
            return

        for flow_id, flow_def in self.flowchart.items():
            if not isinstance(flow_def, dict):
                self.errors.append(f"Flowchart '{flow_id}' must be a mapping")
                continue

            nodes = flow_def.get("nodes", [])
            if not isinstance(nodes, list):
                self.errors.append(f"Flowchart '{flow_id}' nodes must be a list")
                continue

            node_ids: set[str] = set()
            for node_def in nodes:
                if not isinstance(node_def, dict):
                    self.errors.append(f"Flowchart '{flow_id}' node must be a mapping: {node_def}")
                    continue

                node_id = node_def.get("id")
                if not isinstance(node_id, str) or not node_id:
                    self.errors.append(f"Flowchart '{flow_id}' node is missing a string id: {node_def}")
                    continue

                node_ids.add(node_id)
                ref = node_def.get("ref")
                if ref is not None and ref not in self.content:
                    self.errors.append(f"Flowchart '{flow_id}' node ref '{ref}' not found in content")

            edges = flow_def.get("edges", [])
            if not isinstance(edges, list):
                self.errors.append(f"Flowchart '{flow_id}' edges must be a list")
                continue

            for edge in edges:
                if not isinstance(edge, (list, tuple)) or len(edge) < 2:
                    self.errors.append(f"Flowchart '{flow_id}' edge must be [source, target] or [source, target, label]: {edge}")
                    continue
                if edge[0] not in node_ids:
                    self.errors.append(f"Flowchart '{flow_id}' edge source '{edge[0]}' not found in flowchart nodes")
                if edge[1] not in node_ids:
                    self.errors.append(f"Flowchart '{flow_id}' edge target '{edge[1]}' not found in flowchart nodes")

    def _check_graph_validity(self) -> None:
        """Verify graph nodes and edges reference valid content nodes."""
        graph_nodes = self.graph.get(GRAPH_NODES_KEY, [])
        if not isinstance(graph_nodes, list):
            self.errors.append("Graph 'nodes' must be a list")
            graph_nodes = []

        for node_id in graph_nodes:
            if not isinstance(node_id, str):
                self.errors.append(f"Graph node ID must be a string: {node_id}")
                continue
            if node_id not in self.content:
                self.errors.append(
                    f"Graph node '{node_id}' not found in content"
                )

        edges = self.graph.get(GRAPH_EDGES_KEY, [])
        if not isinstance(edges, list):
            self.errors.append("Graph 'edges' must be a list")
            edges = []

        for edge in edges:
            if not isinstance(edge, (list, tuple)) or len(edge) != 2:
                self.errors.append(f"Graph edge must be a pair [source, target]: {edge}")
                continue

            source, target = edge
            if source not in self.content:
                self.errors.append(
                    f"Graph edge source '{source}' not found in content"
                )
            if target not in self.content:
                self.errors.append(
                    f"Graph edge target '{target}' not found in content"
                )

    def _check_structure_completeness(self, structure_node_ids: set[str]) -> None:
        """Verify all nodes in structure have content entries."""
        for node_id in structure_node_ids:
            if node_id not in self.content:
                self.warnings.append(
                    f"Node '{node_id}' in structure but not in content"
                )

    def _check_content_completeness(self, structure_node_ids: set[str]) -> None:
        """Verify all content entries are referenced in structure."""
        for node_id in self.content:
            if node_id not in structure_node_ids and node_id not in SKIP_STRUCTURE_CHECK:
                self.warnings.append(
                    f"Node '{node_id}' in content but not in structure"
                )

    def _extract_all_node_ids(self) -> set[str]:
        """Recursively extract all node IDs from structure."""
        node_ids: set[str] = set()

        def traverse(obj: Any) -> None:
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if key in STRUCTURE_NODE_LIST_KEYS and isinstance(value, list):
                        node_ids.update(v for v in value if isinstance(v, str))
                    else:
                        traverse(value)
            elif isinstance(obj, list):
                for item in obj:
                    if isinstance(item, str):
                        node_ids.add(item)
                    else:
                        traverse(item)

        traverse(self.structure)
        return node_ids
