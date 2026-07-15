const ACCENT = '#fff';
const INK = '#f2f2f2';
const MAGENTA = '#e500b5';
const CYAN = '#44dbff';

class DeckConfigLoader {
  static async load(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Deck config fetch failed (${response.status})`);
    }
    const text = await response.text();
    const config = this.parseYaml(text);
    if (!Array.isArray(config.slides) || config.slides.length === 0) {
      throw new Error('Deck config must contain at least one slide');
    }
    return config;
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
  page: {
    language: 'en',
    title: 'calyr.aí | Interactive Deck',
    description: 'An interactive calyr.aí visual story showing how scientific data converges into an editable three-dimensional aortic arch.',
    canonical: 'https://calyr.ai/research/lithos/index.html',
    theme_color: '#000000',
  },
  interaction: {
    swipe_enabled: true,
    swipe_threshold: 64,
    swipe_max_vertical_ratio: .72,
  },
  ui: {
    pitch_link_label: 'Pitch Deck',
    footer_primary: 'FROM DATA TO FORM.',
    footer_secondary: 'FROM COMPLEXITY TO INTELLIGENCE.',
    default_hint: 'Use left/right arrows, the top buttons, or swipe horizontally on a phone.',
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
  { title: 'Phase-Space Seeds.', subtitle: 'Data points are only weakly connected.', story: 'At first, points move in phase space with minimal coupling, and each one is individually optimized before global structure emerges.', type: 'line', hint: 'Sparse links only: observe phase-space motion, then drag points to test individual optimization behavior.' },
  { title: 'Magenta Linkage.', subtitle: 'A surrogate model links data domains.', story: 'A surrogate model is introduced to connect experimental data points with theoretical data points into one coherent latent structure.', type: 'magenta', hint: 'Observe how the surrogate linkage aligns experimental and theoretical datapoints.' },
  { title: 'Flow Conditioning.', subtitle: 'Surrogate model and datapoint modes are connected.', story: 'The surrogate model is now coupled to experimental and theoretical datapoint modes, so changes in one mode propagate through the connected structure.', type: 'flow', hint: 'Move the control points to see connected surrogate and datapoint modes co-adapt in real time.' },
  { title: 'Convergence.', subtitle: 'Magenta boundary conditions are introduced.', story: 'Magenta boundary conditions are introduced and implemented directly in the surrogate model, constraining how connected datapoint modes evolve.', type: 'flow-finalize', hint: 'Adjust the magenta controls to modify boundary conditions and observe the surrogate model response.' },
  { title: 'Final Aortic Bow.', subtitle: 'Best bow form appears at the end.', story: 'Only at the end, the stabilized result is shown as the final aortic bow.', type: 'final-bow', hint: 'Drag on the model to rotate in 3D and inspect the organic aortic bow with stent lattice.' }
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
let activeCrownScene = null;
let previousConvergenceState = null;
const BEST_STENT_GUIDE_POINTS = [
  { x: 188, y: 242 },
  { x: 184, y: 176 },
  { x: 222, y: 134 },
  { x: 286, y: 142 },
  { x: 320, y: 196 },
];

const stage = document.querySelector('#stage');
const slideCounter = document.querySelector('#slideCounter');
const pitchLinkEl = document.querySelector('.topbar-right .home-link');
const footerSpans = Array.from(document.querySelectorAll('.footer span'));
let active = -1;
let activeCleanup = null;
let deckUi = { ...DEFAULT_DECK_CONFIG.ui };
let deckInteraction = { ...DEFAULT_DECK_CONFIG.interaction };

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
  const page = config.page && typeof config.page === 'object' ? config.page : {};
  const pageConfig = { ...DEFAULT_DECK_CONFIG.page, ...page };
  document.documentElement.lang = String(pageConfig.language || 'en');
  document.title = String(pageConfig.title);
  document.querySelector('meta[name="description"]')?.setAttribute('content', String(pageConfig.description));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', String(pageConfig.theme_color));
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', String(pageConfig.title));
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', String(pageConfig.description));
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', String(pageConfig.canonical));
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', String(pageConfig.canonical));

  const interaction = config.interaction && typeof config.interaction === 'object' ? config.interaction : {};
  deckInteraction = {
    swipe_enabled: interaction.swipe_enabled !== false,
    swipe_threshold: Math.max(40, Number(interaction.swipe_threshold) || DEFAULT_DECK_CONFIG.interaction.swipe_threshold),
    swipe_max_vertical_ratio: Math.max(.35, Math.min(1, Number(interaction.swipe_max_vertical_ratio) || DEFAULT_DECK_CONFIG.interaction.swipe_max_vertical_ratio)),
  };
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

function drawConnectedPointClouds(svg, interactiveNodes = true) {
  const clusterGroups = CLUSTER_CENTERS.map(() => []);

  CLUSTER_FIELD.forEach((node, nodeIdx) => {
    let nearestCluster = 0;
    let nearestDist = Infinity;
    CLUSTER_CENTERS.forEach((center, centerIdx) => {
      const dist = (node.x - center.x) ** 2 + (node.y - center.y) ** 2;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCluster = centerIdx;
      }
    });
    clusterGroups[nearestCluster].push(nodeIdx);
  });

  CLUSTER_FIELD.forEach((a, i) => {
    const nearest = CLUSTER_FIELD
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((u, v) => u.d - v.d)
      .slice(0, 5);

    nearest.forEach(({ j, d }) => {
      if (j <= i || d > 132 * 132) return;
      svg.appendChild(svgEl('line', {
        x1: a.x,
        y1: a.y,
        x2: CLUSTER_FIELD[j].x,
        y2: CLUSTER_FIELD[j].y,
        stroke: MAGENTA,
        'stroke-width': '0.85',
        opacity: '0.42',
        'stroke-linecap': 'round',
        'data-edge-from': String(i),
        'data-edge-to': String(j),
      }));
    });
  });

  // Explicitly bridge neighboring cloud groups so all groups are connected by edges.
  for (let groupIdx = 0; groupIdx < clusterGroups.length - 1; groupIdx += 1) {
    const fromGroup = clusterGroups[groupIdx];
    const toGroup = clusterGroups[groupIdx + 1];
    if (!fromGroup.length || !toGroup.length) continue;

    let bestPair = null;
    let bestDist = Infinity;

    fromGroup.forEach((fromIdx) => {
      const a = CLUSTER_FIELD[fromIdx];
      toGroup.forEach((toIdx) => {
        const b = CLUSTER_FIELD[toIdx];
        const dist = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestPair = { a, b };
        }
      });
    });

    if (bestPair) {
      const fromIdx = CLUSTER_FIELD.indexOf(bestPair.a);
      const toIdx = CLUSTER_FIELD.indexOf(bestPair.b);
      svg.appendChild(svgEl('line', {
        x1: bestPair.a.x,
        y1: bestPair.a.y,
        x2: bestPair.b.x,
        y2: bestPair.b.y,
        stroke: MAGENTA,
        'stroke-width': '1.05',
        opacity: '0.78',
        'stroke-linecap': 'round',
        'data-edge-from': String(fromIdx),
        'data-edge-to': String(toIdx),
      }));
    }
  }

  const nodeCountBefore = svg.querySelectorAll('.node').length;
  addNodes(svg, CLUSTER_FIELD, 2.3, interactiveNodes);
  const nodeEls = Array.from(svg.querySelectorAll('.node')).slice(nodeCountBefore);
  clusterGroups.forEach((group, clusterId) => {
    group.forEach((nodeIdx) => {
      const nodeEl = nodeEls[nodeIdx];
      if (nodeEl) {
        nodeEl.setAttribute('data-cluster-id', String(clusterId));
      }
    });
  });
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

function drawMainCurveWithAdditives(svg) {
  const baseMainPoints = interpolatePoints(buildMagentaSpinePoints(), buildBestStentGuidePoints(), 0.9);

  const getOrientationState = (offsets) => {
    const samples = offsets || crownOffsets;
    if (!samples.length) {
      return { tilt: 0, yaw: 0, divergence: 0 };
    }
    const meanX = samples.reduce((sum, p) => sum + p.x, 0) / samples.length;
    const meanY = samples.reduce((sum, p) => sum + p.y, 0) / samples.length;
    const divergenceRaw = samples[samples.length - 1].x - samples[0].x;
    return {
      tilt: clamp(meanY / 56, -1, 1),
      yaw: clamp(meanX / 48, -1, 1),
      divergence: clamp(divergenceRaw / 96, -1, 1),
    };
  };

  const mainPath = svgEl('path', {
    d: pathFrom(baseMainPoints),
    fill: 'none',
    stroke: MAGENTA,
    'stroke-width': 2.1,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: 0.94,
  });
  svg.appendChild(mainPath);

  const additiveShapes = [
    { anchorIdx: 1, dx1: -26, dy1: -18, dx2: -54, dy2: -44, dx3: -78, dy3: -66 },
    { anchorIdx: 2, dx1: 8, dy1: -20, dx2: 18, dy2: -44, dx3: 26, dy3: -70 },
    { anchorIdx: 3, dx1: 30, dy1: -12, dx2: 58, dy2: -30, dx3: 82, dy3: -48 },
  ];

  const branchPaths = additiveShapes.map(() => {
    const el = svgEl('path', {
      fill: 'none',
      stroke: MAGENTA,
      'stroke-width': 1.3,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      opacity: 0.85,
    });
    svg.appendChild(el);
    return el;
  });

  const crownHandles = additiveShapes.map((_, idx) => {
    const el = svgEl('circle', {
      r: '4.3',
      fill: MAGENTA,
      opacity: 0.96,
      class: 'flow-handle-magenta crown-handle',
      'data-crown-idx': String(idx),
    });
    svg.appendChild(el);
    return el;
  });

  const crownOffsets = additiveShapes.map(() => ({ x: 0, y: 0 }));
  const scene = {
    svg,
    baseMainPoints,
    additiveShapes,
    crownOffsets,
    crownHandles,
    currentMainPoints: baseMainPoints.map((point) => ({ ...point })),
    getOrientationState: () => getOrientationState(crownOffsets),
    onCrownChange: null,
    update: null,
  };

  const update = () => {
    const mainPoints = baseMainPoints.map((p, idx) => {
      let dx = 0;
      let dy = 0;
      additiveShapes.forEach((shape, crownIdx) => {
        const influence = Math.exp(-((idx - shape.anchorIdx) ** 2) / 0.95);
        dx += crownOffsets[crownIdx].x * influence * 0.22;
        dy += crownOffsets[crownIdx].y * influence * 0.24;
      });
      return { x: p.x + dx, y: p.y + dy };
    });

    mainPath.setAttribute('d', pathFrom(mainPoints));

    additiveShapes.forEach((shape, idx) => {
      const anchor = mainPoints[shape.anchorIdx];
      if (!anchor) return;
      const offset = crownOffsets[idx];
      const c1x = anchor.x + shape.dx1 + offset.x * 0.45;
      const c1y = anchor.y + shape.dy1 + offset.y * 0.45;
      const c2x = anchor.x + shape.dx2 + offset.x * 0.75;
      const c2y = anchor.y + shape.dy2 + offset.y * 0.75;
      const endX = anchor.x + shape.dx3 + offset.x;
      const endY = anchor.y + shape.dy3 + offset.y;
      branchPaths[idx].setAttribute('d', `M ${anchor.x} ${anchor.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`);
      crownHandles[idx].setAttribute('cx', String(endX));
      crownHandles[idx].setAttribute('cy', String(endY));
    });

    const orientation = scene.getOrientationState();
    if (scene.onCrownChange) {
      scene.onCrownChange(orientation);
    }
  };

  update();
  scene.update = update;
  activeCrownScene = scene;
}

function addCrownHandleControls(svg, statusEl) {
  const scene = activeCrownScene;
  if (!scene || scene.svg !== svg) return () => {};

  let activeCrown = -1;
  const pt = svg.createSVGPoint();
  const toLocal = (e) => {
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const onDown = (e) => {
    const handle = e.target?.closest('.crown-handle');
    if (!handle) return;
    activeCrown = Number(handle.getAttribute('data-crown-idx'));
    scene.crownHandles.forEach((h, idx) => h.classList.toggle('is-active', idx === activeCrown));
    if (statusEl) statusEl.textContent = `Crown point ${activeCrown + 1} active`;
  };

  const onMove = (e) => {
    if (activeCrown < 0) return;
    const p = toLocal(e);
    const shape = scene.additiveShapes[activeCrown];
    const anchor = scene.baseMainPoints[shape.anchorIdx];
    const baseEndX = anchor.x + shape.dx3;
    const baseEndY = anchor.y + shape.dy3;
    scene.crownOffsets[activeCrown].x = clamp(p.x - baseEndX, -48, 48);
    scene.crownOffsets[activeCrown].y = clamp(p.y - baseEndY, -56, 56);
    scene.update();
    if (statusEl) statusEl.textContent = `Crown point ${activeCrown + 1} moved`;
  };

  const onUp = () => {
    activeCrown = -1;
    scene.crownHandles.forEach((h) => h.classList.remove('is-active'));
    if (statusEl) statusEl.textContent = 'Move the 3 crown points';
  };

  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  if (statusEl) statusEl.textContent = 'Move the 3 crown points';

  return () => {
    svg.removeEventListener('pointerdown', onDown);
    svg.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
}

function buildMagentaSpinePoints() {
  return CLUSTER_CENTERS.map((c, i) => ({
    x: c.x,
    y: c.y - 24 - Math.sin(i * 0.8) * 8,
  }));
}

function interpolatePoints(fromPoints, toPoints, t) {
  const amount = Math.max(0, Math.min(1, t));
  return fromPoints.map((point, index) => {
    const target = toPoints[Math.min(index, toPoints.length - 1)] || point;
    return {
      x: point.x + (target.x - point.x) * amount,
      y: point.y + (target.y - point.y) * amount,
    };
  });
}

function buildBestStentGuidePoints() {
  return BEST_STENT_GUIDE_POINTS.map((point) => ({ ...point }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
    scene.currentMainPoints = mainPoints.map((point) => ({ ...point }));
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
    const p = svgEl('path', { class: 'flow-line-cyan', d: '' });
    svg.appendChild(p);
    flowPaths.push(p);
  }

  const controlIndices = [1, 2, 3];
  const controlOffsets = controlIndices.map(() => ({ x: 0, y: 0 }));
  const handles = controlIndices.map((_, handleIdx) => {
    const handle = svgEl('circle', {
      class: 'flow-handle-magenta',
      cx: '0',
      cy: '0',
      r: '7.5',
      fill: MAGENTA,
      stroke: '#fff',
      'stroke-width': '1.2',
      'data-handle-idx': String(handleIdx),
    });
    svg.appendChild(handle);
    return handle;
  });

  let activeHandleIndex = -1;

  const point = svg.createSVGPoint();
  const toLocal = (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };

  const getBaseGuidePoints = () => {
    const spine = buildMagentaSpinePoints();
    const guide = buildBestStentGuidePoints();
    return interpolatePoints(spine, guide, 0.82);
  };

  const buildPoints = () => {
    const guided = getBaseGuidePoints();
    return guided.map((p, idx) => {
      let offsetX = 0;
      let offsetY = 0;
      controlIndices.forEach((controlIdx, localIdx) => {
        const influence = Math.exp(-((idx - controlIdx) ** 2) / 0.8);
        offsetX += controlOffsets[localIdx].x * influence;
        offsetY += controlOffsets[localIdx].y * influence;
      });
      return {
        x: p.x + offsetX,
        y: p.y + offsetY,
      };
    });
  };

  const measureGuideFit = () => {
    const offsetEnergy = controlOffsets.reduce((sum, offset) => sum + Math.hypot(offset.x, offset.y), 0);
    return Math.round(clamp(100 - offsetEnergy * 0.45, 72, 100));
  };

  const update = () => {
    const points = buildPoints();
    mainSpline.setAttribute('d', pathFrom(points));
    mainSpline.classList.toggle('evolved', measureGuideFit() >= 90);

    flowPaths.forEach((pathEl, i) => {
      const t = i / (flowPaths.length - 1);
      const pi = Math.min(points.length - 2, Math.max(2, Math.round(2 + t * (points.length - 4))));
      const tgt = points[pi];
      const y = 110 + i * 5.4;
      pathEl.setAttribute('d', `M 26 ${y} C 95 ${y - 16}, 168 ${tgt.y - 7}, ${tgt.x} ${tgt.y}`);
      pathEl.setAttribute('stroke', CYAN);
    });

    controlIndices.forEach((controlIdx, handleIdx) => {
      const anchor = points[controlIdx];
      handles[handleIdx].setAttribute('cx', String(anchor.x));
      handles[handleIdx].setAttribute('cy', String(anchor.y));
      handles[handleIdx].classList.toggle('is-active', handleIdx === activeHandleIndex);
    });

    if (statusEl) {
      statusEl.textContent = `Stent guide fit ${measureGuideFit()}% · ${controlIndices.length} control points`;
    }
  };

  const onDown = (e) => {
    const handle = e.target?.closest('.flow-handle-magenta');
    if (!handle) return;
    activeHandleIndex = Number(handle.getAttribute('data-handle-idx'));
    update();
  };

  const onMove = (e) => {
    if (activeHandleIndex < 0) return;
    const p = toLocal(e);
    const baseGuide = getBaseGuidePoints();
    const anchor = baseGuide[controlIndices[activeHandleIndex]];
    controlOffsets[activeHandleIndex].x = clamp(p.x - anchor.x, -26, 26);
    controlOffsets[activeHandleIndex].y = clamp(p.y - anchor.y, -46, 46);
    update();
  };

  const onUp = () => {
    activeHandleIndex = -1;
    update();
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
    const p = svgEl('path', { class: 'flow-line-cyan', d: '' });
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

  const controlIndices = [1, 2, 3];
  const controlOffsets = controlIndices.map(() => ({ x: 0, y: 0 }));
  const handles = controlIndices.map((_, handleIdx) => {
    const handle = svgEl('circle', {
      class: 'flow-handle-magenta',
      cx: '0',
      cy: '0',
      r: '7.5',
      fill: MAGENTA,
      stroke: '#fff',
      'stroke-width': '1.2',
      'data-handle-idx': String(handleIdx),
    });
    svg.appendChild(handle);
    return handle;
  });

  let activeHandleIndex = -1;

  const point = svg.createSVGPoint();
  const toLocal = (e) => {
    point.x = e.clientX;
    point.y = e.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  };

  const getBaseGuidePoints = () => {
    const spine = buildMagentaSpinePoints();
    const guide = buildBestStentGuidePoints();
    return interpolatePoints(spine, guide, 0.94);
  };

  const buildMagentaPoints = () => {
    const guided = getBaseGuidePoints();
    return guided.map((p, idx) => {
      let offsetX = 0;
      let offsetY = 0;
      controlIndices.forEach((controlIdx, localIdx) => {
        const influence = Math.exp(-((idx - controlIdx) ** 2) / 0.85);
        offsetX += controlOffsets[localIdx].x * influence;
        offsetY += controlOffsets[localIdx].y * influence;
      });
      return { x: p.x + offsetX, y: p.y + offsetY };
    });
  };

  const meanYOffset = () => controlOffsets.reduce((sum, offset) => sum + offset.y, 0) / controlOffsets.length;

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
      pathEl.setAttribute('stroke', CYAN);
    });

    controlIndices.forEach((controlIdx, handleIdx) => {
      const anchor = magentaPoints[controlIdx];
      handles[handleIdx].setAttribute('cx', String(anchor.x));
      handles[handleIdx].setAttribute('cy', String(anchor.y));
      handles[handleIdx].classList.toggle('is-active', handleIdx === activeHandleIndex);
    });

    const react = clamp(meanYOffset() / 52, -1, 1);
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
    magentaMain.classList.toggle('evolved', Math.abs(react) > 0.22);

    if (statusEl) {
      statusEl.textContent = `Best stent position locked · ${controlIndices.length} control points · bow coupling ${Math.round(Math.abs(react) * 100)}%`;
    }
  };

  const onDown = (e) => {
    const handle = e.target?.closest('.flow-handle-magenta');
    if (!handle) return;
    activeHandleIndex = Number(handle.getAttribute('data-handle-idx'));
    update();
  };

  const onMove = (e) => {
    if (activeHandleIndex < 0) return;
    const p = toLocal(e);
    const baseGuide = getBaseGuidePoints();
    const anchor = baseGuide[controlIndices[activeHandleIndex]];
    controlOffsets[activeHandleIndex].x = clamp(p.x - anchor.x, -22, 22);
    controlOffsets[activeHandleIndex].y = clamp(p.y - anchor.y, -42, 42);
    update();
  };

  const onUp = () => {
    activeHandleIndex = -1;
    update();
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
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};
  const nodes = Array.from(svg.querySelectorAll('.node'));
  if (!nodes.length) return () => {};

  const clusterProfiles = new Map();
  const ensureClusterProfile = (clusterId) => {
    if (!clusterProfiles.has(clusterId)) {
      const cid = Number(clusterId) || 0;
      clusterProfiles.set(clusterId, {
        amp: 0.7 + (cid % 3) * 0.18,
        speed: 0.00042 + cid * 0.00004,
        phase: cid * 0.9,
      });
    }
    return clusterProfiles.get(clusterId);
  };

  const base = nodes.map((node, idx) => {
    const clusterId = node.getAttribute('data-cluster-id');
    if (clusterId !== null) {
      const profile = ensureClusterProfile(clusterId);
      return {
        node,
        x: parseFloat(node.getAttribute('cx')),
        y: parseFloat(node.getAttribute('cy')),
        amp: profile.amp + (idx % 3) * 0.05,
        speed: profile.speed,
        phase: profile.phase + (idx % 4) * 0.22,
      };
    }

    return {
      node,
      x: parseFloat(node.getAttribute('cx')),
      y: parseFloat(node.getAttribute('cy')),
      amp: 0.55 + (idx % 6) * 0.18,
      speed: 0.00034 + (idx % 7) * 0.00008,
      phase: idx * 0.7,
    };
  });

  const edgeLinks = Array.from(svg.querySelectorAll('line[data-edge-from][data-edge-to]')).map((lineEl) => ({
    lineEl,
    from: lineEl.getAttribute('data-edge-from'),
    to: lineEl.getAttribute('data-edge-to'),
  }));

  let rafId = null;
  let running = true;
  const startTs = performance.now();

  const tick = (ts) => {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const t = ts - startTs;
    base.forEach((item) => {
      const dx = Math.sin(t * item.speed + item.phase) * item.amp;
      const dy = Math.cos(t * item.speed * 0.92 + item.phase) * item.amp;
      item.node.setAttribute('cx', String(item.x + dx));
      item.node.setAttribute('cy', String(item.y + dy));
    });

    if (edgeLinks.length) {
      const nodeMap = new Map();
      base.forEach((item) => {
        const idx = item.node.getAttribute('data-node-idx');
        if (idx !== null) {
          nodeMap.set(idx, {
            x: item.node.getAttribute('cx'),
            y: item.node.getAttribute('cy'),
          });
        }
      });

      edgeLinks.forEach((edge) => {
        const a = nodeMap.get(edge.from);
        const b = nodeMap.get(edge.to);
        if (!a || !b) return;
        edge.lineEl.setAttribute('x1', a.x);
        edge.lineEl.setAttribute('y1', a.y);
        edge.lineEl.setAttribute('x2', b.x);
        edge.lineEl.setAttribute('y2', b.y);
      });
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  };
}

function addNodeFlowThroughClouds(svg, statusEl) {
  const flowPaths = [];
  const flowCount = 12;
  for (let i = 0; i < flowCount; i += 1) {
    const flow = svgEl('path', { class: 'flow-line-cyan', d: '' });
    svg.appendChild(flow);
    flowPaths.push(flow);
  }

  const chooseAnchors = (nodes, targetY) => {
    const sorted = [...nodes].sort((a, b) => a.x - b.x);
    const anchors = [];
    const samples = 4;
    for (let s = 0; s < samples; s += 1) {
      const from = Math.floor((s / samples) * sorted.length);
      const to = Math.max(from + 1, Math.floor(((s + 1) / samples) * sorted.length));
      const slice = sorted.slice(from, to);
      if (!slice.length) continue;
      let best = slice[0];
      let bestDist = Math.abs(best.y - targetY);
      for (let j = 1; j < slice.length; j += 1) {
        const cand = slice[j];
        const dist = Math.abs(cand.y - targetY);
        if (dist < bestDist) {
          best = cand;
          bestDist = dist;
        }
      }
      anchors.push({ x: best.x, y: best.y });
    }
    return anchors;
  };

  let rafId = null;
  let running = true;

  const tick = () => {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const orientation = activeCrownScene?.getOrientationState?.() || { tilt: 0, yaw: 0, divergence: 0 };
    const nodes = Array.from(svg.querySelectorAll('.node[data-node-idx]')).map((node) => ({
      x: parseFloat(node.getAttribute('cx')),
      y: parseFloat(node.getAttribute('cy')),
    }));

    if (nodes.length >= 8) {
      flowPaths.forEach((flow, i) => {
        const centerOffset = (i - (flowPaths.length - 1) / 2);
        const y = 90 + i * 20 + orientation.tilt * 12 + centerOffset * orientation.divergence * 1.8;
        const anchors = chooseAnchors(nodes, y + orientation.yaw * 6);
        const points = [{ x: 24, y }, ...anchors, { x: 564, y: y + ((i % 3) - 1) * 4 + orientation.tilt * 8 }];
        flow.setAttribute('d', pathFrom(points));
        flow.setAttribute('opacity', String(0.3 + (i / flowPaths.length) * 0.24 + Math.abs(orientation.tilt) * 0.08));
      });
      if (statusEl) {
        statusEl.textContent = `Connected clouds + node flow · tilt ${Math.round(orientation.tilt * 100)}%`;
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
  };
}

function addDataPlateAlignment(svg) {
  const plates = CLUSTER_CENTERS.map((center, idx) => {
    const top = svgEl('line', {
      stroke: MAGENTA,
      'stroke-width': '1.05',
      opacity: '0.44',
      'stroke-linecap': 'round',
      class: 'data-plate-line',
      'data-plate-idx': String(idx),
    });
    const bottom = svgEl('line', {
      stroke: MAGENTA,
      'stroke-width': '1.05',
      opacity: '0.44',
      'stroke-linecap': 'round',
      class: 'data-plate-line',
      'data-plate-idx': String(idx),
    });
    svg.appendChild(top);
    svg.appendChild(bottom);
    return { center, idx, top, bottom };
  });

  const updateFromOrientation = (orientation) => {
    const state = orientation || { tilt: 0, yaw: 0, divergence: 0 };
    plates.forEach((plate) => {
      const angle = (-0.24 + plate.idx * 0.14) + state.tilt * 0.5 + state.yaw * 0.28 * (plate.idx - 2);
      const halfLength = 15 + (plate.idx % 2) * 3 + Math.abs(state.divergence) * 3;
      const separation = 7 + Math.abs(state.tilt) * 4;
      const dx = Math.cos(angle) * halfLength;
      const dy = Math.sin(angle) * halfLength;
      const nx = -Math.sin(angle) * (separation / 2);
      const ny = Math.cos(angle) * (separation / 2);

      plate.top.setAttribute('x1', String(plate.center.x - dx + nx));
      plate.top.setAttribute('y1', String(plate.center.y - dy + ny));
      plate.top.setAttribute('x2', String(plate.center.x + dx + nx));
      plate.top.setAttribute('y2', String(plate.center.y + dy + ny));

      plate.bottom.setAttribute('x1', String(plate.center.x - dx - nx));
      plate.bottom.setAttribute('y1', String(plate.center.y - dy - ny));
      plate.bottom.setAttribute('x2', String(plate.center.x + dx - nx));
      plate.bottom.setAttribute('y2', String(plate.center.y + dy - ny));
    });
  };

  updateFromOrientation({ tilt: 0, yaw: 0, divergence: 0 });

  const scene = activeCrownScene;
  if (scene && scene.svg === svg) {
    scene.onCrownChange = updateFromOrientation;
    updateFromOrientation(scene.getOrientationState());
  }

  return () => {
    plates.forEach((plate) => {
      plate.top.remove();
      plate.bottom.remove();
    });
    if (scene && scene.onCrownChange === updateFromOrientation) {
      scene.onCrownChange = null;
    }
  };
}

function addFinalBowOverlay(svg) {
  const bowShadow = svgEl('path', {
    d: reactiveAortaPath(0),
    class: 'aortic-depth-shadow',
    fill: 'none',
    stroke: '#6e6e6e',
    'stroke-width': 3.4,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: '0.34',
  });
  const bowCore = svgEl('path', {
    d: reactiveAortaPath(0),
    class: 'final-bow-emphasis coupled-core',
    fill: 'none',
    stroke: INK,
    'stroke-width': 2.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: '0.92',
  });
  const bowHighlight = svgEl('path', {
    d: reactiveAortaPath(0),
    class: 'aortic-depth-highlight',
    fill: 'none',
    stroke: '#fff',
    'stroke-width': 1.1,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    opacity: '0.62',
  });

  svg.appendChild(bowShadow);
  svg.appendChild(bowCore);
  svg.appendChild(bowHighlight);

  let rafId = null;
  let running = true;

  const tick = () => {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(tick);
      return;
    }
    const orientation = activeCrownScene?.getOrientationState?.() || { tilt: 0, yaw: 0, divergence: 0 };
    const coupling = clamp(orientation.tilt * 0.55 + orientation.yaw * 0.35 + orientation.divergence * 0.22, -1, 1);
    const path = reactiveAortaPath(coupling);

    bowShadow.setAttribute('d', path);
    bowCore.setAttribute('d', path);
    bowHighlight.setAttribute('d', path);

    const tx = coupling * 2.8;
    const ty = coupling * 3.9;
    const rot = orientation.yaw * 8.5;
    const transform = `translate(${tx} ${ty}) rotate(${rot} 286 178)`;
    bowShadow.setAttribute('transform', transform);
    bowCore.setAttribute('transform', transform);
    bowHighlight.setAttribute('transform', transform);

    bowShadow.setAttribute('opacity', String(0.24 + Math.abs(coupling) * 0.22));
    bowHighlight.setAttribute('opacity', String(0.45 + Math.abs(coupling) * 0.3));

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    bowShadow.remove();
    bowCore.remove();
    bowHighlight.remove();
  };
}

function addAortaPointCloudBridge(svg) {
  const edgeLayer = svgEl('g', { class: 'aorta-cloud-edges' });
  const nodeLayer = svgEl('g', { class: 'aorta-cloud-nodes' });
  const stentLayer = svgEl('g', { class: 'aorta-stent-lattice' });
  const linkLayer = svgEl('g', { class: 'aorta-bow-links' });
  svg.appendChild(edgeLayer);
  svg.appendChild(nodeLayer);
  svg.appendChild(stentLayer);
  svg.appendChild(linkLayer);

  const rand = createSeededRandom(20260714);

  const add3 = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
  const sub3 = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const mul3 = (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s });
  const dot3 = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const cross3 = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  });
  const norm3 = (v) => {
    const len = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  };

  const rotate3 = (p, rx, ry, rz) => {
    const cx = Math.cos(rx);
    const sx = Math.sin(rx);
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const cz = Math.cos(rz);
    const sz = Math.sin(rz);

    let x = p.x;
    let y = p.y * cx - p.z * sx;
    let z = p.y * sx + p.z * cx;

    const x2 = x * cy + z * sy;
    const y2 = y;
    const z2 = -x * sy + z * cy;

    x = x2 * cz - y2 * sz;
    y = x2 * sz + y2 * cz;
    z = z2;
    return { x, y, z };
  };

  const project = (p) => {
    const camera = 560;
    const focal = 430;
    const s = focal / Math.max(140, camera - p.z);
    return {
      x: 292 + p.x * s,
      y: 214 + p.y * s,
      scale: s,
      depth: p.z,
    };
  };

  const resample3D = (points, samples) => {
    if (!points.length) return [];
    const lengths = [0];
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      lengths.push(lengths[i - 1] + Math.hypot(curr.x - prev.x, curr.y - prev.y, curr.z - prev.z));
    }
    const total = lengths[lengths.length - 1] || 1;
    return Array.from({ length: samples }, (_, idx) => {
      const target = (idx / (samples - 1)) * total;
      let seg = 1;
      while (seg < lengths.length && lengths[seg] < target) seg += 1;
      const i = Math.min(seg, lengths.length - 1);
      const l0 = lengths[i - 1];
      const l1 = lengths[i] || l0 + 1;
      const t = (target - l0) / Math.max(1e-6, l1 - l0);
      const a = points[i - 1];
      const b = points[i];
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      };
    });
  };

  const tubeNodes = [];
  const tubeEdges = [];
  const stentEdges = [];
  const branchAnchorIds = [];
  const bowConnectorNodeIds = [];

  const mainControl = [
    { x: -130, y: 132, z: -18 },
    { x: -124, y: 76, z: -18 },
    { x: -98, y: 20, z: -26 },
    { x: -54, y: -36, z: -34 },
    { x: 2, y: -92, z: -24 },
    { x: 84, y: -100, z: 8 },
    { x: 144, y: -52, z: 44 },
    { x: 176, y: 18, z: 56 },
    { x: 186, y: 104, z: 38 },
    { x: 176, y: 168, z: 22 },
  ];

  const mainCenterline = resample3D(mainControl, 44);
  const mainFrames = [];
  const ringCount = 13;

  const addTube = (centerline, baseRadius, taper = 0.2, opts = {}) => {
    const ringStart = tubeNodes.length;
    const frameRows = [];
    centerline.forEach((c, idx) => {
      const prev = centerline[Math.max(0, idx - 1)];
      const next = centerline[Math.min(centerline.length - 1, idx + 1)];
      const tangent = norm3(sub3(next, prev));
      const upRef = Math.abs(tangent.y) > 0.88 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
      const normal = norm3(cross3(upRef, tangent));
      const binormal = norm3(cross3(tangent, normal));
      frameRows.push({ center: c, tangent, normal, binormal });

      const t = idx / Math.max(1, centerline.length - 1);
      const organic = 1 + Math.sin(t * Math.PI) * 0.2 + Math.cos(t * 4.2) * 0.06;
      const radius = baseRadius * (1 - t * taper) * organic;

      for (let lane = 0; lane < ringCount; lane += 1) {
        const angleBase = (lane / ringCount) * Math.PI * 2;
        const angle = angleBase + t * 0.58 + (rand() - 0.5) * 0.08;
        const rx = radius * (1 + 0.16 * Math.cos(angle * 2 + t));
        const ry = radius * 0.76 * (1 + 0.1 * Math.sin(angle * 3 - t));
        const offset = add3(mul3(normal, Math.cos(angle) * rx), mul3(binormal, Math.sin(angle) * ry));
        const node = add3(c, offset);
        tubeNodes.push(node);
      }
    });

    for (let s = 0; s < centerline.length - 1; s += 1) {
      for (let lane = 0; lane < ringCount; lane += 1) {
        const i0 = ringStart + s * ringCount + lane;
        const i1 = ringStart + (s + 1) * ringCount + lane;
        tubeEdges.push({ a: i0, b: i1, kind: 'cloud' });
        const j = ringStart + s * ringCount + ((lane + 1) % ringCount);
        tubeEdges.push({ a: i0, b: j, kind: 'cloud' });
        if (opts.diagonals !== false) {
          const d1 = ringStart + (s + 1) * ringCount + ((lane + 1) % ringCount);
          const d2 = ringStart + (s + 1) * ringCount + ((lane - 1 + ringCount) % ringCount);
          tubeEdges.push({ a: i0, b: d1, kind: 'cloud' });
          if (lane % 2 === 0) tubeEdges.push({ a: i0, b: d2, kind: 'cloud' });
        }
      }
    }

    return { ringStart, frameRows };
  };

  const mainTube = addTube(mainCenterline, 27, 0.24, { diagonals: true });
  mainFrames.push(...mainTube.frameRows);

  const branchDefs = [
    { section: 13, dir: { x: -66, y: -120, z: -26 }, radius: 10 },
    { section: 17, dir: { x: -16, y: -132, z: -12 }, radius: 11 },
    { section: 20, dir: { x: 42, y: -126, z: 22 }, radius: 10 },
  ];

  branchDefs.forEach((def, idx) => {
    const base = mainCenterline[def.section];
    const branchCtrl = [
      base,
      add3(base, mul3(def.dir, 0.34)),
      add3(base, mul3(def.dir, 0.68)),
      add3(base, def.dir),
    ];
    const centerline = resample3D(branchCtrl, 11);
    const branchTube = addTube(centerline, def.radius, 0.42, { diagonals: idx !== 1 });

    const branchRootRing = branchTube.ringStart;
    for (let lane = 0; lane < ringCount; lane += 3) {
      const mainIdx = mainTube.ringStart + def.section * ringCount + ((lane + 3) % ringCount);
      const branchIdx = branchRootRing + lane;
      tubeEdges.push({ a: mainIdx, b: branchIdx, kind: 'cloud' });
    }

    branchAnchorIds.push(branchRootRing + Math.floor(ringCount / 2));
  });

  const stentStart = 24;
  const stentEnd = 42;
  const stentStrands = 8;
  for (let strand = 0; strand < stentStrands; strand += 1) {
    let prevA = -1;
    let prevB = -1;
    for (let section = stentStart; section <= stentEnd; section += 1) {
      const frame = mainFrames[section];
      if (!frame) continue;
      const t = (section - stentStart) / Math.max(1, stentEnd - stentStart);
      const phase = strand * (Math.PI * 2 / stentStrands);
      const angleA = phase + t * Math.PI * 4.2;
      const angleB = phase - t * Math.PI * 4.2;
      const radius = 17.5;

      const pA = add3(frame.center, add3(mul3(frame.normal, Math.cos(angleA) * radius), mul3(frame.binormal, Math.sin(angleA) * radius * 0.82)));
      const pB = add3(frame.center, add3(mul3(frame.normal, Math.cos(angleB) * radius), mul3(frame.binormal, Math.sin(angleB) * radius * 0.82)));
      const iA = tubeNodes.push(pA) - 1;
      const iB = tubeNodes.push(pB) - 1;

      if (prevA >= 0) stentEdges.push({ a: prevA, b: iA, kind: 'stent' });
      if (prevB >= 0) stentEdges.push({ a: prevB, b: iB, kind: 'stent' });
      stentEdges.push({ a: iA, b: iB, kind: 'stent' });

      prevA = iA;
      prevB = iB;
    }
  }

  bowConnectorNodeIds.push(
    mainTube.ringStart + 14 * ringCount + 5,
    mainTube.ringStart + 18 * ringCount + 5,
    mainTube.ringStart + 22 * ringCount + 5,
  );

  const edgeEls = tubeEdges.map(() => {
    const el = svgEl('line', { class: 'aorta-cloud-edge' });
    edgeLayer.appendChild(el);
    return el;
  });

  const stentEls = stentEdges.map(() => {
    const el = svgEl('line', { class: 'stent-wire' });
    stentLayer.appendChild(el);
    return el;
  });

  const nodeEls = tubeNodes.map(() => {
    const el = svgEl('circle', { r: '1.35', class: 'aorta-cloud-node' });
    nodeLayer.appendChild(el);
    return el;
  });

  const fallbackBowAnchors = [
    BEST_STENT_GUIDE_POINTS[1],
    BEST_STENT_GUIDE_POINTS[2],
    BEST_STENT_GUIDE_POINTS[3],
  ];
  const connectorLines = bowConnectorNodeIds.map(() => {
    const line = svgEl('line', { class: 'aorta-bow-link' });
    linkLayer.appendChild(line);
    return line;
  });

  let drag = null;
  let userRotX = 0.28;
  let userRotY = -0.72;
  let rafId = null;
  let running = true;

  const onDown = (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY };
    svg.classList.add('is-rotating-3d');
  };

  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag = { x: e.clientX, y: e.clientY };
    userRotY += dx * 0.006;
    userRotX = clamp(userRotX + dy * 0.006, -1.25, 1.25);
  };

  const onUp = () => {
    drag = null;
    svg.classList.remove('is-rotating-3d');
  };

  svg.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  const projected = new Array(tubeNodes.length);

  const tick = () => {
    if (!running) return;
    if (document.hidden) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const orientation = activeCrownScene?.getOrientationState?.() || { tilt: 0, yaw: 0, divergence: 0 };
    const autoRotX = orientation.tilt * 0.36;
    const autoRotY = orientation.yaw * 0.44;
    const autoRotZ = orientation.divergence * 0.2;

    for (let i = 0; i < tubeNodes.length; i += 1) {
      const p = tubeNodes[i];
      const r = rotate3(p, userRotX + autoRotX, userRotY + autoRotY, autoRotZ);
      projected[i] = project(r);

      const nodeEl = nodeEls[i];
      const py = projected[i].y;
      const depthN = clamp((projected[i].depth + 160) / 330, 0, 1);
      const hue = 208 - clamp((py - 70) / 260, 0, 1) * 155;
      const sat = 82 - depthN * 10;
      const lum = 48 + depthN * 24;
      nodeEl.setAttribute('cx', String(projected[i].x));
      nodeEl.setAttribute('cy', String(projected[i].y));
      nodeEl.setAttribute('r', String(0.85 + projected[i].scale * 0.78));
      nodeEl.setAttribute('fill', `hsl(${Math.round(hue)} ${Math.round(sat)}% ${Math.round(lum)}%)`);
      nodeEl.setAttribute('opacity', String(0.48 + depthN * 0.5));
    }

    tubeEdges.forEach((edge, idx) => {
      const a = projected[edge.a];
      const b = projected[edge.b];
      if (!a || !b) return;
      const midDepth = (a.depth + b.depth) * 0.5;
      const alpha = 0.2 + clamp((midDepth + 180) / 420, 0, 1) * 0.54;
      const w = 0.45 + ((a.scale + b.scale) * 0.5) * 0.7;
      const el = edgeEls[idx];
      el.setAttribute('x1', String(a.x));
      el.setAttribute('y1', String(a.y));
      el.setAttribute('x2', String(b.x));
      el.setAttribute('y2', String(b.y));
      el.setAttribute('stroke-width', String(w));
      el.setAttribute('stroke', `rgba(255, 224, 88, ${alpha.toFixed(3)})`);
    });

    stentEdges.forEach((edge, idx) => {
      const a = projected[edge.a];
      const b = projected[edge.b];
      if (!a || !b) return;
      const midDepth = (a.depth + b.depth) * 0.5;
      const alpha = 0.28 + clamp((midDepth + 170) / 420, 0, 1) * 0.62;
      const w = 0.55 + ((a.scale + b.scale) * 0.5) * 0.86;
      const el = stentEls[idx];
      el.setAttribute('x1', String(a.x));
      el.setAttribute('y1', String(a.y));
      el.setAttribute('x2', String(b.x));
      el.setAttribute('y2', String(b.y));
      el.setAttribute('stroke-width', String(w));
      el.setAttribute('stroke', `rgba(238, 238, 238, ${alpha.toFixed(3)})`);
    });

    const activeMain = activeCrownScene?.currentMainPoints;
    const targetBowAnchors = Array.isArray(activeMain) && activeMain.length >= 4
      ? [activeMain[1], activeMain[2], activeMain[3]]
      : fallbackBowAnchors;

    connectorLines.forEach((line, idx) => {
      const sourceIdx = bowConnectorNodeIds[idx] || bowConnectorNodeIds[bowConnectorNodeIds.length - 1];
      const source = projected[sourceIdx];
      const target = targetBowAnchors[idx] || targetBowAnchors[targetBowAnchors.length - 1];
      if (!source || !target) return;
      line.setAttribute('x1', String(source.x));
      line.setAttribute('y1', String(source.y));
      line.setAttribute('x2', String(target.x));
      line.setAttribute('y2', String(target.y));
    });

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    svg.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    svg.classList.remove('is-rotating-3d');
    edgeLayer.remove();
    nodeLayer.remove();
    stentLayer.remove();
    linkLayer.remove();
  };
}

function addAdvancedAorticArch(svg, transitionState = null) {
  const container = document.createElement('div');
  container.className = 'aortic-arch-stage';
  const canvas = document.createElement('canvas');
  canvas.className = 'aortic-arch-canvas';
  const helpId = 'aortic-arch-keyboard-help';
  const help = document.createElement('p');
  help.id = helpId;
  help.className = 'visually-hidden';
  help.textContent = 'Use arrow keys to rotate. Use plus and minus to zoom. Use left and right brackets to select a control point, then W, A, S, and D to deform the arch. Press Escape to clear the selected control point.';
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('aria-label', 'Interactive three-dimensional aortic arch');
  canvas.setAttribute('aria-describedby', helpId);
  container.append(canvas, help);
  svg.parentElement.appendChild(container);

  if (typeof window.AorticArchScene !== 'function') {
    container.remove();
    return () => {};
  }

  const legacyLayer = svgEl('g', { class: 'linked-legacy-ghost', 'aria-hidden': 'true' });
  const legacyMain = svgEl('path', { class: 'linked-legacy-main' });
  const legacyBranches = svgEl('g', { class: 'linked-legacy-branches' });
  const legacyNodes = svgEl('g', { class: 'linked-legacy-nodes' });
  legacyLayer.append(legacyMain, legacyBranches, legacyNodes);
  svg.appendChild(legacyLayer);

  const toSvgPoint = (point) => ({ x: 305 + point.x * 86, y: 215 - point.y * 70 });
  const smoothPath = (points) => {
    if (!points.length) return '';
    const projected = points.map(toSvgPoint);
    return projected.slice(1).reduce((path, point, index) => {
      const previous = projected[index];
      const midX = (previous.x + point.x) / 2;
      const midY = (previous.y + point.y) / 2;
      return `${path} Q ${previous.x} ${previous.y} ${midX} ${midY}`;
    }, `M ${projected[0].x} ${projected[0].y}`) + ` T ${projected.at(-1).x} ${projected.at(-1).y}`;
  };
  const updateLegacy = ({ mainPoints, outlets, rotation }) => {
    legacyMain.setAttribute('d', smoothPath(mainPoints));
    legacyLayer.style.setProperty('--legacy-rotate', `${rotation.y * 8}deg`);
    legacyBranches.replaceChildren();
    legacyNodes.replaceChildren();
    outlets.forEach((outlet) => {
      const sourceIndex = Math.max(0, Math.min(mainPoints.length - 1, Math.round(outlet.at * (mainPoints.length - 1))));
      legacyBranches.appendChild(svgEl('path', { d: smoothPath([mainPoints[sourceIndex], ...outlet.controls]) }));
    });
    [...mainPoints, ...outlets.flatMap((outlet) => outlet.controls)].forEach((point, index) => {
      const p = toSvgPoint(point);
      legacyNodes.appendChild(svgEl('circle', { cx: p.x, cy: p.y, r: index < mainPoints.length ? 2.2 : 2.8 }));
    });
  };

  const scene = new window.AorticArchScene(canvas, { transitionState, onModelChange: updateLegacy });
  return () => {
    scene.destroy();
    legacyLayer.remove();
    container.remove();
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
  activeCrownScene = null;
  let interactionMode = 'drag';
  const type = slide.type;
  const formationProgress = FORMATION_STEPS[Math.max(0, Math.min(index, FORMATION_STEPS.length - 1))] || 0.2;

  if (type === 'reduction') {
    drawProgressiveGraph(svg, formationProgress, true);
    interactionMode = 'path';
  } else if (type === 'line') {
    drawClusteredNetwork(svg, true);
  } else if (type === 'magenta') {
    drawClusteredPoints(svg, true);
    drawMainCurveWithAdditives(svg);
    interactionMode = 'crown-controls';
  } else if (type === 'flow') {
    drawConnectedPointClouds(svg, true);
    drawMainCurveWithAdditives(svg);
    interactionMode = 'crown-controls';
  } else if (type === 'flow-finalize') {
    drawConnectedPointClouds(svg, true);
    drawMainCurveWithAdditives(svg);
    interactionMode = 'crown-flow';
  } else if (type === 'final-bow') {
    svg.classList.add('slide-final-bow');
    interactionMode = 'crown-flow-bow';
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
    text.textContent = 'calyr.aí';
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
  const departingSlide = slides[active];
  if (departingSlide?.type === 'flow-finalize' && activeCrownScene) {
    previousConvergenceState = {
      mainPoints: Array.isArray(activeCrownScene.currentMainPoints)
        ? activeCrownScene.currentMainPoints.map((point) => ({ ...point }))
        : null,
      orientation: activeCrownScene.getOrientationState?.() || { tilt: 0, yaw: 0, divergence: 0 },
    };
  }
  active = i;
  if (activeCleanup) activeCleanup();

  stage.innerHTML = '';

  const s = slides[i];
  const shell = document.createElement('div');
  shell.className = `slide-shell slide-${s.type}`;

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
  } else if (interaction.mode === 'crown-controls') {
    interactionStatus.hidden = false;
    const crownCleanup = addCrownHandleControls(svg, interactionStatus);
    const dragCleanup = enableDragging(svg);
    interactionCleanup = () => {
      crownCleanup?.();
      dragCleanup?.();
    };
  } else if (interaction.mode === 'crown-flow') {
    interactionStatus.hidden = false;
    const crownCleanup = addCrownHandleControls(svg, interactionStatus);
    const plateCleanup = addDataPlateAlignment(svg);
    const flowCleanup = addNodeFlowThroughClouds(svg, interactionStatus);
    const dragCleanup = enableDragging(svg);
    interactionCleanup = () => {
      crownCleanup?.();
      plateCleanup?.();
      flowCleanup?.();
      dragCleanup?.();
    };
  } else if (interaction.mode === 'crown-flow-bow') {
    const schematicCleanup = addAdvancedAorticArch(svg, previousConvergenceState);
    interactionCleanup = () => {
      schematicCleanup?.();
    };
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

  const motionCleanup = s.type === 'final-bow' ? () => {} : addNodeMotion(svg);
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

function enableMobileSwipe(target) {
  let gesture = null;
  const onPointerDown = (event) => {
    if (!deckInteraction.swipe_enabled || event.pointerType !== 'touch' || !event.isPrimary) return;
    if (event.target.closest?.('button, a')) return;
    gesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, startedAt: performance.now() };
  };
  const finish = (event) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    const duration = performance.now() - gesture.startedAt;
    gesture = null;
    const horizontal = Math.abs(dx) >= deckInteraction.swipe_threshold;
    const directional = Math.abs(dy) <= Math.abs(dx) * deckInteraction.swipe_max_vertical_ratio;
    const deliberate = duration <= 900;
    if (!horizontal || !directional || !deliberate) return;
    if (dx < 0) next();
    else prev();
  };
  const cancel = () => { gesture = null; };
  target.addEventListener('pointerdown', onPointerDown, { capture: true });
  target.addEventListener('pointerup', finish, { capture: true });
  target.addEventListener('pointercancel', cancel, { capture: true });
}

enableMobileSwipe(stage);

window.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || e.target.closest?.('.aortic-arch-canvas')) return;
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'Escape') restartDeck();
});

async function boot() {
  try {
    const yamlConfig = await DeckConfigLoader.load('/research/lithos/deck.config.yaml');
    applyDeckConfig(yamlConfig);
    document.documentElement.dataset.configSource = 'yaml';
  } catch (err) {
    applyDeckConfig(DEFAULT_DECK_CONFIG);
    document.documentElement.dataset.configSource = 'fallback';
    console.warn('Deck config fallback to defaults:', err?.message || err);
  }
  openSlide(0);
  stage.setAttribute('aria-busy', 'false');
}

boot();
