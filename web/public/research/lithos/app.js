const ACCENT = '#fff';
const INK = '#f2f2f2';
const MAGENTA = '#e500b5';

class DeckConfigLoader {
  static async load(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Deck config fetch failed (${response.status})`);
    }
    const text = await response.text();
    return this.parseYaml(text);
  }

  static parseYaml(text) {
    const lines = text.replace(/\t/g, '  ').split('\n');
    const root = {};
    let i = 0;

    const parseScalar = (v) => {
      const value = v.trim();
      if (value === 'true') return true;
      if (value === 'false') return false;
      if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
      return value.replace(/^"|"$/g, '');
    };

    const indentOf = (line) => line.match(/^\s*/)[0].length;

    function parseBlock(baseIndent) {
      const obj = {};
      const arr = [];
      let mode = null;

      while (i < lines.length) {
        const raw = lines[i];
        if (!raw.trim() || raw.trim().startsWith('#')) {
          i += 1;
          continue;
        }
        const indent = indentOf(raw);
        if (indent < baseIndent) break;
        const line = raw.trim();

        if (line.startsWith('- ')) {
          mode = 'array';
          const itemText = line.slice(2);
          if (itemText.includes(':')) {
            const [k, ...rest] = itemText.split(':');
            const val = rest.join(':').trim();
            const item = { [k.trim()]: val ? parseScalar(val) : null };
            i += 1;
            const nested = parseBlock(indent + 2);
            if (nested && typeof nested === 'object' && !Array.isArray(nested) && Object.keys(nested).length > 0) {
              Object.assign(item, nested);
            }
            arr.push(item);
          } else {
            arr.push(parseScalar(itemText));
            i += 1;
          }
          continue;
        }

        mode = mode || 'object';
        const [key, ...rest] = line.split(':');
        const k = key.trim();
        const v = rest.join(':').trim();
        i += 1;

        if (v) {
          obj[k] = parseScalar(v);
        } else {
          const nested = parseBlock(indent + 2);
          obj[k] = nested;
        }
      }

      return mode === 'array' ? arr : obj;
    }

    i = 0;
    Object.assign(root, parseBlock(0));
    return root;
  }
}

function createSeededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const DEFAULT_DECK_CONFIG = {
  seed: 5318008,
  ui: {
    pitch_link_label: 'Pitch Deck',
    footer_primary: 'FROM DATA TO FORM.',
    footer_secondary: 'FROM COMPLEXITY TO INTELLIGENCE.',
    default_hint: 'Use left/right arrows or top buttons. One slide at a time, no scrolling.',
  },
  formation_steps: [0.22, 0.36, 0.52, 0.68, 0.82, 0.92, 1.0],
  cluster_amounts: [14, 14, 18, 14, 14],
  cluster_centers: [
    { x: 92, y: 228 },
    { x: 182, y: 186 },
    { x: 286, y: 166 },
    { x: 398, y: 176 },
    { x: 502, y: 220 },
  ],
  slides: [
  { title: 'Clustered Network.', subtitle: 'Points connect into a live topology.', story: 'The system starts as one moving clustered network of points and local links.', type: 'line', hint: 'Nodes move continuously. Drag any point to perturb the local cluster.' },
  { title: 'Magenta Linkage.', subtitle: 'Core route emerges from the network.', story: 'A single magenta route starts linking the connected clusters into one candidate direction.', type: 'magenta', hint: 'Observe how the magenta route stabilizes the cluster network.' },
  { title: 'Flow Conditioning.', subtitle: 'Physical flow pushes the route.', story: 'The magenta route is exposed to flow conditions and deforms under physical forcing.', type: 'flow', hint: 'Drag the magenta handle to vary the flow pressure and deformation.' },
  { title: 'Convergence.', subtitle: 'Network and flow settle into one direction.', story: 'Topology and flow converge toward one robust shape candidate.', type: 'flow-finalize', hint: 'Continue shaping the route; the final bow appears in the next step.' },
  { title: 'Final Aortic Bow.', subtitle: 'Best bow form appears at the end.', story: 'Only at the end, the stabilized result is shown as the final aortic bow.', type: 'final-bow', hint: 'Use left/right arrows or top buttons. One slide at a time, no scrolling.' }
  ],
};

let slides = DEFAULT_DECK_CONFIG.slides.slice();

const BRIDGE_CURVE = curvePoints(14, 0);
const STAR_FIELD = (() => {
  const rand = createSeededRandom(20260713);
  const points = [];
  const count = 76;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const x = 56 + t * 488 + (rand() - 0.5) * 24;
    const y = 208 - 92 * Math.sin(t * Math.PI) + (rand() - 0.5) * 92;
    points.push({ x, y });
  }
  return points;
})();

const BRIDGE_NODE_INDICES = [3, 9, 14, 19, 24, 30, 36, 42, 49, 56, 64, 72];
let CLUSTER_CENTERS = DEFAULT_DECK_CONFIG.cluster_centers.slice();
let CLUSTER_FIELD = [];

const stage = document.querySelector('#stage');
const slideCounter = document.querySelector('#slideCounter');
const pitchLinkEl = document.querySelector('.topbar-right .home-link');
const footerSpans = Array.from(document.querySelectorAll('.footer span'));
let active = -1;
let activeCleanup = null;
let deckUi = { ...DEFAULT_DECK_CONFIG.ui };

let FORMATION_STEPS = DEFAULT_DECK_CONFIG.formation_steps.slice();

function buildClusterField(centers, amounts, seed) {
  const rand = createSeededRandom(seed);
  const points = [];
  centers.forEach((c, ci) => {
    const amount = amounts[ci] ?? 14;
    for (let i = 0; i < amount; i += 1) {
      const a = rand() * Math.PI * 2;
      const r = 10 + rand() * 34;
      const x = c.x + Math.cos(a) * r + (rand() - 0.5) * 8;
      const y = c.y + Math.sin(a) * r + (rand() - 0.5) * 8;
      points.push({ x: Math.max(40, Math.min(560, x)), y: Math.max(60, Math.min(348, y)) });
    }
  });
  return points;
}

function applyDeckConfig(raw) {
  const config = raw && typeof raw === 'object' ? raw : {};
  const ui = config.ui && typeof config.ui === 'object' ? config.ui : {};
  deckUi = {
    pitch_link_label: String(ui.pitch_link_label || DEFAULT_DECK_CONFIG.ui.pitch_link_label),
    footer_primary: String(ui.footer_primary || DEFAULT_DECK_CONFIG.ui.footer_primary),
    footer_secondary: String(ui.footer_secondary || DEFAULT_DECK_CONFIG.ui.footer_secondary),
    default_hint: String(ui.default_hint || DEFAULT_DECK_CONFIG.ui.default_hint),
  };

  if (pitchLinkEl) {
    pitchLinkEl.textContent = deckUi.pitch_link_label;
  }
  if (footerSpans[0]) {
    footerSpans[0].textContent = deckUi.footer_primary;
  }
  if (footerSpans[1]) {
    footerSpans[1].textContent = deckUi.footer_secondary;
  }

  const slidesCandidate = Array.isArray(config.slides) && config.slides.length > 0 ? config.slides : DEFAULT_DECK_CONFIG.slides;
  slides = slidesCandidate.map((slide) => ({
    title: String(slide.title || ''),
    subtitle: String(slide.subtitle || ''),
    story: String(slide.story || ''),
    type: String(slide.type || 'line'),
    hint: String(slide.hint || deckUi.default_hint),
  }));

  const steps = Array.isArray(config.formation_steps) && config.formation_steps.length > 0
    ? config.formation_steps.map((v) => Number(v)).filter((v) => Number.isFinite(v))
    : DEFAULT_DECK_CONFIG.formation_steps;
  FORMATION_STEPS = steps.length ? steps : DEFAULT_DECK_CONFIG.formation_steps.slice();

  const centers = Array.isArray(config.cluster_centers) && config.cluster_centers.length > 0
    ? config.cluster_centers
    : DEFAULT_DECK_CONFIG.cluster_centers;
  CLUSTER_CENTERS = centers.map((p) => ({ x: Number(p.x), y: Number(p.y) })).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (!CLUSTER_CENTERS.length) {
    CLUSTER_CENTERS = DEFAULT_DECK_CONFIG.cluster_centers.slice();
  }

  const amounts = Array.isArray(config.cluster_amounts) ? config.cluster_amounts.map((v) => Number(v)) : DEFAULT_DECK_CONFIG.cluster_amounts;
  const seed = Number.isFinite(Number(config.seed)) ? Number(config.seed) : DEFAULT_DECK_CONFIG.seed;
  CLUSTER_FIELD = buildClusterField(CLUSTER_CENTERS, amounts, seed);
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function curvePoints(n = 13, noise = 0) {
  return Array.from({ length: n }, (_, i) => {
    const x = 50 + i * (500 / (n - 1));
    const y = 145 - 55 * Math.sin((i / (n - 1)) * Math.PI) + (Math.random() - 0.5) * noise;
    return { x, y };
  });
}

function pathFrom(points) {
  if (!points.length) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1];
    const p = points[i];
    const mx = (p0.x + p.x) / 2;
    d += ` Q ${mx} ${p0.y} ${p.x} ${p.y}`;
  }
  return d;
}

function addLine(svg, accentSegment = false) {
  const pts = curvePoints(14, 0);
  svg.appendChild(svgEl('path', { d: pathFrom(pts), fill: 'none', stroke: INK, 'stroke-width': 2.1, 'stroke-linecap': 'round' }));
  if (accentSegment) {
    const seg = pts.slice(6, 9);
    svg.appendChild(svgEl('path', { d: pathFrom(seg), fill: 'none', stroke: ACCENT, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  }
  return pts;
}

function addNodes(svg, pts, radius = 3, interactive = false) {
  pts.forEach((p, i) => {
    const c = svgEl('circle', {
      cx: p.x,
      cy: p.y,
      r: radius,
      fill: 'none',
      stroke: i === Math.floor(pts.length / 2) ? '#fff' : INK,
      'stroke-width': Math.max(0.85, radius * 0.18),
      class: interactive ? 'node thin-node' : 'node thin-node'
    });
    if (interactive) c.setAttribute('data-node-idx', String(i));
    svg.appendChild(c);
  });
}

function addNetwork(svg, nodes, neighbors = 2, interactive = true, nodeRadius = 2.6) {
  nodes.forEach((a, i) => {
    const nearest = nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((u, v) => u.d - v.d)
      .slice(0, neighbors);
    nearest.forEach(({ j }) => {
      if (j > i) {
        svg.appendChild(svgEl('line', { x1: a.x, y1: a.y, x2: nodes[j].x, y2: nodes[j].y, class: 'edge' }));
      }
    });
  });
  addNodes(svg, nodes, nodeRadius, interactive);
}

function drawBridgeFromStars(svg) {
  const bridgeNodes = BRIDGE_NODE_INDICES.map((idx, i) => {
    const star = STAR_FIELD[idx];
    const curve = BRIDGE_CURVE[Math.min(i + 1, BRIDGE_CURVE.length - 2)];
    return {
      x: (star.x + curve.x) * 0.5,
      y: (star.y + curve.y) * 0.5,
    };
  });

  bridgeNodes.forEach((p, i) => {
    if (i < bridgeNodes.length - 1) {
      const n = bridgeNodes[i + 1];
      svg.appendChild(svgEl('line', { x1: p.x, y1: p.y, x2: n.x, y2: n.y, class: 'edge active' }));
    }
  });

  addNodes(svg, bridgeNodes, 3.1, true);
}

function drawClusteredPoints(svg, interactiveNodes = true) {
  const radius = 2.2;
  addNodes(svg, CLUSTER_FIELD, radius, interactiveNodes);
}

function drawClusteredNetwork(svg, interactiveNodes = true) {
  CLUSTER_FIELD.forEach((a, i) => {
    const nearest = CLUSTER_FIELD
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((u, v) => u.d - v.d)
      .slice(0, 3);

    nearest.forEach(({ j, d }) => {
      if (j <= i || d > 78 * 78) return;
      svg.appendChild(svgEl('line', {
        x1: a.x,
        y1: a.y,
        x2: CLUSTER_FIELD[j].x,
        y2: CLUSTER_FIELD[j].y,
        class: 'edge',
      }));
    });
  });

  addNodes(svg, CLUSTER_FIELD, 2.25, interactiveNodes);
}

function drawMagentaSpine(svg) {
  const spinePoints = buildMagentaSpinePoints();

  svg.appendChild(svgEl('path', {
    d: pathFrom(spinePoints),
    class: 'cluster-magenta-spine',
    fill: 'none',
    stroke: MAGENTA,
    'stroke-width': 2.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }));
}

function buildMagentaSpinePoints() {
  return CLUSTER_CENTERS.map((c, i) => ({
    x: c.x,
    y: c.y - 24 - Math.sin(i * 0.8) * 8,
  }));
}

function drawProgressiveGraph(svg, progress, interactiveNodes = false) {
  const p = Math.max(0, Math.min(1, progress));
  const edgeBudget = Math.max(2, Math.round(2 + p * 2));

  STAR_FIELD.forEach((a, i) => {
    const nearest = STAR_FIELD
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((u, v) => u.d - v.d)
      .slice(0, edgeBudget);

    nearest.forEach(({ j }) => {
      if (j <= i) return;
      svg.appendChild(svgEl('line', {
        x1: a.x,
        y1: a.y,
        x2: STAR_FIELD[j].x,
        y2: STAR_FIELD[j].y,
        class: 'edge',
      }));
    });
  });

  const baseRadius = 1.55 + p * 1.15;
  addNodes(svg, STAR_FIELD, baseRadius, interactiveNodes);

  const bridgeNodes = BRIDGE_NODE_INDICES.map((idx, i) => {
    const star = STAR_FIELD[idx];
    const curve = BRIDGE_CURVE[Math.min(i + 1, BRIDGE_CURVE.length - 2)];
    return {
      x: (star.x + curve.x) * 0.5,
      y: (star.y + curve.y) * 0.5,
    };
  });

  const bridgeCount = Math.max(2, Math.round(2 + p * (bridgeNodes.length - 2)));
  const bridgeSlice = bridgeNodes.slice(0, bridgeCount);

  bridgeSlice.forEach((node, i) => {
    if (i >= bridgeSlice.length - 1) return;
    const nxt = bridgeSlice[i + 1];
    svg.appendChild(svgEl('line', {
      x1: node.x,
      y1: node.y,
      x2: nxt.x,
      y2: nxt.y,
      class: 'edge active',
    }));
  });

  addNodes(svg, bridgeSlice, 2.25 + p * 0.95, interactiveNodes);

  const curveCount = Math.max(3, Math.round(3 + p * (BRIDGE_CURVE.length - 3)));
  const curveSegment = BRIDGE_CURVE.slice(0, curveCount);
  svg.appendChild(svgEl('path', {
    d: pathFrom(curveSegment),
    class: 'bridge-guide-line',
    fill: 'none',
    stroke: ACCENT,
    'stroke-width': 1.8 + p * 0.95,
    'stroke-linecap': 'round',
    opacity: 0.34 + p * 0.36,
  }));

  svg.appendChild(svgEl('path', {
    d: aortaPath(),
    fill: 'none',
    stroke: '#fff',
    class: 'aorta-glow',
    'stroke-width': 2.8 + p * 1.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: 0.04 + p * 0.12,
  }));

  svg.appendChild(svgEl('path', {
    d: aortaPath(),
    fill: 'none',
    stroke: INK,
    class: 'aorta-core',
    'stroke-width': 1.2 + p * 1.1,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: 0.16 + p * 0.4,
  }));
}

function addMainPathBuilder(svg, statusEl) {
  const pathLayer = svgEl('path', { class: 'main-path', d: '' });
  const arcLayer = svgEl('path', { class: 'aorta-arc', d: '' });
  const magentaHandle = svgEl('circle', {
    class: 'magenta-handle',
    cx: '-1000',
    cy: '-1000',
    r: '7',
    fill: MAGENTA,
    stroke: '#fff',
    'stroke-width': '1.2',
  });
  svg.appendChild(pathLayer);
  svg.appendChild(arcLayer);
  svg.appendChild(magentaHandle);

  const allNodes = Array.from(svg.querySelectorAll('.node[data-node-idx]'));
  const selected = [];
  let drawing = false;
  let draggingHandle = false;
  let handleUnlocked = false;
  let handleAnchor = null;
  let handleOffset = { x: 0, y: 0 };

  const point = svg.createSVGPoint();
  const toLocal = (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };

  const nearestNode = (x, y) => {
    let best = null;
    let bestDist = Infinity;
    allNodes.forEach((node) => {
      const nx = parseFloat(node.getAttribute('cx'));
      const ny = parseFloat(node.getAttribute('cy'));
      const d = Math.hypot(nx - x, ny - y);
      if (d < bestDist) {
        bestDist = d;
        best = node;
      }
    });
    return bestDist <= 64 ? best : null;
  };

  const updateLayers = () => {
    const points = selected.map((node) => ({
      x: parseFloat(node.getAttribute('cx')),
      y: parseFloat(node.getAttribute('cy')),
    }));

    pathLayer.setAttribute('d', points.length > 1 ? pathFrom(points) : '');

    const progress = Math.min(points.length / 8, 1);
    if (statusEl) {
      statusEl.textContent = `Main path ${Math.min(points.length, 8)} / 8`;
    }
    if (progress >= 0.35) {
      const arcCount = Math.max(4, Math.round(3 + progress * (BRIDGE_CURVE.length - 3)));
      const arcPtsBase = BRIDGE_CURVE.slice(0, arcCount);
      handleAnchor = arcPtsBase[arcPtsBase.length - 1];
      if (!handleUnlocked) {
        handleUnlocked = true;
      }
      magentaHandle.setAttribute('cx', String(handleAnchor.x + handleOffset.x));
      magentaHandle.setAttribute('cy', String(handleAnchor.y + handleOffset.y));
      magentaHandle.classList.add('unlocked');
      magentaHandle.setAttribute('pointer-events', 'auto');

      const arcPts = arcPtsBase.map((p) => ({ x: p.x + handleOffset.x, y: p.y + handleOffset.y }));
      arcLayer.setAttribute('d', pathFrom(arcPts));
      arcLayer.setAttribute('opacity', String(0.32 + progress * 0.48));
      if (statusEl && handleUnlocked) {
        statusEl.textContent = `Main path ${Math.min(points.length, 8)} / 8 · magenta control unlocked`;
      }
    } else {
      arcLayer.setAttribute('d', '');
      arcLayer.setAttribute('opacity', '0');
      handleUnlocked = false;
      handleOffset = { x: 0, y: 0 };
      magentaHandle.setAttribute('cx', '-1000');
      magentaHandle.setAttribute('cy', '-1000');
      magentaHandle.classList.remove('unlocked');
      magentaHandle.setAttribute('pointer-events', 'none');
    }
  };

  const tryAddNode = (node) => {
    if (!node) return;
    if (selected.includes(node)) return;
    const prev = selected[selected.length - 1];
    if (prev) {
      const px = parseFloat(prev.getAttribute('cx'));
      const nx = parseFloat(node.getAttribute('cx'));
      const py = parseFloat(prev.getAttribute('cy'));
      const ny = parseFloat(node.getAttribute('cy'));
      if (Math.hypot(nx - px, ny - py) > 140) return;
    }
    selected.push(node);
    node.classList.add('selected-node');
    updateLayers();
  };

  const onDown = (e) => {
    if (handleUnlocked && e.target?.closest('.magenta-handle')) {
      draggingHandle = true;
      return;
    }
    drawing = true;
    selected.splice(0, selected.length);
    allNodes.forEach((n) => n.classList.remove('selected-node'));
    handleOffset = { x: 0, y: 0 };
    magentaHandle.classList.remove('unlocked');
    if (statusEl) statusEl.textContent = 'Main path 0 / 8';
    const p = toLocal(e);
    tryAddNode(nearestNode(p.x, p.y));
    updateLayers();
  };

  const onMove = (e) => {
    if (draggingHandle && handleUnlocked && handleAnchor) {
      const p = toLocal(e);
      handleOffset.x = Math.max(-32, Math.min(32, p.x - handleAnchor.x));
      handleOffset.y = Math.max(-28, Math.min(28, p.y - handleAnchor.y));
      updateLayers();
      return;
    }
    if (!drawing) return;
    const p = toLocal(e);
    tryAddNode(nearestNode(p.x, p.y));
  };

  const onUp = () => {
    draggingHandle = false;
    drawing = false;
    if (statusEl && selected.length < 4) {
      statusEl.textContent = 'Keep drawing through nodes to reveal the aorta arc';
    }
  };

  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  return () => {
    svg.removeEventListener('pointerdown', onDown);
    svg.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
}

function addValidationFlowSpline(svg, statusEl) {
  const mainSpline = svgEl('path', { class: 'validation-main-spline', d: '' });
  svg.appendChild(mainSpline);

  const flowPaths = [];
  const flowCount = 22;
  for (let i = 0; i < flowCount; i += 1) {
    const p = svgEl('path', { class: 'flow-line-magenta', d: '' });
    svg.appendChild(p);
    flowPaths.push(p);
  }

  const handle = svgEl('circle', {
    class: 'flow-handle-magenta',
    cx: '0',
    cy: '0',
    r: '7.5',
    fill: MAGENTA,
    stroke: '#fff',
    'stroke-width': '1.2',
  });
  svg.appendChild(handle);

  let dragging = false;
  let offsetY = 0;

  const point = svg.createSVGPoint();
  const toLocal = (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };

  const buildPoints = () => {
    const spine = buildMagentaSpinePoints();
    return spine.map((p, idx) => {
      const influence = Math.exp(-((idx - 2) ** 2) / 2.4);
      return {
        x: p.x,
        y: p.y + offsetY * influence,
      };
    });
  };

  const update = () => {
    const points = buildPoints();
    mainSpline.setAttribute('d', pathFrom(points));
    mainSpline.classList.toggle('evolved', Math.abs(offsetY) > 22);

    flowPaths.forEach((pathEl, i) => {
      const t = i / (flowPaths.length - 1);
      const pi = Math.min(points.length - 2, Math.max(2, Math.round(2 + t * (points.length - 4))));
      const tgt = points[pi];
      const y = 110 + i * 5.4;
      pathEl.setAttribute('d', `M 26 ${y} C 95 ${y - 16}, 168 ${tgt.y - 7}, ${tgt.x} ${tgt.y}`);
    });

    const anchor = points[Math.floor(points.length / 2)];
    handle.setAttribute('cx', String(anchor.x));
    handle.setAttribute('cy', String(anchor.y));

    if (statusEl) {
      statusEl.textContent = `Validation spline offset ${Math.round(offsetY)}`;
    }
  };

  const onDown = (e) => {
    if (!e.target?.closest('.flow-handle-magenta')) return;
    dragging = true;
  };

  const onMove = (e) => {
    if (!dragging) return;
    const p = toLocal(e);
    const base = buildMagentaSpinePoints()[Math.floor(CLUSTER_CENTERS.length / 2)].y;
    offsetY = Math.max(-60, Math.min(60, p.y - base));
    update();
  };

  const onUp = () => {
    dragging = false;
  };

  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  update();

  return () => {
    svg.removeEventListener('pointerdown', onDown);
    svg.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
}

function addCoupledBowDynamics(svg, statusEl) {
  const magentaBack = svgEl('path', { class: 'magenta-depth-back', d: '' });
  const magentaMain = svgEl('path', { class: 'validation-main-spline coupled', d: '' });
  const magentaHighlight = svgEl('path', { class: 'magenta-depth-highlight', d: '' });
  svg.appendChild(magentaBack);
  svg.appendChild(magentaMain);
  svg.appendChild(magentaHighlight);

  const flowPaths = [];
  for (let i = 0; i < 16; i += 1) {
    const p = svgEl('path', { class: 'flow-line-magenta', d: '' });
    svg.appendChild(p);
    flowPaths.push(p);
  }

  const bowShadow = svgEl('path', {
    d: reactiveAortaPath(0),
    class: 'aortic-depth-shadow',
    fill: 'none',
    stroke: '#6e6e6e',
    'stroke-width': 3.8,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  const bowCore = svgEl('path', {
    d: reactiveAortaPath(0),
    class: 'final-bow-emphasis coupled-core',
    fill: 'none',
    stroke: INK,
    'stroke-width': 2.8,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  const bowHighlight = svgEl('path', {
    d: reactiveAortaPath(0),
    class: 'aortic-depth-highlight',
    fill: 'none',
    stroke: '#fff',
    'stroke-width': 1.2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.appendChild(bowShadow);
  svg.appendChild(bowCore);
  svg.appendChild(bowHighlight);

  const handle = svgEl('circle', {
    class: 'flow-handle-magenta',
    cx: '0',
    cy: '0',
    r: '7.5',
    fill: MAGENTA,
    stroke: '#fff',
    'stroke-width': '1.2',
  });
  svg.appendChild(handle);

  let dragging = false;
  let offsetY = 0;

  const point = svg.createSVGPoint();
  const toLocal = (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };

  const buildMagentaPoints = () => {
    const spine = buildMagentaSpinePoints();
    return spine.map((p, idx) => {
      const influence = Math.exp(-((idx - 2) ** 2) / 2.5);
      return { x: p.x, y: p.y + offsetY * influence };
    });
  };

  const update = () => {
    const magentaPoints = buildMagentaPoints();
    const d = pathFrom(magentaPoints);
    magentaMain.setAttribute('d', d);
    magentaBack.setAttribute('d', d);
    magentaHighlight.setAttribute('d', d);

    flowPaths.forEach((pathEl, i) => {
      const t = i / (flowPaths.length - 1);
      const pi = Math.min(magentaPoints.length - 1, Math.max(1, Math.round(1 + t * (magentaPoints.length - 2))));
      const tgt = magentaPoints[pi];
      const y = 122 + i * 4.4;
      pathEl.setAttribute('d', `M 26 ${y} C 94 ${y - 13}, 170 ${tgt.y - 8}, ${tgt.x} ${tgt.y}`);
    });

    const center = magentaPoints[Math.floor(magentaPoints.length / 2)];
    handle.setAttribute('cx', String(center.x));
    handle.setAttribute('cy', String(center.y));

    const react = Math.max(-1, Math.min(1, offsetY / 52));
    const bowPath = reactiveAortaPath(react);
    bowShadow.setAttribute('d', bowPath);
    bowCore.setAttribute('d', bowPath);
    bowHighlight.setAttribute('d', bowPath);

    const tx = react * 2.5;
    const ty = react * 3.5;
    const transform = `translate(${tx} ${ty})`;
    bowShadow.setAttribute('transform', transform);
    bowCore.setAttribute('transform', transform);
    bowHighlight.setAttribute('transform', transform);

    bowShadow.setAttribute('opacity', String(0.22 + Math.abs(react) * 0.18));
    bowHighlight.setAttribute('opacity', String(0.45 + Math.abs(react) * 0.28));

    if (statusEl) {
      statusEl.textContent = `Magenta-to-bow coupling ${Math.round(react * 100)}% · shape morph active`;
    }
  };

  const onDown = (e) => {
    if (!e.target?.closest('.flow-handle-magenta')) return;
    dragging = true;
  };

  const onMove = (e) => {
    if (!dragging) return;
    const p = toLocal(e);
    const base = buildMagentaSpinePoints()[Math.floor(CLUSTER_CENTERS.length / 2)].y;
    offsetY = Math.max(-60, Math.min(60, p.y - base));
    update();
  };

  const onUp = () => {
    dragging = false;
  };

  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  update();

  return () => {
    svg.removeEventListener('pointerdown', onDown);
    svg.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
}

function addNodeMotion(svg) {
  const nodes = Array.from(svg.querySelectorAll('.node'));
  if (!nodes.length) return () => {};

  const base = nodes.map((node, idx) => ({
    node,
    x: parseFloat(node.getAttribute('cx')),
    y: parseFloat(node.getAttribute('cy')),
    amp: 0.55 + (idx % 6) * 0.18,
    speed: 0.00034 + (idx % 7) * 0.00008,
    phase: idx * 0.7,
  }));

  let rafId = null;
  let running = true;
  const startTs = performance.now();

  const tick = (ts) => {
    if (!running) return;
    const t = ts - startTs;
    base.forEach((item) => {
      const dx = Math.sin(t * item.speed + item.phase) * item.amp;
      const dy = Math.cos(t * item.speed * 0.92 + item.phase) * item.amp;
      item.node.setAttribute('cx', String(item.x + dx));
      item.node.setAttribute('cy', String(item.y + dy));
    });
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  };
}

function aortaPath() {
  return 'M 215 265 C 160 245 150 175 190 138 C 228 103 285 112 314 147 C 339 178 329 213 314 239 C 300 265 291 307 304 350 M 314 147 C 330 110 345 84 359 50 M 288 128 C 293 93 290 64 284 39 M 256 124 C 249 89 235 64 219 47 M 226 132 C 210 105 190 84 168 68';
}

function reactiveAortaPath(coupling) {
  const r = Math.max(-1, Math.min(1, coupling));
  return [
    `M ${215 - r * 6} ${265 + r * 4}`,
    `C ${160 - r * 10} ${245 + r * 10} ${150 - r * 12} ${175 + r * 2} ${190 - r * 8} ${138 - r * 12}`,
    `C ${228 - r * 5} ${103 - r * 10} ${285 + r * 7} ${112 + r * 12} ${314 + r * 9} ${147 + r * 7}`,
    `C ${339 + r * 7} ${178 + r * 10} ${329 + r * 5} ${213 + r * 10} ${314 + r * 2} ${239 + r * 12}`,
    `C ${300 + r * 2} ${265 + r * 12} ${291 + r * 4} ${307 + r * 8} ${304 + r * 8} ${350 + r * 12}`,
    `M ${314 + r * 8} ${147 + r * 7} C ${330 + r * 8} ${110 + r * 7} ${345 + r * 8} ${84 + r * 8} ${359 + r * 10} ${50 + r * 9}`,
    `M ${288 + r * 5} ${128 + r * 7} C ${293 + r * 6} ${93 + r * 7} ${290 + r * 5} ${64 + r * 7} ${284 + r * 6} ${39 + r * 8}`,
    `M ${256 + r * 3} ${124 + r * 7} C ${249 + r * 2} ${89 + r * 8} ${235 + r * 1} ${64 + r * 8} ${219 - r * 1} ${47 + r * 9}`,
    `M ${226 - r * 2} ${132 + r * 9} C ${210 - r * 3} ${105 + r * 10} ${190 - r * 4} ${84 + r * 10} ${168 - r * 5} ${68 + r * 10}`,
  ].join(' ');
}

function addAorta(svg, detailed = true) {
  const outline = svgEl('path', {
    d: aortaPath(),
    fill: 'none',
    stroke: INK,
    'stroke-width': detailed ? 2 : 2.8,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });
  svg.appendChild(outline);

  if (detailed) {
    const nodes = [];
    for (let i = 0; i < 70; i += 1) {
      const angle = (i / 69) * Math.PI * 1.35 + 0.2;
      const r = 95 + (Math.random() - 0.5) * 34;
      const x = 250 + Math.cos(angle) * r;
      const y = 220 - Math.sin(angle) * r * 0.85;
      if (x > 130 && x < 390 && y > 55 && y < 350) {
        nodes.push({ x, y });
      }
    }
    nodes.forEach((p, i) => {
      if (i < nodes.length - 1 && Math.random() > 0.28) {
        svg.appendChild(svgEl('line', { x1: p.x, y1: p.y, x2: nodes[i + 1].x, y2: nodes[i + 1].y, class: 'edge' }));
      }
    });
    addNodes(svg, nodes, 2.1, true);
  }
}

function renderVisual(svg, slide, index, interactive = true) {
  svg.setAttribute('viewBox', '28 36 544 332');
  svg.innerHTML = '';
  let interactionMode = 'drag';
  const type = slide.type;
  const formationProgress = FORMATION_STEPS[Math.max(0, Math.min(index, FORMATION_STEPS.length - 1))] || 0.2;

  if (type === 'reduction') {
    drawProgressiveGraph(svg, formationProgress, true);
    interactionMode = 'path';
  } else if (type === 'line') {
    drawClusteredNetwork(svg, true);
  } else if (type === 'magenta') {
    drawClusteredNetwork(svg, true);
    drawMagentaSpine(svg);
  } else if (type === 'flow' || type === 'flow-finalize') {
    drawProgressiveGraph(svg, formationProgress, true);
    svg.querySelectorAll('.bridge-guide-line, .aorta-glow, .aorta-core').forEach((el) => el.remove());
    interactionMode = 'flow-spline';
  } else if (type === 'final-bow') {
    drawProgressiveGraph(svg, 1, true);
    svg.querySelectorAll('.bridge-guide-line, .aorta-glow, .aorta-core').forEach((el) => el.remove());
    interactionMode = 'coupled-bow';
  } else {
    drawProgressiveGraph(svg, formationProgress, interactive);
  }

  if (type === 'optimisation') {
    const lines = 26;
    for (let i = 0; i < lines; i += 1) {
      const y = 126 + i * 4.8;
      const endX = 230 + (i % 9) * 14;
      svg.appendChild(svgEl('path', {
        d: `M 15 ${y} C 110 ${y - 18}, 155 ${y - 7}, ${endX} ${145 + (i % 10) * 8}`,
        fill: 'none',
        stroke: ACCENT,
        'stroke-width': 0.7,
        opacity: 0.28,
      }));
    }
  }

  if (type === 'logo') {
    const text = svgEl('text', { x: 300, y: 190, 'text-anchor': 'middle', 'font-size': 62, 'letter-spacing': 16, fill: INK });
    text.textContent = 'CALYRAI';
    svg.appendChild(text);
    svg.appendChild(svgEl('circle', { cx: 361, cy: 170, r: 5, fill: ACCENT }));
    svg.appendChild(svgEl('line', { x1: 270, y1: 235, x2: 330, y2: 235, stroke: ACCENT, 'stroke-width': 2 }));
    const sub = svgEl('text', { x: 300, y: 285, 'text-anchor': 'middle', 'font-size': 12, 'letter-spacing': 7, fill: '#555' });
    sub.textContent = '';
    svg.appendChild(sub);
  }

  return { mode: interactionMode };
}

function enableDragging(svg) {
  let selected = null;
  let offset = { x: 0, y: 0 };
  const pt = svg.createSVGPoint();

  const coords = (e) => {
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const down = (e) => {
    const target = e.target.closest('.node');
    if (!target) return;
    selected = target;
    const p = coords(e);
    offset.x = p.x - parseFloat(target.getAttribute('cx'));
    offset.y = p.y - parseFloat(target.getAttribute('cy'));
    if (selected.setPointerCapture) {
      try {
        selected.setPointerCapture(e.pointerId);
      } catch {
        // Ignore when pointer capture is unavailable for synthetic/ended pointer events.
      }
    }
  };

  const move = (e) => {
    if (!selected) return;
    const p = coords(e);
    selected.setAttribute('cx', p.x - offset.x);
    selected.setAttribute('cy', p.y - offset.y);
  };

  const up = () => {
    selected = null;
  };

  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);

  return () => {
    svg.removeEventListener('pointerdown', down);
    svg.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
}

function openSlide(i) {
  active = i;
  if (activeCleanup) activeCleanup();

  stage.innerHTML = '';

  const s = slides[i];
  const shell = document.createElement('div');
  shell.className = 'slide-shell';

  const wrap = document.createElement('div');
  wrap.className = 'slide-canvas-wrap';
  const svg = svgEl('svg', { class: 'slide-canvas', viewBox: '0 0 600 400' });
  wrap.appendChild(svg);
  const interactionStatus = document.createElement('div');
  interactionStatus.className = 'interaction-status';
  interactionStatus.textContent = 'Main path 0 / 8';
  interactionStatus.hidden = true;
  wrap.appendChild(interactionStatus);

  const info = document.createElement('aside');
  info.className = 'slide-info';
  info.innerHTML = `<div><div class="slide-num">${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</div><h1 class="slide-title">${s.title}</h1><p class="slide-subtitle">${s.subtitle}</p><p class="slide-story">${s.story}</p></div><p class="slide-hint">${s.hint || deckUi.default_hint}</p>`;

  shell.append(info, wrap);
  stage.appendChild(shell);

  requestAnimationFrame(() => {
    shell.classList.add('is-visible');
  });

  const interaction = renderVisual(svg, s, i, true);
  let interactionCleanup;
  if (interaction.mode === 'path') {
    interactionStatus.hidden = false;
    interactionCleanup = addMainPathBuilder(svg, interactionStatus);
  } else if (interaction.mode === 'flow-spline') {
    interactionStatus.hidden = false;
    const flowCleanup = addValidationFlowSpline(svg, interactionStatus);
    const dragCleanup = enableDragging(svg);
    interactionCleanup = () => {
      flowCleanup?.();
      dragCleanup?.();
    };
  } else if (interaction.mode === 'coupled-bow') {
    interactionStatus.hidden = false;
    const coupledCleanup = addCoupledBowDynamics(svg, interactionStatus);
    const dragCleanup = enableDragging(svg);
    interactionCleanup = () => {
      coupledCleanup?.();
      dragCleanup?.();
    };
  } else {
    interactionCleanup = enableDragging(svg);
  }

  const motionCleanup = addNodeMotion(svg);
  activeCleanup = () => {
    interactionCleanup?.();
    motionCleanup?.();
  };
  slideCounter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
}

function restartDeck() {
  if (activeCleanup) activeCleanup();
  openSlide(0);
}

function next() {
  if (active < 0) {
    openSlide(0);
    return;
  }
  openSlide(Math.min(slides.length - 1, active + 1));
}

function prev() {
  if (active < 0) {
    openSlide(0);
    return;
  }
  openSlide(Math.max(0, active - 1));
}

document.querySelector('#overviewBtn').addEventListener('click', restartDeck);
document.querySelector('#nextBtn').addEventListener('click', next);
document.querySelector('#prevBtn').addEventListener('click', prev);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'Escape') restartDeck();
});

async function boot() {
  applyDeckConfig(DEFAULT_DECK_CONFIG);
  try {
    const yamlConfig = await DeckConfigLoader.load('/research/lithos/deck.config.yaml');
    applyDeckConfig(yamlConfig);
  } catch (err) {
    // Keep defaults when YAML is unavailable or malformed.
    console.warn('Deck config fallback to defaults:', err?.message || err);
  }
  openSlide(0);
}

boot();
