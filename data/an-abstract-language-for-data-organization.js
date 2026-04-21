// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Language",
    "headline": "An abstract language<br>for data organization",
    "tagline": "entities, states, transitions, and observables for model-driven interpretation"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "The problem",
    "headline": "Experimental data is stored,<br>but not model-ready",
    "body": "Experimental results arrive as files, curves, and metadata scattered across incompatible formats.\nDifferent instruments impose different conventions, so the same sample may appear as unrelated records in SAXS, SPR, and chromatography workflows.\nA fit result, a simulation, and the raw measurement often cannot be traversed as one coherent object graph.\nThe practical result is fragmentation rather than interpretation readiness.\n",
    "manifesto": "Data is fragmented and not model-ready."
  },
  {
    "type": "statement",
    "chapter": "Observation",
    "kicker": "Observation",
    "headline": "Data alone does not<br>define meaning",
    "body": "A signal is only interpretable relative to a model.\nThis is obvious in SAXS, where measured intensity is not the structure itself.\nThe same problem appears in data systems more broadly: a sensorgram is not yet a kinetic mechanism, and a chromatogram is not yet a transport model.\nSignals are not self-explanatory unless the representation already encodes what objects, states, and processes they refer to.\n",
    "manifesto": "Signals are not structures."
  },
  {
    "type": "statement",
    "chapter": "Analogy",
    "kicker": "SAXS analogy",
    "headline": "Without a model, the signal<br>is not determined",
    "body": "In SAXS, intensity does not uniquely define structure because multiple structures can explain the same signal.\nA model is required to move from observation to interpretation.\nThat same logic should guide data infrastructure as well.\n",
    "manifesto": "Without a model, the signal is not determined."
  },
  {
    "type": "statement",
    "chapter": "Transfer",
    "kicker": "Transfer to data systems",
    "headline": "Meaning emerges only<br>through structure",
    "body": "SPR, chromatography, SAXS, and related experiments all produce signals that are ambiguous without a relational description.\nData without structure behaves like an underdetermined inverse problem because multiple mechanistic interpretations remain compatible with the same stored values.\nThe warehouse should therefore encode what the measured object is, which state space is admissible, and which observables are produced by which transitions.\n",
    "manifesto": "Data without structure is ambiguous."
  },
  {
    "type": "statement",
    "chapter": "Idea",
    "kicker": "Core idea",
    "headline": "Introduce an abstract language<br>for describing data",
    "body": "The aim is to make structure explicit rather than leaving it implicit in filenames, folders, and conventions.\nThe language should describe relations, admissible states, parameters, and observables in a way that is ready for direct model interaction.\nA dataset should declare what entities it contains, how they are connected, what transformations generated it, and which models can legally consume it.\nInterpretation readiness becomes part of the data representation itself rather than a later manual reconstruction step.\n",
    "manifesto": "We encode interpretation readiness."
  },
  {
    "type": "statement",
    "chapter": "Definition",
    "kicker": "What is an abstract language?",
    "headline": "Describe behavior,<br>not just measurements",
    "body": "An abstract language is a set of symbols and rules for describing systems independent of any one experiment.\nIt captures relations between entities, states, transitions, parameters, and observables rather than storing only values.\nIn practice this means storing statements such as: ligand L can bind site S, state Bound emits observable response R(t), and scattering intensity I(q) is generated from structural ensemble E.\nThe representation becomes experiment-agnostic but model-compatible.\n",
    "manifesto": "We describe behavior, not just measurements."
  },
  {
    "type": "statement",
    "chapter": "Primitives",
    "kicker": "Core elements",
    "headline": "One set of primitives<br>across experiments",
    "body": "Entities describe objects such as ligands, binding sites, particles, domains, pores, or surface patches.\nStates describe configurations such as free, occupied, folded, compact, adsorbed, or extended.\nTransitions describe changes such as binding, diffusion, adsorption, conformational switching, or transport.\nObservables describe the measurable projections of those transitions: response units, intensity curves, elution profiles, or derived basis coordinates.\n",
    "manifesto": "All experiments map to the same primitives."
  },
  {
    "type": "statement",
    "chapter": "Unification",
    "kicker": "Unifying experiments",
    "headline": "One language for SPR, SAXS,<br>and chromatography",
    "body": "SPR contributes dynamic binding observables over time and constrains transition rates between occupancy states.\nSAXS contributes structural observables over reciprocal space and constrains admissible ensembles and distances.\nChromatography contributes transport and adsorption observables and constrains residence, affinity, and dispersive behavior.\nThe same abstract description should span all of them so that one sample, one model family, and multiple observables can coexist in one representation.\n",
    "manifesto": "One language for all data."
  },
  {
    "type": "statement",
    "chapter": "Integration",
    "kicker": "Model integration",
    "headline": "Models and data should share<br>one representation",
    "body": "If models operate on the same primitives stored in the warehouse, simulation and experiment no longer live in separate worlds.\nA kinetic solver can read the same bound/free state graph that an SPR dataset writes; a SAXS forward model can consume the same ensemble object that a structure generator emits.\nThe representation becomes a common interface for data ingestion, forward simulation, inverse interpretation, and caching of derived objects.\nThe warehouse becomes model-native.\n",
    "manifesto": "No gap between data and interpretation."
  },
  {
    "type": "statement",
    "chapter": "Constraint",
    "kicker": "SAXS parallel",
    "headline": "Structure reduces<br>ambiguity",
    "body": "SAXS inversion is ill-posed without structural constraints.\nData warehouses are also underdetermined without an explicit description of relations and admissible interpretations.\nThe abstract language acts as a constraint system for scientific data by ruling out invalid joins, invalid model applications, and semantically meaningless comparisons.\nIt turns storage from a passive archive into an active filter on what can be claimed from the data.\n",
    "manifesto": "Structure reduces ambiguity."
  },
  {
    "type": "statement",
    "chapter": "Outcome",
    "kicker": "Benefits",
    "headline": "From storage to knowledge<br>generation",
    "body": "Data organization becomes consistent, interpretation ambiguity is reduced, and compatibility with simulation becomes direct.\nTraceability improves because every result can point back to the entities, states, transformations, parameters, and upstream observations that produced it.\nThe system scales across experiments because the interface is no longer tied to one modality.\nStorage turns into a foundation for mechanistic analysis rather than a collection of disconnected files.\n",
    "manifesto": "From data storage to knowledge generation."
  },
  {
    "type": "statement",
    "chapter": "Vision",
    "kicker": "Vision",
    "headline": "A language for scientific<br>systems",
    "body": "The long-term target is a unified loop between data acquisition, typed storage, model execution, and decision-making.\nCross-domain integration across SPR, SAXS, and chromatography then becomes natural rather than custom-built because every domain contributes typed constraints to the same system description.\nAnalysis becomes automatable because the data is already model-addressable, validation becomes structural, and downstream inference can operate on meaning rather than only on files.\n",
    "manifesto": "We store structured, interpretable data."
  }
];
