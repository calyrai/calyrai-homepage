# Nexus Language — Full Narrative

Signal-governed molecular inference: the complete conceptual arc

## Inference by constraint, not assumption

 Classical biophysics fits one model at a time to one dataset. Nexus treats every signal as a constraint on the same latent molecular state. The molecule is the unknown — signals are the equations. Models do not precede data. They emerge from it.

### Signal to constraint, intersection as truth

$$S_i \rightarrow C_i(\theta), \quad \theta \in \bigcap_i C_i$$

 Each instrument signal $S_i$ induces a constraint $C_i(\theta)$ on the molecular parameter space. The true state $\theta^*$ lives at the intersection of all constraints. Where no intersection exists, the contradiction is itself structural information.

### Consistency replaces fitting

 Fitting a model means committing to a functional form before the data speaks. The constraint approach does the opposite — each instrument narrows the possible states. Inconsistency between instruments is not an error to smooth over. It is the result.

### Constraints require structure

 Propagating constraints across multiple instruments requires precise, composable expressions. Ad hoc scripting accumulates implicit assumptions invisible at execution time. A typed language with explicit operators closes the gap between mathematics and computation.

## Language

### Pipeline composition without hidden state

$$x \;>\; f \;>\; g, \quad f@a$$

 The pipeline operator $>$ chains typed transformations left to right. The application operator $@$ binds named arguments without triggering evaluation. Composition is the primary unit — no global variables, no hidden state, no side effects.

### Minimal symbolic core

 Three operators cover the entire language — $>$, $@$, and $>>$. Every value is a list by default, so parallel mapping is implicit. No loop syntax is needed. The grammar fits on one index card. Semantics are sufficient for any quantitative biophysics pipeline.

### Symbolic graph to execution

 Writing $x > f > g$ does not execute — it constructs a directed computation graph. The graph is validated for type consistency at every edge before any node fires. Execution can be cached, replayed, or exported as a provenance record. Nothing happens implicitly.

## Architecture

### Language = core and modules

 The core package defines the graph, the type system, and the operator registry. Domain modules — SAXS, SPR, ITC — register their operators at import time. Modules share nothing globally across domains. Adding a new instrument means writing one module that cannot break existing pipelines.

### `nexus_language/` package overview

`nexus_language/` contains `nexus_language_core` for the engine and one sub-package per domain. Each module is independently installable — the core is the only hard dependency. A project that uses only SAXS never imports SPR code. The dependency boundary is structural, not conventional.

## Core

### `nexus_language_core` — syntax and execution engine

`nexus_language_core` holds five components — `graph`, `operators`, `registry`, `types`, `executor`. Each component has a single responsibility. They interact only through the registry and the type system. Any pipeline passing validation is semantically correct before the first computation runs.

### `graph.py` — symbolic computation graph

 Each operator application creates a node — each pipeline edge connects typed values. The graph is a directed acyclic structure materialised before execution. It is inspectable, exportable as `JSON`, and available for visualisation. Optimisation passes operate on the graph before any node fires.

### `op.py` — operators define transformations

 An operator is a typed function with declared input and output types. Operators are registered by name in the central registry. The $@$ syntax binds named arguments without invoking execution. Modules can compose or override operators by name without touching core code.

### `registry.py` — central operator registry

 The registry maps operator names to implementations at import time. Name collisions raise errors at registration, not silently at execution. Querying the registry returns the full type signature and documentation for any operator.

### `types.py` — typed scientific objects

 Every value carries a declared scientific type — `Dataset`, `Signal`, `Fit`, `Model`. Type errors are caught at graph construction time, before any computation runs. A pipeline passing the type checker cannot produce a silently wrong result from a mismatched input.

### `executor.py` — controlled execution

 The executor walks the validated graph in strict topological order. Caching is keyed on input identity — nothing outside declared inputs affects the output. Determinism is not a convention — it is enforced by the execution model.

### `validate.py` — fail early, never silently

 After graph construction, a validation pass checks type compatibility at every edge. It confirms that all required arguments are bound and no illegal cycles exist. A pipeline passing validation is guaranteed to execute without type errors at runtime. Errors carry the node name and edge that failed, not a deep traceback.

## Instrument Layers

### `nexus_language_saxs` — structural inference layer

