/* js/pr/main.js
 * Entry point
 */
import { state, dr } from "./state.js";
import { logspace, recomputePRandIq, normalizeArea } from "./math_basis.js";
import { drawP } from "./plot_pr.js";
import { drawIq } from "./plot_iq.js";
import { setupDragAndDrop } from "./io_drop.js";
import { loadDefaultPDB } from "./pdb_to_priq.js";
import { bindControlsOnce } from "./ui_controls.js";
import { setContexts, fullRedrawWithNorm } from "./viewer_core.js";
import { installPrInteractions } from "./interactions_pr.js";
import { installIqInteractions } from "./interactions_iq.js";

function buildGrids() {
  const d = dr();
  state.rGrid = Array.from({ length: state.Nr }, (_, i) => i * d);

  const logQmin = Math.log10(state.qMin);
  const logQmax = Math.log10(state.qMax);
  state.qGrid = [];
  for (let i = 0; i <= state.Nq; i++) {
    const t  = i / state.Nq;
    const lq = logQmin + t * (logQmax - logQmin);
    state.qGrid.push(Math.pow(10, lq));
  }

  state.P  = new Array(state.Nr).fill(0.0);
  state.Iq = new Array(state.qGrid.length).fill(0.0);
}

function initNodes() {
  const rPeaksInit = logspace(Math.log10(2), Math.log10(40), 4);
  state.nodes = rPeaksInit.map((rp, i) => {
    const D0 = state.guiD;
    const a0 = state.guiAlpha;
    const dir0 = +1;
    const r0 = Math.max(0, rp - dir0 * D0 / a0);
    return {
      r0,
      A: [1.0, 0.6, -0.4, 0.3][i] || 0.2,
      D: D0,
      alpha: a0,
      dir: dir0
    };
  });
}

function animateLoop(ctxP, pCanvas, ctxI, iqCanvas) {
  state.pulsePhase += 0.1;
  drawP(ctxP, pCanvas);
  drawIq(ctxI, iqCanvas);
  requestAnimationFrame(() => animateLoop(ctxP, pCanvas, ctxI, iqCanvas));
}

export function initPRIQViewer() {
  const pCanvas  = document.getElementById("pCanvas");
  const iqCanvas = document.getElementById("iqCanvas");
  if (!pCanvas || !iqCanvas) {
    console.warn("pr/main.js: missing #pCanvas or #iqCanvas");
    return;
  }
  const ctxP = pCanvas.getContext("2d");
  const ctxI = iqCanvas.getContext("2d");

  buildGrids();
  initNodes();

  setContexts(ctxP, pCanvas, ctxI, iqCanvas);

  recomputePRandIq();
  normalizeArea();
  recomputePRandIq();

  bindControlsOnce();
  setupDragAndDrop(pCanvas, iqCanvas, ctxP, ctxI);
  installPrInteractions(pCanvas, ctxP, iqCanvas, ctxI);
  installIqInteractions(iqCanvas, ctxI);

  fullRedrawWithNorm();
  animateLoop(ctxP, pCanvas, ctxI, iqCanvas);

  // auto-load 3V03.pdb -> exp overlays
  loadDefaultPDB("3V03.pdb").then(() => fullRedrawWithNorm());
}
