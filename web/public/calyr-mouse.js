(() => {
  const hero = document.querySelector('.calyr-logo-wrap--inline')
  if (!hero || hero.querySelector('.calyr-home-mouse')) return

  const canvas = document.createElement('canvas')
  canvas.className = 'calyr-home-mouse'
  canvas.setAttribute('aria-hidden', 'true')
  hero.appendChild(canvas)

  const style = document.createElement('style')
  style.textContent = `
    .calyr-logo-wrap--inline{position:relative!important;isolation:isolate}
    .calyr-logo-wrap--inline>.calyr-logo-lockup{position:relative;z-index:2}
    .calyr-home-mouse{position:absolute;z-index:1;inset:0;width:100%;height:100%;display:block;pointer-events:none;touch-action:none;opacity:.88}
    @media(max-width:768px){.calyr-home-mouse{opacity:.7}}
    @media(prefers-reduced-motion:reduce){.calyr-home-mouse{opacity:.68}}
  `
  document.head.appendChild(style)

  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return

  const pointCount = 184
  const points = Array.from({ length: pointCount }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2
    const band = ((index * 37) % 19) / 19
    return { angle, radius: 0.24 + band * 0.21, phase: band * Math.PI * 2, accent: index % 23 === 0 }
  })
  const pointer = { x: 0.5, y: 0.5, active: false }
  let frame = 0
  let width = 0
  let height = 0
  let pixelRatio = 1
  let animationFrame = 0

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  const updatePointer = (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width)
    pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height)
    pointer.active = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1
  }

  const draw = () => {
    context.clearRect(0, 0, width, height)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const time = reducedMotion ? 0 : frame * 0.008
    const compact = width < 769
    const centerX = width * (compact ? 0.73 : 0.25)
    const centerY = height * (compact ? 0.19 : 0.53)
    const scale = Math.min(width, height)

    context.beginPath()
    context.ellipse(centerX, centerY, scale * 0.39, scale * 0.33, -0.16, 0, Math.PI * 2)
    context.strokeStyle = 'rgba(255,255,255,.12)'
    context.lineWidth = 1
    context.stroke()

    for (const point of points) {
      const wave = Math.sin(time + point.phase) * 0.018
      const radius = scale * (point.radius + wave)
      const angle = point.angle + time * 0.095
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.82
      const dx = pointer.x * width - x
      const dy = pointer.y * height - y
      const distance = Math.hypot(dx, dy)
      const influence = pointer.active ? Math.max(0, 1 - distance / (scale * 0.28)) : 0
      const size = (point.accent ? 1.8 : 0.85) + influence * 2.4
      context.beginPath()
      context.arc(x - dx * influence * 0.12, y - dy * influence * 0.12, size, 0, Math.PI * 2)
      context.fillStyle = point.accent
        ? `rgba(255,56,209,${0.62 + influence * 0.36})`
        : `rgba(255,255,255,${0.26 + influence * 0.7})`
      context.fill()
    }

    frame += 1
    animationFrame = requestAnimationFrame(draw)
  }

  window.addEventListener('pointermove', updatePointer, { passive: true })
  document.documentElement.addEventListener('pointerleave', () => { pointer.active = false }, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationFrame)
    else animationFrame = requestAnimationFrame(draw)
  })
  new ResizeObserver(resize).observe(canvas)
  resize()
  draw()
})()
