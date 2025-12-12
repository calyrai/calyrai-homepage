#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="js/pr_iq_viewer.js"
DSTDIR="js/pr"
TS="$(date +%Y%m%d_%H%M%S)"
BACKUP="backup_split_pr_${TS}"

if [[ ! -f "$SRC" ]]; then
  echo "❌ Not found: $SRC"
  exit 1
fi

mkdir -p "$BACKUP/js" "$DSTDIR"

echo "🧷 Backup -> $BACKUP/$SRC"
mkdir -p "$BACKUP/$(dirname "$SRC")"
cp -a "$SRC" "$BACKUP/$SRC"

# Also backup existing split folder if present
if [[ -d "$DSTDIR" ]]; then
  mkdir -p "$BACKUP/$DSTDIR"
  cp -a "$DSTDIR" "$BACKUP/$DSTDIR" 2>/dev/null || true
fi

# ----------------------------
# Write split modules
# ----------------------------

cat > "$DSTDIR/state.js" <<'EOF'
/* js/pr/state.js
 * Central state + constants
 */

export const state = {
  // Base grids are in "internal units" (we keep your original numeric values)
  rMax: 80.0,
  Nr:   600,
  qMin: 0.005,
  qMax: 0.4,
  Nq:   300,

  // arrays (filled in init)
  rGrid: [],
  qGrid: [],

  P: [],
  Iq: [],
  P_nodes: [],
  Iq_nodes: [],

  // experimental data
  expPrData: null,   // { r:[], P:[], err:[]|null }
  expIqData: null,   // { q:[], I:[], err:[]|null }
  expIqLog:  null,   // { logQ, logI, logIlo, logIhi }
  expIqOffsetLog: 0.0,

  // model scale
  IqScaleLog: 0.0,

  // GUI defaults
  guiD: 2.0,
  guiAlpha: 0.70,
  guiDir: +1,

  // unit + plot modes
  unitMode: "nm",     // "nm" or "A"
  iqPlotMode: "log",  // "log" or "linear"

  // nodes
  nodes: [],

  // selection / interaction
  lastPMapping: null,
  lastIqMapping: null,
  selectedNodes: new Set(),
  activeNode: null,
  pulsePhase: 0.0,

  draggingInfo: null,
  draggingIqModel: null,
  draggingIqExp: null,
};

export function dr() {
  return state.rMax / (state.Nr - 1);
}

export function unitFactorR() {
  // display factor for r: Å = 10 * nm
  return (state.unitMode === "nm") ? 1.0 : 10.0;
}

export function unitFactorQ() {
  // display factor for q: Å⁻¹ = 0.1 * nm⁻¹
  return (state.unitMode === "nm") ? 1.0 : 0.1;
}
EOF

cat > "$DSTDIR/math_basis.js" <<'EOF'
/* js/pr/math_basis.js
 * Basis functions + recompute P(r), I(q)
 */
import { state, dr } from "./state.js";

export function logspace(a, b, n) {
  const out = [];
  const step = (b - a) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) out.push(Math.pow(10, a + step * i));
  return out;
}

export function rPeakOf(nd) {
  return nd.r0 + nd.dir * (nd.D / nd.alpha);
}

export function phiNormAt(r, r0, Dk, alphaK, dirK) {
  let t = dirK > 0 ? (r - r0) : (r0 - r);
  if (t <= 0) return 0.0;
  const phi = Math.pow(t, Dk) * Math.exp(-alphaK * t);
  const t_peak = Dk / alphaK;
  const phi_peak = Math.pow(t_peak, Dk) * Math.exp(-alphaK * t_peak);
  const norm = (phi_peak > 0) ? phi_peak : 1.0;
  return phi / norm; // φ(r_peak)=1
}

export function areaOfP() {
  const d = dr();
  let area = 0.0;
  for (let i = 0; i < state.Nr; i++) area += state.P[i] * d;
  return area;
}

export function normalizeArea() {
  const area = areaOfP();
  const eps = 1e-12;
  if (!Number.isFinite(area) || Math.abs(area) < eps) return;
  const scale = 1.0 / area;
  for (const nd of state.nodes) nd.A *= scale;
}

