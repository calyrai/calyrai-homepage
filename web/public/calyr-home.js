(() => {
  if (location.pathname === '/' || document.querySelector('.calyr-shell')) return;
  const qrBits = '1111111011001111101111111100000101000100000100000110111010010100110010111011011101000110011101011101101110100001001000101110110000010110011101010000011111111010101010101111111000000001101011010000000000011010010101011111000110100100011011111110011111010000110010000110001010110000101100010111010001101011011001011010010110100110110000111100001010000110100111011000000100110110001000001101111000010110111101100010110011111001100000000000100101000111001111111000111001101011001100000100110111110001001010111010111000101111100101011101011110011000000101101110100100000110001010010000010011001100001010001111111000111011001011111';
  const qrSize = 25;
  const cells = [...qrBits].map((bit, i) => bit === '1' ? `<rect x="${i % qrSize + 4}" y="${Math.floor(i / qrSize) + 4}" width="1" height="1"/>` : '').join('');
  const shell = document.createElement('div');
  shell.className = 'calyr-shell';
  shell.innerHTML = `<button class="calyr-burger" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="calyr-drawer"><i></i><i></i><i></i></button><button class="calyr-brand-rail" type="button" aria-label="Open calyr.aí particle ring" aria-expanded="false" aria-controls="calyr-brand-panel"><i></i></button><aside id="calyr-brand-panel" class="calyr-brand-panel" aria-hidden="true"><canvas width="240" height="240" aria-label="Animated CALYR particle ring"></canvas></aside><div class="calyr-shade" hidden></div><aside id="calyr-drawer" class="calyr-drawer" aria-hidden="true"><header><a href="/">calyr.aí</a><button type="button" aria-label="Close navigation">×</button></header><nav aria-label="Research navigation"><a href="/">00 <strong>Home</strong></a><a href="/research/aorta/index.html">01 <strong>Aorta</strong></a><a href="/research/nanoparticles/index.html">02 <strong>Nanoparticles</strong></a><a href="/research/nanobiophysics/index.html">03 <strong>Nanobiophysics</strong></a><a href="/research/doe-ppms/index.html">04 <strong>DOE / PPMS</strong></a></nav><a class="calyr-contact" href="mailto:rupert.tscheliessnig@calyr.ai"><span><small>CONTACT</small><strong>Scan or write</strong><em>rupert.tscheliessnig@calyr.ai</em></span><svg viewBox="0 0 33 33" role="img" aria-label="QR code for CALYR email contact"><rect width="33" height="33" fill="#000"/><g fill="#fff">${cells}</g></svg></a></aside>`;
  const style = document.createElement('style');
  style.textContent = `.calyr-shell{font-family:Arial,Helvetica,sans-serif}.calyr-burger{position:fixed;top:max(1rem,calc(env(safe-area-inset-top) + 1rem));left:max(1rem,calc(env(safe-area-inset-left) + 1rem));z-index:2147483647;width:auto;height:auto;min-width:0;min-height:0;padding:.5rem;border:0;border-radius:0;background:transparent;display:flex;flex-direction:column;gap:5px;cursor:pointer}.calyr-burger i{display:block;width:24px;height:1px;background:#111;transition:transform .3s ease,opacity .3s ease,background .2s ease}.calyr-burger.active i{background:#fff}.calyr-burger.active i:nth-child(1){transform:translateY(6px) rotate(45deg)}.calyr-burger.active i:nth-child(2){opacity:0}.calyr-burger.active i:nth-child(3){transform:translateY(-6px) rotate(-45deg)}.calyr-shade{position:fixed;inset:0;z-index:2147483645;background:rgba(0,0,0,.5)}.calyr-drawer{position:fixed;z-index:2147483646;inset:0 auto 0 0;width:min(360px,88vw);min-height:100vh;padding:max(4.9rem,calc(env(safe-area-inset-top) + 4.35rem)) 1.15rem 1.35rem;background:#050505;color:#fff;transform:translateX(-102%);transition:transform .3s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;box-shadow:0 2px 12px rgba(0,0,0,.24)}.calyr-drawer.open{transform:none}.calyr-drawer header{display:none}.calyr-drawer nav{display:grid}.calyr-drawer nav a{display:flex;justify-content:flex-end;align-items:center;gap:18px;min-height:58px;padding:0;border-bottom:1px solid rgba(255,255,255,.28);color:#8b8b8b;text-decoration:none;font-size:10px;letter-spacing:.1em;text-align:right}.calyr-drawer nav strong{min-width:190px;color:#fff;font-size:20px;letter-spacing:0;font-weight:500}.calyr-drawer nav a:hover strong,.calyr-drawer nav a:focus-visible strong{color:#23c7d5}.calyr-contact{margin-top:auto;padding-top:26px;display:grid;grid-template-columns:1fr 92px;gap:18px;align-items:end;color:#fff;text-decoration:none;border-top:1px solid rgba(255,255,255,.28)}.calyr-contact span{display:flex;flex-direction:column;gap:7px}.calyr-contact small{color:#23c7d5;letter-spacing:.12em}.calyr-contact strong{font-size:18px;font-weight:500}.calyr-contact em{font-size:9px;color:#999;font-style:normal;overflow-wrap:anywhere}.calyr-contact svg{width:92px;height:92px;background:#000}@media(max-width:600px){.calyr-drawer{width:min(360px,88vw);padding:max(4.7rem,calc(env(safe-area-inset-top) + 4.2rem)) 1rem 1.1rem}.calyr-contact{grid-template-columns:1fr 82px}.calyr-contact svg{width:82px;height:82px}}`;
  style.textContent += `.calyr-brand-rail{position:fixed;top:max(1rem,calc(env(safe-area-inset-top) + 1rem));left:max(4.15rem,calc(env(safe-area-inset-left) + 4.15rem));z-index:2147483644;display:grid;place-items:center;width:24px;height:33px;min-width:0;min-height:0;padding:.5rem 0;border:0;background:transparent;color:#111;cursor:pointer}.calyr-brand-rail i{display:block;width:24px;height:1px;background:currentColor;transform-origin:left center;transition:transform .22s ease,background .22s ease}.calyr-brand-rail:hover i,.calyr-brand-rail:focus-visible i,.calyr-brand-rail.active i{transform:scaleX(.5);background:#00c7ff}.calyr-brand-panel{position:fixed;top:max(4.5rem,calc(env(safe-area-inset-top) + 4.5rem));left:max(1rem,calc(env(safe-area-inset-left) + 1rem));z-index:2147483643;width:min(260px,calc(100vw - 2rem));padding:8px;border:1px solid rgba(255,255,255,.92);background:#000;box-shadow:0 20px 70px rgba(0,0,0,.72);opacity:0;visibility:hidden;transform:scaleY(.08);transform-origin:top left;transition:opacity .18s ease,transform .22s ease,visibility .22s}.calyr-brand-panel.open{opacity:1;visibility:visible;transform:none}.calyr-brand-panel canvas{display:block;width:100%;aspect-ratio:1;background:#000}`;
  document.head.append(style);
  document.body.append(shell);
  const burger = shell.querySelector('.calyr-burger');
  const drawer = shell.querySelector('.calyr-drawer');
  const shade = shell.querySelector('.calyr-shade');
  const close = shell.querySelector('header button');
  const brandRail = shell.querySelector('.calyr-brand-rail');
  const brandPanel = shell.querySelector('.calyr-brand-panel');
  const ringCanvas = brandPanel.querySelector('canvas');
  const ringContext = ringCanvas.getContext('2d');
  let brandOpen = false;
  let ringFrame = 0;
  const renderRing = (time = 0) => {
    if (!brandOpen) return;
    ringContext.clearRect(0, 0, 240, 240);
    ringContext.fillStyle = '#000';
    ringContext.fillRect(0, 0, 240, 240);
    for (let i = 0; i < 96; i += 1) {
      const angle = (i / 96) * Math.PI * 2 + time * 0.00008;
      const wave = Math.sin(angle * 6 + time * 0.0012) * 7;
      const radius = 72 + wave;
      const x = 120 + Math.cos(angle) * radius;
      const y = 120 + Math.sin(angle) * radius;
      const pulse = 0.42 + 0.42 * Math.sin(time * 0.0015 + i * 0.27);
      ringContext.beginPath();
      ringContext.arc(x, y, 1.05 + pulse * 0.75, 0, Math.PI * 2);
      ringContext.fillStyle = i % 13 === 0 ? '#00c7ff' : `rgba(255,255,255,${0.48 + pulse * 0.44})`;
      ringContext.fill();
    }
    ringFrame = requestAnimationFrame(renderRing);
  };
  const setBrandOpen = (open) => {
    brandOpen = open;
    brandRail.classList.toggle('active', open);
    brandPanel.classList.toggle('open', open);
    brandRail.setAttribute('aria-expanded', String(open));
    brandPanel.setAttribute('aria-hidden', String(!open));
    cancelAnimationFrame(ringFrame);
    if (open) ringFrame = requestAnimationFrame(renderRing);
  };
  const setOpen = (open) => {
    burger.classList.toggle('active', open);
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    shade.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
  brandRail.addEventListener('click', () => setBrandOpen(!brandOpen));
  brandRail.addEventListener('mouseenter', () => setBrandOpen(true));
  brandPanel.addEventListener('mouseleave', () => setBrandOpen(false));
  close.addEventListener('click', () => setOpen(false));
  shade.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setOpen(false); setBrandOpen(false); } });
})();
