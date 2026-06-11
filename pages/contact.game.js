const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreNode = document.getElementById("score");
const livesNode = document.getElementById("lives");
const levelNode = document.getElementById("level");
const patternNode = document.getElementById("pattern");
const mailQueueNode = document.getElementById("mail-queue");
const modeNoteNode = document.getElementById("mode-note");
const saveNoteNode = document.getElementById("save-note");
const fabMailBtn = document.querySelector(".social-fab .fab-mail");
const fabLinkedinBtn = document.querySelector(".social-fab .fab-linkedin");
const fabCalyrBtn = document.querySelector(".social-fab .fab-whatsapp");
const fabResetBtn = document.getElementById("fab-reset");
const socialFab = document.querySelector(".social-fab");
const stageNode = document.querySelector(".stage");

function parseYamlScalar(raw) {
  if (!raw.length) return "";
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return Number(raw);
  }
  return raw;
}

function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.match(/^\s*/)[0].length;
    const trimmed = line.trim();
    const sep = trimmed.indexOf(":");
    if (sep < 0) continue;

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;
    const key = trimmed.slice(0, sep).trim();
    const rest = trimmed.slice(sep + 1).trim();
    if (!key) continue;

    if (!rest.length) {
      parent[key] = {};
      stack.push({ indent, obj: parent[key] });
      continue;
    }

    parent[key] = parseYamlScalar(rest);
  }
  return root;
}

function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) {
    return base;
  }
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value
      && typeof value === "object"
      && !Array.isArray(value)
      && out[key]
      && typeof out[key] === "object"
      && !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function loadContactConfig() {
  const defaults = {
    contact: {
      personName: "Rupert Tscheliessnig, MBA, PhD",
      orgTitle: "Founder · Calyr.ai",
      orgName: "Calyr.ai",
      email: "rupert.tscheliessnig@calyr.ai",
      phone: "+4369919200915",
      website: "https://calyr.ai",
    },
    render: {
      defaultQrAbstractionStyle: "rings",
      qrRotationQuarters: 1,
      contactCardQrScale: 0.76,
      qrRenderScale: 0.84,
      raster: {
        sizeMin: 0.24,
        sizeMax: 0.92,
        openThreshold: 0.42,
        magentaThreshold: 0.93,
      },
    },
    game: {
      singleLevelOnly: true,
      maxLevel: 4,
      levelTargets: { level1: 200, level2: 400, level3: 400, level4: 1000 },
      levelUpLifeBonus: 1,
      perimeterScorePenalty: 180,
      perimeterDropLevel: 3,
      splitterBrickMax: 5,
      catcherHoldSeconds: 0.09,
      catcherRedirectSpreadPiFactor: 0.36,
    },
    performance: {
      simulationStep: 1 / 120,
      maxFrameDelta: 0.25,
      chromePerfModeEnabled: true,
      maxSimStepsDesktop: 20,
      maxSimStepsChrome: 10,
      deformationStrideDesktop: 1,
      deformationStrideChrome: 3,
      enableRelativityLensingDesktop: true,
      enableRelativityLensingInChrome: false,
      drawMeshLinksDesktop: true,
      drawMeshLinksInChrome: false,
      forceLowPowerMode: false,
    },
    grid: {
      cols: 10,
      rows: 6,
    },
    ui: {
      fabEdgePeekMs: 3200,
      controlLabels: { mail: "Mail", restart: "Restart" },
      layout: {
        narrowScreenMaxWidth: 720,
        cardXDesktop: 54,
        cardXMobile: 28,
        cardYDesktop: 30,
        cardYMobile: 24,
        qrInsetDesktop: 34,
        qrInsetMobile: 26,
        textXDesktopOffset: 34,
        textXMobileOffset: 24,
        titleYDesktopOffset: 52,
        titleYMobileOffset: 40,
        line2YDesktopOffset: 92,
        line2YMobileOffset: 74,
        line3YDesktopOffset: 126,
        line3YMobileOffset: 102,
        noteYDesktopOffset: 28,
        noteYMobileOffset: 24,
        textPadXDesktop: 24,
        textPadXMobile: 16,
        textPadYDesktop: 20,
        textPadYMobile: 14,
        textQrGapDesktop: 18,
        textQrGapMobile: 12,
        textLineGapDesktop: 10,
        textLineGapMobile: 8,
        minReadableQrDesktopMin: 170,
        minReadableQrDesktopMax: 260,
        minReadableQrDesktopWidthRatio: 0.3,
        minReadableQrMobileMin: 120,
        minReadableQrMobileMax: 180,
        minReadableQrMobileWidthRatio: 0.22,
        forceHorizontalTextOnMobile: true,
        cardSystem: {
          leftAreaRatio: 0.45,
          rightAreaRatio: 0.55,
          nameXRatio: 0.08,
          nameYRatio: 0.17,
          networkYRatio: 0.5,
          companyBelowNetworkRatio: 0.14,
          companyBelowNetworkMin: 46,
          emailBelowCompanyRatio: 0.048,
          emailBelowCompanyMin: 18,
          qrWidthRatioOfRightArea: 0.78,
          qrHeightRatioOfCard: 0.68,
          qrMin: 160,
          qrMax: 330,
          qrRightInsetRatio: 0.1,
          qrRightInsetMinRatio: 0.06,
          nameSizeRatio: 0.06,
          companySizeRatio: 0.033,
          emailSizeRatio: 0.026,
          nameSizeMinDesktop: 24,
          nameSizeMaxDesktop: 34,
          nameSizeMinMobile: 22,
          nameSizeMaxMobile: 28,
          companySizeMin: 15,
          companySizeMax: 19,
          emailSizeMin: 12,
          emailSizeMax: 15,
          nodeAvailableLeftMin: 220,
          nodeReservedGapToQr: 26,
          nodeSideSizeRatio: 0.135,
          nodeSideSizeMin: 44,
          nodeSideSizeMax: 62,
          nodeCenterScale: 1.78,
          nodeCenterMin: 80,
          nodeCenterMax: 114,
          nodeGapRatio: 0.06,
          nodeGapMin: 14,
          nodeGapMax: 32,
        },
      },
    },
    libraries: {
      qrGeneratorUrl: "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
    },
  };

  const yamlNode = document.getElementById("contact-config-yaml");
  if (!yamlNode) return defaults;

  try {
    const parsed = parseSimpleYaml(yamlNode.textContent || "");
    return deepMerge(defaults, parsed);
  } catch (_error) {
    return defaults;
  }
}

const CONFIG = deepMerge(loadContactConfig(), window.CONTACT_GAME_CONFIG || {});
const LAYOUT_CONFIG = CONFIG.ui.layout;
const CARD_SYSTEM = LAYOUT_CONFIG.cardSystem || {};
const QR_LIBRARY_URL = CONFIG.libraries.qrGeneratorUrl;
const EXTERNAL_CONTENT = window.CONTACT_CONTENT || {};

function withMbaCredential(name) {
  const raw = String(name || "").trim();
  if (!raw) return "MBA";
  if (/\bMBA\b/i.test(raw)) return raw;
  if (/\bPhD\b/i.test(raw)) {
    return raw.replace(/\bPhD\b/i, "MBA, PhD").replace(/,\s*,/g, ",");
  }
  return `${raw}, MBA`;
}

function normalizeBrandOrgName(orgName) {
  const raw = String(orgName || "").trim();
  if (!raw) return "Calyr.aí";
  if (/^calyr\.ai$/i.test(raw)) return "Calyr.aí";
  return raw;
}

const CONTENT = Object.freeze({
  personName: withMbaCredential(EXTERNAL_CONTENT.personName || CONFIG.contact.personName),
  orgTitle: EXTERNAL_CONTENT.orgTitle || CONFIG.contact.orgTitle,
  orgName: normalizeBrandOrgName(EXTERNAL_CONTENT.orgName || CONFIG.contact.orgName),
  email: EXTERNAL_CONTENT.email || CONFIG.contact.email,
  phone: EXTERNAL_CONTENT.phone || CONFIG.contact.phone,
  website: EXTERNAL_CONTENT.website || CONFIG.contact.website,
  hintLine1: EXTERNAL_CONTENT.hintLine1 || "TAP INSIDE GAME TO PLAY",
  hintLine2: EXTERNAL_CONTENT.hintLine2 || "Deformable nodes curve trajectories like light in warped space.",
});

const CONTACT_PAYLOAD = [
  "MECARD:",
  `N:${CONTENT.personName};`,
  `ORG:${CONTENT.orgName};`,
  `TEL:${CONTENT.phone};`,
  `EMAIL:${CONTENT.email};`,
  `URL:${CONTENT.website};`,
  ";"
].join("");

const PERSON_NAME = CONTENT.personName;
const ORG_TITLE = CONTENT.orgTitle;
const ORG_NAME = CONTENT.orgName;
const CONTACT_EMAIL = CONTENT.email;
const CONTACT_PHONE = CONTENT.phone;
const CONTACT_WEBSITE = CONTENT.website;

const LOCAL_CONTACT_KEY = "calyr.contact.qr.local-record";
const GAME_SHIFT_KEY = "calyr.contact.game-shifts";
const CONTACT_CARD_QR_SCALE = CONFIG.render.contactCardQrScale;
const QR_RENDER_SCALE = CONFIG.render.qrRenderScale;
const MONO_FONT_FAMILY = '"SF Mono", "Fira Code", ui-monospace, monospace';
const UI_FONT_FAMILY = '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif';
const CONTACT_HINT_LINE_1 = CONTENT.hintLine1;
const CONTACT_HINT_LINE_2 = CONTENT.hintLine2;
const QR_ABSTRACTION_STYLES = ["classic", "rings", "voronoi"];
const QR_STYLE_LABELS = {
  classic: "Classic",
  rings: "Open circles",
  voronoi: "Voronoi",
};
const DEFAULT_QR_ABSTRACTION_STYLE = CONFIG.render.defaultQrAbstractionStyle;
const QR_ROTATION_QUARTERS = CONFIG.render.qrRotationQuarters;
const RASTER_CONFIG = CONFIG.render.raster || {};
const RASTER_SIZE_MIN = typeof RASTER_CONFIG.sizeMin === "number" ? RASTER_CONFIG.sizeMin : 0.24;
const RASTER_SIZE_MAX = typeof RASTER_CONFIG.sizeMax === "number" ? RASTER_CONFIG.sizeMax : 0.92;
const RASTER_OPEN_THRESHOLD = typeof RASTER_CONFIG.openThreshold === "number" ? RASTER_CONFIG.openThreshold : 0.42;
const RASTER_MAGENTA_THRESHOLD = typeof RASTER_CONFIG.magentaThreshold === "number" ? RASTER_CONFIG.magentaThreshold : 0.93;
const SINGLE_LEVEL_ONLY = CONFIG.game.singleLevelOnly;
const MAX_LEVEL = SINGLE_LEVEL_ONLY ? 1 : CONFIG.game.maxLevel;
const LEVEL_TARGETS = SINGLE_LEVEL_ONLY
  ? { 1: CONFIG.game.levelTargets.level1 }
  : {
      1: CONFIG.game.levelTargets.level1,
      2: CONFIG.game.levelTargets.level2,
      3: CONFIG.game.levelTargets.level3,
      4: CONFIG.game.levelTargets.level4,
    };
const LEVEL_UP_LIFE_BONUS = CONFIG.game.levelUpLifeBonus;
const PERIMETER_SCORE_PENALTY = CONFIG.game.perimeterScorePenalty;
const PERIMETER_DROP_LEVEL = CONFIG.game.perimeterDropLevel;
const SPLITTER_BRICK_MAX = CONFIG.game.splitterBrickMax;
const CATCHER_HOLD_SECONDS = CONFIG.game.catcherHoldSeconds;
const CATCHER_REDIRECT_SPREAD = Math.PI * CONFIG.game.catcherRedirectSpreadPiFactor;
const SIMULATION_STEP = CONFIG.performance.simulationStep;
const MAX_FRAME_DELTA = CONFIG.performance.maxFrameDelta;
const GAME = Object.freeze({
  // Keep one gameplay simulation profile across devices.
  maxSimSteps: CONFIG.performance.maxSimStepsDesktop,
  deformationStride: CONFIG.performance.deformationStrideDesktop,
  enableRelativityLensing: CONFIG.performance.enableRelativityLensingDesktop,
  drawMeshLinks: CONFIG.performance.drawMeshLinksDesktop,
});

const MAX_SIM_STEPS_PER_FRAME = GAME.maxSimSteps;
const DEFORMATION_STEP_STRIDE = GAME.deformationStride;
const ENABLE_RELATIVITY_LENSING = GAME.enableRelativityLensing;
const DRAW_MESH_LINKS = GAME.drawMeshLinks;
const TILE_GRID_COLS = CONFIG.grid.cols;
const TILE_GRID_ROWS = CONFIG.grid.rows;
const CONTROL_LABELS = CONFIG.ui.controlLabels;
const FAB_EDGE_PEEK_MS = CONFIG.ui.fabEdgePeekMs;
const FAB_COLLAPSE_IDLE_MS = 1300;
const LOW_POWER_MODE = !!CONFIG.performance.forceLowPowerMode;
let edgeTouchStarted = false;
let edgeTouchStartX = 0;

function contactSeed() {
  let seed = 0;
  for (const char of CONTACT_PAYLOAD) {
    seed = (seed * 31 + char.charCodeAt(0)) % 100000;
  }
  return seed;
}

class ContactGameState {
  constructor() {
    this.running = false;
    this.initialized = false;
    this.paused = false;
    this.contactOpen = false;
    this.contactMode = true;
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.paddle = { w: 124, h: 14, x: 388, y: 504, speed: 540, dx: 0 };
    this.ball = { x: 450, y: 420, r: 9, dx: 240, dy: -240, speedBase: 240 };
    this.bricks = [];
    this.rows = 0;
    this.cols = 0;
    this.brickGap = 3;
    this.brickSize = { w: 18, h: 18 };
    this.totalBricks = 0;
    this.patternHits = 0;
    this.levelHits = 0;
    this.blinkTime = 0;
    this.patternTimer = 0;
    this.patternInterval = 1.0;
    this.patternSeed = 0;
    this.playSeconds = 0;
    this.gameOver = false;
    this.periodicModeUnlocked = false;
    this.keys = { left: false, right: false };
    this.touchSteer = 0;
    this.lastTime = 0;
    this.lastPointerUp = 0;
    this.automataBursts = [];
    this.explosions = [];
    this.qrBounds = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    this.perimeterOffset = 0;
    this.saveFeedback = "";
    this.qrLoading = false;
    this.previewMatrix = null;
    this.contactVisualWalker = null;
    this.moveSummary = {
      paddleShift: 0,
      ballTravel: 0,
      samples: 0,
      lastPaddleX: null,
      lastBallX: null,
      lastBallY: null,
    };
    this.ballTrap = null;
    this.ballTrail = [];
    this.extraBalls = [];
    this.meshNodes = Object.create(null);
    this.qrModuleSize = 10;
    this.meshEnergy = 0;
    this.gridNodes = Object.create(null);
    this.gridEnergy = 0;
    this.qrRenderStyle = DEFAULT_QR_ABSTRACTION_STYLE;
    this.qrReadability = {
      running: false,
      detector: "unknown",
      results: null,
      testedAt: 0,
    };
  }
}

class ContactLayoutEngine {
  static isNarrowScreen() {
    return window.innerWidth <= LAYOUT_CONFIG.narrowScreenMaxWidth;
  }

  static getCardLayout(totalW = 0, totalH = 0) {
    const narrowScreen = ContactLayoutEngine.isNarrowScreen();
    const cardX = narrowScreen ? LAYOUT_CONFIG.cardXMobile : LAYOUT_CONFIG.cardXDesktop;
    const cardY = narrowScreen ? LAYOUT_CONFIG.cardYMobile : LAYOUT_CONFIG.cardYDesktop;
    const cardW = canvas.width - cardX * 2;
    const cardH = canvas.height - cardY * 2;
    const qrInset = narrowScreen ? LAYOUT_CONFIG.qrInsetMobile : LAYOUT_CONFIG.qrInsetDesktop;
    const qrLeft = cardX + cardW - qrInset - totalW;
    const qrTop = cardY + Math.round((cardH - totalH) / 2);
    return {
      cardX,
      cardY,
      cardW,
      cardH,
      qrLeft,
      qrTop,
      textX: cardX + (narrowScreen ? LAYOUT_CONFIG.textXMobileOffset : LAYOUT_CONFIG.textXDesktopOffset),
      titleY: cardY + (narrowScreen ? LAYOUT_CONFIG.titleYMobileOffset : LAYOUT_CONFIG.titleYDesktopOffset),
      line2Y: cardY + (narrowScreen ? LAYOUT_CONFIG.line2YMobileOffset : LAYOUT_CONFIG.line2YDesktopOffset),
      line3Y: cardY + (narrowScreen ? LAYOUT_CONFIG.line3YMobileOffset : LAYOUT_CONFIG.line3YDesktopOffset),
      noteY: cardY + cardH - (narrowScreen ? LAYOUT_CONFIG.noteYMobileOffset : LAYOUT_CONFIG.noteYDesktopOffset),
    };
  }
}

const state = new ContactGameState();

let qrLibraryPromise = null;
let simulationAccumulator = 0;
let suppressClickUntil = 0;
let lastTouchEndTime = 0;
const canvasMetrics = {
  rect: null,
  borderLeft: 0,
  borderRight: 0,
  borderTop: 0,
  borderBottom: 0,
  contentWidth: 1,
  contentHeight: 1,
};
const textRasterCache = new Map();

function getRasterizedTextPoints(text, font, fontSize) {
  const key = `${text}__${font}__${fontSize}`;
  const cached = textRasterCache.get(key);
  if (cached) return cached;

  const scratch = document.createElement("canvas");
  const scratchCtx = scratch.getContext("2d");
  scratchCtx.font = font;
  const width = Math.max(8, Math.ceil(scratchCtx.measureText(text).width) + 8);
  const height = Math.max(8, Math.ceil(fontSize * 1.45) + 8);
  scratch.width = width;
  scratch.height = height;

  scratchCtx.clearRect(0, 0, width, height);
  scratchCtx.font = font;
  scratchCtx.fillStyle = "#ffffff";
  scratchCtx.textAlign = "left";
  scratchCtx.textBaseline = "alphabetic";
  const baseline = Math.max(fontSize, Math.round(fontSize * 1.03));
  scratchCtx.fillText(text, 2, baseline);

  const pixels = scratchCtx.getImageData(0, 0, width, height).data;
  const step = Math.max(2, Math.round(fontSize * 0.18));
  const points = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha < 96) continue;
      const noise = hashed01(x + 1, y + 1, 811);
      points.push({
        x,
        y,
        scale: 0.78 + noise * 0.52,
        magenta: noise > 0.975,
      });
    }
  }

  const result = { points, baseline, width, height };
  textRasterCache.set(key, result);
  return result;
}

