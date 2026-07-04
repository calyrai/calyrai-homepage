import React, { useEffect, useMemo, useState } from 'react'
import { LinkItemService } from '../services/LinkItemService'
import { NavigationItemService } from '../services/NavigationItemService'
import { NodeQueryService } from '../services/NodeQueryService'
import { applyTitleDefaults } from '../utils/titleDefaults'

const BRAILLE_DOTS = {
  a: [1],
  b: [1, 2],
  c: [1, 4],
  d: [1, 4, 5],
  e: [1, 5],
  f: [1, 2, 4],
  g: [1, 2, 4, 5],
  h: [1, 2, 5],
  i: [2, 4],
  j: [2, 4, 5],
  k: [1, 3],
  l: [1, 2, 3],
  m: [1, 3, 4],
  n: [1, 3, 4, 5],
  o: [1, 3, 5],
  p: [1, 2, 3, 4],
  q: [1, 2, 3, 4, 5],
  r: [1, 2, 3, 5],
  s: [2, 3, 4],
  t: [2, 3, 4, 5],
  u: [1, 3, 6],
  v: [1, 2, 3, 6],
  w: [2, 4, 5, 6],
  x: [1, 3, 4, 6],
  y: [1, 3, 4, 5, 6],
  z: [1, 3, 5, 6],
}

const BRAILLE_POSITION_LEGEND = '1 oben links, 2 mitte links, 3 unten links, 4 oben rechts, 5 mitte rechts, 6 unten rechts'

const CONTACT_SPLINE_PATHS = {
  mail: `
    M 20 25
    L 80 25
    L 80 75
    L 20 75
    Z
    M 20 30
    C 38 44, 45 56, 50 56
    C 55 56, 62 44, 80 30
  `,
  whatsapp: `
    M 25 62
    C 18 42, 28 22, 50 22
    C 75 22, 86 42, 76 61
    C 67 78, 42 78, 31 71
    L 18 80
    C 21 73, 23 67, 25 62
  `,
  x: `
    M 30 25
    C 42 38, 48 46, 50 50
    C 56 60, 62 70, 70 75
    M 70 25
    C 58 38, 52 46, 50 50
    C 44 60, 38 70, 30 75
  `,
  linkedin: `
    M 30 50
    C 42 50, 42 38, 42 30
    C 42 25, 48 25, 70 25
    L 70 75
    C 58 75, 51 70, 43 72
    C 38 74, 34 75, 30 75
  `,
  bluesky: `
    M 50 55
    C 32 20, 20 23, 22 45
    C 24 63, 38 62, 43 55
    C 29 68, 30 82, 43 78
    C 52 75, 51 62, 50 55

    M 50 55
    C 68 20, 80 23, 78 45
    C 76 63, 62 62, 57 55
    C 71 68, 70 82, 57 78
    C 48 75, 49 62, 50 55
  `,
  youtube: `
    M 25 30
    C 25 20, 40 20, 60 20
    C 75 20, 80 30, 80 50
    C 80 70, 75 80, 60 80
    C 40 80, 25 80, 25 70
    Z
    M 42 38
    L 42 62
    L 64 50
    Z
  `,
  instagram: `
    M 30 25
    C 45 15, 68 18, 76 32
    C 86 50, 78 75, 55 76
    C 31 77, 20 62, 22 45
    C 23 36, 25 29, 30 25
  `,
  impressum: `
    M 30 20
    L 65 20
    L 80 35
    L 80 80
    L 30 80
    Z
    M 65 20
    L 65 35
    L 80 35
  `,
}

function getBrailleLetter(label, symbol) {
  return String(label || symbol || 'a').trim().charAt(0).toLowerCase() || 'a'
}

function getBrailleActiveDots(letter) {
  return BRAILLE_DOTS[letter] || BRAILLE_DOTS.a
}

