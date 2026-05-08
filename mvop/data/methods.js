/**
 * SciFind · Method Template Library
 * Modelled on Nature Methods / Nature Protocols paper structure.
 *
 * Each Method Object has:
 *   id, name, category, keywords[]
 *   fields: { setup, sample_prep, data_collection, processing, analysis,
 *             assumptions, validation, failure_modes, output, references }
 *   compatible_facilities[]  — facility IDs from facilities.js
 *   typical_duration
 *   required_expertise_level  ("routine" | "specialist" | "expert")
 *
 * The copilot uses keyword[] for intent detection.
 * It renders fields as a Method Object card.
 */
const METHOD_LIBRARY = [

  /* ── SAXS ──────────────────────────────────────────────────────────── */
  {
    id: "saxs_rg_pr",
    name: "SAXS — Rg and P(r) extraction",
    category: "Structural Biology",
    keywords: ["saxs", "small angle", "x-ray scattering", "rg", "radius of gyration", "p(r)", "pair distance", "pr curve", "solution scattering", "scatter", "iq", "i(q)"],
    fields: {
      setup: "Synchrotron or in-house SAXS beamline; 1 mm capillary or SEC-SAXS flow cell. Calibrate beam center, detector distance, and absolute scale with water or glassy carbon standard.",
      sample_prep: "Buffer exchange into degassed, low-salt buffer (PBS or HEPES). Spin 21 000 × g for 10 min. Measure A280 for concentration (0.5–20 mg/mL). Prepare serial dilution series (×1, ×0.5, ×0.25) to check concentration dependence.",
      data_collection: "Collect 10–20 frames × 1 s per sample plus matched buffer. For SEC-SAXS: inline size-exclusion at 0.3–0.5 mL/min; select peak frames for averaging. Record I(q) vs q (0.003–7 nm⁻¹).",
      processing: "1. Buffer subtraction (matched exposure, same capillary). 2. Guinier fit in ln(I) vs q² for q·Rg < 1.3 → Rg, I(0). 3. BIFT/GNOM for P(r) and Dmax. 4. Check linearity in Kratky plot for foldedness.",
      analysis: "From P(r): shape class (globular, elongated, multi-domain). From Rg + MW (via I(0)/reference): oligomeric state. Ab initio envelope via DAMMIF/GASBOR if needed.",
      assumptions: [
        "Sample is monodisperse (check by DLS beforehand)",
        "No radiation damage (compare first and last frames)",
        "Buffer is identical to sample buffer",
        "Concentration series shows linear I(0) scaling"
      ],
      validation: "1. Guinier R² > 0.99. 2. P(r) decays smoothly to zero at Dmax. 3. MW from Vcor / Porod volume within 15% of sequence MW. 4. No radiation damage: frame-to-frame overlay stable.",
      failure_modes: [
        "Aggregation → upturn at low q; use SEC-SAXS or spin longer",
        "Radiation damage → systematic drift; reduce exposure or add radiation protectant",
        "Concentration dependence → repulsive/attractive structure factor; use dilution series",
        "Poor buffer match → oscillations in background; re-dialyze"
      ],
      output: ["Rg (nm)", "I(0) (cm⁻¹ if absolute)", "Dmax (nm)", "P(r) curve", "MW estimate", "Shape class", "SAXS data file (.dat)"],
      references: ["Petoukhov et al., J Appl Cryst 2012", "Franke et al., Nat Protoc 2017 (ATSAS)", "Rambo & Tainer, Nature 2013 (Vcor)"]
    },
    compatible_facilities: ["vbc_saxs"],
    typical_duration: "4–8 h (SEC-SAXS session)",
    required_expertise_level: "specialist"
  },

  {
    id: "sec_saxs_subtraction",
    name: "SEC-SAXS — inline subtraction pipeline",
    category: "Structural Biology",
    keywords: ["sec-saxs", "sec saxs", "size exclusion saxs", "inline saxs", "elution", "peak frame", "buffer frame", "subtraction pipeline"],
    fields: {
      setup: "HPLC with UV + SAXS flow cell in series. Superdex 200 Increase 10/300 GL at 0.5 mL/min. Running buffer must be freshly degassed.",
      sample_prep: "Inject 50–100 µL at 5–10 mg/mL. Equilibrate column with ≥2 CVs of running buffer before injection.",
      data_collection: "Continuous frame collection (1–2 s/frame). Record UV trace to identify elution peak and baseline.",
      processing: "1. Plot Rg per frame (CHROMIXS / RAW). 2. Select stable Rg plateau frames as 'sample'. 3. Select buffer-only frames before void as 'buffer'. 4. Subtract buffer average from sample average. 5. Quality check: χ² of buffer subtraction.",
      analysis: "Same as SAXS Rg/P(r); high confidence because monodisperse fraction isolated online.",
      assumptions: ["Peak is homogeneous (stable Rg across frames)", "Buffer baseline is stable before void"],
      validation: "Rg stability across ≥5 peak frames; MW matches expected; no systematic residuals in subtraction.",
      failure_modes: ["Peak overlap → poor Rg plateau; optimize SEC gradient", "Column overloading → distorted elution; reduce injection amount"],
      output: ["Averaged subtracted .dat", "Rg frame profile", "MW from I(0)"],
      references: ["Graewert et al., Sci Rep 2015", "Hopkins et al., J Appl Cryst 2017"]
    },
    compatible_facilities: ["vbc_saxs"],
    typical_duration: "6 h (+ overnight SEC equilibration)",
    required_expertise_level: "specialist"
  },

  /* ── Cryo-EM ────────────────────────────────────────────────────────── */
  {
    id: "cryoem_spa",
    name: "Cryo-EM — Single-particle analysis",
    category: "Structural Biology",
    keywords: ["cryo-em", "cryoem", "single particle", "spa", "reconstruction", "relion", "cryosparc", "krios", "vitrification", "grid", "electron microscopy"],
    fields: {
      setup: "Titan Krios 300 kV, K3 detector, energy filter (20 eV slit). AutoGrid cassette. EPU or SerialEM data collection software.",
      sample_prep: "1. Native buffer, 0.5–5 mg/mL (optimise by NS-TEM). 2. Glow-discharge Quantifoil R 1.2/1.3 grids, 60 s at 20 mA. 3. Vitrobot: 4°C, 100% humidity, 3 µL sample, blot 3–5 s, plunge. 4. Screen 5–10 grids by cryo-TEM before full collection.",
      data_collection: "Collect 3000–10 000 movies at 50–100 e⁻/Å² total dose. 40 frames per movie, 1.0 Å/pixel. Defocus range −1.0 to −2.5 µm. Stage tilt ±45° for preferred orientation (if needed).",
      processing: "1. MotionCor2: beam-induced motion correction. 2. CTFFIND4: CTF estimation. 3. cryoSPARC/RELION: particle picking → 2D classes → heterogeneous 3D → final refinement → polishing → CTF refinement → local resolution (ResMap).",
      analysis: "Map at 2–4 Å: model building (Coot) + refinement (Phenix / REFMAC). Map at >8 Å: rigid-body fit of known domains. Validate with FSC = 0.143 gold-standard, map-model CC, MolProbity.",
      assumptions: ["Particle is conformationally homogeneous (or classify)", "No preferred orientation (use tilt or detergent)", "MW ≥ 50 kDa (< 50 kDa needs special strategies)"],
      validation: "FSC 0.143 resolution; B-factor estimate; local resolution map; density-to-model CC ≥ 0.7.",
      failure_modes: ["Air-water interface denaturation → add surfactant or use graphene support", "Preferred orientation → collect tilted data", "Poor ice → optimize blot time, Vitrobot humidity"],
      output: ["3D cryo-EM map (.mrc)", "Refined atomic model (.cif)", "FSC curve", "Local resolution map"],
      references: ["Punjani et al., Nat Methods 2017 (cryoSPARC)", "Scheres, J Struct Biol 2012 (RELION)", "Rosenthal & Henderson, J Mol Biol 2003"]
    },
    compatible_facilities: ["imba_cryoem"],
    typical_duration: "2–5 days (data collection) + 1–4 weeks (processing)",
    required_expertise_level: "expert"
  },

  /* ── NMR ────────────────────────────────────────────────────────────── */
  {
    id: "nmr_hsqc_titration",
    name: "NMR — ¹H-¹⁵N HSQC ligand titration",
    category: "Structural Biology / Biophysics",
    keywords: ["nmr", "hsqc", "¹⁵n", "15n", "chemical shift perturbation", "csp", "ligand binding nmr", "titration nmr", "binding site", "solution nmr"],
    fields: {
      setup: "600–950 MHz spectrometer with cryoprobe. Isotope-labelled protein (¹⁵N, or ¹³C/¹⁵N) at 50–200 µM in NMR buffer (50 mM phosphate pH 7.0, 150 mM NaCl, 10% D₂O).",
      sample_prep: "Dissolve ligand in d₆-DMSO (keep DMSO ≤ 2% v/v) or directly in matching buffer. Prepare a 2× master stock. Add aliquots directly to the NMR tube to avoid dilution artefacts.",
      data_collection: "Collect 2D ¹H-¹⁵N HSQC at each ligand:protein molar ratio (0, 0.25, 0.5, 1, 2, 4, 8 eq.). Each spectrum: 16–32 scans × 128–256 increments. Temperature 25–37°C.",
      processing: "TopSpin or NMRPipe: apodization (sinebell), zero-fill, FFT. Peak picking in CCPNMR Analysis or Sparky. Calculate CSP = √[(Δδ_H)² + (0.14·Δδ_N)²].",
      analysis: "Plot CSP vs [ligand]/[protein] per residue. Fit fast-exchange to obtain Kd (global or per-residue). Map binding site on structure. Identify slow-exchange residues.",
      assumptions: ["Fast exchange regime (off-rate >> acquisition time) for simple Kd fitting", "Protein is ≤ 50 kDa (or perdeuterated above)", "Backbone assignment available"],
      validation: "Linear CSP scaling at low ratios; converging Kd across multiple residues; reference spectrum unchanged after titration reversal.",
      failure_modes: ["Slow exchange → peak disappearance; use ¹⁵N Z-exchange or dark-state NMR", "Precipitation of ligand → reduce DMSO; try aqueous solubilization", "Aggregation at high [L] → cap [L] or add detergent"],
      output: ["Per-residue CSP map", "Binding site highlight on structure", "Kd (µM–mM range)", "Hill coefficient"],
      references: ["Williamson, Prog NMR Spectr 2013", "Zuiderweg, Biochemistry 2002 (HSQC sensitivity)"]
    },
    compatible_facilities: ["univienna_nmr"],
    typical_duration: "1–2 days per titration series",
    required_expertise_level: "specialist"
  },

  /* ── SPR ────────────────────────────────────────────────────────────── */
  {
    id: "spr_kinetics",
    name: "SPR — Kinetics & affinity (Biacore)",
    category: "Biophysics",
    keywords: ["spr", "surface plasmon resonance", "biacore", "ka", "kd", "kon", "koff", "association rate", "dissociation rate", "binding kinetics", "sensorgram", "chip", "cm5", "ligand immobilization"],
    fields: {
      setup: "Biacore T200 or S200. CM5 sensor chip (standard); SA chip for biotin ligand; NTA for His-tag. Running buffer: PBS-T (0.05% Tween-20) or HBS-EP+.",
      sample_prep: "Ligand: dialyse into immobilization buffer (pH 0.5–1.0 below pI for amine coupling). Determine optimal immobilisation density by scouting (target 100–500 RU for kinetics). Analyte: serial dilution (0.1–10× Kd), prepared fresh in running buffer.",
      data_collection: "Reference-subtracted sensorgrams (Fc2-Fc1 or Fc2-Fc4). Association: 60–120 s at 30–50 µL/min. Dissociation: 120–300 s. Regeneration: optimized salt/pH pulse. Collect 5–8 analyte concentrations + blanks (double-reference).",
      processing: "BIAevaluation or Biacore Insight: double reference subtraction. Fit 1:1 Langmuir or heterogeneous ligand model. Extract ka (M⁻¹s⁻¹), kd (s⁻¹), Kd (kd/ka).",
      analysis: "Kinetic Kd = kd/ka. Steady-state Rmax fit for slow systems. Compare with orthogonal (ITC, NMR). Check Rmax for stoichiometry. Plot kd vs temperature for ΔH‡.",
      assumptions: ["1:1 binding stoichiometry (or use heterogeneous model)", "Ligand is homogeneous and stably immobilized", "Mass transport limited regime avoided (low density + high flow rate)"],
      validation: "Chi² < 2 RU² for 1:1 fit; residuals random and < 5% of Rmax; duplicate runs within 20%; kinetic Kd matches steady-state Kd.",
      failure_modes: ["Rebinding artefact → reduce ligand density or use BLI", "Slow dissociation → extend dissociation time or use competition assay", "Non-specific binding → block with BSA, test reference subtraction", "Mass transport → lower density + higher flow"],
      output: ["ka (M⁻¹s⁻¹)", "kd (s⁻¹)", "Kd (M)", "Rmax (RU)", "Sensorgram overlays", "Residual plot"],
      references: ["Karlsson et al., J Mol Recognit 1994", "Myszka, J Mol Recognit 1999 (CLAMP scoring)", "Rich & Myszka, Anal Biochem 2007"]
    },
    compatible_facilities: ["cemm_spr"],
    typical_duration: "1 day (scouting) + 1 day (kinetics)",
    required_expertise_level: "specialist"
  },

  /* ── MS ─────────────────────────────────────────────────────────────── */
  {
    id: "ms_hdx_dynamics",
    name: "MS — HDX-MS conformational dynamics",
    category: "Structural Biology / Biophysics",
    keywords: ["hdx", "hdx-ms", "hydrogen deuterium exchange", "deuterium uptake", "conformational dynamics", "protein flexibility", "protection factor", "deuterium labeling"],
    fields: {
      setup: "LEAP HDX-2 PAL robot for automated H/D exchange labelling. LC: reversed-phase at 0°C (Acquity UPLC). MS: SYNAPT G2-Si or Q Exactive HF (ETD capable).",
      sample_prep: "Protein at 5–30 µM in protiated buffer. Pepsin digest map: undeuterated protein digested at pH 2.5, 0°C → identify peptides (≥80% sequence coverage required).",
      data_collection: "Initiate exchange in D₂O buffer (identical composition, pD 7.0). Time points: 10 s, 1 min, 10 min, 60 min, 4 h. Quench: pH 2.5, 0°C. Inject for LC-MS. Collect undeuterated and fully deuterated controls.",
      processing: "HDExaminer or DynamX: peptide identification → deuterium uptake calculation → back-exchange correction (10–15%). Difference plot for apo vs. bound. Statistical filter: ≥0.4 Da significance threshold.",
      analysis: "Solvent accessibility / flexibility map on 3D structure. Identify protected (binding site, folded core) vs. deprotected (allosteric opening, unfolding) regions. Correlate with SAXS or cryo-EM models.",
      assumptions: ["EX2 exchange regime (most proteins at physiological pH)", "No proline in peptides (no amide H)", "Back-exchange correction from fully deuterated control is adequate"],
      validation: "≥80% sequence coverage; back-exchange < 30%; reproducibility across biological replicates (triplicate); no systematic shift in undeuterated control.",
      failure_modes: ["Poor pepsin map → try alternative proteases (Asp-N, Lys-C at pH 2.5)", "High back-exchange → check valve timing, column temperature, gradient speed", "Aggregation at µM → add stabilizer or reduce concentration"],
      output: ["Deuterium uptake plots per peptide", "Butterfly/difference plot", "HDX protection map on structure", "Δuptake tables (csv)"],
      references: ["Englander & Kallenbach, Q Rev Biophys 1983", "Masson et al., Nat Protoc 2019 (best practices)", "Wei et al., Drug Discov Today 2014"]
    },
    compatible_facilities: ["imp_ms"],
    typical_duration: "2 days (prep+digest) + 2 days (HDX collection) + 2 days (analysis)",
    required_expertise_level: "expert"
  },

  /* ── Proteomics ─────────────────────────────────────────────────────── */
  {
    id: "ms_proteomics_dda",
    name: "MS — DDA Shotgun Proteomics",
    category: "Proteomics",
    keywords: ["proteomics", "shotgun", "dda", "label-free quantification", "lfq", "lfq-dda", "trypsin digest", "protein identification", "maxquant", "perseus", "proteome"],
    fields: {
      setup: "Q Exactive HF or Orbitrap Eclipse. nanoHPLC (75 µm × 50 cm C18). ESI source. Data-dependent acquisition (MS1 120k, MS2 15k resolution).",
      sample_prep: "Cell lysis → BCA quantification → 10–50 µg protein → reduction (10 mM DTT) → alkylation (50 mM IAA) → trypsin digest (1:50 E:S, 37°C, 16 h) → desalting (C18 StageTip or OASIS).",
      data_collection: "Inject 500 ng–2 µg peptide. Gradient: 5–35% ACN over 90–120 min. Top-15 DDA; dynamic exclusion 30 s. MS1 range: 350–1600 m/z.",
      processing: "MaxQuant (LFQ): feature detection → peptide-spectrum-matching against UniProt (FDR 1% peptide + protein) → LFQ normalization. Output: proteinGroups.txt.",
      analysis: "Perseus: volcano plot (Student t-test, permutation FDR 5%). GO/KEGG enrichment. Network analysis (STRING). PCA for sample clustering.",
      assumptions: ["Trypsin cleaves after K/R (no P next)", "FDR 1% at peptide and protein level", "≥2 unique peptides per protein for confident identification"],
      validation: "Pearson correlation between replicates > 0.97; housekeeping proteins stable; spike-in standard within 15% CV.",
      failure_modes: ["Over-alkylation → extra IAA wash step", "Poor digest → check trypsin activity; add Lys-C", "Low identifications → check sample quality, BCA accuracy"],
      output: ["Protein list with LFQ intensities", "Volcano plot", "GO enrichment", "MaxQuant search report"],
      references: ["Cox & Mann, Nat Biotechnol 2008 (MaxQuant)", "Tyanova et al., Nat Protoc 2016 (Perseus)"]
    },
    compatible_facilities: ["imp_ms"],
    typical_duration: "1 day (prep) + 0.5 day (LC-MS) + 1 day (analysis)",
    required_expertise_level: "routine"
  }

];

