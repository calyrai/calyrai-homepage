function setupDrop(id, handler) {
  const zone = document.getElementById(id);
  if (!zone) return;
  zone.addEventListener("dragover", (e) => e.preventDefault());
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handler(file);
  });
}

function parseXY(text) {
  const x = [];
  const y = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const parts = line.trim().split(/[\s,;]+/);
    if (parts.length >= 2) {
      const xv = parseFloat(parts[0]);
      const yv = parseFloat(parts[1]);
      if (!Number.isNaN(xv) && !Number.isNaN(yv)) {
        x.push(xv); y.push(yv);
      }
    }
  }
  return {x, y};
}

function parsePdbPoints(text, maxPoints = 5000) {
  const ca = [];
  const other = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const rec = line.slice(0, 6).trim();
    if (!(rec === "ATOM" || rec === "HETATM")) continue;
    const atomName = line.slice(12, 16).trim();
    const chainID = line.slice(21, 22).trim();
    const resSeqRaw = line.slice(22, 26).trim();
    const resSeq = resSeqRaw ? parseInt(resSeqRaw, 10) : NaN;
    // PDB fixed columns (1-based): x=31-38, y=39-46, z=47-54
    const xs = line.slice(30, 38).trim();
    const ys = line.slice(38, 46).trim();
    const zs = line.slice(46, 54).trim();
    const x = parseFloat(xs);
    const y = parseFloat(ys);
    const z = parseFloat(zs);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    const p = {x, y, z, atomName, chainID, resSeq};
    if (atomName === "CA") ca.push(p);
    else other.push(p);
  }

  const pts = ca.concat(other);
  if (pts.length <= maxPoints) return pts;

  // Downsample deterministically to avoid DOM blowups.
  // Prefer keeping CA atoms so the backbone stays intact.
  if (ca.length >= maxPoints) {
    const stride = Math.ceil(ca.length / maxPoints);
    const out = [];
    for (let i = 0; i < ca.length; i += stride) out.push(ca[i]);
    return out;
  }

  const remaining = Math.max(0, maxPoints - ca.length);
  if (remaining === 0) return ca;

  const stride = Math.ceil(other.length / remaining);
  const sampled = [];
  for (let i = 0; i < other.length; i += stride) sampled.push(other[i]);
  return ca.concat(sampled);
}

function parsePdbModelPoints(text, maxPoints = 5000) {
  const pts = [];
  const lines = String(text || "").split(/\r?\n/);

  for (const line of lines) {
    const rec = line.slice(0, 6).trim();
    if (!(rec === "ATOM" || rec === "HETATM")) continue;
    const atomName = line.slice(12, 16).trim();
    const chainID = line.slice(21, 22).trim();
    const resSeqRaw = line.slice(22, 26).trim();
    const resSeq = resSeqRaw ? parseInt(resSeqRaw, 10) : NaN;
    const xs = line.slice(30, 38).trim();
    const ys = line.slice(38, 46).trim();
    const zs = line.slice(46, 54).trim();
    const x = parseFloat(xs);
    const y = parseFloat(ys);
    const z = parseFloat(zs);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    pts.push({ x, y, z, atomName, chainID, resSeq });
  }

  if (pts.length <= maxPoints) return pts;
  const stride = Math.ceil(pts.length / Math.max(1, Math.floor(maxPoints)));
  const sampled = [];
  for (let i = 0; i < pts.length; i += stride) sampled.push(pts[i]);
  return sampled;
}

function parsePdbSecondaryStructure(text) {
  const helices = [];
  const sheets = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const rec = line.slice(0, 6).trim();
    if (rec === "HELIX") {
      const chainID = line.slice(19, 20).trim();
      const startRaw = line.slice(21, 25).trim();
      const endChainID = line.slice(31, 32).trim();
      const endRaw = line.slice(33, 37).trim();
      const start = startRaw ? parseInt(startRaw, 10) : NaN;
      const end = endRaw ? parseInt(endRaw, 10) : NaN;
      if (chainID && endChainID && chainID !== endChainID) continue;
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      helices.push({chainID, start: Math.min(start, end), end: Math.max(start, end)});
      continue;
    }
    if (rec === "SHEET") {
      const chainID = line.slice(21, 22).trim();
      const startRaw = line.slice(22, 26).trim();
      const endChainID = line.slice(32, 33).trim();
      const endRaw = line.slice(33, 37).trim();
      const start = startRaw ? parseInt(startRaw, 10) : NaN;
      const end = endRaw ? parseInt(endRaw, 10) : NaN;
      if (chainID && endChainID && chainID !== endChainID) continue;
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      sheets.push({chainID, start: Math.min(start, end), end: Math.max(start, end)});
      continue;
    }
  }

  return {helices, sheets};
}

function buildSecondaryStructureLookup(secondaryStructure) {
  const ss = secondaryStructure && typeof secondaryStructure === "object" ? secondaryStructure : null;
  const helixByChain = new Map();
  const sheetByChain = new Map();
  if (!ss) return { helixByChain, sheetByChain };

  const helices = Array.isArray(ss.helices) ? ss.helices : [];
  const sheets = Array.isArray(ss.sheets) ? ss.sheets : [];

  for (const helix of helices) {
    if (!helix || !helix.chainID || !Number.isFinite(helix.start) || !Number.isFinite(helix.end)) continue;
    if (!helixByChain.has(helix.chainID)) helixByChain.set(helix.chainID, []);
    helixByChain.get(helix.chainID).push([Math.min(helix.start, helix.end), Math.max(helix.start, helix.end)]);
  }
  for (const sheet of sheets) {
    if (!sheet || !sheet.chainID || !Number.isFinite(sheet.start) || !Number.isFinite(sheet.end)) continue;
    if (!sheetByChain.has(sheet.chainID)) sheetByChain.set(sheet.chainID, []);
    sheetByChain.get(sheet.chainID).push([Math.min(sheet.start, sheet.end), Math.max(sheet.start, sheet.end)]);
  }

  for (const ranges of helixByChain.values()) ranges.sort((a, b) => a[0] - b[0]);
  for (const ranges of sheetByChain.values()) ranges.sort((a, b) => a[0] - b[0]);

  return { helixByChain, sheetByChain };
}

function inSecondaryStructureRanges(map, chainID, resSeq) {
  if (!chainID || !Number.isFinite(resSeq)) return false;
  const ranges = map.get(chainID);
  if (!ranges || !ranges.length) return false;
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const start = range[0];
    const end = range[1];
    if (resSeq < start) return false;
    if (resSeq <= end) return true;
  }
  return false;
}

function classifySecondaryStructureGroup(lookup, chainID, resSeq) {
  if (lookup && inSecondaryStructureRanges(lookup.helixByChain, chainID, resSeq)) return "alpha";
  if (lookup && inSecondaryStructureRanges(lookup.sheetByChain, chainID, resSeq)) return "beta";
  return "coil";
}

function annotatePointsWithSecondaryStructure(points, secondaryStructure) {
  const pts = Array.isArray(points) ? points : [];
  if (!pts.length) return [];
  const lookup = buildSecondaryStructureLookup(secondaryStructure);
  return pts.map((point) => ({
    ...point,
    ssGroup: classifySecondaryStructureGroup(lookup, point && point.chainID, point && point.resSeq),
  }));
}

function classifyDomainGroup(point) {
  if (point && point.domainGroup != null) {
    const explicit = String(point.domainGroup).trim();
    if (explicit) return explicit;
  }
  const chainID = point && point.chainID ? String(point.chainID).trim() : "";
  if (chainID) return `chain:${chainID}`;
  return "chain:_";
}

function annotatePointsWithDomainGroups(points) {
  const pts = Array.isArray(points) ? points : [];
  if (!pts.length) return [];
  return pts.map((point) => ({
    ...point,
    domainGroup: classifyDomainGroup(point),
  }));
}

function cloneModelPoints(points) {
  return (Array.isArray(points) ? points : []).map((point) => ({ ...point }));
}

async function sendToNexus(payload) {
  const res = await fetch("http://127.0.0.1:9000/route", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });
  return await res.json();
}

function setPdbStatus(msg) {
  const el = document.getElementById("pdbStatus");
  if (el) el.textContent = msg || "";
}

function setPdbText(text) {
  const el = document.getElementById("pdbText");
  if (el) el.value = text || "";
}

function getPdbText() {
  const el = document.getElementById("pdbText");
  return el ? String(el.value || "") : "";
}

function getIqPlotSettings() {
  const curveSel = document.getElementById("iqCurveSelect");
  const scaleSel = document.getElementById("iqScaleSelect");
  const curve = curveSel ? String(curveSel.value || "I") : "I";
  const scale = scaleSel ? String(scaleSel.value || "lin-lin") : "lin-lin";
  return {curve, scale};
}

function getScaleSelectValue(id, fallback = "lin-lin") {
  const sel = document.getElementById(id);
  return sel ? String(sel.value || fallback) : fallback;
}

function applyAxisScale({x, y, scale}) {
  const xLog = scale === "log-lin" || scale === "log-log";
  const yLog = scale === "lin-log" || scale === "log-log";

  const xs = [];
  const ys = [];
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) {
    let xv = x[i];
    let yv = y[i];
    if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
    if (xLog) {
      if (!(xv > 0)) continue;
      xv = Math.log10(xv);
    }
    if (yLog) {
      if (!(yv > 0)) continue;
      yv = Math.log10(yv);
    }
    if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
    xs.push(xv);
    ys.push(yv);
  }
  return {x: xs, y: ys};
}

function scalePoint({x, y, scale}) {
  const xLog = scale === "log-lin" || scale === "log-log";
  const yLog = scale === "lin-log" || scale === "log-log";
  let xv = x;
  let yv = y;
  if (!Number.isFinite(xv) || !Number.isFinite(yv)) return null;
  if (xLog) {
    if (!(xv > 0)) return null;
    xv = Math.log10(xv);
  }
  if (yLog) {
    if (!(yv > 0)) return null;
    yv = Math.log10(yv);
  }
  if (!Number.isFinite(xv) || !Number.isFinite(yv)) return null;
  return { x: xv, y: yv };
}

function resolveIqI0Reference(iq) {
  const q = (iq && Array.isArray(iq.q)) ? iq.q : [];
  const I = (iq && Array.isArray(iq.I)) ? iq.I : [];
  const n = Math.min(q.length, I.length);

  let I0 = (iq && Number.isFinite(iq.I0_raw) && iq.I0_raw > 0) ? iq.I0_raw : null;
  if (!(Number.isFinite(I0) && I0 > 0)) {
    const first = n > 0 ? I[0] : null;
    I0 = (Number.isFinite(first) && first > 0) ? first : null;
  }
  if (!(Number.isFinite(I0) && I0 > 0)) {
    let mx = 0;
    for (let i = 0; i < n; i++) {
      const value = I[i];
      if (Number.isFinite(value)) mx = Math.max(mx, value);
    }
    I0 = mx > 0 ? mx : 1;
  }
  return I0;
}

function transformIqForPlot(iq, opts = null) {
  const {curve, scale} = getIqPlotSettings();
  const xs = [];
  const ys = [];

  if (curve === "kratky") {
    // Reduced Kratky: x = q*Rg, y = (q*Rg)^2 * I(q)/I(0)
    // We reuse the precomputed dimensionless curve from BMCA.
    const dim = window.__lastDim;
    const x = (dim && Array.isArray(dim.x)) ? dim.x : [];
    const y = (dim && Array.isArray(dim.y)) ? dim.y : [];
    const n = Math.min(x.length, y.length);
    for (let i = 0; i < n; i++) {
      const xv = x[i];
      const yv = y[i];
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      xs.push(xv);
      ys.push(yv * xv * xv);
    }

    const scaled = applyAxisScale({x: xs, y: ys, scale});
    const scaleLabel = (
      scale === "lin-lin" ? "linear" :
      scale === "log-lin" ? "log x" :
      scale === "lin-log" ? "log y" :
      "log–log"
    );
    return {x: scaled.x, y: scaled.y, title: `Reduced Kratky (${scaleLabel})`};
  }

  const q = (iq && Array.isArray(iq.q)) ? iq.q : [];
  const I = (iq && Array.isArray(iq.I)) ? iq.I : [];
  const n = Math.min(q.length, I.length);

  // Normalize to I(0) so the y-axis is comparable across structures.
  // If an override is provided, use it so overlays normalize identically.
  const I0Override = (opts && Number.isFinite(opts.I0Override) && opts.I0Override > 0) ? opts.I0Override : null;
  const I0 = I0Override != null ? I0Override : resolveIqI0Reference(iq);

  for (let i = 0; i < n; i++) {
    const qv = q[i];
    const Iv = I[i];
    if (!Number.isFinite(qv) || !Number.isFinite(Iv)) continue;

    xs.push(qv);
    const In = Iv / I0;
    ys.push((curve === "q2I") ? (In * qv * qv) : In);
  }

  const scaled = applyAxisScale({x: xs, y: ys, scale});

  const curveLabel = curve === "q2I" ? "Reduced q²·I(q) / I(0)" : "I(q) / I(0)";
  const scaleLabel = (
    scale === "lin-lin" ? "linear" :
    scale === "log-lin" ? "log x" :
    scale === "lin-log" ? "log y" :
    "log–log"
  );

  return {x: scaled.x, y: scaled.y, title: `${curveLabel} (${scaleLabel})`};
}