function drawRasterizedTextLine(targetCtx, text, font, x, baselineY, fontSize, baseColor) {
  const raster = getRasterizedTextPoints(text, font, fontSize);
  const top = baselineY - raster.baseline;
  const baseRadius = Math.max(1.2, fontSize * 0.115);

  for (const point of raster.points) {
    const px = x + point.x;
    const py = top + point.y;
    const radius = baseRadius * point.scale;
    const color = point.magenta ? "#ff4df5" : baseColor;
    const glow = point.magenta ? "rgba(255, 77, 245, 0.36)" : "rgba(255, 255, 255, 0.24)";
    drawHalfOpenDisk(px, py, radius, color, glow, 0, 0, 0);
  }
}

function refreshCanvasMetrics() {
  const rect = canvas.getBoundingClientRect();
  const styles = window.getComputedStyle(canvas);
  canvasMetrics.rect = rect;
  canvasMetrics.borderLeft = parseFloat(styles.borderLeftWidth) || 0;
  canvasMetrics.borderRight = parseFloat(styles.borderRightWidth) || 0;
  canvasMetrics.borderTop = parseFloat(styles.borderTopWidth) || 0;
  canvasMetrics.borderBottom = parseFloat(styles.borderBottomWidth) || 0;
  canvasMetrics.contentWidth = Math.max(1, rect.width - canvasMetrics.borderLeft - canvasMetrics.borderRight);
  canvasMetrics.contentHeight = Math.max(1, rect.height - canvasMetrics.borderTop - canvasMetrics.borderBottom);
}

function applyControlLabels() {
  if (fabLinkedinBtn) {
    fabLinkedinBtn.setAttribute("data-short", "LinkedIn");
    fabLinkedinBtn.setAttribute("aria-label", "LinkedIn");
  }
  if (fabCalyrBtn) {
    const whatsappHref = `https://wa.me/${String(CONTACT_PHONE || "").replace(/[^\d]/g, "")}`;
    fabCalyrBtn.setAttribute("data-short", "WhatsApp");
    fabCalyrBtn.setAttribute("aria-label", "Open WhatsApp");
    fabCalyrBtn.setAttribute("href", whatsappHref);
    fabCalyrBtn.setAttribute("target", "_blank");
    fabCalyrBtn.setAttribute("rel", "noopener noreferrer");
  }
  if (fabMailBtn) {
    fabMailBtn.setAttribute("data-short", CONTROL_LABELS.mail);
    fabMailBtn.setAttribute("aria-label", CONTROL_LABELS.mail);
  }
  if (fabResetBtn) {
    fabResetBtn.setAttribute("data-short", "Game");
    fabResetBtn.setAttribute("aria-label", "Game");
  }
}

function buildQrWall(size, seed) {
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  function addFinder(startX, startY) {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        matrix[startY + y][startX + x] = edge || core ? 1 : 0;
      }
    }
  }

  addFinder(0, 0);
  addFinder(size - 7, 0);
  addFinder(0, size - 7);

  for (let i = 8; i < size - 8; i += 1) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (matrix[y][x] === 1) continue;
      const reservedTop = y < 8 && (x < 8 || x >= size - 8);
      const reservedBottom = y >= size - 8 && x < 8;
      const timing = x === 6 || y === 6;
      if (reservedTop || reservedBottom || timing) continue;
      matrix[y][x] = ((x * 13 + y * 17 + x * y * 3 + seed * 19) % 7) < 3 ? 1 : 0;
    }
  }

  matrix[size - 8][8] = 1;
  return matrix;
}

