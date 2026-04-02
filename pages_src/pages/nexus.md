<header class="site-header">
  <div class="nav-inner">
    <div class="nav-left-row">
      <a href="../index.html" class="nav-pill glow-nav">Calyr.ai – platform technology</a>
      <a href="../explore.html" class="nav-pill glow-nav">Explore</a>
      <a href="../team.html" class="nav-pill glow-nav">Team</a>
    </div>

    <nav class="nav-links" aria-label="Primary">
      <a href="https://bsky.app/profile/calyrai.bsky.social" class="nav-pill glow-nav">Follow</a>
      <a href="contact.html" class="nav-pill glow-nav">Contact</a>
      <a href="#impressum" class="nav-pill glow-nav">Impressum</a>
    </nav>
  </div>
</header>

<main class="explore-page nexus-page">
  <section class="explore-shell" aria-label="Nexus">
    <div class="nexus-intro">
      <section class="nexus-hero" aria-label="Hero">
        <div class="nexus-kicker">Calyr.ai / Nexus</div>
        <h1 class="nexus-title">
          Nexus — Data-governed scientific infrastructure for controlled inference
        </h1>

        <p class="nexus-subtitle">
          Nexus is the scientific data warehouse and orchestration layer of Calyr.ai.
          It keeps experiments, derived representations, model states and reportable
          outcomes inside one governed system so interpretation remains linked to the
          data and assumptions that produced it.
        </p>

        <div class="nexus-hero-grid">
          <article class="nexus-stat-card">
            <div class="nexus-stat-label">Core Role</div>
            <div class="nexus-stat-value">Warehouse</div>
            <p class="nexus-stat-body">Experimental records, metadata, derived features and model-side states stay linked instead of being scattered across ad hoc files.</p>
          </article>
          <article class="nexus-stat-card">
            <div class="nexus-stat-label">Method</div>
            <div class="nexus-stat-value">Control</div>
            <p class="nexus-stat-body">Inference is staged through governed transformations, with each reduction step attached to its provenance.</p>
          </article>
          <article class="nexus-stat-card">
            <div class="nexus-stat-label">Outcome</div>
            <div class="nexus-stat-value">Traceability</div>
            <p class="nexus-stat-body">Claims, scores and reports remain connected to the underlying data warehouse rather than detached from their origin.</p>
          </article>
        </div>
      </section>

      <nav class="nexus-outline" aria-label="Nexus sections">
        <a class="nexus-outline-link" href="#summary">Overview</a>
        <a class="nexus-outline-link" href="#flow">Data flow</a>
        <a class="nexus-outline-link" href="#architecture">Architecture</a>
        <a class="nexus-outline-link" href="#inference">Inference</a>
        <a class="nexus-outline-link" href="#map">Map</a>
        <a class="nexus-outline-link" href="#integration">Integration</a>
      </nav>

      <section id="summary" class="nexus-block">
        <h2 class="nexus-h2">Nexus in one sentence</h2>

        <pre class="nexus-math">EXPERIMENT → REPRESENTATION → MODEL STATE → RESULT → REPORT</pre>

        <p class="nexus-body">
          Nexus is not just a machine-learning page and not just a workflow UI.
          It is the governed middle layer where raw measurements, experimental context,
          derived representations and model-facing states are collected into one coherent scientific object.
        </p>
      </section>

      <section id="flow" class="nexus-block">
        <h2 class="nexus-h2">Data flow</h2>

        <div class="nexus-flow">
          <div class="nexus-flow-node">
            <span class="nexus-flow-step">1</span>
            <strong>Experiments</strong>
            <span>SAXS, ITC, SPR, Unicorn and related measurements enter with metadata, run context and acquisition constraints intact.</span>
          </div>
          <div class="nexus-flow-arrow"></div>
          <div class="nexus-flow-node">
            <span class="nexus-flow-step">2</span>
            <strong>Representations</strong>
            <span>Signals are transformed into governed features, embeddings and coordinate systems that remain attached to the source record.</span>
          </div>
          <div class="nexus-flow-arrow"></div>
          <div class="nexus-flow-node">
            <span class="nexus-flow-step">3</span>
            <strong>Model states</strong>
            <span>Fits, constraints, candidate mechanisms and uncertainty estimates are stored as explicit states rather than hidden intermediate artifacts.</span>
          </div>
          <div class="nexus-flow-arrow"></div>
          <div class="nexus-flow-node">
            <span class="nexus-flow-step">4</span>
            <strong>Controlled outputs</strong>
            <span>Reports, scores and publication-facing results can always be traced back to the warehouse object that produced them.</span>
          </div>
        </div>
      </section>

      <section id="architecture" class="nexus-block">
        <h2 class="nexus-h2">Layered architecture</h2>

        <div class="nexus-stack">
          <article class="nexus-layer-card">
            <div class="nexus-layer-index">1</div>
            <div>
              <h3 class="nexus-layer-title">Data layer</h3>
              <p class="nexus-layer-body">Raw measurements, acquisition metadata, sample state and experimental constraints are stored as first-class scientific records.</p>
            </div>
          </article>
          <article class="nexus-layer-card">
            <div class="nexus-layer-index">2</div>
            <div>
              <h3 class="nexus-layer-title">Representation layer</h3>
              <p class="nexus-layer-body">Derived features, embeddings, P(r), decomposition outputs and other intermediate forms become stable warehouse objects.</p>
            </div>
          </article>
          <article class="nexus-layer-card">
            <div class="nexus-layer-index">3</div>
            <div>
              <h3 class="nexus-layer-title">Inference layer</h3>
              <p class="nexus-layer-body">Model families, fit states, constraints, rankings and uncertainty structures are managed as governed transitions rather than one-off scripts.</p>
            </div>
          </article>
          <article class="nexus-layer-card">
            <div class="nexus-layer-index">4</div>
            <div>
              <h3 class="nexus-layer-title">Result layer</h3>
              <p class="nexus-layer-body">Claims, dashboards and reports are emitted from the warehouse with provenance still visible.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="inference" class="nexus-block">
        <h2 class="nexus-h2">Controlled inference</h2>

        <p class="nexus-body">
          The key idea is not “AI on top of data.” It is controlled inference:
          each step from signal to interpretation is staged inside a warehouse-like
          system where assumptions, transformations and outputs can be inspected.
        </p>

        <div class="nexus-pipeline-shell">
          <div class="nexus-pipeline-track">
            <article class="nexus-pipeline-stage">
              <div class="nexus-pipeline-tag">A</div>
              <h3>Ingest</h3>
              <p>Capture measurements and metadata as governed scientific objects.</p>
            </article>
            <article class="nexus-pipeline-stage">
              <div class="nexus-pipeline-tag">B</div>
              <h3>Transform</h3>
              <p>Generate controlled representations without losing the connection to source data.</p>
            </article>
            <article class="nexus-pipeline-stage">
              <div class="nexus-pipeline-tag">C</div>
              <h3>Infer</h3>
              <p>Store fit states, comparisons and decision logic as explicit analysis records.</p>
            </article>
            <article class="nexus-pipeline-stage">
              <div class="nexus-pipeline-tag">D</div>
              <h3>Publish</h3>
              <p>Emit results and reports that remain linked to their experimental and analytical lineage.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="map" class="nexus-block" aria-label="Navigation">
        <div class="nexus-section-head">
          <div>
            <h2 class="nexus-h2">Interactive map</h2>
            <p class="nexus-body">The homepage is organised as a warehouse-to-modality system. The map below links that structure to the concrete project pages.</p>
          </div>
          <a class="nexus-inline-link" href="../explore.html">Open full explore map</a>
        </div>
        <ul class="nexus-bullets">
          <li><strong>Click a node:</strong> expands the constellation from that node.</li>
          <li><strong>Drag a node:</strong> repositions it; edges update live; layout is remembered.</li>
          <li><strong>Click the Nexus node:</strong> returns here (this page).</li>
          <li><strong>Click a project node link:</strong> opens the project documentation page.</li>
        </ul>
        <p class="nexus-body">The drifting motion is a subtle “alive” signal; dragging always overrides drift for the node you move.</p>

        <div id="nexus-graph" aria-label="Interactive system">
          <div class="explore-stage" id="explore-stage">
            <svg id="explore-svg" class="explore-svg" role="img" aria-label="Interactive nexus graph" data-collect-id="nexus-graph" data-collect-title="Nexus graph"></svg>
          </div>
          <div class="explore-links" aria-label="Node links"></div>
        </div>
      </section>

      <section id="integration" class="nexus-block">
      <h2 class="nexus-h2">ITC + Unicorn + SAXS integration</h2>
      <div class="nexus-integration-grid">
        <article class="nexus-integration-card">
          <div class="nexus-integration-label">ITC</div>
          <h3>Thermodynamic traces</h3>
          <p>Binding and heat-flow experiments become governed records whose fitted states remain attached to the experimental run.</p>
        </article>
        <article class="nexus-integration-card">
          <div class="nexus-integration-label">Unicorn</div>
          <h3>Chromatography runs</h3>
          <p>Separation traces, fractions and inline context are stored so downstream analysis still knows what was physically isolated.</p>
        </article>
        <article class="nexus-integration-card">
          <div class="nexus-integration-label">SAXS</div>
          <h3>Structural inference</h3>
          <p>Scattering analysis can be linked back to the upstream fractionation and thermodynamic states that define the sample context.</p>
        </article>
      </div>
      <div class="nexus-merge-band">
        <span class="nexus-merge-node">shared metadata</span>
        <span class="nexus-merge-node">representation objects</span>
        <span class="nexus-merge-node">fit-state lineage</span>
        <span class="nexus-merge-node">report-ready outputs</span>
      </div>
      </section>
    </div>
    <!-- CALYR_CONTACT_BLOCK -->
  </section>
</main>

<script defer src="../data/projects.js"></script>
<script defer src="../js/explore_map.js"></script>

<script>
(function() {
  const container = document.getElementById("nexus-pca-demo");
  if (!container) return;

  const N = 80;
  const size = 6;
  const width = container.clientWidth || 320;
  const height = container.clientHeight || 320;
  const pad = 8;

  for (let i = 0; i < N; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;

    const point = document.createElement("div");
    point.style.position = "absolute";
    point.style.left = `${pad + ((x + 1) * 0.5) * (width - 2 * pad - size)}px`;
    point.style.top = `${pad + ((y + 1) * 0.5) * (height - 2 * pad - size)}px`;
    point.style.width = `${size}px`;
    point.style.height = `${size}px`;
    point.style.background = "#ff4df5";
    point.style.borderRadius = "50%";

    container.appendChild(point);
  }
})();
</script>
