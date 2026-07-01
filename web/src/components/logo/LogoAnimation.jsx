import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import logoSpec from '../../data/logo/logo.json'
import ringPointSet from '../../data/logo/calyr_ring_dots_1000.json'
import LogoStateMachine from './LogoStateMachine'
import LogoCanvasEngine from './LogoCanvasEngine'
import { LinkItemService } from '../../services/LinkItemService'
import { buildGlyphMatrixFromSymbol } from '../../graphics/calyr/GlyphRenderer'
import { pointerFieldFromEvent } from '../../utils/dotInteraction'

const SWIPE_THRESHOLD_PX = 26
const TAP_MAX_MOVEMENT_PX = 14
const DOUBLE_TAP_MAX_DELAY_MS = 320
const AUTO_RETURN_TO_QR_MS = 6000

export default function LogoAnimation({ className = '', label = '', tagline = '', layout = 'inline', showCanvas = true, contacts = [] }) {
  const [state, setState] = useState(logoSpec?.interaction?.initialState || 'idle')
  const [activeTargetIndex, setActiveTargetIndex] = useState(0)
  const machineRef = useRef(null)
  const engineRef = useRef(null)
  const canvasRef = useRef(null)
  const swipeRef = useRef({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 })
  const gestureRef = useRef({ lastTapAt: 0 })

  const contactLinks = useMemo(() => LinkItemService.buildContactLinks({ contacts }), [contacts])
  const swipeTargets = useMemo(() => {
    const base = [
      {
        id: 'qr-default',
        kind: 'qr',
        symbol: 'QR',
        label: 'Default QR',
        payload: logoSpec?.qr?.text || '',
      },
    ]

    const mapped = contactLinks.map((item) => ({
      id: item.id,
      kind: 'glyph',
      symbol: LinkItemService.getContactSymbol(item) || '@',
      label: item.label,
      payload: item.href,
    }))

    return [...base, ...mapped]
  }, [contactLinks])

  useEffect(() => {
    setActiveTargetIndex((prev) => {
      if (!Number.isFinite(prev)) return 0
      if (swipeTargets.length === 0) return 0
      return Math.min(prev, swipeTargets.length - 1)
    })
  }, [swipeTargets])

  const activeTarget = swipeTargets[Math.max(0, Math.min(activeTargetIndex, swipeTargets.length - 1))] || swipeTargets[0]

  useEffect(() => {
    if (!showCanvas) return undefined
    if (!activeTarget || activeTarget.kind !== 'glyph') return undefined

    const timeoutId = window.setTimeout(() => {
      setActiveTargetIndex(0)
      machineRef.current?.triggerQrBuild()
    }, AUTO_RETURN_TO_QR_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activeTarget, showCanvas])

  const buildQrMatrix = (text) => {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' })
    const { size, data } = qr.modules
    const modules = []
    for (let y = 0; y < size; y += 1) {
      const row = []
      for (let x = 0; x < size; x += 1) {
        row.push(Boolean(data[y * size + x]))
      }
      modules.push(row)
    }
    return {
      kind: 'qr',
      size,
      modules,
      quietModules: 2,
      normSize: 0.44,
      targetSizePx: logoSpec?.qr?.targetSizePx || null,
    }
  }

  const qrMatrix = useMemo(() => {
    try {
      if (!activeTarget) {
        return buildQrMatrix(logoSpec?.qr?.text || '')
      }

      if (activeTarget.kind === 'glyph') {
        const glyphMatrix = buildGlyphMatrixFromSymbol(activeTarget.symbol, {
          drawSize: 360,
          matrixSize: 15,
          threshold: 0.1,
          gamma: 0.92,
          normSize: 0.94,
          targetSizePx: logoSpec?.qr?.targetSizePx || null,
        })
        if (glyphMatrix) {
          return glyphMatrix
        }
      }

      return buildQrMatrix(activeTarget.payload || logoSpec?.qr?.text || '')
    } catch (error) {
      console.error('Failed to build QR matrix for logo interaction:', error)
      return null
    }
  }, [activeTarget])

  useEffect(() => {
    if (!showCanvas) {
      return undefined
    }

    let active = true

    const machine = new LogoStateMachine(logoSpec, (nextState) => {
      if (active) {
        setState(nextState)
      }
    })
    machineRef.current = machine

    if (canvasRef.current) {
      engineRef.current = new LogoCanvasEngine(canvasRef.current, {
        ...logoSpec,
        qrMatrix,
        qrSnapToGrid: true,
        gridSpacingPx: 26,
        qrGridQuantumPx: 4,
        ringPointSet,
        ringPointBounds: {
          minX: 26,
          minY: 0,
          maxX: 508,
          maxY: 458,
        },
      })
    }

    return () => {
      active = false
      machine.destroy()
      machineRef.current = null
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [qrMatrix, showCanvas])

  useEffect(() => {
    const onActivateQr = () => {
      if (!showCanvas) {
        return
      }
      setActiveTargetIndex(0)
      machineRef.current?.triggerQrBuild()
    }

    window.addEventListener('calyr:activate-qr', onActivateQr)
    return () => window.removeEventListener('calyr:activate-qr', onActivateQr)
  }, [showCanvas])

  useEffect(() => {
    if (!showCanvas) return
    machineRef.current?.triggerQrBuild()
  }, [activeTargetIndex, showCanvas])

  useEffect(() => {
    engineRef.current?.setState(state)
  }, [state])

  const handlePointerEnter = () => {
    machineRef.current?.handleHoverEnter()
  }

  const handlePointerLeave = () => {
    machineRef.current?.handleHoverLeave()
  }

  const handlePointerMove = () => {
    machineRef.current?.handlePointerReturn()
  }

  const updateInteractionField = (event, strength = 1) => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas || !engine) return
    const rect = canvas.getBoundingClientRect()
    const pointerField = pointerFieldFromEvent(event, rect, {
      radius: 0.22,
      strength,
    })
    engine.setInteractionField(pointerField)
  }

  const clearInteractionField = () => {
    engineRef.current?.clearInteractionField()
  }

  const stepSwipeTarget = (delta) => {
    if (swipeTargets.length <= 1) return
    setActiveTargetIndex((prev) => {
      const next = (prev + delta + swipeTargets.length) % swipeTargets.length
      return next
    })
  }

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    swipeRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      endX: event.clientX,
      endY: event.clientY,
    }
    updateInteractionField(event, 1.05)
  }

  const handlePointerDrag = (event) => {
    const swipe = swipeRef.current
    if (swipe.active) {
      swipeRef.current.endX = event.clientX
      swipeRef.current.endY = event.clientY
    }
    updateInteractionField(event, 0.95)
  }

  const handlePointerUp = () => {
    const swipe = swipeRef.current
    if (swipe.active) {
      const dx = swipe.endX - swipe.startX
      const dy = swipe.endY - swipe.startY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx >= SWIPE_THRESHOLD_PX && absDx > absDy) {
        const direction = dx > 0 ? 1 : -1
        stepSwipeTarget(direction)
      } else if (absDx <= TAP_MAX_MOVEMENT_PX && absDy <= TAP_MAX_MOVEMENT_PX) {
        const now = Date.now()
        const elapsedSinceLastTap = now - gestureRef.current.lastTapAt
        if (elapsedSinceLastTap <= DOUBLE_TAP_MAX_DELAY_MS) {
          stepSwipeTarget(1)
          gestureRef.current.lastTapAt = 0
        } else {
          gestureRef.current.lastTapAt = now
        }
      }
    }
    swipeRef.current.active = false
    clearInteractionField()
  }

  const renderLabel = (value) => {
    if (!value) return null
    const normalized = String(value)
    const accentIndex = normalized.lastIndexOf('í')
    if (accentIndex === -1) {
      return <span>{normalized}</span>
    }
    const base = normalized.slice(0, accentIndex)
    return (
      <>
        <span>{base}</span>
        <span className="calyr-logo-label-accent">í</span>
      </>
    )
  }

  const renderTagline = (value) => {
    if (!value) return null
    const normalized = String(value).trim()
    const base = normalized.replace(/[.\s]+$/g, '')
    return (
      <>
        <span>{base}</span>
        <span className="calyr-logo-label-point" aria-hidden="true">.</span>
      </>
    )
  }

  return (
    <div className={`calyr-logo-wrap calyr-logo-wrap--${layout}`}>
      {showCanvas && (
        <div
          className={`calyr-logo-interactive ${className}`.trim()}
          data-logo-state={state}
          aria-label="CALYR interactive logo"
          onMouseEnter={handlePointerEnter}
          onMouseLeave={() => {
            handlePointerLeave()
            clearInteractionField()
          }}
          onMouseMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerDrag}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <canvas ref={canvasRef} className="calyr-logo-canvas" aria-hidden="true" />
        </div>
      )}
      {(label || tagline) && (
        <div className="calyr-logo-lockup">
          {label && <div className="calyr-logo-label">{renderLabel(label)}</div>}
          {tagline && <div className="calyr-logo-tagline">{renderTagline(tagline)}</div>}
        </div>
      )}
    </div>
  )
}
