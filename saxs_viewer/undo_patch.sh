#!/usr/bin/env bash
set -euo pipefail

# Choose the newest backup folder automatically
latest_backup=$(ls -d backup_* 2>/dev/null | sort | tail -n 1)

if [[ -z "$latest_backup" ]]; then
  echo "❌ No backup_* directory found. Nothing to undo."
  exit 1
fi

echo "🔍 Found latest backup: $latest_backup"
echo "It contains:"
ls -1 "$latest_backup"
echo ""

read -p "⚠️ Restore this backup and overwrite index.html + style.css? (y/n) " ans
if [[ "$ans" != "y" ]]; then
  echo "❌ Undo cancelled."
  exit 0
fi

# Restore index.html
if [[ -f "$latest_backup/index.html.bak" ]]; then
  cp "$latest_backup/index.html.bak" index.html
  echo "✔️ Restored index.html"
fi

# Restore css/style.css (if exists)
if [[ -f "$latest_backup/style.css.bak" ]]; then
  cp "$latest_backup/style.css.bak" css/style.css
  echo "✔️ Restored css/style.css"
fi

echo "✅ Undo complete. Your viewer is back to the previous state."