function buildContactMatrix(text, options = {}) {
  const allowFallback = options.allowFallback !== false;
  if (typeof window.qrcode === "function") {
    const qr = window.qrcode(0, "L");
    qr.addData(text, "Byte");
    qr.make();

    const count = qr.getModuleCount();
    const quiet = 4;
    const size = count + quiet * 2;
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
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

  if (allowFallback) {
    return buildQrWall(33, contactSeed());
  }

  return null;
}

function isQrReservedCell(row, col, size) {
  const quiet = 4;
  const inner = size - quiet * 2;
  const x = col - quiet;
  const y = row - quiet;

  if (x < 0 || y < 0 || x >= inner || y >= inner) return true;

  const inTopLeft = x < 9 && y < 9;
  const inTopRight = x >= inner - 9 && y < 9;
  const inBottomLeft = x < 9 && y >= inner - 9;
  const inTiming = x === 6 || y === 6;

  return inTopLeft || inTopRight || inBottomLeft || inTiming;
}

function isCatcherCell(row, col, size, seed) {
  void row;
  void col;
  void size;
  void seed;
  return true;
}

function catcherNotchAngle(row, col, seed) {
  return ((row * 19 + col * 23 + seed * 7) % 360) * (Math.PI / 180);
}

function catcherSpinSpeed(row, col, seed) {
  const direction = ((row + col + seed) % 2 === 0) ? 1 : -1;
  const magnitude = 0.6 + (((row * 11 + col * 17 + seed * 3) % 100) / 100) * 1.2;
  return direction * magnitude;
}

function splitterRank(row, col, seed) {
  return (row * 29 + col * 31 + seed * 13) % 997;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveCardSystem(narrowScreen) {
  const pick = (key, fallback) => (typeof CARD_SYSTEM[key] === "number" ? CARD_SYSTEM[key] : fallback);
  return {
    leftAreaRatio: pick("leftAreaRatio", 0.45),
    rightAreaRatio: pick("rightAreaRatio", 0.55),
    nameXRatio: pick("nameXRatio", 0.08),
    nameYRatio: pick("nameYRatio", 0.17),
    networkYRatio: pick("networkYRatio", 0.5),
    companyBelowNetworkRatio: pick("companyBelowNetworkRatio", 0.14),
    companyBelowNetworkMin: pick("companyBelowNetworkMin", 46),
    emailBelowCompanyRatio: pick("emailBelowCompanyRatio", 0.048),
    emailBelowCompanyMin: pick("emailBelowCompanyMin", 18),
    qrWidthRatioOfRightArea: pick("qrWidthRatioOfRightArea", 0.78),
    qrHeightRatioOfCard: pick("qrHeightRatioOfCard", 0.68),
    qrMin: pick("qrMin", 160),
    qrMax: pick("qrMax", 330),
    qrRightInsetRatio: pick("qrRightInsetRatio", 0.1),
    qrRightInsetMinRatio: pick("qrRightInsetMinRatio", 0.06),
    nameSizeRatio: pick("nameSizeRatio", 0.06),
    companySizeRatio: pick("companySizeRatio", 0.033),
    emailSizeRatio: pick("emailSizeRatio", 0.026),
    nameSizeMin: pick(narrowScreen ? "nameSizeMinMobile" : "nameSizeMinDesktop", narrowScreen ? 22 : 24),
    nameSizeMax: pick(narrowScreen ? "nameSizeMaxMobile" : "nameSizeMaxDesktop", narrowScreen ? 28 : 34),
    companySizeMin: pick("companySizeMin", 15),
    companySizeMax: pick("companySizeMax", 19),
    emailSizeMin: pick("emailSizeMin", 12),
    emailSizeMax: pick("emailSizeMax", 15),
    nodeAvailableLeftMin: pick("nodeAvailableLeftMin", 220),
    nodeReservedGapToQr: pick("nodeReservedGapToQr", 26),
    nodeSideSizeRatio: pick("nodeSideSizeRatio", 0.135),
    nodeSideSizeMin: pick("nodeSideSizeMin", 44),
    nodeSideSizeMax: pick("nodeSideSizeMax", 62),
    nodeCenterScale: pick("nodeCenterScale", 1.78),
    nodeCenterMin: pick("nodeCenterMin", 80),
    nodeCenterMax: pick("nodeCenterMax", 114),
    nodeGapRatio: pick("nodeGapRatio", 0.06),
    nodeGapMin: pick("nodeGapMin", 14),
    nodeGapMax: pick("nodeGapMax", 32),
  };
}

function getContactCardLayout(totalW = 0, totalH = 0) {
  const layout = ContactLayoutEngine.getCardLayout(totalW, totalH);
  if (!state.initialized) return layout;

  // Use one identical canvas-wide card geometry for both contact and gameplay levels.
  return {
    ...layout,
    cardX: 0,
    cardY: 0,
    cardW: canvas.width,
    cardH: canvas.height,
    qrLeft: canvas.width - totalW,
    qrTop: Math.round((canvas.height - totalH) / 2),
    textX: 18,
    titleY: 34,
    line2Y: 62,
    line3Y: 88,
    noteY: canvas.height - 20,
  };
}

function getContactCardContentLines() {
  return [CONTENT.personName, CONTENT.orgName, CONTENT.email];
}

function getContactCardTypography(narrowScreen) {
  const titleSize = narrowScreen ? 16 : 19;
  const orgSize = narrowScreen ? 13 : 15;
  const emailSize = narrowScreen ? 12 : 14;
  return [
    { fontSize: titleSize, weight: "700", color: "#f7fbff" },
    { fontSize: orgSize, weight: "400", color: "#f7fbff" },
    { fontSize: emailSize, weight: "400", color: "#ffffff" },
  ];
}

function buildContactCardLineDefs(layout, narrowScreen) {
  const texts = getContactCardContentLines();
  const typo = getContactCardTypography(narrowScreen);
  const positions = [layout.titleY, layout.line2Y, layout.line3Y];
  return texts.map((text, index) => {
    const spec = typo[index];
    return {
      text,
      font: `${spec.weight} ${spec.fontSize}px ${MONO_FONT_FAMILY}`,
      x: layout.textX,
      y: positions[index],
      fontSize: spec.fontSize,
      color: spec.color,
    };
  });
}

function computeContactVisualSpec(qrSize, layout) {
  const moduleGap = 2;
  const narrowScreen = ContactLayoutEngine.isNarrowScreen();
  const sys = resolveCardSystem(narrowScreen);
  const lineDefs = buildContactCardLineDefs(layout, narrowScreen);

  // Use the same layout system for contact and gameplay so geometry stays consistent.
  if (state.contactOpen || state.initialized) {
    const cardLeft = layout.cardX;
    const cardTop = layout.cardY;
    const cardW = layout.cardW;
    const cardH = layout.cardH;
    const leftW = cardW * sys.leftAreaRatio;
    const rightX = cardLeft + leftW;
    const rightW = cardW * sys.rightAreaRatio;
    const nameX = cardLeft + cardW * sys.nameXRatio;
    const nameSize = clamp(
      Math.round(cardH * sys.nameSizeRatio),
      sys.nameSizeMin,
      sys.nameSizeMax
    );
    const companySize = clamp(Math.round(cardH * sys.companySizeRatio), sys.companySizeMin, sys.companySizeMax);
    const emailSize = clamp(Math.round(cardH * sys.emailSizeRatio), sys.emailSizeMin, sys.emailSizeMax);
    const nameY = cardTop + cardH * sys.nameYRatio;
    const networkY = cardTop + cardH * sys.networkYRatio;
    const companyY = networkY + Math.max(sys.companyBelowNetworkMin, cardH * sys.companyBelowNetworkRatio);
    const emailY = companyY + Math.max(sys.emailBelowCompanyMin, cardH * sys.emailBelowCompanyRatio);
    const qrTarget = clamp(
      Math.round(Math.min(rightW * sys.qrWidthRatioOfRightArea, cardH * sys.qrHeightRatioOfCard)),
      sys.qrMin,
      sys.qrMax
    );

    const moduleSize = Math.max(
      3,
      Math.floor((qrTarget - moduleGap * (qrSize - 1)) / qrSize)
    );

    const qrWidth = qrSize * moduleSize + (qrSize - 1) * moduleGap;
    const qrHeight = qrSize * moduleSize + (qrSize - 1) * moduleGap;
    const qrLeft = clamp(
      rightX + rightW - qrWidth - rightW * sys.qrRightInsetRatio,
      rightX + rightW * sys.qrRightInsetMinRatio,
      cardLeft + cardW - qrWidth - rightW * sys.qrRightInsetMinRatio
    );
    const qrTop = Math.round(cardTop + (cardH - qrHeight) * 0.5);

    return {
      moduleGap,
      moduleSize,
      qrBounds: {
        left: qrLeft,
        top: qrTop,
        right: qrLeft + qrWidth,
        bottom: qrTop + qrHeight,
        width: qrWidth,
        height: qrHeight,
      },
      lineDefs: [
        {
          text: CONTENT.personName,
          font: `600 ${nameSize}px ${MONO_FONT_FAMILY}`,
          x: nameX,
          y: nameY,
          fontSize: nameSize,
          color: "rgba(247, 251, 255, 0.98)",
        },
        {
          text: CONTENT.orgName,
          font: `500 ${companySize}px ${MONO_FONT_FAMILY}`,
          x: nameX,
          y: companyY,
          fontSize: companySize,
          color: "rgba(235, 246, 255, 0.88)",
        },
        {
          text: CONTENT.email,
          font: `400 ${emailSize}px ${MONO_FONT_FAMILY}`,
          x: nameX,
          y: emailY,
          fontSize: emailSize,
          color: "rgba(235, 246, 255, 0.7)",
        },
      ],
      padX: 0,
      padY: 0,
      lineGap: narrowScreen ? 9 : 12,
      rotateText: false,
      layoutSystem: null,
    };
  }

  const padX = narrowScreen ? LAYOUT_CONFIG.textPadXMobile : LAYOUT_CONFIG.textPadXDesktop;
  const padY = narrowScreen ? LAYOUT_CONFIG.textPadYMobile : LAYOUT_CONFIG.textPadYDesktop;
  const textQrGap = narrowScreen ? LAYOUT_CONFIG.textQrGapMobile : LAYOUT_CONFIG.textQrGapDesktop;
  const lineGap = narrowScreen ? LAYOUT_CONFIG.textLineGapMobile : LAYOUT_CONFIG.textLineGapDesktop;

  ctx.save();
  let maxTextWidth = 0;
  let totalTextHeight = 0;
  lineDefs.forEach((line, index) => {
    ctx.font = line.font;
    const measured = ctx.measureText(line.text).width;
    if (measured > maxTextWidth) maxTextWidth = measured;
    totalTextHeight += line.fontSize + (index < lineDefs.length - 1 ? lineGap : 0);
  });
  ctx.restore();

  const qrMaxH = layout.cardH - padY * 2;
  const minReadableQr = narrowScreen
    ? Math.min(
      LAYOUT_CONFIG.minReadableQrMobileMax,
      Math.max(LAYOUT_CONFIG.minReadableQrMobileMin, layout.cardW * LAYOUT_CONFIG.minReadableQrMobileWidthRatio)
    )
    : Math.min(
      LAYOUT_CONFIG.minReadableQrDesktopMax,
      Math.max(LAYOUT_CONFIG.minReadableQrDesktopMin, layout.cardW * LAYOUT_CONFIG.minReadableQrDesktopWidthRatio)
    );

  let rotateText = false;
  let reservedTextWidth = maxTextWidth + (narrowScreen ? 14 : 20);
  let qrMaxW = layout.cardW - padX * 2 - reservedTextWidth - textQrGap;
  if (qrMaxW < minReadableQr) {
    rotateText = true;
    reservedTextWidth = totalTextHeight + (narrowScreen ? 12 : 18);
    qrMaxW = layout.cardW - padX * 2 - reservedTextWidth - textQrGap;
  }

  // Keep phone layout visually aligned with desktop by avoiding vertical text rotation.
  if (narrowScreen && LAYOUT_CONFIG.forceHorizontalTextOnMobile) {
    rotateText = false;
  }

  const moduleSize = Math.max(
    3,
    Math.floor(
      Math.min(
        (qrMaxW - moduleGap * (qrSize - 1)) / qrSize,
        (qrMaxH - moduleGap * (qrSize - 1)) / qrSize
      )
    )
  );

  const qrWidth = qrSize * moduleSize + (qrSize - 1) * moduleGap;
  const qrHeight = qrSize * moduleSize + (qrSize - 1) * moduleGap;
  const qrBounds = {
    left: layout.cardX + layout.cardW - padX - qrWidth,
    top: layout.cardY + Math.round((layout.cardH - qrHeight) / 2),
    right: layout.cardX + layout.cardW - padX,
    bottom: layout.cardY + Math.round((layout.cardH - qrHeight) / 2) + qrHeight,
    width: qrWidth,
    height: qrHeight,
  };

  return {
    moduleGap,
    moduleSize,
    qrBounds,
    lineDefs,
    padX,
    padY,
    lineGap,
    rotateText,
  };
}

function buildTextBricks(layout, brickSize, gap, lineDefsOverride = null) {
  const scratch = document.createElement("canvas");
  scratch.width = canvas.width;
  scratch.height = canvas.height;
  const scratchCtx = scratch.getContext("2d");
  const lines = Array.isArray(lineDefsOverride) && lineDefsOverride.length
    ? lineDefsOverride
    : buildContactCardLineDefs(layout, ContactLayoutEngine.isNarrowScreen());
  scratchCtx.clearRect(0, 0, scratch.width, scratch.height);
  scratchCtx.fillStyle = "#ffffff";
  scratchCtx.textAlign = "left";
  scratchCtx.textBaseline = "alphabetic";

  lines.forEach((line) => {
    scratchCtx.font = line.font;
    scratchCtx.fillText(line.text, line.x, line.y);
  });

  const image = scratchCtx.getImageData(0, 0, scratch.width, scratch.height).data;
  const bricks = [];
  const step = brickSize + gap;

  function inkCoverage(startX, startY) {
    let filled = 0;
    let samples = 0;

    for (let sampleY = startY; sampleY < startY + brickSize; sampleY += 1) {
      for (let sampleX = startX; sampleX < startX + brickSize; sampleX += 1) {
        const px = Math.max(0, Math.min(scratch.width - 1, Math.round(sampleX)));
        const py = Math.max(0, Math.min(scratch.height - 1, Math.round(sampleY)));
        const alpha = image[(py * scratch.width + px) * 4 + 3];
        samples += 1;
        if (alpha > 96) filled += 1;
      }
    }

    return samples ? filled / samples : 0;
  }

  lines.forEach((line) => {
    scratchCtx.font = line.font;
    const metrics = scratchCtx.measureText(line.text);
    const textWidth = Math.ceil(metrics.width);
    const top = Math.max(0, Math.floor(line.y - line.fontSize * 0.9));
    const bottom = Math.min(canvas.height, Math.ceil(line.y + line.fontSize * 0.28));

    for (let y = top; y < bottom; y += step) {
      for (let x = line.x; x < line.x + textWidth; x += step) {
        const coverage = inkCoverage(x, y);
        if (coverage < 0.22) continue;
        bricks.push({
          x,
          y,
          w: brickSize,
          h: brickSize,
          glow: "rgba(255, 255, 255, 0.18)",
          phase: (x * 0.013) + (y * 0.017),
          alive: true,
          active: true,
          row: -1,
          col: -1,
          catcher: false,
          notchAngle: 0,
          spinSpeed: 0,
          splitter: false,
          pendingBlast: false,
          textPattern: true,
          circleScale: baseDiscScale(x + 1, y + 1, 41),
        });
      }
    }
  });

  return bricks;
}

function pseudoRandom01(seed) {
  const value = Math.sin(seed) * 43758.5453123;
  return value - Math.floor(value);
}

function wrapIndex(value, size) {
  return ((value % size) + size) % size;
}

function pickInitialDarkCell(qrMatrix) {
  const qrSize = qrMatrix.length;
  const centerRow = (qrSize - 1) / 2;
  const centerCol = (qrSize - 1) / 2;
  let best = null;

  for (let row = 0; row < qrSize; row += 1) {
    for (let col = 0; col < qrSize; col += 1) {
      if (!qrMatrix[row][col]) continue;
      const dist = (row - centerRow) ** 2 + (col - centerCol) ** 2;
      if (!best || dist < best.dist) {
        best = { row, col, dist };
      }
    }
  }

  return best ? { row: best.row, col: best.col } : null;
}

function getContactVisualWalker(qrMatrix) {
  const qrSize = qrMatrix.length;
  const existing = state.contactVisualWalker;

  if (!existing || existing.size !== qrSize || !qrMatrix[existing.row]?.[existing.col]) {
    const start = pickInitialDarkCell(qrMatrix);
    state.contactVisualWalker = {
      size: qrSize,
      row: start ? start.row : 0,
      col: start ? start.col : 0,
      stepCounter: 0,
      lastStepTime: state.blinkTime,
      stepInterval: 0.09,
    };
  }

  return state.contactVisualWalker;
}

function stepContactVisualWalker(qrMatrix) {
  const walker = getContactVisualWalker(qrMatrix);
  const elapsed = state.blinkTime - walker.lastStepTime;
  if (elapsed < walker.stepInterval) return walker;

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  let steps = Math.max(1, Math.floor(elapsed / walker.stepInterval));
  while (steps > 0) {
    let moved = false;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const pick = pseudoRandom01((contactSeed() + walker.stepCounter * 17 + attempt * 101) * 0.0137);
      const dir = directions[Math.floor(pick * directions.length) % directions.length];
      const nextRow = wrapIndex(walker.row + dir.dr, walker.size);
      const nextCol = wrapIndex(walker.col + dir.dc, walker.size);

      if (qrMatrix[nextRow][nextCol]) {
        walker.row = nextRow;
        walker.col = nextCol;
        moved = true;
        break;
      }
    }

    walker.stepCounter += 1;
    if (!moved) break;
    steps -= 1;
  }

  walker.lastStepTime = state.blinkTime;
  return walker;
}

function drawHighResContactCard(layout) {
  const qrMatrix = state.previewMatrix;
  if (!Array.isArray(qrMatrix) || !qrMatrix.length) {
    ctx.save();
    ctx.fillStyle = "#0a2a56";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(236, 246, 255, 0.92)";
    ctx.font = `600 16px ${UI_FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText("Loading contact QR...", 18, 34);
    ctx.restore();
    return;
  }
  const qrSize = qrMatrix.length;

  const visualSpec = computeContactVisualSpec(qrSize, layout);
  const moduleGap = visualSpec.moduleGap;
  const moduleSize = visualSpec.moduleSize;
  const qrBounds = visualSpec.qrBounds;
  const lineDefs = visualSpec.lineDefs;
  const padX = visualSpec.padX;
  const padY = visualSpec.padY;
  const lineGap = visualSpec.lineGap;
  const rotateText = visualSpec.rotateText;

  const markedCell = null;

  const cardBaseGradient = ctx.createLinearGradient(
    layout.cardX,
    layout.cardY,
    layout.cardX + layout.cardW,
    layout.cardY + layout.cardH
  );
  cardBaseGradient.addColorStop(0, "rgba(8, 15, 34, 0.96)");
  cardBaseGradient.addColorStop(1, "rgba(2, 6, 18, 0.98)");
  drawRoundedRect(layout.cardX, layout.cardY, layout.cardW, layout.cardH, 28, cardBaseGradient);

  const nightLift = ctx.createRadialGradient(
    layout.cardX + layout.cardW * 0.16,
    layout.cardY + layout.cardH * 0.22,
    24,
    layout.cardX + layout.cardW * 0.16,
    layout.cardY + layout.cardH * 0.22,
    layout.cardW * 0.62
  );
  nightLift.addColorStop(0, "rgba(255, 255, 255, 0.06)");
  nightLift.addColorStop(1, "rgba(255, 255, 255, 0)");
  drawRoundedRect(layout.cardX, layout.cardY, layout.cardW, layout.cardH, 28, nightLift);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(layout.cardX + 28, layout.cardY);
  ctx.arcTo(layout.cardX + layout.cardW, layout.cardY, layout.cardX + layout.cardW, layout.cardY + layout.cardH, 28);
  ctx.arcTo(layout.cardX + layout.cardW, layout.cardY + layout.cardH, layout.cardX, layout.cardY + layout.cardH, 28);
  ctx.arcTo(layout.cardX, layout.cardY + layout.cardH, layout.cardX, layout.cardY, 28);
  ctx.arcTo(layout.cardX, layout.cardY, layout.cardX + layout.cardW, layout.cardY, 28);
  ctx.closePath();
  ctx.stroke();

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  if (!rotateText) {
    let y = layout.cardY + padY + lineDefs[0].fontSize;
    const x = layout.cardX + padX;
    if (state.contactOpen) {
      y = 0;
    }
    lineDefs.forEach((line, index) => {
      ctx.font = line.font;
      ctx.fillStyle = line.color;
      const drawX = state.contactOpen ? line.x : x;
      const drawY = state.contactOpen ? line.y : y;
      if (state.contactOpen && line.text === CONTENT.orgName && /calyr\.a[ií]/i.test(line.text)) {
        const normalized = line.text.replace(/ai$/i, "aí");
        const prefix = normalized.slice(0, -1);
        const accent = normalized.slice(-1);
        ctx.fillStyle = "rgba(235, 246, 255, 0.88)";
        ctx.fillText(prefix, drawX, drawY);
        const width = ctx.measureText(prefix).width;
        ctx.fillStyle = "#ff4df5";
        ctx.fillText(accent, drawX + width, drawY);
      } else {
        ctx.fillText(line.text, drawX, drawY);
      }
      y += line.fontSize + (index < lineDefs.length - 1 ? lineGap : 0);
    });
  } else {
    const tx = layout.cardX + padX + Math.max(10, lineDefs[0].fontSize * 0.8);
    const ty = layout.cardY + layout.cardH - padY;
    ctx.translate(tx, ty);
    ctx.rotate(-Math.PI / 2);
    let y = lineDefs[0].fontSize;
    lineDefs.forEach((line, index) => {
      ctx.font = line.font;
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, 0, y);
      y += line.fontSize + (index < lineDefs.length - 1 ? lineGap : 0);
    });
  }
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.font = '13px "SF Mono", "Fira Code", ui-monospace, monospace';
  if (!rotateText) {
    ctx.fillText(
      state.running ? "tap once to return to play" : "tap once to start playing",
      layout.cardX + padX,
      layout.cardY + layout.cardH - padY
    );
  }
  ctx.restore();

  ctx.save();
  for (let row = 0; row < qrSize; row += 1) {
    for (let col = 0; col < qrSize; col += 1) {
      if (!qrMatrix[row][col]) continue;
      const base = getQrModuleCenter(
        qrBounds,
        moduleSize,
        moduleGap,
        row,
        col,
        qrSize,
        QR_ROTATION_QUARTERS
      );
      const baseX = base.x;
      const baseY = base.y;
      const x = baseX;
      const y = baseY;
      const isMarked = Boolean(markedCell && markedCell.row === row && markedCell.col === col);
      drawAbstractQrModule(ctx, {
        x,
        y,
        moduleSize,
        row,
        col,
        qrSize,
        style: "classic",
        ink: isMarked ? "#ff4df5" : "#ffffff",
        glow: isMarked ? "rgba(255, 77, 245, 0.38)" : null,
        moduleScale: 1,
        animate: false,
      });
    }
  }
  ctx.restore();
}

function isPerimeterChallengeActive() {
  return state.level >= 4 && state.periodicModeUnlocked;
}

function isRuleLightningLevel() {
  return state.level === 4 && !state.periodicModeUnlocked;
}

function perimeterLength() {
  const { width, height } = state.qrBounds;
  return width > 0 && height > 0 ? (width * 2) + (height * 2) : 0;
}

function defaultPerimeterOffset() {
  const { width, height } = state.qrBounds;
  return width + height + width * 0.5;
}

function normalizePerimeterOffset(offset) {
  const total = perimeterLength();
  if (!total) return 0;
  return ((offset % total) + total) % total;
}

function setPerimeterOffset(offset) {
  state.perimeterOffset = normalizePerimeterOffset(offset);
}

function advancePerimeterSlider(distance) {
  setPerimeterOffset(state.perimeterOffset + distance);
}

function currentModeNote() {
  const styleLabel = QR_STYLE_LABELS[state.qrRenderStyle] || state.qrRenderStyle;
  if (SINGLE_LEVEL_ONLY) {
    return `Level 1 only: classic breakout on the bright QR until ${LEVEL_TARGETS[1]} hits, then Level 1 resets. Style: ${styleLabel}.`;
  }
  if (isPerimeterChallengeActive()) {
    return `Level 4: periodic walls are live. Run the slider along the full QR frame and keep the ball inside. Style: ${styleLabel}.`;
  }
  if (state.level === 4) {
    return `Level 4: game of life rules ignite magenta trajectories until ${LEVEL_TARGETS[4]} hits, then periodic walls take over. Style: ${styleLabel}.`;
  }
  if (state.level === 3) {
    return `Level 3: drive the fractured QR up to ${LEVEL_TARGETS[3]} hits to unlock the rule-based phase. Style: ${styleLabel}.`;
  }
  if (state.level === 2) {
    return `Level 2: cascades return every 10 hits while you work through the damaged QR to ${LEVEL_TARGETS[2]}. Style: ${styleLabel}.`;
  }
  return `Level 1: classic breakout on the bright QR until ${LEVEL_TARGETS[1]} hits. Style: ${styleLabel}.`;
}

function currentLevelTarget() {
  return LEVEL_TARGETS[state.level] ?? null;
}

function currentLevelProgressLabel() {
  const target = currentLevelTarget();
  if (!target) return `${state.levelHits}`;
  return `${Math.min(state.levelHits, target)}/${target}`;
}

function readabilitySummaryText() {
  const check = state.qrReadability;
  if (check.running) return "Scan test running: classic, rings, voronoi...";
  if (check.detector === "unavailable") return "Scan test skipped: BarcodeDetector not available in this browser.";
  if (!check.results) return "Scan test pending.";
  const readable = QR_ABSTRACTION_STYLES.filter((style) => check.results[style]);
  if (!readable.length) return "Scan test: none of the tested abstractions decoded reliably.";
  const labels = readable.map((style) => QR_STYLE_LABELS[style] || style).join(", ");
  return `Scan test passed: ${labels}.`;
}

function currentSaveNote() {
  if (state.saveFeedback) return state.saveFeedback;
  if (state.qrLoading) return "Preparing your contact QR...";
  if (state.contactOpen) {
    return `Readable mode active (${QR_STYLE_LABELS[state.qrRenderStyle] || state.qrRenderStyle}). ${readabilitySummaryText()} Double-tap to re-enter play mode.`;
  }
  return state.running
    ? "Play mode active. Double-tap leaves mode. Touch left/right controls bar speed."
    : "Double-tap enters play mode. Touch left/right controls bar speed.";
}

function loadQrLibrary() {
  if (typeof window.qrcode === "function") {
    return Promise.resolve();
  }

  if (qrLibraryPromise) {
    return qrLibraryPromise;
  }

  qrLibraryPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-contact-qr-lib="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("QR script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = QR_LIBRARY_URL;
    script.async = true;
    script.defer = true;
    script.dataset.contactQrLib = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("QR script failed to load.")), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    qrLibraryPromise = null;
    throw error;
  });

  return qrLibraryPromise;
}

function parseContactPayload(payload) {
  if (payload.startsWith("BEGIN:VCARD")) {
    const fields = {};
    const urls = [];
    const lines = payload.split(/\r?\n/);
    for (const line of lines) {
      if (!line || !line.includes(":")) continue;
      const idx = line.indexOf(":");
      const rawKey = line.slice(0, idx);
      const value = line.slice(idx + 1).trim();
      const key = rawKey.split(";")[0].toUpperCase();
      if (key === "URL") {
        urls.push(value);
        continue;
      }
      if (!(key in fields)) fields[key] = value;
    }
    return {
      fullName: fields.FN || "",
      organization: fields.ORG || "",
      phone: fields.TEL || "",
      email: fields.EMAIL || "",
      url: urls[0] || "",
    };
  }

  const fields = {};
  const parts = payload.replace(/^MECARD:/, "").split(";");
  for (const part of parts) {
    if (!part || !part.includes(":")) continue;
    const [key, ...valueParts] = part.split(":");
    fields[key] = valueParts.join(":");
  }
  return {
    fullName: fields.N || "",
    organization: fields.ORG || "",
    phone: fields.TEL || "",
    email: fields.EMAIL || "",
    url: fields.URL || "",
  };
}

function setSaveFeedback(message) {
  state.saveFeedback = message;
  saveNoteNode.textContent = currentSaveNote();
}

function saveContactLocally() {
  try {
    const contact = parseContactPayload(CONTACT_PAYLOAD);
    const record = {
      payload: CONTACT_PAYLOAD,
      savedAt: new Date().toISOString(),
      ...contact,
    };
    window.localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(record));
    setSaveFeedback("Contact stored locally on this device.");
    return true;
  } catch (_error) {
    setSaveFeedback("Local contact storage is unavailable in this browser.");
    return false;
  }
}

function syncPeriodicUnlockState() {
  const shouldUnlock = state.level >= 4 && state.levelHits >= LEVEL_TARGETS[4];
  if (shouldUnlock && !state.periodicModeUnlocked) {
    state.periodicModeUnlocked = true;
    setPerimeterOffset(defaultPerimeterOffset());
    resetBallAndPaddle();
    state.paused = true;
    syncGameUi();
  } else if (!shouldUnlock) {
    state.periodicModeUnlocked = false;
  }
}

function getPerimeterSlider() {
  if (!isPerimeterChallengeActive()) return null;

  const { left, top, right, bottom, width, height } = state.qrBounds;
  if (!width || !height) return null;

  const thickness = 14;
  const horizontalLength = clamp(width * 0.26, 92, 156);
  const verticalLength = clamp(height * 0.26, 82, 132);
  let offset = normalizePerimeterOffset(state.perimeterOffset || defaultPerimeterOffset());

  if (offset < width) {
    const centerX = clamp(left + offset, left + horizontalLength / 2, right - horizontalLength / 2);
    return {
      side: "top",
      x: centerX - horizontalLength / 2,
      y: top - thickness / 2,
      w: horizontalLength,
      h: thickness,
      centerX,
      centerY: top,
    };
  }

  offset -= width;
  if (offset < height) {
    const centerY = clamp(top + offset, top + verticalLength / 2, bottom - verticalLength / 2);
    return {
      side: "right",
      x: right - thickness / 2,
      y: centerY - verticalLength / 2,
      w: thickness,
      h: verticalLength,
      centerX: right,
      centerY,
    };
  }

  offset -= height;
  if (offset < width) {
    const centerX = clamp(right - offset, left + horizontalLength / 2, right - horizontalLength / 2);
    return {
      side: "bottom",
      x: centerX - horizontalLength / 2,
      y: bottom - thickness / 2,
      w: horizontalLength,
      h: thickness,
      centerX,
      centerY: bottom,
    };
  }

  offset -= width;
  const centerY = clamp(bottom - offset, top + verticalLength / 2, bottom - verticalLength / 2);
  return {
    side: "left",
    x: left - thickness / 2,
    y: centerY - verticalLength / 2,
    w: thickness,
    h: verticalLength,
    centerX: left,
    centerY,
  };
}

function closestPerimeterOffset(x, y) {
  const { left, top, right, bottom, width, height } = state.qrBounds;
  const candidates = [
    { distance: Math.abs(y - top), offset: clamp(x - left, 0, width) },
    { distance: Math.abs(x - right), offset: width + clamp(y - top, 0, height) },
    { distance: Math.abs(y - bottom), offset: width + height + (width - clamp(x - left, 0, width)) },
    { distance: Math.abs(x - left), offset: width + height + width + (height - clamp(y - top, 0, height)) },
  ];
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0].offset;
}

function drawQrBoundary() {
  // Keep gameplay logic intact, but remove extra visual boundary lines.
  return;
  if (state.contactOpen) return;

  const { left, top, width, height } = state.qrBounds;
  if (!width || !height) return;

  const crispLeft = Math.round(left) + 0.5;
  const crispTop = Math.round(top) + 0.5;
  const crispWidth = Math.round(width);
  const crispHeight = Math.round(height);

  ctx.save();
  ctx.strokeStyle = isPerimeterChallengeActive()
    ? "rgba(255, 214, 94, 0.88)"
    : state.level >= 2
      ? "rgba(191, 248, 255, 0.86)"
      : "rgba(90, 203, 225, 0.38)";
  ctx.lineWidth = isPerimeterChallengeActive() ? 3.2 : state.level >= 2 ? 2.6 : 1.4;
  ctx.setLineDash(isPerimeterChallengeActive() ? [12, 8] : []);
  ctx.shadowBlur = state.level >= 2 ? 20 : 0;
  ctx.shadowColor = isPerimeterChallengeActive()
    ? "rgba(255, 214, 94, 0.34)"
    : "rgba(255, 255, 255, 0.28)";
  ctx.strokeRect(crispLeft, crispTop, crispWidth, crispHeight);
  ctx.restore();
}

function drawSlider() {
  const slider = getPerimeterSlider();
  if (!slider) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255,255,255,0.6)";
    drawRoundedRect(state.paddle.x, state.paddle.y, state.paddle.w, state.paddle.h, 9, "#ffffff");
    ctx.shadowBlur = 0;
    return;
  }

  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(255, 214, 94, 0.45)";
  drawRoundedRect(slider.x, slider.y, slider.w, slider.h, 10, "#ffd65e");
  ctx.restore();
}

function isBallOutsideQrBounds() {
  const { left, top, right, bottom } = state.qrBounds;
  const pad = state.ball.r + 1;
  return state.ball.x < left - pad
    || state.ball.x > right + pad
    || state.ball.y < top - pad
    || state.ball.y > bottom + pad;
}

function dropBackFromPerimeter() {
  state.score = Math.max(0, state.score - PERIMETER_SCORE_PENALTY);
  state.level = PERIMETER_DROP_LEVEL;
  state.periodicModeUnlocked = false;
  state.patternHits = 0;
  state.levelHits = 0;
  resetBricks();
  resetBallAndPaddle();
  state.paused = true;
  syncHud();
  syncGameUi();
}

function resetBricks() {
  const baseWall = state.previewMatrix || buildContactMatrix(CONTACT_PAYLOAD, { allowFallback: state.initialized });
  if (!baseWall) {
    state.bricks = [];
    state.rows = 0;
    state.cols = 0;
    state.totalBricks = 0;
    state.automataBursts = [];
    return;
  }
  const wall = baseWall;
  const qrSize = wall.length;
  const seed = contactSeed();
  const cardLayout = getContactCardLayout();
  const visualSpec = computeContactVisualSpec(qrSize, cardLayout);
  const gap = visualSpec.moduleGap;
  const moduleSize = visualSpec.moduleSize;
  const contactLayout = getContactCardLayout();
  const top = visualSpec.qrBounds.top;
  const left = visualSpec.qrBounds.left;
  state.qrBounds = {
    left,
    top,
    right: visualSpec.qrBounds.right,
    bottom: visualSpec.qrBounds.bottom,
    width: visualSpec.qrBounds.width,
    height: visualSpec.qrBounds.height,
  };
  state.bricks = [];
  state.meshNodes = Object.create(null);
  state.qrModuleSize = moduleSize;
  state.rows = qrSize;
  state.cols = qrSize;
  state.levelHits = 0;
  state.automataBursts = [];
  state.explosions = [];
  state.ball.r = Math.max(4, Math.floor(moduleSize * 0.5));
  if (!state.perimeterOffset) {
    state.perimeterOffset = defaultPerimeterOffset();
  }
  let activeCount = 0;
  const splitterCandidates = [];
  for (let row = 0; row < qrSize; row += 1) {
    for (let col = 0; col < qrSize; col += 1) {
      if (!baseWall[row][col]) continue;
      const active = !!wall[row][col];
      if (active) activeCount += 1;
      const raster = getRasterProfile(row, col);
      const brick = {
        x: left + col * (moduleSize + gap),
        y: top + row * (moduleSize + gap),
        w: moduleSize,
        h: moduleSize,
        glow: "rgba(255, 255, 255, 0.18)",
        phase: (row * 0.37) + (col * 0.21),
        alive: true,
        active: true,
        row,
        col,
        catcher: isCatcherCell(row, col, qrSize, seed),
        notchAngle: catcherNotchAngle(row, col, seed),
        spinSpeed: catcherSpinSpeed(row, col, seed),
        splitter: false,
        pendingBlast: false,
        mulMark: false,
        baseScale: raster.sizeScale,
        circleScale: raster.sizeScale,
      };
      state.bricks.push(brick);
      if (brick.row >= 0 && brick.col >= 0 && !isQrReservedCell(row, col, qrSize)) {
        splitterCandidates.push({ brick, rank: splitterRank(row, col, seed) });
      }
    }
  }

  splitterCandidates.sort((a, b) => a.rank - b.rank);
  for (let i = 0; i < Math.min(SPLITTER_BRICK_MAX, splitterCandidates.length); i += 1) {
    splitterCandidates[i].brick.splitter = true;
  }

  const centerRow = (qrSize - 1) / 2;
  const centerCol = (qrSize - 1) / 2;
  const markCandidate = state.bricks
    .filter((brick) => brick.row >= 0 && brick.col >= 0 && !brick.catcher)
    .map((brick) => ({
      brick,
      dist: (brick.row - centerRow) ** 2 + (brick.col - centerCol) ** 2,
    }))
    .sort((a, b) => a.dist - b.dist)[0];
  if (markCandidate?.brick) {
    markCandidate.brick.mulMark = true;
    state.contactVisualWalker = {
      size: qrSize,
      row: markCandidate.brick.row,
      col: markCandidate.brick.col,
      stepCounter: 0,
      lastStepTime: state.blinkTime,
      stepInterval: 0.09,
    };
  }

  const textBrickSize = Math.max(8, moduleSize + 1);
  const textBrickGap = Math.max(1, Math.floor(gap * 0.5));
  const textBricks = buildTextBricks(contactLayout, textBrickSize, textBrickGap, visualSpec.lineDefs);
  state.bricks.push(...textBricks);
  activeCount += textBricks.length;
  state.totalBricks = activeCount;
}

function resetBallAndPaddle() {
  state.ballTrap = null;
  state.ballTrail = [];
  state.extraBalls = [];
  if (isPerimeterChallengeActive()) {
    const { left, top, right, bottom, width, height } = state.qrBounds;
    setPerimeterOffset(state.perimeterOffset || defaultPerimeterOffset());
    state.ball.x = left + width * 0.5;
    state.ball.y = top + height * 0.5;
    state.ball.dx = state.ball.speedBase + 28;
    state.ball.dy = -(state.ball.speedBase + 12);
    state.paddle.x = left + width * 0.5;
    state.paddle.y = bottom;
    return;
  }

  const narrowScreen = ContactLayoutEngine.isNarrowScreen();
  const landscapePhone = narrowScreen && window.innerWidth > window.innerHeight;
  const qrBottom = state.bricks.length
    ? Math.max(...state.bricks.map((brick) => brick.y + brick.h))
    : canvas.height - 120;
  const laneTop = qrBottom + (landscapePhone ? 18 : 24);

  state.paddle.x = (canvas.width - state.paddle.w) / 2;
  state.paddle.y = Math.min(canvas.height - state.paddle.h - 18, laneTop);
  state.ball.x = canvas.width / 2;
  state.ball.y = Math.max(state.ball.r + 12, state.paddle.y - state.ball.r - 14);
  state.ball.dx = state.ball.speedBase + (state.level - 1) * 24;
  state.ball.dy = -(state.ball.speedBase + (state.level - 1) * 24);
}

function resetGame() {
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.patternHits = 0;
  state.levelHits = 0;
  state.patternTimer = 0;
  state.patternSeed = 0;
  state.playSeconds = 0;
  state.periodicModeUnlocked = false;
  state.contactOpen = false;
  state.gameOver = false;
  state.previewMatrix = null;
  resetBricks();
  setPerimeterOffset(defaultPerimeterOffset());
  resetBallAndPaddle();
  syncHud();
  syncGameUi();
}

function syncHud() {
  scoreNode.textContent = String(state.score);
  livesNode.textContent = String(state.lives);
  levelNode.textContent = isPerimeterChallengeActive() ? "4P" : String(state.level);
  patternNode.textContent = isPerimeterChallengeActive()
    ? `${state.patternHits}/${state.totalBricks}`
    : currentLevelProgressLabel();
  mailQueueNode.textContent = `Mail queues current score: ${state.score}`;
  modeNoteNode.textContent = currentModeNote();
  saveNoteNode.textContent = currentSaveNote();
}

function resetCurrentLevelLayout() {
  const wasPaused = state.paused;
  resetBricks();
  resetBallAndPaddle();
  state.paused = wasPaused;
  syncHud();
}

function resetContactState() {
  state.contactOpen = false;
  state.gameOver = false;
  state.qrLoading = false;
  state.saveFeedback = "";
  state.ballTrap = null;
  state.extraBalls = [];
  syncHud();
  syncGameUi();
  draw();
}

function updateMovementSummary() {
  const summary = state.moveSummary;
  if (summary.lastPaddleX != null) {
    summary.paddleShift += Math.abs(state.paddle.x - summary.lastPaddleX);
  }
  if (summary.lastBallX != null && summary.lastBallY != null) {
    summary.ballTravel += Math.hypot(state.ball.x - summary.lastBallX, state.ball.y - summary.lastBallY);
  }
  summary.lastPaddleX = state.paddle.x;
  summary.lastBallX = state.ball.x;
  summary.lastBallY = state.ball.y;
  summary.samples += 1;
}

function persistMovementSummary() {
  try {
    const summary = state.moveSummary;
    const payload = {
      savedAt: new Date().toISOString(),
      score: state.score,
      level: state.level,
      patternHits: state.patternHits,
      paddleShift: Math.round(summary.paddleShift),
      ballTravel: Math.round(summary.ballTravel),
      samples: summary.samples,
    };
    window.localStorage.setItem(GAME_SHIFT_KEY, JSON.stringify(payload));
  } catch (_error) {
  }
}

function canvasToBlob(targetCanvas) {
  return new Promise((resolve, reject) => {
    targetCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas snapshot failed."));
    }, "image/png");
  });
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function getMailSnapshotBlob() {
  if (!state.contactOpen) {
    return canvasToBlob(canvas);
  }
  // Keep contact mode fast: no heavy gameplay snapshot buffer, only movement deltas are persisted.
  return canvasToBlob(canvas);
}

function downloadSnapshot(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function resumeAfterMailAction() {
  resetContactState();
  if (state.running) {
    state.paused = false;
    state.lastTime = 0;
    gameLoop.start();
  }
}

async function openMail() {
  const subjectText = `Breakout run score ${state.score}`;
  const bodyText = `Hi,\n\nI finished the Breakout QR run.\n\nScore: ${state.score}\nPattern hits: ${state.patternHits}/${state.totalBricks}\nLevel: ${state.level}\n\n`;
  const subject = encodeURIComponent(subjectText);
  const body = encodeURIComponent(bodyText);
  const fileName = `calyr-breakout-level-${state.level}-score-${state.score}.png`;

  let snapshotBlob = null;
  try {
    snapshotBlob = await getMailSnapshotBlob();
  } catch (_error) {
    snapshotBlob = null;
  }

  if (snapshotBlob && navigator.share) {
    const snapshotFile = new File([snapshotBlob], fileName, { type: "image/png" });
    if (!navigator.canShare || navigator.canShare({ files: [snapshotFile] })) {
      try {
        await navigator.share({
          title: subjectText,
          text: bodyText,
          files: [snapshotFile],
        });
        resumeAfterMailAction();
        return;
      } catch (_error) {
      }
    }
  }

  if (snapshotBlob) {
    downloadSnapshot(snapshotBlob, fileName);
    setSaveFeedback("Snapshot downloaded. Attach it to the mail draft if your device cannot share it directly.");
  }

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  resumeAfterMailAction();
}

async function showContactQr() {
  state.saveFeedback = "";
  state.qrLoading = true;
  state.qrReadability.running = false;
  state.qrRenderStyle = "rings";
  syncHud();
  syncGameUi();

  try {
    await loadQrLibrary();
    state.previewMatrix = buildContactMatrix(CONTACT_PAYLOAD, { allowFallback: false });
  } catch (_error) {
    state.saveFeedback = "Contact QR could not be loaded right now. Mail and local save still use your vCard.";
    state.previewMatrix = null;
  }

  state.qrLoading = false;
  if (!state.initialized) {
    resetBricks();
  }
  syncHud();
  syncGameUi();
  draw();
  if (state.previewMatrix) {
    void runQrReadabilitySuite(state.previewMatrix);
  }
}

function pauseIntoContact() {
  if (!state.initialized) return;
  state.paused = true;
  state.contactOpen = true;
  state.gameOver = false;
  syncGameUi();
  if (!state.previewMatrix && !state.qrLoading) {
    void showContactQr();
    return;
  }
  draw();
}

function endToContact(reasonText) {
  persistMovementSummary();
  state.running = false;
  state.paused = true;
  state.contactOpen = false;
  state.gameOver = true;
  state.saveFeedback = reasonText || "";
  syncHud();
  syncGameUi();
}

class FabController {
  constructor() {
    this.peekTimeout = null;
    this.collapseTimer = null;
  }

  isGameActive() {
    return !!(state.running && !state.paused && !state.contactOpen && !state.gameOver);
  }

  syncGameUi() {
    document.body.classList.toggle("game-over", !!state.gameOver);
    document.body.classList.toggle("impressum-open", !!state.contactOpen);
    document.body.classList.toggle("game-active", this.isGameActive());

    if (fabResetBtn) {
      fabResetBtn.hidden = false;
      fabResetBtn.setAttribute("aria-hidden", "false");
    }

    this.syncInsideCard();
  }

  showTemporarily(durationMs = FAB_EDGE_PEEK_MS) {
    if (!this.isGameActive()) return;
    this.pokeInteraction();
    document.body.classList.add("fab-peek");
    if (this.peekTimeout) {
      window.clearTimeout(this.peekTimeout);
    }
    this.peekTimeout = window.setTimeout(() => {
      document.body.classList.remove("fab-peek");
    }, durationMs);
  }

  setCollapsed(collapsed) {
    if (!socialFab) return;
    socialFab.classList.toggle("fab-collapsed", !!collapsed);
  }

  scheduleCollapse() {
    if (!socialFab) return;
    if (this.collapseTimer) {
      window.clearTimeout(this.collapseTimer);
    }
    this.collapseTimer = window.setTimeout(() => {
      this.setCollapsed(true);
    }, FAB_COLLAPSE_IDLE_MS);
  }

  pokeInteraction() {
    if (!socialFab) return;
    this.setCollapsed(false);
    this.scheduleCollapse();
  }

  syncInsideCard() {
    if (!socialFab) return;
    if (!canvasMetrics.rect) refreshCanvasMetrics();
    if (!canvasMetrics.rect) return;

    const qrWidth = state.qrBounds?.width || 0;
    const qrHeight = state.qrBounds?.height || 0;
    const layout = getContactCardLayout(qrWidth, qrHeight);
    const rect = canvasMetrics.rect;
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    const narrowScreen = ContactLayoutEngine.isNarrowScreen();
    const sys = resolveCardSystem(narrowScreen);
    const isUnifiedCardLayout = !!state.initialized;

    let sideSize = narrowScreen ? 52 : 60;
    let centerSize = narrowScreen ? 92 : 108;
    let gap = isUnifiedCardLayout ? (narrowScreen ? 24 : 40) : 10;
    const visibleControls = Array.from(socialFab.querySelectorAll("a, button")).filter((el) => !el.hidden);
    const controlCount = Math.max(1, visibleControls.length);

    const cardLeft = rect.left + layout.cardX * scaleX;
    const cardTop = rect.top + layout.cardY * scaleY;
    const cardWidth = layout.cardW * scaleX;
    const cardHeight = layout.cardH * scaleY;
    const qrLeft = layout.qrBounds
      ? rect.left + layout.qrBounds.left * scaleX
      : cardLeft + cardWidth * 0.62;

    if (isUnifiedCardLayout) {
      const availableLeftWidth = Math.max(sys.nodeAvailableLeftMin, (qrLeft - cardLeft) - sys.nodeReservedGapToQr);
      sideSize = clamp(Math.round(availableLeftWidth * sys.nodeSideSizeRatio), sys.nodeSideSizeMin, sys.nodeSideSizeMax);
      centerSize = clamp(Math.round(sideSize * sys.nodeCenterScale), sys.nodeCenterMin, sys.nodeCenterMax);
      gap = clamp(Math.round(availableLeftWidth * sys.nodeGapRatio), sys.nodeGapMin, sys.nodeGapMax);
    }

    const knobSize = sideSize;
    const rowWidth = isUnifiedCardLayout
      ? (sideSize * 3 + centerSize + gap * 3)
      : (knobSize * controlCount + gap * Math.max(0, controlCount - 1));

    const marginX = Math.max(8, 14 * scaleX);
    const marginY = Math.max(8, 12 * scaleY);
    const leftSectionLeft = cardLeft + marginX;
    const leftSectionRight = Math.max(leftSectionLeft + rowWidth, qrLeft - Math.max(10, 12 * scaleX));
    const preferredLeft = leftSectionLeft + (leftSectionRight - leftSectionLeft) * 0.5 - rowWidth * 0.5;
    const left = clamp(preferredLeft, cardLeft + marginX, cardLeft + cardWidth - rowWidth - marginX);
    const preferredTop = isUnifiedCardLayout
      ? cardTop + cardHeight * sys.networkYRatio - centerSize * 0.5
      : rect.top + layout.line3Y * scaleY + Math.max(18, 16 * scaleY);
    const top = clamp(preferredTop, cardTop + marginY, cardTop + cardHeight - knobSize - marginY);

    socialFab.style.gap = `${gap}px`;
    if (isUnifiedCardLayout) {
      const ordered = [fabLinkedinBtn, fabCalyrBtn, fabMailBtn, fabResetBtn].filter(Boolean);
      ordered.forEach((el, index) => {
        const isCenter = index === 1;
        const size = isCenter ? centerSize : sideSize;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.setProperty("--fab-core-size", `${Math.round(size * (isCenter ? 0.6 : 0.62))}px`);
        el.style.setProperty("--fab-ring-thickness", isCenter ? "4px" : "3px");
      });

      if (fabLinkedinBtn) fabLinkedinBtn.style.setProperty("--fab-collapse-shift", `${Math.round(sideSize + gap)}px`);
      if (fabCalyrBtn) fabCalyrBtn.style.setProperty("--fab-collapse-shift", "0px");
      if (fabMailBtn) fabMailBtn.style.setProperty("--fab-collapse-shift", `${Math.round(-(centerSize + gap))}px`);
      if (fabResetBtn) fabResetBtn.style.setProperty("--fab-collapse-shift", `${Math.round(-(centerSize + sideSize + gap * 2))}px`);
    } else {
      [fabLinkedinBtn, fabCalyrBtn, fabMailBtn, fabResetBtn].forEach((el) => {
        if (!el) return;
        el.style.width = "";
        el.style.height = "";
        el.style.removeProperty("--fab-core-size");
        el.style.removeProperty("--fab-ring-thickness");
      });

      const fallbackShift = Math.round(knobSize + gap);
      if (fabLinkedinBtn) fabLinkedinBtn.style.setProperty("--fab-collapse-shift", `${fallbackShift}px`);
      if (fabCalyrBtn) fabCalyrBtn.style.setProperty("--fab-collapse-shift", "0px");
      if (fabMailBtn) fabMailBtn.style.setProperty("--fab-collapse-shift", `${-fallbackShift}px`);
      if (fabResetBtn) fabResetBtn.style.setProperty("--fab-collapse-shift", `${-Math.round((knobSize + gap) * 2)}px`);
    }

    socialFab.style.left = `${Math.round(left)}px`;
    socialFab.style.top = `${Math.round(top)}px`;
    socialFab.style.bottom = "auto";
  }
}

const fabController = new FabController();

function syncGameUi() {
  fabController.syncGameUi();
}

function isGameActive() {
  return fabController.isGameActive();
}

function showFabTemporarily(durationMs = FAB_EDGE_PEEK_MS) {
  fabController.showTemporarily(durationMs);
}

function setFabCollapsed(collapsed) {
  fabController.setCollapsed(collapsed);
}

function scheduleFabCollapse() {
  fabController.scheduleCollapse();
}

function pokeFabInteraction() {
  fabController.pokeInteraction();
}

function syncFabInsideCard() {
  fabController.syncInsideCard();
}

function drawRoundedRect(x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawHalfOpenDisk(cx, cy, radius, strokeStyle, shadowColor, phase = 0, rotationSpeed = 1.6, gapScale = 0.14) {
  const gap = Math.PI * gapScale;
  const rotation = state.blinkTime * rotationSpeed + (phase || 0) * 0.35;
  const closeToFullCircle = state.contactOpen || !state.running || gapScale <= 0;
  const start = closeToFullCircle ? 0 : rotation + gap * 0.5;
  const end = closeToFullCircle ? Math.PI * 2 : rotation + Math.PI * 2 - gap * 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = Math.max(1.6, radius * 0.38);
  ctx.shadowBlur = 6;
  ctx.shadowColor = shadowColor;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawVoronoiCell(targetCtx, cx, cy, radius, row, col, styleSeed, fillStyle) {
  const corners = 6;
  const angleBase = hashed01(row + 1, col + 1, styleSeed + 17) * Math.PI * 2;
  targetCtx.beginPath();
  for (let i = 0; i < corners; i += 1) {
    const t = i / corners;
    const angle = angleBase + t * Math.PI * 2;
    const jitter = (hashed01(row + i + 3, col + i * 2 + 7, styleSeed + 29) - 0.5) * radius * 0.4;
    const localR = radius * (0.86 + hashed01(row + i + 11, col + i + 13, styleSeed + 47) * 0.28) + jitter;
    const x = cx + Math.cos(angle) * localR;
    const y = cy + Math.sin(angle) * localR;
    if (i === 0) targetCtx.moveTo(x, y);
    else targetCtx.lineTo(x, y);
  }
  targetCtx.closePath();
  targetCtx.fillStyle = fillStyle;
  targetCtx.fill();
}

function getRotatedQrIndex(row, col, qrSize, quarterTurns = 0) {
  const turns = ((quarterTurns % 4) + 4) % 4;
  if (turns === 1) return { row: col, col: qrSize - 1 - row };
  if (turns === 2) return { row: qrSize - 1 - row, col: qrSize - 1 - col };
  if (turns === 3) return { row: qrSize - 1 - col, col: row };
  return { row, col };
}

function getQrModuleCenter(bounds, moduleSize, moduleGap, row, col, qrSize, quarterTurns = 0) {
  const mapped = getRotatedQrIndex(row, col, qrSize, quarterTurns);
  return {
    x: bounds.left + mapped.col * (moduleSize + moduleGap) + moduleSize / 2,
    y: bounds.top + mapped.row * (moduleSize + moduleGap) + moduleSize / 2,
  };
}

function drawAbstractQrModule(targetCtx, options) {
  const {
    x,
    y,
    moduleSize,
    row,
    col,
    qrSize,
    style,
    ink,
    glow,
    animate,
    moduleScale,
    gapScale,
    staticOpen,
  } = options;

  const normalizedStyle = QR_ABSTRACTION_STYLES.includes(style) ? style : DEFAULT_QR_ABSTRACTION_STYLE;
  const activeStyle = normalizedStyle;
  const styleSeed = contactSeed();
  const radius = Math.max(1.6, moduleSize * 0.42 * (moduleScale || 1));

  targetCtx.save();
  if (glow) {
    targetCtx.shadowBlur = Math.max(0, moduleSize * 0.45);
    targetCtx.shadowColor = glow;
  }

  if (activeStyle === "voronoi") {
    drawVoronoiCell(targetCtx, x, y, radius, row, col, styleSeed, ink);
  } else if (activeStyle === "rings") {
    const resolvedGap = typeof gapScale === "number"
      ? Math.max(0, gapScale)
      : (0.2 + hashed01(row + 5, col + 7, 61) * 0.16);
    const gap = Math.PI * resolvedGap;
    const spin = (hashed01(row + 9, col + 11, 83) - 0.5) * 0.9;
    // In contact/static mode keep a fixed opening direction to avoid a swirled look.
    const rotation = animate
      ? (state.blinkTime * spin) + hashed01(row + 3, col + 2, 37) * Math.PI * 2
      : 0;
    const closeToFullCircle = !animate && !(staticOpen && gap > 0.0001);
    targetCtx.beginPath();
    targetCtx.arc(
      x,
      y,
      radius,
      closeToFullCircle ? 0 : rotation + gap * 0.5,
      closeToFullCircle ? Math.PI * 2 : rotation + Math.PI * 2 - gap * 0.5
    );
    targetCtx.strokeStyle = ink;
    targetCtx.lineWidth = Math.max(1.2, radius * 0.42);
    targetCtx.stroke();
  } else {
    const side = Math.max(2, moduleSize * 0.8);
    targetCtx.fillStyle = ink;
    targetCtx.fillRect(x - side * 0.5, y - side * 0.5, side, side);
  }

  targetCtx.restore();
}

function renderStylizedQrToCanvas(qrMatrix, style, targetSize = 520) {
  const out = document.createElement("canvas");
  out.width = targetSize;
  out.height = targetSize;
  const outCtx = out.getContext("2d");
  outCtx.fillStyle = "#ffffff";
  outCtx.fillRect(0, 0, targetSize, targetSize);

  const qrSize = qrMatrix.length;
  const margin = Math.max(26, Math.floor(targetSize * 0.08));
  const moduleSize = (targetSize - margin * 2) / qrSize;

  for (let row = 0; row < qrSize; row += 1) {
    for (let col = 0; col < qrSize; col += 1) {
      if (!qrMatrix[row][col]) continue;
      const mapped = getRotatedQrIndex(row, col, qrSize, QR_ROTATION_QUARTERS);
      const x = margin + (mapped.col + 0.5) * moduleSize;
      const y = margin + (mapped.row + 0.5) * moduleSize;
      drawAbstractQrModule(outCtx, {
        x,
        y,
        moduleSize,
        row,
        col,
        qrSize,
        style,
        ink: "#000000",
        glow: null,
        animate: false,
      });
    }
  }

  return out;
}

async function detectQrPayload(canvasEl) {
  if (typeof window.BarcodeDetector !== "function") return null;
  try {
    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    const detected = await detector.detect(canvasEl);
    if (!detected || !detected.length) return "";
    return detected[0].rawValue || "";
  } catch (_error) {
    return "";
  }
}

async function runQrReadabilitySuite(qrMatrix) {
  if (!Array.isArray(qrMatrix) || !qrMatrix.length) return;

  state.qrReadability.running = true;
  syncHud();

  if (typeof window.BarcodeDetector !== "function") {
    state.qrReadability = {
      running: false,
      detector: "unavailable",
      results: null,
      testedAt: Date.now(),
    };
    syncHud();
    return;
  }

  const results = {};
  for (const style of QR_ABSTRACTION_STYLES) {
    const rendered = renderStylizedQrToCanvas(qrMatrix, style);
    const decoded = await detectQrPayload(rendered);
    results[style] = decoded === CONTACT_PAYLOAD;
  }

  state.qrReadability = {
    running: false,
    detector: "available",
    results,
    testedAt: Date.now(),
  };
  state.qrRenderStyle = "rings";

  syncHud();
  syncGameUi();
  draw();
}

function isGameplayQrBrick(brick) {
  return !!(brick && brick.alive && brick.active && brick.row >= 0 && brick.col >= 0 && !brick.textPattern);
}

function isMeshActivated() {
  return state.running && !state.paused && !state.gameOver;
}

function meshNodeKey(row, col) {
  return `${row}:${col}`;
}

function hashed01(a, b, c = 0) {
  return pseudoRandom01((a * 12.9898 + b * 78.233 + c * 37.719) * 0.137);
}

function baseDiscScale(a, b, c = 0) {
  return 0.22 + hashed01(a, b, c) * 0.58;
}

function getRasterProfile(row, col) {
  const sizeScale = RASTER_SIZE_MIN + hashed01(row + 1, col + 1, 19) * Math.max(0.01, RASTER_SIZE_MAX - RASTER_SIZE_MIN);
  const open = hashed01(row + 1, col + 1, 211) > RASTER_OPEN_THRESHOLD;
  const magenta = hashed01(row + 1, col + 1, 307) > RASTER_MAGENTA_THRESHOLD;
  return { sizeScale, open, magenta };
}

function getTileGridGeometry(layout) {
  return {
    x: layout.cardX,
    y: layout.cardY,
    w: layout.cardW,
    h: layout.cardH,
    cols: TILE_GRID_COLS,
    rows: TILE_GRID_ROWS,
  };
}

function gridNodeKey(col, row) {
  return `${col}:${row}`;
}

function getGridNode(col, row) {
  const key = gridNodeKey(col, row);
  let node = state.gridNodes[key];
  if (!node) {
    node = { dx: 0, dy: 0, vx: 0, vy: 0 };
    state.gridNodes[key] = node;
  }
  return node;
}

function getGridNodePosition(layout, col, row) {
  const grid = getTileGridGeometry(layout);
  const baseX = grid.x + (grid.w * col) / grid.cols;
  const baseY = grid.y + (grid.h * row) / grid.rows;
  const node = getGridNode(col, row);
  return {
    x: baseX + node.dx,
    y: baseY + node.dy,
  };
}

function applyGridImpactAt(x, y, magnitude = 1) {
  const layout = getContactCardLayout(state.qrBounds.width, state.qrBounds.height);
  const grid = getTileGridGeometry(layout);
  const radius = Math.min(grid.w, grid.h) * 0.42;
  const maxShift = 34;

  for (let col = 0; col <= grid.cols; col += 1) {
    for (let row = 0; row <= grid.rows; row += 1) {
      const baseX = grid.x + (grid.w * col) / grid.cols;
      const baseY = grid.y + (grid.h * row) / grid.rows;
      const node = getGridNode(col, row);
      const nx = baseX + node.dx;
      const ny = baseY + node.dy;
      const dx = nx - x;
      const dy = ny - y;
      const dist = Math.hypot(dx, dy) || 1;
      const influence = Math.max(0, 1 - dist / radius);
      if (influence <= 0) continue;

      const impulse = influence * influence * (0.45 + magnitude * 1.25);
      node.vx += (dx / dist) * impulse;
      node.vy += (dy / dist) * impulse;
      node.dx += (dx / dist) * impulse * 0.38;
      node.dy += (dy / dist) * impulse * 0.38;

      node.dx = clamp(node.dx, -maxShift, maxShift);
      node.dy = clamp(node.dy, -maxShift, maxShift);
    }
  }
}

function updateGridDeformation(dt) {
  if (LOW_POWER_MODE) return;
  if (!state.running || state.paused || state.contactOpen) return;

  applyGridImpactAt(state.ball.x, state.ball.y, 0.9);
  for (const b of state.extraBalls) {
    applyGridImpactAt(b.x, b.y, 0.55);
  }

  const layout = getContactCardLayout(state.qrBounds.width, state.qrBounds.height);
  const grid = getTileGridGeometry(layout);
  const velocityDamping = Math.pow(0.86, dt * 60);
  const spring = Math.min(0.22, dt * 7.8);
  const maxShift = 34;
  let accumulated = 0;
  let count = 0;

  for (let col = 0; col <= grid.cols; col += 1) {
    for (let row = 0; row <= grid.rows; row += 1) {
      const node = getGridNode(col, row);
      node.vx *= velocityDamping;
      node.vy *= velocityDamping;
      node.dx += node.vx;
      node.dy += node.vy;
      node.dx += (0 - node.dx) * spring;
      node.dy += (0 - node.dy) * spring;
      node.dx = clamp(node.dx, -maxShift, maxShift);
      node.dy = clamp(node.dy, -maxShift, maxShift);
      accumulated += Math.hypot(node.dx, node.dy);
      count += 1;
    }
  }

  for (let col = 0; col <= grid.cols; col += 1) {
    for (let row = 0; row <= grid.rows; row += 1) {
      const center = getGridNode(col, row);
      const neighbors = [
        state.gridNodes[gridNodeKey(col - 1, row)],
        state.gridNodes[gridNodeKey(col + 1, row)],
        state.gridNodes[gridNodeKey(col, row - 1)],
        state.gridNodes[gridNodeKey(col, row + 1)],
      ].filter(Boolean);
      if (!neighbors.length) continue;
      const avgDx = neighbors.reduce((sum, n) => sum + n.dx, 0) / neighbors.length;
      const avgDy = neighbors.reduce((sum, n) => sum + n.dy, 0) / neighbors.length;
      center.dx += (avgDx - center.dx) * 0.052;
      center.dy += (avgDy - center.dy) * 0.052;
    }
  }

  state.gridEnergy = count ? accumulated / count : 0;
}

function sampleGridLensingForce(x, y) {
  const layout = getContactCardLayout(state.qrBounds.width, state.qrBounds.height);
  const grid = getTileGridGeometry(layout);
  let fx = 0;
  let fy = 0;

  for (let col = 0; col <= grid.cols; col += 1) {
    for (let row = 0; row <= grid.rows; row += 1) {
      const baseX = grid.x + (grid.w * col) / grid.cols;
      const baseY = grid.y + (grid.h * row) / grid.rows;
      const node = getGridNode(col, row);
      const mass = Math.hypot(node.dx, node.dy);
      if (mass < 0.22) continue;

      const nx = baseX + node.dx;
      const ny = baseY + node.dy;
      const dx = nx - x;
      const dy = ny - y;
      const distSq = dx * dx + dy * dy + 320;
      const strength = Math.min(2800, mass * 310) / distSq;
      fx += dx * strength;
      fy += dy * strength;
    }
  }

  return { fx, fy };
}

function applyRelativityLensing(ball, dt) {
  if (!ENABLE_RELATIVITY_LENSING) return;
  if (LOW_POWER_MODE) return;
  if (!state.running || state.paused || state.contactOpen) return;
  const speed = Math.hypot(ball.dx, ball.dy) || ball.speedBase || state.ball.speedBase;
  const force = sampleGridLensingForce(ball.x, ball.y);
  if (Math.abs(force.fx) < 1e-6 && Math.abs(force.fy) < 1e-6) return;

  ball.dx += force.fx * dt * 42;
  ball.dy += force.fy * dt * 42;

  const adjustedSpeed = Math.hypot(ball.dx, ball.dy) || 1;
  const scale = speed / adjustedSpeed;
  ball.dx *= scale;
  ball.dy *= scale;
}

function getMeshNode(row, col) {
  const key = meshNodeKey(row, col);
  let node = state.meshNodes[key];
  if (!node) {
    node = { dx: 0, dy: 0, vx: 0, vy: 0 };
    state.meshNodes[key] = node;
  }
  return node;
}

function meshOffsetForPoint(row, col, px, py, phase = 0) {
  const node = getMeshNode(row, col);
  const active = isMeshActivated();
  const waveX = active ? Math.sin(py * 0.018 + state.blinkTime * 1.2 + phase * 0.6) * 0.24 : 0;
  const waveY = active ? Math.cos(px * 0.016 + state.blinkTime * 1.0 + phase * 0.6) * 0.2 : 0;
  return {
    x: node.dx + waveX,
    y: node.dy + waveY,
  };
}

function applyMeshImpactAt(x, y, magnitude = 1) {
  const qrBricks = state.bricks.filter(isGameplayQrBrick);
  if (!qrBricks.length) return;

  const radius = 164;
  const maxShift = 24;
  for (const brick of qrBricks) {
    const node = getMeshNode(brick.row, brick.col);
    const cx = brick.x + brick.w * 0.5;
    const cy = brick.y + brick.h * 0.5;
    const dx = cx - x;
    const dy = cy - y;
    const dist = Math.hypot(dx, dy) || 1;
    const influence = Math.max(0, 1 - dist / radius);
    if (influence <= 0) continue;

    const impulse = influence * influence * (0.8 + magnitude * 1.35);
    node.vx += (dx / dist) * impulse;
    node.vy += (dy / dist) * impulse;

    if (state.contactOpen) {
      const baseScale = getRasterProfile(brick.row, brick.col).sizeScale;
      const touchBand = Math.floor((x + y + state.blinkTime * 240) / 42);
      const clusterNoise = hashed01(brick.row + 1, brick.col + 1, touchBand + 97);
      const inCluster = clusterNoise > 0.56;
      const pushGrow = influence * influence * (inCluster ? 0.24 : 0.08) * Math.max(0.7, magnitude);
      const grown = Math.min(0.96, (brick.circleScale || baseScale) + pushGrow);
      brick.circleScale = grown;
    }

    node.dx = Math.max(-maxShift, Math.min(maxShift, node.dx));
    node.dy = Math.max(-maxShift, Math.min(maxShift, node.dy));
  }
}

function updateMeshDeformation(dt) {
  if (LOW_POWER_MODE) return;
  if (!state.running && !state.contactOpen) return;

  // In contact view keep deformation fluid and repelling, without swirl-like coupling.
  if (state.contactOpen) {
    const velocityDamping = Math.pow(0.82, dt * 60);
    const spring = Math.min(0.24, dt * 8.2);
    const maxShift = 24;
    let accumulated = 0;
    let count = 0;

    for (const brick of state.bricks) {
      if (!isGameplayQrBrick(brick)) continue;
      const node = getMeshNode(brick.row, brick.col);
      node.vx *= velocityDamping;
      node.vy *= velocityDamping;
      node.dx += node.vx;
      node.dy += node.vy;
      node.dx += (0 - node.dx) * spring;
      node.dy += (0 - node.dy) * spring;
      node.dx = Math.max(-maxShift, Math.min(maxShift, node.dx));
      node.dy = Math.max(-maxShift, Math.min(maxShift, node.dy));
      const baseScale = getRasterProfile(brick.row, brick.col).sizeScale;
      const currentScale = brick.circleScale || baseScale;
      brick.circleScale = currentScale + (baseScale - currentScale) * Math.min(0.16, dt * 5.2);
      accumulated += Math.hypot(node.dx, node.dy);
      count += 1;
    }

    state.meshEnergy = count ? accumulated / count : 0;
    return;
  }

  if (state.paused) return;

  applyMeshImpactAt(state.ball.x, state.ball.y, 1.2);
  for (const b of state.extraBalls) {
    applyMeshImpactAt(b.x, b.y, 0.9);
  }

  const velocityDamping = Math.pow(0.9, dt * 60);
  const maxShift = 24;
  let accumulated = 0;
  let count = 0;
  for (const brick of state.bricks) {
    if (!isGameplayQrBrick(brick)) continue;
    const node = getMeshNode(brick.row, brick.col);
    node.vx *= velocityDamping;
    node.vy *= velocityDamping;
    node.dx = Math.max(-maxShift, Math.min(maxShift, node.dx + node.vx));
    node.dy = Math.max(-maxShift, Math.min(maxShift, node.dy + node.vy));
    accumulated += Math.hypot(node.dx, node.dy);
    count += 1;
  }

  // Light neighbor coupling keeps the net coherent while preserving deformation memory.
  for (const brick of state.bricks) {
    if (!isGameplayQrBrick(brick)) continue;
    const center = getMeshNode(brick.row, brick.col);
    const neighbors = [
      state.meshNodes[meshNodeKey(brick.row, brick.col + 1)],
      state.meshNodes[meshNodeKey(brick.row, brick.col - 1)],
      state.meshNodes[meshNodeKey(brick.row + 1, brick.col)],
      state.meshNodes[meshNodeKey(brick.row - 1, brick.col)],
    ].filter(Boolean);
    if (!neighbors.length) continue;
    const avgDx = neighbors.reduce((sum, n) => sum + n.dx, 0) / neighbors.length;
    const avgDy = neighbors.reduce((sum, n) => sum + n.dy, 0) / neighbors.length;
    center.dx += (avgDx - center.dx) * 0.03;
    center.dy += (avgDy - center.dy) * 0.03;
  }

  state.meshEnergy = count ? accumulated / count : 0;
}

function drawImpressumInfo(layout) {
  if (!state.contactOpen) return;
  const narrowScreen = ContactLayoutEngine.isNarrowScreen();
  const x = layout.cardX + (narrowScreen ? 18 : 28);
  const lineH = narrowScreen ? 22 : 28;
  let y = layout.cardY + (narrowScreen ? 28 : 40);
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const infoLines = [
    { text: PERSON_NAME, weight: "700", size: narrowScreen ? 15 : 18, color: "rgba(246, 251, 255, 0.96)", advance: lineH },
    { text: ORG_TITLE, weight: "400", size: narrowScreen ? 11 : 13, color: "rgba(200, 230, 255, 0.82)", advance: lineH * 1.3 },
    { text: CONTACT_EMAIL, weight: "400", size: narrowScreen ? 10 : 12, color: "rgba(180, 210, 255, 0.72)", advance: lineH },
    { text: CONTACT_WEBSITE, weight: "400", size: narrowScreen ? 10 : 12, color: "rgba(180, 210, 255, 0.72)", advance: lineH * 1.4 },
  ];

  for (const line of infoLines) {
    ctx.font = `${line.weight} ${line.size}px ${UI_FONT_FAMILY}`;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, x, y);
    y += line.advance;
  }

  ctx.font = `500 ${narrowScreen ? 9 : 10}px ${UI_FONT_FAMILY}`;
  ctx.fillStyle = "rgba(180, 210, 255, 0.44)";
  ctx.letterSpacing = "0.12em";
  ctx.fillText(CONTACT_HINT_LINE_1, x, y);
  y += lineH * 0.9;

  ctx.font = `${narrowScreen ? 8 : 9}px ${UI_FONT_FAMILY}`;
  ctx.fillStyle = "rgba(196, 224, 255, 0.52)";
  ctx.fillText(CONTACT_HINT_LINE_2, x, y);

  ctx.restore();
}

function drawTileBoard(layout) {
  const grid = getTileGridGeometry(layout);
  const x = grid.x;
  const y = grid.y;
  const w = grid.w;
  const h = grid.h;
  const cols = grid.cols;
  const rows = grid.rows;

  ctx.fillStyle = "rgba(10, 24, 50, 0.74)";
  ctx.fillRect(x, y, w, h);

  ctx.save();
  const tension = 0.14 + Math.min(0.18, state.gridEnergy * 0.015);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 1.1;

  for (let c = 1; c < cols; c += 1) {
    const first = getGridNodePosition(layout, c, 0);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let r = 1; r <= rows; r += 1) {
      const p = getGridNodePosition(layout, c, r);
      const prev = getGridNodePosition(layout, c, r - 1);
      const cx = prev.x + (p.x - prev.x) * tension;
      const cy = prev.y + (p.y - prev.y) * tension;
      ctx.quadraticCurveTo(cx, cy, p.x, p.y);
    }
    ctx.stroke();
  }

  for (let r = 1; r < rows; r += 1) {
    const first = getGridNodePosition(layout, 0, r);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let c = 1; c <= cols; c += 1) {
      const p = getGridNodePosition(layout, c, r);
      const prev = getGridNodePosition(layout, c - 1, r);
      const cx = prev.x + (p.x - prev.x) * tension;
      const cy = prev.y + (p.y - prev.y) * tension;
      ctx.quadraticCurveTo(cx, cy, p.x, p.y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(214, 236, 255, 0.7)";
  for (let c = 0; c <= cols; c += 1) {
    for (let r = 0; r <= rows; r += 1) {
      const node = getGridNodePosition(layout, c, r);
      const model = getGridNode(c, r);
      const radius = 1.1 + Math.min(1.7, Math.hypot(model.dx, model.dy) * 0.05);
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
}

function drawDeformableQrMesh() {
  const qrBricks = state.bricks.filter(isGameplayQrBrick);
  if (!qrBricks.length) return;

  const lookup = new Map();
  for (const brick of qrBricks) {
    lookup.set(`${brick.row}:${brick.col}`, brick);
  }

  const centers = new Map();
  for (const brick of qrBricks) {
    const cx = brick.x + brick.w * 0.5;
    const cy = brick.y + brick.h * 0.5;
    const offset = meshOffsetForPoint(brick.row, brick.col, cx, cy, brick.phase || 0);
    centers.set(`${brick.row}:${brick.col}`, { x: cx + offset.x, y: cy + offset.y, brick });
  }

  ctx.save();
  if (DRAW_MESH_LINKS) {
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    for (const [key, node] of centers) {
      const [row, col] = key.split(":").map(Number);
      const right = centers.get(`${row}:${col + 1}`);
      const down = centers.get(`${row + 1}:${col}`);
      if (right) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      if (down) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(down.x, down.y);
        ctx.stroke();
      }
    }
  }

  const energyFactor = 1 + Math.min(0.4, state.meshEnergy * 0.04);
  for (const node of centers.values()) {
    const brick = node.brick;
    const isMarked = !!brick.mulMark;
    const isSplitter = !!brick.splitter;
    const nodeModel = getMeshNode(brick.row, brick.col);
    const motionFactor = 1 + Math.min(0.35, Math.hypot(nodeModel.dx, nodeModel.dy) * 0.025);
    const profile = getRasterProfile(brick.row, brick.col);
    const individualScale = brick.baseScale || profile.sizeScale;
    const radius = Math.max(1.8, state.qrModuleSize * individualScale * motionFactor * energyFactor);
    const baseSpin = 0.85 + (((brick.row * 17 + brick.col * 13) % 100) / 100) * 1.35;
    const direction = (brick.row + brick.col) % 2 === 0 ? 1 : -1;
    const rotationSpeed = isMeshActivated() ? baseSpin * direction : 0;
    const magentaAccent = isMarked || isSplitter || profile.magenta;
    const gapScale = profile.open ? 0.24 : 0;
    drawHalfOpenDisk(
      node.x,
      node.y,
      radius,
      magentaAccent ? "#ff4df5" : "#ffffff",
      magentaAccent ? "rgba(255, 77, 245, 0.45)" : "rgba(255, 255, 255, 0.3)",
      brick.phase || 0,
      rotationSpeed,
      gapScale
    );
  }

  // Keep raster source tied to level-1 typography glyph bricks as part of the same mesh language.
  const textBricks = state.bricks.filter((brick) => !!(brick && brick.alive && brick.active && brick.textPattern));
  for (const brick of textBricks) {
    const cx = brick.x + brick.w * 0.5;
    const cy = brick.y + brick.h * 0.5;
    const profile = getRasterProfile(Math.floor(cx), Math.floor(cy));
    const radius = Math.max(1.4, Math.min(brick.w, brick.h) * (brick.circleScale || profile.sizeScale) * 0.58);
    const accent = profile.magenta;
    drawHalfOpenDisk(
      cx,
      cy,
      radius,
      accent ? "#ff4df5" : "#ffffff",
      accent ? "rgba(255, 77, 245, 0.36)" : "rgba(255, 255, 255, 0.26)",
      brick.phase || 0,
      0,
      profile.open ? 0.24 : 0
    );
  }
  ctx.restore();
}

function drawQrBrick(brick) {
  const { x, y, w, h } = brick;
  if (state.contactOpen) {
    const radius = Math.max(3.2, Math.min(w, h) * (brick.circleScale || 0.42));
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.save();
    const isMarked = !!brick.mulMark;
    drawHalfOpenDisk(
      cx,
      cy,
      radius,
      isMarked ? "#ff4df5" : "#ffffff",
      isMarked ? "rgba(255, 77, 245, 0.45)" : "rgba(255, 255, 255, 0.28)",
      brick.phase
    );
    if (isMarked) {
      ctx.fillStyle = "#ff4df5";
      ctx.font = `${Math.max(9, Math.floor(radius * 1.8))}px "SF Mono", "Fira Code", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\u00D7", cx, cy + 0.5);
    }
    ctx.restore();
    return;
  }

  const cyan = "#ffffff";
  const magenta = "#ff4df5";
  const blink = 1;
  const points = [state.ball, ...state.extraBalls];
  let proximity = 0;
  for (const source of points) {
    if (!source) continue;
    const dist = Math.hypot((x + w * 0.5) - source.x, (y + h * 0.5) - source.y);
    proximity = Math.max(proximity, Math.max(0, 1 - dist / 180));
  }
  const dynamicFactor = 1 + Math.min(0.4, state.meshEnergy * 0.05) + proximity * 0.25;
  const radius = Math.max(3.2, Math.min(w, h) * (brick.circleScale || 0.68) * dynamicFactor);
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (brick.catcher) {
    const notch = Math.PI * 0.24;
    const rotation = state.blinkTime * (brick.spinSpeed || 0);
    const start = brick.notchAngle + rotation + notch * 0.5;
    const end = brick.notchAngle + rotation + Math.PI * 2 - notch * 0.5;
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.lineWidth = Math.max(2, radius * 0.34);
    ctx.strokeStyle = brick.splitter ? magenta : cyan;
    ctx.shadowBlur = brick.splitter ? 10 : 7;
    ctx.shadowColor = brick.splitter ? "rgba(255, 77, 245, 0.45)" : "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalAlpha = blink;
  const isMarked = !!brick.mulMark;
  drawHalfOpenDisk(
    cx,
    cy,
    radius,
    isMarked ? magenta : cyan,
    isMarked ? "rgba(255, 77, 245, 0.45)" : "rgba(255, 255, 255, 0.3)",
    brick.phase,
    1.6,
    0.24
  );
  if (isMarked) {
    ctx.fillStyle = magenta;
    ctx.font = `${Math.max(9, Math.floor(radius * 1.8))}px "SF Mono", "Fira Code", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u00D7", cx, cy + 0.5);
  }
  ctx.restore();
}

function drawExplosion(effect) {
  const progress = 1 - effect.life / effect.maxLife;
  const alpha = Math.max(0, effect.life / effect.maxLife);
  const radius = effect.radius * (0.55 + progress * 1.4);
  const tail = effect.radius * (0.8 + progress * 1.6);
  const fillStyle = effect.fillStyle || "rgba(255, 108, 245, 0.32)";
  const strokeStyle = effect.strokeStyle || "rgba(191, 248, 255, 0.92)";
  const shadowColor = effect.shadowColor || strokeStyle;

  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.beginPath();
  ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  ctx.globalAlpha = alpha;
  ctx.lineWidth = Math.max(1.4, effect.radius * 0.18);
  ctx.strokeStyle = strokeStyle;
  ctx.shadowBlur = effect.ruleLightning ? 18 : 0;
  ctx.shadowColor = shadowColor;
  ctx.beginPath();
  ctx.moveTo(effect.x, effect.y);
  ctx.lineTo(effect.x + effect.dx * tail, effect.y + effect.dy * tail);
  ctx.stroke();
  ctx.restore();
}

function updateBallTrail(dt) {
  const speed = Math.hypot(state.ball.dx, state.ball.dy);
  const targetLength = speed > 180 ? 22 : 16;
  state.ballTrail.unshift({ x: state.ball.x, y: state.ball.y, life: 1 });
  if (state.ballTrail.length > targetLength) {
    state.ballTrail.length = targetLength;
  }

  const decay = Math.max(0.09, dt * 2.2);
  state.ballTrail = state.ballTrail
    .map((node) => ({ x: node.x, y: node.y, life: node.life - decay }))
    .filter((node) => node.life > 0);
}

function drawBallWithTrail() {
  const b = state.ball;
  const max = Math.max(1, state.ballTrail.length);

  for (let i = 0; i < state.ballTrail.length; i += 1) {
    const node = state.ballTrail[i];
    const t = 1 - i / max;
    const alpha = Math.max(0, node.life) * t * 0.56;
    const r = Math.max(2.2, b.r * (0.34 + t * 0.52));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff7bf8";
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(255, 77, 245, 0.45)";
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.shadowBlur = 28;
  ctx.shadowColor = "rgba(255, 77, 245, 0.75)";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r + 1.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 77, 245, 0.34)";
  ctx.fill();

  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(255, 170, 248, 0.66)";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4df5";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 236, 253, 0.86)";
  ctx.stroke();
  ctx.restore();
}

function drawAuxBall(ball) {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = "rgba(255, 77, 245, 0.52)";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r * 0.94, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 77, 245, 0.9)";
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(255, 219, 252, 0.75)";
  ctx.stroke();
  ctx.restore();
}

function spawnTripleBallsFromBall(sourceBall) {
  const speed = Math.max(sourceBall.speedBase || state.ball.speedBase, Math.hypot(sourceBall.dx, sourceBall.dy));
  const baseAngle = Math.atan2(sourceBall.dy, sourceBall.dx);
  const spread = 0.32;
  sourceBall.dx = Math.cos(baseAngle) * speed;
  sourceBall.dy = Math.sin(baseAngle) * speed;

  state.extraBalls = [-spread, spread].map((offset) => {
    const angle = baseAngle + offset;
    return {
      x: sourceBall.x,
      y: sourceBall.y,
      r: sourceBall.r,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      speedBase: sourceBall.speedBase || state.ball.speedBase,
    };
  });
}

function spawnExplosion(brick, directionX, directionY, intensity = 1, options = {}) {
  const length = Math.hypot(directionX, directionY) || 1;
  state.explosions.push({
    x: brick.x + brick.w / 2,
    y: brick.y + brick.h / 2,
    dx: directionX / length,
    dy: directionY / length,
    radius: Math.max(brick.w, brick.h) * (0.7 + intensity * 0.7),
    life: 0.34 + intensity * 0.08,
    maxLife: 0.34 + intensity * 0.08,
    fillStyle: options.fillStyle,
    strokeStyle: options.strokeStyle,
    shadowColor: options.shadowColor,
    ruleLightning: !!options.ruleLightning,
  });
}

function destroyBrick(brick, options = {}) {
  if (!brick || !brick.alive || !brick.active) return false;

  brick.alive = false;
  brick.active = false;
  brick.pendingBlast = false;
  state.patternHits += 1;
  if (options.countHit !== false) {
    state.levelHits += 1;
  }
  state.score += options.score ?? 100;
  spawnExplosion(brick, options.directionX ?? 0, options.directionY ?? -1, options.intensity ?? 1, {
    fillStyle: options.fillStyle,
    strokeStyle: options.strokeStyle,
    shadowColor: options.shadowColor,
    ruleLightning: options.ruleLightning,
  });
  return true;
}

function brickKey(row, col) {
  return `${row}:${col}`;
}

function findBrickByCell(row, col) {
  return state.bricks.find((brick) => brick.row === row && brick.col === col);
}

function startAutomataBurst(originBrick, directionX, directionY) {
  const length = Math.hypot(directionX, directionY) || 1;
  const nx = directionX / length;
  const ny = directionY / length;
  const ruleLightning = isRuleLightningLevel();
  state.automataBursts.push({
    directionX: nx,
    directionY: ny,
    stepTimer: 0,
    stepInterval: 0.06,
    ttl: ruleLightning ? 12 : 9,
    frontier: new Set([brickKey(originBrick.row, originBrick.col)]),
    visited: new Set([brickKey(originBrick.row, originBrick.col)]),
    ruleLightning,
  });
}

function remainingBricks() {
  return state.bricks.reduce((count, brick) => count + (brick.alive && brick.active ? 1 : 0), 0);
}

function updateExplosions(dt) {
  state.explosions = state.explosions.filter((effect) => {
    effect.life -= dt;
    return effect.life > 0;
  });
}

function updateAutomataBursts(dt) {
  if (!state.automataBursts.length) return;

  let changed = false;
  const survivors = [];

  for (const burst of state.automataBursts) {
    burst.stepTimer += dt;
    if (burst.stepTimer < burst.stepInterval) {
      survivors.push(burst);
      continue;
    }

    burst.stepTimer = 0;
    burst.ttl -= 1;

    const candidateScores = new Map();
    for (const key of burst.frontier) {
      const [row, col] = key.split(":").map(Number);
      for (let dRow = -1; dRow <= 1; dRow += 1) {
        for (let dCol = -1; dCol <= 1; dCol += 1) {
          if (dRow === 0 && dCol === 0) continue;
          const nextRow = row + dRow;
          const nextCol = col + dCol;
          const nextKey = brickKey(nextRow, nextCol);
          if (burst.visited.has(nextKey)) continue;

          const alignment = (dCol * burst.directionX) + (dRow * burst.directionY);
          const lateral = Math.abs((dCol * -burst.directionY) + (dRow * burst.directionX));
          const score = alignment * 1.4 - lateral * 0.55;

          if (score < -0.35) continue;
          candidateScores.set(nextKey, Math.max(candidateScores.get(nextKey) ?? -Infinity, score));
        }
      }
    }

    const nextFrontier = new Set();
    for (const [key, score] of candidateScores) {
      const [row, col] = key.split(":").map(Number);
      const brick = findBrickByCell(row, col);
      burst.visited.add(key);
      if (!brick || !brick.alive || !brick.active) continue;

      const intensity = Math.max(0.35, Math.min(1.2, 0.6 + score * 0.35));
      if (destroyBrick(brick, {
        directionX: burst.directionX,
        directionY: burst.directionY,
        intensity,
        fillStyle: burst.ruleLightning ? "rgba(255, 77, 245, 0.42)" : undefined,
        strokeStyle: burst.ruleLightning ? "rgba(255, 77, 245, 0.96)" : undefined,
        shadowColor: burst.ruleLightning ? "rgba(255, 77, 245, 0.72)" : undefined,
        ruleLightning: burst.ruleLightning,
      })) {
        changed = true;
        nextFrontier.add(key);
      }
    }

    if (nextFrontier.size > 0 && burst.ttl > 0) {
      burst.frontier = nextFrontier;
      survivors.push(burst);
    }
  }

  state.automataBursts = survivors;
  if (!changed) return;
  syncPeriodicUnlockState();
  syncHud();

  const target = currentLevelTarget();
  if (!isPerimeterChallengeActive() && target && state.levelHits >= target) {
    nextLevel();
    return;
  }

  if (remainingBricks() > 0) return;

  if (!isPerimeterChallengeActive() && state.levelHits < (target ?? 0)) {
    resetCurrentLevelLayout();
    return;
  }

  nextLevel();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const layout = getContactCardLayout(state.qrBounds.width, state.qrBounds.height);
  ctx.save();
  ctx.fillStyle = "#06142d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!state.initialized) {
    ctx.save();
    ctx.fillStyle = "rgba(10, 28, 58, 0.96)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.font = '24px "SF Mono", "Fira Code", ui-monospace, monospace';
    ctx.textAlign = "center";
    ctx.fillText("Loading contact QR...", canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }

  if (state.contactOpen) {
    drawHighResContactCard(layout);
    ctx.restore();
    return;
  }

  drawTileBoard(layout);
  drawDeformableQrMesh();
  drawImpressumInfo(layout);

  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    if (isGameplayQrBrick(brick)) continue;
    if (brick.textPattern) continue;
    drawQrBrick(brick);
  }

  drawQrBoundary();

  for (const effect of state.explosions) {
    drawExplosion(effect);
  }

  if (!state.contactOpen) {
    drawSlider();
    drawBallWithTrail();
    for (const extraBall of state.extraBalls) {
      drawAuxBall(extraBall);
    }
  }
}

function clampPaddle() {
  state.paddle.x = Math.max(0, Math.min(canvas.width - state.paddle.w, state.paddle.x));
}

function updatePaddle(dt) {
  let steer = 0;
  if (state.keys.left) steer -= 1;
  if (state.keys.right) steer += 1;
  if (Math.abs(state.touchSteer) > Math.abs(steer)) {
    steer = state.touchSteer;
  }

  if (isPerimeterChallengeActive()) {
    const perimeterSpeed = state.paddle.speed * 0.85;
    const travel = perimeterSpeed * steer * dt;
    if (travel) advancePerimeterSlider(travel);
    return;
  }

  state.paddle.dx = state.paddle.speed * steer;
  state.paddle.x += state.paddle.dx * dt;
  clampPaddle();
}

function loseLife() {
  state.lives -= 1;
  syncHud();
  if (state.lives <= 0) {
    endToContact(`Final score: ${state.score}. Play again or mail the run?`);
    return;
  }
  state.paused = true;
  resetBallAndPaddle();
  syncGameUi();
}

function nextLevel() {
  if (SINGLE_LEVEL_ONLY) {
    state.level = 1;
    state.patternHits = 0;
    state.levelHits = 0;
    state.periodicModeUnlocked = false;
    resetBricks();
    resetBallAndPaddle();
    syncHud();
    state.paused = true;
    syncGameUi();
    return;
  }

  if (state.level < MAX_LEVEL) {
    state.level += 1;
    state.patternHits = 0;
    state.levelHits = 0;
    state.periodicModeUnlocked = false;
    state.lives += LEVEL_UP_LIFE_BONUS;
    resetBricks();
    resetBallAndPaddle();
    syncHud();
    state.paused = true;
    syncGameUi();
    return;
  }

  syncPeriodicUnlockState();
  if (!isPerimeterChallengeActive()) return;

  state.patternHits = 0;
  resetBricks();
  setPerimeterOffset(defaultPerimeterOffset());
  resetBallAndPaddle();
  syncHud();
  state.paused = true;
  syncGameUi();
}

function normalizeBallVelocity(ball = state.ball) {
  const b = ball;
  const speed = Math.hypot(b.dx, b.dy) || b.speedBase;
  const minAxis = Math.max(70, speed * 0.24);

  if (Math.abs(b.dx) < minAxis) b.dx = Math.sign(b.dx || 1) * minAxis;
  if (Math.abs(b.dy) < minAxis) b.dy = Math.sign(b.dy || -1) * minAxis;

  const scale = speed / Math.hypot(b.dx, b.dy);
  b.dx *= scale;
  b.dy *= scale;
}

function collideWithPaddle(ball = state.ball) {
  if (isPerimeterChallengeActive()) {
    const slider = getPerimeterSlider();
    const b = ball;
    if (!slider) return;

    const overlaps = b.x + b.r >= slider.x
      && b.x - b.r <= slider.x + slider.w
      && b.y + b.r >= slider.y
      && b.y - b.r <= slider.y + slider.h;

    if (!overlaps) return;

    const speed = Math.hypot(b.dx, b.dy) * 1.04;
    if (slider.side === "top" && b.dy < 0) {
      const hit = (b.x - slider.centerX) / (slider.w / 2);
      b.dx = speed * hit * 0.92;
      b.dy = Math.abs(Math.sqrt(Math.max(speed * speed - b.dx * b.dx, 16000)));
      b.y = slider.y + slider.h + b.r + 1;
    } else if (slider.side === "bottom" && b.dy > 0) {
      const hit = (b.x - slider.centerX) / (slider.w / 2);
      b.dx = speed * hit * 0.92;
      b.dy = -Math.abs(Math.sqrt(Math.max(speed * speed - b.dx * b.dx, 16000)));
      b.y = slider.y - b.r - 1;
    } else if (slider.side === "left" && b.dx < 0) {
      const hit = (b.y - slider.centerY) / (slider.h / 2);
      b.dy = speed * hit * 0.92;
      b.dx = Math.abs(Math.sqrt(Math.max(speed * speed - b.dy * b.dy, 16000)));
      b.x = slider.x + slider.w + b.r + 1;
    } else if (slider.side === "right" && b.dx > 0) {
      const hit = (b.y - slider.centerY) / (slider.h / 2);
      b.dy = speed * hit * 0.92;
      b.dx = -Math.abs(Math.sqrt(Math.max(speed * speed - b.dy * b.dy, 16000)));
      b.x = slider.x - b.r - 1;
    } else {
      return;
    }

    normalizeBallVelocity(b);
    return;
  }

  const p = state.paddle;
  const b = ball;
  if (
    b.x + b.r >= p.x &&
    b.x - b.r <= p.x + p.w &&
    b.y + b.r >= p.y &&
    b.y - b.r <= p.y + p.h &&
    b.dy > 0
  ) {
    const hit = (b.x - (p.x + p.w / 2)) / (p.w / 2);
    const speed = Math.hypot(b.dx, b.dy) * 1.02;
    b.dx = speed * hit;
    b.dy = -Math.sqrt(Math.max(speed * speed - b.dx * b.dx, 16000));
    b.y = p.y - b.r - 1;
    normalizeBallVelocity(b);
  }
}

function collideWithBricks(ball = state.ball, allowTrap = true) {
  const b = ball;

  for (const brick of state.bricks) {
    if (!brick.alive || !brick.active) continue;
    const nearestX = Math.max(brick.x, Math.min(b.x, brick.x + brick.w));
    const nearestY = Math.max(brick.y, Math.min(b.y, brick.y + brick.h));
    const dx = b.x - nearestX;
    const dy = b.y - nearestY;

    if (dx * dx + dy * dy > b.r * b.r) continue;

    const impactX = b.dx;
    const impactY = b.dy;

    if (brick.catcher) {
      if (brick.splitter) {
        destroyBrick(brick, {
          directionX: impactX,
          directionY: impactY,
          intensity: 1.2,
          fillStyle: "rgba(255, 77, 245, 0.36)",
          strokeStyle: "rgba(255, 77, 245, 0.98)",
          shadowColor: "rgba(255, 77, 245, 0.74)",
        });
        if (b === state.ball) {
          spawnTripleBallsFromBall(b);
        }
        syncPeriodicUnlockState();
        syncHud();

        if (Math.abs(dx) > Math.abs(dy)) b.dx *= -1;
        else b.dy *= -1;
        normalizeBallVelocity(b);
      
        const target = currentLevelTarget();
        if (!isPerimeterChallengeActive() && target && state.levelHits >= target) {
          nextLevel();
          return;
        }

        if (remainingBricks() <= 0) {
          if (!isPerimeterChallengeActive() && target && state.levelHits < target) {
            resetCurrentLevelLayout();
          } else {
            nextLevel();
          }
        }
        return;
      }

      const inLen = Math.hypot(impactX, impactY) || 1;
      const incomingToCenterX = -impactX / inLen;
      const incomingToCenterY = -impactY / inLen;
      const openingAngle = brick.notchAngle + state.blinkTime * (brick.spinSpeed || 0);
      const openX = Math.cos(openingAngle);
      const openY = Math.sin(openingAngle);
      const throughOpening = (incomingToCenterX * openX + incomingToCenterY * openY) > 0.72;

      if (allowTrap && throughOpening) {
        const speed = Math.max(b.speedBase || state.ball.speedBase, Math.hypot(impactX, impactY));
        state.ballTrap = {
          brick,
          hold: CATCHER_HOLD_SECONDS,
          elapsed: 0,
          speed,
          incomingX: impactX,
          incomingY: impactY,
        };
        b.x = brick.x + brick.w / 2;
        b.y = brick.y + brick.h / 2;
        b.dx = 0;
        b.dy = 0;
        state.score += 15;
        syncHud();
        return;
      }

      destroyBrick(brick, {
        directionX: impactX,
        directionY: impactY,
        intensity: 1.1,
      });
      syncPeriodicUnlockState();
      syncHud();

      if (state.paused) return;

      if (Math.abs(dx) > Math.abs(dy)) b.dx *= -1;
      else b.dy *= -1;
      normalizeBallVelocity(b);

      if ((state.level === 2 || isRuleLightningLevel()) && state.levelHits % 10 === 0) {
        startAutomataBurst(brick, impactX, impactY);
      }

      const target = currentLevelTarget();
      if (!isPerimeterChallengeActive() && target && state.levelHits >= target) {
        nextLevel();
        return;
      }

      if (remainingBricks() <= 0) {
        if (!isPerimeterChallengeActive() && target && state.levelHits < target) {
          resetCurrentLevelLayout();
        } else {
          nextLevel();
        }
      }
      return;
    }

    destroyBrick(brick, {
      directionX: impactX,
      directionY: impactY,
      intensity: 1.1,
    });
    syncPeriodicUnlockState();
    syncHud();

    if (state.paused) return;

    if (Math.abs(dx) > Math.abs(dy)) b.dx *= -1;
    else b.dy *= -1;
    normalizeBallVelocity(b);

    if ((state.level === 2 || isRuleLightningLevel()) && state.levelHits % 10 === 0) {
      startAutomataBurst(brick, impactX, impactY);
    }

    const target = currentLevelTarget();
    if (!isPerimeterChallengeActive() && target && state.levelHits >= target) {
      nextLevel();
      return;
    }

    if (remainingBricks() <= 0) {
      if (!isPerimeterChallengeActive() && target && state.levelHits < target) {
        resetCurrentLevelLayout();
      } else {
        nextLevel();
      }
    }
    return;
  }
}

function updateBall(dt) {
  const b = state.ball;

  if (state.ballTrap) {
    const trap = state.ballTrap;
    const centerX = trap.brick.x + trap.brick.w / 2;
    const centerY = trap.brick.y + trap.brick.h / 2;
    b.x = centerX;
    b.y = centerY;
    trap.elapsed += dt;

    if (trap.elapsed < trap.hold) {
      return;
    }

    const baseAngle = Math.atan2(-trap.incomingY, -trap.incomingX);
    const scatter = (Math.random() * 2 - 1) * CATCHER_REDIRECT_SPREAD;
    const nextAngle = baseAngle + scatter;
    const outSpeed = trap.speed * (0.96 + Math.random() * 0.12);
    b.dx = Math.cos(nextAngle) * outSpeed;
    b.dy = Math.sin(nextAngle) * outSpeed;
    b.x = centerX + Math.cos(nextAngle) * (trap.brick.w * 0.58 + b.r + 2);
    b.y = centerY + Math.sin(nextAngle) * (trap.brick.h * 0.58 + b.r + 2);
    normalizeBallVelocity(b);
    state.ballTrap = null;
  }

  applyRelativityLensing(b, dt);
  b.x += b.dx * dt;
  b.y += b.dy * dt;

  if (isPerimeterChallengeActive()) {
    if (b.x + b.r < 0) {
      b.x = canvas.width + b.r;
    } else if (b.x - b.r > canvas.width) {
      b.x = -b.r;
    }

    if (b.y + b.r < 0) {
      b.y = canvas.height + b.r;
    } else if (b.y - b.r > canvas.height) {
      b.y = -b.r;
    }
  } else {
    if (b.x - b.r <= 0) {
      b.x = b.r;
      b.dx = Math.abs(b.dx);
      normalizeBallVelocity(b);
    } else if (b.x + b.r >= canvas.width) {
      b.x = canvas.width - b.r;
      b.dx = -Math.abs(b.dx);
      normalizeBallVelocity(b);
    }

    if (b.y - b.r <= 0) {
      b.y = b.r;
      b.dy = Math.abs(b.dy);
      normalizeBallVelocity(b);
    } else if (b.y - b.r > canvas.height) {
      if (state.extraBalls.length > 0) {
        const promoted = state.extraBalls.shift();
        state.ball.x = promoted.x;
        state.ball.y = promoted.y;
        state.ball.dx = promoted.dx;
        state.ball.dy = promoted.dy;
        state.ball.speedBase = promoted.speedBase || state.ball.speedBase;
        state.ball.r = promoted.r || state.ball.r;
        state.ballTrail = [];
        return;
      }
      loseLife();
      return;
    }
  }

  collideWithPaddle(b);
  collideWithBricks(b, true);
  updateBallTrail(dt);

  if (isPerimeterChallengeActive() && isBallOutsideQrBounds()) {
    dropBackFromPerimeter();
  }
}

function updateExtraBalls(dt) {
  if (!state.extraBalls.length) return;

  const survivors = [];
  for (const b of state.extraBalls) {
    applyRelativityLensing(b, dt);
    b.x += b.dx * dt;
    b.y += b.dy * dt;

    if (b.x - b.r <= 0) {
      b.x = b.r;
      b.dx = Math.abs(b.dx);
      normalizeBallVelocity(b);
    } else if (b.x + b.r >= canvas.width) {
      b.x = canvas.width - b.r;
      b.dx = -Math.abs(b.dx);
      normalizeBallVelocity(b);
    }

    if (b.y - b.r <= 0) {
      b.y = b.r;
      b.dy = Math.abs(b.dy);
      normalizeBallVelocity(b);
    } else if (b.y - b.r > canvas.height) {
      continue;
    }

    collideWithPaddle(b);
    collideWithBricks(b, false);

    survivors.push(b);
  }

  state.extraBalls = survivors;
}

function updatePattern(dt) {
  if (state.contactOpen || state.paused || !state.running) return;
  state.patternTimer += dt;
}

function updatePlayClock(dt) {
  state.playSeconds += dt;
  if (state.playSeconds >= 120 && !state.contactOpen) {
    endToContact("Two minutes are up. Mail opens from the contact pill, or you can play again.");
  }
}

class PhysicsSystem {
  step(stepDt, stepIndex) {
    updateExplosions(stepDt);

    if (!state.paused) {
      updatePlayClock(stepDt);
      if (!state.running) {
        return false;
      }
      updatePattern(stepDt);
      updatePaddle(stepDt);
      updateBall(stepDt);
      updateExtraBalls(stepDt);
      if ((stepIndex % DEFORMATION_STEP_STRIDE) === 0) {
        updateGridDeformation(stepDt);
        updateMeshDeformation(stepDt);
      }
      updateAutomataBursts(stepDt);
      updateMovementSummary();
    }

    if (state.contactOpen) {
      updateMeshDeformation(stepDt);
    }

    return true;
  }
}

class RenderSystem {
  render() {
    draw();
  }
}

class InputController {
  movePaddleFromCanvasPoint(x, y) {
    if (isPerimeterChallengeActive()) {
      setPerimeterOffset(closestPerimeterOffset(x, y));
      return;
    }

    state.paddle.x = x - state.paddle.w / 2;
    clampPaddle();
  }

  getCanvasContentPoint(clientX, clientY) {
    if (!canvasMetrics.rect) {
      refreshCanvasMetrics();
    }

    const x = ((clientX - canvasMetrics.rect.left - canvasMetrics.borderLeft) * canvas.width) / canvasMetrics.contentWidth;
    const y = ((clientY - canvasMetrics.rect.top - canvasMetrics.borderTop) * canvas.height) / canvasMetrics.contentHeight;

    return {
      x: clamp(x, 0, canvas.width),
      y: clamp(y, 0, canvas.height),
    };
  }

  getCanvasPointFromMouseLikeEvent(event) {
    if (event.currentTarget === canvas && typeof event.offsetX === "number" && typeof event.offsetY === "number") {
      return {
        x: clamp((event.offsetX * canvas.width) / Math.max(1, canvas.clientWidth), 0, canvas.width),
        y: clamp((event.offsetY * canvas.height) / Math.max(1, canvas.clientHeight), 0, canvas.height),
      };
    }

    return this.getCanvasContentPoint(event.clientX, event.clientY);
  }

  movePaddleFromMouseEvent(event) {
    const point = this.getCanvasPointFromMouseLikeEvent(event);
    this.movePaddleFromCanvasPoint(point.x, point.y);
    if (state.running && !state.paused && !state.contactOpen) {
      applyGridImpactAt(point.x, point.y, 1.3);
    }
  }

  updateTouchSteer(clientX, clientY) {
    const point = this.getCanvasContentPoint(clientX, clientY);
    const half = Math.max(1, canvas.width / 2);
    let normalized = (point.x - half) / half;
    normalized = clamp(normalized, -1, 1);
    const deadZone = 0.06;
    if (Math.abs(normalized) <= deadZone) {
      state.touchSteer = 0;
      return;
    }
    const magnitude = (Math.abs(normalized) - deadZone) / (1 - deadZone);
    const curved = Math.pow(clamp(magnitude, 0, 1), 1.15);
    state.touchSteer = Math.sign(normalized) * curved;
  }

  clearTouchSteer() {
    state.touchSteer = 0;
  }
}

class GameLoop {
  constructor(physics, renderer) {
    this.physics = physics;
    this.renderer = renderer;
  }

  runFrame(ts) {
    if (!state.lastTime) state.lastTime = ts;
    const rawDt = (ts - state.lastTime) / 1000;
    const dt = Math.min(MAX_FRAME_DELTA, Math.max(0, rawDt));
    state.lastTime = ts;
    state.blinkTime += dt;
    simulationAccumulator = Math.min(
      simulationAccumulator + dt,
      SIMULATION_STEP * MAX_SIM_STEPS_PER_FRAME
    );

    if (!state.running) {
      if (state.contactOpen) {
        updateMeshDeformation(dt);
      }
      this.renderer.render();
      requestAnimationFrame(frame);
      return;
    }

    let steps = 0;
    while (simulationAccumulator >= SIMULATION_STEP && steps < MAX_SIM_STEPS_PER_FRAME) {
      const keepRunning = this.physics.step(SIMULATION_STEP, steps);
      if (!keepRunning) {
        this.renderer.render();
        return;
      }

      simulationAccumulator -= SIMULATION_STEP;
      steps += 1;
    }

    this.renderer.render();
    requestAnimationFrame(frame);
  }

  start() {
    requestAnimationFrame(frame);
  }
}

const physicsSystem = new PhysicsSystem();
const renderSystem = new RenderSystem();
const inputSystem = new InputController();
const gameLoop = new GameLoop(physicsSystem, renderSystem);

function frame(ts) {
  gameLoop.runFrame(ts);
}

function startOrResume() {
  if (!state.running) {
    resetGame();
    state.running = true;
  }
  if (state.contactOpen || state.gameOver) {
    resetContactState();
  }
  state.paused = false;
  syncGameUi();
  state.lastTime = 0;
  simulationAccumulator = 0;
}

function hardResetIntoPlay() {
  resetGame();
  state.running = true;
  state.paused = false;
  state.contactOpen = false;
  state.gameOver = false;
  syncGameUi();
  syncHud();
  state.lastTime = 0;
  simulationAccumulator = 0;
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = true;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = true;
  if (event.key === " ") {
    event.preventDefault();
    if (!state.running || state.paused) startOrResume();
    else {
      state.paused = true;
      syncGameUi();
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = false;
});

function movePaddleFromCanvasPoint(x, y) {
  inputSystem.movePaddleFromCanvasPoint(x, y);
}

function getCanvasContentPoint(clientX, clientY) {
  return inputSystem.getCanvasContentPoint(clientX, clientY);
}

function movePaddleFromClientPoint(clientX, clientY) {
  const point = getCanvasContentPoint(clientX, clientY);
  movePaddleFromCanvasPoint(point.x, point.y);
}

function updateTouchSteerFromClientPoint(clientX, clientY) {
  inputSystem.updateTouchSteer(clientX, clientY);
}

function clearTouchSteer() {
  inputSystem.clearTouchSteer();
}

function getCanvasPointFromMouseLikeEvent(event) {
  return inputSystem.getCanvasPointFromMouseLikeEvent(event);
}

function movePaddleFromMouseEvent(event) {
  inputSystem.movePaddleFromMouseEvent(event);
}

function getCanvasPointFromEvent(event) {
  return getCanvasContentPoint(event.clientX, event.clientY);
}

function isPointInsideCurrentCard(x, y) {
  const layout = getContactCardLayout(state.qrBounds.width, state.qrBounds.height);
  return (
    x >= layout.cardX &&
    x <= layout.cardX + layout.cardW &&
    y >= layout.cardY &&
    y <= layout.cardY + layout.cardH
  );
}

canvas.addEventListener("pointermove", (event) => {
  if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
  pokeFabInteraction();
  if (state.contactOpen) {
    const point = getCanvasPointFromMouseLikeEvent(event);
    applyMeshImpactAt(point.x, point.y, 1.6);
    return;
  }
  movePaddleFromMouseEvent(event);
});

canvas.addEventListener(
  "wheel",
  (event) => {
    if (!state.contactOpen) return;
    event.preventDefault();
    const point = getCanvasContentPoint(event.clientX, event.clientY);
    const wheelBoost = Math.min(2.2, 1.4 + Math.abs(event.deltaY) * 0.0018);
    applyMeshImpactAt(point.x, point.y, wheelBoost);
  },
  { passive: false }
);

canvas.addEventListener(
  "touchstart",
  (event) => {
    if (!event.touches || !event.touches[0]) return;
    event.preventDefault();
    pokeFabInteraction();
    suppressClickUntil = performance.now() + 180;
    if (state.contactOpen) {
      const point = getCanvasContentPoint(event.touches[0].clientX, event.touches[0].clientY);
      applyMeshImpactAt(point.x, point.y, 1.6);
      return;
    }
    const point = getCanvasContentPoint(event.touches[0].clientX, event.touches[0].clientY);
    applyGridImpactAt(point.x, point.y, 1.5);
    inputSystem.updateTouchSteer(event.touches[0].clientX, event.touches[0].clientY);
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (event) => {
    if (!event.touches || !event.touches[0]) return;
    event.preventDefault();
    pokeFabInteraction();
    suppressClickUntil = performance.now() + 180;
    if (state.contactOpen) {
      const point = getCanvasContentPoint(event.touches[0].clientX, event.touches[0].clientY);
      applyMeshImpactAt(point.x, point.y, 1.6);
      return;
    }
    const point = getCanvasContentPoint(event.touches[0].clientX, event.touches[0].clientY);
    applyGridImpactAt(point.x, point.y, 1.35);
    inputSystem.updateTouchSteer(event.touches[0].clientX, event.touches[0].clientY);
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  (event) => {
    event.preventDefault();
    inputSystem.clearTouchSteer();

    // During active gameplay, touch-end is steering-only and must not toggle mode.
    if (state.running && !state.paused && !state.contactOpen && !state.gameOver) {
      lastTouchEndTime = performance.now();
      return;
    }

    const now = performance.now();
    if (now - lastTouchEndTime < 160) {
      lastTouchEndTime = now;
      return;
    }
    lastTouchEndTime = now;
    suppressClickUntil = now + 180;
    handleDoubleTouchAction();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchcancel",
  (event) => {
    event.preventDefault();
    inputSystem.clearTouchSteer();
  },
  { passive: false }
);

fabMailBtn.addEventListener("click", () => {
  openMail();
});

fabResetBtn.addEventListener("click", () => {
  if (state.contactOpen || state.paused || !state.running || state.gameOver) {
    hardResetIntoPlay();
    return;
  }
  pauseIntoContact();
});

window.addEventListener("mousemove", (event) => {
  pokeFabInteraction();
  if (event.clientX <= 56) {
    showFabTemporarily();
  }
});

window.addEventListener(
  "touchstart",
  (event) => {
    if (!event.touches || !event.touches[0]) return;
    pokeFabInteraction();
    const x = event.touches[0].clientX;
    edgeTouchStarted = x <= 40;
    edgeTouchStartX = x;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (!edgeTouchStarted || !event.touches || !event.touches[0]) return;
    const delta = event.touches[0].clientX - edgeTouchStartX;
    if (delta > 20) {
      edgeTouchStarted = false;
      showFabTemporarily();
    }
  },
  { passive: true }
);

window.addEventListener("touchend", () => {
  edgeTouchStarted = false;
});

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

async function requestFullscreenFor(element) {
  if (element.requestFullscreen) {
    await element.requestFullscreen();
    return;
  }
  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
    return;
  }
  throw new Error("Fullscreen request is unsupported.");
}

async function exitFullscreenMode() {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
    return;
  }
  throw new Error("Fullscreen exit is unsupported.");
}

async function toggleFullscreenMode() {
  try {
    if (getFullscreenElement()) {
      await exitFullscreenMode();
    } else {
      await requestFullscreenFor(document.documentElement);
    }
  } catch (_error) {
    setSaveFeedback("Fullscreen mode is unavailable in this browser.");
  }
}

function handleDoubleTouchAction() {
  if (state.running && !state.paused && !state.contactOpen && !state.gameOver) {
    pauseIntoContact();
    return;
  }

  if (state.contactOpen) {
    state.contactOpen = false;
    startOrResume();
    return;
  }

  if (state.gameOver) {
    hardResetIntoPlay();
    return;
  }

  startOrResume();
}

canvas.addEventListener("dblclick", (event) => {
  event.preventDefault();
  suppressClickUntil = performance.now() + 320;
  handleDoubleTouchAction();
});

canvas.addEventListener("click", (event) => {
  event.preventDefault();
  if (performance.now() < suppressClickUntil) return;
  handleDoubleTouchAction();
});

canvas.addEventListener(
  "pointerup",
  (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "touch") return;
    const now = performance.now();
    if (now - state.lastPointerUp < 260) {
      state.lastPointerUp = 0;
      suppressClickUntil = now + 320;
      handleDoubleTouchAction();
      return;
    }
    state.lastPointerUp = now;
    // Single touch release is reserved for steering only.
  },
  { passive: true }
);

function shouldSwitchBackFromTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest("canvas")) return false;
  if (target.closest("button, a, input, textarea, select, label")) return false;
  return true;
}

document.addEventListener(
  "pointerup",
  (event) => {
    if (!shouldSwitchBackFromTarget(event.target)) return;
    // Single-window mode: ignore outside taps.
  },
  { passive: true }
);

class LayoutController {
  constructor() {
    this.layoutSyncTimer = null;
    this.canvasSizeObserver = null;
  }

  applySync() {
    if (!state.initialized) return;
    refreshCanvasMetrics();
    syncFabInsideCard();
    resetCurrentLevelLayout();
    draw();
  }

  scheduleSync() {
    if (this.layoutSyncTimer) {
      window.clearTimeout(this.layoutSyncTimer);
    }
    this.layoutSyncTimer = window.setTimeout(() => {
      this.layoutSyncTimer = null;
      this.applySync();
    }, 90);
  }

  handleOrientationChangeImmediate() {
    if (this.layoutSyncTimer) {
      window.clearTimeout(this.layoutSyncTimer);
      this.layoutSyncTimer = null;
    }

    // iOS and Android often settle viewport metrics over a few ticks.
    // Run immediate sync plus short follow-up passes for instant-looking rotation.
    refreshCanvasMetrics();
    this.applySync();
    window.setTimeout(() => this.applySync(), 100);
    window.setTimeout(() => this.applySync(), 260);
  }

  bindEvents() {
    window.addEventListener("resize", () => this.scheduleSync(), { passive: true });
    window.addEventListener("orientationchange", () => this.handleOrientationChangeImmediate(), { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => this.scheduleSync(), { passive: true });
    }
    if (typeof ResizeObserver === "function") {
      this.canvasSizeObserver = new ResizeObserver(() => {
        this.scheduleSync();
      });
      this.canvasSizeObserver.observe(canvas);
    }
  }
}

const layoutController = new LayoutController();

class CardFxController {
  constructor(stageEl) {
    this.stageEl = stageEl;
    this.active = false;
    this.hover = false;
  }

  bindEvents() {
    if (!this.stageEl) return;
    this.stageEl.classList.add("card-carousel");

    this.stageEl.addEventListener("pointerenter", (event) => {
      if (this.active) return;
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      this.setHover(true);
    }, { passive: true });

    this.stageEl.addEventListener("pointerleave", () => {
      this.setHover(false);
      this.setActive(false);
      this.resetParallax();
    }, { passive: true });

    this.stageEl.addEventListener("pointermove", (event) => {
      this.updateParallax(event);
    }, { passive: true });

    this.stageEl.addEventListener("click", () => {
      this.setActive(true);
    }, { passive: true });

    this.stageEl.addEventListener("touchstart", () => {
      this.setActive(true);
      this.resetParallax();
    }, { passive: true });
  }

  setHover(hovered) {
    this.hover = !!hovered;
    if (!this.stageEl || this.active) return;
    this.stageEl.classList.toggle("card-hover", this.hover);
  }

  setActive(active) {
    this.active = !!active;
    if (!this.stageEl) return;
    this.stageEl.classList.toggle("card-active", this.active);
    if (this.active) {
      this.stageEl.classList.remove("card-hover");
      this.resetParallax();
    }
  }

  resetParallax() {
    if (!this.stageEl) return;
    this.stageEl.style.setProperty("--card-tilt-x", "0deg");
    this.stageEl.style.setProperty("--card-tilt-y", "0deg");
  }

  updateParallax(event) {
    if (!this.stageEl || this.active || !this.hover) return;
    if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const rect = this.stageEl.getBoundingClientRect();
    const nx = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1);
    const ny = clamp(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1, -1, 1);
    this.stageEl.style.setProperty("--card-tilt-y", `${Math.round(nx * 6)}deg`);
    this.stageEl.style.setProperty("--card-tilt-x", `${Math.round(-ny * 4)}deg`);
  }
}

const cardFxController = new CardFxController(stageNode);

class ChatbotOrbController {
  constructor(stageEl, orbEl) {
    this.stageEl = stageEl;
    this.orbEl = orbEl;
    this.rect = null;
    this.active = false;
    this.pointerInside = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.rafId = null;
    this.enabled = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    this.following = false;
  }

  bindEvents() {
    if (!this.stageEl || !this.orbEl || !this.enabled) {
      if (this.orbEl) this.orbEl.style.display = "none";
      return;
    }
    this.syncRect(true);

    this.stageEl.addEventListener("pointerenter", (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      this.pointerInside = true;
      this.active = true;
      this.updateMouse(event);
    }, { passive: true });

    this.stageEl.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      this.pointerInside = true;
      this.active = true;
      this.updateMouse(event);
    }, { passive: true });

    this.stageEl.addEventListener("pointerleave", () => {
      this.pointerInside = false;
      this.following = false;
      this.orbEl.classList.remove("chatbot-catchable");
    }, { passive: true });

    window.addEventListener("resize", () => this.syncRect(false), { passive: true });
    this.start();
  }

  syncRect(forceReset) {
    if (!this.stageEl) return;
    this.rect = this.stageEl.getBoundingClientRect();
    if (forceReset || !this.x) {
      this.x = clamp(this.rect.width * 0.22, 42, this.rect.width - 42);
      this.y = clamp(this.rect.height * 0.68, 42, this.rect.height - 42);
      this.targetX = this.x;
      this.targetY = this.y;
      this.paint();
    }
  }

  updateMouse(event) {
    if (!this.rect) this.syncRect(false);
    this.mouseX = clamp(event.clientX - this.rect.left, 0, this.rect.width);
    this.mouseY = clamp(event.clientY - this.rect.top, 0, this.rect.height);
  }

  paint() {
    if (!this.orbEl) return;
    this.orbEl.style.left = `${Math.round(this.x)}px`;
    this.orbEl.style.top = `${Math.round(this.y)}px`;
  }

  update() {
    if (!this.stageEl || !this.orbEl || !this.rect) return;
    const padding = 42;

    if (this.pointerInside && this.active) {
      const dx = this.mouseX - this.x;
      const dy = this.mouseY - this.y;
      const dist = Math.hypot(dx, dy);

      if (!this.following && dist < 135) {
        this.following = true;
      } else if (this.following && dist > 250) {
        this.following = false;
      }

      if (this.following) {
        if (dist < 72) {
          this.targetX = this.x;
          this.targetY = this.y;
          this.orbEl.classList.add("chatbot-catchable");
        } else {
          const leadX = this.mouseX + clamp(dx * 0.2, -58, 58);
          const leadY = this.mouseY - 30;
          this.targetX = clamp(leadX, padding, this.rect.width - padding);
          this.targetY = clamp(leadY, padding, this.rect.height - padding);
          this.orbEl.classList.remove("chatbot-catchable");
        }
      } else {
        this.targetX = clamp(this.rect.width * 0.22, padding, this.rect.width - padding);
        this.targetY = clamp(this.rect.height * 0.68, padding, this.rect.height - padding);
        this.orbEl.classList.remove("chatbot-catchable");
      }
    } else {
      this.following = false;
      this.targetX = clamp(this.rect.width * 0.22, padding, this.rect.width - padding);
      this.targetY = clamp(this.rect.height * 0.68, padding, this.rect.height - padding);
      this.orbEl.classList.remove("chatbot-catchable");
    }

    this.x += (this.targetX - this.x) * 0.14;
    this.y += (this.targetY - this.y) * 0.14;
    this.paint();
  }

  start() {
    const tick = () => {
      this.update();
      this.rafId = window.requestAnimationFrame(tick);
    };
    if (this.rafId) window.cancelAnimationFrame(this.rafId);
    this.rafId = window.requestAnimationFrame(tick);
  }
}


function applyLayoutSync() {
  layoutController.applySync();
}

function scheduleLayoutSync() {
  layoutController.scheduleSync();
}

function handleOrientationChangeImmediate() {
  layoutController.handleOrientationChangeImmediate();
}

layoutController.bindEvents();

function bootWhenReady(startMs) {
  applyControlLabels();
  refreshCanvasMetrics();
  cardFxController.bindEvents();
  state.initialized = true;
  state.running = false;
  state.paused = true;
  state.contactOpen = true;
  state.lastTime = 0;
  if (startMs) draw();
  syncGameUi();
  syncFabInsideCard();
  scheduleFabCollapse();
  void showContactQr();
  gameLoop.start();
}

bootWhenReady(true);
