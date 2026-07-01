export function sampleHalftoneMatrix({
  ctx,
  drawSize,
  matrixSize,
  threshold = 0.06,
  gamma = 1,
}) {
  const image = ctx.getImageData(0, 0, drawSize, drawSize).data
  const step = drawSize / matrixSize
  const modules = []

  for (let y = 0; y < matrixSize; y += 1) {
    const row = []
    for (let x = 0; x < matrixSize; x += 1) {
      let sum = 0
      let samples = 0
      for (let oy = 0; oy < 3; oy += 1) {
        for (let ox = 0; ox < 3; ox += 1) {
          const sx = Math.min(drawSize - 1, Math.floor((x + (ox + 0.2) / 3) * step))
          const sy = Math.min(drawSize - 1, Math.floor((y + (oy + 0.2) / 3) * step))
          const idx = (sy * drawSize + sx) * 4
          const lum = (image[idx] + image[idx + 1] + image[idx + 2]) / 3
          sum += lum
          samples += 1
        }
      }

      const avgLum = samples > 0 ? sum / samples : 0
      const normalized = Math.max(0, Math.min(1, avgLum / 255))
      const weighted = Math.pow(normalized, gamma)
      row.push(weighted > threshold ? weighted : 0)
    }
    modules.push(row)
  }

  return modules
}
