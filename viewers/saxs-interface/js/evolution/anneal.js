(function () {
  "use strict";

  function geometricSchedule({ T0 = 1.0, alpha = 0.98 } = {}) {
    const t0 = Number.isFinite(T0) && T0 > 0 ? T0 : 1.0;
    const a = Number.isFinite(alpha) ? Math.max(0.0, Math.min(1.0, alpha)) : 0.98;
    return function (gen) {
      const g = Number.isFinite(gen) ? Math.max(0, gen) : 0;
      return t0 * Math.pow(a, g);
    };
  }

  function acceptLogPost({ logPostOld, logPostNew, T, rng = Math.random }) {
    const t = Number.isFinite(T) && T > 0 ? T : 1.0;
    const d = (logPostNew - logPostOld) / t;
    if (d >= 0) return true;
    const u = Math.max(1e-12, Math.min(1 - 1e-12, rng()));
    return Math.log(u) < d;
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.anneal = {
    geometricSchedule,
    acceptLogPost,
  };
})();
