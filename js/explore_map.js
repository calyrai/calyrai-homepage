// Explore map — deterministic, expandable constellation with pan/zoom + persistence
(function () {
  const svg = document.getElementById("explore-svg");
  const stage = document.getElementById("explore-stage");
  const links = document.querySelector(".explore-links");
  if (!svg || !stage) return;

  function siteRootPrefix() {
    if (window.location && window.location.protocol === "file:") return ".";
    const path = (window.location && window.location.pathname) ? String(window.location.pathname) : "/";
    const segments = path.replace(/\/+$/, "").split("/").filter(Boolean);
    const depth = Math.max(0, segments.length - 1);
    if (depth <= 0) return ".";
    return Array.from({ length: depth }, () => "..").join("/");
  }

  function detectFileSiteRoot() {
    const path = (window.location && window.location.pathname) ? String(window.location.pathname) : "";
    for (const marker of ["/public/", "/src/"]) {
      const idx = path.lastIndexOf(marker);
      if (idx !== -1) return path.slice(0, idx + marker.length);
    }
    const parts = path.split("/");
    parts.pop();
    return `${parts.join("/")}/`;
  }

  const ROOT_PREFIX = siteRootPrefix();
  const FILE_SITE_ROOT = window.location && window.location.protocol === "file:" ? detectFileSiteRoot() : "";

  function toSiteRootHref(href) {
    if (!href) return href;
    const s = String(href);
    if (s.startsWith("#")) return s;
    if (s.startsWith("mailto:")) return s;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s; // http(s): etc.
    if (FILE_SITE_ROOT) return new URL(s, `file://${FILE_SITE_ROOT}`).href;
    if (ROOT_PREFIX === ".") return s;
    return `${ROOT_PREFIX}/${s}`;
  }

  const NEXUS_HREF = toSiteRootHref("explore.html");

  const STORAGE_KEY = "calyr_explore_state_v7";
  const LEGACY_STORAGE_KEYS = ["calyr_explore_state_v3", "calyr_explore_state_v4", "calyr_explore_state_v5", "calyr_explore_state_v6"];
  const ENGAGEMENT_KEY = "calyr_explore_engagement_v1";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist2 = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  };

  function el(name, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  }

  function hash01(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;
  }

  const motionQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  // Keep the constellation subtly alive even with reduced-motion enabled,
  // but scale movement down significantly.
  let motionScale = motionQuery && motionQuery.matches ? 0.35 : 1;
  let animTimeSec = 0;
  let rafId = 0;

  function driftOffset(id, t) {
    if (!motionScale) return { dx: 0, dy: 0 };
    const h = hash01(`drift:${id}`);
    const h2 = hash01(`drift2:${id}`);
    const phase = 2 * Math.PI * hash01(`driftp:${id}`);
    const amp = (10 + 16 * h) * motionScale;
    const speed = (0.35 + 0.65 * h2) * (0.75 + 0.25 * motionScale);
    const dx = Math.sin(t * speed + phase) * amp;
    const dy = Math.cos(t * (speed * 0.86) + phase * 1.3) * (amp * 0.78);
    return { dx, dy };
  }

  function animatedPos(id, t) {
    const n = nodes[id];
    if (!n) return null;
    const d = driftOffset(id, t);
    return { x: n.x + d.dx, y: n.y + d.dy };
  }

  function updateMotionPreference() {
    motionScale = motionQuery && motionQuery.matches ? 0.35 : 1;
    startAnimation();
    updateAnimatedPositions();
  }

  if (motionQuery) {
    if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", updateMotionPreference);
    else if (typeof motionQuery.addListener === "function") motionQuery.addListener(updateMotionPreference);
  }

  function safeJsonParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function lsGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function lsRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function getEngagement() {
    const n = Number(lsGet(ENGAGEMENT_KEY) || "0");
    return Number.isFinite(n) ? n : 0;
  }

  function bumpEngagement() {
    const next = getEngagement() + 1;
    lsSet(ENGAGEMENT_KEY, String(next));
    return next;
  }

  const HIDDEN_NODE_IDS = new Set(["parvotec"]);

  const projects = (window.CALYR_PROJECTS || [])
    .map((p) => ({
      id: String(p.id),
      title: String(p.title),
      href: toSiteRootHref(p.url ? String(p.url) : `projects.html#project-${encodeURIComponent(p.id)}`),
    }))
    .filter((p) => !HIDDEN_NODE_IDS.has(p.id));

  const nodeCatalog = [
    ...projects,
    {
      id: "collaborate",
      title: "Collaborate",
      href: "mailto:rupert.tscheliessnig@calyr.ai?subject=Calyr.ai%20collaboration",
    },
  ];

  const catalogById = new Map(nodeCatalog.map((n) => [n.id, n]));

  let dims = { width: 1200, height: 720 };
  let viewport = null;
  let edgesGroup = null;
  let nodesGroup = null;

  let transform = { x: 0, y: 0, k: 1 };
  let activeId = "nexus";

  /** @type {Record<string, {id:string,x:number,y:number,expanded:number}>} */
  let nodes = Object.create(null);
  /** @type {Array<{from:string,to:string}>} */
  let edges = [];
  /** @type {string[]} */
  let remaining = [];

  let isPointerDown = false;
  let isDragging = false;
  let isNodeDragging = false;
  let pointerStart = { x: 0, y: 0 };
  let transformStart = { x: 0, y: 0, k: 1 };
  let pointerDownOnNodeId = "";
  let nodeDragId = "";
  let nodeDragGrabOffset = { x: 0, y: 0 };

  let saveTimer = 0;

  function updateAnimatedPositions() {
    if (!nodesGroup || !edgesGroup) return;
    const t = animTimeSec;

    const gs = nodesGroup.querySelectorAll(".explore-node");
    gs.forEach((g) => {
      const id = g.getAttribute("data-id") || "";
      const p = id ? animatedPos(id, t) : null;
      if (!p) return;
      g.setAttribute("transform", `translate(${p.x} ${p.y})`);
    });

    const lines = edgesGroup.querySelectorAll("line.explore-constellation-line");
    lines.forEach((line) => {
      const from = line.getAttribute("data-from") || "";
      const to = line.getAttribute("data-to") || "";
      const a = from ? animatedPos(from, t) : null;
      const b = to ? animatedPos(to, t) : null;
      if (!a || !b) return;
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
    });
  }

  function tick(nowMs) {
    if (!rafId) return;
    animTimeSec = nowMs / 1000;
    updateAnimatedPositions();
    rafId = window.requestAnimationFrame(tick);
  }

  function startAnimation() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(tick);
  }

  function stopAnimation() {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function computeDims() {
    const rect = stage.getBoundingClientRect();
    dims = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };
    svg.setAttribute("viewBox", `0 0 ${dims.width} ${dims.height}`);
    svg.setAttribute("preserveAspectRatio", "none");
  }

  function setViewportTransform() {
    if (!viewport) return;
    viewport.setAttribute("transform", `translate(${transform.x} ${transform.y}) scale(${transform.k})`);
  }

  function stageToSvgPoint(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const sx = clamp(clientX - rect.left, 0, rect.width);
    const sy = clamp(clientY - rect.top, 0, rect.height);
    return { sx, sy };
  }

  function stageToWorld(clientX, clientY) {
    const { sx, sy } = stageToSvgPoint(clientX, clientY);
    return {
      x: (sx - transform.x) / transform.k,
      y: (sy - transform.y) / transform.k,
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
    defs.appendChild(glow);

    const grad = el("linearGradient", { id: "explore-magenta", x1: "0%", y1: "0%", x2: "100%", y2: "100%" });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "#ff8cf6" }));
    grad.appendChild(el("stop", { offset: "50%", "stop-color": "#d946ef" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#7e22ce" }));
    defs.appendChild(grad);

    svg.appendChild(defs);

    viewport = el("g", { class: "explore-viewport" });
    svg.appendChild(viewport);

    edgesGroup = el("g", { class: "explore-edges" });
    viewport.appendChild(edgesGroup);

    nodesGroup = el("g", { class: "explore-nodes" });
    viewport.appendChild(nodesGroup);

    setViewportTransform();
  }

  function buildLinkList() {
    if (!links) return;
    links.innerHTML = "";

    const all = [
      { id: "nexus", title: "Nexus", href: NEXUS_HREF },
      ...nodeCatalog,
    ];

    for (const n of all) {
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

  function scheduleSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveTimer = 0;
      const payload = {
        v: 5,
        nodes,
        edges,
        remaining,
        transform,
        activeId,
      };
      lsSet(STORAGE_KEY, JSON.stringify(payload));
    }, 120);
  }

  function restoreState() {
    const raw = lsGet(STORAGE_KEY);
    if (!raw) return false;
    const parsed = safeJsonParse(raw);
    if (!parsed || parsed.v !== 5) return false;
    if (!parsed.nodes || !parsed.edges || !parsed.remaining || !parsed.transform) return false;

    nodes = parsed.nodes;
    edges = parsed.edges;
    remaining = Array.isArray(parsed.remaining) ? parsed.remaining : [];
    transform = parsed.transform;
    activeId = parsed.activeId || "nexus";

    // Backward compatibility: older saved states used "northpole" as the root id.
    if (nodes && nodes["northpole"] && !nodes["nexus"]) {
      nodes["nexus"] = nodes["northpole"];
      nodes["nexus"].id = "nexus";
      delete nodes["northpole"];
    }
    if (activeId === "northpole") activeId = "nexus";
    if (Array.isArray(edges) && edges.length) {
      edges = edges.map((e) => ({
        from: e.from === "northpole" ? "nexus" : e.from,
        to: e.to === "northpole" ? "nexus" : e.to,
      }));
    }
    if (Array.isArray(remaining) && remaining.length) {
      const mapped = remaining.map((id) => (id === "northpole" ? "nexus" : id));
      remaining = Array.from(new Set(mapped));
    }

    const validIds = new Set(["nexus", ...nodeCatalog.map((n) => n.id)]);
    const sanitizedNodes = Object.create(null);
    for (const [id, node] of Object.entries(nodes)) {
      if (HIDDEN_NODE_IDS.has(id) || !validIds.has(id)) continue;
      sanitizedNodes[id] = node;
    }
    nodes = sanitizedNodes;
    edges = edges.filter((e) => !HIDDEN_NODE_IDS.has(e.from) && !HIDDEN_NODE_IDS.has(e.to) && validIds.has(e.from) && validIds.has(e.to));
    remaining = remaining.filter((id) => !HIDDEN_NODE_IDS.has(id) && validIds.has(id));
    if (HIDDEN_NODE_IDS.has(activeId) || !validIds.has(activeId)) activeId = "nexus";

    // Ensure we can always keep growing even if a saved state stored an empty/invalid queue.
    if (!Array.isArray(remaining) || remaining.length === 0) {
      const present = new Set(Object.keys(nodes));
      remaining = nodeCatalog.map((n) => n.id).filter((id) => !present.has(id));
    }
    return true;
  }

  function purgeLegacyState() {
    for (const key of LEGACY_STORAGE_KEYS) lsRemove(key);

    const raw = lsGet(STORAGE_KEY);
    if (!raw) return;
    const parsed = safeJsonParse(raw);
    if (!parsed) {
      lsRemove(STORAGE_KEY);
      return;
    }

    const nodeIds = parsed.nodes && typeof parsed.nodes === "object" ? Object.keys(parsed.nodes) : [];
    const hasHiddenNode = nodeIds.some((id) => HIDDEN_NODE_IDS.has(id));
    const hasHiddenEdge = Array.isArray(parsed.edges) && parsed.edges.some((edge) => HIDDEN_NODE_IDS.has(edge.from) || HIDDEN_NODE_IDS.has(edge.to));
    const hasHiddenRemaining = Array.isArray(parsed.remaining) && parsed.remaining.some((id) => HIDDEN_NODE_IDS.has(id));
    const hiddenActive = HIDDEN_NODE_IDS.has(parsed.activeId);

    if (hasHiddenNode || hasHiddenEdge || hasHiddenRemaining || hiddenActive) lsRemove(STORAGE_KEY);
  }

  function resetState() {
    nodes = Object.create(null);
    edges = [];
    remaining = nodeCatalog.map((n) => n.id);

    const root = {
      id: "nexus",
      x: dims.width * 0.5,
      y: dims.height * 0.18,
      expanded: 0,
    };
    nodes[root.id] = root;
    showLink(root.id);

    // BFS-seed explicit connections declared in nexus.yaml (via CALYR_NEXUS_EDGES).
    const yamlEdges = (typeof window !== "undefined" && window.CALYR_NEXUS_EDGES) || [];
    if (yamlEdges.length > 0) {
      const adj = Object.create(null);
      yamlEdges.forEach(function (e) {
        if (!adj[e.from]) adj[e.from] = [];
        adj[e.from].push(e.to);
      });
      const bfsQueue = ["nexus"];
      const visited = new Set(["nexus"]);
      while (bfsQueue.length) {
        const cur = bfsQueue.shift();
        (adj[cur] || []).forEach(function (childId) {
          if (!visited.has(childId)) {
            visited.add(childId);
            addNode(cur, childId);
            bfsQueue.push(childId);
          }
        });
      }
    }

    // Remove already-placed nodes from the organic-expansion queue.
    const placed = new Set(Object.keys(nodes));
    remaining = remaining.filter((id) => !placed.has(id));

    transform = { x: 0, y: 0, k: 1 };
    activeId = "nexus";

    expandFrom("nexus", remaining.length);
  }

  function nodeRadius() {
    const base = Math.min(dims.width, dims.height);
    return clamp(base * 0.12, 110, 190);
  }

  function findNonOverlappingPosition(parentId, childId, attemptIndex) {
    const parent = nodes[parentId];
    const baseR = nodeRadius();
    const seed = `${parentId}>${childId}:${attemptIndex}`;
    const h = hash01(seed);
    const angle = Math.PI * (0.15 + 0.70 * h);
    const r = baseR + attemptIndex * 18;
    return {
      x: parent.x + Math.cos(angle) * r,
      y: parent.y + Math.sin(angle) * r,
    };
  }

  function addNode(parentId, childId) {
    const parent = nodes[parentId];
    if (!parent) return;
    // If already placed (multi-parent), just record the cross-edge.
    if (nodes[childId]) {
      if (!edges.some((e) => e.from === parentId && e.to === childId)) {
        edges.push({ from: parentId, to: childId });
      }
      return;
    }

    const minSep2 = 54 * 54;
    let pos = null;
    for (let attempt = 0; attempt < 14; attempt++) {
      const candidate = findNonOverlappingPosition(parentId, childId, attempt);
      let ok = true;
      for (const existing of Object.values(nodes)) {
        if (dist2(candidate, existing) < minSep2) {
          ok = false;
          break;
        }
      }
      if (ok) {
        pos = candidate;
        break;
      }
      pos = candidate;
    }

    nodes[childId] = { id: childId, x: pos.x, y: pos.y, expanded: 0 };
    edges.push({ from: parentId, to: childId });
    showLink(childId);
  }

  function expandFrom(id, count = 1) {
    const parent = nodes[id];
    if (!parent) return;
    if (!remaining.length) return;

    for (let i = 0; i < count; i++) {
      const nextId = remaining.shift();
      if (!nextId) break;
      addNode(id, nextId);
      parent.expanded += 1;
    }

    bumpEngagement();
    scheduleSave();
    render();
  }

  function setActive(id) {
    activeId = id;
    scheduleSave();
    updateActiveStyles();
  }

  function updateActiveStyles() {
    const gs = nodesGroup ? nodesGroup.querySelectorAll(".explore-node") : [];
    gs.forEach((g) => {
      const id = g.getAttribute("data-id") || "";
      g.classList.toggle("is-active", id === activeId);
    });
  }

  function renderEdges() {
    edgesGroup.innerHTML = "";
    for (const e of edges) {
      const a = nodes[e.from];
      const b = nodes[e.to];
      if (!a || !b) continue;
      const pa = animatedPos(e.from, animTimeSec) || a;
      const pb = animatedPos(e.to, animTimeSec) || b;
      edgesGroup.appendChild(
        el("line", {
          x1: pa.x,
          y1: pa.y,
          x2: pb.x,
          y2: pb.y,
          class: "explore-constellation-line",
          "data-from": e.from,
          "data-to": e.to,
        })
      );
    }
  }

  function createNodeElement(id) {
    const meta = id === "nexus" ? { title: "Nexus", href: NEXUS_HREF } : catalogById.get(id);
    const title = meta ? meta.title : id;
    const href = meta && meta.href ? meta.href : "#";

    const wrapper = el("a", { href });
    if (wrapper.tagName.toLowerCase() === "a") wrapper.setAttribute("rel", "noopener");

    const g = el("g", { class: "explore-node", "data-id": id });
    const p0 = animatedPos(id, animTimeSec) || nodes[id];
    g.setAttribute("transform", `translate(${p0.x} ${p0.y})`);

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

    g.addEventListener("pointerdown", () => {
      pointerDownOnNodeId = id;
    });

    g.addEventListener("mouseenter", () => setActive(id));

    wrapper.appendChild(g);
    return wrapper;
  }

  function navigateToNode(id) {
    const meta = id === "nexus" ? { href: NEXUS_HREF } : catalogById.get(id);
    const href = meta && meta.href ? meta.href : "";
    if (href) window.location.href = href;
  }

  function renderNodes() {
    nodesGroup.innerHTML = "";
    const ids = Object.keys(nodes);
    ids.sort((a, b) => (a === "nexus" ? -1 : b === "nexus" ? 1 : a.localeCompare(b)));
    for (const id of ids) nodesGroup.appendChild(createNodeElement(id));
    updateActiveStyles();
  }

  function render() {
    if (!edgesGroup || !nodesGroup) return;
    renderEdges();
    renderNodes();
  }

  function onPointerDown(ev) {
    isPointerDown = true;
    isDragging = false;
    isNodeDragging = false;
    pointerStart = stageToSvgPoint(ev.clientX, ev.clientY);
    transformStart = { ...transform };

    // Record the clicked node (if any). We intentionally do NOT clear this here,
    // because node handlers run before this bubbled event.
    const target = ev.target;
    if (target && target.closest) {
      const nodeEl = target.closest(".explore-node");
      if (nodeEl) {
        const id = nodeEl.getAttribute("data-id") || "";
        if (id) {
          pointerDownOnNodeId = id;
          nodeDragId = id;

          // Compute grab offset in world coords relative to the node's *animated* position.
          const w = stageToWorld(ev.clientX, ev.clientY);
          const p = animatedPos(id, animTimeSec) || nodes[id];
          if (p) nodeDragGrabOffset = { x: w.x - p.x, y: w.y - p.y };
        }
      }
    }

    svg.setPointerCapture(ev.pointerId);
  }

  function onPointerMove(ev) {
    if (!isPointerDown) {
      const w = stageToWorld(ev.clientX, ev.clientY);
      let best = "";
      let bestD2 = Infinity;
      for (const n of Object.values(nodes)) {
        const p = animatedPos(n.id, animTimeSec) || n;
        const d = dist2(w, p);
        if (d < bestD2) {
          bestD2 = d;
          best = n.id;
        }
      }
      if (best && best !== activeId) setActive(best);
      return;
    }

    // If pointer started on a node, prefer node dragging over panning.
    if (nodeDragId && nodes[nodeDragId]) {
      const cur = stageToSvgPoint(ev.clientX, ev.clientY);
      const dx = cur.sx - pointerStart.sx;
      const dy = cur.sy - pointerStart.sy;

      // Small threshold before starting an actual drag.
      if (!isNodeDragging && (dx * dx + dy * dy > 16)) isNodeDragging = true;
      if (!isNodeDragging) return;

      const w = stageToWorld(ev.clientX, ev.clientY);
      const desiredAnimated = { x: w.x - nodeDragGrabOffset.x, y: w.y - nodeDragGrabOffset.y };
      const d = driftOffset(nodeDragId, animTimeSec);

      nodes[nodeDragId].x = desiredAnimated.x - d.dx;
      nodes[nodeDragId].y = desiredAnimated.y - d.dy;

      // Update visuals immediately (RAF will keep it smooth).
      updateAnimatedPositions();
      return;
    }

    const cur = stageToSvgPoint(ev.clientX, ev.clientY);
    const dx = cur.sx - pointerStart.sx;
    const dy = cur.sy - pointerStart.sy;
    if (!isDragging && (dx * dx + dy * dy > 16)) isDragging = true;
    if (!isDragging) return;

    transform.x = transformStart.x + dx;
    transform.y = transformStart.y + dy;
    setViewportTransform();
  }

  function onPointerUp(ev) {
    if (!isPointerDown) return;
    isPointerDown = false;
    svg.releasePointerCapture(ev.pointerId);

    if (isNodeDragging) {
      isNodeDragging = false;
      nodeDragId = "";
      pointerDownOnNodeId = "";
      scheduleSave();
      return;
    }

    if (isDragging) {
      scheduleSave();
      return;
    }

    if (pointerDownOnNodeId) {
      setActive(pointerDownOnNodeId);
      navigateToNode(pointerDownOnNodeId);
    }

    pointerDownOnNodeId = "";
    nodeDragId = "";
  }

  function onWheel(ev) {
    ev.preventDefault();
    const { sx, sy } = stageToSvgPoint(ev.clientX, ev.clientY);
    const before = { x: (sx - transform.x) / transform.k, y: (sy - transform.y) / transform.k };
    const zoom = Math.exp(-ev.deltaY * 0.0012);
    const nextK = clamp(transform.k * zoom, 0.55, 2.4);
    transform.k = nextK;
    transform.x = sx - before.x * transform.k;
    transform.y = sy - before.y * transform.k;
    setViewportTransform();
    scheduleSave();
  }

  function onResize() {
    computeDims();
    setViewportTransform();
  }

  function init() {
    computeDims();
    buildSvg();
    buildLinkList();
    purgeLegacyState();

    const restored = restoreState();
    if (!restored) resetState();

    setViewportTransform();
    render();
    updateMotionPreference();
    scheduleSave();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAnimation();
      else if (motionScale) startAnimation();
    });

    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    svg.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
