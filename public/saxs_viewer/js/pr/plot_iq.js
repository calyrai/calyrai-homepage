/* js/pr/plot_iq.js
 * drawIq() with log/linear + unit conversion
 * INTERNAL: q in nm^-1
 * DISPLAY: q scaled by unitFactorQ()
 */
import { state, unitFactorQ } from "./state.js";
import { drawAxesWithTicks, getDataBounds } from "./plot_axes.js";

const nodeColors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628"];

function buildExpLogFromExpData() {
  if (!state.expIqData || !state.expIqData.q || !state.expIqData.I) return null;

  const q = state.expIqData.q;         // INTERNAL nm^-1
  const I = state.expIqData.I;
  const err = state.expIqData.err;

  const epsQ = 1e-12;
  const epsI = 1e-14;

  const logQ = q.map(v => Math.log10(Math.max(v, epsQ)));

  const logI = new Array(I.length);
  const logIlo = new Array(I.length);
  const logIhi = new Array(I.length);

  for (let i = 0; i < I.length; i++) {
    const Ii = Math.max(I[i], epsI);
    logI[i] = Math.log10(Ii);

    const ei = err && err[i] != null && Number.isFinite(err[i]) ? err[i] : null;
    if (ei != null) {
      const Ilo = Math.max(Ii - ei, epsI);
      const Ihi = Math.max(Ii + ei, epsI);
      logIlo[i] = Math.log10(Ilo);
      logIhi[i] = Math.log10(Ihi);
    } else {
      logIlo[i] = logI[i];
      logIhi[i] = logI[i];
    }
  }
  return { logQ, logI, logIlo, logIhi };
}

