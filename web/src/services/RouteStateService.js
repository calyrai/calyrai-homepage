export class RouteStateService {
  static BOOKS_ROUTES = new Set(['/books', '/philosophy'])

  static create(pathname) {
    const normalizedPath = String(pathname || '').split('#')[0] || '/'
    const isBooksRoute = RouteStateService.BOOKS_ROUTES.has(normalizedPath)

    return {
      pathname: normalizedPath,
      isBooksRoute,
      isSpecialRoute: isBooksRoute,
    }
  }
}
