export default class LogoCanvasEngine {
  #resizeListenerAttached = false

  #fract(v) {
    return v - Math.floor(v)
  }

  #hash2(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
    return this.#fract(s)
  }

  #gaussian(x, sigma) {
    return Math.exp(-(x * x) / (2 * sigma * sigma))
  }

  #angleDiff(a, b) {
    let d = a - b
    while (d > Math.PI) d -= Math.PI * 2
    while (d < -Math.PI) d += Math.PI * 2
    return d
  }

  constructor(canvas, config = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config

    this.state = config?.interaction?.initialState || 'idle'
    this.prevState = this.state
    this.rafId = null
    this.startTime = performance.now()
    this.stateSinceTs = performance.now()
    this.transitionStartTs = performance.now()
    this.stateTransitionMs = Number(config?.interaction?.stateTransitionMs) || 1200

    this.width = 1
    this.height = 1
    this.gridDots = []
    this.ringTargets = []
    this.qrTargets = []
    this.qrLayout = null
    this.particles = []
    this.qrModuleSizeNorm = 0
    this.canvasOffsetX = 0
    this.canvasOffsetY = 0
    this.qrMatrixSource = config?.qrMatrix || null

    this.ringCenterX = Number.isFinite(config?.ring?.centerX) ? config.ring.centerX : 0.5
    this.ringCenterY = Number.isFinite(config?.ring?.centerY) ? config.ring.centerY : 0.525
    this.ringRadius = Number.isFinite(config?.ring?.radius) ? config.ring.radius : 0.335
    this.ringThickness = Number.isFinite(config?.ring?.thickness) ? config.ring.thickness : 0.052

    this.constellations = []
    this.constellationCycle = { patternIndex: -1, startT: -999, nextAt: 5 + this.#hash2(7.3, 2.1) * 5, duration: 2.8 }

    this.resize = this.resize.bind(this)
    this.render = this.render.bind(this)
    this.#resizeListenerAttached = false

    this.#buildGridDots()
    this.#buildQrTargets(this.qrMatrixSource)
    if (this.#syncRingCenterToQr()) {
      this.#buildRingTargets()
    } else {
      this.#buildRingTargets()
    }
    this.#buildConstellations()
    this.#initParticles()

    window.addEventListener('resize', this.resize)
    this.#resizeListenerAttached = true
    this.resize()
    this.rafId = requestAnimationFrame(this.render)
  }

  setState(nextState) {
    if (this.state !== nextState) {
      this.prevState = this.state
      this.stateSinceTs = performance.now()
      this.transitionStartTs = performance.now()
    }
    this.state = nextState
  }

  #getQrSemanticAngles() {
    if (!this.qrLayout) return []

    const { left, top, moduleSizeX, moduleSizeY, size } = this.qrLayout
    const finderCenters = [
      { mx: 3.5, my: 3.5 },
      { mx: size - 3.5, my: 3.5 },
      { mx: 3.5, my: size - 3.5 },
    ]

    return finderCenters.map((f) => {
      const x = left + f.mx * moduleSizeX
      const y = top + f.my * moduleSizeY
      return Math.atan2(y - this.ringCenterY, x - this.ringCenterX)
    })
  }

  getTargetCoordinates() {
    return {
      ring: this.ringTargets,
      qr: this.qrTargets,
    }
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.#resizeListenerAttached) {
      window.removeEventListener('resize', this.resize)
      this.#resizeListenerAttached = false
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3))

    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr))

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    this.width = Math.max(1, rect.width)
    this.height = Math.max(1, rect.height)
    this.canvasOffsetX = rect.left
    this.canvasOffsetY = rect.top

    if (this.qrMatrixSource) {
      this.#buildQrTargets(this.qrMatrixSource)
      if (this.#syncRingCenterToQr()) {
        this.#buildRingTargets()
        this.#buildConstellations()
      }
      this.#initParticles()
    }
  }

  #syncRingCenterToQr() {
    if (!this.qrLayout) return false

    const qrCenterX = this.qrLayout.left + (this.qrLayout.size * this.qrLayout.moduleSizeX) / 2
    const qrCenterY = this.qrLayout.top + (this.qrLayout.size * this.qrLayout.moduleSizeY) / 2

    const changed =
      Math.abs(qrCenterX - this.ringCenterX) > 1e-6 ||
      Math.abs(qrCenterY - this.ringCenterY) > 1e-6

    if (changed) {
      this.ringCenterX = qrCenterX
      this.ringCenterY = qrCenterY
    }

    return changed
  }

  render(ts) {
    const t = (ts - this.startTime) / 1000
    this.#drawFrame(t)
    this.rafId = requestAnimationFrame(this.render)
  }

  #buildGridDots() {
    this.gridDots = []
    const step = 0.04

    for (let y = 0.03; y <= 0.97; y += step) {
      for (let x = 0.03; x <= 0.97; x += step) {
        this.gridDots.push({ x, y, seed: this.#hash2(x * 500, y * 500) * Math.PI * 2 })
      }
    }
  }

  #buildRingTargets() {
    this.ringTargets = []

    const deriveFromQr = this.config?.pointTopology?.deriveAllPointsFromQr !== false
    if (deriveFromQr && this.#buildRingTargetsFromQr()) {
      return
    }

    const externalPoints = this.config?.ringPointSet
    if (Array.isArray(externalPoints) && externalPoints.length > 0) {
      this.#buildRingTargetsFromExternal(externalPoints, this.config?.ringPointBounds)
      if (this.ringTargets.length > 0) {
        return
      }
    }

    const step = Number(this.config?.ring?.step) || 0.0082

    for (let y = 0.06; y <= 0.94; y += step) {
      for (let x = 0.06; x <= 0.94; x += step) {
        const dx = x - this.ringCenterX
        const dy = y - this.ringCenterY
        const r = Math.hypot(dx, dy)
        const a = Math.atan2(dy, dx)

        const radialDelta = Math.abs(r - this.ringRadius)
        const ringCore = this.#gaussian(radialDelta, this.ringThickness)

        const leftFlare = this.#gaussian(this.#angleDiff(a, Math.PI), 0.26) * this.#gaussian(radialDelta, 0.11)
        const rightFlare = this.#gaussian(this.#angleDiff(a, 0), 0.26) * this.#gaussian(radialDelta, 0.11)

        const topCrown = this.#gaussian(this.#angleDiff(a, -Math.PI / 2), 0.34) * this.#gaussian(radialDelta, 0.095)

        const lowerMask = 1 - this.#gaussian(a - Math.PI / 2, 0.55) * 0.12

        const density = Math.max(
          0,
          (ringCore * 0.92 + leftFlare * 0.95 + rightFlare * 0.95 + topCrown * 0.68) * lowerMask
        )

        if (density < 0.13) {
          continue
        }

        const noise = this.#hash2(x * 1973.3, y * 2671.7)
        const threshold = 1 - Math.min(1, density * 0.98)

        if (noise > threshold) {
          this.ringTargets.push({
            x,
            y,
            weight: Math.min(1, density),
          })
        }
      }
    }
  }

  #buildRingTargetsFromQr() {
    const qrCount = this.qrTargets.length
    if (!qrCount) return false

    const asymmetry = Number(this.config?.ring?.fractalAsymmetry) || 0.24
    const fractalStrength = Number(this.config?.ring?.fractalStrength) || 0.82
    const angleWarpStrength = Number(this.config?.ring?.angleWarpStrength) || 0.07
    const arrivalGapStrength = Number(this.config?.ring?.arrivalGapStrength) || 0.26
    const arrivalStrokeStrength = Number(this.config?.ring?.arrivalStrokeStrength) || 0.2
    const thicknessSwing = Number(this.config?.ring?.thicknessSwing) || 0.72
    const eruptionStrength = Number(this.config?.ring?.eruptionStrength) || 1.12
    const eruptionWidth = Number(this.config?.ring?.eruptionWidth) || 0.2
    const eruptionJaggedness = Number(this.config?.ring?.eruptionJaggedness) || 0.28
    const thickness = Math.max(0.008, this.ringThickness)
    const eruptionOffset = this.#hash2(qrCount * 0.77, qrCount * 1.13) * Math.PI * 2

    const eruptionCenters = [
      eruptionOffset + 0.3,
      eruptionOffset + 2.35,
      eruptionOffset + 4.72,
    ]

    // Ring layout uses ONLY QR point count (not QR point positions).
    for (let i = 0; i < qrCount; i += 1) {
      const t = i / qrCount
      const baseAngle = t * Math.PI * 2
      const seedA = this.#hash2(i * 7.91, i * 2.37)
      const seedB = this.#hash2(i * 3.71 + 13.2, i * 11.53 + 7.4)
      const localNoise = (seedA - 0.5) * 2
      const localNoiseB = (seedB - 0.5) * 2

      // Arrival-like lobe/gap character: broad brush structure plus fractured edge.
      const lobeA = Math.sin(baseAngle * 1.12 + 0.7) * 0.58
      const lobeB = Math.sin(baseAngle * 2.34 + 2.1) * 0.42
      const gapField = Math.sin(baseAngle * 1.03 - 0.35) * 0.52 + Math.sin(baseAngle * 3.27 + 1.2) * 0.28

      const fractalWave =
        Math.sin(baseAngle * 2.9 + seedA * Math.PI * 2) * 0.44 +
        Math.sin(baseAngle * 6.4 + seedB * Math.PI * 2) * 0.34 +
        Math.sin(baseAngle * 12.7 + (seedA + seedB) * Math.PI) * 0.22

      const angleWarp =
        (Math.sin(baseAngle * 2.8 + seedA * Math.PI * 2) * 0.66 + localNoiseB * 0.34) * angleWarpStrength

      let eruptionProfile = 0
      for (let k = 0; k < eruptionCenters.length; k += 1) {
        eruptionProfile += this.#gaussian(this.#angleDiff(baseAngle, eruptionCenters[k]), eruptionWidth)
      }
      eruptionProfile = Math.max(0, Math.min(1.7, eruptionProfile))

      const thicknessProfile =
        1 +
        Math.sin(baseAngle * 0.94 + 1.3) * (0.38 * thicknessSwing) +
        Math.sin(baseAngle * 2.2 + 0.2) * (0.24 * thicknessSwing) +
        eruptionProfile * (0.75 * thicknessSwing)

      const localThickness = Math.max(0.0065, thickness * thicknessProfile)

      const gapBias = Math.max(0, gapField)
      const radialOffset = localNoise * localThickness * 0.64
      const fractalOffset = fractalWave * localThickness * fractalStrength
      const asymOffset = (lobeA + lobeB + localNoise * 0.24) * localThickness * asymmetry
      const brushOffset = (0.5 - gapBias) * localThickness * arrivalStrokeStrength
      const eruptionOffsetRadial = eruptionProfile * localThickness * eruptionStrength
      const eruptionSpike =
        Math.pow(Math.max(0, Math.sin(baseAngle * 16.4 + seedB * Math.PI * 2)), 6) *
        localThickness *
        eruptionJaggedness *
        (0.4 + eruptionProfile)
      const targetRadius = Math.max(
        0.02,
        this.ringRadius + radialOffset + fractalOffset + asymOffset + brushOffset + eruptionOffsetRadial + eruptionSpike
      )
      const theta = baseAngle + angleWarp

      const weight = Math.max(
        0.45,
        Math.min(
          1,
          0.62 +
            Math.abs(fractalWave) * 0.16 +
            Math.abs(localNoise) * 0.08 +
            (1 - gapBias) * arrivalGapStrength +
            eruptionProfile * 0.15
        )
      )

      this.ringTargets.push({
        x: this.ringCenterX + Math.cos(theta) * targetRadius,
        y: this.ringCenterY + Math.sin(theta) * targetRadius,
        weight,
      })

      // Corona spray: sparse outward sparks along eruption sectors.
      const sprayGate = this.#hash2(i * 13.7 + 2.1, i * 1.9 + 5.3)
      if (eruptionProfile > 0.32 && sprayGate > 0.72) {
        const sprayRadius = targetRadius + localThickness * (0.38 + sprayGate * 0.8)
        const sprayTheta = theta + (sprayGate - 0.5) * 0.08
        this.ringTargets.push({
          x: this.ringCenterX + Math.cos(sprayTheta) * sprayRadius,
          y: this.ringCenterY + Math.sin(sprayTheta) * sprayRadius,
          weight: Math.max(0.35, Math.min(0.82, weight * 0.82)),
        })
      }
    }

    return this.ringTargets.length > 0
  }

  #buildRingTargetsFromExternal(points, bounds) {
    const minX = Number.isFinite(bounds?.minX)
      ? bounds.minX
      : Math.min(...points.map((p) => p.x))
    const maxX = Number.isFinite(bounds?.maxX)
      ? bounds.maxX
      : Math.max(...points.map((p) => p.x))
    const minY = Number.isFinite(bounds?.minY)
      ? bounds.minY
      : Math.min(...points.map((p) => p.y))
    const maxY = Number.isFinite(bounds?.maxY)
      ? bounds.maxY
      : Math.max(...points.map((p) => p.y))

    const spanX = Math.max(1, maxX - minX)
    const spanY = Math.max(1, maxY - minY)
    const sourceSpan = Math.max(spanX, spanY)
    const targetSize = Number(this.config?.ring?.externalTargetSizeNorm) || 0.9
    const scale = targetSize / sourceSpan
    const targetW = spanX * scale
    const targetH = spanY * scale
    const left = this.ringCenterX - targetW / 2
    const top = this.ringCenterY - targetH / 2

    for (const pt of points) {
      const x = left + (pt.x - minX) * scale
      const y = top + (pt.y - minY) * scale

      this.ringTargets.push({
        x,
        y,
        weight: 0.84,
      })
    }
  }

  #buildConstellations() {
    this.constellations = []
    if (!this.ringTargets.length) return

    const ring = this.ringTargets
    const cx = this.ringCenterX
    const cy = this.ringCenterY

    // Find ring point index closest to a given angle (degrees)
    const byAngle = (angleDeg) => {
      const a = angleDeg * Math.PI / 180
      let best = 0
      let bestDiff = Infinity
      for (let i = 0; i < ring.length; i++) {
        const pa = Math.atan2(ring[i].y - cy, ring[i].x - cx)
        const diff = Math.abs(this.#angleDiff(pa, a))
        if (diff < bestDiff) { bestDiff = diff; best = i }
      }
      return best
    }

    // 6 constellation patterns defined by ring-angles (degrees) + connecting edges
    const patterns = [
      // Orion belt + shoulders
      { angles: [-85, -60, -38, 28, 148], edges: [[0,1],[1,2],[0,3],[2,4],[3,4]] },
      // Cassiopeia W
      { angles: [168, 128, 90, 52, 12], edges: [[0,1],[1,2],[2,3],[3,4]] },
      // Triangulum
      { angles: [-90, 30, 150], edges: [[0,1],[1,2],[2,0]] },
      // Southern Cross
      { angles: [-90, 0, 90, 180, -45], edges: [[0,2],[1,3],[0,4]] },
      // Dipper handle + bowl
      { angles: [210, 230, 250, 270, 310, 330, 350], edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]] },
      // Diamond
      { angles: [-90, 0, 90, 180], edges: [[0,1],[1,2],[2,3],[3,0],[0,2]] },
    ]

    for (const pat of patterns) {
      const indices = pat.angles.map(a => byAngle(a))
      this.constellations.push({ indices, edges: pat.edges })
    }
  }

  #drawConstellations(ctx, t) {
    const mode = this.state
    if (mode !== 'idle' && mode !== 'active' && mode !== 'reassemble' && mode !== 'entropy' && mode !== 'dissolve') return
    if (!this.constellations.length) return

    const cycle = this.constellationCycle

    // Trigger next constellation flash
    if (t >= cycle.nextAt) {
      const roll = this.#hash2(Math.floor(t * 11.3), cycle.patternIndex + 1.7)
      cycle.patternIndex = Math.floor(roll * this.constellations.length) % this.constellations.length
      cycle.startT = t
      cycle.nextAt = t + 8 + this.#hash2(Math.floor(t * 7.1), 3.3) * 4
    }

    if (cycle.patternIndex < 0) return
    const elapsed = t - cycle.startT
    const { duration } = cycle
    if (elapsed <= 0 || elapsed > duration) return

    // Bell-curve alpha: fade-in 30%, hold 40%, fade-out 30%
    const progress = elapsed / duration
    let alpha
    if (progress < 0.3) {
      alpha = this.#easeInOutCubic(progress / 0.3)
    } else if (progress < 0.7) {
      alpha = 1.0
    } else {
      alpha = this.#easeInOutCubic(1 - (progress - 0.7) / 0.3)
    }

    const pat = this.constellations[cycle.patternIndex]
    const ring = this.ringTargets
    const cloudTransform = this.#getConstellationCloudTransform()
    const mapPoint = (pt) => {
      const dx = pt.x - this.ringCenterX
      const dy = pt.y - this.ringCenterY
      const x = this.ringCenterX + dx * cloudTransform.scaleX + dy * cloudTransform.shear
      const y = this.ringCenterY + dy * cloudTransform.scaleY
      return {
        x: Math.max(0.02, Math.min(0.98, x)),
        y: Math.max(0.02, Math.min(0.98, y)),
      }
    }

    // Build outward growth order from a single root star.
    const nodeCount = pat.indices.length
    const rootNode = 0
    const adjacency = Array.from({ length: nodeCount }, () => [])
    for (const [ai, bi] of pat.edges) {
      if (ai < 0 || bi < 0 || ai >= nodeCount || bi >= nodeCount) continue
      adjacency[ai].push(bi)
      adjacency[bi].push(ai)
    }

    const nodeDist = new Array(nodeCount).fill(Infinity)
    nodeDist[rootNode] = 0
    const queue = [rootNode]
    for (let qi = 0; qi < queue.length; qi += 1) {
      const n = queue[qi]
      const nextDist = nodeDist[n] + 1
      for (const m of adjacency[n]) {
        if (nodeDist[m] !== Infinity) continue
        nodeDist[m] = nextDist
        queue.push(m)
      }
    }
    for (let i = 0; i < nodeDist.length; i += 1) {
      if (nodeDist[i] === Infinity) nodeDist[i] = 0
    }

    const maxDist = nodeDist.reduce((acc, d) => Math.max(acc, d), 0)
    const edgeOrder = pat.edges.map(([ai, bi], edgeIdx) => {
      const da = nodeDist[ai] ?? 0
      const db = nodeDist[bi] ?? 0
      const fromA = da <= db
      const depth = Math.min(da, db)
      const order = depth + edgeIdx * 0.0001
      return { ai, bi, fromA, depth, order }
    }).sort((a, b) => a.order - b.order)

    // Draw constellation edges as solid lines growing outward from root.
    ctx.save()
    ctx.strokeStyle = `rgba(255, 255, 255, ${(alpha * 0.52).toFixed(3)})`
    ctx.lineWidth = 0.65
    const growPhase = this.#easeInOutCubic(Math.max(0, Math.min(1, progress / 0.72)))
    const depthSteps = Math.max(1, maxDist + 1)
    const stepWidth = 0.95 / depthSteps
    for (const edge of edgeOrder) {
      const aRaw = ring[pat.indices[edge.ai]]
      const bRaw = ring[pat.indices[edge.bi]]
      if (!aRaw || !bRaw) continue

      const startRaw = edge.fromA ? aRaw : bRaw
      const endRaw = edge.fromA ? bRaw : aRaw
      const start = mapPoint(startRaw)
      const end = mapPoint(endRaw)

      const edgeStart = edge.depth * stepWidth
      const local = Math.max(0, Math.min(1, (growPhase - edgeStart) / Math.max(0.001, stepWidth)))
      if (local <= 0) continue

      const ex = start.x + (end.x - start.x) * local
      const ey = start.y + (end.y - start.y) * local
      ctx.beginPath()
      ctx.moveTo(start.x * this.width, start.y * this.height)
      ctx.lineTo(ex * this.width, ey * this.height)
      ctx.stroke()
    }
    ctx.restore()

    // Draw star glows at constellation points
    for (let starIndex = 0; starIndex < pat.indices.length; starIndex += 1) {
      const idx = pat.indices[starIndex]
      const raw = ring[idx]
      if (!raw) continue
      const pt = mapPoint(raw)
      const px = pt.x * this.width
      const py = pt.y * this.height

      const starDepth = nodeDist[starIndex] ?? 0
      const starReveal = Math.max(0, Math.min(1, (growPhase - starDepth * stepWidth) / Math.max(0.001, stepWidth)))
      if (starReveal <= 0) continue
      const starAlpha = alpha * (0.34 + 0.66 * this.#easeInOutCubic(starReveal))

      // Outer radial glow
      const grd = ctx.createRadialGradient(px, py, 0.4, px, py, 5.8)
      grd.addColorStop(0, `rgba(255, 248, 220, ${(starAlpha * 0.94).toFixed(3)})`)
      grd.addColorStop(0.38, `rgba(200, 228, 255, ${(starAlpha * 0.52).toFixed(3)})`)
      grd.addColorStop(1, 'rgba(160, 200, 255, 0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(px, py, 5.8, 0, Math.PI * 2)
      ctx.fill()

      // Bright core point
      ctx.fillStyle = `rgba(255, 252, 238, ${(starAlpha * 0.97).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px, py, 1.9, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  #getConstellationCloudTransform() {
    if (!this.particles.length) {
      return { scaleX: 1, scaleY: 1, shear: 0 }
    }

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    let sumX = 0
    let sumY = 0

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i]
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
      sumX += p.x
      sumY += p.y
    }

    const cx = sumX / this.particles.length
    const cy = sumY / this.particles.length
    const spanX = Math.max(0.001, maxX - minX)
    const spanY = Math.max(0.001, maxY - minY)

    const baseSpanX = 0.82
    const baseSpanY = 0.74
    const sx = Math.max(0.92, Math.min(1.48, spanX / baseSpanX))
    const sy = Math.max(0.9, Math.min(1.34, spanY / baseSpanY))

    const centerDx = cx - this.ringCenterX
    const centerDy = cy - this.ringCenterY
    const shear = Math.max(-0.42, Math.min(0.42, centerDx * 0.95 + centerDy * 0.55))

    return {
      scaleX: sx,
      scaleY: sy,
      shear,
    }
  }

  #buildQrTargets(qrMatrix) {
    this.qrTargets = []
    this.qrLayout = null

    if (!qrMatrix || !Array.isArray(qrMatrix.modules) || !qrMatrix.size) {
      return
    }

    const size = qrMatrix.size
    const normSize = qrMatrix.normSize || 0.36
    const targetSizePx = Number(qrMatrix.targetSizePx) || 0
    const shouldSnapToGrid = this.config?.qrSnapToGrid !== false
    const gridStepPx = Number(this.config?.gridSpacingPx) || 26
    const quantumPx = Number(this.config?.qrGridQuantumPx) || gridStepPx / 2

    let left
    let top
    let moduleSizeX
    let moduleSizeY

    if (shouldSnapToGrid && this.width > 1 && this.height > 1) {
      const desiredQrSizePx = targetSizePx > 0
        ? Math.min(targetSizePx, Math.min(this.width, this.height) * 0.92)
        : normSize * Math.min(this.width, this.height)
      const rawModulePx = desiredQrSizePx / size
      const modulePx = Math.max(3, Math.round(rawModulePx / quantumPx) * quantumPx)
      const qrSizePx = modulePx * size

      const rawLeftPx = (this.width - qrSizePx) * 0.5
      const rawTopPx = (this.height - qrSizePx) * 0.5
      const snapToGrid = (localPx, canvasOffset) => {
        const absolutePx = canvasOffset + localPx
        return Math.round(absolutePx / quantumPx) * quantumPx - canvasOffset
      }

      const leftPx = snapToGrid(rawLeftPx, this.canvasOffsetX || 0)
      const topPx = snapToGrid(rawTopPx, this.canvasOffsetY || 0)

      moduleSizeX = modulePx / this.width
      moduleSizeY = modulePx / this.height
      left = leftPx / this.width
      top = topPx / this.height
    } else {
      moduleSizeX = normSize / size
      moduleSizeY = normSize / size
      left = this.ringCenterX - normSize / 2
      top = this.ringCenterY - normSize / 2
    }

    this.qrModuleSizeNorm = moduleSizeX
    this.qrLayout = {
      size,
      modules: qrMatrix.modules,
      left,
      top,
      moduleSizeX,
      moduleSizeY,
    }

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (!qrMatrix.modules[y][x]) continue
        this.qrTargets.push({
          x: left + x * moduleSizeX + moduleSizeX * 0.5,
          y: top + y * moduleSizeY + moduleSizeY * 0.5,
          weight: 1,
        })
      }
    }
  }

  #initParticles() {
    this.particles = []
    const ringCount = this.ringTargets.length
    const qrCount = this.qrTargets.length
    const configuredCount = Number(this.config?.particle?.countExact)
    const baseCount = Number.isFinite(configuredCount) && configuredCount > 0
      ? Math.floor(configuredCount)
      : Math.max(ringCount, qrCount)
    const count = Math.max(baseCount, qrCount)
    const startsInQr = this.state === 'qr_show'
    const ringRadiusStats = this.ringTargets.reduce((stats, point) => {
      const radius = Math.hypot(point.x - this.ringCenterX, point.y - this.ringCenterY)
      return {
        min: Math.min(stats.min, radius),
        max: Math.max(stats.max, radius),
      }
    }, { min: Infinity, max: -Infinity })

    const particleOrder = Array.from({ length: count }, (_, idx) => idx).sort(
      (a, b) => this.#hash2(a * 3.17, a * 9.31) - this.#hash2(b * 3.17, b * 9.31)
    )
    const qrOrder = Array.from({ length: qrCount }, (_, idx) => idx).sort(
      (a, b) => this.#hash2(a * 7.41, a * 1.73) - this.#hash2(b * 7.41, b * 1.73)
    )
    const qrAssignments = new Array(count).fill(-1)

    // Link every particle to a QR anchor so transitions are continuous.
    if (qrCount > 0) {
      for (let n = 0; n < count; n += 1) {
        const particleIdx = particleOrder[n]
        qrAssignments[particleIdx] = qrOrder[n % qrCount]
      }
    }

    for (let i = 0; i < count; i += 1) {
      const uniformIndex = i % ringCount
      const ringAnchorIndex = ((uniformIndex % ringCount) + ringCount) % ringCount

      const base = this.ringTargets[ringAnchorIndex]
      const qrTargetIndex = qrAssignments[i]
      const baseRadius = Math.hypot(base.x - this.ringCenterX, base.y - this.ringCenterY)
      const radiusSpan = Math.max(0.001, ringRadiusStats.max - ringRadiusStats.min)
      const outerRingPriority = (baseRadius - ringRadiusStats.min) / radiusSpan
      const qrLag = this.#hash2(i * 6.7, i * 2.9) * 0.12 + (1 - outerRingPriority) * 0.16
      const heteroAmp = 0.18 + this.#hash2(i * 4.8, i * 1.1) * 1.18
      const radialBias = (this.#hash2(i * 1.4, i * 7.3) - 0.5) * 2
      const swirlPhase = this.#hash2(i * 5.2, i * 9.9) * Math.PI * 2
      const armSign = this.#hash2(i * 6.9, i * 2.8) > 0.5 ? 1 : -1
      const armPhase = this.#hash2(i * 8.3, i * 2.2) * Math.PI * 2
      const armDrift = 0.76 + this.#hash2(i * 6.1, i * 7.9) * 0.74
      const initialQrBlend = startsInQr && qrTargetIndex >= 0 ? 1 : 0
      const initialQrTarget = qrTargetIndex >= 0 ? this.qrTargets[qrTargetIndex] : null
      const initialX = initialQrTarget
        ? base.x * (1 - initialQrBlend) + initialQrTarget.x * initialQrBlend
        : base.x
      const initialY = initialQrTarget
        ? base.y * (1 - initialQrBlend) + initialQrTarget.y * initialQrBlend
        : base.y
      this.particles.push({
        x: initialX + (this.#hash2(i * 1.3, i * 2.1) - 0.5) * 0.006,
        y: initialY + (this.#hash2(i * 2.8, i * 0.9) - 0.5) * 0.006,
        vx: 0,
        vy: 0,
        size: 0.66 + this.#hash2(i * 3.1, i * 1.7) * 1.08,
        baseWeight: base.weight,
        ringAnchorIndex,
        armSign,
        armPhase,
        armDrift,
        heteroAmp,
        radialBias,
        swirlPhase,
        qrTargetIndex,
        qrLag,
        qrBlend: initialQrBlend,
        respawnAt: null,
        respawnCount: 0,
      })
    }
  }

  #sampleSignedNoise(i, t, kx, ky) {
    return this.#hash2(i * kx + t * 0.17, i * ky + t * 0.11) - 0.5
  }

  #easeInOutCubic(x) {
    if (x <= 0) return 0
    if (x >= 1) return 1
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }

  #stateProgress(stateKey, fallbackMs) {
    if (this.state !== stateKey) return 0
    const duration = this.config?.states?.[stateKey]?.durationMs || fallbackMs
    const elapsed = performance.now() - this.stateSinceTs
    return Math.max(0, Math.min(1, elapsed / Math.max(1, duration)))
  }

  #stateTransitionProgress() {
    const elapsed = performance.now() - this.transitionStartTs
    const raw = Math.max(0, Math.min(1, elapsed / Math.max(1, this.stateTransitionMs)))
    return this.#easeInOutCubic(raw)
  }

  #modeInfluence(modeKey) {
    const p = this.#stateTransitionProgress()
    const current = this.state === modeKey ? 1 : 0
    const prev = this.prevState === modeKey ? 1 : 0
    return prev * (1 - p) + current * p
  }

  #particleQrProgress(baseProgress, lag) {
    if (baseProgress <= 0) return 0
    if (baseProgress >= 1) return 1
    const local = (baseProgress - lag) / Math.max(0.001, 1 - lag)
    return this.#easeInOutCubic(Math.max(0, Math.min(1, local)))
  }

  #advanceBlend(current, target, rate) {
    return current + (target - current) * rate
  }

  #applyJumpDiffusionDrift(p, i, t) {
    const dx = p.x - this.ringCenterX
    const dy = p.y - this.ringCenterY
    const len = Math.hypot(dx, dy) || 1
    const nx = dx / len
    const ny = dy / len

    // Continuous diffusion + outward drift with occasional gentle random jumps.
    const diffX = this.#sampleSignedNoise(i, t, 7.1, 3.9) * 0.0021
    const diffY = this.#sampleSignedNoise(i, t, 4.7, 6.3) * 0.0021
    p.vx += nx * 0.0027 + diffX
    p.vy += ny * 0.0027 + diffY

    const jumpGate = this.#hash2(i * 9.7 + Math.floor(t * 4.1), i * 5.1 + Math.floor(t * 2.6))
    if (jumpGate > 0.9955) {
      const theta = this.#hash2(i * 13.3 + t, i * 2.7 + t) * Math.PI * 2
      const jumpAmp = 0.008 + this.#hash2(i * 17.9, t * 2.2) * 0.016
      p.vx += Math.cos(theta) * jumpAmp
      p.vy += Math.sin(theta) * jumpAmp
    }

    p.vx *= 0.996
    p.vy *= 0.996
    p.x += p.vx
    p.y += p.vy

    const outMargin = 0.08
    const isOutOfView =
      p.x < -outMargin ||
      p.x > 1 + outMargin ||
      p.y < -outMargin ||
      p.y > 1 + outMargin

    if (isOutOfView && this.ringTargets.length > 0) {
      if (p.respawnAt == null) {
        const stagger = 0.12 + this.#hash2(i * 15.3 + t, i * 8.1) * 0.72
        p.respawnAt = t + stagger
      }

      if (t < p.respawnAt) {
        p.vx *= 0.82
        p.vy *= 0.82
        return
      }

      const rollA = (i + 1) * (p.respawnCount + 1) * 13.37
      const rollB = (p.respawnCount + 1) * 7.11 + t * 1.91
      const ringIndex = Math.floor(this.#hash2(rollA, rollB) * this.ringTargets.length)
      const ringSeed = this.ringTargets[Math.max(0, Math.min(this.ringTargets.length - 1, ringIndex))]
      const jitterX = (this.#hash2(i * 21.7 + p.respawnCount, i * 3.1 + t) - 0.5) * 0.012
      const jitterY = (this.#hash2(i * 5.9 + t, i * 19.3 + p.respawnCount) - 0.5) * 0.012

      p.x = ringSeed.x + jitterX
      p.y = ringSeed.y + jitterY
      p.vx = (this.#hash2(i * 11.7 + p.respawnCount, t * 0.9) - 0.5) * 0.0008
      p.vy = (this.#hash2(i * 4.3, t * 1.2 + p.respawnCount) - 0.5) * 0.0008
      p.respawnCount += 1
      p.respawnAt = null
    }
  }

  #drawFrame(t) {
    const ctx = this.ctx
    if (!ctx) return

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, this.width, this.height)

    this.#drawBackgroundRaster(ctx, t)

    this.#updateParticles(t)
    this.#drawParticles(ctx, t)

    this.#drawConstellations(ctx, t)
  }

  #drawRingBaseline(ctx, alpha = 0.22) {
    if (!this.ringTargets.length) return
    for (let i = 0; i < this.ringTargets.length; i += 1) {
      const p = this.ringTargets[i]
      const px = p.x * this.width
      const py = p.y * this.height
      const w = p.weight || 1
      const a = Math.max(0.04, Math.min(0.5, alpha * (0.55 + w * 0.45)))
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px, py, 0.7, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Gentle ring-particle drift during qr_show so the logo stays alive.
  #updateRingDrift(t) {
    const ring = this.ringTargets
    if (!ring.length) return
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i]
      const rt = ring[i % ring.length]
      const drift = Math.sin(t * 0.28 + i * 0.011) * 0.00006
      p.x += (rt.x - p.x) * 0.004 + drift
      p.y += (rt.y - p.y) * 0.004
    }
  }

  #drawQrMotionField(ctx, t) {
    if (!this.qrLayout) return

    const { left, top, moduleSizeX, moduleSizeY, size } = this.qrLayout
    const x0 = (left - moduleSizeX) * this.width
    const y0 = (top - moduleSizeY) * this.height
    const w = (size + 2) * moduleSizeX * this.width
    const h = (size + 2) * moduleSizeY * this.height

    ctx.save()
    ctx.globalAlpha = 0.22
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(x0, y0, w, h)

    for (let i = 0; i < 16; i += 1) {
      const phase = t * 0.7 + i * 1.73
      const px = x0 + (0.12 + (i % 4) * 0.24) * w + Math.sin(phase) * 2.2
      const py = y0 + (0.18 + Math.floor(i / 4) * 0.2) * h + Math.cos(phase * 1.3) * 2.2
      const r = 0.8 + (Math.sin(phase * 0.9) + 1) * 0.45
      ctx.fillStyle = 'rgba(255,255,255,0.16)'
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  #drawBackgroundRaster(ctx, t) {
    for (const dot of this.gridDots) {
      const twinkle = 0.035 + (Math.sin(t * 0.68 + dot.seed) + 1) * 0.018
      ctx.fillStyle = `rgba(210, 230, 255, ${twinkle.toFixed(3)})`
      ctx.fillRect(dot.x * this.width, dot.y * this.height, 1.05, 1.05)
    }
  }

  #updateParticles(t) {
    const mode = this.state
    const ring = this.ringTargets
    const hasQr = this.qrTargets.length > 0
    const qrBuildProgress = this.#stateProgress('qr_build', 2600)
    const qrBuildInfluence = this.#modeInfluence('qr_build')
    const qrShowInfluence = this.#modeInfluence('qr_show')
    const dissolveInfluence = this.#modeInfluence('dissolve')
    const ringInfluence = Math.max(0, 1 - Math.max(qrBuildInfluence, qrShowInfluence))
    if (!ring.length) return

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i]
      const ringIndex = p.ringAnchorIndex == null ? i % ring.length : p.ringAnchorIndex % ring.length
      const ringTarget = ring[ringIndex]

      const dx = ringTarget.x - this.ringCenterX
      const dy = ringTarget.y - this.ringCenterY
      const radialLen = Math.hypot(dx, dy) || 1
      const nx = dx / radialLen
      const ny = dy / radialLen
      const tx = -ny
      const ty = nx

      // Very subtle motion around each anchor point to keep the ring alive.
      const hetero = p.heteroAmp || 0.5
      const phase = (p.swirlPhase || 0) + t * 0.24 + i * 0.002
      const radialOffset = Math.sin(phase * 0.93) * (0.00062 + hetero * 0.00046)
      const tangentialOffset = Math.cos(phase * 0.77) * (0.0012 + hetero * 0.00088)

      const ringWanderX = ringTarget.x + nx * radialOffset + tx * tangentialOffset
      const ringWanderY = ringTarget.y + ny * radialOffset + ty * tangentialOffset
      const isQrMode = qrBuildInfluence > 0.001 || qrShowInfluence > 0.001
      const isQrParticle = hasQr && p.qrTargetIndex >= 0 && p.qrTargetIndex < this.qrTargets.length

      let targetX = ringWanderX
      let targetY = ringWanderY

      const dissolveProgress = this.#stateProgress('dissolve', 3200)
      let desiredQrBlend = 0
      if (isQrParticle) {
        const buildBlend = this.#particleQrProgress(qrBuildProgress, p.qrLag || 0) * qrBuildInfluence
        const showBlend = 1 * qrShowInfluence
        const dissolveBlend = (1 - this.#easeInOutCubic(dissolveProgress)) * dissolveInfluence
        desiredQrBlend = Math.max(0, Math.min(1, buildBlend + showBlend + dissolveBlend))
      }

      // Slower blend rates avoid abrupt shape snapping between QR and ring phases.
      const qrBlendRate = mode === 'qr_show' ? 0.032 : mode === 'dissolve' ? 0.03 : 0.04
      p.qrBlend = this.#advanceBlend(p.qrBlend || 0, desiredQrBlend, qrBlendRate)

      if (isQrParticle) {
        const qrTarget = this.qrTargets[p.qrTargetIndex]
        targetX = ringWanderX * (1 - p.qrBlend) + qrTarget.x * p.qrBlend
        targetY = ringWanderY * (1 - p.qrBlend) + qrTarget.y * p.qrBlend
      }

      // Story motion:
      // idle/entropy => asymmetric two-arm galaxy,
      // hover(active)/reassemble => align toward ring,
      // qr_build/qr_show => strongest alignment while transitioning into QR.
      const ringModeAlignment = mode === 'active' ? 0.78 : mode === 'reassemble' ? 0.84 : mode === 'entropy' ? 0.08 : 0.2
      const qrModeAlignment = 0.93 + qrShowInfluence * 0.07
      const desiredAlignment = ringModeAlignment * ringInfluence + qrModeAlignment * (1 - ringInfluence)
      p.modeAlignment = this.#advanceBlend(
        Number.isFinite(p.modeAlignment) ? p.modeAlignment : desiredAlignment,
        desiredAlignment,
        0.095
      )
      const modeAlignment = p.modeAlignment

      const armPhase = (p.armPhase || 0) + t * (0.28 + (p.armDrift || 1) * 0.23)
      const armSign = p.armSign || 1
      const armSpread = 0.135 + 0.045 * Math.sin(t * 0.23 + armPhase * 0.61)
      const armRadialScale =
        0.72 +
        Math.sin(armPhase * 0.91) * 0.07 +
        (armSign > 0 ? armSpread * 0.2 : -armSpread * 0.16)
      const armBend = (0.075 + hetero * 0.048) * (0.82 + Math.sin(armPhase * 1.13) * 0.22)

      const armX = this.ringCenterX + dx * armRadialScale + tx * armBend * armSign
      const armY = this.ringCenterY + dy * armRadialScale + ty * armBend * armSign * 0.78

      targetX = armX * (1 - modeAlignment) + targetX * modeAlignment
      targetY = armY * (1 - modeAlignment) + targetY * modeAlignment

      // Smooth pull without spring oscillation.
      const ringModeFollow = mode === 'active' ? 0.16 : mode === 'reassemble' ? 0.19 : mode === 'entropy' ? 0.06 : 0.085
      const qrModeFollow = 0.165 - qrShowInfluence * 0.012
      const desiredFollow = ringModeFollow * ringInfluence + qrModeFollow * (1 - ringInfluence)
      p.followRate = this.#advanceBlend(
        Number.isFinite(p.followRate) ? p.followRate : desiredFollow,
        desiredFollow,
        0.11
      )
      const follow = p.followRate
      // Critically damped-like motion smooths target changes across state boundaries.
      const ax = (targetX - p.x) * follow * 0.9
      const ay = (targetY - p.y) * follow * 0.9
      p.vx = (p.vx + ax) * 0.78
      p.vy = (p.vy + ay) * 0.78
      p.x += p.vx
      p.y += p.vy
    }
  }

  #drawParticles(ctx, t) {
    const energized = this.state === 'active' || this.state === 'qr_build'
    const qrMode = this.state === 'qr_build' || this.state === 'qr_show'
    const qrBuildProgress = this.#stateProgress('qr_build', 2600)
    const qrPx = this.qrModuleSizeNorm > 0 ? this.qrModuleSizeNorm * this.width : 2

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i]
      const px = p.x * this.width
      const py = p.y * this.height

      const pulse = energized ? 0.52 + (Math.sin(t * 3.2 + i * 0.17) + 1) * 0.2 : 0.54
      let alpha = this.state === 'entropy' ? 0.26 : pulse * (0.72 + p.baseWeight * 0.46)
      const isQrParticle = p.qrTargetIndex >= 0 && (qrMode || (p.qrBlend || 0) > 0.02)
      let size = this.state === 'qr_show' && isQrParticle ? 1.14 : p.size

      if (qrMode && !isQrParticle) {
        alpha *= this.state === 'qr_build' ? 0.32 : 0.12
      }

      if (isQrParticle) {
        const reveal = Math.max(0, Math.min(1, p.qrBlend || 0))
        const sizeJitter = 0.58 + this.#hash2(i * 9.17, i * 3.71) * 1.02
        const sparkleSeed = this.#hash2(i * 2.73, i * 6.19)
        const shimmerA = Math.sin(t * (4.3 + sparkleSeed * 2.1) + sparkleSeed * Math.PI * 2)
        const shimmerB = Math.sin(t * (9.4 + sparkleSeed * 3.7) + sparkleSeed * 11.3)
        const qrShimmer = 0.5 + 0.34 * shimmerA + 0.16 * shimmerB
        const qrGlint = Math.pow(
          Math.max(0, Math.sin(t * (12.8 + sparkleSeed * 4.4) + sparkleSeed * 9.1)),
          11
        )
        const alwaysSparkle = 0.86 + (Math.sin(t * (2.7 + sparkleSeed * 1.6) + sparkleSeed * 5.2) + 1) * 0.1

        if (this.state === 'qr_show' && p.qrTargetIndex >= 0) {
          // Final QR: blend into locked module positions instead of snapping hard.
          const q = this.qrTargets[p.qrTargetIndex]
          const qx = q.x * this.width
          const qy = q.y * this.height
          const lock = Math.max(0, Math.min(1, reveal))
          const drawX = px * (1 - lock) + qx * lock
          const drawY = py * (1 - lock) + qy * lock
          const radius = Math.max(0.88, qrPx * 0.31 * sizeJitter * (0.88 + qrShimmer * 0.2 + qrGlint * 0.14))
          const qrShowAlpha = Math.min(1, 0.76 + qrShimmer * 0.22 + qrGlint * 0.22)

          ctx.fillStyle = `rgba(255,255,255,${Math.max(0.34, qrShowAlpha * alwaysSparkle).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2)
          ctx.fill()
          continue
        }

        const radius = Math.max(
          0.82,
          qrPx * (0.31 + reveal * 0.16) * sizeJitter * (0.86 + qrShimmer * 0.24 + qrGlint * 0.16)
        )
        const shadowOffset = 0.55
        const shadowAlpha = 0.08 + reveal * 0.12

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(px + shadowOffset, py + shadowOffset, radius, 0, Math.PI * 2)
        ctx.fill()

        const qrAlpha = Math.min(1, 0.7 + reveal * 0.24 + qrShimmer * 0.26 + qrGlint * 0.22)
        ctx.fillStyle = `rgba(255,255,255,${qrAlpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
        continue
      }

      // Crystalline twinkle for logo points: smooth shimmer + occasional tiny glints.
      const sparkleSeed = this.#hash2(i * 1.91, i * 7.31)
      const shimmer = 0.5 + 0.5 * Math.sin(t * (2.0 + sparkleSeed * 1.9) + sparkleSeed * Math.PI * 2)
      const glint = Math.pow(
        Math.max(0, Math.sin(t * (6.3 + sparkleSeed * 3.1) + sparkleSeed * 13.0)),
        14
      )
      const sparkleBurst = Math.pow(Math.max(0, Math.sin(t * 3.8 + sparkleSeed * 21.0)), 8)
      const alwaysSparkle = 0.84 + (Math.sin(t * (2.25 + sparkleSeed * 1.2) + sparkleSeed * 8.1) + 1) * 0.11
      alpha *= (0.72 + shimmer * 0.34 + glint * 0.42 + sparkleBurst * 0.28) * alwaysSparkle
      size *= 0.78 + shimmer * 0.26 + glint * 0.18 + sparkleBurst * 0.16
      alpha = Math.max(0.075, alpha)

      if (glint > 0.65 || sparkleBurst > 0.6) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 0.78 + 0.16).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(px + 0.4, py - 0.4, Math.max(0.65, size * 0.42), 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
