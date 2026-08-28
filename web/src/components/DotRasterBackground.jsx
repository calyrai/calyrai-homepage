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
    const isLandingRoute = window.location.pathname === '/'
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

      // Keep a quiet molecular field alive on the landing page. Pointer motion
      // locally reveals, brightens and bends it without competing with copy.
      if (isLandingRoute) {
        const hexRadius = Math.max(46, Math.min(67, w * .045))
        const hexWidth = hexRadius * Math.sqrt(3)
        const rowGap = hexRadius * 1.5
        const phase = reducedMotion ? 0 : now * .00032
        const distort = (x, y) => {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.max(1, Math.hypot(dx, dy))
          const influence = Math.exp(-(distance * distance) / (2 * revealRadius * revealRadius)) * pointer.visibility
          const pulse = .5 + .5 * Math.sin(phase * 2.2 + x * .008 - y * .006)
          const energy = reducedMotion ? 0 : (4.2 + pulse * 2.8) * (.22 + influence * 1.35)
          return {
            x: x + Math.sin(phase + y * .007) * energy + pointer.vx * pointer.energy * influence * 15,
            y: y + Math.cos(phase * .83 + x * .006) * energy + pointer.vy * pointer.energy * influence * 15,
            influence,
          }
        }

        ctx.lineWidth = 1
        for (let row = -1, cy = -rowGap; cy < h + rowGap; row += 1, cy = row * rowGap) {
          const offset = (row & 1) ? hexWidth * .5 : 0
          for (let cx = offset - hexWidth; cx < w + hexWidth; cx += hexWidth) {
            const vertices = Array.from({ length: 6 }, (_, index) => {
              const angle = Math.PI / 6 + index * Math.PI / 3
              return distort(cx + Math.cos(angle) * hexRadius, cy + Math.sin(angle) * hexRadius)
            })
            const localInfluence = Math.max(...vertices.map((vertex) => vertex.influence))
            const breathe = reducedMotion ? .11 : .09 + .035 * (.5 + .5 * Math.sin(phase * 2 + cx * .004 + cy * .005))
            ctx.beginPath()
            vertices.forEach((vertex, index) => {
              if (index === 0) ctx.moveTo(vertex.x, vertex.y)
              else ctx.lineTo(vertex.x, vertex.y)
            })
            ctx.closePath()
            ctx.strokeStyle = dotColor
            ctx.globalAlpha = Math.min(.42, breathe + localInfluence * .31)
            ctx.stroke()

            vertices.forEach((vertex) => {
              if (vertex.influence < .035) return
              ctx.beginPath()
              ctx.arc(vertex.x, vertex.y, 1.1 + vertex.influence * 2.2, 0, Math.PI * 2)
              ctx.globalAlpha = .22 + vertex.influence * .65
              ctx.fillStyle = dotColor
              ctx.fill()
            })
          }
        }
        ctx.globalAlpha = 1
      }

      ctx.fillStyle = dotColor
      for (let row = 0, y = 0; y <= h + rowStep; row += 1, y = row * rowStep) {
        const xOffset = (row & 1) ? spacing * 0.5 : 0
        for (let x = xOffset - spacing; x <= w + spacing; x += spacing) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const dist = Math.hypot(dx, dy)
          const passive = isLandingRoute ? .055 + .025 * (.5 + .5 * Math.sin(now * .0012 + x * .018 - y * .014)) : 0
          const influence = Math.min(1, passive + Math.exp(-(dist * dist) / (2 * revealRadius * revealRadius)) * pointer.visibility)
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
