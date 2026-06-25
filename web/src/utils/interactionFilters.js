const DEFAULT_INTERACTIVE_SELECTORS = ['.tile', '.navigation', '[role="button"]']

function eventPathIncludesSelector(event, selector) {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : []
  for (const node of path) {
    if (node instanceof Element && node.matches(selector)) {
      return true
    }
  }

  if (event.target instanceof Element && event.target.closest(selector)) {
    return true
  }

  return false
}

export function isTileInteractionEvent(event) {
  return eventPathIncludesSelector(event, '.tile')
}

export function isInteractiveSurfaceEvent(event, selectors = DEFAULT_INTERACTIVE_SELECTORS) {
  return selectors.some((selector) => eventPathIncludesSelector(event, selector))
}
