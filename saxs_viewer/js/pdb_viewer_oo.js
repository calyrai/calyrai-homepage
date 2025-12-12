// js/pdb_viewer.js
// Calyrai PDB Viewer: one sphere per residue (cyan → magenta),
// two domains wiggle, and P(r) is computed and sent to the SAXS viewer.

import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";

// ------------------------------------------------------------
// Basic Three.js setup
// ------------------------------------------------------------
const container = document.getElementById("viewer");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// soft ambient + slight directional
scene.add(new THREE.AmbientLight(0x404040, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(1, 1, 1);
scene.add(dir);

// ------------------------------------------------------------
// PDB parsing + amino acid spheres
// ------------------------------------------------------------

/**
 * Very simple PDB parser:
 * - takes ATOM/HETATM records
 * - groups by residue (chain + resSeq)
 * - uses Cα if present, else average of all atoms in residue
 */
function parsePDB(text) {
  const lines = text.split(/\r?\n/);
  const residues = new Map(); // key: chain-resSeq, value: {atoms:[], name, chain, resSeq}

  for (const line of lines) {
    if (!/^ATOM|^HETATM/.test(line)) continue;
    const name = line.slice(12, 16).trim();
    const resName = line.slice(17, 20).trim();
    const chainID = line.slice(21, 22).trim() || " ";
    const resSeq = parseInt(line.slice(22, 26), 10);

    const x = parseFloat(line.slice(30, 38));
    const y = parseFloat(line.slice(38, 46));
    const z = parseFloat(line.slice(46, 54));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    const key = `${chainID}:${resSeq}`;
    if (!residues.has(key)) {
      residues.set(key, {
        chain: chainID,
        resSeq,
        resName,
        atoms: [],
        ca: null
      });
    }
    const res = residues.get(key);
    const atom = { name, x, y, z };
    res.atoms.push(atom);
    if (name === "CA") {
      res.ca = atom;
    }
  }

  // Create residue coordinate list using CA if available, otherwise centroid
  const out = [];
  for (const [key, res] of residues.entries()) {
    let coord;
    if (res.ca) {
      coord = res.ca;
    } else if (res.atoms.length > 0) {
      let sx = 0, sy = 0, sz = 0;
      for (const a of res.atoms) {
        sx += a.x; sy += a.y; sz += a.z;
      }
      const n = res.atoms.length;
      coord = { x: sx / n, y: sy / n, z: sz / n };
    } else {
      continue;
    }
    out.push({
      chain: res.chain,
      resSeq: res.resSeq,
      resName: res.resName,
      x: coord.x,
      y: coord.y,
      z: coord.z
    });
  }

  // sort by chain + resSeq
  out.sort((a, b) => {
    if (a.chain < b.chain) return -1;
    if (a.chain > b.chain) return 1;
    return a.resSeq - b.resSeq;
  });

  return out;
}

/**
 * Map index [0..N-1] -> color gradient cyan (#00FFFF) -> magenta (#FF00FF)
 */
function colorForIndex(i, N) {
  if (N <= 1) {
    return new THREE.Color(0x00ffff);
  }
  const t = i / (N - 1); // 0..1
  const r = t;          // 0 -> 1
  const g = 1 - t;      // 1 -> 0
  const b = 1;          // always 1
  const col = new THREE.Color();
  col.setRGB(r, g, b);
  return col;
}

// Storage for spheres + base positions
let residueSpheres = [];  // [{mesh, basePos:THREE.Vector3, domain}]
let animTime = 0;

// ------------------------------------------------------------
// P(r) computation from residue positions
// ------------------------------------------------------------
function computePrFromResidues(resList, binWidth = 0.5, rMax = 200.0) {
  const N = resList.length;
  if (N < 2) {
    return { r: [], P: [] };
  }

  const nBins = Math.floor(rMax / binWidth);
  const bins = new Array(nBins).fill(0);

  for (let i = 0; i < N; i++) {
    const xi = resList[i].x;
    const yi = resList[i].y;
    const zi = resList[i].z;
    for (let j = i + 1; j < N; j++) {
      const dx = xi - resList[j].x;
      const dy = yi - resList[j].y;
      const dz = zi - resList[j].z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d <= 0 || d >= rMax) continue;
      const idx = Math.floor(d / binWidth);
      if (idx >= 0 && idx < nBins) {
        bins[idx] += 1;
      }
    }
  }

  // convert to r-centers + normalised counts
  const rArr = [];
  const PArr = [];
  let sum = 0;
  for (let k = 0; k < nBins; k++) {
    sum += bins[k];
  }
  const norm = sum > 0 ? 1.0 / sum : 1.0;
  for (let k = 0; k < nBins; k++) {
    rArr.push((k + 0.5) * binWidth);
    PArr.push(bins[k] * norm);
  }

  return { r: rArr, P: PArr };
}

function sendPrToSaxsViewer(resList) {
  const { r, P } = computePrFromResidues(resList, 0.5, 200.0);
  if (window.updatePrFromPDB && typeof window.updatePrFromPDB === "function") {
    window.updatePrFromPDB({ r, P });
  } else {
    console.log("P(r) from PDB:", { r, P });
  }
}

// ------------------------------------------------------------
// Build residue spheres + domains and animate
// ------------------------------------------------------------
function buildResidueSpheres(residues) {
  // clear existing
  for (const item of residueSpheres) {
    scene.remove(item.mesh);
  }
  residueSpheres = [];

  if (!residues.length) return;

  // recenter coordinates around origin
  let cx = 0, cy = 0, cz = 0;
  for (const r of residues) {
    cx += r.x;
    cy += r.y;
    cz += r.z;
  }
  const invN = 1.0 / residues.length;
  cx *= invN; cy *= invN; cz *= invN;

  // define two domains: first half, second half
  const mid = Math.floor(residues.length / 2);

  const sphereGeo = new THREE.SphereGeometry(0.7, 16, 16);

  residues.forEach((res, i) => {
    const color = colorForIndex(i, residues.length);
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: color.clone().multiplyScalar(0.4),
      shininess: 50
    });
    const mesh = new THREE.Mesh(sphereGeo, mat);

    const basePos = new THREE.Vector3(
      res.x - cx,
      res.y - cy,
      res.z - cz
    );
    mesh.position.copy(basePos);

    const domain = (i < mid) ? 0 : 1;
    residueSpheres.push({ mesh, basePos, domain });
    scene.add(mesh);
  });

  // once we have residues, compute and send P(r)
  sendPrToSaxsViewer(residues);
}

