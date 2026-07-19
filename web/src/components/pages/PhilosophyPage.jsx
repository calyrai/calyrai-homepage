import React from 'react'

export default function PhilosophyPage({ node }) {
  if (!node) return null

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
        <p className="content-page-kicker">trustworthy scientific AI</p>
        <h2>philosophy.</h2>
        <p>{node.summary}</p>
      </header>

      <section className="philosophy-principles" aria-label="CALYR.ai principles">
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

      <section className="philosophy-sources">
        <h3>European framework</h3>
        <div className="philosophy-source-list">
          {(node.links || []).map((link) => (
            <a key={link.id || link.route} href={link.route} target="_blank" rel="noreferrer">
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
