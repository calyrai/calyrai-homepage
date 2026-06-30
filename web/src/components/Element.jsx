/**
 * Element Component
 * 
 * Generic leaf element node
 * Used for footer, contact, legal, etc.
 */

import React from 'react'
import LogoAnimation from './logo/LogoAnimation'
import { renderChildren } from './Renderer'

export default function Element({ node, theme }) {
  const { id, title, summary, body, icon, route, contacts = [], children = [], tagline = '' } = node

  if (id === 'logo') {
    const heroTheme = theme?.skin?.components?.hero || {}
    const logoLayout = heroTheme.logo_layout || 'inline'
    return <LogoAnimation className="logo-element" label={title} tagline={tagline} layout={logoLayout} />
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
  const footerContacts = Array.isArray(contacts) ? contacts : []

  if (id === 'legal') return null

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

        {isFooter && footerContacts.length > 0 && (
          <div className="footer-contact-grid">
            {footerContacts.map((entry, idx) => {
              const label = entry?.label || entry?.id || `Contact ${idx + 1}`
              const value = entry?.value || 'TBD'
              const href = entry?.route || entry?.href || entry?.url || null
              const status = entry?.status || ''
              const shouldHide = entry?.hide || !value || value === 'TBD' || value === 'TBA'

              if (shouldHide) return null

              return (
                <article key={entry?.id || `${label}-${idx}`} className="footer-contact-item">
                  <p className="footer-contact-label">{label}</p>
                  {href ? (
                    <a href={href} className="footer-contact-value">{value}</a>
                  ) : (
                    <p className="footer-contact-value">{value}</p>
                  )}
                  {status && <p className="footer-contact-status">{status}</p>}
                </article>
              )
            })}
          </div>
        )}

        {route && (
          <a href={route} className="element-link">
            {title} →
          </a>
        )}

        {children.length > 0 && (
          <div className="element-children">
            {renderChildren(children, theme)}
          </div>
        )}
      </div>
    </WrapperTag>
  )
}
