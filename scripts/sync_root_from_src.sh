#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

for f in index.html explore.html projects.html team.html bill.html; do
  if [ -f "src/$f" ]; then
    cp -f "src/$f" "$f"
  fi
done

rsync -a --delete --exclude="**/.DS_Store" src/pages/ pages/
rsync -a --delete --exclude="**/.DS_Store" src/css/ css/
rsync -a --delete --exclude="**/.DS_Store" src/js/ js/
rsync -a --delete --exclude="**/.DS_Store" src/data/ data/
rsync -a --delete --exclude="**/.DS_Store" src/projects/ projects/
rsync -a --delete --exclude="**/.DS_Store" src/viewers/ viewers/
rsync -a --delete --exclude="**/.DS_Store" src/saxs_viewer/ saxs_viewer/
rsync -a --delete --exclude="**/.DS_Store" src/calyrai-pdb-viewer/ calyrai-pdb-viewer/
