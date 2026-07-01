export class RouteStateService {
  static BOOKS_ROUTES = new Set(['/books', '/philosophy'])

  static create(pathname) {
    const isBooksRoute = RouteStateService.BOOKS_ROUTES.has(pathname)

    return {
      pathname,
      isBooksRoute,
      isSpecialRoute: isBooksRoute,
    }
  }
}
