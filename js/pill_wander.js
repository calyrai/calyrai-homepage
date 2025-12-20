(() => {
  const mag  = document.querySelector(".pill-wander");
  const host = document.querySelector(".hero-window");
  if (!mag || !host) return;

  // Mobile only (as you wanted)
  const isMobile = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isMobile) return;

  // State
  let x = 0, y = 0;     // position relative to host center (px)
  let vx = 0, vy = 0;   // velocity (px/s)
  let last = performance.now();

  // --- Tunables (Brownian, not orbital) ---
  const padding = 14;     // keep off border
  const bounce  = 0.55;   // softer bounce
  const maxV    = 45;     // velocity cap (px/s) -> prevents spikes

  const sigma   = 180;    // random accel strength (px/s^2)
  const gamma   = 4.0;    // friction (1/s) higher = more sticky/slow
  const k       = 0.35;   // weak spring to center (1/s^2) lower = less “predictive”

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function step(t){
    const dt = Math.min((t - last) / 1000, 0.033); // cap dt ~30fps step
    last = t;

    const hostRect = host.getBoundingClientRect();
    const magW = mag.offsetWidth;
    const magH = mag.offsetHeight;

    const maxX = (hostRect.width  / 2) - (magW / 2) - padding;
    const maxY = (hostRect.height / 2) - (magH / 2) - padding;

    if (maxX <= 0 || maxY <= 0) {
      mag.style.transform = `translate(-50%,-50%) translate(0px,0px) scale(1)`;
      requestAnimationFrame(step);
      return;
    }

    // Ornstein–Uhlenbeck-ish: dv = (-gamma v - k x) dt + sigma dW
    // Here we approximate dW ~ sqrt(dt) * N(0,1) using uniform-ish noise.
    const nx = (Math.random() * 2 - 1);
    const ny = (Math.random() * 2 - 1);

    vx += (-gamma * vx - k * x) * dt + (sigma * Math.sqrt(dt)) * nx;
    vy += (-gamma * vy - k * y) * dt + (sigma * Math.sqrt(dt)) * ny;

    // cap velocity (prevents “teleport” feel)
    vx = clamp(vx, -maxV, maxV);
    vy = clamp(vy, -maxV, maxV);

    // integrate
    x += vx * dt;
    y += vy * dt;

    // soft bounce
    if (x >  maxX){ x =  maxX; vx *= -bounce; }
    if (x < -maxX){ x = -maxX; vx *= -bounce; }
    if (y >  maxY){ y =  maxY; vy *= -bounce; }
    if (y < -maxY){ y = -maxY; vy *= -bounce; }

    // tiny breathing only (no big scale motion)
    const s = 1.0 + 0.006 * Math.sin(t / 900);

    mag.style.transform =
      `translate(-50%,-50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();