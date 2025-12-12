#!/usr/bin/env bash
set -euo pipefail

# Run this inside the saxs_viewer folder
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

STAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_auto_3v03_${STAMP}"

echo "🧷 Creating backup in: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}/js"

if [ -f js/pr_iq_viewer.js ]; then
  cp js/pr_iq_viewer.js "${BACKUP_DIR}/js/"
else
  echo "⚠️  js/pr_iq_viewer.js not found (nothing to back up)."
fi

if [ -f js/pdb_viewer.js ]; then
  cp js/pdb_viewer.js "${BACKUP_DIR}/js/"
else
  echo "⚠️  js/pdb_viewer.js not found (nothing to back up)."
fi

echo "✅ Backup done."

echo "✏️  Patching js/pr_iq_viewer.js (updatePrFromPDB)…"

cat >> js/pr_iq_viewer.js <<'EOF'

/* ============================================
 * injected by patch_auto_3v03.sh
 * Normalised P(r) from PDB → overlay in left panel
 * ============================================ */
window.updatePrFromPDB = function (data) {
  if (!data || !Array.isArray(data.r) || !Array.isArray(data.P)) {
    console.warn("updatePrFromPDB: invalid data", data);
    return;
  }

  const r    = data.r.slice();
  const Praw = data.P.slice();

  // --- normalise area of P(r) to 1.0 (trapezoid rule) ---
  let area = 0.0;
  for (let i = 0; i < Praw.length - 1; i++) {
    const drLoc = r[i + 1] - r[i];
    area += 0.5 * (Praw[i] + Praw[i + 1]) * drLoc;
  }
  const scale = (Math.abs(area) > 1e-12) ? 1.0 / area : 1.0;
  const Pnorm = Praw.map(v => v * scale);

  // store as "experimental" P(r) to be drawn on top of the model
  expPrData = { r, P: Pnorm, err: null };

  if (typeof drawP === "function") {
    drawP();
  } else {
    console.warn("updatePrFromPDB: drawP() not found, cannot refresh plot.");
  }
};
EOF

echo "✏️  Patching js/pdb_viewer.js (auto-load 3V03)…"

cat >> js/pdb_viewer.js <<'EOF'

/* ============================================
 * injected by patch_auto_3v03.sh
 * Auto-load 3V03.pdb on startup (if available)
 * expects a global: window.loadPDBFromText(text, name)
 * ============================================ */
(function () {
  async function autoLoad3V03() {
    try {
      if (typeof window.loadPDBFromText !== "function") {
        console.warn("autoLoad3V03: window.loadPDBFromText(text, name) not found – skipping auto-load.");
        return;
      }

      const resp = await fetch("3V03.pdb");
      if (!resp.ok) {
        console.warn("autoLoad3V03: 3V03.pdb not served (status", resp.status, ")");
        return;
      }

      const pdbText = await resp.text();
      window.loadPDBFromText(pdbText, "3V03.pdb");
      console.log("autoLoad3V03: successfully loaded 3V03.pdb");
    } catch (err) {
      console.warn("autoLoad3V03: failed:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoLoad3V03);
  } else {
    autoLoad3V03();
  }
})();
EOF

echo "🎉 Patch applied. Backup is in: ${BACKUP_DIR}"
echo "Reminder: 3V03.pdb must sit next to index.html and be served via e.g.:"
echo "  python3 -m http.server 9000"
