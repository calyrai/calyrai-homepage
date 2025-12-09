#!/usr/bin/env bash
set -euo pipefail

echo "📱 Mobile Header Auto-Hide Patch (SAFE MODE)"
echo "------------------------------------------------------"
echo "This patch will:"
echo "  • modify css/home.css"
echo "  • modify js/nav_autohide.js"
echo "  • add mobile auto-hide for the upper button block"
echo ""

read -p "❓ Shall I run this patch? (y/N) " run
if [[ "$run" != "y" && "$run" != "Y" ]]; then
  echo "🚫 Patch aborted."
  exit 0
fi

# Determine paths
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

echo "✔ Files detected."
echo ""

read -p "❓ Create backup before patching? (Y/n) " dobackup
if [[ "$dobackup" != "n" && "$dobackup" != "N" ]]; then
  ts="$(date +%Y%m%d_%H%M%S)"
  CSS_BACKUP="${CSS_FILE}.bak_${ts}"
  JS_BACKUP="${JS_FILE}.bak_${ts}"
  cp "$CSS_FILE" "$CSS_BACKUP"
  cp "$JS_FILE" "$JS_BACKUP"
  echo "🧷 Backup created:"
  echo "   → $CSS_BACKUP"
  echo "   → $JS_BACKUP"
else
  echo "⚠️ No backup created."
fi

echo ""
echo "🔍 Showing patch preview..."
echo "------------------------------------------------------"

cat << 'EOF'
CSS ADD:

@media (max-width: 900px) {
  .hero-hide-on-scroll {
    transition: max-height 0.35s ease, opacity 0.3s ease, margin 0.3s ease;
    overflow: hidden;
  }
  .hero-hide-on-scroll--hidden {
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
  }
}

JS ADD:

(function () {
  "use strict";

  function setupHeroHideOnScroll() {
    var hero =
      document.querySelector(".home-hero") ||
      document.querySelector(".hero") ||
      document.querySelector(".intro-block") ||
      document.querySelector(".intro") ||
      document.querySelector(".hero-section");

    if (!hero) return;

    hero.classList.add("hero-hide-on-scroll");

    var lastHidden = false;

    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      var hide = y > 80;

      if (hide !== lastHidden) {
        hero.classList.toggle("hero-hide-on-scroll--hidden", hide);
        lastHidden = hide;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroHideOnScroll);
  } else {
    setupHeroHideOnScroll();
  }
})();
EOF

echo "------------------------------------------------------"
echo ""

read -p "❓ Apply this patch now? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "🚫 Patch cancelled."
  exit 0
fi

echo ""
echo "✏️ Applying patch..."

# Append CSS if not present
if ! grep -q "hero-hide-on-scroll" "$CSS_FILE"; then
  cat >> "$CSS_FILE" << 'EOF'

/* Mobile: hero intro block hide-on-scroll */
@media (max-width: 900px) {
  .hero-hide-on-scroll {
    transition: max-height 0.35s ease, opacity 0.3s ease, margin 0.3s ease;
    overflow: hidden;
  }
  .hero-hide-on-scroll--hidden {
    max-height: 0;
    opacity: 0;
    margin-bottom: 0;
  }
}
EOF
  echo "✔ CSS patch applied"
else
  echo "ℹ️ CSS already contains patch — skipped"
fi

# Append JS if not present
if ! grep -q "setupHeroHideOnScroll" "$JS_FILE"; then
  cat >> "$JS_FILE" << 'EOF'

/* Mobile auto-hide for top hero */
(function () {
  "use strict";

  function setupHeroHideOnScroll() {
    var hero =
      document.querySelector(".home-hero") ||
      document.querySelector(".hero") ||
      document.querySelector(".intro-block") ||
      document.querySelector(".intro") ||
      document.querySelector(".hero-section");

    if (!hero) return;

    hero.classList.add("hero-hide-on-scroll");

    var lastHidden = false;

    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      var hide = y > 80;

      if (hide !== lastHidden) {
        hero.classList.toggle("hero-hide-on-scroll--hidden", hide);
        lastHidden = hide;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroHideOnScroll);
  } else {
    setupHeroHideOnScroll();
  }
})();
EOF
  echo "✔ JS patch applied"
else
  echo "ℹ️ JS already contains patch — skipped"
fi

echo ""
echo "🎉 Done. Reload the page on your phone to test."
