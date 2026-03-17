/* js/pr/io_drop.js
 * Drag&Drop for P(r) and I(q)
 *
 * INTERNAL UNITS:
 *   r : nm
 *   q : nm^-1
 *
 * DISPLAY MODE:
 *   state.unitMode === "A" means the user *sees* Å / Å^-1,
 *   so dropped x-values are interpreted as Å / Å^-1 and converted back
 *   to INTERNAL nm / nm^-1.
 *
 * IMPORTANT:
 *   We store ONLY expPrData / expIqData in state.
 *   We DO NOT cache expIqLog here anymore (plot_iq derives logs on the fly).
 *
 * ADDITION:
 *   After dropping I(q), optionally auto-fit GNOM-style scale:
 *   Iexp(q) ≈ s * Imod(q) (+ b optional)
 */
import { state } from "./state.js";
import { drawP } from "./plot_pr.js";
import { drawIq } from "./plot_iq.js";
import { applyGnomScale } from "./fit_gnom_scale.js";

function parseTextTable(text) {
  const lines = text.split(/\r?\n/).filter(
    l => l.trim() && !l.trim().startsWith("#") && !l.trim().startsWith("//")
  );
  const rows = [];
  for (const line of lines) {
    const parts = line.trim().split(/[\s,;]+/);
    if (parts.length < 2) continue;
    const nums = parts.map(x => parseFloat(x)).filter(v => !Number.isNaN(v));
    if (nums.length >= 2) rows.push(nums);
  }
  return rows;
}

function isAngstromMode() {
  // tolerate "Å" too, if it ever appears
  return state.unitMode === "A" || state.unitMode === "Å";
}

// If user views in Å, assume dropped r is Å -> internal nm
function droppedR_toInternalNm(rVal) {
  return isAngstromMode() ? (rVal * 0.1) : rVal;
}

// If user views in Å^-1, assume dropped q is Å^-1 -> internal nm^-1
function droppedQ_toInternalNmInv(qVal) {
  return isAngstromMode() ? (qVal * 10.0) : qVal;
}

function sortAndDedupXY(xArr, yArr, eArr) {
  const n = Math.min(xArr.length, yArr.length);
  const trip = [];
  for (let i = 0; i < n; i++) {
    const x = xArr[i], y = yArr[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    trip.push([x, y, eArr ? eArr[i] : null]);
  }
  trip.sort((a, b) => a[0] - b[0]);

  // dedup by x (keep last)
  const outX = [];
  const outY = [];
  const outE = eArr ? [] : null;

  let lastX = null;
  for (const [x, y, e] of trip) {
    if (lastX !== null && Math.abs(x - lastX) < 1e-12) {
      outX[outX.length - 1] = x;
      outY[outY.length - 1] = y;
      if (outE) outE[outE.length - 1] = e;
    } else {
      outX.push(x);
      outY.push(y);
      if (outE) outE.push(e);
      lastX = x;
    }
  }
  return { x: outX, y: outY, e: outE };
}

export function handleDropPr(text) {
  const rows = parseTextTable(text);
  if (!rows.length) return;

  const r = [];
  const p = [];
  const err = [];
  let anyErr = false;

  for (const row of rows) {
    const rRaw = row[0];
    const pVal = row[1];
    if (!Number.isFinite(rRaw) || !Number.isFinite(pVal)) continue;

    r.push(droppedR_toInternalNm(rRaw));
    p.push(pVal);

    if (row.length >= 3 && Number.isFinite(row[2])) {
      err.push(row[2]);
      anyErr = true;
    } else {
      err.push(null);
    }
  }

  const cleaned = sortAndDedupXY(r, p, anyErr ? err : null);
  state.expPrData = { r: cleaned.x, P: cleaned.y, err: cleaned.e };
}

export function handleDropIq(text) {
  const rows = parseTextTable(text);
  if (!rows.length) return;

  const q = [];
  const I = [];
  const err = [];
  let anyErr = false;

  for (const row of rows) {
    const qRaw = row[0];
    const IVal = row[1];
    if (!Number.isFinite(qRaw) || !Number.isFinite(IVal)) continue;

    // ✅ convert to INTERNAL nm^-1
    q.push(droppedQ_toInternalNmInv(qRaw));
    I.push(IVal);

    if (row.length >= 3 && Number.isFinite(row[2])) {
      err.push(row[2]);
      anyErr = true;
    } else {
      err.push(null);
    }
  }

  const cleaned = sortAndDedupXY(q, I, anyErr ? err : null);

  // store ONLY internal data; plot_iq.js derives logs every redraw
  state.expIqData = { q: cleaned.x, I: cleaned.y, err: cleaned.e };

  // reset exp shift + kill any stale cache
  state.expIqOffsetLog = 0.0;
  state.expIqLog = null;

  // ✅ auto GNOM-style scaling AFTER new exp I(q) arrives
  if (state.autoGnomScale) {
    applyGnomScale({
      qMin: state.gnomQMin,
      qMax: state.gnomQMax,
      useBackground: !!state.gnomUseBackground
    });
  }
}

export function setupDragAndDrop(pCanvas, iqCanvas, ctxP, ctxI) {
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach(ev => {
    pCanvas.addEventListener(ev, preventDefaults, false);
    iqCanvas.addEventListener(ev, preventDefaults, false);
  });

  pCanvas.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      handleDropPr(String(evt.target.result || ""));
      drawP(ctxP, pCanvas);
      drawIq(ctxI, iqCanvas);
    };
    reader.readAsText(dt.files[0]);
  });

  iqCanvas.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt?.files?.length) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      handleDropIq(String(evt.target.result || ""));
      drawP(ctxP, pCanvas);
      drawIq(ctxI, iqCanvas);
    };
    reader.readAsText(dt.files[0]);
  });
}