export function createInactivePointerField() {
  return {
    active: false,
    x: 0,
    y: 0,
    radius: 0.12,
    strength: 1,
  }
}

export function pointerFieldFromEvent(event, rect, options = {}) {
  if (!event || !rect || rect.width <= 0 || rect.height <= 0) {
    return createInactivePointerField()
  }

  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  return {
    active: true,
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
    radius: Number.isFinite(options.radius) ? options.radius : 0.18,
    strength: Number.isFinite(options.strength) ? options.strength : 1,
  }
}

export function computeDotRepulsion(x, y, pointerField, options = {}) {
  if (!pointerField?.active) {
    return { dx: 0, dy: 0, influence: 0 }
  }

  const px = pointerField.x
  const py = pointerField.y
  const radius = Math.max(0.0001, pointerField.radius || 0.16)
  const strength = Math.max(0, pointerField.strength || 1)
  const maxShift = Math.max(0, Number.isFinite(options.maxShift) ? options.maxShift : 0.02)

  const dx = x - px
  const dy = y - py
  const distance = Math.hypot(dx, dy)
  if (distance >= radius) {
    return { dx: 0, dy: 0, influence: 0 }
  }

  const normalized = distance / radius
  const influence = Math.pow(1 - normalized, 1.85) * strength
  const inv = distance > 1e-5 ? 1 / distance : 0
  const dirX = distance > 1e-5 ? dx * inv : 1
  const dirY = distance > 1e-5 ? dy * inv : 0

  return {
    dx: dirX * maxShift * influence,
    dy: dirY * maxShift * influence,
    influence,
  }
}