#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# Patch: Make homepage header non-sticky on mobile (< 900px)
# Target: css/layout.css
# - Creates a timestamped backup
# - Asks for confirmation before patching
# - Avoids duplicate insertion
# ------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$SCRIPT_DIR"
CSS_FILE="$WEB_DIR/css/layout.css"

echo "🔧 Mobile Header Scroll Patch"
echo "   WEB_DIR  = $WEB_DIR"
echo "   CSS_FILE = $CSS_FILE"
echo

if [[ ! -f "$CSS_FILE" ]]; then
  echo "❌ CSS file not found: $CSS_FILE"
  exit 1
fi

# Check if patch already seems present
if grep -q "MOBILE: Header not sticky" "$CSS_FILE"; then
  echo "ℹ️ Patch marker already found in layout.css."
  read -r -p "Do you still want to append the block again? (y/N) " ans
  ans="${ans:-n}"
  if [[ ! "$ans" =~ ^[Yy]$ ]]; then
    echo "✅ Aborting – no changes made."
    exit 0
  fi
fi

echo "📄 Will patch the following file:"
echo "   $CSS_FILE"
echo
echo "📌 Patch to append (preview):"
echo "------------------------------------------------------------"
cat << 'PATCH_PREVIEW'
/* -------- MOBILE: Header not sticky -------- */
@media (max-width: 900px) {
  header,
  nav,
  .top-bar,
  .home-hero {
    position: static !important;
    top: auto !important;
    box-shadow: none !important;
  }
}
PATCH_PREVIEW
echo "------------------------------------------------------------"
echo

read -r -p "Apply this patch to css/layout.css ? (y/N) " confirm
confirm="${confirm:-n}"

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "❎ Patch cancelled – no changes made."
  exit 0
fi

# Backup
ts="$(date +%Y%m%d_%H%M%S)"
backup="${CSS_FILE}.bak_${ts}"
cp "$CSS_FILE" "$backup"
echo "🧷 Backup created: $backup"

# Append patch
cat << 'PATCH_BLOCK' >> "$CSS_FILE"

/* -------- MOBILE: Header not sticky -------- */
@media (max-width: 900px) {
  header,
  nav,
  .top-bar,
  .home-hero {
    position: static !important;
    top: auto !important;
    box-shadow: none !important;
  }
}
PATCH_BLOCK

echo "✅ Patch applied to: $CSS_FILE"
echo "   (On mobile < 900px width, header/hero will scroll away normally.)"
