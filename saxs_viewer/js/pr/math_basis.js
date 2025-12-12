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
