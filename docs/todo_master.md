# Master To-Do List

Single execution list for system stabilization and delivery

 This page is the canonical working backlog for the Calyr system. Keep all active work items here, update status in place, and avoid parallel ad-hoc lists.

**How to use:** 1) Work top-to-bottom by priority, 2) mark each item with status, 3) add links to the implementing file or PR, 4) do not duplicate tasks in other docs.

## Status legend

- **[TODO]** not started

- **[DOING]** currently in progress

- **[DONE]** implemented and validated

- **[BLOCKED]** waiting for dependency or decision

## P0 — Architecture integrity

- **[TODO]** Freeze folder contracts for core areas (`apps/`, `core/`, `engines/`, `pipelines/`, `registry/`, `results/`).

- **[TODO]** Define ownership per major module (Nexus, Eval, Okto, Grammateia, ASC, LAMMPS, AlphaFold, Nomos, Demos, Homepage, Publishing, PublicRelations, Objects).

- **[TODO]** Add a change policy: what requires architecture review before merge.

- **[TODO]** Add one source-of-truth map that links Explore tiles to real code paths.

## P0 — Documentation structure hardening

- **[TODO]** Keep this page as the only active execution list.

- **[TODO]** Add "Last reviewed" date at the top of this page on every planning session.

- **[TODO]** Ensure each docs page has a clear owner and review cadence.

- **[TODO]** Link each roadmap item to a concrete task in this list.

## P1 — Module implementation alignment

- **[TODO]** Verify every Explore ecosystem tile links to an existing and accurate module page.

- **[TODO]** Verify each module page has: planned scope, LLM hint, structure idea, first build steps.

- **[TODO]** Create a validation pass for stale module descriptions versus real code state.

- **[TODO]** Add missing tests for module boundary behavior and integration contracts.

## P1 — Data and run reproducibility

- **[TODO]** Standardize run metadata schema across `runs/`, `results/`, and `registry/`.

- **[TODO]** Add provenance minimum requirements for generated outputs.

- **[TODO]** Define retention and archival policy for generated artifacts.

- **[TODO]** Add reproducibility checks to core pipeline execution paths.

## P2 — Operational quality

- **[TODO]** Consolidate duplicated scripts and legacy entrypoints into stable interfaces.

- **[TODO]** Define CI quality gates (lint, tests, docs consistency checks).

- **[TODO]** Add release checklist for homepage/docs updates and submodule sync.

- **[TODO]** Add incident playbook for broken docs links or module routing regressions.

## Working log

- **2026-05-08** — Created canonical master to-do list page and linked it into docs navigation.
