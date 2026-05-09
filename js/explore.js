(function () {
  'use strict';

  const hero = document.getElementById('explore-hero');
  const disks = document.getElementById('explore-disks');
  const detail = document.getElementById('explore-detail');
  if (!hero || !disks || !detail) return;

  const NEXUS = {
    name: 'Nexus',
    kicker: 'Semantic Orchestration',
    role: 'The invariant center. The Zeiger marks its authority.',
  };

  const OUTER = [
    {
      id: 'atlas',
      name: 'Atlas',
      kicker: 'Semantic Cartography',
      color: 'cyan',
      pearlColor: '#24f3ff',
      href: 'docs.html#atlas',
      role: 'Semantic topology and cartography layer.',
      body: 'Atlas decomposes semantic space into navigable regions and records semantic adjacency and stable boundaries.',
    },
    {
      id: 'calyrai',
      name: 'Calyrai',
      kicker: 'Experiential Projection',
      color: 'magenta',
      pearlColor: '#ff4df5',
      href: 'docs.html#calyrai',
      role: 'Experiential projection layer.',
      body: 'Calyrai animates transitions and makes semantic gravity perceptible for interaction and perception.',
    },
    {
      id: 'pr',
      name: 'PR',
      kicker: 'Projection Runtime',
      color: 'magenta',
      pearlColor: '#f3f8ff',
      href: 'docs.html#pr',
      role: 'Deployment of public semantic surfaces.',
      body: 'PR deploys live semantic projections so internal state can be rendered into public-facing surfaces.',
    },
    {
      id: 'runtime',
      name: 'Runtime',
      kicker: 'Execution Substrate',
      color: 'cyan',
      pearlColor: '#9fb4c9',
      href: 'docs.html#runtime',
      role: 'Internal execution engine. Code assets are not public.',
      body: 'Runtime handles graph evaluation, orchestration, and scheduling while public systems consume projections.',
    },
    {
      id: 'glabs',
      name: "G'labs ||",
      kicker: 'Experimental Lab',
      color: 'cyan',
      pearlColor: '#b28aff',
      href: 'docs.html#glabs',
      role: 'Experimental morphogenesis lab.',
      body: "G'labs || is the unstable region where semantics are stress-tested and evolved before integration.",
    },
    {
      id: 'projects',
      name: 'Projects',
      kicker: 'Application Layer',
      color: 'magenta',
      pearlColor: '#67f2d6',
      href: 'docs.html#projects',
      role: 'Applied project surfaces and use-case execution.',
      body: 'Projects is the applications lane where semantic systems are instantiated for concrete cases, delivery tracks, and user-facing outcomes.',
    },
  ];

  const PEARL_FALLBACK_PALETTE = ['#24f3ff', '#ff4df5', '#f3f8ff', '#9fb4c9', '#b28aff', '#67f2d6'];
  const PEARL_HARD_FALLBACK_RGB = '36,243,255';

  let activeId = null;
  let resumeTimer = null;
  let heroDetail = null;
  let heroPearls = null;

  function escH(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hexToRgbTriplet(hex) {
    const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(String(hex || '').trim());
    if (!match) return null;
    return [
      parseInt(match[1], 16),
      parseInt(match[2], 16),
      parseInt(match[3], 16),
    ].join(',');
  }

  function normalizeRgbTriplet(value) {
    const parts = String(value || '').split(',').map(function (p) { return Number(p.trim()); });
    if (parts.length !== 3 || parts.some(function (n) { return !Number.isFinite(n); })) return null;
    const clamped = parts.map(function (n) { return Math.max(0, Math.min(255, Math.round(n))); });
    return clamped.join(',');
  }

  function resolvePearlRgb(node, index) {
    const source = (node && typeof node.pearlColor === 'string' && node.pearlColor.trim())
      ? node.pearlColor.trim()
      : PEARL_FALLBACK_PALETTE[index % PEARL_FALLBACK_PALETTE.length];

    if (source.indexOf('#') === 0) return hexToRgbTriplet(source) || PEARL_HARD_FALLBACK_RGB;
    return normalizeRgbTriplet(source) || PEARL_HARD_FALLBACK_RGB;
  }

  function setLogoPaused(paused) {
    const logo = hero.querySelector('.orbit-logo');
    if (!logo) return;
    logo.classList.toggle('is-paused', paused);
  }

  function pauseThenRestartLogo() {
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
    setLogoPaused(true);
    resumeTimer = setTimeout(function () {
      setLogoPaused(false);
      resumeTimer = null;
    }, 1800);
  }

  function renderHero() {
    hero.innerHTML = '' +
      '<div class="hero-shell">' +
      '  <div class="hero-logo-wrap" aria-hidden="true">' +
      '    <div class="orbit-logo" id="orbit-logo-explore" style="--orbit-size: 162px; --orbit-accent-rot: 140s;">' +
      '      <svg class="orbit-logo__svg" viewBox="0 0 200 200" role="img" aria-label="Nexus logo" focusable="false">' +
      '        <defs>' +
      '          <linearGradient id="orbit-logo-explore-whiteCyan" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">' +
      '            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"></stop>' +
      '            <stop offset="40%" stop-color="#ffffff" stop-opacity="0.96"></stop>' +
      '            <stop offset="68%" stop-color="#24f3ff" stop-opacity="0.92"></stop>' +
      '            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.96"></stop>' +
      '          </linearGradient>' +
      '          <linearGradient id="orbit-logo-explore-magenta" x1="170" y1="40" x2="35" y2="160" gradientUnits="userSpaceOnUse">' +
      '            <stop offset="0%" stop-color="#ff4df5" stop-opacity="0.92"></stop>' +
      '            <stop offset="55%" stop-color="#ffffff" stop-opacity="0.22"></stop>' +
      '            <stop offset="100%" stop-color="#ff4df5" stop-opacity="0.82"></stop>' +
      '          </linearGradient>' +
      '          <linearGradient id="orbit-logo-explore-soft" x1="40" y1="25" x2="160" y2="175" gradientUnits="userSpaceOnUse">' +
      '            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42"></stop>' +
      '            <stop offset="60%" stop-color="#ffffff" stop-opacity="0.06"></stop>' +
      '            <stop offset="100%" stop-color="#24f3ff" stop-opacity="0.22"></stop>' +
      '          </linearGradient>' +
      '          <filter id="orbit-logo-explore-glowWhite" x="-60%" y="-60%" width="220%" height="220%">' +
      '            <feGaussianBlur stdDeviation="4.5" result="b"></feGaussianBlur>' +
      '            <feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>' +
      '          </filter>' +
      '          <filter id="orbit-logo-explore-glowMagenta" x="-60%" y="-60%" width="220%" height="220%">' +
      '            <feGaussianBlur stdDeviation="3.0" result="b"></feGaussianBlur>' +
      '            <feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>' +
      '          </filter>' +
      '        </defs>' +
      '        <g class="orbit-logo__ring-c"><circle class="orbit-logo__stroke" cx="100" cy="100" r="84" stroke="url(#orbit-logo-explore-soft)" stroke-width="10" stroke-dasharray="420 110" stroke-linecap="round"></circle></g>' +
      '        <g class="orbit-logo__ring-b" filter="url(#orbit-logo-explore-glowMagenta)"><circle class="orbit-logo__stroke" cx="100" cy="100" r="66" stroke="url(#orbit-logo-explore-magenta)" stroke-width="14" stroke-dasharray="300 114" stroke-linecap="round"></circle></g>' +
      '        <g class="orbit-logo__ring" filter="url(#orbit-logo-explore-glowWhite)"><circle class="orbit-logo__stroke" cx="100" cy="100" r="48" stroke="url(#orbit-logo-explore-whiteCyan)" stroke-width="22" stroke-dasharray="235 68" stroke-linecap="round"></circle></g>' +
      '        <g class="orbit-logo__accent" filter="url(#orbit-logo-explore-glowMagenta)"><g transform="translate(126 98) rotate(-10)"><path d="M 0 -18 L 92 -18 L 76 18 L -16 18 Z" fill="#ff4df5" fill-opacity="0.96"></path><path d="M 6 -22 L 96 -22 L 90 -10 L 0 -10 Z" fill="#24f3ff" fill-opacity="0.78"></path><path d="M -14 -10 L 10 -10 L 4 10 L -20 10 Z" fill="#ffffff" fill-opacity="0.65"></path></g></g>' +
      '      </svg>' +
      '    </div>' +
      '  </div>' +
      '  <div class="hero-badge">' +
      '    <p class="hero-kicker">' + escH(NEXUS.kicker) + '</p>' +
      '    <h1 class="hero-title">' + escH(NEXUS.name) + '</h1>' +
      '    <p class="hero-sub">' + escH(NEXUS.role) + '</p>' +
      '    <div id="hero-pearls-line" role="list" aria-label="Semantic regions"></div>' +
      '    <div class="hero-detail-slot" aria-live="polite" aria-atomic="true"></div>' +
      '  </div>' +
      '</div>';

    heroDetail = hero.querySelector('.hero-detail-slot');
    heroPearls = hero.querySelector('#hero-pearls-line');
    renderHeroDetail(null);
  }

  function renderHeroDetail(node) {
    if (!heroDetail) return;

    if (!node) {
      heroDetail.innerHTML =
        '<div class="ehd-inline ehd-inline--nexus">' +
        '  <p class="ehd-kicker">Select a semantic pearl</p>' +
        '  <p class="ehd-body-text">Click any pearl in the line above to load its explanation here in the Nexus field.</p>' +
        '</div>';
      return;
    }

    const mag = node.color === 'magenta';
    heroDetail.innerHTML =
      '<div class="ehd-inline ' + (mag ? 'ehd-body--magenta' : 'ehd-body--cyan') + '">' +
      '  <button class="ehd-close" aria-label="Close">X</button>' +
      '  <p class="ehd-kicker">' + escH(node.kicker) + '</p>' +
      '  <h3 class="ehd-name">' + escH(node.name) + '</h3>' +
      '  <p class="ehd-role">' + escH(node.role) + '</p>' +
      '  <p class="ehd-body-text">' + escH(node.body) + '</p>' +
      (mag ? '<div class="ehd-boundary"><span class="ehd-b-label">Runtime Boundary</span>Individual code assets are internal. Public surfaces receive projections and rendered outputs only.</div>' : '') +
      (node.href ? '<a class="ehd-cta" href="' + escH(node.href) + '"><span class="ehd-cta-label">Enter this region</span></a>' : '') +
      '</div>';

    const closeBtn = heroDetail.querySelector('.ehd-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        activeId = null;
        clearActive();
        setLogoPaused(false);
        renderHeroDetail(null);
      });
    }
  }

  function renderPearlLine() {
    if (!heroPearls) return;

    heroPearls.innerHTML = OUTER.map(function (node, index) {
      const cls = node.color === 'magenta' ? 'edisk edisk--magenta' : 'edisk edisk--cyan';
      const pearlRgb = resolvePearlRgb(node, index);
      return '' +
        '<button class="' + cls + '" style="--pearl-rgb:' + pearlRgb + '" data-id="' + escH(node.id) + '" role="listitem" aria-label="' + escH(node.name) + '">' +
        '  <svg class="edisk-orbit" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
        '    <circle class="edisk-ring edisk-ring-c" cx="50" cy="50" r="41"></circle>' +
        '    <circle class="edisk-ring edisk-ring-b" cx="50" cy="50" r="31"></circle>' +
        '    <circle class="edisk-ring edisk-ring-a" cx="50" cy="50" r="22"></circle>' +
        '  </svg>' +
        '  <span class="edisk-core">' + escH(node.name) + '</span>' +
        '</button>';
    }).join('');

    heroPearls.querySelectorAll('.edisk').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        const node = OUTER.find(function (n) { return n.id === id; });
        if (!node) return;

        const isSame = activeId === node.id;
        clearActive();
        activeId = null;
        setLogoPaused(false);
        renderHeroDetail(null);

        if (isSame) return;

        btn.classList.add('is-selected');
        activeId = node.id;
        pauseThenRestartLogo();
        renderHeroDetail(node);
      });
    });
  }

  function clearActive() {
    if (!heroPearls) return;
    heroPearls.querySelectorAll('.edisk.is-selected').forEach(function (el) {
      el.classList.remove('is-selected');
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#hero-pearls-line') && !e.target.closest('.hero-detail-slot')) {
      activeId = null;
      clearActive();
      setLogoPaused(false);
      renderHeroDetail(null);
    }
  });

  renderHero();
  renderPearlLine();

  disks.setAttribute('hidden', 'true');
  detail.setAttribute('hidden', 'true');
})();
