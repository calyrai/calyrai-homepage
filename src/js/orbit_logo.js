(function () {
  'use strict';

  const SELECTOR = '[data-orbit-logo]';
  let uid = 0;

  function escapeAttr(value) {
    return String(value).replace(/"/g, '&quot;');
  }

  function svgMarkup(options) {
    const title = options.title || 'Calyrai';
    const prefix = options.prefix || `orbit${++uid}`;

    const whiteCyanId = `${prefix}-whiteCyan`;
    const magentaId = `${prefix}-magenta`;
    const softId = `${prefix}-soft`;
    const glowWhiteId = `${prefix}-glowWhite`;
    const glowMagentaId = `${prefix}-glowMagenta`;

    // Three concentric rings (arcs) rotating at their own speeds.
    // The cyan/blue glow is emitted by the white ring.
    return `
<svg class="orbit-logo__svg" viewBox="0 0 200 200" role="img" aria-label="${escapeAttr(title)}" focusable="false">
  <defs>
    <linearGradient id="${whiteCyanId}" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.96" />
      <stop offset="68%" stop-color="#24f3ff" stop-opacity="0.92" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.96" />
    </linearGradient>

    <linearGradient id="${magentaId}" x1="170" y1="40" x2="35" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff4df5" stop-opacity="0.92" />
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#ff4df5" stop-opacity="0.82" />
    </linearGradient>

    <linearGradient id="${softId}" x1="40" y1="25" x2="160" y2="175" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42" />
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#24f3ff" stop-opacity="0.22" />
    </linearGradient>

    <filter id="${glowWhiteId}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4.5" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="${glowMagentaId}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3.0" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

  </defs>

  <!-- OUTER ring: soft, faint -->
  <g class="orbit-logo__ring-c">
    <circle class="orbit-logo__stroke" cx="100" cy="100" r="84"
      stroke="url(#${softId})" stroke-width="10"
      stroke-dasharray="420 110" stroke-linecap="round" />
  </g>

  <!-- MID ring: magenta -->
  <g class="orbit-logo__ring-b" filter="url(#${glowMagentaId})">
    <circle class="orbit-logo__stroke" cx="100" cy="100" r="66"
      stroke="url(#${magentaId})" stroke-width="14"
      stroke-dasharray="300 114" stroke-linecap="round" />
  </g>

  <!-- INNER ring: white that emits cyan glow -->
  <g class="orbit-logo__ring" filter="url(#${glowWhiteId})">
    <circle class="orbit-logo__stroke" cx="100" cy="100" r="48"
      stroke="url(#${whiteCyanId})" stroke-width="22"
      stroke-dasharray="235 68" stroke-linecap="round" />
  </g>

  <!-- ACCENT tab: counter-rotating, sits on the right -->
  <g class="orbit-logo__accent" filter="url(#${glowMagentaId})">
    <g transform="translate(126 98) rotate(-10)">
      <!-- main tab (parallelogram) -->
      <path d="M 0 -18 L 92 -18 L 76 18 L -16 18 Z" fill="#ff4df5" fill-opacity="0.96" />
      <!-- cyan highlight edge -->
      <path d="M 6 -22 L 96 -22 L 90 -10 L 0 -10 Z" fill="#24f3ff" fill-opacity="0.78" />
      <!-- subtle inner white notch near the ring -->
      <path d="M -14 -10 L 10 -10 L 4 10 L -20 10 Z" fill="#ffffff" fill-opacity="0.65" />
    </g>
  </g>
</svg>`.trim();
  }

  function enhance(el) {
    if (el.dataset.orbitLogoEnhanced === '1') return;
    el.dataset.orbitLogoEnhanced = '1';

    el.classList.add('orbit-logo');

    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Calyrai');

    if (!el.firstElementChild) {
      const title = el.getAttribute('aria-label') || 'Calyrai';
      el.innerHTML = svgMarkup({ title, prefix: el.id ? `orbit-${el.id}` : undefined });
    }

    function toggleActive() {
      const next = el.dataset.orbitActive === '1' ? '0' : '1';
      el.dataset.orbitActive = next;
      el.classList.toggle('is-active', next === '1');

      const ev = new CustomEvent('calyr:orbit-logo', {
        bubbles: true,
        detail: {
          active: next === '1',
          id: el.id || null,
        },
      });
      el.dispatchEvent(ev);
    }

    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleActive();
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleActive();
      }
    });
  }

  function init() {
    document.querySelectorAll(SELECTOR).forEach(enhance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
