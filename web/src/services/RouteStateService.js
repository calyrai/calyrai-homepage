export class RouteStateService {
  static BOOKS_ROUTES = new Set(['/books', '/philosophy'])
  static CONTACT_ROUTE = '/contact'

  static create(pathname) {
    const isBooksRoute = RouteStateService.BOOKS_ROUTES.has(pathname)
    const isContactRoute = pathname === RouteStateService.CONTACT_ROUTE

    return {
      pathname,
      isBooksRoute,
      isContactRoute,
      isSpecialRoute: isBooksRoute || isContactRoute,
    }
  }
}
