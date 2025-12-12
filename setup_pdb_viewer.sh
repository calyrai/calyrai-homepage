#!/usr/bin/env bash
set -euo pipefail

# Usage: ./setup_pdb_viewer.sh [TARGET_DIR]
TARGET_DIR="${1:-pdb_viewer}"

echo ">>> Creating PDB viewer in: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

############################################
# index.html
############################################
cat > "$TARGET_DIR/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Calyrai PDB Viewer – Amino Acid Spheres</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background: #000000;
      color: #e0e0e0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
    }

    #ui-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      background: linear-gradient(90deg, #00101a, #200020);
      color: #e0e0e0;
      display: flex;
      align-items: center;
      padding: 0 12px;
      z-index: 10;
      font-size: 13px;
      box-shadow: 0 0 12px rgba(0,0,0,0.8);
      box-sizing: border-box;
    }

    #title {
      font-weight: 600;
      margin-right: 16px;
      color: #ffffff;
    }

    #legend {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .legend-chip {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: linear-gradient(90deg, #00ffff, #ff00ff);
      box-shadow: 0 0 8px rgba(0,255,255,0.5);
    }

    #dropzone {
      margin-left: auto;
      border: 1px dashed #00ffff;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 11px;
      color: #b0faff;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    #dropzone span.icon {
      font-size: 13px;
    }

    #dropzone.dragover {
      border-color: #ff00ff;
      color: #ffd6ff;
      box-shadow: 0 0 10px rgba(255,0,255,0.8);
    }

    #viewer {
      position: absolute;
      top: 44px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="ui-bar">
    <div id="title">Calyrai PDB Viewer</div>
    <div id="legend">
      <div class="legend-chip"></div>
      <span>one sphere per residue &mdash; cyan &rarr; magenta along sequence</span>
    </div>
    <div id="dropzone">
      <span class="icon">⬇︎</span>
      <span>Drop&nbsp;.pdb here</span>
    </div>
  </div>

  <div id="viewer"></div>

  <script type="module" src="pdb_viewer.js"></script>
</body>
</html>
EOF

############################################
# pdb_viewer.js
############################################
cat > "$TARGET_DIR/pdb_viewer.js" <<'EOF'
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { PDBLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/PDBLoader.js";

const container = document.getElementById("viewer");
const dropzone  = document.getElementById("dropzone");

// --------------------------------------------------
// Renderer / Scene / Camera
// --------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
function resizeRenderer() {
  const w = window.innerWidth;
  const h = window.innerHeight - 44;
  renderer.setSize(w, h);
}
resizeRenderer();
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x000000);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.002);

const camera = new THREE.PerspectiveCamera(
  45,
  (window.innerWidth) / (window.innerHeight - 44),
  1,
  5000
);
camera.position.set(80, 80, 80);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 0.8;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const keyLight = new THREE.PointLight(0x66ccff, 1.0);
keyLight.position.set(80, 120, 80);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0xff66ff, 0.8);
fillLight.position.set(-80, -60, -80);
scene.add(fillLight);

// Group for current structure
let moleculeGroup = new THREE.Group();
scene.add(moleculeGroup);

// --------------------------------------------------
// Cyan → Magenta gradient for N residues
// --------------------------------------------------
function residueColor(i, n) {
  const t = i / Math.max(1, n - 1);     // 0 → 1
  const color = new THREE.Color();
  // HSL: cyan (0.75) → magenta (0.50)
  color.setHSL(0.75 - 0.25 * t, 1.0, 0.55);
  return color;
}

// --------------------------------------------------
// PDB Loader + build amino-acid spheres
// --------------------------------------------------
const loader = new PDBLoader();

function loadPDBFromString(text) {
  // remove old molecule
  scene.remove(moleculeGroup);
  moleculeGroup = new THREE.Group();
  scene.add(moleculeGroup);

  const parsed = loader.parse(text);

  // 1) group atoms into residues: key = chainID:resSeq
  const residues = new Map();
  parsed.atoms.forEach(atom => {
    const key = `${atom.chainID}:${atom.resSeq}`;
    if (!residues.has(key)) residues.set(key, []);
    residues.get(key).push(atom);
  });

  const keys = Array.from(residues.keys());
  const N = keys.length;
  if (N === 0) {
    console.warn("No residues found in PDB.");
    return;
  }

  // 2) compute position per residue (~CA or centroid)
  const positions = keys.map(key => {
    const atoms = residues.get(key);
    const ca = atoms.find(a => a.atom === "CA");
    if (ca) return ca.position.clone();

    let cx = 0, cy = 0, cz = 0;
    atoms.forEach(a => { cx += a.position.x; cy += a.position.y; cz += a.position.z; });
    cx /= atoms.length;
    cy /= atoms.length;
    cz /= atoms.length;
    return new THREE.Vector3(cx, cy, cz);
  });

  // 3) build spheres
  const sphereGeom = new THREE.SphereGeometry(1.3, 24, 24);
  positions.forEach((pos, i) => {
    const col = residueColor(i, N);
    const mat = new THREE.MeshPhongMaterial({
      color: col,
      emissive: col.clone().multiplyScalar(0.4),
      shininess: 60,
      specular: 0xffffff
    });
    const s = new THREE.Mesh(sphereGeom, mat);
    s.position.copy(pos);
    moleculeGroup.add(s);
  });

  // 4) center molecule in view
  const box = new THREE.Box3().setFromObject(moleculeGroup);
  const center = box.getCenter(new THREE.Vector3());
  moleculeGroup.position.sub(center);

  // 5) reset camera a bit
  const size = box.getSize(new THREE.Vector3()).length() || 100;
  const dist = size * 1.2;
  camera.position.set(dist, dist, dist);
  controls.target.set(0, 0, 0);
  controls.update();

  console.log("Loaded residues:", N);
}

// --------------------------------------------------
// Drag & Drop
// --------------------------------------------------
["dragenter", "dragover", "dragleave", "drop"].forEach(ev => {
  dropzone.addEventListener(ev, e => {
    e.preventDefault();
    e.stopPropagation();
  }, false);
});

dropzone.addEventListener("dragover", () => {
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

dropzone.addEventListener("drop", e => {
  dropzone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".pdb")) {
    alert("Please drop a .pdb file");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    loadPDBFromString(reader.result);
  };
  reader.readAsText(file);
});

// also allow clicking dropzone to open file dialog
dropzone.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdb";
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      loadPDBFromString(reader.result);
    };
    reader.readAsText(file);
  };
  input.click();
});

// --------------------------------------------------
// Resize handling
// --------------------------------------------------
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight - 44;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  resizeRenderer();
});

// --------------------------------------------------
// Animation loop
// --------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
EOF

echo ">>> Done."
echo
echo "Next steps:"
echo "  cd \"$TARGET_DIR\""
echo "  python -m http.server 8000"
echo
echo "Then open: http://localhost:8000 in your browser and drag a .pdb onto the bar."
