# AI-Assisted Hierarchical Reconstruction of Dynamic S-Layer Assemblies

How-to page for hybrid structural biology workflows around SbpA and related mesoscale biological systems.

This page turns the project concept into an operational workflow: start from sequence and homolog context, reconstruct local units first, assemble patches next, and only then integrate experimental constraints and dynamic-state analysis.

## Scope

- target protein: SbpA from *Bacillus sphaericus* CCM2177
- system type: S-layer protein with p4 lattice behavior
- focus: self-assembling crystalline sheets and dynamic mesoscale organization
- workflow type: hybrid AI-assisted reconstruction with experimental constraints

## Core idea

Do not treat the system as one static solved object.

Treat it as a dynamic assembly manifold with:

- fluctuating states
- assembly transitions
- intermediate organizations
- non-equilibrium mesoscale behavior

Operational target:

```text
S(t)
```

Dynamic evolving assembly states, not just one final structure.

## When to use this workflow

Use this workflow when the biological system is too large, repetitive, flexible, or weakly constrained for direct full-assembly prediction.

Typical failure modes of brute-force assembly prediction:

- token limitations
- interface ambiguity
- repeated symmetries
- weak MSA quality
- flexible domains
- mesoscale fluctuations

## Global workflow

```text
Sequence
-> Domain decomposition
-> Homolog exploration
-> MSA generation
-> Local structure prediction
-> Interface reconstruction
-> Patch assembly
-> Cryo-EM / SAS fitting
-> Dynamic-state analysis
```

## Step 1: Decompose the sequence

Separate the protein into:

- domains
- overlap regions
- conserved cores
- flexible interfaces
- assembly-relevant motifs

This step reduces computational complexity and isolates the parts that actually carry assembly logic.

## Step 2: Explore homologs and structural overlaps

Homolog analysis is central to the workflow because it constrains which local units and interfaces are biologically plausible.

Priorities:

- evolutionary overlap mapping
- conserved motif analysis
- repeat-region identification
- assembly-interface conservation

Recommended tools:

| Tool | Purpose |
|---|---|
| Foldseek | structural overlap search |
| MMseqs2 | sequence clustering |
| custom embeddings | latent-space similarity |
| MSA pipelines | homolog generation |

## Step 3: Reconstruct local structural units first

Avoid predicting the whole assembly in one pass. Reconstruct local units first, then grow outward.

Recommended reconstruction scales:

| Scale | Purpose |
|---|---|
| monomer | local fold |
| dimer | interface analysis |
| tetramer patch | lattice organization |
| repeat unit | periodic reconstruction |
| mesoscale region | assembly topology |

This hierarchy makes failure diagnosis easier because confidence can be checked at each scale before moving upward.

## Step 4: Run AI-assisted structural inference

Use AlphaFold-assisted workflows for:

- local fold prediction
- homolog-guided reconstruction
- interface inference
- modular assembly exploration
- iterative refinement

Execution model:

- local AlphaFold 3 execution where possible
- modular JSON generation for batch jobs
- HPC-assisted orchestration
- proxy-sequence experimentation for controlled external use

## Step 5: Reconstruct interfaces and assemble patches

After local units are stable enough, reconstruct the interfaces that determine lattice behavior.

Focus on:

- overlap consistency across local predictions
- repeated interface reuse
- patch-to-patch compatibility
- defect-prone regions
- lattice closure logic

Output of this stage:

- interface candidates
- patch-level assemblies
- confidence-ranked local lattice hypotheses

## Step 6: Integrate experimental constraints

Use experiments to constrain the reconstruction, not as a late decorative validation layer.

### SAS

Use SAS for:

- ensemble reconstruction
- fluctuation analysis
- intermediate-state detection
- reciprocal-space constraints

### Cryo-EM

Use Cryo-EM for:

- density fitting
- local lattice reconstruction
- assembly-interface validation
- mesoscale organization

### AFM

Use AFM for:

- surface topology
- lattice morphology
- defect analysis
- assembly dynamics

## Step 7: Model dynamic states explicitly

The goal is not a frozen object. The goal is a state system with transitions and manifold structure.

Model:

- state transitions
- dynamic fluctuations
- assembly pathways
- manifold evolution

Useful notation:

```text
S(t)
```

for dynamic state manifolds.

For holographic or field-based extensions, the long-term reconstruction target becomes:

```text
Psi(x, y, z, t)
```

for dynamic evolving scattering fields.

## Step 8: Use controlled disclosure when external inference is needed

This workflow can be paired with selective structural disclosure when external AI services are used.

The goal is not full sequence encryption. The goal is reduction of sensitive sequence disclosure while preserving computational utility.

Possible methods:

- localized proxy-sequence transformations
- QTY-inspired substitutions
- structure-preserving sequence obfuscation
- selective interface masking

Use this layer when external inference is useful but critical engineered regions should not be exposed directly.

## HPC and orchestration layout

Use a layered execution model so the workflow can scale across local and GPU-backed compute.

| Layer | Function |
|---|---|
| AlphaFold | local prediction |
| Foldseek | overlap exploration |
| embedding systems | latent-space analysis |
| MD refinement | dynamic reconstruction |
| PCA decomposition | state analysis |
| orchestration layer | workflow coordination |

Conceptual runtime layout:

```text
Nexus Runtime
|- Sequence Layer
|- Homolog Layer
|- MSA Layer
|- Structural Prediction Layer
|- Foldseek Layer
|- SAS Layer
|- Cryo-EM Layer
|- Dynamic-State Layer
|- Embedding Layer
`- Visualization Layer
```

## Immediate milestones

### Phase 1

- SbpA homolog mapping
- domain decomposition
- local AlphaFold workflows
- Foldseek overlap analysis
- basic SAS integration

### Phase 2

- interface reconstruction
- patch assembly
- Cryo-EM fitting
- dynamic-state decomposition
- GPU-assisted orchestration

### Phase 3

- holographic reconstruction concepts
- adaptive mesoscale analysis
- state-manifold exploration
- privacy-aware structural inference

## Practical interpretation

The scientific direction is reconstruction of dynamic biological systems from partially observed structural and semantic constraints.

This bridges:

- structural biology
- AI-assisted inference
- mesoscale organization
- dynamic-state analysis
- computational orchestration systems

## How to use this page

- use it as the planning scaffold for SbpA reconstruction work
- split execution into local-unit, interface, patch, and mesoscale stages
- tie every computational stage back to at least one experimental constraint
- treat dynamic behavior as a first-class object from the start
- only expose external inputs at the minimum useful disclosure level