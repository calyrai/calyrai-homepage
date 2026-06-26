# CALYRAI Semantic Construction Policy

Status: Draft normative engineering policy
Scope: CALYRAI web systems, semantic interfaces, generated artifacts, and compiler-driven frontend construction
Authority: CALYRAI engineering method

## Purpose

CALYRAI should construct web systems from authored semantics, not from scattered manual component decisions.

The authoring source is YAML.
The compiler resolves YAML into normalized artifacts.
The frontend renders those artifacts and applies authored behavior policies.

This is the preferred and normative way CALYRAI codes web systems.

## Policy Classification

- Policy type: Architecture and construction policy
- Domain: Semantic web construction
- Applies to: new web features, structural refactors, generated page systems, compiler-backed interfaces
- Does not replace: accessibility requirements, security requirements, deployment policy, or repository governance

## Core Principle

Author:
- what exists
- what it means
- how it should behave
- how it should be visualized

Compile:
- normalize source data
- validate structure and references
- attach trace metadata
- emit renderable artifacts

Render:
- consume compiled artifacts
- apply authored render and behavior policy
- keep runtime components thin

## Construction Stack

1. Authoring layer
- YAML content, structure, behavior, interaction, and flow definitions

2. Compiler layer
- validation
- resolution
- typed AST construction
- graph construction
- flowchart construction
- trace metadata emission

3. Runtime layer
- React renderer
- policy-aware services
- theme application
- responsive behavior

4. Output layer
- webpage
- graph view
- flowchart
- search index
- docs-ready artifacts

## Canonical Authoring Model

Every authored node may contain five categories of information.

### 1. Content

Use for text and structured data.

```yaml
platforms:
  title: "Platforms"
  subtitle: "Applied intelligence modules"
  summary: >
    Core platform modules for engineering,
    medicine, reasoning, and decision support.
  body: >
    Introductory copy for the section.
  route: /platforms
  links: []
  institutions: []
```

### 2. Intent

Use for semantic purpose and audience.

```yaml
platforms:
  intent:
    purpose: capability-overview
    audience: first-visit
```

### 3. Behavior

Use for policy, not low-level implementation.

```yaml
platforms:
  behavior:
    collapsible: true
    default_expanded: false
    persistence: none
```

Good behavior fields:
- collapsible
- default_expanded
- persistence
- mobile_policy
- quick_contact
- visibility_policy

Do not put low-level browser mechanics in YAML.

Do not encode:
- event listener wiring
- pointer threshold math
- localStorage implementation details
- canvas frame logic

### 4. Render

Use for visualization intent.

```yaml
platforms:
  render:
    variant: tile-grid
    source: homepage.grid.first-band
    emphasis: primary
```

Good render fields:
- variant
- source
- emphasis
- layout_band
- flow_kind
- node_kind

### 5. Explain

Use for human-readable rationale.

```yaml
platforms:
  explain:
    why: Present the primary product modules before the broader ecosystem context.
```

This is essential for traceability and future maintainability.

## Flowchart Authoring

A page flow should be authorable directly in YAML.

```yaml
__flowchart:
  homepage:
    title: "Homepage Narrative Flow"
    direction: TD
    nodes:
      - id: landing
        label: "Visitor lands"
        kind: start
      - id: hero_stage
        ref: hero
        label: "Brand promise"
      - id: platforms_stage
        ref: platforms
        label: "Platform overview"
    edges:
      - [landing, hero_stage]
      - [hero_stage, platforms_stage]
```

The compiler should emit:
- normalized flow JSON
- Mermaid-ready text
- references back to authored nodes where possible

## Runtime Rules

Runtime components should not invent content meaning when that meaning can be authored.

Preferred runtime behavior:
- read node behavior policy from compiled AST
- read node render policy from compiled AST
- use services to interpret policy
- keep components focused on rendering and interaction execution

Avoid:
- hardcoded semantic decisions spread across components
- hidden layout rules that are not represented in authored source
- duplicating meaning in both YAML and JSX

## Compiler Rules

The compiler should be explicit and inspectable.

Required properties of the compiler:
- validate authored references
- normalize node structure
- emit typed artifacts
- emit trace metadata
- preserve authored intent blocks
- generate explainable outputs

Preferred artifact set:
- `nexus.ast.json`
- `nexus.graph.json`
- `nexus.theme.json`
- `nexus.index.json`
- `nexus.flowchart.json`

## Editability Rules

A change should have one obvious home.

Examples:
- copy change -> content YAML
- semantic purpose change -> intent block
- behavior change -> behavior block
- visualization change -> render block
- compile rule change -> compiler transform
- styling change -> CSS or component styling

If a change requires hunting through many unrelated files, the construction model is not yet clean enough.

## What Stays In Code

The following remain implementation concerns and should stay in code:
- React composition
- event execution
- accessibility wiring
- animation implementation
- DOM integration
- canvas drawing
- network loading
- fallback and resilience behavior

YAML declares policy.
Code executes policy.

## Current Direction In This Repository

This repository already starts the CALYRAI construction method:
- authored `intent`, `render`, `behavior`, and `explain` blocks exist in content YAML
- flow definitions are authored in YAML
- the compiler emits a dedicated flowchart artifact
- AST nodes now carry trace metadata
- the frontend prefers compiled artifacts at runtime with a bundled fallback
- section behavior is beginning to consume authored policy instead of only hardcoded rules

## Implementation Standard

For new features, prefer this order:

1. Add semantic authoring fields in YAML
2. Extend validation if needed
3. Extend compiler output
4. Consume compiled policy in runtime services
5. Keep component code thin and policy-aware
6. Document exceptions explicitly when authored semantics are insufficient

## Exceptions

Exceptions are allowed only when one of the following is true:

- the behavior depends on low-level browser mechanics that should not be authored in YAML,
- the feature is purely presentational and has no durable semantic value,
- a temporary implementation is needed during migration toward semantic construction.

When an exception is taken, document:

- why the behavior stays in code,
- where the implementation lives,
- what would be required to move it into the semantic authoring model later.
5. Keep the component layer thin
6. Document the authoring pattern

## Short Formula

CALYRAI web construction is:

content + intent + behavior policy + render policy + explainability
-> compiled semantic artifacts
-> runtime rendering
-> inspectable outputs

## Publishing Note

This document is intended to be published as the normative CALYRAI policy for semantic web construction.