/**
 * Match user input text to the best-fitting method template(s).
 * Returns an array of matching method objects, sorted by score desc.
 */
function matchMethods(text) {
  const lower = text.toLowerCase();
  return METHOD_LIBRARY
    .map(m => {
      const score = m.keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
      return { method: m, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.method);
}

/**
 * Render a Method Object card as an HTML string.
 */
function renderMethodCard(m) {
  const fieldRows = Object.entries(m.fields)
    .map(([key, val]) => {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const content = Array.isArray(val)
        ? '<ul style="margin:0.3rem 0 0 1rem;padding:0">' + val.map(v => `<li>${escapeHtml(String(v))}</li>`).join('') + '</ul>'
        : `<span>${escapeHtml(String(val))}</span>`;
      return `<tr><td style="padding:0.3rem 0.6rem 0.3rem 0;color:rgba(247,248,255,0.45);font-size:0.78rem;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:0.3rem 0;font-size:0.82rem;line-height:1.5">${content}</td></tr>`;
    }).join('');

  const facilityNames = (m.compatible_facilities || [])
    .map(fid => {
      const f = (typeof FACILITY_REGISTRY !== 'undefined') ? FACILITY_REGISTRY.find(x => x.id === fid) : null;
      return f ? f.name : fid;
    }).join(', ');

  return `
<div style="background:rgba(36,243,255,0.04);border:1px solid rgba(36,243,255,0.18);border-radius:10px;padding:1rem 1.2rem;margin-top:0.6rem">
  <div style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:#24f3ff;margin-bottom:0.4rem">Method Object · ${escapeHtml(m.category)}</div>
  <div style="font-weight:700;font-size:1rem;margin-bottom:0.6rem">${escapeHtml(m.name)}</div>
  <table style="width:100%;border-collapse:collapse">${fieldRows}</table>
  <div style="margin-top:0.7rem;font-size:0.78rem;color:rgba(247,248,255,0.45)">
    <span style="color:#ff4df5">Facilities</span>: ${escapeHtml(facilityNames)} &nbsp;·&nbsp;
    <span style="color:rgba(247,248,255,0.45)">Duration</span>: ${escapeHtml(m.typical_duration)} &nbsp;·&nbsp;
    <span style="color:rgba(247,248,255,0.45)">Expertise</span>: ${escapeHtml(m.required_expertise_level)}
  </div>
</div>`;
}
