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
    .calyr-home-mouse{position:absolute;z-index:1;left:clamp(18px,3vw,48px);bottom:clamp(22px,4vw,54px);width:clamp(150px,18vw,260px);height:clamp(150px,18vw,260px);display:block;cursor:crosshair;touch-action:none;opacity:.92}
    @media(max-width:768px){.calyr-home-mouse{position:relative;left:auto;bottom:auto;order:2;width:min(52vw,210px);height:min(52vw,210px);margin:22px 0 0;justify-self:start}.calyr-logo-wrap--inline>.calyr-logo-lockup{order:1}}
    @media(prefers-reduced-motion:reduce){.calyr-home-mouse{opacity:.78}}
  `
  document.head.appendChild(style)

  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return

  const pointCount = 128
  const points = Array.from({ length: pointCount }, (_, index) => {
    const angle = (index / pointCount) * Math.PI * 2
    const band = ((index * 37) % 19) / 19
    return { angle, radius: 0.29 + band * 0.19, phase: band * Math.PI * 2 }
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
    const centerX = width * (0.5 + (pointer.active ? (pointer.x - 0.5) * 0.08 : 0))
    const centerY = height * (0.5 + (pointer.active ? (pointer.y - 0.5) * 0.08 : 0))
    const scale = Math.min(width, height)

    for (const point of points) {
      const wave = Math.sin(time + point.phase) * 0.018
      const radius = scale * (point.radius + wave)
      const angle = point.angle + time * 0.14
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius * 0.86
      const dx = pointer.x * width - x
      const dy = pointer.y * height - y
      const distance = Math.hypot(dx, dy)
      const influence = pointer.active ? Math.max(0, 1 - distance / (scale * 0.34)) : 0
      const size = 0.9 + influence * 2.2
      context.beginPath()
      context.arc(x - dx * influence * 0.09, y - dy * influence * 0.09, size, 0, Math.PI * 2)
      context.fillStyle = `rgba(255,255,255,${0.38 + influence * 0.58})`
      context.fill()
    }

    frame += 1
    animationFrame = requestAnimationFrame(draw)
  }

  canvas.addEventListener('pointermove', updatePointer, { passive: true })
  canvas.addEventListener('pointerenter', updatePointer, { passive: true })
  canvas.addEventListener('pointerleave', () => { pointer.active = false }, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationFrame)
    else animationFrame = requestAnimationFrame(draw)
  })
  new ResizeObserver(resize).observe(canvas)
  resize()
  draw()
})()
