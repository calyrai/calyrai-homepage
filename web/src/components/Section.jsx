/**
 * Section Component
 * 
 * Container for organizing tiles/elements into groups
 * Renders as CSS Grid by default
 * Children are typically tiles
 * 
 * Stage 8: Collapsible sections on mobile (<768px)
 * Stage 9: Scroll-based tile open/close on mobile
 */

import React, { useEffect, useState } from 'react'
import { renderChildren } from './Renderer'
import { ScrollCenterProvider } from '../hooks/useScrollCenter.jsx'

export default function Section({ node, theme, renderNode }) {
  const { id, title, summary, children = [] } = node
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 768)
  const [scrollMode, setScrollMode] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768
      setIsMobile(nextIsMobile)
      setIsCollapsed(nextIsMobile)
      setScrollMode(nextIsMobile)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Apply theme colors from skin if available
  const sectionStyle = theme?.skin?.components?.section ? {
    backgroundColor: theme.skin.components.section.background,
    color: theme.skin.components.section.text_color,
    borderColor: theme.skin.components.section.border,
  } : {}

  const renderGrid = () => (
    <div className={`section-grid ${scrollMode ? 'scroll-mode' : ''}`}>
      {renderChildren(children, theme).map((child, idx) => (
        <React.Fragment key={idx}>{child}</React.Fragment>
      ))}
    </div>
  )

  return (
    <section className="section" id={id} data-type="section" style={sectionStyle}>
      {/* Section header (clickable on mobile for collapse) */}
      {(title || summary) && (
        <div
          className={`section-header ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          role="button"
          tabIndex={0}
          aria-expanded={!isCollapsed}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsCollapsed(!isCollapsed)
            }
          }}
        >
          <div className="section-header-content">
            {title && <h2 className="section-title">{title}</h2>}
            {summary && <p className="section-summary">{summary}</p>}
          </div>
          {/* Collapse indicator (mobile only) */}
          <span className={`collapse-icon ${isCollapsed ? 'open' : ''}`}>↓</span>
        </div>
      )}

      {/* Tile grid (hidden when collapsed) */}
      {!isCollapsed && scrollMode ? (
        <ScrollCenterProvider>
          {renderGrid()}
        </ScrollCenterProvider>
      ) : !isCollapsed ? (
        renderGrid()
      ) : null}
    </section>
  )
}
