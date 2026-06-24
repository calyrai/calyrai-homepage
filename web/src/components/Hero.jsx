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
  const brandColor = '#ff00ff'
  const brandStyle = {
    color: brandColor,
    textShadow:
      '0 0 8px rgba(255, 0, 255, 0.98), 0 0 18px rgba(255, 0, 255, 0.82), 0 0 34px rgba(255, 0, 255, 0.6)',
  }
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
        <p className="hero-brand">
          <span className="hero-brand-main">Calyr.a</span>
          <span className="hero-brand-i" style={brandStyle}>í</span>
        </p>
        <p className="hero-manifesto">
          create what is not here yet
          <span className="hero-manifesto-dot" style={brandStyle}>.</span>
        </p>
        {icon && <div className="hero-icon">{icon}</div>}

        {title && <h1 className="hero-title">{title}</h1>}

        {subtitle && <p className="hero-subtitle">{subtitle}</p>}

        {body && <div className="hero-body">{body}</div>}

        {route && (
          <a href={route} className="hero-cta">
            Learn More
          </a>
        )}
      </div>
    </section>
  )
}