export function recomputePRandIq() {
  const d = dr();
  state.P.fill(0.0);
  state.Iq.fill(0.0);

  state.P_nodes = state.nodes.map(() => new Array(state.Nr).fill(0.0));
  state.Iq_nodes = state.nodes.map(() => new Array(state.qGrid.length).fill(0.0));

  // P(r)
  for (let k = 0; k < state.nodes.length; k++) {
    const { r0, A, D: Dk, alpha: ak, dir: dirK } = state.nodes[k];
    const Pk = state.P_nodes[k];
    for (let i = 0; i < state.Nr; i++) {
      const r = state.rGrid[i];
      const phi = phiNormAt(r, r0, Dk, ak, dirK);
      const val = A * phi;
      Pk[i] = val;
      state.P[i] += val;
    }
  }
  if (state.Nr > 0) state.P[0] = 0.0;

  // I(q) from P(r)
  for (let k = 0; k < state.nodes.length; k++) {
    const Pk = state.P_nodes[k];
    const Ik = state.Iq_nodes[k];
    for (let j = 0; j < state.qGrid.length; j++) {
      const q = state.qGrid[j];
      let sum = 0.0;
      if (q < 1e-10) {
        for (let i = 0; i < state.Nr; i++) sum += Pk[i] * d;
      } else {
        for (let i = 0; i < state.Nr; i++) {
          const r = state.rGrid[i];
          const qr = q * r;
          const j0 = (qr === 0) ? 1.0 : Math.sin(qr) / qr;
          sum += Pk[i] * j0 * d;
        }
      }
      Ik[j] = sum;
      state.Iq[j] += sum;
    }
  }
}
EOF

cat > "$DSTDIR/plot_axes.js" <<'EOF'
/* js/pr/plot_axes.js
 * Axes + bounds
 */