function computeFractfitModels(pr, iq) {
  const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
  const scattering = window.CalyrEvolution && window.CalyrEvolution.scattering;
  if (!mod || !scattering) return null;
  if (!pr || !Array.isArray(pr.r) || !Array.isArray(pr.p) || pr.r.length < 6) return null;

  const envParams = mod.fitEnvelopeParams(pr.r, pr.p);
  const shiftedParams = mod.fitShiftedEnvelopeParams(pr.r, pr.p);
  const envPr = mod.buildEnvelopeFromParams(envParams, pr.r);
  const shiftedPr = mod.buildEnvelopeFromParams(shiftedParams, pr.r);

  const qGrid = iq && Array.isArray(iq.q) ? iq.q : [];
  const envIqRaw = qGrid.length ? scattering.intensityFromPr(envPr, qGrid) : null;
  const shiftedIqRaw = qGrid.length ? scattering.intensityFromPr(shiftedPr, qGrid) : null;
  const envIq = envIqRaw ? { q: envIqRaw.q.slice(), I: envIqRaw.I.slice(), I0_raw: resolveIqI0Reference(envIqRaw) } : null;
  const shiftedIq = shiftedIqRaw ? { q: shiftedIqRaw.q.slice(), I: shiftedIqRaw.I.slice(), I0_raw: resolveIqI0Reference(shiftedIqRaw) } : null;

  return {
    envParams,
    shiftedParams,
    envPr,
    shiftedPr,
    envIq,
    shiftedIq,
  };
}

function buildForwardIqFromPr(pr, qGrid) {
  const scattering = window.CalyrEvolution && window.CalyrEvolution.scattering;
  if (!scattering || typeof scattering.intensityFromPr !== "function") return null;
  if (!pr || !Array.isArray(pr.r) || !Array.isArray(pr.p)) return null;
  if (!Array.isArray(qGrid) || !qGrid.length) return null;

  const rawIq = scattering.intensityFromPr(pr, qGrid);
  if (!rawIq || !Array.isArray(rawIq.q) || !Array.isArray(rawIq.I)) return null;

  if (typeof scattering.normalizeIToI0 === "function") {
    const normalized = scattering.normalizeIToI0(rawIq);
    return {
      q: Array.isArray(normalized && normalized.q) ? normalized.q.slice() : rawIq.q.slice(),
      I: Array.isArray(normalized && normalized.I) ? normalized.I.slice() : rawIq.I.slice(),
      I0_raw: (normalized && Number.isFinite(normalized.I0)) ? normalized.I0 : resolveIqI0Reference(rawIq),
    };
  }

  return {
    q: rawIq.q.slice(),
    I: rawIq.I.slice(),
    I0_raw: resolveIqI0Reference(rawIq),
  };
}

function refreshIqCurvesFromLast() {
  const refIq = window.__lastIq;
  const pr = window.__lastPr;
  const prSpline = window.__lastPrSpline;
  const qGrid = refIq && Array.isArray(refIq.q) ? refIq.q : [];

  window.__lastIqFromPr = buildForwardIqFromPr(pr, qGrid);
  window.__lastIqFromPrSpline = buildForwardIqFromPr(prSpline, qGrid);
}

function renderIqFromLast() {
  const iq = window.__lastIq;
  if (!iq || typeof renderLinePlot !== "function") return;
  const { curve } = getIqPlotSettings();
  const pddIq = window.__lastIqFromPr || buildForwardIqFromPr(window.__lastPr, iq.q) || iq;
  const I0Ref = resolveIqI0Reference(pddIq);

  const {x, y, title} = transformIqForPlot(pddIq, { I0Override: I0Ref });

  const overlays = [];
  if (curve !== "kratky") {
    const overlayIq = window.__lastIqFromPrSpline;
    if (overlayIq && Array.isArray(overlayIq.q) && Array.isArray(overlayIq.I)) {
      const tr = transformIqForPlot(overlayIq, { I0Override: I0Ref });
      overlays.push({ x: tr.x, y: tr.y, className: "viz-line viz-line--magenta", stroke: "#ff00ff", strokeWidth: 2.4, opacity: 1, style: "stroke: #ff00ff !important; stroke-width: 2.4 !important; opacity: 1 !important; fill: none !important;" });
    }
  }

  renderLinePlot({x, y, title, hostId: "iqPreview", mode: "line", overlays, lineClassName: "viz-line", lineStroke: "#24f3ff", lineStrokeWidth: 2, lineOpacity: 1, lineStyle: "stroke: #24f3ff !important; stroke-width: 2 !important; opacity: 1 !important; fill: none !important;"});
}

function resetLinePlotViewIfAvailable(hostId) {
  if (typeof window !== "undefined" && typeof window.resetLinePlotView === "function") {
    window.resetLinePlotView(hostId, false);
  }
}

function interpPrGridValue(rGrid, pGrid, rQuery) {
  const n = Math.min(Array.isArray(rGrid) ? rGrid.length : 0, Array.isArray(pGrid) ? pGrid.length : 0);
  if (n === 0) return NaN;
  if (rQuery <= rGrid[0]) return pGrid[0];
  if (rQuery >= rGrid[n - 1]) return pGrid[n - 1];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (rGrid[mid] <= rQuery) lo = mid;
    else hi = mid;
  }
  const x0 = rGrid[lo];
  const x1 = rGrid[hi];
  const y0 = pGrid[lo];
  const y1 = pGrid[hi];
  const dx = x1 - x0;
  if (!(dx > 0)) return y0;
  const t = (rQuery - x0) / dx;
  return y0 + t * (y1 - y0);
}

function estimateMedianPrDr(rGrid) {
  const rr = Array.isArray(rGrid) ? rGrid : [];
  const drs = [];
  for (let i = 1; i < rr.length; i++) {
    const d = rr[i] - rr[i - 1];
    if (Number.isFinite(d) && d > 0) drs.push(d);
  }
  drs.sort((a, b) => a - b);
  return drs.length ? drs[Math.floor(drs.length / 2)] : 1;
}

function maxFiniteValue(arr) {
  let mx = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (Number.isFinite(v)) mx = Math.max(mx, v);
  }
  return Number.isFinite(mx) ? mx : NaN;
}

