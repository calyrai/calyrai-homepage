function renderPipeline(steps) {
  const div = document.getElementById("pipeline");
  div.innerHTML = "";
  for (const s of steps) {
    const el = document.createElement("span");
    el.className = "step " + s.status;
    el.textContent = s.name;
    div.appendChild(el);
  }
}

function getLinePlotViewStore() {
  if (typeof window === "undefined") return Object.create(null);
  if (!window.__linePlotViewState) window.__linePlotViewState = Object.create(null);
  return window.__linePlotViewState;
}

function getLinePlotRerenderStore() {
  if (typeof window === "undefined") return Object.create(null);
  if (!window.__linePlotRerenders) window.__linePlotRerenders = Object.create(null);
  return window.__linePlotRerenders;
}

function setLinePlotRerender(hostId, fn) {
  if (!hostId) return;
  const store = getLinePlotRerenderStore();
  if (typeof fn === "function") store[hostId] = fn;
}

function rerenderLinePlotHost(hostId) {
  if (!hostId) return;
  const store = getLinePlotRerenderStore();
  const fn = store[hostId];
  if (typeof fn === "function") fn();
}

function clampPlotRange(minValue, maxValue, fullMin, fullMax) {
  const fullSpan = fullMax - fullMin;
  if (!(Number.isFinite(fullSpan) && fullSpan > 0)) {
    return { min: fullMin, max: fullMax };
  }
  const minSpan = Math.max(fullSpan * 1e-4, 1e-9);
  let lo = Number.isFinite(minValue) ? minValue : fullMin;
  let hi = Number.isFinite(maxValue) ? maxValue : fullMax;

  lo = Math.max(fullMin, Math.min(fullMax, lo));
  hi = Math.max(fullMin, Math.min(fullMax, hi));

  if (!(hi > lo)) {
    lo = fullMin;
    hi = fullMax;
  }

  let span = hi - lo;
  if (span < minSpan) {
    const mid = 0.5 * (lo + hi);
    lo = mid - minSpan * 0.5;
    hi = mid + minSpan * 0.5;
  }

  if (lo < fullMin) {
    hi += (fullMin - lo);
    lo = fullMin;
  }
  if (hi > fullMax) {
    lo -= (hi - fullMax);
    hi = fullMax;
  }

  lo = Math.max(fullMin, lo);
  hi = Math.min(fullMax, hi);
  if (!(hi > lo)) {
    lo = fullMin;
    hi = fullMax;
  }

  return { min: lo, max: hi };
}

function normalizeLinePlotView(view, fullView) {
  if (!view || !fullView) return null;
  const xRange = clampPlotRange(view.xmin, view.xmax, fullView.xmin, fullView.xmax);
  const yRange = clampPlotRange(view.ymin, view.ymax, fullView.ymin, fullView.ymax);
  return {
    xmin: xRange.min,
    xmax: xRange.max,
    ymin: yRange.min,
    ymax: yRange.max,
  };
}

function getSvgLinePlotState(svg) {
  if (!svg) return null;
  const read = (name) => {
    const raw = svg.getAttribute(name);
    const value = raw != null ? parseFloat(raw) : NaN;
    return Number.isFinite(value) ? value : NaN;
  };
  const current = {
    xmin: read("data-xmin"),
    xmax: read("data-xmax"),
    ymin: read("data-ymin"),
    ymax: read("data-ymax"),
  };
  const full = {
    xmin: read("data-full-xmin"),
    xmax: read("data-full-xmax"),
    ymin: read("data-full-ymin"),
    ymax: read("data-full-ymax"),
  };
  if (![current.xmin, current.xmax, current.ymin, current.ymax, full.xmin, full.xmax, full.ymin, full.ymax].every(Number.isFinite)) {
    return null;
  }
  return { current, full };
}

function resetLinePlotView(hostId, rerender = true) {
  if (!hostId) return;
  const store = getLinePlotViewStore();
  delete store[hostId];
  if (rerender) rerenderLinePlotHost(hostId);
}

function setLinePlotView(hostId, view, rerender = true) {
  if (!hostId || !view) return;
  const host = document.getElementById(hostId);
  const svg = host ? host.querySelector("svg") : null;
  const state = getSvgLinePlotState(svg);
  if (!state) return;
  const normalized = normalizeLinePlotView(view, state.full);
  if (!normalized) return;
  const store = getLinePlotViewStore();
  store[hostId] = normalized;
  if (rerender) rerenderLinePlotHost(hostId);
}

function zoomLinePlot(hostId, factor, focusX = 0.5, focusY = 0.5) {
  if (!hostId || !(Number.isFinite(factor) && factor > 0)) return;
  const host = document.getElementById(hostId);
  const svg = host ? host.querySelector("svg") : null;
  const state = getSvgLinePlotState(svg);
  if (!state) return;

  const fx = Math.max(0, Math.min(1, Number.isFinite(focusX) ? focusX : 0.5));
  const fy = Math.max(0, Math.min(1, Number.isFinite(focusY) ? focusY : 0.5));

  const current = state.current;
  const full = state.full;
  const fullXSpan = full.xmax - full.xmin;
  const fullYSpan = full.ymax - full.ymin;
  const currentXSpan = current.xmax - current.xmin;
  const currentYSpan = current.ymax - current.ymin;
  if (!(fullXSpan > 0) || !(fullYSpan > 0) || !(currentXSpan > 0) || !(currentYSpan > 0)) return;

  const minXSpan = Math.max(fullXSpan * 1e-4, 1e-9);
  const minYSpan = Math.max(fullYSpan * 1e-4, 1e-9);
  const nextXSpan = Math.max(minXSpan, Math.min(fullXSpan, currentXSpan * factor));
  const nextYSpan = Math.max(minYSpan, Math.min(fullYSpan, currentYSpan * factor));

  const focusDataX = current.xmin + fx * currentXSpan;
  const focusDataY = current.ymin + (1 - fy) * currentYSpan;

  const xRange = clampPlotRange(focusDataX - fx * nextXSpan, focusDataX + (1 - fx) * nextXSpan, full.xmin, full.xmax);
  const yRange = clampPlotRange(focusDataY - (1 - fy) * nextYSpan, focusDataY + fy * nextYSpan, full.ymin, full.ymax);

  const store = getLinePlotViewStore();
  store[hostId] = {
    xmin: xRange.min,
    xmax: xRange.max,
    ymin: yRange.min,
    ymax: yRange.max,
  };
  rerenderLinePlotHost(hostId);
}

