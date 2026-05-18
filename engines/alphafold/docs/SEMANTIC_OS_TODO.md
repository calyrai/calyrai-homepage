# Nexus — Semantic Field Computation
## Implementation Roadmap

> Nexus is not a workflow editor, a dashboard, or a node tool.
> It is **semantic field computation** — a calm runtime where meaning,
> transformation, propagation, and coherence become visually perceivable.

```
JSON
↓
Semantic Interpreter
↓
React Flow Renderer
↓
Field-Based Runtime Visualization
```

The UI is a **projection of semantic state**. Not manually styled software.

---

## Core Rendering Laws

Visuals emerge deterministically from semantic state. Never from pixel styling.

```json
{
  "type": "SAXS",
  "semantic": "reciprocal-space",
  "runtime": "active",
  "coherence": 0.82
}
↓
white node · amber field · active orbital · aligned propagation
```

| Element        | Meaning                    |
|----------------|----------------------------|
| white node     | ontology anchor            |
| colored field  | semantic domain state      |
| white pulses   | information flow           |
| orbital ring   | transformation activity    |

---

## Semantic Color Field (Glow Domain)

| Domain               | Field Color |
|----------------------|-------------|
| structural biology   | blue        |
| reciprocal space     | amber       |
| AI / transform       | violet      |
| runtime / HPC        | green       |
| topology             | cyan        |
| errors / invalid     | red         |

Nodes themselves remain: **white · stable · minimal · calm**.
Color lives in the glow outward from the node. Not in the node body.

---

## Cognitive Layout

```
┌────────────────────────────────────────────┐
│ NODES / SEARCH / COMMANDS                  │  ← semantic vocabulary
├───────────────────────┬────────────────────┤
│                       │                    │
│                       │       ATLAS        │  ← semantic memory / context
│       CANVAS          │                    │
│  transformation field │                    │
├───────────────────────┴────────────────────┤
│ RUNTIME / EVENTS                           │  ← execution substrate
└────────────────────────────────────────────┘
```

| Region | Cognitive Role              |
|--------|-----------------------------|
| Top    | semantic vocabulary         |
| Center | transformation field        |
| Right  | semantic memory / context   |
| Bottom | runtime / execution         |

---

## Status key

- [ ] not started
- [~] in progress
- [x] done

---

## Phase 0 — Semantic Foundation

### 0.1 Semantic naming pass
- [x] Rename pipeline nodes to semantic scientific names.
- Completed names:
  - FASTA Input · QTY Transform · Domain Segmentation · AF3 Payload Builder · ASC Submission
- Registry keys updated to match semantic steps.

### 0.2 Cognitive layout
- [ ] Re-position nodes to reflect cognitive stratification.
- Layout rules:
  - Left → right: input, transform, compile, dispatch
  - Vertical: top = orchestration, bottom = runtime substrate
- Acceptance:
  - Graph reads directionally without labels.
  - Recenter preserves semantic positions.

---

## Phase 1 — Field and Propagation

### 1.1 Semantic domain field glow
- [ ] Replace accent-color node borders with semantic domain glow.
- Laws:
  - Nodes remain white.
  - Glow color = semantic domain (see table above).
  - Glow intensity = coherence value (0.0–1.0).
  - No color applied to node body, background, or border.
- Domain assignments for current nodes:
  - FASTA Input → structural biology → blue
  - QTY Transform → AI / transform → violet
  - Domain Segmentation → AI / transform → violet
  - AF3 Payload Builder → runtime / HPC → green
  - ASC Submission → runtime / HPC → green
- Acceptance:
  - Semantic domain legible at a glance without labels.
  - Glow rendered via CSS box-shadow / drop-filter from a `semanticDomain` field in node data.
  - Minimap node fill reflects domain color.

### 1.2 White pulse propagation on edges
- [ ] Animate white coherent pulses traveling along active edges.
- Behavior:
  - Pulses travel source → target at constant velocity.
  - Rate scales with `runtime` state (idle: slow, active: fast, complete: none).
  - Invalid edges emit red pulses.
- Acceptance:
  - Information flow is perceivable without reading labels.
  - Animation implemented via SVG `stroke-dashoffset` or CSS keyframe on edge path.
  - Zero-pulse state = idle, not broken.

### 1.3 Orbital transformation rings
- [ ] Add counter-clockwise rotating orbital ring to nodes in active/processing state.
- Behavior:
  - Visible only when `runtime === 'active'` or `runtime === 'processing'`.
  - Rotation speed correlates with computation intensity.
  - When systems are coherent, orbital rates synchronize across nodes.
  - On completion: orbital decelerates and fades.
