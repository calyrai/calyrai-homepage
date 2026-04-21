// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SAXS",
    "headline": "Decision-making in<br>constrained molecular systems",
    "tagline": "abstraction, constraints, and FAIR linkage across SAXS, SPR, and MD"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "Why modeling is not enough",
    "headline": "Many models can still explain<br>the same data",
    "body": "We can simulate complex systems and we can measure high-dimensional signals such as SAXS and SPR.\nYet mechanism is still not uniquely identified.\nMultiple models may remain compatible with the same observations.\n",
    "manifesto": "Multiple models explain the same data."
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "The core problem",
    "headline": "The system is structurally<br>underdetermined",
    "body": "SAXS provides structural information, but in an ensemble and ambiguous form.\nSPR provides kinetic information, but only indirectly and effectively.\nMD contributes mechanistic hypotheses, not direct proof.\n",
    "manifesto": "Data does not uniquely determine mechanism."
  },
  {
    "type": "statement",
    "chapter": "Goal",
    "kicker": "Goal",
    "headline": "From data to mechanism<br>through consistency",
    "body": "The task is to identify a model consistent with structure, kinetics, and physical feasibility at the same time.\nNo single observable is sufficient.\nDecision requires a model space that can be constrained from multiple sides.\n",
    "manifesto": "From data to mechanism."
  },
  {
    "type": "statement",
    "chapter": "Shift",
    "kicker": "Key shift",
    "headline": "The problem is not just modeling,<br>it is decision-making",
    "body": "The point is not simply to simulate and fit.\nThe point is to define a model space, apply constraints, and select which models remain valid.\nInterpretation becomes disciplined choice under uncertainty.\n",
    "manifesto": "Decision means selection under constraints."
  },
  {
    "type": "equation",
    "chapter": "Abstraction",
    "kicker": "Formal abstraction",
    "headline": "Abstraction reduces the system<br>to a sufficient parameterization",
    "eq": "$$D \\rightarrow M(\\theta), \\qquad \\min |\\theta|$$",
    "body": "Raw data is high-dimensional and redundant.\nDecision-making requires a minimal but sufficient representation.\nAbstraction keeps only the information needed to compare models meaningfully.\n",
    "legend": [
      "$D$: data from SAXS, SPR, or related experiments",
      "$\\theta$: minimal parameter set"
    ]
  },
  {
    "type": "statement",
    "chapter": "Constraints",
    "kicker": "Role of constraints",
    "headline": "Without constraints there are<br>too many valid models",
    "body": "SAXS contributes spatial constraints.\nSPR contributes kinetic constraints.\nPhysics contributes feasibility constraints.\nConstraints are what turn model generation into decision-making.\n",
    "manifesto": "Constraints restrict model space."
  },
  {
    "type": "equation",
    "chapter": "Decision",
    "kicker": "Constraint functional",
    "headline": "Decision can be written as<br>constrained model selection",
    "eq": "$$\\mathcal{L}(M)=w_1\\lVert PDD_{MD}-PDD_{SAXS}\\rVert + w_2\\lVert k_{MD}-k_{SPR}\\rVert + w_3\\,\\Phi_{phys}$$",
    "body": "Models generate predictions.\nExperiment rejects what is inconsistent.\nDecision corresponds to selecting the model or model family that best satisfies the combined constraint functional.\n"
  },
  {
    "type": "statement",
    "chapter": "Case",
    "kicker": "Minimal model",
    "headline": "A coarse model can explain<br>the full behavior",
    "body": "In the case study, IgG is abstracted as a five-bead object and the ligand as a hexamer with four active and two blocked sites.\nA spacing of roughly fifteen nanometers plus Fc-ligand and IgG-IgG interactions is already sufficient to recover the essential behavior.\nThe key is not maximal detail but the right constrained abstraction.\n",
    "manifesto": "Minimal parameters can explain full behavior."
  },
  {
    "type": "statement",
    "chapter": "Result",
    "kicker": "Result",
    "headline": "One model family survives<br>the combined constraints",
    "body": "The surviving explanation requires steric hindrance and cooperative IgG-IgG interaction.\nIt simultaneously accounts for SAXS and SPR observations.\nBi-Langmuir behavior is then not fundamental, but emergent from geometry, sterics, and interactions.\n",
    "manifesto": "Macroscopic behavior is emergent."
  },
  {
    "type": "statement",
    "chapter": "FAIR",
    "kicker": "FAIR data perspective",
    "headline": "FAIR means Findable, Accessible,<br>Interoperable, and Reusable",
    "body": "In this context FAIR is not just a repository slogan.\nData has to be findable and accessible for reuse, but it also has to be interoperable and reusable at the level of model parameters, abstractions, and constraints.\nOtherwise different experiments and simulations cannot actually speak to one another.\n",
    "manifesto": "FAIR means model-ready interoperability."
  },
  {
    "type": "statement",
    "chapter": "FAIR",
    "kicker": "Why FAIR is essential",
    "headline": "Without FAIR structure there is<br>no defensible decision pipeline",
    "body": "If representations are not standardized, abstractions cannot be compared across experiments.\nIf abstractions are not interpretable, constraints cannot be transferred into model space.\nWithout that bridge, selection becomes ad hoc fitting instead of reproducible scientific decision-making.\n",
    "manifesto": "FAIR is essential because decisions require comparable models."
  },
  {
    "type": "statement",
    "chapter": "Summary",
    "kicker": "Take-home message",
    "headline": "We do not simulate reality,<br>we select it from possible models",
    "body": "Abstraction reduces data to essential parameters.\nConstraints define validity.\nDecision is the act of selecting the model or ensemble of models that remains consistent with all available evidence.\n",
    "manifesto": "Decision equals selecting consistent models."
  }
];
