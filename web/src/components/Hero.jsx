/**
 * Hero Component
 * 
 * Large banner section at top of page
 * Displays: title, subtitle, body, background image/color
 */

import React from 'react'

export default function Hero({ node, theme }) {
  const { id, title, subtitle, summary, body, icon, route } = node
  const summaryText = typeof summary === 'string' ? summary.trim() : summary
  const summaryBase = typeof summaryText === 'string'
    ? summaryText.replace(/[.\s]+$/g, '')
    : summaryText

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

        {summaryText && (
          <p className="hero-manifesto">
            <span>{summaryBase}</span>
            <span className="hero-manifesto-dot" aria-hidden="true">.</span>
          </p>
        )}

        {body && <div className="hero-body">{body}</div>}
      </div>
    </section>
  )
}
