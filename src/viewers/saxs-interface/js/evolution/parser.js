(function () {
  "use strict";

  function parseSaxsText(text) {
    const q = [];
    const I = [];
    const dI = [];

    const lines = String(text || "").split(/\r?\n/);
    for (const line of lines) {
      const s = String(line || "").trim();
      if (!s) continue;
      if (s.startsWith("#") || s.startsWith(";") || s.startsWith("//")) continue;
      const parts = s.split(/[\s,;]+/);
      if (parts.length < 2) continue;

      const qv = Number(parts[0]);
      const Iv = Number(parts[1]);
      const dIv = parts.length >= 3 ? Number(parts[2]) : NaN;

      if (!Number.isFinite(qv) || !Number.isFinite(Iv)) continue;
      q.push(qv);
      I.push(Iv);
      dI.push(Number.isFinite(dIv) && dIv > 0 ? dIv : 1);
    }

    return { q, I, dI };
  }

  function normalizeIqToI0({ q, I, dI }) {
    const n = Math.min(q.length, I.length, dI.length);
    if (n === 0) return { q: [], I: [], dI: [] };

    let I0 = I[0];
    if (!(Number.isFinite(I0) && I0 > 0)) {
      let mx = 0;
      for (let i = 0; i < n; i++) if (Number.isFinite(I[i])) mx = Math.max(mx, I[i]);
      I0 = mx > 0 ? mx : 1;
    }

    const qo = [];
    const Io = [];
    const dIo = [];
    for (let i = 0; i < n; i++) {
      const qv = q[i];
      const Iv = I[i];
      const sv = dI[i];
      if (!Number.isFinite(qv) || !Number.isFinite(Iv) || !Number.isFinite(sv)) continue;
      qo.push(qv);
      Io.push(Iv / I0);
      dIo.push(sv / I0);
    }

    return { q: qo, I: Io, dI: dIo, I0 };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.parser = {
    parseSaxsText,
    normalizeIqToI0,
  };
})();
