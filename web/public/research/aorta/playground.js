const DEFAULTS = Object.freeze({ diameter: 100, narrowing: 0, inflow: 100, pulse: 70, arch: 100 });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// One-dimensional continuity illustration (Q = A v), not a pressure or CFD solver.
export function model(values) {
  const state = Object.fromEntries(Object.keys(DEFAULTS).map(k => [k, Number(values[k] ?? DEFAULTS[k])]));
  state.diameter = clamp(state.diameter, 70, 140);
  state.narrowing = clamp(state.narrowing, 0, 60);
  state.inflow = clamp(state.inflow, 40, 160);
  state.pulse = clamp(state.pulse, 40, 140);
  state.arch = clamp(state.arch, 70, 120);
  const minimumDiameter = state.diameter / 100 * (1 - state.narrowing / 100);
  return { ...state, relativeSpeed: (state.inflow / 100) / minimumDiameter ** 2 };
}

export function geometry(state) {
  const points = [];
  let volume = 0;
  const controlY = 440 - 410 * state.arch / 100;
  for (let i = 0; i <= 240; i++) {
    const t = i / 240, u = 1 - t;
    const x = u ** 3 * 210 + 3 * u ** 2 * t * 160 + 3 * u * t ** 2 * 470 + t ** 3 * 430;
    const y = u ** 3 * 440 + 3 * u ** 2 * t * controlY + 3 * u * t ** 2 * controlY + t ** 3 * 440;
    const dx = 3 * u ** 2 * -50 + 6 * u * t * 310 + 3 * t ** 2 * -40;
    const dy = 3 * u ** 2 * (controlY - 440) + 3 * t ** 2 * (440 - controlY);
    const length = Math.hypot(dx, dy);
    const radius = 30 * state.diameter / 100 * (1 - state.narrowing / 100 * Math.exp(-(((t - .65) / .075) ** 2)));
    const area = (radius / 30) ** 2;
    const previous = points.at(-1);
    if (previous) volume += Math.hypot(x - previous.x, y - previous.y) * (area + previous.area) / 2;
    points.push({ x, y, nx: -dy / length, ny: dx / length, radius, area, volume });
  }
  return { points, volume };
}

