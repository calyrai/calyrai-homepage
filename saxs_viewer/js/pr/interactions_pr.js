/* js/pr/interactions_pr.js
 * P(r) interactions: select/move nodes
 */
import { state, dr, unitFactorR } from "./state.js";
import { rPeakOf } from "./math_basis.js";
import { fullRedrawWithNorm } from "./viewer_core.js";
import { drawP } from "./plot_pr.js";
import { drawIq } from "./plot_iq.js";

export function installPrInteractions(pCanvas, ctxP, iqCanvas, ctxI) {
  function dataFromPix_P(mx, my) {
    if (!state.lastPMapping) return null;
    const { xMin, xMax, yMin, yMax, left, right, top, bottom } = state.lastPMapping;

    function rFromPix(px) {
      const t = (px - left) / (right - left);
      const r = xMin + t * (xMax - xMin);
      return Math.max(0, Math.min(xMax, r));
    }
    function pFromPix(py) {
      const t = (bottom - py) / (bottom - top);
      return yMin + t * (yMax - yMin || 1e-6);
    }
    return { rFromPix, pFromPix };
  }

  function findHitNodeAt(mx, my) {
    if (!state.lastPMapping) return -1;
    const { xPix, yPix } = state.lastPMapping;

    const hitR2 = 10 * 10;
    let bestK = -1;
    let bestDist2 = Infinity;

    const uf = unitFactorR(); // FIX: always available here

    for (let k = 0; k < state.nodes.length; k++) {
      const nd = state.nodes[k];
      const rPeak = rPeakOf(nd);

      let idx = Math.round(rPeak / dr());
      idx = Math.max(0, Math.min(state.Nr - 1, idx));
      const pVal = state.P[idx];

      const xp_tot = xPix(rPeak * uf);
      const yp_tot = yPix(pVal);

      let dx = mx - xp_tot;
      let dy = my - yp_tot;
      let d2 = dx*dx + dy*dy;
      if (d2 <= hitR2 && d2 < bestDist2) { bestDist2 = d2; bestK = k; }

      const xp_wave = xPix(rPeak * uf);
      const yp_wave = yPix(nd.A);

      dx = mx - xp_wave;
      dy = my - yp_wave;
      d2 = dx*dx + dy*dy;
      if (d2 <= hitR2 && d2 < bestDist2) { bestDist2 = d2; bestK = k; }
    }
    return bestK;
  }

  pCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

  pCanvas.addEventListener("mousedown", (e) => {
    const rect = pCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // ensure mapping exists
    drawP(ctxP, pCanvas);

    const hitNode = findHitNodeAt(mx, my);

    if (e.button !== 0) return;

    if (hitNode >= 0) {
      if (e.shiftKey) {
        if (state.selectedNodes.has(hitNode)) state.selectedNodes.delete(hitNode);
        else state.selectedNodes.add(hitNode);
      } else {
        state.selectedNodes = new Set([hitNode]);
      }
      if (!state.selectedNodes.size) state.selectedNodes.add(hitNode);

      state.activeNode = hitNode;

      const mapping = dataFromPix_P(mx, my);
      if (!mapping) return;
      const { rFromPix, pFromPix } = mapping;

      const startR = rFromPix(mx);
      const startP = pFromPix(my);

      const perNode = [];
      for (const k of state.selectedNodes) {
        const nd = state.nodes[k];
        perNode.push({ index: k, rPeak0: rPeakOf(nd), A0: nd.A });
      }
      state.draggingInfo = { startR, startP, perNode };

      fullRedrawWithNorm();
    } else {
      // add node
      const mapping = dataFromPix_P(mx, my);
      if (!mapping) return;
      const { rFromPix, pFromPix } = mapping;

      const uf = unitFactorR();
      const rPeakNew_display = rFromPix(mx);
      const rPeakNew = rPeakNew_display / uf; // back to internal units

      const pTarget = pFromPix(my);

      const Dnew   = state.guiD;
      const anew   = state.guiAlpha;
      const dirNew = state.guiDir;

      const r0New = rPeakNew - dirNew * (Dnew / anew);
      const Anew  = pTarget;

      state.nodes.push({ r0: r0New, A: Anew, D: Dnew, alpha: anew, dir: dirNew });
      const idx = state.nodes.length - 1;
      state.selectedNodes = new Set([idx]);
      state.activeNode = idx;

      fullRedrawWithNorm();
    }
  });

  pCanvas.addEventListener("dblclick", (e) => {
    const rect = pCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    drawP(ctxP, pCanvas);
    const hit = findHitNodeAt(mx, my);
    if (hit < 0) return;

    state.nodes.splice(hit, 1);

    const newSet = new Set();
    for (const k of state.selectedNodes) {
      if (k === hit) continue;
      newSet.add(k > hit ? k - 1 : k);
    }
    state.selectedNodes = newSet;

    if (state.activeNode === hit) {
      const arr = Array.from(state.selectedNodes.values());
      state.activeNode = arr.length ? arr[arr.length - 1] : null;
    } else if (state.activeNode != null && state.activeNode > hit) {
      state.activeNode--;
    }

    fullRedrawWithNorm();
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.draggingInfo || !state.lastPMapping) return;

    const rect = pCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const mapping = dataFromPix_P(mx, my);
    if (!mapping) return;

    const { rFromPix, pFromPix } = mapping;

    const currR_display = rFromPix(mx);
    const currP = pFromPix(my);

    const dR_display = currR_display - state.draggingInfo.startR;
    const dA = currP - state.draggingInfo.startP;

    const uf = unitFactorR();
    const dR = dR_display / uf; // back to internal units

    for (const info of state.draggingInfo.perNode) {
      const nd = state.nodes[info.index];
      let rPeakNew = info.rPeak0 + dR;
      rPeakNew = Math.max(0, Math.min(state.rMax, rPeakNew));
      nd.r0 = rPeakNew - nd.dir * (nd.D / nd.alpha);
      nd.A  = info.A0 + dA;
    }

    // light redraw while dragging
    // (no renorm during drag)
    // we keep your original behaviour
    // NOTE: recompute happens in fullRedrawWithNorm on mouseup
    // Here: just draw based on current state
    // We'll use fullRedrawWithNorm anyway for simplicity & stability.
    fullRedrawWithNorm();
  });

  window.addEventListener("mouseup", () => {
    if (state.draggingInfo) {
      state.draggingInfo = null;
      fullRedrawWithNorm();
    }
  });

  // Keyboard arrows for selected nodes
  window.addEventListener("keydown", (e) => {
    const sel = Array.from(state.selectedNodes.values());
    if (!sel.length) return;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const up = (e.key === "ArrowUp");
      const factor = up ? 1.1 : 1.0 / 1.1;
      for (const k of sel) state.nodes[k].A *= factor;
      fullRedrawWithNorm();
      e.preventDefault();
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const dir = (e.key === "ArrowRight") ? +1 : -1;
      const step = 0.2;
      for (const k of sel) {
        const nd = state.nodes[k];
        let rpk = rPeakOf(nd) + dir * step;
        rpk = Math.max(0, Math.min(state.rMax, rpk));
        nd.r0 = rpk - nd.dir * (nd.D / nd.alpha);
      }
      fullRedrawWithNorm();
      e.preventDefault();
    }
  });
}
