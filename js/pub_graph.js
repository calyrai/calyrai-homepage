// js/pub_graph.js — YAML-driven publication network at the top of publications.html
// Data is read from CALYR_PUBLICATIONS by pub id.

(function () {
  'use strict';

  /* ── Motion preference ──────────────────────────────────────── */
  var mq = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var motionScale = (mq && mq.matches) ? 0 : 1;
  function updateMotion() { motionScale = (mq && mq.matches) ? 0 : 1; }
  if (mq) {
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', updateMotion);
    else if (typeof mq.addListener === 'function') mq.addListener(updateMotion);
  }

  /* ── hash01 (identical to explore_map.js) ──────────────────── */
  function hash01(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;
  }

  /* ── driftOffset (same pattern, smaller amplitude) ─────────── */
  function driftOffset(id, t) {
    if (!motionScale) return { dx: 0, dy: 0 };
    var h     = hash01('pg:drift:'  + id);
    var h2    = hash01('pg:drift2:' + id);
    var phase = 2 * Math.PI * hash01('pg:driftp:' + id);
    var amp   = (3.5 + 5.5 * h) * motionScale;
    var speed = (0.28 + 0.45 * h2) * (0.65 + 0.25 * motionScale);
    return {
      dx: Math.sin(t * speed + phase) * amp,
      dy: Math.cos(t * (speed * 0.86) + phase * 1.3) * (amp * 0.78),
    };
  }

  /* ── Topological layer layout ───────────────────────────────── */
  function layerLayout(gnodes, gedges, W, H, padX, padY) {
    var ids  = gnodes.map(function (n) { return n.id; });
    var inDeg = {};
    ids.forEach(function (id) { inDeg[id] = 0; });
    gedges.forEach(function (e) { inDeg[e.to] = (inDeg[e.to] || 0) + 1; });
    var layer = {};
    var queue = ids.filter(function (id) { return !inDeg[id]; });
    queue.forEach(function (id) { layer[id] = 0; });
    var qi = 0;
    while (qi < queue.length) {
      var cur = queue[qi++];
      gedges.forEach(function (e) {
        if (e.from !== cur) return;
        var nl = (layer[cur] || 0) + 1;
        if (layer[e.to] === undefined || layer[e.to] < nl) layer[e.to] = nl;
        if (queue.indexOf(e.to) < 0) queue.push(e.to);
      });
    }
    ids.forEach(function (id) { if (layer[id] === undefined) layer[id] = 0; });
    var byL = {};
    ids.forEach(function (id) {
      var l = layer[id];
      if (!byL[l]) byL[l] = [];
      byL[l].push(id);
    });
    var lNums = Object.keys(byL).map(Number).sort(function (a, b) { return a - b; });
    var nL = lNums.length;
    var pos = {};
    lNums.forEach(function (l, li) {
      var ln = byL[l];
      var x = nL === 1 ? W / 2 : padX + (li / (nL - 1)) * (W - 2 * padX);
      ln.forEach(function (id, i) {
        var y = ln.length === 1 ? H / 2 : padY + (i / (ln.length - 1)) * (H - 2 * padY);
        pos[id] = { x: Math.round(x), y: Math.round(y) };
      });
    });
    return pos;
  }

  /* ── SVG element helper ─────────────────────────────────────── */
  function el(tag, attrs) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, String(attrs[k])); });
    }
    return node;
  }

  /* ── RAF loop ───────────────────────────────────────────────── */
  var activeGraphs = [];
  var rafId = 0;
  var animTimeSec = 0;

  function tick(nowMs) {
    if (!rafId) return;
    animTimeSec = nowMs / 1000;
    activeGraphs.forEach(function (g) { g.update(animTimeSec); });
    rafId = requestAnimationFrame(tick);
  }

  function startRAF() {
    if (!rafId && activeGraphs.length) rafId = requestAnimationFrame(tick);
  }

  function stopRAF() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopRAF();
    else if (activeGraphs.length) startRAF();
  });

  /* ── Build one global graph into the top container ───────────────────── */
  function buildGraph(container) {
    function isPublished(pub) {
      if (!pub || typeof pub !== 'object') return false;
      if (pub.published === true) return true;
      var release = String(pub.release || pub.visibility || '').trim().toLowerCase();
      return release === 'published' || release === 'public';
    }

    var publications = (window.CALYR_PUBLICATIONS || []).filter(isPublished);
    var network = window.CALYR_PUBLICATION_NETWORK || {};
    if (!publications.length) return null;

    var publicationById = {};
    publications.forEach(function (pub) {
      publicationById[pub.id] = pub;
    });

    var gnodes = publications.map(function (pub) {
      return { id: pub.id, label: pub.title };
    });
    var nodeIds = {};
    gnodes.forEach(function (n) { nodeIds[n.id] = true; });
    var gedges = Array.isArray(network.edges)
      ? network.edges.filter(function (edge) {
          return edge && nodeIds[edge.from] && nodeIds[edge.to];
        })
      : [];
    var W = 860, H = 260, padX = 92, padY = 42;
    var pos = layerLayout(gnodes, gedges, W, H, padX, padY);
    var pid = 'publication-network';

    /* source / sink colours */
    var hasSrc = {}, hasDst = {};
    gedges.forEach(function (e) { hasSrc[e.from] = true; hasDst[e.to] = true; });

    /* SVG root */
    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      class: 'pub-graph-svg',
      role: 'img',
      'aria-label': 'Publication network',
    });

    /* ─── Defs: glow filter + arrowhead ─── */
    var defs = el('defs');

    var filtId = 'pgf-' + pid;
    var filt = el('filter', { id: filtId, x: '-80%', y: '-80%', width: '260%', height: '260%' });
    var fblur = el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '4.5', result: 'b' });
    var fmerge = el('feMerge');
    fmerge.appendChild(el('feMergeNode', { in: 'b' }));
    fmerge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
    filt.appendChild(fblur); filt.appendChild(fmerge); defs.appendChild(filt);

    var markId = 'pgm-' + pid;
    var mark = el('marker', {
      id: markId,
      markerWidth: '7', markerHeight: '6',
      refX: '6.5', refY: '3',
      orient: 'auto', markerUnits: 'userSpaceOnUse',
    });
    mark.appendChild(el('path', { d: 'M0,0.5 L7,3 L0,5.5 Z', fill: 'rgba(106,240,255,0.4)' }));
    defs.appendChild(mark);
    svg.appendChild(defs);

    /* Background with top-fade blend */
    var bgGradId = 'pgbg-' + pid;
    var bgGrad = el('linearGradient', { id: bgGradId, x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
    bgGrad.appendChild(el('stop', { offset: '0%',   'stop-color': 'rgba(4,10,20,0)',    'stop-opacity': '0' }));
    bgGrad.appendChild(el('stop', { offset: '30%',  'stop-color': 'rgba(4,10,20,0.72)', 'stop-opacity': '1' }));
    bgGrad.appendChild(el('stop', { offset: '100%', 'stop-color': 'rgba(4,10,20,0.72)', 'stop-opacity': '1' }));
    defs.appendChild(bgGrad);

    svg.appendChild(el('rect', {
      width: W, height: H, rx: '0',
      fill: 'url(#' + bgGradId + ')',
      stroke: 'rgba(106,240,255,0.09)', 'stroke-width': '1',
    }));

    /* ─── Edges group ─── */
    var edgesG = el('g', { class: 'pg-edges' });
    var edgeEls = gedges.map(function (e) {
      var line = el('line', {
        class: 'pg-edge-line',
        'data-from': e.from, 'data-to': e.to,
        'marker-end': 'url(#' + markId + ')',
      });
      edgesG.appendChild(line);
      return { from: e.from, to: e.to, el: line };
    });
    svg.appendChild(edgesG);

    /* ─── Nodes group ─── */
    var nodesG = el('g', { class: 'pg-nodes' });
    var nodeEls = {};

    gnodes.forEach(function (n, i) {
      var p = pos[n.id] || { x: W / 2, y: H / 2 };
      var isSink = !hasSrc[n.id], isSrc = !hasDst[n.id];

      /* pulse / ring / dot colours (explore.css pattern, recoloured for pub palette) */
      var pulseCol  = isSink ? 'rgba(0,220,255,0.22)'   : 'rgba(192,132,252,0.20)';
      var pulse2Col = isSink ? 'rgba(36,243,255,0.14)'  : 'rgba(160,80,255,0.13)';
      var ringStk   = isSink ? 'rgba(106,240,255,0.55)' : isSrc ? 'rgba(192,132,252,0.55)' : 'rgba(130,200,255,0.42)';
      var dotFill   = isSink ? '#6af0ff' : isSrc ? '#c084fc' : '#82c8ff';

      var g = el('g', { class: 'pg-node', 'data-id': n.id });
      g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ')');

      /* glow wrapper (filter applied only to the circles, not the label) */
      var gf = el('g', { filter: 'url(#' + filtId + ')' });

      var pulse  = el('circle', { class: 'pg-node-pulse',              r: '14', fill: pulseCol });
      var pulse2 = el('circle', { class: 'pg-node-pulse pg-node-pulse--2', r: '14', fill: pulse2Col });
      var ring   = el('circle', {
        class: 'pg-node-ring', r: '11',
        fill: 'rgba(255,255,255,0.05)',
        stroke: ringStk, 'stroke-width': '1.4',
      });
      var dot = el('circle', { class: 'pg-node-dot', r: '3.4', fill: dotFill });

      gf.appendChild(pulse); gf.appendChild(pulse2);
      gf.appendChild(ring); gf.appendChild(dot);
      g.appendChild(gf);

      /* Label — show above node if near bottom edge */
      var lY = (p.y > H * 0.62) ? '-14' : '18';
      var lbl = el('text', { class: 'pg-node-label', x: '0', y: lY, 'text-anchor': 'middle' });
      lbl.textContent = n.label;
      g.appendChild(lbl);

      /* Hover → is-active; click → navigate to publication */
      g.addEventListener('mouseenter', function () { g.classList.add('is-active'); });
      g.addEventListener('mouseleave', function () { g.classList.remove('is-active'); });
      g.addEventListener('click', function () {
        var pub = publicationById[n.id] || {};
        var archiveHref = pub.archive_url || (pub.arxiv ? 'https://arxiv.org/abs/' + encodeURIComponent(pub.arxiv) : '');
        if (archiveHref) {
          window.open(archiveHref, '_blank', 'noopener');
          return;
        }
        window.location.hash = '#' + n.id;
      });

      nodesG.appendChild(g);
      nodeEls[n.id] = { el: g, base: { x: p.x, y: p.y } };
    });

    svg.appendChild(nodesG);
    container.appendChild(svg);

    /* ─── Frame update ─── */
    var R = 11, M = 9;
    function update(t) {
      /* drift each node */
      Object.keys(nodeEls).forEach(function (id) {
        var nd = nodeEls[id];
        var d  = driftOffset(id, t);
        nd.el.setAttribute('transform',
          'translate(' + (nd.base.x + d.dx).toFixed(2) + ' ' + (nd.base.y + d.dy).toFixed(2) + ')');
      });

      /* recompute live edge endpoints */
      edgeEls.forEach(function (e) {
        var a = nodeEls[e.from], b = nodeEls[e.to];
        if (!a || !b) return;
        var da = driftOffset(e.from, t), db = driftOffset(e.to, t);
        var ax = a.base.x + da.dx, ay = a.base.y + da.dy;
        var bx = b.base.x + db.dx, by = b.base.y + db.dy;
        var dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy) || 1;
        e.el.setAttribute('x1', (ax + dx / len * R).toFixed(2));
        e.el.setAttribute('y1', (ay + dy / len * R).toFixed(2));
        e.el.setAttribute('x2', (bx - dx / len * (R + M)).toFixed(2));
        e.el.setAttribute('y2', (by - dy / len * (R + M)).toFixed(2));
      });
    }

    return { update: update };
  }

  /* ── Public API: refresh() ─────────────────────────────────── */
  function refresh() {
    stopRAF();
    activeGraphs = [];

    var container = document.getElementById('pub-network');
    if (container) {
      container.innerHTML = '';
      var g = buildGraph(container);
      if (g) activeGraphs.push(g);
    }

    if (activeGraphs.length) startRAF();
  }

  window.calyrPubGraphs = { refresh: refresh };

  document.addEventListener('calyr:publications-ready', refresh);
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(refresh, 0);
  });
  if (window.CALYR_PUBLICATIONS && window.CALYR_PUBLICATIONS.length) {
    setTimeout(refresh, 0);
  }

}());
