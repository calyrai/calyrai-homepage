function drawLowercaseI(ctx, size) {
  const cx = size * 0.5
  const dotR = size * 0.14
  const stemW = size * 0.34
  const stemH = size * 0.52
  const stemTop = size * 0.36
  const stemLeft = cx - stemW / 2
  const footW = size * 0.54
  const footH = size * 0.11
  const footTop = stemTop + stemH - footH * 0.64
  const footLeft = cx - footW / 2

  ctx.beginPath()
  ctx.arc(cx, size * 0.16, dotR, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.roundRect(stemLeft, stemTop, stemW, stemH, stemW * 0.22)
  ctx.fill()

  // Force a visible separation between dot and stem.
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillRect(cx - size * 0.2, size * 0.27, size * 0.4, size * 0.075)
  ctx.globalCompositeOperation = 'source-over'

  ctx.beginPath()
  ctx.roundRect(footLeft, footTop, footW, footH, footH * 0.35)
  ctx.fill()
}

function drawTilde(ctx, size) {
  ctx.beginPath()
  ctx.moveTo(size * 0.14, size * 0.56)
  ctx.bezierCurveTo(size * 0.28, size * 0.42, size * 0.44, size * 0.68, size * 0.58, size * 0.54)
  ctx.bezierCurveTo(size * 0.7, size * 0.43, size * 0.82, size * 0.57, size * 0.9, size * 0.51)
  ctx.lineWidth = size * 0.12
  ctx.lineCap = 'round'
  ctx.stroke()
}

function drawX(ctx, size) {
  ctx.beginPath()
  ctx.moveTo(size * 0.2, size * 0.2)
  ctx.lineTo(size * 0.8, size * 0.8)
  ctx.moveTo(size * 0.8, size * 0.2)
  ctx.lineTo(size * 0.2, size * 0.8)
  ctx.lineWidth = size * 0.16
  ctx.lineCap = 'round'
  ctx.stroke()
}

function drawLinkedIn(ctx, size) {
  // "in" ligature in vector blocks.
  const baseY = size * 0.27
  const stemW = size * 0.14

  ctx.beginPath()
  ctx.arc(size * 0.26, size * 0.2, size * 0.07, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.roundRect(size * 0.19, baseY, stemW, size * 0.55, stemW * 0.3)
  ctx.fill()

  ctx.beginPath()
  ctx.roundRect(size * 0.43, size * 0.42, stemW, size * 0.4, stemW * 0.3)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(size * 0.5, size * 0.47)
  ctx.bezierCurveTo(size * 0.57, size * 0.33, size * 0.76, size * 0.34, size * 0.81, size * 0.49)
  ctx.lineTo(size * 0.81, size * 0.82)
  ctx.lineTo(size * 0.67, size * 0.82)
  ctx.lineTo(size * 0.67, size * 0.53)
  ctx.bezierCurveTo(size * 0.65, size * 0.46, size * 0.57, size * 0.45, size * 0.54, size * 0.54)
  ctx.closePath()
  ctx.fill()
}

function drawRing(ctx, size) {
  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.5, size * 0.28, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.5, size * 0.14, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

function drawArrow(ctx, size) {
  ctx.beginPath()
  ctx.moveTo(size * 0.28, size * 0.22)
  ctx.lineTo(size * 0.78, size * 0.5)
  ctx.lineTo(size * 0.28, size * 0.78)
  ctx.closePath()
  ctx.fill()
}

function drawAsterisk(ctx, size) {
  const cx = size * 0.5
  const cy = size * 0.5
  const r = size * 0.27
  ctx.lineWidth = size * 0.11
  ctx.lineCap = 'round'

  for (let k = 0; k < 3; k += 1) {
    const a = (Math.PI / 3) * k
    const dx = Math.cos(a) * r
    const dy = Math.sin(a) * r
    ctx.beginPath()
    ctx.moveTo(cx - dx, cy - dy)
    ctx.lineTo(cx + dx, cy + dy)
    ctx.stroke()
  }
}

function drawAt(ctx, size) {
  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.5, size * 0.3, 0, Math.PI * 2)
  ctx.lineWidth = size * 0.12
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(size * 0.5, size * 0.5, size * 0.14, 0, Math.PI * 2)
  ctx.lineWidth = size * 0.1
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(size * 0.62, size * 0.5)
  ctx.bezierCurveTo(size * 0.76, size * 0.46, size * 0.83, size * 0.56, size * 0.81, size * 0.66)
  ctx.lineWidth = size * 0.09
  ctx.stroke()
}

function drawFallbackText(ctx, size, glyph) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `900 ${glyph.length > 1 ? Math.floor(size * 0.46) : Math.floor(size * 0.66)}px "Arial Black", "Impact", "Segoe UI Symbol", sans-serif`
  ctx.lineWidth = glyph.length > 1 ? Math.max(8, size * 0.035) : Math.max(10, size * 0.045)
  ctx.strokeText(glyph, size * 0.5, size * 0.53)
  ctx.fillText(glyph, size * 0.5, size * 0.53)
}

export function drawIconPath(ctx, symbol, size) {
  const glyph = String(symbol || '@').slice(0, 2)
  const normalized = glyph.toLowerCase()

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'

  if (glyph === 'i') {
    drawLowercaseI(ctx, size)
    return
  }
  if (glyph === '~') {
    drawTilde(ctx, size)
    return
  }
  if (glyph === 'X' || glyph === 'x') {
    drawX(ctx, size)
    return
  }
  if (normalized === 'in') {
    drawLinkedIn(ctx, size)
    return
  }
  if (glyph === 'o' || glyph === 'O') {
    drawRing(ctx, size)
    return
  }
  if (glyph === '>') {
    drawArrow(ctx, size)
    return
  }
  if (glyph === '*') {
    drawAsterisk(ctx, size)
    return
  }
  if (glyph === '@') {
    drawAt(ctx, size)
    return
  }

  drawFallbackText(ctx, size, glyph)
}
