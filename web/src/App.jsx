import React, { useState, useEffect } from 'react'
import { renderNode } from './components/Renderer'
import Navigation from './components/Navigation'
import QuickContactRail from './components/QuickContactRail'
import DotRasterBackground from './components/DotRasterBackground'
import RippleLayer from './components/RippleLayer'
import BooksPage from './components/BooksPage'
import ContactPage from './components/ContactPage'
import { SelectionProvider } from './context/SelectionContext'
import { RippleProvider, useRipple } from './context/RippleContext'
import { AST_DATA, THEME_DATA, BOOKS_PAGE_DATA } from './data/runtimeArtifacts'
import { isInteractiveSurfaceEvent } from './utils/interactionFilters'
import './styles/theme.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/navigation.css'
import './styles/background-effects.css'
import './styles/quick-contact.css'

function App() {
  const [ast] = useState(AST_DATA)
  const [theme] = useState(THEME_DATA)
  const [booksPage] = useState(BOOKS_PAGE_DATA)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper to inject theme colors into CSS variables
  const applyThemeToCSS = (themeData) => {
    if (!themeData?.skin) return

    const root = document.documentElement
    const colors = themeData.skin.colors || {}
    const components = themeData.skin.components || {}

    console.log('Applying theme:', themeData.skin.id, 'hero bg:', components.hero?.background)

    // Apply color variables
    Object.entries(colors).forEach(([key, value]) => {
      // Skip template references
      if (typeof value === 'string' && !value.includes('{{')) {
        root.style.setProperty(`--color-${key.replace(/_/g, '-')}`, value)
      }
    })

    // Apply component-specific styles
    if (components.hero) {
      if (components.hero.background && !components.hero.background.includes('{{')) {
        console.log('Setting hero bg to:', components.hero.background)
        root.style.setProperty('--hero-bg', components.hero.background)
      }
      if (components.hero.text && !components.hero.text.includes('{{')) {
        root.style.setProperty('--hero-text', components.hero.text)
      }
    }

    if (components.tile) {
      if (components.tile.background && !components.tile.background.includes('{{')) {
        root.style.setProperty('--tile-bg', components.tile.background)
      }
      if (components.tile.text_color && !components.tile.text_color.includes('{{')) {
        root.style.setProperty('--tile-text', components.tile.text_color)
      }
    }
  }

  useEffect(() => {
    try {
      console.log('Theme loaded:', theme?.skin?.id, theme?.components?.hero)
      applyThemeToCSS(theme)
      setLoading(false)
    } catch (err) {
      console.error('Failed to initialize bundled artifacts:', err)
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
    const isBooksRoute = currentPath === '/books' || currentPath === '/philosophy'
    const isContactRoute = currentPath === '/contact'
    document.body.classList.toggle('books-route', isBooksRoute)
    document.body.classList.toggle('contact-route', isContactRoute)
    return () => {
      document.body.classList.remove('books-route')
      document.body.classList.remove('contact-route')
    }
  }, [currentPath])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!ast || !theme) {
    return <div>No data</div>
  }

  const isBooksRoute = currentPath === '/books' || currentPath === '/philosophy'
  const isContactRoute = currentPath === '/contact'
  const findNodeById = (node, targetId) => {
    if (!node) return null
    if (node.id === targetId) return node
    if (!Array.isArray(node.children)) return null
    for (const child of node.children) {
      const match = findNodeById(child, targetId)
      if (match) return match
    }
    return null
  }
  const contactPage = findNodeById(ast, 'contact')

  return (
    <SelectionProvider>
      <DotRasterBackground theme={theme} isBooksRoute={isBooksRoute || isContactRoute} />
      <RippleLayer />
      {/* Navigation (Stage 8) */}
      <Navigation theme={theme} />
      <QuickContactRail />
      
      <div className="app" style={{ '--theme-primary': theme.colors?.primary || '#000', position: 'relative', zIndex: 1 }}>
        {isBooksRoute ? <BooksPage page={booksPage} /> : isContactRoute ? <ContactPage page={contactPage} /> : renderNode(ast, theme)}
      </div>
    </SelectionProvider>
  )
}

function AppWithRipple() {
  return (
    <RippleProvider>
      <AppContent />
    </RippleProvider>
  )
}

function AppContent() {
  const { createRipple } = useRipple()

  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Only create ripples from actual content clicks, not UI elements
      if (isInteractiveSurfaceEvent(e)) {
        return
      }
      createRipple(e.clientX, e.clientY)
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [createRipple])

  return <App />
}

export default AppWithRipple
