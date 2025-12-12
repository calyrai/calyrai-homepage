#!/bin/bash

echo "=== Calyrai PDB Viewer Patch ==="
echo "This will:"
echo "  • Add neon Calyrai styling for the PDB container"
echo "  • Ensure <div id='pdbCanvasContainer'> exists"
echo "  • Create a backup folder with timestamp"
echo ""
read -p "Apply patch? (y/n): " yn
if [[ "$yn" != "y" ]]; then
  echo "Cancelled."
  exit 0
fi

# --- Directories ---
CSS="css/style.css"
HTML="index.html"

TS=$(date +"%Y%m%d_%H%M%S")
BKP="backup_pdb_patch_${TS}"
mkdir -p "$BKP"

echo "Backing up modified files into: $BKP/"
cp "$CSS" "$BKP/style.css.bak"
cp "$HTML" "$BKP/index.html.bak"

echo "Patching CSS..."
cat <<'EOF' >> "$CSS"

/* ============================================================
   Calyrai Neon PDB Container
   ============================================================ */
#pdbCanvasContainer {
  width: 100%;
  height: 100%;
  min-height: 320px;
  background: radial-gradient(circle at top left, #081020, #020308);
  border: 1px solid #111;
  box-shadow: 0 0 18px rgba(0,255,255,0.25);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

#pdbCanvasContainer.dragover {
  border-color: #ff00ff;
  box-shadow: 0 0 22px rgba(255,0,255,0.85);
}
EOF


# Ensure container exists only once
echo "Checking if #pdbCanvasContainer exists in index.html…"

if ! grep -q "pdbCanvasContainer" "$HTML"; then
  echo "Inserting PDB container block…"
  sed -i '' '/PDB Viewer/ a\
    <div id="pdbCanvasContainer"></div>
  ' "$HTML"
else
  echo "✓ Container already exists — not modifying HTML."
fi

echo ""
echo "=== PATCH COMPLETE ==="
echo "Backup created in: $BKP"
echo "CSS + HTML updated successfully."