export function getDataBounds(arr) {
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

export function drawAxesWithTicks(ctx, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, logX=false) {
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
    let label = logX ? ("10^" + xVal.toFixed(1)) : xVal.toFixed(2);
    ctx.fillText(label, xp - 14, bottom + 14);
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
    ctx.fillText(yVal.toFixed(2), left - 48, yp + 3);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "11px system-ui";
  ctx.fillText(xLabel, (left + right)/2 - 30, H - 5);
  ctx.save();
  ctx.translate(15, (top + bottom)/2 + 10);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  return { xPix, yPix, left, right, top, bottom, xMin, xMax, yMin, yMax };
}
EOF

cat > "$DSTDIR/plot_pr.js" <<'EOF'
/* js/pr/plot_pr.js
 * drawP()
 */
import { state, unitFactorR, dr } from "./state.js";
import { drawAxesWithTicks, getDataBounds } from "./plot_axes.js";
import { rPeakOf } from "./math_basis.js";

const nodeColors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628"];

export function drawP(ctxP, pCanvas) {
  const W = pCanvas.width;
  const H = pCanvas.height;
  ctxP.clearRect(0, 0, W, H);

  const uf = unitFactorR();
  const xMin = 0, xMax = state.rMax * uf;

  if (state.Nr > 0) state.P[0] = 0.0;

  let yVals = state.P.slice();
  if (state.expPrData) {
    yVals = yVals.concat(state.expPrData.P);
    if (state.expPrData.err) {
      for (let i = 0; i < state.expPrData.P.length; i++) {
        yVals.push(state.expPrData.P[i] + state.expPrData.err[i]);
        yVals.push(state.expPrData.P[i] - state.expPrData.err[i]);
      }
    }
  }
  const [rawMin, rawMax] = getDataBounds(yVals);
  const mAbs = Math.max(Math.abs(rawMin), Math.abs(rawMax));
  const yMin = -mAbs || -1.0;
  const yMax = +mAbs || +1.0;

  const mapping = drawAxesWithTicks(
    ctxP, W, H, xMin, xMax, yMin, yMax,
    (state.unitMode === "nm") ? "r (nm)" : "r (Å)", "P(r)"
  );
  const { xPix, yPix } = mapping;

  // zero line
  ctxP.strokeStyle = "#333";
  ctxP.lineWidth = 1;
  ctxP.beginPath();
  const y0 = yPix(0.0);
  ctxP.moveTo(60, y0);
  ctxP.lineTo(W-30, y0);
  ctxP.stroke();

  // components
  for (let k = 0; k < state.nodes.length; k++) {
    const nd  = state.nodes[k];
    const col = nodeColors[k % nodeColors.length];
    const Pk  = state.P_nodes[k];

    ctxP.strokeStyle = col;
    ctxP.lineWidth = 1;
    ctxP.setLineDash(nd.A < 0 ? [2, 4] : []);

    ctxP.beginPath();
    for (let i = 0; i < state.Nr; i++) {
      const xp = xPix(state.rGrid[i] * uf);
      const yp = yPix(Pk[i]);
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
  for (let i = 0; i < state.Nr; i++) {
    const xp = xPix(state.rGrid[i] * uf);
    const yp = yPix(state.P[i]);
    if (i === 0) ctxP.moveTo(xp, yp);
    else ctxP.lineTo(xp, yp);
  }
  ctxP.stroke();

  // experimental P(r): white dots
  if (state.expPrData) {
    ctxP.fillStyle = "#ffffff";
    for (let i = 0; i < state.expPrData.r.length; i++) {
      const xp = xPix(state.expPrData.r[i] * uf);
      const yp = yPix(state.expPrData.P[i]);
      ctxP.beginPath();
      ctxP.arc(xp, yp, 2, 0, 2*Math.PI);
      ctxP.fill();
    }
  }

  // nodes markers
  for (let k = 0; k < state.nodes.length; k++) {
    const nd  = state.nodes[k];
    const col = nodeColors[k % nodeColors.length];
    const rPeak = rPeakOf(nd);

    const xp_wave = xPix(rPeak * uf);
    const yp_wave = yPix(nd.A);

    const isSelected = state.selectedNodes.has(k);
    const pulse = isSelected ? (1.5 * Math.sin(state.pulsePhase) + 2) : 0;

    ctxP.fillStyle = col;
    ctxP.beginPath();
    ctxP.arc(xp_wave, yp_wave, 4 + pulse, 0, 2*Math.PI);
    ctxP.fill();

    // dot on total curve at rPeak
    let idx = Math.round(rPeak / dr());
    idx = Math.max(0, Math.min(state.Nr - 1, idx));
    const pVal = state.P[idx];
    const yp_tot = yPix(pVal);

    ctxP.beginPath();
    ctxP.arc(xp_wave, yp_tot, 6 + (isSelected ? pulse : 0), 0, 2*Math.PI);
    ctxP.fill();

    if (isSelected) {
      ctxP.strokeStyle = "#ffffff";
      ctxP.lineWidth = 2;
      ctxP.stroke();
    }
  }

  state.lastPMapping = { ...mapping, xPix, yPix, unitFactorR: uf };
  return state.lastPMapping;
}
EOF

cat > "$DSTDIR/plot_iq.js" <<'EOF'
/* js/pr/plot_iq.js
 * drawIq() with log/linear + unit conversion
 */
import { state, unitFactorQ } from "./state.js";
import { drawAxesWithTicks, getDataBounds } from "./plot_axes.js";

const nodeColors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628"];

export function drawIq(ctxI, iqCanvas) {
  const W = iqCanvas.width;
  const H = iqCanvas.height;
  ctxI.clearRect(0, 0, W, H);

  const ufQ = unitFactorQ();
  const qModelPlot = state.qGrid.map(q => q * ufQ);
  const eps = 1e-14;

  if (state.iqPlotMode === "log") {
    const logQmodel = qModelPlot.map(q => Math.log10(Math.max(q, eps)));
    const baseLogImodel = state.Iq.map(I => Math.log10(Math.max(Math.abs(I), eps)));
    const scaledLogImodel = baseLogImodel.map(li => li + state.IqScaleLog);

    let xMin, xMax, yMin, yMax, yVals;
    if (state.expIqLog) {
      const logShift = Math.log10(ufQ);
      const logQexpDisplay = state.expIqLog.logQ.map(lq => lq + logShift);
      xMin = Math.min(...logQexpDisplay);
      xMax = Math.max(...logQexpDisplay);

      yVals = [];
      for (let i = 0; i < state.expIqLog.logI.length; i++) {
        yVals.push(state.expIqLog.logI[i]   + state.expIqOffsetLog);
        yVals.push(state.expIqLog.logIlo[i] + state.expIqOffsetLog);
        yVals.push(state.expIqLog.logIhi[i] + state.expIqOffsetLog);
      }
      [yMin, yMax] = getDataBounds(yVals);
    } else {
      xMin = logQmodel[0];
      xMax = logQmodel[logQmodel.length - 1];
      [yMin, yMax] = getDataBounds(scaledLogImodel);
    }

    const xLabel = (state.unitMode === "nm") ? "log₁₀ q (nm⁻¹)" : "log₁₀ q (Å⁻¹)";
    const yLabel = "log₁₀ I(q)";

    const mapping = drawAxesWithTicks(ctxI, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, true);
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

    // components
    for (let k = 0; k < state.nodes.length; k++) {
      const nd  = state.nodes[k];
      const col = nodeColors[k % nodeColors.length];
      const Ik = state.Iq_nodes[k];

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

    // experimental: white dots
    let expLogQScaled = null;
    let expLogIScaled = null;

    if (state.expIqLog) {
      const n = state.expIqLog.logQ.length;
      expLogQScaled = new Array(n);
      expLogIScaled = new Array(n);

      const logShift = Math.log10(ufQ);

      ctxI.fillStyle = "#ffffff";
      for (let i = 0; i < n; i++) {
        const lq = state.expIqLog.logQ[i] + logShift;
        const li = state.expIqLog.logI[i] + state.expIqOffsetLog;

        expLogQScaled[i] = lq;
        expLogIScaled[i] = li;

        const xp = xPix(lq);
        const yp = yPix(li);
        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2*Math.PI);
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
    // linear mode
    const modelScale = Math.pow(10, state.IqScaleLog);
    const modelY = state.Iq.map(v => v * modelScale);

    let yVals = modelY.slice();
    let expQ = null, expI = null;

    if (state.expIqData) {
      const expScale = Math.pow(10, state.expIqOffsetLog);
      expQ = state.expIqData.q.map(q => q * ufQ);
      expI = state.expIqData.I.map(v => v * expScale);
      yVals = yVals.concat(expI);
    }

    const [yMin, yMax] = getDataBounds(yVals);
    const xMin = qModelPlot[0];
    const xMax = qModelPlot[qModelPlot.length - 1];

    const xLabel = (state.unitMode === "nm") ? "q (nm⁻¹)" : "q (Å⁻¹)";
    const yLabel = "I(q)";

    const mapping = drawAxesWithTicks(ctxI, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, false);

    // model line
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

    // exp dots
    if (expQ && expI) {
      ctxI.fillStyle = "#ffffff";
      for (let i = 0; i < expQ.length; i++) {
        const xp = mapping.xPix(expQ[i]);
        const yp = mapping.yPix(expI[i]);
        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2*Math.PI);
        ctxI.fill();
      }
    }

    state.lastIqMapping = null; // disable log drag interactions
  }
}
EOF

cat > "$DSTDIR/io_drop.js" <<'EOF'
/* js/pr/io_drop.js
 * Drag&Drop for P(r) and I(q)
 */
import { state } from "./state.js";
import { drawP } from "./plot_pr.js";
import { drawIq } from "./plot_iq.js";

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

export function handleDropPr(text) {
  const rows = parseTextTable(text);
  if (!rows.length) return;
  const r = [], p = [], err = [];
  let anyErr = false;
  for (const row of rows) {
    r.push(row[0]);
    p.push(row[1]);
    if (row.length >= 3) { err.push(row[2]); anyErr = true; }
    else err.push(null);
  }
  state.expPrData = { r, P: p, err: anyErr ? err : null };
}

export function handleDropIq(text) {
  const rows = parseTextTable(text);
  if (!rows.length) return;
  const q = [], I = [], err = [];
  let anyErr = false;
  const epsI = 1e-14;
  for (const row of rows) {
    q.push(row[0]);
    I.push(row[1]);
    if (row.length >= 3) { err.push(row[2]); anyErr = true; }
    else err.push(null);
  }
  state.expIqData = { q, I, err: anyErr ? err : null };

  const logQ = q.map(v => Math.log10(Math.max(v, 1e-12)));
  const logI = I.map(v => Math.log10(Math.max(v, epsI)));
  const logIlo = [];
  const logIhi = [];
  for (let i = 0; i < I.length; i++) {
    const Ii = Math.max(I[i], epsI);
    const ei = err[i];
    if (ei != null && Number.isFinite(ei)) {
      logIlo.push(Math.log10(Math.max(Ii - ei, epsI)));
      logIhi.push(Math.log10(Math.max(Ii + ei, epsI)));
    } else {
      logIlo.push(Math.log10(Ii));
      logIhi.push(Math.log10(Ii));
    }
  }
  state.expIqLog = { logQ, logI, logIlo, logIhi };
  state.expIqOffsetLog = 0.0;
}

export function setupDragAndDrop(pCanvas, iqCanvas, ctxP, ctxI) {
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
    if (!dt?.files?.length) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleDropPr(String(evt.target.result || ""));
      drawP(ctxP, pCanvas);
      drawIq(ctxI, iqCanvas);
    };
    reader.readAsText(dt.files[0]);
  });

  iqCanvas.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      handleDropIq(String(evt.target.result || ""));
      drawP(ctxP, pCanvas);
      drawIq(ctxI, iqCanvas);
    };
    reader.readAsText(dt.files[0]);
  });
}
EOF