export function drawIq(ctxI, iqCanvas) {
  const W = iqCanvas.width;
  const H = iqCanvas.height;
  ctxI.clearRect(0, 0, W, H);

  const ufQ = unitFactorQ();                    // display scale
  const qModelPlot = state.qGrid.map(q => q * ufQ);
  const eps = 1e-14;

  // ALWAYS derive exp logs from expIqData to avoid stale overlays
  const expLog = buildExpLogFromExpData();

  if (state.iqPlotMode === "log") {
    // ---- LOG mode: log10(q), log10(I) ----
    const logQmodel = qModelPlot.map(q => Math.log10(Math.max(q, eps)));
    const baseLogImodel = state.Iq.map(I => Math.log10(Math.max(Math.abs(I), eps)));
    const scaledLogImodel = baseLogImodel.map(li => li + state.IqScaleLog);

    // ✅ FIX: bounds must always include MODEL, and include EXP if present
    const xVals = logQmodel.slice();
    const yVals = scaledLogImodel.slice();

    if (expLog) {
      const logShift = Math.log10(ufQ); // 0 for nm, -1 for Å
      const logQexpDisplay = expLog.logQ.map(lq => lq + logShift);

      xVals.push(...logQexpDisplay);

      for (let i = 0; i < expLog.logI.length; i++) {
        yVals.push(expLog.logI[i]   + state.expIqOffsetLog);
        yVals.push(expLog.logIlo[i] + state.expIqOffsetLog);
        yVals.push(expLog.logIhi[i] + state.expIqOffsetLog);
      }
    }

    const xMin = Math.min(...xVals);
    const xMax = Math.max(...xVals);
    const [yMin, yMax] = getDataBounds(yVals);

    const xLabel = (state.unitMode === "nm") ? "log₁₀ q (nm⁻¹)" : "log₁₀ q (Å⁻¹)";
    const yLabel = "log₁₀ I(q)";

    const mapping = drawAxesWithTicks(ctxI, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, true);
    const { left, right, top, bottom } = mapping;

    function xPix(lq) {
      return left + ((lq - xMin) / (xMax - xMin || 1e-6)) * (right - left);
    }
    function yPix(li) {
      return bottom - ((li - yMin) / (yMax - yMin || 1e-6)) * (bottom - top);
    }
    function logIFromPix(py) {
      const t = (bottom - py) / (bottom - top || 1e-6);
      return yMin + t * (yMax - yMin || 1e-6);
    }

    // components (colored)
    for (let k = 0; k < state.nodes.length; k++) {
      const nd  = state.nodes[k];
      const col = nodeColors[k % nodeColors.length];
      const Ik  = state.Iq_nodes[k];

      ctxI.strokeStyle = col;
      ctxI.lineWidth = 1;
      ctxI.setLineDash(nd.A < 0 ? [2, 4] : []);

      ctxI.beginPath();
      for (let j = 0; j < state.qGrid.length; j++) {
        const lq = logQmodel[j];
        const li = Math.log10(Math.max(Math.abs(Ik[j]), eps)) + state.IqScaleLog;
        const xp = xPix(lq);
        const yp = yPix(li);
        if (j === 0) ctxI.moveTo(xp, yp);
        else ctxI.lineTo(xp, yp);
      }
      ctxI.stroke();
    }
    ctxI.setLineDash([]);

    // model total (magenta)
    ctxI.strokeStyle = "#ff00ff";
    ctxI.lineWidth = 2;
    ctxI.beginPath();
    for (let j = 0; j < logQmodel.length; j++) {
      const xp = xPix(logQmodel[j]);
      const yp = yPix(scaledLogImodel[j]);
      if (j === 0) ctxI.moveTo(xp, yp);
      else ctxI.lineTo(xp, yp);
    }
    ctxI.stroke();

    // experimental (white dots + optional err bars)
    let expLogQScaled = null;
    let expLogIScaled = null;

    if (expLog) {
      const n = expLog.logQ.length;
      expLogQScaled = new Array(n);
      expLogIScaled = new Array(n);

      const logShift = Math.log10(ufQ);

      ctxI.fillStyle = "#ffffff";
      ctxI.strokeStyle = "#ffffff";
      ctxI.lineWidth = 1;

      for (let i = 0; i < n; i++) {
        const lq   = expLog.logQ[i] + logShift;
        const li   = expLog.logI[i] + state.expIqOffsetLog;
        const liLo = expLog.logIlo[i] + state.expIqOffsetLog;
        const liHi = expLog.logIhi[i] + state.expIqOffsetLog;

        expLogQScaled[i] = lq;
        expLogIScaled[i] = li;

        if (liLo !== liHi) {
          const xp = xPix(lq);
          ctxI.beginPath();
          ctxI.moveTo(xp, yPix(liLo));
          ctxI.lineTo(xp, yPix(liHi));
          ctxI.stroke();
        }

        const xp = xPix(lq);
        const yp = yPix(li);
        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2 * Math.PI);
        ctxI.fill();
      }
    }

    state.lastIqMapping = {
      ...mapping,
      xPix, yPix, logIFromPix,
      logQ: logQmodel,
      scaledLogI: scaledLogImodel,
      expLogQScaled,
      expLogIScaled
    };

  } else {
    // ---- LINEAR mode: q, I ----
    const modelScale = Math.pow(10, state.IqScaleLog);
    const modelY = state.Iq.map(v => v * modelScale);

    let yVals = modelY.slice();
    let expQ = null, expI = null;

    if (state.expIqData) {
      const expScale = Math.pow(10, state.expIqOffsetLog);
      expQ = state.expIqData.q.map(q => q * ufQ);   // display q
      expI = state.expIqData.I.map(v => v * expScale);
      yVals = yVals.concat(expI);
    }

    const [yMin, yMax] = getDataBounds(yVals);
    const xMin = qModelPlot[0];
    const xMax = qModelPlot[qModelPlot.length - 1];

    const xLabel = (state.unitMode === "nm") ? "q (nm⁻¹)" : "q (Å⁻¹)";
    const yLabel = "I(q)";

    const mapping = drawAxesWithTicks(ctxI, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, false);

    // model (magenta)
    ctxI.strokeStyle = "#ff00ff";
    ctxI.lineWidth = 2;
    ctxI.beginPath();
    for (let j = 0; j < qModelPlot.length; j++) {
      const xp = mapping.xPix(qModelPlot[j]);
      const yp = mapping.yPix(modelY[j]);
      if (j === 0) ctxI.moveTo(xp, yp);
      else ctxI.lineTo(xp, yp);
    }
    ctxI.stroke();

    // experimental (white dots)
    if (expQ && expI) {
      ctxI.fillStyle = "#ffffff";
      for (let i = 0; i < expQ.length; i++) {
        const xp = mapping.xPix(expQ[i]);
        const yp = mapping.yPix(expI[i]);
        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2 * Math.PI);
        ctxI.fill();
      }
    }

    // disable log drag interactions in linear mode
    state.lastIqMapping = null;
  }
}