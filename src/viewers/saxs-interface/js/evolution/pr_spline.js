const EPS = 1e-12;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function solve3x3(A, b) {
  const M = [
    [A[0][0], A[0][1], A[0][2], b[0]],
    [A[1][0], A[1][1], A[1][2], b[1]],
    [A[2][0], A[2][1], A[2][2], b[2]],
  ];

  for (let col = 0; col < 3; col++) {
    let piv = col;
    let best = Math.abs(M[col][col]);
    for (let r = col + 1; r < 3; r++) {
      const v = Math.abs(M[r][col]);
      if (v > best) {
        best = v;
        piv = r;
      }
    }
    if (!(best > 0)) return null;
    if (piv !== col) {
      const tmp = M[col];
      M[col] = M[piv];
      M[piv] = tmp;
    }

    const diag = M[col][col];
    for (let c = col; c < 4; c++) M[col][c] /= diag;
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (f === 0) continue;
      for (let c = col; c < 4; c++) M[r][c] -= f * M[col][c];
    }
  }

  return [M[0][3], M[1][3], M[2][3]];
}

    // Utility: compute max position and value for envelope params
    function envelopeMaxPositionValue(params) {
      const D = Number.isFinite(params.D) ? params.D : 2;
      const alpha = Number.isFinite(params.alpha) ? params.alpha : 0.02;
      const r0 = Number.isFinite(params.r0) ? params.r0 : 0;
      // For P(r) = (r - r0)^D * exp(-alpha * (r - r0)), max at r = r0 + D/alpha
      const rMax = r0 + D / alpha;
      const pMax = (D > 0 && alpha > 0) ? Math.pow(D / alpha, D) * Math.exp(-D) : 0;
      return { r: rMax, p: pMax, D, alpha, r0 };
    }
  // Fit a shifted envelope: P(r) ~ (r - r0)^D * exp(-alpha * (r - r0)), r > r0
  function fitShiftedEnvelopeParams(r, p, { tailFrac = 0.35, minTailPoints = 12, r0ScanSteps = 30 } = {}) {
    const rr = Array.isArray(r) ? r : [];
    const pp = Array.isArray(p) ? p : [];
    const n = Math.min(rr.length, pp.length);
    if (n < 5) return { D: 2, alpha: 0.02, r0: 0 };

    // Scan r0 from 0 up to 1/3 of r range
    let rMin = Infinity, rMax = -Infinity;
    for (let i = 0; i < n; i++) {
      const rv = rr[i];
      if (Number.isFinite(rv) && rv > 0) {
        rMin = Math.min(rMin, rv);
        rMax = Math.max(rMax, rv);
      }
    }
    const r0Min = 0;
    const r0Max = Math.max(0, rMax - rMin) * 0.33;
    let bestR0 = 0, bestErr = Infinity, bestParams = { D: 2, alpha: 0.02, r0: 0 };
    for (let s = 0; s < r0ScanSteps; s++) {
      const r0 = r0Min + (r0Max - r0Min) * (s / (r0ScanSteps - 1));
      // Use only tail points with r > r0
      const start = Math.max(0, Math.floor((1 - tailFrac) * n));
      const xs = [], ys = [];
      for (let i = start; i < n; i++) {
        const rv = rr[i];
        const pv = pp[i];
        if (!(Number.isFinite(rv) && rv > r0)) continue;
        if (!(Number.isFinite(pv) && pv > 0)) continue;
        xs.push([1, Math.log(rv - r0), -(rv - r0)]);
        ys.push(Math.log(pv + EPS));
      }
      if (xs.length < minTailPoints) continue;
      // Least squares: y = c + D*log(r-r0) + alpha*(-(r-r0))
      const XtX = [ [0,0,0],[0,0,0],[0,0,0] ];
      const Xty = [0,0,0];
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i], y = ys[i];
        for (let a = 0; a < 3; a++) {
          Xty[a] += x[a] * y;
          for (let b = 0; b < 3; b++) XtX[a][b] += x[a] * x[b];
        }
      }
      const beta = solve3x3(XtX, Xty);
      if (!beta) continue;
      const D = clamp(beta[1], 0.5, 6);
      const alpha = clamp(beta[2], 1e-6, 1.0);
      // Compute fit error on tail
      let err = 0;
      for (let i = 0; i < xs.length; i++) {
        const pred = beta[0] + D * xs[i][1] + alpha * xs[i][2];
        err += Math.abs(pred - ys[i]);
      }
      if (err < bestErr) {
        bestErr = err;
        bestParams = { D, alpha, r0 };
      }
    }
    return bestParams;
  }