function getBrailleSparkStyle(letter, dot) {
  const code = (String(letter || 'a').charCodeAt(0) || 97) + dot * 31
  const duration = 1.15 + (code % 11) * 0.13
  const delay = -((code % 7) * 0.21)
  const drift = ((code % 5) - 2) * 0.25

  return {
    '--braille-spark-duration': `${duration.toFixed(2)}s`,
    '--braille-spark-delay': `${delay.toFixed(2)}s`,
    '--braille-spark-drift': `${drift.toFixed(2)}px`,
  }
}

function getSplinePath(item) {
  const key = String(item?.id || item?.label || '').toLowerCase()
  return CONTACT_SPLINE_PATHS[key] || CONTACT_SPLINE_PATHS.mail
}

function getDestinationLabel(href) {
  const value = String(href || '').trim()

  if (!value) return 'Unbekanntes Ziel'
  if (value.startsWith('mailto:')) return `E-Mail: ${value.replace('mailto:', '')}`
  if (value.startsWith('tel:')) return `Telefon: ${value.replace('tel:', '')}`
  if (value.startsWith('#')) return `Sektion: ${value.slice(1)}`

  if (value.startsWith('http')) {
    try {
      const url = new URL(value)
      const path = url.pathname && url.pathname !== '/' ? url.pathname : ''
      return `${url.hostname}${path}`
    } catch {
      return value
    }
  }

  return value
}

function BrailleIcon({ letter = 'a' }) {
  const l = String(letter || 'a').trim().charAt(0).toLowerCase()
  const activeDots = new Set(BRAILLE_DOTS[l] || BRAILLE_DOTS.a)

  return (
    <span className="nav-contact-braille" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map((dot) => (
        <span
          key={dot}
          className={`nav-contact-braille-dot ${activeDots.has(dot) ? 'active' : 'inactive'}`}
          style={getBrailleSparkStyle(l, dot)}
        />
      ))}
    </span>
  )
}

function SocialButtonIcon({ symbol, label }) {
  const firstLetter = getBrailleLetter(label, symbol)

  if (firstLetter) {
    return <BrailleIcon letter={firstLetter} />
  }

  return (
    <span className="nav-contact-icon nav-contact-icon-fallback" aria-hidden="true">
      {String(symbol || '@').slice(0, 2)}
    </span>
  )
}

function ContactSpline({ item }) {
  const path = getSplinePath(item)

  return (
    <svg className="nav-contact-spline" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path className="nav-contact-spline-path" d={path} />
    </svg>
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
    setIsOpen(false)
    setIsContactsOpen(false)
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
                      const symbol = LinkItemService.getContactSymbol(item) || '@'
                      const brailleLetter = getBrailleLetter(item.label, symbol)
                      const activeDots = getBrailleActiveDots(brailleLetter)
                      const activeDotsText = activeDots.join(', ')
                      const destinationText = getDestinationLabel(item.href)
                      return (
                        <a
                          key={item.id}
                          className={`nav-contact-link${contactClass}`}
                          data-contact-label={item.label}
                          href={item.href}
                          target={item.href?.startsWith('http') ? '_blank' : undefined}
                          rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
                          aria-label={item.label}
                          title={item.label}
                          onClick={handleNavClick}
                        >
                          <ContactSpline item={item} />
                          <SocialButtonIcon label={item.label} symbol={symbol} />
                          <span className="nav-contact-tooltip" aria-hidden="true">
                            <span className="nav-contact-tooltip-title">{item.label}</span>
                            <span className="nav-contact-tooltip-row">
                              {`Buchstabe ${brailleLetter.toUpperCase()} · aktive Punkte: ${activeDotsText}`}
                            </span>
                            <span className="nav-contact-tooltip-row">{`Ziel: ${destinationText}`}</span>
                            <span className="nav-contact-tooltip-row">{BRAILLE_POSITION_LEGEND}</span>
                          </span>
                        </a>
                      )
                    })()
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
