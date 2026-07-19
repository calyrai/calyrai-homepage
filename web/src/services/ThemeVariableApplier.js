export class ThemeVariableApplier {
  constructor(root = document.documentElement) {
    this.root = root
  }

  apply(themeData) {
    if (!themeData?.skin) return

    const colors = themeData.skin.colors || {}
    const components = themeData.skin.components || {}
    const lineWidth =
      components?.ui?.line_width ||
      themeData?.base?.borders?.width_thin ||
      themeData?.base?.borders?.width_medium

    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string' && !value.includes('{{')) {
        this.root.style.setProperty(`--color-${key.replace(/_/g, '-')}`, value)
      }
    })

    if (typeof lineWidth === 'string' && !lineWidth.includes('{{')) {
      this.root.style.setProperty('--line-width', lineWidth)
      this.root.style.setProperty('--border-width', lineWidth)
    }

    this.#applyHeroVariables(components.hero)
    this.#applyTileVariables(components.tile)
    this.#applyCardSystemVariables(themeData?.components?.card_system)
  }

  #applyHeroVariables(hero = {}) {
    if (hero.background && !hero.background.includes('{{')) {
      this.root.style.setProperty('--hero-bg', hero.background)
    }
    if (hero.text && !hero.text.includes('{{')) {
      this.root.style.setProperty('--hero-text', hero.text)
    }
  }

  #applyTileVariables(tile = {}) {
    if (tile.background && !tile.background.includes('{{')) {
      this.root.style.setProperty('--tile-bg', tile.background)
    }
    if (tile.text_color && !tile.text_color.includes('{{')) {
      this.root.style.setProperty('--tile-text', tile.text_color)
    }
  }

  #applyCardSystemVariables(cardSystem = {}) {
    const mesh = cardSystem.mesh || {}

    if (cardSystem.radius !== undefined) {
      this.root.style.setProperty('--card-radius', String(cardSystem.radius))
    }
    if (cardSystem.min_height !== undefined) {
      this.root.style.setProperty('--card-min-height', String(cardSystem.min_height))
    }
    if (cardSystem.padding !== undefined) {
      this.root.style.setProperty('--card-padding', String(cardSystem.padding))
    }

    this.root.style.setProperty('--card-mesh-display', mesh.enabled === false ? 'none' : 'block')

    if (mesh.opacity !== undefined) {
      this.root.style.setProperty('--card-mesh-opacity', String(mesh.opacity))
    }
    if (mesh.hover_opacity !== undefined) {
      this.root.style.setProperty('--card-mesh-hover-opacity', String(mesh.hover_opacity))
    }
    if (mesh.cell_width !== undefined && mesh.cell_height !== undefined) {
      this.root.style.setProperty('--card-mesh-size', `${mesh.cell_width} ${mesh.cell_height}`)
    }
  }
}
