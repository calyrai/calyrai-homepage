document.addEventListener('DOMContentLoaded', () => {

  const swirl = document.querySelector('.swirl-svg');
  if (!swirl) {
    return;
  }
  const swirlRotor =
    swirl.querySelector('.swirl-rotor') ||
    swirl.querySelector('g');
  const swirlContainer = swirl.parentElement;
  const swirlArcs = document.querySelectorAll('.swirl-arc');
  const hotspot = swirl.querySelector('.swirl-center-hotspot');

  const heroContentScroll =
    document.querySelector('.hero-content-scroll');

  const stepsList =
    document.querySelector('.steps-list');

  const STATE = {
    IDLE: 'idle',
    DRAGGING: 'dragging',
    ROTATING: 'rotating'
  };

  const DEFAULT_SWIRL_LAYOUT = {
    placement: 'center',
    position: 'absolute',
    x: '50%',
    y: '50%',
    translate_center: true,
    transform_origin: '50% 50%',
    transform_box: 'fill-box',
    container: {
      position: 'relative',
      display: 'flex',
      justify_content: 'center',
      align_items: 'center'
    }
  };

  async function loadSwirlLayout() {
    if (!window.jsyaml) {
      return DEFAULT_SWIRL_LAYOUT;
    }

    try {
      const response = await fetch('homepage.yaml', {
        cache: 'no-store'
      });

      if (!response.ok) {
        return DEFAULT_SWIRL_LAYOUT;
      }

      const yamlText = await response.text();
      const yamlData = window.jsyaml.load(yamlText) || {};
      const yamlLayout = (yamlData.swirl && yamlData.swirl.layout) || {};

      return {
        ...DEFAULT_SWIRL_LAYOUT,
        ...yamlLayout,
        container: {
          ...DEFAULT_SWIRL_LAYOUT.container,
          ...(yamlLayout.container || {})
        }
      };
    } catch (err) {
      return DEFAULT_SWIRL_LAYOUT;
    }
  }

  function applySwirlLayout(layout) {
    if (!swirlContainer) {
      return;
    }

    const containerCfg = layout.container || {};

    swirlContainer.style.position = containerCfg.position || 'relative';
    swirlContainer.style.display = containerCfg.display || 'flex';
    swirlContainer.style.justifyContent =
      containerCfg.justify_content || 'center';
    swirlContainer.style.alignItems =
      containerCfg.align_items || 'center';

    if (layout.placement === 'center') {
      swirl.style.position = layout.position || 'absolute';
      swirl.style.left = layout.x || '50%';
      swirl.style.top = layout.y || '50%';
      swirl.dataset.swirlTranslateCenter =
        layout.translate_center === false ? '0' : '1';

      if (swirlRotor) {
        swirlRotor.style.transformOrigin =
          layout.transform_origin || '50% 50%';
        swirlRotor.style.transformBox =
          layout.transform_box || 'fill-box';
      }
    }
  }

  class SwirlController {
constructor(layoutConfig) {

  this.state = STATE.IDLE;

  this.rotation = 0;
  this.lastAngle = 0;

  this.energy = 0;
  this.targetEnergy = 0;
  this.hoverTimer = 0;

  this.side = 'left';

  this.currentColor = '#c24fff';
  this.layoutConfig = layoutConfig;

  this.init();
  this.animate();
}

init() {

  applySwirlLayout(this.layoutConfig);
  swirl.style.willChange =
    'transform, opacity, filter';

  swirlArcs.forEach(arc => {

    arc.style.strokeWidth = '0.5';
    arc.style.opacity = '0.85';

    arc.style.transition =
      'stroke 0.4s ease,' +
      'filter 0.4s ease,' +
      'opacity 0.4s ease';
  });

  hotspot.addEventListener(
    'pointerdown',
    this.startRotate.bind(this)
  );

  swirl.addEventListener(
    'pointerenter',
    () => {
      this.raiseGlow();
    }
  );

  swirl.addEventListener(
    'pointermove',
    () => {
      this.raiseGlow();
    }
  );

  swirl.addEventListener(
    'pointerleave',
    () => {
      this.resetGlow();
    }
  );

  document.addEventListener(
    'pointermove',
    this.onPointerMove.bind(this)
  );

  document.addEventListener(
    'pointerup',
    this.stopRotate.bind(this)
  );

  document.addEventListener(
    'pointercancel',
    this.stopRotate.bind(this)
  );

  window.addEventListener(
    'blur',
    () => this.resetGlow()
  );

  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        this.resetGlow();
      }
    }
  );

  this.render();
}

