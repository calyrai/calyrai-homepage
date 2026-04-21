// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SAXS",
    "headline": "SAXS: the model<br>completes the measurement",
    "tagline": "from ill-posed inverse problem to geometry-aware structural inference"
  },
  {
    "type": "equation",
    "chapter": "Measurement",
    "kicker": "What SAXS measures",
    "headline": "The signal is a real-space<br>projection",
    "eq": "$$I(q)=\\int_0^{\\infty} P(r) \\frac{\\sin(qr)}{qr} \\, dr$$",
    "body": "The measured intensity $I(q)$ is a reciprocal-space projection of the pair-distance distribution $P(r)$.\nThis is a Fredholm integral of the first kind.\nThe experiment reports a transform of structure, not the structure itself.\n"
  },
  {
    "type": "statement",
    "chapter": "Inversion",
    "kicker": "Non-uniqueness",
    "headline": "Data alone do not<br>select one structure",
    "body": "Even perfect intensity measurements remain incomplete for inversion.\nThe measured $q$-range is finite, the data are noisy, and phase is lost because intensity is amplitude squared.\nMany distinct $P(r)$ and many distinct 3D structures can therefore reproduce essentially the same curve.\n"
  },
  {
    "type": "equation",
    "chapter": "Resolution",
    "kicker": "Fourier duality",
    "headline": "Finite $q$ limits<br>real-space resolution",
    "eq": "$$\\Delta r \\sim \\frac{\\pi}{q_{\\max}}$$",
    "body": "The Heisenberg analogy is not quantum-mechanical, but it is structurally useful.\nReciprocal space and real space are Fourier-dual descriptions.\nHigh $q$ resolves fine detail, low $q$ captures global shape, and truncating $q$ imposes a real-space resolution limit.\n"
  },
  {
    "type": "statement",
    "chapter": "Principle",
    "kicker": "Publishable claim",
    "headline": "In SAXS, the structure is not measured",
    "body": "Small-angle scattering data do not uniquely determine a real-space structure.\nThe inverse map from $I(q)$ to structure is non-injective.\nWhat is measured is an equivalence class of structures consistent with the observed signal.\n",
    "manifesto": "The model completes the measurement."
  },
  {
    "type": "coupling",
    "chapter": "Regularisation",
    "kicker": "Why models enter",
    "headline": "Every reconstruction carries a prior",
    "body": "Any structural reconstruction requires explicit or implicit constraints that regularise the admissible solution space.\nIn practice these appear as smoothness assumptions, maximum-entropy criteria, geometric parametrisations, bead models, or hybrid real/Fourier representations.\nThe model is not an optional post-processing step. It is the mechanism that collapses structural ambiguity into one interpretation.\n"
  },
  {
    "type": "equation",
    "chapter": "Interpretation",
    "kicker": "Information view",
    "headline": "Measurement to solution<br>manifold",
    "eq": "$$I(q) \\longrightarrow \\{\\theta : \\mathcal{F}(\\theta) \\approx I(q)\\}$$",
    "body": "SAXS should be understood as a map from data to an admissible manifold of structures.\nInference becomes the task of organising that manifold with defensible priors rather than pretending the data identify a unique answer.\nThis shifts the problem from curve fitting to controlled restriction of solution space.\n"
  },
  {
    "type": "statement",
    "chapter": "Calyr.ai",
    "kicker": "Connection to the platform",
    "headline": "PDD-informed inference<br>as structured ambiguity",
    "body": "The Calyr.ai direction uses pair-distance distributions, normalization, PCA, and hybrid real/Fourier operators to structure the admissible set.\nThis is not just fitting data more aggressively.\nIt is building a geometry-aware basis over the space of valid SAXS interpretations, closer to Bayesian inference, information geometry, and reduced-manifold modeling.\n"
  },
  {
    "type": "statement",
    "chapter": "Takeaway",
    "kicker": "Final statement",
    "headline": "The model is where SAXS<br>becomes structural",
    "body": "SAXS is not a direct measurement-to-structure pipeline.\nIt is a measurement-to-equivalence-class pipeline.\nThe quality of the inference therefore depends on how explicitly, rigorously, and transparently the model constrains that class."
  }
];
