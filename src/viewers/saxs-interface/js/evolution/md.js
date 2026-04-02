(function () {
  "use strict";

  function cloneBeads(beads) {
    return (beads || []).map((b) => ({ x: b.x, y: b.y, z: b.z }));
  }

  function makeState(beads) {
    const n = (beads || []).length;
    const x = new Float64Array(n);
    const y = new Float64Array(n);
    const z = new Float64Array(n);
    const vx = new Float64Array(n);
    const vy = new Float64Array(n);
    const vz = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      const b = beads[i] || { x: 0, y: 0, z: 0 };
      x[i] = Number.isFinite(b.x) ? b.x : 0;
      y[i] = Number.isFinite(b.y) ? b.y : 0;
      z[i] = Number.isFinite(b.z) ? b.z : 0;
      vx[i] = 0;
      vy[i] = 0;
      vz[i] = 0;
    }

    return { n, x, y, z, vx, vy, vz };
  }

  function stateToBeads(st) {
    const out = new Array(st.n);
    for (let i = 0; i < st.n; i++) {
      out[i] = { x: st.x[i], y: st.y[i], z: st.z[i] };
    }
    return out;
  }

  // Simple deterministic RNG (same as in sampler.js style)
  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function rng() {
      // xorshift32
      s ^= (s << 13) >>> 0;
      s ^= (s >>> 17) >>> 0;
      s ^= (s << 5) >>> 0;
      return (s >>> 0) / 0x100000000;
    };
  }

  // Box-Muller Gaussian
  function randn(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function computeForces(st, {
    bondLength = 3.8,
    kBond = 0.12,
    rMin = 2.5,
    kRep = 0.9,
    maxPairs = 45000,
  } = {}) {
    const fx = new Float64Array(st.n);
    const fy = new Float64Array(st.n);
    const fz = new Float64Array(st.n);

    // Harmonic bonds between i and i+1
    for (let i = 0; i < st.n - 1; i++) {
      const dx = st.x[i + 1] - st.x[i];
      const dy = st.y[i + 1] - st.y[i];
      const dz = st.z[i + 1] - st.z[i];
      const r2 = dx * dx + dy * dy + dz * dz;
      const r = Math.sqrt(r2) || 1e-12;
      const dr = r - bondLength;
      // Force magnitude: -k * dr
      const fmag = -kBond * dr;
      const invr = 1.0 / r;
      const fxv = fmag * dx * invr;
      const fyv = fmag * dy * invr;
      const fzv = fmag * dz * invr;
      fx[i] -= fxv; fy[i] -= fyv; fz[i] -= fzv;
      fx[i + 1] += fxv; fy[i + 1] += fyv; fz[i + 1] += fzv;
    }

    // Soft repulsion if closer than rMin.
    // O(N^2) but capped with maxPairs.
    const n = st.n;
    const rMin2 = rMin * rMin;
    let pairs = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // Skip bonded neighbors; they can be within rMin naturally.
        if (j === i + 1) continue;
        const dx = st.x[j] - st.x[i];
        const dy = st.y[j] - st.y[i];
        const dz = st.z[j] - st.z[i];
        const r2 = dx * dx + dy * dy + dz * dz;
        if (r2 >= rMin2) continue;

        const r = Math.sqrt(r2) || 1e-12;
        const invr = 1.0 / r;
        // Quadratic wall: U = 0.5*k*(rMin-r)^2
        // F = -dU/dr = k*(rMin-r)
        const fmag = kRep * (rMin - r);
        const fxv = fmag * dx * invr;
        const fyv = fmag * dy * invr;
        const fzv = fmag * dz * invr;
        fx[i] -= fxv; fy[i] -= fyv; fz[i] -= fzv;
        fx[j] += fxv; fy[j] += fyv; fz[j] += fzv;

        pairs++;
        if (pairs >= maxPairs) return { fx, fy, fz };
      }
    }

    return { fx, fy, fz };
  }

  function stepLangevinVV(st, forces, {
    dt = 0.02,
    mass = 1.0,
    gamma = 0.65,
    kT = 0.05,
    rng,
  }) {
    const n = st.n;
    const invm = 1.0 / mass;

    // Approximate Langevin via velocity damping + noise.
    // v(t+dt/2)
    const cDamp = Math.exp(-gamma * dt);
    const sigma = Math.sqrt((1 - cDamp * cDamp) * kT * invm);

    for (let i = 0; i < n; i++) {
      st.vx[i] = st.vx[i] * cDamp + sigma * randn(rng);
      st.vy[i] = st.vy[i] * cDamp + sigma * randn(rng);
      st.vz[i] = st.vz[i] * cDamp + sigma * randn(rng);

      st.vx[i] += 0.5 * dt * forces.fx[i] * invm;
      st.vy[i] += 0.5 * dt * forces.fy[i] * invm;
      st.vz[i] += 0.5 * dt * forces.fz[i] * invm;

      st.x[i] += dt * st.vx[i];
      st.y[i] += dt * st.vy[i];
      st.z[i] += dt * st.vz[i];
    }

    // caller recomputes forces
  }

  function kineticEnergy(st, mass = 1.0) {
    let ke = 0;
    for (let i = 0; i < st.n; i++) {
      ke += 0.5 * mass * (st.vx[i] * st.vx[i] + st.vy[i] * st.vy[i] + st.vz[i] * st.vz[i]);
    }
    return ke;
  }

  async function runMDAsync(beads, {
    steps = 1400,
    dt = 0.02,
    mass = 1.0,
    gamma = 0.65,
    kT = 0.05,
    forces = {
      bondLength: 3.8,
      kBond: 0.12,
      rMin: 2.5,
      kRep: 0.9,
      maxPairs: 45000,
    },
    seed = 123,
    yieldEvery = 10,
    onProgress = null,
  } = {}) {
    const st = makeState(cloneBeads(beads));
    const rng = makeRng(seed);

    const yieldToUi = () => new Promise((resolve) => {
      if (typeof requestAnimationFrame === "function") return requestAnimationFrame(() => resolve());
      return setTimeout(() => resolve(), 0);
    });

    let f = computeForces(st, forces);

    for (let t = 0; t < steps; t++) {
      stepLangevinVV(st, f, { dt, mass, gamma, kT, rng });
      f = computeForces(st, forces);

      // Finish VV second half-step
      const invm = 1.0 / mass;
      for (let i = 0; i < st.n; i++) {
        st.vx[i] += 0.5 * dt * f.fx[i] * invm;
        st.vy[i] += 0.5 * dt * f.fy[i] * invm;
        st.vz[i] += 0.5 * dt * f.fz[i] * invm;
      }

      if (typeof onProgress === "function" && (t % yieldEvery === 0 || t === steps - 1)) {
        onProgress({
          step: t,
          steps,
          ke: kineticEnergy(st, mass),
          beads: stateToBeads(st),
        });
      }

      if (yieldEvery && (t % yieldEvery === 0)) {
        await yieldToUi();
      }
    }

    return { beads: stateToBeads(st) };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.md = {
    runMDAsync,
  };
})();
