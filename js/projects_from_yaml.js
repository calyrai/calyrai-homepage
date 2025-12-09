// js/projects_from_yaml.js

(function () {
  'use strict';

  const GRID_ID = 'projects-grid';
  const YAML_URL = 'data/projects.yaml';

  // Fallback projects in case YAML cannot be loaded
  const DEFAULT_PROJECTS = [
    {
      id: 'saxs-multistate',
      title: 'SAXS – Multi-State Structural Analysis',
      subtitle: 'Pair-distance distributions and browser-scale modes',
      description:
        'Pair-distance distributions, free-energy modes and browser-scale structural analysis based on orthogonal P(r) basis functions and PCA-driven state classification.',
      tags: ['SAXS', 'P(r)', 'multi-state', 'PCA'],
      link_label: 'Open SAXS mode',
      link_url: 'saxs.html'
    }
  ];

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
            ${t}
          </span>`
          )
          .join('')}
      </div>
    `;
  }

  function createProjectCard(project) {
    const {
      title,
      subtitle,
      description,
      tags,
      link_label,
      link_url
    } = project;

    const safeLink = link_url || '#';
    const safeLabel = link_label || 'More';

    return `
      <article class="project-card rounded-3xl p-5 md:p-6
                      bg-slate-900/60 border border-cyan-400/25
                      shadow-[0_0_35px_rgba(34,211,238,0.25)]
                      flex flex-col justify-between min-h-[220px]">
        <div>
          <h2 class="text-lg md:text-xl font-semibold mb-1">
            ${title || ''}
          </h2>
          ${
            subtitle
              ? `<p class="text-sm text-cyan-200 mb-3">${subtitle}</p>`
              : ''
          }
          ${
            description
              ? `<p class="text-sm text-slate-200 leading-relaxed">${description}</p>`
              : ''
          }
          ${createTagPills(tags)}
        </div>

        <div class="mt-5">
          <a href="${safeLink}"
             class="inline-flex items-center px-4 py-2 rounded-full
                    border border-cyan-400/70 bg-slate-900/80
                    text-sm font-semibold text-cyan-100
                    hover:bg-cyan-400 hover:text-slate-950
                    transition-colors duration-150">
            ${safeLabel}
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
      // Try to load YAML file
      const resp = await fetch(YAML_URL);

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
      // Fallback to built-in projects so the page never looks empty
      renderProjects(DEFAULT_PROJECTS, grid);
    }
  }

  document.addEventListener('DOMContentLoaded', loadProjects);
})();