// ------------------------------------------------------------
// Drag & drop PDB handling
// ------------------------------------------------------------
const dropzone = document.getElementById("dropzone");

function setDropHighlight(on) {
  if (!dropzone) return;
  if (on) dropzone.classList.add("dragover");
  else dropzone.classList.remove("dragover");
}

["dragenter", "dragover"].forEach(ev => {
  window.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropHighlight(true);
  });
});

["dragleave", "drop"].forEach(ev => {
  window.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropHighlight(false);
  });
});

window.addEventListener("drop", (e) => {
  const dt = e.dataTransfer;
  if (!dt || !dt.files || !dt.files.length) return;
  const file = dt.files[0];
  if (!file.name.toLowerCase().endsWith(".pdb")) {
    console.warn("Not a .pdb file:", file.name);
  }
  const reader = new FileReader();
  reader.onload = (evt) => {
    const text = String(evt.target.result || "");
    const residues = parsePDB(text);
    buildResidueSpheres(residues);
  };
  reader.readAsText(file);
});

// ------------------------------------------------------------
// Animate: two domains wiggle as a bow
// ------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);
  animTime += 0.016; // ~60fps

  const amp = 3.0;      // amplitude
  const freq = 0.6;     // frequency
  const phase = 1.5;    // phase shift between domains

  for (const item of residueSpheres) {
    const { mesh, basePos, domain } = item;

    // two domains move in opposite "bow-like" fashion
    const t = animTime * freq + (domain === 0 ? 0 : phase);

    // simple smooth wiggle: shift mostly along x, a bit in y,z
    const dx = amp * Math.sin(t) * (domain === 0 ? 1 : -1);
    const dy = 0.4 * amp * Math.sin(t * 0.7);
    const dz = 0.4 * amp * Math.cos(t * 0.9);

    mesh.position.set(
      basePos.x + dx,
      basePos.y + dy,
      basePos.z + dz
    );
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ------------------------------------------------------------
// Handle resize
// ------------------------------------------------------------
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});