import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import logoSpec from '../../data/logo/logo.json'
import ringPointSet from '../../data/logo/calyr_ring_dots_1000.json'
import LogoStateMachine from './LogoStateMachine'
import LogoCanvasEngine from './LogoCanvasEngine'

export default function LogoAnimation({ className = '', label = '', layout = 'inline' }) {
  const [state, setState] = useState('idle')
  const machineRef = useRef(null)
  const engineRef = useRef(null)
  const canvasRef = useRef(null)
  const hasTriggeredUpperHoverRef = useRef(false)

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
        normSize: 0.58,
      }
    } catch (error) {
      console.error('Failed to build QR matrix for logo interaction:', error)
      return null
    }
  }, [qrText])

  useEffect(() => {
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
  }, [qrMatrix])

  useEffect(() => {
    engineRef.current?.setState(state)
  }, [state])

  const handlePointerEnter = () => {
    machineRef.current?.handleHoverEnter()
  }

  const handlePointerLeave = () => {
    hasTriggeredUpperHoverRef.current = false
    machineRef.current?.handleHoverLeave()
  }

  const handleClick = () => {
    machineRef.current?.triggerQrBuild()
  }

  const handlePointerMove = (event) => {
    machineRef.current?.handlePointerReturn()

    const activationZone = logoSpec?.interaction?.upperActivationZoneFraction ?? 0.36
    const rect = event.currentTarget.getBoundingClientRect()
    const y = event.clientY - rect.top
    const inUpperActivationZone = y <= rect.height * activationZone

    if (inUpperActivationZone && !hasTriggeredUpperHoverRef.current) {
      hasTriggeredUpperHoverRef.current = true
      machineRef.current?.triggerQrBuild()
    }

    if (!inUpperActivationZone) {
      hasTriggeredUpperHoverRef.current = false
    }
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

  return (
    <div className={`calyr-logo-wrap calyr-logo-wrap--${layout}`}>
      <div
        className={`calyr-logo-interactive ${className}`.trim()}
        data-logo-state={state}
        aria-label="CALYR interactive logo"
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onMouseMove={handlePointerMove}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
          }
        }}
      >
        <div
          className={`calyr-logo-through-line ${state === 'active' || state === 'qr_build' ? 'energized' : ''}`}
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="calyr-logo-canvas" aria-hidden="true" />
      </div>
      {label && <div className="calyr-logo-label">{renderLabel(label)}</div>}
    </div>
  )
}