- Acceptance:
  - Orbital is a CSS animation on a separate ring element, not part of node body.
  - State-driven: JSON `runtime` field controls visibility and speed.

### 1.4 Semantic edge language
- [ ] Encode edge style by data and runtime semantics.
- Conventions:
  - solid + glow: streaming / active
  - dashed: optional / conditional
  - thick: high-volume transfer
  - red pulse: invalid / rejected
  - no pulse: idle / queued
- Acceptance:
  - Edges communicate their semantic without tooltip.
  - Legend surfaced in Atlas panel.

---

## Phase 2 — Inspector as Semantic Context

### 2.1 Semantic inspector (default view)
- [ ] Replace JSON-first inspector with semantic-first cards.
- Sections:
  - Semantic Class · Domain · Coherence
  - Inputs (typed artifacts)
  - Outputs (typed artifacts)
  - Runtime Target · Execution State
- Acceptance:
  - User understands node role without reading JSON.
  - All labels use ontology vocabulary.

### 2.2 Advanced JSON (secondary, collapsed)
- [ ] Move raw JSON under a collapsible "Advanced" section.
- Acceptance:
  - JSON reachable but not dominant.
  - Inspector opens semantic sections expanded by default.

---

## Phase 3 — Runtime Substrate

### 3.1 Runtime substrate bar (bottom)
- [ ] Persistent execution substrate strip at bottom of layout.
- Items:
  - ASC GPU status · queue depth · API health · active scheduler jobs
- Acceptance:
  - Runtime health visible at all times.
  - Node coherence state and substrate state feel causally connected.

### 3.2 Transformation event stream
- [ ] Show flowing semantic artifacts through the pipeline.
- Example:
  - FASTA → masked sequence → QTY-transformed → embeddings → AF3 payload
- Acceptance:
  - Artifacts visible as typed objects moving through stages.
  - User can inspect artifact state at each node.

---

## Phase 4 — Atlas, Portals, Projection Modes

### 4.1 Atlas panel (right — semantic context)
- [ ] Elevate the right panel into a full Semantic Atlas.
- Shows:
  - Subsystem topology
  - Domain color key
  - Active regions and coherence map
  - Runtime hotspots
- Acceptance:
  - Atlas communicates semantic topology, not just viewport.
  - Domain legend embedded.

### 4.2 Expandable node portals
- [ ] Nodes expand inline into semantic portals.
- Portal content by domain:
  - structural biology: structure viewer
  - reciprocal space: SAS plot
  - AI: embedding viewer, attention map
  - runtime/HPC: logs, GPU trace
- Acceptance:
  - At least one node supports expand/collapse.
  - Graph context preserved when portal is open.

### 4.3 Scientific projection modes
- [ ] Mode switch that re-renders same graph data by projection.
- Modes:
  - Runtime · Reciprocal Space · Structural · Semantic · HPC · Publication
- Acceptance:
  - Switching modes does not reset workflow state.
  - Visual field changes to reflect mode semantics.

---

## Phase 5 — Ontology Awareness

### 5.1 Ontology validation engine
- [ ] Validate connections and I/O by semantic types.
- Behavior:
  - FASTA → accepted, PDB → rejected, SAS → warning
- Acceptance:
  - Semantic feedback immediate on connect attempt.
  - Validation state on edge and in inspector.

### 5.2 Semantic policy feedback UX
- [ ] Inline guidance for invalid connections.
- Acceptance:
  - User sees why a connection is semantically invalid.
  - At least one suggested valid alternative offered.

---

## Delivery Order

1. [x] 0.1 Semantic naming pass
2. [ ] 1.1 Semantic domain field glow
3. [ ] 1.2 White pulse propagation on edges
4. [ ] 1.3 Orbital transformation rings
5. [ ] 2.1 Semantic inspector default
6. [ ] 2.2 Advanced JSON secondary
7. [ ] 1.4 Semantic edge language
8. [ ] 0.2 Cognitive layout
9. [ ] 3.1 Runtime substrate bar
10. [ ] 4.1 Atlas panel
11. [ ] 3.2 Transformation event stream
12. [ ] 4.2 Expandable node portals
13. [ ] 4.3 Scientific projection modes
14. [ ] 5.1 Ontology validation engine
15. [ ] 5.2 Semantic policy feedback UX

---

## Immediate Next Task

- [~] **1.1 Semantic domain field glow** — nodes white, glow emerges from `semanticDomain` field in node data, intensity from `coherence` value. No color on node body.