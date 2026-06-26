import React, { useEffect, useRef, useState } from 'react'

const DRAG_THRESHOLD_PX = 2
const DRAG_SAFETY_TIMEOUT_MS = 8000

function normalizeLinkItem(item) {
  if (!item) return null
  if (typeof item === 'string') {
    return { id: item, label: item, href: item }
  }

  const href = item.route || item.href || item.url
  if (!href) return null

  const label = item.label || item.name || item.id || href
  const id = item.id || `${label}-${href}`
  return { id, label, href }
}

function buildContactLinks(page) {
  const links = []

  if (page?.route) {
    const routeLabel = typeof page.route === 'string' && page.route.startsWith('mailto:')
      ? page.route.replace('mailto:', '')
      : page.route
    links.push({ id: 'primary-route', label: routeLabel, href: page.route })
  }

  if (Array.isArray(page?.links)) {
    page.links.forEach((item) => {
      const normalized = normalizeLinkItem(item)
      if (normalized) links.push(normalized)
    })
  }

  const seen = new Set()
  return links.filter((item) => {
    const key = `${item.label}|${item.href}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
  const contactLinks = buildContactLinks(page)

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
      >
        {tabLabel}
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
            <span className="quick-contact-icon" aria-hidden="true">{item.label.slice(0, 2).toUpperCase()}</span>
            <span className="quick-contact-label">{item.label}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}
