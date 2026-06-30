import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import logoSpec from '../../data/logo/logo.json'
import ringPointSet from '../../data/logo/calyr_ring_dots_1000.json'
import LogoStateMachine from './LogoStateMachine'
import LogoCanvasEngine from './LogoCanvasEngine'

export default function LogoAnimation({ className = '', label = '', tagline = '', layout = 'inline', showCanvas = true }) {
  const [state, setState] = useState(logoSpec?.interaction?.initialState || 'idle')
  const machineRef = useRef(null)
  const engineRef = useRef(null)
  const canvasRef = useRef(null)

  const qrText = useMemo(() => logoSpec?.qr?.text || '', [])
  const qrMatrix = useMemo(() => {
    try {
      const qr = QRCode.create(qrText, { errorCorrectionLevel: 'M' })
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
        size,
        modules,
        normSize: 0.44,
        targetSizePx: logoSpec?.qr?.targetSizePx || null,
      }
    } catch (error) {
      console.error('Failed to build QR matrix for logo interaction:', error)
      return null
    }
  }, [qrText])

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
      machineRef.current?.triggerQrBuild()
    }

    window.addEventListener('calyr:activate-qr', onActivateQr)
    return () => window.removeEventListener('calyr:activate-qr', onActivateQr)
  }, [showCanvas])

  useEffect(() => {
    engineRef.current?.setState(state)
  }, [state])

  const handlePointerEnter = () => {
    machineRef.current?.handleHoverEnter()
  }

  const handlePointerLeave = () => {
    machineRef.current?.handleHoverLeave()
  }

  const handlePointerMove = (event) => {
    machineRef.current?.handlePointerReturn()
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
          onMouseLeave={handlePointerLeave}
          onMouseMove={handlePointerMove}
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
