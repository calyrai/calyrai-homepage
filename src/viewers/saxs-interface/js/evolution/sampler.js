(function () {
  "use strict";

  function randn(rng) {
    // Box-Muller
    const u1 = Math.max(1e-12, rng());
    const u2 = Math.max(1e-12, rng());
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function makeRng(seed) {
    // mulberry32
    let a = (seed >>> 0) || 0x12345678;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cloneBeads(beads) {
    return beads.map((b) => ({ ...b }));
  }

  function initRandomBeads(n, { radius = 30, seed = 1 } = {}) {
    const rng = makeRng(seed);
    const beads = [];

    const R = Number.isFinite(radius) && radius > 0 ? radius : 30;
    for (let i = 0; i < n; i++) {
      // random point in sphere
      const u = rng();
      const v = rng();
      const w = rng();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = R * Math.cbrt(w);
      beads.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      });
    }

    return beads;
  }

  function mutateBeads(beads, {
    step = 1.5,
    pMove = 0.25,
    seed = null,
  } = {}) {
    const rng = seed == null ? Math.random : makeRng(seed);
    const out = cloneBeads(beads);

    const s = Number.isFinite(step) && step > 0 ? step : 1.5;
    const p = Number.isFinite(pMove) ? Math.max(0, Math.min(1, pMove)) : 0.25;

    for (let i = 0; i < out.length; i++) {
      if (rng() > p) continue;
      out[i].x += s * randn(rng);
      out[i].y += s * randn(rng);
      out[i].z += s * randn(rng);
    }

    return out;
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.sampler = {
    makeRng,
    cloneBeads,
    initRandomBeads,
    mutateBeads,
  };
})();
