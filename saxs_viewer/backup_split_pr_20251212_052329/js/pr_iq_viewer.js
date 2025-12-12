// js/pr_iq_viewer.js
// P(r) & I(q) wavelet viewer + automatic PDB->P(r),I(q) from CA distances
// Calyrai neon style, experimental curves as white overlay

// ============================
// Global parameters
// ============================
const rMax   = 80.0;
const Nr     = 600;
const dr     = rMax / (Nr - 1);

const qMin  = 0.005;
const qMax  = 0.4;
const Nq    = 300;

const rGrid = Array.from({ length: Nr }, (_, i) => i * dr);

// logarithmic q-grid for the model curves
const logQmin = Math.log10(qMin);
const logQmax = Math.log10(qMax);
const qGrid = [];
for (let i = 0; i <= Nq; i++) {
  const t  = i / Nq;
  const lq = logQmin + t * (logQmax - logQmin);
  qGrid.push(Math.pow(10, lq));
}

let P  = new Array(Nr).fill(0.0);
let Iq = new Array(qGrid.length).fill(0.0);
let P_nodes = [];
let Iq_nodes = [];

// experimental data (from PDB or drag&drop)
let expPrData = null;   // { r:[], P:[], err:[]|null }
let expIqData = null;   // { q:[], I:[], err:[]|null }
let expIqLog  = null;   // { logQ, logI, logIlo, logIhi }
let expIqOffsetLog = 0.0;   // vertical offset (log10)

// defaults for new wavelet nodes
let guiD     = 2.0;
let guiAlpha = 0.70;
let guiDir   = +1;

// global log10 intensity scale for MODEL I(q)
let IqScaleLog = 0.0;



// Einheiten & Plot-Modi
let unitMode   = "nm";     // "nm" oder "A"
let iqPlotMode = "log";    // "log" oder "linear"

// nodes: { r0, A, D, alpha, dir }
function logspace(a, b, n) {
  const out = [];
  const step = (b - a) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) out.push(Math.pow(10, a + step * i));
  return out;
}

