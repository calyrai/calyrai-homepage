(function () {
  'use strict';

  const hero = document.getElementById('explore-hero');
  const disks = document.getElementById('explore-disks');
  const detail = document.getElementById('explore-detail');
  if (!hero || !disks || !detail) return;

  const NEXUS = {
    name: 'Nexus',
    kicker: 'Semantic Orchestration',
    role: 'The invariant center for meaning, structure, and flow.',
  };

  const OUTER = [
    {
      id: 'atlas',
      name: 'Theory',
      kicker: 'Semantic Cartography',
      color: 'cyan',
      pearlColor: '#24f3ff',
      href: 'docs.html#theory/overview',
      role: 'Semantic topology and cartography layer.',
      body: 'Theory decomposes semantic space into navigable regions and records semantic adjacency and stable boundaries.',
      details: [
        'Theory maps semantic terrain into stable regions so complex systems can be explored without losing orientation.',
        'It captures neighborhood structure, boundary behavior, and transition pathways between concepts, models, and states.',
        'Use Theory when you need semantic navigation that remains consistent as the system grows in complexity and scale.',
      ],
    },
    {
      id: 'calyrai',
      name: 'Calyrai',
      kicker: 'Experiential Projection',
      color: 'magenta',
      pearlColor: '#ff4df5',
      href: 'docs.html#calyrai/overview',
      role: 'Experiential projection layer.',
      body: 'Calyrai animates transitions and makes semantic gravity perceptible for interaction and perception.',
      details: [
        'Calyrai translates abstract semantic structure into perceivable interaction and visual experience.',
        'It turns state transitions into readable motion, emphasis, and context cues so users can feel system direction.',
        'Use Calyrai when interpretation must be intuitive while remaining faithful to the underlying semantic logic.',
      ],
    },
    {
      id: 'pr',
      name: 'Access',
      kicker: 'Public Relay',
      color: 'magenta',
      pearlColor: '#f3f8ff',
      href: 'docs.html#access/overview',
      role: 'Deployment of public semantic surfaces.',
      body: 'Access deploys live semantic projections so internal state can be rendered into public-facing surfaces.',
      details: [
        'Access is the public projection runtime that exposes selected semantic state in externally consumable form.',
        'It ensures published surfaces stay synchronized with the internal model while preserving governance boundaries.',
        'Use Access for delivery channels where clarity, traceability, and controlled projection are required.',
      ],
    },
    {
      id: 'runtime',
      name: 'Engine',
      kicker: 'Execution Substrate',
      color: 'cyan',
      pearlColor: '#9fb4c9',
      href: 'docs.html#engine/overview',
      role: 'Internal execution engine. Code assets are not public.',
      body: 'Engine handles graph evaluation, orchestration, and scheduling while public systems consume projections.',
      details: [
        'Engine executes the internal graph of transformations, constraints, and orchestration rules.',
        'It handles scheduling, evaluation order, and dependency integrity so semantic operations remain reliable.',
        'Use Engine as the protected execution substrate that powers projections without exposing private internals.',
      ],
    },
    {
      id: 'glabs',
      name: "G'labs (Sandbox)",
      kicker: 'Experimental Lab',
      color: 'cyan',
      pearlColor: '#b28aff',
      href: 'docs.html#sandbox/overview',
      role: 'Experimental morphogenesis lab.',
      body: "G'labs (Sandbox) is the unstable region where semantics are stress-tested and evolved before integration.",
      details: [
        "G'labs (Sandbox) is the exploratory zone where new semantic behaviors are tested before entering the stable stack.",
        'It supports rapid experimentation with interaction patterns, coupling structures, and emergent system forms.',
        'Use G\'labs (Sandbox) to evolve ideas safely, then promote validated patterns back into the coordinated core.',
      ],
    },
    {
      id: 'projects',
      name: 'Gallery',
      kicker: 'Application Layer',
      color: 'magenta',
      pearlColor: '#67f2d6',
      href: 'docs.html#gallery/blog_index',
      role: 'Applied project surfaces and use-case execution.',
      body: 'Gallery is the applications lane where semantic systems are instantiated for concrete cases, delivery tracks, and user-facing outcomes.',
      details: [
        'Gallery is the application layer where semantic architecture becomes concrete workflows and deliverables.',
        'It connects the core model to real use cases, operational tracks, and outcome-focused implementation paths.',
        'Use Gallery to move from semantic capability to measurable execution in product, research, or deployment contexts.',
      ],
    },
  ];

  const PEARL_FALLBACK_PALETTE = ['#24f3ff', '#ff4df5', '#f3f8ff', '#9fb4c9', '#b28aff', '#67f2d6'];
  const PEARL_HARD_FALLBACK_RGB = '36,243,255';

  let activeId = null;
  let resumeTimer = null;
  let heroDetail = null;
  let heroPearls = null;
  let heroTitle = null;

  function toTitleToken(value) {
    const clean = String(value || '').trim().toLowerCase();
    if (!clean) return '';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  function formatTitleSuffix(node) {
    const raw = String((node && (node.name || node.id)) || '').trim();
    if (!raw) return '';

    // Keep symbolic separators (like ||), remove apostrophes, title-case word chunks.
    return raw
      .replace(/'/g, '')
      .split(/(\|\||\s+)/)
      .map(function (part) {
        if (!part || /^\s+$/.test(part) || part === '||') return part;
        const lower = part.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
  }

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

  function setHeroTitle(node) {
    if (!heroTitle) return;
    if (!node) {
      heroTitle.textContent = NEXUS.name;
      return;
    }
    heroTitle.textContent = toTitleToken(NEXUS.name) + '.' + formatTitleSuffix(node);
  }

  function setHeroLogoPearl(node) {
    const logo = hero.querySelector('#orbit-logo-explore');
    if (!logo) return;

    const slot = logo.querySelector('.hero-logo-pearl-slot');
    if (!slot) return;

    if (!node) {
      logo.classList.remove('has-active-pearl');
      slot.innerHTML = '';
      return;
    }

    const nodeIndex = OUTER.findIndex(function (n) { return n.id === node.id; });
    const pearlRgb = resolvePearlRgb(node, nodeIndex >= 0 ? nodeIndex : 0);

    logo.classList.add('has-active-pearl');
    slot.innerHTML = '' +
      '<div class="hero-logo-pearl edisk" style="--pearl-rgb:' + escH(pearlRgb) + '">' +
      '  <svg class="edisk-orbit" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '    <circle class="edisk-ring edisk-ring-c" cx="50" cy="50" r="41"></circle>' +
      '    <circle class="edisk-ring edisk-ring-b" cx="50" cy="50" r="31"></circle>' +
      '    <circle class="edisk-ring edisk-ring-a" cx="50" cy="50" r="22"></circle>' +
      '  </svg>' +
      '  <span class="edisk-core">' + escH(toTitleToken(node.name || node.id)) + '</span>' +
      '</div>';
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
      '      <div class="hero-logo-pearl-slot" aria-hidden="true"></div>' +
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
    heroTitle = hero.querySelector('.hero-title');
    setHeroTitle(null);
    setHeroLogoPearl(null);
    renderHeroDetail(null);
  }

  function renderHeroDetail(node) {
    if (!heroDetail) return;

    if (!node) {
      setHeroTitle(null);
      setHeroLogoPearl(null);
      heroDetail.classList.remove('is-active-high');
      heroDetail.classList.remove('is-drifting-up');
      heroDetail.innerHTML =
        '<div class="ehd-inline ehd-inline--nexus">' +
        '  <p class="ehd-kicker">Select a semantic pearl</p>' +
        '  <p class="ehd-body-text ehd-body-text--nexus">Nexus is the coordination core of this ecosystem. It keeps one shared semantic frame across data, models, runtime behavior, and user-facing projections, so interpretation stays consistent from first signal to final decision.</p>' +
        '  <p class="ehd-body-text ehd-body-text--nexus">Think of it as the layer that preserves continuity: relations remain clear, constraints stay attached to context, and transformations remain traceable instead of fragmenting into disconnected tools or views.</p>' +
        '  <p class="ehd-body-text ehd-body-text--nexus">Each pearl is a specialized region built around that same core. You can explore Atlas, Calyrai, PR, Runtime, G\'labs ||, or Projects independently, but Nexus is what keeps the whole system coherent as one structure.</p>' +
        '  <p class="ehd-body-text ehd-body-text--nexus">Select any pearl to see how that region extends the core logic into a concrete capability.</p>' +
        '</div>';
      if (heroPearls) {
        heroPearls.classList.remove('is-hidden');
      }
      return;
    }

    const mag = node.color === 'magenta';
    setHeroTitle(node);
    setHeroLogoPearl(node);
    const nodeIndex = OUTER.findIndex(function (n) { return n.id === node.id; });
    const detailRgb = resolvePearlRgb(node, nodeIndex >= 0 ? nodeIndex : 0);
    const detailParagraphs = (Array.isArray(node.details) && node.details.length ? node.details : [node.body])
      .map(function (txt) {
        return '<p class="ehd-body-text ehd-body-text--detail">' + escH(txt) + '</p>';
      })
      .join('');

    heroDetail.innerHTML =
      '<div class="ehd-inline ehd-inline--pearl ' + (mag ? 'ehd-body--magenta' : 'ehd-body--cyan') + '" style="--detail-rgb:' + escH(detailRgb) + '">' +
      '  <button class="ehd-close" aria-label="Close">X</button>' +
      '  <p class="ehd-kicker">' + escH(node.kicker) + '</p>' +
      '  <h3 class="ehd-name">' + escH(node.name) + '</h3>' +
      '  <p class="ehd-role">' + escH(node.role) + '</p>' +
      detailParagraphs +
      (mag ? '<div class="ehd-boundary"><span class="ehd-b-label">Runtime Boundary</span>Individual code assets are internal. Public surfaces receive projections and rendered outputs only.</div>' : '') +
      (node.href ? '<a class="ehd-cta" href="' + escH(node.href) + '"><span class="ehd-cta-label">Enter this region</span></a>' : '') +
      '</div>';

    heroDetail.classList.add('is-active-high');
    if (heroPearls) heroPearls.classList.add('is-hidden');

    const closeBtn = heroDetail.querySelector('.ehd-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        activeId = null;
        clearActive();
        setLogoPaused(false);
        resetScatter();
        if (heroPearls) {
          heroPearls.classList.remove('is-hidden');
        }
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

    // Reset scatter state on render
    heroPearls.querySelectorAll('.edisk.is-scattered').forEach(function (btn) {
      btn.classList.remove('is-scattered');
      btn.style.removeProperty('--scatter-anim');
    });

    heroPearls.querySelectorAll('.edisk').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = btn.getAttribute('data-id');
        const node = OUTER.find(function (n) { return n.id === id; });
        if (!node) return;

        const isSame = activeId === node.id;
        clearActive();
        activeId = null;
        setLogoPaused(false);
        resetScatter();
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

  function scatterPearls(selectedId) {
    if (!heroPearls) return;
    heroPearls.querySelectorAll('.edisk').forEach(function (btn, index) {
      const btnId = btn.getAttribute('data-id');
      if (btnId === selectedId) {
        btn.classList.remove('is-scattered');
      } else {
        btn.style.setProperty('--scatter-anim', 'pearl-scatter-' + index);
        btn.classList.add('is-scattered');
      }
    });
  }

  function resetScatter() {
    if (!heroPearls) return;
    heroPearls.querySelectorAll('.edisk.is-scattered').forEach(function (btn) {
      btn.classList.remove('is-scattered');
      btn.style.removeProperty('--scatter-anim');
    });
  }

  let draggedPearl = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let pearlStartX = 0;
  let pearlStartY = 0;

  function triggerNexusExplosion(pearlNode) {
    const logo = hero.querySelector('#orbit-logo-explore');
    if (!logo) return;

    logo.classList.add('is-exploding');

    if (heroDetail) {
      heroDetail.classList.add('is-expanded-up');
      setTimeout(function () {
        heroDetail.classList.remove('is-expanded-up');
      }, 600);
    }

    setTimeout(function () {
      logo.classList.remove('is-exploding');
    }, 2400);

    if (heroPearls) {
      heroPearls.classList.remove('is-hidden');
    }
    renderHeroDetail(pearlNode);
  }

  function addDragToPearls() {
    const pearls = document.querySelectorAll('#hero-pearls-line .edisk');
    pearls.forEach(function (pearl) {
      pearl.draggable = true;
      pearl.style.cursor = 'grab';

      pearl.addEventListener('dragstart', function (e) {
        draggedPearl = pearl;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        const rect = pearl.getBoundingClientRect();
        pearlStartX = rect.left;
        pearlStartY = rect.top;
        pearl.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', pearl.innerHTML);
      });

      pearl.addEventListener('dragend', function (e) {
        pearl.classList.remove('is-dragging');
        if (!draggedPearl) return;

        const logo = hero.querySelector('#orbit-logo-explore');
        if (!logo) return;

        const logoRect = logo.getBoundingClientRect();
        const logoCenterX = logoRect.left + logoRect.width / 2;
        const logoCenterY = logoRect.top + logoRect.height / 2;

        const dragDistance = Math.sqrt(
          Math.pow(e.clientX - logoCenterX, 2) +
          Math.pow(e.clientY - logoCenterY, 2)
        );

        // Collision threshold (pixels)
        if (dragDistance < 120) {
          const pearlId = pearl.getAttribute('data-id');
          const pearlNode = OUTER.find(function (n) { return n.id === pearlId; });
          if (pearlNode) {
            triggerNexusExplosion(pearlNode);
            resetScatter();
            clearActive();
            activeId = null;
          }
        }

        draggedPearl = null;
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#hero-pearls-line') && !e.target.closest('.hero-detail-slot')) {
      activeId = null;
      clearActive();
      setLogoPaused(false);
      resetScatter();
      if (heroPearls) {
        heroPearls.classList.remove('is-hidden');
      }
      renderHeroDetail(null);
    }
  });

  renderHero();
  renderPearlLine();
  addDragToPearls();

  // Add dragover effect for nexus
  const logoWrap = hero.querySelector('.hero-logo-wrap');
  if (logoWrap) {
    logoWrap.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
  }

  disks.setAttribute('hidden', 'true');
  detail.setAttribute('hidden', 'true');
})();
