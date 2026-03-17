/**
 * Calyrai PDB viewer
 * - one sphere per residue (CA atom)
 * - colour gradient cyan -> magenta along sequence
 * - auto-tries to load "3V03.pdb" on startup
 * - drag & drop a .pdb onto the black area to replace it
 * - interactive: mouse drag = rotate, wheel = zoom
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

// interaction state
let isDragging = false;
let lastX = 0;
let lastY = 0;

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

  setupMouseInteraction();
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

    // 0..1 along sequence
    const t = n === 1 ? 0 : i / (n - 1);
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

  container.addEventListener("drop", (e) => {
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
/* Mouse interaction: rotate + zoom                                    */
/* ------------------------------------------------------------------ */
function setupMouseInteraction() {
  if (!container) return;

  container.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging || !spheresGroup) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    // simple trackball-like rotation
    const rotSpeed = 0.01;
    spheresGroup.rotation.y += dx * rotSpeed;
    spheresGroup.rotation.x += dy * rotSpeed;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Zoom with mouse wheel
  container.addEventListener("wheel", (e) => {
    if (!camera) return;
    e.preventDefault();
    const delta = e.deltaY; // positive = scroll down
    let z = camera.position.z + delta * 0.05;
    z = Math.max(30, Math.min(300, z));  // clamp
    camera.position.z = z;
  }, { passive: false });
}

/* ------------------------------------------------------------------ */
/* Animation loop                                                      */
/* ------------------------------------------------------------------ */

function animate() {
  if (!renderer || !scene || !camera) return;
  animReq = requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

/* ------------------------------------------------------------------ */
/* Autoload default structure                                          */
/* ------------------------------------------------------------------ */
if (container && window.THREE) {
  // tries to fetch "3V03.pdb" from the same directory as index.html
  loadPDBFromUrl("3V03.pdb");
}