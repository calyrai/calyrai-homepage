// pdb_viewer.js
// Minimal Calyrai-style PDB viewer:
// - drag & drop .pdb
// - one sphere per residue
// - colour along sequence from cyan → magenta

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

// ----------------------------------------------------------
// DOM references
// ----------------------------------------------------------
const viewerDiv = document.getElementById("viewer");
const dropzone  = document.getElementById("dropzone");

// ----------------------------------------------------------
// Three.js scene setup
// ----------------------------------------------------------
const scene    = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45,
  viewerDiv.clientWidth / viewerDiv.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(viewerDiv.clientWidth, viewerDiv.clientHeight);
viewerDiv.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// lights
const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
light1.position.set(1, 1, 1);
scene.add(light1);

const light2 = new THREE.AmbientLight(0x404040, 0.8);
scene.add(light2);

// group holding all residue spheres
const structureGroup = new THREE.Group();
scene.add(structureGroup);

// ----------------------------------------------------------
// PDB parsing → residue centroids
// ----------------------------------------------------------
function parsePDBToResidueCentroids(pdbText) {
  // Map key: `${chainID}:${resSeq}` → { sumX, sumY, sumZ, count }
  const residueMap = new Map();

  const lines = pdbText.split(/\r?\n/);
  for (const line of lines) {
    if (!(line.startsWith("ATOM  ") || line.startsWith("HETATM"))) continue;
    if (line.length < 54) continue;

    const xStr = line.slice(30, 38);
    const yStr = line.slice(38, 46);
    const zStr = line.slice(46, 54);
    const chainID = line.slice(21, 22).trim() || "A";
    const resSeq  = line.slice(22, 26).trim();
    const resName = line.slice(17, 20).trim();

    const x = parseFloat(xStr);
    const y = parseFloat(yStr);
    const z = parseFloat(zStr);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    const key = `${chainID}:${resSeq}`;
    let entry = residueMap.get(key);
    if (!entry) {
      entry = { chainID, resSeq, resName, sumX: 0, sumY: 0, sumZ: 0, count: 0 };
      residueMap.set(key, entry);
    }
    entry.sumX += x;
    entry.sumY += y;
    entry.sumZ += z;
    entry.count += 1;
  }

  // convert to array of centroids, sorted along sequence
  const residues = Array.from(residueMap.values());
  residues.sort((a, b) => {
    if (a.chainID < b.chainID) return -1;
    if (a.chainID > b.chainID) return  1;
    const ai = parseInt(a.resSeq, 10);
    const bi = parseInt(b.resSeq, 10);
    return ai - bi;
  });

  return residues.map(r => ({
    chainID: r.chainID,
    resSeq:  r.resSeq,
    resName: r.resName,
    x: r.sumX / r.count,
    y: r.sumY / r.count,
    z: r.sumZ / r.count
  }));
}

// ----------------------------------------------------------
// Build spheres from residue centroids
// ----------------------------------------------------------
function clearStructure() {
  while (structureGroup.children.length > 0) {
    const obj = structureGroup.children.pop();
    obj.geometry?.dispose?.();
    obj.material?.dispose?.();
  }
}

function colourFromSequenceIndex(i, n) {
  if (n <= 1) return new THREE.Color(0x00ffff);
  const t = i / (n - 1); // 0 → 1
  // simple lerp: cyan (0,1,1) → magenta (1,0,1)
  const r = t;
  const g = 1 - t;
  const b = 1;
  return new THREE.Color(r, g, b);
}

function buildResidueSpheres(residues) {
  clearStructure();

  if (!residues.length) return;

  const n = residues.length;

  // compute bounding box to center & scale
  const box = new THREE.Box3();
  for (const r of residues) {
    box.expandByPoint(new THREE.Vector3(r.x, r.y, r.z));
  }
  const center = new THREE.Vector3();
  box.getCenter(center);

  const sizeVec = new THREE.Vector3();
  box.getSize(sizeVec);
  const maxExtent = Math.max(sizeVec.x, sizeVec.y, sizeVec.z, 1e-6);
  const scale = 60 / maxExtent; // arbitrary scale factor for nicer view

  // sphere geometry (reused)
  const baseGeom = new THREE.SphereGeometry(1.2, 24, 24);

  residues.forEach((r, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: colourFromSequenceIndex(i, n),
      emissive: 0x000000,
      metalness: 0.0,
      roughness: 0.3
    });
    const sphere = new THREE.Mesh(baseGeom, mat);
    sphere.position.set(
      (r.x - center.x) * scale,
      (r.y - center.y) * scale,
      (r.z - center.z) * scale
    );
    sphere.userData = {
      chainID: r.chainID,
      resSeq:  r.resSeq,
      resName: r.resName
    };
    structureGroup.add(sphere);
  });

  // reposition camera a bit
  controls.target.set(0, 0, 0);
  camera.position.set(0, 0, 120);
  controls.update();
}

// ----------------------------------------------------------
// Drag & Drop handling
// ----------------------------------------------------------
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover", "dragleave", "drop"].forEach(ev => {
  dropzone.addEventListener(ev, preventDefaults, false);
  viewerDiv.addEventListener(ev, preventDefaults, false);
});

["dragenter", "dragover"].forEach(ev => {
  dropzone.addEventListener(ev, () => dropzone.classList.add("dragover"), false);
});

["dragleave", "drop"].forEach(ev => {
  dropzone.addEventListener(ev, () => dropzone.classList.remove("dragover"), false);
});

dropzone.addEventListener("drop", handleDrop, false);
viewerDiv.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  if (!dt || !dt.files || !dt.files.length) return;
  const file = dt.files[0];
  if (!file.name.toLowerCase().endsWith(".pdb")) {
    alert("Please drop a .pdb file.");
    return;
  }
  const reader = new FileReader();
  reader.onload = evt => {
    const text = String(evt.target?.result || "");
    const residues = parsePDBToResidueCentroids(text);
    buildResidueSpheres(residues);
  };
  reader.readAsText(file);
}

// ----------------------------------------------------------
// Resize handling
// ----------------------------------------------------------
function onWindowResize() {
  const w = viewerDiv.clientWidth;
  const h = viewerDiv.clientHeight || 1;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", onWindowResize);

// ----------------------------------------------------------
// Render loop
// ----------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
onWindowResize();
animate();
