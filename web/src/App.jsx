import React, { useState, useEffect } from 'react'
import { renderNode } from './components/Renderer'
import Navigation from './components/Navigation'
import DotRasterBackground from './components/DotRasterBackground'
import BooksPage from './components/pages/BooksPage'
import PhilosophyPage from './components/pages/PhilosophyPage'
import SearchOverlay from './components/SearchOverlay'
import { SelectionProvider } from './context/SelectionContext'
import { RippleProvider } from './context/RippleContext'
import { AST_DATA, THEME_DATA, BOOKS_PAGE_DATA } from './data/runtimeArtifacts'
import { resolveContactQrAlias } from './services/ContactQrService'
import { ThemeVariableApplier } from './services/ThemeVariableApplier'
import { RouteStateService } from './services/RouteStateService'
import './styles/theme.css'
import './styles/components.css'
import './styles/layout.css'

function getLocationPath() {
  return `${window.location.pathname}${window.location.hash || ''}`
}

function findNodeById(node, id) {
  if (!node || typeof node !== 'object') return null
  if (node.id === id) return node
  for (const child of node.children || []) {
    const match = findNodeById(child, id)
    if (match) return match
  }
  return null
}

function App() {
  const [ast] = useState(AST_DATA)
  const [theme] = useState(THEME_DATA)
  const [booksPage] = useState(BOOKS_PAGE_DATA)
  const [currentPath, setCurrentPath] = useState(getLocationPath())
  const [loading, setLoading] = useState(true)
  const [visualsReady, setVisualsReady] = useState(false)
  const [error, setError] = useState(null)

  const themeVariableApplier = new ThemeVariableApplier()
  const routeState = RouteStateService.create(currentPath)
  const philosophyNode = findNodeById(ast, 'philosophy')

  useEffect(() => {
    try {
      themeVariableApplier.apply(theme)
      setLoading(false)
    } catch (err) {
      console.error('Failed to initialize bundled runtime artifacts:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return undefined

    const revealVisuals = () => setVisualsReady(true)
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(revealVisuals, { timeout: 1200 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timerId = window.setTimeout(revealVisuals, 450)
    return () => window.clearTimeout(timerId)
  }, [loading])

  useEffect(() => {
    const onPopState = () => setCurrentPath(getLocationPath())
    const onHashChange = () => setCurrentPath(getLocationPath())

    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  useEffect(() => {
    const redirectTarget = resolveContactQrAlias(window.location.hash)
    if (!redirectTarget) {
      return undefined
    }

    window.location.replace(redirectTarget)
    return undefined
  }, [currentPath])

  useEffect(() => {
    document.body.classList.toggle('books-route', routeState.isBooksRoute)
    return () => {
      document.body.classList.remove('books-route')
    }
  }, [routeState.isBooksRoute])

  useEffect(() => {
    if (!routeState.isHomeAliasRoute || !routeState.homeAnchor) {
      return undefined
    }

    const scrollToAnchor = () => {
      const anchorEl = document.getElementById(routeState.homeAnchor)
      if (!anchorEl) {
        return
      }

      anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const rafId = window.requestAnimationFrame(scrollToAnchor)
    return () => window.cancelAnimationFrame(rafId)
  }, [routeState.isHomeAliasRoute, routeState.homeAnchor, currentPath])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!ast || !theme) {
    return <div>No data</div>
  }

  return (
    <SelectionProvider>
      {visualsReady ? <DotRasterBackground theme={theme} isBooksRoute={routeState.isSpecialRoute} /> : null}
      <Navigation theme={theme} ast={ast} visualsReady={visualsReady} />
      <SearchOverlay />

      <div className="app" style={{ '--theme-primary': theme.colors?.primary || '#000' }}>
        {routeState.isPhilosophyRoute
          ? <PhilosophyPage node={philosophyNode} />
          : renderNode(ast, theme)}
        {routeState.isBooksRoute ? <BooksPage page={booksPage} embedded /> : null}
      </div>
    </SelectionProvider>
  )
}

function AppWithRipple() {
  return (
    <RippleProvider>
      <App />
    </RippleProvider>
  )
}

export default AppWithRipple
