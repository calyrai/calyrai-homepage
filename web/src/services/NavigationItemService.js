export class NavigationItemService {
  static SECTION_ANCHOR_BY_ID = {
    movie: 'teaser',
    platforms: 'platform',
    architecture: 'architecture',
    contact_main: 'contact',
  }

  static SECTION_LABEL_BY_ID = {
    contact_main: 'Contact',
  }

  static buildFromAst(ast) {
    const children = Array.isArray(ast?.children) ? ast.children : []
    const logoNode = children.find((node) => node?.id === 'logo')
    const sectionNodes = children.filter((node) => node?.type === 'section')

    const homeItem = logoNode?.title
      ? [{ label: logoNode.title, href: '/' }]
      : []

    const sectionItems = sectionNodes
      .filter((node) => node?.title && node?.id)
      .map((node) => ({
        anchor: NavigationItemService.SECTION_ANCHOR_BY_ID[node.id] || node.id,
        label: NavigationItemService.SECTION_LABEL_BY_ID[node.id] || node.title,
        href: node.route || `/#${NavigationItemService.SECTION_ANCHOR_BY_ID[node.id] || node.id}`,
      }))

    return [...homeItem, ...sectionItems]
  }
}