const rPeaksInit = logspace(Math.log10(2), Math.log10(40), 4);
let nodes = rPeaksInit.map((rp, i) => {
  const D0 = guiD;
  const a0 = guiAlpha;
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

// interaction state
let lastPMapping = null;
let lastIqMapping = null;

// selection: multiple nodes
let selectedNodes = new Set();  // indices
let activeNode   = null;        // last clicked
let pulsePhase   = 0.0;

// dragging peaks collectively
let draggingInfo = null; // { startR, startP, perNode:[{index,rPeak0,A0}] }

// dragging I(q) vertical scales
let draggingIqModel = null; // magenta model
let draggingIqExp   = null; // experimental white

// ============================
// Helpers
// ============================
function rPeakOf(nd) {
  return nd.r0 + nd.dir * (nd.D / nd.alpha);
}

function phiNormAt(r, r0, Dk, alphaK, dirK) {
  let t = dirK > 0 ? (r - r0) : (r0 - r);
  if (t <= 0) return 0.0;
  const phi = Math.pow(t, Dk) * Math.exp(-alphaK * t);
  const t_peak = Dk / alphaK;
  const phi_peak = Math.pow(t_peak, Dk) * Math.exp(-alphaK * t_peak);
  const norm = (phi_peak > 0) ? phi_peak : 1.0;
  return phi / norm; // φ(r_peak)=1
}

function areaOfP() {
  let area = 0.0;
  for (let i = 0; i < Nr; i++) area += P[i] * dr;
  return area;
}

function normalizeArea() {
  const area = areaOfP();
  const eps = 1e-12;
  if (!Number.isFinite(area) || Math.abs(area) < eps) return;
  const scale = 1.0 / area;
  for (const nd of nodes) nd.A *= scale;
}

function recomputePRandIq() {
  P.fill(0.0);
  Iq.fill(0.0);
  P_nodes = nodes.map(() => new Array(Nr).fill(0.0));
  Iq_nodes = nodes.map(() => new Array(qGrid.length).fill(0.0));

  // P(r)
  for (let k = 0; k < nodes.length; k++) {
    const { r0, A, D: Dk, alpha: ak, dir: dirK } = nodes[k];
    const Pk = P_nodes[k];
    for (let i = 0; i < Nr; i++) {
      const r = rGrid[i];
      const phi = phiNormAt(r, r0, Dk, ak, dirK);
      const val = A * phi;
      Pk[i] = val;
      P[i] += val;
    }
  }
  if (Nr > 0) P[0] = 0.0;

  // I(q) from this model P(r)
  for (let k = 0; k < nodes.length; k++) {
    const Pk = P_nodes[k];
    const Ik = Iq_nodes[k];
    for (let j = 0; j < qGrid.length; j++) {
      const q = qGrid[j];
      let sum = 0.0;
      if (q < 1e-10) {
        for (let i = 0; i < Nr; i++) sum += Pk[i] * dr;
      } else {
        for (let i = 0; i < Nr; i++) {
          const r = rGrid[i];
          const qr = q * r;
          const j0 = (qr === 0) ? 1.0 : Math.sin(qr) / qr;
          sum += Pk[i] * j0 * dr;
        }
      }
      Ik[j] = sum;
      Iq[j] += sum;
    }
  }
}

// ============================
// Plot helpers
// ============================
const pCanvas = document.getElementById("pCanvas");
const iqCanvas = document.getElementById("iqCanvas");
const ctxP = pCanvas.getContext("2d");
const ctxI = iqCanvas.getContext("2d");

const nodeColors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628"];

function getDataBounds(arr) {
  let min = Infinity, max = -Infinity;
  for (const v of arr) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) { min = -1; max = 1; }
  if (Math.abs(max - min) < 1e-6) max = min + 1;
  const pad = 0.05 * (max - min);
  return [min - pad, max + pad];
}

function drawAxesWithTicks(ctx, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, logX=false) {
  const left  = 60;
  const right = W - 30;
  const top   = 30;
  const bottom= H - 35;

  function xPix(x) {
    return left + ((x - xMin)/(xMax - xMin || 1e-6)) * (right - left);
  }
  function yPix(y) {
    return bottom - ((y - yMin)/(yMax - yMin || 1e-6)) * (bottom - top);
  }

  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  ctx.fillStyle = "#cccccc";
  ctx.font = "10px system-ui";

  const nXTicks = 6;
  for (let i = 0; i <= nXTicks; i++) {
    const t = i / nXTicks;
    const xVal = xMin + t * (xMax - xMin);
    const xp = xPix(xVal);
    ctx.beginPath();
    ctx.moveTo(xp, bottom);
    ctx.lineTo(xp, bottom + 4);
    ctx.strokeStyle = "#444";
    ctx.stroke();
    let label = logX ? ("10^" + xVal.toFixed(1)) : xVal.toFixed(0);
    ctx.fillText(label, xp - 10, bottom + 14);
  }

  const nYTicks = 4;
  for (let i = 0; i <= nYTicks; i++) {
    const t = i / nYTicks;
    const yVal = yMin + t * (yMax - yMin);
    const yp = yPix(yVal);
    ctx.beginPath();
    ctx.moveTo(left - 4, yp);
    ctx.lineTo(left, yp);
    ctx.strokeStyle = "#444";
    ctx.stroke();
    ctx.fillText(yVal.toFixed(2), left - 40, yp + 3);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "11px system-ui";
  ctx.fillText(xLabel, (left + right)/2 - 20, H - 5);
  ctx.save();
  ctx.translate(15, (top + bottom)/2 + 10);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  return { xPix, yPix, left, right, top, bottom, xMin, xMax, yMin, yMax };
}

function drawP() {
  const W = pCanvas.width;
  const H = pCanvas.height;
  ctxP.clearRect(0, 0, W, H);

  const unitFactor = (unitMode === "nm") ? 1.0 : 10.0; // Å = 10 * nm
  const xMin = 0, xMax = rMax * unitFactor;
  if (Nr > 0) P[0] = 0.0;

  let yVals = P.slice();
  if (expPrData) {
    yVals = yVals.concat(expPrData.P);
    if (expPrData.err) {
      for (let i = 0; i < expPrData.P.length; i++) {
        yVals.push(expPrData.P[i] + expPrData.err[i]);
        yVals.push(expPrData.P[i] - expPrData.err[i]);
      }
    }
  }
  const [rawMin, rawMax] = getDataBounds(yVals);
  const mAbs = Math.max(Math.abs(rawMin), Math.abs(rawMax));
  const yMin = -mAbs || -1.0;
  const yMax = +mAbs || +1.0;

  const mapping = drawAxesWithTicks(
    ctxP, W, H, xMin, xMax, yMin, yMax,
    (unitMode === "nm") ? "r (nm)" : "r (Å)", "P(r)"
  );
  const { xPix, yPix } = mapping;

  ctxP.strokeStyle = "#333";
  ctxP.lineWidth = 1;
  ctxP.beginPath();
  const y0 = yPix(0.0);
  ctxP.moveTo(60, y0);
  ctxP.lineTo(W-30, y0);
  ctxP.stroke();

  // components
  for (let k = 0; k < nodes.length; k++) {
    const nd  = nodes[k];
    const col = nodeColors[k % nodeColors.length];
    const Pk  = P_nodes[k];

    ctxP.strokeStyle = col;
    ctxP.lineWidth = 1;
    ctxP.setLineDash(nd.A < 0 ? [2, 4] : []);

    ctxP.beginPath();
    for (let i = 0; i < Nr; i++) {
      const xp = xPix(rGrid[i] * unitFactor);
      const valDisplay = Pk[i];
      const yp = yPix(valDisplay);
      if (i === 0) ctxP.moveTo(xp, yp);
      else ctxP.lineTo(xp, yp);
    }
    ctxP.stroke();
  }
  ctxP.setLineDash([]);

  // total P(r)
  ctxP.strokeStyle = "#00ffff";
  ctxP.lineWidth = 2;
  ctxP.beginPath();
  for (let i = 0; i < Nr; i++) {
    const xp = xPix(rGrid[i] * unitFactor);
    const yp = yPix(P[i]);
    if (i === 0) ctxP.moveTo(xp, yp);
    else ctxP.lineTo(xp, yp);
  }
  ctxP.stroke();

  // experimental P(r) (e.g. from PDB distances or drag & drop)
  if (expPrData) {
    ctxP.strokeStyle = "#ffffff";
    ctxP.fillStyle = "#ffffff";
    ctxP.lineWidth = 1;

    for (let i = 0; i < expPrData.r.length; i++) {
      const r = expPrData.r[i];
      const val = expPrData.P[i];
      const xp = xPix(r * unitFactor);
      const yp = yPix(val);

      if (expPrData.err && expPrData.err[i] != null) {
        const e = expPrData.err[i];
        const ypLo = yPix(val - e);
        const ypHi = yPix(val + e);
        ctxP.beginPath();
        ctxP.moveTo(xp, ypLo);
        ctxP.lineTo(xp, ypHi);
        ctxP.stroke();
        const cap = 3;
        ctxP.beginPath();
        ctxP.moveTo(xp - cap, ypLo);
        ctxP.lineTo(xp + cap, ypLo);
        ctxP.moveTo(xp - cap, ypHi);
        ctxP.lineTo(xp + cap, ypHi);
        ctxP.stroke();
      }

      ctxP.beginPath();
      ctxP.arc(xp, yp, 2, 0, 2*Math.PI);
      ctxP.fill();
    }
  }

  // nodes (with blinking for selected)
  for (let k = 0; k < nodes.length; k++) {
    const nd  = nodes[k];
    const col = nodeColors[k % nodeColors.length];
    const rPeak = rPeakOf(nd);

    let A_k = nd.A;
    if (!Number.isFinite(A_k)) A_k = 0.0;

    const xp_wave = xPix(rPeak * unitFactor);
    const yp_wave = yPix(A_k);

    const isSelected = selectedNodes.has(k);
    const pulse = isSelected ? (1.5 * Math.sin(pulsePhase) + 2) : 0;

    const smallBase = 4;
    const smallRadius = smallBase + pulse;

    ctxP.fillStyle = col;
    ctxP.beginPath();
    ctxP.arc(xp_wave, yp_wave, smallRadius, 0, 2*Math.PI);
    ctxP.fill();

    let idx = Math.round(rPeak / dr);
    idx = Math.max(0, Math.min(Nr - 1, idx));
    const pVal = P[idx];
    const xp_tot = xPix(rPeak * unitFactor);
    const yp_tot = yPix(pVal);

    const bigBase = 6;
    const bigRadius = bigBase + (isSelected ? pulse : 0);

    ctxP.beginPath();
    ctxP.arc(xp_tot, yp_tot, bigRadius, 0, 2*Math.PI);
    ctxP.fillStyle = col;
    ctxP.fill();

    if (isSelected) {
      ctxP.strokeStyle = "#ffffff";
      ctxP.lineWidth = 2;
      ctxP.stroke();
    }
  }

  lastPMapping = { ...mapping, xPix, yPix };
  return lastPMapping;
}

function drawIq() {
  const W = iqCanvas.width;
  const H = iqCanvas.height;
  ctxI.clearRect(0, 0, W, H);

  const unitFactorQ = (unitMode === "nm") ? 1.0 : 0.1; // Å⁻¹ = 0.1 * nm⁻¹
  const qModelPlot  = qGrid.map(q => q * unitFactorQ);

  const eps = 1e-14;

  if (iqPlotMode === "log") {
    // ---- LOG: log I, log q ----
    const logQmodel = qModelPlot.map(q => Math.log10(Math.max(q, eps)));
    const baseLogImodel = Iq.map(I => Math.log10(Math.max(Math.abs(I), eps)));
    const scaledLogImodel = baseLogImodel.map(li => li + IqScaleLog);

    let xMin, xMax, yMin, yMax, yVals;

    let logQexpDisplay = null;
    if (expIqLog) {
      const logShift = Math.log10(unitFactorQ); // 0 for nm, -1 for Å
      logQexpDisplay = expIqLog.logQ.map(lq => lq + logShift);
      xMin = Math.min(...logQexpDisplay);
      xMax = Math.max(...logQexpDisplay);

      yVals = [];
      for (let i = 0; i < expIqLog.logI.length; i++) {
        yVals.push(expIqLog.logI[i]   + expIqOffsetLog);
        yVals.push(expIqLog.logIlo[i] + expIqOffsetLog);
        yVals.push(expIqLog.logIhi[i] + expIqOffsetLog);
      }
      [yMin, yMax] = getDataBounds(yVals);
    } else {
      xMin = logQmodel[0];
      xMax = logQmodel[logQmodel.length - 1];
      yVals = scaledLogImodel.slice();
      [yMin, yMax] = getDataBounds(yVals);
    }

    const xLabel = (unitMode === "nm") ? "log₁₀ q (nm⁻¹)" : "log₁₀ q (Å⁻¹)";
    const yLabel = "log₁₀ I(q)";

    const mapping = drawAxesWithTicks(
      ctxI, W, H, xMin, xMax, yMin, yMax,
      xLabel, yLabel, true
    );

    const { left, right, top, bottom } = mapping;

    function xPix(lq) {
      return left + ((lq - xMin)/(xMax - xMin || 1e-6)) * (right - left);
    }
    function yPix(li) {
      return bottom - ((li - yMin)/(yMax - yMin || 1e-6)) * (bottom - top);
    }
    function logIFromPix(py) {
      const t = (bottom - py)/(bottom - top || 1e-6);
      return yMin + t*(yMax - yMin || 1e-6);
    }

    const epsI_plot = 1e-14;

    // components
    for (let k = 0; k < nodes.length; k++) {
      const nd  = nodes[k];
      const col = nodeColors[k % nodeColors.length];
      const Ik = Iq_nodes[k];

      ctxI.strokeStyle = col;
      ctxI.lineWidth = 1;
      ctxI.setLineDash(nd.A < 0 ? [2, 4] : []);

      ctxI.beginPath();
      for (let j = 0; j < qGrid.length; j++) {
        const lq = logQmodel[j];
        const li_base = Math.log10(Math.max(Math.abs(Ik[j]), epsI_plot));
        const li = li_base + IqScaleLog;
        const xp = xPix(lq);
        const yp = yPix(li);
        if (j === 0) ctxI.moveTo(xp, yp);
        else ctxI.lineTo(xp, yp);
      }
      ctxI.stroke();
    }
    ctxI.setLineDash([]);

    // model total: magenta
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

    // experimental I(q): white
    let expLogQScaled = null;
    let expLogIScaled = null;

    if (expIqLog) {
      ctxI.strokeStyle = "#ffffff";
      ctxI.fillStyle = "#ffffff";
      ctxI.lineWidth = 1;

      const n = expIqLog.logQ.length;
      expLogQScaled = new Array(n);
      expLogIScaled = new Array(n);

      const logShift = Math.log10(unitFactorQ);

      for (let i = 0; i < n; i++) {
        const lq   = expIqLog.logQ[i] + logShift;
        const li   = expIqLog.logI[i]   + expIqOffsetLog;
        const liLo = expIqLog.logIlo[i] + expIqOffsetLog;
        const liHi = expIqLog.logIhi[i] + expIqOffsetLog;

        expLogQScaled[i] = lq;
        expLogIScaled[i] = li;

        const xp = xPix(lq);
        const yp = yPix(li);
        const ypLo = yPix(liLo);
        const ypHi = yPix(liHi);

        ctxI.beginPath();
        ctxI.moveTo(xp, ypLo);
        ctxI.lineTo(xp, ypHi);
        ctxI.stroke();

        const cap = 3;
        ctxI.beginPath();
        ctxI.moveTo(xp - cap, ypLo);
        ctxI.lineTo(xp + cap, ypLo);
        ctxI.moveTo(xp - cap, ypHi);
        ctxI.lineTo(xp + cap, ypHi);
        ctxI.stroke();

        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2*Math.PI);
        ctxI.fill();
      }
    }

    lastIqMapping = {
      ...mapping,
      xPix,
      yPix,
      logIFromPix,
      logQ: logQmodel,
      scaledLogI: scaledLogImodel,
      expLogQScaled,
      expLogIScaled
    };
  } else {
    // ---- LINEAR: I, q ----
    const modelScale = Math.pow(10, IqScaleLog);
    const modelY = Iq.map(v => v * modelScale);

    let yVals = modelY.slice();
    let expQ = null, expI = null;

    if (expIqData) {
      const expScale = Math.pow(10, expIqOffsetLog);
      expQ = expIqData.q.map(q => q * unitFactorQ);
      expI = expIqData.I.map(v => v * expScale);
      yVals = yVals.concat(expI);
    }

    const [yMin, yMax] = getDataBounds(yVals);
    const xMin = qModelPlot[0];
    const xMax = qModelPlot[qModelPlot.length - 1];

    const xLabel = (unitMode === "nm") ? "q (nm⁻¹)" : "q (Å⁻¹)";
    const yLabel = "I(q)";

    const mapping = drawAxesWithTicks(
      ctxI, W, H, xMin, xMax, yMin, yMax,
      xLabel, yLabel, false
    );
    const { xPix, yPix } = mapping;

    // model total: magenta
    ctxI.strokeStyle = "#ff00ff";
    ctxI.lineWidth = 2;
    ctxI.beginPath();
    for (let j = 0; j < qModelPlot.length; j++) {
      const xp = xPix(qModelPlot[j]);
      const yp = yPix(modelY[j]);
      if (j === 0) ctxI.moveTo(xp, yp);
      else ctxI.lineTo(xp, yp);
    }
    ctxI.stroke();

    // experimental points: white
    if (expQ && expI) {
      ctxI.fillStyle = "#ffffff";
      for (let i = 0; i < expQ.length; i++) {
        const xp = xPix(expQ[i]);
        const yp = yPix(expI[i]);
        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2*Math.PI);
        ctxI.fill();
      }
    }

    lastIqMapping = null; // disable log-drag interactions
  }
}

