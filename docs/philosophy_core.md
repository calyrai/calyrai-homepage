# Nexus Philosophy

Constraint-first reasoning for multi-modal molecular science

## 1. Motivation

 Modern scientific analysis proceeds by fitting predefined models to experimental data. Each method introduces its own assumptions, functional forms, and parameterisations.

This leads to fragmentation:

- different instruments produce incompatible models

- assumptions accumulate silently across analysis steps

- inconsistencies between datasets are noted in footnotes, not resolved

**We do not know the molecule. We know projections of it.**

## 2. Fundamental shift

 Nexus replaces **model-first reasoning** with **constraint-first reasoning**.

Instead of:

$$\text{data} \;\longrightarrow\; \text{fit model}$$

Nexus defines:

 $$\boxed{S_i \;\longrightarrow\; C_i(\theta)}$$

where:

- $S_i$ is an experimental signal

- $C_i(\theta)$ is the constraint that signal imposes on the molecular state

- $\theta$ is the latent molecular description — the thing we actually care about

## 3. Definition of reality

 The molecular state is not assumed. It is *defined implicitly* as the region of parameter space consistent with every available observation:

 $$\boxed{\theta^* \;\in\; \bigcap_i\, C_i(\theta)}$$

- each experiment restricts the possible states

- the valid solution is the intersection

- no single dataset defines the system

## 4. Consequences

### 4.1 Emergence instead of assumption

 Models are not inputs. Structure is not prescribed — it emerges from geometry alone.

**Structure emerges from the intersection of constraints.**

### 4.2 Contradictions become information

If the constraint system is inconsistent:

$$\bigcap_i C_i = \varnothing$$

 there is no valid $\theta$. This is not a failure of the software — it is a scientific result. The datasets disagree, and the disagreement is precisely located.

**Failure is not error - it is signal.**

### 4.3 No dominant modality

 SAXS, SPR, ITC, chromatography, and MD are not a hierarchy. Each contributes an independent constraint on the same $\theta$.

**All constraints act on the same θ.**

| Instrument | Signal $S_i$ | Constraint $C_i(\theta)$ |
| --- | --- | --- |
| SAXS | $I(q)$ | $P(r)$, $R_g$, excluded volume, Shannon channels |
| SPR | Response vs. time | $k_\text{on}$, $k_\text{off}$, $K_d$, stoichiometry |
| ITC | $\delta Q$ vs. molar ratio | $\Delta H$, $K_d$, $n$ |
| Chromatography | Elution profile | Oligomeric state, hydrodynamic radius |
| MD | Trajectory | Ensemble-averaged observables $\langle O \rangle$ |

## 5. Role of the language

 To operationalise this framework requires a formal system. The Nexus Language provides explicit transformations, typed objects, and composable pipelines so that constraints can be expressed, combined, and evaluated without ambiguity.

**Language is the mechanism by which constraints propagate.**

 Every expression in the Nexus Language is a description of how a signal transforms into a constraint. The runtime evaluates those constraints jointly. See [Syntax](#language/syntax) and [Semantics](#language/semantics) for the formal grammar.

## 6. Role of the warehouse

 The warehouse is not a file store. It is the materialisation of the constraint space: every object in it — dataset, signal, derived quantity, model — is typed, versioned, and carries full provenance.

**The warehouse defines what exists and how it can be constrained.**

 Reproducibility in Nexus is therefore structural, not procedural. You do not re-run scripts — you address objects and their lineage.

## 7. Execution model

A Nexus expression such as

```text
d@"run-042" > s > c@pr > f@guinier
```

is not executed naively top-to-bottom. It is:

1. parsed into a typed computation graph

2. validated against the type system and warehouse schema

3. executed lazily and deterministically

**Computation is the evaluation of a constraint graph.**

## 8. Epistemological position

 Nexus aligns with a structural view of scientific knowledge: we do not observe objects directly — we observe relations between observable quantities and hidden parameters. Objects are defined by those relations.

**The molecule is the set of states consistent with all observations.**

## 9. Design principle

The goal is not a perfect language. The goal is a language in which:

**Incorrect reasoning is difficult to express.**

This is achieved through:

- **strong typing** — signals, constraints, and molecular parameters are distinct types

- **explicit operators** — every transformation is named and typed; implicit coercions are excluded

- **constrained composition** — two pipelines can only be joined where their types are compatible

---

**Reality is not fitted. Reality is the intersection of all constraints.**
