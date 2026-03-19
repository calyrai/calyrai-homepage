(function () {
  "use strict";

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function mix(a, b, t) {
    return a * (1 - t) + b * t;
  }

  function xorshift32(seed) {
    let x = seed >>> 0;
    return function () {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      return (x >>> 0) / 0xffffffff;
    };
  }

  function seedFromString(text) {
    let s = 2166136261;
    for (let i = 0; i < text.length; i++) {
      s ^= text.charCodeAt(i);
      s = Math.imul(s, 16777619);
    }
    return s >>> 0;
  }

  function buildMatrixFromQrcodeGenerator(text) {
    if (typeof window.qrcode !== "function") return null;

    const qr = window.qrcode(0, "L");
    qr.addData(text);
    qr.make();

    const count = qr.getModuleCount();
    const quiet = 4;
    const size = count + quiet * 2;

    const matrix = new Array(size);
    for (let y = 0; y < size; y++) {
      matrix[y] = new Array(size);
      for (let x = 0; x < size; x++) {
        const mx = x - quiet;
        const my = y - quiet;
        if (mx < 0 || my < 0 || mx >= count || my >= count) {
          matrix[y][x] = 0;
        } else {
          matrix[y][x] = qr.isDark(my, mx) ? 1 : 0;
        }
      }
    }

    return matrix;
  }

  function buildFallbackMatrix(text) {
    const N = 33;
    const rand = xorshift32(seedFromString(text));
    const matrix = new Array(N);
    for (let y = 0; y < N; y++) {
      matrix[y] = new Array(N);
      for (let x = 0; x < N; x++) {
        matrix[y][x] = rand() > 0.68 ? 1 : 0;
      }
    }
    matrix.__fallback = true;
    return matrix;
  }

  function pickMatrix(text) {
    return buildMatrixFromQrcodeGenerator(text) || buildFallbackMatrix(text);
  }

  function decodeQrText(raw) {
    if (raw == null) return "";
    return String(raw)
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\\t/g, "\t");
  }

  function attach(el) {
    const canvas = el.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const qrYamlRef = el.getAttribute("data-qr-yaml") || "";
    let qrText = decodeQrText(el.getAttribute("data-qr-text") || "https://calyr.ai/");
    const defaultMailto =
      el.getAttribute("data-mailto") ||
      el.getAttribute("data-qr-mailto") ||
      "mailto:rupert.tscheliessnig@calyr.ai?subject=Contact&body=";
    const requestedSize = Number(el.getAttribute("data-qr-size") || "0") || 0;
    let matrix = pickMatrix(qrText);

    // Randomize the QR: in noise mode we draw a random sample of QR-dark modules.
    const pointsCount = Number(el.getAttribute("data-noise-points") || "100") || 100;

    let hopIndex = 0;
    let hopAtMs = 0;
    const hopIntervalMs = Number(el.getAttribute("data-hop-ms") || "120") || 120;
    const hopRadius = Math.max(0, (Number(el.getAttribute("data-hop-radius") || "1") || 1) | 0);
    const hopTeleportP = clamp01(Number(el.getAttribute("data-hop-teleport") || "0.08") || 0.08);
    const magentaHopRadius = Math.max(
      0,
      (Number(el.getAttribute("data-magenta-hop-radius") || String(hopRadius)) || hopRadius) | 0
    );
    const magentaTeleportP = clamp01(
      Number(el.getAttribute("data-magenta-teleport") || String(hopTeleportP)) || hopTeleportP
    );

    let qrDark = null;
    function rebuildQrDark() {
      if (!matrix || !matrix.length) {
        qrDark = [];
        return;
      }
      const rows = matrix.length;
      const cols = matrix[0].length;
      const out = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (matrix[y][x] === 1) out.push({ x, y });
        }
      }
      qrDark = out;
    }
    rebuildQrDark();

    let noisePoints = [];
    let magentaCell = null;

    function pickRandomDark(rand) {
      if (!qrDark || qrDark.length === 0) return null;
      return qrDark[(rand() * qrDark.length) | 0] || null;
    }

    function tryStepToNearbyDark(p, radius, rand) {
      if (!p || !matrix || !matrix.length) return pickRandomDark(rand);
      if (radius <= 0) return p;

      const rows = matrix.length;
      const cols = matrix[0].length;

      for (let attempt = 0; attempt < 14; attempt++) {
        const dx = ((rand() * (radius * 2 + 1)) | 0) - radius;
        const dy = ((rand() * (radius * 2 + 1)) | 0) - radius;
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (matrix[ny][nx] === 1) return { x: nx, y: ny };
      }

      return p;
    }

    function resetNoisePoints(rand) {
      noisePoints = [];
      if (!qrDark || qrDark.length === 0) return;
      for (let i = 0; i < pointsCount; i++) {
        noisePoints.push(pickRandomDark(rand));
      }
    }

    function hopNoisePoints(rand) {
      if (!noisePoints || noisePoints.length === 0) {
        resetNoisePoints(rand);
        return;
      }
      for (let i = 0; i < noisePoints.length; i++) {
        if (hopTeleportP > 0 && rand() < hopTeleportP) {
          noisePoints[i] = pickRandomDark(rand);
        } else {
          noisePoints[i] = tryStepToNearbyDark(noisePoints[i], hopRadius, rand);
        }
      }
    }

    function updateMagentaCell(rand) {
      if (!qrDark || qrDark.length === 0) {
        magentaCell = null;
        return;
      }
      if (!magentaCell || (magentaTeleportP > 0 && rand() < magentaTeleportP)) {
        magentaCell = pickRandomDark(rand);
      } else {
        magentaCell = tryStepToNearbyDark(magentaCell, magentaHopRadius, rand) || pickRandomDark(rand);
      }
    }

    {
      const initRand = xorshift32(seedFromString(qrText));
      resetNoisePoints(initRand);
      updateMagentaCell(initRand);
    }

    function buildVCard(contact) {
      const fullName = String(contact?.full_name || contact?.name || "").trim();
      const phone = String(contact?.phone || "").trim();
      const email = String(contact?.email || "").trim();
      const organization = String(contact?.organization || contact?.org || "").trim();
      const url = String(contact?.url || "").trim();

      const lines = ["BEGIN:VCARD", "VERSION:3.0"];
      if (fullName) lines.push(`FN:${fullName}`);
      if (organization) lines.push(`ORG:${organization}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (url) lines.push(`URL:${url}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }

    function buildMailto(email) {
      const addr = String(email || "").trim();
      if (!addr) return defaultMailto;
      const subject = encodeURIComponent("Contact");
      return `mailto:${encodeURIComponent(addr)}?subject=${subject}&body=`;
    }

    async function maybeLoadQrYaml() {
      if (!qrYamlRef) return;
      try {
        const url = new URL(qrYamlRef, window.location.href).toString();
        const resp = await fetch(url, { cache: "no-store" });
        if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);

        const text = await resp.text();
        if (typeof jsyaml === "undefined") {
          throw new Error("jsyaml is not loaded");
        }

        const parsed = jsyaml.load(text) || {};
        const contact = parsed?.contact || parsed;
        const explicitVcard = contact?.vcard != null ? String(contact.vcard) : "";
        const contactEmail = String(contact?.email || "").trim();
        const nextText = decodeQrText(explicitVcard || buildVCard(contact));

        if (contactEmail) state.mailtoHref = buildMailto(contactEmail);

        if (nextText && nextText !== qrText) {
          qrText = nextText;
          matrix = pickMatrix(qrText);
          rebuildQrDark();
          const r = xorshift32(seedFromString(qrText));
          resetNoisePoints(r);
          magentaCell = null;
          updateMagentaCell(r);
        }
      } catch (err) {
        console.error("Failed to load QR YAML:", err);
      }
    }

    const state = {
      stabilizeStartMs: 0,
      stabilizeEndMs: 0,
      stabilizeDidMail: false,
      mailtoHref: defaultMailto,
    };

    // Mail prompt pill shown after stabilization ends.
    let mailPill = null;
    function ensureMailPill() {
      if (mailPill) return mailPill;

      const wrap = document.createElement("span");
      wrap.style.display = "inline-block";
      wrap.style.position = "relative";
      wrap.style.lineHeight = "0";

      const parent = el.parentNode;
      if (parent) {
        parent.insertBefore(wrap, el);
        wrap.appendChild(el);
      }

      const a = document.createElement("a");
      a.className = "qr-noise-mail-pill";
      a.href = state.mailtoHref || defaultMailto;
      a.textContent = "Mail";
      a.style.display = "none";
      a.setAttribute("aria-label", "Mail");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const href = state.mailtoHref || defaultMailto;
          window.location.assign(href);
        } catch (err) {
          console.error("Failed to open mailto:", err);
        }
        a.style.display = "none";
      });

      wrap.appendChild(a);
      mailPill = a;
      return a;
    }

    function hideMailPill() {
      if (mailPill) mailPill.style.display = "none";
    }

    function showMailPill() {
      const a = ensureMailPill();
      a.href = state.mailtoHref || defaultMailto;
      a.style.display = "inline-block";
    }

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const fallbackCss = Math.floor(el.clientWidth || 280);
      const cssSize = requestedSize > 0 ? requestedSize : Math.max(220, Math.min(360, fallbackCss));

      canvas.style.width = cssSize + "px";
      canvas.style.height = cssSize + "px";
      canvas.width = Math.floor(cssSize * dpr);
      canvas.height = Math.floor(cssSize * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function revealStrength(nowMs) {
      if (!state.stabilizeEndMs || nowMs >= state.stabilizeEndMs) return 0;

      const rampInMs = 220;
      const rampOutMs = 320;

      if (nowMs <= state.stabilizeStartMs + rampInMs) {
        return clamp01((nowMs - state.stabilizeStartMs) / rampInMs);
      }

      if (nowMs >= state.stabilizeEndMs - rampOutMs) {
        return clamp01((state.stabilizeEndMs - nowMs) / rampOutMs);
      }

      return 1;
    }

    function draw(nowMs) {
      const t = nowMs || performance.now();
      const s = revealStrength(t);
      const stabilizedActive = !!state.stabilizeEndMs && t < state.stabilizeEndMs;

      if (state.stabilizeEndMs && t >= state.stabilizeEndMs) {
        if (!state.stabilizeDidMail) {
          state.stabilizeDidMail = true;
          showMailPill();
        }
        state.stabilizeStartMs = 0;
        state.stabilizeEndMs = 0;
      }

      // If the QR lib loads after our script, switch from fallback to real matrix.
      if (typeof window.qrcode === "function" && matrix && matrix.__fallback) {
        matrix = pickMatrix(qrText);
        rebuildQrDark();
        const r = xorshift32(seedFromString(qrText));
        resetNoisePoints(r);
        magentaCell = null;
        updateMagentaCell(r);
      }

      if (t - hopAtMs >= hopIntervalMs) {
        hopAtMs = t;
        hopIndex = (hopIndex + 1) >>> 0;

        if (!stabilizedActive) {
          const hopRand = xorshift32((seedFromString(qrText) ^ Math.imul(hopIndex, 0x9e3779b9)) >>> 0);
          hopNoisePoints(hopRand);
          updateMagentaCell(hopRand);
        }
      }

      resize();

      // Clear in device pixels (unaffected by transform).
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const rows = matrix.length;
      const cols = matrix[0].length;
      const cell = Math.min(w / cols, h / rows);
      const ox = (w - cols * cell) * 0.5;
      const oy = (h - rows * cell) * 0.5;

      // Always black background.
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // Randomized-QR noise layer (suppressed during stabilization).
      if (!stabilizedActive) {
        const diskR = Math.max(1, cell * 0.42);
        const k = Math.min((noisePoints && noisePoints.length) || 0, pointsCount);
        const renderRand = xorshift32((seedFromString(qrText) ^ Math.imul(hopIndex + 1, 0x27d4eb2d)) >>> 0);

        ctx.globalAlpha = 1;
        for (let i = 0; i < k; i++) {
          const p = noisePoints[i];
          if (!p) continue;
          const cx = ox + (p.x + 0.5) * cell;
          const cy = oy + (p.y + 0.5) * cell;

          const intensity = 0.25 + 0.75 * renderRand();
          const r = Math.floor(110 + 45 * intensity);
          const g = Math.floor(225 + 30 * intensity);
          const b = 255;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.18 + 0.62 * intensity})`;

          ctx.beginPath();
          ctx.arc(cx, cy, diskR, 0, Math.PI * 2);
          ctx.fill();
        }

        if (magentaCell) {
          const cx = ox + (magentaCell.x + 0.5) * cell;
          const cy = oy + (magentaCell.y + 0.5) * cell;
          ctx.fillStyle = "rgba(255, 0, 255, 0.98)";
          ctx.beginPath();
          ctx.arc(cx, cy, diskR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Stabilized QR layer: cyan disks on black (dots form the QR).
      if (s > 0.001) {
        const diskR = Math.max(1, cell * 0.42);
        ctx.globalAlpha = s;
        ctx.fillStyle = "rgba(140, 245, 255, 0.98)";

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (matrix[y][x] !== 1) continue;
            const cx = ox + (x + 0.5) * cell;
            const cy = oy + (y + 0.5) * cell;
            ctx.beginPath();
            ctx.arc(cx, cy, diskR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (magentaCell) {
          const cx = ox + (magentaCell.x + 0.5) * cell;
          const cy = oy + (magentaCell.y + 0.5) * cell;
          ctx.fillStyle = "rgba(255, 0, 255, 0.98)";
          ctx.beginPath();
          ctx.arc(cx, cy, diskR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      requestAnimationFrame(draw);
    }

    function triggerStabilize() {
      const now = performance.now();

       // Toggle off if already stabilized.
      if (state.stabilizeEndMs && now < state.stabilizeEndMs) {
        state.stabilizeStartMs = 0;
        state.stabilizeEndMs = 0;
        state.stabilizeDidMail = false;
        hideMailPill();
        return;
      }

      state.stabilizeStartMs = now;
      state.stabilizeEndMs = now + 10_000;
      state.stabilizeDidMail = false;
      hideMailPill();

      if (typeof window.qrcode === "function") {
        matrix = pickMatrix(qrText);
        rebuildQrDark();
        const r = xorshift32(seedFromString(qrText));
        resetNoisePoints(r);
        magentaCell = null;
        updateMagentaCell(r);
      }
    }

    el.addEventListener("click", triggerStabilize);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerStabilize();
      }
    });

    window.addEventListener("resize", resize);
    maybeLoadQrYaml();
    requestAnimationFrame(draw);
  }

  function init() {
    const els = document.querySelectorAll("[data-qr-noise]");
    for (const el of els) attach(el);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
