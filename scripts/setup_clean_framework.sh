#!/usr/bin/env bash
set -euo pipefail

echo "=== CALYRAI FRAMEWORK SETUP START ==="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ts="$(date +"%Y%m%d_%H%M%S")"
BACKUP_DIR="backup_root/$ts"

#######################################
# 0. BACKUP (SAFE GUARD)
#######################################

echo "→ creating backup at $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Best-effort backup of current working tree content.
for p in *.html css js data projects saxs_viewer calyrai-pdb-viewer pages public src templates scripts projects_src .github CNAME; do
  if [ -e "$p" ]; then
    cp -R "$p" "$BACKUP_DIR/" 2>/dev/null || true
  fi
done

#######################################
# 1. ENSURE CORE STRUCTURE
#######################################

echo "→ creating structure"

mkdir -p src
mkdir -p src/css src/js src/data src/pages src/projects src/viewers

mkdir -p projects_src
mkdir -p public
mkdir -p scripts
mkdir -p templates

#######################################
# 2. MOVE ROOT WEBSITE INTO SRC
#######################################

echo "→ moving root into src (no clobber)"

safe_move_file() {
  local from="$1"
  local to_dir="$2"
  local base
  base="$(basename "$from")"
  local to="$to_dir/$base"

  [ -e "$from" ] || return 0
  mkdir -p "$to_dir"

  if [ -e "$to" ]; then
    if cmp -s "$from" "$to"; then
      rm -f "$from"
      return 0
    fi

    local conflict_dir="src/_root_conflicts/$ts"
    mkdir -p "$conflict_dir"
    mv "$from" "$conflict_dir/$base"
    return 0
  fi

  mv "$from" "$to_dir/"
}

safe_rsync_dir_no_clobber() {
  local from_dir="$1"
  local to_dir="$2"

  [ -d "$from_dir" ] || return 0
  mkdir -p "$to_dir"

  # Copy only missing files into src; root is treated as a duplicate.
  rsync -a --ignore-existing "$from_dir/" "$to_dir/" 2>/dev/null || true
}

for f in index.html explore.html projects.html; do
  safe_move_file "$f" "src"
done

safe_rsync_dir_no_clobber "css" "src/css"
safe_rsync_dir_no_clobber "js" "src/js"
safe_rsync_dir_no_clobber "data" "src/data"
safe_rsync_dir_no_clobber "pages" "src/pages"
safe_rsync_dir_no_clobber "projects" "src/projects"

if [ -d saxs_viewer ]; then
  if [ ! -d src/viewers/saxs_viewer ]; then
    mv saxs_viewer src/viewers/ 2>/dev/null || true
  else
    rm -rf saxs_viewer 2>/dev/null || true
  fi
fi

if [ -d calyrai-pdb-viewer ]; then
  if [ ! -d src/viewers/calyrai-pdb-viewer ]; then
    mv calyrai-pdb-viewer src/viewers/ 2>/dev/null || true
  else
    rm -rf calyrai-pdb-viewer 2>/dev/null || true
  fi
fi

#######################################
# 3. CLEAN ROOT DUPLICATES
#######################################

echo "→ cleaning root duplicates"

rm -rf css js data projects saxs_viewer calyrai-pdb-viewer pages 2>/dev/null || true

#######################################
# 4. CREATE PUBLIC BUILD SCRIPT
#######################################

echo "→ writing build_public.sh"

cat > scripts/build_public.sh <<'EOF'
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

if [ -f CNAME ]; then
  cp -f CNAME public/CNAME
fi

echo "→ public build done"
EOF

chmod +x scripts/build_public.sh

#######################################
# 5. CREATE MASTER BUILD SCRIPT
#######################################

echo "→ writing build_all.sh"

cat > scripts/build_all.sh <<'EOF'
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

python -m pip install --upgrade pip >/dev/null
python -m pip install -r scripts/requirements.txt >/dev/null

echo "→ building projects"
python scripts/build_projects.py --clean --out src/projects

echo "→ building public"
bash scripts/build_public.sh

echo "=== DONE ==="
EOF

chmod +x scripts/build_all.sh

#######################################
# 6. INIT NEXUS STRUCTURE
#######################################

echo "→ initializing nexus"

mkdir -p src/data/nexus/application

if [ ! -f src/data/nexus/nodes.json ]; then
  cat > src/data/nexus/nodes.json <<'EOF'
[]
EOF
fi

if [ ! -f src/data/nexus/edges.json ]; then
  cat > src/data/nexus/edges.json <<'EOF'
[]
EOF
fi

#######################################
# DONE
#######################################

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "NEXT:"
echo "1. ./scripts/build_all.sh"
echo "2. open public/index.html"
