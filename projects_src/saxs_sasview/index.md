---
layout: project-home
title: SAXS SasView
project_id: saxs_sasview
subtitle: A Nexus-controlled scaffold for SasView fitting, scoring and publish-gated reporting.
primary_label: Back to Projects
primary_href: ../projects.html#project-saxs_sasview
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: SAXS SasView workflow
---

<section id="overview" class="project-section">
  <h3>Overview</h3>
  <p>This workflow exposes the current Nexus orchestration pattern for SAXS model fitting: prepare, fit-state capture, analysis, scoring and report export remain explicit and inspectable.</p>
</section>

<section id="methods" class="project-section">
  <h3>Methods</h3>
  <p>The current state is intentionally honest. If no active runner is staged, the pipeline records placeholder fit status rather than inventing a completed SasView result.</p>
</section>

<section id="position" class="project-section">
  <h3>Constellation Position</h3>
  <p>This is the workflow-control branch for SAXS fitting inside Calyr. It connects the scientific project layer to the Nexus runtime and report gating logic.</p>
</section>