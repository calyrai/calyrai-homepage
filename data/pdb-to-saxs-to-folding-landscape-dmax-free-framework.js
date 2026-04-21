// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SAXS",
    "headline": "PDB → SAXS → Folding Landscape:<br>A Dmax-Free Framework",
    "tagline": "data → method → math → decision"
  },
  {
    "type": "statement",
    "chapter": "Data",
    "kicker": "Data source",
    "headline": "Protein structures from the PDB<br>define the empirical basis",
    "body": "Structures are downloaded from the RCSB PDB through the API.\nAtomic coordinates are converted into a structural dataset.\nThe dataset is the large-scale basis from which the manifold is learned.\n"
  },
  {
    "type": "statement",
    "chapter": "Representation",
    "kicker": "From structure to PDD",
    "headline": "Start from pair distances,<br>not from a fitted cutoff",
    "body": "For coordinates $\\{r_i\\}_{i=1}^N$, compute\n$$P(r)=\\frac{1}{N^2}\\sum_{i,j}\\delta\\!\\left(r-|r_i-r_j|\\right).$$\nThis captures size, shape, and internal correlation structure in one object.\n"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "Why Dmax fails",
    "headline": "Standard SAXS workflows rely on $D_{max}$,<br>but flexible systems do not",
    "body": "$D_{max}$ is unstable when tails are broad, weak, or conformation-dependent.\nThe cutoff becomes a regularization choice rather than a measured quantity.\nThe goal is to remove $D_{max}$ from the representation layer entirely.\n"
  },
  {
    "type": "statement",
    "chapter": "Method",
    "kicker": "Frac-fit",
    "headline": "Represent the PDD continuously<br>without an explicit cutoff",
    "body": "Use the Dmax-free form\n$$P(r)\\sim r^{\\alpha}e^{-\\beta r}.$$\n$\\alpha$ captures compactness versus extension.\n$\\beta$ captures the decay or size scale.\n"
  },
  {
    "type": "statement",
    "chapter": "Reduction",
    "kicker": "PCA of PDDs",
    "headline": "Project the structural dataset<br>into a reduced manifold",
    "body": "Assemble the aligned PDD dataset matrix $X$ and compute\n$$X=U\\Sigma V^T.$$\nProject one sample by\n$$z=U^Tx.$$\n"
  },
  {
    "type": "statement",
    "chapter": "Interpretation",
    "kicker": "Structural coordinates",
    "headline": "The leading axes become interpretable<br>structural directions",
    "body": "PC1 tracks compact to extended states.\nPC2 tracks anisotropy.\nPC3 tracks internal ordering.\nThe PCA coordinates become structural coordinates rather than only numerical features.\n"
  },
  {
    "type": "statement",
    "chapter": "Model",
    "kicker": "Coarse-grained basis states",
    "headline": "Use a minimal model family<br>to span candidate folds",
    "body": "Alpha-like states represent compact folds.\nBeta-like states represent extended folds.\nRandom-coil states represent flexible conformations.\nThese are the basis states for coarse-grained exploration.\n"
  },
  {
    "type": "statement",
    "chapter": "Exploration",
    "kicker": "Simulation on ASC",
    "headline": "ASC turns the candidate family<br>into a parameter search",
    "body": "LAMMPS or a coarse-grained engine generates trajectories.\nSlurm runs one parameter set $\\theta$ per job.\nThe result is a controlled exploration of conformational space.\n"
  },
  {
    "type": "statement",
    "chapter": "Output",
    "kicker": "Simulation output",
    "headline": "Each simulation returns the same objects<br>needed for comparison",
    "body": "The outputs are trajectories, pair distances, and folding or binding events.\nFrom these outputs, compute the simulated pair-distance distribution.\nThe model and the data now live in the same representation space.\n"
  },
  {
    "type": "statement",
    "chapter": "Matching",
    "kicker": "Structural and manifold match",
    "headline": "First ask whether the candidate matches<br>the target and the protein manifold",
    "body": "Structural consistency is measured by\n$$\\lVert P_{model}(r)-P_{data}(r)\\rVert.$$\nManifold proximity is measured by\n$$d_{PCA}(x)=\\lVert z-z_{dataset}\\rVert.$$\n"
  },
  {
    "type": "statement",
    "chapter": "Stability",
    "kicker": "Physical feasibility",
    "headline": "Then ask whether the structure survives<br>physical relaxation",
    "body": "Relax the coarse-grained candidate and score\n$$S_{stability}=-\\Delta E-\\lambda\\lVert\\Delta x\\rVert.$$\nA candidate that only fits before relaxation is not admissible.\n"
  },
  {
    "type": "statement",
    "chapter": "Pathway",
    "kicker": "Transition realism",
    "headline": "A plausible fold must also sit inside<br>a connected transition graph",
    "body": "Define the pathway score by\n$$S_{connectivity}=\\sum_{j\\in\\mathcal{N}(i)}e^{-d_{ij}}.$$\nThis favors candidates embedded in realistic local transition structure.\n"
  },
  {
    "type": "statement",
    "chapter": "Decision",
    "kicker": "Fold Admissibility Filter",
    "headline": "Rank candidates by one coupled score,<br>not by one matched curve",
    "body": "The Fold Admissibility Filter is\n$$A(\\mathcal{C})=w_1\\lVert P_{model}-P_{data}\\rVert^{-1}+w_2d_{PCA}^{-1}+w_3S_{stability}+w_4S_{connectivity}.$$\nThis turns descriptor agreement, manifold proximity, stability, and pathway realism into one decision object.\n"
  },
  {
    "type": "statement",
    "chapter": "Result",
    "kicker": "Folding landscape",
    "headline": "The outcome is a ranked landscape<br>of favorable, metastable, and rejected folds",
    "body": "High $A(\\mathcal{C})$ identifies favored states.\nIntermediate scores identify metastable states.\nLow scores mark unfavorable or non-admissible states.\n",
    "manifesto": "Replace arbitrary cutoffs with continuous structure and admissibility-based decisions."
  }
];
