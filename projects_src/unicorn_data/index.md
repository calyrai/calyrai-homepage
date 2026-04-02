---
layout: project-home
title: Unicorn – Chromatography Data Layer
project_id: unicorn-data
subtitle: Instrument-native fractionation records as governed warehouse data.
primary_label: Back to Projects
primary_href: ../projects.html#project-unicorn-data
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: Unicorn data collaboration
---

<div class="nexus-intro">
<section id="overview" class="nexus-hero">
  <div class="nexus-kicker">Unicorn · Separation Layer</div>
  <h2 class="nexus-title">Chromatography Data Layer</h2>
  <p class="nexus-subtitle">Nexus treats Unicorn outputs as the canonical separation record for chromatography-driven workflows. Fractions, gradients, detector traces and run metadata become governed warehouse objects that can be linked into SAXS, ITC and SPR follow-up analyses.</p>
  <div class="nexus-hero-grid">
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Primary Signal</div>
      <div class="nexus-stat-value">Traces</div>
      <p class="nexus-stat-body">UV, conductivity and run-program traces remain attached to the same run object rather than exported as disconnected snapshots.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">State Layer</div>
      <div class="nexus-stat-value">Fractions</div>
      <p class="nexus-stat-body">Fractions become state-carrying entities with their own provenance and downstream assay links.</p>
    </article>
    <article class="nexus-stat-card">
      <div class="nexus-stat-label">Outcome</div>
      <div class="nexus-stat-value">Linkage</div>
      <p class="nexus-stat-body">Separation context stays visible when the sample moves into structural or thermodynamic measurement.</p>
    </article>
  </div>
</section>

<nav class="nexus-outline" aria-label="Unicorn sections">
  <a class="nexus-outline-link" href="#overview">Overview</a>
  <a class="nexus-outline-link" href="#flow">Data flow</a>
  <a class="nexus-outline-link" href="#architecture">Warehouse</a>
  <a class="nexus-outline-link" href="#statement">Outcome</a>
</nav>

<section id="flow" class="nexus-block">
  <h2 class="nexus-h2">Data-first Unicorn handling</h2>
  <p class="nexus-body">The point of this page is not only to visualize chromatograms. It is to make the instrument-native Unicorn run the stable data object from which fraction records, wavelet representations and downstream experiments inherit their meaning.</p>
  <div class="nexus-flow">
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">1</span>
      <strong>Run capture</strong>
      <span>Store the complete Unicorn export, run program, detector channels and time axis inside the warehouse.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">2</span>
      <strong>Fraction records</strong>
      <span>Materialized fractions become explicit records that can later be tied to SAXS, ITC or SPR assays.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">3</span>
      <strong>Representation</strong>
      <span>Wavelet or basis decompositions convert the raw trace into transport-aware and overlap-aware derived forms.</span>
    </div>
    <div class="nexus-flow-arrow"></div>
    <div class="nexus-flow-node">
      <span class="nexus-flow-step">4</span>
      <strong>Cross-modality handoff</strong>
      <span>Downstream measurements inherit the fraction identity and separation context as part of their provenance.</span>
    </div>
  </div>
</section>

<section id="architecture" class="nexus-block">
  <h2 class="nexus-h2">Integration layer</h2>
  <div class="nexus-integration-grid">
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Acquisition</div>
      <h3>Instrument-native runs</h3>
      <p>Unicorn exports are preserved as the reference data layer for separation workflows.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Derived forms</div>
      <h3>Wavelets and modes</h3>
      <p>Transport motifs, overlapping peaks and drift become explicit representational objects instead of visual impressions only.</p>
    </article>
    <article class="nexus-integration-card">
      <div class="nexus-integration-label">Handoff</div>
      <h3>Fraction-to-assay linkage</h3>
      <p>The run can be linked directly to structural and thermodynamic branches inside Nexus.</p>
    </article>
  </div>
</section>

<section id="statement" class="nexus-block">
  <h2 class="nexus-h2">From separation traces to warehouse-linked fractions</h2>
  <p class="nexus-body">The Unicorn page now follows the same Nexus spine as the homepage: record the run, derive structured forms, preserve fraction identity and hand the resulting state forward into other modalities. This keeps chromatography as a governed warehouse origin rather than a temporary preprocessing step.</p>
  <div class="nexus-merge-band">
    <span class="nexus-merge-node">run traces</span>
    <span class="nexus-merge-node">fraction records</span>
    <span class="nexus-merge-node">derived wavelets</span>
    <span class="nexus-merge-node">handoff lineage</span>
    <span class="nexus-merge-node">cross-modality context</span>
  </div>
</section>
</div>
