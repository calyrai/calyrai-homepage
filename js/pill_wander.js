(() => {
  const mag  = document.querySelector(".pill-wander");
  const host = document.querySelector(".hero-window");
  if (!mag || !host) return;

  const isMobile = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isMobile) return;

  // position (px) relative to host center
  let x = 0, y = 0;

  // velocity (px/s)
  let vx = 0, vy = 0;

  // smooth random acceleration (px/s^2)
  let ax = 0, ay = 0;

  let last = performance.now();

  // bounds + feel
  const padding = 14;
  const bounce  = 0.55;

  // motion tuning (these kill “wiggle”)
  const accelWander = 220;   // how strong the wandering acceleration can get
  const accelSmooth = 0.04;  // how fast acceleration direction changes (smaller = smoother)
  const drag        = 3.8;   // velocity damping (bigger = slower/less jitter)
  const centerPull  = 0.25;  // weak pull to center (smaller = less “predictable”)
  const maxV        = 55;    // velocity cap (px/s)

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function step(t){
    const dt = Math.min((t - last) / 1000, 0.033);
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

    // --- correlated noise: slowly wandering acceleration target ---
    const targetAx = (Math.random() * 2 - 1) * accelWander;
    const targetAy = (Math.random() * 2 - 1) * accelWander;
    ax += (targetAx - ax) * accelSmooth;
    ay += (targetAy - ay) * accelSmooth;

    // forces: wander accel + gentle pull to center + drag
    vx += (ax - centerPull * x - drag * vx) * dt;
    vy += (ay - centerPull * y - drag * vy) * dt;

    vx = clamp(vx, -maxV, maxV);
    vy = clamp(vy, -maxV, maxV);

    x += vx * dt;
    y += vy * dt;

    // soft bounce at edges
    if (x >  maxX){ x =  maxX; vx *= -bounce; }
    if (x < -maxX){ x = -maxX; vx *= -bounce; }
    if (y >  maxY){ y =  maxY; vy *= -bounce; }
    if (y < -maxY){ y = -maxY; vy *= -bounce; }

    const s = 1.0 + 0.006 * Math.sin(t / 900);

    mag.style.transform =
      `translate(-50%,-50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();