(() => {
  const init = () => {
  const config = window.CALYR_AORTA_FLOW_CONFIG;
  if (!config) return;
  const ui = config.ui || {};
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
  hud.innerHTML = `<div class="aorta-hud-status"><i></i><span>${ui.status}</span></div><div class="aorta-hud-readout"><span>V<span data-flow-velocity>1.00</span></span><span>ΔP<span data-flow-pressure>12.4</span></span><span>UQ<span>±04</span></span></div><div class="aorta-game"><span>${ui.gameTitle}</span><strong data-flow-score>0000</strong><em data-flow-state>${ui.idleState}</em></div><div class="aorta-hud-axis" aria-hidden="true"><span>FLOW →</span><i></i><b></b></div><div class="aorta-stent-label">${ui.modelLabel}</div><div class="aorta-mode-switch" aria-label="Stent deformation modes">${config.modes.map((mode, index) => `<button type="button" data-aorta-mode="${index}" aria-pressed="${index === 0}">${mode.label}</button>`).join('')}</div><div class="aorta-hud-command"><strong>${ui.instruction}</strong><span>${ui.releaseInstruction}</span></div>`;
  visual.append(hud);


  const context = canvas.getContext('2d', { alpha: true });
  const pointer = { active: false, x: 0, y: 0, targetX: 0, targetY: 0, rawX: 0, rawY: 0, px: 0, py: 0, guideT: .5 };
  const manipulation = { active: false, startX: 0, startY: 0, lastX: 0, lastY: 0, x: 0, y: 0, squeeze: 0, targetSqueeze: 0 };
  const arch = { active: false, offsetX: 0, offsetY: 0, startX: 0, startY: 0, baseX: 0, baseY: 0 };
  const vessel = { active: false, offsetX: 0, offsetY: 0, startX: 0, startY: 0, baseX: 0, baseY: 0 };
  const innerWall = { active: false, offsetX: 0, offsetY: 0, startX: 0, startY: 0, baseX: 0, baseY: 0 };
  const outerWallNodes = [.16, .29, .42, .55, .68, .81, .91].map((t) => ({ t, dx: 0, dy: 0 }));
  const innerWallNodes = [.16, .29, .42, .55, .68, .81, .91].map((t) => ({ t, dx: 0, dy: 0 }));
  const stentNodes = [.08, .23, .38, .53, .68, .83, .96].map((t) => ({ t, dx: 0, dy: 0 }));
  const nodeDrag = { active: false, kind: '', node: null, startX: 0, startY: 0, baseX: 0, baseY: 0 };
  let modeIndex = 0;
  const velocityReadout = hud.querySelector('[data-flow-velocity]');
  const pressureReadout = hud.querySelector('[data-flow-pressure]');
  const scoreReadout = hud.querySelector('[data-flow-score]');
  const stateReadout = hud.querySelector('[data-flow-state]');
  const paths = config.paths;
  const stentCurve = config.stentPath || paths[Math.floor(paths.length / 2)];
  const guideCurve = paths[Math.floor(paths.length / 2)];
  const vesselHandleT = .69;
  hud.querySelectorAll('[data-aorta-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      modeIndex = Number(button.dataset.aortaMode);
      hud.querySelectorAll('[data-aorta-mode]').forEach((item, index) => item.setAttribute('aria-pressed', String(index === modeIndex)));
    });
  });
  const randomFor = (index, salt = 0) => {
    const value = Math.sin(index * 91.731 + salt * 47.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const particles = Array.from({ length: config.particleCount }, (_, index) => {
    const phase = randomFor(index, 1);
    return {
      path: Math.min(paths.length - 1, Math.floor(randomFor(index, 3) * paths.length)),
      phase,
      speed: config.baseSpeed * (.68 + randomFor(index, 4) * .82) + randomFor(index, 5) * config.speedStep * 7,
      size: .32 + randomFor(index, 6) * 1.08,
      alpha: .12 + randomFor(index, 7) * .44,
      flock: randomFor(index, 8) * 2 - 1,
      drift: .45 + randomFor(index, 9) * 1.75,
      frequency: .55 + randomFor(index, 10) * 2.4,
      swarm: Math.floor(randomFor(index, 11) * 17),
      orbit: randomFor(index, 13) * Math.PI * 2,
      depth: .45 + randomFor(index, 14) * .85,
      cold: randomFor(index, 12) > .64,
      streak: 2.2 + randomFor(index, 15) * 11.8,
      previousX: null,
      previousY: null,
      previousT: phase,
    };
  });
  const burstParticles = [];
  const spawnBurst = (point, source) => {
    const shardCount = 12 + (source.path % 5) * 3;
    for (let shard = 0; shard < shardCount; shard += 1) {
      const angle = (shard / shardCount) * Math.PI * 2 + source.phase * 7.3;
      const force = 26 + ((source.path * 13 + shard * 17) % 48);
      burstParticles.push({
        x: point.x,
        y: point.y,
        vx: Math.cos(angle) * force + 42,
        vy: Math.sin(angle) * force * .72,
        age: 0,
        life: .5 + ((source.path + shard) % 7) * .05,
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

  const archWeight = (t) => Math.exp(-((t - .46) ** 2) / .052);
  const vesselWeight = (t) => Math.exp(-((t - .49) ** 2) / .072);
  const localNodeOffset = (nodes, t, spread = .0095) => nodes.reduce((offset, node) => {
    const influence = Math.exp(-((t - node.t) ** 2) / spread);
    offset.x += node.dx * influence;
    offset.y += node.dy * influence;
    return offset;
  }, { x: 0, y: 0 });
  const wallPoint = (curve, wall, nodes, t) => {
    const point = pointOnCurve(curve, t);
    const local = localNodeOffset(nodes, t);
    const influence = vesselWeight(t);
    return { x: point.x + wall.offsetX * influence + local.x, y: point.y + wall.offsetY * influence + local.y };
  };
  const smoothstep = (edge0, edge1, value) => {
    const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
    return x * x * (3 - 2 * x);
  };
  const deformedStentPoint = (t) => {
    const point = pointOnCurve(stentCurve, t);
    const influence = archWeight(.42 + t * .42);
    const local = localNodeOffset(stentNodes, t, .014);
    return { x: point.x + arch.offsetX * influence + local.x, y: point.y + arch.offsetY * influence + local.y };
  };
  const flowPoint = (curve, t) => {
    const point = pointOnCurve(curve, t);
    const influence = archWeight(t);
    const vascularInfluence = vesselWeight(t);
    const meanWallOffsetX = (vessel.offsetX + innerWall.offsetX) * .5;
    const meanWallOffsetY = (vessel.offsetY + innerWall.offsetY) * .5;
    const outerLocal = localNodeOffset(outerWallNodes, t);
    const innerLocal = localNodeOffset(innerWallNodes, t);
    const base = {
      x: point.x + meanWallOffsetX * vascularInfluence + (outerLocal.x + innerLocal.x) * .5 + arch.offsetX * influence * .42,
      y: point.y + meanWallOffsetY * vascularInfluence + (outerLocal.y + innerLocal.y) * .5 + arch.offsetY * influence * .42,
    };
    const pathIndex = paths.indexOf(curve);
    if (pathIndex < 0 || t < .36 || t > .88) return base;
    const enter = smoothstep(.36, .48, t);
    const exit = 1 - smoothstep(.76, .88, t);
    const stentInfluence = enter * exit * .94;
    const stentT = Math.max(0, Math.min(1, (t - .42) / .42));
    const centre = deformedStentPoint(stentT);
    const ahead = deformedStentPoint(Math.min(.999, stentT + .006));
    const tangentLength = Math.max(1, Math.hypot(ahead.x - centre.x, ahead.y - centre.y));
    const normalX = -(ahead.y - centre.y) / tangentLength;
    const normalY = (ahead.x - centre.x) / tangentLength;
    const laneOffset = (pathIndex - (paths.length - 1) / 2) * 7.2;
    const target = { x: centre.x + normalX * laneOffset, y: centre.y + normalY * laneOffset };
    return {
      x: base.x + (target.x - base.x) * stentInfluence,
      y: base.y + (target.y - base.y) * stentInfluence,
    };
  };
  const nearestGuidePoint = (x, y) => {
    let nearest = { t: 0, point: flowPoint(guideCurve, 0), distance: Infinity };
    for (let step = 0; step <= 100; step += 1) {
      const t = step / 100;
      const point = flowPoint(guideCurve, t);
      const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
      if (distance < nearest.distance) nearest = { t, point, distance };
    }
    return nearest;
  };
  const nearestVesselPoint = (x, y) => {
    let nearest = { curve: config.vesselBounds.outer, t: 0, point: pointOnCurve(config.vesselBounds.outer, 0), distance: Infinity };
    [config.vesselBounds.outer, config.vesselBounds.inner].forEach((curve) => {
      for (let step = 0; step <= 120; step += 1) {
        const t = step / 120;
        const wall = curve === config.vesselBounds.inner ? innerWall : vessel;
        const nodes = curve === config.vesselBounds.inner ? innerWallNodes : outerWallNodes;
        const point = wallPoint(curve, wall, nodes, t);
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < nearest.distance) nearest = { curve, t, point, distance };
      }
    });
    return nearest;
  };
  const nearestControlNode = (x, y) => {
    const candidates = [
      ...outerWallNodes.map((node) => ({ kind: 'outer', node, point: wallPoint(config.vesselBounds.outer, vessel, outerWallNodes, node.t) })),
      ...innerWallNodes.map((node) => ({ kind: 'inner', node, point: wallPoint(config.vesselBounds.inner, innerWall, innerWallNodes, node.t) })),
      ...stentNodes.map((node) => ({ kind: 'stent', node, point: deformedStentPoint(node.t) })),
    ];
    return candidates.reduce((nearest, candidate) => {
      const distance = Math.hypot(candidate.point.x - x, candidate.point.y - y);
      return distance < nearest.distance ? { ...candidate, distance } : nearest;
    }, { distance: Infinity });
  };

  visual.addEventListener('pointermove', (event) => {
    pointer.active = true;
    const rect = visual.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width;
    const localY = (event.clientY - rect.top) / rect.height;
    pointer.targetX = (localX - .5) * 2;
    pointer.targetY = (localY - .5) * 2;
    pointer.rawX = localX * rect.width;
    pointer.rawY = localY * rect.height;
    const guide = nearestGuidePoint(pointer.rawX, pointer.rawY);
    pointer.guideT = guide.t;
    pointer.px = guide.point.x;
    pointer.py = guide.point.y;
    pressureReadout.textContent = (12.4 + pointer.targetY * 2.8).toFixed(1);
    if (nodeDrag.active && nodeDrag.node) {
      nodeDrag.node.dx = Math.max(-82, Math.min(82, nodeDrag.baseX + event.clientX - nodeDrag.startX));
      nodeDrag.node.dy = Math.max(-72, Math.min(72, nodeDrag.baseY + event.clientY - nodeDrag.startY));
      pressureReadout.textContent = (12.4 + Math.hypot(nodeDrag.node.dx, nodeDrag.node.dy) * .045).toFixed(1);
    } else if (innerWall.active) {
      innerWall.offsetX = Math.max(-105, Math.min(105, innerWall.baseX + event.clientX - innerWall.startX));
      innerWall.offsetY = Math.max(-90, Math.min(90, innerWall.baseY + event.clientY - innerWall.startY));
      pressureReadout.textContent = (12.4 + Math.hypot(innerWall.offsetX, innerWall.offsetY) * .04).toFixed(1);
    } else if (vessel.active) {
      vessel.offsetX = Math.max(-120, Math.min(120, vessel.baseX + event.clientX - vessel.startX));
      vessel.offsetY = Math.max(-105, Math.min(105, vessel.baseY + event.clientY - vessel.startY));
      pressureReadout.textContent = (12.4 + Math.hypot(vessel.offsetX, vessel.offsetY) * .04).toFixed(1);
    } else if (arch.active) {
      arch.offsetX = Math.max(-110, Math.min(110, arch.baseX + event.clientX - arch.startX));
      arch.offsetY = Math.max(-90, Math.min(90, arch.baseY + event.clientY - arch.startY));
      pressureReadout.textContent = (12.4 + Math.hypot(arch.offsetX, arch.offsetY) * .055).toFixed(1);
    } else if (manipulation.active) {
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
    pointer.active = false;
    pointer.targetX = 0;
    pointer.targetY = 0;
    velocityReadout.textContent = '1.00';
    pressureReadout.textContent = '12.4';
  });
  visual.addEventListener('pointerdown', (event) => {
    const handle = deformedStentPoint(.46);
    const rect = visual.getBoundingClientRect();
    const hitX = event.clientX - rect.left;
    const hitY = event.clientY - rect.top;
    const controlNode = nearestControlNode(hitX, hitY);
    if (controlNode.distance < 24) {
      nodeDrag.active = true;
      nodeDrag.kind = controlNode.kind;
      nodeDrag.node = controlNode.node;
      nodeDrag.startX = event.clientX;
      nodeDrag.startY = event.clientY;
      nodeDrag.baseX = controlNode.node.dx;
      nodeDrag.baseY = controlNode.node.dy;
      visual.classList.add('is-steering');
      visual.setPointerCapture?.(event.pointerId);
      return;
    }
    const vesselBase = pointOnCurve(config.vesselBounds.outer, vesselHandleT);
    const vesselHandleInfluence = vesselWeight(vesselHandleT);
    const vesselHandle = { x: vesselBase.x + vessel.offsetX * vesselHandleInfluence, y: vesselBase.y + vessel.offsetY * vesselHandleInfluence };
    const innerBase = pointOnCurve(config.vesselBounds.inner, vesselHandleT);
    const innerHandle = { x: innerBase.x + innerWall.offsetX * vesselHandleInfluence, y: innerBase.y + innerWall.offsetY * vesselHandleInfluence };
    const vesselHit = nearestVesselPoint(hitX, hitY);
    const outerHandleDistance = Math.hypot(hitX - vesselHandle.x, hitY - vesselHandle.y);
    const innerHandleDistance = Math.hypot(hitX - innerHandle.x, hitY - innerHandle.y);
    if (Math.min(outerHandleDistance, innerHandleDistance) < 72 || vesselHit.distance < 28) {
      const handleWasHit = Math.min(outerHandleDistance, innerHandleDistance) < 72;
      const selectedWall = handleWasHit
        ? (innerHandleDistance < outerHandleDistance ? innerWall : vessel)
        : (vesselHit.curve === config.vesselBounds.inner ? innerWall : vessel);
      selectedWall.active = true;
      selectedWall.startX = event.clientX;
      selectedWall.startY = event.clientY;
      selectedWall.baseX = selectedWall.offsetX;
      selectedWall.baseY = selectedWall.offsetY;
      visual.classList.add('is-steering');
      visual.setPointerCapture?.(event.pointerId);
      return;
    }
    if (Math.hypot(hitX - handle.x, hitY - handle.y) < 62) {
      arch.active = true;
      arch.startX = event.clientX;
      arch.startY = event.clientY;
      arch.baseX = arch.offsetX;
      arch.baseY = arch.offsetY;
      visual.classList.add('is-steering');
      visual.setPointerCapture?.(event.pointerId);
      return;
    }
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
    if (nodeDrag.active) {
      nodeDrag.active = false;
      nodeDrag.kind = '';
      nodeDrag.node = null;
      visual.classList.remove('is-steering');
      stateReadout.textContent = ui.idleState;
      return;
    }
    if (innerWall.active) {
      innerWall.active = false;
      visual.classList.remove('is-steering');
      stateReadout.textContent = ui.idleState;
      return;
    }
    if (vessel.active) {
      vessel.active = false;
      visual.classList.remove('is-steering');
      stateReadout.textContent = ui.idleState;
      return;
    }
    if (arch.active) {
      arch.active = false;
      visual.classList.remove('is-steering');
      stateReadout.textContent = ui.idleState;
      return;
    }
    if (manipulation.active && manipulation.squeeze > .12) {
      const outlet = pointOnCurve(paths[Math.floor(paths.length / 2)], .995);
      spawnReleaseBurst(outlet, manipulation.squeeze);
      score += Math.round(160 * manipulation.squeeze);
    }
    manipulation.active = false;
    manipulation.targetSqueeze = 0;
    visual.classList.remove('is-steering');
    stateReadout.textContent = ui.idleState;
  });

  const draw = (time) => {
    const seconds = time * .001;
    const heartCycle = (seconds * config.pulseHz) % 1;
    const systole = Math.exp(-((heartCycle - .075) ** 2) / .0022);
    const rebound = .52 * Math.exp(-((heartCycle - .19) ** 2) / .0048);
    const heartPulse = Math.min(1, systole + rebound);
    const pulse = .58 + heartPulse * .42;
    const speedPulse = .28 + heartPulse * 2.65;
    const mode = config.modes[modeIndex];
    const deltaTime = previousTime ? Math.min(34, time - previousTime) : 16.67;
    const dt = deltaTime * .001;
    previousTime = time;
    flowClock += deltaTime * speedPulse;
    velocityReadout.textContent = Math.max(.1, .42 + heartPulse * 1.9 + pointer.targetX * .12).toFixed(2);
    pointer.x += (pointer.targetX - pointer.x) * .055;
    pointer.y += (pointer.targetY - pointer.y) * .055;
    manipulation.squeeze += (manipulation.targetSqueeze - manipulation.squeeze) * (manipulation.active ? .13 : .075);
    stateReadout.textContent = manipulation.active ? (manipulation.squeeze > .55 ? ui.lockedState : ui.activeState) : ui.idleState;
    imageLayer.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1.04)';
    context.clearRect(0, 0, width, height);
    context.save();

    // Keep the vascular anatomy legible: a restrained lumen ribbon sits behind
    // the particles, with explicit outer and inner aortic-arch boundaries.
    if (config.vesselBounds) {
      const drawCurve = (curve, reverse = false) => {
        const steps = 72;
        for (let step = 0; step <= steps; step += 1) {
          const t = reverse ? 1 - step / steps : step / steps;
          const wall = curve === config.vesselBounds.inner ? innerWall : vessel;
          const nodes = curve === config.vesselBounds.inner ? innerWallNodes : outerWallNodes;
          const point = wallPoint(curve, wall, nodes, t);
          if (step === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
      };
      context.save();
      context.beginPath();
      drawCurve(config.vesselBounds.outer);
      drawCurve(config.vesselBounds.inner, true);
      context.closePath();
      const lumen = context.createLinearGradient(0, 0, width, height);
      lumen.addColorStop(0, 'rgba(255,20,46,.16)');
      lumen.addColorStop(.52, 'rgba(121,9,74,.09)');
      lumen.addColorStop(1, 'rgba(255,20,46,.13)');
      context.fillStyle = lumen;
      context.fill();
      [config.vesselBounds.outer, config.vesselBounds.inner].forEach((curve, index) => {
        context.beginPath();
        drawCurve(curve);
        context.strokeStyle = index === 0 ? 'rgba(255,45,70,.62)' : 'rgba(255,120,150,.38)';
        context.lineWidth = index === 0 ? 1.7 : 1.05;
        context.stroke();
      });
      context.restore();
    }

    if (config.vesselBounds) {
      const vesselBase = pointOnCurve(config.vesselBounds.outer, vesselHandleT);
      const vesselHandleInfluence = vesselWeight(vesselHandleT);
      const vesselHandle = { x: vesselBase.x + vessel.offsetX * vesselHandleInfluence, y: vesselBase.y + vessel.offsetY * vesselHandleInfluence };
      context.save();
      context.beginPath();
      context.moveTo(vesselBase.x, vesselBase.y);
      context.lineTo(vesselHandle.x, vesselHandle.y);
      context.setLineDash([4, 5]);
      context.strokeStyle = 'rgba(255,45,70,.72)';
      context.lineWidth = 1;
      context.stroke();
      context.setLineDash([]);
      context.beginPath();
      context.arc(vesselHandle.x, vesselHandle.y, vessel.active ? 10 : 7, 0, Math.PI * 2);
      context.fillStyle = vessel.active ? 'rgba(255,225,230,.98)' : 'rgba(255,34,61,.95)';
      context.shadowColor = '#ff1939';
      context.shadowBlur = 18;
      context.fill();
      outerWallNodes.forEach((control) => {
        const node = wallPoint(config.vesselBounds.outer, vessel, outerWallNodes, control.t);
        const active = nodeDrag.active && nodeDrag.node === control;
        context.beginPath();
        context.arc(node.x, node.y, active ? 7.5 : 4.6, 0, Math.PI * 2);
        context.fillStyle = active ? 'rgba(255,238,241,1)' : 'rgba(255,42,67,.94)';
        context.fill();
      });
      context.restore();

      const innerBase = pointOnCurve(config.vesselBounds.inner, vesselHandleT);
      const innerHandle = { x: innerBase.x + innerWall.offsetX * vesselHandleInfluence, y: innerBase.y + innerWall.offsetY * vesselHandleInfluence };
      context.save();
      context.beginPath();
      context.moveTo(innerBase.x, innerBase.y);
      context.lineTo(innerHandle.x, innerHandle.y);
      context.setLineDash([4, 5]);
      context.strokeStyle = 'rgba(255,92,135,.78)';
      context.lineWidth = 1;
      context.stroke();
      context.setLineDash([]);
      context.beginPath();
      context.arc(innerHandle.x, innerHandle.y, innerWall.active ? 10 : 7, 0, Math.PI * 2);
      context.fillStyle = innerWall.active ? 'rgba(255,234,240,.98)' : 'rgba(255,82,125,.96)';
      context.shadowColor = '#ff426f';
      context.shadowBlur = 18;
      context.fill();
      innerWallNodes.forEach((control) => {
        const node = wallPoint(config.vesselBounds.inner, innerWall, innerWallNodes, control.t);
        const active = nodeDrag.active && nodeDrag.node === control;
        context.beginPath();
        context.arc(node.x, node.y, active ? 7.5 : 4.6, 0, Math.PI * 2);
        context.fillStyle = active ? 'rgba(255,242,246,1)' : 'rgba(255,92,135,.94)';
        context.fill();
      });
      context.restore();
    }

    context.save();
    context.globalCompositeOperation = 'lighter';
    context.lineWidth = 1.35 + pulse * .85;
    paths.forEach((curve, pathIndex) => {
      context.beginPath();
      for (let step = 0; step <= 34; step += 1) {
        const point = flowPoint(curve, step / 34);
        if (step === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.strokeStyle = `rgba(126,226,255,${.055 + pulse * .045})`;
      context.stroke();
    });
    context.restore();

    // Schematic, deformable research overlay — not a clinically validated device model.
    const deformation = Math.min(1, Math.hypot(manipulation.x, manipulation.y) / 54);
    const stentStations = [];
    for (let step = 0; step <= 30; step += 1) {
      const t = .02 + (step / 30) * .96;
      const centre = deformedStentPoint(t);
      const ahead = deformedStentPoint(Math.min(.999, t + .004));
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

    const handleBase = pointOnCurve(stentCurve, .46);
    const handle = deformedStentPoint(.46);
    context.save();
    context.beginPath();
    context.moveTo(handleBase.x, handleBase.y);
    context.lineTo(handle.x, handle.y);
    context.strokeStyle = 'rgba(93,214,255,.58)';
    context.setLineDash([4, 5]);
    context.lineWidth = 1;
    context.stroke();
    context.setLineDash([]);
    context.beginPath();
    context.arc(handle.x, handle.y, arch.active ? 10 : 7, 0, Math.PI * 2);
    context.fillStyle = arch.active ? 'rgba(220,252,255,.98)' : 'rgba(70,202,255,.92)';
    context.shadowColor = '#39caff';
    context.shadowBlur = 18;
    context.fill();
    stentNodes.forEach((control) => {
      const node = deformedStentPoint(control.t);
      const active = nodeDrag.active && nodeDrag.node === control;
      context.beginPath();
      context.arc(node.x, node.y, active ? 7.5 : 4.6, 0, Math.PI * 2);
      context.fillStyle = active ? 'rgba(230,253,255,1)' : 'rgba(61,204,255,.96)';
      context.fill();
    });
    context.restore();

    let guidedParticles = 0;
    context.save();
    context.globalCompositeOperation = 'lighter';
    particles.forEach((particle) => {
      const archStrain = Math.min(1, Math.hypot(arch.offsetX, arch.offsetY) / 125);
      const t = (particle.phase + flowClock * particle.speed * (1 + archStrain * .34)) % 1;
      if (t < particle.previousT) spawnBurst(pointOnCurve(paths[particle.path], 1), particle);
      particle.previousT = t;
      const point = flowPoint(paths[particle.path], t);
      const localArchImpact = archWeight(t) * archStrain;
      const turbulence = (2.1 + (particle.path % 4) * 1.08 + localArchImpact * 9.5) * particle.drift;
      const swarmClock = time * .00034 + particle.swarm * .83;
      const swarmBreath = .35 + .65 * (.5 + .5 * Math.sin(swarmClock * 2.3));
      const flockWave = Math.sin(time * .0017 * particle.frequency + t * (31 + particle.frequency * 15) + particle.flock * 9.7);
      const flockSpread = (config.flockSpread || 7.5) * particle.flock * swarmBreath;
      const ahead = flowPoint(paths[particle.path], Math.min(.999, t + .003));
      const tangentLength = Math.max(1, Math.hypot(ahead.x - point.x, ahead.y - point.y));
      const normalX = -(ahead.y - point.y) / tangentLength;
      const normalY = (ahead.x - point.x) / tangentLength;
      const orbit = particle.orbit + time * .0011 * particle.frequency + t * 18;
      const curl = Math.sin(orbit) * turbulence * (1.2 + swarmBreath);
      const wanderX = Math.cos(orbit * .73) * turbulence + normalX * (flockSpread + flockWave * 3.2 * particle.drift + curl);
      const wanderY = Math.sin(orbit * .91) * turbulence * .72 + normalY * (flockSpread + flockWave * 3.2 * particle.drift + curl);
      const flowX = point.x + wanderX;
      const flowY = point.y + wanderY;
      const squeezeDistance = Math.hypot(flowX - pointer.px, flowY - pointer.py);
      const guideInfluence = Math.max(0, 1 - squeezeDistance / Math.max(72, width * .14));
      const squeezeInfluence = Math.max(manipulation.squeeze, pointer.active ? .64 : 0) * guideInfluence;
      if (squeezeInfluence > .08) guidedParticles += 1;
      const compressedX = flowX + (pointer.px - flowX) * squeezeInfluence * .26;
      const compressedY = flowY + (pointer.py - flowY) * squeezeInfluence * .26;
      const densityWave = .58 + .42 * (.5 + .5 * Math.sin(t * 42 - time * .0032 + particle.swarm));
      const particleRadius = particle.size * particle.depth * (.44 + pulse * .48 + squeezeInfluence * .5) * densityWave;
      const tangentX = (ahead.x - point.x) / tangentLength;
      const tangentY = (ahead.y - point.y) / tangentLength;
      const directionalCurl = flockWave * (.34 + particle.drift * .16) + Math.sin(orbit * 1.37) * .28 + localArchImpact * Math.sin(orbit) * 1.05;
      const directionLength = Math.max(.25, Math.hypot(tangentX + normalX * directionalCurl, tangentY + normalY * directionalCurl));
      const directionX = (tangentX + normalX * directionalCurl) / directionLength;
      const directionY = (tangentY + normalY * directionalCurl) / directionLength;
      const trailLength = particle.streak * (1 + localArchImpact * 1.65 + squeezeInfluence * .65) * (.58 + densityWave * .45 + heartPulse * .62);
      const trailX = compressedX - directionX * trailLength;
      const trailY = compressedY - directionY * trailLength;
      const alpha = Math.min(1, particle.alpha * densityWave * (.46 + pulse * .5 + heartPulse * .42));
      context.beginPath();
      context.moveTo(trailX, trailY);
      context.lineTo(compressedX, compressedY);
      context.strokeStyle = particle.cold
        ? `rgba(73,211,255,${alpha})`
        : `rgba(231,250,255,${alpha})`;
      context.lineWidth = Math.max(.48, particleRadius * (particle.alpha > .55 ? 1.05 : .72));
      context.lineCap = 'round';
      context.stroke();
      if (particle.alpha > .48) {
        context.beginPath();
        context.arc(compressedX, compressedY, Math.max(.3, particleRadius * .58), 0, Math.PI * 2);
        context.fillStyle = particle.cold
          ? `rgba(117,229,255,${alpha * .88})`
          : `rgba(255,255,255,${alpha * .86})`;
        context.fill();
      }
      if (particle.path % 4 === 0 && particle.alpha > .42) {
        context.beginPath();
        context.arc(compressedX, compressedY, particleRadius * 2.6, 0, Math.PI * 2);
        context.fillStyle = `rgba(130,229,255,${particle.alpha * .075})`;
        context.fill();
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
      shard.vx *= Math.pow(.12, dt);
      shard.vy *= Math.pow(.16, dt);
      shard.vy += 13 * dt;
      shard.x += shard.vx * dt;
      shard.y += shard.vy * dt;
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
