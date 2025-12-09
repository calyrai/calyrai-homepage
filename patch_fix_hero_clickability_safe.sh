#!/usr/bin/env bash
set -euo pipefail

echo "🌌 SAFE PATCH: Fix Hero Clickability + Tap Collapse"
echo "----------------------------------------------------"
echo "This patch will:"
echo "  • Fix pointer-events (hero, hero-content, canvas)"
echo "  • Ensure hero receives tap/click events"
echo "  • Clean duplicate .hero definitions"
echo "  • Add tap-to-collapse interaction"
echo ""

read -p "❓ Shall I run this patch? (y/N) " run
if [[ "$run" != "y" && "$run" != "Y" ]]; then
  echo "🚫 Patch aborted."
  exit 0
fi

# Script is located inside /web, so ROOT_DIR = web/
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSS_FILE="$ROOT_DIR/css/home.css"
JS_FILE="$ROOT_DIR/js/nav_autohide.js"

if [[ ! -f "$CSS_FILE" ]]; then
  echo "❌ ERROR: CSS file not found: $CSS_FILE"
  exit 1
fi

if [[ ! -f "$JS_FILE" ]]; then
  echo "❌ ERROR: JS file not found: $JS_FILE"
  exit 1
fi

echo "✔ Found:"
echo "   $CSS_FILE"
echo "   $JS_FILE"
echo ""

read -p "❓ Create backups before patching? (Y/n) " dobackup
if [[ "$dobackup" != "n" && "$dobackup" != "N" ]]; then
  ts="$(date +%Y%m%d_%H%M%S)"
  CSS_BACKUP="${CSS_FILE}.bak_${ts}"
  JS_BACKUP="${JS_FILE}.bak_${ts}"
  cp "$CSS_FILE" "$CSS_BACKUP"
  cp "$JS_FILE" "$JS_BACKUP"
  echo "🧷 Backups created:"
  echo "   → $CSS_BACKUP"
  echo "   → $JS_BACKUP"
else
  echo "⚠️ Skipping backups."
fi

echo ""
echo "🔍 Preview of changes:"
echo "-----------------------------------------------------"
cat <<'EOF'
CSS CHANGES:
------------
✔ Remove conflicting duplicate .hero blocks
✔ Set hero to height:100vh, pointer-events:auto
✔ Make hero-content clickable: pointer-events:auto
✔ Prevent globe canvas blocking taps: pointer-events:none
✔ Add .hero.hero-half collapse class

JS CHANGES:
-----------
✔ Add tap-to-collapse listener:
   hero.addEventListener("click", ...)

EOF
echo "-----------------------------------------------------"
echo ""

read -p "❓ Apply this patch now? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "🚫 Patch cancelled."
  exit 0
fi

echo ""
echo "✏️ Cleaning old .hero definitions..."

# Remove ALL .hero blocks (CSS spans multiple lines)
sed -i '' '/\.hero {/,/}/d' "$CSS_FILE"

echo "✔ Removed older .hero definitions."

echo ""
echo "✏️ Appending clean CSS patch..."

cat >> "$CSS_FILE" << 'EOF'

/* CLEAN HERO BLOCK (PATCHED) */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transition: height 0.45s ease, opacity 0.3s ease;
  pointer-events: auto !important;
}

/* Allow text/button interactions */
.hero-content {
  pointer-events: auto !important;
}

/* Prevent canvas from capturing taps */
#globe-canvas {
  pointer-events: none !important;
}

/* Tap collapse */
.hero.hero-half {
  height: 50vh !important;
  opacity: 0.9;
}
EOF

echo "✔ CSS successfully patched."

echo ""
echo "✏️ Applying JS tap-collapse patch..."

if ! grep -q "setupHeroTap" "$JS_FILE"; then
cat >> "$JS_FILE" << 'EOF'

/* Tap-to-collapse hero (PATCHED) */
(function () {
  "use strict";

  function setupHeroTap() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    hero.addEventListener("click", () => {
      hero.classList.toggle("hero-half");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroTap);
  } else {
    setupHeroTap();
  }
})();
EOF

  echo "✔ JS patch applied."
else
  echo "ℹ️ JS already contained tap-collapse block — skipping."
fi

echo ""
echo "🎉 DONE!"
echo "👉 Tap anywhere on the hero: it should collapse to 50vh."
echo "👉 Tap again: it expands back."
