export function applyTitleDefaults(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  if (!normalized) {
    return ''
  }

  const accented = normalized.replace(/i/g, 'í').replace(/I/g, 'Í')
  return accented.endsWith('.') ? accented : `${accented}.`
}
