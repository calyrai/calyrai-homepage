/**
 * Hero Component
 * 
 * Large banner section at top of page
 * Displays: title, subtitle, body, background image/color
 */

import React from 'react'

export default function Hero({ node, theme }) {
  const { id, title, subtitle, summary, body, icon, route } = node

  // Build inline style from theme
  const heroStyle = {}
  const heroTheme = theme?.skin?.components?.hero || {}
  if (theme?.skin?.components?.hero) {
    if (heroTheme.background && !heroTheme.background.includes('{{')) {
      heroStyle.background = heroTheme.background
    }
    if (heroTheme.text && !heroTheme.text.includes('{{')) {
      heroStyle.color = heroTheme.text
    }
  }

  return (
    <section className="hero" id={id} data-type="hero" style={heroStyle}>
      <div className="hero-content">
        {icon && <div className="hero-icon">{icon}</div>}

        {title && (
          <h1 className="hero-title">
            {route ? (
              <a href={route} className="hero-title-link" aria-label={title}>
                {title}
              </a>
            ) : (
              title
            )}
          </h1>
        )}

        {subtitle && <p className="hero-subtitle">{subtitle}</p>}

        {summary && <p className="hero-manifesto">{summary}</p>}

        {body && <div className="hero-body">{body}</div>}
      </div>
    </section>
  )
}
