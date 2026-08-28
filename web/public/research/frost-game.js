(() => {
  const canvas = document.querySelector('.frost-game');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const names = ['FROST FIELD', 'CONSTRAINT BLOOM', 'ORACLE DRIFT'];
  const key = `calyr-game-${document.body.dataset.project || 'research'}`;
  const previous = Number(sessionStorage.getItem(key) || -1);
  const mode = (previous + 1) % names.length;
  sessionStorage.setItem(key, String(mode));
  document.querySelector('.frost-title').textContent = names[mode];
  let points = [], pointer = null, pulse = 0;

  function reset() {
    const count = Math.max(72, Math.min(180, Math.round(canvas.clientWidth * canvas.clientHeight / 5200)));
    points = Array.from({ length: count }, (_, i) => ({
      x: ((i * 73) % count) / count,
      y: ((i * 137 + mode * 29) % count) / count,
      r: 0.7 + (i % 4) * 0.45
    }));
    draw();
  }

  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    reset();
  }

  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f1f1ed';
    points.forEach((p, i) => {
      let x = p.x * w, y = p.y * h;
      if (mode === 0) y += Math.sin(p.x * 18 + pulse) * 34;
      if (mode === 1) { const a = p.x * 9 + p.y * 5 + pulse; x += Math.cos(a) * 42; y += Math.sin(a) * 42; }
      if (mode === 2) x += Math.sin(p.y * 22 + i * .04 + pulse) * 48;
      if (pointer) { const dx=x-pointer.x, dy=y-pointer.y, d=Math.hypot(dx,dy); if(d<150&&d>0){x+=dx/d*(150-d)*.36;y+=dy/d*(150-d)*.36;} }
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
    });
  }

  canvas.addEventListener('pointermove', e => { const b=canvas.getBoundingClientRect(); pointer={x:e.clientX-b.left,y:e.clientY-b.top}; draw(); });
  canvas.addEventListener('pointerleave', () => { pointer=null; draw(); });
  canvas.addEventListener('click', () => { pulse += .85; draw(); });
  addEventListener('keydown', e => { if(e.key.toLowerCase()==='r'){pulse=0;reset();} });
  new ResizeObserver(resize).observe(canvas);
})();
