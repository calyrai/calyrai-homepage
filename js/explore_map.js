// Explore map — mouse-driven straight-line chain with nodes spawning at random distances
(function () {
  const svg = document.getElementById("explore-svg");
  const stage = document.getElementById("explore-stage");
  const links = document.querySelector(".explore-links");

  if (!svg || !stage) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

  // Data: use existing projects list + a contact node
  const projects = (window.CALYR_PROJECTS || []).map((p) => ({
    id: p.id,
    title: p.title,
    href: p.url ? String(p.url) : `projects.html#project-${encodeURIComponent(p.id)}`,
  }));

  const nodesData = [
    ...projects,
    {
      id: "collaborate",
      title: "Collaborate",
      href: "mailto:rupert.tscheliessnig@calyr.ai?subject=Calyr.ai%20collaboration",
    },
  ];

  let dims = { width: 1200, height: 720 };
  let pathBase = null;
  let pathMagenta = null;
  let nodesGroup = null;
  let constellationGroup = null;

  // Chain state
  let origin = { x: 0, y: 0 }; // current segment start
  let mouse = { x: 0, y: 0 }; // current cursor in stage coords
  let points = []; // polyline points (origin + spawned nodes)
  let spawnIndex = 0; // which node label/link to assign next
  let nextSpawnDistancePx = 160;
  let activeId = "";
  let rafPending = false;
  let lastSpawnAt = 0;
  let lastMouseForSpawn = { x: 0, y: 0 };

  // spawn tuning (prevents burning through nodes too fast)
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
    const minD = clamp(base * 0.13, 90, 190);
    const maxD = clamp(base * 0.34, 180, 360);
    return minD + Math.random() * (maxD - minD);
  }

  function randomStartPoint() {
    const pad = 0.10;
    return {
      x: (pad + Math.random() * (1 - 2 * pad)) * dims.width,
      y: (pad + Math.random() * (1 - 2 * pad)) * dims.height,
    };
  }

  function buildSvg() {
    svg.innerHTML = "";

    const defs = el("defs");
    const glow = el("filter", { id: "explore-glow" });
    glow.appendChild(el("feGaussianBlur", { stdDeviation: "8", result: "coloredBlur" }));
    const merge = el("feMerge");
    merge.appendChild(el("feMergeNode", { in: "coloredBlur" }));
    merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
    glow.appendChild(merge);

    const grad = el("linearGradient", { id: "explore-magenta", x1: "0%", y1: "0%", x2: "100%", y2: "100%" });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "#ff8cf6" }));
    grad.appendChild(el("stop", { offset: "50%", "stop-color": "#d946ef" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#7e22ce" }));

    defs.appendChild(glow);
    defs.appendChild(grad);
    svg.appendChild(defs);

    constellationGroup = el("g", { class: "explore-constellation" });
    svg.appendChild(constellationGroup);

    pathBase = el("path", { class: "explore-path-base" });
    pathMagenta = el("path", {
      class: "explore-path-magenta",
      stroke: "url(#explore-magenta)",
      filter: "url(#explore-glow)",
    });

    svg.appendChild(pathBase);
    svg.appendChild(pathMagenta);

    nodesGroup = el("g");
    svg.appendChild(nodesGroup);
  }

  function buildLinkList() {
    if (!links) return;
    links.innerHTML = "";
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
    const d = polylineD(mouse);
    pathBase.setAttribute("d", d);
    pathMagenta.setAttribute("d", d);
  }

  function addConstellationLine(from, to) {
    if (!constellationGroup) return;
    const line = el("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      class: "explore-constellation-line",
    });
    constellationGroup.appendChild(line);
  }

  function createNode(id, title, href, x, y) {
    const a = el("a", { href });
    a.setAttribute("rel", "noopener");

    const g = el("g", { class: "explore-node", "data-id": id });
    g.setAttribute("transform", `translate(${x} ${y})`);

    const pulse = el("circle", { class: "node-pulse", r: "18", filter: "url(#explore-glow)" });
    const pulse2 = el("circle", { class: "node-pulse node-pulse--2", r: "18", filter: "url(#explore-glow)" });
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

    // Constellation feeling: add 0–2 extra straight connections to older nodes.
    // (Main chain line already exists via the polyline.)
    if (points.length >= 2) {
      // connect to a random earlier node (not the immediate predecessor)
      if (Math.random() < 0.85) {
        const idx = Math.floor(Math.random() * Math.max(1, points.length - 1));
        addConstellationLine(nodePos, points[idx]);
      }
      // sometimes add a second chord
      if (Math.random() < 0.35) {
        const idx2 = Math.floor(Math.random() * Math.max(1, points.length - 1));
        addConstellationLine(nodePos, points[idx2]);
      }
    }

    points.push(nodePos);
    origin = nodePos;
    spawnIndex += 1;
    nextSpawnDistancePx = randomSpawnDistance();
    lastSpawnAt = now;
    lastMouseForSpawn = { x: mouse.x, y: mouse.y };
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
    setMouseFromEvent(e.clientX, e.clientY);
    maybeSpawnNodesTowardMouse();
    scheduleRender();
  }

  function onTouchMove(e) {
    if (!e.touches || !e.touches[0]) return;
    setMouseFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    maybeSpawnNodesTowardMouse();
    scheduleRender();
  }

  function init() {
    computeDims();
    buildSvg();
    buildLinkList();

    origin = randomStartPoint();
    mouse = { x: origin.x, y: origin.y };
    points = [origin];

    // Spawn the first node immediately so the map never feels empty.
    nodesGroup.innerHTML = "";
    if (constellationGroup) constellationGroup.innerHTML = "";
    spawnIndex = 0;
    activeId = "";
    if (nodesData[0]) {
      createNode(nodesData[0].id, nodesData[0].title, nodesData[0].href, origin.x, origin.y);
      spawnIndex = 1;
    }
    nextSpawnDistancePx = randomSpawnDistance();
    lastSpawnAt = performance.now();
    lastMouseForSpawn = { x: mouse.x, y: mouse.y };

    // render initial (single-point path)
    updatePaths();

    // Listen on the SVG (it covers the stage) to avoid event-target quirks.
    svg.addEventListener("mousemove", onMove);
    svg.addEventListener("touchmove", onTouchMove, { passive: true });

    window.addEventListener("resize", () => {
      computeDims();
      // restart chain on resize (keeps it simple + avoids distortion)
      nodesGroup.innerHTML = "";
      if (constellationGroup) constellationGroup.innerHTML = "";
      if (links) {
        const anchors = links.querySelectorAll("a[data-id]");
        anchors.forEach((a) => (a.style.display = "none"));
      }
      origin = randomStartPoint();
      mouse = { x: origin.x, y: origin.y };
      points = [origin];
      spawnIndex = 0;
      activeId = "";
      if (nodesData[0]) {
        createNode(nodesData[0].id, nodesData[0].title, nodesData[0].href, origin.x, origin.y);
        spawnIndex = 1;
      }
      nextSpawnDistancePx = randomSpawnDistance();
      lastSpawnAt = performance.now();
      lastMouseForSpawn = { x: mouse.x, y: mouse.y };
      updatePaths();
    });
  }

  init();
})();
