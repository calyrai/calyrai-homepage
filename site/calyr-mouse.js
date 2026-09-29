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

  const pointer = { x: 0.5, y: 0.5, active: false }
  let cells = []
  let width = 0
  let height = 0
  let pixelRatio = 1
  let drawPending = false

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    canvas.width = Math.round(width * pixelRatio)
    canvas.height = Math.round(height * pixelRatio)
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

    const radius = width < 769 ? 22 : 30
    const horizontal = Math.sqrt(3) * radius
    const vertical = radius * 1.5
    const fieldWidth = width < 769 ? width : width * 0.58
    cells = []
    let row = 0
    for (let y = -radius; y < height + radius; y += vertical) {
      const offset = row % 2 ? horizontal / 2 : 0
      for (let x = -horizontal + offset; x < fieldWidth + horizontal; x += horizontal) {
        cells.push({ x, y, radius })
      }
      row += 1
    }
  }

  const updatePointer = (event) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width)
    pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height)
    pointer.active = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1
  }

  const draw = () => {
    context.clearRect(0, 0, width, height)
    const pointerX = pointer.x * width
    const pointerY = pointer.y * height
    const influenceRadius = Math.max(130, Math.min(width, height) * 0.24)

    const deform = (x, y) => {
      if (!pointer.active) return { x, y, influence: 0 }
      const dx = x - pointerX
      const dy = y - pointerY
      const distance = Math.hypot(dx, dy)
      const influence = Math.max(0, 1 - distance / influenceRadius)
      if (!influence || !distance) return { x, y, influence }
      const push = influence * influence * 24
      return {
        x: x + (dx / distance) * push,
        y: y + (dy / distance) * push,
        influence,
      }
    }

    for (const cell of cells) {
      const vertices = []
      let peakInfluence = 0
      for (let side = 0; side < 6; side += 1) {
        const angle = Math.PI / 6 + side * Math.PI / 3
        const vertex = deform(
          cell.x + Math.cos(angle) * cell.radius,
          cell.y + Math.sin(angle) * cell.radius,
        )
        vertices.push(vertex)
        peakInfluence = Math.max(peakInfluence, vertex.influence)
      }

      context.beginPath()
      context.moveTo(vertices[0].x, vertices[0].y)
      for (let side = 1; side < vertices.length; side += 1) {
        context.lineTo(vertices[side].x, vertices[side].y)
      }
      context.closePath()
      context.strokeStyle = `rgba(255,255,255,${0.075 + peakInfluence * 0.42})`
      context.lineWidth = 0.75 + peakInfluence * 0.9
      context.stroke()

      for (const vertex of vertices) {
        context.beginPath()
        context.arc(vertex.x, vertex.y, 0.7 + vertex.influence * 1.7, 0, Math.PI * 2)
        context.fillStyle = `rgba(255,255,255,${0.22 + vertex.influence * 0.68})`
        context.fill()
      }
    }
  }

  const scheduleDraw = () => {
    if (drawPending) return
    drawPending = true
    requestAnimationFrame(() => {
      drawPending = false
      draw()
    })
  }

  window.addEventListener('pointermove', (event) => {
    updatePointer(event)
    scheduleDraw()
  }, { passive: true })
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.active = false
    scheduleDraw()
  }, { passive: true })
  new ResizeObserver(() => {
    resize()
    scheduleDraw()
  }).observe(canvas)
  resize()
  draw()
})()
