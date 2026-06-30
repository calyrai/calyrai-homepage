export class LinkItemService {
  static getContactSymbol(item) {
    if (!item) return null
    return typeof item === 'string' ? null : (item.symbol || null)
  }

  static normalize(item) {
    if (!item) return null
    if (typeof item === 'string') {
      return { id: item, label: item, href: item }
    }

    const href = item.route || item.href || item.url
    if (!href) return null

    const label = item.label || item.name || item.id || href
    const id = item.id || `${label}-${href}`
    return { id, label, href, symbol: item.symbol || null }
  }

  static buildContactLinks(page) {
    const links = []

    if (Array.isArray(page?.contacts)) {
      page.contacts.forEach((item) => {
        const normalized = LinkItemService.normalize(item)
        if (normalized) links.push(normalized)
      })
    }

    const seen = new Set()
    return links.filter((item) => {
      const key = `${item.label}|${item.href}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
