/* js/pr/viewer_core.js
 * Central redraw orchestration
 *
 * Responsibility:
 * - recompute model P(r) and I(q)
 * - apply normalization
 * - redraw plots
 * - sync UI state
 *
 * IMPORTANT:
 * - No drawing without clear recomputation
 * - No duplicated animation loops
 */

import { state } from "./state.js";
import { recomputePRandIq, normalizeArea } from "./math_basis.js";
import { drawP } from "./plot_pr.js";
import { drawIq } from "./plot_iq.js";
import { syncSlidersToActiveNode } from "./ui_controls.js";

let ctxP = null;
let ctxI = null;
let pCanvas = null;
let iqCanvas = null;

/* --------------------------------------------------
 * Context wiring (called once from main.js)
 * -------------------------------------------------- */
export function setContexts(_ctxP, _pCanvas, _ctxI, _iqCanvas) {
  ctxP = _ctxP;
  pCanvas = _pCanvas;
  ctxI = _ctxI;
  iqCanvas = _iqCanvas;
}

/* --------------------------------------------------
 * Full recompute + redraw (GNOM-style workflow)
 * -------------------------------------------------- */
export function fullRedrawWithNorm() {
  // 1) compute model from current nodes
  recomputePRandIq();

  // 2) normalize P(r) area → affects model scale
  normalizeArea();

  // 3) recompute I(q) consistently from normalized P(r)
  recomputePRandIq();

  // 4) draw plots (canvas is cleared inside draw functions)
  if (ctxP && pCanvas) drawP(ctxP, pCanvas);
  if (ctxI && iqCanvas) drawIq(ctxI, iqCanvas);

  // 5) keep UI in sync with active node
  syncSlidersToActiveNode();
}