// ============================
// Combined redraw
// ============================
function fullRedrawWithNorm() {
  recomputePRandIq();
  normalizeArea();
  recomputePRandIq();
  drawP();
  drawIq();
  syncSlidersToActiveNode();
}

// ============================
// Mouse interaction on P(r)
// ============================
function dataFromPix_P(mx, my) {
  if (!lastPMapping) return null;
  const { xMin, xMax, yMin, yMax, left, right, top, bottom } = lastPMapping;
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
  if (!lastPMapping) return -1;
  const { xPix, yPix } = lastPMapping;
  const hitR2 = 10 * 10;
  let bestK = -1;
  let bestDist2 = Infinity;

  for (let k = 0; k < nodes.length; k++) {
    const nd = nodes[k];
    const rPeak = rPeakOf(nd);

    let idx = Math.round(rPeak / dr);
    idx = Math.max(0, Math.min(Nr - 1, idx));
    const pVal = P[idx];
    const xp_tot = xPix(rPeak * unitFactor);
    const yp_tot = yPix(pVal);
    let dx = mx - xp_tot;
    let dy = my - yp_tot;
    let d2 = dx*dx + dy*dy;
    if (d2 <= hitR2 && d2 < bestDist2) {
      bestDist2 = d2;
      bestK = k;
    }

    const A_k = nd.A;
    const xp_wave = xPix(rPeak * unitFactor);
    const yp_wave = yPix(A_k);
    dx = mx - xp_wave;
    dy = my - yp_wave;
    d2 = dx*dx + dy*dy;
    if (d2 <= hitR2 && d2 < bestDist2) {
      bestDist2 = d2;
      bestK = k;
    }
  }
  return bestK;
}

