const CONTACT_QR_BASE_URL = 'https://calyr.ai'

const CONTACT_QR_ALIASES = [
  { alias: 'm', match: (href) => href.startsWith('mailto:') },
  { alias: 'w', match: (href) => href.startsWith('https://wa.me/') },
  { alias: 'x', match: (href) => href === 'https://x.com' },
  { alias: 'li', match: (href) => href === 'https://www.linkedin.com' },
  { alias: 'b', match: (href) => href === 'https://bsky.app' },
  { alias: 'y', match: (href) => href === 'https://www.youtube.com' },
  { alias: 'ig', match: (href) => href === 'https://www.instagram.com' },
  { alias: 'l', match: (href) => href === '/legal' },
]

function normalizeHref(href) {
  return String(href || '').trim()
}

function findAliasByHref(href) {
  const normalizedHref = normalizeHref(href)
  return CONTACT_QR_ALIASES.find((entry) => entry.match(normalizedHref)) || null
}

function findAliasByHash(hashValue) {
  const normalizedHash = String(hashValue || '').trim().replace(/^#/, '').toLowerCase()
  if (!normalizedHash) return null
  return CONTACT_QR_ALIASES.find((entry) => entry.alias === normalizedHash) || null
}

export function getContactQrValue(href) {
  const normalizedHref = normalizeHref(href)
  const aliasEntry = findAliasByHref(normalizedHref)
  if (!aliasEntry) {
    return normalizedHref || 'about:blank'
  }

  return `${CONTACT_QR_BASE_URL}/#${aliasEntry.alias}`
}

export function resolveContactQrAlias(hashValue) {
  const aliasEntry = findAliasByHash(hashValue)
  if (!aliasEntry) {
    return null
  }

  return aliasEntry.match('/legal') ? '/legal' : CONTACT_QR_ALIASES.reduce((resolvedHref, entry) => {
    if (resolvedHref || entry.alias !== aliasEntry.alias) {
      return resolvedHref
    }

    if (entry.alias === 'm') return 'mailto:rupert.tscheliessnig@calyr.ai'
    if (entry.alias === 'w') return 'https://wa.me/4369919200915'
    if (entry.alias === 'x') return 'https://x.com'
    if (entry.alias === 'li') return 'https://www.linkedin.com'
    if (entry.alias === 'b') return 'https://bsky.app'
    if (entry.alias === 'y') return 'https://www.youtube.com'
    if (entry.alias === 'ig') return 'https://www.instagram.com'
    if (entry.alias === 'l') return '/legal'
    return resolvedHref
  }, null)
}