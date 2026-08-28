(() => {
  const visual = document.querySelector('.visual');
  if (!visual || visual.querySelector('.aorta-flow-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'aorta-flow-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  visual.append(canvas);

  const style = document.createElement('style');
  style.textContent = `.visual{overflow:hidden;background-size:108% auto!important;transition:background-position .18s ease-out}.aorta-flow-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;mix-blend-mode:screen}.visual .progress{z-index:2}@media(prefers-reduced-motion:reduce){.aorta-flow-canvas{display:none}.visual{background-size:cover!important}}`;
  document.head.append(style);

  const context = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const paths = [
    [[-.08,.86],[.12,.52],[.14,.08],[.44,.10]],
    [[-.06,.75],[.14,.46],[.18,.12],[.52,.14]],
    [[-.04,.64],[.18,.42],[.28,.14],[.64,.18]],
    [[.08,.84],[.28,.58],[.45,.32],[.79,.22]],
    [[.34,.12],[.58,.06],[.78,.16],[.91,.42]],
    [[.45,.13],[.69,.12],[.88,.23],[.94,.58]],
    [[.58,.16],[.84,.21],[.92,.48],[.88,1.08]],
    [[.66,.18],[.91,.29],[.89,.60],[.80,1.08]],
    [[.19,.45],[.31,.40],[.36,.54],[.39,.72]],
    [[.22,.47],[.35,.43],[.43,.56],[.48,.70]],
  ];
  const particles = Array.from({ length: 310 }, (_, index) => ({
    path: index % paths.length,
    phase: ((index * 0.61803398875) % 1),
    speed: .000035 + (index % 9) * .0000038,
    size: .55 + (index % 7) * .16,
    alpha: .28 + (index % 11) * .045,
  }));

  let width = 1;
  let height = 1;
  let dpr = 1;
  const resize = () => {
    const rect = visual.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(resize).observe(visual);
  resize();

  const pointOnCurve = (curve, t) => {
    const mt = 1 - t;
    const x = mt ** 3 * curve[0][0] + 3 * mt ** 2 * t * curve[1][0] + 3 * mt * t ** 2 * curve[2][0] + t ** 3 * curve[3][0];
    const y = mt ** 3 * curve[0][1] + 3 * mt ** 2 * t * curve[1][1] + 3 * mt * t ** 2 * curve[2][1] + t ** 3 * curve[3][1];
    return { x: x * width, y: y * height };
  };

  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    pointer.targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
  });
  visual.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });

  const draw = (time) => {
    pointer.x += (pointer.targetX - pointer.x) * .055;
    pointer.y += (pointer.targetY - pointer.y) * .055;
    visual.style.backgroundPosition = `${50 + pointer.x * 2.4}% ${50 + pointer.y * 1.7}%`;
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(pointer.x * 5, pointer.y * 4);

    context.lineWidth = .65;
    paths.forEach((curve, pathIndex) => {
      context.beginPath();
      for (let step = 0; step <= 34; step += 1) {
        const point = pointOnCurve(curve, step / 34);
        if (step === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.strokeStyle = `rgba(255,18,18,${pathIndex < 8 ? .19 : .10})`;
      context.stroke();
    });

    particles.forEach((particle) => {
      const t = (particle.phase + time * particle.speed) % 1;
      const point = pointOnCurve(paths[particle.path], t);
      const tail = pointOnCurve(paths[particle.path], Math.max(0, t - .018));
      context.beginPath();
      context.moveTo(tail.x, tail.y);
      context.lineTo(point.x, point.y);
      context.strokeStyle = `rgba(255,0,0,${particle.alpha * .48})`;
      context.lineWidth = particle.size * .72;
      context.stroke();
      context.beginPath();
      context.arc(point.x, point.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(255,18,18,${particle.alpha})`;
      context.shadowColor = '#f00';
      context.shadowBlur = particle.size * 2.2;
      context.fill();
      context.shadowBlur = 0;
    });
    context.restore();
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();
