# Blueprint: Knowledge Network -> Interface

## Premise

This system is no longer modeled as:

Homepage -> Pages -> Content

It is modeled as:

Knowledge Network -> Interface Emerges

The paper is the atomic unit.

## Atomic Unit: Paper

Each paper contains semantic structure:

- Abstract
- Sections
- Subsections
- Figures
- Glyphs
- References

## Graph Model

- Paper = node
- Section = addressable subnode
- Relation = first-class edge
- Cluster = emergent graph property (not hardcoded menu taxonomy)

## Navigation Principle

Navigation follows topology, not navigation trees.

- Dense graph regions -> cluster surfaces
- Sparse graph regions -> exploratory space
- Current homepage view -> one projection of the graph

## Compression / Expansion Cycle

Paper -> Abstract -> Concept -> Glyph

Glyph -> Concept -> Abstract -> Paper

## Development Reorganization

1. Author content as markdown papers under `knowledge_network/papers/`.
2. Encode inter-paper and section links directly in markdown.
3. Build atlas graph from markdown into `knowledge_network/build/atlas.json`.
4. Generate homepage and derived pages from atlas projections.
5. Add interactive graph visual layer in a later stage.

## Non-Goals (Current Stage)

- No hardcoded menu-first IA as primary source.
- No premature interactive graph complexity before graph data model stabilizes.

## Immediate Working Rule

If content structure and graph topology conflict, topology is the source of truth.
