# React Flow Swiss Design Contract

Status: Working design and implementation contract
Scope: Ecosystem and relationship surfaces rendered with React Flow style interactions

## Purpose

Define how the React Flow design idea is implemented without violating YAML-first semantics.

This contract ensures:
- semantic source remains YAML,
- graph surfaces are rule-driven projections,
- visual language follows Swiss-style clarity.

## Source-of-Truth Rule

- Content and relations are authored in YAML and compiled.
- Runtime graph views consume compiled artifacts.
- Hand-maintained graph HTML is not an authoring source.

Authoring sources:
- `content/content.yaml`
- `content/structure.yaml`

Compiled graph sources:
- `generated/nexus.graph.json`
- `generated/nexus.flowchart.json`
- `generated/nexus.ast.json`

## Swiss Design Rules

1. Grid discipline
- Node placement should follow a visible structural grid.
- Spacing increments must be consistent across the full view.

2. Typographic hierarchy
- One dominant label level for primary entities.
- Secondary metadata must be visually subordinate.

3. Restrained palette
- Use a reduced accent set tied to semantic roles.
- Avoid decorative color noise.

4. Clarity before ornament
- Every node and edge style must communicate meaning.
- Remove effects that do not add information value.

5. Predictable interaction
- Hover and select states should be minimal and explicit.
- Motion should support orientation, not spectacle.

## Runtime Projection Rules

- Node ids in the graph must map to compiled semantic ids.
- Edge semantics should map to relation or flow definitions.
- Any auto-layout must be deterministic for the same input.
- Styling rules must be tokenized and theme-driven.

## CALYRAI and LITHOS in React Flow

- CALYRAI role in graph: orientation hub and route distributor.
- LITHOS role in graph: consequence-intelligence deep-dive node/group.
- The CALYRAI-to-LITHOS path must be explicit and reversible.

## Implementation Boundary

- Allowed runtime work:
  - layout algorithms
  - interaction tuning
  - responsive viewport behavior
  - accessibility and keyboard navigation

- Not allowed as source:
  - manual semantic rewrites in graph component code
  - hand-edited publication HTML for relationship truth

## Acceptance Criteria

- Graph can be regenerated from YAML and rules without manual correction.
- CALYRAI and LITHOS roles are legible at first scan.
- Visual output reflects Swiss-style hierarchy and spacing discipline.
- Runtime behavior remains consistent on desktop and mobile.

## Current Baseline (2026-07-01)

Latest agreed decisions to keep stable for next iterations:
- React Flow style surfaces are generated from semantic artifacts, not manually authored as page HTML.
- CALYRAI remains the orientation and routing hub; LITHOS remains the focused deep-dive consequence node/group.
- Swiss-style visual discipline is required for graph readability (grid, hierarchy, restrained accents, clarity-first motion).
- Compiler and route rules remain the governance layer; runtime implements projection and interaction only.

Immediate next-session focus:
- Define deterministic layout rules for CALYRAI hub, platform ring/grouping, and LITHOS deep-dive prominence.
- Formalize semantic-to-visual token mapping for node class, edge class, and interaction state.