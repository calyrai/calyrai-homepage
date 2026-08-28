(() => {
  const visual = document.querySelector('.visual');
  if (!visual || visual.querySelector('.aorta-flow-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'aorta-flow-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  visual.append(canvas);

  const hud = document.createElement('div');
  hud.className = 'aorta-hud';
  hud.innerHTML = `<div class="aorta-hud-status"><i></i><span>FLOW FIELD · LIVE</span></div><div class="aorta-hud-readout"><span>V<span data-flow-velocity>1.00</span></span><span>ΔP<span data-flow-pressure>12.4</span></span><span>UQ<span>±04</span></span></div><div class="aorta-hud-reticle" aria-hidden="true"><i></i><b></b></div><div class="aorta-hud-axis" aria-hidden="true"><span>FLOW</span><i></i><b></b></div><div class="aorta-hud-command"><strong>DRAG · STEER FLOW</strong><span>POINTER MODULATES VELOCITY FIELD</span></div>`;
  visual.append(hud);

  const style = document.createElement('style');
  style.textContent = `.visual{overflow:hidden;background-size:108% auto!important;transition:background-position .18s ease-out;cursor:crosshair}.aorta-flow-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;mix-blend-mode:screen}.visual .progress{display:none}.aorta-hud{position:absolute;inset:0;z-index:2;pointer-events:none;color:#fff;font:700 9px/1.2 Arial,sans-serif;letter-spacing:.12em;text-shadow:0 1px 4px #000}.aorta-hud:before{content:"";position:absolute;inset:18px;border:1px solid rgba(255,255,255,.22);clip-path:polygon(0 0,18% 0,18% 1px,82% 1px,82% 0,100% 0,100% 28%,calc(100% - 1px) 28%,calc(100% - 1px) 72%,100% 72%,100% 100%,82% 100%,82% calc(100% - 1px),18% calc(100% - 1px),18% 100%,0 100%,0 72%,1px 72%,1px 28%,0 28%)}.aorta-hud-status{position:absolute;top:30px;left:30px;display:flex;align-items:center;gap:9px}.aorta-hud-status i{width:7px;height:7px;border-radius:50%;background:#f10b0b;box-shadow:0 0 12px #f10b0b;animation:aorta-pulse 1.5s ease-in-out infinite}.aorta-hud-readout{position:absolute;top:30px;right:30px;display:flex;gap:18px}.aorta-hud-readout>span{display:grid;gap:5px;color:rgba(255,255,255,.55);font-size:7px}.aorta-hud-readout>span span{color:#fff;font-size:11px}.aorta-hud-reticle{position:absolute;left:50%;top:50%;width:54px;height:54px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.34);border-radius:50%;transition:left .12s linear,top .12s linear,transform .18s ease}.aorta-hud-reticle:before,.aorta-hud-reticle:after{content:"";position:absolute;background:rgba(255,255,255,.7)}.aorta-hud-reticle:before{left:50%;top:-10px;width:1px;height:74px}.aorta-hud-reticle:after{top:50%;left:-10px;width:74px;height:1px}.aorta-hud-reticle i{position:absolute;inset:8px;border:1px dashed rgba(241,11,11,.8);border-radius:50%;animation:aorta-spin 8s linear infinite}.aorta-hud-reticle b{position:absolute;left:50%;top:50%;width:5px;height:5px;transform:translate(-50%,-50%);border-radius:50%;background:#f10b0b;box-shadow:0 0 10px #f10b0b}.visual.is-steering .aorta-hud-reticle{transform:translate(-50%,-50%) scale(.72)}.aorta-hud-axis{position:absolute;right:30px;top:50%;height:120px;width:18px;transform:translateY(-50%);border-left:1px solid rgba(255,255,255,.35)}.aorta-hud-axis span{position:absolute;top:-17px;left:-2px;color:rgba(255,255,255,.6);font-size:7px}.aorta-hud-axis i{position:absolute;left:-3px;top:18px;width:5px;height:72px;background:linear-gradient(#f10b0b,rgba(241,11,11,.08));transform-origin:bottom}.aorta-hud-axis b{position:absolute;left:-5px;top:17px;width:9px;height:1px;background:#fff}.aorta-hud-command{position:absolute;left:30px;bottom:30px;display:grid;gap:6px}.aorta-hud-command strong{color:#fff;font-size:10px}.aorta-hud-command span{color:rgba(255,255,255,.5);font-size:7px}@keyframes aorta-pulse{50%{opacity:.35;transform:scale(.72)}}@keyframes aorta-spin{to{transform:rotate(360deg)}}@media(max-width:700px){.aorta-hud-readout{display:none}.aorta-hud-axis{right:22px}.aorta-hud-command{left:22px;bottom:22px}}@media(prefers-reduced-motion:reduce){.aorta-flow-canvas{display:none}.visual{background-size:cover!important}.aorta-hud *{animation:none!important}}`;
  document.head.append(style);

  const context = canvas.getContext('2d', { alpha: true });
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const reticle = hud.querySelector('.aorta-hud-reticle');
  const velocityReadout = hud.querySelector('[data-flow-velocity]');
  const pressureReadout = hud.querySelector('[data-flow-pressure]');
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
    const localX = (event.clientX - rect.left) / rect.width;
    const localY = (event.clientY - rect.top) / rect.height;
    pointer.targetX = (localX - .5) * 2;
    pointer.targetY = (localY - .5) * 2;
    reticle.style.left = `${localX * 100}%`;
    reticle.style.top = `${localY * 100}%`;
    velocityReadout.textContent = (1 + pointer.targetX * .28).toFixed(2);
    pressureReadout.textContent = (12.4 + pointer.targetY * 2.8).toFixed(1);
  });
  visual.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    reticle.style.left = '50%';
    reticle.style.top = '50%';
    velocityReadout.textContent = '1.00';
    pressureReadout.textContent = '12.4';
  });
  visual.addEventListener('pointerdown', () => visual.classList.add('is-steering'));
  window.addEventListener('pointerup', () => visual.classList.remove('is-steering'));

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
      const t = (particle.phase + time * particle.speed * (1 + pointer.x * .28)) % 1;
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