function maxAbsDiffNormSeries(pA, pB, denom) {
  const n = Math.min(pA.length, pB.length);
  const safeDenom = (Number.isFinite(denom) && denom > 0) ? denom : 1;
  let mx = 0;
  for (let i = 0; i < n; i++) {
    const a = pA[i];
    const b = pB[i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    mx = Math.max(mx, Math.abs(a - b) / safeDenom);
  }
  return mx;
}

function maxAbsDiffLogSeries(pA, pB) {
  const n = Math.min(pA.length, pB.length);
  const EPS = 1e-12;
  let mx = 0;
  for (let i = 0; i < n; i++) {
    const a = pA[i];
    const b = pB[i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    const la = Math.log(Math.max(EPS, a));
    const lb = Math.log(Math.max(EPS, b));
    mx = Math.max(mx, Math.abs(la - lb));
  }
  return mx;
}

function chooseInitialPrSplineKnotCount(pr) {
  const n = Math.min(pr && Array.isArray(pr.r) ? pr.r.length : 0, pr && Array.isArray(pr.p) ? pr.p.length : 0);
  if (n <= 0) return 18;
  return Math.max(18, Math.min(40, Math.round(n / 4)));
}

function buildPrSplineFromPr(pr, mod, { knots, yLog = false } = {}) {
  if (!pr || !Array.isArray(pr.r) || !Array.isArray(pr.p)) return null;
  if (!mod || typeof mod.buildConstrainedPrSplineFromPr !== "function" || typeof mod.buildPrFromTheta !== "function") return null;

  const built = mod.buildConstrainedPrSplineFromPr(pr, {
    knots,
    interpMode: yLog ? "log" : "linear",
  });
  if (!built || !built.pr || !built.theta) return null;

  const thetaState = {
    D: built.theta.D,
    alpha: built.theta.alpha,
    knotsR: Array.isArray(built.theta.knotsR) ? built.theta.knotsR.slice() : [],
    knotsF: Array.isArray(built.theta.knotsF) ? built.theta.knotsF.slice() : [],
    knotsP: [],
  };

  prunePrSplineTheta(thetaState, pr, mod, {
    yLog,
    tolRel: 0.0075,
    maxRemovals: Math.max(24, Number.isFinite(knots) ? knots : 0),
    minKnots: 6,
  });

  const rebuiltPr = mod.buildPrFromTheta({
    D: thetaState.D,
    alpha: thetaState.alpha,
    knotsR: thetaState.knotsR,
    knotsF: thetaState.knotsF,
  }, pr.r) || built.pr;

  fillPrSplineKnotP(thetaState, rebuiltPr);

  return {
    pr: rebuiltPr,
    theta: thetaState,
    thetaFull: built.theta,
  };
}

function sumPrComponents(components, templatePr) {
  const templateR = templatePr && Array.isArray(templatePr.r) ? templatePr.r : [];
  const n = templateR.length;
  if (!n) return null;
  const sum = new Array(n).fill(0);
  const entries = Array.isArray(components) ? components : [];
  for (let i = 0; i < entries.length; i++) {
    const compPr = entries[i] && entries[i].pr;
    const compR = compPr && Array.isArray(compPr.r) ? compPr.r : [];
    const compP = compPr && Array.isArray(compPr.p) ? compPr.p : [];
    if (!compR.length || !compP.length) continue;
    if (compR.length === n) {
      for (let j = 0; j < n; j++) {
        const value = compP[j];
        if (Number.isFinite(value)) sum[j] += value;
      }
      continue;
    }
    for (let j = 0; j < n; j++) {
      const value = interpPrGridValue(compR, compP, templateR[j]);
      if (Number.isFinite(value)) sum[j] += value;
    }
  }
  return {
    r: templateR.slice(),
    p: sum,
    binWidth: templatePr && Number.isFinite(templatePr.binWidth) ? templatePr.binWidth : null,
    rMax: templatePr && Number.isFinite(templatePr.rMax) ? templatePr.rMax : null,
  };
}

function fitSecondaryStructurePddComponents(pr, mod, { yLog = false } = {}) {
  const secondaryStructure = pr && pr.secondaryStructure && typeof pr.secondaryStructure === "object" ? pr.secondaryStructure : null;
  if (!secondaryStructure || String(secondaryStructure.groupField || "") !== "ssGroup") return null;
  const components = secondaryStructure.components && typeof secondaryStructure.components === "object" ? secondaryStructure.components : null;
  if (!components) return null;

  const entries = Object.entries(components);
  const fittedComponents = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const key = entry[0];
    const comp = entry[1];
    const r = comp && Array.isArray(comp.r) ? comp.r : [];
    const p = comp && Array.isArray(comp.p) ? comp.p : [];
    const pairs = comp && Number.isFinite(comp.pairs) ? comp.pairs : 0;
    if (!r.length || !p.length || !(pairs > 0)) continue;

    let peak = 0;
    for (let j = 0; j < p.length; j++) {
      const value = p[j];
      if (Number.isFinite(value)) peak = Math.max(peak, value);
    }
    if (!(peak > 0)) continue;

    const compPr = {
      r: r.slice(),
      p: p.slice(),
      binWidth: pr && Number.isFinite(pr.binWidth) ? pr.binWidth : null,
      rMax: pr && Number.isFinite(pr.rMax) ? pr.rMax : null,
      pairs,
    };
    const knots = chooseInitialPrSplineKnotCount(compPr);
    const fitted = buildPrSplineFromPr(compPr, mod, { knots, yLog });
    if (!fitted || !fitted.pr) continue;
    fittedComponents.push({
      key,
      raw: compPr,
      pr: fitted.pr,
      theta: fitted.theta,
      thetaFull: fitted.thetaFull,
      pairs,
    });
  }

  if (!fittedComponents.length) return null;
  const aggregatePr = sumPrComponents(fittedComponents, pr);
  if (!aggregatePr) return null;

  return {
    pr: aggregatePr,
    components: fittedComponents,
  };
}

function estimatePrSplineKnotCurvature(knotsR, knotsP, index) {
  if (!Array.isArray(knotsR) || !Array.isArray(knotsP)) return Infinity;
  if (!(index > 0 && index < knotsR.length - 1 && index < knotsP.length - 1)) return Infinity;

  const x0 = knotsR[index - 1];
  const y0 = knotsP[index - 1];
  const x1 = knotsR[index];
  const y1 = knotsP[index];
  const x2 = knotsR[index + 1];
  const y2 = knotsP[index + 1];
  if (![x0, y0, x1, y1, x2, y2].every(Number.isFinite)) return Infinity;

  const ax = x1 - x0;
  const ay = y1 - y0;
  const bx = x2 - x1;
  const by = y2 - y1;
  const aLen = Math.hypot(ax, ay);
  const bLen = Math.hypot(bx, by);
  if (!(aLen > 0) || !(bLen > 0)) return Infinity;

  const cross = Math.abs(ax * by - ay * bx);
  const dot = ax * bx + ay * by;
  const sinTheta = cross / (aLen * bLen);
  const cosTheta = dot / (aLen * bLen);
  const bend = Math.atan2(sinTheta, Math.max(-1, Math.min(1, cosTheta)));
  return Number.isFinite(bend) ? bend : Infinity;
}

function prunePrSplineTheta(theta, pr, mod, { yLog = false, tolRel = 0.0075, maxRemovals = 48, minKnots = 6 } = {}) {
  if (!theta || !pr || !mod || typeof mod.buildPrFromTheta !== "function") return 0;
  if (!Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return 0;
  if (theta.knotsR.length !== theta.knotsF.length) return 0;
  if (theta.knotsR.length <= minKnots) return 0;
  if (!Array.isArray(pr.r) || pr.r.length < 2) return 0;

  function buildThetaObj(knotsR, knotsF) {
    return {
      D: theta.D,
      alpha: theta.alpha,
      knotsR,
      knotsF,
    };
  }

  const ref = mod.buildPrFromTheta(buildThetaObj(theta.knotsR, theta.knotsF), pr.r);
  if (!ref || !Array.isArray(ref.p)) return 0;
  const pRef = ref.p;
  const pMax = maxFiniteValue(pRef);
  const denom = (Number.isFinite(pMax) && pMax > 0) ? pMax : 1;
  const tolLog = Math.log(1 + tolRel);

  let removed = 0;
  while (theta.knotsR.length > minKnots && removed < maxRemovals) {
    let bestIdx = -1;
    let bestErr = Infinity;
    let bestCurvature = Infinity;
    const knotShapeValues = theta.knotsR.map((rk) => interpPrGridValue(pr.r, pRef, rk));

    for (let i = 1; i < theta.knotsR.length - 1; i++) {
      const candR = theta.knotsR.slice();
      const candF = theta.knotsF.slice();
      candR.splice(i, 1);
      candF.splice(i, 1);

      const cand = mod.buildPrFromTheta(buildThetaObj(candR, candF), pr.r);
      if (!cand || !Array.isArray(cand.p)) continue;

      const err = yLog ? maxAbsDiffLogSeries(cand.p, pRef) : maxAbsDiffNormSeries(cand.p, pRef, denom);
      const curv = estimatePrSplineKnotCurvature(theta.knotsR, knotShapeValues, i);
      const tol = yLog ? tolLog : tolRel;
      if (err <= tol) {
        if (curv < bestCurvature - 1e-9 || (Math.abs(curv - bestCurvature) <= 1e-9 && err < bestErr)) {
          bestCurvature = curv;
          bestErr = err;
          bestIdx = i;
        }
      } else if (bestIdx < 0 && err < bestErr) {
        bestErr = err;
        bestIdx = i;
      }
    }

    const tol = yLog ? tolLog : tolRel;
    if (bestIdx >= 1 && bestIdx < theta.knotsR.length - 1 && bestErr <= tol) {
      theta.knotsR.splice(bestIdx, 1);
      theta.knotsF.splice(bestIdx, 1);
      if (Array.isArray(theta.knotsP) && bestIdx < theta.knotsP.length) theta.knotsP.splice(bestIdx, 1);
      removed++;
    } else {
      break;
    }
  }

  return removed;
}

function fillPrSplineKnotP(theta, builtPr) {
  const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
  const exact = (mod && typeof mod.buildPrFromTheta === "function" && theta && Array.isArray(theta.knotsR))
    ? mod.buildPrFromTheta({
      D: theta.D,
      alpha: theta.alpha,
      knotsR: theta.knotsR,
      knotsF: theta.knotsF,
    }, theta.knotsR)
    : null;
  if (exact && Array.isArray(exact.p) && exact.p.length === theta.knotsR.length) {
    theta.knotsP = exact.p.map((pk) => (Number.isFinite(pk) ? pk : 0));
    return;
  }

  const knotsP = [];
  const rGrid = builtPr && Array.isArray(builtPr.r) ? builtPr.r : [];
  const pGrid = builtPr && Array.isArray(builtPr.p) ? builtPr.p : [];
  const knotsR = theta && Array.isArray(theta.knotsR) ? theta.knotsR : [];
  for (const rk of knotsR) {
    const pk = interpPrGridValue(rGrid, pGrid, rk);
    knotsP.push(Number.isFinite(pk) ? pk : 0);
  }
  theta.knotsP = knotsP;
}

const DOMAIN_COMPONENT_STROKE = "#24f3ff";

function normalizeComponentLabel(label) {
  const raw = String(label || "").trim();
  if (!raw) return "?";
  if (raw.startsWith("chain:")) return raw.slice(6) || "_";
  return raw.replace(/_/g, "-");
}

function formatComponentKey(key) {
  const raw = String(key || "").trim();
  if (!raw) return "?";
  if (raw.indexOf("_") >= 0 && raw.indexOf("-") < 0) return raw.replace(/_/g, "-");
  const parts = raw.split("-");
  if (parts.length !== 2) return raw;
  return `${normalizeComponentLabel(parts[0])}-${normalizeComponentLabel(parts[1])}`;
}

function buildGroupedComponentPrOverlays(components, pmax, scale) {
  const entries = Array.isArray(components) ? components : [];
  if (!(pmax > 0) || !entries.length) return [];

  const overlays = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const compPr = entry && entry.pr;
    if (!compPr || !Array.isArray(compPr.r) || !Array.isArray(compPr.p)) continue;
    const pn = compPr.p.map((value) => (Number.isFinite(value) ? value / pmax : value));
    const scaled = applyAxisScale({ x: compPr.r, y: pn, scale });
    if (!scaled.x.length || !scaled.y.length) continue;
    overlays.push({
      x: scaled.x,
      y: scaled.y,
      className: "viz-line viz-line--domain-fit",
      stroke: DOMAIN_COMPONENT_STROKE,
      strokeWidth: 1.0,
      opacity: 0.46,
      style: `stroke: ${DOMAIN_COMPONENT_STROKE} !important; stroke-width: 1.0 !important; opacity: 0.46 !important; fill: none !important; stroke-dasharray: 6 4;`,
    });
  }
  return overlays;
}

function updatePrFitSummary() {
  const el = document.getElementById("prFitSummary");
  if (!el) return;

  const pr = window.__lastPr;
  const fittedComponents = Array.isArray(window.__lastPrSplineComponents) ? window.__lastPrSplineComponents : [];
  const secondaryStructure = pr && pr.secondaryStructure && typeof pr.secondaryStructure === "object" ? pr.secondaryStructure : null;

  if (secondaryStructure) {
    const rawComponentCount = secondaryStructure.components && typeof secondaryStructure.components === "object"
      ? Object.keys(secondaryStructure.components).length
      : 0;
    const displayedComponentCount = fittedComponents.length || rawComponentCount;
    const componentLabel = displayedComponentCount === 1 ? "component" : "components";
    const componentNames = fittedComponents.length
      ? fittedComponents.map((entry) => formatComponentKey(entry && entry.key)).filter(Boolean)
      : (secondaryStructure.components && typeof secondaryStructure.components === "object"
        ? Object.keys(secondaryStructure.components).map((key) => formatComponentKey(key)).filter(Boolean)
        : []);
    if (displayedComponentCount > 0) {
      const namesText = componentNames.length ? ` Components: ${componentNames.join(", ")}.` : "";
      el.textContent = `Secondary-structure split: ${displayedComponentCount} PDD ${componentLabel}. Their sum gives the overall p(r). Thin cyan dashed overlays = fitted component PDDs. Magenta curve and nodes = editable total fit.${namesText}`;
    } else {
      el.textContent = "Secondary-structure split is available, but no component PDDs were fitted yet.";
    }
    return;
  }

  const theta = window.__lastPrSplineTheta;
  if (theta && Array.isArray(theta.knotsR) && theta.knotsR.length) {
    const knotLabel = theta.knotsR.length === 1 ? "knot" : "knots";
    el.textContent = `Magenta = fitted p(r) with ${theta.knotsR.length} spline ${knotLabel}.`;
    return;
  }

  el.textContent = "";
}

function renderPrFromLast() {
  const pr = window.__lastPr;
  if (!pr || typeof renderLinePlot !== "function") {
    updatePrFitSummary();
    return;
  }
  const r = (Array.isArray(pr.r) ? pr.r : []);
  const p = (Array.isArray(pr.p) ? pr.p : []);
  if (!r.length || !p.length) {
    if (typeof renderPlotMessage === "function") {
      renderPlotMessage("prPreview", "Normalized PDD p(r)", "No p(r) values are available yet.");
    }
    updatePrFitSummary();
    return;
  }
  // Normalize p(r) to max=1.
  let pmax = 0;
  let finiteCount = 0;
  for (let i = 0; i < p.length; i++) {
    const v = p[i];
    if (Number.isFinite(v)) {
      pmax = Math.max(pmax, v);
      finiteCount += 1;
    }
  }
  window.__lastPrPmax = pmax;
  if (!finiteCount) {
    if (typeof renderPlotMessage === "function") {
      renderPlotMessage("prPreview", "Normalized PDD p(r)", "The computed p(r) contains no finite values.");
    }
    return;
  }
  if (!(pmax > 0)) {
    if (typeof renderPlotMessage === "function") {
      renderPlotMessage("prPreview", "Normalized PDD p(r)", "The computed p(r) is flat or zero everywhere.");
    }
    return;
  }
  const pn = (pmax > 0) ? p.map((v) => (Number.isFinite(v) ? v / pmax : v)) : p;
  const scale = getScaleSelectValue("prScaleSelect", "lin-lin");
  const scaled = applyAxisScale({x: r, y: pn, scale});
  if (!scaled.x.length || !scaled.y.length) {
    if (typeof renderPlotMessage === "function") {
      renderPlotMessage("prPreview", "Normalized PDD p(r)", `No drawable p(r) points remain after applying the ${scale} scale.`);
    }
    return;
  }

  const overlays = [];
  const markers = [];
  const componentOverlays = buildGroupedComponentPrOverlays(window.__lastPrSplineComponents, pmax, scale);
  for (let i = 0; i < componentOverlays.length; i++) overlays.push(componentOverlays[i]);
  const prSpline = window.__lastPrSpline;
  const theta = window.__lastPrSplineTheta;
  if (prSpline && Array.isArray(prSpline.r) && Array.isArray(prSpline.p) && pmax > 0) {
    const pn2 = prSpline.p.map((v) => (Number.isFinite(v) ? v / pmax : v));
    const scaled2 = applyAxisScale({ x: prSpline.r, y: pn2, scale });
    overlays.push({ x: scaled2.x, y: scaled2.y, className: "viz-line viz-line--pr-fit", stroke: "#ff00ff", strokeWidth: 3.2, opacity: 1, style: "stroke: #ff00ff !important; stroke-width: 3.2 !important; opacity: 1 !important; fill: none !important;" });

    if (theta && Array.isArray(theta.knotsR) && Array.isArray(theta.knotsP)) {
      const nk = Math.min(theta.knotsR.length, theta.knotsP.length);
      for (let i = 0; i < nk; i++) {
        const rk = theta.knotsR[i];
        const pk = theta.knotsP[i];
        if (!Number.isFinite(rk) || !Number.isFinite(pk)) continue;
        const pt = scalePoint({ x: rk, y: pk / pmax, scale });
        if (!pt) continue;
        markers.push({ x: pt.x, y: pt.y, r: 5.4, className: "viz-knot", i, role: "pr-knot" });
      }
    }
  }
  const scaleLabel = (
    scale === "lin-lin" ? "linear" :
    scale === "log-lin" ? "log x" :
    scale === "lin-log" ? "log y" :
    "log–log"
  );
  renderLinePlot({x: scaled.x, y: scaled.y, title: `Normalized PDD p(r) / max (${scaleLabel})`, hostId: "prPreview", overlays, markers, lineClassName: "viz-line viz-line--data"});
  updatePrFitSummary();
  activateConstrainedPrSplineNodes();
}

function updateConstrainedPrSplineFromLast({ fitTarget = null } = {}) {
  const pr = window.__lastPr;
  const iq = window.__lastIq;

  window.__lastIqFromPr = null;
  window.__lastPrSpline = null;
  window.__lastPrSplineTheta = null;
  window.__lastIqFromPrSpline = null;
  window.__lastPrSplineComponents = null;

  const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
  if (!mod || typeof mod.buildConstrainedPrSplineFromPr !== "function" || typeof mod.buildPrFromTheta !== "function") return;
  if (!pr || !Array.isArray(pr.r) || !Array.isArray(pr.p)) return;

  const requestedTarget = String(fitTarget || window.__lastPrFitTarget || "pr").toLowerCase();
  const effectiveTarget = (requestedTarget === "pr" || requestedTarget === "iq")
    ? requestedTarget
    : ((iq && Array.isArray(iq.q) && Array.isArray(iq.I) && typeof mod.buildConstrainedPrSplineFromIq === "function") ? "iq" : "pr");
  window.__lastPrFitTarget = effectiveTarget;

  const scale = getScaleSelectValue("prScaleSelect", "lin-lin");
  const yLog = scale === "lin-log" || scale === "log-log";
  const componentFit = fitSecondaryStructurePddComponents(pr, mod, { yLog });
  if (componentFit && Array.isArray(componentFit.components) && componentFit.components.length) {
    window.__lastPrSplineComponents = componentFit.components;
  }

  const initialKnots = chooseInitialPrSplineKnotCount(pr);
  const fitted = (effectiveTarget === "iq" && iq && Array.isArray(iq.q) && Array.isArray(iq.I) && typeof mod.buildConstrainedPrSplineFromIq === "function")
    ? (() => {
      const built = mod.buildConstrainedPrSplineFromIq(pr, iq, { knots: initialKnots, interpMode: yLog ? "log" : "linear" });
      if (!built || !built.pr || !built.theta) return null;
      const thetaState = {
        D: built.theta.D,
        alpha: built.theta.alpha,
        knotsR: Array.isArray(built.theta.knotsR) ? built.theta.knotsR.slice() : [],
        knotsF: Array.isArray(built.theta.knotsF) ? built.theta.knotsF.slice() : [],
        knotsP: [],
      };
      prunePrSplineTheta(thetaState, pr, mod, {
        yLog,
        tolRel: 0.0075,
        maxRemovals: Math.max(24, initialKnots),
        minKnots: 6,
      });
      const rebuiltPr = mod.buildPrFromTheta({
        D: thetaState.D,
        alpha: thetaState.alpha,
        knotsR: thetaState.knotsR,
        knotsF: thetaState.knotsF,
      }, pr.r) || built.pr;
      fillPrSplineKnotP(thetaState, rebuiltPr);
      return {
        pr: rebuiltPr,
        theta: thetaState,
        thetaFull: built.theta,
      };
    })()
    : buildPrSplineFromPr(pr, mod, { knots: initialKnots, yLog });
  if (!fitted || !fitted.pr || !fitted.theta) return;

  window.__lastPrDr = estimateMedianPrDr(fitted.pr.r);
  window.__lastPrSpline = fitted.pr;
  window.__lastPrSplineThetaFull = fitted.thetaFull;
  window.__lastPrSplineTheta = fitted.theta;
  if (iq && Array.isArray(iq.q)) refreshIqCurvesFromLast();
}

function activateConstrainedPrSplineNodes() {
  const host = document.getElementById("prPreview");
  if (!host) return;
  const svg = host.querySelector("svg");
  if (!svg) return;

  // The plot is re-rendered during drags (host.innerHTML is replaced), so any
  // captured reference to the old <svg> becomes stale. Always resolve the current
  // <svg> when mapping pointer coordinates.
  function getSvg() {
    return host.querySelector("svg") || svg;
  }

  const theta = window.__lastPrSplineTheta;
  if (!theta || !Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return;

  const knots = Array.from(svg.querySelectorAll("circle.viz-knot[data-knot-index]"));
  if (!knots.length) return;

  function applySelectedKnotVisual() {
    const active = window.__activePrKnotIndex;
    for (const el of knots) {
      const idxRaw = el.getAttribute("data-knot-index");
      const idx = idxRaw != null ? parseInt(idxRaw, 10) : NaN;
      const on = Number.isFinite(active) && Number.isFinite(idx) && idx === active;
      el.classList.toggle("viz-knot--selected", on);
    }
  }

  // Re-apply selection state after each render (circles are recreated).
  applySelectedKnotVisual();

  function numAttr(el, name) {
    const v = el.getAttribute(name);
    const f = v != null ? parseFloat(v) : NaN;
    return Number.isFinite(f) ? f : NaN;
  }

  function svgPointFromEvent(e) {
    const s = getSvg();
    if (!s) return null;
    const pt = s.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = s.getScreenCTM();
    if (!ctm) return null;
    const inv = ctm.inverse();
    const sp = pt.matrixTransform(inv);
    return { x: sp.x, y: sp.y };
  }

  function ySvgToData(ySvg) {
    const s = getSvg();
    if (!s) return NaN;
    const ymin = numAttr(s, "data-ymin");
    const ymax = numAttr(s, "data-ymax");
    const H = numAttr(s, "data-h");
    const padT = numAttr(s, "data-padt");
    const padB = numAttr(s, "data-padb");
    if (![ymin, ymax, H, padT, padB].every(Number.isFinite)) return NaN;
    const inner = (H - padT - padB);
    if (!(inner > 0)) return NaN;
    const t = (ySvg - padT) / inner;
    return ymax - t * (ymax - ymin);
  }

  function xSvgToData(xSvg) {
    const s = getSvg();
    if (!s) return NaN;
    const xmin = numAttr(s, "data-xmin");
    const xmax = numAttr(s, "data-xmax");
    const W = numAttr(s, "data-w");
    const padL = numAttr(s, "data-padl");
    const padR = numAttr(s, "data-padr");
    if (![xmin, xmax, W, padL, padR].every(Number.isFinite)) return NaN;
    const inner = (W - padL - padR);
    if (!(inner > 0)) return NaN;
    const t = (xSvg - padL) / inner;
    return xmin + t * (xmax - xmin);
  }

  function interpGrid(rGrid, pGrid, rQuery) {
    const n = Math.min(rGrid.length, pGrid.length);
    if (n === 0) return NaN;
    if (rQuery <= rGrid[0]) return pGrid[0];
    if (rQuery >= rGrid[n - 1]) return pGrid[n - 1];
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (rGrid[mid] <= rQuery) lo = mid;
      else hi = mid;
    }
    const x0 = rGrid[lo];
    const x1 = rGrid[hi];
    const y0 = pGrid[lo];
    const y1 = pGrid[hi];
    const dx = x1 - x0;
    const t = (dx > 0) ? (rQuery - x0) / dx : 0;
    return y0 + t * (y1 - y0);
  }

  function updateFromKnotsF() {
    const pr = window.__lastPr;
    const iq = window.__lastIq;
    const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
    if (!pr || !mod || typeof mod.buildPrFromTheta !== "function") return;

    const builtPr = mod.buildPrFromTheta({
      D: theta.D,
      alpha: theta.alpha,
      knotsR: theta.knotsR,
      knotsF: theta.knotsF,
    }, pr.r);
    if (!builtPr) return;
    window.__lastPrSpline = builtPr;
    if (iq && Array.isArray(iq.q)) refreshIqCurvesFromLast();

    fillPrSplineKnotP(theta, builtPr);

    renderPrFromLast();
    renderIqFromLast();
  }

  // Expose a stable rebuild hook for undo/keyboard actions.
  // Note: this closure remains valid as long as `window.__lastPrSplineTheta` is
  // mutated in place (undo does that) and the plot is active.
  window.__prSplineUpdateFromKnotsF = updateFromKnotsF;

  const scale = getScaleSelectValue("prScaleSelect", "lin-lin");
  const xLog = scale === "log-lin" || scale === "log-log";
  const yLog = scale === "lin-log" || scale === "log-log";

  // Softer knot control: (1) low-pass filter updates (so the curve follows gently)
  // and (2) throttle pointermove to one update per animation frame.
  const DRAG_SMOOTH_Y = 0.22;
  const DRAG_SMOOTH_X = 0.28;
  const FIRST_KNOT_DRAG_SMOOTH_Y = 0.5;
  const FIRST_KNOT_DRAG_SMOOTH_X = 0.65;
  const SNAP_RADIUS_PX = 14;
  const SNAP_X_WINDOW_PX = 18;
  const IS_MAC = (typeof navigator !== "undefined") && /Mac|iPhone|iPad|iPod/i.test(String(navigator.platform || ""));

  // When the user finishes an edit, greedily remove redundant interior knots
  // while keeping the current magenta curve within a small tolerance.
  const PRUNE_TOL_REL = 0.01; // 1% of peak height
  const PRUNE_MAX_REMOVALS = 20;
  const PRUNE_MIN_KNOTS = 4;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setKnotFromScaledY(index, yScaled, mix) {
    const pmax = window.__lastPrPmax;
    if (!(Number.isFinite(pmax) && pmax > 0)) return;
    if (!(index >= 0 && index < theta.knotsR.length)) return;

    const t = (Number.isFinite(mix) ? mix : 1);

    const pn = yLog ? Math.pow(10, yScaled) : yScaled;
    const pnClamped = Math.max(1e-8, pn);
    const rk = theta.knotsR[index];
    const rSafe = Math.max(rk, 1e-6);
    const env = Math.pow(rSafe, theta.D) * Math.exp(-theta.alpha * rSafe);
    const pk = pnClamped * pmax;
    const fk = Math.log(pk + 1e-12) - Math.log(env + 1e-12);
    if (!Number.isFinite(fk)) return;
    const prev = theta.knotsF[index];
    if (Number.isFinite(prev) && t < 1) {
      theta.knotsF[index] = lerp(prev, fk, t);
    } else {
      theta.knotsF[index] = fk;
    }
  }

  function setKnotFromPk(index, pk, mix) {
    const pmax = window.__lastPrPmax;
    if (!(Number.isFinite(pmax) && pmax > 0)) return;
    if (!(index >= 0 && index < theta.knotsR.length)) return;

    const t = (Number.isFinite(mix) ? mix : 1);
    const rk = theta.knotsR[index];
    const rSafe = Math.max(rk, 1e-6);
    const env = Math.pow(rSafe, theta.D) * Math.exp(-theta.alpha * rSafe);
    const fk = Math.log(Math.max(1e-12, pk) + 1e-12) - Math.log(env + 1e-12);
    if (!Number.isFinite(fk)) return;
    const prev = theta.knotsF[index];
    if (Number.isFinite(prev) && t < 1) {
      theta.knotsF[index] = lerp(prev, fk, t);
    } else {
      theta.knotsF[index] = fk;
    }

    if (Array.isArray(theta.knotsP) && index >= 0 && index < theta.knotsP.length) {
      const prevP = theta.knotsP[index];
      if (Number.isFinite(prevP) && t < 1) theta.knotsP[index] = lerp(prevP, pk, t);
      else theta.knotsP[index] = pk;
    }
  }

  function maxFinite(arr) {
    let mx = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (Number.isFinite(v)) mx = Math.max(mx, v);
    }
    return Number.isFinite(mx) ? mx : NaN;
  }

  function buildThetaObj(knotsR, knotsF) {
    return {
      D: theta.D,
      alpha: theta.alpha,
      knotsR: knotsR,
      knotsF: knotsF,
    };
  }

  function maxAbsDiffNorm(pA, pB, denom) {
    const n = Math.min(pA.length, pB.length);
    if (!(Number.isFinite(denom) && denom > 0)) denom = 1;
    let mx = 0;
    for (let i = 0; i < n; i++) {
      const a = pA[i];
      const b = pB[i];
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      mx = Math.max(mx, Math.abs(a - b) / denom);
    }
    return mx;
  }

  function maxAbsDiffLog(pA, pB) {
    const n = Math.min(pA.length, pB.length);
    const EPS = 1e-12;
    let mx = 0;
    for (let i = 0; i < n; i++) {
      const a = pA[i];
      const b = pB[i];
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      const la = Math.log(Math.max(EPS, a));
      const lb = Math.log(Math.max(EPS, b));
      mx = Math.max(mx, Math.abs(la - lb));
    }
    return mx;
  }

  function pruneRedundantKnots() {
    const pr = window.__lastPr;
    const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
    if (!pr || !Array.isArray(pr.r) || pr.r.length < 2) return 0;
    if (!mod || typeof mod.buildPrFromTheta !== "function") return 0;
    if (!Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return 0;
    if (theta.knotsR.length !== theta.knotsF.length) return 0;
    if (theta.knotsR.length <= PRUNE_MIN_KNOTS) return 0;

    const ref = mod.buildPrFromTheta(buildThetaObj(theta.knotsR, theta.knotsF), pr.r);
    if (!ref || !Array.isArray(ref.p)) return 0;
    const pRef = ref.p;
    const pMax = maxFinite(pRef);
    const denom = (Number.isFinite(pMax) && pMax > 0) ? pMax : 1;

    // In log-y modes, compare in log space (roughly relative error), and map the
    // existing relative tolerance to a log tolerance.
    const useLogErr = !!yLog;
    const tolLog = Math.log(1 + PRUNE_TOL_REL);

    let removed = 0;
    while (theta.knotsR.length > PRUNE_MIN_KNOTS && removed < PRUNE_MAX_REMOVALS) {
      let bestIdx = -1;
      let bestErr = Infinity;

      // Try removing each interior knot and keep the best (lowest error).
      for (let i = 1; i < theta.knotsR.length - 1; i++) {
        const candR = theta.knotsR.slice();
        const candF = theta.knotsF.slice();
        candR.splice(i, 1);
        candF.splice(i, 1);

        const cand = mod.buildPrFromTheta(buildThetaObj(candR, candF), pr.r);
        if (!cand || !Array.isArray(cand.p)) continue;

        const err = useLogErr ? maxAbsDiffLog(cand.p, pRef) : maxAbsDiffNorm(cand.p, pRef, denom);
        if (err < bestErr) {
          bestErr = err;
          bestIdx = i;
        }
      }

      const tol = useLogErr ? tolLog : PRUNE_TOL_REL;
      if (bestIdx >= 1 && bestIdx < theta.knotsR.length - 1 && bestErr <= tol) {
        theta.knotsR.splice(bestIdx, 1);
        theta.knotsF.splice(bestIdx, 1);
        if (Array.isArray(theta.knotsP) && bestIdx < theta.knotsP.length) theta.knotsP.splice(bestIdx, 1);
        removed++;
      } else {
        break;
      }
    }

    return removed;
  }

  // Expose a callable action so keyboard shortcuts (Cmd+M) can trigger pruning.
  window.__minimizePrSplineNodes = () => {
    if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();
    pruneRedundantKnots();
    updateFromKnotsF();
  };

  // Expose a callable action so Delete/Backspace can delete the selected knot.
  window.__deletePrSplineKnot = (index) => {
    if (!Number.isFinite(index)) return false;
    const i = index | 0;
    if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();
    if (!deleteKnot(i)) return false;
    updateFromKnotsF();
    return true;
  };

  function clampKnotR(index, rRaw) {
    const pr = window.__lastPr;
    if (!pr || !Array.isArray(pr.r) || pr.r.length < 2) return NaN;
    if (!(index >= 0 && index < theta.knotsR.length)) return NaN;
    if (!(Number.isFinite(rRaw) && rRaw > 0)) return NaN;

    const dr = (Number.isFinite(window.__lastPrDr) && window.__lastPrDr > 0) ? window.__lastPrDr : 1;
    const minSep = Math.max(0.5 * dr, 1e-3);

    const firstMinSep = Math.max(0.15 * dr, 2e-4);
    const lo = (index > 0)
      ? (theta.knotsR[index - 1] + minSep)
      : Math.max(1e-4, Math.min(pr.r[0], 0.25 * dr));
    const hi = (index < theta.knotsR.length - 1)
      ? (theta.knotsR[index + 1] - (index === 0 ? firstMinSep : minSep))
      : (pr.r[pr.r.length - 1] - minSep);
    const rClamped = Math.max(lo, Math.min(hi, rRaw));
    return Number.isFinite(rClamped) ? rClamped : NaN;
  }

  function dataPointToSvg(xData, yData) {
    const s = getSvg();
    if (!s) return null;
    const xmin = numAttr(s, "data-xmin");
    const xmax = numAttr(s, "data-xmax");
    const ymin = numAttr(s, "data-ymin");
    const ymax = numAttr(s, "data-ymax");
    const W = numAttr(s, "data-w");
    const H = numAttr(s, "data-h");
    const padL = numAttr(s, "data-padl");
    const padR = numAttr(s, "data-padr");
    const padT = numAttr(s, "data-padt");
    const padB = numAttr(s, "data-padb");
    if (![xmin, xmax, ymin, ymax, W, H, padL, padR, padT, padB].every(Number.isFinite)) return null;
    if (!(xmax > xmin) || !(ymax > ymin)) return null;
    const xSvg = padL + (xData - xmin) * (W - padL - padR) / (xmax - xmin);
    const ySvg = padT + (ymax - yData) * (H - padT - padB) / (ymax - ymin);
    if (!Number.isFinite(xSvg) || !Number.isFinite(ySvg)) return null;
    return { x: xSvg, y: ySvg };
  }

  function scaledXFromR(rValue) {
    if (!Number.isFinite(rValue) || !(rValue > 0)) return NaN;
    return xLog ? Math.log10(rValue) : rValue;
  }

  function findNearestPrSnapTarget(index, xScaled, yScaled, allowX) {
    const pr = window.__lastPr;
    const pmax = window.__lastPrPmax;
    if (!pr || !Array.isArray(pr.r) || !Array.isArray(pr.p)) return null;
    if (!(Number.isFinite(pmax) && pmax > 0)) return null;

    const xRef = (allowX && Number.isFinite(xScaled)) ? xScaled : scaledXFromR(theta.knotsR[index]);
    if (!Number.isFinite(xRef) || !Number.isFinite(yScaled)) return null;

    const pointerSvg = dataPointToSvg(xRef, yScaled);
    if (!pointerSvg) return null;

    let best = null;
    const n = Math.min(pr.r.length, pr.p.length);
    for (let i = 0; i < n; i++) {
      const rv = pr.r[i];
      const pv = pr.p[i];
      if (!Number.isFinite(rv) || !Number.isFinite(pv)) continue;
      const scaledPt = scalePoint({ x: rv, y: pv / pmax, scale });
      if (!scaledPt) continue;
      const svgPt = dataPointToSvg(scaledPt.x, scaledPt.y);
      if (!svgPt) continue;
      const dx = svgPt.x - pointerSvg.x;
      if (!allowX && Math.abs(dx) > SNAP_X_WINDOW_PX) continue;
      const dy = svgPt.y - pointerSvg.y;
      const dist2 = dx * dx + dy * dy;
      if (!best || dist2 < best.dist2) {
        best = { dist2, xScaled: scaledPt.x, yScaled: scaledPt.y };
      }
    }

    if (!best || best.dist2 > SNAP_RADIUS_PX * SNAP_RADIUS_PX) return null;
    return {
      xScaled: allowX ? best.xScaled : xScaled,
      yScaled: best.yScaled,
    };
  }

  function setKnotFromScaledX(index, xScaled, mix) {
    if (!(index >= 0 && index < theta.knotsR.length)) return;
    const pr = window.__lastPr;
    if (!pr || !Array.isArray(pr.r) || pr.r.length < 2) return;

    const t = (Number.isFinite(mix) ? mix : 1);

    const rRaw = xLog ? Math.pow(10, xScaled) : xScaled;
    if (!(Number.isFinite(rRaw) && rRaw > 0)) return;

    const rClamped = clampKnotR(index, rRaw);
    if (!Number.isFinite(rClamped)) return;
    const prev = theta.knotsR[index];
    if (Number.isFinite(prev) && t < 1) {
      theta.knotsR[index] = lerp(prev, rClamped, t);
    } else {
      theta.knotsR[index] = rClamped;
    }
  }

  function insertKnotFromScaledXY(xScaled, yScaled) {
    const pr = window.__lastPr;
    const pmax = window.__lastPrPmax;
    if (!pr || !Array.isArray(pr.r) || pr.r.length < 2) return false;
    if (!(Number.isFinite(pmax) && pmax > 0)) return false;
    if (!Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return false;

    if (!Number.isFinite(xScaled) || !Number.isFinite(yScaled)) return false;
    const rRaw = xLog ? Math.pow(10, xScaled) : xScaled;
    if (!(Number.isFinite(rRaw) && rRaw > 0)) return false;

    const dr = (Number.isFinite(window.__lastPrDr) && window.__lastPrDr > 0) ? window.__lastPrDr : 1;
    const minSep = Math.max(0.5 * dr, 1e-3);

    // Find sorted insertion index.
    let ins = 0;
    while (ins < theta.knotsR.length && theta.knotsR[ins] < rRaw) ins++;

    const lo = (ins > 0) ? (theta.knotsR[ins - 1] + minSep) : (pr.r[0] + minSep);
    const hi = (ins < theta.knotsR.length) ? (theta.knotsR[ins] - minSep) : (pr.r[pr.r.length - 1] - minSep);
    if (!(hi > lo)) return false;

    const rClamped = Math.max(lo, Math.min(hi, rRaw));
    if (!Number.isFinite(rClamped)) return false;

    const yMin = yLog ? Math.log10(1e-8) : 0;
    const yClamped = Math.max(yMin, yScaled);

    const pn = yLog ? Math.pow(10, yClamped) : yClamped;
    const pnClamped = Math.max(1e-8, pn);
    const rSafe = Math.max(rClamped, 1e-6);
    const env = Math.pow(rSafe, theta.D) * Math.exp(-theta.alpha * rSafe);
    const pk = pnClamped * pmax;
    const fk = Math.log(pk + 1e-12) - Math.log(env + 1e-12);
    if (!Number.isFinite(fk)) return false;

    // Insert into parameter vectors.
    theta.knotsR.splice(ins, 0, rClamped);
    theta.knotsF.splice(ins, 0, fk);
    if (Array.isArray(theta.knotsP)) theta.knotsP.splice(ins, 0, pk);
    return true;
  }

  function deleteKnot(index) {
    if (!Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return false;
    if (!(index >= 0 && index < theta.knotsR.length)) return false;
    // Keep endpoints to maintain boundary behavior.
    if (index === 0 || index === theta.knotsR.length - 1) return false;
    // Keep a minimum number of knots so the curve stays well-behaved.
    if (theta.knotsR.length <= 4) return false;
    theta.knotsR.splice(index, 1);
    theta.knotsF.splice(index, 1);
    if (Array.isArray(theta.knotsP)) theta.knotsP.splice(index, 1);
    return true;
  }

  // Add nodes via mouse: double-click on the plot to insert a knot.
  if (!svg.__hasAddKnotHandler) {
    svg.__hasAddKnotHandler = true;
    svg.addEventListener("dblclick", (e) => {
      // Ignore double-clicks on existing knots.
      if (e.target && e.target.closest && e.target.closest("circle.viz-knot")) return;
      const sp = svgPointFromEvent(e);
      if (!sp) return;
      const xScaled = xSvgToData(sp.x);
      const yScaled = ySvgToData(sp.y);
      if (!Number.isFinite(xScaled) || !Number.isFinite(yScaled)) return;

      // Prevent unbounded knot growth.
      if (theta.knotsR.length >= 40) return;

      if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();
      const ok = insertKnotFromScaledXY(xScaled, yScaled);
      if (!ok) return;
      pruneRedundantKnots();
      updateFromKnotsF();
    });
  }

  for (const c of knots) {
    if (c.__hasKnotHandler) continue;
    c.__hasKnotHandler = true;

    // Delete knot via context menu (right click) or Shift-double-click.
    c.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const idxRaw = c.getAttribute("data-knot-index");
      const idx = idxRaw != null ? parseInt(idxRaw, 10) : NaN;
      if (!Number.isFinite(idx)) return;
      window.__activePrKnotIndex = idx;
      applySelectedKnotVisual();
      if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();
      if (deleteKnot(idx)) updateFromKnotsF();
    });
    c.addEventListener("dblclick", (e) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      const idxRaw = c.getAttribute("data-knot-index");
      const idx = idxRaw != null ? parseInt(idxRaw, 10) : NaN;
      if (!Number.isFinite(idx)) return;
      window.__activePrKnotIndex = idx;
      applySelectedKnotVisual();
      if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();
      if (deleteKnot(idx)) updateFromKnotsF();
    });

    // Click selects a knot (used by Delete/Backspace keyboard shortcut).
    c.addEventListener("click", () => {
      const idxRaw = c.getAttribute("data-knot-index");
      const idx = idxRaw != null ? parseInt(idxRaw, 10) : NaN;
      if (!Number.isFinite(idx)) return;
      window.__activePrKnotIndex = idx;
      applySelectedKnotVisual();
    });

    c.addEventListener("pointerdown", (e) => {
      // Let right-click / two-finger-click trigger `contextmenu` (delete).
      // Also, on macOS let Ctrl+click pass through to context menu.
      if (e && typeof e.button === "number" && e.button !== 0) return;
      if (IS_MAC && e && e.ctrlKey && !e.metaKey) return;

      const idxRaw = c.getAttribute("data-knot-index");
      const idx = idxRaw != null ? parseInt(idxRaw, 10) : NaN;
      if (!Number.isFinite(idx)) return;

      // Track the active knot for keyboard deletion.
      window.__activePrKnotIndex = idx;
      applySelectedKnotVisual();

      // Snapshot once at drag start so Cmd/Ctrl+Z reverts the whole drag.
      if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();

      c.setPointerCapture(e.pointerId);
      e.preventDefault();

      // Track latest pointer target, then apply changes at most once per frame.
      let pending = null;
      let raf = 0;

      const applyPending = () => {
        raf = 0;
        if (!pending) return;
        let {xScaled, yScaled, allowX, along} = pending;
        const smoothX = idx === 0 ? FIRST_KNOT_DRAG_SMOOTH_X : DRAG_SMOOTH_X;
        const smoothY = idx === 0 ? FIRST_KNOT_DRAG_SMOOTH_Y : DRAG_SMOOTH_Y;

        if (!along) {
          const snapped = findNearestPrSnapTarget(idx, xScaled, yScaled, allowX);
          if (snapped) {
            xScaled = snapped.xScaled;
            yScaled = snapped.yScaled;
          }
        }

        // Ctrl/Cmd: move node along the current magenta curve.
        if (along && Number.isFinite(xScaled)) {
          const pr = window.__lastPr;
          const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
          if (pr && mod && typeof mod.buildPrFromTheta === "function") {
            const builtOld = mod.buildPrFromTheta({
              D: theta.D,
              alpha: theta.alpha,
              knotsR: theta.knotsR,
              knotsF: theta.knotsF,
            }, pr.r);

            const rRaw = xLog ? Math.pow(10, xScaled) : xScaled;
            const rClamped = clampKnotR(idx, rRaw);
            if (builtOld && Number.isFinite(rClamped)) {
              const prevR = theta.knotsR[idx];
              const rNew = (Number.isFinite(prevR) ? lerp(prevR, rClamped, smoothX) : rClamped);
              theta.knotsR[idx] = rNew;
              const pk = interpGrid(builtOld.r, builtOld.p, rNew);
              if (Number.isFinite(pk)) setKnotFromPk(idx, pk, 1);
              updateFromKnotsF();
              return;
            }
          }
        }

        // Optional X dragging to control peak positions.
        if (allowX && Number.isFinite(xScaled)) {
          setKnotFromScaledX(idx, xScaled, smoothX);
        }

        // Clamp to keep log-scale valid.
        const yMin = yLog ? Math.log10(1e-8) : 0;
        const yClamped = Math.max(yMin, yScaled);
        setKnotFromScaledY(idx, yClamped, smoothY);
        updateFromKnotsF();
      };

      const onMove = (ev) => {
        const sp = svgPointFromEvent(ev);
        if (!sp) return;
        const yScaled = ySvgToData(sp.y);
        if (!Number.isFinite(yScaled)) return;

        const along = IS_MAC ? !!ev.metaKey : !!(ev.ctrlKey || ev.metaKey);
        const allowX = along || !!(ev.shiftKey || ev.altKey);
        const xScaled = allowX ? xSvgToData(sp.x) : NaN;
        pending = {xScaled, yScaled, allowX, along};

        if (!raf) raf = requestAnimationFrame(applyPending);
      };

      const onUp = (ev) => {
        try { c.releasePointerCapture(ev.pointerId); } catch (_) {}
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        // Apply one final step so we don't leave a stale pending update.
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        // Snap to the final pointer position so the user can precisely reach extrema.
        // Prefer pointerup coordinates (more accurate) and fall back to the last pending move.
        let target = pending;
        const spUp = svgPointFromEvent(ev);
        if (spUp) {
          const yScaledUp = ySvgToData(spUp.y);
          if (Number.isFinite(yScaledUp)) {
            const alongUp = IS_MAC ? !!ev.metaKey : !!(ev.ctrlKey || ev.metaKey);
            const allowXUp = alongUp || !!(ev.shiftKey || ev.altKey);
            const xScaledUp = allowXUp ? xSvgToData(spUp.x) : NaN;
            target = { xScaled: xScaledUp, yScaled: yScaledUp, allowX: allowXUp, along: alongUp };
          }
        }

        if (target) {
          let {xScaled, yScaled, allowX, along} = target;

          if (!along) {
            const snapped = findNearestPrSnapTarget(idx, xScaled, yScaled, allowX);
            if (snapped) {
              xScaled = snapped.xScaled;
              yScaled = snapped.yScaled;
            }
          }

          if (along && Number.isFinite(xScaled)) {
            const pr = window.__lastPr;
            const mod = window.CalyrEvolution && window.CalyrEvolution.prSpline;
            if (pr && mod && typeof mod.buildPrFromTheta === "function") {
              const builtOld = mod.buildPrFromTheta({
                D: theta.D,
                alpha: theta.alpha,
                knotsR: theta.knotsR,
                knotsF: theta.knotsF,
              }, pr.r);

              const rRaw = xLog ? Math.pow(10, xScaled) : xScaled;
              const rClamped = clampKnotR(idx, rRaw);
              if (builtOld && Number.isFinite(rClamped)) {
                theta.knotsR[idx] = rClamped;
                const pk = interpGrid(builtOld.r, builtOld.p, rClamped);
                if (Number.isFinite(pk)) setKnotFromPk(idx, pk, 1);
              }
            }
          }

          if (!along) {
            if (allowX && Number.isFinite(xScaled)) setKnotFromScaledX(idx, xScaled, 1);
            const yMin = yLog ? Math.log10(1e-8) : 0;
            const yClamped = Math.max(yMin, yScaled);
            setKnotFromScaledY(idx, yClamped, 1);
          }

          // "In the end": prune redundant nodes and re-render.
          pruneRedundantKnots();
          updateFromKnotsF();
        }

        // Keep active knot index in a valid range after edits.
        if (Number.isFinite(window.__activePrKnotIndex)) {
          const k = window.__activePrKnotIndex;
          if (!(k >= 0 && k < theta.knotsR.length)) {
            window.__activePrKnotIndex = Math.min(Math.max(0, k), Math.max(0, theta.knotsR.length - 1));
          }
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }
}

function estimateRadiusOfGyration(points) {
  const pts = Array.isArray(points) ? points : [];
  if (!pts.length) return 0;

  let cx = 0;
  let cy = 0;
  let cz = 0;
  let used = 0;
  for (const point of pts) {
    if (!point) continue;
    const { x, y, z } = point;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    cx += x;
    cy += y;
    cz += z;
    used += 1;
  }
  if (!used) return 0;

  cx /= used;
  cy /= used;
  cz /= used;

  let acc = 0;
  for (const point of pts) {
    if (!point) continue;
    const dx = point.x - cx;
    const dy = point.y - cy;
    const dz = point.z - cz;
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) continue;
    acc += dx * dx + dy * dy + dz * dz;
  }

  return Math.sqrt(acc / used);
}

function strideSamplePoints(points, maxCount) {
  const pts = Array.isArray(points) ? points : [];
  const limit = Number.isFinite(maxCount) && maxCount > 0 ? Math.floor(maxCount) : pts.length;
  if (pts.length <= limit) return pts.slice();
  const stride = Math.ceil(pts.length / limit);
  const out = [];
  for (let i = 0; i < pts.length; i += stride) out.push(pts[i]);
  return out;
}

function buildEvolutionSeedBeadsFromPoints(points, maxBeads = 240) {
  const pts = Array.isArray(points) ? points : [];
  const source = pts.filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
  const sampled = strideSamplePoints(source, maxBeads);
  return sampled.map((point) => ({ ...point }));
}

function buildLocalQGrid(rMax, count = 240) {
  const n = Number.isFinite(count) && count > 8 ? Math.floor(count) : 240;
  // Internal scattering code uses Angstrom-based q units. The requested display
  // range is fixed at 0.01..5 1/nm, which is 0.001..0.5 1/Angstrom.
  const qMin = 0.001;
  const qMax = 0.5;
  const q = new Array(n);
  const step = (qMax - qMin) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) q[i] = qMin + step * i;
  return q;
}

function buildDimensionlessIq(iq, rg) {
  const q = (iq && Array.isArray(iq.q)) ? iq.q : [];
  const I = (iq && Array.isArray(iq.I)) ? iq.I : [];
  const n = Math.min(q.length, I.length);
  const safeRg = Number.isFinite(rg) && rg > 0 ? rg : 1;
  const x = new Array(n);
  const y = new Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = q[i] * safeRg;
    y[i] = I[i];
  }
  return { x, y, rg: safeRg };
}

function computeLocalSaxsFromPoints(points, {
  inputKind = "pdb_model",
  source = "browser_local_edit",
  pdbStats = null,
} = {}) {
  const pdd = window.CalyrEvolution && window.CalyrEvolution.pdd;
  const scattering = window.CalyrEvolution && window.CalyrEvolution.scattering;
  if (!pdd || !scattering) {
    throw new Error("Local SAXS modules are not loaded.");
  }

  const computePoints = cloneModelPoints(points).filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
  if (computePoints.length < 2) {
    throw new Error("Not enough coordinates for local scattering.");
  }

  const pr = pdd.computePairDistanceHistogram(computePoints, { binWidth: 0.25, groupField: "ssGroup" });
  const qGrid = buildLocalQGrid(pr && pr.rMax, 480);
  const rawIq = scattering.intensityFromPr(pr, qGrid);
  const normalizedIq = scattering.normalizeIToI0(rawIq);
  const iq = {
    q: normalizedIq.q,
    I: normalizedIq.I,
    I0_raw: normalizedIq.I0,
  };
  const rg = estimateRadiusOfGyration(computePoints);
  const dim = buildDimensionlessIq(iq, rg);

  return {
    engine: "local_pdb_scattering",
    result: {
      steps: [
        { name: "homepage", status: "done" },
        { name: "pdb_model", status: "done" },
        { name: "p(r)", status: "done" },
        { name: "scattering", status: "done" },
        { name: "result", status: "done" },
      ],
      input_kind: inputKind,
      pdb_stats: pdbStats || {
        n_atoms_total: computePoints.length,
        n_atoms_used: computePoints.length,
        approx: false,
        r_max_est: pr && Number.isFinite(pr.rMax) ? pr.rMax : null,
        rg_est: rg,
        bins: pr && Array.isArray(pr.r) ? pr.r.length : 0,
        pr_bin_width: pr && Number.isFinite(pr.binWidth) ? pr.binWidth : null,
        q_range_inv_nm: [0.01, 5.0],
        q_range_inv_angstrom: [0.001, 0.5],
      },
      pr,
      iq,
      dim,
      source,
    },
  };
}

function computeLocalSaxsFromPdbText(text) {
  const pdd = window.CalyrEvolution && window.CalyrEvolution.pdd;
  const scattering = window.CalyrEvolution && window.CalyrEvolution.scattering;
  if (!pdd || !scattering) {
    throw new Error("Local SAXS modules are not loaded.");
  }

  const secondaryStructure = parsePdbSecondaryStructure(text);
  const previewPoints = annotatePointsWithSecondaryStructure(parsePdbPoints(text), secondaryStructure);
  const computePoints = annotatePointsWithSecondaryStructure(parsePdbPoints(text, 1600), secondaryStructure);
  if (computePoints.length < 2) {
    throw new Error("Not enough PDB coordinates for local scattering.");
  }

  const pr = pdd.computePairDistanceHistogram(computePoints, { binWidth: 0.25, groupField: "ssGroup" });
  const qGrid = buildLocalQGrid(pr && pr.rMax, 480);
  const rawIq = scattering.intensityFromPr(pr, qGrid);
  const normalizedIq = scattering.normalizeIToI0(rawIq);
  const iq = {
    q: normalizedIq.q,
    I: normalizedIq.I,
    I0_raw: normalizedIq.I0,
  };
  const rg = estimateRadiusOfGyration(computePoints);
  const dim = buildDimensionlessIq(iq, rg);

  return {
    engine: "local_pdb_scattering",
    result: {
      steps: [
        { name: "homepage", status: "done" },
        { name: "pdb_model", status: "done" },
        { name: "p(r)", status: "done" },
        { name: "scattering", status: "done" },
        { name: "result", status: "done" },
      ],
      input_kind: "pdb",
      pdb_preview: text.slice(0, 240),
      pdb_stats: {
        n_atoms_total: previewPoints.length,
        n_atoms_used: computePoints.length,
        approx: computePoints.length < previewPoints.length,
        r_max_est: pr && Number.isFinite(pr.rMax) ? pr.rMax : null,
        rg_est: rg,
        bins: pr && Array.isArray(pr.r) ? pr.r.length : 0,
        pr_bin_width: pr && Number.isFinite(pr.binWidth) ? pr.binWidth : null,
        q_range_inv_nm: [0.01, 5.0],
        q_range_inv_angstrom: [0.001, 0.5],
      },
      pr,
      iq,
      dim,
      source: "browser_local",
    },
  };
}

function renderBasicSaxsPreview(iq, pr) {
  if (typeof renderLinePlot !== "function") return;
  const pddIq = buildForwardIqFromPr(pr, iq && Array.isArray(iq.q) ? iq.q : []) || iq;
  const I0Ref = resolveIqI0Reference(pddIq);

  if (pddIq && Array.isArray(pddIq.q) && Array.isArray(pddIq.I)) {
    const iqPlot = transformIqForPlot(pddIq, { I0Override: I0Ref });
    const overlays = [];
    const overlayIq = window.__lastIqFromPrSpline;
    if (overlayIq && Array.isArray(overlayIq.q) && Array.isArray(overlayIq.I)) {
      const overlayPlot = transformIqForPlot(overlayIq, { I0Override: I0Ref });
      overlays.push({ x: overlayPlot.x, y: overlayPlot.y, className: "viz-line viz-line--magenta", stroke: "#ff00ff", strokeWidth: 2.4, opacity: 1, style: "stroke: #ff00ff !important; stroke-width: 2.4 !important; opacity: 1 !important; fill: none !important;" });
    }
    renderLinePlot({
      x: iqPlot.x,
      y: iqPlot.y,
      title: iqPlot.title,
      hostId: "iqPreview",
      mode: "line",
      overlays,
      lineClassName: "viz-line",
      lineStroke: "#24f3ff",
      lineStrokeWidth: 2,
      lineOpacity: 1,
      lineStyle: "stroke: #24f3ff !important; stroke-width: 2 !important; opacity: 1 !important; fill: none !important;",
    });
  }

  if (pr && Array.isArray(pr.r) && Array.isArray(pr.p)) {
    let pmax = 0;
    for (let i = 0; i < pr.p.length; i++) {
      const value = pr.p[i];
      if (Number.isFinite(value)) pmax = Math.max(pmax, value);
    }
    const normalized = pmax > 0 ? pr.p.map((value) => (Number.isFinite(value) ? value / pmax : value)) : pr.p.slice();
    const scale = getScaleSelectValue("prScaleSelect", "lin-lin");
    const scaled = applyAxisScale({ x: pr.r, y: normalized, scale });
    const scaleLabel = (
      scale === "lin-lin" ? "linear" :
      scale === "log-lin" ? "log x" :
      scale === "lin-log" ? "log y" :
      "log-log"
    );
    renderLinePlot({
      x: scaled.x,
      y: scaled.y,
      title: `Normalized PDD p(r) / max (${scaleLabel})`,
      hostId: "prPreview",
      mode: "line",
      markers: [],
      lineClassName: "viz-line viz-line--data",
    });
  }

  if (iq && pr && typeof renderSaxsCartoon === "function") {
    renderSaxsCartoon({ iq, pr, title: "SAXS (cartoon)", hostId: "viz" });
  }
}

function applySaxsResult(result, { allowAdvanced = true } = {}) {
  if (result && result.result && result.result.steps) {
    renderPipeline(result.result.steps);
  }

  const output = document.getElementById("output");
  if (output) output.textContent = JSON.stringify(result, null, 2);

  const iq = result && result.result && result.result.iq;
  const pr = result && result.result && result.result.pr;
  const dim = result && result.result && result.result.dim;

  if (iq && Array.isArray(iq.q) && Array.isArray(iq.I)) window.__lastIq = iq;
  if (pr && Array.isArray(pr.r) && Array.isArray(pr.p)) window.__lastPr = pr;
  if (dim && Array.isArray(dim.x) && Array.isArray(dim.y)) window.__lastDim = dim;
  window.__lastIqFromPr = buildForwardIqFromPr(pr, iq && Array.isArray(iq.q) ? iq.q : []);
  window.__lastIqFromPrSpline = null;
  window.__lastPrSplineComponents = null;

  resetLinePlotViewIfAvailable("iqPreview");
  resetLinePlotViewIfAvailable("prPreview");

  if (!allowAdvanced) {
    renderBasicSaxsPreview(iq, pr);
    updatePrFitSummary();
    return;
  }

  try {
    updateConstrainedPrSplineFromLast({ fitTarget: "pr" });
    renderIqFromLast();
    renderPrFromLast();
    if (iq && pr && typeof renderSaxsCartoon === "function") {
      renderSaxsCartoon({ iq, pr, title: "SAXS (cartoon)", hostId: "viz" });
    }
  } catch (_) {
    window.__lastIqFromPr = buildForwardIqFromPr(pr, iq && Array.isArray(iq.q) ? iq.q : []);
    window.__lastPrSpline = null;
    window.__lastPrSplineTheta = null;
    window.__lastIqFromPrSpline = null;
    renderBasicSaxsPreview(iq, pr);
    updatePrFitSummary();
  }
}

async function computePdbFromText({title}) {
  const text = getPdbText();
  if (!text.trim()) {
    setPdbStatus("No PDB text.");
    return;
  }

  const secondaryStructure = parsePdbSecondaryStructure(text);
  const computePoints = annotatePointsWithSecondaryStructure(parsePdbPoints(text, 1600), secondaryStructure);
  const editablePoints = buildEvolutionSeedBeadsFromPoints(computePoints, 1600);
  window.__lastPdbEvolutionSeed = cloneModelPoints(editablePoints);
  setPdbStatus(`Parsed ${editablePoints.length} model points…`);

  if (typeof renderPdbCircles === "function") {
    renderPdbCircles({
      points: editablePoints,
      secondaryStructure,
      title: title || "PDB model (drag to rotate)",
      hostId: "pdbPreview",
      editable: true,
      onPointsChange: handleEditableModelPointsChange,
    });
  }

  try {
    setPdbStatus("Computing locally…");
    const result = computeLocalSaxsFromPdbText(text);
    applySaxsResult(result, { allowAdvanced: true });
    setPdbStatus("Done (local PDB -> p(r) -> I(q)).");
  } catch (err) {
    try {
      setPdbStatus("Local compute failed, trying backend…");
      renderPipeline([
        {name: "homepage", status: "done"},
        {name: "nexus", status: "active"},
        {name: "bmca", status: "pending"}
      ]);
      const result = await sendToNexus({kind: "pdb", pdb_text: text});
      applySaxsResult(result, { allowAdvanced: true });
      setPdbStatus("Done (backend).");
    } catch (backendErr) {
      setPdbStatus("Compute failed.");
      const out = document.getElementById("output");
      if (out) {
        out.textContent = JSON.stringify({
          local_error: String(err && err.message ? err.message : err),
          backend_error: String(backendErr && backendErr.message ? backendErr.message : backendErr),
        }, null, 2);
      }
    }
  }
}

function loadPdbModelFromText({ title } = {}) {
  const text = getPdbText();
  if (!text.trim()) {
    setPdbStatus("No PDB text.");
    return false;
  }

  const secondaryStructure = parsePdbSecondaryStructure(text);
  const computePoints = annotatePointsWithSecondaryStructure(parsePdbPoints(text, 1600), secondaryStructure);
  const editablePoints = buildEvolutionSeedBeadsFromPoints(computePoints, 1600);
  window.__lastPdbEvolutionSeed = cloneModelPoints(editablePoints);

  if (typeof renderPdbCircles === "function") {
    renderPdbCircles({
      points: editablePoints,
      secondaryStructure,
      title: title || "PDB model (drag to rotate)",
      hostId: "pdbPreview",
      editable: true,
      onPointsChange: handleEditableModelPointsChange,
    });
  }

  setPdbStatus(`Loaded ${editablePoints.length} model points.`);
  return true;
}

function normalizePdbId(raw) {
  return String(raw || "").trim().toUpperCase();
}

async function rcsbEntryExists(pdbId) {
  const query = `query structure($id: String!) { entry(entry_id: $id) { rcsb_id } }`;
  const res = await fetch("https://data.rcsb.org/graphql", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({query, variables: {id: pdbId}})
  });
  if (!res.ok) {
    throw new Error(`RCSB GraphQL error: HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors && json.errors.length) {
    return false;
  }
  return !!(json.data && json.data.entry && json.data.entry.rcsb_id);
}

async function fetchPdbTextFromRcsb(pdbId) {
  const url = `https://files.rcsb.org/download/${encodeURIComponent(pdbId)}.pdb`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PDB download failed: HTTP ${res.status}`);
  }
  return await res.text();
}

async function loadPdbById() {
  const input = document.getElementById("pdbIdInput");
  const raw = input ? input.value : "";
  const pdbId = normalizePdbId(raw);
  if (!pdbId) return;

  try {
    setPdbStatus("Checking RCSB…");
    const ok = await rcsbEntryExists(pdbId);
    if (!ok) {
      setPdbStatus("Not found.");
      return;
    }

    setPdbStatus("Downloading PDB…");
    const text = await fetchPdbTextFromRcsb(pdbId);

    setPdbText(text);

    // Load and render the PDB first; computing SAXS stays an explicit step.
    loadPdbModelFromText({title: `${pdbId} (drag to rotate)`});
    return;
  } catch (err) {
    setPdbStatus("Load failed.");
    const out = document.getElementById("output");
    if (out) {
      out.textContent = JSON.stringify({error: String(err && err.message ? err.message : err)}, null, 2);
    }
  }
}

// Hook up the optional PDB ID loader controls.
(() => {
  const btn = document.getElementById("pdbLoadBtn");
  const computeBtn = document.getElementById("pdbComputeBtn");
  const input = document.getElementById("pdbIdInput");
  const pdbText = document.getElementById("pdbText");
  if (btn) btn.addEventListener("click", loadPdbById);
  if (computeBtn) computeBtn.addEventListener("click", () => computePdbFromText({title: "PDB (drag to rotate)"}));
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") loadPdbById();
    });
  }
  if (pdbText) {
    pdbText.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        computePdbFromText({title: "PDB (drag to rotate)"});
      }
    });
  }
})();

