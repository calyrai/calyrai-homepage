import React, { useEffect, useRef, useState } from 'react'
import { LinkItemService } from '../services/LinkItemService'

const DRAG_THRESHOLD_PX = 2
const DRAG_SAFETY_TIMEOUT_MS = 8000

export default function QuickContactRail({ page }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [topPx, setTopPx] = useState(null)
  const railRef = useRef(null)
  const suppressNextClickRef = useRef(false)
  const dragRef = useRef({
    active: false,
    startPointerY: 0,
    startTopPx: 0,
    moved: false,
  })
  const contactLinks = LinkItemService.buildContactLinks(page)

  if (!page || contactLinks.length === 0) {
    return null
  }

  // Safety: if isDragging is stuck true after 8 seconds, reset it
  useEffect(() => {
    if (!isDragging) return
    const timeout = setTimeout(() => {
      setIsDragging(false)
      dragRef.current.active = false
    }, DRAG_SAFETY_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [isDragging])

  const toggleOpen = () => setIsOpen((prev) => !prev)

  const clampTop = (nextTop) => {
    if (typeof window === 'undefined') return nextTop
    const railHeight = railRef.current?.offsetHeight || 220
    const minTop = 12
    const maxTop = Math.max(minTop, window.innerHeight - railHeight - 12)
    return Math.max(minTop, Math.min(maxTop, nextTop))
  }

  useEffect(() => {
    const initializePosition = () => {
      if (typeof window === 'undefined') return
      const defaultTop = Math.round(window.innerHeight * 0.3)
      setTopPx((prev) => clampTop(prev == null ? defaultTop : prev))
    }

    initializePosition()
    window.addEventListener('resize', initializePosition)
    return () => window.removeEventListener('resize', initializePosition)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleDocPointerMove = (event) => {
      const drag = dragRef.current
      if (!drag.active) return
      const deltaY = event.clientY - drag.startPointerY
      if (Math.abs(deltaY) > DRAG_THRESHOLD_PX) dragRef.current.moved = true
      setTopPx(clampTop(drag.startTopPx + deltaY))
    }

    const handleDocPointerUp = (event) => {
      const drag = dragRef.current
      if (!drag.active) return
      
      dragRef.current.active = false
      setIsDragging(false)

      const target = event.target
      const isLinkTarget = target instanceof Element && !!target.closest('a')
      if (!drag.moved && !isLinkTarget) {
        suppressNextClickRef.current = true
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

    const safeTop = topPx ?? Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) * 0.3)
    dragRef.current = {
      active: true,
      startPointerY: event.clientY,
      startTopPx: safeTop,
      moved: false,
    }
    setIsDragging(true)
  }

  const handleTabClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }
    toggleOpen()
  }

  const tabLabel = page.title || page.id || ''
  const railStyle = topPx == null ? undefined : { top: `${topPx}px`, bottom: 'auto' }
  // Keep the hidden panel non-interactive to avoid an invisible touch-blocking layer on mobile.
  const linksStyle = {
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  }

  return (
    <aside
      className={`quick-contact-rail ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
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
