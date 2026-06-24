"""
Builders Layer — Nexus Artifact Construction

Constructs the four Nexus JSON artifacts:
    • nexus.ast.json   → Abstract syntax tree (fully resolved homepage)
    • nexus.graph.json → Knowledge graph (for ReactFlow, Oracle, Delphi)
    • nexus.theme.json → Design system (colors, typography, spacing)
    • nexus.index.json → Search index (for discovery, autocomplete)

Each builder is independent and responsible for one artifact.
"""

from typing import Any

# Type inference rules for AST nodes
# These map node IDs to their semantic types
NODE_TYPE_RULES = {
    "homepage": "page",
    "platforms": "section",
    "architecture": "section",
    "hero": "hero",
    "core": "tile",
    "brix": "tile",
    "aflowtex": "tile",
    "lithos": "tile",
    "oracle": "tile",
    "delphi": "tile",
    "ecosystem": "tile",
    "philosophy": "tile",
    "contact": "tile",
}


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
        for node_id in homepage_def.get("header", []) if isinstance(homepage_def, dict) else []:
            child_def = self.structure.get(node_id, {})
            children.append(self._build_node(node_id, child_def))

        # Hero nodes
        for node_id in homepage_def.get("hero", []) if isinstance(homepage_def, dict) else []:
            child_def = self.structure.get(node_id, {})
            children.append(self._build_node(node_id, child_def))

        # Grid nodes -> semantic sections
        grid_def = homepage_def.get("grid", {}) if isinstance(homepage_def, dict) else {}
        tiles = grid_def.get("tiles", []) if isinstance(grid_def, dict) else []
        if isinstance(tiles, list) and tiles:
            platforms_tiles = tiles[:6]
            architecture_tiles = tiles[6:]

            if platforms_tiles:
                children.append(self._build_node("platforms", {"children": platforms_tiles}))

            if architecture_tiles:
                children.append(self._build_node("architecture", {"children": architecture_tiles}))

        # Footer wrapper with optional footer children
        footer_ids = homepage_def.get("footer", []) if isinstance(homepage_def, dict) else []
        if isinstance(footer_ids, list):
            footer_def = {"children": footer_ids}
            children.append(self._build_node("footer", footer_def))

        if children:
            page_node["children"] = children

        return page_node

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
        if node_id in self.resolved:
            resolved = self.resolved[node_id]
            node.update({
                "title": resolved.get("title", ""),
                "subtitle": resolved.get("subtitle", ""),
                "summary": resolved.get("summary", ""),
                "body": resolved.get("body", ""),
                "icon": resolved.get("icon", ""),
                "route": resolved.get("route", ""),
            })

            # Add relations if they exist and are non-empty
            relations = resolved.get("relations", {})
            if relations and (relations.get("incoming") or relations.get("outgoing")):
                node["relations"] = relations

        # Recursively add children
        if isinstance(node_def, dict) and "children" in node_def:
            children = node_def["children"]
            if isinstance(children, list):
                node["children"] = []
                for child_id in children:
                    child_def = self.structure.get(child_id, {})
                    child_node = self._build_node(child_id, child_def)
                    node["children"].append(child_node)

        return node

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


