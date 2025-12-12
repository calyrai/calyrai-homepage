#!/bin/bash

echo "=== Undo Calyrai PDB Patch ==="

# Find last backup folder
LATEST=$(ls -dt backup_pdb_patch_* 2>/dev/null | head -1)

if [[ -z "$LATEST" ]]; then
  echo "❌ No backup folders found. Nothing to undo."
  exit 1
fi

echo "Found latest backup: $LATEST"
read -p "Restore this backup? (y/n): " yn

if [[ "$yn" != "y" ]]; then
  echo "Cancelled."
  exit 0
fi

# Restore files
if [[ -f "$LATEST/style.css.bak" ]]; then
  cp "$LATEST/style.css.bak" css/style.css
  echo "✓ Restored css/style.css"
else
  echo "⚠ No style.css.bak in backup."
fi

if [[ -f "$LATEST/index.html.bak" ]]; then
  cp "$LATEST/index.html.bak" index.html
  echo "✓ Restored index.html"
else
  echo "⚠ No index.html.bak in backup."
fi

echo ""
echo "=== UNDO COMPLETE ==="
echo "Your files have been restored to the state in: $LATEST"
