/**
 * Navigation Component
 * 
 * Stage 8: Mobile-responsive navigation
 * Features:
 *   • Hamburger menu on mobile (<768px)
 *   • Smooth slide-in drawer animation
 *   • Auto-close on link click
 *   • Respects safe area (notch support)
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { NavigationItemService } from '../services/NavigationItemService'

export default function Navigation({ theme, ast }) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false) // Close menu on resize to desktop
    }
  }, [isMobile])

  const handleNavClick = () => {
    setIsOpen(false) // Close drawer after clicking
  }

  // Apply theme colors from skin if available
  const headerStyle = theme?.skin?.components?.header ? {
    backgroundColor: theme.skin.components.header.background,
    borderBottomColor: theme.skin.components.header.border_bottom,
    color: theme.skin.components.header.text_color,
  } : {}

  const navItems = useMemo(() => NavigationItemService.buildFromAst(ast), [ast])

  return (
    <>
      {/* Hamburger Button (Mobile Only) */}
      {isMobile && (
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      )}

      {/* Mobile Drawer */}
      {isMobile && isOpen && (
        <div className="nav-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Navigation Menu */}
      <nav className={`mobile-nav ${isOpen ? 'open' : ''}`} style={headerStyle}>
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
          </ul>
        </div>

        {/* Close Button (Mobile) */}
        {isMobile && (
          <button
            className="nav-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        )}
      </nav>
    </>
  )
}
