// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Language",
    "headline": "An abstract language<br>for data organization",
    "tagline": "structuring data for model-driven interpretation"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "The problem",
    "headline": "Experimental data is stored,<br>but not model-ready",
    "body": "Experimental results arrive as files, curves, and metadata scattered across incompatible formats.\nDifferent instruments impose different conventions, and linking datasets to models becomes difficult.\nThe practical result is fragmentation rather than interpretation readiness.\n",
    "manifesto": "Data is fragmented and not model-ready."
  },
  {
    "type": "statement",
    "chapter": "Observation",
    "kicker": "Observation",
    "headline": "Data alone does not<br>define meaning",
    "body": "A signal is only interpretable relative to a model.\nThis is obvious in SAXS, where measured intensity is not the structure itself.\nThe same problem appears in data systems more broadly: signals are not self-explanatory.\n",
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
    "body": "SPR, chromatography, SAXS, and related experiments all produce signals that are ambiguous without a relational description.\nData without structure behaves like an underdetermined inverse problem.\nThe warehouse should therefore encode how interpretation becomes possible.\n",
    "manifesto": "Data without structure is ambiguous."
  },
  {
    "type": "statement",
    "chapter": "Idea",
    "kicker": "Core idea",
    "headline": "Introduce an abstract language<br>for describing data",
    "body": "The aim is to make structure explicit rather than leaving it implicit in filenames, folders, and conventions.\nThe language should describe relations, admissible states, and observables in a way that is ready for direct model interaction.\nInterpretation readiness becomes part of the data representation itself.\n",
    "manifesto": "We encode interpretation readiness."
  },
  {
    "type": "statement",
    "chapter": "Definition",
    "kicker": "What is an abstract language?",
    "headline": "Describe behavior,<br>not just measurements",
    "body": "An abstract language is a set of symbols and rules for describing systems independent of any one experiment.\nIt captures relations between entities, states, transitions, and observables rather than storing only values.\nThe representation becomes experiment-agnostic but model-compatible.\n",
    "manifesto": "We describe behavior, not just measurements."
  },
  {
    "type": "statement",
    "chapter": "Primitives",
    "kicker": "Core elements",
    "headline": "One set of primitives<br>across experiments",
    "body": "Entities describe objects such as sites, ligands, domains, or particles.\nStates describe configurations such as occupied, free, folded, compact, or extended.\nTransitions describe changes such as binding, diffusion, or scattering, and observables describe measured signals.\n",
    "manifesto": "All experiments map to the same primitives."
  },
  {
    "type": "statement",
    "chapter": "Unification",
    "kicker": "Unifying experiments",
    "headline": "One language for SPR, SAXS,<br>and chromatography",
    "body": "SPR contributes dynamic binding signals.\nSAXS contributes structural correlations.\nChromatography contributes transport and adsorption behavior.\nThe same abstract description should span all of them.\n",
    "manifesto": "One language for all data."
  },
  {
    "type": "statement",
    "chapter": "Integration",
    "kicker": "Model integration",
    "headline": "Models and data should share<br>one representation",
    "body": "If models operate on the same primitives stored in the warehouse, simulation and experiment no longer live in separate worlds.\nThe representation becomes a common interface for data ingestion, forward simulation, and inverse interpretation.\nThe warehouse becomes model-native.\n",
    "manifesto": "No gap between data and interpretation."
  },
  {
    "type": "statement",
    "chapter": "Constraint",
    "kicker": "SAXS parallel",
    "headline": "Structure reduces<br>ambiguity",
    "body": "SAXS inversion is ill-posed without structural constraints.\nData warehouses are also underdetermined without an explicit description of relations and admissible interpretations.\nThe abstract language acts as a constraint system for scientific data.\n",
    "manifesto": "Structure reduces ambiguity."
  },
  {
    "type": "statement",
    "chapter": "Outcome",
    "kicker": "Benefits",
    "headline": "From storage to knowledge<br>generation",
    "body": "Data organization becomes consistent, interpretation ambiguity is reduced, and compatibility with simulation becomes direct.\nThe system scales across experiments because the interface is no longer tied to one modality.\nStorage turns into a foundation for mechanistic analysis.\n",
    "manifesto": "From data storage to knowledge generation."
  },
  {
    "type": "statement",
    "chapter": "Vision",
    "kicker": "Vision",
    "headline": "A language for scientific<br>systems",
    "body": "The long-term target is a unified loop between data, models, and simulation.\nCross-domain integration across SPR, SAXS, and chromatography then becomes natural rather than custom-built.\nAnalysis becomes automated because the data is already model-addressable.\n",
    "manifesto": "We store structured, interpretable data."
  }
];