function init() {
  const svg = document.getElementById('vessel');
  if (!svg) return;
  let state = model(DEFAULTS), mesh = geometry(state);
  const values = { ...DEFAULTS };
  const tube = document.getElementById('tube'), centerline = document.getElementById('centerline');
  const handles = Object.fromEntries(['arch', 'diameter', 'narrowing', 'inflow'].map(k => [k, document.getElementById(`${k}-handle`)]));
  const baseline = document.getElementById('baseline');
  const group = document.getElementById('particles');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches, visible = true, frame = 0, lastTime = 0, clock = 0, phase = 0;
  const count = matchMedia('(max-width: 760px)').matches ? 48 : 72;
  if (matchMedia('(max-width: 760px)').matches) {
    svg.setAttribute('viewBox', '90 0 460 500');
    const label = handles.inflow.querySelector('text');
    label.setAttribute('x', '0'); label.setAttribute('y', '37'); label.setAttribute('text-anchor', 'middle');
  }
  const particles = Array.from({ length: count }, (_, i) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.setAttribute('r', String(1.5 + (i % 3) * .45)); group.append(el);
    return { el, lane: ((i * .6180339) % 1 - .5) * 1.45 };
  });
  const path = (points, direction) => points.map(p => `${(p.x + p.nx * p.radius * direction).toFixed(2)},${(p.y + p.ny * p.radius * direction).toFixed(2)}`).join(' L ');
  const outline = points => `M ${path(points, 1)} L ${path([...points].reverse(), -1)} Z`;
  baseline.setAttribute('d', outline(geometry(model(DEFAULTS)).points));
  function drawParticles() {
    for (let i = 0; i < count; i++) {
      const target = ((phase + i / count) % 1) * mesh.volume;
      let lo = 0, hi = mesh.points.length - 1;
      while (lo + 1 < hi) { const mid = (lo + hi) >> 1; if (mesh.points[mid].volume < target) lo = mid; else hi = mid; }
      const a = mesh.points[lo], b = mesh.points[hi];
      const mix = (target - a.volume) / Math.max(.001, b.volume - a.volume);
      const p = particles[i], radius = a.radius + (b.radius - a.radius) * mix;
      p.el.setAttribute('cx', (a.x + (b.x - a.x) * mix + a.nx * radius * p.lane).toFixed(2));
      p.el.setAttribute('cy', (a.y + (b.y - a.y) * mix + a.ny * radius * p.lane).toFixed(2));
      p.el.setAttribute('opacity', String(clamp(.35 + .2 * (state.inflow / 100) / a.area, .4, 1)));
    }
  }
  function update() {
    state = model(values);
    for (const k of Object.keys(DEFAULTS)) values[k] = state[k];
    mesh = geometry(state);
    for (const [k, value] of Object.entries(values)) document.getElementById(`${k}-value`).textContent = Math.round(value) + (k === 'pulse' ? ' / min' : '%');
    tube.setAttribute('d', outline(mesh.points));
    centerline.setAttribute('d', 'M ' + mesh.points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L '));
    const apex = mesh.points[120];
    handles.arch.setAttribute('transform', `translate(${apex.x},${apex.y - apex.radius})`);
    handles.arch.querySelector('text').setAttribute('y', apex.y - apex.radius < 55 ? '35' : '-30');
    const wall = mesh.points[48], neck = mesh.points[156];
    handles.diameter.setAttribute('transform', `translate(${wall.x + wall.nx * wall.radius},${wall.y + wall.ny * wall.radius})`);
    handles.narrowing.setAttribute('transform', `translate(${neck.x + neck.nx * neck.radius},${neck.y + neck.ny * neck.radius})`);
    handles.inflow.setAttribute('transform', `translate(210,${440 - (state.inflow - 40) / 120 * 65})`);
    document.getElementById('speed').innerHTML = `${state.relativeSpeed.toFixed(2)}<span>×</span>`;
    document.getElementById('explanation').textContent = state.narrowing > 0
      ? `${Math.round(state.narrowing)}% local narrowing makes the particles accelerate through the smaller section. At your chosen inflow and diameter, average speed there is ${state.relativeSpeed.toFixed(2)} times the starting value.`
      : state.diameter !== 100 || state.inflow !== 100
        ? `A wider vessel slows the flow; a higher inflow speeds it up. With these settings, average speed is ${state.relativeSpeed.toFixed(2)} times the starting value.`
        : 'Try narrowing the vessel. At the same inflow, particles move faster through the smaller section.';
    drawParticles();
  }
  function tick(time) {
    frame = 0;
    if (paused || !visible || document.hidden) { lastTime = 0; return; }
    if (!lastTime) lastTime = time;
    const elapsed = time - lastTime;
    if (elapsed >= 1000 / 30) {
      const dt = Math.min(elapsed / 1000, .08); lastTime = time; clock += dt;
      const pulse = 1 + .45 * Math.sin(clock * state.pulse / 60 * 2 * Math.PI);
      phase = (phase + dt * 90 * state.inflow / 100 * pulse / mesh.volume) % 1;
      drawParticles();
    }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  const pause = document.getElementById('pause');
  function syncPause() { pause.textContent = paused ? 'Play' : 'Pause'; pause.setAttribute('aria-pressed', String(paused)); schedule(); }
  pause.addEventListener('click', () => { paused = !paused; syncPause(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; syncPause(); });
  document.getElementById('reset').addEventListener('click', () => {
    Object.assign(values, DEFAULTS);
    taps.length = 0;
    phase = 0; clock = 0; update();
  });
  document.getElementById('compare').addEventListener('click', event => {
    const show = event.currentTarget.getAttribute('aria-pressed') !== 'true';
    event.currentTarget.setAttribute('aria-pressed', String(show));
    event.currentTarget.textContent = show ? 'Hide starting shape' : 'Show starting shape';
    baseline.style.display = show ? '' : 'none';
  });
  let drag = null;
  const descriptions = {
    arch: 'Lift or lower the arch. The particles follow its new shape.',
    diameter: 'Pull the wall outward to widen the vessel. The flow slows down.',
    narrowing: 'Push inward to squeeze the vessel. Watch the local flow speed up.',
    inflow: 'Pull upward to drive more flow through the vessel.'
  };
  for (const [kind, handle] of Object.entries(handles)) {
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || drag) return;
      const matrix = svg.getScreenCTM(); if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      drag = { kind, pointerId: event.pointerId, point, start: values[kind], mesh };
      handle.setPointerCapture(event.pointerId);
      document.getElementById('gesture-help').textContent = descriptions[kind];
    });
    handle.addEventListener('pointermove', event => {
      if (!drag || drag.kind !== kind || drag.pointerId !== event.pointerId) return;
      const matrix = svg.getScreenCTM(); if (!matrix) return;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const dx = p.x - drag.point.x, dy = p.y - drag.point.y;
      if (kind === 'arch') values.arch = drag.start - dy / 307.5 * 100;
      if (kind === 'inflow') values.inflow = drag.start - dy / 65 * 120;
      if (kind === 'diameter') {
        const wall = drag.mesh.points[48];
        values.diameter = drag.start + (dx * wall.nx + dy * wall.ny) / 30 * 100;
      }
      if (kind === 'narrowing') {
        const neck = drag.mesh.points[156];
        values.narrowing = drag.start - (dx * neck.nx + dy * neck.ny) / (30 * state.diameter / 100) * 100;
      }
      update();
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(event, () => { if (drag?.kind === kind) drag = null; });
    handle.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      values[kind] += ['ArrowUp', 'ArrowRight'].includes(event.key) ? 5 : -5;
      document.getElementById('gesture-help').textContent = descriptions[kind];
      update();
    });
  }
  const taps = [];
  document.getElementById('beat').addEventListener('click', () => {
    const time = performance.now();
    if (taps.length && time - taps.at(-1) > 2200) taps.length = 0;
    taps.push(time); if (taps.length > 5) taps.shift();
    if (taps.length >= 3) {
      values.pulse = Math.round(60000 / ((time - taps[0]) / (taps.length - 1)));
      clock = 0; update();
      document.getElementById('gesture-help').textContent = `Your rhythm sets the pulse to ${state.pulse} per minute (range 40–140).`;
    } else document.getElementById('gesture-help').textContent = 'Keep tapping a steady rhythm.';
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(svg);
  document.addEventListener('visibilitychange', schedule);
  update(); syncPause();
}
if (typeof document !== 'undefined') init();
