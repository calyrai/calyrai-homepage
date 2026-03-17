/* js/pr/ui_controls.js
 * Bind sliders + unit/log controls
 *
 * Important:
 * - bindControlsOnce() must really bind only once (avoid duplicate listeners)
 */

import { state } from "./state.js";
import { rPeakOf } from "./math_basis.js";
import { fullRedrawWithNorm } from "./viewer_core.js";

let _boundOnce = false;

export function syncSlidersToActiveNode() {
  const DSlider      = document.getElementById("DSlider");
  const DValSpan     = document.getElementById("DVal");
  const alphaSlider  = document.getElementById("alphaSlider");
  const alphaValSpan = document.getElementById("alphaVal");
  const mirrorChk    = document.getElementById("mirrorChk");

  const unitSelect    = document.getElementById("unitSelect");
  const iqScaleSelect = document.getElementById("iqScaleSelect");

  // keep selects in sync too
  if (unitSelect) unitSelect.value = (state.unitMode === "A") ? "A" : "nm";
  if (iqScaleSelect) iqScaleSelect.value = (state.iqPlotMode === "linear") ? "linear" : "log";

  if (
    state.activeNode == null ||
    state.activeNode < 0 ||
    state.activeNode >= state.nodes.length
  ) {
    if (DValSpan) DValSpan.textContent = state.guiD.toFixed(0);
    if (alphaValSpan) alphaValSpan.textContent = state.guiAlpha.toFixed(2);
    if (mirrorChk) mirrorChk.checked = (state.guiDir < 0);

    if (DSlider) DSlider.value = String(Math.round(state.guiD));
    if (alphaSlider) alphaSlider.value = Number(state.guiAlpha).toFixed(2);
    return;
  }

  const nd = state.nodes[state.activeNode];
  state.guiD = nd.D;
  state.guiAlpha = nd.alpha;
  state.guiDir = nd.dir;

  if (DSlider) DSlider.value = String(Math.round(nd.D));
  if (alphaSlider) alphaSlider.value = Number(nd.alpha).toFixed(2);
  if (mirrorChk) mirrorChk.checked = (nd.dir < 0);

  if (DValSpan) DValSpan.textContent = Number(nd.D).toFixed(0);
  if (alphaValSpan) alphaValSpan.textContent = Number(nd.alpha).toFixed(2);
}

function targetNodes() {
  if (state.selectedNodes && state.selectedNodes.size) {
    return Array.from(state.selectedNodes);
  }
  if (state.activeNode != null) return [state.activeNode];
  return [];
}

export function bindControlsOnce() {
  if (_boundOnce) return;
  _boundOnce = true;

  const DSlider      = document.getElementById("DSlider");
  const DValSpan     = document.getElementById("DVal");
  const alphaSlider  = document.getElementById("alphaSlider");
  const alphaValSpan = document.getElementById("alphaVal");
  const mirrorChk    = document.getElementById("mirrorChk");

  const unitSelect    = document.getElementById("unitSelect");
  const iqScaleSelect = document.getElementById("iqScaleSelect");

  if (DSlider) {
    DSlider.addEventListener("input", () => {
      const newD = Math.round(parseFloat(DSlider.value));
      if (!Number.isFinite(newD)) return;

      state.guiD = newD;
      for (const k of targetNodes()) state.nodes[k].D = newD;

      if (DValSpan) DValSpan.textContent = String(newD);
      fullRedrawWithNorm();
    });
  }

  if (alphaSlider) {
    alphaSlider.addEventListener("input", () => {
      const newAlpha = parseFloat(alphaSlider.value);
      if (!Number.isFinite(newAlpha)) return;

      state.guiAlpha = newAlpha;
      for (const k of targetNodes()) state.nodes[k].alpha = newAlpha;

      if (alphaValSpan) alphaValSpan.textContent = newAlpha.toFixed(2);
      fullRedrawWithNorm();
    });
  }

  if (mirrorChk) {
    mirrorChk.addEventListener("change", () => {
      const dirNew = mirrorChk.checked ? -1 : +1;
      state.guiDir = dirNew;

      for (const k of targetNodes()) {
        const nd = state.nodes[k];
        const rPk = rPeakOf(nd);
        nd.dir = dirNew;

        // keep peak fixed while flipping direction:
        // rPeak = r0 + dir*(D/alpha)  => r0 = rPeak - dir*(D/alpha)
        nd.r0 = rPk - nd.dir * (nd.D / nd.alpha);
      }
      fullRedrawWithNorm();
    });
  }

  if (unitSelect) {
    unitSelect.addEventListener("change", () => {
      state.unitMode = (unitSelect.value === "A") ? "A" : "nm";
      fullRedrawWithNorm();
    });
  }

  if (iqScaleSelect) {
    iqScaleSelect.addEventListener("change", () => {
      state.iqPlotMode = (iqScaleSelect.value === "linear") ? "linear" : "log";
      fullRedrawWithNorm();
    });
  }
}