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

# Keep deploy output deterministic.
mkdir -p "$DEPLOY_DIR"
find "$DEPLOY_DIR" -mindepth 1 ! -name '.gitkeep' -exec rm -rf {} +

# Include generated static routes from web/public (e.g., /research/platforms/*).
if [[ -d "$WEB_DIR/public" ]]; then
  cp -R "$WEB_DIR/public/." "$DEPLOY_DIR/"
fi

source_html="$WEB_DIR/dist/$DEPLOY_HTML"
if [[ ! -f "$source_html" ]]; then
  echo "Expected build artifact not found: $source_html" >&2
  echo "Check WEB_DIR/DEPLOY_HTML settings and build output path." >&2
  exit 1
fi

cp "$source_html" "$DEPLOY_DIR/$DEPLOY_HTML"
node scripts/inject-home-mouse.mjs "$DEPLOY_DIR/$DEPLOY_HTML"

for route in contact books; do
  mkdir -p "$DEPLOY_DIR/$route"
  cp "$source_html" "$DEPLOY_DIR/$route/$DEPLOY_HTML"
done

if [[ -f CNAME ]]; then
  cp CNAME "$DEPLOY_DIR/CNAME"
fi

echo "Prepared deploy package in: $repo_root/$DEPLOY_DIR"
