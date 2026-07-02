import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LinkItemService } from '../services/LinkItemService'
import { NavigationItemService } from '../services/NavigationItemService'
import { NodeQueryService } from '../services/NodeQueryService'
import { buildGlyphMatrixFromSymbol } from '../graphics/calyr/GlyphRenderer'
import { computeDotRepulsion, createInactivePointerField, pointerFieldFromEvent } from '../utils/dotInteraction'

function resolveContactGlyph(contactId, fallbackSymbol) {
  const normalizedId = String(contactId || '').toLowerCase()

  if (normalizedId === 'mail') return '@'
  if (normalizedId === 'whatsapp') return 'wa'
  if (normalizedId === 'x') return 'x'
  if (normalizedId === 'linkedin') return 'in'
  if (normalizedId === 'bluesky') return 'bs'
  if (normalizedId === 'youtube') return 'yt'
  if (normalizedId === 'instagram') return 'ig'
  if (normalizedId === 'impressum') return 'hm'

  return fallbackSymbol || '@'
}

function DottedContactIcon({ symbol, contactId }) {
  const canvasRef = useRef(null)
  const pointerFieldRef = useRef(createInactivePointerField())

  const setPointerFromEvent = (event, strength = 1) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    pointerFieldRef.current = pointerFieldFromEvent(event, rect, {
      radius: 0.34,
      strength,
    })
  }

  const clearPointer = () => {
    pointerFieldRef.current = createInactivePointerField()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const glyph = resolveContactGlyph(contactId, symbol)
    const matrix = buildGlyphMatrixFromSymbol(glyph, {
      drawSize: 640,
      matrixSize: 27,
      threshold: 0.1,
      gamma: 1.1,
    })

    const size = 42
    const dpr = Math.max(1, Math.min((window.devicePixelRatio || 1) * 1.5, 3))
    canvas.width = Math.floor(size * dpr)
    canvas.height = Math.floor(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (!matrix?.modules || !Array.isArray(matrix.modules)) {
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = '#ffffff'
      ctx.font = '600 18px "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(glyph || '@').slice(0, 2), size / 2, size / 2)
      return
    }

    const modules = matrix.modules
    const rows = modules.length || 1
    const cols = modules[0]?.length || 1
    const grid = Math.max(rows, cols)
    const cell = size / grid
    const offsetX = (size - cols * cell) / 2
    const offsetY = (size - rows * cell) / 2

    const hash2 = (a, b) => {
      const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123
      return s - Math.floor(s)
    }

    const dotStates = new Map()

    let rafId = null
    let mounted = true

    const renderFrame = (timeMs) => {
      if (!mounted) return

      ctx.clearRect(0, 0, size, size)
      const t = timeMs / 1000

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const v = modules[y][x]
          if (!v) continue

          const w = typeof v === 'number' ? Math.max(0.2, Math.min(1, v)) : 1
          const nx = (x + 0.5) / cols
          const ny = (y + 0.5) / rows
          const repulsion = computeDotRepulsion(nx, ny, pointerFieldRef.current, {
            maxShift: 0.06,
          })
          const key = `${x}:${y}`
          let dotState = dotStates.get(key)
          if (!dotState) {
            dotState = { dx: 0, dy: 0, vx: 0, vy: 0, spark: 0 }
            dotStates.set(key, dotState)
          }

          const flowDx = repulsion.dx
          const flowDy = repulsion.dy

          dotState.vx = (dotState.vx + (flowDx - dotState.dx) * 0.12) * 0.94
          dotState.vy = (dotState.vy + (flowDy - dotState.dy) * 0.12) * 0.94
          dotState.dx += dotState.vx
          dotState.dy += dotState.vy

          const seedA = hash2((x + 1) * 9.7, (y + 1) * 13.3)
          const microPulse = 0.02 * (Math.sin(t * (1.8 + seedA * 0.7) + seedA * Math.PI * 2) * 0.5 + 0.5)

          const r = cell * (0.19 + 0.035 * w + microPulse * 0.7)
          const px = offsetX + x * cell + cell * 0.5 + dotState.dx * size
          const py = offsetY + y * cell + cell * 0.5 + dotState.dy * size

          ctx.fillStyle = 'rgba(255,255,255,0.94)'
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(renderFrame)
    }

    rafId = requestAnimationFrame(renderFrame)

    return () => {
      mounted = false
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [symbol, contactId])

  return (
    <canvas
      ref={canvasRef}
      className="nav-contact-icon-canvas"
      aria-hidden="true"
      onPointerDown={(event) => setPointerFromEvent(event, 1.1)}
      onPointerMove={(event) => setPointerFromEvent(event, 0.42)}
      onPointerUp={clearPointer}
      onPointerCancel={clearPointer}
      onPointerLeave={clearPointer}
    />
  )
}

export default function Navigation({ theme, ast }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isContactsOpen, setIsContactsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setIsContactsOpen(false)
    }
  }, [isOpen])

  useEffect(() => {
    document.body.classList.toggle('nav-open', isOpen)
    return () => document.body.classList.remove('nav-open')
  }, [isOpen])

  const handleNavClick = () => {
    setIsOpen(false) // Close drawer after clicking
    setIsContactsOpen(false)
  }

  // Apply theme colors from skin if available
  const headerStyle = theme?.skin?.components?.header ? {
    backgroundColor: theme.skin.components.header.background,
    borderBottomColor: theme.skin.components.header.border_bottom,
    color: theme.skin.components.header.text_color,
  } : {}

  const navItems = useMemo(() => NavigationItemService.buildFromAst(ast), [ast])
  const contactPage = useMemo(() => new NodeQueryService(ast).findById('contact'), [ast])
  const contactLinks = useMemo(() => LinkItemService.buildContactLinks(contactPage), [contactPage])

  return (
    <>
      {!isOpen && (
        <button
          className="hamburger"
          onClick={() => setIsOpen(true)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="site-navigation-drawer"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      )}

      {isOpen && (
        <>
          <div className="nav-overlay" onClick={() => setIsOpen(false)} />

          <nav id="site-navigation-drawer" className="navigation mobile-nav open" style={headerStyle}>
            <div className="nav-content">
              <ul className="nav-list">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="nav-link"
                      onClick={handleNavClick}
                      style={{
                        color: '#FFFFFF',
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}

                {contactLinks.length > 0 && (
                  <li>
                    <button
                      type="button"
                      className={`nav-link nav-link-button ${isContactsOpen ? 'open' : ''}`.trim()}
                      onClick={() => setIsContactsOpen((prev) => !prev)}
                      aria-expanded={isContactsOpen}
                      aria-controls="nav-contact-cluster"
                      aria-label="Show contact links"
                    >
                      Contact
                    </button>
                  </li>
                )}
              </ul>

              {contactLinks.length > 0 && (
                <div
                  id="nav-contact-cluster"
                  className={`nav-contact-cluster ${isContactsOpen ? 'open' : ''}`.trim()}
                  aria-label="Contact links"
                >
                  {contactLinks.map((item) => (
                    <a
                      key={item.id}
                      className="nav-contact-link"
                      href={item.href}
                      target={item.href?.startsWith('http') ? '_blank' : undefined}
                      rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
                      aria-label={item.label}
                      title={item.label}
                      onClick={handleNavClick}
                    >
                      <DottedContactIcon contactId={item.id} symbol={LinkItemService.getContactSymbol(item) || '@'} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <button
              className="nav-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </nav>
        </>
      )}
    </>
  )
}
