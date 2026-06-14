"""LivingMesh triangle-grid interactive canvas — injected into every tile."""

LIVING_MESH_CSS = """\
		.study-section .living-surface { position: absolute; inset: 0; overflow: hidden; z-index: 1; opacity: 0.94; transition: opacity 220ms ease, transform 260ms ease; pointer-events: none; }
		.study-section .living-mesh { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; }
\t\t.study-section.is-open .living-surface { opacity: 0.96 !important; transform: scale(1.01); z-index: 1; mix-blend-mode: normal; pointer-events: none; }
\t\t.study-section.is-open .living-mesh { pointer-events: none; }"""

LIVING_MESH_SCRIPT = """<script>
(() => {
	const MATERIAL_BY_TILE = {
		theory:   { stiffness: 0.95, damping: 0.80, iridescence: 0.55, hue: 226 },
		projects: { stiffness: 1.15, damping: 0.86, iridescence: 0.62, hue: 198 },
		calyrai:  { stiffness: 0.72, damping: 0.50, iridescence: 0.78, hue: 252 },
		access:   { stiffness: 0.60, damping: 0.54, iridescence: 0.42, hue: 238 },
		engine:   { stiffness: 1.40, damping: 0.90, iridescence: 0.66, hue: 214 },
	};
	const hashSeed = (v) => {
		let h = 2166136261; const t = String(v || 'tile');
		for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
		return Math.abs(h >>> 0) + 1;
	};
	const seededRandom = (seed) => {
		let s = Math.max(1, seed % 2147483647);
		return () => { s = (s * 48271) % 2147483647; return s / 2147483647; };
	};
	const hashGrid = (x, y) => {
		const v = Math.sin((x||0)*127.1 + (y||0)*311.7) * 43758.5453123;
		return v - Math.floor(v);
	};
	const getTileConfig = (section) => {
		const id = section.dataset.nodeId || section.id || 'tile';
		const m = MATERIAL_BY_TILE[id] || { stiffness: 0.9, damping: 0.72, iridescence: 0.58, hue: 210 };
		return { id, seed: hashSeed(id), stiffness: m.stiffness, damping: m.damping, iridescence: m.iridescence, hue: m.hue };
	};
	const studyContent = document.querySelector('.study-content');
	class LivingMeshEngine {
		constructor(section, cfg) {
			this.section = section; this.config = cfg;
			this.mouse = { x: 0, y: 0, active: false };
			this.hoverMix = 0; this.reveal = 0; this.revealTarget = 0;
			this.nodes = []; this.cellFlip = []; this.microDots = [];
			this.textAttractors = []; this.textAttractorTimer = 0;
			this.mouseOverText = false; this.hoverPillKey = ''; this.hoverPillIsLink = false;
			this.lastOpenState = false;
			this.restSpring = 0.035 * cfg.stiffness; this.linkSpring = 0.0048 * cfg.stiffness;
			this.worldOffsetX = 0; this.worldOffsetY = 0; this.cellSize = 22;
			this.width = 0; this.height = 0; this.cols = 0; this.rows = 0;
			this.random = seededRandom(cfg.seed);
			let surface = section.querySelector('.living-surface');
			if (!(surface instanceof HTMLElement)) { surface = document.createElement('div'); surface.className = 'living-surface'; section.prepend(surface); }
			this.surface = surface;
			this.canvas = document.createElement('canvas'); this.canvas.className = 'living-mesh';
			this.surface.textContent = ''; this.surface.appendChild(this.canvas);
			this.ctx = this.canvas.getContext('2d', { alpha: true });
			this.resize(); this.syncWorldOffset(); this.bindEvents();
			if (typeof ResizeObserver !== 'undefined') { this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(section); }
		}
		syncWorldOffset() {
			const sr = this.section.getBoundingClientRect();
			const cr = studyContent instanceof HTMLElement ? studyContent.getBoundingClientRect() : { left: 0, top: 0 };
			this.worldOffsetX = sr.left - cr.left; this.worldOffsetY = sr.top - cr.top;
		}
		bindEvents() {
			const upd = (e) => { const r = this.section.getBoundingClientRect(); this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top; this.mouse.active = true; };
			const clr = () => { this.mouse.active = false; };
			this.section.addEventListener('pointermove', upd, { passive: true });
			this.canvas.addEventListener('pointermove', upd, { passive: true });
			this.section.addEventListener('pointerleave', clr, { passive: true });
			this.canvas.addEventListener('pointerleave', clr, { passive: true });
			this.canvas.addEventListener('click', (e) => {
				if (e.detail > 1) return;
				const r = this.canvas.getBoundingClientRect();
				this.injectImpulse(e.clientX - r.left, e.clientY - r.top, 40, 12);
			});
			this.canvas.addEventListener('dblclick', (e) => {
				e.preventDefault(); e.stopPropagation();
				const ats = window._activeTextSections; const emf = window._enforceMondrianState;
				if (ats && emf) { const was = ats.size === 1 && ats.has(this.section); ats.clear(); if (!was) ats.add(this.section); emf(); this.revealTarget = was ? 0 : 1; }
				this.injectImpulse(this.width * 0.5, this.height * 0.5, 34, 10);
			});
		}
		resize() {
			const r = this.section.getBoundingClientRect();
			const w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
			if (w === this.width && h === this.height && this.nodes.length) return;
			this.width = w; this.height = h;
			const ratio = window.devicePixelRatio || 1;
			this.canvas.width = Math.max(1, Math.floor(w * ratio));
			this.canvas.height = Math.max(1, Math.floor(h * ratio));
			this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
			if (this.ctx) this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			const ad = Math.max(0.65, Math.min(1.45, (w * h) / 98000));
			this.cellSize = Math.max(18, Math.min(30, Math.round(24 / ad)));
			this.syncWorldOffset(); this.initGrid(); this.refreshTextAttractors();
		}
		refreshTextAttractors() {
			const trigger = this.section.querySelector('.study-trigger');
			if (!(trigger instanceof HTMLElement)) { this.textAttractors = []; return; }
			const sr = this.section.getBoundingClientRect(); const pts = []; const maxPts = 140;
			const walker = document.createTreeWalker(trigger, NodeFilter.SHOW_TEXT, {
				acceptNode: (n) => {
					if (!n.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
					const p = n.parentElement;
					if (!(p instanceof HTMLElement)) return NodeFilter.FILTER_REJECT;
					const s = getComputedStyle(p);
					return (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
				}
			});
			let tn = walker.nextNode();
			while (tn && pts.length < maxPts) {
				const par = tn.parentElement;
				const chip = par instanceof HTMLElement ? par.closest('.study-keyword,.study-detail-link') : null;
				const chipKey = chip instanceof HTMLElement ? (chip.textContent||'').trim().toLowerCase().replace(/\\s+/g,'-') : '';
				const chipIsLink = chip instanceof HTMLAnchorElement || !!(chip instanceof HTMLElement && chip.closest('a'));
				const chipKind = chip instanceof HTMLElement ? (chip.classList.contains('study-keyword') ? 'pill' : 'link') : 'text';
				const range = document.createRange(); range.selectNodeContents(tn);
				for (const rect of range.getClientRects()) {
					if (pts.length >= maxPts || !rect || rect.width < 6 || rect.height < 8) continue;
					const y = rect.top + rect.height * 0.62 - sr.top;
					for (let x = rect.left + 4; x <= rect.right - 4 && pts.length < maxPts; x += 20)
						pts.push({ x: x - sr.left, y, kind: chipKind, key: chipKey, isLink: chipIsLink });
				}
				tn = walker.nextNode();
			}
			this.textAttractors = pts;
		}
		initGrid() {
			this.nodes = []; this.cellFlip = []; this.microDots = [];
			const sx = this.cellSize, sy = this.cellSize;
			const mx = ((this.worldOffsetX % sx) + sx) % sx, my = ((this.worldOffsetY % sy) + sy) % sy;
			const xPos = [], yPos = [];
			for (let x = -mx + sx * 0.5; x <= this.width + sx * 0.5; x += sx) xPos.push(x);
			for (let y = -my + sy * 0.5; y <= this.height + sy * 0.5; y += sy) yPos.push(y);
			const ea = (arr, mn, mx2) => { const eps = 0.001; if (!arr.length || Math.abs(arr[0]-mn)>eps) arr.unshift(mn); if (Math.abs(arr[arr.length-1]-mx2)>eps) arr.push(mx2); arr.sort((a,b)=>a-b); };
			ea(xPos, 0, this.width); ea(yPos, 0, this.height);
			this.cols = xPos.length; this.rows = yPos.length;
			for (let row = 0; row < this.rows; row++) {
				for (let col = 0; col < this.cols; col++) {
					const ox = xPos[col], oy = yPos[row];
					const gc = Math.floor((this.worldOffsetX + ox) / sx), gr = Math.floor((this.worldOffsetY + oy) / sy);
					const pinned = col===0||row===0||col===this.cols-1||row===this.rows-1;
					const ja = sx * 0.12;
					const jx = pinned ? 0 : (hashGrid(gc+17,gr+23)-0.5)*ja;
					const jy = pinned ? 0 : (hashGrid(gc+53,gr+71)-0.5)*ja;
					this.nodes.push({ ox: ox+jx, oy: oy+jy, x: ox+jx, y: oy+jy, vx: 0, vy: 0, pinned, globalCol: gc, globalRow: gr, hueOffset: this.random()*1.2 });
				}
			}
			for (let row = 0; row < this.rows-1; row++) {
				for (let col = 0; col < this.cols-1; col++) {
					const n = this.nodes[row*this.cols+col];
					this.cellFlip.push(hashGrid(n.globalCol+5,n.globalRow+9)>0.47?1:0);
				}
			}
			const dc = Math.max(16, Math.min(56, Math.round((this.width*this.height)/5200)));
			for (let i = 0; i < dc; i++) this.microDots.push({ x: this.random()*this.width, y: this.random()*this.height, size: 0.35+this.random()*0.95, alpha: 0.08+this.random()*0.22, phase: this.random()*Math.PI*2 });
		}
		injectImpulse(px, py, radius, strength) {
			const r2 = radius*radius;
			for (const n of this.nodes) { const dx=n.x-px,dy=n.y-py,d2=dx*dx+dy*dy; if(d2>=r2) continue; const d=Math.sqrt(d2)||1,f=(1-d/radius)*strength; n.vx+=(dx/d)*f*0.02; n.vy+=(dy/d)*f*0.024; }
		}
		applyMouseForce(node) {
			if (!this.mouse.active) return;
			const dx=this.mouse.x-node.x, dy=this.mouse.y-node.y, dist=Math.hypot(dx,dy);
			if (dist>=210) return;
			const t=(210-dist)/210, force=t*t;
			const openBoost=this.section.classList.contains('is-open')?1.15:1;
			const textBoost=this.mouseOverText?1.85:1.2;
			const repel=0.038*openBoost*textBoost;
			node.vx-=dx*force*repel; node.vy-=dy*force*(repel*1.05);
		}
		applyTextForce(node) {
			if (!this.textAttractors.length) return;
			const rep=this.mouse.active&&this.mouseOverText, hk=this.hoverPillKey, hasPill=!!hk;
			for (const t of this.textAttractors) {
				const dx=t.x-node.x, dy=t.y-node.y, dist=Math.hypot(dx,dy);
				if (dist>=95||dist<0.001) continue;
				const tv=1-dist/95; let dir=rep?-1:1, mag=tv*tv*(0.007+this.reveal*0.01);
				if (hasPill&&(t.kind==='pill'||t.kind==='link')) { const same=t.key===hk; dir=t.isLink?(same?1.6:-1.2):(same?-1.8:-1.15); mag*=t.isLink?(same?2.3:1.55):(same?2.4:1.35); }
				else if (t.kind==='pill'&&!t.isLink) { dir=-1; mag*=1.25; }
				node.vx+=dx*mag*dir; node.vy+=dy*mag*1.02*dir;
			}
		}
		updateTextHoverState() {
			if (!this.mouse.active) { this.mouseOverText=false; this.hoverPillKey=''; this.hoverPillIsLink=false; return; }
			const rect=this.section.getBoundingClientRect();
			const el=document.elementFromPoint(rect.left+this.mouse.x, rect.top+this.mouse.y);
			if (!(el instanceof HTMLElement)||!this.section.contains(el)) { this.mouseOverText=false; this.hoverPillKey=''; this.hoverPillIsLink=false; return; }
			const tn2=el.closest('.study-heading,.study-teaser,.study-paragraph,.study-keyword,.study-detail-link');
			this.mouseOverText=!!tn2;
			const pn=el.closest('.study-keyword,.study-detail-link');
			if (pn instanceof HTMLElement) { this.hoverPillKey=(pn.textContent||'').trim().toLowerCase().replace(/\\s+/g,'-'); this.hoverPillIsLink=pn instanceof HTMLAnchorElement||!!pn.closest('a'); }
			else { this.hoverPillKey=''; this.hoverPillIsLink=false; }
		}
		textInfluenceAt(x, y, radius=44) {
			let inf=0;
			for (const t of this.textAttractors) { const d=Math.hypot(t.x-x,t.y-y); if(d<radius){ const tv=1-d/radius; if(tv>inf) inf=tv; } }
			return inf;
		}
		update(dt, timeSec) {
			if (!this.ctx) return;
			const isOpen=this.section.classList.contains('is-open');
			if (isOpen!==this.lastOpenState) { this.lastOpenState=isOpen; this.textAttractorTimer=0; }
			this.textAttractorTimer-=dt;
			if (this.textAttractorTimer<=0) { this.refreshTextAttractors(); this.textAttractorTimer=isOpen?0.2:0.45; }
			this.revealTarget=isOpen?1:0;
			this.reveal+=(this.revealTarget-this.reveal)*Math.min(1,dt*9.5);
			this.hoverMix+=((this.mouse.active?1:0)-this.hoverMix)*Math.min(1,dt*16);
			const damping=Math.max(0.78,this.config.damping), cols=this.cols, rows=this.rows, step=Math.min(0.035,dt);
			const sb=this.mouse.active?1.28:1;
			for (const n of this.nodes) {
				if(n.pinned){n.vx=0;n.vy=0;n.x=n.ox;n.y=n.oy;continue;}
				n.vx+=(n.ox-n.x)*this.restSpring*sb; n.vy+=(n.oy-n.y)*this.restSpring*sb;
				this.applyMouseForce(n);
				if(this.reveal>0.05) this.applyTextForce(n);
			}
			for (let row=0;row<rows;row++) for (let col=0;col<cols;col++) {
				const idx=row*cols+col, a=this.nodes[idx];
				if(col<cols-1){const b=this.nodes[idx+1],dx=b.x-a.x,dy=b.y-a.y;a.vx+=dx*this.linkSpring;a.vy+=dy*this.linkSpring;b.vx-=dx*this.linkSpring;b.vy-=dy*this.linkSpring;}
				if(row<rows-1){const b=this.nodes[idx+cols],dx=b.x-a.x,dy=b.y-a.y;a.vx+=dx*this.linkSpring;a.vy+=dy*this.linkSpring;b.vx-=dx*this.linkSpring;b.vy-=dy*this.linkSpring;}
			}
			for (const n of this.nodes) { if(n.pinned){n.vx=0;n.vy=0;n.x=n.ox;n.y=n.oy;continue;} n.vx*=damping;n.vy*=damping;n.x+=n.vx*(step*60);n.y+=n.vy*(step*60); }
			this.syncWorldOffset(); this.updateTextHoverState(); this.draw(timeSec);
		}
		draw(timeSec) {
			const ctx=this.ctx; ctx.clearRect(0,0,this.width,this.height);
			const isOpen=this.section.classList.contains('is-open');
			const wireRgb=isOpen?'28,36,54':'255,255,255';
			const openBoost=0.9+this.reveal*0.55, openFill=isOpen?0.08:(0.76+(1-this.reveal)*0.2);
			const lineVis=isOpen?1.0:(0.62+this.reveal*0.28), meshStroke=isOpen?2.2:1;
			const cx=this.width*0.5, cy=this.height*0.5, maxDist=Math.max(1,Math.hypot(cx,cy));
			const nodes2d=new Array(this.nodes.length);
			const ox=this.worldOffsetX, oy=this.worldOffsetY;
			for (let i=0;i<this.nodes.length;i++) {
				const n=this.nodes[i],dx=n.x-cx,dy=n.y-cy,dist=Math.hypot(dx,dy)||1,ux=dx/dist,uy=dy/dist;
				const rp=this.reveal*14*Math.max(0,1-dist/(Math.max(this.width,this.height)*0.56));
				const px=n.x+ux*rp,py=n.y+uy*rp,gx=px+ox,gy=py+oy;
				const wave=Math.sin(gx*0.016+timeSec*1.12)*Math.cos(gy*0.013-timeSec*0.93);
				const stream=Math.sin((gx+gy)*0.008+timeSec*0.48)*0.4;
				let ml=0; if(this.mouse.active){const md=Math.hypot(px-this.mouse.x,py-this.mouse.y);if(md<180)ml=(1-md/180)*3.8;}
				nodes2d[i]={x:px,y:py,h:(wave+stream)*(0.85+this.config.iridescence)+ml};
			}
			const light={x:-0.32,y:-0.42,z:0.85}, hueBase=Number(this.config.hue||210);
			ctx.lineJoin='round';
			const drawTri=(a,b,c,hj=0)=>{
				const ux=b.x-a.x,uy=b.y-a.y,uz=b.h-a.h,vx=c.x-a.x,vy=c.y-a.y,vz=c.h-a.h;
				const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nLen=Math.hypot(nx,ny,nz)||1;
				const dot=Math.max(0,(nx*light.x+ny*light.y+nz*light.z)/nLen),shade=0.38+dot*0.62;
				const avgH=(a.h+b.h+c.h)/3,hue=hueBase+hj+avgH*5.5+this.config.iridescence*10;
				const sat=66+this.config.iridescence*10, lum=40+shade*24;
				const cxT=(a.x+b.x+c.x)/3,cyT=(a.y+b.y+c.y)/3;
				let att=0; if(this.mouse.active){const md=Math.hypot(cxT-this.mouse.x,cyT-this.mouse.y);if(md<185)att=1-md/185;}
				const rfl=Math.pow(att,1.35)*this.hoverMix;
				const baseA=(0.62+shade*0.28+att*0.07+rfl*0.13)*openBoost*openFill;
				const alpha=isOpen?Math.min(0.04,baseA*0.16):baseA;
				ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();
				if(!isOpen){ctx.fillStyle=`hsla(${hue.toFixed(1)},${sat.toFixed(1)}%,${lum.toFixed(1)}%,${alpha.toFixed(3)})`;ctx.fill();const tsa=(0.28+shade*0.22+att*0.22+rfl*0.24)*lineVis*meshStroke;ctx.strokeStyle=`rgba(255,255,255,${Math.min(0.995,tsa).toFixed(3)})`;ctx.lineWidth=0.26+rfl*0.2;ctx.stroke();}
				if(att>0.01){const g=ctx.createRadialGradient(cxT,cyT,0,cxT,cyT,42+rfl*22);g.addColorStop(0,`rgba(255,255,255,${(0.2*att+rfl*0.38).toFixed(3)})`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fill();}
			};
			let fi=0;
			for (let row=0;row<this.rows-1;row++) for(let col=0;col<this.cols-1;col++){
				const i=row*this.cols+col,a=nodes2d[i],b=nodes2d[i+1],c=nodes2d[i+this.cols],d=nodes2d[i+this.cols+1],flip=this.cellFlip[fi++]||0;
				flip?(drawTri(a,b,d,-1.1),drawTri(a,d,c,0.9)):(drawTri(a,b,c,-0.8),drawTri(b,d,c,1.0));
			}
			ctx.beginPath();
			for(let row=0;row<this.rows;row++) for(let col=0;col<this.cols;col++){
				const i=row*this.cols+col,a=nodes2d[i];
				if(col<this.cols-1&&(row+col)%2===0){const b=nodes2d[i+1];ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
				if(row<this.rows-1&&(row+col)%2===1){const b=nodes2d[i+this.cols];ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}
			}
			ctx.strokeStyle=`rgba(${wireRgb},${Math.min(0.94,isOpen?0.62:((0.28+this.config.iridescence*0.1)*lineVis*meshStroke)).toFixed(3)})`;
			ctx.lineWidth=isOpen?0.38:0.2; ctx.stroke();
			for(const dot of this.microDots){ctx.beginPath();ctx.arc(dot.x,dot.y,dot.size,0,Math.PI*2);ctx.fillStyle=`rgba(138,196,236,${Math.min(0.12,dot.alpha*(0.52-this.reveal*0.28)).toFixed(3)})`;ctx.fill();}
			for(const n of nodes2d){
				let pb=0,tb=0;
				if(this.mouse.active){const d=Math.hypot(n.x-this.mouse.x,n.y-this.mouse.y);if(d<170)pb=1-d/170;}
				if(this.reveal>0.05)tb=this.textInfluenceAt(n.x,n.y,38)*this.reveal;
				const br=0.42+pb*1.55+tb*1.15;
				ctx.beginPath();ctx.arc(n.x,n.y,br*1.35,0,Math.PI*2);ctx.fillStyle=`rgba(${wireRgb},${Math.min(0.96,(0.08+pb*0.22+tb*0.24)*lineVis*(isOpen?1.36:1)).toFixed(3)})`;ctx.fill();
				ctx.beginPath();ctx.arc(n.x,n.y,br,0,Math.PI*2);ctx.fillStyle=`rgba(${wireRgb},${Math.min(0.995,(0.18+pb*0.52+tb*0.4)*lineVis*(isOpen?1.32:1)).toFixed(3)})`;ctx.fill();
			}
			if(this.mouse.active||this.hoverMix>0.02){
				const mx=this.mouse.x,my=this.mouse.y,mR=168;
				const mg=ctx.createRadialGradient(mx,my,0,mx,my,mR);
				mg.addColorStop(0,`rgba(255,92,220,${(0.24*this.hoverMix).toFixed(3)})`);
				mg.addColorStop(0.5,`rgba(220,96,255,${(0.14*this.hoverMix).toFixed(3)})`);
				mg.addColorStop(1,'rgba(220,96,255,0)');
				ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,mR,0,Math.PI*2);ctx.fill();
				for(const n of nodes2d){const d=Math.hypot(n.x-mx,n.y-my);if(d>=170)continue;const nr=(1-d/170)*this.hoverMix,r=0.6+nr*2.05;ctx.beginPath();ctx.arc(n.x,n.y,r*1.3,0,Math.PI*2);ctx.fillStyle=`rgba(255,116,230,${((0.08+nr*0.28)*openBoost).toFixed(3)})`;ctx.fill();ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.fillStyle=`rgba(164,248,255,${((0.24+nr*0.8)*openBoost).toFixed(3)})`;ctx.fill();}
			}
		}
	}
	const livingMeshes = [];
	document.querySelectorAll('.study-section').forEach((section) => {
		if (!(section instanceof HTMLElement)) return;
		if (section.dataset.tileKind === 'visit_card') return;
		livingMeshes.push(new LivingMeshEngine(section, getTileConfig(section)));
	});
	let _last = performance.now();
	const _frame = (now) => {
		const dt = Math.min(0.034, Math.max(0.001, (now - _last) / 1000));
		_last = now;
		for (const engine of livingMeshes) engine.update(dt, now / 1000);
		requestAnimationFrame(_frame);
	};
	requestAnimationFrame(_frame);
})();
</script>"""
