/**
 * Element Component
 * 
 * Generic leaf element node
 * Used for footer, contact, legal, etc.
 */

import React from 'react'
import LogoAnimation from './logo/LogoAnimation'

export default function Element({ node, theme }) {
  const { id, title, summary, body, icon, route } = node

  if (id === 'logo') {
    const heroTheme = theme?.skin?.components?.hero || {}
    const logoLayout = heroTheme.logo_layout || 'inline'
    return <LogoAnimation className="logo-element" label={title} layout={logoLayout} />
  }

  // Use footer theme for footer nodes, generic element theme otherwise.
  const isFooter = typeof id === 'string' && id.toLowerCase().includes('footer')
  const componentTheme = isFooter
    ? theme?.skin?.components?.footer
    : theme?.skin?.components?.element

  const elementStyle = componentTheme
    ? {
        backgroundColor: componentTheme.background,
        color: componentTheme.text_color,
        borderColor: componentTheme.border || componentTheme.border_top,
      }
    : {}

  const WrapperTag = isFooter ? 'footer' : 'div'
  const dataType = isFooter ? 'footer' : 'element'
  const className = isFooter ? 'element footer-element' : 'element'

  return (
    <WrapperTag className={className} id={id} data-type={dataType} style={elementStyle}>
      <div className="element-content">
        {icon && <div className="element-icon">{icon}</div>}

        {title && <h4 className="element-title">{title}</h4>}

        {summary && <p className="element-summary">{summary}</p>}

        {body && (
          <div className="element-body">
            {body.split('\n').map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}

        {route && (
          <a href={route} className="element-link">
            {title} →
          </a>
        )}
      </div>
    </WrapperTag>
  )
}
