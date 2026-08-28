window.CALYR_AORTA_FLOW_CONFIG = Object.freeze({
  image: "./aorta-arch-dark-2026.webp",
  ui: Object.freeze({
    status: "PULSATILE FLOW · FORWARD",
    gameTitle: "FLOW CONTROL",
    idleState: "FOLLOW THE ARCH",
    activeState: "COMPRESSING",
    lockedState: "FLOW LOCKED",
    instruction: "HOLD + DRAG · COMPRESS FLOW",
    releaseInstruction: "GUIDE THE STREAM · RELEASE AT OUTLET",
    modelLabel: "HYPOTHETICAL STENT · RESEARCH MODEL"
  }),
  particleCount: 1180,
  baseSpeed: 0.000038,
  speedStep: 0.0000042,
  maxDevicePixelRatio: 2,
  pulseHz: 1.15,
  gameGain: 1.35,
  flockSpread: 7.5,
  stentPath: [[0.455,0.105],[0.655,0.035],[0.855,0.235],[0.835,0.625]],
  stentHalfWidth: 29,
  modes: [
    { id: "flow", label: "FLOW", stiffness: 0.35, flare: 0.12 },
    { id: "pressure", label: "PRESSURE", stiffness: 0.62, flare: 0.2 },
    { id: "conform", label: "CONFORM", stiffness: 0.22, flare: 0.34 }
  ],
  paths: [
    [[0.19,1.08],[0.10,0.56],[0.24,0.12],[0.53,0.10],[0.82,0.08],[0.94,0.37],[0.88,1.08]],
    [[0.23,1.08],[0.15,0.58],[0.28,0.15],[0.55,0.12],[0.80,0.11],[0.91,0.40],[0.84,1.08]],
    [[0.27,1.08],[0.20,0.61],[0.32,0.18],[0.57,0.14],[0.78,0.14],[0.88,0.43],[0.80,1.08]],
    [[0.31,1.08],[0.24,0.64],[0.36,0.21],[0.59,0.16],[0.76,0.17],[0.85,0.46],[0.76,1.08]],
    [[0.35,1.08],[0.28,0.67],[0.40,0.24],[0.61,0.18],[0.74,0.20],[0.82,0.49],[0.72,1.08]]
  ]
});
