/* js/pr/plot_pr.js
 * drawP()
 * INTERNAL: r in nm
 * DISPLAY: r scaled by unitFactorR()
 */
import { state, unitFactorR, dr } from "./state.js";
import { drawAxesWithTicks, getDataBounds } from "./plot_axes.js";
import { rPeakOf } from "./math_basis.js";

const nodeColors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628"];

export function drawP(ctxP, pCanvas) {
  const W = pCanvas.width;
  const H = pCanvas.height;
  ctxP.clearRect(0, 0, W, H);

  const uf = unitFactorR();            // nm -> Å display factor (10)
  const xMin = 0;
  const xMax = state.rMax * uf;

  if (state.Nr > 0 && state.P.length) state.P[0] = 0.0;

  // y-bounds: include model + exp (and exp err if present)
  let yVals = state.P.slice();

  if (state.expPrData && state.expPrData.P) {
    yVals = yVals.concat(state.expPrData.P);

    if (state.expPrData.err) {
      for (let i = 0; i < state.expPrData.P.length; i++) {
        const e = state.expPrData.err[i];
        if (e == null || !Number.isFinite(e)) continue;
        yVals.push(state.expPrData.P[i] + e);
        yVals.push(state.expPrData.P[i] - e);
      }
    }
  }

  const [rawMin, rawMax] = getDataBounds(yVals);
  const mAbs = Math.max(Math.abs(rawMin), Math.abs(rawMax));
  const yMin = Number.isFinite(mAbs) && mAbs > 0 ? -mAbs : -1.0;
  const yMax = Number.isFinite(mAbs) && mAbs > 0 ? +mAbs : +1.0;

  const mapping = drawAxesWithTicks(
    ctxP, W, H, xMin, xMax, yMin, yMax,
    (state.unitMode === "nm") ? "r (nm)" : "r (Å)",
    "P(r)"
  );

  const { xPix, yPix } = mapping;

  // zero line
  ctxP.strokeStyle = "#333";
  ctxP.lineWidth = 1;
  ctxP.beginPath();
  const y0 = yPix(0.0);
  ctxP.moveTo(60, y0);
  ctxP.lineTo(W - 30, y0);
  ctxP.stroke();

  // components
  for (let k = 0; k < state.nodes.length; k++) {
    const nd = state.nodes[k];
    const col = nodeColors[k % nodeColors.length];
    const Pk = state.P_nodes[k];

    if (!Pk) continue;

    ctxP.strokeStyle = col;
    ctxP.lineWidth = 1;
    ctxP.setLineDash(nd.A < 0 ? [2, 4] : []);

    ctxP.beginPath();
    for (let i = 0; i < state.Nr; i++) {
      const rDisp = state.rGrid[i] * uf;     // INTERNAL nm -> DISPLAY
      const xp = xPix(rDisp);
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
    const rDisp = state.rGrid[i] * uf;
    const xp = xPix(rDisp);
    const yp = yPix(state.P[i]);
    if (i === 0) ctxP.moveTo(xp, yp);
    else ctxP.lineTo(xp, yp);
  }
  ctxP.stroke();

  // experimental P(r): white dots (+ optional errorbars)
  if (state.expPrData && state.expPrData.r && state.expPrData.P) {
    ctxP.fillStyle = "#ffffff";
    ctxP.strokeStyle = "#ffffff";
    ctxP.lineWidth = 1;

    for (let i = 0; i < state.expPrData.r.length; i++) {
      const rNm = state.expPrData.r[i];      // INTERNAL nm
      const p = state.expPrData.P[i];
      if (!Number.isFinite(rNm) || !Number.isFinite(p)) continue;

      const xp = xPix(rNm * uf);
      const yp = yPix(p);

      // error bar if present
      if (state.expPrData.err && state.expPrData.err[i] != null && Number.isFinite(state.expPrData.err[i])) {
        const e = state.expPrData.err[i];
        const ypLo = yPix(p - e);
        const ypHi = yPix(p + e);
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
      ctxP.arc(xp, yp, 2, 0, 2 * Math.PI);
      ctxP.fill();
    }
  }

  // node markers
  for (let k = 0; k < state.nodes.length; k++) {
    const nd = state.nodes[k];
    const col = nodeColors[k % nodeColors.length];
    const rPeakNm = rPeakOf(nd);            // INTERNAL nm

    const xp_wave = xPix(rPeakNm * uf);
    const yp_wave = yPix(nd.A);

    const isSelected = state.selectedNodes.has(k);
    const pulse = isSelected ? (1.5 * Math.sin(state.pulsePhase) + 2) : 0;

    ctxP.fillStyle = col;
    ctxP.beginPath();
    ctxP.arc(xp_wave, yp_wave, 4 + pulse, 0, 2 * Math.PI);
    ctxP.fill();

    // dot on total curve at rPeak
    let idx = Math.round(rPeakNm / dr());
    idx = Math.max(0, Math.min(state.Nr - 1, idx));
    const pVal = state.P[idx];
    const yp_tot = yPix(pVal);

    ctxP.beginPath();
    ctxP.arc(xp_wave, yp_tot, 6 + (isSelected ? pulse : 0), 0, 2 * Math.PI);
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