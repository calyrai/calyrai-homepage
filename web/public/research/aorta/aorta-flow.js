(() => {
  const init = () => {
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
  hud.innerHTML = `<div class="aorta-hud-status"><i></i><span>PULSATILE FLOW · FORWARD</span></div><div class="aorta-hud-readout"><span>V<span data-flow-velocity>1.00</span></span><span>ΔP<span data-flow-pressure>12.4</span></span><span>UQ<span>±04</span></span></div><figure class="aorta-phase-mark"><canvas width="132" height="132" aria-label="CALYR phase-space mark from zero to two pi"></canvas><figcaption>Φ · 0 → 2π</figcaption></figure><div class="aorta-hud-reticle" aria-hidden="true"><i></i><b></b></div><div class="aorta-hud-axis" aria-hidden="true"><span>FLOW →</span><i></i><b></b></div><div class="aorta-stent-label">HYPOTHETICAL STENT · RESEARCH MODEL</div><div class="aorta-mode-switch" aria-label="Stent deformation modes">${config.modes.map((mode, index) => `<button type="button" data-aorta-mode="${index}" aria-pressed="${index === 0}">${mode.label}</button>`).join('')}</div><div class="aorta-hud-command"><strong>DRAG · DEFORM STENT / STEER FLOW</strong><span>SELECT MODE · POINTER MODULATES THE FIELD</span></div>`;
  visual.append(hud);


  const context = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const manipulation = { active: false, startX: 0, startY: 0, x: 0, y: 0, rotation: 0, scale: 1.04 };
  let modeIndex = 0;
  const reticle = hud.querySelector('.aorta-hud-reticle');
  const velocityReadout = hud.querySelector('[data-flow-velocity]');
  const pressureReadout = hud.querySelector('[data-flow-pressure]');
  const phaseCanvas = hud.querySelector('.aorta-phase-mark canvas');
  const phaseContext = phaseCanvas.getContext('2d');
  const paths = config.paths;
  hud.querySelectorAll('[data-aorta-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      modeIndex = Number(button.dataset.aortaMode);
      hud.querySelectorAll('[data-aorta-mode]').forEach((item, index) => item.setAttribute('aria-pressed', String(index === modeIndex)));
    });
  });
  const particles = Array.from({ length: config.particleCount }, (_, index) => ({
    path: index % paths.length,
    phase: ((index * 0.61803398875) % 1),
    speed: config.baseSpeed + (index % 9) * config.speedStep,
    size: .45 + (index % 7) * .12,
    alpha: .18 + (index % 11) * .034,
    strand: 1.4 + (index % 9) * .34,
  }));

  let width = 1;
  let height = 1;
  let dpr = 1;
  let flowClock = 0;
  let previousTime = 0;
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

  const drawFinder = (x, y) => {
    phaseContext.strokeStyle = 'rgba(255,255,255,.88)';
    phaseContext.lineWidth = 2;
    phaseContext.strokeRect(x, y, 25, 25);
    phaseContext.strokeRect(x + 6, y + 6, 13, 13);
    phaseContext.fillStyle = '#fff';
    phaseContext.fillRect(x + 10, y + 10, 5, 5);
  };

  const drawPhaseMark = (phase) => {
    phaseContext.clearRect(0, 0, 132, 132);
    drawFinder(8, 8);
    drawFinder(99, 8);
    drawFinder(8, 99);
    for (let index = 0; index <= 240; index += 1) {
      const theta = index / 240 * 2 * Math.PI;
      const envelope = .72 + .28 * Math.sin(theta);
      const x = 66 + Math.sin(theta * .7 + phase) * 47 * envelope;
      const y = 66 + Math.sin(theta * 1.1) * 47 * envelope;
      if ((x < 38 && y < 38) || (x > 94 && y < 38) || (x < 38 && y > 94)) continue;
      phaseContext.beginPath();
      phaseContext.arc(x, y, index % 7 === 0 ? 1.6 : 1.05, 0, Math.PI * 2);
      phaseContext.fillStyle = index % 13 === 0 ? '#f10b0b' : 'rgba(255,255,255,.82)';
      phaseContext.fill();
    }
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
    const seconds = time * .001;
    const pulse = .72 + .28 * (.5 + .5 * Math.sin(seconds * Math.PI * 2 * config.pulseHz));
    const mode = config.modes[modeIndex];
    const deltaTime = previousTime ? Math.min(34, time - previousTime) : 16.67;
    previousTime = time;
    flowClock += deltaTime * pulse;
    drawPhaseMark(flowClock * .00022);
    pointer.x += (pointer.targetX - pointer.x) * .055;
    pointer.y += (pointer.targetY - pointer.y) * .055;
    imageLayer.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1.04)';
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

    // Schematic research overlay, not a clinically validated device model.
    const stentCurve = paths[5];
    const deformation = Math.min(1, Math.hypot(manipulation.x, manipulation.y) / 54);
    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'miter';
    context.shadowColor = '#72eaff';
    context.shadowBlur = 8 + pulse * 8;
    for (let rail = -1; rail <= 1; rail += 2) {
      context.beginPath();
      for (let step = 0; step <= 52; step += 1) {
        const t = .08 + step / 66;
        const centre = pointOnCurve(stentCurve, t);
        const widthOffset = rail * (8 + mode.flare * 14 + deformation * 8);
        const facet = (step % 4 < 2 ? -1 : 1) * (3.2 + deformation * 2.8);
        const skew = manipulation.x * .11 * t * (1 - mode.stiffness);
        const x = centre.x + skew + widthOffset + facet;
        const y = centre.y + manipulation.y * .05 * t + facet * .42;
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = `rgba(203,248,255,${.34 + pulse * .44})`;
      context.lineWidth = 1.05 + pulse * .4;
      context.stroke();
    }
    context.shadowBlur = 0;
    context.restore();

    particles.forEach((particle) => {
      const t = (particle.phase + flowClock * particle.speed * (1 + pointer.x * .28)) % 1;
      const point = pointOnCurve(paths[particle.path], t);
      const trail = (.012 + particle.strand * .0035) * (.82 + pulse * .35);
      const tail = pointOnCurve(paths[particle.path], Math.max(0, t - trail));
      const middle = pointOnCurve(paths[particle.path], Math.max(0, t - trail * .48));
      const turbulence = 4 + (particle.path % 4) * 1.8 + Math.abs(pointer.y) * 7;
      const wanderX = Math.sin(time * .0011 + particle.phase * 31 + particle.path) * turbulence;
      const wanderY = Math.cos(time * .00135 + particle.phase * 23 - particle.path) * turbulence * .72;
      const vortexX = width * (.5 + pointer.x * .5);
      const vortexY = height * (.5 + pointer.y * .5);
      const vortexDistance = Math.max(34, Math.hypot(point.x - vortexX, point.y - vortexY));
      const vortex = manipulation.active ? Math.min(18, 520 / vortexDistance) : Math.min(7, 210 / vortexDistance);
      const flowX = point.x + wanderX - (point.y - vortexY) / vortexDistance * vortex;
      const flowY = point.y + wanderY + (point.x - vortexX) / vortexDistance * vortex;
      const tailX = tail.x + wanderX * .58;
      const tailY = tail.y + wanderY * .58;
      const middleX = middle.x + wanderX * .78 - (middle.y - vortexY) / vortexDistance * vortex * .45;
      const middleY = middle.y + wanderY * .78 + (middle.x - vortexX) / vortexDistance * vortex * .45;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.quadraticCurveTo(middleX, middleY, flowX, flowY);
      context.strokeStyle = `rgba(255,32,38,${particle.alpha * (.52 + pulse * .42)})`;
      context.lineWidth = particle.size;
      context.lineCap = 'round';
      context.stroke();
      if (particle.path % 4 === 0) {
        context.beginPath();
        context.moveTo(middleX, middleY);
        context.lineTo(flowX, flowY);
        context.strokeStyle = `rgba(255,178,150,${particle.alpha * .36})`;
        context.lineWidth = particle.size * .42;
        context.stroke();
      }
    });
    context.restore();
    requestAnimationFrame(draw);
  };
    requestAnimationFrame(draw);
  };

  if (document.querySelector('.visual')) init();
  else document.addEventListener('calyr:aorta-content-ready', init, { once: true });
})();
