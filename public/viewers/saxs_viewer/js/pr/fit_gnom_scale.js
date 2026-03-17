/* js/pr/fit_gnom_scale.js
 * GNOM-style scaling: fit Iexp(q) ≈ s * Imod(q) (+ b optional)
 * Weighted least squares if exp errors exist.
 *
 * INTERNAL UNITS:
 * - state.qGrid: nm^-1
 * - state.expIqData.q: assumed nm^-1 (same internal unit)
 */
import { state } from "./state.js";

function interpLinear(xArr, yArr, x) {
  // assumes xArr sorted ascending
  const n = xArr.length;
  if (n < 2) return null;
  if (x <= xArr[0]) return yArr[0];
  if (x >= xArr[n - 1]) return yArr[n - 1];

  // binary search
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xArr[mid] <= x) lo = mid;
    else hi = mid;
  }
  const x0 = xArr[lo], x1 = xArr[hi];
  const y0 = yArr[lo], y1 = yArr[hi];
  const t = (x - x0) / (x1 - x0 || 1e-12);
  return y0 + t * (y1 - y0);
}

export function applyGnomScale({
  qMin = null,
  qMax = null,
  useBackground = false,
  minPoints = 20
} = {}) {
  const exp = state.expIqData;
  if (!exp?.q?.length || !exp?.I?.length) return null;
  if (!state.qGrid?.length || !state.Iq?.length) return null;

  const qE = exp.q;
  const IE = exp.I;
  const sE = exp.err || null;

  const qM = state.qGrid;
  const IM = state.Iq;

  // determine overlap + optional q window
  const qLo = Math.max(qE[0], qM[0], (qMin ?? -Infinity));
  const qHi = Math.min(qE[qE.length - 1], qM[qM.length - 1], (qMax ?? +Infinity));
  if (!(qHi > qLo)) return null;

  // Build normal equations for weighted LS:
  // if useBackground: solve for [s, b] in Iexp = s Imod + b
  // else:            solve for s only
  let Sw = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;

  let nUsed = 0;
  for (let i = 0; i < qE.length; i++) {
    const q = qE[i];
    if (q < qLo || q > qHi) continue;

    const Iexp = IE[i];
    if (!Number.isFinite(Iexp)) continue;

    const Imod = interpLinear(qM, IM, q);
    if (Imod == null || !Number.isFinite(Imod)) continue;

    // weights
    let w = 1.0;
    if (sE && sE[i] != null && Number.isFinite(sE[i]) && sE[i] > 0) {
      w = 1.0 / (sE[i] * sE[i]);
    }

    Sw  += w;
    Sx  += w * Imod;
    Sy  += w * Iexp;
    Sxx += w * Imod * Imod;
    Sxy += w * Imod * Iexp;
    nUsed++;
  }

  if (nUsed < minPoints) return null;

  let s = 1.0, b = 0.0;

  if (useBackground) {
    // Solve 2x2:
    // [Sxx  Sx] [s] = [Sxy]
    // [Sx   Sw] [b]   [Sy ]
    const det = (Sxx * Sw - Sx * Sx);
    if (Math.abs(det) < 1e-24) return null;
    s = (Sxy * Sw - Sy * Sx) / det;
    b = (Sxx * Sy - Sx * Sxy) / det;
  } else {
    // s = argmin Σ w (Iexp - s Imod)^2 = Sxy / Sxx
    if (Math.abs(Sxx) < 1e-24) return null;
    s = Sxy / Sxx;
    b = 0.0;
  }

  if (!Number.isFinite(s) || s <= 0) return null;

  // Apply: scale MODEL curve to experimental
  state.IqScaleLog = Math.log10(s);

  // Keep exp multiplicative offset at 0 by default
  state.expIqOffsetLog = 0.0;

  // Optional: store background (needs plotting support if you want it displayed)
  state.modelIqBackground = b; // safe to store even if not used yet

  return { s, b, nUsed, qLo, qHi };
}
