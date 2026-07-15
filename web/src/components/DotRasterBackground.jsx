import React, { useEffect, useRef } from 'react'
import { isInteractiveSurfaceEvent } from '../utils/interactionFilters'

export default function DotRasterBackground({ theme, isBooksRoute = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const spacing = 30
    const rowStep = spacing * 0.8660254037844386
    const revealRadius = spacing * 7
    const maxDotRadius = 4.2
    const distortionStrength = spacing * 0.18
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let rafId = 0
    let touchFadeTimer = 0
    const pointer = {
      x: -10_000,
      y: -10_000,
      vx: 0,
      vy: 0,
      speed: 0,
      energy: 0,
      active: false,
      visibility: 0,
      lastX: null,
      lastY: null,
      lastT: 0,
    }

    const colors = theme?.skin?.colors || {}
    const dotColor = isBooksRoute ? '#ffffff' : (colors.text_primary || '#ffffff')

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

    const handlePointerDown = (event) => {
      if (isInteractiveSurfaceEvent(event, ['.tile', '.navigation', '.logo-element', 'a', 'button', 'input', 'textarea', 'select', '[role="button"]'])) {
        return
      }
      if (event.pointerType === 'touch') {
        pointer.x = event.clientX
        pointer.y = event.clientY
        pointer.active = true
        window.clearTimeout(touchFadeTimer)
        touchFadeTimer = window.setTimeout(() => { pointer.active = false }, 450)
      }
    }

    const handlePointerMove = (event) => {
      if (isInteractiveSurfaceEvent(event, ['.tile', '.navigation', '.logo-element', 'a', 'button', 'input', 'textarea', 'select', '[role="button"]'])) {
        pointer.active = false
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
      pointer.active = true
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      pointer.lastT = now
    }

    const handlePointerLeave = () => {
      pointer.active = false
      pointer.lastX = null
      pointer.lastY = null
    }

    const draw = (now) => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      pointer.visibility += ((pointer.active ? 1 : 0) - pointer.visibility) * 0.1
      if (pointer.visibility < 0.002) pointer.visibility = 0
      pointer.energy *= 0.91
      if (pointer.energy < 0.002) {
        pointer.energy = 0
      }

      // The page stays completely black at rest. The hex field exists only
      // inside a soft discovery radius around the pointer.
      ctx.fillStyle = dotColor
      for (let row = 0, y = 0; y <= h + rowStep; row += 1, y = row * rowStep) {
        const xOffset = (row & 1) ? spacing * 0.5 : 0
        for (let x = xOffset - spacing; x <= w + spacing; x += spacing) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const dist = Math.hypot(dx, dy)
          const influence = Math.exp(-(dist * dist) / (2 * revealRadius * revealRadius)) * pointer.visibility
          if (influence < 0.012) continue
          const motion = reducedMotion ? 0 : pointer.energy * influence * influence
          const nx = dist > 0.001 ? dx / dist : 0
          const ny = dist > 0.001 ? dy / dist : 0
          const offset = distortionStrength * motion
          const px = x + pointer.vx * offset + nx * offset * 0.28
          const py = y + pointer.vy * offset + ny * offset * 0.28

          ctx.globalAlpha = 0.78 * Math.pow(influence, 1.5)
          ctx.beginPath()
          ctx.arc(px, py, maxDotRadius * influence * influence, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(draw)
    }

    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    document.documentElement.addEventListener('pointerleave', handlePointerLeave)
    rafId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave)
      window.clearTimeout(touchFadeTimer)
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
