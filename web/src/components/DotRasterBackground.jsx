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
    const dotRadius = 1.2
    const rippleDuration = 820
    const rippleRadius = spacing * 7
    const activationCellSize = spacing * 3
    let rafId = 0

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

    const addRippleFromClient = (clientX, clientY) => {
      const x = Math.round(clientX / spacing) * spacing
      const y = Math.round(clientY / spacing) * spacing
      const dx = clientX - x
      const dy = clientY - y
      const threshold = spacing * 0.45
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
      if (isInteractiveSurfaceEvent(event, ['.tile', '.navigation', '.logo-element', '.quick-contact-rail', 'a', 'button', 'input', 'textarea', 'select', '[role="button"]'])) {
        return
      }

      // Transparent checkerboard activation: only every second cell is "live".
      if (!isActiveCheckerCell(event.clientX, event.clientY)) {
        return
      }

      addRippleFromClient(event.clientX, event.clientY)
    }

    const draw = (now) => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      // Dot raster base layer.
      ctx.fillStyle = dotColor
      ctx.globalAlpha = 0.28
      for (let y = 0; y <= h; y += spacing) {
        for (let x = 0; x <= w; x += spacing) {
          ctx.beginPath()
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
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
    rafId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('pointerdown', handlePointerDown)
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
