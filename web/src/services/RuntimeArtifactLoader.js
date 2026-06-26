import { AST_DATA as FALLBACK_AST_DATA, THEME_DATA as FALLBACK_THEME_DATA, BOOKS_PAGE_DATA as FALLBACK_BOOKS_PAGE_DATA } from '../data/runtimeArtifacts'

export class RuntimeArtifactLoader {
  constructor(baseUrl = import.meta.env.BASE_URL || '/') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  }

  async loadAll() {
    try {
      const [ast, theme, booksPage] = await Promise.all([
        this.#loadJson('generated/nexus.ast.json', FALLBACK_AST_DATA),
        this.#loadJson('generated/nexus.theme.json', FALLBACK_THEME_DATA),
        this.#loadJson('generated/books.page.json', FALLBACK_BOOKS_PAGE_DATA),
      ])

      return { ast, theme, booksPage, source: 'generated' }
    } catch (error) {
      console.warn('Falling back to bundled runtime artifacts:', error)
      return {
        ast: FALLBACK_AST_DATA,
        theme: FALLBACK_THEME_DATA,
        booksPage: FALLBACK_BOOKS_PAGE_DATA,
        source: 'bundled',
      }
    }
  }

  async #loadJson(relativePath, fallbackValue) {
    const response = await fetch(`${this.baseUrl}${relativePath}`, { cache: 'no-store' })
    if (!response.ok) {
      if (response.status === 404 && fallbackValue !== undefined) {
        return fallbackValue
      }
      throw new Error(`Failed to load ${relativePath}: ${response.status}`)
    }
    return response.json()
  }
}