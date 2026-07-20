# Multi-Objective Oracle Fusion

**Reference ID:** `CALYR-METHOD-ORACLE-001`  
**Status:** Working method contract  
**Scope:** Scientific decision systems combining multiple trait-specific predictions, constraints, uncertainty, evidence, and experimental feedback

## Purpose

An Oracle turns model outputs into a traceable decision proposal. It does not hide scientific disagreement inside one score and does not turn a surrogate prediction into evidence that has not been measured.

The governing pattern is:

`trait models + uncertainty + constraints + evidence + diversity = ranked decision proposals`

## Quick start: construct an Oracle

1. define the decision, candidate space, hard constraints, controls, and experimental budget;
2. define every trait separately, including units, direction, validity range, and evidence level;
3. evaluate each trait with an independently testable model or observation contract;
4. reject candidates that violate hard constraints or fall outside required applicability domains;
5. preserve uncertainty and conflicts between traits;
6. rank remaining candidates through explicit multi-objective logic;
7. select a diverse batch rather than near-duplicate numerical winners;
8. attach reasons, assumptions, limitations, provenance, and the next validation action;
9. update the Oracle only after new observations pass their evidence and data-quality gates.

## Oracle layers

| Layer | Responsibility | Required output |
|---|---|---|
| Design space | define allowed candidates and interventions | candidate schema, bounds, exclusions |
| Observations | register experimental and computational evidence | values, units, protocol, provenance |
| Trait models | predict one interpretable property at a time | distribution, interval, applicability status |
| Constraints | encode safety, physics, manufacturing, and project limits | pass, fail, or review-required decision |
| Fusion | compare compatible objectives without erasing conflicts | Pareto set and trade-off explanation |
| Diversity | prevent redundant selections | similarity measure and batch coverage |
| Evidence | state what is hypothesis, reproduced, retrospective, or prospective | evidence level and supporting artifacts |
| Action | propose the next candidate, experiment, or review | ranked proposal with rationale |

## Trait contract

Every trait entering an Oracle should expose:

```yaml
trait:
  id: string
  meaning: string
  value: scalar | vector | distribution
  unit: string
  direction: maximize | minimize | target | constrain
  interval: {lower: number, upper: number, level: number}
  applicability: {status: in_domain | boundary | out_of_domain, reasons: [string]}
  evidence_level: E0 | E1 | E2 | E3 | E4
  model: {id: string, version: string, data_snapshot: string}
  limitations: [string]
```

Traits with incompatible meaning, protocol, scale, or evidence must not be silently fused.

## Constraint contract

Constraints are evaluated before preference ranking.

- **Hard constraints** block a candidate.
- **Review constraints** require expert assessment or another measurement.
- **Soft preferences** influence ranking but cannot override a hard failure.
- **Unknown constraints** remain visible and reduce decision readiness.

An out-of-domain prediction cannot pass a hard gate merely because its point estimate is favorable.

## Multi-objective fusion

The default output is a Pareto set, not a single opaque optimum.

Fusion should:

- retain trait-specific values and uncertainty;
- distinguish observed from predicted traits;
- avoid adding quantities with incompatible units or semantics;
- expose dominance relationships and trade-offs;
- test sensitivity to weights, thresholds, and uncertainty;
- report when rankings are unstable;
- allow explicit human preference without rewriting scientific evidence.

A scalar score is permitted only when its utility function, scaling, weights, uncertainty treatment, and decision context are documented and reviewable.

## Diversity-aware selection

Candidate selection should balance predicted value with information gain and coverage of the feasible space.

The selected batch should report:

1. exploitation candidates with strong supported performance;
2. exploration candidates expected to reduce important uncertainty;
3. controls and reference candidates;
4. diversity across relevant structural, mechanistic, or design classes;
5. the acquisition policy and its sensitivity.

## Evidence progression

- `E0` — concept or hypothesis;
- `E1` — reproduced external baseline;
- `E2` — internally validated retrospective result;
- `E3` — prospective validation against predefined controls;
- `E4` — repeated closed-loop validation across batches or contexts.

The Oracle must display the evidence level of each trait and of the overall decision proposal. The overall level cannot exceed its critical unsupported component.

## Decision proposal contract

```yaml
oracle_decision:
  candidate_id: string
  status: usable | review_required | blocked
  pareto_status: non_dominated | dominated | unresolved
  trait_results: [trait]
  hard_constraints: [{id: string, status: pass | fail | unknown}]
  tradeoffs: [string]
  diversity_role: exploitation | exploration | control
  evidence_level: E0 | E1 | E2 | E3 | E4
  reasons: [string]
  limitations: [string]
  next_action: string
```

## Closed-loop update

The generic update loop is:

`constraints -> candidate design -> experiment -> observations -> trait models -> Oracle fusion -> validation -> learning update`

Before updating models or rankings:

- preserve immutable raw observations;
- record protocol, source, license, checksum, and quality status;
- verify candidate and sample identifiers;
- compare the new result with the previous prediction;
- record success, failure, and unexplained delta;
- version the data, models, configuration, and acquisition policy.

## Validation contract

Validate an Oracle on more than prediction accuracy:

- calibration and interval coverage per trait;
- constraint-violation rate;
- stability of the Pareto set;
- sensitivity to preference weights and thresholds;
- diversity and information value of selected batches;
- prospective hit rate against predefined controls;
- failure detection outside the applicability domain;
- reproducibility of rankings from frozen inputs;
- value of the proposed next experiment.

## Failure behavior

The Oracle must return `review_required` or `blocked` when:

- a critical trait is out of domain;
- a hard constraint fails or is unknown;
- uncertainty is too high for the decision;
- evidence sources conflict materially;
- ranking changes strongly under reasonable parameter choices;
- provenance, protocol, model version, or dataset version is missing;
- the requested conclusion exceeds the available evidence level.

## Reusable-method boundary

This contract is informed by generalizable ideas from the Parvotec multi-oracle and closed-loop architecture. It does not include or transfer Parvotec data, model implementations, weights, features, candidates, rankings, validation results, contractual information, or other project-specific results.

## Sources and further reading

- [Scientific AI and Numerical Methods](/research/methods/scientific-ai-numerics/)
- Pareto, Vilfredo. *Manual of Political Economy*.
- Deb, Kalyanmoy. *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley, 2001.
- [Expected hypervolume improvement](https://doi.org/10.1007/978-3-540-31880-4_13)
- [Active learning literature overview](https://burrsettles.com/pub/settles.activelearning.pdf)
