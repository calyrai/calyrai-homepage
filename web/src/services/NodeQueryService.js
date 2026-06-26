export class NodeQueryService {
  constructor(rootNode) {
    this.rootNode = rootNode
  }

  findById(targetId) {
    return this.#findByIdRecursive(this.rootNode, targetId)
  }

  #findByIdRecursive(node, targetId) {
    if (!node) return null
    if (node.id === targetId) return node
    if (!Array.isArray(node.children)) return null

    for (const child of node.children) {
      const match = this.#findByIdRecursive(child, targetId)
      if (match) return match
    }

    return null
  }
}
