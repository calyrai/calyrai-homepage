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
import { ScrollCenterProvider } from '../hooks/useScrollCenter'
import { useIsMobile } from '../hooks/useIsMobile'
import { applyTitleDefaults } from '../utils/titleDefaults'

const SECTION_ANCHOR_ALIASES = {
  movie: ['teaser'],
  platforms: ['platform'],
  contact_main: ['contact'],
}

export default function Section({ node, theme, context = {} }) {
  const { id, title, summary, route, children = [] } = node
  const rawBody = typeof node.body === 'string' ? node.body : ''
  const teaserCaption = rawBody.includes('Place your short file path in route to load and play it here.')
    ? 'Interactive CALYR teaser: scientific flow from experiments and HPC to Oracle, surrogate models, and scientific AI.'
    : rawBody
  const layout = SectionLayoutService.create(node)
  const isMobileViewport = useIsMobile()
  const [isExpanded, setIsExpanded] = useState(layout.defaultExpanded)
  const lastPointerToggleTsRef = useRef(0)
  const formattedTitle = title ? applyTitleDefaults(title) : ''
  const formattedToggleLabel = applyTitleDefaults(title || id || '')
  const titleHref = layout.titleHref
  const titleContent = titleHref
    ? <a href={titleHref} className="section-title-link" aria-label={formattedTitle}>{formattedTitle}</a>
    : formattedTitle

  // Apply theme colors from skin if available
  const sectionStyle = theme?.skin?.components?.section ? {
    backgroundColor: theme.skin.components.section.background,
    color: theme.skin.components.section.text_color,
    borderColor: theme.skin.components.section.border,
  } : {}

  const renderGrid = () => (
    <ScrollCenterProvider>
      <div className={`section-grid ${isMobileViewport ? 'scroll-mode' : ''}`.trim()}>
        {renderChildren(children, theme, context)}
      </div>
    </ScrollCenterProvider>
  )

  const renderMovie = () => (
    <div className="section-movie-shell">
      {route && route.endsWith('.html') ? (
        <iframe
          className="section-movie-embed"
          src={route}
          title={title || id || 'Teaser'}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <video
          className="section-movie-video"
          controls
          playsInline
          preload="metadata"
          src={route || undefined}
        />
      )}
      {teaserCaption && <p className="section-movie-caption">{teaserCaption}</p>}
    </div>
  )

  const handleTogglePointerDown = () => {
    if (layout.isMovieSection && route && route.endsWith('.html')) {
      window.location.assign(route)
      return
    }
    lastPointerToggleTsRef.current = Date.now()
    setIsExpanded((prev) => !prev)
  }

  const handleToggleClick = () => {
    if (layout.isMovieSection && route && route.endsWith('.html')) {
      window.location.assign(route)
      return
    }
    if (Date.now() - lastPointerToggleTsRef.current < 350) {
      return
    }
    setIsExpanded((prev) => !prev)
  }

  React.useEffect(() => {
    const aliases = Array.isArray(SECTION_ANCHOR_ALIASES[id]) ? SECTION_ANCHOR_ALIASES[id] : []
    const targets = new Set([id, ...aliases])

    const syncFromHash = () => {
      const hashValue = String(window.location.hash || '').replace(/^#/, '')
      if (!hashValue) return
      if (layout.isCollapsible && targets.has(hashValue)) {
        setIsExpanded(true)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [id, layout.isCollapsible])

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
      className={`section ${layout.isCollapsible ? 'section-collapsible' : ''} ${layout.renderVariant ? `section-variant-${layout.renderVariant}` : ''}`.trim()}
      id={id}
      data-type="section"
      data-variant={layout.renderVariant || undefined}
      data-source={layout.renderSource || undefined}
      data-intent={layout.intentPurpose || undefined}
      style={sectionStyle}
    >
      {Array.isArray(SECTION_ANCHOR_ALIASES[id]) && SECTION_ANCHOR_ALIASES[id].map((anchorId) => (
        <span key={anchorId} id={anchorId} className="section-anchor-alias" aria-hidden="true" />
      ))}

      {layout.isCollapsible && (
        <button
          type="button"
          className="section-collapse-toggle"
          onPointerDown={handleTogglePointerDown}
          onClick={handleToggleClick}
          aria-expanded={isExpanded}
          aria-label={formattedToggleLabel}
        >
          <span className="section-collapse-line" aria-hidden="true" />
          {(title || id) && <span className="section-collapse-label">{formattedToggleLabel}</span>}
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
