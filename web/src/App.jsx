import React, { useState, useEffect } from 'react'
import { renderNode } from './components/Renderer'
import Navigation from './components/Navigation'
import QuickContactRail from './components/QuickContactRail'
import DotRasterBackground from './components/DotRasterBackground'
import RippleLayer from './components/RippleLayer'
import { SelectionProvider } from './context/SelectionContext'
import { RippleProvider, useRipple } from './context/RippleContext'
import './styles/theme.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/navigation.css'
import './styles/background-effects.css'
import './styles/quick-contact.css'

function App() {
  const [ast, setAst] = useState(null)
  const [theme, setTheme] = useState(null)
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
    const loadArtifacts = async () => {
      try {
        // Cache-bust query params to force fresh load of compiled artifacts
        const ts = Date.now()
        const [astData, themeData] = await Promise.all([
          fetch(`/generated/nexus.ast.json?t=${ts}`).then((r) => r.json()),
          fetch(`/generated/nexus.theme.json?t=${ts}`).then((r) => r.json()),
        ])
        console.log('Theme loaded:', themeData?.skin?.id, themeData?.components?.hero)
        setAst(astData)
        setTheme(themeData)
        applyThemeToCSS(themeData)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load artifacts:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    loadArtifacts()
  }, [])

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
      <DotRasterBackground theme={theme} />
      <RippleLayer />
      {/* Navigation (Stage 8) */}
      <Navigation theme={theme} />
      <QuickContactRail />
      
      <div className="app" style={{ '--theme-primary': theme.colors?.primary || '#000', position: 'relative', zIndex: 1 }}>
        {/* Tiles View */}
        {renderNode(ast, theme)}
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
      if (e.target.closest('.navigation') || e.target.closest('[role="button"]')) {
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
