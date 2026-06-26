/**
 * Section Component
 * 
 * Container for organizing tiles/elements into groups
 * Renders as CSS Grid by default
 * Children are typically tiles
 */

import React, { useRef, useState } from 'react'
import { renderChildren } from './Renderer'
import { SectionLayoutService } from '../services/SectionLayoutService'

export default function Section({ node, theme }) {
  const { id, title, summary, route, children = [] } = node
  const layout = SectionLayoutService.create(node)
  const [isExpanded, setIsExpanded] = useState(layout.defaultExpanded)
  const lastPointerToggleTsRef = useRef(0)
  const titleHref = layout.titleHref
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
      {renderChildren(children, theme)}
    </div>
  )

  const renderMovie = () => (
    <div className="section-movie-shell">
      <video
        className="section-movie-video"
        controls
        playsInline
        preload="metadata"
        src={route || undefined}
      />
      {node.body && <p className="section-movie-caption">{node.body}</p>}
    </div>
  )

  const handleTogglePointerDown = () => {
    lastPointerToggleTsRef.current = Date.now()
    setIsExpanded((prev) => !prev)
  }

  const handleToggleClick = () => {
    if (Date.now() - lastPointerToggleTsRef.current < 350) {
      return
    }
    setIsExpanded((prev) => !prev)
  }

  if (layout.isMovieSection && !layout.isCollapsible) {
    return (
      <section className="section section-movie" id={id} data-type="section" style={sectionStyle}>
        {(title || summary) && (
          <div className="section-header">
            <div className="section-header-content">
              {title && <h2 className="section-title">{titleContent}</h2>}
              {summary && <p className="section-summary">{summary}</p>}
            </div>
          </div>
        )}

        {renderMovie()}
      </section>
    )
  }

  return (
    <section
      className={`section ${layout.isCollapsible ? 'section-collapsible' : ''}`}
      id={id}
      data-type="section"
      style={sectionStyle}
    >
      {layout.isCollapsible && (
        <button
          type="button"
          className="section-collapse-toggle"
          onPointerDown={handleTogglePointerDown}
          onClick={handleToggleClick}
          aria-expanded={isExpanded}
          aria-label={title || id || ''}
        >
          <span className="section-collapse-line" aria-hidden="true" />
          {(title || id) && <span className="section-collapse-label">{title || id}</span>}
        </button>
      )}

      {/* Static section header for identical desktop/mobile behavior */}
      {(title || summary) && isExpanded && !layout.isCollapsible && (
        <div className="section-header">
          <div className="section-header-content">
            {title && <h2 className="section-title">{titleContent}</h2>}
            {summary && <p className="section-summary">{summary}</p>}
          </div>
        </div>
      )}

      {isExpanded && (layout.isMovieSection ? renderMovie() : renderGrid())}
    </section>
  )
}
