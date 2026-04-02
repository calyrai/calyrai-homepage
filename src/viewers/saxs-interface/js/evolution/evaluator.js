(function () {
  "use strict";

  function fitScaleLeastSquares({ yExp, yModel, sigma }) {
    const n = Math.min(yExp.length, yModel.length, sigma.length);
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      const e = yExp[i];
      const m = yModel[i];
      const s = sigma[i];
      if (!Number.isFinite(e) || !Number.isFinite(m) || !Number.isFinite(s) || !(s > 0)) continue;
      const w = 1 / (s * s);
      num += w * e * m;
      den += w * m * m;
    }
    if (!(den > 0)) return 1;
    return num / den;
  }

  function chi2({ yExp, yModel, sigma, scale = 1 }) {
    const n = Math.min(yExp.length, yModel.length, sigma.length);
    let acc = 0;
    let used = 0;
    for (let i = 0; i < n; i++) {
      const e = yExp[i];
      const m = yModel[i];
      const s = sigma[i];
      if (!Number.isFinite(e) || !Number.isFinite(m) || !Number.isFinite(s) || !(s > 0)) continue;
      const r = (e - scale * m) / s;
      acc += r * r;
      used++;
    }
    return { chi2: acc, n: used };
  }

  function evaluateCandidate({
    modelIq,
    expIq,
    modelPr = null,
    targetPr = null,
    priorPenalty = 0,
    wI = 1,
    wP = 1,
    fitScale = true,
  }) {
    const qE = expIq && Array.isArray(expIq.q) ? expIq.q : [];
    const IE = expIq && Array.isArray(expIq.I) ? expIq.I : [];
    const sE = expIq && Array.isArray(expIq.dI) ? expIq.dI : IE.map(() => 1);

    const qM = modelIq && Array.isArray(modelIq.q) ? modelIq.q : [];
    const IM = modelIq && Array.isArray(modelIq.I) ? modelIq.I : [];

    // Assume q grids match for v1; if not, we still evaluate on min length.
    const nI = Math.min(qE.length, IE.length, sE.length, qM.length, IM.length);
    const yExp = IE.slice(0, nI);
    const yModel = IM.slice(0, nI);
    const sigma = sE.slice(0, nI);

    const scale = fitScale ? fitScaleLeastSquares({ yExp, yModel, sigma }) : 1;
    const chiI = chi2({ yExp, yModel, sigma, scale });

    let chiP = { chi2: 0, n: 0 };
    if (modelPr && targetPr) {
      const rT = Array.isArray(targetPr.r) ? targetPr.r : [];
      const pT = Array.isArray(targetPr.p) ? targetPr.p : [];
      const sT = Array.isArray(targetPr.dP) ? targetPr.dP : pT.map(() => 1);

      const rM = Array.isArray(modelPr.r) ? modelPr.r : [];
      const pM = Array.isArray(modelPr.p) ? modelPr.p : [];

      const nP = Math.min(rT.length, pT.length, sT.length, rM.length, pM.length);
      chiP = chi2({ yExp: pT.slice(0, nP), yModel: pM.slice(0, nP), sigma: sT.slice(0, nP), scale: 1 });
    }

    const nll = 0.5 * (wI * chiI.chi2 + wP * chiP.chi2) + priorPenalty;
    const logPost = -nll;

    return {
      scale,
      chi2_I: chiI.chi2,
      chi2_P: chiP.chi2,
      prior: priorPenalty,
      nll,
      logPost,
    };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.evaluator = {
    fitScaleLeastSquares,
    chi2,
    evaluateCandidate,
  };
})();
