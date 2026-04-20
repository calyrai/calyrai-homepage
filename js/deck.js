// js/deck.js — Typed renderer for CALYR_DECK
// Reads window.CALYR_DECK (data/deck.js), builds slides, wires nav + keyboard.
// KaTeX is re-rendered explicitly after DOM build (auto-render fires before slides exist).

(function () {
  'use strict';

  /* ── Slide renderers keyed by type ─────────────────────────────────────── */

  var R = {

    title: function (s) {
      return wrap('deck-content',
        kicker(s.kicker, s.chapter) +
        '<h2 class="deck-headline">' + formatHeadline(s.headline) + '</h2>' +
        '<p class="deck-tagline">' + s.tagline + '</p>'
      );
    },

    statement: function (s) {
      return wrap('deck-content',
        kicker(s.kicker, s.chapter) +
        '<h2 class="deck-headline">' + formatHeadline(s.headline) + '</h2>' +
        (s.body      ? '<div class="deck-body">'      + renderBody(s.body)      + '</div>' : '') +
        (s.manifesto ? '<p class="deck-manifesto">' + s.manifesto + '</p>' : '')
      );
    },

    equation: function (s) {
      var legend = s.legend && s.legend.length
        ? '<div class="deck-legend-row">' +
            s.legend.map(function (l) { return '<span>' + l + '</span>'; }).join('') +
          '</div>'
        : '';

      var headlineHtml = s.headline
        ? '<h2 class="deck-headline deck-headline--eq">' + formatHeadline(s.headline) + '</h2>'
        : '';

      if (!s.body) {
        // No body — centred narrow layout (e.g. pure formula slide)
        return wrap('deck-content deck-content--narrow',
          kicker(s.kicker, s.chapter) +
          headlineHtml +
          '<div class="deck-eq">' + s.eq + '</div>' +
          legend
        );
      }

      var bodyFlow = splitBodyFlow(s.body);

      return wrap('deck-content deck-content--wide',
        kicker(s.kicker, s.chapter) +
        headlineHtml +
        '<div class="deck-eq-row">' +
          (bodyFlow.before
            ? '<div class="deck-body-col"><div class="deck-body deck-body--left">' + bodyFlow.before + '</div></div>'
            : '') +
          '<div class="deck-eq-col">' +
            '<div class="deck-eq">' + s.eq + '</div>' +
            legend +
          '</div>' +
          (bodyFlow.after
            ? '<div class="deck-body-col"><div class="deck-body deck-body--left">' + bodyFlow.after + '</div></div>'
            : '') +
        '</div>'
      );
    },

    coupling: function (s) {
      return wrap('deck-content',
        kicker(s.kicker, s.chapter) +
        '<h2 class="deck-headline">' + formatHeadline(s.headline) + '</h2>' +
        (s.body ? '<div class="deck-body">' + renderBody(s.body) + '</div>' : '')
      );
    },

    platforms: function (s) {
      var tiles = s.items.map(function (p) {
        return '<div class="deck-platform"><strong>' + p.name + '</strong><span>' + p.desc + '</span></div>';
      }).join('');
      return wrap('deck-content deck-content--wide',
        kicker(s.kicker, s.chapter) +
        '<h3 class="deck-headline--medium">' + s.title + '</h3>' +
        '<div class="deck-platform-grid">' + tiles + '</div>'
      );
    },

    papers: function (s) {
      var rows = s.items.map(function (p) {
        var label     = p.status === 'progress' ? 'in progress' : p.status;
        var titleHtml = p.href
          ? '<a class="deck-paper-title deck-paper-title--link" href="' + p.href + '">' + p.title + '</a>'
          : '<span class="deck-paper-title">' + p.title + '</span>';
        return '<div class="deck-paper">' +
          '<span class="deck-status deck-status--' + p.status + '">' + label + '</span>' +
          titleHtml +
          '<span class="deck-paper-sub">' + p.sub + '</span>' +
        '</div>';
      }).join('');
      return wrap('deck-content deck-content--wide',
        kicker(s.kicker, s.chapter) +
        '<h3 class="deck-headline--medium">' + s.title + '</h3>' +
        '<div class="deck-papers">' + rows + '</div>'
      );
    }
  };

  /* ── Helpers ────────────────────────────────────────────────────────────── */

  function wrap(cls, inner) {
    return '<div class="' + cls + '">' + inner + '</div>';
  }

  function kicker(text, chapter) {
    if (!text) return '';
    var prefix = chapter
      ? '<span class="deck-chapter">' + chapter + '</span><span class="deck-chapter-sep"> &middot; </span>'
      : '';
    return '<div class="deck-kicker">' + prefix + text + '</div>';
  }

  function formatHeadline(text) {
    if (!text) return '';
    return text.replace(/<br\s*\/?>/gi, ' ');
  }

  function renderInline(text) {
    return text.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  }

  function bodyParagraphs(text) {
    if (!text) return [];
    return text
      .trim()
      .split(/\n\s*\n/)
      .map(function (paragraph) {
        return paragraph.replace(/\s*\n\s*/g, ' ').trim();
      })
      .filter(Boolean);
  }

  function renderBody(text) {
    return bodyParagraphs(text).map(function (paragraph) {
      return '<p class="deck-body-paragraph">' + renderInline(paragraph) + '</p>';
    }).join('');
  }

  function splitBodyFlow(text) {
    var paragraphs = bodyParagraphs(text);
    if (!paragraphs.length) return { before: '', after: '' };
    return {
      before: '<p class="deck-body-paragraph">' + renderInline(paragraphs[0]) + '</p>',
      after: paragraphs.slice(1).map(function (paragraph) {
        return '<p class="deck-body-paragraph">' + renderInline(paragraph) + '</p>';
      }).join('')
    };
  }

  function renderLinks(links) {
    var pills = links.map(function (l) {
      if (l.slide !== undefined) {
        return '<button class="deck-link deck-link--jump" data-slide="' + l.slide + '">' + l.label + '</button>';
      }
      return '<a class="deck-link deck-link--page" href="' + l.href + '">' + l.label + '</a>';
    }).join('');
    return '<div class="deck-links">' + pills + '</div>';
  }

  /* ── Build ──────────────────────────────────────────────────────────────── */

  function build() {
    var data   = window.CALYR_DECK;
    var shell  = document.getElementById('deck-shell');
    var track  = document.getElementById('deck-track');
    var dotsEl = document.getElementById('deck-dots');
    var prevBtn = document.getElementById('deck-prev');
    var nextBtn = document.getElementById('deck-next');

    if (!data || !shell || !track || !dotsEl || !prevBtn || !nextBtn) return;

    var phoneLayoutQuery = window.matchMedia('(max-width: 700px)');

    function isStackedLayout() {
      return phoneLayoutQuery.matches && !document.fullscreenElement;
    }

    data.forEach(function (slide, i) {
      var renderer = R[slide.type];
      if (!renderer) {
        console.warn('[deck.js] Unknown slide type:', slide.type);
        return;
      }

      // Slide element
      var isSplitEq = slide.type === 'equation' && slide.body;
      var el = document.createElement('div');
      el.id = 'deck-slide-' + i;
      el.setAttribute('data-slide-index', String(i));
      el.className = 'deck-slide' +
        (slide.type === 'title'    ? ' deck-slide--title' : '') +
        (slide.type === 'equation' ? ' deck-slide--eq' : '') +
        (isSplitEq ? ' deck-slide--eq-split' : '');
      var html = renderer(slide);
      if (slide.links && slide.links.length) { html += renderLinks(slide.links); }
      el.innerHTML = html;
      track.appendChild(el);

      // Nav dot with hover label
      var dotWrap = document.createElement('div');
      dotWrap.className = 'deck-dot-wrap';

      var dot = document.createElement('button');
      dot.className = 'deck-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', (function (n) { return function () { go(n); }; })(i));

      var labelText = (slide.headline || slide.title || slide.kicker || '')
        .replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '').trim();
      var dotLabel = document.createElement('span');
      dotLabel.className = 'deck-dot-label';
      dotLabel.textContent = labelText;

      dotWrap.appendChild(dot);
      dotWrap.appendChild(dotLabel);
      dotsEl.appendChild(dotWrap);
    });

    /* ── Table of Contents ────────────────────────────────────────────────── */

    var TOC = [
      { chapters: ['Nexus'],                    label: 'nexus' },
      { chapters: ['Language', 'Architecture'], label: 'nexus_language' },
      { chapters: ['Core'],                     label: 'nexus_language_core' },
      { chapters: ['SAXS'],                     label: 'nexus_language_saxs' },
      { chapters: ['SPR'],                      label: 'nexus_language_spr' },
      { chapters: ['Coupling'],                 label: 'nexus_language_nexus' },
      { chapters: ['Warehouse'],                label: 'nexus_language_warehouse' },
      { chapters: ['Pipelines'],                label: 'nexus_language_pipelines' }
    ];

    var tocEl = document.getElementById('deck-toc');
    if (tocEl) {
      TOC.forEach(function (entry, idx) {
        var item = document.createElement('div');
        item.className = 'deck-toc-item';
        item.setAttribute('data-toc-chapters', entry.chapters.join(','));

        if (idx > 0) {
          var lineTop = document.createElement('div');
          lineTop.className = 'deck-toc-connector';
          item.appendChild(lineTop);
        }

        var node = document.createElement('div');
        node.className = 'deck-toc-node';

        var circle = document.createElement('div');
        circle.className = 'deck-toc-circle';

        var label = document.createElement('span');
        label.className = 'deck-toc-label';
        label.textContent = entry.label;

        node.appendChild(circle);
        node.appendChild(label);
        item.appendChild(node);
        tocEl.appendChild(item);

        item.addEventListener('click', (function (chapters) {
          return function () {
            for (var j = 0; j < data.length; j++) {
              if (chapters.indexOf(data[j].chapter || '') !== -1) { go(j); break; }
            }
          };
        })(entry.chapters));
      });
    }

    function updateToc(chapter) {
      if (!tocEl) return;
      tocEl.querySelectorAll('.deck-toc-item').forEach(function (item) {
        var keys = (item.getAttribute('data-toc-chapters') || '').split(',');
        item.classList.toggle('deck-toc-item--active', keys.indexOf(chapter || '') !== -1);
      });
    }

    // Re-render KaTeX after slides are in the DOM
    if (window.renderMathInElement) {
      renderMathInElement(track, {
        delimiters: [
          { left: '$$', right: '$$', display: true  },
          { left: '$',  right: '$',  display: false }
        ],
        throwOnError: false
      });
    }

    /* ── Navigation ───────────────────────────────────────────────────────── */

    var total   = track.querySelectorAll('.deck-slide').length;
    var current = 0;
    var slides  = track.querySelectorAll('.deck-slide');

    function updateLayoutMode() {
      var stacked = isStackedLayout();
      shell.classList.toggle('deck-shell--stacked', stacked);
      if (stacked) {
        track.style.transform = 'none';
      } else {
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
      }
      prevBtn.disabled = stacked || current === 0;
      nextBtn.disabled = stacked || current === total - 1;
    }

    function go(n) {
      current = Math.max(0, Math.min(n, total - 1));
      if (isStackedLayout()) {
        if (slides[current]) {
          slides[current].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
      }
      dotsEl.querySelectorAll('.deck-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
      prevBtn.disabled = isStackedLayout() || (current === 0);
      nextBtn.disabled = isStackedLayout() || (current === total - 1);
      updateToc(data[current] ? data[current].chapter : null);
    }

    prevBtn.addEventListener('click', function () { go(current - 1); });
    nextBtn.addEventListener('click', function () { go(current + 1); });

    // Wire in-deck jump links (data-slide buttons injected by renderLinks)
    track.querySelectorAll('.deck-link--jump').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        go(parseInt(btn.getAttribute('data-slide'), 10));
      });
    });

    document.addEventListener('keydown', function (e) {
      if (isStackedLayout()) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(current + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(current - 1);
    });

    if (typeof phoneLayoutQuery.addEventListener === 'function') {
      phoneLayoutQuery.addEventListener('change', updateLayoutMode);
    } else if (typeof phoneLayoutQuery.addListener === 'function') {
      phoneLayoutQuery.addListener(updateLayoutMode);
    }

    updateLayoutMode();
    go(0);

    /* ── Fullscreen ─────────────────────────────────────────────────────── */
    var fsBtn  = document.getElementById('deck-fs');

    if (fsBtn && shell) {
      fsBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          shell.requestFullscreen().catch(function () {});
        } else {
          document.exitFullscreen();
        }
      });

      document.addEventListener('fullscreenchange', function () {
        var isFs = !!document.fullscreenElement;
        fsBtn.innerHTML = isFs ? '&#x2715;' : '&#x26F6;';
        fsBtn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen');
        shell.classList.toggle('deck-shell--fullscreen', isFs);
        updateLayoutMode();
      });
    }
  }

  /* ── Entry point ────────────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

})();
