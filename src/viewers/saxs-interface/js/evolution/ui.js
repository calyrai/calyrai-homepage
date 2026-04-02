(function () {
  "use strict";

  function defaultForwardModel({ beads, qGrid, prOptions }) {
    const pdd = window.CalyrEvolution && window.CalyrEvolution.pdd;
    const scat = window.CalyrEvolution && window.CalyrEvolution.scattering;
    if (!pdd || !scat) throw new Error("CalyrEvolution modules missing: pdd/scattering");

    const pr = pdd.computePairDistanceHistogram(beads, prOptions || {});
    const iq = scat.intensityFromPr(pr, qGrid);
    return { pr, iq };
  }

  function runEvolution(expIq, {
    populationSize = 24,
    beadsN = 120,
    initialBeads = null,
    referenceBeads = null,
    initRadius = 30,
    prOptions = { binWidth: 1.0 },
    prior = {
      repulsion: { rMin: 2.5, strength: 0.7, power: 2, maxPairs: 50000 },
      bonds: { bondLength: 3.8, strength: 0.02 },
      tether: { strength: 0.025 },
      local: { neighbors: 2, strength: 0.18 },
    },
    wI = 1,
    wP = 0,
    schedule = null,
    generations = 120,
    mutate = { step: 1.5, pMove: 0.22 },
    seed = 1,
    onProgress = null,
  } = {}) {
    const sampler = window.CalyrEvolution && window.CalyrEvolution.sampler;
    const priors = window.CalyrEvolution && window.CalyrEvolution.priors;
    const anneal = window.CalyrEvolution && window.CalyrEvolution.anneal;
    const evaluator = window.CalyrEvolution && window.CalyrEvolution.evaluator;

    if (!sampler || !priors || !anneal || !evaluator) {
      throw new Error("CalyrEvolution modules missing: sampler/priors/anneal/evaluator");
    }

    const rng = sampler.makeRng(seed);
    const qGrid = (expIq && Array.isArray(expIq.q)) ? expIq.q.slice() : [];
    if (qGrid.length < 2) throw new Error("expIq.q must be an array with at least 2 points");

    const temp = schedule || anneal.geometricSchedule({ T0: 1.0, alpha: 0.985 });
    const refBeads = Array.isArray(referenceBeads) && referenceBeads.length >= 2
      ? sampler.cloneBeads(referenceBeads)
      : (Array.isArray(initialBeads) && initialBeads.length >= 2 ? sampler.cloneBeads(initialBeads) : null);

    function priorPenalty(beads) {
      const rep = priors.excludedVolumePenalty(beads, prior && prior.repulsion);
      const bond = priors.connectivityPenalty(beads, prior && prior.bonds);
      const tether = refBeads ? priors.tetherPenalty(beads, refBeads, prior && prior.tether) : 0;
      const local = refBeads ? priors.localDistancePenalty(beads, refBeads, prior && prior.local) : 0;
      return rep + bond + tether + local;
    }

    function evaluate(beads) {
      const { pr, iq } = defaultForwardModel({ beads, qGrid, prOptions });
      const pen = priorPenalty(beads);
      const evalRes = evaluator.evaluateCandidate({
        modelIq: iq,
        expIq,
        modelPr: pr,
        targetPr: null,
        priorPenalty: pen,
        wI,
        wP,
        fitScale: true,
      });
      return { pr, iq, eval: evalRes };
    }

    const baseSeedBeads = Array.isArray(initialBeads) && initialBeads.length >= 2
      ? sampler.cloneBeads(initialBeads)
      : null;

    // init population
    const pop = [];
    for (let i = 0; i < populationSize; i++) {
      const beads = baseSeedBeads
        ? (i === 0
          ? sampler.cloneBeads(baseSeedBeads)
          : sampler.mutateBeads(baseSeedBeads, {
            ...mutate,
            step: Math.max(0.25, 0.45 * (Number.isFinite(mutate && mutate.step) ? mutate.step : 1.5)),
            pMove: 1,
            seed: (seed + 17 * i) >>> 0,
          }))
        : sampler.initRandomBeads(beadsN, { radius: initRadius, seed: (seed + 17 * i) >>> 0 });
      const e = evaluate(beads);
      pop.push({ beads, ...e, accepted: 0, tried: 0 });
    }

    function selectAndResample(population) {
      // Keep top 20% and resample the rest from elites with mutation.
      const sorted = population.slice().sort((a, b) => b.eval.logPost - a.eval.logPost);
      const eliteN = Math.max(2, Math.floor(sorted.length * 0.2));
      const elites = sorted.slice(0, eliteN);

      const next = [];
      for (let i = 0; i < sorted.length; i++) {
        const base = elites[Math.floor(rng() * elites.length)];
        const beads = sampler.mutateBeads(base.beads, { ...mutate, seed: Math.floor(rng() * 0xffffffff) });
        const e = evaluate(beads);
        next.push({ beads, ...e, accepted: 0, tried: 0 });
      }
      return next;
    }

    let best = pop.slice().sort((a, b) => b.eval.logPost - a.eval.logPost)[0];
    const history = [];

    for (let gen = 0; gen < generations; gen++) {
      const T = temp(gen);

      for (let i = 0; i < pop.length; i++) {
        const cur = pop[i];
        cur.tried++;

        const proposalBeads = sampler.mutateBeads(cur.beads, { ...mutate, seed: Math.floor(rng() * 0xffffffff) });
        const prop = evaluate(proposalBeads);

        const ok = anneal.acceptLogPost({
          logPostOld: cur.eval.logPost,
          logPostNew: prop.eval.logPost,
          T,
          rng,
        });

        if (ok) {
          pop[i] = { ...cur, beads: proposalBeads, pr: prop.pr, iq: prop.iq, eval: prop.eval, accepted: cur.accepted + 1, tried: cur.tried };
        }

        if (pop[i].eval.logPost > best.eval.logPost) best = pop[i];
      }

      // Optional population evolution step.
      const evolved = selectAndResample(pop);
      for (let i = 0; i < pop.length; i++) pop[i] = evolved[i];

      history.push({
        gen,
        T,
        best: {
          logPost: best.eval.logPost,
          chi2_I: best.eval.chi2_I,
          prior: best.eval.prior,
          scale: best.eval.scale,
        },
      });

      if (typeof onProgress === "function") {
        onProgress({ gen, T, best, history: history.slice() });
      }
    }

    return { best, history };
  }

  async function runEvolutionAsync(expIq, options = {}) {
    const {
      yieldEveryGen = 1,
      onProgress = null,
      ...rest
    } = options || {};

    const yieldToUi = () => new Promise((resolve) => {
      if (typeof requestAnimationFrame === "function") return requestAnimationFrame(() => resolve());
      return setTimeout(() => resolve(), 0);
    });

    const wrappedOnProgress = (payload) => {
      if (typeof onProgress === "function") onProgress(payload);
    };

    // Run the same algorithm as `runEvolution`, but yield once per generation
    // so the UI can paint progress updates.
    const sampler = window.CalyrEvolution && window.CalyrEvolution.sampler;
    const priors = window.CalyrEvolution && window.CalyrEvolution.priors;
    const anneal = window.CalyrEvolution && window.CalyrEvolution.anneal;
    const evaluator = window.CalyrEvolution && window.CalyrEvolution.evaluator;

    if (!sampler || !priors || !anneal || !evaluator) {
      throw new Error("CalyrEvolution modules missing: sampler/priors/anneal/evaluator");
    }

    const {
      populationSize = 24,
      beadsN = 120,
      initialBeads = null,
      referenceBeads = null,
      initRadius = 30,
      prOptions = { binWidth: 1.0 },
      prior = {
        repulsion: { rMin: 2.5, strength: 0.7, power: 2, maxPairs: 50000 },
        bonds: { bondLength: 3.8, strength: 0.02 },
        tether: { strength: 0.025 },
        local: { neighbors: 2, strength: 0.18 },
      },
      wI = 1,
      wP = 0,
      schedule = null,
      generations = 120,
      mutate = { step: 1.5, pMove: 0.22 },
      seed = 1,
    } = rest;

    const rng = sampler.makeRng(seed);
    const qGrid = (expIq && Array.isArray(expIq.q)) ? expIq.q.slice() : [];
    if (qGrid.length < 2) throw new Error("expIq.q must be an array with at least 2 points");

    const temp = schedule || anneal.geometricSchedule({ T0: 1.0, alpha: 0.985 });
    const refBeads = Array.isArray(referenceBeads) && referenceBeads.length >= 2
      ? sampler.cloneBeads(referenceBeads)
      : (Array.isArray(initialBeads) && initialBeads.length >= 2 ? sampler.cloneBeads(initialBeads) : null);

    function priorPenalty(beads) {
      const rep = priors.excludedVolumePenalty(beads, prior && prior.repulsion);
      const bond = priors.connectivityPenalty(beads, prior && prior.bonds);
      const tether = refBeads ? priors.tetherPenalty(beads, refBeads, prior && prior.tether) : 0;
      const local = refBeads ? priors.localDistancePenalty(beads, refBeads, prior && prior.local) : 0;
      return rep + bond + tether + local;
    }

    function evaluate(beads) {
      const { pr, iq } = defaultForwardModel({ beads, qGrid, prOptions });
      const pen = priorPenalty(beads);
      const evalRes = evaluator.evaluateCandidate({
        modelIq: iq,
        expIq,
        modelPr: pr,
        targetPr: null,
        priorPenalty: pen,
        wI,
        wP,
        fitScale: true,
      });
      return { pr, iq, eval: evalRes };
    }

    const baseSeedBeads = Array.isArray(initialBeads) && initialBeads.length >= 2
      ? sampler.cloneBeads(initialBeads)
      : null;

    const pop = [];
    for (let i = 0; i < populationSize; i++) {
      const beads = baseSeedBeads
        ? (i === 0
          ? sampler.cloneBeads(baseSeedBeads)
          : sampler.mutateBeads(baseSeedBeads, {
            ...mutate,
            step: Math.max(0.25, 0.45 * (Number.isFinite(mutate && mutate.step) ? mutate.step : 1.5)),
            pMove: 1,
            seed: (seed + 17 * i) >>> 0,
          }))
        : sampler.initRandomBeads(beadsN, { radius: initRadius, seed: (seed + 17 * i) >>> 0 });
      const e = evaluate(beads);
      pop.push({ beads, ...e, accepted: 0, tried: 0 });
    }

    function selectAndResample(population) {
      const sorted = population.slice().sort((a, b) => b.eval.logPost - a.eval.logPost);
      const eliteN = Math.max(2, Math.floor(sorted.length * 0.2));
      const elites = sorted.slice(0, eliteN);

      const next = [];
      for (let i = 0; i < sorted.length; i++) {
        const base = elites[Math.floor(rng() * elites.length)];
        const beads = sampler.mutateBeads(base.beads, { ...mutate, seed: Math.floor(rng() * 0xffffffff) });
        const e = evaluate(beads);
        next.push({ beads, ...e, accepted: 0, tried: 0 });
      }
      return next;
    }

    let best = pop.slice().sort((a, b) => b.eval.logPost - a.eval.logPost)[0];
    const history = [];

    for (let gen = 0; gen < generations; gen++) {
      const T = temp(gen);

      for (let i = 0; i < pop.length; i++) {
        const cur = pop[i];
        cur.tried++;

        const proposalBeads = sampler.mutateBeads(cur.beads, { ...mutate, seed: Math.floor(rng() * 0xffffffff) });
        const prop = evaluate(proposalBeads);

        const ok = anneal.acceptLogPost({
          logPostOld: cur.eval.logPost,
          logPostNew: prop.eval.logPost,
          T,
          rng,
        });

        if (ok) {
          pop[i] = { ...cur, beads: proposalBeads, pr: prop.pr, iq: prop.iq, eval: prop.eval, accepted: cur.accepted + 1, tried: cur.tried };
        }

        if (pop[i].eval.logPost > best.eval.logPost) best = pop[i];
      }

      const evolved = selectAndResample(pop);
      for (let i = 0; i < pop.length; i++) pop[i] = evolved[i];

      history.push({
        gen,
        T,
        best: {
          logPost: best.eval.logPost,
          chi2_I: best.eval.chi2_I,
          prior: best.eval.prior,
          scale: best.eval.scale,
        },
      });

      wrappedOnProgress({ gen, T, best, history: history.slice() });

      if (yieldEveryGen && (gen % yieldEveryGen === 0)) {
        await yieldToUi();
      }
    }

    return { best, history };
  }

  window.CalyrEvolution = window.CalyrEvolution || {};
  window.CalyrEvolution.ui = {
    runEvolution,
    runEvolutionAsync,
  };
})();
