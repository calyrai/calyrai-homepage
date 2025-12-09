#!/usr/bin/env bash
set -euo pipefail

echo "🌌 SAFE PATCH: Fix Hero Interaction + Tap Collapse"
echo "---------------------------------------------------"
echo "This will:"
echo "  • Clean up .hero CSS (remove duplicates)"
echo "  • Fix pointer-events (hero & hero-content)"
echo "  • Disable canvas click-blocking"
echo "  • Install tap-to-collapse JS"
echo ""

read -p "❓ Shall I run this patch? (y/N) " run
if [[ "$run" != "y" && "$run" != "Y" ]]; then
  echo "🚫 Patch aborted."
  exit 0
fi

# Correct paths inside /web
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSS_FILE="$ROOT_DIR/css/home.css"
JS_FILE="$ROOT_DIR/js/nav_autohide.js"

if [[ ! -f "$CSS_FILE" ]]; then
  echo "❌ CSS file not found: $CSS_FILE"
  exit 1
fi

if [[ ! -f "$JS_FILE" ]]; then
  echo "❌ JS file not found: $JS_FILE"
  exit 1
fi

echo "✔ Found:"
echo "  $CSS_FILE"
echo "  $JS_FILE"
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
  echo "⚠️ No backups created."
fi

echo ""
echo "🔍 Patch preview:"
echo "---------------------------------------------------"
cat << 'EOF'
CSS FIXES:
---------
1) Replace ALL duplicate .hero rules with ONE clean block:
     .hero {
       height: 100vh;
       overflow: hidden;
       pointer-events: auto;
       transition: height 0.45s ease, opacity 0.3s ease;
     }

2) Make hero-content clickable again:
     .hero-content { pointer-events: auto !important; }

3) Prevent canvas from intercepting taps:
     #globe-canvas { pointer-events: none !important; }

4) Add working collapse class:
     .hero.hero-half { height: 50vh !important; opacity: 0.9; }

JS FIX:
-------
Add tap-to-collapse toggle:

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
echo "---------------------------------------------------"
echo ""

read -p "❓ Apply this patch now? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "🚫 Patch cancelled."
  exit 0
fi

echo ""
echo "✏️ Applying CSS fixes..."

# STEP 1 — Remove ALL existing .hero definitions to avoid override problems
sed -i '' '/\.hero {/,/}/d' "$CSS_FILE"

# STEP 2 — Insert clean CSS block
cat >> "$CSS_FILE" << 'EOF'

/* CLEAN HERO RULE (auto-inserted patch) */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transition: height 0.45s ease, opacity 0.3s ease;
  pointer-events: auto;
}

/* Make content clickable */
.hero-content {
  pointer-events: auto !important;
}

/* Prevent globe canvas from blocking interactions */
#globe-canvas {
  pointer-events: none !important;
}

/* Tap collapse */
.hero.hero-half {
  height: 50vh !important;
  opacity: 0.9;
}
EOF

echo "✔ CSS patched successfully."

echo ""
echo "✏️ Applying JS patch..."

# Only append JS if not already present
if ! grep -q "setupHeroTap" "$JS_FILE"; then
  cat >> "$JS_FILE" << 'EOF'

/* Tap-to-collapse hero (auto-inserted patch) */
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
  echo "ℹ️ JS already contains setupHeroTap — skipped."
fi

echo ""
echo "🎉 DONE!"
echo "👉 Tap anywhere on the hero (text OR background) to collapse to 50vh."
echo "👉 Tap again to expand to full height."
