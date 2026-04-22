// data/publications.js
// Generated from data/publications.yaml by scripts/build_publications.py
// DO NOT EDIT DIRECTLY — edit publications.yaml instead.

window.CALYR_PUBLICATION_NETWORK = {
  "title": "Publication Network",
  "subtitle": "Publications only. Click a node to open the archive when available, otherwise the manuscript card.",
  "edges": [
    {
      "from": "constraint-coupled-inference",
      "to": "spr-kinetic-modes"
    },
    {
      "from": "constraint-coupled-inference",
      "to": "spr-evaluation-concept"
    },
    {
      "from": "spr-kinetic-modes",
      "to": "spr-evaluation-concept"
    },
    {
      "from": "chromatography-fractional-transport",
      "to": "sbpa-modelling-2026"
    },
    {
      "from": "sbpa-modelling-2026",
      "to": "fco-manuscript"
    }
  ]
};
window.CALYR_PUBLICATIONS = [
  {
    "id": "calyr-ai-syntax-concept",
    "title": "Calyr_ai_syntax: Concept and Architecture",
    "topic": "nexus",
    "status": "active",
    "pdfs": [
      {
        "label": "presentation",
        "path": "presentations/calyr-ai-syntax-concept.html"
      },
      {
        "label": "pdf",
        "path": "presentations/calyr-ai-syntax-concept.pdf"
      }
    ],
    "method": "Reduced concept presentation for symbolic systems, Nexus control logic, and Calyr architecture",
    "abstract": "Concept presentation for Calyr_ai_syntax as a symbolic language layer for computational science. The deck covers the symbolic-expression idea, sample regimes, Nexus as a declarative control plane, closed-loop validation, representation flow, and the transition from simulation toward construction.",
    "description": "PDF presentation version of the Calyr_ai_syntax concept deck."
  },
  {
    "id": "nexus-cli-from-data-to-decision",
    "title": "Nexus CLI: From Data to Decision",
    "topic": "nexus",
    "status": "active",
    "pdfs": [
      {
        "label": "presentation",
        "path": "presentations/nexus-cli-user-guide.html"
      }
    ],
    "method": "Training presentation for FAIR data, model-based decision making, Nexus control logic, and VSC-5 workflow",
    "abstract": "Introductory training presentation for Nexus CLI workflows. The deck explains FAIR data objects, model-based decision making, the role of SPR and SAXS at a conceptual level, the Nexus control-plane idea, and the operational workflow on VSC-5 from login to ranked results.",
    "description": "Homepage presentation version of the Nexus CLI training deck."
  },
  {
    "id": "spr-kinetic-modes",
    "title": "SPR Kinetic Modes",
    "topic": "spr",
    "status": "active",
    "pdfs": [
      {
        "label": "open",
        "path": "../../docs/publishing/Calyr_ai_publishing/nexus_spr_kinetic_modes/nexus_spr_kinetic_modes.pdf"
      }
    ],
    "method": "Gillespie-generated kinetic ensemble → PCA basis → SPR trace projection",
    "abstract": "SPR sensorgrams and adsorption isotherms are customarily treated as separate analyses. The present system requires their joint treatment: a double-shouldered isotherm must emerge as the steady-state limit of the same coupled two-layer equations that fit the full sensorgram family. Primary adsorption and gated secondary uptake share one parameter object; kinetic trapping into a long-lived second state explains the near-flat dissociation observed across the concentration ladder.",
    "description": "Stochastic ensemble generation via Gillespie simulation, PCA-based kinetic basis, and projection of SPR traces into kinetic space."
  },
  {
    "id": "spr-evaluation-concept",
    "title": "SPR Evaluation Concept",
    "topic": "spr",
    "status": "active",
    "pdfs": [
      {
        "label": "full",
        "path": "../../docs/publishing/Calyr_ai_publishing/nexus_spr_evaluation_concept/nexus_learning_adsorption_mechanics.pdf"
      },
      {
        "label": "short",
        "path": "../../docs/publishing/Calyr_ai_publishing/nexus_spr_evaluation_concept/nexus_learning_adsorption_mechanics_short.pdf"
      }
    ],
    "method": "Latent-space inference of rate constants from raw SPR response curves",
    "abstract": "Raw SPR response curves encode association and dissociation rate constants in a geometry that classical fitting does not expose. A latent-space encoder trained on Gillespie-generated sensorgram ensembles maps experimental curves into a kinetic-basis space where rate constants are directly separable. The encoder output is a typed KineticBasis object ready for constraint coupling across independent experimental series.",
    "description": "Learning adsorption mechanics from SPR data."
  },
  {
    "id": "constraint-coupled-inference",
    "title": "Constraint-Coupled Inference",
    "topic": "spr",
    "status": "progress",
    "pdfs": [
      {
        "label": "open",
        "path": "../../docs/publishing/Calyr_ai_publishing/nexus_constraint_coupled_inference/nexus_constraint_coupled_inference.pdf"
      }
    ],
    "method": "Bridge-constraint propagation over shared latent state; analytical & stochastic reductions",
    "abstract": "Two or more instrument signals measured on the same molecular system share a common latent state. A bridge-constraint operator enforces shared-state consistency without requiring direct signal-to-signal conversion. Analytical, semi-analytical, and stochastic reductions are derived from the coupled system; the intersection of all feasible-state regions under each constraint defines the accepted molecular parameter estimate.",
    "description": "Bridge-defined constraints over a shared latent state. Analytical, semi-analytical, and stochastic reductions."
  },
  {
    "id": "sbpa-modelling-2026",
    "title": "SBPA Modelling 2026",
    "topic": "saxs",
    "status": "active",
    "pdfs": [
      {
        "label": "open",
        "path": "../../docs/publishing/Calyr_ai_publishing/sbpa_modelling_26/manuscript.pdf"
      }
    ],
    "method": "AlphaFold + cryo-EM → LAMMPS MD → SAXS I(q) validation in Nexus scaffold",
    "abstract": "Structure-based potential analysis places AlphaFold-predicted coordinates and cryo-EM density as joint priors over LAMMPS molecular dynamics trajectories. SAXS I(q) curves computed from MD snapshots are compared against measured data within the Nexus constraint framework. The validated structure is the intersection of all four constraint sets rather than the output of any single technique.",
    "description": "Structure-based potential analysis combining AlphaFold, cryo-EM, LAMMPS, and SAXS in a Nexus-controlled scaffold."
  },
  {
    "id": "chromatography-fractional-transport",
    "title": "Chromatography Fractional Transport",
    "topic": "saxs",
    "status": "progress",
    "pdfs": [
      {
        "label": "open",
        "path": "../../docs/publishing/Calyr_ai_publishing/nexus_chromatography_fractional_transport/nexus_chromatography_fractional_transport.pdf"
      }
    ],
    "method": "Fractional-operator transport modes; heavy-tailed kinetics from column profiles",
    "abstract": "Packed-column transport is governed by fractional differential operators when the effective pore-size distribution is broad and elution profiles exhibit heavy-tailed kinetics. The fractional transport equation recovers the classical van Deemter result in the integer-order limit and extends it to anomalous dispersion. A basis decomposition of the fractional modes provides a direct handle on column efficiency over the full concentration program without assuming Gaussian peak shapes.",
    "description": "Fractional operators and mode-based chromatography interpretation. Distributed timescales and heavy-tailed kinetics."
  },
  {
    "id": "fco-manuscript",
    "title": "FCO Manuscript",
    "topic": "saxs",
    "status": "staged",
    "pdfs": [
      {
        "label": "open",
        "path": "../../docs/publishing/Calyr_ai_publishing/fco_manuscript/fco_manuscript.pdf"
      }
    ],
    "method": "Field-coupled operator framework for SAXS-driven structural characterisation",
    "abstract": "Field-coupled operators applied to SAXS I(q) curves identify structural hierarchy across length scales without prior knowledge of particle shape or maximum dimension. The FCO layer is placed after standard normalisation and indirect Fourier transform; the resulting structural fingerprint is directly comparable across compound classes. Coupling to Nexus constraints allows multi-instrument validation of the FCO-derived structural state.",
    "description": "FCO framework manuscript."
  }
];
