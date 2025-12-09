// Earth globe for Calyr.ai — CONTINENTAL CONTOURS + DAY/NIGHT + STRIKE TRAFFIC
// - Camera orbit on drag (you rotate around the Earth)
// - NO textures, NO clouds, NO shader lights
// - Earth rendered as continent contour lines (from embedded GeoJSON)
//   • Day side: cyan
//   • Night side: magenta (approx. real time, UTC + axial tilt)
// - Invisible sphere for raycasting (so pin-placement still works)
// - Bright cyan line + spike marker on click, fading out
// - Traffic as cyan "strikes" (cylinders) from surface outward: pulsing + fade
// - Auto-rotation, stops on interaction, resumes after idle
// - Strike history exposed via CalyrGlobe API
//
// NOTE: This file no longer manipulates .hero-content at all.
//       The hero visibility is handled purely by nav_autohide.js + CSS.

(function () {
  const canvas = document.getElementById("globe-canvas");
  if (!canvas) return; // only run on landing page

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const R = 1.4; // Earth radius

  // ---- Camera orbit parameters ----
  let camRadius = 3.4;
  let camTheta = 0.0; // vertical angle
  let camPhi = 0.0;   // horizontal angle

  function updateCamera() {
    const x = camRadius * Math.cos(camTheta) * Math.cos(camPhi);
    const y = camRadius * Math.sin(camTheta);
    const z = camRadius * Math.cos(camTheta) * Math.sin(camPhi);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }

  updateCamera();

  // Main globe group
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Raycaster for click-pin placement
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let earthMesh = null;

  // Pin meshes
  let pinMesh = null;
  let innerMatRef = null;
  let spikeMatRef = null;
  let pinFadeStart = null; // timestamp

  // Traffic strikes
  const accessStrikes = []; // { mesh, t0, lifetime }

  // Strike history
  const strikeHistory = []; // { lat, lon, weight, createdAt, dot }
  const historyDots = [];   // list of dot meshes

  // Continent lines
  const continentLines = []; // { line, centroid }

  // Materials: day (cyan) & night (magenta)
  const dayMat = new THREE.LineBasicMaterial({
    color: 0x00eaff,
    linewidth: 1,
  });

  const nightMat = new THREE.LineBasicMaterial({
    color: 0xff3cff,
    linewidth: 1,
  });

  // ---- Drag / Auto-Rotation control ----
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  const orbitSpeed = 0.005;

  const autoRot = 0.0003;
  let autoRotActive = true;
  let lastInteraction = performance.now();
  const idleDelay = 8000; // ms

  function updateInteraction() {
    lastInteraction = performance.now();
    autoRotActive = false;
  }

  function onPointerDown(event) {
    isDragging = true;
    const e = event.touches ? event.touches[0] : event;
    lastX = e.clientX;
    lastY = e.clientY;

    updateInteraction();
    placePin(e.clientX, e.clientY);
  }

  function onPointerMove(event) {
    if (!isDragging) return;

    const e = event.touches ? event.touches[0] : event;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    lastX = e.clientX;
    lastY = e.clientY;

    camPhi -= dx * orbitSpeed;
    camTheta += dy * orbitSpeed;

    const maxTilt = Math.PI / 2 - 0.1;
    camTheta = Math.max(-maxTilt, Math.min(maxTilt, camTheta));

    updateCamera();
    updateInteraction();
  }

  function onPointerUp() {
    isDragging = false;
    updateInteraction();
  }

  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);

  canvas.addEventListener("touchstart", onPointerDown, { passive: true });
  canvas.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("touchend", onPointerUp);

  // ---------- Helper: lat/lon → 3D point ----------
  function latLonToVector3(latDeg, lonDeg, radius) {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;

    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    return new THREE.Vector3(x, y, z);
  }

  // ---------- Click pin ----------
  function placePin(screenX, screenY) {
    if (!earthMesh) return;

    pointer.x = (screenX / window.innerWidth) * 2 - 1;
    pointer.y = -(screenY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(earthMesh);

    if (hits.length === 0) return;

    const hitPoint = hits[0].point.clone();

    if (pinMesh) {
      globeGroup.remove(pinMesh);
      pinMesh = null;
    }

    pinMesh = new THREE.Group();

    const innerLength = hitPoint.length();
    const innerRadius = 0.001;
    const startFactor = 0.4;

    const innerGeom = new THREE.CylinderGeometry(
      innerRadius,
      innerRadius,
      innerLength * (1 - startFactor),
      8
    );

    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 1.0,
    });

    const innerLine = new THREE.Mesh(innerGeom, innerMat);

    const outwardDir = hitPoint.clone().normalize();

    const startPos = outwardDir.clone().multiplyScalar(R * startFactor);
    const endPos = hitPoint.clone();
    const midPos = startPos.clone().add(endPos).multiplyScalar(0.5);

    innerLine.position.copy(midPos);
    innerLine.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      outwardDir
    );
    pinMesh.add(innerLine);

    const spikeHeight = 0.25;
    const spikeRadius = 0.004;

    const spikeGeom = new THREE.CylinderGeometry(
      spikeRadius,
      spikeRadius,
      spikeHeight,
      8
    );

    const spikeMat = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 1.0,
    });

    const spike = new THREE.Mesh(spikeGeom, spikeMat);
    spike.position.copy(
      outwardDir.clone().multiplyScalar(R + spikeHeight / 2)
    );
    spike.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      outwardDir
    );
    pinMesh.add(spike);

    globeGroup.add(pinMesh);

    innerMatRef = innerMat;
    spikeMatRef = spikeMat;
    pinFadeStart = performance.now();
  }

  // ---------- Access strikes ----------
  const strikeGeom = new THREE.CylinderGeometry(0.004, 0.004, 1.0, 8);

  function addAccessStrike(lat, lon, weight = 1) {
    const outward = latLonToVector3(lat, lon, 1.0).normalize();

    const baseHeight = 0.25;
    const extra = 0.15 * Math.log10(1 + weight);
    const strikeHeight = baseHeight + extra;

    const mat = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 1.0,
    });

    const strike = new THREE.Mesh(strikeGeom, mat);
    strike.scale.set(1, strikeHeight, 1);

    const pos = outward.clone().multiplyScalar(R + strikeHeight * 0.5);
    strike.position.copy(pos);

    strike.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      outward
    );

    globeGroup.add(strike);

    accessStrikes.push({
      mesh: strike,
      t0: performance.now(),
      lifetime: 4000 + Math.random() * 2000,
    });

    const dotGeom = new THREE.SphereGeometry(0.015, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 0.0,
    });
    const dot = new THREE.Mesh(dotGeom, dotMat);
    dot.position.copy(latLonToVector3(lat, lon, R + 0.02));
    globeGroup.add(dot);

    strikeHistory.push({
      lat,
      lon,
      weight,
      createdAt: Date.now(),
      dot,
    });
    historyDots.push(dot);
  }

  // ---------- Sun direction ----------
  function computeSunDirection() {
    const now = new Date();

    const utcHours =
      now.getUTCHours() +
      now.getUTCMinutes() / 60 +
      now.getUTCSeconds() / 3600;

    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const dayOfYear =
      Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1;

    const gamma =
      (2.0 * Math.PI * (dayOfYear - 1 + (utcHours - 12) / 24.0)) / 365.0;

    const decl =
      0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2.0 * gamma) +
      0.000907 * Math.sin(2.0 * gamma) -
      0.002697 * Math.cos(3.0 * gamma) +
      0.00148 * Math.sin(3.0 * gamma);

    const lonDeg = 15 * (utcHours - 12);
    const lonRad = (lonDeg * Math.PI) / 180.0;

    const cosLat = Math.cos(decl);
    const sinLat = Math.sin(decl);
    const cosLon = Math.cos(lonRad);
    const sinLon = Math.sin(lonRad);

    const sunDir = new THREE.Vector3(
      cosLat * cosLon,
      sinLat,
      cosLat * sinLon
    ).normalize();

    return sunDir;
  }

  // ---------- Recolor continents ----------
  function updateDayNightOnContours() {
    if (continentLines.length === 0) return;

    const sunDir = computeSunDirection();

    for (const entry of continentLines) {
      const n = entry.centroid.clone().normalize();
      const ndl = n.dot(sunDir);
      entry.line.material = ndl >= 0 ? dayMat : nightMat;
    }
  }

  // ---------- Load continents + invisible sphere ----------
  function loadContinents() {
    const sphereGeom = new THREE.SphereGeometry(R, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      depthTest: true,
      visible: true,
    });
    earthMesh = new THREE.Mesh(sphereGeom, sphereMat);
    globeGroup.add(earthMesh);

    if (typeof continentsGeoJSON === "undefined") {
      console.warn(
        "continentsGeoJSON is not defined. Did you include land_unified.js before this script?"
      );
      return;
    }

    const data = continentsGeoJSON;
    const features = data.features || [];
    for (const feat of features) {
      const geom = feat.geometry;
      if (!geom) continue;

      if (geom.type === "Polygon") {
        addLines(geom.coordinates);
      } else if (geom.type === "MultiPolygon") {
        for (const poly of geom.coordinates) {
          addLines(poly);
        }
      }
    }
  }

  function addLines(rings) {
    for (const ring of rings) {
      const pts = ring.map(([lon, lat]) =>
        latLonToVector3(lat, lon, R)
      );
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.LineLoop(geom, dayMat);
      globeGroup.add(line);

      const centroid = new THREE.Vector3(0, 0, 0);
      for (const p of pts) centroid.add(p);
      centroid.multiplyScalar(1 / pts.length);

      continentLines.push({ line, centroid });
    }
  }

  // ---------- Animation ----------
  function startAnimation() {
    function animate() {
      requestAnimationFrame(animate);

      const now = performance.now();

      if (autoRotActive && !isDragging) {
        globeGroup.rotation.y += autoRot;
      }

      if (!autoRotActive && !isDragging && now - lastInteraction > idleDelay) {
        autoRotActive = true;
      }

      updateDayNightOnContours();

      if (pinFadeStart !== null && (innerMatRef || spikeMatRef)) {
        const elapsed = now - pinFadeStart;
        const duration = 10000;
        const t = Math.min(elapsed / duration, 1.0);
        const opacity = 1.0 - t;

        if (innerMatRef) innerMatRef.opacity = opacity;
        if (spikeMatRef) spikeMatRef.opacity = opacity;

        if (t >= 1.0) {
          if (pinMesh) {
            globeGroup.remove(pinMesh);
            pinMesh = null;
          }
          innerMatRef = null;
          spikeMatRef = null;
          pinFadeStart = null;
        }
      }

      for (let i = accessStrikes.length - 1; i >= 0; i--) {
        const strike = accessStrikes[i];
        const dt = now - strike.t0;
        const life = strike.lifetime;

        if (dt > life) {
          globeGroup.remove(strike.mesh);
          accessStrikes.splice(i, 1);
          continue;
        }

        const norm = dt / life;
        const pulse = 0.5 + 0.5 * Math.sin(norm * 2 * Math.PI * 3);
        const scaleFactor = 0.8 + 0.4 * pulse;
        strike.mesh.scale.x = scaleFactor;
        strike.mesh.scale.z = scaleFactor;

        const fade = 1.0 - norm;
        strike.mesh.material.opacity = 0.2 + 0.8 * fade;
      }

      const showingHistory = !autoRotActive && !isDragging;
      for (const dot of historyDots) {
        dot.material.opacity = showingHistory ? 0.6 : 0.0;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  loadContinents();
  startAnimation();

  // Expose API
  window.CalyrGlobe = {
    addAccessStrike,
    getStrikeHistory: () => strikeHistory.slice(),
  };

  // Simulated traffic
  (function simulateTraffic() {
    function randomLat() {
      return -85 + Math.random() * 170;
    }
    function randomLon() {
      return -180 + Math.random() * 360;
    }
    function randomWeight() {
      return 1 + Math.floor(Math.random() * 100);
    }
    function spawnHit() {
      if (window.CalyrGlobe && window.CalyrGlobe.addAccessStrike) {
        const lat = randomLat();
        const lon = randomLon();
        const w = randomWeight();
        window.CalyrGlobe.addAccessStrike(lat, lon, w);
      }
      const nextInMs = 2000 + Math.random() * 3000;
      setTimeout(spawnHit, nextInMs);
    }
    spawnHit();
  })();

  // =========================================================
  // Atlantis Unlock Logic – retains globeGroup and button logic
  // =========================================================
  (function () {
    const btn = document.getElementById("uncover-btn");
    if (!btn) return;

    const TARGET_Y = Math.PI * 0.45;
    const TOLERANCE = 0.35;

    let unlocked = false;

    function normAngle(a) {
      const TWO_PI = Math.PI * 2;
      a = a % TWO_PI;
      if (a < 0) a += TWO_PI;
      return a;
    }

    function checkAtlantis() {
      const TWO_PI = Math.PI * 2;
      const ry = normAngle(globeGroup.rotation.y);

      let diff = Math.abs(ry - TARGET_Y);
      diff = Math.min(diff, Math.abs(diff - TWO_PI));

      const proximity = Math.max(
        0,
        1 - diff / (TOLERANCE * 1.5)
      );

      let rings = document.getElementById("atlantis-rings");
      if (!rings) {
        rings = document.createElement("div");
        rings.id = "atlantis-rings";

        for (let i = 0; i < 3; i++) {
          const r = document.createElement("div");
          r.className = "atlantis-ring";
          rings.appendChild(r);
        }
        document.body.appendChild(rings);
      }

      if (proximity > 0.05 && !unlocked) {
        rings.classList.add("visible");
        rings.style.setProperty("--atl-proximity", proximity.toFixed(2));
      } else if (!unlocked) {
        rings.classList.remove("visible");
      }

      if (!unlocked && diff < TOLERANCE) {
        unlocked = true;
        btn.classList.add("unlocked");
        rings.classList.add("unlocked");
      }

      requestAnimationFrame(checkAtlantis);
    }

    requestAnimationFrame(checkAtlantis);
  })();
})();