---
layout: project-home
title: ITC – Thermodynamic State Mapping
project_id: itc-data
subtitle: Calorimetry as governed state-space data inside the Nexus warehouse.
primary_label: Back to Projects
primary_href: ../projects.html#project-itc-data
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: ITC data collaboration
---

<div class="nexus-intro">
<section id="overview" class="nexus-hero">
  <div class="nexus-kicker">ITC · Thermodynamic Layer</div>
  <h2 class="nexus-title">Thermodynamic State Mapping</h2>
  <p class="nexus-subtitle">Nexus treats ITC as a governed data object rather than a single fitted thermogram. Injections, baseline corrections, integrated heats, fit states and thermodynamic summaries remain connected inside one warehouse record.</p>
  <div class="nexus-hero-grid">
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Primary Signal</div>
      <div class="nexus-stat-value">Heat</div>
      <p class="nexus-stat-body">Raw power traces and integrated injection heats are preserved alongside the acquisition sequence that produced them.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">State Layer</div>
      <div class="nexus-stat-value">Binding</div>
      <p class="nexus-stat-body">Each experiment becomes a thermodynamic state record rather than a detached table of ΔH and Kd values.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Outcome</div>
      <div class="nexus-stat-value">Lineage</div>
      <p class="nexus-stat-body">Reported energetics remain linked to injection processing, model choice and comparative runs.</p>
    </article>
  </div>
</section>

<nav class="nexus-outline" aria-label="ITC sections">
  <a class="nexus-outline-link" href="#overview">Overview</a>
  <a class="nexus-outline-link" href="#flow">Data flow</a>
  <a class="nexus-outline-link" href="#architecture">Warehouse</a>
  <a class="nexus-outline-link" href="#state-space">State space</a>
  <a class="nexus-outline-link" href="#statement">Outcome</a>
</nav>

<section id="flow" class="nexus-block">
  <h2 class="nexus-h2">Data-driven ITC</h2>
  <p class="nexus-body">ITC is handled as structured thermodynamic data. The page centers reproducible storage of injections, dilution context, concentration setup and fit lineage before the experiment is reduced to publication-ready summary parameters.</p>
  <div class="nexus-flow">
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">1</span>
      <strong>Run capture</strong>
      <span>Store the thermogram, injection schedule, concentration setup and buffer context as one warehouse object.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">2</span>
      <strong>Derived heats</strong>
      <span>Track baseline handling, integration and normalization as explicit derived records.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">3</span>
      <strong>State mapping</strong>
      <span>Place thermodynamic experiments into a state space where comparable binding regimes can be grouped and contrasted.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">4</span>
      <strong>Controlled output</strong>
      <span>Expose ΔH, Kd and stoichiometry as reportable states that stay linked to the full experimental path.</span>
    </div>
  </div>
</section>

<section id="architecture" class="nexus-block">
  <h2 class="nexus-h2">Warehouse integration</h2>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Storage</div>
      <h3>Injection-level records</h3>
      <p>Each titration can retain its full injection structure instead of being flattened to a final fit card.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Models</div>
      <h3>Fit-state lineage</h3>
      <p>Competing one-site, multi-site or constrained thermodynamic models can be stored as parallel governed states.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Reuse</div>
      <h3>Cross-experimental comparison</h3>
      <p>ITC results can be compared directly with SPR, SAXS and chromatography-linked state transitions.</p>
    </article>
  </div>
</section>

<section id="state-space" class="nexus-block">
  <h2 class="nexus-h2">State space instead of endpoint fitting</h2>
  <pre class="nexus-math">thermogram → derived heats → projection → thermodynamic state space</pre>
  <div class="nexus-stack">
    <article class="nexus-layer-card">
      <div class="nexus-layer-index">1</div>
      <div>
        <h3 class="nexus-layer-title">Features</h3>
        <p class="nexus-layer-body">Integrated heats, saturation shape, stoichiometric turning points and concentration-normalized descriptors build the feature space.</p>
      </div>
    </article>
    <article class="nexus-layer-card">
      <div class="nexus-layer-index">2</div>
      <div>
        <h3 class="nexus-layer-title">Projection</h3>
        <p class="nexus-layer-body">PCA is one entry point, but the page is framed as state space so later nonlinear and mechanistic projections can be added without changing the concept.</p>
      </div>
    </article>
    <article class="nexus-layer-card">
      <div class="nexus-layer-index">3</div>
      <div>
        <h3 class="nexus-layer-title">Interpretation</h3>
        <p class="nexus-layer-body">Binding regimes, cooperativity changes and formulation shifts become neighborhoods in a comparable thermodynamic map.</p>
      </div>
    </article>
  </div>
</section>

<section id="statement" class="nexus-block">
  <h2 class="nexus-h2">From thermograms to governed binding states</h2>
  <p class="nexus-body">Within Nexus, ITC is organised as a warehouse-backed state system. The experimental run, the derived heats, the competing fit states and the final thermodynamic interpretation stay connected, so the page reflects the same controlled-inference structure as the rest of the homepage.</p>
  <div class="nexus-merge-band">
    <span class="nexus-merge-node">thermogram</span>
    <span class="nexus-merge-node">derived heats</span>
    <span class="nexus-merge-node">fit-state lineage</span>
    <span class="nexus-merge-node">binding state space</span>
    <span class="nexus-merge-node">reportable energetics</span>
  </div>
</section>
</div>
