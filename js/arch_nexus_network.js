// js/arch_nexus_network.js
// Calm, MD-like background motion for the Architecture section.
// Brownian drift + spring constraints (soft-connected, low-energy).

(function () {
  'use strict';

  const CANVAS_ID = 'arch-bg';
  const SECTION_SELECTOR = '.home-architecture';

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Interpret reduced-motion as reduced *energy* (not fully static), so the background
  // still feels alive while remaining subtle.
  const motionScale = prefersReducedMotion ? 0.55 : 1.0;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function setup() {
    const section = document.querySelector(SECTION_SELECTOR);
    const canvas = document.getElementById(CANVAS_ID);
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let lastNow = 0;

    let inView = true;

    const nodes = [];
    const links = [];

    function resize() {
      const rect = section.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initGraph() {
      nodes.length = 0;
      links.length = 0;

      const cx = w * 0.5;
      const cy = h * 0.5;

      // "Nexus" node at center (not rendered as text; only as anchor).
      nodes.push({ x: cx, y: cy, vx: 0, vy: 0, r: 3.2, isNexus: true });

      // Five stack nodes around it.
      const ring = 140;
      const count = 5;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        nodes.push({
          x: cx + Math.cos(a) * ring,
          y: cy + Math.sin(a) * ring,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: 2.6,
          isNexus: false
        });
        links.push([0, i + 1, ring]);
      }

      // A few satellites to give a "soft-connected" feel.
      const satellites = 4;
      for (let i = 0; i < satellites; i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = ring * (1.35 + Math.random() * 0.55);
        const idx = nodes.length;
        nodes.push({
          x: cx + Math.cos(a) * rr,
          y: cy + Math.sin(a) * rr,
          vx: (Math.random() - 0.5) * 0.75,
          vy: (Math.random() - 0.5) * 0.75,
          r: 2.1,
          isNexus: false
        });
        const attachTo = 1 + (i % count);
        links.push([attachTo, idx, rr - ring * 0.25]);
      }
    }

    function step(now) {
      if (!raf) return;

      const nnow = typeof now === 'number' ? now : performance.now();
      const dtFrames = lastNow ? (nnow - lastNow) / 16.666 : 1;
      const dt = clamp(dtFrames, 0.5, 2.5);
      lastNow = nnow;

      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Motion tuning: calm, biological.
      // Keep it visibly alive even on low-refresh or reduced-motion setups.
      const brown = 0.085 * motionScale;
      const springK = 0.0036 * motionScale;
      const centerK = 0.0010 * motionScale;
      const damping = prefersReducedMotion ? 0.992 : 0.985;

      const t = nnow * 0.001;
      const wave = 0.028 * motionScale;

      // Spring constraints.
      for (const [a, b, rest] of links) {
        const na = nodes[a];
        const nb = nodes[b];
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const dist = Math.max(0.0001, Math.hypot(dx, dy));
        const force = (dist - rest) * springK;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        na.vx += fx * dt;
        na.vy += fy * dt;
        nb.vx -= fx * dt;
        nb.vy -= fy * dt;
      }

      // Brownian drift + damping + soft centering.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // keep nexus as gentle anchor (it can move, but is strongly centered)
        const localBrown = n.isNexus ? brown * 0.3 : brown;

        n.vx += (Math.random() - 0.5) * localBrown * dt;
        n.vy += (Math.random() - 0.5) * localBrown * dt;

        // pull towards section center
        n.vx += (cx - n.x) * centerK * dt;
        n.vy += (cy - n.y) * centerK * dt;

        // damping is per-frame-ish; scale gently with dt
        const d = Math.pow(damping, dt);
        n.vx *= d;
        n.vy *= d;

        // Gentle deterministic drift (prevents an equilibrium that *looks* static).
        if (!n.isNexus) {
          n.vx += Math.sin(t + i * 1.7) * wave * dt;
          n.vy += Math.cos(t + i * 1.3) * wave * dt;
        }

        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // soft bounds
        n.x = clamp(n.x, 12, w - 12);
        n.y = clamp(n.y, 12, h - 12);
      }

      // Draw links.
      ctx.save();
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.72;
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(255,120,255,0.22)';
      for (const [a, b] of links) {
        const na = nodes[a];
        const nb = nodes[b];
        ctx.strokeStyle = 'rgba(143,220,255,0.30)';
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
      ctx.restore();

      // Draw nodes.
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.shadowBlur = 18;
      ctx.shadowColor = 'rgba(120,240,255,0.25)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.isNexus ? 4.6 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.isNexus
          ? 'rgba(255,120,255,0.75)'
          : 'rgba(120,240,255,0.68)';
        ctx.fill();
      }
      ctx.restore();

      raf = requestAnimationFrame(step);
    }

    function start() {
      if (raf) return;
      lastNow = 0;
      raf = requestAnimationFrame(step);
    }

    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function updateRunState() {
      const shouldRun = inView && !document.hidden;
      if (shouldRun) start();
      else stop();
    }

    function renderStatic() {
      ctx.clearRect(0, 0, w, h);
      // quick single-frame render
      const cx = w * 0.5;
      const cy = h * 0.5;
      initGraph();
      // slightly jitter once for non-uniformity
      for (const n of nodes) {
        n.x += (Math.random() - 0.5) * 10;
        n.y += (Math.random() - 0.5) * 10;
      }

      ctx.save();
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
      for (const [a, b] of links) {
        const na = nodes[a];
        const nb = nodes[b];
        ctx.strokeStyle = 'rgba(143,220,255,0.22)';
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.75;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.isNexus ? 4.2 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.isNexus
          ? 'rgba(255,120,255,0.55)'
          : 'rgba(120,240,255,0.55)';
        ctx.fill();
      }
      ctx.restore();

      // restore center after render
      nodes[0].x = cx;
      nodes[0].y = cy;
    }

    resize();
    initGraph();

    // Ensure the section has something drawn even before it becomes visible.
    renderStatic();

    // If we measured a tiny box (fonts/layout not ready yet), retry shortly.
    if (w < 80 || h < 80) {
      setTimeout(() => {
        resize();
        initGraph();
      }, 120);
    }

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        resize();
        initGraph();
        renderStatic();
      });
      ro.observe(section);
    } else {
      window.addEventListener(
        'resize',
        () => {
          resize();
          initGraph();
          renderStatic();
        },
        { passive: true }
      );
    }

    // Run only when visible (saves CPU/GPU so the hero globe stays smooth).
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((e) => e.isIntersecting);
          updateRunState();
        },
        { threshold: 0.08 }
      );
      io.observe(section);
    }

    document.addEventListener('visibilitychange', updateRunState);
    updateRunState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
