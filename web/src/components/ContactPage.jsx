import React from 'react'

function ContactInstitution({ institution }) {
  const capabilities = Array.isArray(institution.capabilities) ? institution.capabilities : []
  const projects = Array.isArray(institution.projects) ? institution.projects : []
  const city = institution.location?.city
  const country = institution.location?.country
  const locationLabel = [city, country].filter(Boolean).join(', ')

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
            <span>Website</span>
            <span aria-hidden="true" className="contact-page-link-arrow">→</span>
          </a>
        </div>
      )}
    </article>
  )
}

export default function ContactPage({ page }) {
  if (!page) {
    return (
      <main className="contact-page contact-page-empty">
        <h2>Contacts</h2>
        <p>Contact artifact not loaded yet.</p>
      </main>
    )
  }

  const institutions = Array.isArray(page.institutions)
    ? page.institutions.filter((institution) => institution?.visibility?.public !== false)
    : []

  return (
    <main className="contact-page" aria-label="Contact page">
      <header className="contact-page-hero">
        <p className="contact-page-kicker">Swarm Intelligence Network</p>
        <h2>
          <a className="contact-page-home-link" href="/" aria-label="Go to landing page">
            {page.title || 'Contacts'}
          </a>
        </h2>
        <p>{page.summary || 'Research, industry, and partnership inquiries.'}</p>
      </header>

      <div className="contact-page-meta">
        <span>{page.subtitle || 'swarm intelligence'}</span>
        {page.route && (
          <a href={page.route} className="contact-page-primary-link">
            Email contact
          </a>
        )}
      </div>

      {page.body && (
        <section className="contact-page-section">
          <header className="contact-page-section-head">
            <h3>Contact</h3>
          </header>
          <p className="contact-page-body">{page.body}</p>
        </section>
      )}

      {institutions.length > 0 && (
        <section className="contact-page-section">
          <header className="contact-page-section-head">
            <h3>Institutions</h3>
            <p>Public swarm intelligence and infrastructure network</p>
          </header>
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
