import React, { useEffect, useRef, useState } from 'react'
import { LinkItemService } from '../services/LinkItemService'

const DRAG_THRESHOLD_PX = 2
const DRAG_SAFETY_TIMEOUT_MS = 8000
const RAIL_EDGE_GUTTER_PX = 8

export default function QuickContactRail({ page, variant = 'floating' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [topPx, setTopPx] = useState(null)
  const [leftPx, setLeftPx] = useState(null)
  const railRef = useRef(null)
  const suppressNextClickRef = useRef(false)
  const dragRef = useRef({
    active: false,
    startPointerX: 0,
    startPointerY: 0,
    startTopPx: 0,
    startLeftPx: 0,
    moved: false,
  })
  const contactLinks = LinkItemService.buildContactLinks(page)

  if (!page || contactLinks.length === 0) {
    return null
  }

  const handleQrButtonClick = () => {
    window.dispatchEvent(new CustomEvent('calyr:activate-qr'))
  }

  if (variant === 'inline') {
    const tabLabel = page.title || page.id || 'contact'
    return (
      <section className="quick-contact-inline" aria-label={tabLabel}>
        <div className="quick-contact-inline-links">
          <button
            type="button"
            className="quick-contact-link quick-contact-link--qr"
            onClick={handleQrButtonClick}
            aria-label="QR"
            title="QR"
          >
            <span className="quick-contact-icon" aria-hidden="true">QR</span>
          </button>
          {contactLinks.map((item) => (
            <a
              key={item.id}
              className="quick-contact-link"
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <span className="quick-contact-icon" aria-hidden="true">{LinkItemService.getContactSymbol(item) || '@'}</span>
            </a>
          ))}
        </div>
      </section>
    )
  }

  const toggleOpen = () => setIsOpen((prev) => !prev)

  useEffect(() => {
    if (!isDragging) return
    const timeout = setTimeout(() => {
      setIsDragging(false)
      dragRef.current.active = false
    }, DRAG_SAFETY_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [isDragging])

  const clampTop = (nextTop, railHeightOverride) => {
    if (typeof window === 'undefined') return nextTop
    const railHeight = railHeightOverride || railRef.current?.offsetHeight || 220
    const minTop = window.innerWidth <= 768 ? 12 : 76
    const maxTop = Math.max(minTop, window.innerHeight - railHeight - 12)
    return Math.max(minTop, Math.min(maxTop, nextTop))
  }

  const clampLeft = (nextLeft, railWidthOverride) => {
    if (typeof window === 'undefined') return nextLeft
    const railWidth = railWidthOverride || railRef.current?.offsetWidth || 96
    const minLeft = RAIL_EDGE_GUTTER_PX
    const maxLeft = Math.max(minLeft, window.innerWidth - railWidth - RAIL_EDGE_GUTTER_PX)
    return Math.max(minLeft, Math.min(maxLeft, nextLeft))
  }

  useEffect(() => {
    const initializePosition = () => {
      if (typeof window === 'undefined') return
      const railWidth = railRef.current?.offsetWidth || 96
      const railHeight = railRef.current?.offsetHeight || 220
      const defaultTop = Math.round(window.innerHeight * 0.3)
      const defaultLeft = 0
      setTopPx((prev) => clampTop(prev == null ? defaultTop : prev, railHeight))
      setLeftPx((prev) => clampLeft(prev == null ? defaultLeft : prev, railWidth))
    }

    initializePosition()
    window.addEventListener('resize', initializePosition)
    return () => {
      window.removeEventListener('resize', initializePosition)
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleDocPointerMove = (event) => {
      const drag = dragRef.current
      if (!drag.active) return
      const deltaX = event.clientX - drag.startPointerX
      const deltaY = event.clientY - drag.startPointerY
      if (Math.abs(deltaX) > DRAG_THRESHOLD_PX || Math.abs(deltaY) > DRAG_THRESHOLD_PX) {
        dragRef.current.moved = true
      }

      setLeftPx(clampLeft(drag.startLeftPx + deltaX))
      setTopPx(clampTop(drag.startTopPx + deltaY))
    }

    const handleDocPointerUp = (event) => {
      const drag = dragRef.current
      if (!drag.active) return

      dragRef.current.active = false
      setIsDragging(false)

      const railWidth = railRef.current?.offsetWidth || 96
      const leftCandidate = clampLeft(drag.startLeftPx + (event.clientX - drag.startPointerX), railWidth)
      const leftAnchor = RAIL_EDGE_GUTTER_PX
      const rightAnchor = Math.max(leftAnchor, window.innerWidth - railWidth - RAIL_EDGE_GUTTER_PX)
      const snappedLeft = Math.abs(leftCandidate - leftAnchor) <= Math.abs(leftCandidate - rightAnchor)
        ? leftAnchor
        : rightAnchor
      setLeftPx(snappedLeft)

      const target = event.target
      const isLinkTarget = target instanceof Element && !!target.closest('a')
      if (!drag.moved && !isLinkTarget) {
        suppressNextClickRef.current = true
        window.dispatchEvent(new CustomEvent('calyr:activate-qr'))
        toggleOpen()
      }
    }

    document.addEventListener('pointermove', handleDocPointerMove, true)
    document.addEventListener('pointerup', handleDocPointerUp, true)
    document.addEventListener('pointercancel', handleDocPointerUp, true)

    return () => {
      document.removeEventListener('pointermove', handleDocPointerMove, true)
      document.removeEventListener('pointerup', handleDocPointerUp, true)
      document.removeEventListener('pointercancel', handleDocPointerUp, true)
    }
  }, [isDragging])

  const handlePointerDown = (event) => {
    if (event.target.closest('a')) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const fallbackTop = Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.3)
    const fallbackLeft = 0
    dragRef.current = {
      active: true,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startTopPx: topPx ?? fallbackTop,
      startLeftPx: leftPx ?? fallbackLeft,
      moved: false,
    }
    setIsDragging(true)
  }

  const handleTabClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }
    window.dispatchEvent(new CustomEvent('calyr:activate-qr'))
    toggleOpen()
  }

  const tabLabel = page.title || page.id || 'contact'
  const accentClass = ''
  const railStyle =
    topPx == null || leftPx == null
      ? undefined
      : { top: `${topPx}px`, left: `${leftPx}px`, bottom: 'auto' }
  // Keep the hidden panel non-interactive to avoid an invisible touch-blocking layer on mobile.
  const linksStyle = {
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  }

  return (
    <aside
      className={`quick-contact-rail ${accentClass} ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`.trim()}
      aria-label={tabLabel}
      style={railStyle}
      ref={railRef}
    >
      <button
        className="quick-contact-tab"
        type="button"
        onPointerDown={handlePointerDown}
        onClick={handleTabClick}
        aria-expanded={isOpen}
        aria-controls="quick-contact-links"
        aria-label={tabLabel}
        title={tabLabel}
      >
        <span aria-hidden="true">{tabLabel}</span>
      </button>

      <div className="quick-contact-links" id="quick-contact-links" style={linksStyle}>
        <button
          type="button"
          className="quick-contact-link quick-contact-link--qr"
          onClick={handleQrButtonClick}
          aria-label="QR"
          title="QR"
        >
          <span className="quick-contact-icon" aria-hidden="true">QR</span>
        </button>
        {contactLinks.map((item) => (
          <a
            key={item.id}
            className="quick-contact-link"
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
            aria-label={item.label}
            title={item.label}
          >
            <span className="quick-contact-icon" aria-hidden="true">{LinkItemService.getContactSymbol(item) || '@'}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}
