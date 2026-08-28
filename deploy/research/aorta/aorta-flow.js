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
  hud.innerHTML = `<div class="aorta-hud-status"><i></i><span>PULSATILE FLOW · FORWARD</span></div><div class="aorta-hud-readout"><span>V<span data-flow-velocity>1.00</span></span><span>ΔP<span data-flow-pressure>12.4</span></span><span>UQ<span>±04</span></span></div><div class="aorta-game"><span>FLOW CONTROL</span><strong data-flow-score>0000</strong><em data-flow-state>FOLLOW THE ARCH</em></div><div class="aorta-hud-axis" aria-hidden="true"><span>FLOW →</span><i></i><b></b></div><div class="aorta-stent-label">HYPOTHETICAL STENT · RESEARCH MODEL</div><div class="aorta-mode-switch" aria-label="Stent deformation modes">${config.modes.map((mode, index) => `<button type="button" data-aorta-mode="${index}" aria-pressed="${index === 0}">${mode.label}</button>`).join('')}</div><div class="aorta-hud-command"><strong>HOLD + DRAG · COMPRESS FLOW</strong><span>GUIDE THE STREAM · RELEASE AT OUTLET</span></div>`;
  visual.append(hud);


  const context = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, px: 0, py: 0 };
  const manipulation = { active: false, startX: 0, startY: 0, lastX: 0, lastY: 0, x: 0, y: 0, squeeze: 0, targetSqueeze: 0 };
  let modeIndex = 0;
  const velocityReadout = hud.querySelector('[data-flow-velocity]');
  const pressureReadout = hud.querySelector('[data-flow-pressure]');
  const scoreReadout = hud.querySelector('[data-flow-score]');
  const stateReadout = hud.querySelector('[data-flow-state]');
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
    previousT: ((index * 0.61803398875) % 1),
  }));
  const burstParticles = [];
  const spawnBurst = (point, source) => {
    const shardCount = 5 + (source.path % 4);
    for (let shard = 0; shard < shardCount; shard += 1) {
      const angle = (shard / shardCount) * Math.PI * 2 + source.phase * 7.3;
      const force = 18 + ((source.path * 13 + shard * 17) % 31);
      burstParticles.push({
        x: point.x,
        y: point.y,
        vx: Math.cos(angle) * force + 14,
        vy: Math.sin(angle) * force,
        age: 0,
        life: .42 + ((source.path + shard) % 5) * .055,
        size: .55 + (shard % 3) * .32,
        warm: shard % 4 === 0,
      });
    }
    if (burstParticles.length > 1800) burstParticles.splice(0, burstParticles.length - 1800);
  };

  const spawnReleaseBurst = (point, energy) => {
    const shardCount = Math.round(90 + energy * 190);
    for (let shard = 0; shard < shardCount; shard += 1) {
      const angle = shard * 2.399963229728653 + energy * 3.1;
      const force = 24 + energy * 82 + (shard % 17) * 1.9;
      burstParticles.push({
        x: point.x + Math.cos(angle) * (shard % 9),
        y: point.y + Math.sin(angle) * (shard % 9),
        vx: Math.cos(angle) * force + 20,
        vy: Math.sin(angle) * force,
        age: 0,
        life: .55 + (shard % 11) * .035,
        size: .65 + (shard % 5) * .28,
        warm: shard % 5 === 0,
      });
    }
  };

  let width = 1;
  let height = 1;
  let dpr = 1;
  let flowClock = 0;
  let previousTime = 0;
  let score = 0;
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
    if (curve.length === 4) {
      const mt = 1 - t;
      const x = mt ** 3 * curve[0][0] + 3 * mt ** 2 * t * curve[1][0] + 3 * mt * t ** 2 * curve[2][0] + t ** 3 * curve[3][0];
      const y = mt ** 3 * curve[0][1] + 3 * mt ** 2 * t * curve[1][1] + 3 * mt * t ** 2 * curve[2][1] + t ** 3 * curve[3][1];
      return { x: x * width, y: y * height };
    }
    const segmentCount = (curve.length - 1) / 3;
    const scaled = Math.min(.999999, Math.max(0, t)) * segmentCount;
    const segment = Math.floor(scaled);
    const localT = scaled - segment;
    const offset = segment * 3;
    const mt = 1 - localT;
    const x = mt ** 3 * curve[offset][0] + 3 * mt ** 2 * localT * curve[offset + 1][0] + 3 * mt * localT ** 2 * curve[offset + 2][0] + localT ** 3 * curve[offset + 3][0];
    const y = mt ** 3 * curve[offset][1] + 3 * mt ** 2 * localT * curve[offset + 1][1] + 3 * mt * localT ** 2 * curve[offset + 2][1] + localT ** 3 * curve[offset + 3][1];
    return { x: x * width, y: y * height };
  };

  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width;
    const localY = (event.clientY - rect.top) / rect.height;
    pointer.targetX = (localX - .5) * 2;
    pointer.targetY = (localY - .5) * 2;
    pointer.px = localX * rect.width;
    pointer.py = localY * rect.height;
    velocityReadout.textContent = (1 + pointer.targetX * .28).toFixed(2);
    pressureReadout.textContent = (12.4 + pointer.targetY * 2.8).toFixed(1);
    if (manipulation.active) {
      const dx = event.clientX - manipulation.startX;
      const dy = event.clientY - manipulation.startY;
      manipulation.x = Math.max(-46, Math.min(46, dx * .22));
      manipulation.y = Math.max(-34, Math.min(34, dy * .18));
      const travel = Math.hypot(event.clientX - manipulation.lastX, event.clientY - manipulation.lastY);
      manipulation.targetSqueeze = Math.min(1, manipulation.targetSqueeze + .018 + travel * .0045);
      manipulation.lastX = event.clientX;
      manipulation.lastY = event.clientY;
    }
  });
  visual.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    velocityReadout.textContent = '1.00';
    pressureReadout.textContent = '12.4';
  });
  visual.addEventListener('pointerdown', (event) => {
    manipulation.active = true;
    manipulation.startX = event.clientX;
    manipulation.startY = event.clientY;
    manipulation.lastX = event.clientX;
    manipulation.lastY = event.clientY;
    manipulation.targetSqueeze = Math.max(.16, manipulation.squeeze);
    visual.classList.add('is-steering');
    visual.setPointerCapture?.(event.pointerId);
  });
  window.addEventListener('pointerup', () => {
    if (manipulation.active && manipulation.squeeze > .12) {
      const outlet = pointOnCurve(paths[Math.floor(paths.length / 2)], .995);
      spawnReleaseBurst(outlet, manipulation.squeeze);
      score += Math.round(160 * manipulation.squeeze);
    }
    manipulation.active = false;
    manipulation.targetSqueeze = 0;
    visual.classList.remove('is-steering');
    stateReadout.textContent = 'FOLLOW THE ARCH';
  });

  const draw = (time) => {
    const seconds = time * .001;
    const pulse = .72 + .28 * (.5 + .5 * Math.sin(seconds * Math.PI * 2 * config.pulseHz));
    const mode = config.modes[modeIndex];
    const deltaTime = previousTime ? Math.min(34, time - previousTime) : 16.67;
    const dt = deltaTime * .001;
    previousTime = time;
    flowClock += deltaTime * pulse;
    pointer.x += (pointer.targetX - pointer.x) * .055;
    pointer.y += (pointer.targetY - pointer.y) * .055;
    manipulation.squeeze += (manipulation.targetSqueeze - manipulation.squeeze) * (manipulation.active ? .13 : .075);
    stateReadout.textContent = manipulation.active ? (manipulation.squeeze > .55 ? 'FLOW LOCKED' : 'COMPRESSING') : 'FOLLOW THE ARCH';
    imageLayer.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1.04)';
    context.clearRect(0, 0, width, height);
    context.save();

    context.save();
    context.globalCompositeOperation = 'lighter';
    context.lineWidth = 1.35 + pulse * .85;
    paths.forEach((curve, pathIndex) => {
      context.beginPath();
      for (let step = 0; step <= 34; step += 1) {
        const point = pointOnCurve(curve, step / 34);
        if (step === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.strokeStyle = `rgba(255,18,42,${.18 + pulse * .12})`;
      context.stroke();
    });
    context.restore();

    // Schematic, deformable research overlay — not a clinically validated device model.
    const stentCurve = config.stentPath || paths[5];
    const deformation = Math.min(1, Math.hypot(manipulation.x, manipulation.y) / 54);
    const stentStations = [];
    for (let step = 0; step <= 30; step += 1) {
      const t = .02 + (step / 30) * .96;
      const centre = pointOnCurve(stentCurve, t);
      const ahead = pointOnCurve(stentCurve, Math.min(.999, t + .004));
      const tangentLength = Math.max(1, Math.hypot(ahead.x - centre.x, ahead.y - centre.y));
      const normalX = -(ahead.y - centre.y) / tangentLength;
      const normalY = (ahead.x - centre.x) / tangentLength;
      const influence = Math.sin((step / 30) * Math.PI);
      const centreX = centre.x + manipulation.x * .16 * influence * (1 - mode.stiffness);
      const centreY = centre.y + manipulation.y * .12 * influence * (1 - mode.stiffness);
      const travellingWave = Math.sin(seconds * 5.4 - step * .92) * (1.4 + manipulation.squeeze * 4.8) * influence;
      const zigzagPulse = (step % 2 ? -1 : 1) * manipulation.squeeze * 2.6 * influence;
      const halfWidth = (config.stentHalfWidth || 29) + mode.flare * 18 + deformation * 10 * influence + travellingWave + zigzagPulse;
      stentStations.push({
        left: { x: centreX + normalX * halfWidth, y: centreY + normalY * halfWidth },
        right: { x: centreX - normalX * halfWidth, y: centreY - normalY * halfWidth },
      });
    }
    context.save();
    context.lineCap = 'round';
    context.lineJoin = 'miter';
    context.shadowColor = '#159cff';
    context.shadowBlur = 7 + pulse * 7;
    ['left', 'right'].forEach((rail) => {
      context.beginPath();
      stentStations.forEach((station, index) => {
        const point = station[rail];
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.strokeStyle = `rgba(67,180,255,${.58 + pulse * .32})`;
      context.lineWidth = 1.15 + pulse * .38;
      context.stroke();
    });
    for (let step = 0; step < stentStations.length - 1; step += 1) {
      const current = stentStations[step];
      const next = stentStations[step + 1];
      context.beginPath();
      if (step % 2 === 0) {
        context.moveTo(current.left.x, current.left.y);
        context.lineTo(next.right.x, next.right.y);
        context.moveTo(current.right.x, current.right.y);
        context.lineTo(next.left.x, next.left.y);
      } else {
        context.moveTo(current.left.x, current.left.y);
        context.lineTo(next.left.x, next.left.y);
        context.moveTo(current.right.x, current.right.y);
        context.lineTo(next.right.x, next.right.y);
      }
      context.strokeStyle = `rgba(124,218,255,${.42 + pulse * .34})`;
      context.lineWidth = .72 + pulse * .32;
      context.stroke();
    }
    context.shadowBlur = 0;
    context.restore();

    let guidedParticles = 0;
    context.save();
    context.globalCompositeOperation = 'lighter';
    particles.forEach((particle) => {
      const t = (particle.phase + flowClock * particle.speed) % 1;
      if (t < particle.previousT) spawnBurst(pointOnCurve(paths[particle.path], 1), particle);
      particle.previousT = t;
      const point = pointOnCurve(paths[particle.path], t);
      const trail = (.012 + particle.strand * .0035) * (.82 + pulse * .35);
      const tail = pointOnCurve(paths[particle.path], Math.max(0, t - trail));
      const middle = pointOnCurve(paths[particle.path], Math.max(0, t - trail * .48));
      const turbulence = 2.2 + (particle.path % 4) * 1.05;
      const wanderX = Math.sin(time * .0011 + particle.phase * 31 + particle.path) * turbulence;
      const wanderY = Math.cos(time * .00135 + particle.phase * 23 - particle.path) * turbulence * .72;
      const flowX = point.x + wanderX;
      const flowY = point.y + wanderY;
      const tailX = tail.x + wanderX * .58;
      const tailY = tail.y + wanderY * .58;
      const middleX = middle.x + wanderX * .78;
      const middleY = middle.y + wanderY * .78;
      const squeezeDistance = Math.hypot(flowX - pointer.px, flowY - pointer.py);
      const squeezeInfluence = manipulation.squeeze * Math.max(0, 1 - squeezeDistance / Math.max(90, width * .19));
      if (squeezeInfluence > .08) guidedParticles += 1;
      const compressedX = flowX + (pointer.px - flowX) * squeezeInfluence * .34;
      const compressedY = flowY + (pointer.py - flowY) * squeezeInfluence * .34;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.quadraticCurveTo(middleX, middleY, compressedX, compressedY);
      context.strokeStyle = `rgba(255,28,55,${Math.min(1, particle.alpha * (.95 + pulse * .72))})`;
      context.lineWidth = particle.size * (1.45 + pulse * .55 + squeezeInfluence * 1.4);
      context.lineCap = 'round';
      context.stroke();
      if (particle.path % 4 === 0) {
        context.beginPath();
        context.moveTo(middleX, middleY);
        context.lineTo(compressedX, compressedY);
        context.strokeStyle = `rgba(255,178,150,${particle.alpha * .36})`;
        context.lineWidth = particle.size * .42;
        context.stroke();
      }
    });
    context.restore();
    if (manipulation.active && guidedParticles) score += guidedParticles * dt * (config.gameGain || 1);
    scoreReadout.textContent = String(Math.floor(score)).padStart(4, '0').slice(-4);

    context.save();
    context.globalCompositeOperation = 'lighter';
    for (let index = burstParticles.length - 1; index >= 0; index -= 1) {
      const shard = burstParticles[index];
      shard.age += dt;
      if (shard.age >= shard.life) {
        burstParticles.splice(index, 1);
        continue;
      }
      const fade = 1 - shard.age / shard.life;
      const previousX = shard.x;
      const previousY = shard.y;
      shard.vx *= Math.pow(.12, dt);
      shard.vy *= Math.pow(.16, dt);
      shard.vy += 13 * dt;
      shard.x += shard.vx * dt;
      shard.y += shard.vy * dt;
      context.beginPath();
      context.moveTo(previousX, previousY);
      context.lineTo(shard.x, shard.y);
      context.strokeStyle = shard.warm
        ? `rgba(255,92,112,${fade * .9})`
        : `rgba(116,239,255,${fade * .82})`;
      context.lineWidth = shard.size * (.45 + fade);
      context.lineCap = 'round';
      context.stroke();
      context.beginPath();
      context.arc(shard.x, shard.y, shard.size * fade, 0, Math.PI * 2);
      context.fillStyle = shard.warm
        ? `rgba(255,202,181,${fade})`
        : `rgba(216,253,255,${fade})`;
      context.fill();
    }
    context.restore();
    context.restore();
    requestAnimationFrame(draw);
  };
    requestAnimationFrame(draw);
  };

  if (document.querySelector('.visual')) init();
  else document.addEventListener('calyr:aorta-content-ready', init, { once: true });
})();
