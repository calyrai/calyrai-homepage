"""Shared schema constants for the Nexus compiler pipeline."""

# Type inference rules for AST nodes
NODE_TYPE_RULES = {
    "homepage": "page",
    "movie": "section",
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

# Core node payload fields shared by resolver/builders
NODE_TEXT_FIELDS = (
    "title",
    "tile_lead",
    "tile_accent",
    "tile_title",
    "tile_summary",
    "subtitle",
    "landing_message",
    "summary",
    "body",
    "icon",
    "route",
)

NODE_LIST_FIELDS = (
    "links",
    "institutions",
)

# Validation-related structure keys
# brand: meta-node never in structure
# movie/platforms/architecture/footer: synthetic layout sections built at runtime
# from the grid definition — they live in content for copy but are not
# explicitly referenced in structure.yaml
SKIP_STRUCTURE_CHECK = {"brand", "movie", "platforms", "architecture", "footer"}
STRUCTURE_NODE_LIST_KEYS = {"children", "header", "hero", "footer", "tiles"}

# Graph mapping keys
GRAPH_NODES_KEY = "nodes"
GRAPH_EDGES_KEY = "edges"
