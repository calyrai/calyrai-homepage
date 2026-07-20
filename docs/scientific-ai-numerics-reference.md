# Scientific AI and Numerical Methods Reference

**Reference ID:** `CALYR-METHOD-NR-AI-001`  
**Status:** Working method contract  
**Scope:** Pythia surrogate prediction, SAXS, SPR, cryo-EM, and related scientific-AI implementations

## Purpose

This document is the canonical repository reference for combining:

- numerical methods from *Numerical Recipes*;
- neural representation and architecture from Bishop and Bishop;
- probabilistic inference and decision theory from Murphy;
- domain-specific forward models and experimental evidence.

The governing pattern is:

`numerics + neural representation + probabilistic inference = trustworthy scientific prediction`

Code should reference this document when an implementation choice depends on these methodological principles.

## How code should reference this contract

Prefer a short comment next to the relevant interface, model, validation gate, or numerical operator:

```text
Method: CALYR-METHOD-NR-AI-001
See: docs/scientific-ai-numerics-reference.md#prediction-contract
```

Use a more specific anchor where possible:

- `#numerical-baseline-before-learned-model`
- `#prediction-contract`
- `#applicability-domain`
- `#saxs-method-map`
- `#spr-method-map`
- `#cryo-em-method-map`
- `#numerical-recipes-code-policy`
- `#validation-contract`

Do not paste long explanations into source files. Keep the reasoning here and make code comments point to the stable section.

## Source references

### Numerical methods

