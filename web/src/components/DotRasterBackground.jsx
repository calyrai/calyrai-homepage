import React, { useEffect, useRef } from 'react'
import { isInteractiveSurfaceEvent } from '../utils/interactionFilters'

export default function DotRasterBackground({ theme, isBooksRoute = false }) {
  const canvasRef = useRef(null)
  const ripplesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const spacing = 26
    const rowStep = spacing * 0.8660254037844386
    const dotRadius = 1.2
    const rippleDuration = 820
    const rippleRadius = spacing * 7
    const activationCellSize = spacing * 3
    const distortionRadius = spacing * 2.8
    const distortionStrength = spacing * 0.36
    let rafId = 0
    const pointer = {
      x: -10_000,
      y: -10_000,
      vx: 0,
      vy: 0,
      speed: 0,
      energy: 0,
      lastX: null,
      lastY: null,
      lastT: 0,
    }

    const colors = theme?.skin?.colors || {}
    const dotColor = isBooksRoute ? '#ffffff' : (colors.text_primary || '#ffffff')
    const waveColor = 'rgba(245, 245, 245, 0.28)'

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const getNearestHexPoint = (clientX, clientY) => {
      const row = Math.round(clientY / rowStep)
      const y = row * rowStep
      const xOffset = (row & 1) ? spacing * 0.5 : 0
      const col = Math.round((clientX - xOffset) / spacing)
      const x = col * spacing + xOffset

      return { x, y }
    }

    const addRippleFromClient = (clientX, clientY) => {
      const { x, y } = getNearestHexPoint(clientX, clientY)
      const dx = clientX - x
      const dy = clientY - y
      const threshold = Math.min(spacing, rowStep) * 0.52
      if (dx * dx + dy * dy > threshold * threshold) {
        return
      }
      ripplesRef.current.push({ x, y, start: performance.now() })
    }

    const isActiveCheckerCell = (clientX, clientY) => {
      const column = Math.floor(clientX / activationCellSize)
      const row = Math.floor(clientY / activationCellSize)
      return (row + column) % 2 === 0
    }

    const handlePointerDown = (event) => {
      // Never react to clicks intended for pressable foreground UI.
      if (isInteractiveSurfaceEvent(event, ['.tile', '.navigation', '.logo-element', 'a', 'button', 'input', 'textarea', 'select', '[role="button"]'])) {
        return
      }

      // Transparent checkerboard activation: only every second cell is "live".
      if (!isActiveCheckerCell(event.clientX, event.clientY)) {
        return
      }

      addRippleFromClient(event.clientX, event.clientY)
    }

    const handlePointerMove = (event) => {
      if (isInteractiveSurfaceEvent(event, ['.tile', '.navigation', '.logo-element', 'a', 'button', 'input', 'textarea', 'select', '[role="button"]'])) {
        return
      }

      const now = performance.now()
      let vx = 0
      let vy = 0
      let speed = 0

      if (pointer.lastX != null && pointer.lastY != null && pointer.lastT > 0) {
        const dt = Math.max(8, now - pointer.lastT)
        const mx = event.clientX - pointer.lastX
        const my = event.clientY - pointer.lastY
        const dist = Math.hypot(mx, my)
        speed = dist / dt
        if (dist > 0.001) {
          vx = mx / dist
          vy = my / dist
        }
      }

      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.vx = vx
      pointer.vy = vy
      pointer.speed = speed
      pointer.energy = Math.max(pointer.energy * 0.75, Math.min(1, speed * 6.8))
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      pointer.lastT = now
    }

    const draw = (now) => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      pointer.energy *= 0.91
      if (pointer.energy < 0.002) {
        pointer.energy = 0
      }

      // Dot raster base layer.
      ctx.fillStyle = dotColor
      ctx.globalAlpha = 0.28
      for (let row = 0, y = 0; y <= h + rowStep; row += 1, y = row * rowStep) {
        const xOffset = (row & 1) ? spacing * 0.5 : 0
        for (let x = xOffset - spacing; x <= w + spacing; x += spacing) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const dist = Math.hypot(dx, dy)
          const influence = pointer.energy > 0
            ? Math.exp(-(dist * dist) / (2 * distortionRadius * distortionRadius))
            : 0
          const motion = pointer.energy * influence
          const nx = dist > 0.001 ? dx / dist : 0
          const ny = dist > 0.001 ? dy / dist : 0
          const offset = distortionStrength * motion
          const px = x + pointer.vx * offset + nx * offset * 0.28
          const py = y + pointer.vy * offset + ny * offset * 0.28

          ctx.beginPath()
          ctx.arc(px, py, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Expanding circle waves.
      ctx.strokeStyle = waveColor
      const next = []
      for (const ripple of ripplesRef.current) {
        const age = Math.max(0, (now - ripple.start) / rippleDuration)
        if (age >= 1) continue
        next.push(ripple)

        const radius = Math.max(0, age * rippleRadius)
        const alpha = 1 - age

        ctx.globalAlpha = 0.35 * alpha
        ctx.lineWidth = Math.max(0.6, 1.1 * alpha)
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
        ctx.stroke()

        // Pulse the origin point.
        ctx.globalAlpha = 0.4 * alpha
        ctx.fillStyle = waveColor
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, 2.2 + age * 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ripplesRef.current = next
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(draw)
    }

    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    rafId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [theme, isBooksRoute])

  return (
    <div className="dot-raster-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="dot-raster-canvas" />
    </div>
  )
}
