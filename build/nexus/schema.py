"""Shared schema constants for the Nexus compiler pipeline."""

# Type inference rules for AST nodes
NODE_TYPE_RULES = {
    "homepage": "page",
    "movie": "section",
    "platforms": "section",
    "applications": "section",
    "applied": "section",
    "architecture": "section",
    "contact_main": "section",
    "hero": "hero",
    "core": "tile",
    "brix": "tile",
    "aflowtex": "tile",
    "bio_nanoparticles": "tile",
    "core_facility_studio": "tile",
    "qty_alphafold_oracle": "tile",
    "explore_data": "tile",
    "explore_surrogate": "tile",
    "explore_prediction": "tile",
    "explore_oracle": "tile",
    "vascular_applications": "tile",
    "biophysical_applications": "tile",
    "pythia_spr": "tile",
    "pythia_saxs": "tile",
    "pythia_metabolic": "tile",
    "lithos": "tile",
    "oracle": "tile",
    "pythia": "tile",
    "method_catalog": "tile",
    "interface_catalog": "tile",
    "swiss_code": "tile",
    "ecosystem": "tile",
    "philosophy": "tile",
    "contact": "tile",
    "impressum": "tile",
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
    "contacts",
)

NODE_STRUCTURED_FIELDS = (
    "intent",
    "render",
    "behavior",
    "explain",
)

# Validation-related structure keys
# brand: meta-node never in structure
SKIP_STRUCTURE_CHECK = {"brand", "route_policy"}
STRUCTURE_NODE_LIST_KEYS = {"children"}

# Graph mapping keys
GRAPH_NODES_KEY = "nodes"
GRAPH_EDGES_KEY = "edges"
