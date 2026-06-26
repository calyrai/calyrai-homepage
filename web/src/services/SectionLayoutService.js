const COLLAPSIBLE_SECTION_IDS = new Set(['movie', 'platforms', 'architecture'])

export class SectionLayoutService {
  static create(sectionNode) {
    const id = sectionNode?.id
    const route = sectionNode?.route
    const behavior = sectionNode?.behavior || {}
    const render = sectionNode?.render || {}

    const isMovieSection = id === 'movie'
    const isCollapsible = typeof behavior.collapsible === 'boolean'
      ? behavior.collapsible
      : COLLAPSIBLE_SECTION_IDS.has(id)
    const titleHref = isMovieSection
      ? (id ? `#${id}` : null)
      : (route || (id ? `#${id}` : null))
    const defaultExpanded = typeof behavior.default_expanded === 'boolean'
      ? behavior.default_expanded
      : !isCollapsible

    return {
      isMovieSection,
      isCollapsible,
      titleHref,
      defaultExpanded,
      renderVariant: render.variant || null,
      renderSource: render.source || null,
      intentPurpose: sectionNode?.intent?.purpose || null,
    }
  }
}
