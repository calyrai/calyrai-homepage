/**
 * Page Component
 * 
 * Root page component that renders the entire homepage
 * Typically contains: header, hero, sections, footer
 */

import React from 'react'
import { applyTitleDefaults } from '../utils/titleDefaults'

export default function Page({ node, theme, renderNode, context = {} }) {
  const { id, title, children = [] } = node
  const displayTitle = title ? applyTitleDefaults(title) : ''
  const firstChild = children[0]
  const secondChild = children[1]
  const canFuseLogoHero = firstChild?.id === 'logo' && secondChild?.type === 'hero' && typeof secondChild?.summary === 'string'
  const heroHasStandaloneContent = Boolean(
    secondChild?.title ||
    secondChild?.subtitle ||
    secondChild?.body ||
    secondChild?.icon ||
    secondChild?.route,
  )
  const heroActionCount = Array.isArray(firstChild?.links) ? firstChild.links.length : 0
  const childContext = (index) => ({
    ...context,
    sequenceNumber: index === 0 ? 1 : index + heroActionCount + 1,
  })

  const renderedChildren = canFuseLogoHero
    ? [
        <React.Fragment key={firstChild.id || 0}>
          {renderNode({ ...firstChild, tagline: secondChild.summary?.trim() || '' }, theme, childContext(0))}
        </React.Fragment>,
        ...(heroHasStandaloneContent
          ? [
              <React.Fragment key={secondChild.id || 1}>
                {renderNode({ ...secondChild, summary: '' }, theme, childContext(1))}
              </React.Fragment>,
            ]
          : []),
        ...children.slice(2).map((child, idx) => (
          <React.Fragment key={child.id || idx + 2}>
            {renderNode(child, theme, childContext(idx + 2))}
          </React.Fragment>
        )),
      ]
    : children.map((child, idx) => (
        <React.Fragment key={child.id || idx}>
          {renderNode(child, theme, childContext(idx))}
        </React.Fragment>
      ))

  return (
    <div className="page" id={id} data-type="page">
      {/* Optional header */}
      {title && (
        <header className="page-header">
          <h1>{displayTitle}</h1>
        </header>
      )}

      {/* Render all children (hero, sections, footer, etc.) */}
      <main className="page-main">
        {renderedChildren}
      </main>
    </div>
  )
}
