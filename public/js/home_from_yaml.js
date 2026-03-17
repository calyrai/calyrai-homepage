// js/home_from_yaml.js
// Loads data/home.yaml and renders the homepage "Architecture" section.

(function () {
  'use strict';

  const ROOT_ID = 'home-architecture';
  const YAML_URL = new URL('data/home.yaml', window.location.href).toString();

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderList(items) {
    if (!items || !items.length) return '';
    return `<ul class="home-arch-bullets">${items
      .map((t) => `<li>${escapeHtml(t)}</li>`)
      .join('')}</ul>`;
  }

  function renderStack(stack) {
    if (!stack || !stack.length) return '';

    return `<ol class="home-arch-stack">${stack
      .map((step) => {
        const name = escapeHtml(step?.name);
        const desc = escapeHtml(step?.desc);
        const examples = Array.isArray(step?.examples) ? step.examples : [];
        const note = step?.note ? `<div class="home-arch-note">${escapeHtml(step.note)}</div>` : '';

        return `
          <li class="home-arch-step">
            <div class="home-arch-step-head">
              <span class="home-arch-step-name">${name}</span>
            </div>
            ${desc ? `<div class="home-arch-step-desc">${desc}</div>` : ''}
            ${examples.length ? `<div class="home-arch-step-examples">${renderList(examples)}</div>` : ''}
            ${note}
          </li>
        `;
      })
      .join('')}</ol>`;
  }

  function renderArchitecture(data) {
    const arch = data?.architecture;
    if (!arch) return '';

    const title = escapeHtml(arch?.title || 'Architecture');
    const lead = escapeHtml(arch?.lead || '');

    const stackTitle = escapeHtml(arch?.stack_title || 'Stack');
    const stack = Array.isArray(arch?.stack) ? arch.stack : [];

    const principlesTitle = escapeHtml(arch?.principles_title || 'Principles');
    const principles = Array.isArray(arch?.principles) ? arch.principles : [];

    return `
      <div class="home-arch-inner">
        <h2 class="home-arch-title">${title}</h2>
        ${lead ? `<p class="home-arch-lead">${lead}</p>` : ''}

        <h3 class="home-arch-h3">${stackTitle}</h3>
        ${renderStack(stack)}

        ${principles.length ? `<h3 class="home-arch-h3">${principlesTitle}</h3>` : ''}
        ${principles.length ? renderList(principles) : ''}
      </div>
    `;
  }

  async function loadHomeYaml() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    try {
      const resp = await fetch(YAML_URL, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${YAML_URL}`);

      const text = await resp.text();
      if (typeof jsyaml === 'undefined') {
        throw new Error('jsyaml is not loaded');
      }

      const parsed = jsyaml.load(text) || {};
      root.innerHTML = renderArchitecture(parsed);
    } catch (err) {
      console.error('Error loading home.yaml:', err);
      root.innerHTML =
        '<div class="home-arch-inner"><p class="home-arch-error">Architecture content could not be loaded.</p></div>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadHomeYaml);
})();
