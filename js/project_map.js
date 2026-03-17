// Project pages — mouse-driven straight-line chain with nodes for on-page sections
(function () {
  const svg = document.getElementById("project-svg");
  const stage = document.getElementById("project-stage");
  const links = document.querySelector(".project-links");

  if (!svg || !stage) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const lsGet = (key) => {
    try {
      return window.localStorage ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  };

  const lsSet = (key, value) => {
    try {
      if (window.localStorage) window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  };

  const motionQuery =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionScale = motionQuery && motionQuery.matches ? 0.35 : 1;
  if (motionQuery && typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", (e) => {
      motionScale = e.matches ? 0.35 : 1;
    });
  }

  function el(name, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  }

  function len(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function normalize(v) {
    const l = Math.sqrt(v.x * v.x + v.y * v.y) || 1;
    return { x: v.x / l, y: v.y / l };
  }

  function safeId(val) {
    return String(val || "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
  }

  const projectId = safeId(document.body.getAttribute("data-project-id"));
  const projects = window.CALYR_PROJECTS || [];
  const project = projects.find((p) => safeId(p.id) === projectId) || null;

  const accent = (project && project.color) ? project.color : "#ff4df5";

  const pageTitle = (project && project.title) ? project.title : "Project";

  const nodesData = [
    { id: "overview", title: "Overview", href: "#overview" },
    { id: "methods", title: "Methods", href: "#methods" },
    { id: "demo", title: "Interactive", href: "#demo" },
    { id: "links", title: "Links", href: "#links" },
    {
      id: "projects",
      title: "Back to Projects",
      href: projectId ? `../projects.html#project-${encodeURIComponent(projectId)}` : "../projects.html",
    },
  ];

  let dims = { width: 1200, height: 720 };
  let pathBase = null;
  let pathAccent = null;
  let nodesGroup = null;
  let constellationGroup = null;

  // Chain state
  let origin = { x: 0, y: 0 };
  let mouse = { x: 0, y: 0 };
  let points = [];
  let spawnIndex = 0;
  let nextSpawnDistancePx = 160;
  let activeId = "";
  let rafPending = false;
  let lastSpawnAt = 0;
  let lastMouseForSpawn = { x: 0, y: 0 };

  // Motion + layout
  const nodeBase = new Map(); // id -> {x,y}
  let animTimeSec = 0;
  let rafId = 0;
  let autoMode = true;

  let isNodeDragging = false;
  let nodeDragId = "";
  let nodeDragGrabOffset = { x: 0, y: 0 };
  let nodeDragStartClient = { x: 0, y: 0 };
  let nodeDragMoved = false;

  const DRAG_THRESHOLD_PX = 7;

  function layoutKey() {
    return `calyr_project_map_layout_v1:${projectId || location.pathname}`;
  }

  function readLayout() {
    const raw = lsGet(layoutKey());
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeLayout() {
    const obj = {};
    for (const [id, pos] of nodeBase.entries()) {
      obj[id] = { x: pos.x, y: pos.y };
    }
    lsSet(layoutKey(), JSON.stringify(obj));
  }

  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function driftAmplitudePx() {
    const base = Math.min(dims.width, dims.height);
    return clamp(base / 210, 2.5, 8.5) * motionScale;
  }

  function driftOffset(id) {
    const seed = hash32(String(id || "node"));
    const a = driftAmplitudePx();

    const t = animTimeSec;
    const f1 = 0.55 + ((seed % 97) / 97) * 0.45;
    const f2 = 0.62 + (((seed >>> 8) % 89) / 89) * 0.50;
    const p1 = ((seed % 360) * Math.PI) / 180;
    const p2 = (((seed >>> 12) % 360) * Math.PI) / 180;

    return {
      x: Math.sin(t * f1 + p1) * a,
      y: Math.cos(t * f2 + p2) * a,
    };
  }

  function animatedPos(id, basePos) {
    const off = driftOffset(id);
    return { x: basePos.x + off.x, y: basePos.y + off.y };
  }

  // pacing
  const SPAWN_COOLDOWN_MS = 520;
  const MIN_MOUSE_MOVE_PX = 18;

  function computeDims() {
    const rect = stage.getBoundingClientRect();
    dims = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };
    svg.setAttribute("viewBox", `0 0 ${dims.width} ${dims.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
  }

  function randomSpawnDistance() {
    const base = Math.min(dims.width, dims.height);
    const minD = clamp(base * 0.12, 86, 180);
    const maxD = clamp(base * 0.30, 160, 320);
    return minD + Math.random() * (maxD - minD);
  }

  function randomStartPoint() {
    const pad = 0.12;
    return {
      x: (pad + Math.random() * (1 - 2 * pad)) * dims.width,
      y: (pad + Math.random() * (1 - 2 * pad)) * dims.height,
    };
  }

  function buildSvg() {
    svg.innerHTML = "";

    const defs = el("defs");

    const glow = el("filter", { id: "project-glow" });
    glow.appendChild(el("feGaussianBlur", { stdDeviation: "8", result: "coloredBlur" }));
    const merge = el("feMerge");
    merge.appendChild(el("feMergeNode", { in: "coloredBlur" }));
    merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
    glow.appendChild(merge);

    const grad = el("linearGradient", {
      id: "project-accent",
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%",
    });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": accent }));
    grad.appendChild(el("stop", { offset: "58%", "stop-color": "#ff4df5" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#24f3ff" }));

    defs.appendChild(glow);
    defs.appendChild(grad);
    svg.appendChild(defs);

    constellationGroup = el("g", { class: "explore-constellation" });
    svg.appendChild(constellationGroup);

    pathBase = el("path", { class: "explore-path-base" });
    pathAccent = el("path", {
      class: "explore-path-magenta",
      stroke: "url(#project-accent)",
      filter: "url(#project-glow)",
    });

    svg.appendChild(pathBase);
    svg.appendChild(pathAccent);

    nodesGroup = el("g");
    svg.appendChild(nodesGroup);
  }

  function buildLinkList() {
    if (!links) return;
    links.innerHTML = "";

    const label = document.createElement("div");
    label.className = "project-links-label";
    label.textContent = pageTitle + " — Quick links";
    label.style.display = "none";
    links.appendChild(label);

    for (const n of nodesData) {
      const a = document.createElement("a");
      a.href = n.href;
      a.textContent = n.title;
      a.setAttribute("data-id", n.id);
      a.style.display = "none";
      links.appendChild(a);
    }
  }

  function showLink(id) {
    if (!links) return;
    const a = links.querySelector(`a[data-id="${id}"]`);
    if (a) a.style.display = "inline-flex";
  }

  function polylineD(previewEnd) {
    const pts = [...points, previewEnd].filter(Boolean);
    if (pts.length < 2) return "";
    const parts = [`M ${pts[0].x} ${pts[0].y}`];
    for (let i = 1; i < pts.length; i++) parts.push(`L ${pts[i].x} ${pts[i].y}`);
    return parts.join(" ");
  }

  function updatePaths() {
    const chain = points.map((p) => ({
      x: p.x,
      y: p.y,
      id: p.id,
    }));
    const animatedChain = chain.map((p) => (p.id ? animatedPos(p.id, p) : p));
    const preview = mouse && mouse.id ? animatedPos(mouse.id, mouse) : mouse;
    const d = (function () {
      const pts = [...animatedChain, preview].filter(Boolean);
      if (pts.length < 2) return "";
      const parts = [`M ${pts[0].x} ${pts[0].y}`];
      for (let i = 1; i < pts.length; i++) parts.push(`L ${pts[i].x} ${pts[i].y}`);
      return parts.join(" ");
    })();
    pathBase.setAttribute("d", d);
    pathAccent.setAttribute("d", d);
  }

  function addConstellationLine(from, to, fromId, toId) {
    if (!constellationGroup) return;
    const line = el("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      class: "explore-constellation-line",
    });
    if (fromId) line.setAttribute("data-from", fromId);
    if (toId) line.setAttribute("data-to", toId);
    constellationGroup.appendChild(line);
  }

  function createNode(id, title, href, x, y) {
    const a = el("a", { href, "data-href": href });

    const g = el("g", { class: "explore-node", "data-id": id });
    nodeBase.set(id, { x, y });
    const pos = animatedPos(id, { x, y });
    g.setAttribute("transform", `translate(${pos.x} ${pos.y})`);

    const pulse = el("circle", { class: "node-pulse", r: "18", filter: "url(#project-glow)" });
    const pulse2 = el("circle", { class: "node-pulse node-pulse--2", r: "18", filter: "url(#project-glow)" });
    const ring = el("circle", { class: "node-ring", r: "14" });
    const dot = el("circle", { class: "node-dot", r: "4.8" });

    const label = el("text", { class: "explore-node-label", x: "0", y: "-20" });
    label.textContent = title;

    g.appendChild(pulse);
    g.appendChild(pulse2);
    g.appendChild(ring);
    g.appendChild(dot);
    g.appendChild(label);

    g.addEventListener("mouseenter", () => {
      activeId = id;
      updateActiveStyles();
    });

    g.addEventListener("pointerdown", (e) => {
      // Start drag; preserve click if user doesn't move beyond threshold.
      autoMode = false;
      isNodeDragging = true;
      nodeDragId = id;
      nodeDragMoved = false;
      nodeDragStartClient = { x: e.clientX, y: e.clientY };

      const rect = stage.getBoundingClientRect();
      const cursor = {
        x: clamp(e.clientX - rect.left, 0, rect.width),
        y: clamp(e.clientY - rect.top, 0, rect.height),
      };

      const basePos = nodeBase.get(id) || { x, y };
      const rendered = animatedPos(id, basePos);
      nodeDragGrabOffset = { x: cursor.x - rendered.x, y: cursor.y - rendered.y };

      if (typeof g.setPointerCapture === "function") {
        try { g.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      }
    });

    a.addEventListener(
      "click",
      (e) => {
        // If it was a drag, swallow the click navigation.
        if (nodeDragMoved && nodeDragId === id) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );

    a.appendChild(g);
    nodesGroup.appendChild(a);

    activeId = id;
    updateActiveStyles();
    showLink(id);
  }

  function updateActiveStyles() {
    const gEls = nodesGroup.querySelectorAll(".explore-node");
    gEls.forEach((g) => {
      const id = g.getAttribute("data-id");
      g.classList.toggle("is-active", id === activeId);
    });
  }

  function setMouseFromEvent(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);
    mouse = { x, y };
  }

  function maybeSpawnNodesTowardMouse() {
    if (spawnIndex >= nodesData.length) return;

    const now = performance.now();
    if (now - lastSpawnAt < SPAWN_COOLDOWN_MS) return;

    const moved = len(mouse, lastMouseForSpawn);
    if (moved < MIN_MOUSE_MOVE_PX) return;

    const d = len(origin, mouse);
    if (d < nextSpawnDistancePx) return;

    const dir = normalize({ x: mouse.x - origin.x, y: mouse.y - origin.y });
    const nodePos = {
      x: origin.x + dir.x * nextSpawnDistancePx,
      y: origin.y + dir.y * nextSpawnDistancePx,
    };

    const node = nodesData[spawnIndex];
    createNode(node.id, node.title, node.href, nodePos.x, nodePos.y);

    if (points.length >= 2) {
      if (Math.random() < 0.8) {
        const idx = Math.floor(Math.random() * Math.max(1, points.length - 1));
        addConstellationLine(nodePos, points[idx], node.id, points[idx].id);
      }
      if (Math.random() < 0.28) {
        const idx2 = Math.floor(Math.random() * Math.max(1, points.length - 1));
        addConstellationLine(nodePos, points[idx2], node.id, points[idx2].id);
      }
    }

    points.push({ ...nodePos, id: node.id });
    origin = nodePos;
    spawnIndex += 1;
    nextSpawnDistancePx = randomSpawnDistance();
    lastSpawnAt = now;
    lastMouseForSpawn = { x: mouse.x, y: mouse.y };

    // Persist incremental layout so reloads keep the constellation.
    writeLayout();
  }

  function scheduleRender() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updatePaths();
    });
  }

  function onMove(e) {
    autoMode = false;
    if (isNodeDragging) return;
    setMouseFromEvent(e.clientX, e.clientY);
    maybeSpawnNodesTowardMouse();
    scheduleRender();
  }

  function onTouchMove(e) {
    autoMode = false;
    if (isNodeDragging) return;
    if (!e.touches || !e.touches[0]) return;
    setMouseFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    maybeSpawnNodesTowardMouse();
    scheduleRender();
  }

  function updateAnimatedPositions() {
    // Update node transforms
    const gEls = nodesGroup.querySelectorAll(".explore-node");
    gEls.forEach((g) => {
      const id = g.getAttribute("data-id");
      const basePos = nodeBase.get(id);
      if (!basePos) return;
      const pos = animatedPos(id, basePos);
      g.setAttribute("transform", `translate(${pos.x} ${pos.y})`);
    });

    // Update constellation lines
    if (constellationGroup) {
      const lines = constellationGroup.querySelectorAll("line.explore-constellation-line");
      lines.forEach((line) => {
        const fromId = line.getAttribute("data-from");
        const toId = line.getAttribute("data-to");
        const fromBase = fromId ? nodeBase.get(fromId) : null;
        const toBase = toId ? nodeBase.get(toId) : null;
        if (!fromBase || !toBase) return;
        const from = animatedPos(fromId, fromBase);
        const to = animatedPos(toId, toBase);
        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);
        line.setAttribute("x2", to.x);
        line.setAttribute("y2", to.y);
      });
    }

    updatePaths();
  }

  function onGlobalPointerMove(e) {
    if (!isNodeDragging || !nodeDragId) return;

    const basePos = nodeBase.get(nodeDragId);
    if (!basePos) return;

    const dx = e.clientX - nodeDragStartClient.x;
    const dy = e.clientY - nodeDragStartClient.y;
    if (!nodeDragMoved && Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
      nodeDragMoved = true;
    }

    const rect = stage.getBoundingClientRect();
    const cursor = {
      x: clamp(e.clientX - rect.left, 0, rect.width),
      y: clamp(e.clientY - rect.top, 0, rect.height),
    };

    const off = driftOffset(nodeDragId);
    const nextBase = {
      x: cursor.x - nodeDragGrabOffset.x - off.x,
      y: cursor.y - nodeDragGrabOffset.y - off.y,
    };

    nodeBase.set(nodeDragId, nextBase);
    // Keep the chain points in sync for the main path.
    points = points.map((p) => (p.id === nodeDragId ? { ...p, x: nextBase.x, y: nextBase.y } : p));
    if (activeId === nodeDragId) updateActiveStyles();
    writeLayout();
  }

  function onGlobalPointerUp() {
    if (!isNodeDragging) return;
    isNodeDragging = false;
    nodeDragId = "";
    nodeDragGrabOffset = { x: 0, y: 0 };
    // Reset moved flag after click cycle completes.
    setTimeout(() => {
      nodeDragMoved = false;
    }, 0);
  }

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    animTimeSec = (typeof now === "number" ? now : performance.now()) / 1000;

    if (autoMode && spawnIndex < nodesData.length) {
      const t = animTimeSec;
      mouse = {
        x: dims.width * (0.5 + 0.33 * Math.sin(t * 0.55)),
        y: dims.height * (0.5 + 0.27 * Math.cos(t * 0.62)),
      };
      maybeSpawnNodesTowardMouse();
    }

    updateAnimatedPositions();
  }

  function startAnimation() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  function stopAnimation() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function init() {
    computeDims();
    buildSvg();
    buildLinkList();

    origin = randomStartPoint();
    mouse = { x: origin.x, y: origin.y };
    points = [{ ...origin, id: nodesData[0] ? nodesData[0].id : "" }].filter((p) => p.id);

    nodesGroup.innerHTML = "";
    if (constellationGroup) constellationGroup.innerHTML = "";
    spawnIndex = 0;
    activeId = "";

    // Restore saved layout (if present) so nodes are already on-screen.
    const saved = readLayout();
    if (saved && nodesData.length) {
      points = [];
      spawnIndex = 0;
      for (const node of nodesData) {
        const pos = saved[node.id];
        if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") break;
        const clamped = {
          x: clamp(pos.x, 0, dims.width),
          y: clamp(pos.y, 0, dims.height),
        };
        createNode(node.id, node.title, node.href, clamped.x, clamped.y);
        points.push({ ...clamped, id: node.id });
        origin = { ...clamped };
        spawnIndex += 1;
      }
      if (points.length) {
        mouse = { x: origin.x, y: origin.y };
      }
    }

    if (!saved && nodesData[0]) {
      points = [{ ...origin, id: nodesData[0].id }];
      createNode(nodesData[0].id, nodesData[0].title, nodesData[0].href, origin.x, origin.y);
      spawnIndex = 1;
      writeLayout();
    }

    nextSpawnDistancePx = randomSpawnDistance();
    lastSpawnAt = performance.now();
    lastMouseForSpawn = { x: mouse.x, y: mouse.y };

    updatePaths();

    svg.addEventListener("mousemove", onMove);
    svg.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointermove", onGlobalPointerMove, { passive: true });
    window.addEventListener("pointerup", onGlobalPointerUp, { passive: true });
    window.addEventListener("pointercancel", onGlobalPointerUp, { passive: true });

    window.addEventListener("resize", () => {
      computeDims();
      nodesGroup.innerHTML = "";
      if (constellationGroup) constellationGroup.innerHTML = "";
      nodeBase.clear();
      if (links) {
        const anchors = links.querySelectorAll("a[data-id]");
        anchors.forEach((a) => (a.style.display = "none"));
      }
      origin = randomStartPoint();
      mouse = { x: origin.x, y: origin.y };
      points = [];
      spawnIndex = 0;
      activeId = "";

      const saved2 = readLayout();
      if (saved2 && nodesData.length) {
        for (const node of nodesData) {
          const pos = saved2[node.id];
          if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") break;
          const clamped = {
            x: clamp(pos.x, 0, dims.width),
            y: clamp(pos.y, 0, dims.height),
          };
          createNode(node.id, node.title, node.href, clamped.x, clamped.y);
          points.push({ ...clamped, id: node.id });
          origin = { ...clamped };
          spawnIndex += 1;
        }
        if (points.length) mouse = { x: origin.x, y: origin.y };
      }

      if (!saved2 && nodesData[0]) {
        points = [{ ...origin, id: nodesData[0].id }];
        createNode(nodesData[0].id, nodesData[0].title, nodesData[0].href, origin.x, origin.y);
        spawnIndex = 1;
        writeLayout();
      }

      nextSpawnDistancePx = randomSpawnDistance();
      lastSpawnAt = performance.now();
      lastMouseForSpawn = { x: mouse.x, y: mouse.y };
      updatePaths();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    });
    startAnimation();
  }

  // Wait for full layout (CSS) before measuring stage dimensions.
  // Otherwise the SVG can initialize with a tiny viewBox and appear empty.
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();
