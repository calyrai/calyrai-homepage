// js/projects_page_from_yaml.js
// Renders Projects cards from YAML catalogs into Public/Private grids.

(function () {
  'use strict';

  const YAML_PUBLIC_URL = new URL('data/projects_public.yaml', window.location.href).toString();
  const YAML_PRIVATE_URL = new URL('data/projects_private.yaml', window.location.href).toString();
  // Backward compatibility (older deploys): single combined catalog.
  const YAML_COMBINED_URL = new URL('data/projects.yaml', window.location.href).toString();

  const GRID_PUBLIC_ID = 'projects-public-grid';
  const GRID_PRIVATE_ID = 'projects-private-grid';
  const PRIVATE_SECTION_ID = 'projects-private-section';

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function normalizeVisibility(p) {
    const v = String(p?.visibility || '').toLowerCase().trim();
    if (v === 'private') return 'private';
    if (v === 'public') return 'public';
    return 'public';
  }

  function forceVisibility(list, visibility) {
    if (!Array.isArray(list)) return [];
    return list
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({ visibility, ...p }));
  }

  function setPrivateSectionVisible(isVisible) {
    const section = document.getElementById(PRIVATE_SECTION_ID);
    if (!section) return;
    section.style.display = isVisible ? '' : 'none';
  }

  function normalizeUrl(p) {
    return p?.url ?? p?.link_url ?? '';
  }

  function normalizeLabel(p) {
    return p?.link_label ?? p?.cta_label ?? 'OPEN';
  }

  function normalizeBody(p) {
    if (Array.isArray(p?.text)) return p.text;
    if (typeof p?.description === 'string' && p.description.trim()) {
      return [p.description.trim()];
    }
    return [];
  }

  function isDisabled(p) {
    const url = String(normalizeUrl(p) || '');
    return !!p?.disabled || !url || url === '#';
  }

  function createCard(p) {
    const id = p?.id ? String(p.id) : '';
    const cardId = id ? `project-${encodeURIComponent(id)}` : '';

    const title = escapeHtml(p?.title || '');
    const subtitle = escapeHtml(p?.subtitle || '');
    const body = normalizeBody(p)
      .map((t) => `<p>${escapeHtml(t)}</p>`)
      .join('');

    const accent = escapeHtml(p?.color || '#78f0ff');

    const disabled = isDisabled(p);
    const rawUrl = normalizeUrl(p);
    const linkLabel = escapeHtml(normalizeLabel(p));

    const href = !disabled ? new URL(rawUrl, window.location.href).toString() : '#';

    const linkAttrs = disabled
      ? 'href="#" aria-disabled="true" tabindex="-1" onclick="return false"'
      : `href="${href}"`;

    const buttonLabel = disabled
      ? (normalizeVisibility(p) === 'private' ? 'INTERNAL' : 'COMING SOON')
      : linkLabel;

    return `
      <article class="project-card" ${cardId ? `id="${cardId}"` : ''}>
        <div class="project-card-accent"
             style="background: linear-gradient(90deg, ${accent}, rgba(255,140,255,1));">
        </div>

        <h3 class="project-card-title">${title}</h3>
        ${subtitle ? `<p class="project-card-subtitle">${subtitle}</p>` : ''}

        <div class="project-card-body">${body}</div>

        ${id ? `<a ${linkAttrs} class="glow-btn">${escapeHtml(buttonLabel)}</a>` : ''}
      </article>
    `;
  }

  function renderProjects(publicProjects, privateProjects) {
    const gridPublic = document.getElementById(GRID_PUBLIC_ID);
    const gridPrivate = document.getElementById(GRID_PRIVATE_ID);

    if (!gridPublic || !gridPrivate) return;

    const pub = Array.isArray(publicProjects) ? publicProjects : [];
    const priv = Array.isArray(privateProjects) ? privateProjects : [];

    setPrivateSectionVisible(priv.length > 0);

    gridPublic.innerHTML = pub.map(createCard).join('');
    gridPrivate.innerHTML = priv.map(createCard).join('');

    // Hash deep-link: scroll to card (no redirect).
    const hash = window.location.hash || '';
    if (hash && hash.startsWith('#project-')) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.scrollBy({ top: -90, left: 0, behavior: 'auto' });
        }, 0);
      }
    }
  }

  async function loadYaml() {
    try {
      if (typeof jsyaml === 'undefined') {
        throw new Error('jsyaml is not loaded');
      }

      async function fetchYamlList(url, { optional } = { optional: false }) {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) {
          if (optional && (resp.status === 404 || resp.status === 410)) return null;
          throw new Error(`HTTP ${resp.status} for ${url}`);
        }
        const text = await resp.text();
        const parsed = jsyaml.load(text) || [];
        if (!Array.isArray(parsed)) {
          throw new Error(`${url} must contain a top-level list`);
        }
        return parsed;
      }

      const publicList = await fetchYamlList(YAML_PUBLIC_URL, { optional: true });
      const privateList = await fetchYamlList(YAML_PRIVATE_URL, { optional: true });

      if (publicList) {
        renderProjects(forceVisibility(publicList, 'public'), forceVisibility(privateList || [], 'private'));
        return;
      }

      const combined = await fetchYamlList(YAML_COMBINED_URL, { optional: false });
      const pub = combined.filter((p) => normalizeVisibility(p) === 'public');
      const priv = combined.filter((p) => normalizeVisibility(p) === 'private');
      renderProjects(pub, priv);
    } catch (err) {
      console.error('Error loading project catalog:', err);
      const gridPublic = document.getElementById(GRID_PUBLIC_ID);
      const gridPrivate = document.getElementById(GRID_PRIVATE_ID);
      if (gridPublic) {
        gridPublic.innerHTML =
          '<p class="section-lead">Could not load project catalog.</p>';
      }
      if (gridPrivate) gridPrivate.innerHTML = '';
      setPrivateSectionVisible(false);
    }
  }

  document.addEventListener('DOMContentLoaded', loadYaml);
})();
