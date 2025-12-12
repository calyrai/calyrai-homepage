#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$ROOT_DIR/backup_pdb_patch_20251211_191417"

INDEX="$ROOT_DIR/index.html"
CSS="$ROOT_DIR/css/style.css"

# --- Sanity checks ---
if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "ERROR: Backup directory not found:"
  echo "  $BACKUP_DIR"
  exit 1
fi

if [[ ! -f "$BACKUP_DIR/index.html.bak" ]] || [[ ! -f "$BACKUP_DIR/style.css.bak" ]]; then
  echo "ERROR: Backup files missing in:"
  echo "  $BACKUP_DIR"
  exit 1
fi

echo "This will restore:"
echo "  index.html"
echo "  css/style.css"
echo "FROM:"
echo "  $BACKUP_DIR"
echo
read -r -p "Proceed with revert? [y/N] " ans
case "$ans" in
  y|Y) ;;
  *) echo "Aborted."; exit 0;;
esac

# Create a backup of current (possibly patched) files
ts="$(date +"%Y%m%d_%H%M%S")"
REVBACK="$ROOT_DIR/revert_backup_$ts"
mkdir -p "$REVBACK"

cp "$INDEX" "$REVBACK/index.html.current"
cp "$CSS"    "$REVBACK/style.css.current"

echo "Current versions saved to: $REVBACK"

# Restore original files
cp "$BACKUP_DIR/index.html.bak" "$INDEX"
cp "$BACKUP_DIR/style.css.bak"  "$CSS"

echo "Restored original index.html and style.css."
echo "You may reload the page now."
