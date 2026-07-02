import React, { useEffect, useMemo, useState } from 'react'
import { LinkItemService } from '../services/LinkItemService'
import { NavigationItemService } from '../services/NavigationItemService'
import { NodeQueryService } from '../services/NodeQueryService'
import { applyTitleDefaults } from '../utils/titleDefaults'
import whatsappIcon from '../assets/contact-icons/whatsapp.svg'
import xIcon from '../assets/contact-icons/x.svg'
import linkedinIcon from '../assets/contact-icons/linkedin.svg'
import blueskyIcon from '../assets/contact-icons/bluesky.svg'
import youtubeIcon from '../assets/contact-icons/youtube.svg'
import instagramIcon from '../assets/contact-icons/instagram.svg'
import homeIcon from '../assets/contact-icons/home.svg'

const CONTACT_ICON_MAP = {
  whatsapp: whatsappIcon,
  x: xIcon,
  linkedin: linkedinIcon,
  linkind: linkedinIcon,
  bluesky: blueskyIcon,
  youtube: youtubeIcon,
  instagram: instagramIcon,
  impressum: homeIcon,
}

function SocialButtonIcon({ symbol, contactId }) {
  const id = String(contactId || '').toLowerCase()
  const iconSrc = CONTACT_ICON_MAP[id]

  if (iconSrc) {
    return (
      <img
        className="nav-contact-icon nav-contact-icon-svg"
        src={iconSrc}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
    )
  }

  return (
    <span className="nav-contact-icon nav-contact-icon-fallback" aria-hidden="true">
      {String(symbol || '@').slice(0, 2)}
    </span>
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
                      return (
                    <a
                      key={item.id}
                      className={`nav-contact-link${contactClass}`}
                      href={item.href}
                      target={item.href?.startsWith('http') ? '_blank' : undefined}
                      rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
                      aria-label={item.label}
                      title={item.label}
                      onClick={handleNavClick}
                    >
                      <SocialButtonIcon contactId={item.id} symbol={LinkItemService.getContactSymbol(item) || '@'} />
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
