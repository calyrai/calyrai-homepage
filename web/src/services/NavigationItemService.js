export class NavigationItemService {
  static SECTION_ANCHOR_BY_ID = {
    movie: 'teaser',
    platforms: 'platform',
    architecture: 'architecture',
    contact_main: 'contact',
  }

  static QUICK_LINKS = [
    { anchor: 'teaser-page', label: 'Teaser', href: '/research/teaser/index.html' },
    { anchor: 'interactive-deck', label: 'Interactive Deck', href: '/research/lithos/index.html' },
  ]

  static SECTION_LABEL_BY_ID = {
    contact_main: 'Contact',
  }

  static buildFromAst(ast) {
    const children = Array.isArray(ast?.children) ? ast.children : []
    const sectionNodes = children.filter((node) => node?.type === 'section')

    const sectionItems = sectionNodes
      .filter((node) => node?.title && node?.id)
      .map((node) => ({
        anchor: NavigationItemService.SECTION_ANCHOR_BY_ID[node.id] || node.id,
        label: NavigationItemService.SECTION_LABEL_BY_ID[node.id] || node.title,
        href: node.route || `/#${NavigationItemService.SECTION_ANCHOR_BY_ID[node.id] || node.id}`,
      }))

    // Home is represented by the expandable calyr.aí brand rail beside the burger.
    const items = [...sectionItems]
    const knownHrefs = new Set(items.map((item) => item.href).filter(Boolean))

    NavigationItemService.QUICK_LINKS.forEach((item) => {
      if (!knownHrefs.has(item.href)) {
        items.push(item)
        knownHrefs.add(item.href)
      }
    })

    return items
  }
}