function selectedArray() {
  return Array.from(selectedNodes.values());
}

pCanvas.addEventListener("mousedown", (e) => {
  const rect = pCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  drawP();
  const hitNode = findHitNodeAt(mx, my);

  if (e.button === 0) {
    if (hitNode >= 0) {
      if (e.shiftKey) {
        if (selectedNodes.has(hitNode)) {
          selectedNodes.delete(hitNode);
        } else {
          selectedNodes.add(hitNode);
        }
      } else {
        selectedNodes = new Set([hitNode]);
      }
      if (!selectedNodes.size) selectedNodes.add(hitNode);
      activeNode = hitNode;
      syncSlidersToActiveNode();
      drawP();

      const mapping = dataFromPix_P(mx, my);
      if (!mapping) return;
      const { rFromPix, pFromPix } = mapping;
      const startR = rFromPix(mx);
      const startP = pFromPix(my);

      const perNode = [];
      for (const k of selectedNodes) {
        const nd = nodes[k];
        perNode.push({
          index: k,
          rPeak0: rPeakOf(nd),
          A0: nd.A
        });
      }
      draggingInfo = { startR, startP, perNode };
    } else {
      const mapping = dataFromPix_P(mx, my);
      if (!mapping) return;
      const { rFromPix, pFromPix } = mapping;
      const rPeakNew = rFromPix(mx);
      const pTarget  = pFromPix(my);

      const Dnew   = guiD;
      const anew   = guiAlpha;
      const dirNew = guiDir;

      const r0New = rPeakNew - dirNew * (Dnew / anew);
      const Anew  = pTarget;

      nodes.push({ r0: r0New, A: Anew, D: Dnew, alpha: anew, dir: dirNew });
      const idx = nodes.length - 1;
      selectedNodes = new Set([idx]);
      activeNode = idx;
      fullRedrawWithNorm();
    }
  }
});