function zoomLinePlotAxis(hostId, factor, axis = "xy", focusX = 0.5, focusY = 0.5) {
  if (!hostId || !(Number.isFinite(factor) && factor > 0)) return;
  const host = document.getElementById(hostId);
  const svg = host ? host.querySelector("svg") : null;
  const state = getSvgLinePlotState(svg);
  if (!state) return;

  const current = state.current;
  const full = state.full;
  const fullXSpan = full.xmax - full.xmin;
  const fullYSpan = full.ymax - full.ymin;
  const currentXSpan = current.xmax - current.xmin;
  const currentYSpan = current.ymax - current.ymin;
  if (!(fullXSpan > 0) || !(fullYSpan > 0) || !(currentXSpan > 0) || !(currentYSpan > 0)) return;

  const fx = Math.max(0, Math.min(1, Number.isFinite(focusX) ? focusX : 0.5));
  const fy = Math.max(0, Math.min(1, Number.isFinite(focusY) ? focusY : 0.5));

  const zoomX = axis === "xy" || axis === "x";
  const zoomY = axis === "xy" || axis === "y";
  const minXSpan = Math.max(fullXSpan * 1e-4, 1e-9);
  const minYSpan = Math.max(fullYSpan * 1e-4, 1e-9);
  const nextXSpan = zoomX ? Math.max(minXSpan, Math.min(fullXSpan, currentXSpan * factor)) : currentXSpan;
  const nextYSpan = zoomY ? Math.max(minYSpan, Math.min(fullYSpan, currentYSpan * factor)) : currentYSpan;

  const focusDataX = current.xmin + fx * currentXSpan;
  const focusDataY = current.ymin + (1 - fy) * currentYSpan;

  const xRange = clampPlotRange(focusDataX - fx * nextXSpan, focusDataX + (1 - fx) * nextXSpan, full.xmin, full.xmax);
  const yRange = clampPlotRange(focusDataY - (1 - fy) * nextYSpan, focusDataY + fy * nextYSpan, full.ymin, full.ymax);

  setLinePlotView(hostId, {
    xmin: xRange.min,
    xmax: xRange.max,
    ymin: yRange.min,
    ymax: yRange.max,
  }, true);
}

function panLinePlot(hostId, deltaXPx, deltaYPx, svgRect = null) {
  if (!hostId) return;
  const host = document.getElementById(hostId);
  const svg = host ? host.querySelector("svg") : null;
  const state = getSvgLinePlotState(svg);
  if (!state) return;

  const read = (name) => {
    const raw = svg.getAttribute(name);
    const value = raw != null ? parseFloat(raw) : NaN;
    return Number.isFinite(value) ? value : NaN;
  };

  const W = read("data-w");
  const H = read("data-h");
  const padL = read("data-padl");
  const padR = read("data-padr");
  const padT = read("data-padt");
  const padB = read("data-padb");
  if (![W, H, padL, padR, padT, padB].every(Number.isFinite)) return;

  const rect = svgRect || svg.getBoundingClientRect();
  if (!(rect && rect.width > 0 && rect.height > 0)) return;

  const innerSvgWidth = W - padL - padR;
  const innerSvgHeight = H - padT - padB;
  if (!(innerSvgWidth > 0) || !(innerSvgHeight > 0)) return;

  const svgDx = deltaXPx * (W / rect.width);
  const svgDy = deltaYPx * (H / rect.height);
  const current = state.current;
  const full = state.full;
  const xSpan = current.xmax - current.xmin;
  const ySpan = current.ymax - current.ymin;
  if (!(xSpan > 0) || !(ySpan > 0)) return;

  const dataDx = -(svgDx / innerSvgWidth) * xSpan;
  const dataDy = (svgDy / innerSvgHeight) * ySpan;

  const xRange = clampPlotRange(current.xmin + dataDx, current.xmax + dataDx, full.xmin, full.xmax);
  const yRange = clampPlotRange(current.ymin + dataDy, current.ymax + dataDy, full.ymin, full.ymax);

  const store = getLinePlotViewStore();
  store[hostId] = {
    xmin: xRange.min,
    xmax: xRange.max,
    ymin: yRange.min,
    ymax: yRange.max,
  };
  rerenderLinePlotHost(hostId);
}

function updateLinePlotPanState(host, active) {
  if (!host) return;
  host.classList.toggle("viz--pan-active", !!active);
}

function updateLinePlotSelectState(host, active) {
  if (!host) return;
  host.classList.toggle("viz--select-active", !!active);
}

function ensureLinePlotSelectionBox(host) {
  if (!host) return null;
  let box = host.querySelector(".viz-selection-box");
  if (!box) {
    box = document.createElement("div");
    box.className = "viz-selection-box";
    host.appendChild(box);
  }
  return box;
}

