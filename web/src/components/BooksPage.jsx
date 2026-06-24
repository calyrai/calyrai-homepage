import React from 'react'

function BookCard({ item }) {
  const tags = Array.isArray(item.tags) ? item.tags : []
  const ctas = Array.isArray(item.ctas) ? item.ctas : []
  const visibleCtas = ctas.filter((cta) => {
    if (!cta || !cta.url) return false
    if (cta.online === false) return false
    if (cta.is_online === false) return false
    if (cta.enabled === false) return false
    return true
  })

  return (
    <article className="books-page-card">
      <div className="books-page-card-head">
        <h4>{item.title || item.id}</h4>
        {item.year && <span className="books-page-card-year">{item.year}</span>}
      </div>

      {Array.isArray(item.authors) && item.authors.length > 0 && (
        <p className="books-page-authors">{item.authors.join(', ')}</p>
      )}

      {item.objective && <p className="books-page-objective">{item.objective}</p>}
      {item.summary && <p className="books-page-summary">{item.summary}</p>}

      {tags.length > 0 && (
        <ul className="books-page-tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      {visibleCtas.length > 0 && (
        <div className="books-page-ctas">
          {visibleCtas.map((cta) => (
            <a
              key={`${item.id}-${cta.type}`}
              href={cta.url}
              className="books-page-cta"
              target="_blank"
              rel="noreferrer"
            >
              <span>{cta.label}</span>
              <span aria-hidden="true" className="books-page-cta-arrow">→</span>
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

function BooksSection({ section }) {
  const items = Array.isArray(section.items) ? section.items : []

  if (items.length === 0) {
    return null
  }

  return (
    <section className="books-page-section" id={`books-${section.id}`}>
      <header className="books-page-section-head">
        <h3>{section.title || section.id}</h3>
        {section.description && <p>{section.description}</p>}
      </header>
      <div className="books-page-grid">
        {items.map((item) => (
          <BookCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default function BooksPage({ page }) {
  if (!page) {
    return (
      <main className="books-page books-page-empty">
        <h2>Books</h2>
        <p>Books artifact not loaded yet.</p>
      </main>
    )
  }

  const sections = Array.isArray(page.sections) ? page.sections : []
  const heroTitleRaw = page?.hero?.title || 'book'
  const heroTitle = heroTitleRaw.replace(/[.]+\s*$/, '')

  return (
    <main className="books-page" aria-label="Books page">
      <header className="books-page-hero">
        <p className="books-page-kicker">Research Stream</p>
        <h2>
          <a className="books-page-home-link" href="/" aria-label="Go to landing page">
            <span>{heroTitle}</span>
            <span aria-hidden="true" className="books-page-title-dot" />
          </a>
        </h2>
        <p>{page?.hero?.subtitle || 'Long-form concepts and frameworks'}</p>
      </header>

      <div className="books-page-meta">
        <span>Generated: {page?.metadata?.generated_at || 'n/a'}</span>
        <span>Books: {page?.metadata?.book_count ?? 0}</span>
      </div>

      {sections.map((section) => (
        <BooksSection key={section.id} section={section} />
      ))}
    </main>
  )
}
