const NS = 'http://www.w3.org/2000/svg';
const WIDTH = 960;
const HEIGHT = 460;

class ConfigLoader {
  static async load(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Pitch config fetch failed (${response.status})`);
    const config = await response.json();
    for (const key of ['meta', 'page', 'engagement', 'copy', 'nodes', 'edges', 'story_rules', 'workflow']) {
      if (!config[key] || (Array.isArray(config[key]) && config[key].length === 0)) throw new Error(`Pitch config requires ${key}`);
    }
    return config;
  }

}

class StoryEngine {
  constructor(config) {
    this.config = config;
    this.path = [];
    this.score = 0;
    this.slides = [];
  }

  edgeMeta(from, to) {
    return this.config.edges.find((e) => e.from === from && e.to === to) || null;
  }

  reset() {
    this.path = [];
    this.score = 0;
    this.slides = [];
  }

  canConnect(from, to) {
    if (!from || !to || from === to) return false;
    if (!this.config.story_rules?.self_avoiding) return true;
    return !this.path.includes(to);
  }

  connect(from, to) {
    if (!this.canConnect(from, to)) {
      this.score += this.config.story_rules?.scoring?.repeat_penalty ?? -2;
      return { ok: false, reason: 'repeat-or-invalid' };
    }

    if (this.path.length === 0) {
      this.path.push(from);
    }
    this.path.push(to);
    this.score += this.config.story_rules?.scoring?.valid_connection ?? 3;

    const fromNode = this.config.nodes.find((n) => n.id === from);
    const toNode = this.config.nodes.find((n) => n.id === to);
    const meta = this.edgeMeta(from, to);
    const connection = `${fromNode?.label || from} → ${toNode?.label || to}`;
    const slide = {
      title: meta?.slide || connection,
      connection,
      thought: meta?.thought || `${fromNode?.sentence || ''}`.trim(),
      explanation: meta?.explanation || `${toNode?.sentence || ''}`.trim(),
      sentence: `${fromNode?.sentence || ''} ${toNode?.sentence || ''}`.trim(),
      path: [...this.path],
      edgeKey: `${from}->${to}`,
    };
    this.slides.push(slide);

    return { ok: true, slide };
  }

  currentStoryText() {
    if (!this.slides.length) {
      return this.config.copy?.mission || '';
    }
    return this.slides[this.slides.length - 1].sentence;
  }

  deckItems() {
    return this.slides.map((slide, idx) => ({
      slideNo: idx + 1,
      title: slide.title,
      connection: slide.connection,
      thought: slide.thought,
      explanation: slide.explanation,
      edgeKey: slide.edgeKey,
    }));
  }
}

function hydratePage(config) {
  const page = config.page;
  const required = ['kicker', 'title', 'subtitle', 'deck_link_label', 'deck_link_url', 'insight_title', 'insight_copy', 'hpc_title', 'hpc_copy'];
  required.forEach((key) => {
    if (typeof page[key] !== 'string' || !page[key].trim()) throw new Error(`page.${key} is required`);
  });
  document.title = config.meta.title;
  document.getElementById('page-kicker').textContent = page.kicker;
  document.getElementById('page-title').textContent = page.title;
  document.getElementById('page-subtitle').textContent = page.subtitle;
  document.getElementById('page-deck-link').href = page.deck_link_url;
  document.getElementById('page-deck-link-label').textContent = page.deck_link_label;
  document.getElementById('insight-title').textContent = page.insight_title;
  document.getElementById('insight-copy').textContent = page.insight_copy;
  document.getElementById('hpc-title').textContent = page.hpc_title;
  document.getElementById('hpc-copy').textContent = page.hpc_copy;
  hydrateEngagement(config.engagement);
  hydrateWorkflow(config.workflow);
}

function hydrateEngagement(engagement) {
  document.getElementById('engagement-kicker').textContent = engagement.kicker;
  document.getElementById('engagement-title').textContent = engagement.title;
  const grid = document.getElementById('engagement-grid');
  grid.replaceChildren();
  engagement.phases.forEach((phase) => {
    const article = document.createElement('article');
    article.className = 'engagement-phase';
    const number = document.createElement('span'); number.textContent = phase.id;
    const title = document.createElement('h3'); title.textContent = phase.title;
    const body = document.createElement('p'); body.textContent = phase.copy;
    const result = document.createElement('strong'); result.textContent = phase.result;
    article.append(number, title, body, result); grid.append(article);
  });
}

function hydrateWorkflow(workflow) {
  document.getElementById('workflow-kicker').textContent = workflow.kicker;
  document.getElementById('workflow-title').textContent = workflow.title;
  document.getElementById('workflow-introduction').textContent = workflow.introduction;
  document.getElementById('workflow-closing').textContent = workflow.closing;
  const decisions = new Map((workflow.decisions || []).map((item) => [item.after, item]));
  const grid = document.getElementById('workflow-grid');
  grid.replaceChildren();
  workflow.phases.forEach((phase) => {
    const article = document.createElement('article');
    article.className = 'workflow-phase';
    const number = document.createElement('span'); number.textContent = phase.id;
    const copy = document.createElement('div');
    const title = document.createElement('h3'); title.textContent = phase.title;
    const body = document.createElement('p'); body.textContent = phase.copy;
    copy.append(title, body); article.append(number, copy); grid.append(article);
    const decision = decisions.get(phase.id);
    if (decision) {
      const fork = document.createElement('div'); fork.className = 'workflow-decision';
      [decision.positive, decision.negative].forEach((label, index) => {
        const branch = document.createElement('p');
        branch.className = index === 0 ? 'positive' : 'negative';
        branch.textContent = label; fork.append(branch);
      });
      grid.append(fork);
    }
  });
  const loops = document.getElementById('workflow-loops-grid');
  loops.replaceChildren();
  (workflow.feedback_loops || []).forEach((loop) => {
    const article = document.createElement('article');
    article.className = 'workflow-loop';
    const route = document.createElement('span'); route.textContent = `${loop.id} · ${loop.from} ↩ ${loop.to}`;
    const title = document.createElement('h4'); title.textContent = loop.title;
    const trigger = document.createElement('p'); trigger.textContent = loop.trigger;
    const action = document.createElement('strong'); action.textContent = loop.action;
    article.append(route, title, trigger, action); loops.append(article);
  });
  const questions = document.getElementById('workflow-questions');
  questions.replaceChildren();
  (workflow.questions || []).forEach((question) => {
    const item = document.createElement('li'); item.textContent = question; questions.append(item);
  });
}

class GraphEngine {
  constructor(config, svg) {
    this.config = config;
    this.svg = svg;
    this.nodeEls = [];
    this.edgeEls = [];
    this.edgeByKey = new Map();
    this.anchorById = new Map(config.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
    this.motion = { targetX: 0, targetY: 0, x: 0, y: 0 };
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mobileLayout = window.matchMedia('(max-width: 820px)');
    this.dragPreview = null;
  }

  point(node, t) {
    if (this.mobileLayout.matches) {
      const index = Math.max(0, this.config.nodes.findIndex((item) => item.id === node.id));
      const xOffsets = [-34, 38, -30, 34];
      return {
        x: 240 + (xOffsets[index] || 0),
        y: 72 + index * 128,
      };
    }
    const index = Math.max(0, this.config.nodes.findIndex((item) => item.id === node.id));
    const verticalOffsets = [-52, 48, -34, 52];
    return {
      x: node.x * WIDTH,
      y: node.y * HEIGHT + (verticalOffsets[index] || 0),
    };
  }

  dimensions() {
    return this.mobileLayout.matches ? { width: 480, height: 500 } : { width: WIDTH, height: HEIGHT };
  }

  configureViewport() {
    const { width, height } = this.dimensions();
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  estimateNodeRadius(node) {
    const textLen = (node?.label || '').length;
    const halfWidth = Math.max(52, textLen * 7.2);
    return Math.min(132, halfWidth + 14);
  }

  nodePadding(node, ux, uy) {
    const rx = this.estimateNodeRadius(node);
    const ry = this.mobileLayout.matches ? 30 : 24;
    return 1 / Math.sqrt((ux * ux) / (rx * rx) + (uy * uy) / (ry * ry));
  }

  cubic(edge, t) {
    const from = this.config.nodes.find((n) => n.id === edge.from);
    const to = this.config.nodes.find((n) => n.id === edge.to);
    if (!from || !to) return null;
    const fromCenter = this.point(from, t);
    const toCenter = this.point(to, t);
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    const fromPad = this.nodePadding(from, ux, uy);
    const toPad = this.nodePadding(to, ux, uy);

    const p0 = { x: fromCenter.x + ux * fromPad, y: fromCenter.y + uy * fromPad };
    const p3 = { x: toCenter.x - ux * toPad, y: toCenter.y - uy * toPad };
    const c1 = { x: p0.x + (p3.x - p0.x) * 0.35, y: p0.y + (p3.y - p0.y) * 0.12 };
    const c2 = { x: p0.x + (p3.x - p0.x) * 0.65, y: p3.y - (p3.y - p0.y) * 0.12 };
    return { p0, c1, c2, p3 };
  }

  pathFromCubic(c) {
    return `M ${c.p0.x} ${c.p0.y} C ${c.c1.x} ${c.c1.y}, ${c.c2.x} ${c.c2.y}, ${c.p3.x} ${c.p3.y}`;
  }

  cubicPoint(c, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    const a = mt2 * mt;
    const b = 3 * mt2 * t;
    const cc = 3 * mt * t2;
    const d = t2 * t;
    return {
      x: a * c.p0.x + b * c.c1.x + cc * c.c2.x + d * c.p3.x,
      y: a * c.p0.y + b * c.c1.y + cc * c.c2.y + d * c.p3.y,
    };
  }

  init() {
    this.configureViewport();
    this.renderEdges();
    this.renderNodes();
    this.renderDragPreview();
    this.registerMouseParallax();
    this.mobileLayout.addEventListener('change', () => this.configureViewport());
  }

  renderEdges() {
    this.config.edges.forEach((edge, idx) => {
      this.createEdgeVisual(edge, idx, 6);
    });
  }

  createEdgeVisual(edge, idx, dotCount = 6) {
    const edgeKey = `${edge.from}->${edge.to}`;
    if (this.edgeByKey.has(edgeKey)) return;

    const glow = document.createElementNS(NS, 'path');
    glow.setAttribute('class', 'edge-glow');
    this.svg.appendChild(glow);

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 'edge');
    this.svg.appendChild(path);

    this.edgeEls.push({ edge, el: path, glowEl: glow, idx });
    this.edgeByKey.set(edgeKey, true);
  }

  ensureEdge(from, to) {
    if (!from || !to || from === to) return;
    const existing = this.config.edges.find((e) => e.from === from && e.to === to);
    if (!existing) {
      this.config.edges.push({ from, to });
    }
    this.createEdgeVisual({ from, to }, this.config.edges.length + this.edgeEls.length, 4);
  }

  ensureEdgeKey(edgeKey) {
    if (!edgeKey) return;
    const [from, to] = edgeKey.split('->');
    this.ensureEdge(from, to);
  }

  moveNode(nodeId, clientX, clientY) {
    const node = this.config.nodes.find((n) => n.id === nodeId);
    const anchor = this.anchorById.get(nodeId);
    if (!node || !anchor) return;

    const rect = this.svg.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;

    const minX = Math.max(0.08, anchor.x - 0.12);
    const maxX = Math.min(0.92, anchor.x + 0.12);
    const minY = Math.max(0.18, anchor.y - 0.16);
    const maxY = Math.min(0.82, anchor.y + 0.16);

    node.x = Math.max(minX, Math.min(maxX, nx));
    node.y = Math.max(minY, Math.min(maxY, ny));
  }

  renderNodes() {
    this.config.nodes.forEach((node) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'node');
      g.dataset.nodeId = node.id;
      g.setAttribute('tabindex', '0');

      const hit = document.createElementNS(NS, 'rect');
      hit.setAttribute('class', 'node-hitbox');
      const nodeWidth = Math.min(280, Math.max(150, node.label.length * 18));
      hit.setAttribute('x', `${-nodeWidth / 2}`);
      hit.setAttribute('y', '-28');
      hit.setAttribute('width', `${nodeWidth}`);
      hit.setAttribute('height', '56');
      hit.setAttribute('rx', '16');
      hit.setAttribute('ry', '16');

      const shell = document.createElementNS(NS, 'rect');
      shell.setAttribute('class', 'node-shell');
      shell.setAttribute('x', `${-nodeWidth / 2}`);
      shell.setAttribute('y', '-28');
      shell.setAttribute('width', `${nodeWidth}`);
      shell.setAttribute('height', '56');
      shell.setAttribute('rx', '16');
      shell.setAttribute('ry', '16');

      const label = document.createElementNS(NS, 'text');
      label.setAttribute('class', 'node-label');
      label.setAttribute('x', '0');
      label.setAttribute('y', '0');
      label.setAttribute('dominant-baseline', 'middle');
      label.textContent = node.label;

      g.appendChild(shell);
      g.appendChild(hit);
      g.appendChild(label);
      this.svg.appendChild(g);
      this.nodeEls.push({ node, el: g });
    });
  }

  renderDragPreview() {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'edge focus');
    p.style.opacity = '0';
    this.svg.appendChild(p);
    this.dragPreview = p;
  }

  registerMouseParallax() {
    this.svg.addEventListener('mousemove', (event) => {
      const rect = this.svg.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      this.motion.targetX = nx * 8;
      this.motion.targetY = ny * 6;
    });
    this.svg.addEventListener('mouseleave', () => {
      this.motion.targetX = 0;
      this.motion.targetY = 0;
    });
  }

  nearestNode(clientX, clientY, t) {
    const rect = this.svg.getBoundingClientRect();
    const { width, height } = this.dimensions();
    const x = ((clientX - rect.left) / rect.width) * width;
    const y = ((clientY - rect.top) / rect.height) * height;

    let best = null;
    let bestDist = Infinity;

    this.config.nodes.forEach((node) => {
      const p = this.point(node, t);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = node;
      }
    });

    return bestDist <= 52 ? best : null;
  }

  showDragPreview(fromNode, pointerX, pointerY, t) {
    if (!this.dragPreview) return;
    const fromCenter = this.point(fromNode, t);
    const rect = this.svg.getBoundingClientRect();
    const { width, height } = this.dimensions();
    const to = {
      x: ((pointerX - rect.left) / rect.width) * width,
      y: ((pointerY - rect.top) / rect.height) * height,
    };

    const dx = to.x - fromCenter.x;
    const dy = to.y - fromCenter.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const fromPad = this.estimateNodeRadius(fromNode);
    const from = { x: fromCenter.x + ux * fromPad, y: fromCenter.y + uy * fromPad };

    const c1 = { x: from.x + (to.x - from.x) * 0.35, y: from.y };
    const c2 = { x: from.x + (to.x - from.x) * 0.65, y: to.y };
    this.dragPreview.setAttribute('d', `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`);
    this.dragPreview.style.opacity = '1';
  }

  hideDragPreview() {
    if (this.dragPreview) {
      this.dragPreview.style.opacity = '0';
    }
  }

  tick(t, storyState) {
    this.motion.x += (this.motion.targetX - this.motion.x) * 0.04;
    this.motion.y += (this.motion.targetY - this.motion.y) * 0.04;
    const focusId = storyState.dragSource || storyState.selectedSource;

    this.nodeEls.forEach(({ node, el }) => {
      const p = this.point(node, t);
      el.setAttribute('transform', `translate(${p.x} ${p.y})`);
      el.classList.toggle('unlocked', storyState.path.includes(node.id));
      el.classList.toggle('path-active', storyState.path.includes(node.id));
      if (focusId === node.id) {
        el.classList.add('focus');
      } else {
        el.classList.remove('focus');
      }
    });

    const activeEdge = storyState.activeEdge || null;

    this.edgeEls.forEach(({ edge, el, glowEl }) => {
      const c = this.cubic(edge, t);
      if (!c) return;
      const d = this.pathFromCubic(c);
      el.setAttribute('d', d);
      glowEl.setAttribute('d', d);

      const edgeKey = `${edge.from}->${edge.to}`;
      const used = storyState.edges.has(edgeKey);
      const isActive = edgeKey === activeEdge;

      glowEl.classList.toggle('unlocked', used);
      glowEl.classList.toggle('focus', focusId === edge.from || focusId === edge.to);
      glowEl.classList.toggle('active', isActive);

      el.classList.toggle('unlocked', used);
      el.classList.toggle('path-active', used);
      el.classList.toggle('focus', focusId === edge.from || focusId === edge.to);
      el.classList.toggle('active', isActive);
    });

  }
}

class PointField {
  constructor(canvas, graphEngine) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.graph = graphEngine;
    this.points = [];
    this.width = WIDTH;
    this.height = HEIGHT;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  sampleEdgeCurve(cubic, segments = 14) {
    const samples = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const t2 = Math.min(1, t + 0.03);
      const p = this.graph.cubicPoint(cubic, t);
      const p2 = this.graph.cubicPoint(cubic, t2);
      const dx = p2.x - p.x;
      const dy = p2.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      samples.push({ x: p.x, y: p.y, tx: dx / len, ty: dy / len });
    }
    return samples;
  }

  edgeCurveByIds(fromId, toId, now) {
    const fromNode = this.graph.config.nodes.find((n) => n.id === fromId);
    const toNode = this.graph.config.nodes.find((n) => n.id === toId);
    if (!fromNode || !toNode) return null;
    const p0 = this.graph.point(fromNode, now);
    const p3 = this.graph.point(toNode, now);
    const c1 = { x: p0.x + (p3.x - p0.x) * 0.35, y: p0.y + (p3.y - p0.y) * 0.12 };
    const c2 = { x: p0.x + (p3.x - p0.x) * 0.65, y: p3.y - (p3.y - p0.y) * 0.12 };
    return { p0, c1, c2, p3 };
  }

  buildMagneticEdgeField(now, state) {
    const field = [];
    const keys = new Set();

    // Drive flow along all visible story edges; fallback to configured edges when story has not started.
    if (state?.edges?.size) {
      for (const edgeKey of state.edges) keys.add(edgeKey);
    } else {
      for (const { edge } of this.graph.edgeEls) {
        keys.add(`${edge.from}->${edge.to}`);
      }
    }

    if (state?.activeEdge) keys.add(state.activeEdge);

    for (const edgeKey of keys) {
      const [fromId, toId] = edgeKey.split('->');
      const curve = this.edgeCurveByIds(fromId, toId, now);
      if (curve) {
        field.push(...this.sampleEdgeCurve(curve, 16));
      }
    }

    return field;
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    const sync = () => {
      const rect = this.graph.svg.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.width = Math.max(1, Math.floor(rect.width));
      this.height = Math.max(1, Math.floor(rect.height));
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    sync();
    window.addEventListener('resize', sync);

    const count = this.reducedMotion ? 60 : 140;
    this.points = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      size: Math.random() * 1.4 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  tick(now, state) {
    if (!this.ctx) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const linkDistance = 24;
    const forceX = this.width * 0.5 + this.graph.motion.x * 16;
    const forceY = this.height * 0.5 + this.graph.motion.y * 12;
    const edgeField = this.buildMagneticEdgeField(now, state);
    const catchRadius = 32;

    for (let i = 0; i < this.points.length; i += 1) {
      const p = this.points[i];
      const phase = now * 0.0007 + p.twinkle;
      const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(phase));

      // Free diffusion baseline: particles drift slowly unless captured near an edge.
      p.vx += (Math.random() - 0.5) * 0.0022;
      p.vy += (Math.random() - 0.5) * 0.0022;

      const dxR = p.x - forceX;
      const dyR = p.y - forceY;
      const r2 = dxR * dxR + dyR * dyR;
      if (!this.reducedMotion && r2 < 10000) {
        const force = (10000 - r2) / 10000;
        p.vx += (dxR / 3000) * force;
        p.vy += (dyR / 3000) * force;
      }

      if (!this.reducedMotion && edgeField.length > 0) {
        let nearest = null;
        let nearestDist = Infinity;

        for (let k = 0; k < edgeField.length; k += 1) {
          const s = edgeField[k];
          const dx = s.x - p.x;
          const dy = s.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = s;
          }
        }

        if (nearest && nearestDist < catchRadius) {
          const influence = 1 - nearestDist / catchRadius;
          const toEdgeX = nearest.x - p.x;
          const toEdgeY = nearest.y - p.y;

          // Particles near the active path are captured and accelerated along its direction.
          p.vx += toEdgeX * (0.0005 * influence);
          p.vy += toEdgeY * (0.0005 * influence);
          const accel = 0.004 + influence * 0.012;
          p.vx += nearest.tx * accel;
          p.vy += nearest.ty * accel;
          p.vx *= 1 + influence * 0.04;
          p.vy *= 1 + influence * 0.04;
        }
      }

      p.vx *= 0.962;
      p.vy *= 0.962;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -5) p.x = this.width + 5;
      if (p.x > this.width + 5) p.x = -5;
      if (p.y < -5) p.y = this.height + 5;
      if (p.y > this.height + 5) p.y = -5;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.08 + pulse * 0.16})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < this.points.length; j += 1) {
        const q = this.points[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDistance) {
          const alpha = (1 - dist / linkDistance) * 0.025;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
  }
}

class InteractionController {
  constructor(graph, story, ui) {
    this.graph = graph;
    this.story = story;
    this.ui = ui;
    this.dragSource = null;
    this.dragNodeId = null;
    this.selectedSource = null;
    this.dragMoved = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.currentTime = 0;
  }

  bind() {
    this.graph.svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.graph.svg.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.graph.svg.addEventListener('pointerup', (e) => this.onPointerUp(e));
    this.graph.svg.addEventListener('pointerleave', () => this.cancelDrag());
    this.graph.svg.addEventListener('pointercancel', () => this.cancelDrag());

    this.ui.resetBtn.addEventListener('click', () => {
      this.story.reset();
      this.dragSource = null;
      this.dragNodeId = null;
      this.selectedSource = null;
      this.graph.hideDragPreview();
      this.ui.render(this.story, null);
    });

    this.ui.demoBtn.addEventListener('click', () => {
      this.ui.toggleAuto(this.story, this.graph, () => this.currentTime);
    });
  }

  onPointerDown(event) {
    const node = this.graph.nearestNode(event.clientX, event.clientY, this.currentTime);
    if (!node) return;
    this.dragSource = node.id;
    this.dragNodeId = node.id;
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.graph.svg.setPointerCapture(event.pointerId);
  }

  onPointerMove(event) {
    if (!this.dragSource || !this.dragNodeId) return;
    if (Math.hypot(event.clientX - this.dragStartX, event.clientY - this.dragStartY) > 6) {
      this.dragMoved = true;
    }
    if (this.dragMoved) {
      this.graph.moveNode(this.dragNodeId, event.clientX, event.clientY);
      this.ui.setStatus(`Moved ${this.dragNodeId}`);
    }
  }

  onPointerUp(event) {
    if (!this.dragSource) return;
    const target = this.graph.nearestNode(event.clientX, event.clientY, this.currentTime);
    const from = this.dragSource;
    const wasDrag = this.dragMoved;
    const dragNodeId = this.dragNodeId;
    this.cancelDrag();

    if (wasDrag && dragNodeId) {
      this.selectedSource = null;
      this.ui.render(this.story, dragNodeId);
      return;
    }

    if (!wasDrag) {
      if (!target) {
        this.ui.setStatus('No target node selected');
        return;
      }
      if (this.selectedSource && this.selectedSource !== target.id) {
        const result = this.story.connect(this.selectedSource, target.id);
        if (!result.ok) {
          this.ui.setStatus('Connection rejected: self-avoiding rule');
        } else {
          this.graph.ensureEdge(this.selectedSource, target.id);
          this.ui.setStatus(`Connected ${this.selectedSource} -> ${target.id}`);
        }
        this.selectedSource = null;
        this.ui.render(this.story, target.id);
        return;
      }

      if (this.selectedSource === target.id) {
        this.selectedSource = null;
        this.ui.setStatus(this.story.config.copy?.ready || 'Ready');
        this.ui.render(this.story, target.id);
        return;
      }

      this.selectedSource = target.id;
      this.ui.setStatus(`Source selected: ${target.id}. Pick target node.`);
      this.ui.render(this.story, target.id);
      return;
    }

    if (!target) {
      this.ui.setStatus('No target node selected');
      return;
    }

    const result = this.story.connect(from, target.id);
    if (!result.ok) {
      this.ui.setStatus('Connection rejected: self-avoiding rule');
    } else {
      this.graph.ensureEdge(from, target.id);
      this.ui.setStatus(`Connected ${from} -> ${target.id}`);
    }
    this.ui.render(this.story, target.id);
  }

  cancelDrag() {
    this.dragSource = null;
    this.dragNodeId = null;
    this.dragMoved = false;
    this.graph.hideDragPreview();
  }

  tick(time) {
    this.currentTime = time;
  }
}

class TeaserUI {
  constructor(config) {
    this.config = config;
    this.insightTitle = document.getElementById('insight-title');
    this.insightCopy = document.getElementById('insight-copy');
    this.insightPoints = document.getElementById('insight-points');
    this.sceneStatus = document.getElementById('scene-status');
    this.progressEl = document.getElementById('game-progress');
    this.scoreEl = document.getElementById('game-score');
    this.resetBtn = document.getElementById('game-reset');
    this.demoBtn = document.getElementById('game-demo');
    this.autoTimer = null;
  }

  render(story, focusNodeId) {
    const focusNode = this.config.nodes.find((n) => n.id === focusNodeId);
    if (focusNode) {
      this.insightTitle.textContent = `${focusNode.label}`;
      this.insightCopy.textContent = focusNode.sentence;
    } else {
      this.insightTitle.textContent = 'Story Engine';
      this.insightCopy.textContent = story.currentStoryText();
    }

    const deck = story.deckItems();
    const activeEdge = story.slides.length ? story.slides[story.slides.length - 1].edgeKey : null;
    this.insightPoints.innerHTML = deck.length
      ? deck
        .map((item) => (`<li class="deck-item${item.edgeKey === activeEdge ? ' active' : ''}"><strong>${item.title}</strong><br /><strong>Connection:</strong> ${item.connection}<br /><strong>Thought:</strong> ${item.thought}<br /><strong>Explanation:</strong> ${item.explanation}</li>`))
        .join('')
      : '<li>Build the path to generate linked slides.</li>';
    this.progressEl.textContent = `Slides ${story.slides.length}`;
    this.scoreEl.textContent = `Score ${story.score}`;
  }

  setStatus(msg) {
    this.sceneStatus.textContent = msg;
  }

  toggleAuto(story, graph, getTime) {
    if (this.autoTimer) {
      window.clearInterval(this.autoTimer);
      this.autoTimer = null;
      this.demoBtn.textContent = 'Play the flow →';
      this.setStatus(this.config.copy?.ready || 'Ready');
      return;
    }

    story.reset();
    this.render(story, null);
    this.demoBtn.textContent = 'Stop flow';
    this.setStatus('Flow in progress');

    const sequence = this.config.edges.slice();
    let edgeIndex = 0;
    this.autoTimer = window.setInterval(() => {
      if (edgeIndex >= sequence.length) {
        window.clearInterval(this.autoTimer);
        this.autoTimer = null;
        this.demoBtn.textContent = 'Replay flow';
        this.setStatus(this.config.copy?.complete || 'Complete');
        return;
      }

      const { from, to } = sequence[edgeIndex];
      edgeIndex += 1;
      const result = story.connect(from, to);
      if (result.ok) {
        this.render(story, to);
        this.setStatus(`${from} → ${to}`);
      }

      graph.tick(getTime(), {
        path: story.path,
        edges: new Set(story.slides.map((s) => {
          const p = s.path;
          return `${p[p.length - 2]}->${p[p.length - 1]}`;
        }).filter(Boolean)),
        dragSource: null,
      });
    }, 1500);
  }
}

class TeaserApp {
  constructor(config) {
    this.config = config;
    this.svg = document.getElementById('pitch-graph');
    this.graph = new GraphEngine(config, this.svg);
    this.story = new StoryEngine(config);
    this.ui = new TeaserUI(config);
    this.controller = new InteractionController(this.graph, this.story, this.ui);
    this.pointField = new PointField(document.getElementById('point-field'), this.graph);
    this.state = {
      path: [],
      edges: new Set(),
      dragSource: null,
      selectedSource: null,
      activeEdge: null,
      flow: { x: 0, y: 0, strength: 0 },
    };
  }

  edgeSetFromStory() {
    const set = new Set();
    for (const slide of this.story.slides) {
      const p = slide.path;
      if (p.length >= 2) {
        set.add(`${p[p.length - 2]}->${p[p.length - 1]}`);
      }
    }
    return set;
  }

  latestEdgeKey() {
    const lastSlide = this.story.slides[this.story.slides.length - 1];
    if (!lastSlide || lastSlide.path.length < 2) return null;
    const p = lastSlide.path;
    return `${p[p.length - 2]}->${p[p.length - 1]}`;
  }

  flowVectorFromEdge(edgeKey, time) {
    if (!edgeKey) return { x: 0, y: 0, strength: 0 };
    const [fromId, toId] = edgeKey.split('->');
    const fromNode = this.config.nodes.find((n) => n.id === fromId);
    const toNode = this.config.nodes.find((n) => n.id === toId);
    if (!fromNode || !toNode) return { x: 0, y: 0, strength: 0 };

    const from = this.graph.point(fromNode, time);
    const to = this.graph.point(toNode, time);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;

    const strength = Math.min(1, 0.35 + this.story.slides.length * 0.08);
    return { x: dx / len, y: dy / len, strength };
  }

  start() {
    this.graph.init();
    this.pointField.init();
    this.controller.bind();
    this.story.reset();
    this.ui.setStatus(this.config.copy?.ready || 'Ready');
    this.ui.render(this.story, null);

    const loop = (time) => {
      this.controller.tick(time);
      this.state.path = this.story.path;
      this.state.edges = this.edgeSetFromStory();
      this.state.dragSource = this.controller.dragSource;
      this.state.selectedSource = this.controller.selectedSource;
      this.state.activeEdge = this.latestEdgeKey();
      this.state.flow = this.flowVectorFromEdge(this.state.activeEdge, time);

      this.state.edges.forEach((edgeKey) => {
        this.graph.ensureEdgeKey(edgeKey);
      });

      this.pointField.tick(time, this.state);
      this.graph.tick(time, this.state);
      window.requestAnimationFrame(loop);
    };

    window.requestAnimationFrame(loop);
  }
}

function installEditorialOrigami() {
  const cards = [...document.querySelectorAll('.editorial-card')];
  let hoverTimer = null;
  let interactionLockedUntil = 0;
  const interactionLockMs = 900;

  const setCardOpen = (card, open) => {
    const fold = card.querySelector('.card-meta');
    if (!fold) return;

    if (open) {
      card.classList.remove('folded');
      card.style.setProperty('--origami-open-height', `${Math.ceil(card.scrollHeight)}px`);
    } else {
      card.classList.add('folded');
    }
    fold.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const arrangeCards = (activeCard) => {
    const activeIndex = cards.indexOf(activeCard);
    const beforeCount = activeIndex;
    const afterCount = cards.length - activeIndex - 1;

    cards.forEach((card, index) => {
      card.classList.toggle('is-active', card === activeCard);
      card.classList.toggle('before-active', index < activeIndex);
      card.classList.toggle('after-active', index > activeIndex);

      const groupCount = index < activeIndex ? beforeCount : afterCount;
      if (card !== activeCard && groupCount > 0) {
        card.style.setProperty('--mondrian-span', `${60 / groupCount}`);
      } else {
        card.style.removeProperty('--mondrian-span');
      }
    });
  };

  const activateCard = (card, block = 'center') => {
    if (!card.classList.contains('folded')) return;
    if (Date.now() < interactionLockedUntil) return;

    interactionLockedUntil = Date.now() + interactionLockMs;
    cards.forEach((otherCard) => setCardOpen(otherCard, otherCard === card));
    arrangeCards(card);
    window.requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: 'smooth', block });
    });
  };

  cards.forEach((card, index) => {
    const fold = card.querySelector('.card-meta');
    if (!fold) return;

    const openHeight = Math.max(card.scrollHeight, card.getBoundingClientRect().height);
    card.classList.add('origami-card');
    card.style.setProperty('--origami-open-height', `${Math.ceil(openHeight)}px`);
    fold.classList.add('origami-fold');
    fold.setAttribute('role', 'button');
    fold.setAttribute('tabindex', '0');
    fold.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');

    if (index !== 0) card.classList.add('folded');

    const toggle = () => activateCard(card, 'center');

    fold.addEventListener('click', toggle);
    fold.addEventListener('mouseenter', () => {
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => activateCard(card, 'center'), 160);
    });
    fold.addEventListener('mouseleave', () => {
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
    });
    fold.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggle();
    });
  });

  arrangeCards(cards[0]);
}

async function boot() {
  const config = await ConfigLoader.load('/generated/teaser.config.json');
  hydratePage(config);
  const app = new TeaserApp(config);
  app.start();
  window.requestAnimationFrame(installEditorialOrigami);
}

boot().catch((err) => {
  const status = document.getElementById('scene-status');
  if (status) {
    status.textContent = `Engine error: ${err?.message || err}`;
  }
  console.error(err);
});
