// js/docs.js — sidebar builder + hash-router + KaTeX re-render

(function () {
  'use strict';

  const sidebar  = document.getElementById('doc-sidebar');
  const content  = document.getElementById('doc-content');
  const menuBtn  = document.getElementById('doc-menu-btn');
  const DOCS     = window.CALYR_DOCS;

  /* ── Flat page list for prev/next ─────────────────────────── */
  const flatPages = DOCS.flatMap(s => s.pages.map(p => ({ ...p, section: s.id })));

  /* ── Build sidebar ────────────────────────────────────────── */
  function buildSidebar () {
    DOCS.forEach(section => {
      const wrap   = document.createElement('div');
      wrap.className = 'doc-sidebar-section';
      wrap.dataset.section = section.id;

      const btn = document.createElement('button');
      btn.className = 'doc-section-toggle';
      btn.innerHTML = `<span>${section.title}</span><span class="arrow">›</span>`;

      const ul = document.createElement('ul');
      ul.className = 'doc-page-list';

      section.pages.forEach(page => {
        const li = document.createElement('li');
        const a  = document.createElement('a');
        a.className = 'doc-page-link';
        a.href      = `#${section.id}/${page.id}`;
        a.textContent = page.title;
        a.dataset.section = section.id;
        a.dataset.page    = page.id;
        li.appendChild(a);
        ul.appendChild(li);
      });

      btn.addEventListener('click', () => {
        const open = ul.classList.toggle('open');
        btn.classList.toggle('open', open);
      });

      wrap.appendChild(btn);
      wrap.appendChild(ul);
      sidebar.appendChild(wrap);
    });
  }

  /* ── Routing ──────────────────────────────────────────────── */
  function parseHash () {
    const h = window.location.hash.replace('#', '').trim();
    if (!h) return null;
    const [sectionId, pageId] = h.split('/');
    const section = DOCS.find(s => s.id === sectionId);
    if (!section) return null;
    const page = section.pages.find(p => p.id === pageId);
    return page ? { section, page } : null;
  }

  function defaultPage () {
    return { section: DOCS[0], page: DOCS[0].pages[0] };
  }

  function setActive (sectionId, pageId) {
    document.querySelectorAll('.doc-page-link').forEach(a => {
      const active = a.dataset.section === sectionId && a.dataset.page === pageId;
      a.classList.toggle('active', active);
    });

    // open the correct section panel
    document.querySelectorAll('.doc-sidebar-section').forEach(wrap => {
      if (wrap.dataset.section === sectionId) {
        const ul  = wrap.querySelector('.doc-page-list');
        const btn = wrap.querySelector('.doc-section-toggle');
        ul.classList.add('open');
        btn.classList.add('open');
      }
    });
  }

  function renderNavFooter (page) {
    const idx  = flatPages.findIndex(p => p.id === page.id && p.section === page.section);
    const prev = flatPages[idx - 1] || null;
    const next = flatPages[idx + 1] || null;

    const prevHTML = prev
      ? `<a class="doc-nav-btn prev" href="#${prev.section}/${prev.id}">
           <span class="doc-nav-label">← Previous</span>
           <span>${prev.title}</span>
         </a>`
      : '<span></span>';

    const nextHTML = next
      ? `<a class="doc-nav-btn next" href="#${next.section}/${next.id}">
           <span class="doc-nav-label">Next →</span>
           <span>${next.title}</span>
         </a>`
      : '<span></span>';

    return `<div class="doc-nav-footer">${prevHTML}${nextHTML}</div>`;
  }

  async function loadPage (entry) {
    const { section, page } = entry;

    setActive(section.id, page.id);

    // resolve path relative to docs.html (which lives at homepage root)
    const src = page.src;

    let html;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(res.status);
      html = await res.text();
    } catch (e) {
      html = `<div class="doc-article"><p style="color:rgba(255,120,120,0.8)">
        Could not load <code>${src}</code> (${e.message}).</p></div>`;
    }

    const flat = { ...page, section: section.id };
    content.innerHTML = html + renderNavFooter(flat);

    // KaTeX re-render
    if (window.renderMathInElement) {
      renderMathInElement(content, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$',  right: '$',  display: false }
        ]
      });
    }

    content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function navigate () {
    const entry = parseHash() || defaultPage();
    loadPage(entry);
  }

  /* ── Search ────────────────────────────────────────────────── */
  function buildSearchIndex () {
    return DOCS.flatMap(s =>
      s.pages.map(p => ({
        sectionId:    s.id,
        sectionTitle: s.title.replace(/^—\s*/, ''),
        pageId:       p.id,
        title:        p.title,
        href:         `#${s.id}/${p.id}`
      }))
    );
  }

  function setupSearch () {
    const index = buildSearchIndex();

    const wrap = document.createElement('div');
    wrap.className = 'doc-search-wrap';
    wrap.innerHTML = `
      <div class="doc-search-label">Search Docs</div>
      <input id="doc-search" class="doc-search-input"
             placeholder="Search docs, sections, and routes"
             autocomplete="off" spellcheck="false" />
      <ul id="doc-search-results" class="doc-search-results"></ul>
    `;
    sidebar.prepend(wrap);

    const input   = wrap.querySelector('#doc-search');
    const results = wrap.querySelector('#doc-search-results');
    let focusedIdx = -1;

    function query (raw) {
      const q = raw.trim().toLowerCase();
      if (!q) return [];
      return index.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.sectionTitle.toLowerCase().includes(q) ||
        e.href.toLowerCase().includes(q)
      ).slice(0, 12);
    }

    function renderResults (matches) {
      focusedIdx = -1;
      if (!matches.length) {
        results.innerHTML = '<li class="doc-search-empty">No results</li>';
        results.classList.add('open');
        return;
      }
      results.innerHTML = matches.map((m, i) =>
        `<li class="doc-search-result" data-href="${m.href}" data-idx="${i}">
           <span class="doc-search-title">${m.title}</span>
           <span class="doc-search-section">${m.sectionTitle}</span>
         </li>`
      ).join('');
      results.classList.add('open');
      results.querySelectorAll('.doc-search-result').forEach(li => {
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          window.location.hash = li.dataset.href.slice(1);
          clearSearch();
        });
      });
    }

    function clearSearch () {
      input.value = '';
      results.innerHTML = '';
      results.classList.remove('open');
      focusedIdx = -1;
      sidebar.querySelectorAll('.doc-sidebar-section')
             .forEach(el => (el.style.display = ''));
    }

    function moveFocus (dir) {
      const items = results.querySelectorAll('.doc-search-result');
      if (!items.length) return;
      if (focusedIdx >= 0) items[focusedIdx].classList.remove('focused');
      focusedIdx = (focusedIdx + dir + items.length) % items.length;
      items[focusedIdx].classList.add('focused');
      items[focusedIdx].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', () => {
      const val = input.value;
      if (!val.trim()) { clearSearch(); return; }
      sidebar.querySelectorAll('.doc-sidebar-section')
             .forEach(el => (el.style.display = 'none'));
      renderResults(query(val));
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown')  { e.preventDefault(); moveFocus(+1); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); moveFocus(-1); }
      if (e.key === 'Escape')     { clearSearch(); input.blur(); }
      if (e.key === 'Enter') {
        const hit = results.querySelector('.doc-search-result.focused');
        if (hit) { window.location.hash = hit.dataset.href.slice(1); clearSearch(); }
      }
    });
  }

  /* ── Mobile sidebar toggle ────────────────────────────────── */
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    // close on link click (mobile)
    sidebar.addEventListener('click', e => {
      if (e.target.classList.contains('doc-page-link')) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  buildSidebar();
  setupSearch();
  navigate();
  window.addEventListener('hashchange', navigate);

}());
