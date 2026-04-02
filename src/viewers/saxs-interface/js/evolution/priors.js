(function () {
  "use strict";

  function excludedVolumePenalty(beads, {
    rMin = 2.5,
    strength = 1.0,
    power = 2,
    maxPairs = null,
  } = {}) {
    const pts = Array.isArray(beads) ? beads : [];
    const n = pts.length;
    if (n < 2) return 0;

    const r0 = Number.isFinite(rMin) && rMin > 0 ? rMin : 2.5;
    const k = Number.isFinite(strength) ? strength : 1.0;
    const p = Number.isFinite(power) && power > 0 ? power : 2;

    let acc = 0;
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
        const d2 = dx * dx + dy * dy + dz * dz;
        if (!Number.isFinite(d2) || d2 <= 0) continue;
        const d = Math.sqrt(d2);
        if (d < r0) {
          const t = (r0 - d) / r0;
          acc += k * Math.pow(t, p);
        }
        pairs++;
        if (Number.isFinite(maxPairs) && pairs >= maxPairs) return acc;
      }
    }

    return acc;
  }

  function connectivityPenalty(beads, {
    bondLength = 3.8,
    strength = 1.0,
  } = {}) {
    const pts = Array.isArray(beads) ? beads : [];
    const n = pts.length;
    if (n < 2) return 0;

    const r0 = Number.isFinite(bondLength) && bondLength > 0 ? bondLength : 3.8;
    const k = Number.isFinite(strength) ? strength : 1.0;

    let acc = 0;
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (!a || !b) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (!Number.isFinite(d)) continue;
      const t = d - r0;
      acc += k * t * t;
    }

    return acc;
  }

  function tetherPenalty(beads, referenceBeads, {
    strength = 0.02,
  } = {}) {
    const pts = Array.isArray(beads) ? beads : [];
    const ref = Array.isArray(referenceBeads) ? referenceBeads : [];
    const n = Math.min(pts.length, ref.length);
    if (n < 1) return 0;

    const k = Number.isFinite(strength) ? strength : 0.02;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = ref[i];
      if (!a || !b) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (!Number.isFinite(d2)) continue;
      acc += k * d2;
    }
    return acc;
  }

  function localDistancePenalty(beads, referenceBeads, {
    neighbors = 1,
    strength = 0.1,
  } = {}) {
    const pts = Array.isArray(beads) ? beads : [];
    const ref = Array.isArray(referenceBeads) ? referenceBeads : [];
    const n = Math.min(pts.length, ref.length);
    if (n < 2) return 0;

    const m = Number.isFinite(neighbors) && neighbors > 0 ? Math.floor(neighbors) : 1;
    const k = Number.isFinite(strength) ? strength : 0.1;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      for (let dj = 1; dj <= m; dj++) {
        const j = i + dj;
        if (j >= n) break;
        const a = pts[i];
        const b = pts[j];
        const ar = ref[i];
        const br = ref[j];
        if (!a || !b || !ar || !br) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        const dr = ar.x - br.x;
        const er = ar.y - br.y;
        const fr = ar.z - br.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const dRef = Math.sqrt(dr * dr + er * er + fr * fr);
        if (!Number.isFinite(d) || !Number.isFinite(dRef)) continue;
        const diff = d - dRef;
        acc += k * diff * diff;
      }
    }
    return acc;
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.priors = {
    excludedVolumePenalty,
    connectivityPenalty,
    tetherPenalty,
    localDistancePenalty,
  };
})();
