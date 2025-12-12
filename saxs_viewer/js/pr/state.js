/* js/pr/state.js
 * Central state + constants
 *
 * ================================
 * PHYSICAL RULE (GNOM-compatible):
 * ================================
 * ALL computations are done ONLY in:
 *   r  : nm
 *   q  : nm⁻¹
 *
 * Å exists ONLY as a DISPLAY unit.
 * Never as a computational unit.
 * ================================
 */

export const state = {
  // ==================================================
  // INTERNAL GRIDS (PHYSICAL, nm-based)
  // ==================================================

  // P(r): support 0 … 100 nm  (= 0 … 1000 Å)
  rMax: 100.0,        // nm
  Nr:   1000,         // Δr ≈ 0.1 nm

  // I(q): nm⁻¹
  qMin: 0.005,        // nm⁻¹
  qMax: 0.4,          // nm⁻¹
  Nq:   300,

  // ==================================================
  // INTERNAL GRIDS (filled during init)
  // ==================================================
  rGrid: [],          // nm
  qGrid: [],          // nm⁻¹

  // ==================================================
  // MODEL DATA (INTERNAL, nm / nm⁻¹)
  // ==================================================
  P: [],              // P(r)
  Iq: [],             // I(q)
  P_nodes: [],        // component P(r)
  Iq_nodes: [],       // component I(q)

  // ==================================================
  // EXPERIMENTAL DATA (INTERNAL UNITS ONLY!)
  // ==================================================
  expPrData: null,    // { r[nm], P, err }
  expIqData: null,    // { q[nm⁻¹], I, err }

  // Cached logs (INTERNAL, unscaled)
  expIqLog: null,     // { logQ, logI, logIlo, logIhi }
  expIqOffsetLog: 0.0, // vertical shift ONLY for exp curve (log-space)

  // ==================================================
  // MODEL ↔ EXP SCALING (GNOM-style)
  // ==================================================
  IqScaleLog: 0.0,        // log10(scale factor), MODEL → EXP
  modelIqBackground: 0.0,// optional constant background (linear I)

  autoGnomScale: true,   // auto-fit after drop / PDB load
  gnomUseBackground: false,
  gnomQMin: null,        // nm⁻¹ (optional fit window)
  gnomQMax: null,

  // ==================================================
  // GUI PARAMETERS (INTERNAL UNITS!)
  // ==================================================
  guiD: 2.0,             // nm
  guiAlpha: 0.70,        // nm⁻¹
  guiDir: +1,

  // ==================================================
  // DISPLAY MODES (NO PHYSICS HERE)
  // ==================================================
  unitMode: "nm",        // "nm" | "A"
  iqPlotMode: "log",     // "log" | "linear"

  // ==================================================
  // NODE / INTERACTION STATE
  // ==================================================
  nodes: [],

  lastPMapping: null,
  lastIqMapping: null,

  selectedNodes: new Set(),
  activeNode: null,

  pulsePhase: 0.0,

  draggingInfo: null,
  draggingIqModel: null,
  draggingIqExp: null,
};

// ==================================================
// INTERNAL GRID HELPERS (PHYSICAL)
// ==================================================
export function dr() {
  // nm
  return state.rMax / (state.Nr - 1);
}

// ==================================================
// DISPLAY UNIT CONVERSIONS (PURELY VISUAL)
// ==================================================
export function unitFactorR() {
  // r_display = r_internal * factor
  // nm → nm : 1
  // nm → Å  : 10
  return (state.unitMode === "nm") ? 1.0 : 10.0;
}

export function unitFactorQ() {
  // q_display = q_internal * factor
  // nm⁻¹ → nm⁻¹ : 1
  // nm⁻¹ → Å⁻¹  : 0.1
  return (state.unitMode === "nm") ? 1.0 : 0.1;
}