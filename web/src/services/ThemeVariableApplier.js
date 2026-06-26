export class ThemeVariableApplier {
  constructor(root = document.documentElement) {
    this.root = root
  }

  apply(themeData) {
    if (!themeData?.skin) return

    const colors = themeData.skin.colors || {}
    const components = themeData.skin.components || {}

    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === 'string' && !value.includes('{{')) {
        this.root.style.setProperty(`--color-${key.replace(/_/g, '-')}`, value)
      }
    })

    this.#applyHeroVariables(components.hero)
    this.#applyTileVariables(components.tile)
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
}
