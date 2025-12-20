(() => {
  const mag  = document.querySelector(".pill-wander");
  const host = document.querySelector(".hero-window");
  if (!mag || !host) return;

  const isMobile = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isMobile) return;

  let x = 0, y = 0;
  let vx = 0, vy = 0;
  let last = performance.now();

  const noise = 900;
  const damp  = 0.88;
  const pull  = 2.2;
  const padding = 14;
  const bounce = 0.65;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function step(t) {
    const dt = Math.min((t - last) / 1000, 0.05);
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

    vx += (Math.random() - 0.5) * noise * dt;
    vy += (Math.random() - 0.5) * noise * dt;

    vx += (-x) * pull * dt;
    vy += (-y) * pull * dt;

    const frameDamp = Math.pow(damp, dt * 60);
    vx *= frameDamp;
    vy *= frameDamp;

    x += vx * dt;
    y += vy * dt;

    if (x >  maxX) { x =  maxX; vx *= -bounce; }
    if (x < -maxX) { x = -maxX; vx *= -bounce; }
    if (y >  maxY) { y =  maxY; vy *= -bounce; }
    if (y < -maxY) { y = -maxY; vy *= -bounce; }

    const s = mag.matches(":hover") ? 1.06 : (1.0 + 0.008 * Math.sin(t / 900));

    mag.style.transform =
      `translate(-50%,-50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();