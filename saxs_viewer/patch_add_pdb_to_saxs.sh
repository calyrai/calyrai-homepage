#!/usr/bin/env bash
set -euo pipefail

# Root of this viewer (where index.html lives)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

INDEX="$ROOT_DIR/index.html"
CSS="$ROOT_DIR/css/style.css"

if [[ ! -f "$INDEX" ]] || [[ ! -f "$CSS" ]]; then
  echo "ERROR: index.html or css/style.css not found in:"
  echo "  $ROOT_DIR"
  exit 1
fi

echo "This script will:"
echo "  • append Calyrai PDB viewer styles to css/style.css"
echo "  • embed a PDB viewer panel + NGL scripts into index.html"
echo
read -r -p "Proceed with patch? [y/N] " ans
case "$ans" in
  y|Y) ;;
  *) echo "Aborted."; exit 0;;
esac

# -------------------------------------------------------------------
# Create backup
# -------------------------------------------------------------------
ts="$(date +"%Y%m%d_%H%M%S")"
BACKUP_DIR="$ROOT_DIR/backup_pdb_patch_$ts"
mkdir -p "$BACKUP_DIR"

cp "$INDEX" "$BACKUP_DIR/index.html.bak"
cp "$CSS"    "$BACKUP_DIR/style.css.bak"

echo "Backup created in: $BACKUP_DIR"
echo "To revert:  cp \"$BACKUP_DIR/index.html.bak\" \"$INDEX\""
echo "            cp \"$BACKUP_DIR/style.css.bak\" \"$CSS\""
echo

# -------------------------------------------------------------------
# 1) Append CSS for PDB viewer to css/style.css
# -------------------------------------------------------------------
cat >> "$CSS" <<'EOF'

/* ===== Calyrai PDB sphere viewer ===== */
#pdbPane {
  width: 100%;
  max-width: 1200px;
  margin: 0.5rem auto 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

#pdbHeader {
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #b0faff;
}

#pdbHeader .hint {
  font-size: 0.75rem;
  color: #aaaaaa;
}

#pdbViewer {
  width: 100%;
  height: 340px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #000000;
}

#pdbViewer.dragover {
  outline: 1px dashed #ff00ff;
  box-shadow: 0 0 12px rgba(255,0,255,0.7);
}
EOF

echo "Appended PDB viewer styles to css/style.css"

# -------------------------------------------------------------------
# 2) Patch index.html:
#    - add PDB pane + NGL + pdb_viewer.js before </body>
# -------------------------------------------------------------------
perl -0pi -e 's#</body>#  <!-- Calyrai PDB sphere viewer -->\n  <div id="pdbPane">\n    <div id="pdbHeader">\n      <span>PDB-Viewer (Calyrai spheres)</span>\n      <span class="hint">Drop a .pdb file onto the black area</span>\n    </div>\n    <div id="pdbViewer"></div>\n  </div>\n\n  <!-- NGL + PDB viewer logic -->\n  <script src="https://unpkg.com/ngl@0.10.4/dist/ngl.js"></script>\n  <script type="module" src="js/pdb_viewer.js"></script>\n\n</body>#' "$INDEX"

echo "Patched index.html with PDB pane + scripts."

echo
echo "Done. Reload index.html in the browser."
echo "You should now see a third panel: drop a .pdb file to get one sphere per residue."
