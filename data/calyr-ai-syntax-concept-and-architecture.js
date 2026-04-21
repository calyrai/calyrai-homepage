// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Language",
    "headline": "Calyr_ai_syntax:<br>concept and architecture",
    "tagline": "symbolic expressions, Nexus control, and model-native execution"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "The problem",
    "headline": "Scientific execution loses meaning<br>once the run begins",
    "body": "Scientific code usually fractures across notebooks, scripts, engine wrappers, and manually edited inputs.\nOnce execution starts, the semantic object is often lost and replaced by folders, logs, and tool-specific conventions.\nCalyr_ai_syntax is motivated by that gap: the scientific object should remain explicit from declaration through execution and evaluation.\n",
    "manifesto": "Symbolic clarity must survive execution."
  },
  {
    "type": "statement",
    "chapter": "Core idea",
    "kicker": "Definition",
    "headline": "A symbolic layer for Python-centric<br>computational science",
    "body": "Calyr_ai_syntax is a Mathematica-inspired symbolic expression layer for Calyr workflows.\nIt is symbolic first and executable second: expressions define intent, rewrite rules normalize structure, and Nexus binds the resulting object graph to real engines.\nThe aim is not another scripting surface, but a language that preserves the meaning of the scientific object while it moves through computation.\n",
    "manifesto": "Express, map, run."
  },
  {
    "type": "statement",
    "chapter": "Regimes",
    "kicker": "Two sample regimes",
    "headline": "One language for both downloaded<br>cohorts and deep system objects",
    "body": "The same representation must support broad downloaded cohorts such as public SAXS protein entries and deep multimodal objects such as SBPA.\nIn the cohort regime, the first stable object is the measured curve and its attached metadata.\nIn the structured-system regime, one sample identity spans AlphaFold priors, cryo-EM constraints, MD trajectories, and SAXS observables.\n",
    "manifesto": "One semantic layer spans both regimes."
  },
  {
    "type": "statement",
    "chapter": "Objects",
    "kicker": "Structured sample logic",
    "headline": "A sample is not a file.<br>It is a coordinated state",
    "body": "Downloaded SAXS entries, fitted parameters, optional $P(r)$ objects, and evaluation results should all remain attached to one scientific sample object.\nFor structured cases such as SBPA, the object must also hold AlphaFold structure, cryo-EM constraints, LAMMPS or OpenMM state, and back-calculated SAXS observables.\nThe language therefore has to represent coupled system identity, not just datasets in isolation.\n",
    "manifesto": "The sample is the primary object."
  },
  {
    "type": "statement",
    "chapter": "Architecture",
    "kicker": "Representation flow",
    "headline": "Symbolic expressions become<br>normalized, executable, and auditable",
    "body": "The architecture is a sequence: symbolic expressions, rewrites and normalization, Nexus coordination, execution backends, and typed manifests for evaluation.\nSyntax objects are not thrown away when a run starts; they are carried forward as the semantic source of truth.\nThis is what lets execution, provenance, and analysis stay on one coordinated plane.\n",
    "manifesto": "The object graph persists through the run."
  },
  {
    "type": "statement",
    "chapter": "Nexus",
    "kicker": "Operational membrane",
    "headline": "Nexus connects symbolic intent,<br>execution, and evaluation",
    "body": "Nexus is the operational membrane of Calyr: it binds symbolic declarations to environments, engines, inputs, outputs, and validation steps.\nIt does not introduce a second runtime language; instead, it materializes declared state transitions and records them as manifests.\nThe result is reproducible execution where semantic meaning remains inspectable after the computation finishes.\n",
    "manifesto": "Nexus is the control plane, not a logbook."
  },
  {
    "type": "equation",
    "chapter": "Control",
    "kicker": "Declarative execution",
    "headline": "Execution is a transition between<br>fully specified Nexus states",
    "eq": "$$\\text{State}_t \\xrightarrow{\\text{Nexus declaration}} \\text{Execution} \\xrightarrow{\\text{Results}} \\text{State}_{t+1}$$",
    "body": "Every scientific action is defined as a transition between two explicit Nexus states.\nThat means parameters, models, assumptions, and expected outputs are part of the declaration before the run begins.\nThe scientific object is therefore updated through controlled state transitions rather than through hidden imperative edits.\n"
  },
  {
    "type": "statement",
    "chapter": "Hierarchy",
    "kicker": "Multi-level control",
    "headline": "Root policy, domain semantics,<br>tool bindings, experiment layer",
    "body": "Nexus operates hierarchically: root Nexus defines global policy, domain Nexus defines scientific semantics, tool Nexus defines engine bindings, and experiment declarations define concrete studies.\nThis separation keeps FAIR policy, scientific meaning, and execution details distinct without disconnecting them.\nThe same pipeline can therefore move across engines or machines without changing its conceptual definition.\n",
    "manifesto": "Change the executor, not the meaning."
  },
  {
    "type": "statement",
    "chapter": "Engines",
    "kicker": "Remote cluster execution",
    "headline": "AlphaFold, LAMMPS, OpenMM,<br>and VSC as Nexus-bound tools",
    "body": "Computational engines only exist operationally when they are registered in Nexus and invoked through declared pipeline steps.\nAlphaFold provides structural priors, LAMMPS and OpenMM provide dynamical refinement, and VSC exposes remote SLURM execution without changing the workflow language.\nThe machine changes, but the declaration remains the same.\n",
    "manifesto": "No execution exists outside Nexus."
  },
  {
    "type": "statement",
    "chapter": "FAIR",
    "kicker": "FAIR by construction",
    "headline": "Runs, queries, and outputs stay<br>findable, accessible, and reusable",
    "body": "Each remote or local execution receives a stable run identity, declared output paths, versioned environment specs, and reproducible manifests.\nThe same logic also applies to data access: declarative queries can be translated to concrete SQL while keeping an auditable query hash.\nFAIR is therefore not an afterthought but part of the execution model itself.\n",
    "manifesto": "The same query should produce the same trace."
  },
  {
    "type": "equation",
    "chapter": "Construction",
    "kicker": "From simulation to control",
    "headline": "Constructability begins when the system<br>can invert toward a target",
    "eq": "$$\\text{given } y^*:\\; \\text{find } x \\text{ such that } F(x) \\approx y^*$$",
    "body": "Simulation answers what happens if a state is given.\nConstruction asks what interventions are needed so that a desired outcome becomes attainable.\nCalyr_ai_syntax and Nexus matter because they provide the declarative and provenance-preserving substrate required for that closed-loop shift from prediction to control.\n"
  },
  {
    "type": "statement",
    "chapter": "Closed loop",
    "kicker": "Scientific feedback system",
    "headline": "Target, constrained inversion,<br>execution, validation, update",
    "body": "In the construction regime, Nexus becomes a closed-loop scientific system: targets define candidate states, execution tests them, validation scores them, and the next Nexus state is updated from the result.\nConstraints from structure, kinetics, geometry, packing, and experiment all participate in the loop.\nThis is how simulatable systems begin to become constructable ones.\n",
    "manifesto": "Inference becomes control through feedback."
  },
  {
    "type": "statement",
    "chapter": "Summary",
    "kicker": "Final statement",
    "headline": "You do not run simulations.<br>You materialize Nexus states",
    "body": "Calyr_ai_syntax provides the symbolic language layer.\nNexus provides the declarative control plane that keeps meaning, execution, and evaluation aligned.\nTogether they make Calyr workflows inspectable, reproducible, FAIR, and ready to support not only simulation but eventually scientific construction.\n",
    "manifesto": "Materialize states, not just runs."
  }
];