function hideLinePlotSelectionBox(host) {
  if (!host) return;
  const box = ensureLinePlotSelectionBox(host);
  if (!box) return;
  box.style.display = "none";
}

function showLinePlotSelectionBox(host, left, top, width, height) {
  const box = ensureLinePlotSelectionBox(host);
  if (!box) return;
  box.style.display = "block";
  box.style.left = `${left}px`;
  box.style.top = `${top}px`;
  box.style.width = `${width}px`;
  box.style.height = `${height}px`;
}

function getSvgMetricNumber(svg, name) {
  if (!svg) return NaN;
  const raw = svg.getAttribute(name);
  const value = raw != null ? parseFloat(raw) : NaN;
  return Number.isFinite(value) ? value : NaN;
}

function clientPointToLinePlotData(svg, clientX, clientY) {
  const state = getSvgLinePlotState(svg);
  if (!state) return null;
  const W = getSvgMetricNumber(svg, "data-w");
  const H = getSvgMetricNumber(svg, "data-h");
  const padL = getSvgMetricNumber(svg, "data-padl");
  const padR = getSvgMetricNumber(svg, "data-padr");
  const padT = getSvgMetricNumber(svg, "data-padt");
  const padB = getSvgMetricNumber(svg, "data-padb");
  if (![W, H, padL, padR, padT, padB].every(Number.isFinite)) return null;
  const rect = svg.getBoundingClientRect();
  if (!(rect.width > 0) || !(rect.height > 0)) return null;

  const svgX = (clientX - rect.left) * (W / rect.width);
  const svgY = (clientY - rect.top) * (H / rect.height);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  if (!(innerW > 0) || !(innerH > 0)) return null;

  const xClamped = Math.max(padL, Math.min(W - padR, svgX));
  const yClamped = Math.max(padT, Math.min(H - padB, svgY));
  const xFrac = (xClamped - padL) / innerW;
  const yFrac = (yClamped - padT) / innerH;

  return {
    x: state.current.xmin + xFrac * (state.current.xmax - state.current.xmin),
    y: state.current.ymax - yFrac * (state.current.ymax - state.current.ymin),
  };
}

function ensureLinePlotInteractions(host, hostId) {
  if (!host || host.__hasLinePlotInteractionHandler) return;
  host.__hasLinePlotInteractionHandler = true;

  host.addEventListener("wheel", (event) => {
    const svg = host.querySelector("svg");
    const state = getSvgLinePlotState(svg);
    if (!state) return;
    const rect = svg.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return;

    event.preventDefault();
    const fx = (event.clientX - rect.left) / rect.width;
    const fy = (event.clientY - rect.top) / rect.height;
    const direction = event.deltaY < 0 ? 0.82 : (1 / 0.82);
    zoomLinePlot(hostId, direction, fx, fy);
  }, { passive: false });

  host.addEventListener("pointerdown", (event) => {
    if (!event || event.button !== 0) return;
    if (event.target && event.target.closest && event.target.closest("circle.viz-knot")) return;

    const svg = host.querySelector("svg");
    const state = getSvgLinePlotState(svg);
    if (!state) return;

    if (event.shiftKey) {
      const startX = event.clientX;
      const startY = event.clientY;
      const hostRect = host.getBoundingClientRect();
      let moved = false;

      updateLinePlotSelectState(host, true);
      showLinePlotSelectionBox(host, startX - hostRect.left, startY - hostRect.top, 0, 0);
      event.preventDefault();

      const onMove = (ev) => {
        const left = Math.min(startX, ev.clientX) - hostRect.left;
        const top = Math.min(startY, ev.clientY) - hostRect.top;
        const width = Math.abs(ev.clientX - startX);
        const height = Math.abs(ev.clientY - startY);
        moved = moved || width > 6 || height > 6;
        showLinePlotSelectionBox(host, left, top, width, height);
        ev.preventDefault();
      };

      const onUp = (ev) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        updateLinePlotSelectState(host, false);
        hideLinePlotSelectionBox(host);

        if (!moved) return;
        const startData = clientPointToLinePlotData(svg, startX, startY);
        const endData = clientPointToLinePlotData(svg, ev.clientX, ev.clientY);
        if (!startData || !endData) return;

        const xmin = Math.min(startData.x, endData.x);
        const xmax = Math.max(startData.x, endData.x);
        const ymin = Math.min(startData.y, endData.y);
        const ymax = Math.max(startData.y, endData.y);
        if (!(xmax > xmin) || !(ymax > ymin)) return;

        setLinePlotView(hostId, { xmin, xmax, ymin, ymax }, true);
        ev.preventDefault();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      return;
    }

    const fullXSpan = state.full.xmax - state.full.xmin;
    const fullYSpan = state.full.ymax - state.full.ymin;
    const curXSpan = state.current.xmax - state.current.xmin;
    const curYSpan = state.current.ymax - state.current.ymin;
    const canPan = (curXSpan < fullXSpan * (1 - 1e-6)) || (curYSpan < fullYSpan * (1 - 1e-6));
    if (!canPan) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const rect = svg.getBoundingClientRect();
    let lastX = startX;
    let lastY = startY;
    let moved = false;

    updateLinePlotPanState(host, true);
    event.preventDefault();

    const onMove = (ev) => {
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;
      if (!moved) {
        const totalDx = ev.clientX - startX;
        const totalDy = ev.clientY - startY;
        moved = (totalDx * totalDx + totalDy * totalDy) > 9;
      }
      if (!moved) return;
      ev.preventDefault();
      panLinePlot(hostId, dx, dy, rect);
    };

    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      updateLinePlotPanState(host, false);
      if (moved) ev.preventDefault();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  });
}

