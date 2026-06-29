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

    let rafId = 0

    const render = () => {
      resizeCanvas()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = performance.now()

      // Magenta ripple circles are intentionally disabled.
      // Keep canvas clear so no large ring overlay can appear.
      void now
      void ripples

      rafId = requestAnimationFrame(render)
    }

    resizeCanvas()
    rafId = requestAnimationFrame(render)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
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
