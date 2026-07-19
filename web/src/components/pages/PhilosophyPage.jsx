import React from 'react'

export default function PhilosophyPage({ node }) {
  if (!node) return null

  const internalPresentations = (node.links || []).filter((link) => String(link.route || '').startsWith('/research/philosophy/'))
  const frameworkLinks = (node.links || []).filter((link) => !String(link.route || '').startsWith('/research/philosophy/'))

  const principles = String(node.body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <main className="content-page philosophy-page">
      <div className="content-page-topbar">
        <a className="content-page-back" href="/">← calyr.aí</a>
      </div>

      <header className="content-page-hero">
        <p className="content-page-kicker">scientific AI</p>
        <h2>philosophy.</h2>
        <p>{node.summary}</p>
      </header>

      <section className="philosophy-principles" aria-label="calyr.ai principles">
        {principles.map((principle) => {
          const [title, description = ''] = principle.split(' — ')
          return (
            <article className="philosophy-principle" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          )
        })}
      </section>

      {internalPresentations.length > 0 && (
        <section className="philosophy-feature" aria-label="Philosophy presentations">
          <p className="philosophy-feature-kicker">scientific position</p>
          {internalPresentations.map((link) => (
            <a key={link.id || link.route} href={link.route}>
              <span>{link.label}</span>
              <span aria-hidden="true">→</span>
            </a>
          ))}
        </section>
      )}

      <section className="philosophy-sources">
        <h3>European framework</h3>
        <div className="philosophy-source-list">
          {frameworkLinks.map((link) => (
            <a key={link.id || link.route} href={link.route} target="_blank" rel="noreferrer">
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
