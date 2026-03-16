#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d src ]; then
  echo "ERROR: src/ not found (run from repo root)" >&2
  exit 1
fi

rm -rf public
mkdir -p public

cp -aL src/. public/

if [ -f CNAME ]; then
  cp -f CNAME public/CNAME
fi

echo "public/ rebuilt from src/"