cat > "$DSTDIR/pdb_to_priq.js" <<'EOF'
/* js/pr/pdb_to_priq.js
 * PDB -> CA distances -> P(r) + Debye I(q)
 */
import { state, dr } from "./state.js";

export function parsePDBCaResidues(text) {
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
  const n = residues.length;
  for (let i = 0; i < n; i++) {
    const { x:xi, y:yi, z:zi } = residues[i];
    for (let j = i + 1; j < n; j++) {
      const dx = xi - residues[j].x;
      const dy = yi - residues[j].y;
      const dz = zi - residues[j].z;
      const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (Number.isFinite(r)) dists.push(r);
    }
  }
  return dists;
}

function makeHistogram(dists) {
  const hist = new Array(state.Nr).fill(0.0);
  const d = dr();

  for (const r of dists) {
    if (r < 0 || r > state.rMax) continue;
    const idx = Math.floor(r / d);
    if (idx >= 0 && idx < state.Nr) hist[idx] += 1.0;
  }

  // normalize: ∫ P(r) dr = 1
  let area = 0.0;
  for (let i = 0; i < state.Nr; i++) area += hist[i] * d;
  if (area > 0) {
    const s = 1.0 / area;
    for (let i = 0; i < state.Nr; i++) hist[i] *= s;
  }
  return hist;
}

