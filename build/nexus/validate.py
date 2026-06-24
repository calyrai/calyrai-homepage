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

# Validation rules (extracted as constants for clarity)
SKIP_STRUCTURE_CHECK = {"brand"}  # Meta-nodes that may not be in structure
SPECIAL_CASES = {"platforms", "architecture", "hero", "contact", "ecosystem"}


class Validator:
    """Validates YAML source coherence across all layers."""

    def __init__(self, source: dict[str, Any]) -> None:
        """
        Initialize validator with YAML sources.
        
        Args:
            source: Dict with keys: 'structure', 'content', 'graph', 'interaction', 'theme'
        """
        self.source = source
        self.structure = source.get("structure", {})
        self.content = source.get("content", {})
        self.graph = source.get("graph", {})
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def validate(self) -> bool:
        """
        Run all validations.
        
        Returns:
            bool: True if no errors (warnings are acceptable)
        """
        self._check_graph_validity()
        self._check_structure_completeness()
        self._check_content_completeness()
        return len(self.errors) == 0

    def _check_graph_validity(self) -> None:
        """Verify graph nodes and edges reference valid content nodes."""
        graph_nodes = self.graph.get("nodes", [])
        for node_id in graph_nodes:
            if node_id not in self.content:
                self.errors.append(
                    f"Graph node '{node_id}' not found in content"
                )

        edges = self.graph.get("edges", [])
        for source, target in edges:
            if source not in self.content:
                self.errors.append(
                    f"Graph edge source '{source}' not found in content"
                )
            if target not in self.content:
                self.errors.append(
                    f"Graph edge target '{target}' not found in content"
                )

    def _check_structure_completeness(self) -> None:
        """Verify all nodes in structure have content entries."""
        node_ids = self._extract_all_node_ids()
        for node_id in node_ids:
            if node_id not in self.content:
                self.warnings.append(
                    f"Node '{node_id}' in structure but not in content"
                )

    def _check_content_completeness(self) -> None:
        """Verify all content entries are referenced in structure."""
        node_ids = self._extract_all_node_ids()
        for node_id in self.content:
            if node_id not in node_ids and node_id not in SKIP_STRUCTURE_CHECK:
                self.warnings.append(
                    f"Node '{node_id}' in content but not in structure"
                )

    def _extract_all_node_ids(self) -> set[str]:
        """
        Recursively extract all node IDs from structure.
        
        Returns:
            set[str]: All unique node IDs found in structure
        """
        node_ids: set[str] = set()

        def traverse(obj: Any) -> None:
            """Recursively traverse structure and collect node IDs."""
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if key == "children" and isinstance(value, list):
                        for child_id in value:
                            if isinstance(child_id, str):
                                node_ids.add(child_id)
                    else:
                        traverse(value)
            elif isinstance(obj, list):
                for item in obj:
                    traverse(item)

        traverse(self.structure)
        return node_ids
