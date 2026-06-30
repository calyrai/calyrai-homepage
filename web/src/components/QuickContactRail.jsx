import React, { useEffect, useRef, useState } from 'react'
import { LinkItemService } from '../services/LinkItemService'

export default function QuickContactRail({ page }) {
  const [isOpen, setIsOpen] = useState(false)
  const [topPx, setTopPx] = useState(null)
  const [leftPx, setLeftPx] = useState(null)
  const railRef = useRef(null)
  const contactLinks = LinkItemService.buildContactLinks(page)

  if (!page || contactLinks.length === 0) {
    return null
  }

  const toggleOpen = () => setIsOpen((prev) => !prev)

  const clampTop = (nextTop, railHeightOverride) => {
    if (typeof window === 'undefined') return nextTop
    const railHeight = railHeightOverride || railRef.current?.offsetHeight || 220
    const minTop = 12
    const maxTop = Math.max(minTop, window.innerHeight - railHeight - 12)
    return Math.max(minTop, Math.min(maxTop, nextTop))
  }

  const clampLeft = (nextLeft, railWidthOverride) => {
    if (typeof window === 'undefined') return nextLeft
    const railWidth = railWidthOverride || railRef.current?.offsetWidth || 96
    const minLeft = 8
    const maxLeft = Math.max(minLeft, window.innerWidth - railWidth - 8)
    return Math.max(minLeft, Math.min(maxLeft, nextLeft))
  }

  useEffect(() => {
    const alignRailToLogoAxis = () => {
      if (typeof window === 'undefined') return
      const logo = document.querySelector('.calyr-logo-interactive')
      const railWidth = railRef.current?.offsetWidth || 96
      const railHeight = railRef.current?.offsetHeight || 220

      if (!(logo instanceof Element)) {
        const fallbackTop = Math.round(window.innerHeight * 0.3)
        setTopPx(clampTop(fallbackTop, railHeight))
        setLeftPx(clampLeft(8, railWidth))
        return
      }

      const rect = logo.getBoundingClientRect()
      const gapPx = 12
      const alignedLeft = clampLeft(rect.left - railWidth - gapPx, railWidth)
      const alignedTop = clampTop(rect.top + rect.height * 0.5 - railHeight * 0.5, railHeight)

      setLeftPx(alignedLeft)
      setTopPx(alignedTop)
    }

    alignRailToLogoAxis()
    window.addEventListener('resize', alignRailToLogoAxis)
    window.addEventListener('scroll', alignRailToLogoAxis, { passive: true })
    return () => {
      window.removeEventListener('resize', alignRailToLogoAxis)
      window.removeEventListener('scroll', alignRailToLogoAxis)
    }
  }, [])

  const handleTabClick = () => toggleOpen()

  const tabLabel = page.title || page.id || ''
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
      className={`quick-contact-rail ${isOpen ? 'open' : ''}`}
      aria-label={tabLabel}
      style={railStyle}
      ref={railRef}
    >
      <button
        className="quick-contact-tab"
        type="button"
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