pCanvas.addEventListener("dblclick", (e) => {
  const rect = pCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  drawP();
  const hitNode = findHitNodeAt(mx, my);
  if (hitNode >= 0) {
    nodes.splice(hitNode, 1);
    const newSet = new Set();
    for (const k of selectedNodes) {
      if (k === hitNode) continue;
      newSet.add(k > hitNode ? k - 1 : k);
    }
    selectedNodes = newSet;
    if (activeNode === hitNode) {
      const arr = selectedArray();
      activeNode = arr.length ? arr[arr.length - 1] : null;
    } else if (activeNode !== null && activeNode > hitNode) {
      activeNode--;
    }
    fullRedrawWithNorm();
  }
});

pCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

window.addEventListener("mousemove", (e) => {
  // drag peaks collectively
  if (draggingInfo && lastPMapping) {
    const rect = pCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const mapping = dataFromPix_P(mx, my);
    if (!mapping) return;
    const { rFromPix, pFromPix } = mapping;
    const currR = rFromPix(mx);
    const currP = pFromPix(my);

    const dR = currR - draggingInfo.startR;
    const dA = currP - draggingInfo.startP;

    for (const info of draggingInfo.perNode) {
      const nd = nodes[info.index];
      let rPeakNew = info.rPeak0 + dR;
      rPeakNew = Math.max(0, Math.min(rMax, rPeakNew));
      nd.r0 = rPeakNew - nd.dir * (nd.D / nd.alpha);
      nd.A  = info.A0 + dA;
    }

    recomputePRandIq();
    drawP();
    drawIq();
  }

  // drag model I(q) scale
  if (draggingIqModel && lastIqMapping) {
    const rect = iqCanvas.getBoundingClientRect();
    const my = e.clientY - rect.top;
    const logI_mouse = lastIqMapping.logIFromPix(my);
    IqScaleLog = logI_mouse - draggingIqModel.baseRefLogI;
    drawIq();
  }

  // drag experimental I(q) shift
  if (draggingIqExp && lastIqMapping) {
    const rect = iqCanvas.getBoundingClientRect();
    const my = e.clientY - rect.top;
    const logI_mouse = lastIqMapping.logIFromPix(my);
    const delta = logI_mouse - draggingIqExp.startLogI;
    expIqOffsetLog = draggingIqExp.startOffset + delta;
    drawIq();
  }
});

