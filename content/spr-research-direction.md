# Fractional Adsorption Theory and SPR Surrogate Inference

**Status:** Conceptual direction. Code and evidence remain under validation.

## Scientific proposition

The project investigates whether fractional-order adsorption dynamics can represent a distributed ensemble of unresolved binding, transport, and relaxation processes in surface plasmon resonance (SPR). The physical model remains in control; machine learning accelerates forward evaluation, probabilistic inversion, and experiment design without hiding assumptions, uncertainty, or validity limits.

## Model hierarchy

Classical 1:1 Langmuir kinetics remains the integer-order reference. Bi-Langmuir remains an interpretable comparison for two distinguishable binding-site populations. Fractional-order dynamics extend the hierarchy by representing memory and a distribution of unresolved timescales rather than asserting a fixed integer chain of hidden states.

For a fractional order `0 < α ≤ 1`, the conceptual governing form is:

`D_t^α θ(t) = kₐ C(t)(1 − θ(t)) − k_d θ(t)`

At `α = 1`, classical Langmuir kinetics is recovered. A distributed-order extension may represent a spectrum of processes, but complexity earns its place only when it improves held-out prediction and remains identifiable.

The complete theory must still define association and dissociation phases, parameter units and bounds, initial conditions, mass transport, rebinding, injection dispersion, bulk refractive-index response, nonspecific binding, baseline drift, and the conditions under which fractional orders, process spectra, or competing population models are identifiable.

## Research workflow

1. **Experimental context** — concentration series, flow, timing, surface capacity, controls, and sensorgrams.
2. **Mechanistic model hierarchy** — 1:1 Langmuir, Bi-Langmuir, transport-aware, fractional, and distributed-process alternatives under one observation model.
3. **Synthetic design space** — physically valid parameter combinations generate labelled sensorgram families.
4. **SPR surrogate** — a fast emulator predicts complete sensorgrams; an inverse model estimates physical parameters, fractional orders, or process distributions.
5. **Validation and design** — held-out prediction, uncertainty calibration, identifiability checks, and selection of the next discriminating experiment.

## Research object

The recovered computational sources include mechanistic SPR and stochastic formulations as well as a separate bi-Langmuir notebook whose authorship and release rights still require confirmation. The public research object should therefore publish the theory and validated implementation only after provenance, authorship, executable behaviour, and licensing have been resolved.

## Surrogate architecture

- **Forward surrogate:** experimental conditions and physical parameters → complete sensorgram.
- **Inverse surrogate:** sensorgram and conditions → posterior over kinetic parameters, fractional orders, nuisance parameters, and supported model families.
- **Residual model:** structured discrepancy separates missing physics from measurement noise.
- **Applicability domain:** out-of-distribution conditions are rejected or marked for review.
- **Design-of-experiments layer:** concentrations, flow rates, and contact times are ranked by expected information gain.
- **Mechanistic benchmark:** 1:1, Bi-Langmuir, transport-aware, fractional, distributed-order, and stochastic alternatives are compared under the same validation contract.

The surrogate is useful only where it reproduces the governing forward model, exposes uncertainty, and preserves identifiability. A fast but physically ambiguous fit is not the intended result.

## Publication boundary

The 2016 aligned-macroporous-monolith publication is relevant background for templated structures and protein chromatography. It is not the publication of the SPR code, is not authored by the notebook author, and does not establish ownership of its fabrication method.

## Outlook

The long-term destination is a transparent SPR oracle: experimental conditions and sensorgrams in; the least complex supported physical explanation, interpretable kinetic states, uncertainty, model adequacy, and the next informative experiment out.
