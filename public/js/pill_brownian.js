(() => {
  const pill = document.querySelector(".pill-magenta-small");
  if (!pill) return;

  // Only run on coarse pointer (phones/tablets)
  const isMobile = matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!isMobile) return;

  // Ornstein–Uhlenbeck-ish drift: random + gently pulled back
  let x = 0, y = -20;              // start above cyan pill
  let vx = 0, vy = 0;

  const boundsX = 10;              // px max drift left/right
  const boundsY = 10;              // px drift around -20px baseline
  const baseY   = -20;

  const noise   = 0.35;            // randomness strength
  const damp    = 0.88;            // friction
  const pull    = 0.02;            // spring back to center

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function tick(){
    // random kicks
    vx += (Math.random() - 0.5) * noise;
    vy += (Math.random() - 0.5) * noise;

    // gentle pull to (0, baseY)
    vx += (0 - x) * pull;
    vy += (baseY - y) * pull;

    // damp
    vx *= damp;
    vy *= damp;

    // integrate
    x += vx;
    y += vy;

    // keep in a tight “sampling” zone
    x = clamp(x, -boundsX, boundsX);
    y = clamp(y, baseY - boundsY, baseY + boundsY);

    // tiny breathing (optional)
    const s = 1.0 + 0.01 * Math.sin(performance.now() / 900);

    pill.style.transform =
      `translate(-50%,-50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();