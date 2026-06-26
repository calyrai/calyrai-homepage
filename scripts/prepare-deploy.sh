#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"

cd "$repo_root"

# Build a single self-contained HTML from the local web app state.
npm --prefix web ci
npm --prefix web run build

# Keep deploy output minimal and deterministic.
mkdir -p deploy
find deploy -mindepth 1 ! -name '.gitkeep' -exec rm -rf {} +

cp web/dist/index.html deploy/index.html

if [[ -f CNAME ]]; then
  cp CNAME deploy/CNAME
fi

echo "Prepared deploy package in: $repo_root/deploy"