(function () {
  "use strict";

  function linearInterp(x, xs, ys) {
    const n = Math.min(xs.length, ys.length);
    if (n === 0) return NaN;
    if (n === 1) return ys[0];

    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];

    // binary search
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid;
    }

    const x0 = xs[lo];
    const x1 = xs[hi];
    const y0 = ys[lo];
    const y1 = ys[hi];

    const dx = x1 - x0;
    if (!(dx > 0)) return y0;
    const t = (x - x0) / dx;
    return y0 + t * (y1 - y0);
  }

  function fitEnvelopeParams(r, p, { tailFrac = 0.35, minTailPoints = 12 } = {}) {
    const rr = Array.isArray(r) ? r : [];
    const pp = Array.isArray(p) ? p : [];
    const n = Math.min(rr.length, pp.length);
    if (n < 5) return { D: 2, alpha: 0.02 };

    // Pick tail points from the back, skipping non-positive p.
    const start = Math.max(0, Math.floor((1 - tailFrac) * n));
    const xs = [];
    const ys = [];

    for (let i = start; i < n; i++) {
      const rv = rr[i];
      const pv = pp[i];
      if (!(Number.isFinite(rv) && rv > 0)) continue;
      if (!(Number.isFinite(pv) && pv > 0)) continue;
      xs.push([1, Math.log(rv), -rv]);
      ys.push(Math.log(pv + EPS));
    }

    if (xs.length < minTailPoints) {
      // fall back to defaults if the tail is too sparse
      return { D: 2, alpha: 0.02 };
    }

    // Least squares: y = c + D*log(r) + alpha*(-r)
    // Build normal equations: (X^T X) beta = X^T y
    const XtX = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const Xty = [0, 0, 0];

    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const y = ys[i];
      for (let a = 0; a < 3; a++) {
        Xty[a] += x[a] * y;
        for (let b = 0; b < 3; b++) XtX[a][b] += x[a] * x[b];
      }
    }

    const beta = solve3x3(XtX, Xty);
    if (!beta) return { D: 2, alpha: 0.02 };

    const D = clamp(beta[1], 0.5, 6);
    const alpha = clamp(beta[2], 1e-6, 1.0);
    return { D, alpha };
  }

  function computeHermiteSlopes(xs, ys) {
    const n = Math.min(xs.length, ys.length);
    if (n < 2) return ys.map(() => 0);

    const m = new Array(n);

    for (let i = 0; i < n; i++) {
      if (i === 0) {
        const dx = xs[1] - xs[0];
        m[i] = (dx > 0) ? (ys[1] - ys[0]) / dx : 0;
      } else if (i === n - 1) {
        const dx = xs[n - 1] - xs[n - 2];
        m[i] = (dx > 0) ? (ys[n - 1] - ys[n - 2]) / dx : 0;
      } else {
        const dx = xs[i + 1] - xs[i - 1];
        m[i] = (dx > 0) ? (ys[i + 1] - ys[i - 1]) / dx : 0;
      }
      if (!Number.isFinite(m[i])) m[i] = 0;
    }

    return m;
  }

  function evalHermite(x, xs, ys, ms) {
    const n = Math.min(xs.length, ys.length, ms.length);
    if (n === 0) return NaN;
    if (n === 1) return ys[0];

    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];

    // binary search segment
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid;
    }

    const x0 = xs[lo];
    const x1 = xs[hi];
    const y0 = ys[lo];
    const y1 = ys[hi];
    const m0 = ms[lo];
    const m1 = ms[hi];
    const dx = x1 - x0;
    if (!(dx > 0)) return y0;

    const t = (x - x0) / dx;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return h00 * y0 + h10 * m0 * dx + h01 * y1 + h11 * m1 * dx;
  }

  function buildConstrainedPrSplineFromPr(pr, {
    knots = 12,
    tailFrac = 0.35,
    minTailPoints = 12,
    interpMode = "linear", // "linear" | "log"
  } = {}) {
    const r = pr && Array.isArray(pr.r) ? pr.r : [];
    const p = pr && Array.isArray(pr.p) ? pr.p : [];
    const n = Math.min(r.length, p.length);
    if (n < 5) return null;

    // Find rMax and a small positive r0 for the log-envelope.
    let rMax = 0;
    const drs = [];
    let minPos = Infinity;
    for (let i = 0; i < n; i++) {
      const rv = r[i];
      if (Number.isFinite(rv)) rMax = Math.max(rMax, rv);
      if (Number.isFinite(rv) && rv > 0) minPos = Math.min(minPos, rv);
      if (i > 0) {
        const d = r[i] - r[i - 1];
        if (Number.isFinite(d) && d > 0) drs.push(d);
      }
    }
    drs.sort((a, b) => a - b);
    const dr = drs.length ? drs[Math.floor(drs.length / 2)] : 1;
    const r0 = Number.isFinite(minPos)
      ? Math.max(1e-4, Math.min(minPos, Math.max(0.25 * dr, 0.35 * minPos)))
      : Math.max(1e-4, 0.25 * dr);

    const envParams = fitEnvelopeParams(r, p, { tailFrac, minTailPoints });
    const D = envParams.D;
    const alpha = envParams.alpha;


    const K = clamp(Math.floor(knots), 6, 64);
    const knotsR = new Array(K);
    const knotsF = new Array(K);

    const interpModeStr = String(interpMode || "").toLowerCase();
    const useLogInterp = interpModeStr === "log";
    const useLogLogInterp = interpModeStr === "loglog";

    // Precompute log(r) and log(p) arrays for loglog mode
    let logR = null, logP = null;
    if (useLogInterp || useLogLogInterp) {
      logP = new Array(n);
      for (let i = 0; i < n; i++) {
        const pv = p[i];
        logP[i] = (Number.isFinite(pv) && pv > 0) ? Math.log(pv + EPS) : Math.log(EPS);
      }
    }
    if (useLogLogInterp) {
      logR = new Array(n);
      for (let i = 0; i < n; i++) {
        const rv = r[i];
        logR[i] = (Number.isFinite(rv) && rv > 0) ? Math.log(rv) : Math.log(r0);
      }
    }

    for (let k = 0; k < K; k++) {
      let rk, fk, pkPos = EPS;
      if (useLogLogInterp && logR && logP) {
        // Place knots evenly in log(r)
        const logR0 = Math.log(r0);
        const logRMax = Math.log(rMax);
        const logRk = logR0 + (logRMax - logR0) * (k / (K - 1));
        rk = Math.exp(logRk);
        knotsR[k] = rk;
        // Interpolate logP at logRk
        const lpk = linearInterp(logRk, logR, logP);
        const pk = Math.exp(Number.isFinite(lpk) ? lpk : Math.log(EPS));
        pkPos = (Number.isFinite(pk) && pk > 0) ? pk : EPS;
        // f(log(r)) = log(P) - log(env)
        // env = r^D * exp(-alpha r)  => log env = D log r - alpha r
        fk = Math.log(pkPos) - (D * logRk - alpha * rk);
        knotsF[k] = Number.isFinite(fk) ? fk : 0;
      } else {
        const tk = k / (K - 1);
        const biasedTk = Math.pow(tk, 1.35);
        rk = r0 + (rMax - r0) * biasedTk;
        knotsR[k] = rk;
        if (useLogInterp && logP) {
          const lpk = linearInterp(rk, r, logP);
          const pk = Math.exp(Number.isFinite(lpk) ? lpk : Math.log(EPS));
          pkPos = (Number.isFinite(pk) && pk > 0) ? pk : EPS;
        } else {
          const pk = linearInterp(rk, r, p);
          pkPos = (Number.isFinite(pk) && pk > 0) ? pk : EPS;
        }
        fk = Math.log(pkPos) - (D * Math.log(rk) - alpha * rk);
        knotsF[k] = Number.isFinite(fk) ? fk : 0;
      }
    }

    // Hermite spline: x-axis is log(r) for loglog mode, r otherwise
    let hermiteXs = knotsR;
    if (useLogLogInterp) {
      hermiteXs = knotsR.map(rv => Math.log(rv));
    }
    const slopes = computeHermiteSlopes(hermiteXs, knotsF);

    function env(rv) {
      const rSafe = Math.max(rv, 1e-6);
      // r^D * exp(-alpha r)
      return Math.pow(rSafe, D) * Math.exp(-alpha * rSafe);
    }


    function evalLogS(rv) {
      if (!(rv > 0)) return knotsF[0];
      let x = rv;
      if (useLogLogInterp) x = Math.log(rv);
      let x0 = hermiteXs[0], x1 = hermiteXs[K - 1];
      if (x <= x0) return knotsF[0];
      if (x >= x1) return knotsF[K - 1];
      const v = evalHermite(x, hermiteXs, knotsF, slopes);
      return Number.isFinite(v) ? v : 0;
    }

    function evalPr(rv) {
      if (!(rv > 0)) return 0;
      const v = env(rv) * Math.exp(evalLogS(rv));
      return Number.isFinite(v) ? Math.max(0, v) : 0;
    }

    // Resample onto the input r-grid so we can overlay directly.
    const outP = new Array(n);
    for (let i = 0; i < n; i++) {
      const rv = r[i];
      outP[i] = evalPr(rv);
    }

    return {
      theta: { D, alpha, knotsR, knotsF },
      pr: { r: r.slice(0, n), p: outP },
    };
  }

  function buildConstrainedPrSplineFromIq(pr, iq, {
    knots = 12,
    tailFrac = 0.35,
    minTailPoints = 12,
    interpMode = "linear",
    fitQSamples = 160,
    passes = 4,
    minKnots = 6,
    prunePasses = 24,
  } = {}) {
    const scattering = window.CalyrEvolution && window.CalyrEvolution.scattering;
    if (!scattering || typeof scattering.intensityFromPr !== "function") return null;

    const seed = buildConstrainedPrSplineFromPr(pr, { knots, tailFrac, minTailPoints, interpMode });
    if (!seed || !seed.pr || !seed.theta) return null;

    const q = iq && Array.isArray(iq.q) ? iq.q : [];
    const I = iq && Array.isArray(iq.I) ? iq.I : [];
    const rGrid = pr && Array.isArray(pr.r) ? pr.r : [];
    if (!q.length || !I.length || !rGrid.length) return seed;

    const sampledQ = [];
    const sampledI = [];
    const nIq = Math.min(q.length, I.length);
    const stride = Math.max(1, Math.ceil(nIq / Math.max(12, fitQSamples)));
    for (let i = 0; i < nIq; i += stride) {
      const qv = q[i];
      const Iv = I[i];
      if (!Number.isFinite(qv) || !Number.isFinite(Iv) || !(qv >= 0) || !(Iv > 0)) continue;
      sampledQ.push(qv);
      sampledI.push(Iv);
    }
    if (sampledQ.length < 8) return seed;

    const targetNorm = scattering.normalizeIToI0({ q: sampledQ, I: sampledI });
    const targetQ = targetNorm.q;
    const targetI = targetNorm.I;

    function buildThetaCopy(theta) {
      return {
        D: Number.isFinite(theta && theta.D) ? theta.D : 2,
        alpha: Number.isFinite(theta && theta.alpha) ? theta.alpha : 0.02,
        knotsR: Array.isArray(theta && theta.knotsR) ? theta.knotsR.slice() : [],
        knotsF: Array.isArray(theta && theta.knotsF) ? theta.knotsF.slice() : [],
      };
    }

    function computeIqLoss(theta) {
      const builtPr = buildPrFromTheta(theta, rGrid);
      if (!builtPr) return { loss: Infinity, fitLoss: Infinity, pr: null, iq: null };
      const rawIq = scattering.intensityFromPr(builtPr, targetQ);
      const model = scattering.normalizeIToI0(rawIq);
      const mI = model && Array.isArray(model.I) ? model.I : [];
      const n = Math.min(targetI.length, mI.length);
      if (!n) return { loss: Infinity, fitLoss: Infinity, pr: builtPr, iq: model };

      let errQ = 0;
      let errLog = 0;
      let count = 0;
      const qMax = targetQ.length ? Math.max(EPS, targetQ[targetQ.length - 1] || EPS) : 1;
      for (let i = 0; i < n; i++) {
        const qv = targetQ[i];
        const tv = targetI[i];
        const mv = mI[i];
        if (!(Number.isFinite(qv) && qv >= 0 && Number.isFinite(tv) && tv > 0 && Number.isFinite(mv) && mv > 0)) continue;
        const qWeight = Math.max(qv, qMax * 1e-3);
        const diffQ = qWeight * (tv - mv);
        const diffLog = Math.log(tv + EPS) - Math.log(mv + EPS);
        errQ += diffQ * diffQ;
        errLog += diffLog * diffLog;
        count += 1;
      }
      if (!count) return { loss: Infinity, fitLoss: Infinity, pr: builtPr, iq: model };

      let smoothPenalty = 0;
      const knotsF = Array.isArray(theta.knotsF) ? theta.knotsF : [];
      for (let i = 1; i + 1 < knotsF.length; i++) {
        const curv = knotsF[i - 1] - 2 * knotsF[i] + knotsF[i + 1];
        smoothPenalty += curv * curv;
      }

      const fitLoss = (errQ / count) + (errLog / count) * 0.15;
      const knotPenalty = Math.max(0, knotsF.length - minKnots) * 8e-5;
      const totalLoss = fitLoss + smoothPenalty * 2e-4 + knotPenalty;

      return {
        loss: totalLoss,
        fitLoss,
        pr: builtPr,
        iq: model,
      };
    }

    function optimizeTheta(theta, passCount, { stepFInit = 0.55, stepAlphaInit = null, stepDInit = 0.18 } = {}) {
      let bestLocal = computeIqLoss(theta);
      if (!Number.isFinite(bestLocal.loss)) return bestLocal;

      let stepF = stepFInit;
      let stepAlpha = stepAlphaInit != null ? stepAlphaInit : Math.max(0.0025, Math.abs(theta.alpha || 0.02) * 0.18);
      let stepD = stepDInit;
      const nPasses = clamp(Math.floor(passCount), 1, 10);

      for (let pass = 0; pass < nPasses; pass++) {
        let improved = false;

        for (let i = 0; i < theta.knotsF.length; i++) {
          const baseValue = theta.knotsF[i];
          let bestValue = baseValue;
          for (const delta of [-stepF, stepF]) {
            theta.knotsF[i] = baseValue + delta;
            const cand = computeIqLoss(theta);
            if (cand.loss + 1e-12 < bestLocal.loss) {
              bestLocal = cand;
              bestValue = theta.knotsF[i];
              improved = true;
            }
          }
          theta.knotsF[i] = bestValue;
        }

        const baseAlpha = theta.alpha;
        let bestAlpha = baseAlpha;
        for (const delta of [-stepAlpha, stepAlpha]) {
          theta.alpha = clamp(baseAlpha + delta, 1e-5, 1.0);
          const cand = computeIqLoss(theta);
          if (cand.loss + 1e-12 < bestLocal.loss) {
            bestLocal = cand;
            bestAlpha = theta.alpha;
            improved = true;
          }
        }
        theta.alpha = bestAlpha;

        const baseD = theta.D;
        let bestD = baseD;
        for (const delta of [-stepD, stepD]) {
          theta.D = clamp(baseD + delta, 0.5, 6);
          const cand = computeIqLoss(theta);
          if (cand.loss + 1e-12 < bestLocal.loss) {
            bestLocal = cand;
            bestD = theta.D;
            improved = true;
          }
        }
        theta.D = bestD;

        stepF *= improved ? 0.72 : 0.5;
        stepAlpha *= improved ? 0.72 : 0.5;
        stepD *= improved ? 0.72 : 0.5;
        if (stepF < 0.015 && stepAlpha < 5e-4 && stepD < 0.02) break;
      }

      return bestLocal;
    }

    const theta = buildThetaCopy(seed.theta);
    let best = optimizeTheta(theta, passes);
    if (!Number.isFinite(best.loss)) return seed;

    const pruneFitTolAbs = Math.max(2e-6, best.fitLoss * 0.03);
    let remainingPrunePasses = clamp(Math.floor(prunePasses), 0, 64);
    while (theta.knotsF.length > minKnots && remainingPrunePasses > 0) {
      let bestCandidateTheta = null;
      let bestCandidate = null;

      for (let i = 1; i + 1 < theta.knotsF.length; i++) {
        const candTheta = buildThetaCopy(theta);
        candTheta.knotsR.splice(i, 1);
        candTheta.knotsF.splice(i, 1);
        const cand = optimizeTheta(candTheta, Math.min(3, passes), {
          stepFInit: 0.16,
          stepAlphaInit: Math.max(8e-4, Math.abs(candTheta.alpha || 0.02) * 0.08),
          stepDInit: 0.06,
        });
        if (!Number.isFinite(cand.loss)) continue;
        if (cand.fitLoss > best.fitLoss + pruneFitTolAbs) continue;
        if (!bestCandidate || cand.loss < bestCandidate.loss - 1e-12) {
          bestCandidate = cand;
          bestCandidateTheta = candTheta;
        }
    }

      if (!bestCandidateTheta || !bestCandidate) break;
      theta.D = bestCandidateTheta.D;
      theta.alpha = bestCandidateTheta.alpha;
      theta.knotsR = bestCandidateTheta.knotsR;
      theta.knotsF = bestCandidateTheta.knotsF;
      best = bestCandidate;
      remainingPrunePasses -= 1;
    }

    const finalPr = best.pr || buildPrFromTheta(theta, rGrid) || seed.pr;
    return {
      theta: buildThetaCopy(theta),
      pr: finalPr,
      iq: best.iq || null,
      seed,
      loss: best.loss,
      fitLoss: best.fitLoss,
    };
  }

  function buildPrFromTheta(theta, rGrid) {
    const t = theta && typeof theta === "object" ? theta : null;
    const r = Array.isArray(rGrid) ? rGrid : [];
    if (!t || !Array.isArray(t.knotsR) || !Array.isArray(t.knotsF) || r.length < 2) return null;

    const D = Number.isFinite(t.D) ? t.D : 2;
    const alpha = Number.isFinite(t.alpha) ? t.alpha : 0.02;
    const knotsR = t.knotsR.slice();
    const knotsF = t.knotsF.slice();
    const K = Math.min(knotsR.length, knotsF.length);
    if (K < 2) return null;

    const slopes = computeHermiteSlopes(knotsR, knotsF);

    function env(rv) {
      const rSafe = Math.max(rv, 1e-6);
      return Math.pow(rSafe, D) * Math.exp(-alpha * rSafe);
    }

    function evalLogS(rv) {
      if (!(rv > 0)) return knotsF[0];
      if (rv <= knotsR[0]) return knotsF[0];
      if (rv >= knotsR[K - 1]) return knotsF[K - 1];
      const v = evalHermite(rv, knotsR, knotsF, slopes);
      return Number.isFinite(v) ? v : 0;
    }

    const p = new Array(r.length);
    for (let i = 0; i < r.length; i++) {
      const rv = r[i];
      if (!(rv > 0)) {
        p[i] = 0;
        continue;
      }
      const v = env(rv) * Math.exp(evalLogS(rv));
      p[i] = Number.isFinite(v) ? Math.max(0, v) : 0;
    }

    return { r: r.slice(), p };
  }

  // Build envelope (nonshifted or shifted) on a given r-grid
  function buildEnvelopeFromParams(params, rGrid) {
    const D = Number.isFinite(params.D) ? params.D : 2;
    const alpha = Number.isFinite(params.alpha) ? params.alpha : 0.02;
    const r0 = Number.isFinite(params.r0) ? params.r0 : 0;
    const r = Array.isArray(rGrid) ? rGrid : [];
    const p = new Array(r.length);
    for (let i = 0; i < r.length; i++) {
      const rv = r[i];
      if (!(rv > r0)) {
        p[i] = 0;
        continue;
      }
      p[i] = Math.pow(rv - r0, D) * Math.exp(-alpha * (rv - r0));
    }
    return { r: r.slice(), p };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.prSpline = {
    buildConstrainedPrSplineFromPr,
    buildConstrainedPrSplineFromIq,
    buildPrFromTheta,
    fitEnvelopeParams,
    fitShiftedEnvelopeParams,
    buildEnvelopeFromParams,
    envelopeMaxPositionValue,
  };
})();
