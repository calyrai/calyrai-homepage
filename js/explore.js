(function () {
  'use strict';

  const sidebar = document.getElementById('explore-sidebar');
  const content = document.getElementById('explore-content');
  const EXPLORE = window.CALYR_EXPLORE;

  if (!sidebar || !content || !EXPLORE) return;

  const flatPages = EXPLORE.flatMap(section => section.pages.map(page => ({ ...page, section: section.id })));

  function buildSidebar() {
    EXPLORE.forEach(section => {
      const wrap = document.createElement('div');
      wrap.className = 'doc-sidebar-section';
      wrap.dataset.section = section.id;

      const btn = document.createElement('button');
      btn.className = 'doc-section-toggle' + (section.alwaysOpen ? ' open' : '');
      btn.innerHTML = `<span>${section.title}</span><span class="arrow">›</span>`;
      if (section.alwaysOpen) btn.setAttribute('aria-disabled', 'true');

      const ul = document.createElement('ul');
      ul.className = 'doc-page-list' + (section.alwaysOpen ? ' open' : '');

      section.pages.forEach(page => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'doc-page-link';
        a.href = `#${section.id}/${page.id}`;
        a.textContent = page.title;
        a.dataset.section = section.id;
        a.dataset.page = page.id;
        li.appendChild(a);
        ul.appendChild(li);
      });

      if (!section.alwaysOpen) {
        btn.addEventListener('click', () => {
          const open = ul.classList.toggle('open');
          btn.classList.toggle('open', open);
        });
      }

      wrap.appendChild(btn);
      wrap.appendChild(ul);
      sidebar.appendChild(wrap);
    });
  }

  function parseHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) return null;
    const [sectionId, pageId] = hash.split('/');
    const section = EXPLORE.find(entry => entry.id === sectionId);
    if (!section) return null;
    const page = section.pages.find(entry => entry.id === pageId);
    return page ? { section, page } : null;
  }

  function defaultPage() {
    return { section: EXPLORE[0], page: EXPLORE[0].pages[0] };
  }

  function setActive(sectionId, pageId) {
    sidebar.querySelectorAll('.doc-page-link').forEach(link => {
      const active = link.dataset.section === sectionId && link.dataset.page === pageId;
      link.classList.toggle('active', active);
    });

    sidebar.querySelectorAll('.doc-sidebar-section').forEach(wrap => {
      if (wrap.dataset.section !== sectionId) return;
      const section = EXPLORE.find(entry => entry.id === sectionId);
      const list = wrap.querySelector('.doc-page-list');
      const button = wrap.querySelector('.doc-section-toggle');
      if (list) list.classList.add('open');
      if (button) button.classList.add('open');
      if (section && section.alwaysOpen && button) button.setAttribute('aria-disabled', 'true');
    });
  }

  function renderNavFooter(page) {
    const index = flatPages.findIndex(entry => entry.id === page.id && entry.section === page.section);
    const prev = flatPages[index - 1] || null;
    const next = flatPages[index + 1] || null;

    const prevHTML = prev
      ? `<a class="doc-nav-btn prev" href="#${prev.section}/${prev.id}"><span class="doc-nav-label">← Previous</span><span>${prev.title}</span></a>`
      : '<span></span>';

    const nextHTML = next
      ? `<a class="doc-nav-btn next" href="#${next.section}/${next.id}"><span class="doc-nav-label">Next →</span><span>${next.title}</span></a>`
      : '<span></span>';

    return `<div class="doc-nav-footer">${prevHTML}${nextHTML}</div>`;
  }

  function initEmbeddedFullscreen() {
    content.querySelectorAll('[data-fullscreen-target]').forEach(button => {
      if (button.dataset.fullscreenBound === 'true') return;
      button.dataset.fullscreenBound = 'true';

      var targetId = button.getAttribute('data-fullscreen-target');
      var target = targetId ? content.querySelector('#' + targetId) : null;
      var iframe = target ? target.querySelector('iframe') : null;
      if (!target) return;

      function getEmbeddedApi() {
        try {
          return iframe && iframe.contentWindow ? iframe.contentWindow.__calyrPresentation || null : null;
        } catch (error) {
          return null;
        }
      }

      function isFullscreen() {
        var embeddedApi = getEmbeddedApi();
        if (embeddedApi && typeof embeddedApi.isFullscreen === 'function') {
          return embeddedApi.isFullscreen();
        }
        return document.fullscreenElement === target || document.webkitFullscreenElement === target;
      }

      function updateLabel() {
        button.textContent = isFullscreen() ? 'Exit Fullscreen' : 'Fullscreen';
      }

      button.addEventListener('click', async function () {
        var embeddedApi = getEmbeddedApi();
        if (embeddedApi && typeof embeddedApi.toggleFullscreen === 'function') {
          await embeddedApi.toggleFullscreen();
          updateLabel();
          return;
        }

        if (isFullscreen()) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
          updateLabel();
          return;
        }

        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          target.webkitRequestFullscreen();
        }
        updateLabel();
      });

      document.addEventListener('fullscreenchange', updateLabel);
      document.addEventListener('webkitfullscreenchange', updateLabel);
      window.addEventListener('message', function (event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data || event.data.type !== 'calyr-presentation-fullscreen') return;
        updateLabel();
      });
      if (iframe) {
        iframe.addEventListener('load', updateLabel);
      }
      updateLabel();
    });
  }

  async function loadPage(entry) {
    const { section, page } = entry;
    setActive(section.id, page.id);

    let html;
    try {
      const response = await fetch(page.src);
      if (!response.ok) throw new Error(response.status);
      html = await response.text();
    } catch (error) {
      html = `<div class="doc-article"><p style="color:rgba(255,120,120,0.8)">Could not load <code>${page.src}</code> (${error.message}).</p></div>`;
    }

    const flat = { ...page, section: section.id };
    content.innerHTML = html + renderNavFooter(flat);
    initEmbeddedFullscreen();

    if (window.renderMathInElement) {
      renderMathInElement(content, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }

    window.scrollTo(0, 0);
  }

  function buildSearchIndex() {
    return EXPLORE.flatMap(section =>
      section.pages.map(page => ({
        sectionId: section.id,
        sectionTitle: section.title,
        pageId: page.id,
        title: page.title,
        href: `#${section.id}/${page.id}`
      }))
    );
  }

  function setupSearch() {
    const index = buildSearchIndex();

    const wrap = document.createElement('div');
    wrap.className = 'doc-search-wrap';
    wrap.innerHTML = `
      <div class="doc-search-label">Search Explore</div>
      <input id="explore-search" class="doc-search-input" placeholder="Search overview and presentations" autocomplete="off" spellcheck="false" />
      <ul id="explore-search-results" class="doc-search-results"></ul>
    `;
    sidebar.prepend(wrap);

    const input = wrap.querySelector('#explore-search');
    const results = wrap.querySelector('#explore-search-results');
    let focusedIndex = -1;

    function clearSearch() {
      input.value = '';
      results.innerHTML = '';
      results.classList.remove('open');
      focusedIndex = -1;
      sidebar.querySelectorAll('.doc-sidebar-section').forEach(entry => {
        entry.style.display = '';
      });
    }

    function query(raw) {
      const value = raw.trim().toLowerCase();
      if (!value) return [];
      return index.filter(entry =>
        entry.title.toLowerCase().includes(value) ||
        entry.sectionTitle.toLowerCase().includes(value) ||
        entry.href.toLowerCase().includes(value)
      ).slice(0, 12);
    }

    function renderResults(matches) {
      focusedIndex = -1;
      if (!matches.length) {
        results.innerHTML = '<li class="doc-search-empty">No results</li>';
        results.classList.add('open');
        return;
      }
      results.innerHTML = matches.map((match, index) =>
        `<li class="doc-search-result" data-href="${match.href}" data-idx="${index}"><span class="doc-search-title">${match.title}</span><span class="doc-search-section">${match.sectionTitle}</span></li>`
      ).join('');
      results.classList.add('open');
      results.querySelectorAll('.doc-search-result').forEach(item => {
        item.addEventListener('mousedown', event => {
          event.preventDefault();
          window.location.hash = item.dataset.href.slice(1);
          clearSearch();
        });
      });
    }

    function moveFocus(direction) {
      const items = results.querySelectorAll('.doc-search-result');
      if (!items.length) return;
      if (focusedIndex >= 0) items[focusedIndex].classList.remove('focused');
      focusedIndex = (focusedIndex + direction + items.length) % items.length;
      items[focusedIndex].classList.add('focused');
      items[focusedIndex].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', () => {
      if (!input.value.trim()) {
        clearSearch();
        return;
      }
      sidebar.querySelectorAll('.doc-sidebar-section').forEach(entry => {
        entry.style.display = 'none';
      });
      renderResults(query(input.value));
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveFocus(1);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocus(-1);
      }
      if (event.key === 'Escape') {
        clearSearch();
        input.blur();
      }
      if (event.key === 'Enter') {
        const hit = results.querySelector('.doc-search-result.focused');
        if (hit) {
          window.location.hash = hit.dataset.href.slice(1);
          clearSearch();
        }
      }
    });
  }

  function navigate() {
    const entry = parseHash() || defaultPage();
    loadPage(entry);
  }

  buildSidebar();
  setupSearch();
  navigate();
  window.addEventListener('hashchange', navigate);
})();