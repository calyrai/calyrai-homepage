"""
Resolution Layer — Node Data Resolution

Resolves complete node objects by merging data from multiple YAML sources:
    • structure.yaml   → Position in hierarchy
    • content.yaml     → Text, metadata (title, summary, body, icon, route)
    • graph.yaml       → Relationships (incoming/outgoing edges)
    • interaction.yaml → User behaviors and event handlers
    • theme.yaml       → (Referenced by builders, not directly by resolver)

Each resolved node is a complete object with all context needed by downstream
consumers (React, HTML, ReactFlow, etc.).

Cache Strategy:
    • Lazy evaluation: nodes resolved on-demand
    • Memoization: each node resolved once and cached
    • Deterministic: same input always produces same output
"""

from typing import Any


class Resolver:
    """Resolves node data from all YAML sources into complete objects."""

    def __init__(self, source: dict[str, Any]) -> None:
        """
        Initialize resolver with YAML sources.
        
        Args:
            source: Dict with keys: 'structure', 'content', 'graph', 'interaction', 'theme'
        """
        self.structure = source.get("structure", {})
        self.content = source.get("content", {})
        self.graph = source.get("graph", {})
        self.interaction = source.get("interaction", {})
        self._cache: dict[str, dict[str, Any]] = {}

    def resolve_all(self) -> dict[str, Any]:
        """
        Resolve all nodes and return as dict.
        
        Returns:
            dict[str, Any]: Map of node_id → resolved_node
        """
        for node_id in self.content:
            self.resolve_node(node_id)
        return self._cache

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

        # Extract content data
        content_data = self.content.get(node_id, {})

        # Build resolved node
        node = {
            "id": node_id,
            "title": content_data.get("title", ""),
            "tile_lead": content_data.get("tile_lead", ""),
            "tile_accent": content_data.get("tile_accent", ""),
            "tile_title": content_data.get("tile_title", ""),
            "tile_summary": content_data.get("tile_summary", ""),
            "subtitle": content_data.get("subtitle", ""),
            "landing_message": content_data.get("landing_message", ""),
            "summary": content_data.get("summary", ""),
            "body": content_data.get("body", ""),
            "icon": content_data.get("icon", ""),
            "route": content_data.get("route", ""),
            "institutions": content_data.get("institutions", []),
        }

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

    def _resolve_relations(self, node_id: str) -> dict[str, list[str]]:
        """
        Resolve incoming and outgoing graph edges for a node.
        
        Args:
            node_id: The node to find relations for
            
        Returns:
            dict with 'incoming' and 'outgoing' lists of node IDs
        """
        edges = self.graph.get("edges", [])
        incoming: list[str] = []
        outgoing: list[str] = []

        for source, target in edges:
            if target == node_id and source not in incoming:
                incoming.append(source)
            if source == node_id and target not in outgoing:
                outgoing.append(target)

        return {
            "incoming": incoming,
            "outgoing": outgoing,
        }
