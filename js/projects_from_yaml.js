// js/projects_from_yaml.js
(function () {
  'use strict';

  const GRID_ID = 'projects-grid';

  // ✅ Use an absolute URL resolved against the current page
  // This avoids base-path issues on GitHub Pages and subfolders.
  const YAML_URL = new URL('data/projects.yaml', window.location.href).toString();

  // Fallback projects in case YAML cannot be loaded
  const DEFAULT_PROJECTS = [
    {
      id: 'saxs-multistate',
      title: 'SAXS – Multi-State Structural Analysis',
      subtitle: 'Pair-distance distributions and browser-scale modes',
      description:
        'Pair-distance distributions, free-energy modes and browser-scale structural analysis based on orthogonal P(r) basis functions and PCA-driven state classification.',
      tags: ['SAXS', 'P(r)', 'multi-state', 'PCA'],
      link_label: 'Open SAXS viewer',
      link_url: 'saxs_viewer/index.html'
    }
  ];

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function createTagPills(tags) {
    if (!tags || !tags.length) return '';

    return `
      <div class="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
        ${tags
          .map(
            (t) => `
          <span class="inline-flex items-center px-2 py-1 rounded-full
                         border border-cyan-400/40 bg-slate-900/60
                         text-cyan-200">
            ${escapeHtml(t)}
          </span>`
          )
          .join('')}
      </div>
    `;
  }

  function createProjectCard(project) {
    const title       = project?.title ?? '';
    const subtitle    = project?.subtitle ?? '';
    const description = project?.description ?? '';
    const tags        = project?.tags ?? [];
    const disabled    = !!project?.disabled;

    // allow link_url: "#", "", null => treated as disabled
    const linkUrlRaw  = project?.link_url ?? '#';
    const linkLabel   = project?.link_label ?? 'More';

    const hasRealLink = !!linkUrlRaw && linkUrlRaw !== '#';
    const clickable   = !disabled && hasRealLink;

    // resolve relative links against the current page
    const safeLink = clickable
      ? new URL(linkUrlRaw, window.location.href).toString()
      : '#';

    const cardOpacity = disabled ? 'opacity-60' : 'opacity-100';
    const buttonClass = clickable
      ? `border-cyan-400/70 bg-slate-900/80 text-cyan-100 hover:bg-cyan-400 hover:text-slate-950`
      : `border-slate-600/60 bg-slate-900/40 text-slate-400 cursor-not-allowed`;

    const buttonAttrs = clickable
      ? `href="${safeLink}"`
      : `href="#" aria-disabled="true" tabindex="-1" onclick="return false"`;

    return `
      <article class="project-card rounded-3xl p-5 md:p-6
                      bg-slate-900/60 border border-cyan-400/25
                      shadow-[0_0_35px_rgba(34,211,238,0.25)]
                      flex flex-col justify-between min-h-[220px] ${cardOpacity}">
        <div>
          <h2 class="text-lg md:text-xl font-semibold mb-1">
            ${escapeHtml(title)}
          </h2>

          ${subtitle ? `<p class="text-sm text-cyan-200 mb-3">${escapeHtml(subtitle)}</p>` : ''}

          ${description ? `<p class="text-sm text-slate-200 leading-relaxed">${escapeHtml(description)}</p>` : ''}

          ${createTagPills(tags)}
        </div>

        <div class="mt-5">
          <a ${buttonAttrs}
             class="inline-flex items-center px-4 py-2 rounded-full
                    border ${buttonClass}
                    text-sm font-semibold transition-colors duration-150">
            ${escapeHtml(linkLabel)}
          </a>
        </div>
      </article>
    `;
  }

  function renderProjects(projects, grid) {
    if (!projects || !projects.length) {
      grid.innerHTML =
        '<p class="text-sm text-red-300">No projects defined in YAML.</p>';
      return;
    }
    grid.innerHTML = projects.map(createProjectCard).join('');
  }

  async function loadProjects() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    try {
      const resp = await fetch(YAML_URL, { cache: 'no-store' });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} for ${YAML_URL}`);
      }

      const text = await resp.text();

      if (typeof jsyaml === 'undefined') {
        throw new Error('jsyaml is not loaded – check CDN script tag.');
      }

      const parsed = jsyaml.load(text) || [];
      if (!Array.isArray(parsed)) {
        throw new Error('projects.yaml must contain a top-level list.');
      }

      renderProjects(parsed, grid);
    } catch (err) {
      console.error('Error loading projects.yaml, using fallback:', err);
      renderProjects(DEFAULT_PROJECTS, grid);
    }
  }

  document.addEventListener('DOMContentLoaded', loadProjects);
})();