class GraphBuilder:
    """Builds the knowledge graph for visualization and navigation."""

    def __init__(self, source: dict[str, Any], resolved: dict[str, Any]) -> None:
        """
        Initialize graph builder.
        
        Args:
            source: Raw YAML sources
            resolved: Resolved node data from Resolver
        """
        self.source = source
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
        nodes: list[dict[str, Any]] = []

        for node_id in self.resolved:
            resolved = self.resolved[node_id]
            node = {
                "id": node_id,
                "label": resolved.get("title", node_id),
                "data": {
                    "title": resolved.get("title", ""),
                    "summary": resolved.get("summary", ""),
                    "icon": resolved.get("icon", ""),
                },
            }
            nodes.append(node)

        return nodes

    def _build_edges(self) -> list[dict[str, Any]]:
        """Build graph edges from structure."""
        edges: list[dict[str, Any]] = []
        graph_edges = self.graph.get("edges", [])

        for source, target in graph_edges:
            edge = {
                "source": source,
                "target": target,
                "id": f"{source}→{target}",
            }
            edges.append(edge)

        return edges


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
        """
        Build compiled design system with template resolution.
        
        Performs:
            • Variable expansion (e.g., {{ colors.primary }} → #0A2E45)
            • Recursive resolution of nested references
        
        Returns:
            dict[str, Any]: Complete theme configuration with resolved variables
        """
        # Build a flat resolution context from the theme structure
        # This allows skin components to reference colors directly: {{ colors.primary }}
        resolution_context = {
            'colors': self.theme.get('skin', {}).get('colors', {}),
            **self.theme.get('skin', {}),  # Also include direct skin references
        }
        
        # Deep copy to avoid modifying original
        import copy
        resolved_theme = copy.deepcopy(self.theme)
        
        # Resolve templates in the theme
        resolved_theme = self._resolve_with_context(resolved_theme, resolution_context)
        return resolved_theme

    def _resolve_with_context(self, obj: Any, context: dict[str, Any], max_depth: int = 5) -> Any:
        """
        Recursively resolve template references using a provided context.
        
        Args:
            obj: The object to resolve (dict, list, str, etc.)
            context: The resolution context (dict with colors, components, etc.)
            max_depth: Maximum recursion depth to prevent infinite loops
        
        Returns:
            The object with all templates resolved
        """
        if max_depth <= 0:
            return obj
        
        if isinstance(obj, dict):
            resolved = {}
            for key, value in obj.items():
                resolved[key] = self._resolve_with_context(value, context, max_depth - 1)
            return resolved
        elif isinstance(obj, list):
            return [self._resolve_with_context(item, context, max_depth - 1) for item in obj]
        elif isinstance(obj, str):
            return self._resolve_template_string_with_context(obj, context)
        else:
            return obj

    def _resolve_template_string_with_context(self, s: str, context: dict[str, Any]) -> str:
        """
        Resolve {{ ... }} template references in a string using provided context.
        
        Examples:
            "{{ colors.primary }}" → "#0a2e45" (from context['colors']['primary'])
            "1px solid {{ colors.border }}" → "1px solid #c8e8f2"
        
        Args:
            s: The string to resolve
            context: The resolution context
        
        Returns:
            The string with all templates resolved
        """
        import re
        
        def replace_template(match):
            path = match.group(1).strip()  # Extract "colors.primary" from {{ colors.primary }}
            value = self._get_nested_value(context, path)
            if value is None:
                # If not found, return the original template (for debugging)
                return f"/* UNRESOLVED: {path} */"
            return str(value)
        
        # Find all {{ ... }} templates and replace them
        return re.sub(r'\{\{\s*([^}]+)\s*\}\}', replace_template, s)

    def _get_nested_value(self, obj: Any, path: str) -> Any:
        """
        Get value from nested dict using dot notation.
        
        Examples:
            path="colors.primary" → obj["colors"]["primary"]
            path="skin.components.tile.background" → obj["skin"]["components"]["tile"]["background"]
        
        Args:
            obj: The object to query
            path: Dot-notation path (e.g., "colors.primary")
        
        Returns:
            The value at the path, or None if not found
        """
        keys = path.split('.')
        current = obj
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        return current


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
        """
        Build searchable index for discovery and autocomplete.
        
        Format:
            {
              "nodeId": {
                "title": "...",
                "summary": "...",
                "keywords": ["..."],
                "route": "/...",
                "body_preview": "..."
              },
              ...
            }
        
        Returns:
            dict[str, Any]: Searchable index
        """
        index: dict[str, Any] = {}

        for node_id, resolved in self.resolved.items():
            # Extract keywords from title and summary
            keywords = self._extract_keywords(
                resolved.get("title", ""),
                resolved.get("summary", ""),
            )

            entry = {
                "title": resolved.get("title", ""),
                "summary": resolved.get("summary", ""),
                "body_preview": resolved.get("body", "")[:200],
                "route": resolved.get("route", ""),
                "icon": resolved.get("icon", ""),
                "keywords": keywords,
            }

            index[node_id] = entry

        return index

    def _extract_keywords(self, *texts: str) -> list[str]:
        """
        Extract unique keywords from text fields.
        
        Simple tokenization: split on whitespace and lowercase.
        Could be improved with:
            • Stop word removal
            • Lemmatization
            • N-grams
            • Semantic similarity
        
        Args:
            *texts: Variable text fields to extract keywords from
            
        Returns:
            list[str]: Unique keywords
        """
        keywords: set[str] = set()

        for text in texts:
            if text:
                words = text.lower().split()
                keywords.update(words)

        return sorted(list(keywords))
