#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"

WEB_DIR="${WEB_DIR:-web}"
DEPLOY_DIR="${DEPLOY_DIR:-deploy}"
DEPLOY_HTML="${DEPLOY_HTML:-index.html}"

cd "$repo_root"

# Build a single self-contained HTML from the local web app state.
npm --prefix "$WEB_DIR" ci
npm --prefix "$WEB_DIR" run build

# Keep deploy output minimal and deterministic.
mkdir -p "$DEPLOY_DIR"
find "$DEPLOY_DIR" -mindepth 1 ! -name '.gitkeep' -exec rm -rf {} +

cp "$WEB_DIR/dist/$DEPLOY_HTML" "$DEPLOY_DIR/$DEPLOY_HTML"

if [[ -f CNAME ]]; then
  cp CNAME "$DEPLOY_DIR/CNAME"
fi

echo "Prepared deploy package in: $repo_root/$DEPLOY_DIR"
