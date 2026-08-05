import React, { useEffect, useMemo, useRef, useState } from 'react'

const MAX_RESULTS = 12

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim()
}

function resultRoute(id, item) {
  const route = String(item?.route || '').trim()
  if (route) return route
  return `/#${id}`
}

function categoryFor(route) {
  if (route.includes('/methods/')) return 'Method'
  if (route.includes('/platforms/')) return 'Platform'
  if (route.includes('/whitepapers/')) return 'White paper'
  if (route.includes('/company/')) return 'Company'
  if (route.includes('/research/')) return 'Research'
  return 'Homepage'
}

export default function SearchOverlay() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState({})
  const [indexState, setIndexState] = useState('idle')
  const inputRef = useRef(null)

  const entries = useMemo(() => Object.entries(index)
    .filter(([, item]) => item?.title || item?.summary)
    .map(([id, item]) => ({ id, ...item, href: resultRoute(id, item) })), [index])

  const results = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    return entries.map((item) => {
      const title = normalize(item.title)
      const summary = normalize(item.summary)
      const body = normalize(item.body_preview)
      const keywords = normalize((item.keywords || []).join(' '))
      const score = tokens.length === 0 ? (item.route ? 1 : 0) : tokens.reduce((total, token) => (
        total
        + (title.startsWith(token) ? 12 : 0)
        + (title.includes(token) ? 7 : 0)
        + (keywords.includes(token) ? 4 : 0)
        + (summary.includes(token) ? 3 : 0)
        + (body.includes(token) ? 1 : 0)
      ), 0)
      return { ...item, score }
    }).filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, MAX_RESULTS)
  }, [entries, query])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      } else if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('search-open', open)
    if (open) window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => document.body.classList.remove('search-open')
  }, [open])

  useEffect(() => {
    if (!open || indexState !== 'idle') return undefined

    const controller = new AbortController()
    setIndexState('loading')
    fetch('/generated/nexus.index.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Search index returned ${response.status}`)
        return response.json()
      })
      .then((data) => {
        setIndex(data && typeof data === 'object' ? data : {})
        setIndexState('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setIndexState('error')
      })

    return () => controller.abort()
    // indexState intentionally omitted: including it causes setIndexState('loading')
    // to trigger cleanup which aborts the in-flight fetch immediately
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <button className="site-search-trigger" type="button" onClick={() => setOpen(true)} aria-label="Search the complete website" aria-haspopup="dialog">
        <span>SEARCH</span><kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="site-search-layer" role="dialog" aria-modal="true" aria-label="Website search">
          <button className="site-search-backdrop" type="button" onClick={close} aria-label="Close search" />
          <section className="site-search-panel">
            <header><span>CALYR.AÍ / KNOWLEDGE INDEX</span><button type="button" onClick={close}>CLOSE</button></header>
            <label htmlFor="site-search-input">Search projects, methods, platforms, and publications</label>
            <input ref={inputRef} id="site-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a concept, method, or question…" autoComplete="off" />
            <div className="site-search-meta"><span>{String(results.length).padStart(2, '0')} RESULTS</span><span>{indexState === 'loading' ? 'LOADING INDEX' : 'ENTER A TOPIC'}</span></div>
            <div className="site-search-results" role="list">
              {results.map((item, index) => (
                <a key={item.id} href={item.href} onClick={close} role="listitem">
                  <span className="site-search-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="site-search-copy"><strong>{item.title}</strong><small>{item.summary || item.body_preview}</small></span>
                  <span className="site-search-type">{categoryFor(item.href)}</span>
                </a>
              ))}
              {indexState === 'error' && <p className="site-search-empty">The compiled index could not be loaded. Please try again.</p>}
              {indexState !== 'loading' && indexState !== 'error' && results.length === 0 && <p className="site-search-empty">No indexed result. Try a platform, method, project, or scientific term.</p>}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
