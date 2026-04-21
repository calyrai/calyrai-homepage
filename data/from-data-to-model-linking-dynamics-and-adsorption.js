// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SPR",
    "headline": "From data to model:<br>linking dynamics and adsorption",
    "tagline": "why kinetics and isotherms must be unified"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "The problem",
    "headline": "Signals are measured,<br>but interpretation splits",
    "body": "We measure SPR curves and adsorption data.\nIn practice, kinetics and isotherms are often fitted separately.\nThat separation creates incomplete or internally inconsistent interpretations of the same system.\n",
    "manifesto": "Data alone is not enough."
  },
  {
    "type": "statement",
    "chapter": "System",
    "kicker": "Two views",
    "headline": "Short time and long time<br>describe one process",
    "body": "Short time reveals the binding and unbinding dynamics.\nLong time reveals the equilibrium adsorption isotherm.\nThese are not separate phenomena. They are two observational limits of the same physical system.\n",
    "manifesto": "Kinetics and isotherm describe the same process."
  },
  {
    "type": "statement",
    "chapter": "Claim",
    "kicker": "The core claim",
    "headline": "Do not fit curves<br>independently",
    "body": "The correct move is not to fit one curve for dynamics and another for equilibrium.\nWe should build a model that generates both from the same mechanism.\nOne system should produce one consistent description.\n",
    "manifesto": "Model the process, not the curve."
  },
  {
    "type": "statement",
    "chapter": "Constraint",
    "kicker": "Double-sided constraint",
    "headline": "The data is bounded<br>by two extremes",
    "body": "The limit $t \\to 0$ constrains how the signal begins and therefore fixes the initial dynamics.\nThe limit $t \\to \\infty$ constrains the equilibrium occupancy and therefore fixes the isotherm.\nAny valid model has to satisfy both limits at once.\n",
    "manifesto": "The data is bounded by two extremes."
  },
  {
    "type": "statement",
    "chapter": "Analogy",
    "kicker": "Analogy to SAXS",
    "headline": "Signals need a model<br>to become meaning",
    "body": "In SAXS, the signal does not uniquely determine the structure.\nA model is required to interpret the data in real-space terms.\nThe same logic applies here: adsorption data also needs a generative model to become mechanistic knowledge.\n",
    "manifesto": "Without a model, the signal is not determined."
  },
  {
    "type": "statement",
    "chapter": "Method",
    "kicker": "Our approach",
    "headline": "Generate the signal<br>from stochastic dynamics",
    "body": "Use Gillespie-type stochastic models for binding and unbinding events.\nRecover the equilibrium behavior as the long-time limit of the same process.\nThis links time-resolved measurements to isotherms without switching frameworks.\n",
    "manifesto": "Dynamics lead to the isotherm."
  },
  {
    "type": "statement",
    "chapter": "Impact",
    "kicker": "Why this matters",
    "headline": "More physics,<br>less fitting",
    "body": "A unified model reduces ambiguity in interpretation.\nIt improves parameter identifiability and supports mechanistic insight such as heterogeneity or multi-step binding.\nThe analysis becomes more constrained because the same model must explain both dynamical and equilibrium behavior.\n",
    "manifesto": "More physics, less fitting."
  },
  {
    "type": "statement",
    "chapter": "Vision",
    "kicker": "Vision",
    "headline": "A model-driven pipeline<br>across modalities",
    "body": "The long-term aim is a consistent framework from structure to dynamics to equilibrium.\nThat logic should extend across SPR, chromatography, and SAXS.\nThe common thread is model-driven data analysis rather than disconnected post hoc fitting.\n",
    "manifesto": "A consistent, physics-based pipeline."
  },
  {
    "type": "statement",
    "chapter": "Summary",
    "kicker": "One-line summary",
    "headline": "The isotherm is the long-time<br>shadow of the dynamics",
    "body": "Linking the early-time and late-time limits is what makes the system interpretable.\nOnce both extremes are tied to one mechanism, the signal becomes physically coherent.\n",
    "manifesto": "Link the extremes to understand the system."
  }
];