if (typeof window !== "undefined") {
  window.setLinePlotRerender = setLinePlotRerender;
  window.resetLinePlotView = resetLinePlotView;
  window.setLinePlotView = setLinePlotView;
  window.zoomLinePlot = zoomLinePlot;
  window.zoomLinePlotAxis = zoomLinePlotAxis;
  window.panLinePlot = panLinePlot;
}

if (typeof document !== "undefined" && !document.__hasLinePlotZoomButtons) {
  document.__hasLinePlotZoomButtons = true;
  document.addEventListener("click", (event) => {
    const button = event.target && event.target.closest ? event.target.closest("[data-plot-target][data-plot-action]") : null;
    if (!button) return;

    const hostId = button.getAttribute("data-plot-target") || "";
    const action = button.getAttribute("data-plot-action") || "";
    if (!hostId || !action) return;

    if (action === "zoom-in") {
      zoomLinePlot(hostId, 0.82, 0.5, 0.5);
      return;
    }
    if (action === "zoom-out") {
      zoomLinePlot(hostId, 1 / 0.82, 0.5, 0.5);
      return;
    }
    if (action === "zoom-reset") {
      resetLinePlotView(hostId, true);
      return;
    }
    if (action === "zoom-x-in") {
      zoomLinePlotAxis(hostId, 0.82, "x", 0.5, 0.5);
      return;
    }
    if (action === "zoom-x-out") {
      zoomLinePlotAxis(hostId, 1 / 0.82, "x", 0.5, 0.5);
      return;
    }
    if (action === "zoom-y-in") {
      zoomLinePlotAxis(hostId, 0.82, "y", 0.5, 0.5);
      return;
    }
    if (action === "zoom-y-out") {
      zoomLinePlotAxis(hostId, 1 / 0.82, "y", 0.5, 0.5);
    }
  });
}

