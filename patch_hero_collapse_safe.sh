#!/usr/bin/env bash
set -euo pipefail

echo "🌌 SAFE PATCH: Collapse .hero on scroll"
echo "----------------------------------------"
echo "This will:"
echo "  • update css/home.css (add collapse styles for .hero)"
echo "  • update js/nav_autohide.js (add scroll listener to collapse hero)"
echo ""

read -p "❓ Shall I run this patch? (y/N) " run
if [[ "$run" != "y" && "$run" != "Y" ]]; then
  echo "🚫 Patch aborted."
  exit 0
fi

# Paths (relative to this script, inside web/)
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
echo "🔍 Patch preview (what will be appended):"
echo "----------------------------------------"

cat << 'EOF'
CSS (to be added to css/home.css):

.hero {
  transition: height 0.5s ease, opacity 0.4s ease;
  overflow: hidden;
}

.hero.hero-collapsed {
  height: 0 !important;
  opacity: 0;
  pointer-events: none;
}

JS (to be added to js/nav_autohide.js):

(function () {
  "use strict";

  function collapseHeroOnScroll() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    let collapsed = false;

    window.addEventListener("scroll", () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      const shouldCollapse = y > 50; // collapse after small scroll

      if (shouldCollapse !== collapsed) {
        hero.classList.toggle("hero-collapsed", shouldCollapse);
        collapsed = shouldCollapse;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", collapseHeroOnScroll);
  } else {
    collapseHeroOnScroll();
  }
})();
EOF

echo "----------------------------------------"
echo ""
read -p "❓ Apply this patch now? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "🚫 Patch cancelled."
  exit 0
fi

echo ""
echo "✏️ Applying patch..."

# ------------------------
# CSS append (if not there)
# ------------------------
if grep -q "hero-collapsed" "$CSS_FILE"; then
  echo "ℹ️ CSS already seems patched (found 'hero-collapsed') – skipping CSS append."
else
  cat >> "$CSS_FILE" << 'EOF'

/* Collapse full-screen hero on scroll */
.hero {
  transition: height 0.5s ease, opacity 0.4s ease;
  overflow: hidden;
}

.hero.hero-collapsed {
  height: 0 !important;
  opacity: 0;
  pointer-events: none;
}
EOF
  echo "✔ CSS patch applied to css/home.css"
fi

# ------------------------
# JS append (if not there)
# ------------------------
if grep -q "collapseHeroOnScroll" "$JS_FILE"; then
  echo "ℹ️ JS already seems patched (found 'collapseHeroOnScroll') – skipping JS append."
else
  cat >> "$JS_FILE" << 'EOF'

/* Collapse .hero on scroll */
(function () {
  "use strict";

  function collapseHeroOnScroll() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    let collapsed = false;

    window.addEventListener("scroll", () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      const shouldCollapse = y > 50; // collapse after small scroll

      if (shouldCollapse !== collapsed) {
        hero.classList.toggle("hero-collapsed", shouldCollapse);
        collapsed = shouldCollapse;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", collapseHeroOnScroll);
  } else {
    collapseHeroOnScroll();
  }
})();
EOF
  echo "✔ JS patch applied to js/nav_autohide.js"
fi

echo ""
echo "🎉 Done. Now reload the homepage and scroll a bit – the hero should collapse."
