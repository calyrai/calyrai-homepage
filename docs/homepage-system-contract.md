# Homepage System Contract

Status: Working architecture contract
Scope: CALYRAI homepage and LITHOS homepage as one coherent system

## Purpose

Define one level above implementation:
- how both homepages should work together,
- what is shared,
- what is page-specific,
- and where this maps into the current repository.

This document is a system contract, not a component spec.

## System Roles

### CALYRAI Homepage Role

- System entry point
- Ecosystem orientation
- Platform discovery and routing
- Trust and context building

Primary question answered:
What is the CALYRAI ecosystem and where should the visitor go next?

### LITHOS Homepage Role

- Domain-specific deep dive
- Consequence intelligence narrative
- Problem-to-solution argumentation
- Conversion-oriented next step

Primary question answered:
Why LITHOS and what action should the visitor take now?

## Shared Contract (must stay aligned)

### 1. Semantic Authoring Contract

Both pages are authored semantically in YAML and compiled to runtime artifacts.

Design decision (normative):
- A page is defined by YAML plus rule application, not by hand-authored page HTML.
- HTML files are allowed only as generated publication artifacts.
- Generated HTML must never become the semantic source of truth.

Shared authoring fields:
- content
- intent
- render
- behavior
- explain

### 2. Visual DNA Contract

Both pages share:
- token system (`theme/base.yaml`, `skins/oracle.yaml`)
- typography and spacing scales
- line width policy
- base interaction language (dot response, touch behavior)

Page-level intensity may differ, but interaction semantics must match.

### 3. Interaction Contract

Dot interactions are allowed to differ in tuning, but follow the same model:
- pointer field input
- repulsion + viscous return
- stochastic sparkle
- mobile and desktop parity

Core logic stays shared in utility layers where possible.

### 4. Navigation Contract

- CALYRAI must route to LITHOS as a deep-dive pathway.
- LITHOS must route back to CALYRAI as ecosystem context.
- Navigation labels and route semantics must remain consistent across both pages.

### 5. Generation Boundary Contract

- Authoring input: YAML sources (`content/content.yaml`, `content/structure.yaml`, theme/skin tokens).
- Rule application: compiler validation, normalization, and route policy enforcement.
- Publication output: generated artifacts (JSON and, where needed, HTML).
- Manual edits to generated page HTML are non-normative and should be overwritten by the next compile.

### 6. React Flow Design Contract

- The ecosystem map (React Flow style interaction surface) is a runtime projection of authored semantics, not a hand-drawn static page.
- Nodes and edges must be generated from compiled graph/flow artifacts, with traceability to YAML node ids.
- Layout policy may be computed at runtime, but must follow authored intent and relation metadata.
- Visual style for this surface follows a Swiss-style system language: strict grid discipline, strong typographic hierarchy, restrained color usage, and high information clarity.
- Swiss-style treatment is a design policy layer, not a second source of content truth.

## Page-specific Contracts

### CALYRAI Contract

Content priority:
1. Brand and system promise
2. Platform landscape
3. Architecture context
4. Contact and continuation

Design behavior:
- broader narrative
- lower conversion pressure
- high orientation value

### LITHOS Contract

Content priority:
1. Problem framing
2. Method and mechanism
3. Evidence and consequences
4. Action and next step

Design behavior:
- narrow narrative focus
- stronger decision guidance
- explicit action path

## Repository Mapping

### Page Mapping Matrix (authoring -> runtime -> publication)

CALYRAI system homepage:
- Authoring intent and routes: `content/content.yaml`, `content/structure.yaml`
- Compiled model: `generated/nexus.ast.json`, `web/src/data/runtimeArtifacts.js`
- Runtime entry: `web/src/App.jsx` (AST rendering path)
- Published output: `web/public/index.html`

LITHOS deep-dive page:
- Authoring route declaration: `content/content.yaml` (tile id `lithos` -> `/research/platforms/lithos/index.html`)
- Compiled model and route exposure: `generated/nexus.ast.json`, `web/src/data/runtimeArtifacts.js`
- Runtime navigation source: `web/src/components/Tile.jsx`
- Published output: `web/public/research/platforms/lithos/index.html`

Cross-page coherence rule:
- CALYRAI is the orientation layer and owns discovery/routing semantics.
- LITHOS is the consequence-intelligence deep dive and must remain reachable from CALYRAI route semantics.
- Route intent is authored in YAML and validated during compile, never in hand-maintained publication HTML.

### Architecture and policy
- `docs/calyrai-semantic-construction.md`
- `docs/homepage-system-contract.md`

### Interaction implementation anchors
- `web/src/components/logo/LogoAnimation.jsx`
- `web/src/components/logo/LogoCanvasEngine.js`
- `web/src/components/Navigation.jsx`
- `web/src/utils/dotInteraction.js`

### React Flow and graph anchors
- `generated/nexus.graph.json`
- `generated/nexus.flowchart.json`
- `generated/nexus.ast.json`

### Semantic source and compile chain
- `content/content.yaml`
- `content/structure.yaml`
- `theme/base.yaml`
- `skins/oracle.yaml`
- `build/compile.py`

### Publication artifact examples (generated)
- `web/public/index.html`
- `web/public/research/platforms/lithos/index.html`
- `web/public/research/platforms/core/index.html`

### Design policy references
- `docs/reactflow-swiss-design-contract.md`

## Implementation Rule

Before feature work:
1. classify change as shared contract or page-specific contract,
2. update semantic source first,
3. apply or update rules in compiler/runtime policy layers,
4. keep runtime components thin and policy-driven,
5. treat generated HTML as build output only,
6. verify mobile parity and route coherence.

## Acceptance Criteria (system-level)

- Both pages read as one brand system, not two disconnected sites.
- CALYRAI to LITHOS journey is explicit and reversible.
- Interaction language is consistent in model, different only in tuning.
- Semantic authoring remains source of truth for structure and behavior policy.
- React Flow style ecosystem visualization is derived from compiled semantics and conforms to Swiss-style clarity rules.