function computeIqFromDistances(dists) {
  const I = new Array(state.qGrid.length).fill(0.0);
  const eps = 1e-12;

  for (let j = 0; j < state.qGrid.length; j++) {
    const q = state.qGrid[j];
    let sum = 0.0;
    if (q < eps) sum = dists.length;
    else {
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

export function setExpFromPDB(residues) {
  const dists = computeDistances(residues);

  const prHist = makeHistogram(dists);
  state.expPrData = { r: state.rGrid.slice(), P: prHist.slice(), err: null };

  const I = computeIqFromDistances(dists);
  state.expIqData = { q: state.qGrid.slice(), I: I, err: null };

  // log cache
  const epsI = 1e-14;
  const logQ = state.expIqData.q.map(v => Math.log10(Math.max(v, 1e-12)));
  const logI = state.expIqData.I.map(v => Math.log10(Math.max(v, epsI)));
  state.expIqLog = { logQ, logI, logIlo: logI.slice(), logIhi: logI.slice() };
  state.expIqOffsetLog = 0.0;
}

export async function loadDefaultPDB(url="3V03.pdb") {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return;
    const text = await resp.text();
    const residues = parsePDBCaResidues(text);
    if (!residues.length) return;
    setExpFromPDB(residues);
  } catch {}
}
EOF

cat > "$DSTDIR/ui_controls.js" <<'EOF'
/* js/pr/ui_controls.js
 * Bind sliders + unit/log controls (FIXED placement)
 */
import { state } from "./state.js";
import { rPeakOf } from "./math_basis.js";
import { fullRedrawWithNorm } from "./viewer_core.js";

export function syncSlidersToActiveNode() {
  const DSlider      = document.getElementById("DSlider");
  const DValSpan     = document.getElementById("DVal");
  const alphaSlider  = document.getElementById("alphaSlider");
  const alphaValSpan = document.getElementById("alphaVal");
  const mirrorChk    = document.getElementById("mirrorChk");

  if (state.activeNode == null || state.activeNode < 0 || state.activeNode >= state.nodes.length) {
    if (DValSpan) DValSpan.textContent = state.guiD.toFixed(0);
    if (alphaValSpan) alphaValSpan.textContent = state.guiAlpha.toFixed(2);
    if (mirrorChk) mirrorChk.checked = (state.guiDir < 0);
    return;
  }

  const nd = state.nodes[state.activeNode];
  state.guiD = nd.D;
  state.guiAlpha = nd.alpha;
  state.guiDir = nd.dir;

  if (DSlider) DSlider.value = String(nd.D);
  if (alphaSlider) alphaSlider.value = nd.alpha.toFixed(2);
  if (mirrorChk) mirrorChk.checked = (nd.dir < 0);

  if (DValSpan) DValSpan.textContent = nd.D.toFixed(0);
  if (alphaValSpan) alphaValSpan.textContent = nd.alpha.toFixed(2);
}

export function bindControlsOnce() {
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
      state.guiD = newD;

      const target = state.selectedNodes.size ? Array.from(state.selectedNodes) :
        (state.activeNode != null ? [state.activeNode] : []);

      for (const k of target) state.nodes[k].D = newD;
      if (DValSpan) DValSpan.textContent = String(newD);
      fullRedrawWithNorm();
    });
  }

  if (alphaSlider) {
    alphaSlider.addEventListener("input", () => {
      const newAlpha = parseFloat(alphaSlider.value);
      state.guiAlpha = newAlpha;

      const target = state.selectedNodes.size ? Array.from(state.selectedNodes) :
        (state.activeNode != null ? [state.activeNode] : []);

      for (const k of target) state.nodes[k].alpha = newAlpha;
      if (alphaValSpan) alphaValSpan.textContent = newAlpha.toFixed(2);
      fullRedrawWithNorm();
    });
  }

  if (mirrorChk) {
    mirrorChk.addEventListener("change", () => {
      const dirNew = mirrorChk.checked ? -1 : +1;
      state.guiDir = dirNew;

      const target = state.selectedNodes.size ? Array.from(state.selectedNodes) :
        (state.activeNode != null ? [state.activeNode] : []);

      for (const k of target) {
        const nd = state.nodes[k];
        const rPk = rPeakOf(nd);
        nd.dir = dirNew;
        nd.r0  = rPk - nd.dir * (nd.D / nd.alpha);
      }
      fullRedrawWithNorm();
    });
  }

  // Optional selects (if present in HTML)
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
EOF

