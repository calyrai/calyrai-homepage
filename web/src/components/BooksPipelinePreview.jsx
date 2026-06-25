import React from 'react'

function renderStatusItems(booksByStatus = {}) {
  return Object.entries(booksByStatus)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, count]) => (
      <li key={status} className="books-pipeline-status-item">
        <span className="books-pipeline-status-label">{status}</span>
        <span className="books-pipeline-status-count">{count}</span>
      </li>
    ))
}

export default function BooksPipelinePreview({ page }) {
  if (!page) {
    return null
  }

  const sections = Array.isArray(page.sections) ? page.sections : []
  const pipelineTitle = page?.pipeline?.title || page?.hero?.title || page?.header?.page_label || ''
  const pipelineSubtitle = page?.pipeline?.subtitle || ''
  const generatedLabel = page?.metadata?.labels?.generated || page?.metadata?.generated_label || ''
  const generatedValue = page?.metadata?.generated_at || ''
  const booksLabel = page?.metadata?.labels?.books || page?.metadata?.book_count_label || ''
  const booksValue = page?.metadata?.book_count
  const itemsLabel = page?.pipeline?.items_label || page?.metadata?.labels?.items || ''
  const statusTitle = page?.pipeline?.status_title || ''

  return (
    <section className="books-pipeline" aria-label={pipelineTitle}>
      <div className="books-pipeline-header">
        {pipelineTitle && <h2 className="books-pipeline-title">{pipelineTitle}</h2>}
        {pipelineSubtitle && <p className="books-pipeline-subtitle">{pipelineSubtitle}</p>}
      </div>

      <div className="books-pipeline-meta">
        {(generatedLabel || generatedValue) && (
          <div className="books-pipeline-meta-card">
            {generatedLabel && <span className="books-pipeline-meta-label">{generatedLabel}</span>}
            {generatedValue && <span className="books-pipeline-meta-value">{generatedValue}</span>}
          </div>
        )}
        {(booksLabel || booksValue !== undefined) && (
          <div className="books-pipeline-meta-card">
            {booksLabel && <span className="books-pipeline-meta-label">{booksLabel}</span>}
            {booksValue !== undefined && <span className="books-pipeline-meta-value">{booksValue}</span>}
          </div>
        )}
      </div>

      <div className="books-pipeline-section-grid">
        {sections.map((section) => (
          <article key={section.id} className="books-pipeline-section-card">
            <h3>{section.title || section.id}</h3>
            {section.description && <p>{section.description}</p>}
            {(itemsLabel || Array.isArray(section.items)) && (
              <div className="books-pipeline-section-count">
                {[itemsLabel, Array.isArray(section.items) ? section.items.length : 0]
                  .filter((value) => value !== '' && value !== null && value !== undefined)
                  .join(' ')}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="books-pipeline-status">
        {statusTitle && <h3>{statusTitle}</h3>}
        <ul>{renderStatusItems(page?.metadata?.books_by_status)}</ul>
      </div>
    </section>
  )
}
