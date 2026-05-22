(function () {
  'use strict';

  var STORAGE_KEY = 'calyr.home.layout.offsets.v1';
  var GRID_SIZE = 16;
  var layoutTuning = window.NexusLayoutTuning || null;
  var localLayoutTuningEnabled = layoutTuning && layoutTuning.isLocalTuningEnabled
    ? layoutTuning.isLocalTuningEnabled({ queryKey: 'layoutTuning' })
    : (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  var TARGETS = [
    { id: 'hero', label: 'hero', selector: '#hero' },
    { id: 'heroCopy', label: 'hero-copy', selector: '.hero-copy' },
    { id: 'heroKicker', label: 'hero-kicker', selector: '.hero-kicker' },
    { id: 'heroTitle', label: 'hero-title', selector: '.hero-title' },
    { id: 'heroSubtitle', label: 'hero-subtitle', selector: '.hero-subtitle' },
    { id: 'heroOrbitLogo', label: 'hero-orbit-logo', selector: '.hero-orbit-logo' },
    { id: 'heroCta', label: 'hero-cta', selector: '.hero-cta' },
    { id: 'heroCharacteristics', label: 'hero-characteristics', selector: '.hero-characteristics' },
    { id: 'siteFooter', label: 'site-footer', selector: '.site-footer' }
  ];

  var state = {
    active: false,
    offsets: loadOffsets(),
    drag: null,
    overlayById: Object.create(null)
  };

  var gridLayer = null;
  var overlayRoot = null;
  var toggleBtn = null;

  function buildPayload() {
    return {
      gridSize: GRID_SIZE,
      offsets: state.offsets
    };
  }

  function downloadJsonFile(filename, content) {
    if (layoutTuning && layoutTuning.downloadJson) {
      return layoutTuning.downloadJson(filename, content);
    }
    try {
      var blob = new Blob([content], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function flashButtonLabel(button, text, timeoutMs) {
    if (!button) return;
    var original = button.textContent;
    button.textContent = text;
    window.setTimeout(function () {
      button.textContent = original;
    }, timeoutMs || 1200);
  }

  function clampNumber(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function snap(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  function loadOffsets() {
    if (layoutTuning && layoutTuning.safeReadJSON) {
      return layoutTuning.safeReadJSON(STORAGE_KEY, Object.create(null));
    }
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.create(null);
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return Object.create(null);
      return parsed;
    } catch (_err) {
      return Object.create(null);
    }
  }

  function saveOffsets() {
    if (layoutTuning && layoutTuning.safeWriteJSON) {
      layoutTuning.safeWriteJSON(STORAGE_KEY, state.offsets);
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.offsets));
    } catch (_err) {
      // no-op
    }
  }

  function ensureOffset(id) {
    if (!state.offsets[id] || typeof state.offsets[id] !== 'object') {
      state.offsets[id] = { x: 0, y: 0 };
    }
    state.offsets[id].x = clampNumber(state.offsets[id].x);
    state.offsets[id].y = clampNumber(state.offsets[id].y);
    return state.offsets[id];
  }

  function applyOffsetsToDom() {
    TARGETS.forEach(function (target) {
      var el = document.querySelector(target.selector);
      if (!el) return;
      var offset = ensureOffset(target.id);
      if (offset.x || offset.y) {
        el.style.transform = 'translate(' + offset.x + 'px, ' + offset.y + 'px)';
      } else {
        el.style.transform = '';
      }
    });
  }

  function createToolbar() {
    var toolbar = document.createElement('div');
    toolbar.className = 'home-layout-toolbar';

    toggleBtn = document.createElement('button');
    toggleBtn.className = 'home-layout-btn';
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Layout';

    var resetBtn = document.createElement('button');
    resetBtn.className = 'home-layout-btn';
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset';

    var saveBtn = document.createElement('button');
    saveBtn.className = 'home-layout-btn';
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';

    var copyBtn = document.createElement('button');
    copyBtn.className = 'home-layout-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy JSON';

    toggleBtn.addEventListener('click', function () {
      setLayoutMode(!state.active);
    });

    resetBtn.addEventListener('click', function () {
      state.offsets = Object.create(null);
      saveOffsets();
      applyOffsetsToDom();
      renderOverlay();
    });

    saveBtn.addEventListener('click', function () {
      saveOffsets();
      var snapshot = buildPayload();
      var payload = JSON.stringify(snapshot, null, 2);

      if (layoutTuning && layoutTuning.saveSnapshot) {
        layoutTuning.saveSnapshot({
          payload: snapshot,
          storageKey: STORAGE_KEY,
          lastExportKey: 'calyr.home.layout.lastExport.v1',
          filename: 'home_layout_offsets.json'
        }).then(function (result) {
          flashButtonLabel(saveBtn, result.downloaded ? 'Saved' : 'Saved Local', 1400);
        });
        return;
      }

      window.localStorage.setItem('calyr.home.layout.lastExport.v1', payload);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).catch(function () {
          // ignore clipboard failures in restricted environments
        });
      }
      var downloaded = downloadJsonFile('home_layout_offsets.json', payload);
      flashButtonLabel(saveBtn, downloaded ? 'Saved' : 'Saved Local', 1400);
    });

    copyBtn.addEventListener('click', function () {
      var payload = JSON.stringify(buildPayload(), null, 2);
      if (layoutTuning && layoutTuning.copyText) {
        layoutTuning.copyText(payload);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).catch(function () {
          // ignore clipboard failures in restricted environments
        });
      }
      flashButtonLabel(copyBtn, 'Copied', 1000);
      console.log('Homepage layout JSON:', payload);
    });

    toolbar.appendChild(toggleBtn);
    toolbar.appendChild(resetBtn);
    toolbar.appendChild(saveBtn);
    toolbar.appendChild(copyBtn);
    document.body.appendChild(toolbar);
  }

  function createLayers() {
    gridLayer = document.createElement('div');
    gridLayer.className = 'home-layout-grid';
    gridLayer.style.backgroundSize = GRID_SIZE + 'px ' + GRID_SIZE + 'px';

    overlayRoot = document.createElement('div');
    overlayRoot.className = 'home-layout-overlay';

    document.body.appendChild(gridLayer);
    document.body.appendChild(overlayRoot);
  }

  function setLayoutMode(active) {
    state.active = !!active;
    document.body.classList.toggle('home-layout-editing', state.active);
    if (toggleBtn) {
      toggleBtn.classList.toggle('is-active', state.active);
    }
    renderOverlay();
  }

  function updateOverlayForTarget(target) {
    var el = document.querySelector(target.selector);
    var box = state.overlayById[target.id];

    if (!el || !box) {
      if (box) box.style.display = 'none';
      return;
    }

    var rect = el.getBoundingClientRect();
    box.style.display = state.active ? '' : 'none';
    box.style.left = rect.left + 'px';
    box.style.top = rect.top + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
  }

  function renderOverlay() {
    if (!overlayRoot) return;

    TARGETS.forEach(function (target) {
      var box = state.overlayById[target.id];

      if (!box) {
        box = document.createElement('div');
        box.className = 'home-layout-box';
        box.dataset.targetId = target.id;

        var label = document.createElement('div');
        label.className = 'home-layout-label';
        label.textContent = target.label;

        var grip = document.createElement('button');
        grip.className = 'home-layout-grip';
        grip.type = 'button';
        grip.title = 'Drag ' + target.label;

        grip.addEventListener('pointerdown', function (event) {
          if (!state.active) return;
          event.preventDefault();

          var offset = ensureOffset(target.id);
          state.drag = {
            id: target.id,
            startX: event.clientX,
            startY: event.clientY,
            originX: offset.x,
            originY: offset.y,
            box: box
          };

          box.classList.add('is-dragging');
          grip.setPointerCapture(event.pointerId);
        });

        box.appendChild(label);
        box.appendChild(grip);
        overlayRoot.appendChild(box);
        state.overlayById[target.id] = box;
      }

      updateOverlayForTarget(target);
    });
  }

  function onPointerMove(event) {
    if (!state.drag) return;

    var dx = event.clientX - state.drag.startX;
    var dy = event.clientY - state.drag.startY;

    var nextX = snap(state.drag.originX + dx);
    var nextY = snap(state.drag.originY + dy);

    var offset = ensureOffset(state.drag.id);
    offset.x = nextX;
    offset.y = nextY;

    applyOffsetsToDom();
    renderOverlay();
  }

  function onPointerUp() {
    if (!state.drag) return;
    if (state.drag.box) {
      state.drag.box.classList.remove('is-dragging');
    }
    state.drag = null;
    saveOffsets();
  }

  function init() {
    if (!localLayoutTuningEnabled) return;

    createToolbar();
    createLayers();

    applyOffsetsToDom();
    renderOverlay();

    window.addEventListener('resize', renderOverlay);
    window.addEventListener('scroll', renderOverlay, { passive: true });

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
