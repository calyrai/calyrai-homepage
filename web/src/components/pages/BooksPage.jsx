import React from 'react'
import { applyTitleDefaults } from '../../utils/titleDefaults'

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
    <article className="content-page-card books-page-card">
      <div className="content-page-card-head books-page-card-head">
        <h4>{applyTitleDefaults(item.title || item.id)}</h4>
        {item.year && <span className="content-page-card-year books-page-card-year">{item.year}</span>}
      </div>

      {Array.isArray(item.authors) && item.authors.length > 0 && (
        <p className="content-page-authors books-page-authors">{item.authors.join(', ')}</p>
      )}

      {item.objective && <p className="content-page-objective books-page-objective">{item.objective}</p>}
      {item.summary && <p className="content-page-summary books-page-summary">{item.summary}</p>}

      {tags.length > 0 && (
        <ul className="content-page-tags books-page-tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      {visibleCtas.length > 0 && (
        <div className="content-page-ctas books-page-ctas">
          {visibleCtas.map((cta) => (
            <a
              key={`${item.id}-${cta.type}`}
              href={cta.url}
              className="content-page-cta books-page-cta"
              target="_blank"
              rel="noreferrer"
            >
              <span>{cta.label}</span>
              <span aria-hidden="true" className="content-page-cta-arrow books-page-cta-arrow">→</span>
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
    <section className="content-page-section books-page-section" id={`books-${section.id}`}>
      <header className="content-page-section-head books-page-section-head">
        <h3>{applyTitleDefaults(section.title || section.id)}</h3>
        {section.description && <p>{section.description}</p>}
      </header>
      <div className="content-page-grid books-page-grid">
        {items.map((item) => (
          <BookCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

export default function BooksPage({ page }) {
  if (!page) {
    return <main className="content-page books-page books-page-empty" />
  }

  const sections = Array.isArray(page.sections) ? page.sections : []
  const heroTitleRaw = page?.hero?.title || page?.header?.page_label || ''
  const heroTitle = applyTitleDefaults(heroTitleRaw)
  const heroSubtitle = page?.hero?.subtitle || ''
  const heroKicker = page?.header?.section_label || ''
  const homeLabel = page?.header?.brand || page?.id || ''
  const heroStyle = (page?.style && page.style.hero && typeof page.style.hero === 'object') ? page.style.hero : {}
  const heroTitleVars = {
    ...(heroStyle.title_color ? { '--books-title-color': heroStyle.title_color } : {}),
    ...(heroStyle.title_dot_color ? { '--books-title-dot-color': heroStyle.title_dot_color } : {}),
    ...(heroStyle.title_hover_color ? { '--books-title-hover-color': heroStyle.title_hover_color } : {}),
    ...(heroStyle.title_dot_glow ? { '--books-title-dot-glow': heroStyle.title_dot_glow } : {}),
  }
  const generatedLabel = page?.metadata?.labels?.generated || page?.metadata?.generated_label || ''
  const generatedValue = page?.metadata?.generated_at || ''
  const booksLabel = page?.metadata?.labels?.books || page?.metadata?.book_count_label || ''
  const booksValue = page?.metadata?.book_count

  return (
    <main className="content-page books-page" aria-label={page?.id || ''}>
      <header className="content-page-hero books-page-hero">
        {heroKicker && <p className="content-page-kicker books-page-kicker">{heroKicker}</p>}
        <h2>
          <a className="content-page-home-link books-page-home-link" href="/" aria-label={homeLabel} style={heroTitleVars}>
            <span>{heroTitle}</span>
          </a>
        </h2>
        {heroSubtitle && <p>{heroSubtitle}</p>}
      </header>

      <div className="content-page-meta books-page-meta">
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
