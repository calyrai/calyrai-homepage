import React, { useState } from 'react'
import '../styles/quick-contact.css'

function normalizeLinkItem(item) {
  if (!item) return null
  if (typeof item === 'string') {
    return { id: item, label: item, href: item }
  }

  const href = item.route || item.href || item.url
  if (!href) return null

  const label = item.label || item.name || item.id || href
  const id = item.id || `${label}-${href}`
  return { id, label, href }
}

function buildContactLinks(page) {
  const links = []

  if (page?.route) {
    const routeLabel = typeof page.route === 'string' && page.route.startsWith('mailto:')
      ? page.route.replace('mailto:', '')
      : page.route
    links.push({ id: 'primary-route', label: routeLabel, href: page.route })
  }

  if (Array.isArray(page?.links)) {
    page.links.forEach((item) => {
      const normalized = normalizeLinkItem(item)
      if (normalized) links.push(normalized)
    })
  }

  const seen = new Set()
  return links.filter((item) => {
    const key = `${item.label}|${item.href}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function QuickContactRail({ page }) {
  const [isOpen, setIsOpen] = useState(false)
  const contactLinks = buildContactLinks(page)

  if (!page || contactLinks.length === 0) {
    return null
  }

  const tabLabel = page.title || page.id || ''

  return (
    <aside className={`quick-contact-rail ${isOpen ? 'open' : ''}`} aria-label={tabLabel}>
      <button
        className="quick-contact-tab"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="quick-contact-links"
      >
        {tabLabel}
      </button>

      <div className="quick-contact-links" id="quick-contact-links">
        {contactLinks.map((item) => (
          <a
            key={item.id}
            className="quick-contact-link"
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
            aria-label={item.label}
            title={item.label}
          >
            <span className="quick-contact-icon" aria-hidden="true">{item.label.slice(0, 2).toUpperCase()}</span>
            <span className="quick-contact-label">{item.label}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}
