(() => {
  document.title = document.title.replace('SBPA', 'SbpA');
  const platformName = document.querySelector('.topbar strong');
  if (platformName) platformName.textContent = 'SbpA-NANO';
  const title = document.querySelector('.intro h1');
  if (title) title.innerHTML = 'Calcium-Controlled<br>SbpA Assembly';
  const subtitle = document.querySelector('.subtitle');
  if (subtitle) subtitle.innerHTML = 'SbpA as structural reference model<br>for calcium-dependent crystal growth';
  const footerBrand = document.querySelector('.footer .brand span:last-child');
  if (footerBrand) footerBrand.innerHTML = 'SbpA-NANO<br><small>ASSEMBLY MODEL</small>';
  const referenceLink = document.querySelector('.cover-link');
  if (referenceLink) {
    referenceLink.href = 'https://doi.org/10.1016/0927-7757(95)03190-O';
    referenceLink.innerHTML = 'PUM &amp; SLEYTR · 1995<br>ANISOTROPIC SbpA CRYSTAL GROWTH ↗';
  }
  const host = document.querySelector('.visual');
  if (!host) return;
  host.setAttribute('aria-label', 'Interactive calcium-dependent SbpA assembly morphology');
  const canvas = document.createElement('canvas');
  canvas.className = 'assembly-canvas';
  canvas.setAttribute('aria-label', 'Interactive calcium-dependent SbpA assembly morphology');
  host.prepend(canvas);
  const control = document.createElement('label');
  control.className = 'calcium-control';
  control.innerHTML = '<span>Ca²⁺ concentration</span><input type="range" min="0" max="100" value="34" aria-label="Calcium concentration"><output>LOW · FRACTAL-LIKE</output>';
  host.append(control);
  const note = document.createElement('div');
  note.className = 'assembly-note';
  note.innerHTML = '<strong>PUM &amp; SLEYTR · 1995</strong><span>Low Ca²⁺ → branched clusters · higher Ca²⁺ → compact p4 crystal patches</span>';
  host.append(note);
  const ctx = canvas.getContext('2d');
  const slider = control.querySelector('input'), output = control.querySelector('output');
  let target = Number(slider.value)/100, calcium = target, time = 0;
  slider.addEventListener('input', () => {
    target = Number(slider.value)/100;
    output.textContent = target < .38 ? 'LOW · FRACTAL-LIKE' : target < .7 ? 'TRANSITION' : 'HIGH · COMPACT p4';
  });
  const rand = n => { const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  const particles = Array.from({length:1350},(_,i)=>{
    const arm=i%11, depth=Math.floor(i/11), a=arm*Math.PI*2/11+(rand(i)-.5)*.22;
    const r=8+depth*2.05, fork=(rand(i+90)-.5)*Math.pow(depth,1.04)*1.15;
    const fx=Math.cos(a)*r-Math.sin(a)*fork, fy=Math.sin(a)*r+Math.cos(a)*fork;
    const side=Math.ceil(Math.sqrt(1350)), gx=(i%side-side/2)*8.4, gy=(Math.floor(i/side)-side/2)*8.4;
    return {fx,fy,gx,gy,phase:rand(i+400)*Math.PI*2};
  });
  const resize=()=>{const d=Math.min(devicePixelRatio,1.5),w=host.clientWidth,h=host.clientHeight;canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+'px';canvas.style.height=h+'px'};
  new ResizeObserver(resize).observe(host); resize();
  const draw=()=>{
    time+=.012; calcium+=(target-calcium)*.045;
    const w=canvas.width,h=canvas.height,s=Math.min(w,h)/620;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(w*.52,h*.48);ctx.scale(s,s);
    ctx.strokeStyle='rgba(255,212,0,.11)';ctx.lineWidth=.7/s;
    for(let x=-310;x<=310;x+=28){ctx.beginPath();ctx.moveTo(x,-260);ctx.lineTo(x,260);ctx.stroke()}
    for(let y=-260;y<=260;y+=28){ctx.beginPath();ctx.moveTo(-340,y);ctx.lineTo(340,y);ctx.stroke()}
    const morph=calcium*calcium*(3-2*calcium), visible=Math.floor(480+870*(.5+.5*Math.sin(time*.23)));
    particles.forEach((p,i)=>{if(i>visible)return;const pulse=Math.sin(time+p.phase)*(.8-calcium)*2;const x=p.fx*(1-morph)+p.gx*morph+pulse,y=p.fy*(1-morph)+p.gy*morph-pulse*.4;const alpha=.28+.68*(1-i/particles.length);ctx.fillStyle=`rgba(255,212,0,${alpha})`;ctx.beginPath();ctx.arc(x,y,1.25+calcium*.9,0,Math.PI*2);ctx.fill();if(i%29===0){ctx.strokeStyle=`rgba(255,255,255,${.12+.25*(1-calcium)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rand(i)-.5)*18,y+(rand(i+3)-.5)*18);ctx.stroke()}});
    ctx.restore();requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();