`nexus_language_saxs` registers operators for the full SAXS processing chain. All operators consume and produce typed SAXS objects, keeping pipelines composable. The module never assumes a maximum particle dimension — $D_{\max}$ is derived, not declared.

### Real-space basis from data alone

$$P(r)=\sum_j B_j\psi_j(r)$$

 Shannon channels $N_S = q_{\max} D_{\max} / \pi$ bound the information content of the measured curve. Basis functions $\psi_j(r)$ span accessible $r$-space directly from the measured $q$-range. No assumed maximum dimension enters the expansion. Coefficients $B_j$ are determined by data — structure is a consequence, not an assumption.

### `nexus_language_spr` — kinetic inference layer

`nexus_language_spr` registers operators that transform raw SPR sensorgrams. Gillespie simulation maps the stochastic mode space for a given binding model. PCA extracts the dominant kinetic modes from the resulting ensemble. The output is a typed `KineticBasis` object ready for constraint coupling.

### Kinetic mode decomposition

$$\dot{R}(t,C)=\sum_i A_i(C)\,f_i(t)$$

 The sensorgram rate separates into concentration-dependent amplitudes $A_i(C)$ and basis functions $f_i(t)$. Each mode $f_i$ corresponds to a distinct binding transition. Each amplitude $A_i$ encodes how concentration shifts probability mass across modes. The decomposition is unique given sufficient concentration range.

## Coupling and Constraints

### `nexus_language_nexus` — constraint coupling

`nexus_language_nexus` registers the coupling operator accepting constraints from multiple modules. Each domain contributes a typed loss function $\mathcal{L}(C_i(\theta))$. The nexus solver minimises the sum while each module controls its own tolerance. The solver does not need to know which instruments contributed.

### Joint optimisation across instruments

$$\theta^* = \arg\min \sum_i \mathcal{L}(C_i(\theta))$$

 The objective sums per-domain losses weighted by their declared constraint strengths. A solution $\theta^*$ is accepted only when all constraint residuals fall below tolerance. Partial consistency is not a valid result. If no solution exists, the solver reports which constraints are mutually exclusive and by how much.

## Warehouse

### `nexus_language_warehouse` — structured data backbone

`nexus_language_warehouse` wraps the storage backend behind a typed object store. Every `Dataset`, `Signal`, `Fit`, and `Model` receives a content-addressed key derived from its inputs. Re-running an identical pipeline returns a cached result. New inputs produce a new key without overwriting history — reproducibility is structural.

### `storage.py` — persistent scientific memory

`storage.py` maintains a provenance graph alongside the object store. Each stored object records its operator, its input keys, and the software version that produced it. The graph can be queried forward — what depends on this dataset. Or backward — what produced this fit — without executing anything.

## Pipelines

### From dataset to fit in one expression

$$d[\text{run}] > s > c{@}pr > f{@}guinier$$

`d['run-042']` retrieves a typed `Dataset` from the warehouse by key. The pipeline transforms it through scattering normalisation ($s$), indirect Fourier transform ($c@pr$), and Guinier fitting ($f@guinier$). The resulting `Fit` object is automatically stored with full lineage. The expression itself is the complete provenance record — nothing is implicit.

### `>>` as convergence operator

 The $>>$ operator applies a transformation repeatedly until its output satisfies a convergence criterion. This makes iterative solvers — gradient descent, IRLS, Bayesian loops — first-class expressions. Convergence is a property of the expression, not a side effect of execution.

### Everything is a list

 Every value is a list containing one or more typed elements — a scalar is a list of length one. A pipeline applied to a list applies to each element independently. Scaling from one dataset to a thousand requires no change to the pipeline expression. Parallelism is intrinsic to the semantics, not a separate concern.

### Multi-domain constraint coupling

$$\{s@d[a],\;p@d[b]\} > n > x@\theta$$

 The list holds a SAXS constraint from run $a$ and an SPR constraint from run $b$. Both are typed and independently validated before coupling. The nexus operator $n$ constructs a joint loss without either module knowing about the other. $x@\theta$ solves for the state simultaneously consistent with both.

## Summary

 A language with three operators and a type system suffices for any biophysics pipeline. Consistency across instruments replaces the prior as the source of constraint. The molecule is defined by what all signals agree on. What cannot be made consistent cannot be claimed.
