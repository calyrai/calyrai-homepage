const COLLAPSIBLE_SECTION_IDS = new Set(['movie', 'platforms', 'architecture'])

export class SectionLayoutService {
  static create(sectionNode) {
    const id = sectionNode?.id
    const route = sectionNode?.route

    const isMovieSection = id === 'movie'
    const isCollapsible = COLLAPSIBLE_SECTION_IDS.has(id)
    const titleHref = isMovieSection
      ? (id ? `#${id}` : null)
      : (route || (id ? `#${id}` : null))

    return {
      isMovieSection,
      isCollapsible,
      titleHref,
      defaultExpanded: !isCollapsible,
    }
  }
}
