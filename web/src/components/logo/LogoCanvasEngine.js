function fract(v) {
  return v - Math.floor(v)
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return fract(s)
}

function gaussian(x, sigma) {
  return Math.exp(-(x * x) / (2 * sigma * sigma))
}

function angleDiff(a, b) {
  let d = a - b
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

export default class LogoCanvasEngine {
  #resizeListenerAttached = false

  constructor(canvas, config = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.config = config

    this.state = 'idle'
    this.rafId = null
    this.startTime = performance.now()
    this.stateSinceTs = performance.now()

    this.width = 1
    this.height = 1
    this.gridDots = []
    this.ringTargets = []
    this.qrTargets = []
    this.qrLayout = null
    this.particles = []
    this.qrModuleSizeNorm = 0

    this.ringCenterX = 0.5
    this.ringCenterY = 0.54
    this.ringRadius = 0.285
    this.ringThickness = 0.048

    this.resize = this.resize.bind(this)
    this.render = this.render.bind(this)
    this.#resizeListenerAttached = false

    this.#buildGridDots()
    this.#buildRingTargets()
    this.#buildQrTargets(config?.qrMatrix)
    this.#initParticles()

    window.addEventListener('resize', this.resize)
    this.#resizeListenerAttached = true
    this.resize()
    this.rafId = requestAnimationFrame(this.render)
  }

  setState(nextState) {
    if (this.state !== nextState) {
      this.stateSinceTs = performance.now()
    }
    this.state = nextState
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
        this.gridDots.push({ x, y, seed: hash2(x * 500, y * 500) * Math.PI * 2 })
      }
    }
  }

  #buildRingTargets() {
    this.ringTargets = []

    const externalPoints = this.config?.ringPointSet
    if (Array.isArray(externalPoints) && externalPoints.length > 0) {
      this.#buildRingTargetsFromExternal(externalPoints, this.config?.ringPointBounds)
      if (this.ringTargets.length > 0) {
        return
      }
    }

    const step = 0.0082

    for (let y = 0.06; y <= 0.94; y += step) {
      for (let x = 0.06; x <= 0.94; x += step) {
        const dx = x - this.ringCenterX
        const dy = y - this.ringCenterY
        const r = Math.hypot(dx, dy)
        const a = Math.atan2(dy, dx)

        const radialDelta = Math.abs(r - this.ringRadius)
        const ringCore = gaussian(radialDelta, this.ringThickness)

        const leftFlare = gaussian(angleDiff(a, Math.PI), 0.26) * gaussian(radialDelta, 0.11)
        const rightFlare = gaussian(angleDiff(a, 0), 0.26) * gaussian(radialDelta, 0.11)

        const topCrown = gaussian(angleDiff(a, -Math.PI / 2), 0.34) * gaussian(radialDelta, 0.095)

        const lowerMask = 1 - gaussian(a - Math.PI / 2, 0.55) * 0.12

        const density = Math.max(
          0,
          (ringCore * 0.92 + leftFlare * 0.95 + rightFlare * 0.95 + topCrown * 0.68) * lowerMask
        )

        if (density < 0.13) {
          continue
        }

        const noise = hash2(x * 1973.3, y * 2671.7)
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
    const targetW = 0.82
    const targetH = 0.74
    const left = this.ringCenterX - targetW / 2
    const top = this.ringCenterY - targetH / 2

    for (const pt of points) {
      const nx = (pt.x - minX) / spanX
      const ny = (pt.y - minY) / spanY

      // Keep aspect and place ring in upper logo zone, matching user reference composition.
      const x = left + nx * targetW
      const y = top + ny * targetH

      this.ringTargets.push({
        x,
        y,
        weight: 0.84,
      })
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
    this.qrModuleSizeNorm = normSize / size
    const left = this.ringCenterX - normSize / 2
    const top = this.ringCenterY - normSize / 2
    const moduleSize = this.qrModuleSizeNorm
    this.qrLayout = {
      size,
      modules: qrMatrix.modules,
      left,
      top,
      moduleSize,
    }

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (!qrMatrix.modules[y][x]) continue
        this.qrTargets.push({
          x: left + x * moduleSize + moduleSize * 0.5,
          y: top + y * moduleSize + moduleSize * 0.5,
          weight: 1,
        })
      }
    }
  }

  #initParticles() {
    this.particles = []
    const ringCount = this.ringTargets.length
    const qrCount = this.qrTargets.length
    const count = Math.max(ringCount, qrCount)

    const particleOrder = Array.from({ length: count }, (_, idx) => idx).sort(
      (a, b) => hash2(a * 3.17, a * 9.31) - hash2(b * 3.17, b * 9.31)
    )
    const qrOrder = Array.from({ length: qrCount }, (_, idx) => idx).sort(
      (a, b) => hash2(a * 7.41, a * 1.73) - hash2(b * 7.41, b * 1.73)
    )
    const qrAssignments = new Array(count).fill(-1)

    const assignCount = Math.min(qrCount, count)
    for (let n = 0; n < assignCount; n += 1) {
      const particleIdx = particleOrder[n]
      qrAssignments[particleIdx] = qrOrder[n]
    }

    for (let i = 0; i < count; i += 1) {
      const base = this.ringTargets[i % ringCount]
      const qrTargetIndex = qrAssignments[i]
      const qrLag = hash2(i * 6.7, i * 2.9) * 0.22
      this.particles.push({
        x: base.x + (hash2(i * 1.3, i * 2.1) - 0.5) * 0.006,
        y: base.y + (hash2(i * 2.8, i * 0.9) - 0.5) * 0.006,
        vx: 0,
        vy: 0,
        size: 0.82 + hash2(i * 3.1, i * 1.7) * 0.72,
        baseWeight: base.weight,
        qrTargetIndex,
        qrLag,
        qrBlend: 0,
        respawnAt: null,
        respawnCount: 0,
      })
    }
  }

  #sampleSignedNoise(i, t, kx, ky) {
    return hash2(i * kx + t * 0.17, i * ky + t * 0.11) - 0.5
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

    const jumpGate = hash2(i * 9.7 + Math.floor(t * 4.1), i * 5.1 + Math.floor(t * 2.6))
    if (jumpGate > 0.9955) {
      const theta = hash2(i * 13.3 + t, i * 2.7 + t) * Math.PI * 2
      const jumpAmp = 0.008 + hash2(i * 17.9, t * 2.2) * 0.016
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
        const stagger = 0.12 + hash2(i * 15.3 + t, i * 8.1) * 0.72
        p.respawnAt = t + stagger
      }

      if (t < p.respawnAt) {
        p.vx *= 0.82
        p.vy *= 0.82
        return
      }

      const rollA = (i + 1) * (p.respawnCount + 1) * 13.37
      const rollB = (p.respawnCount + 1) * 7.11 + t * 1.91
      const ringIndex = Math.floor(hash2(rollA, rollB) * this.ringTargets.length)
      const ringSeed = this.ringTargets[Math.max(0, Math.min(this.ringTargets.length - 1, ringIndex))]
      const jitterX = (hash2(i * 21.7 + p.respawnCount, i * 3.1 + t) - 0.5) * 0.012
      const jitterY = (hash2(i * 5.9 + t, i * 19.3 + p.respawnCount) - 0.5) * 0.012

      p.x = ringSeed.x + jitterX
      p.y = ringSeed.y + jitterY
      p.vx = (hash2(i * 11.7 + p.respawnCount, t * 0.9) - 0.5) * 0.0008
      p.vy = (hash2(i * 4.3, t * 1.2 + p.respawnCount) - 0.5) * 0.0008
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

    if (this.state === 'qr_show') {
      this.#drawExactQr(ctx)
      return
    }

    this.#updateParticles(t)
    this.#drawParticles(ctx, t)
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

    const { left, top, moduleSize, size } = this.qrLayout
    const x0 = (left - moduleSize) * this.width
    const y0 = (top - moduleSize) * this.height
    const w = (size + 2) * moduleSize * this.width
    const h = (size + 2) * moduleSize * this.height

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

  #drawExactQr(ctx) {
    if (!this.qrLayout || !Array.isArray(this.qrLayout.modules)) {
      return
    }

    const { size, modules, left, top, moduleSize } = this.qrLayout

    // Keep QR on dark field and draw only distinct bright modules (no black-on-white slab).
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (!modules[y][x]) continue

        const cx0 = (left + x * moduleSize) * this.width
        const cy0 = (top + y * moduleSize) * this.height
        const cx1 = (left + (x + 1) * moduleSize) * this.width
        const cy1 = (top + (y + 1) * moduleSize) * this.height

        const cellW = Math.max(1, cx1 - cx0)
        const cellH = Math.max(1, cy1 - cy0)
        const radius = Math.max(0.9, Math.min(cellW, cellH) * 0.34)
        const cx = cx0 + cellW * 0.5
        const cy = cy0 + cellH * 0.5

        ctx.fillStyle = 'rgba(255,255,255,0.98)'
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
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

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i]
      const ringTarget = ring[i % ring.length]

      let target
      const isQrMode = mode === 'qr_build' || mode === 'qr_show'

      if (isQrMode) {
        if (hasQr && p.qrTargetIndex >= 0) {
          const qrTarget = this.qrTargets[p.qrTargetIndex]
          if (mode === 'qr_build') {
            const localProgress = this.#particleQrProgress(qrBuildProgress, p.qrLag || 0)
            p.qrBlend = this.#advanceBlend(p.qrBlend, localProgress, 0.12)
            target = {
              x: ringTarget.x * (1 - p.qrBlend) + qrTarget.x * p.qrBlend,
              y: ringTarget.y * (1 - p.qrBlend) + qrTarget.y * p.qrBlend,
            }
          } else {
            p.qrBlend = this.#advanceBlend(p.qrBlend, 1, 0.06)
            target = {
              x: ringTarget.x * (1 - p.qrBlend) + qrTarget.x * p.qrBlend,
              y: ringTarget.y * (1 - p.qrBlend) + qrTarget.y * p.qrBlend,
            }
          }
        } else {
          if (mode === 'qr_build') {
            const localProgress = this.#particleQrProgress(qrBuildProgress, p.qrLag || 0)
            const theta = hash2(i * 12.1, i * 4.3) * Math.PI * 2 + t * 0.33
            const peel = localProgress * 0.03
            target = {
              x: ringTarget.x + Math.cos(theta) * peel,
              y: ringTarget.y + Math.sin(theta) * peel,
            }
          } else {
            this.#applyJumpDiffusionDrift(p, i, t)
            continue
          }
        }
      } else if (mode === 'dissolve') {
        p.qrBlend = this.#advanceBlend(p.qrBlend, 0, 0.08)
        const dissolveProgress = this.#stateProgress('dissolve', 3200)
        const pullBack = this.#easeInOutCubic(dissolveProgress)
        target = {
          x:
            p.x + (hash2(i * 4.9 + t, i * 1.9) - 0.5) * 0.012 * (1 - pullBack) +
            (ringTarget.x - p.x) * (0.08 + pullBack * 0.22),
          y:
            p.y + (hash2(i * 2.4, i * 7.1 + t) - 0.5) * 0.012 * (1 - pullBack) +
            (ringTarget.y - p.y) * (0.08 + pullBack * 0.22),
        }
      } else if (mode === 'entropy') {
        p.qrBlend = this.#advanceBlend(p.qrBlend, 0, 0.05)
        target = {
          x: p.x + (hash2(i * 1.9 + t * 0.2, i * 5.2) - 0.5) * 0.006,
          y: p.y + (hash2(i * 2.2, i * 2.6 + t * 0.2) - 0.5) * 0.006,
        }
      } else {
        p.qrBlend = this.#advanceBlend(p.qrBlend, 0, 0.1)
        target = ringTarget
      }

      const spring = mode === 'qr_build' ? 0.0102 : mode === 'qr_show' ? 0.0094 : mode === 'entropy' ? 0.0058 : 0.0108
      const damping = mode === 'qr_show' ? 0.972 : mode === 'entropy' ? 0.988 : 0.968

      p.vx += (target.x - p.x) * spring
      p.vy += (target.y - p.y) * spring
      p.vx *= damping
      p.vy *= damping

      p.x += p.vx
      p.y += p.vy

      if (mode === 'idle' || mode === 'active') {
        const drift = Math.sin(t * 0.26 + i * 0.009) * 0.00009
        p.x += drift
      }
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

      const pulse = energized ? 0.52 + (Math.sin(t * 3.2 + i * 0.17) + 1) * 0.2 : 0.5
      let alpha = this.state === 'entropy' ? 0.26 : pulse * (0.72 + p.baseWeight * 0.46)
      const isQrParticle = qrMode && p.qrTargetIndex >= 0
      const size = this.state === 'qr_show' && isQrParticle ? 1.14 : p.size

      if (qrMode && !isQrParticle) {
        alpha *= this.state === 'qr_build' ? 0.2 : 0.02
      }

      if (isQrParticle) {
        const reveal = qrMode ? Math.max(0, Math.min(1, p.qrBlend || 0)) : 0

        if (this.state === 'qr_show' && p.qrTargetIndex >= 0) {
          // Lock final QR to canonical grid so modules stay distinct and scan-friendly.
          const q = this.qrTargets[p.qrTargetIndex]
          const qx = q.x * this.width
          const qy = q.y * this.height
          const side = Math.max(1.4, qrPx * 0.76)
          const half = side * 0.5
          const sx = Math.round(qx - half)
          const sy = Math.round(qy - half)

          ctx.fillStyle = 'rgba(255,255,255,1)'
          ctx.fillRect(sx, sy, Math.round(side), Math.round(side))
          continue
        }

        const side = Math.max(1.5, qrPx * (0.72 + reveal * 0.16))
        const half = side * 0.5
        const shadowOffset = 0.55
        const shadowAlpha = 0.08 + reveal * 0.12

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`
        ctx.fillRect(px - half + shadowOffset, py - half + shadowOffset, side, side)

        const qrAlpha = Math.min(1, 0.82 + reveal * 0.18)
        ctx.fillStyle = `rgba(255,255,255,${qrAlpha.toFixed(3)})`
        ctx.fillRect(px - half, py - half, side, side)
        continue
      }

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
