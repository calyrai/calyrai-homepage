---
layout: project-home
title: SPR – Binding State Surfaces
project_id: spr-data
subtitle: Response traces as controlled kinetic data inside the Nexus warehouse.
primary_label: Back to Projects
primary_href: ../projects.html#project-spr-data
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: SPR data collaboration
---

<div class="nexus-intro">
<section id="overview" class="nexus-hero">
  <div class="nexus-kicker">SPR · Kinetic Layer</div>
  <h2 class="nexus-title">Binding State Surfaces</h2>
  <p class="nexus-subtitle">Nexus treats SPR as a structured kinetic record in which sensorgrams, concentration ladders, regeneration steps and fit states remain linked. The page turns response traces into governed state surfaces rather than isolated kon/koff summaries.</p>
  <div class="nexus-hero-grid">
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Primary Signal</div>
      <div class="nexus-stat-value">RU(t)</div>
      <p class="nexus-stat-body">Association and dissociation traces remain available as full response histories with their concentration context.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">State Layer</div>
      <div class="nexus-stat-value">Kinetics</div>
      <p class="nexus-stat-body">Kinetic records become comparable state surfaces instead of a single point estimate after fitting.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Outcome</div>
      <div class="nexus-stat-value">Traceability</div>
      <p class="nexus-stat-body">Each reported kinetic parameter stays attached to the sensorgram preparation and model assumptions that generated it.</p>
    </article>
  </div>
</section>

<nav class="nexus-outline" aria-label="SPR sections">
  <a class="nexus-outline-link" href="#overview">Overview</a>
  <a class="nexus-outline-link" href="#flow">Data flow</a>
  <a class="nexus-outline-link" href="#architecture">Warehouse</a>
  <a class="nexus-outline-link" href="#state-space">State space</a>
  <a class="nexus-outline-link" href="#statement">Outcome</a>
</nav>

<section id="flow" class="nexus-block">
  <h2 class="nexus-h2">Data-driven SPR</h2>
  <p class="nexus-body">SPR is modeled as a sequence of response events bound to concentration, chip state and regeneration context. This lets Nexus compare binding behavior as structured data before it is compressed into a single kinetic fit.</p>
  <div class="nexus-flow">
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">1</span>
      <strong>Sensorgram capture</strong>
      <span>Store the full response curve, analyte conditions and instrument protocol as one governed record.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">2</span>
      <strong>Derived features</strong>
      <span>Response amplitudes, association slopes, dissociation decay and regeneration behavior become traceable features.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">3</span>
      <strong>State surfaces</strong>
      <span>Comparable experiments can be projected into a kinetic state space across concentrations and chip conditions.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">4</span>
      <strong>Controlled output</strong>
      <span>kon, koff and affinity summaries are emitted as linked results rather than standalone endpoints.</span>
    </div>
  </div>
</section>

<section id="architecture" class="nexus-block">
  <h2 class="nexus-h2">Model integration</h2>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Fits</div>
      <h3>Parallel model states</h3>
      <p>One-site, heterogeneous, mass-transport-aware and constrained kinetic models can coexist as warehouse-linked states.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Correction</div>
      <h3>Baseline and referencing</h3>
      <p>Reference subtraction and drift correction stay visible as explicit parts of the response lineage.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Bridge</div>
      <h3>Cross-modality linkage</h3>
      <p>SPR states can be compared against ITC energetics and SAXS structural states inside the same Nexus system.</p>
    </article>
  </div>
</section>

<section id="state-space" class="nexus-block">
  <h2 class="nexus-h2">Projection to kinetic state space</h2>
  <pre class="nexus-math">sensorgrams → response features → projection → binding state space</pre>
  <p class="nexus-body">The page positions SPR as a state-space problem: not merely “fit a sensorgram,” but organize many related response traces into a shared kinetic geometry.</p>
</section>

<section id="statement" class="nexus-block">
  <h2 class="nexus-h2">From response traces to governed kinetic knowledge</h2>
  <p class="nexus-body">SPR follows the same Nexus layout logic as the homepage: warehouse first, representation second, model state third, report last. That keeps kinetic claims tied to the actual sensorgrams, reference corrections and concentration context that produced them.</p>
  <div class="nexus-merge-band">
    <span class="nexus-merge-node">sensorgrams</span>
    <span class="nexus-merge-node">response features</span>
    <span class="nexus-merge-node">kinetic models</span>
    <span class="nexus-merge-node">binding state space</span>
    <span class="nexus-merge-node">affinity outputs</span>
  </div>
</section>
</div>
