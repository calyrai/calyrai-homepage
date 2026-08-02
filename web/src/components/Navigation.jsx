import React, { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { getContactQrValue } from '../services/ContactQrService'
import { LinkItemService } from '../services/LinkItemService'
import { NavigationItemService } from '../services/NavigationItemService'
import { NodeQueryService } from '../services/NodeQueryService'
import { applyTitleDefaults } from '../utils/titleDefaults'
import LogoAnimation from './logo/LogoAnimation'

const CONTACT_AUTO_CLOSE_MS = 5000

function ContactQrIcon({ value }) {
  const qr = useMemo(() => {
    const safeValue = String(value || '').trim() || 'about:blank'
    try {
      return QRCode.create(safeValue, {
        errorCorrectionLevel: 'L',
        margin: 0,
      })
    } catch {
      return QRCode.create('about:blank', {
        errorCorrectionLevel: 'L',
        margin: 0,
      })
    }
  }, [value])

  const size = qr?.modules?.size || 21
  const quietZone = 4
  const totalSize = size + quietZone * 2
  const modules = useMemo(() => {
    if (!qr?.modules || typeof qr.modules.get !== 'function') {
      return []
    }

    const cells = []
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (!qr.modules.get(x, y)) {
          continue
        }

        const seed = ((x + 1) * 29 + (y + 1) * 17) % 11

        cells.push({
          x,
          y,
          delay: -(seed * 0.13),
          duration: 1.6 + (seed % 4) * 0.18,
          radius: (x <= 6 && y <= 6) || (x >= size - 7 && y <= 6) || (x <= 6 && y >= size - 7)
            ? 0.48
            : 0.38,
        })
      }
    }

    return cells
  }, [qr, size])

  return (
    <span className="nav-contact-qr" aria-hidden="true">
      <svg
        className="nav-contact-qr-svg"
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        focusable="false"
        shapeRendering="crispEdges"
      >
        <rect x="0" y="0" width={totalSize} height={totalSize} fill="#000000" />
        {modules.map(({ x, y, radius, delay, duration }) => (
          <circle
            key={`${x}-${y}`}
            className="nav-contact-qr-dot"
            cx={x + quietZone + 0.5}
            cy={y + quietZone + 0.5}
            r={radius}
            fill="#ffffff"
            style={{
              '--qr-spark-delay': `${delay.toFixed(2)}s`,
              '--qr-spark-duration': `${duration.toFixed(2)}s`,
            }}
          />
        ))}
      </svg>
    </span>
  )
}

