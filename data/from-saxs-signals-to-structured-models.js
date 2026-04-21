// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SAXS / ASC",
    "headline": "From SAXS signals<br>to structured models",
    "tagline": "PCA, coarse modeling, and HPC as an application of the abstract language"
  },
  {
    "type": "statement",
    "chapter": "Starting point",
    "kicker": "Starting point",
    "headline": "SAXS measures intensity,<br>not structure",
    "body": "SAXS reports scattering intensity rather than a unique real-space structure.\nThe inverse problem is underdetermined, so multiple structures can explain the same signal.\nInterpretation therefore requires a structured way to navigate admissible possibilities.\n",
    "manifesto": "We need a structured way to interpret SAXS data."
  },
  {
    "type": "statement",
    "chapter": "Representation",
    "kicker": "Signal to representation",
    "headline": "Move from $I(q)$ to a more<br>structured description",
    "body": "Transforming $I(q)$ into $P(r)$ yields a pair-distance representation of structural correlations.\nThe result is still not unique, but it is more interpretable and more compatible with geometric reasoning.\nThe signal is translated into a structured representation.\n",
    "manifesto": "We move from signal to structured representation."
  },
  {
    "type": "statement",
    "chapter": "PCA",
    "kicker": "PCA on SAXS / $P(r)$",
    "headline": "Data defines a low-dimensional<br>structural space",
    "body": "Collect many scattering curves or many pair-distance distributions.\nPCA identifies dominant modes across that ensemble.\nEach mode captures a structural variation and defines a low-dimensional coordinate system over admissible structures.\n",
    "manifesto": "Data defines a low-dimensional structural space."
  },
  {
    "type": "statement",
    "chapter": "Modes",
    "kicker": "Interpretation of PCA modes",
    "headline": "PCA becomes a dictionary<br>of shapes",
    "body": "The dominant modes can often be read as elongation, compaction, asymmetry, or other geometric deformations.\nThose modes can then be linked back to physical parameters and constraints.\nPCA starts acting like a structural language rather than a generic compression method.\n",
    "manifesto": "PCA becomes a dictionary of shapes."
  },
  {
    "type": "statement",
    "chapter": "Coarse modeling",
    "kicker": "Coarse modeling",
    "headline": "Map modes onto tractable<br>geometric models",
    "body": "Structures can be approximated with simple geometries such as ellipsoids or super-ellipsoids.\nPCA coordinates can be mapped onto those coarse parameters.\nComplexity is reduced without discarding structural meaning.\n",
    "manifesto": "From high-dimensional data to tractable models."
  },
  {
    "type": "statement",
    "chapter": "Language",
    "kicker": "Abstract language connection",
    "headline": "SAXS fits naturally into the<br>abstract framework",
    "body": "Entities become structural objects such as particles or domains.\nStates become conformations such as compact or extended.\nTransitions become changes in mode amplitudes, and observables remain the scattering signal.\n",
    "manifesto": "SAXS data fits naturally into the abstract framework."
  },
  {
    "type": "statement",
    "chapter": "HPC",
    "kicker": "ASC integration",
    "headline": "HPC explores the model<br>space at scale",
    "body": "Large-scale forward simulations can compute scattering from many coarse models across parameter space.\nThat turns HPC into the layer that systematically explores the admissible model family.\nThe space of hypotheses becomes searchable rather than implicit.\n",
    "manifesto": "HPC enables exploration of model space."
  },
  {
    "type": "statement",
    "chapter": "Loop",
    "kicker": "Model to data loop",
    "headline": "Close the loop between<br>simulation and experiment",
    "body": "Generate structures, compute scattering, compare to experiment, and update the model parameters.\nThe workflow is iterative and explicit.\nData and models remain in the same representation throughout the loop.\n",
    "manifesto": "Closed loop between simulation and experiment."
  },
  {
    "type": "statement",
    "chapter": "Interface",
    "kicker": "Role of the abstract language",
    "headline": "The language connects user,<br>model, and HPC",
    "body": "The abstract language defines how both data and models are stored.\nIt ensures compatibility between experiments, simulations, and computational infrastructure.\nIt becomes the interface layer between scientist, model, and compute environment.\n",
    "manifesto": "The language connects all components."
  },
  {
    "type": "statement",
    "chapter": "Pipeline",
    "kicker": "Unified pipeline",
    "headline": "End-to-end model-driven<br>analysis",
    "body": "Raw data becomes an abstract representation, then a PCA space, then coarse model parameters, then HPC simulations, and finally refined comparisons to experiment.\nEach step remains connected to the same structural vocabulary.\nThe pipeline is coherent from acquisition to refinement.\n",
    "manifesto": "End-to-end model-driven analysis."
  },
  {
    "type": "statement",
    "chapter": "Insight",
    "kicker": "Key insight",
    "headline": "Explore structure space,<br>not single solutions",
    "body": "SAXS does not return one structure.\nIt defines a constrained space of possible structures, and PCA plus coarse models make that space navigable.\nThe job is not to guess one answer but to organize the admissible region.\n",
    "manifesto": "We explore structure space, not single solutions."
  },
  {
    "type": "statement",
    "chapter": "Vision",
    "kicker": "Vision",
    "headline": "A unified structural<br>systems platform",
    "body": "The same logic should connect SAXS, SPR, and chromatography through one shared abstract language.\nHPC then becomes a systematic exploration engine for model space across all of them.\nThis is the route to a unified structural systems platform.\n",
    "manifesto": "From signal to navigable structure space."
  }
];
