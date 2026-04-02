(function () {
  "use strict";

  const AA_ELECTRONS = Object.freeze({
    A: 38, R: 95, N: 58, D: 59, C: 54,
    Q: 72, E: 73, G: 30, H: 82, I: 62,
    L: 62, K: 73, M: 70, F: 88, P: 50,
    S: 46, T: 54, W: 108, Y: 94, V: 54,
  });

  function normalizeSequence(sequence) {
    if (Array.isArray(sequence)) return sequence.map((value) => String(value || "").trim().toUpperCase()).filter(Boolean);
    return String(sequence || "").replace(/\s+/g, "").toUpperCase().split("").filter(Boolean);
  }

  function toDomainKey(a, b) {
    const sa = String(a);
    const sb = String(b);
    return sa <= sb ? `${sa}-${sb}` : `${sb}-${sa}`;
  }

  function makeRGrid(bins, dr) {
    const r = new Array(bins);
    for (let i = 0; i < bins; i++) r[i] = (i + 0.5) * dr;
    return r;
  }

  function gaussianCoil(r, Rg) {
    const rr = Number.isFinite(r) ? r : 0;
    const rg = Number.isFinite(Rg) && Rg > 0 ? Rg : 1;
    return rr * rr * Math.exp(-(rr * rr) / (2 * rg * rg));
  }

  function normalize(arr) {
    if (!Array.isArray(arr)) return arr;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (Number.isFinite(value)) sum += value;
    }
    if (!(sum > 0)) return arr;
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      arr[i] = Number.isFinite(value) ? value / sum : 0;
    }
    return arr;
  }

  function assignSequenceToDots(dots, sequence, domainMap) {
    const pts = Array.isArray(dots) ? dots : [];
    const seq = normalizeSequence(sequence);
    if (!pts.length || !seq.length) return pts;

    const domains = Array.isArray(domainMap) ? domainMap : [];
    for (let i = 0; i < pts.length; i++) {
      const dot = pts[i];
      if (!dot || typeof dot !== "object") continue;
      const seqIndex = i % seq.length;
      const aa = seq[seqIndex];
      dot.aa = aa;
      dot.weight = AA_ELECTRONS[aa] || 50;
      dot.group = (seqIndex < domains.length) ? domains[seqIndex] : 0;
      dot.coil = aa === "G" || aa === "P";
    }
    return pts;
  }

  function computeCalyrPDD(dots, opts = {}) {
    const pts = Array.isArray(dots) ? dots : [];
    const bins = Number.isFinite(opts.bins) && opts.bins > 0 ? Math.max(4, Math.floor(opts.bins)) : 120;
    const maxR = Number.isFinite(opts.maxR) && opts.maxR > 0 ? opts.maxR : 400;
    const Rg = Number.isFinite(opts.Rg) && opts.Rg > 0 ? opts.Rg : 40;
    const coilWeight = Number.isFinite(opts.coilWeight) ? opts.coilWeight : 0.2;
    const dr = maxR / bins;
    const r = makeRGrid(bins, dr);

    const total = new Array(bins).fill(0);
    const coil = new Array(bins).fill(0);
    const self = Object.create(null);
    const cross = Object.create(null);

    const domains = [];
    const seenDomains = new Set();
    for (let i = 0; i < pts.length; i++) {
      const dot = pts[i];
      if (!dot) continue;
      const group = dot.group != null ? dot.group : 0;
      const key = String(group);
      if (seenDomains.has(key)) continue;
      seenDomains.add(key);
      domains.push(group);
      self[key] = new Array(bins).fill(0);
    }

    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        cross[toDomainKey(domains[i], domains[j])] = new Array(bins).fill(0);
      }
    }

    let weightedPairs = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      if (!a) continue;
      const ax = Number.isFinite(a.x) ? a.x : 0;
      const ay = Number.isFinite(a.y) ? a.y : 0;
      const az = Number.isFinite(a.z) ? a.z : 0;
      const ag = a.group != null ? a.group : 0;
      const agKey = String(ag);
      const aw = Number.isFinite(a.weight) ? a.weight : 50;

      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        if (!b) continue;
        const bx = Number.isFinite(b.x) ? b.x : 0;
        const by = Number.isFinite(b.y) ? b.y : 0;
        const bz = Number.isFinite(b.z) ? b.z : 0;
        const bg = b.group != null ? b.group : 0;
        const bgKey = String(bg);
        const bw = Number.isFinite(b.weight) ? b.weight : 50;

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const rij = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (!Number.isFinite(rij)) continue;

        const bin = Math.floor(rij / dr);
        if (bin < 0 || bin >= bins) continue;

        const weight = aw * bw;
        total[bin] += weight;
        weightedPairs += weight;

        if (agKey === bgKey) {
          if (!self[agKey]) self[agKey] = new Array(bins).fill(0);
          self[agKey][bin] += weight;
        } else {
          const key = toDomainKey(ag, bg);
          if (!cross[key]) cross[key] = new Array(bins).fill(0);
          cross[key][bin] += weight;
        }

        if (a.coil || b.coil) coil[bin] += weight;
      }
    }

    for (let i = 0; i < bins; i++) {
      const coilValue = gaussianCoil(r[i], Rg);
      coil[i] += coilValue;
      total[i] += coilWeight * coilValue;
    }

    normalize(total);
    normalize(coil);
    for (const key of Object.keys(self)) normalize(self[key]);
    for (const key of Object.keys(cross)) normalize(cross[key]);

    return {
      r,
      dr,
      binWidth: dr,
      rMax: maxR,
      bins,
      Rg,
      coilWeight,
      domains: domains.slice(),
      weightedPairs,
      total,
      self,
      cross,
      coil,
      totalPr: { r: r.slice(), p: total.slice(), binWidth: dr, rMax: maxR },
    };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.pddKernel = {
    AA_ELECTRONS,
    assignSequenceToDots,
    gaussianCoil,
    computeCalyrPDD,
    normalize,
  };
})();