- [Numerical Recipes official website](https://numerical.recipes/)
- [Third Edition online book](https://numerical.recipes/book.html)
- [Third Edition routine index](https://numerical.recipes/routines/)
- [Official legacy C routines](https://numerical.recipes/routines/instc.html)
- [Cambridge front matter and license information](https://assets.cambridge.org/97805218/80688/frontmatter/9780521880688_frontmatter.pdf)

Press, William H.; Teukolsky, Saul A.; Vetterling, William T.; Flannery, Brian P. *Numerical Recipes: The Art of Scientific Computing*. Third Edition. Cambridge University Press, 2007. ISBN 978-0-521-88068-8.

### Neural representation

- [Bishop and Bishop official book website](https://www.bishopbook.com/)
- [Springer table of contents](https://link.springer.com/book/10.1007/978-3-031-45468-4)

Bishop, Christopher M.; Bishop, Hugh. *Deep Learning: Foundations and Concepts*. Springer, 2024. DOI [10.1007/978-3-031-45468-4](https://doi.org/10.1007/978-3-031-45468-4).

### Probabilistic inference

- [Murphy official open-access book page](https://probml.github.io/book2)
- [MIT Press book page](https://mitpress.mit.edu/9780262048439/probabilistic-machine-learning/)

Murphy, Kevin P. *Probabilistic Machine Learning: Advanced Topics*. MIT Press, 2023. ISBN 978-0-262-04843-9.

## Division of responsibility

| Layer | Primary reference | Responsibility |
|---|---|---|
| Numerical operators | Numerical Recipes and maintained libraries | stable transforms, solvers, optimization, integration, inverse methods |
| Neural representation | Bishop and Bishop | CNNs, transformers, GNNs, autoencoders, latent representations |
| Probabilistic inference | Murphy | posterior inference, uncertainty, generative models, distribution shift, decisions |
| Scientific meaning | domain model and experimental protocol | physical constraints, observables, admissible conclusions, next experiment |

No one layer may silently replace another. A neural network does not replace the physical definition of an observable. A numerical fit does not by itself establish identifiability. A posterior does not become a decision without an explicit loss, constraint, or utility rule.

## Numerical baseline before learned model

Every learned scientific model should be compared with the simplest defensible numerical baseline.

The baseline should define:

1. inputs, outputs, units, and admissible ranges;
2. forward model or observation operator;
3. objective or likelihood;
4. optimization or inference method;
5. numerical tolerances;
6. uncertainty estimate;
7. known non-identifiability;
8. failure behavior outside the calibrated domain.

Typical reference operations include SVD, nonlinear least squares, FFT, convolution, correlation, ODE integration, regularization, Gaussian-process regression, and MCMC.

## Prediction contract

Scientific prediction is a structured result, not a bare value. Every public prediction interface should expose, directly or through linked metadata:

```yaml
prediction:
  target: string
  value: scalar | array | field | distribution
  unit: string
  interval:
    lower: number
    upper: number
    level: number
applicability:
  status: in_domain | boundary | out_of_domain
  score: number
  reasons: [string]
model:
  id: string
  version: string
  data_snapshot: string
evidence:
  references: [string]
  assumptions: [string]
  limitations: [string]
decision:
  status: usable | review_required | blocked
  next_action: string
```

The exact serialization may vary, but the semantics must remain available and testable.

## Applicability domain

A model must distinguish interpolation within validated conditions from unsupported extrapolation.

Applicability checks should consider:

- distance from training and validation observations;
- physical parameter limits;
- experimental protocol and instrument conditions;
- structural or mechanistic class;
- preprocessing compatibility;
- uncertainty and ensemble disagreement;
- missing inputs and violated constraints.

Out-of-domain results must not be rendered as ordinary predictions. They should be marked `review_required` or `blocked` and should propose a simulation, measurement, or expert review.

## SAXS method map

### Numerical layer

- quadrature and multidimensional integration;
- Bessel functions and spherical harmonics;
- Fourier transforms;
- convolution for resolution smearing;
- SVD and regularization for inverse problems;
- nonlinear fitting and MCMC.

### Neural layer

- curve encoders or transformers for `I(q)`;
- continuous latent variables for structural ensembles;
- graph or geometric representations for molecular structure;
- forward surrogates for `structure -> I(q)`.

### Probabilistic layer

- posterior inference over competing structures or ensembles;
- calibrated predictive distributions;
- model comparison and posterior predictive checks;
- active selection of q-range, contrast, concentration, or next simulation.

The implementation must not claim unique structural recovery where the SAXS evidence is non-identifying.

## SPR method map

### Numerical layer

- nonlinear least squares;
- robust estimation;
- ODE integration for kinetic and transport models;
- conservative filtering with distortion tests;
- sensitivity and identifiability analysis.

### Neural layer

- sensorgram sequence encoders or transformers;
- structured prediction of `ka`, `kd`, `KD`, `Rmax`, and full response curves;
- neural surrogates for repeated kinetic simulation.

### Probabilistic layer

- posterior inference over parameters and model class;
- latent-state or state-space models;
- sequential updating across cycles and concentrations;
- next-assay selection by expected information or decision value.

The implementation must keep kinetic, mass-transport, rebinding, heterogeneity, drift, and nuisance explanations distinguishable.

## Cryo-EM method map

### Numerical layer

- multidimensional FFT;
- convolution and correlation;
- orientation and rotation geometry;
- SVD/eigensystems for low-rank structure;
- regularized inverse reconstruction.

### Neural layer

- CNNs and transformers for particles and maps;
- autoencoders for continuous heterogeneity;
- GNNs for molecular structure;
- conditional generative models for reconstruction or refinement.

### Probabilistic layer

- latent orientation and conformation inference;
- posterior predictive image or map checks;
- uncertainty over structure, resolution, and heterogeneity;
- distribution-shift detection across acquisition and preprocessing conditions.

The implementation must separate resolution, noise, heterogeneity, orientation uncertainty, preprocessing effects, and model bias.

## Numerical Recipes code policy

The current Third Edition code has separate licensing conditions. Do not copy it into a CALYR repository without an explicit license review.

The official legacy routines are useful as algorithmic references but are obsolete and may use deprecated conventions. Do not treat them as production-ready dependencies.

Preferred production targets include maintained implementations in:

- NumPy and SciPy;
- scikit-learn;
- PyTorch;
- JAX;
- PyMC, NumPyro, BlackJAX, or Stan;
- domain-specific validated libraries.

Useful routine mappings from the [official routine index](https://numerical.recipes/routines/) include:

| Task | Numerical Recipes reference | Maintained target |
|---|---|---|
| SVD | `svd.h` | `numpy.linalg.svd`, `scipy.linalg.svd` |
| Stable linear fit | `fitsvd.h` | `numpy.linalg.lstsq` |
| Nonlinear fit | `fitmrq.h` | `scipy.optimize.least_squares` |
| MCMC | `mcmc.h` | NumPyro, PyMC, BlackJAX, Stan |
| FFT | `fourier.h`, `fourier_ndim.h` | `numpy.fft`, `scipy.fft`, `torch.fft` |
| Convolution | `convlv.h` | `scipy.signal`, PyTorch/JAX operators |
| Correlation | `correl.h` | `scipy.signal.correlate` |
| Robust fit | `fitmed.h` | SciPy/scikit-learn robust methods |
| Gaussian mixtures | `gaumixmod.h` | `sklearn.mixture.GaussianMixture` |
| k-means | `kmeans.h` | `sklearn.cluster.KMeans` |
| Hidden Markov model | `hmm.h` | Dynamax, Pyro, hmmlearn |

When an implementation is inspired by a Numerical Recipes algorithm, record the edition, section, routine name, source URL, license status, maintained replacement, and verification tests.

## Validation contract

Every surrogate or probabilistic prediction model should be evaluated on:

- held-out and prospective prediction;
- comparison with a transparent baseline;
- calibration and interval coverage;
- applicability-domain detection;
- sensitivity to preprocessing and nuisance variables;
- physical constraint violations;
- reproducibility across data splits and random seeds;
- posterior predictive checks;
- failure modes under distribution shift;
- value of the proposed next experiment or simulation.

Training fit alone is not validation.

## Recommended repository pattern

```text
docs/
  scientific-ai-numerics-reference.md
references/
  numerical-recipes/
    README.md               # citation, routine mapping, license notes
tests/
  reference_cases/          # independently authored numerical cases
src/
  numerics/                 # maintained numerical implementations
  surrogates/               # neural representations
  inference/                # probabilistic inference
  validation/               # calibration and applicability gates
```

This contract is implementation-language independent and may be referenced from Python, C++, JavaScript, YAML, notebooks, tests, and design documents.
