/**
 * SciFind · Facility Registry
 * Each entry is a normalized capability contract.
 * Fields: id, name, location, country, capabilities[], tags[], description, contact, status
 * method_objects: list of method IDs this facility can execute
 */
const FACILITY_REGISTRY = [
  {
    id: "vbc_saxs",
    name: "SAXS / WAXS Beamline",
    location: "Vienna BioCenter / DESY Hamburg",
    country: "AT/DE",
    status: "active",
    capabilities: ["Solution SAXS", "SEC-SAXS", "WAXS", "Nanoparticle characterization"],
    tags: ["saxs", "waxs", "sec-saxs", "protein", "solution", "nanoparticle", "membrane", "polymer"],
    description: "Synchrotron-grade small-angle X-ray scattering for solution samples, nanoparticles, membranes, and polymers. SEC-SAXS coupling for heterogeneous samples.",
    instrument_specs: {
      source: "Synchrotron",
      q_range_min_inv_ang: [0.003, 7.0],
      detector: "Pilatus 1M / EIGER2 M",
      sec_saxs: true
    },
    constraints: {
      sample_volume_uL: [20, 100],
      min_concentration_mg_mL: 0.5,
      max_concentration_mg_mL: 20,
      requires_sec_column: true
    },
    output_formats: ["dat", "pdh", "csv", "autorg_report"],
    method_objects: ["saxs_rg_pr", "sec_saxs_subtraction", "saxs_ab_initio"],
    contact: "saxs@vbc.ac.at"
  },
  {
    id: "imba_cryoem",
    name: "Cryo-EM Suite",
    location: "IMBA · Vienna",
    country: "AT",
    status: "active",
    capabilities: ["Single-particle cryo-EM", "Cryo-tomography", "Sample vitrification"],
    tags: ["cryo-em", "cryoem", "single-particle", "tomography", "em", "electron microscopy", "reconstruction"],
    description: "300 kV Titan Krios for single-particle reconstruction. Sample prep including vitrification screening and grid optimization.",
    instrument_specs: {
      voltage_kV: 300,
      detector: "K3 direct electron detector",
      phase_plate: true,
      energy_filter: "Gatan GIF Quantum"
    },
    constraints: {
      sample_volume_uL: [2, 4],
      min_concentration_mg_mL: 0.1,
      min_mw_kDa: 50,
      requires_homogeneity_check: true
    },
    output_formats: ["mrcs", "mrc", "cif", "star"],
    method_objects: ["cryoem_spa", "cryoem_tomography", "cryoem_sample_prep"],
    contact: "cryoem@imba.oeaw.ac.at"
  },
  {
    id: "univienna_nmr",
    name: "NMR Spectroscopy",
    location: "University of Vienna · NMR Center",
    country: "AT",
    status: "active",
    capabilities: ["Solution NMR", "Solid-state NMR", "Ligand binding", "Metabolomics"],
    tags: ["nmr", "hsqc", "relaxation", "noe", "protein dynamics", "ligand binding", "metabolomics", "csp"],
    description: "Up to 950 MHz field strength. Protein dynamics, ligand binding, metabolomics. Cryoprobe equipped.",
    instrument_specs: {
      max_frequency_MHz: 950,
      cryoprobe: true,
      fields_available_MHz: [500, 600, 700, 800, 950]
    },
    constraints: {
      sample_volume_uL: [300, 600],
      min_concentration_uM: 50,
      max_mw_kDa: 100,
      requires_isotope_labeling_above_kDa: 20
    },
    output_formats: ["bruker_raw", "nmrpipe", "ucsf", "stars"],
    method_objects: ["nmr_hsqc_titration", "nmr_backbone_assignment", "nmr_relaxation", "nmr_noe"],
    contact: "nmr-center@univie.ac.at"
  },
  {
    id: "cemm_spr",
    name: "SPR / BLI Kinetics",
    location: "CeMM · Vienna",
    country: "AT",
    status: "active",
    capabilities: ["Surface plasmon resonance", "Biolayer interferometry", "Fragment screening", "Affinity measurement"],
    tags: ["spr", "bli", "biacore", "binding kinetics", "ka", "kd", "kd affinity", "interaction", "fragment"],
    description: "Surface plasmon resonance and biolayer interferometry for label-free interaction analysis. From fragment screening to full kinetic characterization.",
    instrument_specs: {
      spr_instrument: "Biacore T200 / S200",
      bli_instrument: "Octet RED384",
      temperature_range_C: [10, 37]
    },
    constraints: {
      chip_surface: ["CM5", "SA", "NTA", "CAP"],
      min_analyte_mw_Da: 150,
      max_ligand_density_RU: 5000,
      requires_immobilization_scouting: true
    },
    output_formats: ["biacore_res", "txt", "csv"],
    method_objects: ["spr_kinetics", "spr_steady_state", "bli_screening"],
    contact: "spr@cemm.at"
  },
  {
    id: "imp_ms",
    name: "Mass Spectrometry",
    location: "IMP · Vienna",
    country: "AT",
    status: "active",
    capabilities: ["Proteomics", "Native MS", "HDX-MS", "Crosslinking MS"],
    tags: ["ms", "mass spec", "proteomics", "hdx", "hdx-ms", "native ms", "xlms", "crosslinking", "stoichiometry"],
    description: "Orbitrap-based platform for proteomics, crosslinking MS, native MS for complex stoichiometry, and HDX for conformational dynamics.",
    instrument_specs: {
      instrument: "Orbitrap Eclipse / Q Exactive HF",
      native_ms: true,
      hdx_robot: "LEAP HDX-2 PAL"
    },
    constraints: {
      sample_volume_uL: [10, 50],
      min_amount_ng_proteomics: 100,
      native_ms_min_concentration_uM: 5,
      hdx_min_concentration_uM: 5
    },
    output_formats: ["raw", "mzML", "mzXML", "csv", "hdx_workbench"],
    method_objects: ["ms_proteomics_dda", "ms_native_stoichiometry", "ms_hdx_dynamics", "ms_xlms"],
    contact: "mass-spec@imp.ac.at"
  },
  {
    id: "submit",
    name: "+ Add your facility",
    location: "Open registry",
    country: "",
    status: "open_registration",
    capabilities: [],
    tags: [],
    description: "Facilities submit a normalized capability contract. Indexed, searchable, matched by the agent automatically.",
    method_objects: [],
    contact: "registry@calyr.ai"
  }
];