export default function Navigation({ theme, ast, visualsReady = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBrandOpen, setIsBrandOpen] = useState(false)
  const [isContactsOpen, setIsContactsOpen] = useState(false)
  const [activeContactId, setActiveContactId] = useState(null)
  const contactTimerRef = useRef(null)
  const brandCloseTimerRef = useRef(null)

  const clearActiveContactTimer = () => {
    window.clearTimeout(contactTimerRef.current)
    contactTimerRef.current = null
  }

  const closeActiveContact = () => {
    clearActiveContactTimer()
    setActiveContactId(null)
  }

  const openActiveContact = (contactId) => {
    closeActiveContact()
    setActiveContactId(contactId)
    contactTimerRef.current = window.setTimeout(() => {
      setActiveContactId(null)
      contactTimerRef.current = null
    }, CONTACT_AUTO_CLOSE_MS)
  }

  const clearBrandCloseTimer = () => {
    window.clearTimeout(brandCloseTimerRef.current)
    brandCloseTimerRef.current = null
  }

  const openBrandPanel = () => {
    clearBrandCloseTimer()
    setIsBrandOpen(true)
  }

  const scheduleBrandPanelClose = () => {
    clearBrandCloseTimer()
    brandCloseTimerRef.current = window.setTimeout(() => {
      setIsBrandOpen(false)
      brandCloseTimerRef.current = null
    }, 180)
  }

  useEffect(() => {
    if (!isOpen) {
      setIsContactsOpen(false)
      closeActiveContact()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isContactsOpen) {
      closeActiveContact()
    }
  }, [isContactsOpen])

  useEffect(() => {
    document.body.classList.toggle('nav-open', isOpen)
    return () => document.body.classList.remove('nav-open')
  }, [isOpen])

  useEffect(() => () => {
    clearActiveContactTimer()
    clearBrandCloseTimer()
  }, [])

  const handleNavClick = () => {
    closeActiveContact()
    setIsOpen(false)
    setIsContactsOpen(false)
  }

  const handleContactLinkClick = (contactId) => (event) => {
    if (activeContactId !== contactId) {
      event.preventDefault()
      openActiveContact(contactId)
      return
    }

    closeActiveContact()
    handleNavClick()
  }

  const headerStyle = theme?.skin?.components?.header ? {
    backgroundColor: theme.skin.components.header.background,
    borderBottomColor: theme.skin.components.header.border_bottom,
    color: theme.skin.components.header.text_color,
  } : {}

  const navItems = useMemo(() => NavigationItemService.buildFromAst(ast), [ast])
  const contactPage = useMemo(() => new NodeQueryService(ast).findById('contact'), [ast])
  const contactLinks = useMemo(() => LinkItemService.buildContactLinks(contactPage), [contactPage])
  const navItemsWithoutContact = useMemo(
    () => navItems.filter((item) => item.anchor !== 'contact'),
    [navItems],
  )

  return (
    <>
      <button
        className={`hamburger ${isOpen ? 'active' : ''}`.trim()}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        aria-controls="site-navigation-drawer"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <button
        type="button"
        className={`nav-brand-rail ${isBrandOpen ? 'open' : ''}`.trim()}
        onClick={openBrandPanel}
        onMouseEnter={openBrandPanel}
        onMouseLeave={scheduleBrandPanelClose}
        onFocus={openBrandPanel}
        onBlur={scheduleBrandPanelClose}
        aria-label="Open calyr.aí particle ring"
        aria-expanded={isBrandOpen}
        aria-controls="nav-brand-panel"
      >
        <span className="nav-brand-line" aria-hidden="true" />
      </button>

      {isBrandOpen && (
        <aside
          id="nav-brand-panel"
          className="nav-brand-panel open"
          aria-label="calyr.aí particle ring and QR"
          onMouseEnter={openBrandPanel}
          onMouseLeave={scheduleBrandPanelClose}
        >
          <LogoAnimation layout="nav" showCanvas={visualsReady} />
        </aside>
      )}

      {isOpen && (
        <>
          <div className="nav-overlay" onClick={() => setIsOpen(false)} />

          <nav id="site-navigation-drawer" className="navigation mobile-nav open" style={headerStyle}>
            <div className="nav-content">
              <ul className="nav-list">
                {navItemsWithoutContact.map((item, index) => (
                  <li key={index}>
                    {(() => {
                      const displayLabel = applyTitleDefaults(item.label)
                      return (
                        <a
                          href={item.href}
                          className="nav-link"
                          onClick={handleNavClick}
                          style={{
                            color: '#FFFFFF',
                          }}
                        >
                          {displayLabel}
                        </a>
                      )
                    })()}
                  </li>
                ))}

                <li className="nav-contact-combo">
                  <button
                    type="button"
                    className="nav-link nav-link-main nav-link-button"
                    onClick={() => setIsContactsOpen((prev) => !prev)}
                    aria-expanded={isContactsOpen}
                    aria-controls="nav-contact-cluster"
                    aria-label="Toggle contact channels"
                    style={{
                      color: '#FFFFFF',
                    }}
                  >
                    {applyTitleDefaults('Contact')}
                  </button>
                </li>
              </ul>

              {contactLinks.length > 0 && (
                <div
                  id="nav-contact-cluster"
                  className={`nav-contact-cluster ${isContactsOpen ? 'open' : ''}`.trim()}
                  aria-label="Contact links"
                >
                  {contactLinks.map((item) => (
                    (() => {
                      const contactKey = String(item.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '')
                      const contactClass = contactKey ? ` nav-contact-link-${contactKey}` : ''
                      const qrValue = getContactQrValue(item.href)
                      const isActive = activeContactId === item.id
                      return (
                        <a
                          key={item.id}
                          className={`nav-contact-link${contactClass}${isActive ? ' open' : ''}`}
                          data-contact-label={item.label}
                          href={item.href}
                          target={item.href?.startsWith('http') ? '_blank' : undefined}
                          rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
                          aria-label={item.label}
                          aria-pressed={isActive}
                          onClick={handleContactLinkClick(item.id)}
                        >
                          <span className="nav-contact-label" aria-hidden="true">{item.label}</span>
                          <ContactQrIcon value={qrValue} />
                        </a>
                      )
                    })()
                  ))}
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  )
}
