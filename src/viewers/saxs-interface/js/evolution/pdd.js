(function () {
  "use strict";

  const SS_PAIR_KEYS = [
    "alpha_alpha",
    "beta_beta",
    "coil_coil",
    "alpha_beta",
    "alpha_coil",
    "beta_coil",
  ];

  const SS_PAIR_INDEX = [
    [0, 3, 4],
    [3, 1, 5],
    [4, 5, 2],
  ];

  function toPairKey(a, b) {
    const sa = String(a || "");
    const sb = String(b || "");
    return sa <= sb ? `${sa}-${sb}` : `${sb}-${sa}`;
  }

  function secondaryStructureIndexOf(value) {
    const group = String(value || "").toLowerCase();
    if (group === "alpha" || group === "helix") return 0;
    if (group === "beta" || group === "sheet") return 1;
    return 2;
  }

  function computePairDistanceHistogram(beads, { binWidth = 1.0, rMax = null, groupField = "ssGroup" } = {}) {
    const pts = Array.isArray(beads) ? beads : [];
    const n = pts.length;

    if (n < 2) {
      return { r: [], p: [], binWidth, rMax: 0, pairs: 0 };
    }

    let maxD = 0;
    if (!(Number.isFinite(rMax) && rMax > 0)) {
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        if (!a) continue;
        for (let j = i + 1; j < n; j++) {
          const b = pts[j];
          if (!b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dz = a.z - b.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (Number.isFinite(d)) maxD = Math.max(maxD, d);
        }
      }
    } else {
      maxD = rMax;
    }

    const bw = Number.isFinite(binWidth) && binWidth > 0 ? binWidth : 1.0;
    const nb = Math.max(1, Math.ceil(maxD / bw));
    const hist = new Float64Array(nb);
    const useSecondaryStructureSplit = String(groupField || "") === "ssGroup";
    const groupIds = useSecondaryStructureSplit ? new Int8Array(n) : null;
    const groupCounts = useSecondaryStructureSplit ? { alpha: 0, beta: 0, coil: 0 } : null;
    const groupLabels = useSecondaryStructureSplit ? null : new Array(n);
    const genericGroupCounts = useSecondaryStructureSplit ? null : Object.create(null);
    let explicitGroupCount = 0;

    for (let i = 0; i < n; i++) {
      const point = pts[i];
      const rawValue = point && point[groupField] != null ? String(point[groupField]).trim() : "";
      if (rawValue) explicitGroupCount += 1;
      if (useSecondaryStructureSplit) {
        const groupIndex = secondaryStructureIndexOf(rawValue);
        groupIds[i] = groupIndex;
        if (groupIndex === 0) groupCounts.alpha += 1;
        else if (groupIndex === 1) groupCounts.beta += 1;
        else groupCounts.coil += 1;
      } else {
        const label = rawValue || "";
        groupLabels[i] = label;
        if (label) genericGroupCounts[label] = (genericGroupCounts[label] || 0) + 1;
      }
    }

    const splitHist = useSecondaryStructureSplit && explicitGroupCount > 0 ? SS_PAIR_KEYS.map(() => new Float64Array(nb)) : null;
    const splitPairs = useSecondaryStructureSplit && explicitGroupCount > 0 ? new Uint32Array(SS_PAIR_KEYS.length) : null;
    const genericSplitHist = !useSecondaryStructureSplit && explicitGroupCount > 0 ? Object.create(null) : null;
    const genericSplitPairs = !useSecondaryStructureSplit && explicitGroupCount > 0 ? Object.create(null) : null;

    let pairs = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      if (!a) continue;
      for (let j = i + 1; j < n; j++) {
        const b = pts[j];
        if (!b) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (!Number.isFinite(d)) continue;
        const k = Math.min(nb - 1, Math.max(0, Math.floor(d / bw)));
        hist[k] += 1;
        if (splitHist) {
          const pairIndex = SS_PAIR_INDEX[groupIds[i]][groupIds[j]];
          splitHist[pairIndex][k] += 1;
          splitPairs[pairIndex] += 1;
        } else if (genericSplitHist) {
          const gi = groupLabels[i];
          const gj = groupLabels[j];
          if (gi && gj) {
            const pairKey = toPairKey(gi, gj);
            if (!genericSplitHist[pairKey]) {
              genericSplitHist[pairKey] = new Float64Array(nb);
              genericSplitPairs[pairKey] = 0;
            }
            genericSplitHist[pairKey][k] += 1;
            genericSplitPairs[pairKey] += 1;
          }
        }
        pairs++;
      }
    }

    // Convert histogram to a simple P(r)-like array at bin centers.
    const r = new Array(nb);
    const p = new Array(nb);
    for (let k = 0; k < nb; k++) {
      r[k] = (k + 0.5) * bw;
      p[k] = hist[k];
    }

    const result = { r, p, binWidth: bw, rMax: nb * bw, pairs };

    if (splitHist) {
      const components = {};
      for (let i = 0; i < SS_PAIR_KEYS.length; i++) {
        const key = SS_PAIR_KEYS[i];
        const arr = splitHist[i];
        const comp = new Array(nb);
        for (let k = 0; k < nb; k++) comp[k] = arr[k];
        components[key] = {
          r: r.slice(),
          p: comp,
          pairs: splitPairs[i],
        };
      }
      result.secondaryStructure = {
        groupField,
        groupCounts,
        components,
      };
    } else if (genericSplitHist) {
      const components = {};
      const keys = Object.keys(genericSplitHist).sort();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const arr = genericSplitHist[key];
        const comp = new Array(nb);
        for (let k = 0; k < nb; k++) comp[k] = arr[k];
        components[key] = {
          r: r.slice(),
          p: comp,
          pairs: genericSplitPairs[key] || 0,
        };
      }
      result.groupedPairs = {
        groupField,
        groups: Object.keys(genericGroupCounts).sort(),
        groupCounts: genericGroupCounts,
        components,
      };
    }

    return result;
  }

  function normalizePrToMax(pr) {
    const r = pr && Array.isArray(pr.r) ? pr.r : [];
    const p = pr && Array.isArray(pr.p) ? pr.p : [];
    const n = Math.min(r.length, p.length);
    let mx = 0;
    for (let i = 0; i < n; i++) if (Number.isFinite(p[i])) mx = Math.max(mx, p[i]);
    if (!(mx > 0)) return { r: r.slice(0, n), p: p.slice(0, n), pMax: 0 };
    return {
      r: r.slice(0, n),
      p: p.slice(0, n).map((v) => (Number.isFinite(v) ? v / mx : v)),
      pMax: mx,
    };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.pdd = {
    computePairDistanceHistogram,
    normalizePrToMax,
  };
})();
