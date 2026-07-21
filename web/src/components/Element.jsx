/**
 * Element Component
 * 
 * Generic leaf element node
 * Used for footer, contact, legal, etc.
 */

import React from 'react'
import LogoAnimation from './logo/LogoAnimation'
import { renderChildren } from './Renderer'
import { applyTitleDefaults } from '../utils/titleDefaults'

export default function Element({ node, theme, context = {} }) {
  const { id, title, summary, body, icon, route, tile_lead: tileLead, contacts = [], children = [], tagline = '' } = node
  const displayTitle = title ? applyTitleDefaults(title) : ''
  const authoredGridSpan = Number(node.render?.grid_span)
  const gridSpan = Number.isFinite(authoredGridSpan)
    ? Math.min(12, Math.max(1, Math.round(authoredGridSpan)))
    : 6

  if (id === 'logo') {
    return (
      <LogoAnimation
        className="logo-element"
        label={title}
        tagline={summary}
        layout="inline"
        showCanvas={true}
      />
    )
  }

  // Use footer theme for footer nodes, generic element theme otherwise.
  const isFooter = typeof id === 'string' && id.toLowerCase().includes('footer')
  const componentTheme = isFooter
    ? theme?.skin?.components?.footer
    : theme?.skin?.components?.element

  const elementStyle = {
    '--element-grid-span': gridSpan,
    ...(componentTheme
      ? {
        backgroundColor: componentTheme.background,
        color: componentTheme.text_color,
        borderColor: componentTheme.border || componentTheme.border_top,
      }
      : {}),
  }

  const WrapperTag = isFooter ? 'footer' : 'div'
  const dataType = isFooter ? 'footer' : 'element'
  const className = isFooter ? 'element footer-element' : 'element'
  const footerContacts = Array.isArray(contacts) ? contacts : []

  if (id === 'legal') return null

  return (
    <WrapperTag className={className} id={id} data-type={dataType} style={elementStyle}>
      <div className="element-content">
        {tileLead && <p className="element-eyebrow">{tileLead}</p>}

        {icon && <div className="element-icon">{icon}</div>}

        {title && <h4 className="element-title">{displayTitle}</h4>}

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
