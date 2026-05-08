const DATA_URL = "../../overleaf_local_prep/thought_snippet_pipeline/iterative_graph/units.json";
const STORAGE_KEY = "calyr_thought_map_edits_v1";

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const hoverTag = document.getElementById("hoverTag");

const searchInput = document.getElementById("searchInput");
const reloadBtn = document.getElementById("reloadBtn");
const exportBtn = document.getElementById("exportBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const unitMeta = document.getElementById("unitMeta");

const titleInput = document.getElementById("titleInput");
const textInput = document.getElementById("textInput");
const tagsInput = document.getElementById("tagsInput");
const legendList = document.getElementById("legendList");

const colors = [
  "#3a7d6f", "#bc6c25", "#7f5539", "#386641", "#6a4c93",
  "#8d99ae", "#9b2226", "#1d3557", "#2a9d8f", "#6b705c",
  "#3d5a80", "#8f2d56", "#4d908e", "#9c6644", "#5f0f40"
];

let state = {
  units: [],
  nodes: [],
  subsystems: [],
  edits: loadEdits(),
  selected: null,
  hovered: null,
  search: "",
  camera: { x: 0, y: 0, zoom: 1 },
  dragging: false,
  dragStart: null,
};

function loadEdits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveEdits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.edits));
}

function applyEdits(unit) {
  const edit = state.edits[unit.id];
  if (!edit) return unit;
  return {
    ...unit,
    title: edit.title ?? unit.title,
    text: edit.text ?? unit.text,
    top_tokens: edit.top_tokens ?? unit.top_tokens,
  };
}

function normalizeUnit(raw) {
  const subsystem = (raw.source_subsystems && raw.source_subsystems[0]) || "unknown";
  return {
    id: raw.id,
    title: raw.title || "untitled",
    text: raw.text || "",
    member_count: raw.member_count || 1,
    top_tokens: raw.top_tokens || [],
    subsystem,
  };
}

function buildLegend() {
  legendList.innerHTML = "";
  state.subsystems.forEach((s, i) => {
    const li = document.createElement("li");
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = colors[i % colors.length];
    const label = document.createElement("span");
    const count = state.nodes.filter((n) => n.unit.subsystem === s).length;
    label.textContent = `${s} (${count})`;
    li.append(sw, label);
    legendList.appendChild(li);
  });
}

function createNodes(units) {
  const bySub = new Map();
  units.forEach((u) => {
    const sub = u.subsystem;
    if (!bySub.has(sub)) bySub.set(sub, []);
    bySub.get(sub).push(u);
  });

  const subs = [...bySub.keys()];
  state.subsystems = subs;

  const radius = 1300;
  const subCenters = new Map();
  subs.forEach((sub, i) => {
    const a = (Math.PI * 2 * i) / Math.max(1, subs.length);
    subCenters.set(sub, {
      x: Math.cos(a) * radius,
      y: Math.sin(a) * radius,
      color: colors[i % colors.length],
    });
  });

  const nodes = [];
  bySub.forEach((arr, sub) => {
    const c = subCenters.get(sub);
    const subR = 120 + Math.sqrt(arr.length) * 32;
    arr.forEach((u, i) => {
      const t = i * 0.61803398875;
      const rr = Math.sqrt(i / Math.max(1, arr.length)) * subR;
      const x = c.x + Math.cos(t * Math.PI * 2) * rr;
      const y = c.y + Math.sin(t * Math.PI * 2) * rr;
      const r = Math.max(2.5, Math.min(9.5, 2 + Math.log2((u.member_count || 1) + 1) * 1.6));
      nodes.push({ x, y, r, color: c.color, unit: u });
    });
  });

  return nodes;
}

function resizeCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function worldToScreen(x, y) {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  return {
    x: cx + (x + state.camera.x) * state.camera.zoom,
    y: cy + (y + state.camera.y) * state.camera.zoom,
  };
}

function screenToWorld(x, y) {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  return {
    x: (x - cx) / state.camera.zoom - state.camera.x,
    y: (y - cy) / state.camera.zoom - state.camera.y,
  };
}

function matchesSearch(unit, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    unit.title.toLowerCase().includes(q) ||
    unit.text.toLowerCase().includes(q) ||
    unit.subsystem.toLowerCase().includes(q) ||
    (unit.top_tokens || []).join(" ").toLowerCase().includes(q)
  );
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  const query = state.search.trim().toLowerCase();

  state.nodes.forEach((n) => {
    const u = applyEdits(n.unit);
    const visible = matchesSearch(u, query);
    if (!visible) return;

    const p = worldToScreen(n.x, n.y);
    const isSelected = state.selected && state.selected.id === u.id;
    const isHovered = state.hovered && state.hovered.unit.id === u.id;

    ctx.beginPath();
    ctx.arc(p.x, p.y, n.r * state.camera.zoom, 0, Math.PI * 2);
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeStyle = isSelected ? "#111" : n.color;
    ctx.stroke();

    if (isHovered || isSelected) {
      ctx.fillStyle = "rgba(15, 118, 110, 0.12)";
      ctx.fill();
    }

    if ((isSelected || isHovered) && state.camera.zoom > 0.26) {
      ctx.fillStyle = "#23312f";
      ctx.font = "11px Space Grotesk";
      const txt = `${u.title}`.slice(0, 38);
      ctx.fillText(txt, p.x + 8, p.y - 6);
    }
  });
}

function findNodeAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const world = screenToWorld(x, y);
  let best = null;
  let bestDist = Infinity;

  for (const n of state.nodes) {
    const dx = world.x - n.x;
    const dy = world.y - n.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d <= n.r / Math.max(0.15, state.camera.zoom) + 4 && d < bestDist) {
      bestDist = d;
      best = n;
    }
  }

  return best;
}

function selectNode(node) {
  state.selected = node ? applyEdits(node.unit) : null;
  if (!state.selected) {
    unitMeta.textContent = "Kein Knoten ausgewählt";
    titleInput.value = "";
    textInput.value = "";
    tagsInput.value = "";
    draw();
    return;
  }

  unitMeta.textContent = `${state.selected.id} | subsystem: ${state.selected.subsystem} | members: ${state.selected.member_count}`;
  titleInput.value = state.selected.title;
  textInput.value = state.selected.text;
  tagsInput.value = (state.selected.top_tokens || []).join(", ");
  draw();
}

function saveCurrentEdit() {
  if (!state.selected) return;
  const id = state.selected.id;
  state.edits[id] = {
    title: titleInput.value.trim(),
    text: textInput.value.trim(),
    top_tokens: tagsInput.value.split(",").map((x) => x.trim()).filter(Boolean),
  };
  saveEdits();
  draw();
}

function resetCurrentEdit() {
  if (!state.selected) return;
  delete state.edits[state.selected.id];
  saveEdits();
  const baseNode = state.nodes.find((n) => n.unit.id === state.selected.id);
  selectNode(baseNode || null);
}

function exportEdits() {
  const payload = {
    exported_at: new Date().toISOString(),
    edits: state.edits,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "thought_map_edits.json";
  a.click();
  URL.revokeObjectURL(url);
}

function attachEvents() {
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousemove", (e) => {
    const node = findNodeAt(e.clientX, e.clientY);
    state.hovered = node;

    if (node) {
      hoverTag.hidden = false;
      hoverTag.style.left = `${e.offsetX}px`;
      hoverTag.style.top = `${e.offsetY}px`;
      const u = applyEdits(node.unit);
      hoverTag.textContent = `${u.title} (${u.member_count})`;
    } else {
      hoverTag.hidden = true;
    }

    if (state.dragging && state.dragStart) {
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      state.camera.x = state.dragStart.camX + dx / state.camera.zoom;
      state.camera.y = state.dragStart.camY + dy / state.camera.zoom;
    }

    draw();
  });

  canvas.addEventListener("mousedown", (e) => {
    state.dragging = true;
    state.dragStart = {
      x: e.clientX,
      y: e.clientY,
      camX: state.camera.x,
      camY: state.camera.y,
    };
  });

  canvas.addEventListener("mouseup", (e) => {
    const wasDragging = state.dragging;
    state.dragging = false;

    if (!wasDragging) return;
    const move = Math.hypot(e.clientX - state.dragStart.x, e.clientY - state.dragStart.y);
    if (move < 4) {
      selectNode(findNodeAt(e.clientX, e.clientY));
    }
  });

  canvas.addEventListener("mouseleave", () => {
    state.dragging = false;
    state.hovered = null;
    hoverTag.hidden = true;
    draw();
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    state.camera.zoom = Math.max(0.12, Math.min(3.2, state.camera.zoom * factor));
    draw();
  }, { passive: false });

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value;
    draw();
  });

  reloadBtn.addEventListener("click", () => window.location.reload());
  exportBtn.addEventListener("click", exportEdits);
  saveBtn.addEventListener("click", saveCurrentEdit);
  resetBtn.addEventListener("click", resetCurrentEdit);
}

async function loadUnits() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Could not load ${DATA_URL} (${response.status})`);
  }
  const raw = await response.json();
  const units = Array.isArray(raw) ? raw : raw.units;
  if (!Array.isArray(units)) throw new Error("units.json has unexpected format");
  return units.map(normalizeUnit);
}

async function start() {
  try {
    state.units = await loadUnits();
    state.nodes = createNodes(state.units);
    buildLegend();
    attachEvents();
    resizeCanvas();
  } catch (err) {
    console.error(err);
    unitMeta.textContent = `Fehler beim Laden: ${err.message}`;
  }
}

start();
