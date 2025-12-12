#!/usr/bin/env bash
set -euo pipefail

# --- Where we are (saxs_viewer root) ---
# Expecting:
#   index.html
#   css/style.css   (optional, left untouched)
#   js/pr_iq_viewer.js
#   js/pdb_viewer.js
#   3V03.pdb        (for autoload)

ts=$(date +%Y%m%d_%H%M%S)
backup_dir="backup_restore_controls_${ts}"
mkdir -p "$backup_dir"

echo "🔒 Backing up current files to ./$backup_dir"
cp index.html             "$backup_dir/index.html.bak"
cp js/pdb_viewer.js       "$backup_dir/pdb_viewer.js.bak" 2>/dev/null || true

echo "✏️  Rewriting index.html …"
cat > index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Calyrai SAXS Viewer — P(r), I(q) & PDB</title>

  <!-- optional external CSS; we also define some layout below -->
  <link rel="stylesheet" href="css/style.css" />

  <style>
    :root {
      --bg: #000000;
      --panel-bg: #05070b;
      --fg: #f0f0f0;
      --accent-cyan: #24f3ff;
      --accent-magenta: #ff4df5;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      box-sizing: border-box;
      padding: 0.4rem;
    }

    #top-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      font-size: 0.8rem;
      color: #dddddd;
    }

    #top-controls .block {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    #top-controls span.label {
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    #top-controls input[type="range"] {
      width: 140px;
      -webkit-appearance: none;
      background: transparent;
    }
    #top-controls input[type="range"]::-webkit-slider-runnable-track {
      height: 3px;
      border-radius: 999px;
      background: #333;
    }
    #top-controls input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #000;
      margin-top: -4px;
    }

    #panels {
      flex: 1 1 0;
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      min-height: 0;
    }

    .panel {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      background: var(--panel-bg);
      border-radius: 10px;
      border: 1px solid #222;
      overflow: hidden;
      position: relative;
    }

    .panel-header {
      padding: 0.35rem 0.6rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: #f8f8f8;
      border-bottom: 1px solid #222;
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
    }

    .panel-header span.main {
      font-weight: 600;
    }
    .panel-header span.sub {
      font-size: 0.7rem;
      color: #bbbbbb;
    }

    .panel-body {
      flex: 1 1 0;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0.3rem;
      box-sizing: border-box;
    }

    canvas {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      background: #05070b;
      border: 1px solid #333;
    }

    #pdbCanvasContainer {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      background: radial-gradient(circle at center, #05070b 0%, #000000 60%);
      border: 1px solid #333;
      position: relative;
      overflow: hidden;
    }

    #pdb-drop-hint {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #bbbbbb;
      font-size: 0.8rem;
      text-align: center;
      pointer-events: none;
    }

    #pdb-drop-hint strong {
      color: var(--accent-cyan);
      font-weight: 600;
    }

    #pdbCanvasContainer.dragover {
      box-shadow: 0 0 15px rgba(36,243,255,0.7);
      border-color: var(--accent-magenta);
    }

    #pdb-footer {
      padding: 0.25rem 0.6rem 0.4rem;
      font-size: 0.72rem;
      color: #8a8a8a;
      border-top: 1px solid #222;
      text-align: center;
    }

    /* order: left I(q), middle P(r), right PDB */
    #iq-panel   { order: 1; }
    #pr-panel   { order: 2; }
    #pdb-panel  { order: 3; }

    @media (max-width: 1000px) {
      #panels {
        flex-direction: column;
      }
      #iq-panel, #pr-panel, #pdb-panel {
        order: initial;
      }
    }
  </style>
