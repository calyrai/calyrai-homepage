// js/collect_hearts.js
// Adds a cyan heart toggle to marked interactive visuals (data-collect-id).
// Stores a small "collection" on this device via localStorage.

(function () {
  'use strict';

  const STORAGE_KEY = 'calyr.collection.v1';

  function safeParseJson(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function loadCollection() {
    const raw = window.localStorage?.getItem(STORAGE_KEY) || '';
    const parsed = safeParseJson(raw, { items: {} });
    if (!parsed || typeof parsed !== 'object') return { items: {} };
    const items = parsed.items && typeof parsed.items === 'object' ? parsed.items : {};
    return { items };
  }

  function saveCollection(state) {
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore (private mode / full storage)
    }
  }

  function isCollected(state, id) {
    return !!state?.items?.[id];
  }

  function buildHrefForElement(el) {
    const url = new URL(window.location.href);
    // Canonicalize: avoid persisting redundant query params in deep links.
    url.search = '';
    const id = el && el.id ? String(el.id) : '';
    if (id) url.hash = id;
    return url.toString();
  }

  function ensurePositioned(el) {
    if (!el) return;
    const pos = window.getComputedStyle(el).position;
    if (!pos || pos === 'static') {
      el.style.position = 'relative';
    }
  }

  function findAnchorContainer(el) {
    const anchor = (el?.getAttribute && el.getAttribute('data-collect-anchor')) || '';
    if (anchor === 'self' && el instanceof HTMLElement) return el;

    // For container demos (e.g. a DIV that holds an interactive scene),
    // anchor the heart within the element itself.
    if (el instanceof HTMLElement) {
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'div' || tag === 'figure') return el;
    }

    // Prefer offsetParent (respects positioned containers).
    // Fallback to parentElement.
    const container = el?.offsetParent || el?.parentElement;
    return container instanceof HTMLElement ? container : null;
  }

  function setHeartUI(btn, collected) {
    btn.classList.toggle('is-collected', collected);
    btn.setAttribute('aria-pressed', collected ? 'true' : 'false');
    btn.title = collected ? 'Collected' : 'Collect';
  }

  function makeHeartButton({ id, title }) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'collect-heart-btn';
    btn.setAttribute('data-collect-heart', 'true');
    btn.setAttribute('data-collect-id', id);
    if (title) btn.setAttribute('data-collect-title', title);
    btn.setAttribute('aria-label', title ? `Collect: ${title}` : 'Collect');
    btn.innerHTML = '<span aria-hidden="true">♥</span>';
    return btn;
  }

  function attachHearts() {
    const collectables = Array.from(document.querySelectorAll('[data-collect-id]'))
      .filter((el) => el instanceof HTMLElement || el instanceof SVGElement);

    const state = loadCollection();

    for (const el of collectables) {
      const collectId = (el.getAttribute('data-collect-id') || '').trim();
      if (!collectId) continue;

      // Avoid duplicating if templates/scripts are included twice.
      if (el.getAttribute('data-collect-heart-attached') === 'true') continue;
      el.setAttribute('data-collect-heart-attached', 'true');

      const title = (el.getAttribute('data-collect-title') || '').trim();
      const container = findAnchorContainer(el);
      if (!container) continue;

      // Don't add a second heart if the container already has one for this id.
      const existing = Array.from(container.querySelectorAll('.collect-heart-btn'))
        .some((b) => (b.getAttribute('data-collect-id') || '') === collectId);
      if (existing) continue;

      ensurePositioned(container);

      const btn = makeHeartButton({ id: collectId, title });
      setHeartUI(btn, isCollected(state, collectId));

      btn.addEventListener('click', () => {
        const current = loadCollection();
        const collected = isCollected(current, collectId);

        if (collected) {
          delete current.items[collectId];
        } else {
          current.items[collectId] = {
            id: collectId,
            title: title || collectId,
            href: buildHrefForElement(el),
            ts: Date.now(),
          };
        }

        saveCollection(current);
        setHeartUI(btn, !collected);
        renderCollectionList();
      });

      container.appendChild(btn);
    }

    renderCollectionList();
  }

  function renderCollectionList() {
    const host = document.getElementById('collection-list');
    if (!host) return;

    const state = loadCollection();
    const itemsObj = state.items || {};
    const items = Object.values(itemsObj)
      .filter((v) => v && typeof v === 'object')
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    if (!items.length) {
      host.innerHTML = '<div class="collection-empty">No items collected yet.</div>';
      return;
    }

    host.innerHTML = `
      <ul class="collection-list-ul">
        ${items
          .map((it) => {
            const t = String(it.title || it.id || 'Item');
            const href = String(it.href || '#');
            return `<li class="collection-item"><a class="collection-link" href="${href}">${t}</a></li>`;
          })
          .join('')}
      </ul>
    `;
  }

  document.addEventListener('DOMContentLoaded', attachHearts);
})();
