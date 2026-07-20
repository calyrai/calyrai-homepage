# Oracling Reading Room

**Reference ID:** `CALYR-ROOM-ORACLE-001`  
**Status:** Living reading room  
**Scope:** Oracling only — turning evidence and uncertain predictions into constrained, explainable decisions and the next informative action

## Read this room to do something

This is not a bibliography. It is a working route through the ideas required to build an Oracle that knows what it predicts, what it does not know, which candidates are admissible, which trade-offs remain, and what should happen next.

Start with the **core route**. Open the deeper shelves only when the current Oracle exposes a concrete failure: poor calibration, unknown feasibility, unstable trade-offs, redundant experiments, or a decision that should be deferred.

## Core route: 90 minutes

| Order | Paper | Read for | Oracling output |
|---|---|---|---|
| 01 | [On Calibration of Modern Neural Networks](https://proceedings.mlr.press/v70/guo17a.html) — Guo et al., 2017 | why confidence is not automatically probability | a calibration check per trait |
| 02 | [Deep Ensembles](https://papers.nips.cc/paper_files/paper/2017/hash/9ef2ed4b7fd2c810847ffa5fa85bce38-Abstract.html) — Lakshminarayanan et al., 2017 | a practical uncertainty baseline | predictive distributions, not isolated point estimates |
| 03 | [Predictive Entropy Search with Unknown Constraints](https://proceedings.mlr.press/v37/hernandez-lobatob15.html) — Hernández-Lobato et al., 2015 | learning the optimum and feasibility together | an explicit unknown-constraint state |
| 04 | [Differentiable Expected Hypervolume Improvement](https://proceedings.neurips.cc/paper/2020/hash/6fec24eac8f18ed793f5eaad3dd7977c-Abstract.html) — Daulton et al., 2020 | choosing batches without collapsing objectives into one score | a Pareto-aware acquisition policy |
| 05 | [Selective Classification for Deep Neural Networks](https://papers.nips.cc/paper/2017/hash/4a8423d5e91fda00bb7e46540e2b0cf1-Abstract.html) — Geifman and El-Yaniv, 2017 | trading coverage for controlled risk | a principled `review_required` or abstain path |

After this route, write one page that names the traits, hard constraints, uncertainty representation, Pareto logic, and abstention rule of the Oracle. If any of those five fields is missing, the system is not decision-ready.

## Shelf 01 — calibrated uncertainty

### On Calibration of Modern Neural Networks

[Paper and code references](https://proceedings.mlr.press/v70/guo17a.html) · Guo, Pleiss, Sun, and Weinberger · ICML 2017

**Why read:** modern neural networks can be accurate and still misstate confidence. Temperature scaling provides a strong, simple post-hoc baseline.

**Use in Oracling:** report calibration and interval coverage separately for every trait and evidence regime. Never interpret an uncalibrated model score as decision probability.

### Simple and Scalable Predictive Uncertainty Estimation using Deep Ensembles

[Paper](https://papers.nips.cc/paper_files/paper/2017/hash/9ef2ed4b7fd2c810847ffa5fa85bce38-Abstract.html) · Lakshminarayanan, Pritzel, and Blundell · NeurIPS 2017

**Why read:** it is a practical, competitive uncertainty baseline that is straightforward to reproduce.

**Use in Oracling:** compare the Oracle's uncertainty mechanism against an ensemble baseline before adopting a more elaborate method.

### Conformalized Quantile Regression

[Paper](https://papers.nips.cc/paper_files/paper/2019/hash/5103c3584b063c431bd1268e9b5e76fb-Abstract.html) · Romano, Patterson, and Candès · NeurIPS 2019

**Why read:** conformalization adds finite-sample marginal coverage while allowing interval width to adapt to heteroscedasticity.

**Use in Oracling:** construct auditable prediction intervals when coverage matters more than a fully specified probabilistic model. State the exchangeability assumptions and test them against domain shift.

### Simple and Principled Uncertainty Estimation with Deterministic Deep Learning via Distance Awareness

[Paper](https://papers.nips.cc/paper_files/paper/2020/hash/543e83748234f7cbab21aa0ade66565f-Abstract.html) · Liu et al. · NeurIPS 2020

**Why read:** spectral-normalized neural Gaussian processes connect uncertainty to distance awareness without requiring a full ensemble.

**Use in Oracling:** examine whether uncertainty rises away from training support. Treat this as an applicability signal, not automatic proof of out-of-domain detection.

## Shelf 02 — constraints and feasibility

### Predictive Entropy Search for Bayesian Optimization with Unknown Constraints

[Paper](https://proceedings.mlr.press/v37/hernandez-lobatob15.html) · Hernández-Lobato et al. · ICML 2015

**Why read:** the acquisition function seeks information about the constrained optimum while feasibility itself is uncertain.

**Use in Oracling:** keep `fail`, `pass`, and `unknown` distinct. Select experiments that resolve consequential unknown constraints instead of treating missing evidence as a soft penalty.

### Scalable Constrained Bayesian Optimization

[Paper](https://proceedings.mlr.press/v130/eriksson21a.html) · Eriksson and Poloczek · AISTATS 2021

**Why read:** SCBO handles many constraints and high-dimensional search through local trust regions.

**Use in Oracling:** use trust regions when global surrogate confidence is implausible. Record the region in which each recommendation is valid.

## Shelf 03 — Pareto decisions, not hidden scores

### Differentiable Expected Hypervolume Improvement for Parallel Multi-Objective Bayesian Optimization

[Paper](https://proceedings.neurips.cc/paper/2020/hash/6fec24eac8f18ed793f5eaad3dd7977c-Abstract.html) · Daulton, Balandat, and Bakshy · NeurIPS 2020

**Why read:** qEHVI provides a differentiable, batch-aware route to expected hypervolume improvement.

**Use in Oracling:** propose a batch that expands the supported Pareto frontier. Keep the reference point, objective directions, and normalization visible because all three shape the recommendation.

### Practical Bayesian Optimization of Machine Learning Algorithms

[Paper](https://papers.nips.cc/paper_files/paper/2012/hash/05311655a15b75fab86956663e1819cd-Abstract.html) · Snoek, Larochelle, and Adams · NeurIPS 2012

**Why read:** a canonical operational account of Bayesian optimization, including variable evaluation cost and parallel experiments.

**Use in Oracling:** make experimental cost and batch execution part of acquisition rather than post-hoc logistics.

## Shelf 04 — next experiment and model criticism

### On the role of model uncertainties in Bayesian optimisation

[Paper](https://proceedings.mlr.press/v216/foldager23a.html) · Foldager et al. · UAI 2023

**Why read:** it distinguishes uncertainty quality from downstream optimization behavior and tests whether uncertainty estimates actually help acquisition.

**Use in Oracling:** evaluate the proposed next experiment by decision value, not by uncertainty aesthetics. Compare against simple acquisition baselines.

### Active Learning Literature Survey

[Survey](https://burrsettles.com/pub/settles.activelearning.pdf) · Burr Settles · 2009

**Why read:** it gives the vocabulary for pool-based selection, query synthesis, uncertainty sampling, expected model change, and density weighting.

**Use in Oracling:** name the acquisition rationale for each exploration candidate and test whether it reduces the uncertainty that can change a decision.

## Shelf 05 — abstention and human review

### Selective Classification for Deep Neural Networks

[Paper](https://papers.nips.cc/paper/2017/hash/4a8423d5e91fda00bb7e46540e2b0cf1-Abstract.html) · Geifman and El-Yaniv · NeurIPS 2017

**Why read:** selective prediction formalizes the risk–coverage trade-off by allowing a model to reject cases.

**Use in Oracling:** define when the Oracle returns `usable`, `review_required`, or `blocked`. Measure risk against coverage rather than rewarding a system for answering every case.

## Reading-to-implementation map

| If the Oracle fails here | Read first | Implement or test next |
|---|---|---|
| confidence is unreliable | Guo et al.; Romano et al. | reliability diagram, expected calibration error, interval coverage by subgroup |
| uncertainty stays low out of domain | Deep Ensembles; Liu et al. | ensemble disagreement, distance-aware baseline, applicability stress test |
| feasibility is partly unknown | Hernández-Lobato et al.; Eriksson and Poloczek | explicit constraint models, unknown state, constrained acquisition |
| one score hides trade-offs | Daulton et al. | Pareto set, reference-point sensitivity, hypervolume contribution |
| proposed experiments are redundant | Settles; Foldager et al. | acquisition ablation, diversity constraint, information-value audit |
| the system should sometimes refuse | Geifman and El-Yaniv | abstention threshold, risk–coverage curve, review queue |

## Reading discipline

For every paper adopted into the method catalog, record:

1. the Oracle failure it is meant to address;
2. its assumptions and the conditions under which they fail;
3. the smallest reproducible baseline;
4. the metric that would falsify its usefulness;
5. the evidence level achieved by the local implementation;
6. the exact decision contract field it changes.

Do not import a method because it is sophisticated. Import it only when it improves a traceable decision, detects a failure, or selects a more informative next action.

## Boundaries that must stay visible

- prediction is not decision;
- confidence is not calibrated probability;
- uncertainty is not evidence;
- preference is not constraint;
- a Pareto set is not a single optimum;
- novelty is not information value;
- a proposed experiment is not a validated result;
- abstention is a valid output, not a system failure.

## Return to the method

Apply these readings through the [Oracling Method Contract](/research/methods/oracling/). The contract defines what the Oracle must expose; this room explains why those fields and failure states exist.
