/**
 * Tile Component
 * 
 * Individual card in tile grid
 * Displays: icon, title, summary, route
 * Handles: hover effects, click interactions, DRAGGING (Stage 4)
 * 
 * Stage 4: Draggable Tiles
 * - Click and drag to move tile around grid
 * - Position persists in localStorage
 * - Smooth animations and visual feedback
 * 
 * Stage 6: Context-Driven Selection
 * - Integrates with SelectionContext for Tile ↔ Graph sync
 * - Click tile → highlight corresponding node in graph
 * 
 * Stage 8: Touch Support
 * - Touch drag on mobile devices
 * - Prevents scroll during drag
 * - Touch targets ≥44px
 */

import React, { useState, useRef, useEffect } from 'react'
import { useSelection } from '../context/SelectionContext'
import { useRipple } from '../context/RippleContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useScrollCenterContext } from '../hooks/useScrollCenter'
import { ROUTE_POLICY_DATA, ROUTE_AUDIT_DATA } from '../data/runtimeArtifacts'

const STORAGE_KEY_PREFIX = 'tile_position_'
const PLATFORM_TILE_IDS = new Set(['core', 'brix', 'aflowtex', 'lithos', 'oracle', 'delphi'])
const DEFAULT_TILE_POSITION = { x: 0, y: 0 }
const MAIL_FALLBACK_ROUTE =
  (ROUTE_POLICY_DATA && typeof ROUTE_POLICY_DATA.fallback_mailto === 'string' && ROUTE_POLICY_DATA.fallback_mailto.trim())
    ? ROUTE_POLICY_DATA.fallback_mailto.trim()
    : 'mailto:rupert.tscheliessnig@calyr.ai'

const SPA_SAFE_ROUTES = new Set(
  Array.isArray(ROUTE_POLICY_DATA?.spa_routes) && ROUTE_POLICY_DATA.spa_routes.length > 0
    ? ROUTE_POLICY_DATA.spa_routes
    : ['/books', '/philosophy', '/contact'],
)

const UNRESOLVED_INTERNAL_ROUTES = new Set(
  Array.isArray(ROUTE_AUDIT_DATA?.unresolved_routes)
    ? ROUTE_AUDIT_DATA.unresolved_routes
    : [],
)

function normalizeTileRoute(route) {
  if (!route) {
    return null
  }

  const normalized = String(route).trim()
  if (!normalized) {
    return null
  }

  if (normalized.startsWith('mailto:') || /^https?:\/\//i.test(normalized)) {
    return normalized
  }

  if (normalized.startsWith('/') && UNRESOLVED_INTERNAL_ROUTES.has(normalized)) {
    return MAIL_FALLBACK_ROUTE
  }

  if (SPA_SAFE_ROUTES.has(normalized) || normalized.startsWith('/')) {
    return normalized
  }

  return MAIL_FALLBACK_ROUTE
}

function getTileLeadDotClass(accent) {
  if (accent === 'magenta') return 'tile-inline-dot-magenta'
  if (accent === 'yellow') return 'tile-inline-dot-yellow'
  if (accent === 'cyan') return 'tile-inline-dot-cyan'
  return null
}

function hashSeed(input) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return hash >>> 0
}

function seededNoise(seed, a, b, channel = 0) {
  let value = seed ^ (a * 374761393) ^ (b * 668265263) ^ (channel * 1274126177)
  value = (value ^ (value >>> 13)) * 1274126177
  value = value ^ (value >>> 16)
  return (value >>> 0) / 4294967295
}

