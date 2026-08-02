# SPR Research Direction

**Status:** Conceptual direction. Code and evidence remain under validation.

## From curves to decisions

SPR should move beyond a single best-fit curve. The system should expose competing mechanisms, parameter uncertainty, nuisance effects, and the measurement that can resolve what remains ambiguous.

## Research workflow

1. **Sensorgrams** — concentration series, association and dissociation phases, controls, and experimental context.
2. **Correction** — reference, blank, drift, bulk response, and explicitly represented nuisance effects.
3. **Model ladder** — simple binding first, followed by transport, heterogeneity, multi-state, and stochastic alternatives.
4. **Uncertainty** — identifiability, parameter distributions, residual structure, and held-out prediction.
5. **Next experiment** — select the concentration, flow rate, or contact time that best separates plausible mechanisms.

## Research object

The recovered computational source is a Mathematica notebook containing mechanistic SPR models and a Gillespie stochastic formulation. The next step is a reproducible release with clean-kernel execution, explicit units, parameters, random seeds, expected outputs, and an open synthetic example dataset. The intended destination is a versioned and citable Zenodo research object with confirmed metadata and licensing.

## Model ladder

- 1:1 binding
- bivalent analyte
- heterogeneous analyte
- heterogeneous ligand
- two-state reaction
- Gillespie simulation

Complexity earns its place only when it improves prediction and remains identifiable.

## Publication boundary

The 2016 aligned-macroporous-monolith publication is relevant background for templated structures and protein chromatography. It is not the publication of the SPR code, is not authored by the notebook author, and does not establish ownership of its fabrication method.

## Outlook

The long-term destination is a transparent SPR oracle: measurements in, physically interpretable alternatives out, uncertainty visible, and every proposed next experiment traceable to the ambiguity it is designed to resolve.