window.addEventListener("mouseup", () => {
  if (draggingInfo) {
    fullRedrawWithNorm();
    draggingInfo = null;
  }
  draggingIqModel = null;
  draggingIqExp   = null;
});

// ============================
// I(q) interaction: drag magenta OR white curve
// ============================
iqCanvas.addEventListener("mousedown", (e) => {
  if (iqPlotMode !== "log") return;
  if (!lastIqMapping) return;
  const rect = iqCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const { xPix, yPix, logQ, scaledLogI, expLogQScaled, expLogIScaled, logIFromPix } = lastIqMapping;
  const threshold = 10;
  let bestD2Model = Infinity, bestIdxModel = -1;
  let bestD2Exp   = Infinity, bestIdxExp   = -1;

  // model curve (magenta)
  const stepM = 5;
  for (let j = 0; j < logQ.length; j += stepM) {
    const xp = xPix(logQ[j]);
    const yp = yPix(scaledLogI[j]);
    const dx = mx - xp;
    const dy = my - yp;
    const d2 = dx*dx + dy*dy;
    if (d2 < bestD2Model) {
      bestD2Model = d2;
      bestIdxModel = j;
    }
  }

  // experimental curve (white), if present
  if (expLogQScaled && expLogIScaled) {
    const stepE = 1;
    for (let j = 0; j < expLogQScaled.length; j += stepE) {
      const xp = xPix(expLogQScaled[j]);
      const yp = yPix(expLogIScaled[j]);
      const dx = mx - xp;
      const dy = my - yp;
      const d2 = dx*dx + dy*dy;
      if (d2 < bestD2Exp) {
        bestD2Exp = d2;
        bestIdxExp = j;
      }
    }
  }

  const thr2 = threshold * threshold;

  if (bestIdxExp >= 0 && bestD2Exp <= thr2 &&
      bestD2Exp <= bestD2Model && expLogIScaled) {
    // grab experimental curve: store starting offset + starting mouse height
    const startLogI = logIFromPix(my);
    draggingIqExp = {
      startOffset: expIqOffsetLog,
      startLogI
    };
  } else if (bestIdxModel >= 0 && bestD2Model <= thr2) {
    // grab model curve
    const refLogI = scaledLogI[bestIdxModel];
    const baseRefLogI = refLogI - IqScaleLog;
    draggingIqModel = { baseRefLogI };
  }
});

// ============================
// Sliders & mirror checkbox
// ============================
const DSlider       = document.getElementById("DSlider");
const DValSpan      = document.getElementById("DVal");
const alphaSlider   = document.getElementById("alphaSlider");
const alphaValSpan  = document.getElementById("alphaVal");
const mirrorChk     = document.getElementById("mirrorChk");

function syncSlidersToActiveNode() {
  if (activeNode === null || activeNode < 0 || activeNode >= nodes.length) {
    DValSpan.textContent = guiD.toFixed(0);
    alphaValSpan.textContent = guiAlpha.toFixed(2);
    mirrorChk.checked = (guiDir < 0);
    return;
  }
  const nd = nodes[activeNode];
  guiD     = nd.D;
  guiAlpha = nd.alpha;
  guiDir   = nd.dir;

  DSlider.value = nd.D.toString();
  alphaSlider.value = nd.alpha.toFixed(2);
  mirrorChk.checked = (nd.dir < 0);

  DValSpan.textContent = nd.D.toFixed(0);
  alphaValSpan.textContent = nd.alpha.toFixed(2);
}

DSlider.addEventListener("input", () => {
  const newD = Math.round(parseFloat(DSlider.value));
  guiD = newD;
  const sel = selectedArray();
  const target = sel.length ? sel : (activeNode != null ? [activeNode] : []);
  for (const k of target) nodes[k].D = newD;
  fullRedrawWithNorm();
  DValSpan.textContent = newD.toString();
});

