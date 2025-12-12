#!/usr/bin/env bash
set -euo pipefail
echo "↩️  Reverting split from: backup_split_pr_20251212_052329"

cp -a "backup_split_pr_20251212_052329/js/pr_iq_viewer.js" "js/pr_iq_viewer.js"

if [[ -d "backup_split_pr_20251212_052329/js/pr" ]]; then
  rm -rf "js/pr"
  cp -a "backup_split_pr_20251212_052329/js/pr" "js/pr"
else
  rm -rf "js/pr"
fi

echo "✅ Reverted."
