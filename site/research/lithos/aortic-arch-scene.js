(function exposeAorticArchScene(global) {
  'use strict';

  const TAU = Math.PI * 2;
  const MAIN_RINGS = 18;
  const MAIN_SIDES = 12;
  const BRANCH_RINGS = 7;
  const BRANCH_SIDES = 6;
  const LANDING_MESH = [[226, 236, 240], [255, 255, 255], [168, 194, 204], [205, 225, 232]];

  const cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  });

  const normalize = (v) => {
    const length = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / length, y: v.y / length, z: v.z / length };
  };

  class CatmullRomSpline {
    constructor(points) {
      this.points = points;
    }

    at(t) {
      const count = this.points.length;
      const scaled = Math.max(0, Math.min(.999999, t)) * (count - 1);
      const segment = Math.floor(scaled);
      const u = scaled - segment;
      const p0 = this.points[Math.max(0, segment - 1)];
      const p1 = this.points[segment];
      const p2 = this.points[Math.min(count - 1, segment + 1)];
      const p3 = this.points[Math.min(count - 1, segment + 2)];
      const uu = u * u;
      const uuu = uu * u;
      const blend = (a, b, c, d) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * uu + (-a + 3 * b - 3 * c + d) * uuu);
      return {
        x: blend(p0.x, p1.x, p2.x, p3.x),
        y: blend(p0.y, p1.y, p2.y, p3.y),
        z: blend(p0.z, p1.z, p2.z, p3.z)
      };
    }

    samples(count = 80) {
      return Array.from({ length: count }, (_, index) => this.at(index / (count - 1)));
    }
  }

  class AorticArchModel {
    constructor() {
      this.mainPoints = [
        { x: -1.25, y: -1.72, z: -.04 }, { x: -1.18, y: -.82, z: 0 },
        { x: -.48, y: -.48, z: .03 }, { x: -.03, y: .55, z: .08 },
        { x: .92, y: .52, z: .12 }, { x: 1.48, y: .28, z: .04 },
        { x: 1.88, y: -.92, z: -.09 }, { x: 1.94, y: -1.62, z: -.13 }
      ];
      this.outlets = [
        { at: .225, controls: [{ x: -1.78, y: .18, z: -.02 }, { x: -2.55, y: 1.12, z: -.12 }] },
        { at: .405, controls: [{ x: .18, y: 1.28, z: .11 }, { x: .56, y: 2.18, z: .08 }] },
        { at: .66, controls: [{ x: 2.08, y: .9, z: .02 }, { x: 3.05, y: 1.78, z: -.08 }] }
      ];
      this.rebuild();
    }

    get mainSpline() { return new CatmullRomSpline(this.mainPoints); }

    handles() {
      const anchors = [this.mainPoints[0], this.mainPoints[7], ...this.outlets.map((outlet) => outlet.controls[1])]
        .map((point) => ({ point, type: 'anchor' }));
      const curves = [this.mainPoints[2], this.mainPoints[3], this.mainPoints[5], ...this.outlets.map((outlet) => outlet.controls[0])]
        .map((point) => ({ point, type: 'curve' }));
      return [...anchors, ...curves];
    }

    addTube(mesh, spline, rings, sides, radius, seed = 0) {
      const offset = mesh.nodes.length;
      for (let ring = 0; ring < rings; ring += 1) {
        const t = ring / (rings - 1);
        const center = spline.at(t);
        const sample = spline.at(t < .999 ? t + .001 : t - .001);
        const direction = t < .999 ? 1 : -1;
        const tangent = normalize({ x: (sample.x - center.x) * direction, y: (sample.y - center.y) * direction, z: (sample.z - center.z) * direction });
        let n1 = normalize(cross(tangent, { x: 0, y: 0, z: 1 }));
        if (Math.hypot(n1.x, n1.y, n1.z) < .1) n1 = { x: 1, y: 0, z: 0 };
        const n2 = normalize(cross(tangent, n1));
        const localRadius = typeof radius === 'function' ? radius(t) : radius;
        for (let side = 0; side < sides; side += 1) {
          const angle = side / sides * TAU;
          const organic = 1 + .11 * Math.sin(side * 2.1 + ring * 1.37 + seed) + .055 * Math.cos(side * 3.7 - ring * .83 + seed);
          const ripple = .035 * Math.sin(ring * 2.4 + side * 1.6 + seed);
          mesh.nodes.push({
            x: center.x + localRadius * organic * (n1.x * Math.cos(angle) + n2.x * Math.sin(angle)) + ripple,
            y: center.y + localRadius * organic * (n1.y * Math.cos(angle) + n2.y * Math.sin(angle)) + ripple * .4,
            z: center.z + localRadius * organic * (n1.z * Math.cos(angle) + n2.z * Math.sin(angle)) - ripple * .7
          });
        }
      }
      for (let ring = 0; ring < rings - 1; ring += 1) {
        for (let side = 0; side < sides; side += 1) {
          const next = (side + 1) % sides;
          const a = offset + ring * sides + side;
          const b = offset + ring * sides + next;
          const c = offset + (ring + 1) * sides + next;
          const d = offset + (ring + 1) * sides + side;
          mesh.triangles.push([a, b, c], [a, c, d]);
        }
      }
      mesh.splines.push(spline.samples());
      return { baseRing: Array.from({ length: sides }, (_, index) => offset + index), nodeCount: rings * sides };
    }

    weld(mesh, branch, mainNodeCount) {
      const available = new Set(Array.from({ length: mainNodeCount }, (_, index) => index));
      const replacements = new Map();
      branch.baseRing.forEach((baseIndex) => {
        const base = mesh.nodes[baseIndex];
        let nearest = -1;
        let distance = Infinity;
        available.forEach((mainIndex) => {
          const candidate = mesh.nodes[mainIndex];
          const d = (base.x - candidate.x) ** 2 + (base.y - candidate.y) ** 2 + (base.z - candidate.z) ** 2;
          if (d < distance) { distance = d; nearest = mainIndex; }
        });
        if (nearest >= 0) { replacements.set(baseIndex, nearest); available.delete(nearest); }
      });
      mesh.triangles.forEach((triangle) => triangle.forEach((nodeIndex, index) => {
        if (replacements.has(nodeIndex)) triangle[index] = replacements.get(nodeIndex);
      }));
    }

    buildSurface() {
      const mesh = { nodes: [], triangles: [], splines: [] };
      const main = this.addTube(mesh, this.mainSpline, MAIN_RINGS, MAIN_SIDES, (t) => .5 - .055 * t + .07 * Math.sin(Math.PI * t), 1);
      this.outlets.forEach((outlet, index) => {
        const center = this.mainSpline.at(outlet.at);
        const direction = normalize({ x: outlet.controls[0].x - center.x, y: outlet.controls[0].y - center.y, z: outlet.controls[0].z - center.z });
        const base = { x: center.x + direction.x * .46, y: center.y + direction.y * .46, z: center.z + direction.z * .46 };
        const branch = this.addTube(mesh, new CatmullRomSpline([base, ...outlet.controls]), BRANCH_RINGS, BRANCH_SIDES, (t) => .17 - .018 * t + .008 * Math.sin(Math.PI * t), index * 2.3);
        this.weld(mesh, branch, main.nodeCount);
      });
      return mesh;
    }

    buildStent() {
      const rings = 24;
      const sides = 12;
      const nodes = [];
      const spline = this.mainSpline;
      for (let ring = 0; ring < rings; ring += 1) {
        const t = ring / (rings - 1);
        const center = spline.at(t);
        const sample = spline.at(t < .999 ? t + .001 : t - .001);
        const direction = t < .999 ? 1 : -1;
        const tangent = normalize({ x: (sample.x - center.x) * direction, y: (sample.y - center.y) * direction, z: (sample.z - center.z) * direction });
        let n1 = normalize(cross(tangent, { x: 0, y: 0, z: 1 }));
        if (Math.hypot(n1.x, n1.y, n1.z) < .1) n1 = { x: 1, y: 0, z: 0 };
        const n2 = normalize(cross(tangent, n1));
        const radius = .345 - .025 * t;
        for (let side = 0; side < sides; side += 1) {
          const angle = side / sides * TAU;
          nodes.push({ x: center.x + radius * (n1.x * Math.cos(angle) + n2.x * Math.sin(angle)), y: center.y + radius * (n1.y * Math.cos(angle) + n2.y * Math.sin(angle)), z: center.z + radius * (n1.z * Math.cos(angle) + n2.z * Math.sin(angle)) });
        }
      }
      return { nodes, rings, sides };
    }

    rebuild() {
      this.surface = this.buildSurface();
      this.stent = this.buildStent();
    }
  }

  class AorticArchScene {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.model = new AorticArchModel();
      this.mode = options.mode === 'bridge' ? 'bridge' : 'aorta';
      const orientation = options.transitionState?.orientation || { tilt: 0, yaw: 0 };
      this.rotationX = -.04 + orientation.tilt * .18;
      this.rotationY = -.08 + orientation.yaw * .24;
      this.zoom = 1;
      this.reducedMotion = global.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
      this.dragging = false;
      this.activeHandle = null;
      this.keyboardHandleIndex = -1;
      this.framePending = false;
      this.renderFrame = null;
      this.destroyed = false;
      this.lowQuality = false;
      this.lastPointer = { x: 0, y: 0 };
      this.transitionProgress = options.transitionState && !this.reducedMotion ? 0 : 1;
      this.transitionFrame = null;
      this.onModelChange = typeof options.onModelChange === 'function' ? options.onModelChange : null;
      this.bindEvents();
      this.resize();
      this.emitModelState();
      if (options.transitionState && !this.reducedMotion) this.startTransition();
    }

    emitModelState() {
      if (!this.onModelChange) return;
      this.onModelChange({
        mainPoints: this.model.mainPoints.map((point) => ({ ...point })),
        outlets: this.model.outlets.map((outlet) => ({
          at: outlet.at,
          controls: outlet.controls.map((point) => ({ ...point }))
        })),
        rotation: { x: this.rotationX, y: this.rotationY }
      });
    }

    startTransition() {
      const startedAt = performance.now();
      const tick = (now) => {
        const linear = Math.min(1, (now - startedAt) / 1450);
        this.transitionProgress = 1 - Math.pow(1 - linear, 3);
        this.requestRender();
        if (linear < 1) this.transitionFrame = requestAnimationFrame(tick);
      };
      this.transitionFrame = requestAnimationFrame(tick);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
      this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.requestRender();
    }

    rotate(point) {
      const cy = Math.cos(this.rotationY), sy = Math.sin(this.rotationY), cx = Math.cos(this.rotationX), sx = Math.sin(this.rotationX);
      const x = point.x * cy + point.z * sy;
      const z = -point.x * sy + point.z * cy;
      return { x, y: point.y * cx - z * sx, z: point.y * sx + z * cx };
    }

    project(point) {
      const width = this.canvas.clientWidth, height = this.canvas.clientHeight, perspective = 5.4;
      const scale = Math.min(width, height) * .17 * this.zoom * perspective / (perspective - point.z);
      return { x: width / 2 + point.x * scale, y: height * .54 - point.y * scale, z: point.z, scale };
    }

    projected(point) { return this.project(this.rotate(point)); }

    requestRender(rebuild = false) {
      this.rebuildPending ||= rebuild;
      if (this.framePending || this.destroyed || document.hidden) return;
      this.framePending = true;
      this.renderFrame = requestAnimationFrame(() => {
        if (this.destroyed) return;
        if (this.rebuildPending) this.model.rebuild();
        this.rebuildPending = false;
        this.framePending = false;
        this.draw();
      });
    }

    drawPath(points, path) {
      points.forEach((point, index) => index ? path.lineTo(point.x, point.y) : path.moveTo(point.x, point.y));
    }

    drawBridge() {
      const { ctx, model } = this;
      const spline = model.mainSpline;
      const progress = this.transitionProgress;
      const samples = spline.samples(72);
      const visible = Math.max(2, Math.floor((samples.length - 1) * progress) + 1);
      const shown = samples.slice(0, visible);
      const offsetPoint = (point, z, y = 0) => ({ x: point.x, y: point.y + y, z: point.z + z });
      const projectedLine = (points, style, width, shadow = 0) => {
        const path = new Path2D();
        this.drawPath(points.map((point) => this.projected(point)), path);
        ctx.save();
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (shadow) { ctx.shadowColor = 'rgba(170,225,242,.75)'; ctx.shadowBlur = shadow; }
        ctx.stroke(path);
        ctx.restore();
      };

      // The aortic centreline becomes a paired, gently cambered bridge deck.
      projectedLine(shown.map((point) => offsetPoint(point, -.22, -.02)), 'rgba(236,244,247,.96)', 7.2, 12);
      projectedLine(shown.map((point) => offsetPoint(point, .22, -.02)), 'rgba(255,255,255,.99)', 7.2, 12);
      projectedLine(shown.map((point) => offsetPoint(point, 0, .035)), 'rgba(6,13,17,.98)', 4.2);

      // Repeated transverse ribs translate the former stent rhythm into architecture.
      const ribCount = this.lowQuality ? 9 : 18;
      for (let index = 0; index < ribCount; index += 1) {
        const t = .04 + index / Math.max(1, ribCount - 1) * .92;
        if (t > progress) break;
        const center = spline.at(t);
        const crown = .16 + .11 * Math.sin(Math.PI * t);
        const rib = [
          offsetPoint(center, -.28, -.03),
          offsetPoint(center, -.18, crown * .72),
          offsetPoint(center, 0, crown),
          offsetPoint(center, .18, crown * .72),
          offsetPoint(center, .28, -.03),
        ];
        projectedLine(rib, index % 3 === 0 ? 'rgba(255,255,255,.96)' : 'rgba(194,218,226,.72)', index % 3 === 0 ? 1.8 : 1.05);
      }

      // Lean white pylons and fan cables give the bridge its sculptural gesture.
      const pylons = [
        { t: .2, lean: -.18, height: .72 },
        { t: .43, lean: .28, height: 1.48 },
        { t: .68, lean: -.1, height: .78 },
      ];
      pylons.forEach((spec, pylonIndex) => {
        if (spec.t > progress) return;
        const base = spline.at(spec.t);
        const tip = { x: base.x + spec.lean, y: base.y + spec.height, z: base.z };
        projectedLine([offsetPoint(base, -.23), offsetPoint(tip, -.04)], 'rgba(255,255,255,.98)', 4.2, 6);
        projectedLine([offsetPoint(base, .23), offsetPoint(tip, .04)], 'rgba(226,239,244,.9)', 3.2, 5);
        [-.22, -.16, -.1, .1, .16, .22].forEach((delta, cableIndex) => {
          const target = spline.at(Math.max(.02, Math.min(.98, spec.t + delta)));
          projectedLine([tip, offsetPoint(target, cableIndex % 2 ? .22 : -.22, -.01)], 'rgba(196,220,229,.68)', .85);
        });
        const footing = this.projected({ x: base.x, y: -1.88, z: base.z });
        const baseProjected = this.projected(base);
        const pier = new Path2D();
        pier.moveTo(baseProjected.x, baseProjected.y);
        pier.lineTo(footing.x, footing.y);
        ctx.save();
        ctx.strokeStyle = pylonIndex === 1 ? 'rgba(255,255,255,.82)' : 'rgba(172,198,208,.6)';
        ctx.lineWidth = pylonIndex === 1 ? 3 : 2;
        ctx.stroke(pier);
        ctx.restore();
      });
    }

    draw() {
      const { ctx, canvas, model } = this;
      const width = canvas.clientWidth, height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      const aura = ctx.createRadialGradient(width * .48, height * .47, 10, width * .48, height * .47, Math.min(width, height) * .48);
      aura.addColorStop(0, this.mode === 'bridge' ? 'rgba(151,222,240,.14)' : 'rgba(255,0,204,.11)');
      aura.addColorStop(.38, this.mode === 'bridge' ? 'rgba(65,118,144,.075)' : 'rgba(90,124,255,.065)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura; ctx.fillRect(0, 0, width, height);
      const points = model.surface.nodes.map((point) => this.projected(point));

      const stent = model.stent.nodes.map((point) => this.projected(point));
      const stentPath = new Path2D();
      const step = this.lowQuality ? 2 : 1;
      const visibleStentRings = Math.max(1, Math.floor((model.stent.rings - 1) * this.transitionProgress));
      for (let ring = 0; ring < visibleStentRings; ring += step) for (let side = 0; side < model.stent.sides; side += step) {
        const current = stent[ring * model.stent.sides + side];
        const a = stent[(ring + 1) * model.stent.sides + ((side + 1) % model.stent.sides)];
        const b = stent[(ring + 1) * model.stent.sides + ((side - 1 + model.stent.sides) % model.stent.sides)];
        stentPath.moveTo(current.x, current.y); stentPath.lineTo(a.x, a.y); stentPath.moveTo(current.x, current.y); stentPath.lineTo(b.x, b.y);
      }
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = this.mode === 'bridge' ? Math.max(.025, .28 * (1 - this.transitionProgress)) : 1;
      ctx.strokeStyle = this.mode === 'bridge' ? '#d9edf4' : '#ff00cc';
      ctx.shadowColor = this.mode === 'bridge' ? '#b7e8f3' : '#ff00cc';
      ctx.shadowBlur = this.lowQuality ? 0 : (this.mode === 'bridge' ? 7 : 10);
      ctx.lineWidth = this.mode === 'bridge' ? 1.05 : 1.35;
      ctx.stroke(stentPath);
      ctx.restore();

      if (this.lowQuality) {
        const fast = new Path2D();
        const visibleTriangles = Math.floor(model.surface.triangles.length * this.transitionProgress);
        for (let index = 0; index < visibleTriangles; index += 2) {
          const triangle = model.surface.triangles[index];
          fast.moveTo(points[triangle[0]].x, points[triangle[0]].y); fast.lineTo(points[triangle[1]].x, points[triangle[1]].y); fast.lineTo(points[triangle[2]].x, points[triangle[2]].y); fast.closePath();
        }
        ctx.strokeStyle = this.mode === 'bridge' ? 'rgba(170,220,232,.04)' : 'rgba(170,220,232,.34)'; ctx.lineWidth = .72; ctx.stroke(fast);
      } else {
        const visibleTriangles = Math.floor(model.surface.triangles.length * this.transitionProgress);
        model.surface.triangles.slice(0, visibleTriangles).map((indices) => ({ indices, depth: indices.reduce((sum, index) => sum + points[index].z, 0) / 3 })).sort((a, b) => a.depth - b.depth).forEach(({ indices, depth }, index) => {
          const path = new Path2D(); path.moveTo(points[indices[0]].x, points[indices[0]].y); path.lineTo(points[indices[1]].x, points[indices[1]].y); path.lineTo(points[indices[2]].x, points[indices[2]].y); path.closePath();
          const colorIndex = index % 17 === 0 ? 3 : index % 3;
          const color = LANDING_MESH[colorIndex];
          const light = Math.max(0, Math.min(1, (depth + 1.1) / 2.2));
          const reflective = .5 + .5 * Math.sin(index * 1.71 + depth * 2.4);
          const bridgeFade = this.mode === 'bridge' ? Math.max(.035, .34 * (1 - this.transitionProgress)) : 1;
          const fillAlpha = (.035 + light * .075 + reflective * .035) * bridgeFade;
          const edgeAlpha = (.23 + light * .23 + reflective * .09) * bridgeFade;
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${fillAlpha})`;
          ctx.fill(path);
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${edgeAlpha * .78})`;
          ctx.lineWidth = .48 + light * .58 + reflective * .18;
          ctx.stroke(path);
        });
      }

      if (this.mode === 'bridge') {
        this.drawBridge();
      } else {
        const splinePath = new Path2D();
        model.surface.splines.forEach((spline) => this.drawPath(spline.map((point) => this.projected(point)), splinePath));
        ctx.strokeStyle = '#ff00cc';
        ctx.shadowColor = '#ff00cc';
        ctx.shadowBlur = this.lowQuality ? 0 : 8;
        ctx.lineWidth = 2.4;
        ctx.stroke(splinePath);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, (this.transitionProgress - .35) / .65));
      model.handles().forEach((handle) => {
        const point = this.projected(handle.point), anchor = handle.type === 'anchor';
        ctx.beginPath(); ctx.arc(point.x, point.y, this.activeHandle?.point === handle.point ? 6.5 : 4.5, 0, TAU); ctx.fillStyle = this.mode === 'bridge' ? (anchor ? '#ffffff' : '#7ce8ff') : (anchor ? '#ff00cc' : '#00e5ff'); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    nearestHandle(pointer) {
      let result = null, min = 13;
      this.model.handles().forEach((handle) => {
        const point = this.projected(handle.point), distance = Math.hypot(pointer.x - point.x, pointer.y - point.y);
        if (distance < min) { min = distance; result = handle; }
      });
      return result;
    }

    bindEvents() {
      this.onDown = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.focus({ preventScroll: true });
        this.dragging = true; this.lowQuality = true; this.lastPointer = { x: event.clientX, y: event.clientY };
        this.activeHandle = this.nearestHandle({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        this.canvas.setPointerCapture?.(event.pointerId); this.requestRender();
      };
      this.onMove = (event) => {
        if (!this.dragging) return;
        const dx = event.clientX - this.lastPointer.x, dy = event.clientY - this.lastPointer.y;
        if (this.activeHandle) {
          const projected = this.projected(this.activeHandle.point);
          this.activeHandle.point.x += dx / projected.scale;
          this.activeHandle.point.y -= dy / projected.scale;
          this.requestRender(true);
          this.emitModelState();
        } else {
          this.rotationY += dx * .009;
          this.rotationX += dy * .009;
          this.requestRender();
          this.emitModelState();
        }
        this.lastPointer = { x: event.clientX, y: event.clientY };
      };
      this.onUp = () => { this.dragging = false; this.lowQuality = false; this.activeHandle = null; this.requestRender(); };
      this.onWheel = (event) => { event.preventDefault(); this.zoom = Math.max(.72, Math.min(1.5, this.zoom - event.deltaY * .001)); this.requestRender(); };
      this.onKeyDown = (event) => {
        const handles = this.model.handles();
        const key = event.key.toLowerCase();
        let handled = true;
        if (event.key === '[' || event.key === ']') {
          const direction = event.key === ']' ? 1 : -1;
          this.keyboardHandleIndex = (this.keyboardHandleIndex + direction + handles.length) % handles.length;
          this.activeHandle = handles[this.keyboardHandleIndex];
        } else if (['w', 'a', 's', 'd'].includes(key) && this.activeHandle) {
          const delta = .08;
          if (key === 'a') this.activeHandle.point.x -= delta;
          if (key === 'd') this.activeHandle.point.x += delta;
          if (key === 'w') this.activeHandle.point.y += delta;
          if (key === 's') this.activeHandle.point.y -= delta;
          this.model.rebuild();
          this.emitModelState();
        } else if (event.key === 'ArrowLeft') this.rotationY -= .08;
        else if (event.key === 'ArrowRight') this.rotationY += .08;
        else if (event.key === 'ArrowUp') this.rotationX -= .08;
        else if (event.key === 'ArrowDown') this.rotationX += .08;
        else if (event.key === '+' || event.key === '=') this.zoom = Math.min(1.5, this.zoom + .08);
        else if (event.key === '-' || event.key === '_') this.zoom = Math.max(.72, this.zoom - .08);
        else if (event.key === 'Escape') { this.keyboardHandleIndex = -1; this.activeHandle = null; }
        else handled = false;
        if (!handled) return;
        event.preventDefault();
        event.stopPropagation();
        if (!['w', 'a', 's', 'd'].includes(key)) this.emitModelState();
        this.requestRender();
      };
      this.onVisibility = () => { if (!document.hidden) this.requestRender(); };
      this.onResize = () => this.resize();
      this.canvas.addEventListener('pointerdown', this.onDown);
      this.canvas.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('pointermove', this.onMove);
      window.addEventListener('pointerup', this.onUp);
      this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
      document.addEventListener('visibilitychange', this.onVisibility);
      if (typeof ResizeObserver === 'function') {
        this.resizeObserver = new ResizeObserver(this.onResize);
        this.resizeObserver.observe(this.canvas);
      } else {
        window.addEventListener('resize', this.onResize);
      }
    }

    destroy() {
      this.destroyed = true;
      if (this.transitionFrame) cancelAnimationFrame(this.transitionFrame);
      if (this.renderFrame) cancelAnimationFrame(this.renderFrame);
      this.resizeObserver?.disconnect();
      this.canvas.removeEventListener('pointerdown', this.onDown);
      this.canvas.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
      this.canvas.removeEventListener('wheel', this.onWheel);
      document.removeEventListener('visibilitychange', this.onVisibility);
      window.removeEventListener('resize', this.onResize);
    }
  }

  global.AorticArchScene = AorticArchScene;
})(window);
