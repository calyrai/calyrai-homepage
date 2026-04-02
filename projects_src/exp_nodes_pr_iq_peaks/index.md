---
layout: project-home
title: SAXS – Multi-State Structural Analysis
project_id: saxs
subtitle: Structured scattering analysis through data warehousing, state space mapping and governed model coupling.
primary_label: Back to Projects
primary_href: ../projects.html#project-saxs
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: SAXS collaboration
---

<div class="nexus-intro">
<section id="overview" class="nexus-hero">
  <div class="nexus-kicker">SAXS · Structural Layer</div>
  <h2 class="nexus-title">Structured Scattering Analysis</h2>
  <p class="nexus-subtitle">Calyr.ai Nexus transforms SAXS from a standalone fitting task into a governed inference system in which scattering curves, experimental context, model states and state-space coordinates remain linked inside the same data architecture.</p>
  <div class="nexus-hero-grid">
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Primary Signal</div>
      <div class="nexus-stat-value">I(q)</div>
      <p class="nexus-stat-body">Raw scattering curves remain first-class records and are never detached from the conditions that produced them.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">State Layer</div>
      <div class="nexus-stat-value">State Space</div>
      <p class="nexus-stat-body">P(r), Rg, Dmax, curve descriptors and mode coordinates become comparable structural states rather than isolated curve summaries.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Model Layer</div>
      <div class="nexus-stat-value">SasView+</div>
      <p class="nexus-stat-body">Form factors, structure factors and hybrid model families are integrated as governed representations, not as the sole definition of the experiment.</p>
    </article>
  </div>
</section>

<nav class="nexus-outline" aria-label="SAXS sections">
  <a class="nexus-outline-link" href="#overview">Overview</a>
  <a class="nexus-outline-link" href="#flow">Data flow</a>
  <a class="nexus-outline-link" href="#layers">Warehouse</a>
  <a class="nexus-outline-link" href="#sasview-layer">Models</a>
  <a class="nexus-outline-link" href="#state-space">State space</a>
  <a class="nexus-outline-link" href="#pipeline">Integration</a>
  <a class="nexus-outline-link" href="#statement">Outcome</a>
</nav>

<section id="flow" class="nexus-block">
  <h2 class="nexus-h2">Data-driven SAXS</h2>
  <p class="nexus-body">SAXS is treated as a structured data source rather than a narrow curve-fitting problem. Each experiment is stored, versioned and connected to its buffer, concentration, temperature and processing lineage before any model family is used for interpretation.</p>
  <div class="nexus-flow">
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">1</span>
      <strong>Curve record</strong>
      <span>Persist the measured scattering profile, uncertainty and acquisition context as one governed warehouse object.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">2</span>
      <strong>Derived features</strong>
      <span>Attach Rg, Dmax, P(r), curve descriptors and preprocessing choices as traceable derived quantities.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">3</span>
      <strong>State mapping</strong>
      <span>Project the experiment into a shared state space where neighboring curves can be compared across conditions and modalities.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">4</span>
      <strong>Controlled output</strong>
      <span>Link model states, scores and structural claims back to the exact experimental and representational lineage.</span>
    </div>
  </div>
</section>

<section id="layers" class="nexus-block">
  <h2 class="nexus-h2">Database integration</h2>
  <p class="nexus-body">All SAXS objects live inside the Nexus data layer, which makes comparison, provenance and reproducibility native to the page rather than post-hoc documentation.</p>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Storage</div>
      <h3>Versioned datasets</h3>
      <p>Curves, metadata and derived objects can be stored as evolving records rather than rewritten local exports.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Lineage</div>
      <h3>Provenance tracking</h3>
      <p>Every reduction step can be linked to its source run, preprocessing decision and later report output.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Reuse</div>
      <h3>Comparable experiments</h3>
      <p>Different SAXS runs can be compared through shared warehouse entities instead of manual file-by-file inspection.</p>
    </article>
  </div>
