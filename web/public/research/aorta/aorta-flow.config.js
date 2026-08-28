window.CALYR_AORTA_FLOW_CONFIG = Object.freeze({
  image: "./aorta-arch-dark-2026.webp",
  ui: Object.freeze({
    status: "PULSATILE FLOW · FORWARD",
    gameTitle: "FLOW CONTROL",
    idleState: "FOLLOW THE ARCH",
    activeState: "COMPRESSING",
    lockedState: "FLOW LOCKED",
    instruction: "MOVE · ATTRACT FLOW / DRAG CYAN STENT / DRAG RED AORTA",
    releaseInstruction: "ARCH + STENT GEOMETRY CHANGE THE PULSATILE FLOW",
    modelLabel: "HYPOTHETICAL STENT · RESEARCH MODEL"
  }),
  particleCount: 1900,
  baseSpeed: 0.000038,
  speedStep: 0.0000042,
  maxDevicePixelRatio: 2,
  pulseHz: 1.15,
  gameGain: 1.35,
  flockSpread: 3.2,
  stentPath: [[0.424,0.137],[0.603,0.055],[0.834,0.194],[0.842,0.704]],
  stentHalfWidth: 29,
  modes: [
    { id: "flow", label: "FLOW", stiffness: 0.35, flare: 0.12 },
    { id: "pressure", label: "PRESSURE", stiffness: 0.62, flare: 0.2 },
    { id: "conform", label: "CONFORM", stiffness: 0.22, flare: 0.34 }
  ],
  vesselBounds: Object.freeze({
    outer: [[0.155,1.04],[0.105,0.535],[0.195,0.105],[0.492,0.055],[0.815,0.025],[0.955,0.345],[0.905,1.04]],
    inner: [[0.365,1.04],[0.285,0.665],[0.365,0.275],[0.582,0.205],[0.725,0.155],[0.792,0.48],[0.735,1.04]]
  }),
  paths: [
    [[0.205,1.04],[0.145,0.575],[0.235,0.145],[0.505,0.095],[0.785,0.060],[0.915,0.365],[0.865,1.04]],
    [[0.230,1.04],[0.170,0.590],[0.260,0.165],[0.520,0.115],[0.775,0.080],[0.895,0.390],[0.840,1.04]],
    [[0.255,1.04],[0.195,0.605],[0.285,0.185],[0.535,0.135],[0.765,0.100],[0.875,0.415],[0.815,1.04]],
    [[0.280,1.04],[0.220,0.620],[0.310,0.205],[0.550,0.155],[0.755,0.120],[0.855,0.440],[0.790,1.04]],
    [[0.305,1.04],[0.245,0.635],[0.335,0.225],[0.565,0.175],[0.745,0.140],[0.835,0.465],[0.765,1.04]],
    [[0.330,1.04],[0.270,0.650],[0.355,0.245],[0.575,0.195],[0.735,0.160],[0.815,0.490],[0.740,1.04]]
  ]
});