function renderPlotMessage(hostId, title, message) {
  const host = document.getElementById(hostId);
  if (!host) return;
  const W = 920;
  const H = 320;
  const padL = 24;
  const safeTitle = title || "Plot";
  const safeMessage = message || "No plot data available.";
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${safeTitle}">
      <text class="viz-title" x="${padL}" y="18">${safeTitle}</text>
      <text class="viz-title" x="${padL}" y="58" style="opacity:0.78; letter-spacing:0; font-size:13px;">${safeMessage}</text>
    </svg>
  `;
}

function renderLinePlot({x, y, title, hostId = "viz", mode = "line", overlays = [], markers = [], lineClassName = "viz-line", lineStroke = null, lineStrokeWidth = null, lineOpacity = null, lineStyle = ""}) {
  const host = document.getElementById(hostId);
  if (!host) return;
  ensureLinePlotInteractions(host, hostId);
  ensureLinePlotSelectionBox(host);
  hideLinePlotSelectionBox(host);

  if (!x || !y || x.length === 0 || y.length === 0) {
    renderPlotMessage(hostId, title, "No finite plot data was produced.");
    return;
  }

  const n = Math.min(x.length, y.length);
  const xs = x.slice(0, n);
  const ys = y.slice(0, n);

  const ov = Array.isArray(overlays) ? overlays : [];
  const mk = Array.isArray(markers) ? markers : [];

  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  function includeRange(xa, ya) {
    const nn = Math.min(xa.length, ya.length);
    for (let i = 0; i < nn; i++) {
      const xv = xa[i];
      const yv = ya[i];
      if (typeof xv !== "number" || typeof yv !== "number") continue;
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      xmin = Math.min(xmin, xv); xmax = Math.max(xmax, xv);
      ymin = Math.min(ymin, yv); ymax = Math.max(ymax, yv);
    }
  }

  includeRange(xs, ys);
  for (const s of ov) {
    if (!s || !Array.isArray(s.x) || !Array.isArray(s.y)) continue;
    includeRange(s.x, s.y);
  }

  if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmin === xmax) {
    renderPlotMessage(hostId, title, "The x-axis data are empty or collapsed to a single value.");
    return;
  }
  if (!Number.isFinite(ymin) || !Number.isFinite(ymax) || ymin === ymax) {
    // give a small range so the line is visible
    const eps = Math.abs(ymin || 1) * 0.01 + 1e-9;
    ymin -= eps;
    ymax += eps;
  }

  const W = 920;
  const H = 320;
  const padL = 48;
  const padR = 18;
  const padT = 26;
  const padB = 34;

  const fullView = { xmin, xmax, ymin, ymax };
  const viewStore = getLinePlotViewStore();
  const activeView = normalizeLinePlotView(viewStore[hostId], fullView) || fullView;
  if (viewStore[hostId]) viewStore[hostId] = activeView;

  const viewXMin = activeView.xmin;
  const viewXMax = activeView.xmax;
  const viewYMin = activeView.ymin;
  const viewYMax = activeView.ymax;

  const sx = (v) => padL + (v - viewXMin) * (W - padL - padR) / (viewXMax - viewXMin);
  const sy = (v) => padT + (viewYMax - v) * (H - padT - padB) / (viewYMax - viewYMin);

  // grid
  const gridLines = [];
  for (let k = 1; k <= 4; k++) {
    const yy = padT + k * (H - padT - padB) / 5;
    gridLines.push(`<line class="viz-grid" x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" />`);
  }

  // polyline path / scatter points
  const wantPoints = mode === "points" || mode === "line+points";
  const wantLine = mode === "line" || mode === "line+points";

  const geoms = [];

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function polylinePresentationAttrs({ stroke = null, strokeWidth = null, opacity = null, style = "" } = {}) {
    const attrs = [];
    if (stroke) attrs.push(` stroke="${String(stroke)}"`);
    if (Number.isFinite(strokeWidth)) attrs.push(` stroke-width="${strokeWidth}"`);
    if (Number.isFinite(opacity)) attrs.push(` opacity="${opacity}"`);
    if (style) attrs.push(` style="${escapeAttr(style)}"`);
    return attrs.join("");
  }

  if (wantLine) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const xv = xs[i];
      const yv = ys[i];
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      pts.push(`${sx(xv).toFixed(2)},${sy(yv).toFixed(2)}`);
    }
    if (pts.length) geoms.push(`<polyline class="${String(lineClassName || "viz-line")}"${polylinePresentationAttrs({ stroke: lineStroke, strokeWidth: lineStrokeWidth, opacity: lineOpacity, style: lineStyle })} points="${pts.join(" ")}" />`);
  }

  // overlay series (always rendered as lines)
  for (const s of ov) {
    if (!s || !Array.isArray(s.x) || !Array.isArray(s.y)) continue;
    const nn = Math.min(s.x.length, s.y.length);
    const pts = [];
    for (let i = 0; i < nn; i++) {
      const xv = s.x[i];
      const yv = s.y[i];
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      pts.push(`${sx(xv).toFixed(2)},${sy(yv).toFixed(2)}`);
    }
    if (!pts.length) continue;
    const cls = s.className ? String(s.className) : "viz-line";
    geoms.push(`<polyline class="${cls}"${polylinePresentationAttrs({ stroke: s.stroke, strokeWidth: s.strokeWidth, opacity: s.opacity, style: s.style })} points="${pts.join(" ")}" />`);
  }

  if (wantPoints) {
    const maxN = 260;
    const stride = Math.max(1, Math.ceil(n / maxN));
    for (let i = 0; i < n; i += stride) {
      const xv = xs[i];
      const yv = ys[i];
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      geoms.push(`<circle class="viz-dot" cx="${sx(xv).toFixed(2)}" cy="${sy(yv).toFixed(2)}" r="2.2" />`);
    }
  }

  // marker points (e.g. spline knots)
  for (const m of mk) {
    if (!m) continue;
    const xv = m.x;
    const yv = m.y;
    if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
    const r = Number.isFinite(m.r) ? m.r : 3.2;
    const cls = m.className ? String(m.className) : "viz-dot";
    const iAttr = (Number.isFinite(m.i) ? ` data-knot-index="${m.i}"` : "");
    const roleAttr = (m.role ? ` data-role="${String(m.role)}"` : "");
    geoms.push(`<circle class="${cls}" cx="${sx(xv).toFixed(2)}" cy="${sy(yv).toFixed(2)}" r="${r}"${iAttr}${roleAttr} />`);
  }

  const geom = geoms.join("\n");
  const clipId = `plot-clip-${String(hostId).replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title || "plot"}"
      data-xmin="${viewXMin}" data-xmax="${viewXMax}" data-ymin="${viewYMin}" data-ymax="${viewYMax}"
      data-full-xmin="${xmin}" data-full-xmax="${xmax}" data-full-ymin="${ymin}" data-full-ymax="${ymax}"
      data-w="${W}" data-h="${H}" data-padl="${padL}" data-padr="${padR}" data-padt="${padT}" data-padb="${padB}">
      <defs>
        <clipPath id="${clipId}">
          <rect x="${padL}" y="${padT}" width="${W - padL - padR}" height="${H - padT - padB}" />
        </clipPath>
      </defs>
      <text class="viz-title" x="${padL}" y="18">${title || "Plot"}</text>
      ${gridLines.join("\n")}
      <line class="viz-axis" x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" />
      <line class="viz-axis" x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" />
      <g clip-path="url(#${clipId})">
        ${geom}
      </g>
    </svg>
  `;
}

