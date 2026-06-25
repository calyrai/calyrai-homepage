/**
 * Section Component
 * 
 * Container for organizing tiles/elements into groups
 * Renders as CSS Grid by default
 * Children are typically tiles
 */

import React from 'react'
import { renderChildren } from './Renderer'

export default function Section({ node, theme }) {
  const { id, title, summary, route, children = [] } = node
  const titleHref = route || (id ? `#${id}` : null)
  const titleContent = titleHref
    ? <a href={titleHref} className="section-title-link" aria-label={title}>{title}</a>
    : title

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
            {title && <h2 className="section-title">{titleContent}</h2>}
            {summary && <p className="section-summary">{summary}</p>}
          </div>
        </div>
      )}

      {renderGrid()}
    </section>
  )
}
