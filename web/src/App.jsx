import React, { useState, useEffect, useMemo } from 'react'
import { renderNode } from './components/Renderer'
import Navigation from './components/Navigation'
import QuickContactRail from './components/QuickContactRail'
import DotRasterBackground from './components/DotRasterBackground'
import BooksPage from './components/pages/BooksPage'
import ContactPage from './components/pages/ContactPage'
import { SelectionProvider } from './context/SelectionContext'
import { RippleProvider } from './context/RippleContext'
import { AST_DATA, THEME_DATA, BOOKS_PAGE_DATA } from './data/runtimeArtifacts'
import { ThemeVariableApplier } from './services/ThemeVariableApplier'
import { RouteStateService } from './services/RouteStateService'
import { NodeQueryService } from './services/NodeQueryService'
import './styles/theme.css'
import './styles/components.css'
import './styles/layout.css'

function App() {
  const [ast] = useState(AST_DATA)
  const [theme] = useState(THEME_DATA)
  const [booksPage] = useState(BOOKS_PAGE_DATA)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const themeVariableApplier = new ThemeVariableApplier()
  const routeState = RouteStateService.create(currentPath)
  const contactPage = new NodeQueryService(ast).findById('contact')
  const landingAst = useMemo(() => {
    if (!ast || !Array.isArray(ast.children)) {
      return ast
    }

    return {
      ...ast,
      children: ast.children.filter((node) => node?.id !== 'logo'),
    }
  }, [ast])

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
    const onPopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('books-route', routeState.isBooksRoute)
    document.body.classList.toggle('contact-route', routeState.isContactRoute)
    return () => {
      document.body.classList.remove('books-route')
      document.body.classList.remove('contact-route')
    }
  }, [routeState.isBooksRoute, routeState.isContactRoute])

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
      {/* Navigation (Stage 8) */}
      <Navigation theme={theme} ast={ast} />
      <QuickContactRail page={contactPage} />
      
      <div className="app" style={{ '--theme-primary': theme.colors?.primary || '#000' }}>
        {routeState.isBooksRoute ? <BooksPage page={booksPage} /> : routeState.isContactRoute ? <ContactPage page={contactPage} /> : renderNode(landingAst, theme)}
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
