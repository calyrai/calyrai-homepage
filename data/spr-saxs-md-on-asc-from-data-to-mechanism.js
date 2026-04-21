// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · SAXS",
    "headline": "SPR + SAXS + MD on ASC:<br>from data to mechanism",
    "tagline": "concrete workflow, abstract figures, and constrained model testing"
  },
  {
    "type": "statement",
    "chapter": "System",
    "kicker": "System",
    "headline": "IgG adsorption on Protein A resin<br>is the test system",
    "body": "The measurements are SAXS for structure and SPR for kinetics.\nThe goal is not just to describe the data, but to identify the mechanism that can explain both.\nThis is the concrete system that ties the workflow together.\n"
  },
  {
    "type": "statement",
    "chapter": "SAXS",
    "kicker": "What SAXS shows",
    "headline": "Characteristic distances appear<br>and shift with load",
    "body": "The SAXS data shows characteristic distances around thirteen to fifteen nanometers, around thirty nanometers, and around sixty nanometers.\nThese peaks shift as loading increases.\nThe structural signal is concrete, but it still does not identify the mechanism by itself.\n"
  },
  {
    "type": "statement",
    "chapter": "SPR",
    "kicker": "What SPR shows",
    "headline": "The sensorgram reveals<br>more than simple Langmuir behavior",
    "body": "The binding curve $R(t)$ shows two regimes with a first saturation and a second saturation.\nThat already suggests the system is more complex than a single-site Langmuir picture.\nKinetics is informative, but still not uniquely mechanistic.\n"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "Interpretation problem",
    "headline": "One dataset cannot decide<br>between multiple explanations",
    "body": "Possible explanations include heterogeneous sites, steric blocking, and protein-protein interaction.\nLooking at only one dataset cannot distinguish them reliably.\nThe mechanism has to survive both structural and kinetic tests.\n"
  },
  {
    "type": "statement",
    "chapter": "Model",
    "kicker": "Minimal model",
    "headline": "Use the smallest model that can still<br>carry the mechanism",
    "body": "IgG is represented as a five-bead Y-shape.\nThe ligand is represented as a hexamer with four active sites and two blocked anchors.\nA spacing of roughly fifteen nanometers defines the geometric baseline.\n"
  },
  {
    "type": "statement",
    "chapter": "ASC",
    "kicker": "Simulation platform",
    "headline": "ASC turns parameter space<br>into a batch workflow",
    "body": "Access is via SSH and OTP.\nJobs run through Slurm and each job corresponds to one parameter set.\nThe platform is used to test model families systematically rather than interactively.\n"
  },
  {
    "type": "statement",
    "chapter": "MD",
    "kicker": "LAMMPS input",
    "headline": "Interactions are specified<br>at the minimal mechanistic level",
    "body": "The LAMMPS input defines beads, Fc-ligand interactions, IgG-IgG interactions, and steric exclusion.\nThat is sufficient to generate trajectories and binding histories.\nThe simulation stays coarse, but mechanistically interpretable.\n"
  },
  {
    "type": "statement",
    "chapter": "Workflow",
    "kicker": "Slurm and output",
    "headline": "Batch simulation produces trajectories,<br>events, and clusters",
    "body": "Slurm executes one parameter set per batch job.\nThe outputs are positions, binding events, and cluster formation patterns.\nThese are the raw materials from which SAXS-like and SPR-like observables are reconstructed.\n"
  },
  {
    "type": "statement",
    "chapter": "Evaluation",
    "kicker": "Compare back to experiment",
    "headline": "Compute the same observables<br>and reject what fails",
    "body": "From MD, compute pair-distance distributions and compare them to the SAXS peaks and their shifts.\nAlso extract association and dissociation behavior and compare it to the SPR sensorgram.\nIf the model does not match both, reject it.\n"
  },
  {
    "type": "statement",
    "chapter": "Result",
    "kicker": "Result",
    "headline": "Only the model with sterics and<br>IgG-IgG interaction survives",
    "body": "The successful model requires steric blocking together with cooperative IgG-IgG interaction.\nThat combination reproduces SAXS and SPR simultaneously.\nThe mechanism is selected by cross-constraint, not by a single fit.\n"
  },
  {
    "type": "statement",
    "chapter": "Emergence",
    "kicker": "Emergence",
    "headline": "Bi-Langmuir behavior is not primary,<br>it emerges from the geometry",
    "body": "The observed macroscopic behavior is not treated as fundamental.\nIt emerges from geometry, sterics, and interaction rules in the coarse system.\nThe mechanism is therefore more basic than the empirical fit form.\n"
  },
  {
    "type": "statement",
    "chapter": "FAIR",
    "kicker": "FAIR linkage",
    "headline": "FAIR is what keeps the full workflow<br>comparable and reusable",
    "body": "FAIR means Findable, Accessible, Interoperable, and Reusable.\nIt is essential because SAXS, SPR, and MD outputs have to be represented in ways that can be compared, filtered, and reused across runs.\nWithout FAIR-compatible abstractions, the workflow cannot support reproducible decision-making.\n"
  },
  {
    "type": "statement",
    "chapter": "Conclusion",
    "kicker": "Conclusion",
    "headline": "SAXS gives structure, SPR gives kinetics,<br>MD tests mechanism",
    "body": "ASC provides the batch compute layer that makes systematic testing feasible.\nThe full workflow moves from measurement to constrained mechanism selection.\nThe result is not a fit, but a consistent mechanism identified across data types.\n",
    "manifesto": "If it does not match both observables, discard it."
  }
];