</head>
<body>

  <!-- ========= top sliders: D, alpha, mirror ========= -->
  <div id="top-controls">
    <div class="block">
      <span class="label">D:</span>
      <input id="DSlider" type="range" min="1" max="6" step="1" value="2">
      <span id="DVal">2</span>
    </div>

    <div class="block">
      <span class="label">α:</span>
      <input id="alphaSlider" type="range" min="0.10" max="2.00" step="0.05" value="0.70">
      <span id="alphaVal">0.70</span>
    </div>

    <div class="block">
      <label style="display:flex;align-items:center;gap:0.2rem;">
        <input type="checkbox" id="mirrorChk">
        ↔ mirror
      </label>
    </div>
  </div>

  <!-- ========= three panels ========= -->
  <div id="panels">

    <!-- I(q) LEFT -->
    <div class="panel" id="iq-panel">
      <div class="panel-header">
        <span class="main"><em>I(q)</em></span>
        <span class="sub">drop ASCII file here (q, I(q), [err])</span>
      </div>
      <div class="panel-body">
        <canvas id="iqCanvas" width="580" height="320"></canvas>
      </div>
    </div>

    <!-- P(r) MIDDLE -->
    <div class="panel" id="pr-panel">
      <div class="panel-header">
        <span class="main"><em>P(r)</em></span>
        <span class="sub">drop ASCII file here (r, P(r), [err])</span>
      </div>
      <div class="panel-body">
        <canvas id="pCanvas" width="580" height="320"></canvas>
      </div>
    </div>

    <!-- PDB RIGHT -->
    <div class="panel" id="pdb-panel">
      <div class="panel-header">
        <span class="main">PDB Viewer</span>
        <span class="sub">drop .pdb file (amino acids as spheres)</span>
      </div>
      <div class="panel-body">
        <div id="pdbCanvasContainer">
          <div id="pdb-drop-hint">
            <div><strong>Drop a .pdb file here</strong></div>
            <div style="margin-top:0.3rem;">(ATOM/HETATM; residues shown as cyan→magenta spheres)</div>
          </div>
        </div>
      </div>
      <div id="pdb-footer">
        Default: tries to load <code>3V03.pdb</code> from this folder.  
        Drag a different PDB to override.
      </div>
    </div>

  </div>

  <!-- three.js for the PDB viewer -->
  <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>

  <!-- SAXS P(r) + I(q) viewer logic -->
  <script type="module" src="js/pr_iq_viewer.js"></script>

  <!-- PDB viewer logic (amino acids as cyan→magenta spheres) -->
  <script type="module" src="js/pdb_viewer.js"></script>
</body>
</html>
EOF

echo "✏️  Rewriting js/pdb_viewer.js with autoload for 3V03.pdb …"
mkdir -p js
cat > js/pdb_viewer.js <<'EOF'
/**
 * Calyrai PDB viewer
 * - one sphere per residue (CA atom)
 * - colour gradient cyan -> magenta along sequence
 * - auto-tries to load "3V03.pdb" on startup
 * - drag & drop a .pdb onto the black area to replace it
 *
 * Requires THREE from a global <script src="...three.min.js"></script>.
 */

const container = document.getElementById("pdbCanvasContainer");
if (!container) {
  console.warn("pdb_viewer.js: #pdbCanvasContainer not found – viewer disabled.");
}

/* ------------------------------------------------------------------ */
/* THREE.js basic scene                                                */
/* ------------------------------------------------------------------ */
let renderer, scene, camera;
let spheresGroup = null;
let animReq = null;

if (container && window.THREE) {
  const width  = container.clientWidth || 400;
  const height = container.clientHeight || 300;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  const aspect = width / height;
  camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 2000);
  camera.position.set(0, 0, 120);

  const amb = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(amb);

  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(50, 80, 60);
  scene.add(dir);

  const back = new THREE.DirectionalLight(0x88aaff, 0.35);
  back.position.set(-40, -60, -50);
  scene.add(back);

  animate();
}

/* ------------------------------------------------------------------ */
/* Utility: resize                                                     */
/* ------------------------------------------------------------------ */
function onResize() {
  if (!container || !renderer || !camera) return;
  const w = container.clientWidth || 400;
  const h = container.clientHeight || 300;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);

/* ------------------------------------------------------------------ */
/* Parse PDB and create spheres                                        */
/* ------------------------------------------------------------------ */