// Re-render I(q) when plot controls change.
(() => {
  const curveSel = document.getElementById("iqCurveSelect");
  const scaleSel = document.getElementById("iqScaleSelect");
  const rerender = () => {
    resetLinePlotViewIfAvailable("iqPreview");
    renderIqFromLast();
  };
  if (curveSel) curveSel.addEventListener("change", rerender);
  if (scaleSel) scaleSel.addEventListener("change", rerender);
})();

(() => {
  if (typeof window.setLinePlotRerender === "function") {
    window.setLinePlotRerender("iqPreview", renderIqFromLast);
    window.setLinePlotRerender("prPreview", renderPrFromLast);
  }
})();

// Cmd+M: minimize the number of spline nodes (p(r) magenta fit).
(() => {
  if (window.__hasMinimizeNodesKeyHandler) return;
  window.__hasMinimizeNodesKeyHandler = true;
  window.addEventListener("keydown", (e) => {
    // macOS: Command+M.
    if (!(e && e.metaKey)) return;
    const k = String(e.key || "");
    if (!(k === "m" || k === "M")) return;
    const fn = window.__minimizePrSplineNodes;
    if (typeof fn !== "function") return;
    e.preventDefault();
    e.stopPropagation();
    fn();
  }, { capture: true });
})();

// Undo for constrained p(r) spline edits (drag/insert/delete/minimize/refit): Cmd/Ctrl+Z.
(() => {
  if (window.__hasPrSplineUndoHandler) return;
  window.__hasPrSplineUndoHandler = true;

  const MAX_UNDO = 60;
  const undoStack = [];

  function clonePrLike(series) {
    if (!series || typeof series !== "object") return null;
    return {
      ...series,
      r: Array.isArray(series.r) ? series.r.slice() : [],
      p: Array.isArray(series.p) ? series.p.slice() : [],
    };
  }

  function cloneIqLike(series) {
    if (!series || typeof series !== "object") return null;
    return {
      ...series,
      q: Array.isArray(series.q) ? series.q.slice() : [],
      I: Array.isArray(series.I) ? series.I.slice() : [],
    };
  }

  function cloneTheta(theta) {
    if (!theta || !Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return null;
    return {
      D: theta.D,
      alpha: theta.alpha,
      knotsR: theta.knotsR.slice(),
      knotsF: theta.knotsF.slice(),
      knotsP: Array.isArray(theta.knotsP) ? theta.knotsP.slice() : [],
    };
  }

  function cloneComponentFits(components) {
    const entries = Array.isArray(components) ? components : [];
    return entries.map((entry) => ({
      ...entry,
      raw: clonePrLike(entry && entry.raw),
      pr: clonePrLike(entry && entry.pr),
      theta: cloneTheta(entry && entry.theta),
      thetaFull: cloneTheta(entry && entry.thetaFull),
    }));
  }

  function snapshotFitState() {
    const theta = window.__lastPrSplineTheta;
    if (!theta || !Array.isArray(theta.knotsR) || !Array.isArray(theta.knotsF)) return null;
    return {
      fitTarget: String(window.__lastPrFitTarget || "pr"),
      theta: cloneTheta(window.__lastPrSplineTheta),
      thetaFull: cloneTheta(window.__lastPrSplineThetaFull),
      prSpline: clonePrLike(window.__lastPrSpline),
      iqFromPrSpline: cloneIqLike(window.__lastIqFromPrSpline),
      components: cloneComponentFits(window.__lastPrSplineComponents),
      prDr: Number.isFinite(window.__lastPrDr) ? window.__lastPrDr : null,
      activePrKnotIndex: Number.isFinite(window.__activePrKnotIndex) ? window.__activePrKnotIndex : NaN,
    };
  }

  function applyFitStateSnapshot(snap) {
    if (!snap || !snap.theta) return false;
    window.__lastPrFitTarget = String(snap.fitTarget || "pr");
    window.__lastPrSplineTheta = cloneTheta(snap.theta);
    window.__lastPrSplineThetaFull = cloneTheta(snap.thetaFull);
    window.__lastPrSpline = clonePrLike(snap.prSpline);
    window.__lastIqFromPrSpline = cloneIqLike(snap.iqFromPrSpline);
    window.__lastPrSplineComponents = cloneComponentFits(snap.components);
    window.__lastPrDr = Number.isFinite(snap.prDr) ? snap.prDr : window.__lastPrDr;
    window.__activePrKnotIndex = Number.isFinite(snap.activePrKnotIndex) ? snap.activePrKnotIndex : NaN;
    return true;
  }

  // Called by edit actions to record the pre-edit state.
  window.__pushPrSplineUndoSnapshot = () => {
    const snap = snapshotFitState();
    if (!snap) return;
    undoStack.push(snap);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
  };

  function performUndo() {
    if (!undoStack.length) return false;
    const snap = undoStack.pop();
    if (!applyFitStateSnapshot(snap)) return false;
    if (typeof renderPrFromLast === "function") renderPrFromLast();
    if (typeof renderIqFromLast === "function") renderIqFromLast();
    return true;
  }

  window.addEventListener("keydown", (e) => {
    const isMac = !!(e && e.metaKey);
    const isNonMac = !!(e && e.ctrlKey);
    if (!(isMac || isNonMac)) return;
    const key = String(e.key || "");
    if (!(key === "z" || key === "Z")) return;

    // Don't hijack typing in inputs.
    const t = e && e.target;
    const tag = t && t.tagName ? String(t.tagName).toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (t && t.isContentEditable) return;

    // Keep browser redo (Cmd+Shift+Z) untouched.
    if (e.shiftKey) return;

    const ok = performUndo();
    if (!ok) return;
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true });
})();

// Delete/Backspace: delete the currently selected p(r) knot.
(() => {
  if (window.__hasDeleteKnotKeyHandler) return;
  window.__hasDeleteKnotKeyHandler = true;
  window.addEventListener("keydown", (e) => {
    const key = String(e && e.key ? e.key : "");
    if (!(key === "Backspace" || key === "Delete")) return;

    // Don't hijack typing in inputs.
    const t = e && e.target;
    const tag = t && t.tagName ? String(t.tagName).toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (t && t.isContentEditable) return;

    const idx = window.__activePrKnotIndex;
    const del = window.__deletePrSplineKnot;
    if (!Number.isFinite(idx) || typeof del !== "function") return;
    const ok = del(idx);
    if (!ok) return;
    e.preventDefault();
  }, { capture: true });
})();

(() => {
  const prScaleSel = document.getElementById("prScaleSelect");
  if (prScaleSel) {
    prScaleSel.addEventListener("change", () => {
      resetLinePlotViewIfAvailable("prPreview");
      renderPrFromLast();
    });
  }

  function rerunConstrainedSplineFit(fitTarget) {
    try {
      if (typeof window.__pushPrSplineUndoSnapshot === "function") window.__pushPrSplineUndoSnapshot();
      window.__activePrKnotIndex = NaN;
      updateConstrainedPrSplineFromLast({ fitTarget });
      renderPrFromLast();
      renderIqFromLast();
    } catch (_) {
      // no-op
    }
  }

  const iqRefitBtn = document.getElementById("iqRefitBtn");
  if (iqRefitBtn) {
    iqRefitBtn.addEventListener("click", () => {
      rerunConstrainedSplineFit("iq");
    });
  }

  const prRefitBtn = document.getElementById("prRefitBtn");
  if (prRefitBtn) {
    prRefitBtn.addEventListener("click", () => {
      rerunConstrainedSplineFit("pr");
    });
  }
})();

setupDrop("pdbText", async (file) => {
  const text = await file.text();
  setPdbText(text);
  await computePdbFromText({title: "PDB (drag to rotate)"});
});

function setEvolutionStatus(msg) {
  const el = document.getElementById("evoStatus");
  if (el) el.textContent = msg || "";
}

function handleEditableModelPointsChange(points) {
  const modelPoints = cloneModelPoints(points);
  window.__lastPdbEvolutionSeed = cloneModelPoints(modelPoints);
  try {
    const result = computeLocalSaxsFromPoints(modelPoints, {
      inputKind: "edited_pdb_model",
      source: "browser_local_edit",
    });
    applySaxsResult(result, { allowAdvanced: true });
    setPdbStatus(`Edited model · ${modelPoints.length} points`);
  } catch (_) {
    setPdbStatus("Edit update failed.");
  }
}

function renderBeadsInPdbPreview(beads, title) {
  if (typeof renderPdbCircles !== "function") return;
  if (!Array.isArray(beads) || beads.length < 1) return;
  const modelPoints = cloneModelPoints(beads);
  window.__lastPdbEvolutionSeed = cloneModelPoints(modelPoints);
  renderPdbCircles({
    points: modelPoints,
    secondaryStructure: null,
    title: title || "Bead model (drag to rotate)",
    hostId: "pdbPreview",
    editable: true,
    onPointsChange: handleEditableModelPointsChange,
  });
}

function buildExpIqFromLast() {
  const iq = window.__lastIq;
  if (!iq || !Array.isArray(iq.q) || !Array.isArray(iq.I) || iq.q.length < 2) return null;
  const q = iq.q.slice();
  const Iraw = iq.I.slice();
  const n = Math.min(q.length, Iraw.length);

  const I0 = resolveIqI0Reference(iq);

  const I = [];
  const dI = [];
  for (let i = 0; i < n; i++) {
    const qv = q[i];
    const Iv = Iraw[i];
    if (!Number.isFinite(qv) || !Number.isFinite(Iv)) continue;
    I.push(Iv / I0);
    dI.push(1);
  }

  return { q: q.slice(0, I.length), I, dI };
}

function transformModelIqForPlot(modelIq, opts = null) {
  const q = (modelIq && Array.isArray(modelIq.q)) ? modelIq.q : [];
  const I = (modelIq && Array.isArray(modelIq.I)) ? modelIq.I : [];
  const n = Math.min(q.length, I.length);
  if (n < 2) return { x: [], y: [], title: "Evolution model" };

  const { curve, scale } = getIqPlotSettings();
  const xs = [];
  const ys = [];

  const I0Override = (opts && Number.isFinite(opts.I0Override) && opts.I0Override > 0) ? opts.I0Override : null;
  const I0 = I0Override != null ? I0Override : resolveIqI0Reference(modelIq);

  for (let i = 0; i < n; i++) {
    const qv = q[i];
    const Iv = I[i];
    if (!Number.isFinite(qv) || !Number.isFinite(Iv)) continue;
    const In = Iv / I0;
    xs.push(qv);
    ys.push((curve === "q2I") ? (In * qv * qv) : In);
  }

  const scaled = applyAxisScale({ x: xs, y: ys, scale });
  const curveLabel = curve === "q2I" ? "Evolution q²·I(q) / I(0)" : "Evolution I(q) / I(0)";
  const scaleLabel = (
    scale === "lin-lin" ? "linear" :
    scale === "log-lin" ? "log x" :
    scale === "lin-log" ? "log y" :
    "log–log"
  );
  return { x: scaled.x, y: scaled.y, title: `${curveLabel} (${scaleLabel})` };
}

async function runEvolutionFromLastIq() {
  if (window.__evoRunning) return;

  const btn = document.getElementById("evoRunBtn");
  const out = document.getElementById("output");
  const ui = window.CalyrEvolution && window.CalyrEvolution.ui;
  const runner = ui && (ui.runEvolutionAsync || ui.runEvolution);

  if (!runner) {
    setEvolutionStatus("Evolution modules not loaded.");
    return;
  }

  const expIq = buildExpIqFromLast();
  if (!expIq) {
    setEvolutionStatus("Compute a PDB first (need I(q)).");
    return;
  }

  window.__evoRunning = true;
  if (btn) btn.disabled = true;
  setEvolutionStatus("Running evolution…");

  try {
    const initialBeads = Array.isArray(window.__lastPdbEvolutionSeed) ? window.__lastPdbEvolutionSeed : null;
    if (!initialBeads || initialBeads.length < 5) {
      setEvolutionStatus("Need a PDB-derived bead seed first.");
      return;
    }
    const options = {
      generations: 80,
      populationSize: 20,
      beadsN: initialBeads.length,
      initialBeads,
      initRadius: 30,
      seed: 1,
      yieldEveryGen: 1,
      onProgress: ({ gen, best, history }) => {
        if (gen % 2 === 0) {
          const chi2 = best && best.eval ? best.eval.chi2_I : NaN;
          const prior = best && best.eval ? best.eval.prior : NaN;
          setEvolutionStatus(`gen ${gen} · chi² ${Number.isFinite(chi2) ? chi2.toFixed(2) : "?"} · prior ${Number.isFinite(prior) ? prior.toFixed(2) : "?"}`);
          if (typeof renderLinePlot === "function") {
            const tr = transformModelIqForPlot(best && best.iq, { I0Override: resolveIqI0Reference(window.__lastIq) });
            renderLinePlot({ x: tr.x, y: tr.y, title: tr.title, hostId: "viz", mode: "line" });
          }
          if (best && Array.isArray(best.beads)) {
            renderBeadsInPdbPreview(best.beads, `Annealed PDB · gen ${gen} (drag to rotate)`);
          }
        }
        window.__lastEvolution = { best, history };
      },
    };

    const res = (ui.runEvolutionAsync) ? await ui.runEvolutionAsync(expIq, options) : ui.runEvolution(expIq, options);
    window.__lastEvolution = res;

    const best = res && res.best;
    if (best && Array.isArray(best.beads)) {
      renderBeadsInPdbPreview(best.beads, "Annealed PDB model (drag to rotate)");
    }
    const summary = {
      evolution: {
        generations: (res && res.history && res.history.length) ? res.history.length : null,
        best: best && best.eval ? {
          chi2_I: best.eval.chi2_I,
          prior: best.eval.prior,
          scale: best.eval.scale,
          logPost: best.eval.logPost,
        } : null,
      },
    };
    if (out) out.textContent = JSON.stringify(summary, null, 2);
    setEvolutionStatus("Done.");
  } catch (err) {
    setEvolutionStatus("Evolution failed.");
    if (out) out.textContent = JSON.stringify({ error: String(err && err.message ? err.message : err) }, null, 2);
  } finally {
    window.__evoRunning = false;
    if (btn) btn.disabled = false;
  }
}

async function runMdRelaxFromLastEvolution() {
  if (window.__mdRunning) return;

  const btn = document.getElementById("mdRunBtn");
  const out = document.getElementById("output");
  const md = window.CalyrEvolution && window.CalyrEvolution.md;
  if (!md || typeof md.runMDAsync !== "function") {
    setEvolutionStatus("MD module not loaded.");
    return;
  }

  const expIq = buildExpIqFromLast();
  if (!expIq) {
    setEvolutionStatus("Compute a PDB first (need I(q)).");
    return;
  }

  const last = window.__lastEvolution;
  const evolvedBeads = last && last.best && Array.isArray(last.best.beads) ? last.best.beads : null;
  const pdbSeedBeads = Array.isArray(window.__lastPdbEvolutionSeed) ? window.__lastPdbEvolutionSeed : null;
  const beads = evolvedBeads && evolvedBeads.length >= 5 ? evolvedBeads : pdbSeedBeads;
  if (!beads || beads.length < 5) {
    setEvolutionStatus("Load a PDB first (need model beads).");
    return;
  }

  window.__mdRunning = true;
  if (btn) btn.disabled = true;
  setEvolutionStatus("MD relaxing…");

  try {
    let lastRender = 0;
    const res = await md.runMDAsync(beads, {
      steps: 1200,
      dt: 0.02,
      gamma: 0.65,
      kT: 0.04,
      seed: 123,
      yieldEvery: 12,
      onProgress: ({ step, steps, ke, beads: curBeads }) => {
        const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        if (now - lastRender < 120) return;
        lastRender = now;
        setEvolutionStatus(`MD ${step}/${steps} · KE ${Number.isFinite(ke) ? ke.toFixed(2) : "?"}`);
        window.__lastMd = { beads: curBeads };
        renderBeadsInPdbPreview(curBeads, `MD-relaxed PDB · ${step}/${steps} (drag to rotate)`);
      },
    });

    const relaxed = res && Array.isArray(res.beads) ? res.beads : beads;
    window.__lastMd = { beads: relaxed };
    renderBeadsInPdbPreview(relaxed, "MD-relaxed PDB model (drag to rotate)");

    // Forward model: beads -> P(r) -> I(q) on the exp q-grid
    const pdd = window.CalyrEvolution && window.CalyrEvolution.pdd;
    const scat = window.CalyrEvolution && window.CalyrEvolution.scattering;
    if (!pdd || !scat) throw new Error("Missing pdd/scattering");
    const pr = pdd.computePairDistanceHistogram(relaxed, { binWidth: 1.0 });
    const iq = scat.intensityFromPr(pr, expIq.q);

    if (typeof renderLinePlot === "function") {
      const tr = transformModelIqForPlot(iq, { I0Override: resolveIqI0Reference(window.__lastIq) });
      renderLinePlot({ x: tr.x, y: tr.y, title: `MD relaxed · ${tr.title}`, hostId: "viz", mode: "line" });
    }

    if (out) out.textContent = JSON.stringify({ md: { steps: 1200, dt: 0.02 }, pr: { n: pr.r.length }, iq: { n: iq.q.length } }, null, 2);
    setEvolutionStatus("MD done.");
  } catch (err) {
    setEvolutionStatus("MD failed.");
    if (out) out.textContent = JSON.stringify({ error: String(err && err.message ? err.message : err) }, null, 2);
  } finally {
    window.__mdRunning = false;
    if (btn) btn.disabled = false;
  }
}

(() => {
  const btn = document.getElementById("evoRunBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // Let the status paint before kicking off compute.
    setTimeout(() => { runEvolutionFromLastIq(); }, 0);
  });
})();

(() => {
  const btn = document.getElementById("mdRunBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    setTimeout(() => { runMdRelaxFromLastEvolution(); }, 0);
  });
})();
