---
layout: project-home
title: Chromatography & Wavelets
project_id: chrom
subtitle: Mode-based interpretation of LC-MS and chromatography, with peaks treated as structured superpositions.
primary_label: Back to Projects
primary_href: ../projects.html#project-chrom
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: Chromatography collaboration
---

<div class="nexus-intro">
<section id="overview" class="nexus-block">
  <div class="nexus-kicker">Separation Branch</div>
  <h2 class="nexus-h2">Chromatography and Unicorn as governed trace analysis</h2>
  <p class="nexus-body">This page reframes chromatography as a structured time-resolved signal rather than a list of isolated peak picks. Unicorn exports, inline traces and separation-series experiments become inputs to a controlled representation workflow that preserves overlap, drift and uncertainty instead of flattening them away.</p>
  <div class="nexus-hero-grid">
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Input</div>
      <div class="nexus-stat-value">Traces</div>
      <p class="nexus-stat-body">Chromatograms, detector channels and fraction metadata stay attached to the same record.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Operator</div>
      <div class="nexus-stat-value">Wavelets</div>
      <p class="nexus-stat-body">Multi-resolution decompositions separate coarse transport structure from local peak events.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Outcome</div>
      <div class="nexus-stat-value">Modes</div>
      <p class="nexus-stat-body">The analysis surfaces transport motifs, overlap patterns and condition-sensitive changes in a comparable form.</p>
    </article>
  </div>
</section>

<section id="flow" class="nexus-block">
  <h2 class="nexus-h2">Trace-to-state flow</h2>
  <div class="nexus-flow">
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">1</span>
      <strong>Load Unicorn output</strong>
      <span>Bring in the full trace, run metadata, gradient program and fraction annotations as one experimental object.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">2</span>
      <strong>Resolve scales</strong>
      <span>Use wavelet or basis-style decompositions to separate baseline drift, broad transport structure and local events.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">3</span>
      <strong>Compare conditions</strong>
      <span>Map runs into a comparable coordinate system so treatment, buffer or loading changes can be read as organized movement.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">4</span>
      <strong>Link downstream</strong>
      <span>Carry the interpreted fractions and state coordinates into SAXS, ITC, SPR or other orthogonal branches.</span>
    </div>
  </div>
</section>

<section id="layers" class="nexus-block">
  <h2 class="nexus-h2">What this page governs</h2>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Acquisition</div>
      <h3>Unicorn and chromatography runs</h3>
      <p>Instrument-native trace data become governed experimental inputs rather than detached screenshots or exported spreadsheets.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Interpretation</div>
      <h3>Wavelet and mode analysis</h3>
      <p>The page centers structured decomposition so overlapping peaks can still be interpreted as transport and state mixtures.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Bridge</div>
      <h3>Cross-modality handoff</h3>
      <p>Fractions and coordinates stay linkable to SAXS, thermodynamic readouts and model-facing result layers.</p>
    </article>
  </div>
</section>

<section id="position" class="nexus-block">
  <h2 class="nexus-h2">Constellation position</h2>
  <p class="nexus-body">This is the separation-science extension of the same representation logic used in SAXS and PCA. Instead of treating chromatography as a pre-processing step, the page makes it a first-class analysis branch whose outputs can govern what is forwarded into structural or thermodynamic interpretation.</p>
  <div class="nexus-merge-band">
    <span class="nexus-merge-node">Unicorn traces</span>
    <span class="nexus-merge-node">Fraction metadata</span>
    <span class="nexus-merge-node">Wavelet modes</span>
    <span class="nexus-merge-node">SAXS coupling</span>
    <span class="nexus-merge-node">ITC / SPR follow-up</span>
  </div>
</section>
</div>
