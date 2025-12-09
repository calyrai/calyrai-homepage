// js/pricing_from_yaml.js
//
// Loads data/pricing.yaml and renders pricing tiles into #pricing-grid
// using the same card/grid styling as projects (projects-grid, project-card).

(function () {
  'use strict';

  const GRID_ID = 'pricing-grid';
  const YAML_URL = 'data/pricing.yaml';

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderFeatures(features) {
    if (!features || !features.length) return '';

    return `
      <ul class="mt-4 space-y-1 text-sm text-slate-200">
        ${features
          .map((f) => `<li>• ${escapeHTML(f)}</li>`)
          .join('')}
      </ul>
    `;
  }

  function cardClasses(highlight) {
    const base =
      'project-card rounded-3xl p-5 md:p-6 bg-slate-900/60 border flex flex-col justify-between min-h-[260px]';
    if (highlight) {
      return (
        base +
        ' border-cyan-400/60 shadow-[0_0_40px_rgba(56,189,248,0.55)]'
      );
    }
    return base + ' border-cyan-400/25 shadow-[0_0_25px_rgba(34,211,238,0.25)]';
  }

  function buttonClasses(variant) {
    const base =
      'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150';
    if (variant === 'primary') {
      return (
        base +
        ' border border-cyan-400/80 bg-cyan-400 text-slate-950 hover:bg-cyan-300'
      );
    }
    // ghost / fallback
    return (
      base +
      ' border border-cyan-400/60 bg-slate-900/80 text-cyan-100 hover:bg-cyan-400 hover:text-slate-950'
    );
  }

  function createPricingCard(tier) {
    const {
      badge,
      highlight,
      highlight_label,
      title,
      tagline,
      price,
      period,
      label,
      features,
      cta_label,
      cta_url,
      cta_variant
    } = tier;

    const safeTitle = escapeHTML(title);
    const safeTagline = escapeHTML(tagline);
    const safePrice = escapeHTML(price);
    const safePeriod = escapeHTML(period);
    const safeBadge = escapeHTML(badge);
    const safeHighlightLabel = escapeHTML(highlight_label);
    const safeLabel = escapeHTML(label);
    const safeCtaLabel = escapeHTML(cta_label || 'Learn more');
    const safeCtaUrl = cta_url || '#';

    return `
      <article class="${cardClasses(!!highlight)}">
        <div>
          ${
            safeBadge
              ? `<div class="text-xs inline-flex px-3 py-1 rounded-full border border-cyan-300/70 text-cyan-100 mb-2 uppercase tracking-wide">${safeBadge}</div>`
              : ''
          }
          ${
            highlight
              ? `<div class="text-xs text-cyan-200 mb-2">${safeHighlightLabel}</div>`
              : ''
          }
          <h2 class="text-lg md:text-xl font-semibold mb-1">
            ${safeTitle}
          </h2>
          ${
            safeTagline
              ? `<p class="text-sm text-cyan-200 mb-3">${safeTagline}</p>`
              : ''
          }
          <div class="flex items-baseline gap-1 mb-2">
            <span class="text-2xl font-semibold">${safePrice}</span>
            ${
              safePeriod
                ? `<span class="text-xs uppercase tracking-wide text-slate-300">${safePeriod}</span>`
                : ''
            }
          </div>
          ${
            safeLabel
              ? `<p class="text-xs text-slate-300 mb-2">${safeLabel}</p>`
              : ''
          }
          ${renderFeatures(features)}
        </div>

        <div class="mt-5">
          <a href="${safeCtaUrl}" class="${buttonClasses(cta_variant)}">
            ${safeCtaLabel}
          </a>
        </div>
      </article>
    `;
  }

  async function loadPricing() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    try {
      const resp = await fetch(YAML_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();

      if (typeof jsyaml === 'undefined') {
        throw new Error('jsyaml is not loaded');
      }

      const tiers = jsyaml.load(text) || [];
      if (!Array.isArray(tiers)) {
        throw new Error('pricing.yaml must contain a top-level list');
      }

      grid.innerHTML = tiers.map(createPricingCard).join('');
    } catch (err) {
      console.error('Error loading pricing.yaml:', err);
      grid.innerHTML =
        '<p class="text-sm text-red-300">Could not load pricing information.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadPricing);
})();
