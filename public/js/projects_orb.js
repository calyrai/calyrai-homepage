// js/projects_orb.js
// Rotating orb with neon-glow tiles; text appears under "Projects" on hover.
// Project data are loaded from data/projects.json (with inline fallback).

(function () {

  const canvas = document.getElementById("projects-orb-canvas");
  const headerDetail = document.getElementById("project-header-detail");

  if (!canvas || typeof THREE === "undefined") {
    console.error("projects_orb.js: Canvas or THREE.js not available.");
    return;
  }

  // --------------------------
  // FALLBACK DATA (falls JSON nicht geladen werden kann)
  // --------------------------
  const fallbackProjects = [
    {
      id: "saxs",
      title: "SAXS – Multi-State Structural Analysis",
      subtitle: "Pair-distance distributions, free-energy modes and browser-scale analysis.",
      text: [
        "Scattering-based reconstruction of pair-distance distributions and state mixtures.",
        "Goal: SAXS as a mode-based sensor with web-native orthogonal projections."
      ],
      color: "#24f3ff"
    },
    {
      id: "pca",
      title: "PCA & Free-Energy Modes",
      subtitle: "Principal components as perturbations of G(λ).",
      text: [
        "PCA modes mapped to θ(G), integrals and cooperative transitions.",
        "Used for melting curves, ITC/SPR and multi-signal experiments."
      ],
      color: "#ff4df5"
    },
    {
      id: "vaults",
      title: "Vaults – Mail & Calendar Organiser",
      subtitle: "MailVault / CalVault as scientific context engine.",
      text: [
        "YAML vaults that turn communication into structured experimental trace.",
        "Bridges inboxes, meetings and scientific interpretation."
      ],
      color: "#ffd75a"
    },
    {
      id: "chrom",
      title: "Chromatography & Wavelets",
      subtitle: "Mode-based interpretation of LC–MS and chromatography.",
      text: [
        "Thinks about chromatographic peaks as mode superpositions.",
        "Extends SAXS/PCA logic to separation science."
      ],
      color: "#9fff8b"
    }
  ];

  // Palette für Projekte ohne eigenes color-Feld
  const fallbackColors = ["#24f3ff", "#ff4df5", "#ffd75a", "#9fff8b"];

  // --------------------------
  // TEXT RENDERING
  // --------------------------
  function renderDefaultHeader() {
    if (!headerDetail) return;
    headerDetail.innerHTML = `
      <article class="project-header-card default-info">
        <p>
          Each project is a mode in the Calyr.ai stack — combining
          signals, models and interfaces into a coherent experimental storyline.
        </p>
        <p class="hint">Hover a glowing tile.</p>
      </article>
    `;
  }

  function renderProject(project) {
    if (!headerDetail) return;
    const t = (project.text || []).map(p => `<p>${p}</p>`).join("");
    headerDetail.innerHTML = `
      <article class="project-header-card">
        <h3>${project.title}</h3>
        <p class="project-header-subtitle">${project.subtitle || ""}</p>
        ${t}
      </article>
    `;
  }

  renderDefaultHeader();

  // --------------------------
  // PROJECT JSON LOADER
  // --------------------------
  async function loadProjects() {
    try {
      const resp = await fetch("data/projects.json", { cache: "no-cache" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("projects_orb.js: using fallbackProjects because JSON load failed:", err);
    }
    return fallbackProjects;
  }

  // --------------------------
  // MAIN INIT
  // --------------------------
  loadProjects().then((projects) => {
    initOrb(projects);
  });

  function initOrb(projects) {

    // --------------------------
    // THREE.JS SETUP
    // --------------------------
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      40,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    window.addEventListener("resize", () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    });

    // --------------------------
    // ORB + SUPER-NEON TILES
    // --------------------------
    const orb = new THREE.Group();
    scene.add(orb);

    const geom = new THREE.PlaneGeometry(1.6, 1.0);
    const tiles = [];
    const radius = 3.2;

    projects.forEach((p, i) => {
      const angle = (i / projects.length) * Math.PI * 2;

      const mesh = new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({
          opacity: 0,
          transparent: true,
          side: THREE.DoubleSide
        })
      );

      // Kreisbahn
      mesh.position.set(
        radius * Math.cos(angle),
        0.2 * Math.sin(angle * 2),
        radius * Math.sin(angle)
      );
      mesh.lookAt(new THREE.Vector3(0, 0, 0));

      const colorHex = p.color || fallbackColors[i % fallbackColors.length];

      // ✨ DEFAULT NEON GLOW ✨
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geom),
        new THREE.LineBasicMaterial({
          color: new THREE.Color(colorHex),
          opacity: 0.85,          // gut sichtbar
          transparent: true,
          linewidth: 4,           // „dickere“ Linie
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );

      mesh.add(edges);
      mesh.userData.project = p;
      mesh.userData.edges = edges;
      mesh.userData.baseColor = new THREE.Color(colorHex);

      orb.add(mesh);
      tiles.push(mesh);
    });

    // --------------------------
    // DRAG ROTATION (langsam)
    // --------------------------
    let dragging = false;
    let px = 0;
    let py = 0;

    canvas.addEventListener("mousedown", (e) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      orb.rotation.y += (e.clientX - px) * 0.003; // bewusst langsam
      orb.rotation.x += (e.clientY - py) * 0.003;
      px = e.clientX;
      py = e.clientY;
    });

    // --------------------------
    // RAYCASTING FOR HOVER
    // --------------------------
    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(tiles, true);

      // Reset: stark, aber nicht maximal
      tiles.forEach((t) => {
        t.userData.edges.material.opacity = 0.85;
        t.userData.edges.material.color.copy(t.userData.baseColor);
      });

      if (hit.length > 0) {
        // die eigentliche Tile ist der Parent der Edges
        const tile = hit[0].object.parent;
        const proj = tile.userData.project;

        // ✨ MAXIMUM GLOW beim Hover ✨
        tile.userData.edges.material.color
          .copy(tile.userData.baseColor)
          .offsetHSL(0, 0.55, 0.35); // mehr Sättigung + Helligkeit
        tile.userData.edges.material.opacity = 1.0;

        renderProject(proj);
        return;
      }

      // nichts getroffen → default Text
      renderDefaultHeader();
    });

    // --------------------------
    // ANIMATION LOOP
    // --------------------------
    function animate() {
      requestAnimationFrame(animate);
      if (!dragging) {
        // sehr langsame Eigenrotation
        orb.rotation.y += 0.00125;
      }
      renderer.render(scene, camera);
    }

    animate();
  }

})();