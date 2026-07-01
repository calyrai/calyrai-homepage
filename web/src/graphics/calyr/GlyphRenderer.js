import { sampleHalftoneMatrix } from './effects/Halftone'
import { drawIconPath } from './icons/IconPaths'

const DEFAULT_DRAW_SIZE = 340
const DEFAULT_MATRIX_SIZE = 21

export function buildGlyphMatrixFromSymbol(symbol, options = {}) {
  if (typeof document === 'undefined') return null

  const drawSize = Number(options.drawSize) || DEFAULT_DRAW_SIZE
  const matrixSize = Number(options.matrixSize) || DEFAULT_MATRIX_SIZE
  const threshold = Number.isFinite(options.threshold) ? options.threshold : 0.06
  const gamma = Number.isFinite(options.gamma) ? options.gamma : 1

  const canvas = document.createElement('canvas')
  canvas.width = drawSize
  canvas.height = drawSize
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, drawSize, drawSize)

  drawIconPath(ctx, symbol, drawSize)

  const modules = sampleHalftoneMatrix({
    ctx,
    drawSize,
    matrixSize,
    threshold,
    gamma,
  })

  return {
    kind: 'glyph',
    size: matrixSize,
    modules,
    quietModules: 2,
    normSize: Number(options.normSize) || 0.92,
    targetSizePx: options.targetSizePx || null,
  }
}