function buildTriangleMesh(width, height, base, seed, layer = 0) {
  const rowStep = base * 0.84
  const rows = []

  let rowIndex = 0
  for (let y = -rowStep; y <= height + rowStep; y += rowStep, rowIndex += 1) {
    const row = []
    const rowOffset = rowIndex % 2 === 0 ? 0 : base * 0.5

    let colIndex = 0
    for (let x = -base; x <= width + base; x += base, colIndex += 1) {
      const nx = seededNoise(seed, rowIndex, colIndex, 1)
      const ny = seededNoise(seed, rowIndex, colIndex, 2)
      const phase = seededNoise(seed, rowIndex, colIndex, 3) * Math.PI * 2

      row.push({
        x: x + rowOffset + (nx - 0.5) * base * (0.55 + layer * 0.08),
        y: y + (ny - 0.5) * rowStep * (0.55 + layer * 0.08),
        phase,
      })
    }

    rows.push(row)
  }

  const triangles = []
  for (let r = 0; r < rows.length - 1; r += 1) {
    const upper = rows[r]
    const lower = rows[r + 1]
    const limit = Math.min(upper.length, lower.length) - 1

    for (let c = 0; c < limit; c += 1) {
      const p00 = upper[c]
      const p10 = upper[c + 1]
      const p01 = lower[c]
      const p11 = lower[c + 1]

      const flip = seededNoise(seed, r, c, 7) > 0.5
      const tint = seededNoise(seed, r, c, 8)

      if (flip) {
        triangles.push({ points: [p00, p10, p11], tint, depth: 1 + layer * 0.4 })
        triangles.push({ points: [p00, p11, p01], tint: 1 - tint, depth: 1 + layer * 0.4 })
      } else {
        triangles.push({ points: [p00, p10, p01], tint, depth: 1 + layer * 0.4 })
        triangles.push({ points: [p10, p11, p01], tint: 1 - tint, depth: 1 + layer * 0.4 })
      }
    }
  }

  return triangles
}

function mixedMeshFillColor(tint, alpha, focus = 0, highlight = 0) {
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const c = clamp(tint)
  const f = clamp(focus)
  const h = clamp(highlight)

  const cyan = { r: 0, g: 224, b: 255 }
  const magenta = { r: 255, g: 0, b: 214 }
  const white = { r: 255, g: 255, b: 255 }

  // Base blend across cyan ↔ magenta, then push toward white where highlight is strong.
  const baseR = cyan.r * (1 - c) + magenta.r * c
  const baseG = cyan.g * (1 - c) + magenta.g * c
  const baseB = cyan.b * (1 - c) + magenta.b * c

  const whiten = 0.2 + f * 0.28 + h * 0.7
  const blend = clamp(whiten)

  const r = Math.round(baseR * (1 - blend) + white.r * blend)
  const g = Math.round(baseG * (1 - blend) + white.g * blend)
  const b = Math.round(baseB * (1 - blend) + white.b * blend)
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}

function drawMeshTriangles(ctx, triangles, pointer, time, width, height, hoverActive = false) {
  const influenceRadius = Math.max(width, height) * 0.42

  for (const triangle of triangles) {
    const deformed = triangle.points.map((point) => {
      const drift = Math.sin(time * 1.1 + point.phase) * 0.26
      if (!pointer.active) {
        return { x: point.x + drift, y: point.y + drift * 0.45 }
      }

      const dx = point.x - pointer.x
      const dy = point.y - pointer.y
      const distance = Math.hypot(dx, dy) || 1
      const local = Math.max(0, 1 - distance / influenceRadius)
      const push = local * local * 18 * triangle.depth
      const nx = dx / distance
      const ny = dy / distance

      return {
        x: point.x + nx * push + drift,
        y: point.y + ny * push + drift * 0.45,
      }
    })

    const centroidX = (deformed[0].x + deformed[1].x + deformed[2].x) / 3
    const centroidY = (deformed[0].y + deformed[1].y + deformed[2].y) / 3
    const cdx = centroidX - pointer.x
    const cdy = centroidY - pointer.y
    const cdist = Math.hypot(cdx, cdy)
    const focus = pointer.active ? Math.max(0, 1 - cdist / influenceRadius) : 0

    // Directional highlight gives a pseudo-reflective look that follows the mouse.
    const angle = Math.atan2(cdy, cdx)
    const reflectiveBand = (Math.sin(angle * 2 + time * 0.7) + 1) * 0.5
    const highlight = pointer.active ? focus * reflectiveBand : 0

    const strokeAlpha = 0.26 + triangle.depth * 0.08 + focus * 0.62
    const fillAlpha = focus > 0.02 ? 0.08 + focus * 0.28 : 0.04
    const lineWidth = 0.42 + triangle.depth * 0.2 + focus * 0.95

    ctx.beginPath()
    ctx.moveTo(deformed[0].x, deformed[0].y)
    ctx.lineTo(deformed[1].x, deformed[1].y)
    ctx.lineTo(deformed[2].x, deformed[2].y)
    ctx.closePath()

    ctx.fillStyle = mixedMeshFillColor(triangle.tint, fillAlpha, focus, highlight)
    ctx.fill()

    ctx.lineWidth = lineWidth
    // Keep edges subtle and mostly neutral so the reflective effect lives in triangle areas.
    ctx.strokeStyle = `rgba(170, 220, 232, ${strokeAlpha.toFixed(3)})`
    ctx.stroke()
  }
}