function renderPdbCircles({points, secondaryStructure = null, title, hostId = "viz", editable = false, onPointsChange = null}) {
  const host = document.getElementById(hostId);
  if (!host) return;

  if (!points || points.length === 0) {
    const W = 920;
    const H = 180;
    const padL = 24;
    host.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title || "pdb"}">
        <text class="viz-title" x="${padL}" y="18">${title || "PDB preview"}</text>
        <text class="viz-title" x="${padL}" y="58" style="opacity:0.75; letter-spacing:0; font-size:13px;">
          No ATOM/HETATM coordinates found.
        </text>
      </svg>
    `;
    return;
  }

  const W = 920;
  const H = 420;
  const padL = 24;

  const modelPoints = Array.isArray(points) ? points.map((point) => ({ ...point })) : [];

  // Normalize points around their centroid so rotation is natural.
  let cx = 0, cy = 0, cz = 0, count = 0;
  for (const p of modelPoints) {
    if (!p) continue;
    const x = p.x, y = p.y, z = p.z;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    cx += x; cy += y; cz += z;
    count++;
  }
  if (!count) {
    host.innerHTML = "";
    return;
  }
  cx /= count; cy /= count; cz /= count;

  const pts = [];
  let maxAbs = 0;
  for (let i = 0; i < modelPoints.length; i++) {
    const p = modelPoints[i];
    if (!p) continue;
    const x = p.x - cx;
    const y = p.y - cy;
    const z = p.z - cz;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
    maxAbs = Math.max(maxAbs, Math.abs(x), Math.abs(y), Math.abs(z));
    pts.push({
      i,
      x,
      y,
      z,
      atomName: p.atomName,
      chainID: p.chainID,
      resSeq: p.resSeq,
      raw: p,
    });
  }
  if (!pts.length || maxAbs <= 0) {
    host.innerHTML = "";
    return;
  }

  const ss = secondaryStructure && typeof secondaryStructure === "object" ? secondaryStructure : null;
  const helixByChain = new Map();
  const sheetByChain = new Map();
  if (ss) {
    const helices = Array.isArray(ss.helices) ? ss.helices : [];
    const sheets = Array.isArray(ss.sheets) ? ss.sheets : [];
    for (const h of helices) {
      if (!h || !h.chainID || !Number.isFinite(h.start) || !Number.isFinite(h.end)) continue;
      if (!helixByChain.has(h.chainID)) helixByChain.set(h.chainID, []);
      helixByChain.get(h.chainID).push([h.start, h.end]);
    }
    for (const s of sheets) {
      if (!s || !s.chainID || !Number.isFinite(s.start) || !Number.isFinite(s.end)) continue;
      if (!sheetByChain.has(s.chainID)) sheetByChain.set(s.chainID, []);
      sheetByChain.get(s.chainID).push([s.start, s.end]);
    }
  }

  function inRanges(map, chainID, resSeq) {
    if (!chainID || !Number.isFinite(resSeq)) return false;
    const ranges = map.get(chainID);
    if (!ranges || !ranges.length) return false;
    for (const [a, b] of ranges) {
      if (resSeq >= a && resSeq <= b) return true;
    }
    return false;
  }

  function classify(chainID, resSeq) {
    if (inRanges(helixByChain, chainID, resSeq)) return "helix";
    if (inRanges(sheetByChain, chainID, resSeq)) return "sheet";
    return "coil";
  }

  const n = pts.length;
  const baseR = n > 4000 ? 1.2 : n > 1500 ? 1.6 : n > 600 ? 2.0 : 2.6;

  // Base fit scale (before zoom).
  const fit = 0.90 * Math.min((W - 2 * padL), (H - 2 * padL)) / (2 * maxAbs);

  host.innerHTML = `
    <svg id="pdbViz" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title || "pdb"}" tabindex="0" focusable="true">
      <text class="viz-title" x="${padL}" y="18">${title || "PDB preview"}</text>
      <text id="pdbHint" class="viz-title" x="${padL}" y="38" style="opacity:0.70; letter-spacing:0; font-size:12px;">
        drag to rotate · scroll to zoom · projection: perspective (press P)
      </text>
      <g id="pdbScene">
        <g id="pdbBackbone">
          <path id="pdbSsCoil" class="pdb-ss pdb-ss--coil" d="" />
          <path id="pdbSsHelix" class="pdb-ss pdb-ss--helix" d="" />
          <path id="pdbSsSheet" class="pdb-ss pdb-ss--sheet" d="" />
        </g>
        <g id="pdbPoints"></g>
      </g>
    </svg>
  `;

  const svg = document.getElementById("pdbViz");
  const ssCoil = document.getElementById("pdbSsCoil");
  const ssHelix = document.getElementById("pdbSsHelix");
  const ssSheet = document.getElementById("pdbSsSheet");
  const g = document.getElementById("pdbPoints");
  const hint = document.getElementById("pdbHint");
  if (!svg || !g) return;

  // Create circles once.
  const circles = new Map();
  for (const p of pts) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "viz-point");
    c.setAttribute("r", String(baseR));
    c.dataset.i = String(p.i);
    g.appendChild(c);
    circles.set(p.i, c);
  }

  const highlighted = new Set();

  let rotX = -0.55;
  let rotY = 0.85;
  let zoom = 1.0;
  let projection = "perspective"; // or "orthographic"
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let raf = null;
  let auto = true;

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) auto = false;

  function updateHint() {
    if (!hint) return;
    hint.textContent = editable
      ? `drag to rotate · drag point to move · click point then D to delete · scroll to zoom · projection: ${projection} (press P)`
      : `drag to rotate · scroll to zoom · projection: ${projection} (press P)`;
  }

  updateHint();

  function inverseRotateVector(v, ax, ay) {
    const cxr = Math.cos(ax);
    const sxr = Math.sin(ax);
    const cyr = Math.cos(ay);
    const syr = Math.sin(ay);

    const x1 = v.x;
    const y1 = v.y * cxr + v.z * sxr;
    const z1 = -v.y * sxr + v.z * cxr;

    return {
      x: x1 * cyr - z1 * syr,
      y: y1,
      z: x1 * syr + z1 * cyr,
    };
  }

  function exportPoints() {
    return pts.map((point) => ({
      ...point.raw,
      x: point.x + cx,
      y: point.y + cy,
      z: point.z + cz,
    }));
  }

  let changeTimer = null;
  function emitPointsChange(force = false, nextPoints = null) {
    if (!editable || typeof onPointsChange !== "function") return;
    const payload = Array.isArray(nextPoints) ? nextPoints.map((point) => ({ ...point })) : exportPoints();
    if (force) {
      if (changeTimer) {
        clearTimeout(changeTimer);
        changeTimer = null;
      }
      onPointsChange(payload);
      return;
    }
    if (changeTimer) return;
    changeTimer = setTimeout(() => {
      changeTimer = null;
      onPointsChange(exportPoints());
    }, 120);
  }

  const selected = new Set();
  const projectedByIndex = new Map();

  function syncSelectionClasses() {
    for (const point of pts) {
      const c = circles.get(point.i);
      if (!c) continue;
      c.classList.toggle("viz-point--hi", selected.has(point.i));
    }
  }

  function rotate(p, ax, ay) {
    // rotate around Y then X
    const cy = Math.cos(ay), sy = Math.sin(ay);
    let x1 = p.x * cy + p.z * sy;
    let z1 = -p.x * sy + p.z * cy;

    const cx = Math.cos(ax), sx = Math.sin(ax);
    let y2 = p.y * cx - z1 * sx;
    let z2 = p.y * sx + z1 * cx;
    return {x: x1, y: y2, z: z2};
  }

  function render() {
    // Perspective-ish projection.
    const scale = fit * zoom;
    const px = W * 0.5;
    const py = H * 0.56;
    const depth = 2.6 * maxAbs;

    // Secondary-structure backbone using CA atoms.
    const caProj = [];
    for (const p of pts) {
      if (p.atomName !== "CA") continue;
      const r = rotate(p, rotX, rotY);
      const persp = projection === "orthographic" ? 1.0 : (depth / (depth + r.z));
      const x2 = px + r.x * scale * persp;
      const y2 = py - r.y * scale * persp;
      caProj.push({
        chainID: p.chainID,
        resSeq: p.resSeq,
        x2,
        y2,
        kind: classify(p.chainID, p.resSeq),
      });
    }

    function buildPath(kind) {
      let d = "";
      let hasAny = false;
      let lastChain = null;
      let lastRes = null;
      for (const p of caProj) {
        if (p.kind !== kind) continue;
        const chain = p.chainID || "";
        const res = Number.isFinite(p.resSeq) ? p.resSeq : null;
        const contiguous = (
          lastChain !== null &&
          chain === lastChain &&
          lastRes !== null &&
          res !== null &&
          res === lastRes + 1
        );
        if (!hasAny || !contiguous) {
          d += `M ${p.x2.toFixed(2)} ${p.y2.toFixed(2)}`;
        } else {
          d += ` L ${p.x2.toFixed(2)} ${p.y2.toFixed(2)}`;
        }
        hasAny = true;
        lastChain = chain;
        lastRes = res;
      }
      return d;
    }

    const dCoil = buildPath("coil");
    const dHelix = buildPath("helix");
    const dSheet = buildPath("sheet");

    if (ssCoil) {
      ssCoil.setAttribute("d", dCoil);
      ssCoil.style.display = dCoil ? "block" : "none";
    }
    if (ssHelix) {
      ssHelix.setAttribute("d", dHelix);
      ssHelix.style.display = dHelix ? "block" : "none";
    }
    if (ssSheet) {
      ssSheet.setAttribute("d", dSheet);
      ssSheet.style.display = dSheet ? "block" : "none";
    }

    // Depth sort for nicer overlap.
    const projected = [];
    projectedByIndex.clear();
    for (const p of pts) {
      const r = rotate(p, rotX, rotY);
      const persp = projection === "orthographic" ? 1.0 : (depth / (depth + r.z));
      projected.push({i: p.i, x: r.x, y: r.y, z: r.z, persp});
      projectedByIndex.set(p.i, { persp, x: r.x, y: r.y, z: r.z });
    }
    projected.sort((a, b) => a.z - b.z);

    for (let order = 0; order < projected.length; order++) {
      const pr = projected[order];
      const c = circles.get(pr.i);
      if (!c) continue;
      const x2 = px + pr.x * scale * pr.persp;
      const y2 = py - pr.y * scale * pr.persp;
      c.setAttribute("cx", x2.toFixed(2));
      c.setAttribute("cy", y2.toFixed(2));
      c.setAttribute("r", String((baseR * (0.75 + 0.55 * pr.persp)).toFixed(2)));
      c.style.opacity = String(Math.max(0.18, Math.min(1, 0.25 + 0.85 * pr.persp)));
      c.style.zIndex = String(order);
    }

    syncSelectionClasses();
  }

  function tick() {
    raf = null;
    if (auto && !isDragging) {
      rotY += 0.004;
    }
    render();
    if (auto) raf = requestAnimationFrame(tick);
  }

  function ensureTick() {
    if (raf != null) return;
    raf = requestAnimationFrame(tick);
  }

  render();
  if (auto) ensureTick();

  svg.addEventListener("mousedown", (e) => {
    if (editable && e.target && String(e.target.tagName || "").toLowerCase() === "circle") return;
    isDragging = true;
    auto = false;
    svg.focus();
    lastX = e.clientX;
    lastY = e.clientY;
    svg.style.cursor = "grabbing";
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
    svg.style.cursor = "grab";
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    rotY += dx * 0.008;
    rotX += dy * 0.008;
    rotX = Math.max(-1.55, Math.min(1.55, rotX));
    render();
  });

  svg.addEventListener("wheel", (e) => {
    e.preventDefault();
    auto = false;
    svg.focus();
    const k = e.deltaY > 0 ? 0.92 : 1.08;
    zoom = Math.max(0.35, Math.min(3.5, zoom * k));
    render();
  }, {passive: false});

  svg.style.cursor = "grab";

  svg.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") {
      projection = projection === "perspective" ? "orthographic" : "perspective";
      auto = false;
      updateHint();
      render();
      return;
    }

    if (editable && (e.key === "d" || e.key === "D" || e.key === "Delete" || e.key === "Backspace")) {
      if (!selected.size) return;
      const nextPoints = exportPoints().filter((point, idx) => !selected.has(pts[idx].i));
      selected.clear();
      emitPointsChange(true, nextPoints);
      renderPdbCircles({ points: nextPoints, secondaryStructure, title, hostId, editable, onPointsChange });
      e.preventDefault();
      e.stopPropagation();
    }
  });

  if (editable) {
    for (const point of pts) {
      const c = circles.get(point.i);
      if (!c) continue;
      c.addEventListener("pointerdown", (e) => {
        if (e && typeof e.button === "number" && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        auto = false;
        svg.focus();

        if (!e.shiftKey) selected.clear();
        selected.add(point.i);
        syncSelectionClasses();

        const proj = projectedByIndex.get(point.i);
        const persp = proj && Number.isFinite(proj.persp) ? proj.persp : 1;
        const localScale = Math.max(1e-6, fit * zoom * persp);
        let moved = false;
        let lastClientX = e.clientX;
        let lastClientY = e.clientY;

        try { c.setPointerCapture(e.pointerId); } catch (_) {}

        const onMove = (ev) => {
          const dx = ev.clientX - lastClientX;
          const dy = ev.clientY - lastClientY;
          lastClientX = ev.clientX;
          lastClientY = ev.clientY;
          if (!dx && !dy) return;
          moved = true;

          const deltaRot = { x: dx / localScale, y: -dy / localScale, z: 0 };
          const deltaLocal = inverseRotateVector(deltaRot, rotX, rotY);
          point.x += deltaLocal.x;
          point.y += deltaLocal.y;
          point.z += deltaLocal.z;
          render();
          emitPointsChange(false);
        };

        const onUp = (ev) => {
          try { c.releasePointerCapture(ev.pointerId); } catch (_) {}
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          if (!moved) {
            if (e.shiftKey && selected.has(point.i)) selected.delete(point.i);
            else {
              selected.clear();
              selected.add(point.i);
            }
            syncSelectionClasses();
            return;
          }
          emitPointsChange(true);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
    }
  }
}

function renderSaxsCartoon({iq, pr, title, hostId = "viz"}) {
  const host = document.getElementById(hostId);
  if (!host) return;

  const q = iq && iq.q;
  const I = iq && iq.I;
  const r = pr && pr.r;
  const p = pr && pr.p;

  if (!Array.isArray(q) || !Array.isArray(I) || q.length < 2 || I.length < 2) {
    host.innerHTML = "";
    return;
  }
  if (!Array.isArray(r) || !Array.isArray(p) || r.length < 2 || p.length < 2) {
    host.innerHTML = "";
    return;
  }

  const W = 920;
  const H = 320;
  const padL = 44;
  const padR = 16;
  const padT = 24;
  const padB = 22;
  const gap = 18;

  const topH = Math.floor((H - padT - padB - gap) / 2);
  const botH = (H - padT - padB - gap) - topH;
  const topY0 = padT;
  const botY0 = padT + topH + gap;

  function finiteMinMax(arr) {
    let mn = Infinity, mx = -Infinity;
    for (const v of arr) {
      if (!Number.isFinite(v)) continue;
      mn = Math.min(mn, v);
      mx = Math.max(mx, v);
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx)) return null;
    if (mn === mx) {
      const eps = Math.abs(mn || 1) * 0.01 + 1e-9;
      return [mn - eps, mx + eps];
    }
    return [mn, mx];
  }

  const qmm = finiteMinMax(q);
  const Imm = finiteMinMax(I);
  const rmm = finiteMinMax(r);
  const pmm = finiteMinMax(p);
  if (!qmm || !Imm || !rmm || !pmm) {
    host.innerHTML = "";
    return;
  }

  const sxTop = (v) => padL + (v - qmm[0]) * (W - padL - padR) / (qmm[1] - qmm[0]);
  const syTop = (v) => topY0 + (Imm[1] - v) * topH / (Imm[1] - Imm[0]);

  const sxBot = (v) => padL + (v - rmm[0]) * (W - padL - padR) / (rmm[1] - rmm[0]);
  const syBot = (v) => botY0 + (pmm[1] - v) * botH / (pmm[1] - pmm[0]);

  function polyPoints(xs, ys, sx, sy, maxN = 450) {
    const n = Math.min(xs.length, ys.length);
    if (n <= 1) return "";
    const stride = Math.max(1, Math.ceil(n / maxN));
    const pts = [];
    for (let i = 0; i < n; i += stride) {
      const xv = xs[i];
      const yv = ys[i];
      if (!Number.isFinite(xv) || !Number.isFinite(yv)) continue;
      pts.push(`${sx(xv).toFixed(2)},${sy(yv).toFixed(2)}`);
    }
    return pts.join(" ");
  }

  const topPts = polyPoints(q, I, sxTop, syTop);
  const botPts = polyPoints(r, p, sxBot, syBot);

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${title || "SAXS summary"}">
      <text class="viz-title" x="${padL}" y="16">${title || "SAXS summary"}</text>

      <text class="viz-title" x="${padL}" y="${topY0 + 14}" style="opacity:0.70; letter-spacing:0; font-size:12px;">I(q)</text>
      <text class="viz-title" x="${padL}" y="${botY0 + 14}" style="opacity:0.70; letter-spacing:0; font-size:12px;">p(r)</text>

      <line class="viz-axis" x1="${padL}" y1="${topY0 + topH}" x2="${W - padR}" y2="${topY0 + topH}" />
      <line class="viz-axis" x1="${padL}" y1="${botY0 + botH}" x2="${W - padR}" y2="${botY0 + botH}" />

      ${topPts ? `<polyline class="viz-line viz-line--magenta" points="${topPts}" />` : ""}
      ${botPts ? `<polyline class="viz-line viz-line--magenta" points="${botPts}" />` : ""}
    </svg>
  `;
}
