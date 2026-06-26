export class NavigationItemService {
  static buildFromAst(ast) {
    const children = Array.isArray(ast?.children) ? ast.children : []
    const logoNode = children.find((node) => node?.id === 'logo')
    const sectionNodes = children.filter((node) => node?.type === 'section')

    const homeItem = logoNode?.title
      ? [{ label: logoNode.title, href: '#' }]
      : []

    const sectionItems = sectionNodes
      .filter((node) => node?.title && node?.id)
      .map((node) => ({
        label: node.title,
        href: node.route || `#${node.id}`,
      }))

    return [...homeItem, ...sectionItems]
  }
}
