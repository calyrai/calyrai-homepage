/**
 * Page Component
 * 
 * Root page component that renders the entire homepage
 * Typically contains: header, hero, sections, footer
 */

import React from 'react'
import { renderChildren } from './Renderer'

export default function Page({ node, theme, renderNode }) {
  const { id, title, children = [] } = node

  return (
    <div className="page" id={id} data-type="page">
      {/* Optional header */}
      {title && (
        <header className="page-header">
          <h1>{title}</h1>
        </header>
      )}

      {/* Render all children (hero, sections, footer, etc.) */}
      <main className="page-main">
        {renderChildren(children, theme).map((child, idx) => (
          <React.Fragment key={idx}>{child}</React.Fragment>
        ))}
      </main>
    </div>
  )
}
