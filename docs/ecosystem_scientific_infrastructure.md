# Scientific Infrastructure Orchestration

From scientific intent to adaptive measurement orchestration

 This approach positions **Scientific Infrastructure** as a first-class Nexus domain anchor. The objective is not instrument booking, but adaptive measurement orchestration from intent, constraints, and observed quality signals.

## Ecosystem Anchors

 The docs and platform model are aligned to the same anchor set used in the Calyr Ecosystem tiles:

- **AI**

- **Data**

- **Knowledge**

- **Infrastructure**

- **Scientific Infrastructure**

- **Orchestration**

- **Visualization**

## Capability Discovery

 Entry should start with capability intent, not device naming.

**Hero query:** What scientific capability do you need?

- SAXS for flexible proteins

- CryoEM membrane proteins

- Metabolomics plasma samples

- EPR radical systems

## Facility Card Contract

 Every facility card should expose the same contract for planning and comparison:

- Facility

- Capabilities

- Constraints

- Suggested workflow

- Availability

- Outputs

## Adaptive Sequencing (Differentiator)

 The differentiator is **Adaptive Measurement Orchestration**. Sequences are selected and adjusted by evidence, not predefined booking templates.

```text
User intent: "I need structural characterization for a redox-sensitive membrane protein."

Initial sequence:
1. DLS
2. SEC
3. SAXS
4. CryoEM
5. MD refinement

Adaptive control signals:
- Aggregation
- Concentration
- Polydispersity
- Stability
```

## Scientific Workflow Agent

 The chat layer is defined as a **Scientific Workflow Agent**. It is not FAQ behavior and not a generic bot shell; it is a planner over constraints, measurement graph state, and available execution surfaces.

## Method Extraction Framework (Core Capability)

 The core facility layer should treat methods as first-class executable objects. Instead of indexing papers by title and topic only, Calyr extracts method structure into typed workflow components that can be compared, validated, and reused.

 This shifts reading from abstract-level summaries to reproducible protocol logic: setup, transformations, assumptions, validation, and failure envelopes.

### Method Decomposition Contract

- Measurement setup

- Transformation steps

- Preprocessing

- Fitting and model class

- Statistical assumptions

- Thermodynamic interpretation

- ML layer

- Validation strategy

- Failure modes and artifacts

### SAXS Method Object Example

- **Sample prep:** concentration, buffer, purification

- **Instrument:** beamline, wavelength, detector

- **Reduction:** background subtraction

- **Transformation:** Guinier, Kratky, Fourier/P(r)

- **Modeling:** ab initio, MD, ensemble

- **Validation:** chi-squared, residual diagnostics

- **Interpretation:** conformational state inference

### ML Method Object Example

- Architecture

- Embedding strategy

- Loss function and optimization regime

- Training distribution and data curation

- Latent assumptions

- Benchmark leakage checks

- Reproducibility envelope

## Core Facility Discovery Network (Klarx-like)

 The facility surface should operate as a capability marketplace for scientific instrumentation, inspired by rental-market clarity patterns while preserving scientific semantics.

- **Stage 1:** Austria capability map and facility cards

- **Stage 2:** EU expansion with normalized capability taxonomy

- **Stage 3:** cross-region orchestration and fallback routing

### Scientific Chat Copilot (Methods + Instrument Suggestion)

 The chatbot should discuss potential methods, expose assumptions, and propose instruments from available facilities based on evidence, constraints, and turnaround goals.

```text
User intent: "I need solution-state structure for a flexible membrane protein."

Agent response contract:
1. Propose candidate methods (SAXS, CryoEM, EPR, MD coupling)
2. Explain trade-offs, artifacts, and required sample constraints
3. Match methods to facility cards (Austria first, then EU fallback)
4. Generate adaptive sequence with validation gates
5. Record rationale into Nexus method graph
```

## Layer Separation (Mandatory)

### Nexus | Semantic Core

- Matching

- IR

- Constraints

- Validation

- LLM orchestration

- Measurement graph

### Calyrai | Projection Layer

- Visualization

- Tiles

- Graphs

- Dashboards

- Chat views

- Variable skins

**Skin system:** Skins are variable. Semantics are stable.

## Bot Extensibility Rule

 The system is bot-extensible through stable semantic contracts and projection adapters. New agents or interfaces can be added without rewriting core semantics.
