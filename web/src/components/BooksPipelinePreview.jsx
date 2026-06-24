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

  return (
    <section className="books-pipeline" aria-label="Books pipeline preview">
      <div className="books-pipeline-header">
        <h2 className="books-pipeline-title">Books Pipeline</h2>
        <p className="books-pipeline-subtitle">YAML to JSON artifact loaded from generated/books.page.json</p>
      </div>

      <div className="books-pipeline-meta">
        <div className="books-pipeline-meta-card">
          <span className="books-pipeline-meta-label">Generated</span>
          <span className="books-pipeline-meta-value">{page?.metadata?.generated_at || 'n/a'}</span>
        </div>
        <div className="books-pipeline-meta-card">
          <span className="books-pipeline-meta-label">Books</span>
          <span className="books-pipeline-meta-value">{page?.metadata?.book_count ?? 0}</span>
        </div>
      </div>

      <div className="books-pipeline-section-grid">
        {sections.map((section) => (
          <article key={section.id} className="books-pipeline-section-card">
            <h3>{section.title || section.id}</h3>
            <p>{section.description || 'No description'}</p>
            <div className="books-pipeline-section-count">Items: {Array.isArray(section.items) ? section.items.length : 0}</div>
          </article>
        ))}
      </div>

      <div className="books-pipeline-status">
        <h3>Status breakdown</h3>
        <ul>{renderStatusItems(page?.metadata?.books_by_status)}</ul>
      </div>
    </section>
  )
}
