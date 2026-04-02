---
layout: project-home
title: Cryo-EM – Density State Mapping
project_id: cryo-em
subtitle: Density maps, classes and structural states inside the Nexus warehouse.
primary_label: Back to Projects
primary_href: ../projects.html#project-cryo-em
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: Cryo-EM data collaboration
---

<div class="nexus-intro">
<section id="overview" class="nexus-hero">
  <div class="nexus-kicker">Cryo-EM · Density Layer</div>
  <h2 class="nexus-title">Density State Mapping</h2>
  <p class="nexus-subtitle">Nexus treats cryo-EM as a governed density and classification system. Micrographs, particle sets, class assignments, maps and atomic interpretations remain linked as one hierarchical data object instead of drifting apart into detached result folders.</p>
  <div class="nexus-hero-grid">
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Primary Signal</div>
      <div class="nexus-stat-value">Density</div>
      <p class="nexus-stat-body">Reconstructed maps and class averages stay attached to the processing lineage that generated them.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">State Layer</div>
      <div class="nexus-stat-value">Classes</div>
      <p class="nexus-stat-body">Conformational classes become state-space objects rather than just intermediate steps in a reconstruction pipeline.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Outcome</div>
      <div class="nexus-stat-value">Comparability</div>
      <p class="nexus-stat-body">Maps, classes and model fits can be compared across samples and conditions under one warehouse logic.</p>
    </article>
  </div>
</section>

<nav class="nexus-outline" aria-label="Cryo-EM sections">
  <a class="nexus-outline-link" href="#overview">Overview</a>
  <a class="nexus-outline-link" href="#flow">Data flow</a>
  <a class="nexus-outline-link" href="#architecture">Warehouse</a>
  <a class="nexus-outline-link" href="#statement">Outcome</a>
</nav>

<section id="flow" class="nexus-block">
  <h2 class="nexus-h2">Data-driven cryo-EM</h2>
  <p class="nexus-body">Cryo-EM is handled as a hierarchy of linked records: acquisition, particles, classes, maps and model interpretations. The page emphasizes data lineage and state organization before any single reconstruction is treated as the final answer.</p>
  <div class="nexus-flow">
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">1</span>
      <strong>Acquisition</strong>
      <span>Micrographs, picking settings, particle sets and preprocessing metadata are stored as the base warehouse layer.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">2</span>
      <strong>Classification</strong>
      <span>2D and 3D classes become governed state candidates rather than disposable intermediate folders.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">3</span>
      <strong>Density states</strong>
      <span>Maps can be organized into a comparable state space across conditions, classes and structural hypotheses.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">4</span>
      <strong>Controlled output</strong>
      <span>Reported density interpretations remain linked back to their particle and class provenance.</span>
    </div>
  </div>
</section>

<section id="architecture" class="nexus-block">
  <h2 class="nexus-h2">Warehouse and model integration</h2>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Storage</div>
      <h3>Maps and classes</h3>
      <p>Density maps, masks and class assignments are kept as named and comparable data entities.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Interpretation</div>
      <h3>Atomic and coarse fits</h3>
      <p>Model docking or flexible fitting can be stored as additional interpretive layers rather than replacing the underlying density record.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Bridge</div>
      <h3>Cross-modality comparison</h3>
      <p>Cryo-EM density states can be related to SAXS, thermodynamic and separation-derived state changes.</p>
    </article>
  </div>
</section>

<section id="statement" class="nexus-block">
  <h2 class="nexus-h2">From particle processing to comparable density states</h2>
  <p class="nexus-body">Cryo-EM now follows the same Nexus reading logic as the homepage: acquisition, representation, governed interpretation and reportable outcome. The page therefore treats classes and maps as stable warehouse states that can be compared across experiments instead of isolated reconstruction products.</p>
  <div class="nexus-merge-band">
    <span class="nexus-merge-node">micrographs</span>
    <span class="nexus-merge-node">particle sets</span>
    <span class="nexus-merge-node">classes + maps</span>
    <span class="nexus-merge-node">fit interpretations</span>
    <span class="nexus-merge-node">density state space</span>
  </div>
</section>
</div>