export default function Tile({ node, theme, context = {} }) {
  const {
    id,
    title,
    tile_lead: tileLead,
    tile_accent: tileAccent,
    tile_title: tileTitle,
    tile_summary: tileSummary,
    subtitle,
    landing_message: landingMessage,
    summary,
    icon,
    route,
    relations = {},
  } = node
  const showTileMesh = true
  const isPlatformTile = PLATFORM_TILE_IDS.has(id)
  const leadDotClass = getTileLeadDotClass(tileAccent)
  const institutions = Array.isArray(node.institutions) ? node.institutions : []
  const visibleInstitutions = institutions.filter((institution) => institution?.visibility?.public !== false)
  const topLineText = tileLead || icon
  const primaryTitle = tileTitle || (tileLead ? subtitle || title : title)
  const secondarySummary = tileSummary || (tileLead ? landingMessage || summary : summary)
  const shouldShowTopLine = Boolean(topLineText)
  const { selectedTile, setSelectedTile } = useSelection()
  const { ripples } = useRipple()
  const isMobileViewport = useIsMobile()
  const scrollCenter = useScrollCenterContext()
  const isScrollCentered = Boolean(
    isMobileViewport &&
    scrollCenter &&
    scrollCenter.centerTileId === id,
  )
  
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isFoilCovered, setIsFoilCovered] = useState(isPlatformTile)
  const [ripplePulse, setRipplePulse] = useState(0)
  const [position, setPosition] = useState(DEFAULT_TILE_POSITION)
  const [dragStart, setDragStart] = useState(null)
  const hasDraggedRef = useRef(false)
  const dragThreshold = 6
  
  const tileRef = useRef(null)
  const meshCanvasRef = useRef(null)
  const meshPointerRef = useRef({ x: 0, y: 0, active: false })
  const meshHoverRef = useRef(false)
  const meshLayersRef = useRef([])
  const meshRafRef = useRef(null)
  const meshStartRef = useRef(performance.now())

  // Desktop supports persistent tile placement; phone always renders tiles at origin.
  useEffect(() => {
    if (isMobileViewport) {
      setPosition(DEFAULT_TILE_POSITION)
      return
    }

    const savedPosition = localStorage.getItem(STORAGE_KEY_PREFIX + id)
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition))
      } catch (e) {
        console.warn(`Failed to load position for tile ${id}`, e)
      }
    }
  }, [id, isMobileViewport])

  useEffect(() => {
    if (!scrollCenter?.registerTile) {
      return undefined
    }

    scrollCenter.registerTile(id, tileRef.current)
    return () => {
      scrollCenter.registerTile(id, null)
    }
  }, [id, scrollCenter])

  // Save position to localStorage when it changes
  useEffect(() => {
    if (isMobileViewport) {
      return
    }

    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(position))
    }
  }, [position, id, isMobileViewport])

  useEffect(() => {
    if (!isMobileViewport) {
      return
    }

    setIsDragging(false)
    setDragStart(null)
    hasDraggedRef.current = false
  }, [isMobileViewport])

  // Detect ripple pulses passing through this tile
  useEffect(() => {
    if (!showTileMesh) {
      setRipplePulse(0)
      return
    }

    if (!tileRef.current || ripples.length === 0) {
      setRipplePulse(0)
      return
    }

    const rect = tileRef.current.getBoundingClientRect()
    const tileCenterX = rect.left + rect.width / 2
    const tileCenterY = rect.top + rect.height / 2
    const tileRadius = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2

    let maxPulse = 0
    const now = performance.now()

    for (const ripple of ripples) {
      const age = now - ripple.startTime
      const progress = Math.max(0, Math.min(1, age / ripple.duration))
      
      // Calculate expanding circle radius (screen diagonal)
      const maxRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2)
      const rippleRadius = progress * maxRadius

      // Distance from ripple center to tile center
      const dx = ripple.x - tileCenterX
      const dy = ripple.y - tileCenterY
      const distToTile = Math.sqrt(dx * dx + dy * dy)

      // Calculate proximity pulse (peak when ripple is at tile)
      const influence = tileRadius + 120 // influence zone around tile
      const distance = Math.abs(distToTile - rippleRadius)
      
      if (distance < influence) {
        // Pulse peaks when distance = 0, fades at edges
        const pulse = Math.max(0, 1 - distance / influence) * (1 - progress)
        maxPulse = Math.max(maxPulse, pulse)
      }
    }

    setRipplePulse(maxPulse)
  }, [ripples, showTileMesh])

  const handleMouseDown = (e) => {
    if (isMobileViewport) {
      return
    }

    // Don't drag if clicking on a link
    if (route && e.target.closest('.tile-link-indicator')) {
      return
    }

    hasDraggedRef.current = false
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: e.clientX,
      elementY: e.clientY,
    })
  }

  // Stage 8: Touch event handlers
  const handleTouchStart = (e) => {
    const touchPoint = e.touches?.[0]
    if (touchPoint) {
      meshHoverRef.current = true
      const rect = tileRef.current?.getBoundingClientRect()
      if (rect) {
        meshPointerRef.current = {
          x: touchPoint.clientX - rect.left,
          y: touchPoint.clientY - rect.top,
          active: true,
        }
      }
    }

    // On mobile we prioritize native page scrolling over tile dragging.
    if (isMobileViewport) {
      return
    }

    // Don't drag if clicking on a link
    if (route && e.target.closest('.tile-link-indicator')) {
      return
    }
    
    const touch = e.touches[0]
    hasDraggedRef.current = false
    
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      elementX: touch.clientX,
      elementY: touch.clientY,
    })
    
    // Prevent scroll during drag on non-mobile touch devices.
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!dragStart) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    const movedDistance = Math.hypot(e.clientX - dragStart.elementX, e.clientY - dragStart.elementY)

    if (movedDistance < dragThreshold) {
      return
    }

    if (!isDragging) {
      hasDraggedRef.current = true
      setIsDragging(true)
    }
    
    setPosition({
      x: position.x + deltaX,
      y: position.y + deltaY,
    })
    
    setDragStart({
      ...dragStart,
      x: e.clientX,
      y: e.clientY,
    })
  }

  // Stage 8: Touch move handler
  const handleTouchMove = (e) => {
    const touch = e.touches?.[0]
    if (touch) {
      const rect = tileRef.current?.getBoundingClientRect()
      if (rect) {
        meshPointerRef.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          active: true,
        }
      }
    }

    if (!dragStart) return

    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    const movedDistance = Math.hypot(touch.clientX - dragStart.elementX, touch.clientY - dragStart.elementY)

    if (movedDistance < dragThreshold) {
      return
    }

    if (!isDragging) {
      hasDraggedRef.current = true
      setIsDragging(true)
    }
    
    setPosition({
      x: position.x + deltaX,
      y: position.y + deltaY,
    })
    
    setDragStart({
      ...dragStart,
      x: touch.clientX,
      y: touch.clientY,
    })
    
    // Prevent scroll during drag
    e.preventDefault()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  // Stage 8: Touch end handler
  const handleTouchEnd = () => {
    setIsDragging(false)
    setDragStart(null)
    meshHoverRef.current = false
    meshPointerRef.current.active = false
  }

  // Track pointer movement from press -> release to detect drag threshold.
  useEffect(() => {
    if (!dragStart) return undefined

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragStart, position, isDragging])

  useEffect(() => {
    setIsFoilCovered(isPlatformTile)
  }, [id, isPlatformTile])

  useEffect(() => {
    if (!showTileMesh) {
      return
    }

    const tile = tileRef.current
    const canvas = meshCanvasRef.current
    if (!tile || !canvas) return

    const context2d = canvas.getContext('2d')
    if (!context2d) return

    const seed = hashSeed(id)

    const resizeCanvas = () => {
      const rect = tile.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Single mesh layer per tile.
      meshLayersRef.current = [buildTriangleMesh(rect.width, rect.height, 21 + (seed % 7), seed, 0)]
    }

    const renderMesh = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return

      const now = performance.now()
      const time = (now - meshStartRef.current) * 0.001
      const pointer = meshPointerRef.current

      context2d.clearRect(0, 0, width, height)
      for (const layer of meshLayersRef.current) {
        drawMeshTriangles(context2d, layer, pointer, time, width, height, meshHoverRef.current)
      }

      if (pointer.active) {
        const glow = context2d.createRadialGradient(pointer.x, pointer.y, 4, pointer.x, pointer.y, Math.max(width, height) * 0.42)
        glow.addColorStop(0, 'rgba(70, 220, 255, 0.22)')
        glow.addColorStop(0.4, 'rgba(0, 224, 255, 0.12)')
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        context2d.fillStyle = glow
        context2d.fillRect(0, 0, width, height)
      }
    }

    const tick = () => {
      renderMesh()
      meshRafRef.current = requestAnimationFrame(tick)
    }

    resizeCanvas()
    renderMesh()
    meshRafRef.current = requestAnimationFrame(tick)

    const observer = new ResizeObserver(() => {
      resizeCanvas()
      renderMesh()
    })
    observer.observe(tile)

    return () => {
      observer.disconnect()
      if (meshRafRef.current) {
        cancelAnimationFrame(meshRafRef.current)
        meshRafRef.current = null
      }
    }
  }, [id, showTileMesh])

  const handleClick = (e) => {
    // Don't trigger click if we were dragging
    if (isDragging || hasDraggedRef.current) {
      hasDraggedRef.current = false
      return
    }

    // Toggle selection in context (Stage 6)
    setSelectedTile(id)

    // Platform nodes: toggle metallic foil reveal/cover.
    if (isPlatformTile) {
      setIsFoilCovered((prev) => !prev)
      return
    }

    if (!e.target.closest('.tile-link-indicator')) {
      const preferredRoute = route || (visibleInstitutions.length > 0 && id ? `/${id}` : route)
      const normalizedRoute = normalizeTileRoute(preferredRoute)

      if (normalizedRoute) {
        if (SPA_SAFE_ROUTES.has(normalizedRoute)) {
          window.history.pushState({}, '', normalizedRoute)
          window.dispatchEvent(new PopStateEvent('popstate'))
        } else {
          window.location.href = normalizedRoute
        }
      }
    }
  }

  const isSelected = selectedTile === id

  const handleMouseEnter = () => {
    setIsHovered(true)
    meshHoverRef.current = true
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    meshHoverRef.current = false
    meshPointerRef.current.active = false
  }

  const handleCursorMove = (e) => {
    const tile = tileRef.current
    if (!tile) return
    const rect = tile.getBoundingClientRect()
    meshPointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    }
  }

  const activePosition = isMobileViewport ? DEFAULT_TILE_POSITION : position

  const tileStyle = {
    transform: `translate(${activePosition.x}px, ${activePosition.y}px)`,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    cursor: isMobileViewport ? 'pointer' : isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    // Apply theme colors
    ...(theme?.skin?.components?.tile && {
      backgroundColor: theme.skin.components.tile.background,
      color: theme.skin.components.tile.text_color,
      borderColor: theme.skin.components.tile.border,
    }),
  }

  return (
    <div
      ref={tileRef}
      className={`tile ${isSelected ? 'tile-selected' : ''} ${
        isHovered ? 'tile-hovered' : ''
      } ${isDragging ? 'tile-dragging' : ''} ${
        isPlatformTile ? 'tile-platform' : ''
      } ${isFoilCovered ? 'tile-foil-covered' : 'tile-foil-open'} ${
        isScrollCentered ? 'tile-scroll-centered' : ''
      }`}
      id={id}
      data-type="tile"
      data-draggable="true"
      aria-label={title || id}
      title={title || id}
      style={tileStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={showTileMesh ? handleCursorMove : undefined}
      onTouchMove={showTileMesh ? handleTouchMove : undefined}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {showTileMesh && (
        <canvas 
          className="tile-mesh-canvas" 
          ref={meshCanvasRef} 
          aria-hidden="true"
          style={{
            opacity: 0.42 + ripplePulse * 0.28,
            filter: ripplePulse > 0 ? `saturate(${1 + ripplePulse * 0.5}) brightness(${1 + ripplePulse * 0.3})` : 'none',
            transition: 'opacity 0.1s linear, filter 0.1s linear',
          }}
        />
      )}

      {isPlatformTile && (
        <div className="tile-foil-overlay" aria-hidden="true">
          <div className="tile-foil-shine" />
        </div>
      )}

      {/* Tile icon */}
      {shouldShowTopLine && (
        <div className={`tile-icon ${leadDotClass ? `tile-topline-with-dot ${leadDotClass}` : ''}`}>
          <span>{topLineText}</span>
        </div>
      )}

      {/* Tile content */}
      <div className="tile-content">
        <>
          {primaryTitle && <h3 className="tile-title">{primaryTitle}</h3>}
          {secondarySummary && <p className="tile-summary">{secondarySummary}</p>}
        </>
      </div>

      {/* Link indicator */}
      {route && <div className="tile-link-indicator">→</div>}
      
      {/* Drag handle indicator */}
      {isDragging && <div className="tile-drag-handle">✋ Moving...</div>}
    </div>
  )
}
