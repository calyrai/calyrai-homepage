#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d src ]; then
  echo "ERROR: src/ not found (run from repo root)" >&2
  exit 1
fi

echo "→ rebuilding public"

rm -rf public
mkdir -p public

rsync -a --delete \
  --exclude='_root_conflicts/' \
  --exclude='__pycache__/' \
  --exclude='**/.DS_Store' \
  src/ public/

# Optional local-only overlay. This folder is gitignored in the public repo,
# but you can manage it via a separate private git repository cloned into
# ./private (or just keep it as local files).
PRIVATE_OVERLAY_DIR="private/public_overlay"
if [ -d "$PRIVATE_OVERLAY_DIR" ]; then
  echo "→ applying private overlay ($PRIVATE_OVERLAY_DIR)"
  rsync -a \
    --exclude='**/.DS_Store' \
    "$PRIVATE_OVERLAY_DIR"/ public/
fi

if [ -f CNAME ]; then
  cp -f CNAME public/CNAME
fi

echo "→ public build done"
