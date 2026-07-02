import React from 'react'
import { applyTitleDefaults } from '../utils/titleDefaults'

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
        <h4>{applyTitleDefaults(item.title || item.id)}</h4>
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
        <h3>{applyTitleDefaults(section.title || section.id)}</h3>
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
    return <main className="books-page books-page-empty" />
  }

  const sections = Array.isArray(page.sections) ? page.sections : []
  const heroTitleRaw = page?.hero?.title || page?.header?.page_label || ''
  const heroTitle = applyTitleDefaults(heroTitleRaw)
  const heroSubtitle = page?.hero?.subtitle || ''
  const heroKicker = page?.header?.section_label || ''
  const homeLabel = page?.header?.brand || page?.id || ''
  const generatedLabel = page?.metadata?.labels?.generated || page?.metadata?.generated_label || ''
  const generatedValue = page?.metadata?.generated_at || ''
  const booksLabel = page?.metadata?.labels?.books || page?.metadata?.book_count_label || ''
  const booksValue = page?.metadata?.book_count

  return (
    <main className="books-page" aria-label={page?.id || ''}>
      <header className="books-page-hero">
        {heroKicker && <p className="books-page-kicker">{heroKicker}</p>}
        <h2>
          <a className="books-page-home-link" href="/" aria-label={homeLabel}>
            <span>{heroTitle}</span>
          </a>
        </h2>
        {heroSubtitle && <p>{heroSubtitle}</p>}
      </header>

      <div className="books-page-meta">
        {(generatedLabel || generatedValue) && (
          <span>{[generatedLabel, generatedValue].filter(Boolean).join(' ')}</span>
        )}
        {(booksLabel || booksValue !== undefined) && (
          <span>{[booksLabel, booksValue].filter((value) => value !== '' && value !== null && value !== undefined).join(' ')}</span>
        )}
      </div>

      {sections.map((section) => (
        <BooksSection key={section.id} section={section} />
      ))}
    </main>
  )
}