</section>

<section id="sasview-layer" class="nexus-block">
  <h2 class="nexus-h2">Model-based representation</h2>
  <p class="nexus-body">Nexus incorporates SasView-style model structure without being limited to a single forward-fitting loop. Model families become one governed layer within the system, attached to the data warehouse and the state-space representation.</p>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Geometry</div>
      <h3>Form factors</h3>
      <p>Sphere, cylinder, ellipsoid and related shape models provide interpretable geometric coordinates for particle-side structure.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Interactions</div>
      <h3>Structure factors</h3>
      <p>Correlation and interaction models remain available as a distinct solution-state layer rather than being mixed into the raw measurement.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Synthesis</div>
      <h3>Hybrid models</h3>
      <p>Experimental constraints, priors and composite representations can be stored as explicit model states within Nexus.</p>
    </article>
  </div>
</section>

<section id="state-space" class="nexus-block">
  <h2 class="nexus-h2">State space mapping</h2>
  <p class="nexus-body">Instead of stopping at the scattering curve or at a single model fit, Nexus maps SAXS experiments into a shared state space. This allows comparison across concentrations, conditions, batches and later multimodal experiments.</p>
  <pre class="nexus-math">raw SAXS → features → projection → state space</pre>
  <div class="nexus-stack">
    <article class="nexus-layer-card">
      <div class="nexus-layer-index">1</div>
      <div>
        <h3 class="nexus-layer-title">Feature extraction</h3>
        <p class="nexus-layer-body">P(r), Rg, Dmax, curve-shape descriptors and low-order basis features provide a real-space and signal-space view of the measurement.</p>
      </div>
    </article>
    <article class="nexus-layer-card">
      <div class="nexus-layer-index">2</div>
      <div>
        <h3 class="nexus-layer-title">Projection</h3>
        <p class="nexus-layer-body">PCA is the initial mapping layer, but the page is framed as state space rather than PCA-only, leaving room for nonlinear and model-constrained projections.</p>
      </div>
    </article>
    <article class="nexus-layer-card">
      <div class="nexus-layer-index">3</div>
      <div>
        <h3 class="nexus-layer-title">Thermodynamic coupling</h3>
        <p class="nexus-layer-body">Projected states can be linked back to mixture changes, stability shifts and later cross-modality interpretation.</p>
      </div>
    </article>
  </div>
</section>

<section id="pipeline" class="nexus-block">
  <h2 class="nexus-h2">Integration with experimental systems</h2>
  <p class="nexus-body">SAXS is not isolated in the Nexus philosophy. Structural state is interpreted together with thermodynamic and compositional information inside the same database architecture.</p>
  <div class="nexus-table-shell">
    <table class="nexus-table">
      <thead>
        <tr>
          <th>Domain</th>
          <th>Feature</th>
          <th>Interpretation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>SAXS</td>
          <td>Rg, P(r), Dmax</td>
          <td>Structural state</td>
        </tr>
        <tr>
          <td>ITC</td>
          <td>ΔH, Kd</td>
          <td>Binding energetics</td>
        </tr>
        <tr>
          <td>Chromatography</td>
          <td>Peak shifts, fractions</td>
          <td>Aggregation and oligomerization</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<section id="statement" class="nexus-block">
  <h2 class="nexus-h2">From scattering curves to structural intelligence</h2>
  <p class="nexus-body">Nexus turns SAXS into a structured inference system in which data, models and state-space representations converge into reproducible knowledge. The page is therefore not about fitting alone; it is about governed structural intelligence built on top of a scientific data warehouse.</p>
  <div class="nexus-merge-band">
    <span class="nexus-merge-node">raw curves</span>
    <span class="nexus-merge-node">P(r) + descriptors</span>
    <span class="nexus-merge-node">SasView model states</span>
    <span class="nexus-merge-node">state space</span>
    <span class="nexus-merge-node">cross-modality results</span>
  </div>
</section>
</div>
