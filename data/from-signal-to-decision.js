// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SAXS",
    "headline": "From signal to decision",
    "tagline": "abstraction, constraints, and why models are necessary"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "The problem",
    "headline": "Experimental signals are indirect,<br>ambiguous, and incomplete",
    "body": "Experimental observables are not the system itself.\nMultiple structures or mechanisms can produce the same measured signal.\nDirect inversion is therefore not possible in any naive sense.\n",
    "manifesto": "Data does not uniquely define the system."
  },
  {
    "type": "statement",
    "chapter": "Observation",
    "kicker": "Key observation",
    "headline": "The link exists,<br>but it is not unique",
    "body": "In SAXS, many structures can produce the same $I(q)$.\nIn SPR, many mechanisms can reproduce a similar sensorgram.\nThe inverse problem is real, but it is underdetermined.\n",
    "manifesto": "The link exists, but it is not unique."
  },
  {
    "type": "statement",
    "chapter": "Signal",
    "kicker": "Raw signal is not enough",
    "headline": "Raw data is not yet<br>a decision space",
    "body": "Signals are noisy, high-dimensional, and not aligned with physical interpretation.\nThey cannot directly support mechanistic decisions.\nA measured curve is still too close to observation and too far from explanation.\n",
    "manifesto": "Raw data is not a decision space."
  },
  {
    "type": "statement",
    "chapter": "Abstraction",
    "kicker": "Step 1",
    "headline": "Abstraction makes data<br>usable",
    "body": "Transform the signal into a structured representation such as $P(r)$, derived features, or PCA modes.\nThis reduces complexity and makes comparisons possible.\nAbstraction does not solve the problem, but it creates a workable representation.\n",
    "manifesto": "Abstraction makes data usable."
  },
  {
    "type": "statement",
    "chapter": "Models",
    "kicker": "Step 2",
    "headline": "Models make abstraction<br>meaningful",
    "body": "A model introduces physical, geometric, or mechanistic interpretation.\nIt maps abstract features onto possible systems.\nWithout that step, abstraction remains organized data without explanatory force.\n",
    "manifesto": "Models make abstraction meaningful."
  },
  {
    "type": "statement",
    "chapter": "Constraints",
    "kicker": "Where constraints enter",
    "headline": "Models are how constraints<br>enter the problem",
    "body": "Geometry, physics, kinetics, and topology are not attached afterward.\nThey enter through the model itself.\nThe model is therefore the carrier of admissibility conditions.\n",
    "manifesto": "Models carry constraints."
  },
  {
    "type": "statement",
    "chapter": "Filtering",
    "kicker": "Step 3",
    "headline": "Data removes what<br>cannot be true",
    "body": "Compare model outputs to experiment.\nEliminate incompatible configurations.\nThe role of data is not to identify one answer directly, but to remove what fails.\n",
    "manifesto": "Data removes what cannot be true."
  },
  {
    "type": "statement",
    "chapter": "Necessity",
    "kicker": "Necessity of models",
    "headline": "No interpretation exists<br>without a model",
    "body": "The model is not an optional layer added for elegance.\nIt is the necessary bridge between signal and decision.\nWithout a model, there is no principled way to rank, reject, or compare admissible systems.\n",
    "manifesto": "The necessity of models is structural, not stylistic."
  },
  {
    "type": "equation",
    "chapter": "Bayesian",
    "kicker": "Bayesian principle",
    "headline": "Decision means updating<br>what remains plausible",
    "eq": "$$P(\\text{model}\\mid\\text{data}) \\propto P(\\text{data}\\mid\\text{model})\\,P(\\text{model})$$",
    "body": "Prior knowledge enters through the constraints encoded by the model.\nExperimental consistency enters through the likelihood.\nThe result is not truth, but a structured update of plausibility.\n"
  },
  {
    "type": "statement",
    "chapter": "Interpretation",
    "kicker": "Interpretation",
    "headline": "We obtain a constrained<br>decision space",
    "body": "Incompatible models drop toward zero plausibility.\nPlausible models remain in play.\nWhat survives is not a single answer but a constrained family that can support rational decisions.\n",
    "manifesto": "We obtain a distribution, not a single answer."
  },
  {
    "type": "statement",
    "chapter": "Decision",
    "kicker": "Decision methods",
    "headline": "Interpretation is a structured<br>choice under uncertainty",
    "body": "Remaining models can be ranked by fit quality, simplicity, physical plausibility, and robustness.\nEnsemble thinking may be preferable to forcing a single winner.\nAmbiguity is not failure; it is what guides the next experiment.\n",
    "manifesto": "Decision is a structured choice."
  },
  {
    "type": "statement",
    "chapter": "Synthesis",
    "kicker": "Full framework",
    "headline": "Signal to decision runs through<br>abstraction, models, and constraints",
    "body": "Signal becomes abstraction.\nAbstraction becomes model space.\nConstraints and data filter that space into a decision-ready set of plausible systems.\n",
    "manifesto": "A structured pipeline for interpretation."
  },
  {
    "type": "statement",
    "chapter": "Summary",
    "kicker": "One-line summary",
    "headline": "We do not search for certainty,<br>we update what remains plausible",
    "body": "Understanding does not mean recovering a unique hidden truth from one signal.\nIt means reducing ambiguity and deciding responsibly within what remains plausible.\n",
    "manifesto": "Decision equals constrained plausibility."
  }
];
