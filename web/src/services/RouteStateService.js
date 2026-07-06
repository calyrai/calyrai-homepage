export class RouteStateService {
  static BOOKS_ROUTES = new Set(['/books'])

  static HOME_ALIAS_ANCHORS = {
    '/philosophy': 'philosophy',
    '/contact': 'contact',
    '/ecosystem': 'ecosystem',
    '/legal': 'contact',
  }

  static create(pathname) {
    const normalizedPath = String(pathname || '').split('#')[0] || '/'
    const isBooksRoute = RouteStateService.BOOKS_ROUTES.has(normalizedPath)
    const homeAnchor = RouteStateService.HOME_ALIAS_ANCHORS[normalizedPath] || null
    const isHomeAliasRoute = Boolean(homeAnchor)

    return {
      pathname: normalizedPath,
      isBooksRoute,
      isHomeAliasRoute,
      homeAnchor,
      isSpecialRoute: isBooksRoute,
    }
  }
}
