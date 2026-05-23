(function () {
  'use strict';

  var SESSION_KEY = 'citizen_session';
  var STORAGE_KEY = 'calyr.page.layout.offsets.v1:' + window.location.pathname;
  var GRID_SIZE = 16;

  function isLoggedIn() {
    try {
      var raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      return !!(parsed && parsed.authenticated);
    } catch (_err) {
      return false;
    }
  }

  function toNumber(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function snap(value) {
    return Math.round(toNumber(value) / GRID_SIZE) * GRID_SIZE;
  }

  function loadOffsets() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.create(null);
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : Object.create(null);
    } catch (_err) {
      return Object.create(null);
    }
  }

  function saveOffsets(offsets) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offsets));
    } catch (_err) {
      // ignore storage failures
    }
  }

  function downloadJson(filename, content) {
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
    } catch (_err) {
      // ignore download failures
    }
  }

  function collectTargets() {
    var targets = [];

    function add(id, label, selector) {
      if (!document.querySelector(selector)) return;
      targets.push({ id: id, label: label, selector: selector });
    }

    add('header', 'header', '.site-header');
    add('main', 'main', 'main');
    add('footer', 'footer', '.site-footer');

    var main = document.querySelector('main');
    if (main) {
      Array.prototype.slice.call(main.children).forEach(function (child, idx) {
        if (!child || child.nodeType !== 1) return;
        var name = child.id ? child.id : (child.className ? String(child.className).split(/\s+/)[0] : 'section-' + (idx + 1));
        child.setAttribute('data-layout-target-id', 'mainChild' + idx);
        targets.push({
          id: 'mainChild' + idx,
          label: 'main:' + name,
          selector: '[data-layout-target-id="mainChild' + idx + '"]'
        });
      });
    }

    return targets;
  }

  function applyOffsets(targets, offsets) {
    targets.forEach(function (target) {
      var el = document.querySelector(target.selector);
      if (!el) return;
      var entry = offsets[target.id] || { x: 0, y: 0 };
      var x = toNumber(entry.x);
      var y = toNumber(entry.y);
      if (x || y) {
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      } else {
        el.style.transform = '';
      }
    });
  }

  function init() {
    if (!isLoggedIn()) return;

    var targets = collectTargets();
    if (!targets.length) return;

    var state = {
      active: false,
      offsets: loadOffsets(),
      drag: null,
      overlays: Object.create(null)
    };

    var toolbar = document.createElement('div');
    toolbar.className = 'global-layout-toolbar home-layout-toolbar';

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'home-layout-btn';
    toggleBtn.textContent = 'Layout';

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'home-layout-btn';
    resetBtn.textContent = 'Reset';

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'home-layout-btn';
    saveBtn.textContent = 'Save';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'home-layout-btn';
    copyBtn.textContent = 'Copy JSON';

    toolbar.appendChild(toggleBtn);
    toolbar.appendChild(resetBtn);
    toolbar.appendChild(saveBtn);
    toolbar.appendChild(copyBtn);
    document.body.appendChild(toolbar);

    var toolbarHeight = Math.max(44, Math.ceil(toolbar.getBoundingClientRect().height + 12));
    document.body.classList.add('layout-interface-visible');
    document.documentElement.style.setProperty('--layout-interface-offset', toolbarHeight + 'px');

    var grid = document.createElement('div');
    grid.className = 'home-layout-grid';
    grid.style.backgroundSize = GRID_SIZE + 'px ' + GRID_SIZE + 'px';
    document.body.appendChild(grid);

    var overlay = document.createElement('div');
    overlay.className = 'home-layout-overlay';
    document.body.appendChild(overlay);

    function setMode(active) {
      state.active = !!active;
      document.body.classList.toggle('home-layout-editing', state.active);
      toggleBtn.classList.toggle('is-active', state.active);
      renderOverlay();
    }

    function renderOverlay() {
      targets.forEach(function (target) {
        var box = state.overlays[target.id];
        var el = document.querySelector(target.selector);

        if (!box) {
          box = document.createElement('div');
          box.className = 'home-layout-box';
          var label = document.createElement('div');
          label.className = 'home-layout-label';
          label.textContent = target.label;
          var grip = document.createElement('div');
          grip.className = 'home-layout-grip';

          grip.addEventListener('pointerdown', function (event) {
            if (!state.active) return;
            event.preventDefault();
            var entry = state.offsets[target.id] || { x: 0, y: 0 };
            state.drag = {
              id: target.id,
              startX: event.clientX,
              startY: event.clientY,
              originX: toNumber(entry.x),
              originY: toNumber(entry.y),
              box: box
            };
            box.classList.add('is-dragging');
            window.addEventListener('pointermove', onDragMove);
            window.addEventListener('pointerup', onDragEnd);
          });

          box.appendChild(label);
          box.appendChild(grip);
          overlay.appendChild(box);
          state.overlays[target.id] = box;
        }

        if (!state.active || !el) {
          box.style.display = 'none';
          return;
        }

        var rect = el.getBoundingClientRect();
        box.style.display = '';
        box.style.left = rect.left + 'px';
        box.style.top = rect.top + 'px';
        box.style.width = rect.width + 'px';
        box.style.height = rect.height + 'px';
      });
    }

    function onDragMove(event) {
      if (!state.drag) return;
      var dx = snap(event.clientX - state.drag.startX);
      var dy = snap(event.clientY - state.drag.startY);
      state.offsets[state.drag.id] = {
        x: state.drag.originX + dx,
        y: state.drag.originY + dy
      };
      applyOffsets(targets, state.offsets);
      renderOverlay();
    }

    function onDragEnd() {
      if (state.drag && state.drag.box) {
        state.drag.box.classList.remove('is-dragging');
      }
      state.drag = null;
      saveOffsets(state.offsets);
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
    }

    toggleBtn.addEventListener('click', function () {
      setMode(!state.active);
    });

    resetBtn.addEventListener('click', function () {
      state.offsets = Object.create(null);
      saveOffsets(state.offsets);
      applyOffsets(targets, state.offsets);
      renderOverlay();
    });

    saveBtn.addEventListener('click', function () {
      saveOffsets(state.offsets);
      var payload = JSON.stringify({ gridSize: GRID_SIZE, offsets: state.offsets }, null, 2);
      downloadJson('layout_offsets_' + (window.location.pathname.split('/').pop() || 'page') + '.json', payload);
      saveBtn.textContent = 'Saved';
      window.setTimeout(function () { saveBtn.textContent = 'Save'; }, 1000);
    });

    copyBtn.addEventListener('click', function () {
      var payload = JSON.stringify({ gridSize: GRID_SIZE, offsets: state.offsets }, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).catch(function () {
          // ignore clipboard failure
        });
      }
      copyBtn.textContent = 'Copied';
      window.setTimeout(function () { copyBtn.textContent = 'Copy JSON'; }, 1000);
    });

    applyOffsets(targets, state.offsets);
    window.addEventListener('resize', renderOverlay, { passive: true });
    window.addEventListener('scroll', renderOverlay, { passive: true });
    renderOverlay();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
