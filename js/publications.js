// js/publications.js — publications renderer from YAML-generated data/publications.js

(function () {
  'use strict';

  var sidebar = document.getElementById('pub-sidebar');
  var main = document.getElementById('pub-main');
  var menuBtn = document.getElementById('pub-menu-btn');
  var DATA = window.CALYR_PUBLICATIONS || [];
  var NETWORK = window.CALYR_PUBLICATION_NETWORK || { title: 'Publication Network', subtitle: '', edges: [] };

  var TOPICS = [
    { id: 'spr', label: 'SPR' },
    { id: 'saxs', label: 'SAXS' }
  ];

  var STATUS_LABEL = { active: 'active', progress: 'in progress', staged: 'staged' };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function cpLink(pub) {
    if (!pub.doi) return '';
    var url = 'https://www.connectedpapers.com/main/' + encodeURIComponent(pub.doi);
    return '<a class="pub-cp-btn" href="' + url + '" target="_blank" rel="noopener" title="Explore in Connected Papers">' +
      '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
        '<circle cx="7" cy="2" r="1.5" fill="currentColor"/>' +
        '<circle cx="2" cy="11" r="1.5" fill="currentColor"/>' +
        '<circle cx="12" cy="11" r="1.5" fill="currentColor"/>' +
        '<circle cx="7" cy="7" r="1.25" fill="currentColor"/>' +
        '<line x1="7" y1="3.5" x2="7" y2="5.75" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="6" y1="7.8" x2="3" y2="9.8" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="8" y1="7.8" x2="11" y2="9.8" stroke="currentColor" stroke-width="1"/>' +
      '</svg>' +
      'Connected Papers</a>';
  }

  function archiveLink(pub) {
    var href = pub.archive_url;
    if (!href && pub.arxiv) href = 'https://arxiv.org/abs/' + encodeURIComponent(pub.arxiv);
    if (!href) return '';
    return '<a class="pub-detail-pdf" href="' + href + '" target="_blank" rel="noopener">archive</a>';
  }

  function renderTopNetwork() {
    return '<section class="pub-network-shell">' +
      '<div class="pub-network-head">' +
        '<div class="doc-subtitle">Nexus / Publications</div>' +
        '<h2 class="pub-network-title">' + escapeHtml(NETWORK.title || 'Publication Network') + '</h2>' +
        '<p class="pub-network-subtitle">' + escapeHtml(NETWORK.subtitle || '') + '</p>' +
      '</div>' +
      '<div class="pub-network-stage pub-graph-container" id="pub-network" aria-label="Publication network"></div>' +
    '</section>';
  }

  function renderAbstract(pub) {
    if (!pub.abstract) return '';
    return '<div class="pub-abstract-area"><p class="pub-abstract">' + escapeHtml(pub.abstract) + '</p></div>';
  }

  function buildSidebar() {
    sidebar.innerHTML = '';
    TOPICS.forEach(function (topic) {
      var pubs = DATA.filter(function (p) { return p.topic === topic.id; });
      if (!pubs.length) return;

      var wrap = document.createElement('div');
      wrap.className = 'doc-sidebar-section';
      wrap.dataset.topic = topic.id;

      var btn = document.createElement('button');
      btn.className = 'doc-section-toggle';
      btn.innerHTML = '<span>' + topic.label + '</span><span class="arrow">›</span>';

      var ul = document.createElement('ul');
      ul.className = 'doc-page-list';

      pubs.forEach(function (pub) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.className = 'doc-page-link';
        a.href = '#' + pub.id;
        a.textContent = pub.title;
        a.dataset.id = pub.id;
        li.appendChild(a);
        ul.appendChild(li);
      });

      btn.addEventListener('click', function () {
        var open = ul.classList.toggle('open');
        btn.classList.toggle('open', open);
      });

      wrap.appendChild(btn);
      wrap.appendChild(ul);
      sidebar.appendChild(wrap);
    });
  }

  function setActive(id) {
    document.querySelectorAll('.doc-page-link').forEach(function (a) {
      var active = a.dataset.id === id;
      a.classList.toggle('active', active);
      if (active) {
        var ul = a.closest('.doc-page-list');
        var btn = ul && ul.previousElementSibling;
        if (ul) ul.classList.add('open');
        if (btn) btn.classList.add('open');
      }
    });
  }

  function openPill(pub) {
    if (!pub.pdfs || !pub.pdfs.length) return '';
    var href = pub.pdfs[0].path;
    return '<a class="pub-open-pill" href="' + href + '" target="_blank" rel="noopener">open</a>';
  }

  function renderDetail(pub) {
    main.innerHTML =
      '<div class="doc-article pub-card-detail">' +
        '<p class="doc-subtitle">' + escapeHtml((pub.topic || '').toUpperCase()) + '</p>' +
        '<h1>' + escapeHtml(pub.title) + '</h1>' +
        '<div class="pub-badge-row">' +
          '<span class="pub-status pub-status--' + pub.status + '">' + escapeHtml(STATUS_LABEL[pub.status] || pub.status) + '</span>' +
          openPill(pub) +
          archiveLink(pub) +
        '</div>' +
        renderTopNetwork() +
        '<p class="pub-method">' + escapeHtml(pub.method || pub.description || '') + '</p>' +
        renderAbstract(pub) +
        ((pub.doi || pub.archive_url || pub.arxiv) ? '<div class="pub-detail-pdfs">' + archiveLink(pub) + (pub.doi ? cpLink(pub) : '') + '</div>' : '') +
      '</div>';
    window.calyrPubGraphs && window.calyrPubGraphs.refresh();
  }

  function renderOverview() {
    var sectionsHTML = TOPICS.map(function (topic) {
      var pubs = DATA.filter(function (p) { return p.topic === topic.id; });
      if (!pubs.length) return '';

      var cards = pubs.map(function (pub) {
        return '<div class="pub-method-card">' +
          '<div class="pub-card-top">' +
            '<a class="pub-card-title" href="#' + pub.id + '">' + escapeHtml(pub.title) + '</a>' +
            '<span class="pub-status pub-status--' + pub.status + '">' + escapeHtml(STATUS_LABEL[pub.status] || pub.status) + '</span>' +
            openPill(pub) +
            archiveLink(pub) +
          '</div>' +
          '<p class="pub-card-method">' + escapeHtml(pub.method || pub.description || '') + '</p>' +
          renderAbstract(pub) +
        '</div>';
      }).join('');

      return '<div class="pub-topic-group">' +
        '<h2 class="pub-topic-heading">' + escapeHtml(topic.label) + '</h2>' +
        cards +
      '</div>';
    }).join('');

    main.innerHTML =
      '<div class="doc-article">' +
        '<p class="doc-subtitle">Calyr.aí – Publications</p>' +
        '<h1>Manuscripts</h1>' +
        renderTopNetwork() +
        sectionsHTML +
      '</div>';
    window.calyrPubGraphs && window.calyrPubGraphs.refresh();
  }

  function navigate() {
    var id = window.location.hash.replace('#', '').trim();
    if (id) {
      var pub = DATA.find(function (p) { return p.id === id; });
      if (pub) {
        setActive(id);
        renderDetail(pub);
        return;
      }
    }
    renderOverview();
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () { sidebar.classList.toggle('open'); });
    sidebar.addEventListener('click', function (e) {
      if (e.target.classList.contains('doc-page-link')) sidebar.classList.remove('open');
    });
  }

  buildSidebar();
  navigate();
  document.dispatchEvent(new CustomEvent('calyr:publications-ready'));
  window.addEventListener('hashchange', navigate);

}());
