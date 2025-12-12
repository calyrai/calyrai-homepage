/* js/pr/interactions_iq.js
 * I(q) log-mode drag interactions
 */
import { state } from "./state.js";
import { drawIq } from "./plot_iq.js";

export function installIqInteractions(iqCanvas, ctxI) {
  iqCanvas.addEventListener("mousedown", (e) => {
    if (state.iqPlotMode !== "log") return;
    if (!state.lastIqMapping) return;

    const rect = iqCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const { xPix, yPix, logQ, scaledLogI, expLogQScaled, expLogIScaled, logIFromPix } = state.lastIqMapping;

    const threshold = 10;
    let bestD2Model = Infinity, bestIdxModel = -1;
    let bestD2Exp   = Infinity, bestIdxExp   = -1;

    const stepM = 5;
    for (let j = 0; j < logQ.length; j += stepM) {
      const xp = xPix(logQ[j]);
      const yp = yPix(scaledLogI[j]);
      const dx = mx - xp;
      const dy = my - yp;
      const d2 = dx*dx + dy*dy;
      if (d2 < bestD2Model) { bestD2Model = d2; bestIdxModel = j; }
    }

    if (expLogQScaled && expLogIScaled) {
      for (let j = 0; j < expLogQScaled.length; j++) {
        const xp = xPix(expLogQScaled[j]);
        const yp = yPix(expLogIScaled[j]);
        const dx = mx - xp;
        const dy = my - yp;
        const d2 = dx*dx + dy*dy;
        if (d2 < bestD2Exp) { bestD2Exp = d2; bestIdxExp = j; }
      }
    }

    const thr2 = threshold * threshold;

    if (bestIdxExp >= 0 && bestD2Exp <= thr2 && bestD2Exp <= bestD2Model && expLogIScaled) {
      state.draggingIqExp = { startOffset: state.expIqOffsetLog, startLogI: logIFromPix(my) };
    } else if (bestIdxModel >= 0 && bestD2Model <= thr2) {
      const refLogI = scaledLogI[bestIdxModel];
      const baseRefLogI = refLogI - state.IqScaleLog;
      state.draggingIqModel = { baseRefLogI };
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.lastIqMapping) return;

    if (state.draggingIqModel) {
      const rect = iqCanvas.getBoundingClientRect();
      const my = e.clientY - rect.top;
      const logI_mouse = state.lastIqMapping.logIFromPix(my);
      state.IqScaleLog = logI_mouse - state.draggingIqModel.baseRefLogI;
      drawIq(ctxI, iqCanvas);
    }

    if (state.draggingIqExp) {
      const rect = iqCanvas.getBoundingClientRect();
      const my = e.clientY - rect.top;
      const logI_mouse = state.lastIqMapping.logIFromPix(my);
      const delta = logI_mouse - state.draggingIqExp.startLogI;
      state.expIqOffsetLog = state.draggingIqExp.startOffset + delta;
      drawIq(ctxI, iqCanvas);
    }
  });

  window.addEventListener("mouseup", () => {
    state.draggingIqModel = null;
    state.draggingIqExp   = null;
  });
}
import { state } from "./state.js";
import { applyGnomScale } from "./fit_gnom_scale.js";
import { drawIq } from "./plot_iq.js";

export function installIqInteractions(canvas, ctx) {
  let dragging = false;
  let qStart = null;

  canvas.addEventListener("mousedown", (e) => {
    if (!state.lastIqMapping) return;
    dragging = true;
    qStart = state.lastIqMapping.logQFromPix(e.offsetX);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!dragging || !state.lastIqMapping) return;
    drawIq(ctx, canvas); // optional: draw overlay rectangle
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!dragging || !state.lastIqMapping) return;
    dragging = false;

    const qEnd = state.lastIqMapping.logQFromPix(e.offsetX);

    const qMin = Math.pow(10, Math.min(qStart, qEnd));
    const qMax = Math.pow(10, Math.max(qStart, qEnd));

    // INTERNAL UNITS: nm^-1
    state.gnomQMin = qMin;
    state.gnomQMax = qMax;

    applyGnomScale({
      qMin,
      qMax,
      useBackground: state.gnomUseBackground
    });

    drawIq(ctx, canvas);
  });
}