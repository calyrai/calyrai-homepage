#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== CALYRAI FULL BUILD ==="

if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "ERROR: python3 not found" >&2
  exit 1
fi

VENV_DIR=".venv_build"

echo "→ ensuring build venv ($VENV_DIR)"
if [ ! -x "$VENV_DIR/bin/python" ]; then
  "$PY" -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

VENV_PY="$VENV_DIR/bin/python"
if [ ! -x "$VENV_PY" ]; then
  VENV_PY="$VENV_DIR/bin/python3"
fi

"$VENV_PY" -m pip install --upgrade pip >/dev/null
"$VENV_PY" -m pip install -r scripts/requirements.txt >/dev/null

echo "→ building site pages"
"$VENV_PY" scripts/build_pages.py --out src
"$VENV_PY" scripts/build_pages.py --out .

echo "→ building nexus YAML artifacts"
"$VENV_PY" scripts/build_nexus_yaml.py

echo "→ building projects"
"$VENV_PY" scripts/build_projects.py --clean --out src/projects

echo "→ building public"
bash scripts/build_public.sh

echo "=== DONE ==="
