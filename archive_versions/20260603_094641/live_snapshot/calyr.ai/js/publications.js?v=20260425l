// js/publications.js — publications renderer from YAML-generated data/publications.js

(function () {
  'use strict';

  var sidebar = document.getElementById('pub-sidebar');
  var main = document.getElementById('pub-main');
  var menuBtn = document.getElementById('pub-menu-btn');
  var RAW_DATA = window.CALYR_PUBLICATIONS || [];
  function isPublished(pub) {
    if (!pub || typeof pub !== 'object') return false;
    if (pub.published === true) return true;
    var release = String(pub.release || pub.visibility || '').trim().toLowerCase();
    return release === 'published' || release === 'public';
  }
  var DATA = RAW_DATA.filter(isPublished);
  var NETWORK = window.CALYR_PUBLICATION_NETWORK || { title: 'Publication Network', subtitle: '', edges: [] };

  var TOPICS = [
    { id: 'nexus', label: 'Nexus' },
    { id: 'spr', label: 'SPR' },
    { id: 'saxs', label: 'SAS' },
    { id: 'purification', label: 'Thoughts on Purification' },
    { id: 'redhuman', label: 'RED HUMAN' }
  ];

  var TOPIC_LABEL = TOPICS.reduce(function (acc, topic) {
    acc[topic.id] = topic.label;
    return acc;
  }, {});

  function sortedTopics() {
    return TOPICS.slice().sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
  }

  function sortedPubsByTitle(pubs) {
    return pubs.slice().sort(function (a, b) {
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
  }

  var STATUS_LABEL = { active: 'active', progress: 'in progress', staged: 'staged' };

  function normalizeStatus(status) {
    var value = String(status || '').trim().toLowerCase();
    if (value === 'in progress' || value === 'in-progress') return 'progress';
    if (value === 'active' || value === 'progress' || value === 'staged') return value;
    return 'progress';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function normalizeTerminology(value) {
    return String(value == null ? '' : value).replace(/\bSAXS\b/g, 'SAS');
  }

  function text(value) {
    return escapeHtml(normalizeTerminology(value));
  }

  function byId(id) {
    return DATA.find(function (pub) { return pub.id === id; }) || null;
  }

  function primaryDateValue(pub) {
    return Date.parse(pub && (pub.updated_at || pub.date || pub.created_at) || '') || 0;
  }

  function pickFeaturedPublication() {
    if (!DATA.length) return null;
    return DATA.slice().sort(function (a, b) {
      function score(pub) {
        var s = 0;
        var hay = (pub.title || '') + ' ' + (pub.method || '') + ' ' + (pub.description || '');
        if (/ai|orchestrated|semantic|runtime/i.test(hay)) s += 4;
        if (/structural|biology|sbpa|nexus/i.test(hay)) s += 3;
        if (pub.doi) s += 2;
        if (normalizeStatus(pub.status) === 'active') s += 3;
        if (pub.pdfs && pub.pdfs.length) s += 1;
        s += primaryDateValue(pub) / 100000000000000;
        return s;
      }
      var diff = score(b) - score(a);
      if (diff) return diff;
      return String(a.title || '').localeCompare(String(b.title || ''));
    })[0];
  }

  function pickLatest(limit) {
    return DATA.slice().sort(function (a, b) {
      var dateDiff = primaryDateValue(b) - primaryDateValue(a);
      if (dateDiff) return dateDiff;
      return String(a.title || '').localeCompare(String(b.title || ''));
    }).slice(0, limit);
  }

  function pickSectionItems(config) {
    var items = DATA.filter(config.filterFn);
    return items.slice(0, config.max || items.length);
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

  function isPdfPath(path) {
    return typeof path === 'string' && /\.pdf(?:[#?].*)?$/i.test(path);
  }

  function primaryOpenLink(pub) {
    if (!pub.pdfs || !pub.pdfs.length) return '';
    if (!pub.doi && !pub.allow_local_preview) return '';
    var link = pub.pdfs[0];
    var label = link.label || 'open';
    return '<a class="pub-open-pill" href="' + link.path + '" target="_blank" rel="noopener">' + escapeHtml(label) + '</a>';
  }

  function renderAssetLinks(pub) {
    if (!pub.doi && !pub.allow_local_preview) return '';
    var links = [];
    if (pub.pdfs && pub.pdfs.length) {
      pub.pdfs.forEach(function (pdf) {
        links.push('<a class="pub-detail-pdf" href="' + pdf.path + '" target="_blank" rel="noopener">' + escapeHtml(pdf.label || 'open') + '</a>');
      });
    }
    var archive = archiveLink(pub);
    if (archive) links.push(archive);
    if (pub.doi) links.push(cpLink(pub));
    return links.length ? '<div class="pub-detail-pdfs">' + links.join('') + '</div>' : '';
  }

  function renderPdfPreview(pub) {
    if (!pub.doi && !pub.allow_local_preview) return '';
    if (!pub.pdfs || !pub.pdfs.length) return '';
    var primary = pub.pdfs[0];
    if (!primary || !primary.path) return '';
    if (isPdfPath(primary.path)) {
      return '<section class="pub-preview-shell">' +
        '<div class="pub-preview-head">PDF preview</div>' +
        '<iframe class="pub-preview-frame" src="' + primary.path + '#view=FitH" title="' + escapeHtml(pub.title) + ' PDF preview" loading="lazy"></iframe>' +
        '<p class="pub-preview-note">If the preview does not load, open the <a href="' + primary.path + '" target="_blank" rel="noopener">PDF directly</a>.</p>' +
      '</section>';
    }
    return '<section class="pub-preview-shell">' +
      '<div class="pub-preview-head">Interactive preview</div>' +
      '<iframe class="pub-preview-frame" src="' + primary.path + '" title="' + escapeHtml(pub.title) + ' interactive preview" loading="lazy"></iframe>' +
      '<p class="pub-preview-note">Open the interactive page directly: <a href="' + primary.path + '" target="_blank" rel="noopener">launch workspace</a>.</p>' +
    '</section>';
  }

  function renderTopNetwork() {
    return '<section class="pub-network-shell">' +
      '<div class="pub-network-head">' +
        '<div class="doc-subtitle">Nexus / Publications</div>' +
        '<h2 class="pub-network-title">' + text(NETWORK.title || 'Publication Network') + '</h2>' +
        '<p class="pub-network-subtitle">' + text(NETWORK.subtitle || '') + '</p>' +
      '</div>' +
      '<div class="pub-network-stage pub-graph-container" id="pub-network" aria-label="Publication network"></div>' +
    '</section>';
  }

  function renderAbstract(pub) {
    if (!pub.abstract) return '';
    return '<div class="pub-abstract-area"><p class="pub-abstract">' + text(pub.abstract) + '</p></div>';
  }

  function renderEditorialCard(pub, mode) {
    var status = normalizeStatus(pub.status);
    var cardClass = mode === 'lead' ? 'pub-editorial-card pub-editorial-card--lead' : 'pub-editorial-card';
    return '<article class="' + cardClass + '">' +
      '<div class="pub-card-top">' +
        '<a class="pub-card-title" href="#' + pub.id + '">' + text(pub.title) + '</a>' +
        '<span class="pub-status pub-status--' + status + '">' + text(STATUS_LABEL[status] || status) + '</span>' +
      '</div>' +
      '<p class="pub-card-method">' + text(pub.method || pub.description || '') + '</p>' +
      (mode === 'lead' ? renderAbstract(pub) : '') +
    '</article>';
  }

  function renderSemanticPathway() {
    var edges = (NETWORK && NETWORK.edges) ? NETWORK.edges.slice(0, 5) : [];
    var chain = [];
    edges.forEach(function (edge) {
      var from = byId(edge.from);
      var to = byId(edge.to);
      if (from && chain.indexOf(from) === -1) chain.push(from);
      if (to && chain.indexOf(to) === -1) chain.push(to);
    });
    if (!chain.length) chain = pickLatest(4);

    var nodes = chain.slice(0, 4).map(function (pub) {
      return '<a href="#' + pub.id + '">' + text(pub.title).toUpperCase() + '</a>';
    }).join('<span class="pub-path-arrow">↘</span>');

    return '<section class="pub-semantic-nav">' +
      '<h2 class="pub-front-heading">Semantic Navigation</h2>' +
      '<div class="pub-pathway">' + nodes + '</div>' +
    '</section>';
  }

  function renderEditorialDeck(title, pubs) {
    if (!pubs.length) return '';
    var lead = pubs[0];
    var compact = pubs.slice(1).map(function (pub) { return renderEditorialCard(pub, 'compact'); }).join('');
    return '<section class="pub-editorial-deck">' +
      '<h2 class="pub-front-heading">' + text(title) + '</h2>' +
      '<div class="pub-editorial-grid">' +
        renderEditorialCard(lead, 'lead') +
        '<div class="pub-editorial-stack">' + compact + '</div>' +
      '</div>' +
    '</section>';
  }

  function renderFrontHero(pub) {
    if (!pub) return '';
    var heroTitle = text(pub.title).toUpperCase();
    return '<section class="pub-front-hero">' +
      '<div class="pub-front-kicker">Featured</div>' +
      '<h2><a href="#' + pub.id + '">' + heroTitle + '</a></h2>' +
      '<p>' + text(pub.method || pub.description || '') + '</p>' +
      '<div class="pub-badge-row">' +
        '<span class="pub-status pub-status--' + normalizeStatus(pub.status) + '">' + text(STATUS_LABEL[normalizeStatus(pub.status)] || pub.status) + '</span>' +
        primaryOpenLink(pub) +
      '</div>' +
    '</section>';
  }

  function renderLiveMode() {
    return '<section class="pub-live-mode">' +
      '<h2 class="pub-front-heading">Live Newspaper Mode</h2>' +
      '<div class="pub-live-grid">' +
        '<article class="pub-live-card">' +
          '<h3>AI summaries</h3>' +
          '<p>Semantic compression of active manuscript streams, staged for editorial review.</p>' +
        '</article>' +
        '<article class="pub-live-card">' +
          '<h3>Science headlines</h3>' +
          '<p>Constraint-linked signals from current structural systems and runtime outputs.</p>' +
        '</article>' +
        '<article class="pub-live-card">' +
          '<h3>Europe feed</h3>' +
          '<p>A continental desk layer for research context, methods, and translational links.</p>' +
        '</article>' +
        '<article class="pub-live-card">' +
          '<h3>Multilingual rendering</h3>' +
          '<p>Parallel publication captions and summaries for cross-lab circulation.</p>' +
        '</article>' +
      '</div>' +
    '</section>';
  }

  function renderPreDoiNote(pub) {
    if (pub.doi) return '';
    return '<p class="pub-preview-note">Pre-DOI entry: abstract-only in publications layer. Full artifacts stay local until DOI assignment.</p>';
  }

  function buildSidebar() {
    sidebar.innerHTML = '';
    sortedTopics().forEach(function (topic) {
      var pubs = sortedPubsByTitle(DATA.filter(function (p) { return p.topic === topic.id; }));
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

  function renderDetail(pub) {
    var status = normalizeStatus(pub.status);
    main.innerHTML =
      '<div class="doc-article pub-card-detail">' +
        '<p class="doc-subtitle">' + text((TOPIC_LABEL[pub.topic] || pub.topic || '').toUpperCase()) + '</p>' +
        '<h1>' + text(pub.title) + '</h1>' +
        '<div class="pub-badge-row">' +
          '<span class="pub-status pub-status--' + status + '">' + text(STATUS_LABEL[status] || status) + '</span>' +
          primaryOpenLink(pub) +
        '</div>' +
        renderTopNetwork() +
        '<p class="pub-method">' + text(pub.method || pub.description || '') + '</p>' +
        renderAbstract(pub) +
        renderPreDoiNote(pub) +
        renderAssetLinks(pub) +
        renderPdfPreview(pub) +
      '</div>';
    window.calyrPubGraphs && window.calyrPubGraphs.refresh();
  }

  function renderOverview() {
    if (!DATA.length) {
      main.innerHTML =
        '<div class="doc-article">' +
          '<p class="doc-subtitle">Calyr.aí - Publications</p>' +
          '<h1>Nexus Magnify</h1>' +
          '<p>No published work is online at the moment.</p>' +
          '<p>This surface only renders entries explicitly marked as published.</p>' +
        '</div>';
      return;
    }

    var countItems = sortedTopics().map(function (topic) {
      var count = DATA.filter(function (p) { return p.topic === topic.id; }).length;
      if (!count) return '';
      return '<li>' + text(topic.label) + ': <strong>' + count + '</strong></li>';
    }).filter(Boolean).join('');

    var totalPapers = DATA.length;
    var featured = pickFeaturedPublication();
    var latest = pickLatest(4).filter(function (pub) { return !featured || pub.id !== featured.id; });

    var sectionConfigs = [
      {
        title: 'Systems',
        filterFn: function (pub) { return pub.topic === 'nexus' || pub.topic === 'spr'; },
        max: 4
      },
      {
        title: 'AI',
        filterFn: function (pub) {
          var hay = (pub.title || '') + ' ' + (pub.method || '') + ' ' + (pub.description || '');
          return /ai|latent|runtime|orchestrated|inference/i.test(hay);
        },
        max: 4
      },
      {
        title: 'Structural Biology',
        filterFn: function (pub) { return pub.topic === 'saxs'; },
        max: 4
      },
      {
        title: 'Commentary',
        filterFn: function (pub) { return pub.topic === 'purification' || pub.topic === 'redhuman'; },
        max: 4
      },
      {
        title: 'G-Labs',
        filterFn: function (pub) {
          var hay = (pub.title || '') + ' ' + (pub.method || '') + ' ' + (pub.description || '');
          return /g-labs|nexus|builder|publication network/i.test(hay);
        },
        max: 4
      }
    ];

    var sectionsHTML = sectionConfigs.map(function (config) {
      var pubs = sortedPubsByTitle(pickSectionItems(config)).filter(function (pub) { return !featured || pub.id !== featured.id; });
      return renderEditorialDeck(config.title, pubs);
    }).join('');

    main.innerHTML =
      '<div class="doc-article">' +
        '<p class="doc-subtitle">Calyr.aí - Publications</p>' +
        '<h1>Living Publication System</h1>' +
        renderFrontHero(featured) +
        renderLiveMode() +
        renderEditorialDeck('Latest', latest) +
        renderSemanticPathway() +
        renderTopNetwork() +
        sectionsHTML +
        '<section class="pub-topic-group pub-front-metrics">' +
          '<h2 class="pub-front-heading">Archive Metrics</h2>' +
          '<div class="pub-method-card">' +
            '<p class="pub-card-method">Total papers: <strong>' + totalPapers + '</strong></p>' +
            '<ul class="pub-card-method" style="margin-top:8px;">' + countItems + '</ul>' +
          '</div>' +
        '</section>' +
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
      main.innerHTML =
        '<div class="doc-article">' +
          '<p class="doc-subtitle">Calyr.aí - Publications</p>' +
          '<h1>Not Available Online</h1>' +
          '<p>The requested entry is not published on the public Newspaper surface.</p>' +
        '</div>';
      return;
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
