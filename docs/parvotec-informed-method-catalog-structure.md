# Parvotec-Informed Method Catalog Structure

**Status:** Initial catalog architecture  
**Scope:** Generalizable scientific and engineering methods only  
**Boundary:** No Parvotec data, model weights, candidates, rankings, validation results, contractual material, or other project-specific results are transferred into the public calyr.aí method catalog.

## Purpose

The Parvotec programme contributes a useful systems view of scientific work: begin from a frozen reproducible baseline, establish traceable data, advance claims through evidence gates, package the workflow, validate prospectively, and close the loop with the next experiment.

The catalog should preserve that logic as reusable methods without presenting project-specific ideas or results as generic calyr.aí assets.

## Catalog families

| Family | First contract | Core question |
|---|---|---|
| Scientific AI | `CALYR-METHOD-NR-AI-001` | How is a trustworthy prediction constructed and validated? |
| Reproducibility | `CALYR-METHOD-REP-001` | Can an independent person reproduce the baseline and explain deltas? |
| Data governance | `CALYR-METHOD-DATA-001` | Can every observation and derived artifact be found, verified, and reused? |
| Validation | `CALYR-METHOD-EVID-001` | What evidence level supports the claim, and which gate permits progression? |
| Experimental learning | `CALYR-METHOD-LOOP-001` | How does prediction lead to an informative next experiment and model update? |
| Decision systems | `CALYR-METHOD-ORACLE-001` | How are multiple traits, uncertainty, constraints, diversity, and conflicts combined? |
| Scientific governance | `CALYR-METHOD-GOV-001` | What is reusable method, project result, mixed artifact, or restricted knowledge? |

## Shared contract anatomy

Every method contract should eventually contain:

1. stable method ID, status, owner, version, and scope;
2. purpose and decision supported;
3. required inputs and explicit exclusions;
4. ordered procedure;
5. outputs and evidence artifacts;
6. acceptance gate and failure behavior;
7. uncertainty, limitations, and applicability boundary;
8. provenance and implementation references;
9. IP and knowledge-transfer classification;
10. links and further reading at the end.

## Evidence progression

The reusable evidence ladder is:

- `E0` — concept or hypothesis;
- `E1` — reproduced external baseline with traceable code and data;
- `E2` — internally validated retrospective result with leakage-safe evaluation;
- `E3` — prospective experimental validation against predefined controls;
- `E4` — repeated closed-loop validation across batches or contexts.

Every model, metric, ranking, and scientific claim should state its evidence level, dataset version, split policy, uncertainty status, and limitations.

## Closed-loop structure

The generic loop is:

`constraints -> candidate design -> experiment -> observations -> trait models -> decision fusion -> validation -> learning update`

The loop must keep trait-specific predictions distinguishable, expose incompatible evidence, and avoid collapsing all objectives into one opaque score.

## Initial build sequence

1. Publish the catalog taxonomy and planned contract cards.
2. Write the reproducible-baseline contract.
3. Write the traceable-data contract.
4. Define evidence levels and acceptance-gate templates.
5. Define the closed-loop experimental-learning contract.
6. Define multi-objective Oracle fusion.
7. Formalize the reusable-method/project-result boundary.

Each planned contract becomes public only after its procedure, acceptance criteria, limitations, and knowledge boundary are reviewable.
