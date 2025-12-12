/* js/pr/plot_axes.js
 * Axes + bounds
 */

export function getDataBounds(arr) {
  let min = Infinity, max = -Infinity;
  for (const v of arr) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) { min = -1; max = 1; }
  if (Math.abs(max - min) < 1e-6) max = min + 1;
  const pad = 0.05 * (max - min);
  return [min - pad, max + pad];
}

export function drawAxesWithTicks(ctx, W, H, xMin, xMax, yMin, yMax, xLabel, yLabel, logX=false) {
  const left  = 60;
  const right = W - 30;
  const top   = 30;
  const bottom= H - 35;

  function xPix(x) {
    return left + ((x - xMin)/(xMax - xMin || 1e-6)) * (right - left);
  }
  function yPix(y) {
    return bottom - ((y - yMin)/(yMax - yMin || 1e-6)) * (bottom - top);
  }

  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  ctx.fillStyle = "#cccccc";
  ctx.font = "10px system-ui";

  const nXTicks = 6;
  for (let i = 0; i <= nXTicks; i++) {
    const t = i / nXTicks;
    const xVal = xMin + t * (xMax - xMin);
    const xp = xPix(xVal);
    ctx.beginPath();
    ctx.moveTo(xp, bottom);
    ctx.lineTo(xp, bottom + 4);
    ctx.strokeStyle = "#444";
    ctx.stroke();
    let label = logX ? ("10^" + xVal.toFixed(1)) : xVal.toFixed(2);
    ctx.fillText(label, xp - 14, bottom + 14);
  }

  const nYTicks = 4;
  for (let i = 0; i <= nYTicks; i++) {
    const t = i / nYTicks;
    const yVal = yMin + t * (yMax - yMin);
    const yp = yPix(yVal);
    ctx.beginPath();
    ctx.moveTo(left - 4, yp);
    ctx.lineTo(left, yp);
    ctx.strokeStyle = "#444";
    ctx.stroke();
    ctx.fillText(yVal.toFixed(2), left - 48, yp + 3);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "11px system-ui";
  ctx.fillText(xLabel, (left + right)/2 - 30, H - 5);
  ctx.save();
  ctx.translate(15, (top + bottom)/2 + 10);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  return { xPix, yPix, left, right, top, bottom, xMin, xMax, yMin, yMax };
}