alphaSlider.addEventListener("input", () => {
  const newAlpha = parseFloat(alphaSlider.value);
  guiAlpha = newAlpha;
  const sel = selectedArray();
  const target = sel.length ? sel : (activeNode != null ? [activeNode] : []);
  for (const k of target) nodes[k].alpha = newAlpha;
  fullRedrawWithNorm();
  alphaValSpan.textContent = newAlpha.toFixed(2);
});

mirrorChk.addEventListener("change", () => {
  const dirNew = mirrorChk.checked ? -1 : +1;
  guiDir = dirNew;
  const sel = selectedArray();
  

// ============================
// Unit + I(q) scale controls
// ============================
const unitSelect    = document.getElementById("unitSelect");
const iqScaleSelect = document.getElementById("iqScaleSelect");

if (unitSelect) {
  unitSelect.addEventListener("change", () => {
    unitMode = (unitSelect.value === "A") ? "A" : "nm";
    drawP();
    drawIq();
  });
}

if (iqScaleSelect) {
  iqScaleSelect.addEventListener("change", () => {
    iqPlotMode = (iqScaleSelect.value === "linear") ? "linear" : "log";
    drawIq();
  });
}

const target = sel.length ? sel : (activeNode != null ? [activeNode] : []);
  if (target.length > 0) {
    for (const k of target) {
      const nd = nodes[k];
      const rPk = rPeakOf(nd);
      nd.dir = dirNew;
      nd.r0  = rPk - nd.dir * (nd.D / nd.alpha);
    }
    fullRedrawWithNorm();
  }
});

// ============================
// Keyboard: arrow keys act on SELECTED peaks
// ============================
window.addEventListener("keydown", (e) => {
  const sel = selectedArray();
  if (!sel.length) return;

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    const up = (e.key === "ArrowUp");
    const factor = up ? 1.1 : 1.0 / 1.1;
    for (const k of sel) {
      nodes[k].A *= factor;
    }
    fullRedrawWithNorm();
    e.preventDefault();
    return;
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    const dir = (e.key === "ArrowRight") ? +1 : -1;
    const step = 0.2;
    for (const k of sel) {
      const nd = nodes[k];
      let rpk = rPeakOf(nd) + dir * step;
      if (rpk < 0) rpk = 0;
      if (rpk > rMax) rpk = rMax;
      nd.r0 = rpk - nd.dir * (nd.D / nd.alpha);
    }
    fullRedrawWithNorm();
    e.preventDefault();
    return;
  }
});

// ============================
// Drag & Drop parsing (P(r) or I(q) tables)
// ============================
function parseTextTable(text) {
  const lines = text.split(/\r?\n/).filter(
    l => l.trim() && !l.trim().startsWith("#") && !l.trim().startsWith("//")
  );
  const rows = [];
  for (const line of lines) {
    const parts = line.trim().split(/[\s,;]+/);
    if (parts.length < 2) continue;
    const nums = parts.map(x => parseFloat(x)).filter(v => !Number.isNaN(v));
    if (nums.length >= 2) rows.push(nums);
  }
  return rows;
}

function handleDropPr(text) {
  const rows = parseTextTable(text);
  if (!rows.length) return;
  const r = [], p = [], err = [];
  let anyErr = false;
  for (const row of rows) {
    r.push(row[0]);
    p.push(row[1]);
    if (row.length >= 3) {
      err.push(row[2]); anyErr = true;
    } else {
      err.push(null);
    }
  }
  expPrData = { r, P: p, err: anyErr ? err : null };
  drawP();
}

function handleDropIq(text) {
  const rows = parseTextTable(text);
  if (!rows.length) return;
  const q = [], I = [], err = [];
  let anyErr = false;
  const epsI = 1e-14;
  for (const row of rows) {
    q.push(row[0]);
    I.push(row[1]);
    if (row.length >= 3) {
      err.push(row[2]); anyErr = true;
    } else {
      err.push(null);
    }
  }
  expIqData = { q, I, err: anyErr ? err : null };

  const logQ = q.map(v => Math.log10(Math.max(v, 1e-12)));
  const logI  = I.map(v => Math.log10(Math.max(v, epsI)));
  const logIlo = [];
  const logIhi = [];
  for (let i = 0; i < I.length; i++) {
    const Ii = Math.max(I[i], epsI);
    const ei = err[i];
    if (ei != null && Number.isFinite(ei)) {
      const Ilo = Math.max(Ii - ei, epsI);
      const Ihi = Math.max(Ii + ei, epsI);
      logIlo.push(Math.log10(Ilo));
      logIhi.push(Math.log10(Ihi));
    } else {
      logIlo.push(Math.log10(Ii));
      logIhi.push(Math.log10(Ii));
    }
  }
  expIqLog = { logQ, logI, logIlo, logIhi };
  expIqOffsetLog = 0.0;   // reset vertical shift
  drawIq();
}