function parseCAFromPDB(text) {
  const residues = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.length < 54) continue;
    const rec = line.slice(0, 6).trim();
    if (rec !== "ATOM" && rec !== "HETATM") continue;

    const atomName = line.slice(12, 16).trim();
    if (atomName !== "CA") continue; // one per residue

    const x = parseFloat(line.slice(30, 38));
    const y = parseFloat(line.slice(38, 46));
    const z = parseFloat(line.slice(46, 54));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    residues.push({ x, y, z });
  }
  return residues;
}

function buildSpheres(residues) {
  if (!scene || !THREE) return;
  if (spheresGroup) {
    scene.remove(spheresGroup);
    spheresGroup.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    spheresGroup = null;
  }

  spheresGroup = new THREE.Group();
  scene.add(spheresGroup);

  if (!residues.length) return;

  const n = residues.length;

  // centre coordinates
  let cx = 0, cy = 0, cz = 0;
  for (const r of residues) { cx += r.x; cy += r.y; cz += r.z; }
  cx /= n; cy /= n; cz /= n;

  const radius = 1.2;

  for (let i = 0; i < n; i++) {
    const { x, y, z } = residues[i];

    const t = n === 1 ? 0 : i / (n - 1); // 0..1 along chain
    // cyan (0,1,1) -> magenta (1,0,1)
    const rcol = t;
    const gcol = 1.0 - t;
    const bcol = 1.0;

    const color = new THREE.Color(rcol, gcol, bcol);
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: new THREE.Color(0x050505),
      shininess: 60
    });
    const geom = new THREE.SphereGeometry(radius, 24, 18);
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(x - cx, y - cy, z - cz);
    spheresGroup.add(mesh);
  }
}

/* ------------------------------------------------------------------ */
/* Load helpers                                                        */
/* ------------------------------------------------------------------ */

async function loadPDBFromUrl(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn("Could not load PDB:", url, resp.status);
      return;
    }
    const text = await resp.text();
    const residues = parseCAFromPDB(text);
    buildSpheres(residues);
    const hint = document.getElementById("pdb-drop-hint");
    if (hint) hint.style.display = "none";
  } catch (e) {
    console.error("Error loading PDB from URL:", e);
  }
}

function handlePDBText(text) {
  const residues = parseCAFromPDB(text);
  buildSpheres(residues);
  const hint = document.getElementById("pdb-drop-hint");
  if (hint) hint.style.display = "none";
}

/* ------------------------------------------------------------------ */
/* Drag & Drop                                                         */
/* ------------------------------------------------------------------ */
if (container) {
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  ["dragenter","dragover","dragleave","drop"].forEach(ev => {
    container.addEventListener(ev, prevent, false);
  });

  container.addEventListener("dragenter", () => {
    container.classList.add("dragover");
  });
  container.addEventListener("dragleave", () => {
    container.classList.remove("dragover");
  });
  container.addEventListener("drop", (e) => {
    container.classList.remove("dragover");
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const txt = String(evt.target.result || "");
      handlePDBText(txt);
    };
    reader.readAsText(file);
  });
}

/* ------------------------------------------------------------------ */
/* Animation loop                                                      */
/* ------------------------------------------------------------------ */

function animate() {
  if (!renderer || !scene || !camera) return;
  animReq = requestAnimationFrame(animate);

  if (spheresGroup) {
    // slow, simple rotation for a bit of life
    spheresGroup.rotation.y += 0.0025;
    spheresGroup.rotation.x += 0.0012;
  }

  renderer.render(scene, camera);
}

/* ------------------------------------------------------------------ */
/* Autoload default structure                                          */
/* ------------------------------------------------------------------ */
if (container && window.THREE) {
  // tries to fetch "3V03.pdb" from the same directory as index.html
  loadPDBFromUrl("3V03.pdb");
}
EOF

echo "✅ Done. Backups are in: $backup_dir"
echo "   Open index.html in your browser (or via: python3 -m http.server 8000)"
