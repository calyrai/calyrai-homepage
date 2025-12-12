/* js/pr/pdb_to_priq.js
 * PDB -> CA distances -> P(r) + Debye I(q)
 *
 * IMPORTANT UNITS:
 * - PDB coordinates are in Å (Angstrom)
 * - Internal viewer state is in nm (r) and nm^-1 (q)
 *   => convert Å -> nm at parse time (x *= 0.1)
 *
 * IMPORTANT PHYSICS:
 * - Debye scattering for identical scatterers:
 *     I(q) = N + 2 * sum_{i<j} sin(q r_ij) / (q r_ij)
 *   (self term + pair term)
 */
import { state, dr } from "./state.js";

const A_TO_NM = 0.1;

// prevent double default-load / double overlay
let _defaultLoadedOnce = false;

export function parsePDBCaResidues(text) {
  const residues = [];
  const seen = new Set();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.startsWith("ATOM")) continue;

    const atomName = line.slice(12, 16).trim();
    if (atomName !== "CA") continue;

    const chain = line[21];
    const resSeq = parseInt(line.slice(22, 26), 10);
    const key = chain + ":" + resSeq;
    if (seen.has(key)) continue;
    seen.add(key);

    // PDB is Å
    const xA = parseFloat(line.slice(30, 38));
    const yA = parseFloat(line.slice(38, 46));
    const zA = parseFloat(line.slice(46, 54));
    if (!Number.isFinite(xA) || !Number.isFinite(yA) || !Number.isFinite(zA)) continue;

    // convert to nm (internal)
    residues.push({
      x: xA * A_TO_NM,
      y: yA * A_TO_NM,
      z: zA * A_TO_NM,
      chain,
      resSeq
    });
  }

  return residues;
}

function ensureRMaxCoversModel(residuesNm) {
  // quick max pair distance estimate (bounding box diagonal)
  let minX = +Infinity, minY = +Infinity, minZ = +Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const r of residuesNm) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.z < minZ) minZ = r.z;
    if (r.x > maxX) maxX = r.x;
    if (r.y > maxY) maxY = r.y;
    if (r.z > maxZ) maxZ = r.z;
  }
  if (!Number.isFinite(minX)) return;

  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;
  const diag = Math.sqrt(dx * dx + dy * dy + dz * dz); // nm

  // leave some headroom
  const needed = diag * 1.05;

  if (needed > state.rMax) {
    // Keep Nr, just expand support; viewer must rebuild rGrid elsewhere.
    // We set rMax here so next rebuild uses enough range.
    state.rMax = Math.ceil(needed * 10) / 10; // round to 0.1 nm
  }
}

function computePrHistogramAndIqDebye(residuesNm) {
  const n = residuesNm.length;
  const hist = new Array(state.Nr).fill(0.0);
  const dBin = dr(); // nm
  const nq = state.qGrid.length;
  const I = new Array(nq).fill(0.0);
  const eps = 1e-12;

  // Debye self term
  for (let j = 0; j < nq; j++) I[j] = n;

  // pair loops: accumulate BOTH histogram and Debye pairs
  for (let i = 0; i < n; i++) {
    const xi = residuesNm[i].x, yi = residuesNm[i].y, zi = residuesNm[i].z;

    for (let k = i + 1; k < n; k++) {
      const dx = xi - residuesNm[k].x;
      const dy = yi - residuesNm[k].y;
      const dz = zi - residuesNm[k].z;
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (!Number.isFinite(r)) continue;

      // histogram (internal nm)
      if (r >= 0 && r <= state.rMax) {
        const idx = Math.floor(r / dBin);
        if (idx >= 0 && idx < state.Nr) hist[idx] += 1.0;
      }

      // Debye pair term: 2 * sin(qr)/(qr)
      for (let j = 0; j < nq; j++) {
        const q = state.qGrid[j];
        const qr = q * r;
        const s = (qr < eps) ? 1.0 : Math.sin(qr) / qr;
        I[j] += 2.0 * s;
      }
    }
  }

  // normalize histogram: ∫ P(r) dr = 1
  let area = 0.0;
  for (let i = 0; i < state.Nr; i++) area += hist[i] * dBin;
  if (area > 0) {
    const s = 1.0 / area;
    for (let i = 0; i < state.Nr; i++) hist[i] *= s;
  }

  return { prHist: hist, I };
}

export function setExpFromPDB(residuesNm) {
  if (!residuesNm || residuesNm.length < 2) return;

  // make sure rMax does not clip the PDB-derived P(r)
  ensureRMaxCoversModel(residuesNm);

  // NOTE: if rMax changed, the caller should rebuild grids (rGrid) before drawing.
  // We still compute on current state.rMax/Nr here.

  const { prHist, I } = computePrHistogramAndIqDebye(residuesNm);

  // P(r) histogram on INTERNAL rGrid (nm)
  state.expPrData = {
    r: state.rGrid.slice(), // nm
    P: prHist.slice(),
    err: null
  };

  // I(q) on INTERNAL qGrid (nm^-1)
  state.expIqData = {
    q: state.qGrid.slice(), // nm^-1
    I,
    err: null
  };

  // IMPORTANT: do NOT cache expIqLog (plot_iq.js derives logs on the fly)
  state.expIqLog = null;

  // reset exp vertical shift when new PDB comes in
  state.expIqOffsetLog = 0.0;
}

export async function loadDefaultPDB(url = "3V03.pdb") {
  if (_defaultLoadedOnce) return;
  _defaultLoadedOnce = true;

  try {
    const resp = await fetch(url);
    if (!resp.ok) return;

    const text = await resp.text();
    const residuesNm = parsePDBCaResidues(text);
    if (!residuesNm.length) return;

    setExpFromPDB(residuesNm);
  } catch (e) {
    console.warn("loadDefaultPDB failed:", e);
  }
}

// manual reload (e.g. after changing rMax/Nr and rebuilding grids)
export async function reloadPDB(url = "3V03.pdb") {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return;

    const text = await resp.text();
    const residuesNm = parsePDBCaResidues(text);
    if (!residuesNm.length) return;

    setExpFromPDB(residuesNm);
  } catch (e) {
    console.warn("reloadPDB failed:", e);
  }
}