function setupDragAndDrop() {
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  ["dragenter", "dragover", "dragleave", "drop"].forEach(ev => {
    pCanvas.addEventListener(ev, preventDefaults, false);
    iqCanvas.addEventListener(ev, preventDefaults, false);
  });

  pCanvas.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleDropPr(String(evt.target.result || ""));
    };
    reader.readAsText(file);
  });

  iqCanvas.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleDropIq(String(evt.target.result || ""));
    };
    reader.readAsText(file);
  });
}

// ============================
// PDB -> CA positions -> distances -> P(r), I(q)
// ============================
function parsePDBCaResidues(text) {
  const residues = [];
  const seen = new Set();
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith("ATOM")) continue;
    const atomName = line.slice(12,16).trim();
    if (atomName !== "CA") continue;
    const chain = line[21];
    const resSeq = parseInt(line.slice(22,26), 10);
    const key = chain + ":" + resSeq;
    if (seen.has(key)) continue;
    seen.add(key);
    const x = parseFloat(line.slice(30,38));
    const y = parseFloat(line.slice(38,46));
    const z = parseFloat(line.slice(46,54));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    residues.push({ x, y, z, chain, resSeq });
  }
  return residues;
}

function computeDistances(residues) {
  const dists = [];
  let maxR = 0.0;
  const n = residues.length;
  for (let i = 0; i < n; i++) {
    const xi = residues[i].x;
    const yi = residues[i].y;
    const zi = residues[i].z;
    for (let j = i + 1; j < n; j++) {
      const dx = xi - residues[j].x;
      const dy = yi - residues[j].y;
      const dz = zi - residues[j].z;
      const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (!Number.isFinite(r)) continue;
      dists.push(r);
      if (r > maxR) maxR = r;
    }
  }
  return { dists, maxR };
}

function makeHistogram(dists) {
  const hist = new Array(Nr).fill(0.0);

  // rohes Histogramm
  for (const r of dists) {
    if (r < 0 || r > rMax) continue;
    const idx = Math.floor(r / dr);
    if (idx >= 0 && idx < Nr) hist[idx] += 1.0;
  }

  // Normierung: ∫ P(r) dr = 1
  let area = 0.0;
  for (let i = 0; i < Nr; i++) {
    area += hist[i] * dr;
  }
  if (area > 0) {
    const scale = 1.0 / area;
    for (let i = 0; i < Nr; i++) {
      hist[i] *= scale;
    }
  }

  return hist;
}

function computeIqFromDistances(dists) {
  const I = new Array(qGrid.length).fill(0.0);
  const eps = 1e-12;
  for (let j = 0; j < qGrid.length; j++) {
    const q = qGrid[j];
    let sum = 0.0;
    if (q < eps) {
      sum = dists.length;
    } else {
      for (const r of dists) {
        const qr = q * r;
        const s = Math.sin(qr) / (qr || eps);
        sum += s;
      }
    }
    I[j] = sum;
  }
  return I;
}

function setExpFromPDB(residues) {
  const { dists, maxR } = computeDistances(residues);
  // P(r) as histogram (not normalized, this is fine for morphology)
  const prHist = makeHistogram(dists);

  const rArr = rGrid.slice();
  const pArr = prHist.slice();
  const errPr = new Array(pArr.length).fill(null);

  expPrData = { r: rArr, P: pArr, err: errPr };

  // I(q) from Debye
  const I = computeIqFromDistances(dists);
  const qArr = qGrid.slice();
  const errIq = new Array(qArr.length).fill(null);

  expIqData = { q: qArr, I: I, err: errIq };

  // precompute logs for plotting as "experimental"
  const epsI = 1e-14;
  const logQ = qArr.map(v => Math.log10(Math.max(v, 1e-12)));
  const logI = I.map(v => Math.log10(Math.max(v, epsI)));
  const logIlo = logI.slice();
  const logIhi = logI.slice();
  expIqLog = { logQ, logI, logIlo, logIhi };
  expIqOffsetLog = 0.0;

  drawP();
  drawIq();
}

async function loadDefaultPDB() {
  try {
    const resp = await fetch("3V03.pdb");
    if (!resp.ok) {
      console.warn("Could not fetch 3V03.pdb:", resp.status);
      return;
    }
    const text = await resp.text();
    const residues = parsePDBCaResidues(text);
    if (!residues.length) {
      console.warn("No CA residues found in 3V03.pdb");
      return;
    }
    console.log("Loaded 3V03.pdb; CA residues:", residues.length);
    setExpFromPDB(residues);
  } catch (err) {
    console.error("Error loading default PDB:", err);
  }
}

// ============================
// Animation + init
// ============================
function animate() {
  pulsePhase += 0.1;
  drawP();
  drawIq();
  requestAnimationFrame(animate);
}

// entry point
(function initViewer() {
  recomputePRandIq();
  normalizeArea();
  recomputePRandIq();
  setupDragAndDrop();
  drawP();
  drawIq();
  animate();
  // auto-load local 3V03.pdb if present
  loadDefaultPDB();
})();