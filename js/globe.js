// Earth globe for Calyr.ai — CONTINENTAL CONTOURS + DAY/NIGHT + STRIKE TRAFFIC
// - Camera orbit on drag (you rotate around the Earth)
// - NO textures, NO clouds, NO shader lights
// - Earth rendered as continent contour lines (from embedded GeoJSON)
//   • Day side: cyan
//   • Night side: magenta (approx. real time, UTC + axial tilt)
// - Invisible sphere for raycasting (so pin-placement still works)
// - Bright cyan line + spike marker on click, fading out
// - Traffic as CYAN "access strikes" (cylinders) from surface outward: pulsing + fade
// - Persistent visitor dots: tiny YELLOW points on the surface (loaded from /api/visitors)
// - Auto-rotation, stops on interaction, resumes after idle
// - Strike history exposed via CalyrGlobe API
// - Visible "sun" marker (cyan) that moves with the day/night direction
//
// NOTE: This file does not manipulate .hero-content.
//       The hero visibility is handled purely by your CSS + nav scripts.

(function () {
  const canvas = document.getElementById("globe-canvas");
  if (!canvas) return; // only run on landing page

  // ---------------------------------------------------------
  // Dependency fallback (mobile networks sometimes block unpkg)
  // If deps are missing, load a fallback and reload once.
  // ---------------------------------------------------------
  try {
    const w = window;

    if (typeof w.THREE === "undefined") {
      const key = "calyr_three_fallback_loaded";
      if (!w.sessionStorage.getItem(key)) {
        w.sessionStorage.setItem(key, "1");
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
        s.defer = true;
        s.onload = () => w.location.reload();
        document.head.appendChild(s);
      }
      return;
    }

    if (typeof w.continentsGeoJSON === "undefined" && typeof continentsGeoJSON === "undefined") {
      const key = "calyr_land_fallback_loaded";
      if (!w.sessionStorage.getItem(key)) {
        w.sessionStorage.setItem(key, "1");
        const s = document.createElement("script");
        s.src = "data/land_unified.js?v=20260313";
        s.defer = true;
        s.onload = () => w.location.reload();
        document.head.appendChild(s);
      }
      return;
    }
  } catch {
    // If storage is blocked, fall through and attempt normal boot.
  }

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const R = 1.4; // Earth radius

  // =========================================================
  // COLORS (final)
  // =========================================================
  const DAY_CYAN = 0x00eaff;
  const NIGHT_MAGENTA = 0xff3cff;

  const ACCESS_CYAN = DAY_CYAN;     // strikes + strike-history dots
  const VISITOR_YELLOW = 0xfff200;  // persistent visitor dots

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

  // Visible Sun marker (cyan)
  const sunMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    new THREE.MeshBasicMaterial({
      color: DAY_CYAN,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    })
  );
  scene.add(sunMarker);

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

  // Persistent visitor dots
  const visitorDots = []; // meshes
  const visitorDotGeom = new THREE.SphereGeometry(0.012, 6, 6);
  const visitorDotBaseMat = new THREE.MeshBasicMaterial({
    color: VISITOR_YELLOW,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });

  // Continent lines
  const continentLines = []; // { line, centroid }

  // Materials: day (cyan) & night (magenta)
  const isCoarseMobile =
    window.matchMedia &&
    (matchMedia("(hover: none) and (pointer: coarse)").matches ||
      matchMedia("(max-width: 820px)").matches);

  const contourOpacity = isCoarseMobile ? 0.92 : 0.55;
  const contourBlending = isCoarseMobile ? THREE.AdditiveBlending : THREE.NormalBlending;

  const dayMat = new THREE.LineBasicMaterial({
    color: DAY_CYAN,
    linewidth: 1,
    transparent: true,
    opacity: contourOpacity,
    blending: contourBlending,
    depthWrite: false,
  });

  const nightMat = new THREE.LineBasicMaterial({
    color: NIGHT_MAGENTA,
    linewidth: 1,
    transparent: true,
    opacity: contourOpacity,
    blending: contourBlending,
    depthWrite: false,
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

  // ---------- Persistent visitor dot ----------
  function addVisitorDot(lat, lon) {
    const dot = new THREE.Mesh(visitorDotGeom, visitorDotBaseMat.clone());
    dot.position.copy(latLonToVector3(lat, lon, R + 0.01));
    globeGroup.add(dot);
    visitorDots.push(dot);
    return dot;
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
      color: DAY_CYAN,
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
      color: DAY_CYAN,
      transparent: true,
      opacity: 1.0,
    });

    const spike = new THREE.Mesh(spikeGeom, spikeMat);
    spike.position.copy(outwardDir.clone().multiplyScalar(R + spikeHeight / 2));
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

  // ---------- Access strikes (CYAN) ----------
  const strikeGeom = new THREE.CylinderGeometry(0.004, 0.004, 1.0, 8);

  function addAccessStrike(lat, lon, weight = 1) {
    const outward = latLonToVector3(lat, lon, 1.0).normalize();

    const baseHeight = 0.25;
    const extra = 0.15 * Math.log10(1 + weight);
    const strikeHeight = baseHeight + extra;

    const mat = new THREE.MeshBasicMaterial({
      color: ACCESS_CYAN,
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

    // strike-history surface dot (CYAN)
    const dotGeom = new THREE.SphereGeometry(0.015, 10, 10);
    const dotMat = new THREE.MeshBasicMaterial({
      color: ACCESS_CYAN,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const dot = new THREE.Mesh(dotGeom, dotMat);
    dot.position.copy(latLonToVector3(lat, lon, R + 0.015));
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

    return new THREE.Vector3(
      cosLat * cosLon,
      sinLat,
      cosLat * sinLon
    ).normalize();
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

    // OPTIONAL: dim visitor dots on the night side
    for (const dot of visitorDots) {
      const n = dot.position.clone().normalize();
      dot.material.opacity = n.dot(sunDir) >= 0 ? 0.9 : 0.35;
    }
  }

  // ---------- Load continents + invisible sphere ----------
  function loadContinents() {
    const sphereGeom = new THREE.SphereGeometry(R, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      // Important: write depth so far-side contour lines get hidden.
      depthWrite: true,
      depthTest: true,
      visible: true,
    });
    // Ensure the invisible sphere does not draw into the color buffer.
    sphereMat.colorWrite = false;
    // Push depth slightly back to avoid z-fighting with contours.
    sphereMat.polygonOffset = true;
    sphereMat.polygonOffsetFactor = 1;
    sphereMat.polygonOffsetUnits = 1;
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

  // --- Helper: great-circle densification (keeps edges on sphere surface) ---
  const _tmpAxis = new THREE.Vector3();
  const _tmpQ = new THREE.Quaternion();

  function clamp01(v) {
    return Math.max(-1, Math.min(1, v));
  }

  function ringToSurfacePoints(ring, radius, maxAngleRad, radialOffset = 0.014) {
    if (!Array.isArray(ring) || ring.length < 2) return [];

    // Remove duplicated closing point if present.
    let coords = ring;
    const a0 = ring[0];
    const al = ring[ring.length - 1];
    if (a0 && al && a0[0] === al[0] && a0[1] === al[1]) {
      coords = ring.slice(0, -1);
    }
    if (coords.length < 2) return [];

    const unit = coords.map(([lon, lat]) => latLonToVector3(lat, lon, 1.0).normalize());

    const pts = [];
    const n = unit.length;
    for (let i = 0; i < n; i++) {
      const v0 = unit[i];
      const v1 = unit[(i + 1) % n];
      const dot = clamp01(v0.dot(v1));
      const ang = Math.acos(dot);
      const steps = Math.max(1, Math.ceil(ang / maxAngleRad));

      _tmpAxis.crossVectors(v0, v1);
      const axisLenSq = _tmpAxis.lengthSq();

      for (let s = 0; s < steps; s++) {
        if (i > 0 && s === 0) continue; // avoid duplicates at segment boundaries
        const t = s / steps;

        let v;
        if (axisLenSq < 1e-12 || !isFinite(ang) || ang === 0) {
          // Fallback: lerp + normalize (handles identical/opposite vectors)
          v = v0.clone().lerp(v1, t).normalize();
        } else {
          _tmpAxis.normalize();
          _tmpQ.setFromAxisAngle(_tmpAxis, ang * t);
          v = v0.clone().applyQuaternion(_tmpQ).normalize();
        }

        pts.push(v.multiplyScalar(radius + radialOffset));
      }
    }
    return pts;
  }

  function addLines(rings) {
    for (const ring of rings) {
      // Densify to keep segments visually on the globe surface.
      // 5° max step is a good compromise between fidelity and performance.
      const pts = ringToSurfacePoints(ring, R, (5 * Math.PI) / 180, 0.008);
      if (pts.length < 2) continue;
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.LineLoop(geom, dayMat);
      globeGroup.add(line);

      const centroid = new THREE.Vector3(0, 0, 0);
      for (const p of pts) centroid.add(p);
      centroid.multiplyScalar(1 / pts.length);

      continentLines.push({ line, centroid });
    }
  }

  // ---------- Visitor API wiring ----------
  function logVisitToServer() {
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location.pathname,
        ref: document.referrer || "",
        ts: Date.now()
      }),
      keepalive: true
    }).catch(() => {});
  }

  function loadVisitorsFromServer() {
    fetch("/api/visitors")
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        if (!Array.isArray(list)) return;
        for (const v of list) {
          if (typeof v?.lat === "number" && typeof v?.lon === "number") {
            addVisitorDot(v.lat, v.lon);
          }
        }
      })
      .catch(() => {});
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

      const sunDirNow = computeSunDirection();
      sunMarker.position.copy(sunDirNow.clone().multiplyScalar(5.0));

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
        dot.material.opacity = showingHistory ? 0.65 : 0.0;
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

  window.CalyrGlobe = {
    addAccessStrike,
    addVisitorDot,
    getStrikeHistory: () => strikeHistory.slice(),
  };

  loadVisitorsFromServer();
  logVisitToServer();

  // Simulated traffic (remove later if you want real only)
  (function simulateTraffic() {
    function randomLat() { return -85 + Math.random() * 170; }
    function randomLon() { return -180 + Math.random() * 360; }
    function randomWeight() { return 1 + Math.floor(Math.random() * 100); }
    function spawnHit() {
      if (window.CalyrGlobe && window.CalyrGlobe.addAccessStrike) {
        window.CalyrGlobe.addAccessStrike(randomLat(), randomLon(), randomWeight());
      }
      setTimeout(spawnHit, 2000 + Math.random() * 3000);
    }
    spawnHit();
  })();

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

      const proximity = Math.max(0, 1 - diff / (TOLERANCE * 1.5));

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