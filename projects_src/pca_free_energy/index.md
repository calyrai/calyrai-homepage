---
layout: project-home
title: PCA & Free-Energy Modes
project_id: pca
subtitle: Principal components interpreted as perturbations of G(lambda) and cooperative transitions.
primary_label: Back to Projects
primary_href: ../projects.html#project-pca
secondary_label: Explore Map
secondary_href: ../explore.html
contact_subject: PCA Free Energy
---

<div class="nexus-intro">
<section id="overview" class="nexus-block">
	<div class="nexus-kicker">Representation Layer</div>
	<h2 class="nexus-h2">PCA and free-energy modes for ITC, SPR and multi-signal experiments</h2>
	<p class="nexus-body">This page is the mathematical bridge for experiments whose meaning emerges across conditions rather than from a single scalar fit. ITC, SPR, melting curves and related signal families are organized here through low-dimensional coordinates that can still be interpreted thermodynamically.</p>
	<div class="nexus-hero-grid">
		<article class="nexus-stat-card">
			<div class="nexus-stat-label">Signals</div>
			<div class="nexus-stat-value">ITC / SPR</div>
			<p class="nexus-stat-body">Heat-flow traces, response curves and related experimental series are handled as structured families, not isolated endpoints.</p>
		</article>
		<article class="nexus-stat-card">
			<div class="nexus-stat-label">Coordinates</div>
			<div class="nexus-stat-value">PCA</div>
			<p class="nexus-stat-body">Principal modes are used as interpretable perturbations rather than treated as anonymous compression axes.</p>
		</article>
		<article class="nexus-stat-card">
			<div class="nexus-stat-label">Interpretation</div>
			<div class="nexus-stat-value">Landscape</div>
			<p class="nexus-stat-body">Embedded states can be read as stability shifts, cooperative changes and free-energy neighborhoods.</p>
		</article>
	</div>
</section>

<section id="pipeline" class="nexus-block">
	<h2 class="nexus-h2">Controlled inference pipeline</h2>
	<div class="nexus-pipeline-shell">
		<div class="nexus-pipeline-track">
			<article class="nexus-pipeline-stage">
				<div class="nexus-pipeline-tag">1</div>
				<h3>Normalize</h3>
				<p>Bring experiments onto a comparable support while keeping conditions and units attached.</p>
			</article>
			<article class="nexus-pipeline-stage">
				<div class="nexus-pipeline-tag">2</div>
				<h3>Embed</h3>
				<p>Estimate low-dimensional coordinates that expose the dominant experimental directions of change.</p>
			</article>
			<article class="nexus-pipeline-stage">
				<div class="nexus-pipeline-tag">3</div>
				<h3>Interpret</h3>
				<p>Relate each dominant mode back to state shifts, cooperativity or mechanistic perturbations.</p>
			</article>
			<article class="nexus-pipeline-stage">
				<div class="nexus-pipeline-tag">4</div>
				<h3>Compare</h3>
				<p>Use the same representation language across ITC, SPR, chromatography and SAXS-facing branches.</p>
			</article>
		</div>
	</div>
</section>

<section id="methods" class="nexus-block">
	<h2 class="nexus-h2">Why this matters</h2>
	<p class="nexus-body">The page keeps the representation layer scientifically visible. Instead of hiding PCA behind downstream plots, it states that the dimensional reduction itself is part of the inference logic: a way to decide whether a signal family supports discrete states, trajectories or cooperative transitions.</p>
	<div class="nexus-stack">
		<article class="nexus-layer-card">
			<div class="nexus-layer-index">A</div>
			<div>
				<h3 class="nexus-layer-title">Thermodynamic language</h3>
				<p class="nexus-layer-body">Coordinates are mapped back to stability shifts and free-energy narratives wherever that interpretation is justified.</p>
			</div>
		</article>
		<article class="nexus-layer-card">
			<div class="nexus-layer-index">B</div>
			<div>
				<h3 class="nexus-layer-title">Cross-experimental reuse</h3>
				<p class="nexus-layer-body">The same framework can organize ITC, SPR, melting and chromatography signals without forcing them into one rigid mechanistic model up front.</p>
			</div>
		</article>
		<article class="nexus-layer-card">
			<div class="nexus-layer-index">C</div>
			<div>
				<h3 class="nexus-layer-title">Governed model coupling</h3>
				<p class="nexus-layer-body">Only after the coordinates are stable do model families or mechanistic interpretations get attached.</p>
			</div>
		</article>
	</div>
</section>

<section id="docs" class="nexus-block">
	<h2 class="nexus-h2">Working notes</h2>
	<p class="nexus-body"><a href="pca_free_energy/theory.html">Theory notes</a></p>
	<p class="nexus-body"><a href="pca_free_energy/pipeline.html">Pipeline notes</a></p>
</section>

<section id="position" class="nexus-block">
	<h2 class="nexus-h2">Constellation position</h2>
	<p class="nexus-body">This project is the mathematical core of the representation layer. It links scattering, chromatography, ITC and SPR by giving them a common lower-dimensional language for state organization, comparison and controlled interpretation.</p>
</section>
</div>
