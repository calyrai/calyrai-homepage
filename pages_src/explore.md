<header class="site-header">
  <div class="nav-inner">
    <div class="nav-left-row">
      <a href="index.html" class="nav-pill glow-nav">
        Calyr.ai – platform technology
      </a>
      <a href="explore.html" class="nav-pill glow-nav" aria-current="page">Explore</a>
      <a href="team.html" class="nav-pill glow-nav">Team</a>
    </div>

    <nav class="nav-links" aria-label="Primary">
      <a href="https://bsky.app/profile/calyrai.bsky.social" class="nav-pill glow-nav">Follow</a>
      <a href="mailto:rupert.tscheliessnig@calyr.ai?subject=Contact&body=" class="nav-pill glow-nav">Contact</a>
      <a href="index.html#impressum" class="nav-pill glow-nav">Impressum</a>
    </nav>
  </div>
</header>

<main class="explore-page">
  <section class="explore-shell" aria-label="Explore map">
    <div class="explore-header">
      <div class="explore-kicker">Calyr.ai / Explore</div>
      <h1 class="explore-title">Research constellation</h1>
      <p class="explore-subtitle">Drag to pan, scroll to zoom. Click nodes to expand the constellation. Your arrangement persists on this device.</p>
    </div>

    <div class="explore-stage" id="explore-stage">
      <svg id="explore-svg" class="explore-svg" role="img" aria-label="Interactive project map"></svg>
    </div>

    <div class="explore-links" aria-label="Project links">
      <!-- JS populates a minimal accessible link list -->
    </div>
  </section>
</main>

<script defer src="data/projects.js"></script>
<script defer src="js/explore_map.js"></script>
