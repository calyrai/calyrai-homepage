import React, { useState, useEffect } from 'react'
import { renderNode } from './components/Renderer'
import Navigation from './components/Navigation'
import DotRasterBackground from './components/DotRasterBackground'
import BooksPage from './components/pages/BooksPage'
import { SelectionProvider } from './context/SelectionContext'
import { RippleProvider } from './context/RippleContext'
import { AST_DATA, THEME_DATA, BOOKS_PAGE_DATA } from './data/runtimeArtifacts'
import { ThemeVariableApplier } from './services/ThemeVariableApplier'
import { RouteStateService } from './services/RouteStateService'
import './styles/theme.css'
import './styles/components.css'
import './styles/layout.css'

function getLocationPath() {
  return `${window.location.pathname}${window.location.hash || ''}`
}

function App() {
  const [ast] = useState(AST_DATA)
  const [theme] = useState(THEME_DATA)
  const [booksPage] = useState(BOOKS_PAGE_DATA)
  const [currentPath, setCurrentPath] = useState(getLocationPath())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const themeVariableApplier = new ThemeVariableApplier()
  const routeState = RouteStateService.create(currentPath)

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
    document.body.classList.toggle('books-route', routeState.isBooksRoute)
    return () => {
      document.body.classList.remove('books-route')
    }
  }, [routeState.isBooksRoute])

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
      <DotRasterBackground theme={theme} isBooksRoute={routeState.isSpecialRoute} />
      <Navigation theme={theme} ast={ast} />

      <div className="app" style={{ '--theme-primary': theme.colors?.primary || '#000' }}>
        {routeState.isBooksRoute ? <BooksPage page={booksPage} /> : renderNode(ast, theme)}
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
