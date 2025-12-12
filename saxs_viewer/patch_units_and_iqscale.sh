#!/usr/bin/env bash
set -euo pipefail

FILE_JS="js/pr_iq_viewer.js"
FILE_HTML="index.html"
TS="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="backup_units_iqscale_${TS}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1"; exit 1; }; }
need perl
need diff

if [[ ! -f "$FILE_JS" ]]; then
  echo "❌ Not found: $FILE_JS"; exit 1
fi
if [[ ! -f "$FILE_HTML" ]]; then
  echo "❌ Not found: $FILE_HTML"; exit 1
fi

echo "🧷 Creating backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -a "$FILE_JS"   "$BACKUP_DIR/pr_iq_viewer.js.bak"
cp -a "$FILE_HTML" "$BACKUP_DIR/index.html.bak"

echo
echo "🔍 Patching index.html controls (unit + iq-scale selects)…"

perl -0777 -i -pe '
  # Insert the selects right before closing </div> of #controls,
  # but only if they are not already present.
  if ($_ !~ /id="unitSelect"/ && $_ =~ /<div id="controls">.*?<\/div>/s) {
    s@(<div id="controls">.*?)(</div>)@
$1
\n
    <label class="label">
      Einheit:
      <select id="unitSelect">
        <option value="nm" selected>nm</option>
        <option value="A">Å</option>
      </select>
    </label>
\n
    <label class="label">
      I(q)-Skala:
      <select id="iqScaleSelect">
        <option value="log" selected>log I, log q</option>
        <option value="linear">I, q</option>
      </select>
    </label>
\n
$2@s;
  }
' "$FILE_HTML"

echo
echo "🔍 Patching js/pr_iq_viewer.js (unitMode + iqPlotMode + linear/log drawIq)…"

