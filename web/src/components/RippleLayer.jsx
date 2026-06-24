import React, { useRef, useEffect } from 'react'
import { useRipple } from '../context/RippleContext'

export default function RippleLayer() {
  const canvasRef = useRef(null)
  const { ripples } = useRipple()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const render = () => {
      resizeCanvas()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = performance.now()

      for (const ripple of ripples) {
        const age = now - ripple.startTime
        const progress = Math.min(1, age / ripple.duration)

        // Expanding circle
        const maxRadius = Math.hypot(canvas.width, canvas.height)
        const radius = progress * maxRadius

        // Glow/fade effect
        const alpha = Math.max(0, 1 - progress)

        // Cyan to magenta gradient in the ring
        const innerRadius = Math.max(0, radius - 12)
        const outerRadius = Math.max(innerRadius + 1, radius + 12)
        const glow = ctx.createRadialGradient(ripple.x, ripple.y, innerRadius, ripple.x, ripple.y, outerRadius)
        glow.addColorStop(0, `rgba(0, 222, 255, ${alpha * 0.6})`)
        glow.addColorStop(0.5, `rgba(255, 45, 212, ${alpha * 0.8})`)
        glow.addColorStop(1, `rgba(0, 222, 255, ${alpha * 0.4})`)

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Inner bright line
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      requestAnimationFrame(render)
    }

    resizeCanvas()
    const raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [ripples])

  return (
    <canvas
      ref={canvasRef}
      className="ripple-layer-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
        mixBlendMode: 'screen',
      }}
    />
  )
}
