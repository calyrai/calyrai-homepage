// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai",
    "headline": "Signal-governed<br>molecular inference",
    "tagline": "transforming experimental signals into real-time molecular insight"
  },
  {
    "type": "statement",
    "chapter": "Nexus",
    "kicker": "Nexus",
    "headline": "Inference by constraint,<br>not assumption",
    "body": "Classical biophysics fits one model at a time to one dataset.\nNexus treats every signal as a constraint on the same latent molecular state.\nThe molecule is the unknown — signals are the equations.\nModels do not precede data. They emerge from it.\n"
  },
  {
    "type": "equation",
    "chapter": "Nexus",
    "kicker": "Core principle",
    "headline": "Signal to constraint,<br>intersection as truth",
    "eq": "$$S_i \\rightarrow C_i(\\theta), \\quad \\theta \\in \\bigcap_i C_i$$",
    "body": "Each instrument signal $S_i$ induces a constraint $C_i(\\theta)$ on the molecular parameter space.\nThe true state $\\theta^*$ lives at the intersection of all constraints.\nWhere no intersection exists, the contradiction is itself structural information.\n"
  },
  {
    "type": "statement",
    "chapter": "Nexus",
    "kicker": "Philosophy",
    "headline": "Consistency replaces<br>fitting",
    "body": "Fitting a model means committing to a functional form before the data speaks.\nThe constraint approach does the opposite — each instrument narrows the possible states.\nInconsistency between instruments is not an error to smooth over.\nIt is the result.\n"
  },
  {
    "type": "statement",
    "chapter": "Nexus",
    "kicker": "Computation",
    "headline": "Constraints require<br>structure",
    "body": "Propagating constraints across multiple instruments requires precise, composable expressions.\nAd hoc scripting accumulates implicit assumptions invisible at execution time.\nA typed language with explicit operators closes the gap between mathematics and computation.\n"
  },
  {
    "type": "equation",
    "chapter": "Language",
    "kicker": "Nexus Language",
    "headline": "Pipeline composition<br>without hidden state",
    "eq": "$$x \\;>\\; f \\;>\\; g, \\quad f@a$$",
    "body": "The pipeline operator $>$ chains typed transformations left to right.\nThe application operator $@$ binds named arguments without triggering evaluation.\nComposition is the primary unit — no global variables, no hidden state, no side effects.\n"
  },
  {
    "type": "statement",
    "chapter": "Language",
    "kicker": "Syntax",
    "headline": "Minimal symbolic<br>core",
    "body": "Three operators cover the entire language — $>$, $@$, and $>>$.\nEvery value is a list by default, so parallel mapping is implicit.\nNo loop syntax is needed. The grammar fits on one index card.\nSemantics are sufficient for any quantitative biophysics pipeline.\n"
  },
  {
    "type": "statement",
    "chapter": "Language",
    "kicker": "Execution",
    "headline": "Symbolic graph<br>to execution",
    "body": "Writing $x > f > g$ does not execute — it constructs a directed computation graph.\nThe graph is validated for type consistency at every edge before any node fires.\nExecution can be cached, replayed, or exported as a provenance record.\nNothing happens implicitly.\n"
  },
  {
    "type": "statement",
    "chapter": "Architecture",
    "kicker": "Architecture",
    "headline": "Language = core<br>and modules",
    "body": "The core package defines the graph, the type system, and the operator registry.\nDomain modules — SAXS, SPR, ITC — register their operators at import time.\nModules share nothing globally across domains.\nAdding a new instrument means writing one module that cannot break existing pipelines.\n"
  },
  {
    "type": "statement",
    "chapter": "Architecture",
    "kicker": "Structure",
    "headline": "nexus_language/",
    "body": "`nexus_language/` contains `nexus_language_core` for the engine and one sub-package per domain.\nEach module is independently installable — the core is the only hard dependency.\nA project that uses only SAXS never imports SPR code.\nThe dependency boundary is structural, not conventional.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "nexus_language_core",
    "headline": "Syntax and<br>execution engine",
    "body": "`nexus_language_core` holds five components — `graph`, `operators`, `registry`, `types`, `executor`.\nEach component has a single responsibility.\nThey interact only through the registry and the type system.\nAny pipeline passing validation is semantically correct before the first computation runs.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "graph.py",
    "headline": "Symbolic computation<br>graph",
    "body": "Each operator application creates a node — each pipeline edge connects typed values.\nThe graph is a directed acyclic structure materialised before execution.\nIt is inspectable, exportable as `JSON`, and available for visualisation.\nOptimisation passes operate on the graph before any node fires.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "op.py",
    "headline": "Operators define<br>transformations",
    "body": "An operator is a typed function with declared input and output types.\nOperators are registered by name in the central registry.\nThe $@$ syntax binds named arguments without invoking execution.\nModules can compose or override operators by name without touching core code.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "registry.py",
    "headline": "Central operator<br>registry",
    "body": "The registry maps operator names to implementations at import time.\nName collisions raise errors at registration, not silently at execution.\nQuerying the registry returns the full type signature and documentation for any operator.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "types.py",
    "headline": "Typed scientific<br>objects",
    "body": "Every value carries a declared scientific type — `Dataset`, `Signal`, `Fit`, `Model`.\nType errors are caught at graph construction time, before any computation runs.\nA pipeline passing the type checker cannot produce a silently wrong result from a mismatched input.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "executor.py",
    "headline": "Controlled<br>execution",
    "body": "The executor walks the validated graph in strict topological order.\nCaching is keyed on input identity — nothing outside declared inputs affects the output.\nDeterminism is not a convention — it is enforced by the execution model.\n"
  },
  {
    "type": "statement",
    "chapter": "Core",
    "kicker": "validate.py",
    "headline": "Fail early,<br>never silently",
    "body": "After graph construction, a validation pass checks type compatibility at every edge.\nIt confirms that all required arguments are bound and no illegal cycles exist.\nA pipeline passing validation is guaranteed to execute without type errors at runtime.\nErrors carry the node name and edge that failed, not a deep traceback.\n"
  },
  {
    "type": "statement",
    "chapter": "SAXS",
    "kicker": "nexus_language_saxs",
    "headline": "Structural inference<br>layer",
    "body": "`nexus_language_saxs` registers operators for the full SAXS processing chain.\nAll operators consume and produce typed SAXS objects, keeping pipelines composable.\nThe module never assumes a maximum particle dimension — $D_{\\max}$ is derived, not declared.\n"
  },
  {
    "type": "equation",
    "chapter": "SAXS",
    "kicker": "SAXS",
    "headline": "Real-space basis<br>from data alone",
    "eq": "$$P(r)=\\sum_j B_j\\psi_j(r)$$",
    "body": "Shannon channels $N_S = q_{\\max} D_{\\max} / \\pi$ bound the information content of the measured curve.\nBasis functions $\\psi_j(r)$ span accessible $r$-space directly from the measured $q$-range.\nNo assumed maximum dimension enters the expansion.\nCoefficients $B_j$ are determined by data — structure is a consequence, not an assumption.\n"
  },
  {
    "type": "statement",
    "chapter": "SPR",
    "kicker": "nexus_language_spr",
    "headline": "Kinetic inference<br>layer",
    "body": "`nexus_language_spr` registers operators that transform raw SPR sensorgrams.\nGillespie simulation maps the stochastic mode space for a given binding model.\nPCA extracts the dominant kinetic modes from the resulting ensemble.\nThe output is a typed `KineticBasis` object ready for constraint coupling.\n"
  },
  {
    "type": "equation",
    "chapter": "SPR",
    "kicker": "SPR",
    "headline": "Kinetic mode<br>decomposition",
    "eq": "$$\\dot{R}(t,C)=\\sum_i A_i(C)\\,f_i(t)$$",
    "body": "The sensorgram rate separates into concentration-dependent amplitudes $A_i(C)$ and basis functions $f_i(t)$.\nEach mode $f_i$ corresponds to a distinct binding transition.\nEach amplitude $A_i$ encodes how concentration shifts probability mass across modes.\nThe decomposition is unique given sufficient concentration range.\n"
  },
  {
    "type": "statement",
    "chapter": "Coupling",
    "kicker": "nexus_language_nexus",
    "headline": "Constraint<br>coupling",
    "body": "`nexus_language_nexus` registers the coupling operator accepting constraints from multiple modules.\nEach domain contributes a typed loss function $\\mathcal{L}(C_i(\\theta))$.\nThe nexus solver minimises the sum while each module controls its own tolerance.\nThe solver does not need to know which instruments contributed.\n"
  },
  {
    "type": "equation",
    "chapter": "Coupling",
    "kicker": "Solve",
    "headline": "Joint optimisation<br>across instruments",
    "eq": "$$\\theta^* = \\arg\\min \\sum_i \\mathcal{L}(C_i(\\theta))$$",
    "body": "The objective sums per-domain losses weighted by their declared constraint strengths.\nA solution $\\theta^*$ is accepted only when all constraint residuals fall below tolerance.\nPartial consistency is not a valid result.\nIf no solution exists, the solver reports which constraints are mutually exclusive and by how much.\n"
  },
  {
    "type": "statement",
    "chapter": "Warehouse",
    "kicker": "nexus_language_warehouse",
    "headline": "Structured data<br>backbone",
    "body": "`nexus_language_warehouse` wraps the storage backend behind a typed object store.\nEvery `Dataset`, `Signal`, `Fit`, and `Model` receives a content-addressed key derived from its inputs.\nRe-running an identical pipeline returns a cached result.\nNew inputs produce a new key without overwriting history — reproducibility is structural.\n"
  },
  {
    "type": "statement",
    "chapter": "Warehouse",
    "kicker": "storage.py",
    "headline": "Persistent scientific<br>memory",
    "body": "`storage.py` maintains a provenance graph alongside the object store.\nEach stored object records its operator, its input keys, and the software version that produced it.\nThe graph can be queried forward — what depends on this dataset.\nOr backward — what produced this fit — without executing anything.\n"
  },
  {
    "type": "statement",
    "chapter": "Warehouse",
    "kicker": "archive",
    "headline": "Archive = physical store<br>warehouse = logical view",
    "body": "The archive stores datasets, objects, graphs, and results as immutable content-addressed records.\nThe warehouse is the typed interface that queries that archive as scientific state, not loose files.\nFilesystem blobs hold the data, while SQLite indexes objects and graph edges for fast lookup.\nSame input, same output, same hash — reproducibility and caching become structural.\n"
  },
  {
    "type": "equation",
    "chapter": "Pipelines",
    "kicker": "Example",
    "headline": "From dataset to fit<br>in one expression",
    "eq": "$$d[\\text{run}] > s > c{@}pr > f{@}guinier$$",
    "body": "`d['run-042']` retrieves a typed `Dataset` from the warehouse by key.\nThe pipeline transforms it through scattering normalisation ($s$), indirect Fourier transform ($c@pr$), and Guinier fitting ($f@guinier$).\nThe resulting `Fit` object is automatically stored with full lineage.\nThe expression itself is the complete provenance record — nothing is implicit.\n"
  },
  {
    "type": "statement",
    "chapter": "Pipelines",
    "kicker": "Iteration",
    "headline": ">> as convergence<br>operator",
    "body": "The $>>$ operator applies a transformation repeatedly until its output satisfies a convergence criterion.\nThis makes iterative solvers — gradient descent, IRLS, Bayesian loops — first-class expressions.\nConvergence is a property of the expression, not a side effect of execution.\n"
  },
  {
    "type": "statement",
    "chapter": "Pipelines",
    "kicker": "Lists",
    "headline": "Everything<br>is a list",
    "body": "Every value is a list containing one or more typed elements — a scalar is a list of length one.\nA pipeline applied to a list applies to each element independently.\nScaling from one dataset to a thousand requires no change to the pipeline expression.\nParallelism is intrinsic to the semantics, not a separate concern.\n"
  },
  {
    "type": "equation",
    "chapter": "Pipelines",
    "kicker": "Multi-domain",
    "headline": "Multi-domain<br>constraint coupling",
    "eq": "$$\\{s@d[a],\\;p@d[b]\\} > n > x@\\theta$$",
    "body": "The list holds a SAXS constraint from run $a$ and an SPR constraint from run $b$.\nBoth are typed and independently validated before coupling.\nThe nexus operator $n$ constructs a joint loss without either module knowing about the other.\n$x@\\theta$ solves for the state simultaneously consistent with both.\n"
  },
  {
    "type": "statement",
    "kicker": "Summary",
    "headline": "Language &rarr; constraints<br>&rarr; reality",
    "body": "A language with three operators and a type system suffices for any biophysics pipeline.\nConsistency across instruments replaces the prior as the source of constraint.\nThe molecule is defined by what all signals agree on.\nWhat cannot be made consistent cannot be claimed.\n"
  }
];