cat > "$DSTDIR/viewer_core.js" <<'EOF'
/* js/pr/viewer_core.js
 * Central redraw orchestration
 */
import { state } from "./state.js";
import { recomputePRandIq, normalizeArea } from "./math_basis.js";
import { drawP } from "./plot_pr.js";
import { drawIq } from "./plot_iq.js";
import { syncSlidersToActiveNode } from "./ui_controls.js";

let ctxP=null, ctxI=null, pCanvas=null, iqCanvas=null;

export function setContexts(_ctxP,_pCanvas,_ctxI,_iqCanvas){
  ctxP=_ctxP; pCanvas=_pCanvas;
  ctxI=_ctxI; iqCanvas=_iqCanvas;
}

export function fullRedrawWithNorm() {
  recomputePRandIq();
  normalizeArea();
  recomputePRandIq();
  if (ctxP && pCanvas) drawP(ctxP, pCanvas);
  if (ctxI && iqCanvas) drawIq(ctxI, iqCanvas);
  syncSlidersToActiveNode();
}
EOF

cat > "$DSTDIR/interactions_pr.js" <<'EOF'
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
EOF

cat > "$DSTDIR/interactions_iq.js" <<'EOF'
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
EOF

cat > "$DSTDIR/main.js" <<'EOF'
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
EOF

# ----------------------------
# Replace original file with loader (so index.html stays unchanged)
# ----------------------------
cat > "$SRC" <<'EOF'
/* js/pr_iq_viewer.js
 * Loader wrapper: keeps existing <script src="js/pr_iq_viewer.js"></script> working.
 * Real code lives in js/pr/main.js (ES modules).
 */
(async function () {
  try {
    const mod = await import("./pr/main.js");
    mod.initPRIQViewer();
  } catch (e) {
    console.error("Failed to load PR/IQ modules:", e);
  }
})();
EOF

# ----------------------------
# Revert script
# ----------------------------
cat > "$BACKUP/revert.sh" <<EOF
#!/usr/bin/env bash
set -euo pipefail
echo "↩️  Reverting split from: $BACKUP"

cp -a "$BACKUP/$SRC" "$SRC"

if [[ -d "$BACKUP/$DSTDIR" ]]; then
  rm -rf "$DSTDIR"
  cp -a "$BACKUP/$DSTDIR" "$DSTDIR"
else
  rm -rf "$DSTDIR"
fi

echo "✅ Reverted."
EOF
chmod +x "$BACKUP/revert.sh"

echo "✅ Split done."
echo "Next: open the page, check console for errors."
echo "To revert: bash $BACKUP/revert.sh"
