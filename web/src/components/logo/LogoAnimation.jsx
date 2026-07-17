import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import logoSpec from '../../data/logo/logo.json'
import ringPointSet from '../../data/logo/calyr_ring_dots_1000.json'
import LogoCanvasEngine from './LogoCanvasEngine'
import { LinkItemService } from '../../services/LinkItemService'
import { buildGlyphMatrixFromSymbol } from '../../graphics/calyr/GlyphRenderer'
import {
  mapMicroToQrRaster,
  createBrailleTouchMeMatrix,
  QR_RENDER_STATES,
} from '../../utils/qrMatrixOps'

export default function LogoAnimation({ className = '', label = '', tagline = '', layout = 'inline', showCanvas = true, contacts = [] }) {
  const [state, setState] = useState(logoSpec?.interaction?.initialState || 'idle')
  const [activeTargetIndex, setActiveTargetIndex] = useState(0)
  const engineRef = useRef(null)
  const canvasRef = useRef(null)
  const qrTimerRef = useRef(null)

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

  const buildQrMatrix = (text) => {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'H' })
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

  const qrMatrices = useMemo(() => {
    try {
      // Full QR for primary content (vCard or active target)
      let fullQrMatrix
      if (!activeTarget) {
        fullQrMatrix = buildQrMatrix(logoSpec?.qr?.text || '')
      } else if (activeTarget.kind === 'glyph') {
        const glyphMatrix = buildGlyphMatrixFromSymbol(activeTarget.symbol, {
          drawSize: 360,
          matrixSize: 15,
          threshold: 0.1,
          gamma: 0.92,
          normSize: 0.94,
          targetSizePx: logoSpec?.qr?.targetSizePx || null,
        })
        fullQrMatrix = glyphMatrix || buildQrMatrix(activeTarget.payload || logoSpec?.qr?.text || '')
      } else {
        fullQrMatrix = buildQrMatrix(activeTarget.payload || logoSpec?.qr?.text || '')
      }

      // Micro-QR for secondary interaction phase
      const microQrText = logoSpec?.microQr?.text || 'https://calyr.ai'
      const microQrCode = QRCode.create(microQrText, { errorCorrectionLevel: 'L' })
      const { size: microSize, data: microData } = microQrCode.modules
      const microModules = []
      for (let y = 0; y < microSize; y += 1) {
        const row = []
        for (let x = 0; x < microSize; x += 1) {
          row.push(Boolean(microData[y * microSize + x]))
        }
        microModules.push(row)
      }

      // Map micro-QR into center of full QR raster.
      // Keep the full QR as the only information carrier, and treat micro as illumination only.
      const microHighlightedInFull = mapMicroToQrRaster(microModules, fullQrMatrix.modules)
      const microIlluminationMask = microHighlightedInFull.map((row, y) =>
        row.map((microOn, x) => Boolean(microOn && fullQrMatrix.modules?.[y]?.[x]))
      )

      // Braille "TOUCH ME" pattern
      const brailleMatrix = createBrailleTouchMeMatrix(fullQrMatrix.size)

      return {
        full: fullQrMatrix,
        micro: {
          ...fullQrMatrix,
          // Preserve full QR bits so scan data remains unchanged in micro mode.
          modules: fullQrMatrix.modules,
          microIlluminationMask,
          renderMode: QR_RENDER_STATES.MICRO,
        },
        braille: {
          ...fullQrMatrix,
          modules: brailleMatrix,
          renderMode: QR_RENDER_STATES.BRAILLE,
        },
      }
    } catch (error) {
      console.error('Failed to build QR matrices for logo interaction:', error)
      return {
        full: null,
        micro: null,
        braille: null,
      }
    }
  }, [activeTarget])

  // For backward compatibility, expose the full matrix as qrMatrix
  const qrMatrix = qrMatrices.full

  useEffect(() => {
    if (!showCanvas) {
      return undefined
    }

    if (canvasRef.current) {
      engineRef.current = new LogoCanvasEngine(canvasRef.current, {
        ...logoSpec,
        qrMatrix,
        qrMatrices,
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
      clearTimeout(qrTimerRef.current)
      qrTimerRef.current = null
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [qrMatrix, qrMatrices, showCanvas])

  useEffect(() => {
    engineRef.current?.setState(state)
  }, [state])

  useEffect(() => {
    clearTimeout(qrTimerRef.current)
    qrTimerRef.current = null

    if (state === 'qr_build') {
      const qrBuildMs = Number(logoSpec?.states?.qr_build?.durationMs) || 2600
      qrTimerRef.current = window.setTimeout(() => {
        setState('idle')
        engineRef.current?.setState('idle')
      }, qrBuildMs)
    } else {
      return undefined
    }

    return () => {
      clearTimeout(qrTimerRef.current)
      qrTimerRef.current = null
    }
  }, [state])

  const toggleSparklingQr = () => {
    setActiveTargetIndex(0)
    clearTimeout(qrTimerRef.current)
    qrTimerRef.current = null

    // Toggle between idle (orbital particles) and QR display (via build animation)
    const nextState = state === 'idle' ? 'qr_build' : 'idle'
    setState(nextState)
    engineRef.current?.setState(nextState)
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
          aria-label="Toggle CALYR sparkling QR"
          onClick={toggleSparklingQr}
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
