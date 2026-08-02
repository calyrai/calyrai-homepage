# Bi-Langmuir Theory and SPR Surrogate Modelling

**Status:** Conceptual direction. Code and evidence remain under validation.

## Scientific proposition

The project develops a complete theory for bi-Langmuir adsorption and turns that theory into an interpretable surrogate-modelling concept for surface plasmon resonance (SPR). The physical theory remains the governing model; machine learning accelerates its evaluation and inversion without replacing its parameters or constraints.

## Bi-Langmuir foundation

Two distinguishable binding-site populations contribute to the observed response. For population `i ∈ {1,2}`:

`dθᵢ/dt = kₐ,ᵢ C(t)(1 − θᵢ) − k_d,ᵢ θᵢ`

The measurable response is constructed from both populations:

`R(t) = Rmax [f θ₁(t) + (1 − f) θ₂(t)] + Rnuisance(t)`

The complete theory must define association and dissociation phases, equilibrium limits, site fractions and capacities, parameter units and bounds, initial conditions, mass transport, rebinding, injection dispersion, bulk refractive-index response, nonspecific binding, baseline drift, and the conditions under which the two populations are identifiable.

## Research workflow

1. **Experimental context** — concentration series, flow, timing, surface capacity, controls, and sensorgrams.
2. **Bi-Langmuir forward theory** — two coupled site populations plus explicit observation and nuisance models.
3. **Synthetic design space** — physically valid parameter combinations generate labelled sensorgram families.
4. **SPR surrogate** — a fast emulator predicts complete sensorgrams; an inverse model estimates parameter or state distributions.
5. **Validation and design** — held-out prediction, uncertainty calibration, identifiability checks, and selection of the next discriminating experiment.

## Research object

The recovered computational sources include mechanistic SPR and stochastic formulations as well as a separate bi-Langmuir notebook whose authorship and release rights still require confirmation. The public research object should therefore publish the theory and validated implementation only after provenance, authorship, executable behaviour, and licensing have been resolved.

## Surrogate architecture

- **Forward surrogate:** experimental conditions and physical parameters → complete sensorgram.
- **Inverse surrogate:** sensorgram and conditions → posterior over kinetic parameters, capacities, and site fractions.
- **Residual model:** structured discrepancy separates missing physics from measurement noise.
- **Applicability domain:** out-of-distribution conditions are rejected or marked for review.
- **Design-of-experiments layer:** concentrations, flow rates, and contact times are ranked by expected information gain.
- **Mechanistic benchmark:** 1:1, bi-Langmuir, transport-aware, multi-state, and stochastic alternatives are compared under the same validation contract.

The surrogate is useful only where it reproduces the governing forward model, exposes uncertainty, and preserves identifiability. A fast but physically ambiguous fit is not the intended result.

## Publication boundary

The 2016 aligned-macroporous-monolith publication is relevant background for templated structures and protein chromatography. It is not the publication of the SPR code, is not authored by the notebook author, and does not establish ownership of its fabrication method.

## Outlook

The long-term destination is a transparent SPR oracle built on the bi-Langmuir theory: experimental conditions and sensorgrams in; physically interpretable kinetic states, uncertainty, model adequacy, and the next informative experiment out.