perl -0777 -i -pe '
  # 1) Add global modes after IqScaleLog, only if not present
  if ($_ !~ /let unitMode\s*=/) {
    s@(let IqScaleLog\s*=\s*0\.0;\s*)@$1
\n// Einheiten & Plot-Modi
let unitMode   = "nm";     // "nm" oder "A"
let iqPlotMode = "log";    // "log" oder "linear"
\n@;
  }

  # 2) Patch drawP axis label + unit scaling (x only)
  #    We keep internal rGrid in nm; display converts if Å is selected.
  if ($_ !~ /unitFactor\s*=\s*\(unitMode/) {
    s@function drawP\(\)\s*\{\s*
  const W = pCanvas\.width;\s*
  const H = pCanvas\.height;\s*
  ctxP\.clearRect\(0, 0, W, H\);\s*

  const xMin = 0, xMax = rMax;@function drawP() {
  const W = pCanvas.width;
  const H = pCanvas.height;
  ctxP.clearRect(0, 0, W, H);

  const unitFactor = (unitMode === "nm") ? 1.0 : 10.0; // Å = 10 * nm
  const xMin = 0, xMax = rMax * unitFactor;@s;
  }

  # Replace xPix(rGrid[i]) -> xPix(rGrid[i] * unitFactor) in drawP
  s@const xp = xPix\(rGrid\[i\]\);@const xp = xPix(rGrid[i] * unitFactor);@g;

  # Replace total curve xPix(rGrid[i]) similarly (already covered by g above)
  # Replace node markers rPeak uses: xPix(rPeak) -> xPix(rPeak * unitFactor)
  s@const xp_wave = xPix\(rPeak\);@const xp_wave = xPix(rPeak * unitFactor);@g;
  s@const xp_tot = xPix\(rPeak\);@const xp_tot = xPix(rPeak * unitFactor);@g;

  # Experimental P(r): xp = xPix(r) -> xp = xPix(r * unitFactor)
  s@const xp = xPix\(r\);@const xp = xPix(r * unitFactor);@g;

  # Axis label in drawAxesWithTicks call for P(r)
  s@drawAxesWithTicks\(\s*
    ctxP, W, H, xMin, xMax, yMin, yMax,\s*
    "r", "P\(r\)"\s*
  \);@drawAxesWithTicks(
    ctxP, W, H, xMin, xMax, yMin, yMax,
    (unitMode === "nm") ? "r (nm)" : "r (Å)", "P(r)"
  );@s;

  # 3) Replace drawIq() with a dual-mode implementation (log/linear) with unit-aware q
  if ($_ =~ /function drawIq\(\)\s*\{.*?lastIqMapping\s*=\s*\{.*?\};\s*\}/s) {
    s@function drawIq\(\)\s*\{.*?lastIqMapping\s*=\s*\{.*?\};\s*\}@function drawIq() {
  const W = iqCanvas.width;
  const H = iqCanvas.height;
  ctxI.clearRect(0, 0, W, H);

  const unitFactorQ = (unitMode === "nm") ? 1.0 : 0.1; // Å⁻¹ = 0.1 * nm⁻¹
  const qModelPlot  = qGrid.map(q => q * unitFactorQ);

  const eps = 1e-14;

  if (iqPlotMode === "log") {
    // ---- LOG: log I, log q ----
    const logQmodel = qModelPlot.map(q => Math.log10(Math.max(q, eps)));
    const baseLogImodel = Iq.map(I => Math.log10(Math.max(Math.abs(I), eps)));
    const scaledLogImodel = baseLogImodel.map(li => li + IqScaleLog);

    let xMin, xMax, yMin, yMax, yVals;

    let logQexpDisplay = null;
    if (expIqLog) {
      const logShift = Math.log10(unitFactorQ); // 0 for nm, -1 for Å
      logQexpDisplay = expIqLog.logQ.map(lq => lq + logShift);
      xMin = Math.min(...logQexpDisplay);
      xMax = Math.max(...logQexpDisplay);

      yVals = [];
      for (let i = 0; i < expIqLog.logI.length; i++) {
        yVals.push(expIqLog.logI[i]   + expIqOffsetLog);
        yVals.push(expIqLog.logIlo[i] + expIqOffsetLog);
        yVals.push(expIqLog.logIhi[i] + expIqOffsetLog);
      }
      [yMin, yMax] = getDataBounds(yVals);
    } else {
      xMin = logQmodel[0];
      xMax = logQmodel[logQmodel.length - 1];
      yVals = scaledLogImodel.slice();
      [yMin, yMax] = getDataBounds(yVals);
    }

    const xLabel = (unitMode === "nm") ? "log₁₀ q (nm⁻¹)" : "log₁₀ q (Å⁻¹)";
    const yLabel = "log₁₀ I(q)";

    const mapping = drawAxesWithTicks(
      ctxI, W, H, xMin, xMax, yMin, yMax,
      xLabel, yLabel, true
    );

    const { left, right, top, bottom } = mapping;

    function xPix(lq) {
      return left + ((lq - xMin)/(xMax - xMin || 1e-6)) * (right - left);
    }
    function yPix(li) {
      return bottom - ((li - yMin)/(yMax - yMin || 1e-6)) * (bottom - top);
    }
    function logIFromPix(py) {
      const t = (bottom - py)/(bottom - top || 1e-6);
      return yMin + t*(yMax - yMin || 1e-6);
    }

    const epsI_plot = 1e-14;

    // components
    for (let k = 0; k < nodes.length; k++) {
      const nd  = nodes[k];
      const col = nodeColors[k % nodeColors.length];
      const Ik = Iq_nodes[k];

      ctxI.strokeStyle = col;
      ctxI.lineWidth = 1;
      ctxI.setLineDash(nd.A < 0 ? [2, 4] : []);

      ctxI.beginPath();
      for (let j = 0; j < qGrid.length; j++) {
        const lq = logQmodel[j];
        const li_base = Math.log10(Math.max(Math.abs(Ik[j]), epsI_plot));
        const li = li_base + IqScaleLog;
        const xp = xPix(lq);
        const yp = yPix(li);
        if (j === 0) ctxI.moveTo(xp, yp);
        else ctxI.lineTo(xp, yp);
      }
      ctxI.stroke();
    }
    ctxI.setLineDash([]);

    // model total: magenta
    ctxI.strokeStyle = "#ff00ff";
    ctxI.lineWidth = 2;
    ctxI.beginPath();
    for (let j = 0; j < logQmodel.length; j++) {
      const xp = xPix(logQmodel[j]);
      const yp = yPix(scaledLogImodel[j]);
      if (j === 0) ctxI.moveTo(xp, yp);
      else ctxI.lineTo(xp, yp);
    }
    ctxI.stroke();

    // experimental I(q): white
    let expLogQScaled = null;
    let expLogIScaled = null;

    if (expIqLog) {
      ctxI.strokeStyle = "#ffffff";
      ctxI.fillStyle = "#ffffff";
      ctxI.lineWidth = 1;

      const n = expIqLog.logQ.length;
      expLogQScaled = new Array(n);
      expLogIScaled = new Array(n);

      const logShift = Math.log10(unitFactorQ);

      for (let i = 0; i < n; i++) {
        const lq   = expIqLog.logQ[i] + logShift;
        const li   = expIqLog.logI[i]   + expIqOffsetLog;
        const liLo = expIqLog.logIlo[i] + expIqOffsetLog;
        const liHi = expIqLog.logIhi[i] + expIqOffsetLog;

        expLogQScaled[i] = lq;
        expLogIScaled[i] = li;

        const xp = xPix(lq);
        const yp = yPix(li);
        const ypLo = yPix(liLo);
        const ypHi = yPix(liHi);

        ctxI.beginPath();
        ctxI.moveTo(xp, ypLo);
        ctxI.lineTo(xp, ypHi);
        ctxI.stroke();

        const cap = 3;
        ctxI.beginPath();
        ctxI.moveTo(xp - cap, ypLo);
        ctxI.lineTo(xp + cap, ypLo);
        ctxI.moveTo(xp - cap, ypHi);
        ctxI.lineTo(xp + cap, ypHi);
        ctxI.stroke();

        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2*Math.PI);
        ctxI.fill();
      }
    }

    lastIqMapping = {
      ...mapping,
      xPix,
      yPix,
      logIFromPix,
      logQ: logQmodel,
      scaledLogI: scaledLogImodel,
      expLogQScaled,
      expLogIScaled
    };
  } else {
    // ---- LINEAR: I, q ----
    const modelScale = Math.pow(10, IqScaleLog);
    const modelY = Iq.map(v => v * modelScale);

    let yVals = modelY.slice();
    let expQ = null, expI = null;

    if (expIqData) {
      const expScale = Math.pow(10, expIqOffsetLog);
      expQ = expIqData.q.map(q => q * unitFactorQ);
      expI = expIqData.I.map(v => v * expScale);
      yVals = yVals.concat(expI);
    }

    const [yMin, yMax] = getDataBounds(yVals);
    const xMin = qModelPlot[0];
    const xMax = qModelPlot[qModelPlot.length - 1];

    const xLabel = (unitMode === "nm") ? "q (nm⁻¹)" : "q (Å⁻¹)";
    const yLabel = "I(q)";

    const mapping = drawAxesWithTicks(
      ctxI, W, H, xMin, xMax, yMin, yMax,
      xLabel, yLabel, false
    );
    const { xPix, yPix } = mapping;

    // model total: magenta
    ctxI.strokeStyle = "#ff00ff";
    ctxI.lineWidth = 2;
    ctxI.beginPath();
    for (let j = 0; j < qModelPlot.length; j++) {
      const xp = xPix(qModelPlot[j]);
      const yp = yPix(modelY[j]);
      if (j === 0) ctxI.moveTo(xp, yp);
      else ctxI.lineTo(xp, yp);
    }
    ctxI.stroke();

    // experimental points: white
    if (expQ && expI) {
      ctxI.fillStyle = "#ffffff";
      for (let i = 0; i < expQ.length; i++) {
        const xp = xPix(expQ[i]);
        const yp = yPix(expI[i]);
        ctxI.beginPath();
        ctxI.arc(xp, yp, 2, 0, 2*Math.PI);
        ctxI.fill();
      }
    }

    lastIqMapping = null; // disable log-drag interactions
  }
}@s;
  }

  # 4) Disable iq drag in linear mode (leave code intact, just add guard)
  s@iqCanvas\.addEventListener\("mousedown", \(e\) => \{\s*
  if \(!lastIqMapping\) return;@iqCanvas.addEventListener("mousedown", (e) => {
  if (iqPlotMode !== "log") return;
  if (!lastIqMapping) return;@s;

' "$FILE_JS"

echo
echo "🔍 Adding listeners at end of pr_iq_viewer.js (unitSelect + iqScaleSelect)…"
perl -0777 -i -pe '
  if ($_ !~ /unitSelect\s*=.*getElementById\("unitSelect"\)/s) {
    # add near mirrorChk handler end; if not found, append at end
    if ($_ =~ /mirrorChk\.addEventListener\("change".*?\);\s*/s) {
      s@(mirrorChk\.addEventListener\("change".*?\);\s*)@$1
\n// ============================
// Unit + I(q) scale controls
// ============================
const unitSelect    = document.getElementById("unitSelect");
const iqScaleSelect = document.getElementById("iqScaleSelect");

if (unitSelect) {
  unitSelect.addEventListener("change", () => {
    unitMode = (unitSelect.value === "A") ? "A" : "nm";
    drawP();
    drawIq();
  });
}

if (iqScaleSelect) {
  iqScaleSelect.addEventListener("change", () => {
    iqPlotMode = (iqScaleSelect.value === "linear") ? "linear" : "log";
    drawIq();
  });
}
\n@sm;
    } else {
      $_ .= "\n\n// ============================\n// Unit + I(q) scale controls\n// ============================\nconst unitSelect    = document.getElementById(\"unitSelect\");\nconst iqScaleSelect = document.getElementById(\"iqScaleSelect\");\n\nif (unitSelect) {\n  unitSelect.addEventListener(\"change\", () => {\n    unitMode = (unitSelect.value === \"A\") ? \"A\" : \"nm\";\n    drawP();\n    drawIq();\n  });\n}\n\nif (iqScaleSelect) {\n  iqScaleSelect.addEventListener(\"change\", () => {\n    iqPlotMode = (iqScaleSelect.value === \"linear\") ? \"linear\" : \"log\";\n    drawIq();\n  });\n}\n";
    }
  }
' "$FILE_JS"

echo
echo "✅ Patch applied."
echo
echo "🧪 Diff (backup vs current):"
diff -u "$BACKUP_DIR/pr_iq_viewer.js.bak" "$FILE_JS" | sed -n '1,220p' || true
echo
diff -u "$BACKUP_DIR/index.html.bak" "$FILE_HTML" | sed -n '1,220p' || true
echo
echo "↩️ To revert:"
echo "   ./revert_units_iqscale.sh $BACKUP_DIR"
