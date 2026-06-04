// js/docs.js — sidebar builder + hash-router + KaTeX re-render

(function () {
  'use strict';

  const sidebar  = document.getElementById('doc-sidebar');
  const content  = document.getElementById('doc-content');
  const menuBtn  = document.getElementById('doc-menu-btn');
  let DOCS = Array.isArray(window.CALYR_DOCS) ? window.CALYR_DOCS : [];
  let flatPages = [];

  function rebuildFlatPages () {
    flatPages = DOCS.flatMap(s => s.pages.map(p => ({ ...p, section: s.id })));
  }

  async function loadDocsConfig () {
    const yamlUrl = 'data/docs.yaml?v=20260510-docs-yaml';

    function parseYaml (text) {
      if (!window.jsyaml || typeof window.jsyaml.load !== 'function') return null;
      const parsed = window.jsyaml.load(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.sections)) return parsed.sections;
      return null;
    }

    async function loadText (src) {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(String(res.status));
        return await res.text();
      } catch (err) {
        if (window.location.protocol !== 'file:') throw err;
        return await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', src, true);
          xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200 || xhr.status === 0) {
              resolve(xhr.responseText);
              return;
            }
            reject(new Error(String(xhr.status || 'Load failed')));
          };
          xhr.onerror = () => reject(new Error('Load failed'));
          xhr.send();
        });
      }
    }

    try {
      const text = await loadText(yamlUrl);
      const parsed = parseYaml(text);
      if (parsed) return parsed;
    } catch {
      // fall through to the compiled fallback below
    }

    return Array.isArray(window.CALYR_DOCS) ? window.CALYR_DOCS : [];
  }

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

  function isStandalonePage (src) {
    return typeof src === 'string' && src.startsWith('pages/');
  }

  function renderEmbeddedPage (page, navHtml) {
    content.innerHTML = `
      <div class="doc-article" style="padding:0;background:transparent;max-width:none">
        <iframe
          src="${page.src}"
          title="${page.title}"
          style="width:100%;min-height:78vh;border:1px solid rgba(126,237,255,0.14);border-radius:16px;background:rgba(5,12,24,0.45)"
          loading="eager"
        ></iframe>
      </div>
      ${navHtml}
    `;
  }

  function isMarkdownSource (src) {
    return typeof src === 'string' && /\.md(?:\?|#|$)/i.test(src);
  }

  function renderMarkdown (text) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(text);
    }
    return `<pre class="doc-code">${String(text).replace(/[&<>]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[match]))}</pre>`;
  }

  function ensureFoundingStyles () {
    if (document.getElementById('founding-checker-styles')) return;

    const style = document.createElement('style');
    style.id = 'founding-checker-styles';
    style.textContent = `
      .founding-layout {
        display: grid;
        gap: 2rem;
        grid-template-columns: minmax(0, 1fr) 320px;
        align-items: start;
      }

      .founding-main {
        min-width: 0;
      }

      .founding-checker {
        position: sticky;
        top: 1.5rem;
        padding: 1.1rem;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 16px;
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(10px);
      }

      .founding-checker-head {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        margin-bottom: 0.75rem;
      }

      .founding-donut {
        width: 76px;
        height: 76px;
        flex: 0 0 76px;
      }

      .founding-donut-track {
        fill: none;
        stroke: rgba(255,255,255,0.12);
        stroke-width: 9;
      }

      .founding-donut-progress {
        fill: none;
        stroke: #d4b06a;
        stroke-width: 9;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dashoffset 180ms ease;
      }

      .founding-donut-text {
        fill: rgba(255,255,255,0.92);
        font-size: 0.72rem;
        font-weight: 700;
        text-anchor: middle;
        dominant-baseline: middle;
      }

      .founding-checker h2 {
        margin-top: 0;
        font-size: 1.05rem;
      }

      .founding-progress-track {
        width: 100%;
        height: 0.7rem;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
        margin: 0.8rem 0 0.6rem;
      }

      .founding-progress-bar {
        height: 100%;
        width: 0;
        border-radius: 999px;
        background: linear-gradient(90deg, #d4b06a 0%, #e5d2a1 100%);
        transition: width 180ms ease;
      }

      .founding-progress-meta {
        margin: 0 0 1rem;
        color: rgba(255,255,255,0.72);
        font-size: 0.92rem;
      }

      .founding-phase-title {
        margin: 0;
        font-size: 0.85rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.62);
      }

      .founding-phase {
        margin-top: 0.95rem;
        padding: 0.75rem;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.09);
        background: rgba(255,255,255,0.02);
      }

      .founding-phase-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.7rem;
        margin-bottom: 0.55rem;
      }

      .founding-phase-status {
        font-size: 0.76rem;
        font-weight: 600;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        border: 1px solid rgba(255,255,255,0.25);
        color: rgba(255,255,255,0.86);
        background: rgba(255,255,255,0.06);
      }

      .founding-phase--open {
        border-color: rgba(230,80,80,0.42);
        background: rgba(230,80,80,0.07);
      }

      .founding-phase--open .founding-phase-status {
        border-color: rgba(230,80,80,0.46);
        background: rgba(230,80,80,0.17);
        color: rgba(255,210,210,0.98);
      }

      .founding-phase--inprogress {
        border-color: rgba(228,177,76,0.45);
        background: rgba(228,177,76,0.09);
      }

      .founding-phase--inprogress .founding-phase-status {
        border-color: rgba(228,177,76,0.48);
        background: rgba(228,177,76,0.18);
        color: rgba(255,244,211,0.98);
      }

      .founding-phase--done {
        border-color: rgba(81,187,113,0.45);
        background: rgba(81,187,113,0.09);
      }

      .founding-phase--done .founding-phase-status {
        border-color: rgba(81,187,113,0.5);
        background: rgba(81,187,113,0.19);
        color: rgba(223,255,232,0.98);
      }

      .founding-checklist {
        display: grid;
        gap: 0.75rem;
      }

      .founding-check-item {
        display: grid;
        grid-template-columns: 1.1rem 1fr;
        gap: 0.7rem;
        align-items: start;
        padding: 0.7rem 0.75rem;
        border-radius: 12px;
        background: rgba(255,255,255,0.03);
      }

      .founding-check-item input {
        margin-top: 0.2rem;
      }

      .founding-check-item strong {
        display: block;
        margin-bottom: 0.15rem;
      }

      .founding-check-item span {
        display: block;
        color: rgba(255,255,255,0.72);
        font-size: 0.9rem;
      }

      .founding-note {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: rgba(255,255,255,0.68);
      }

      @media (max-width: 980px) {
        .founding-layout {
          grid-template-columns: 1fr;
        }

        .founding-checker {
          position: static;
          order: -1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderFoundingChecker () {
    return `
      <aside class="founding-checker" aria-label="Founding Progress">
        <div class="founding-checker-head">
          <svg class="founding-donut" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="founding-donut-track" cx="50" cy="50" r="38"></circle>
            <circle class="founding-donut-progress" cx="50" cy="50" r="38" data-progress-donut></circle>
            <text class="founding-donut-text" x="50" y="51" data-progress-donut-label>0%</text>
          </svg>
          <div>
            <h2>Founding Checker</h2>
            <p class="founding-progress-meta"><strong data-progress-label>0%</strong> completed</p>
          </div>
        </div>

        <div class="founding-progress-track" aria-hidden="true">
          <div class="founding-progress-bar" data-progress-bar></div>
        </div>
        <div class="founding-progress-meta" data-progress-text>0 of 6 steps completed</div>

        <section class="founding-phase" data-phase="setup" data-phase-items="id-austria,gisa-route">
          <div class="founding-phase-head">
            <p class="founding-phase-title">Phase 1: Setup</p>
            <span class="founding-phase-status" data-phase-status>open</span>
          </div>
          <div class="founding-checklist">
            <label class="founding-check-item">
              <input type="checkbox" data-check-item="id-austria">
              <span>
                <strong>ID Austria active</strong>
                <span>Digital identity and login baseline are in place.</span>
              </span>
            </label>
            <label class="founding-check-item">
              <input type="checkbox" data-check-item="gisa-route">
              <span>
                <strong>GISA route confirmed</strong>
                <span>Direct filing path through the GISA server is available.</span>
              </span>
            </label>
          </div>
        </section>

        <section class="founding-phase" data-phase="filings" data-phase-items="gewerbe,finanzonline,svs">
          <div class="founding-phase-head">
            <p class="founding-phase-title">Phase 2: Filings</p>
            <span class="founding-phase-status" data-phase-status>open</span>
          </div>
          <div class="founding-checklist">
            <label class="founding-check-item">
              <input type="checkbox" data-check-item="gewerbe">
              <span>
                <strong>GISA filing submitted</strong>
                <span>The online trade registration has been filed through the GISA server.</span>
              </span>
            </label>
            <label class="founding-check-item">
              <input type="checkbox" data-check-item="finanzonline">
              <span>
                <strong>FinanzOnline configured</strong>
                <span>Access and tax registration setup are prepared.</span>
              </span>
            </label>
            <label class="founding-check-item">
              <input type="checkbox" data-check-item="svs">
              <span>
                <strong>SVS confirmed</strong>
                <span>Insurance and registration are completed digitally.</span>
              </span>
            </label>
          </div>
        </section>

        <section class="founding-phase" data-phase="start" data-phase-items="setup">
          <div class="founding-phase-head">
            <p class="founding-phase-title">Phase 3: Operational Start</p>
            <span class="founding-phase-status" data-phase-status>open</span>
          </div>
          <div class="founding-checklist">
            <label class="founding-check-item">
              <input type="checkbox" data-check-item="setup">
              <span>
                <strong>Operations ready</strong>
                <span>Banking, invoicing logic, and document flow are in place.</span>
              </span>
            </label>
          </div>
        </section>

        <p class="founding-note">Progress is stored locally in your browser. No personal data is required in this page content.</p>
      </aside>
    `;
  }

  function enhanceFoundingPage (entry) {
    if (!entry || entry.src !== 'docs/calyr_online_founding_en.md') return;

    ensureFoundingStyles();

    const nav = content.querySelector('.doc-nav-footer');
    if (!nav) return;

    const main = document.createElement('div');
    main.className = 'founding-main doc-article';

    let cursor = content.firstChild;
    while (cursor && cursor !== nav) {
      const next = cursor.nextSibling;
      main.appendChild(cursor);
      cursor = next;
    }

    const layout = document.createElement('div');
    layout.className = 'founding-layout';
    layout.setAttribute('data-gruendung-checker', '');
    layout.setAttribute('data-storage-key', 'calyr-online-founding-en');
    layout.setAttribute('data-phase-open-label', 'open');
    layout.setAttribute('data-phase-inprogress-label', 'in progress');
    layout.setAttribute('data-phase-done-label', 'done');
    layout.setAttribute('data-progress-template', '{completed} of {total} steps completed');

    layout.appendChild(main);
    layout.insertAdjacentHTML('beforeend', renderFoundingChecker());

    content.insertBefore(layout, nav);
  }

  async function fetchDocText (src) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      return await res.text();
    } catch (err) {
      // Safari can block fetch() on local file:// URLs. Fallback to XHR.
      if (window.location.protocol !== 'file:') throw err;
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;
          if (xhr.status === 200 || xhr.status === 0) {
            resolve(xhr.responseText);
            return;
          }
          reject(new Error(String(xhr.status || 'Load failed')));
        };
        xhr.onerror = () => reject(new Error('Load failed'));
        xhr.send();
      });
    }
  }

  function initFoundingChecker () {
    const checker = content.querySelector('[data-gruendung-checker]');
    if (!checker) return;

    const storageKey = checker.dataset.storageKey || 'founding-checker';
    const phaseOpenLabel = checker.dataset.phaseOpenLabel || 'offen';
    const phaseInprogressLabel = checker.dataset.phaseInprogressLabel || 'in Arbeit';
    const phaseDoneLabel = checker.dataset.phaseDoneLabel || 'erledigt';
    const progressTemplate = checker.dataset.progressTemplate || '{completed} von {total} Schritten erledigt';
    const inputs = Array.from(checker.querySelectorAll('[data-check-item]'));
    const phases = Array.from(checker.querySelectorAll('[data-phase]'));
    const progressBar = checker.querySelector('[data-progress-bar]');
    const progressLabel = checker.querySelector('[data-progress-label]');
    const progressText = checker.querySelector('[data-progress-text]');
    const progressDonut = checker.querySelector('[data-progress-donut]');
    const progressDonutLabel = checker.querySelector('[data-progress-donut-label]');

    if (progressDonut) {
      const radius = Number(progressDonut.getAttribute('r')) || 38;
      const circumference = 2 * Math.PI * radius;
      progressDonut.style.strokeDasharray = `${circumference}`;
      progressDonut.style.strokeDashoffset = `${circumference}`;
      progressDonut.dataset.circumference = String(circumference);
    }

    let saved = {};
    try {
      saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
    } catch {
      saved = {};
    }

    inputs.forEach(input => {
      input.checked = Boolean(saved[input.dataset.checkItem]);
      input.addEventListener('change', () => {
        const nextState = Object.fromEntries(
          inputs.map(entry => [entry.dataset.checkItem, entry.checked])
        );
        window.localStorage.setItem(storageKey, JSON.stringify(nextState));
        updateProgress();
      });
    });

    function updateProgress () {
      const completed = inputs.filter(input => input.checked).length;
      const total = inputs.length;
      const percent = total ? Math.round((completed / total) * 100) : 0;

      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressLabel) progressLabel.textContent = `${percent}%`;
      if (progressText) {
        progressText.textContent = progressTemplate
          .replace('{completed}', String(completed))
          .replace('{total}', String(total));
      }
      if (progressDonut && progressDonut.dataset.circumference) {
        const circumference = Number(progressDonut.dataset.circumference);
        const offset = circumference * (1 - percent / 100);
        progressDonut.style.strokeDashoffset = `${offset}`;
      }
      if (progressDonutLabel) progressDonutLabel.textContent = `${percent}%`;

      phases.forEach(phase => {
        const keys = (phase.dataset.phaseItems || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);

        if (!keys.length) return;

        const phaseInputs = keys
          .map(key => inputs.find(input => input.dataset.checkItem === key))
          .filter(Boolean);

        if (!phaseInputs.length) return;

        const phaseDone = phaseInputs.filter(input => input.checked).length;
        const phaseTotal = phaseInputs.length;

        let state = 'open';
        let label = phaseOpenLabel;
        if (phaseDone === phaseTotal) {
          state = 'done';
          label = phaseDoneLabel;
        } else if (phaseDone > 0) {
          state = 'inprogress';
          label = phaseInprogressLabel;
        }

        phase.classList.remove('founding-phase--open', 'founding-phase--inprogress', 'founding-phase--done');
        phase.classList.add(`founding-phase--${state}`);

        const status = phase.querySelector('[data-phase-status]');
        if (status) status.textContent = `${label} (${phaseDone}/${phaseTotal})`;
      });
    }

    updateProgress();
  }

  async function loadPage (entry) {
    const { section, page } = entry;

    setActive(section.id, page.id);
    const flat = { ...page, section: section.id };

    if (isStandalonePage(page.src)) {
      renderEmbeddedPage(page, renderNavFooter(flat));
      window.scrollTo(0, 0);
      return;
    }

    // resolve path relative to docs.html (which lives at homepage root)
    const src = page.src;

    let html;
    try {
      const text = await fetchDocText(src);
      if (isMarkdownSource(src)) {
        html = `<article class="doc-article">${renderMarkdown(text)}</article>`;
      } else {
        html = text;
      }
    } catch (e) {
      html = `<div class="doc-article"><p style="color:rgba(255,120,120,0.8)">
        Could not load <code>${src}</code> (${e.message}).</p>
        <p style="color:rgba(180,210,255,0.85)">If you are opening via <code>file://</code>, run a local server and open via <code>http://localhost</code>.</p>
      </div>`;
    }

    content.innerHTML = html + renderNavFooter(flat);
    enhanceFoundingPage(page);
    initFoundingChecker();

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
  (async function init () {
    DOCS = await loadDocsConfig();
    rebuildFlatPages();
    buildSidebar();
    setupSearch();
    navigate();
    window.addEventListener('hashchange', navigate);
  }());

}());
