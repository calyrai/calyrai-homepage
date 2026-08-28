(() => {
  const config = window.CALYR_AORTA_FLOW_CONFIG;
  if (!config) return;
  const visual = document.querySelector('.visual');
  if (!visual || visual.querySelector('.aorta-flow-canvas')) return;

  const imageLayer = document.createElement('div');
  imageLayer.className = 'aorta-image-layer';
  imageLayer.setAttribute('aria-hidden', 'true');
  imageLayer.style.setProperty('--aorta-image', `url("${config.image}")`);
  visual.prepend(imageLayer);

  const canvas = document.createElement('canvas');
  canvas.className = 'aorta-flow-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  visual.append(canvas);

  const hud = document.createElement('div');
  hud.className = 'aorta-hud';
  hud.innerHTML = `<div class="aorta-hud-status"><i></i><span>FLOW FIELD · LIVE</span></div><div class="aorta-hud-readout"><span>V<span data-flow-velocity>1.00</span></span><span>ΔP<span data-flow-pressure>12.4</span></span><span>UQ<span>±04</span></span></div><div class="aorta-hud-reticle" aria-hidden="true"><i></i><b></b></div><div class="aorta-hud-axis" aria-hidden="true"><span>FLOW</span><i></i><b></b></div><div class="aorta-hud-command"><strong>DRAG · STEER FLOW</strong><span>POINTER MODULATES VELOCITY FIELD</span></div>`;
  visual.append(hud);


  const context = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const manipulation = { active: false, startX: 0, startY: 0, x: 0, y: 0, rotation: 0, scale: 1.04 };
  const reticle = hud.querySelector('.aorta-hud-reticle');
  const velocityReadout = hud.querySelector('[data-flow-velocity]');
  const pressureReadout = hud.querySelector('[data-flow-pressure]');
  const paths = config.paths;
  const particles = Array.from({ length: config.particleCount }, (_, index) => ({
    path: index % paths.length,
    phase: ((index * 0.61803398875) % 1),
    speed: config.baseSpeed + (index % 9) * config.speedStep,
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
    dpr = Math.min(config.maxDevicePixelRatio, window.devicePixelRatio || 1);
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
    const localX = (event.clientX - rect.left) / rect.width;
    const localY = (event.clientY - rect.top) / rect.height;
    pointer.targetX = (localX - .5) * 2;
    pointer.targetY = (localY - .5) * 2;
    reticle.style.left = `${localX * 100}%`;
    reticle.style.top = `${localY * 100}%`;
    velocityReadout.textContent = (1 + pointer.targetX * .28).toFixed(2);
    pressureReadout.textContent = (12.4 + pointer.targetY * 2.8).toFixed(1);
    if (manipulation.active) {
      const dx = event.clientX - manipulation.startX;
      const dy = event.clientY - manipulation.startY;
      manipulation.x = Math.max(-46, Math.min(46, dx * .22));
      manipulation.y = Math.max(-34, Math.min(34, dy * .18));
      manipulation.rotation = Math.max(-4.5, Math.min(4.5, dx * .018));
      manipulation.scale = 1.04 + Math.min(.08, Math.hypot(dx, dy) * .00022);
    }
  });
  visual.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    reticle.style.left = '50%';
    reticle.style.top = '50%';
    velocityReadout.textContent = '1.00';
    pressureReadout.textContent = '12.4';
  });
  visual.addEventListener('pointerdown', (event) => {
    manipulation.active = true;
    manipulation.startX = event.clientX;
    manipulation.startY = event.clientY;
    visual.classList.add('is-steering');
    visual.setPointerCapture?.(event.pointerId);
  });
  window.addEventListener('pointerup', () => {
    manipulation.active = false;
    visual.classList.remove('is-steering');
  });

  const draw = (time) => {
    pointer.x += (pointer.targetX - pointer.x) * .055;
    pointer.y += (pointer.targetY - pointer.y) * .055;
    imageLayer.style.transform = `translate3d(${pointer.x * 5 + manipulation.x}px,${pointer.y * 4 + manipulation.y}px,0) rotate(${manipulation.rotation}deg) scale(${manipulation.scale})`;
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
      const t = (particle.phase + time * particle.speed * (1 + pointer.x * .28)) % 1;
      const point = pointOnCurve(paths[particle.path], t);
      const tail = pointOnCurve(paths[particle.path], Math.max(0, t - .018));
      const turbulence = 4 + (particle.path % 4) * 1.8 + Math.abs(pointer.y) * 7;
      const wanderX = Math.sin(time * .0011 + particle.phase * 31 + particle.path) * turbulence;
      const wanderY = Math.cos(time * .00135 + particle.phase * 23 - particle.path) * turbulence * .72;
      const vortexX = width * (.5 + pointer.x * .5);
      const vortexY = height * (.5 + pointer.y * .5);
      const vortexDistance = Math.max(34, Math.hypot(point.x - vortexX, point.y - vortexY));
      const vortex = manipulation.active ? Math.min(18, 520 / vortexDistance) : Math.min(7, 210 / vortexDistance);
      const flowX = point.x + wanderX - (point.y - vortexY) / vortexDistance * vortex;
      const flowY = point.y + wanderY + (point.x - vortexX) / vortexDistance * vortex;
      context.beginPath();
      context.moveTo(tail.x + wanderX * .65, tail.y + wanderY * .65);
      context.lineTo(flowX, flowY);
      context.strokeStyle = `rgba(255,0,0,${particle.alpha * .48})`;
      context.lineWidth = particle.size * .72;
      context.stroke();
      context.beginPath();
      context.arc(flowX, flowY, particle.size, 0, Math.PI * 2);
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
