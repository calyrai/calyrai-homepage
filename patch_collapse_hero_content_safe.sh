#!/usr/bin/env bash
set -euo pipefail

echo "🌌 SAFE PATCH: Tap-to-collapse ONLY hero-content"
echo "-------------------------------------------------"
echo "This will:"
echo "  • Add CSS for collapsible .hero-content"
echo "  • Add JS that collapses/expands .hero-content on tap"
echo "  • Leave the globe and hero sizing untouched"
echo ""

read -p "❓ Shall I run this patch? (y/N) " run
if [[ "$run" != "y" && "$run" != "Y" ]]; then
  echo "🚫 Aborted."
  exit 0
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSS_FILE="$ROOT_DIR/css/home.css"
JS_FILE="$ROOT_DIR/js/nav_autohide.js"

if [[ ! -f "$CSS_FILE" ]]; then
  echo "❌ CSS not found: $CSS_FILE"
  exit 1
fi

if [[ ! -f "$JS_FILE" ]]; then
  echo "❌ JS not found: $JS_FILE"
  exit 1
fi

echo "✔ Files found"
echo ""

read -p "❓ Create backups? (Y/n) " dobackup
if [[ "$dobackup" != "n" && "$dobackup" != "N" ]]; then
  ts=$(date +%Y%m%d_%H%M%S)
  cp "$CSS_FILE" "$CSS_FILE.bak_$ts"
  cp "$JS_FILE" "$JS_FILE.bak_$ts"
  echo "🧷 Backups:"
  echo "   $CSS_FILE.bak_$ts"
  echo "   $JS_FILE.bak_$ts"
else
  echo "⚠️ No backup created."
fi

echo ""
echo "🔍 PREVIEW: THIS WILL BE ADDED"
echo "-----------------------------------------------------"
cat << 'EOF'
CSS:
.hero-content {
  transition: max-height 0.5s ease, opacity 0.4s ease;
  overflow: hidden;
  max-height: 120vh; /* default */
}

.hero-content.collapsed {
  max-height: 0 !important;
  opacity: 0 !important;
}

JS:
(function () {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  hero.addEventListener("click", () => {
    content.classList.toggle("collapsed");
  });
})();
EOF
echo "-----------------------------------------------------"
echo ""

read -p "❓ Apply patch now? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "🚫 Patch cancelled."
  exit 0
fi

echo ""
echo "✏️ Applying CSS patch..."

if ! grep -q "hero-content.collapsed" "$CSS_FILE"; then
cat >> "$CSS_FILE" << 'EOF'

/* COLLAPSIBLE HERO CONTENT (PATCHED) */
.hero-content {
  transition: max-height 0.5s ease, opacity 0.4s ease;
  overflow: hidden;
  max-height: 120vh;
}

.hero-content.collapsed {
  max-height: 0 !important;
  opacity: 0 !important;
}
EOF
  echo "✔ CSS updated"
else
  echo "ℹ️ CSS already patched, skipping."
fi

echo ""
echo "✏️ Applying JS patch..."

if ! grep -q "content.classList.toggle" "$JS_FILE"; then
cat >> "$JS_FILE" << 'EOF'

/* TAP TO COLLAPSE HERO-CONTENT (PATCHED) */
(function () {
  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  if (!hero || !content) return;

  hero.addEventListener("click", () => {
    content.classList.toggle("collapsed");
  });
})();
EOF
  echo "✔ JS updated"
else
  echo "ℹ️ JS already had collapse logic, skipping."
fi

echo ""
echo "🎉 DONE!"
echo "👉 Tap anywhere in the hero section. The TEXT/BUTTON area will collapse."
echo "👉 Tap again to expand."