raiseGlow() {

  this.targetEnergy = 1;

  window.clearTimeout(this.hoverTimer);

  this.hoverTimer = window.setTimeout(
    () => {
      if (this.state === STATE.IDLE) {
        this.resetGlow();
      }
    },
    160
  );
}

resetGlow() {

  window.clearTimeout(this.hoverTimer);

  this.targetEnergy = 0;

  if (this.state === STATE.IDLE) {
    swirl.classList.remove(
      'swirl-active'
    );
  }
}

startRotate(e) {

  if (
    !e.target.classList.contains(
      'swirl-center-hotspot'
    )
  ) {
    return;
  }

  this.state = STATE.ROTATING;

  const rect =
    swirl.getBoundingClientRect();

  const cx =
    rect.left + rect.width / 2;

  const cy =
    rect.top + rect.height / 2;

  this.lastAngle =
    Math.atan2(
      e.clientY - cy,
      e.clientX - cx
    ) * 180 / Math.PI
    - this.rotation;

  this.targetEnergy = 1;

  swirl.classList.add(
    'swirl-active'
  );

  e.preventDefault();
}

onPointerMove(e) {

  if (
    this.state !== STATE.ROTATING
  ) {
    return;
  }

  const rect =
    swirl.getBoundingClientRect();

  const cx =
    rect.left + rect.width / 2;

  const cy =
    rect.top + rect.height / 2;

  this.rotation =
    Math.atan2(
      e.clientY - cy,
      e.clientX - cx
    ) * 180 / Math.PI
    - this.lastAngle;

  this.updateScroll();
  this.updateSectionColor();
}

stopRotate() {

  this.state = STATE.IDLE;

  this.resetGlow();

  swirl.classList.remove(
    'swirl-active'
  );
}

updateScroll() {

  const normalized =
    ((this.rotation % 360) + 360) % 360;

  const factor =
    normalized / 360;

  const target =
    this.side === 'left'
      ? heroContentScroll
      : stepsList;

  if (!target) return;

  const maxScroll =
    target.scrollHeight -
    target.clientHeight;

  target.scrollTop =
    factor * maxScroll;
}

updateSectionColor() {

  const sections =
    document.querySelectorAll(
      '.hero-content-scroll .explore-section'
    );

  let bestIdx = 0;
  let bestVisible = 0;

  sections.forEach((section, idx) => {

    const rect =
      section.getBoundingClientRect();

    const visible =
      Math.max(
        0,
        Math.min(
          rect.bottom,
          window.innerHeight
        ) -
        Math.max(
          rect.top,
          0
        )
      );

    if (visible > bestVisible) {

      bestVisible = visible;
      bestIdx = idx;
    }
  });

  let color = '#c24fff';

  if (
    window.EXPLORE_SECTIONS &&
    bestIdx > 0 &&
    window.EXPLORE_SECTIONS[
      bestIdx - 1
    ]
  ) {
    color =
      window.EXPLORE_SECTIONS[
        bestIdx - 1
      ].color;
  }

  this.currentColor = color;

  swirlArcs.forEach(arc => {

    arc.setAttribute(
      'stroke',
      color
    );
  });

  sections.forEach(
    (section, idx) => {

      section.classList.toggle(
        'active',
        idx === bestIdx
      );
    }
  );
}

animate() {

  this.energy +=
    (
      this.targetEnergy -
      this.energy
    ) * 0.08;

  this.render();

  requestAnimationFrame(
    this.animate.bind(this)
  );
}

render() {

  const translateCenter =
    swirl.dataset.swirlTranslateCenter !== '0';

  window.swirlLayerEnergy = this.energy;

  swirl.style.transform =
    translateCenter ? 'translate(-50%, -50%)' : '';

  swirlRotor.style.transform =
    `
    rotate(${this.rotation}deg)
    `;

  swirl.style.opacity = '0.88';

  swirlArcs.forEach(arc => {
    arc.style.filter =
      'drop-shadow(0 0 3px rgba(255,255,255,0.30)) ' +
      'drop-shadow(0 0 5px rgba(36,243,255,0.28)) ' +
      'drop-shadow(0 0 8px ' + this.currentColor + ') ' +
      'drop-shadow(0 0 14px ' + this.currentColor + ')';
  });
}
  }

  loadSwirlLayout().then(layout => {
    new SwirlController(layout);
  });

});