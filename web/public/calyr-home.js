(() => {
  if (location.pathname === '/' || document.querySelector('.calyr-shell')) return;
  const qrBits = '1111111011001111101111111100000101000100000100000110111010010100110010111011011101000110011101011101101110100001001000101110110000010110011101010000011111111010101010101111111000000001101011010000000000011010010101011111000110100100011011111110011111010000110010000110001010110000101100010111010001101011011001011010010110100110110000111100001010000110100111011000000100110110001000001101111000010110111101100010110011111001100000000000100101000111001111111000111001101011001100000100110111110001001010111010111000101111100101011101011110011000000101101110100100000110001010010000010011001100001010001111111000111011001011111';
  const qrSize = 25;
  const cells = [...qrBits].map((bit, i) => bit === '1' ? `<rect x="${i % qrSize + 4}" y="${Math.floor(i / qrSize) + 4}" width="1" height="1"/>` : '').join('');
  const shell = document.createElement('div');
  shell.className = 'calyr-shell';
  shell.innerHTML = `<button class="calyr-burger" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="calyr-drawer"><i></i><i></i><i></i></button><div class="calyr-shade" hidden></div><aside id="calyr-drawer" class="calyr-drawer" aria-hidden="true"><header><a href="/">calyr.aí</a><button type="button" aria-label="Close navigation">×</button></header><nav aria-label="Research navigation"><a href="/">00 <strong>Home</strong></a><a href="/research/aorta/index.html">01 <strong>Aorta</strong></a><a href="/research/nanoparticles/index.html">02 <strong>Nanoparticles</strong></a><a href="/research/nanobiophysics/index.html">03 <strong>Nanobiophysics</strong></a><a href="/research/doe-ppms/index.html">04 <strong>DOE / PPMS</strong></a></nav><a class="calyr-contact" href="mailto:rupert.tscheliessnig@calyr.ai"><span><small>CONTACT</small><strong>Scan or write</strong><em>rupert.tscheliessnig@calyr.ai</em></span><svg viewBox="0 0 33 33" role="img" aria-label="QR code for CALYR email contact"><rect width="33" height="33" fill="#000"/><g fill="#fff">${cells}</g></svg></a></aside>`;
  const style = document.createElement('style');
  style.textContent = `.calyr-shell{font-family:Arial,Helvetica,sans-serif}.calyr-burger{position:fixed;top:18px;right:18px;z-index:2147483646;width:48px;height:48px;padding:0;border:1px solid rgba(255,255,255,.4);border-radius:0;background:#050505;display:grid;place-content:center;gap:5px;cursor:pointer}.calyr-burger i{display:block;width:20px;height:1px;background:#fff}.calyr-shade{position:fixed;inset:0;z-index:2147483645;background:rgba(0,0,0,.54)}.calyr-drawer{position:fixed;z-index:2147483647;inset:0 0 0 auto;width:min(430px,100vw);padding:24px 28px 30px;background:#050505;color:#fff;transform:translateX(102%);transition:transform .28s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column}.calyr-drawer.open{transform:none}.calyr-drawer header{display:flex;justify-content:space-between;align-items:center;padding-bottom:25px;border-bottom:1px solid #555}.calyr-drawer header a{color:#fff;text-decoration:none;font-size:23px}.calyr-drawer header button{border:0;background:transparent;color:#fff;font:300 34px/1 Arial;cursor:pointer}.calyr-drawer nav{display:grid}.calyr-drawer nav a{display:grid;grid-template-columns:38px 1fr;align-items:center;min-height:68px;border-bottom:1px solid #333;color:#aaa;text-decoration:none;font-size:10px;letter-spacing:.1em}.calyr-drawer nav strong{color:#fff;font-size:18px;letter-spacing:0;font-weight:500}.calyr-drawer nav a:hover strong,.calyr-drawer nav a:focus-visible strong{color:#23c7d5}.calyr-contact{margin-top:auto;padding-top:26px;display:grid;grid-template-columns:1fr 106px;gap:22px;align-items:end;color:#fff;text-decoration:none}.calyr-contact span{display:flex;flex-direction:column;gap:7px}.calyr-contact small{color:#23c7d5;letter-spacing:.12em}.calyr-contact strong{font-size:20px;font-weight:500}.calyr-contact em{font-size:10px;color:#999;font-style:normal;overflow-wrap:anywhere}.calyr-contact svg{width:106px;height:106px;background:#000}@media(max-width:600px){.calyr-burger{top:12px;right:12px;width:42px;height:42px}.calyr-drawer{padding:18px 20px 24px}.calyr-contact{grid-template-columns:1fr 88px}.calyr-contact svg{width:88px;height:88px}}`;
  document.head.append(style);
  document.body.append(shell);
  const burger = shell.querySelector('.calyr-burger');
  const drawer = shell.querySelector('.calyr-drawer');
  const shade = shell.querySelector('.calyr-shade');
  const close = shell.querySelector('header button');
  const setOpen = (open) => {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    shade.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  shade.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
})();
