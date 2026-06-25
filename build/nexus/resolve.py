"""
Resolution Layer — Node Data Resolution

Resolves complete node objects by merging data from multiple YAML sources:
    • structure.yaml   → Position in hierarchy
    • content.yaml     → Text, metadata (title, summary, body, icon, route)
    • graph            → Relationships (incoming/outgoing edges)
    • interaction      → User behaviors and event handlers
    • theme.yaml       → (Referenced by builders, not directly by resolver)

Each resolved node is a complete object with all context needed by downstream
consumers (React, HTML, ReactFlow, etc.).

Cache Strategy:
    • Lazy evaluation: nodes resolved on-demand
    • Memoization: each node resolved once and cached
    • Deterministic: same input always produces same output
"""

from typing import Any

from .schema import GRAPH_EDGES_KEY, NODE_LIST_FIELDS, NODE_TEXT_FIELDS


class Resolver:
    """Resolves node data from all YAML sources into complete objects."""

    def __init__(self, source: dict[str, Any]) -> None:
        self.content = source.get("content", {})
        self.graph = source.get("graph", {})
        self.interaction = source.get("interaction", {})
        self._cache: dict[str, dict[str, Any]] = {}

    def resolve_all(self) -> dict[str, Any]:
        """Resolve all content nodes and return as id → node map."""
        return {nid: self.resolve_node(nid) for nid in self.content}

    def resolve_node(self, node_id: str) -> dict[str, Any]:
        """
        Resolve a single node by merging all sources.
        
        Merges:
            1. Content data (title, summary, body, etc.)
            2. Graph relations (incoming/outgoing edges)
            3. Interaction rules (behaviors, handlers)
        
        Uses caching for efficiency.
        
        Args:
            node_id: The unique node identifier
            
        Returns:
            dict[str, Any]: Fully resolved node with all fields
        """
        # Check cache first (memoization)
        if node_id in self._cache:
            return self._cache[node_id]

        content_data = self.content.get(node_id, {})
        node = {"id": node_id, **self._build_content_payload(content_data)}

        # Add graph relations (incoming/outgoing edges)
        relations = self._resolve_relations(node_id)
        node["relations"] = relations

        # Add interaction rules
        behaviors = self.interaction.get(node_id, {})
        if behaviors:
            node["interaction"] = behaviors

        # Cache and return
        self._cache[node_id] = node
        return node

    def _build_content_payload(self, content_data: Any) -> dict[str, Any]:
        """Create a normalized node payload from content fields."""
        if not isinstance(content_data, dict):
            content_data = {}
        payload = {f: content_data.get(f, "") for f in NODE_TEXT_FIELDS}
        for f in NODE_LIST_FIELDS:
            v = content_data.get(f, [])
            payload[f] = v if isinstance(v, list) else []
        return payload

    def _resolve_relations(self, node_id: str) -> dict[str, list[str]]:
        """
        Resolve incoming and outgoing graph edges for a node.
        
        Args:
            node_id: The node to find relations for
            
        Returns:
            dict with 'incoming' and 'outgoing' lists of node IDs
        """
        edges = self.graph.get(GRAPH_EDGES_KEY, [])
        incoming: list[str] = []
        outgoing: list[str] = []

        for edge in edges:
            if not isinstance(edge, (list, tuple)) or len(edge) != 2:
                continue

            source, target = edge
            if target == node_id and source not in incoming:
                incoming.append(source)
            if source == node_id and target not in outgoing:
                outgoing.append(target)

        return {
            "incoming": incoming,
            "outgoing": outgoing,
        }
