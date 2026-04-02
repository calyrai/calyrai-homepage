(function () {
  "use strict";

  function intensityFromPr({ r, p }, q, { include4pi = false } = {}) {
    const rr = Array.isArray(r) ? r : [];
    const pp = Array.isArray(p) ? p : [];
    const qq = Array.isArray(q) ? q : [];

    const n = Math.min(rr.length, pp.length);
    if (n < 2 || qq.length === 0) return { q: qq.slice(), I: qq.map(() => 0) };

    // Estimate dr as median consecutive spacing.
    const drs = [];
    for (let i = 1; i < n; i++) {
      const d = rr[i] - rr[i - 1];
      if (Number.isFinite(d) && d > 0) drs.push(d);
    }
    drs.sort((a, b) => a - b);
    const dr = drs.length ? drs[Math.floor(drs.length / 2)] : 1;

    const I = new Array(qq.length);
    const factor = include4pi ? (4 * Math.PI) : 1;

    for (let qi = 0; qi < qq.length; qi++) {
      const qv = qq[qi];
      if (!Number.isFinite(qv)) {
        I[qi] = NaN;
        continue;
      }
      let acc = 0;
      for (let i = 0; i < n; i++) {
        const rv = rr[i];
        const pv = pp[i];
        if (!Number.isFinite(rv) || !Number.isFinite(pv)) continue;
        const qr = qv * rv;
        const sinc = (qr === 0) ? 1 : (Math.sin(qr) / qr);
        acc += pv * sinc;
      }
      I[qi] = factor * acc * dr;
    }

    return { q: qq.slice(), I };
  }

  function normalizeIToI0({ q, I }) {
    const qq = Array.isArray(q) ? q : [];
    const II = Array.isArray(I) ? I : [];
    const n = Math.min(qq.length, II.length);
    if (n === 0) return { q: [], I: [], I0: 0 };

    let I0 = II[0];
    if (!(Number.isFinite(I0) && I0 > 0)) {
      let mx = 0;
      for (let i = 0; i < n; i++) if (Number.isFinite(II[i])) mx = Math.max(mx, II[i]);
      I0 = mx > 0 ? mx : 1;
    }

    const outI = new Array(n);
    const outQ = new Array(n);
    for (let i = 0; i < n; i++) {
      outQ[i] = qq[i];
      outI[i] = Number.isFinite(II[i]) ? (II[i] / I0) : II[i];
    }

    return { q: outQ, I: outI, I0 };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.scattering = {
    intensityFromPr,
    normalizeIToI0,
  };
})();
