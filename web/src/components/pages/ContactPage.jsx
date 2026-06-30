import React from 'react'
import { LinkItemService } from '../../services/LinkItemService'

function ContactInstitution({ institution }) {
  const capabilities = Array.isArray(institution.capabilities) ? institution.capabilities : []
  const projects = Array.isArray(institution.projects) ? institution.projects : []
  const city = institution.location?.city
  const country = institution.location?.country
  const locationLabel = [city, country].filter(Boolean).join(', ')
  const websiteLabel = (() => {
    if (!institution.website) return ''
    try {
      return new URL(institution.website).hostname.replace(/^www\./, '')
    } catch {
      return institution.website
    }
  })()

  return (
    <article className="contact-page-card">
      <div className="contact-page-card-head">
        <h4>{institution.name || institution.id}</h4>
        {institution.category && <span className="contact-page-card-kind">{institution.category}</span>}
      </div>

      {locationLabel && <p className="contact-page-meta-line">{locationLabel}</p>}

      {capabilities.length > 0 && (
        <ul className="contact-page-tags">
          {capabilities.map((capability) => {
            const label = typeof capability === 'string'
              ? capability
              : (capability.label || capability.id || capability.name || capability.route || capability.href || capability.url)
            const href = typeof capability === 'string'
              ? null
              : (capability.route || capability.href || capability.url || null)

            return (
              <li key={label}>
                {href ? (
                  <a href={href}>{label}</a>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {institution.visibility?.show_network !== false && projects.length > 0 && (
        <div className="contact-page-links">
          {projects.map((project) => {
            const label = typeof project === 'string'
              ? project
              : (project.label || project.id || project.route || project.href || project.url)
            const href = typeof project === 'string'
              ? `/${project}`
              : (project.route || project.href || project.url || `/${project.id || ''}`)

            return (
              <a key={label} href={href} className="contact-page-link">
                <span>{label}</span>
                <span aria-hidden="true" className="contact-page-link-arrow">→</span>
              </a>
            )
          })}
        </div>
      )}

      {institution.website && (
        <div className="contact-page-links">
          <a href={institution.website} className="contact-page-link" target="_blank" rel="noreferrer">
            <span>{websiteLabel}</span>
            <span aria-hidden="true" className="contact-page-link-arrow">→</span>
          </a>
        </div>
      )}
    </article>
  )
}

export default function ContactPage({ page }) {
  if (!page) {
    return <main className="contact-page contact-page-empty" />
  }

  const pageLabel = page.title || page.id || ''

  const institutions = Array.isArray(page.institutions)
    ? page.institutions.filter((institution) => institution?.visibility?.public !== false)
    : []
  const contacts = Array.isArray(page.contacts)
    ? page.contacts.filter((entry) => LinkItemService.getContactSymbol(entry) && (entry.route || entry.href || entry.url))
    : []
  const primaryMetaLink = Array.isArray(page.links) && page.links.length > 0 ? page.links[0] : null
  const kicker = [page.tile_title, page.landing_message].filter(Boolean).join(' ')
  const primaryLinkHref = primaryMetaLink?.route || primaryMetaLink?.href || primaryMetaLink?.url || ''
  const primaryLinkLabel = primaryMetaLink?.label || ''

  return (
    <main className="contact-page" aria-label={pageLabel}>
      <header className="contact-page-hero">
        {kicker && <p className="contact-page-kicker">{kicker}</p>}
        <h2>
          <a className="contact-page-home-link" href="/" aria-label={pageLabel}>
            {pageLabel}
          </a>
        </h2>
        {page.summary && <p>{page.summary}</p>}
      </header>

      <div className="contact-page-meta">
        {primaryLinkHref && primaryLinkLabel && (
          <a href={primaryLinkHref} className="contact-page-primary-link">
            {primaryLinkLabel}
          </a>
        )}
      </div>

      {contacts.length > 0 && (
        <section className="contact-page-section contact-page-section-compact">
          <div className="contact-page-symbols" aria-label="Contact channels">
            {contacts.map((entry) => {
              const href = entry.route || entry.href || entry.url
              const symbol = LinkItemService.getContactSymbol(entry)

              return (
                <a
                  key={entry.id || entry.label}
                  href={href}
                  className="contact-page-symbol-link"
                  aria-label={entry.label || entry.id || symbol}
                  title={entry.label || entry.id || symbol}
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <span aria-hidden="true">{symbol}</span>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {page.body && (
        <section className="contact-page-section">
          <p className="contact-page-body">{page.body}</p>
        </section>
      )}

      {institutions.length > 0 && (
        <section className="contact-page-section">
          <div className="contact-page-grid">
            {institutions.map((institution) => (
              <ContactInstitution key={institution.id || institution.name} institution={institution} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
