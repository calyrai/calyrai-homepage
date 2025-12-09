#!/usr/bin/env bash
set -euo pipefail

echo "🌌 SAFE PATCH: Tap-to-collapse hero"
echo "------------------------------------"
echo "This patch will:"
echo "  • add CSS collapse rules to css/home.css"
echo "  • add tap/mouse-click collapse toggle to js/nav_autohide.js"
echo ""

read -p "❓ Shall I run this patch? (y/N) " run
if [[ "$run" != "y" && "$run" != "Y" ]]; then
  echo "🚫 Patch aborted."
  exit 0
fi

# Paths
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
  echo "⚠️ No backups created."
fi

echo ""
echo "🔍 Patch preview:"
echo "------------------------------------"
cat << 'EOF'
CSS to be added:

/* Tap-to-collapse hero */
.hero {
  transition: height 0.45s ease, opacity 0.3s ease;
  height: 100vh;
  overflow: hidden;
}

.hero.hero-half {
  height: 50vh !important;
  opacity: 0.9;
}

JS to be added:

/* Tap-to-collapse hero (2-state) */
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
echo "------------------------------------"
echo ""

read -p "❓ Apply this patch now? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "🚫 Patch cancelled."
  exit 0
fi

echo ""
echo "✏️ Applying patch..."

# -------------------------
# CSS PATCH
# -------------------------
if grep -q "hero-half" "$CSS_FILE"; then
  echo "ℹ️ CSS already contains hero-half — skipping."
else
  cat >> "$CSS_FILE" << 'EOF'

/* Tap-to-collapse hero */
.hero {
  transition: height 0.45s ease, opacity 0.3s ease;
  height: 100vh;
  overflow: hidden;
}

.hero.hero-half {
  height: 50vh !important;
  opacity: 0.9;
}
EOF
  echo "✔ CSS patch applied"
fi

# -------------------------
# JS PATCH
# -------------------------
if grep -q "setupHeroTap" "$JS_FILE"; then
  echo "ℹ️ JS already contains setupHeroTap — skipping."
else
  cat >> "$JS_FILE" << 'EOF'

/* Tap-to-collapse hero (2-state) */
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
  echo "✔ JS patch applied"
fi

echo ""
echo "🎉 Done! Tap/click the hero → it collapses. Tap again → it expands."
