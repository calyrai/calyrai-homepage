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

import React from 'react'
import { renderChildren } from './Renderer'

export default function Section({ node, theme }) {
  const { id, title, summary, children = [] } = node

  // Apply theme colors from skin if available
  const sectionStyle = theme?.skin?.components?.section ? {
    backgroundColor: theme.skin.components.section.background,
    color: theme.skin.components.section.text_color,
    borderColor: theme.skin.components.section.border,
  } : {}

  const renderGrid = () => (
    <div className="section-grid">
      {renderChildren(children, theme).map((child, idx) => (
        <React.Fragment key={idx}>{child}</React.Fragment>
      ))}
    </div>
  )

  return (
    <section className="section" id={id} data-type="section" style={sectionStyle}>
      {/* Static section header for identical desktop/mobile behavior */}
      {(title || summary) && (
        <div className="section-header">
          <div className="section-header-content">
            {title && <h2 className="section-title">{title}</h2>}
            {summary && <p className="section-summary">{summary}</p>}
          </div>
        </div>
      )}

      {renderGrid()}
    </section>
  )
}
