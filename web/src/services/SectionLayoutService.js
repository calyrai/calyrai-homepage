export class SectionLayoutService {
  static create(sectionNode) {
    const id = sectionNode?.id
    const route = sectionNode?.route
    const behavior = sectionNode?.behavior || {}
    const render = sectionNode?.render || {}

    const isMovieSection = render.variant === 'media-feature'
    const isCollapsible = behavior.collapsible === true
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
