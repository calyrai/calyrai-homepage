const DEFAULT_GRID_SIZE = 16;

const DEFAULT_PANELS = [
  { id: 'toolbar', label: 'Top Toolbar', x: 24, y: 18, w: 1180, h: 64, tone: 'toolbar', floating: false },
  { id: 'canvas', label: 'Flow Canvas', x: 24, y: 96, w: 820, h: 560, tone: 'canvas', floating: false },
  { id: 'inspector', label: 'Inspector Panel', x: 864, y: 96, w: 340, h: 560, tone: 'inspector', floating: false },
  { id: 'palette', label: 'Palette Drawer', x: 44, y: 126, w: 204, h: 310, tone: 'canvas', floating: false },
  { id: 'minimap', label: 'MiniMap', x: 74, y: 508, w: 170, h: 122, tone: 'floating', floating: true },
  { id: 'controls', label: 'Flow Controls', x: 1098, y: 126, w: 110, h: 170, tone: 'floating', floating: true },
  { id: 'reset', label: 'Reset Symbol', x: 114, y: 474, w: 56, h: 56, tone: 'floating', floating: true },
  { id: 'leftDragHandle', label: 'Left Drag Handle', x: 50, y: 340, w: 42, h: 42, tone: 'floating', floating: true },
  { id: 'rightDragHandle', label: 'Right Drag Handle', x: 1124, y: 340, w: 42, h: 42, tone: 'floating', floating: true }
];

(function initSchematic() {
  const stageEl = document.getElementById('af-schematic-stage');
  const stageSizeEl = document.getElementById('af-stage-size');
  const listEl = document.getElementById('af-panel-list');
  const jsonEl = document.getElementById('af-layout-json');
  const statusEl = document.getElementById('af-layout-status');

  const gridSizeEl = document.getElementById('af-grid-size');
  const snapToggleEl = document.getElementById('af-snap-toggle');
  const rasterToggleEl = document.getElementById('af-raster-toggle');
  const filterCoreEl = document.getElementById('af-filter-core');
  const filterInspectorEl = document.getElementById('af-filter-inspector');
  const filterFloatingEl = document.getElementById('af-filter-floating');
  const detailToggleEl = document.getElementById('af-detail-toggle');

  const resetBtn = document.getElementById('af-reset-layout');
  const copyBtn = document.getElementById('af-copy-layout');
  const applyBtn = document.getElementById('af-apply-layout');
  const loadPresentBtn = document.getElementById('af-load-present-layout');
  const targetInputEl = document.getElementById('af-layout-target');
  const targetHomepageBtn = document.getElementById('af-target-homepage');
  const targetAlphaFoldBtn = document.getElementById('af-target-alphafold');

  if (!stageEl || !jsonEl || !statusEl || !gridSizeEl || !snapToggleEl || !rasterToggleEl || !listEl) return;

  let gridSize = Number(gridSizeEl.value) || DEFAULT_GRID_SIZE;
  let snapEnabled = snapToggleEl.checked;
  let rasterVisible = rasterToggleEl.checked;
  let panelFilter = {
    core: filterCoreEl ? filterCoreEl.checked : true,
    inspector: filterInspectorEl ? filterInspectorEl.checked : true,
    floating: filterFloatingEl ? filterFloatingEl.checked : true
  };
  let includeFineElements = detailToggleEl ? detailToggleEl.checked : true;
  let panels = [];
  let autoLoadTried = false;

  function clonePanels(source) {
    return source.map(function (panel) {
      return {
        id: panel.id,
        label: panel.label,
        x: panel.x,
        y: panel.y,
        w: panel.w,
        h: panel.h,
        tone: panel.tone,
        floating: !!panel.floating
      };
    });
  }

  function snap(value) {
    if (!snapEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  function stageRect() {
    const rect = stageEl.getBoundingClientRect();
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  }

  function formatLayoutJson() {
    return JSON.stringify({
      gridSize: gridSize,
      panels: panels
    }, null, 2);
  }

  function setRaster() {
    stageEl.style.backgroundSize = gridSize + 'px ' + gridSize + 'px, ' + gridSize + 'px ' + gridSize + 'px, auto';
    stageEl.classList.toggle('is-raster-hidden', !rasterVisible);
  }

  function panelGroup(panel) {
    if (panel.tone === 'inspector') return 'inspector';
    if (panel.tone === 'floating') return 'floating';
    return 'core';
  }

  function getVisiblePanels() {
    return panels.filter(function (panel) {
      var group = panelGroup(panel);
      return !!panelFilter[group];
    });
  }

  function renderPanelList() {
    var visiblePanels = getVisiblePanels();
    listEl.innerHTML = visiblePanels.map(function (panel) {
      return '<div class="af-panel-row">'
        + '<span>' + panel.label + '</span>'
        + '<span>x:' + Math.round(panel.x) + '</span>'
        + '<span>y:' + Math.round(panel.y) + '</span>'
        + '<span>w:' + Math.round(panel.w) + '</span>'
        + '<span>h:' + Math.round(panel.h) + '</span>'
        + '</div>';
    }).join('');
  }

  function renderPanels() {
    stageEl.innerHTML = '';
    const size = stageRect();
    const visiblePanels = getVisiblePanels();
    stageSizeEl.textContent = size.width + ' x ' + size.height;

    visiblePanels.forEach(function (panel) {
      const panelEl = document.createElement('article');
      panelEl.className = 'af-schematic-panel' + (panel.floating ? ' is-floating' : '');
      panelEl.setAttribute('data-id', panel.id);
      panelEl.setAttribute('data-tone', panel.tone || 'canvas');
      panelEl.style.left = Math.round(panel.x) + 'px';
      panelEl.style.top = Math.round(panel.y) + 'px';
      panelEl.style.width = Math.round(panel.w) + 'px';
      panelEl.style.height = Math.round(panel.h) + 'px';

      const handleEl = document.createElement('div');
      handleEl.className = 'af-schematic-panel-handle';
      handleEl.innerHTML = '<strong>' + panel.label + '</strong><span>' + panel.id + '</span>';
      panelEl.appendChild(handleEl);

      const metaEl = document.createElement('div');
      metaEl.className = 'af-schematic-panel-meta';
      metaEl.textContent = 'Drag to reposition. Snap ' + (snapEnabled ? 'ON' : 'OFF');
      panelEl.appendChild(metaEl);

      attachDrag(panelEl, panel.id);
      stageEl.appendChild(panelEl);
    });

    jsonEl.value = formatLayoutJson();
    renderPanelList();
  }

  function attachDrag(panelEl, panelId) {
    const handleEl = panelEl.querySelector('.af-schematic-panel-handle');
    if (!handleEl) return;

    handleEl.addEventListener('pointerdown', function onPointerDown(event) {
      event.preventDefault();

      const panel = panels.find(function (item) { return item.id === panelId; });
      if (!panel) return;

      const size = stageRect();
      const startClientX = event.clientX;
      const startClientY = event.clientY;
      const startX = panel.x;
      const startY = panel.y;

      function onPointerMove(moveEvent) {
        const nextX = startX + (moveEvent.clientX - startClientX);
        const nextY = startY + (moveEvent.clientY - startClientY);

        panel.x = clamp(snap(nextX), 0, Math.max(0, size.width - panel.w));
        panel.y = clamp(snap(nextY), 0, Math.max(0, size.height - panel.h));

        panelEl.style.left = Math.round(panel.x) + 'px';
        panelEl.style.top = Math.round(panel.y) + 'px';

        jsonEl.value = formatLayoutJson();
        renderPanelList();
      }

      function onPointerUp() {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      }

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });
  }

  function normalizeIncomingPanels(rawPanels) {
    const size = stageRect();

    return rawPanels.map(function (rawPanel) {
      const fallback = DEFAULT_PANELS.find(function (item) { return item.id === rawPanel.id; }) || DEFAULT_PANELS[0];
      const panel = {
        id: String(rawPanel.id || fallback.id),
        label: String(rawPanel.label || fallback.label),
        x: Number.isFinite(Number(rawPanel.x)) ? Number(rawPanel.x) : fallback.x,
        y: Number.isFinite(Number(rawPanel.y)) ? Number(rawPanel.y) : fallback.y,
        w: Number.isFinite(Number(rawPanel.w)) ? Number(rawPanel.w) : fallback.w,
        h: Number.isFinite(Number(rawPanel.h)) ? Number(rawPanel.h) : fallback.h,
        tone: String(rawPanel.tone || fallback.tone || 'canvas'),
        floating: typeof rawPanel.floating === 'boolean' ? rawPanel.floating : !!fallback.floating
      };

      panel.w = clamp(snap(panel.w), 72, size.width);
      panel.h = clamp(snap(panel.h), 38, size.height);
      panel.x = clamp(snap(panel.x), 0, Math.max(0, size.width - panel.w));
      panel.y = clamp(snap(panel.y), 0, Math.max(0, size.height - panel.h));
      return panel;
    });
  }

  function panelSchemaFromAlphaFoldLayout() {
    return [
      { id: 'siteHeader', label: 'Site Header', selector: '.site-header', tone: 'toolbar', floating: false },
      { id: 'simpleMain', label: 'Main Shell', selector: '.af-simple-main', tone: 'canvas', floating: false },
      { id: 'simpleHeader', label: 'Page Header', selector: '.af-simple-header', tone: 'toolbar', floating: false },
      { id: 'simpleGrid', label: 'Page Grid', selector: '.af-simple-grid', tone: 'canvas', floating: false },
      { id: 'appRoot', label: 'App Root', selector: '#af-app-root', tone: 'canvas', floating: false },
      { id: 'editorShell', label: 'Editor Shell', selector: '.af-editor-shell', tone: 'canvas', floating: false },
      { id: 'toolbar', label: 'Top Toolbar', selector: '.af-toolbar', tone: 'toolbar', floating: false },
      { id: 'toolbarActions', label: 'Toolbar Actions', selector: '.af-toolbar-actions', tone: 'toolbar', floating: false },
      { id: 'modeRuler', label: 'Mode Ruler', selector: '.af-mode-ruler', tone: 'toolbar', floating: false },
      { id: 'mainGrid', label: 'Main Grid', selector: '.af-main-grid-job', tone: 'canvas', floating: false },
      { id: 'canvas', label: 'Flow Canvas', selector: '.af-canvas-panel', tone: 'canvas', floating: false },
      { id: 'flowRoot', label: 'Flow Root', selector: '.af-flow-root', tone: 'canvas', floating: false },
      { id: 'inspector', label: 'Inspector Panel', selector: '.af-inspector-panel:not(.is-hidden)', tone: 'inspector', floating: false },
      { id: 'inspectorHead', label: 'Inspector Head', selector: '.af-inspector-head', tone: 'inspector', floating: false },
      { id: 'inlineStatus', label: 'Inline Status', selector: '.af-inline-status', tone: 'inspector', floating: false },
      { id: 'inspectorSection', label: 'Inspector Section', selector: '.af-collapsible-section', tone: 'inspector', floating: false, multiple: true },
      { id: 'runMain', label: 'Run Inputs Main', selector: '.af-row-run-main', tone: 'inspector', floating: false },
      { id: 'runMeta', label: 'Run Inputs Meta', selector: '.af-row-run-meta', tone: 'inspector', floating: false },
      { id: 'resizeHandle', label: 'Resize Handle', selector: '.af-resize-handle', tone: 'inspector', floating: false },
      { id: 'palette', label: 'Palette Drawer', selector: '.af-palette-panel', tone: 'canvas', floating: false },
      { id: 'paletteBody', label: 'Palette Body', selector: '.af-palette-body', tone: 'canvas', floating: false },
      { id: 'minimap', label: 'MiniMap', selector: '.af-overview-minimap', tone: 'floating', floating: true },
      { id: 'controls', label: 'Flow Controls', selector: '.af-flow-controls', tone: 'floating', floating: true },
      { id: 'overlay', label: 'Flow Overlay', selector: '.af-flow-overlay', tone: 'floating', floating: true },
      { id: 'reset', label: 'Reset Symbol', selector: '.af-reset-symbol', tone: 'floating', floating: true },
      { id: 'leftDragHandle', label: 'Left Drag Handle', selector: '.af-float-drag-handle--left', tone: 'floating', floating: true },
      { id: 'rightDragHandle', label: 'Right Drag Handle', selector: '.af-float-drag-handle--right', tone: 'floating', floating: true }
    ];
  }

  function isLikelyFloatingElement(node) {
    if (!node) return false;
    var cls = String(node.className || '').toLowerCase();
    if (cls.indexOf('floating') >= 0 || cls.indexOf('overlay') >= 0 || cls.indexOf('minimap') >= 0 || cls.indexOf('controls') >= 0) return true;
    var style = window.getComputedStyle(node);
    return style.position === 'fixed' || style.position === 'absolute';
  }

  function getHomepageTone(node) {
    var cls = String(node.className || '').toLowerCase();
    var tag = String(node.tagName || '').toLowerCase();
    if (tag === 'header' || tag === 'nav' || cls.indexOf('header') >= 0 || cls.indexOf('nav') >= 0 || cls.indexOf('toolbar') >= 0) return 'toolbar';
    if (tag === 'aside' || cls.indexOf('panel') >= 0 || cls.indexOf('sidebar') >= 0 || cls.indexOf('inspector') >= 0) return 'inspector';
    if (isLikelyFloatingElement(node)) return 'floating';
    return 'canvas';
  }

  function getNodeLabel(node, fallbackIndex) {
    var aria = node && node.getAttribute ? String(node.getAttribute('aria-label') || '').trim() : '';
    if (aria) return aria;
    var text = node && node.textContent ? String(node.textContent).replace(/\s+/g, ' ').trim() : '';
    if (text) return text.slice(0, 28);
    var id = node && node.id ? String(node.id).trim() : '';
    if (id) return id;
    var classes = node && typeof node.className === 'string'
      ? node.className.trim().split(/\s+/).filter(Boolean)
      : [];
    if (classes.length) return classes[0];
    var tag = String(node && node.tagName ? node.tagName : 'element').toLowerCase();
    return tag + '-' + fallbackIndex;
  }

  function panelSchemaFromHomepage(doc) {
    var baseSelectors = 'header, nav, main, section, article, aside, footer, [class*="hero"], [class*="grid"], [class*="panel"], [class*="card"], [class*="tile"], [class*="layout"]';
    var fineSelectors = 'a, button, [role="button"], [class*="cta"], [class*="pill"], [class*="badge"], [class*="chip"], [class*="title"], [class*="subtitle"], h1, h2, h3, h4, p';
    var selector = includeFineElements ? (baseSelectors + ', ' + fineSelectors) : baseSelectors;
    var nodes = Array.from(doc.querySelectorAll(selector));
    var unique = [];
    var seen = new Set();
    nodes.forEach(function (node) {
      if (!node || !node.getBoundingClientRect) return;
      if (seen.has(node)) return;
      seen.add(node);
      var rect = node.getBoundingClientRect();
      var minW = includeFineElements ? 18 : 40;
      var minH = includeFineElements ? 14 : 24;
      if (rect.width < minW || rect.height < minH) return;
      unique.push(node);
    });

    var maxItems = includeFineElements ? 260 : 120;
    return unique.slice(0, maxItems).map(function (node, index) {
      var label = getNodeLabel(node, index + 1);
      var tone = getHomepageTone(node);
      return {
        id: 'homepage-' + (index + 1) + '-' + label.replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase(),
        label: label,
        selector: null,
        tone: tone,
        floating: tone === 'floating',
        element: node
      };
    });
  }

  function getSchemaForDocument(doc) {
    if (doc.querySelector('.af-editor-shell')) {
      return panelSchemaFromAlphaFoldLayout();
    }
    return panelSchemaFromHomepage(doc);
  }

  function waitForLiveLayout(frameWindow, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var startedAt = Date.now();
      var timer = null;

      function done(err, result) {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
        if (err) reject(err);
        else resolve(result);
      }

      timer = window.setInterval(function () {
        try {
          var doc = frameWindow && frameWindow.document;
          if (!doc) return;
          var isAlphaFold = !!doc.querySelector('.af-editor-shell');
          if (isAlphaFold) {
            var root = doc.querySelector('.af-editor-shell');
            var canvas = doc.querySelector('.af-canvas-panel');
            if (root && canvas) {
              done(null, { doc: doc, root: root });
              return;
            }
          }

          var genericReady = !!(doc.body && (doc.querySelector('main') || doc.body.children.length > 0));
          if (genericReady) {
            done(null, { doc: doc, root: doc.body });
            return;
          }
        } catch (_err) {
          // Keep polling until timeout for late hydration.
        }

        if (Date.now() - startedAt > timeoutMs) {
          done(new Error('Timed out waiting for current layout render.'));
        }
      }, 140);
    });
  }

  function capturePanelsFromLiveDocument(doc, rootRect, stageSize) {
    var scaleX = stageSize.width / Math.max(1, rootRect.width);
    var scaleY = stageSize.height / Math.max(1, rootRect.height);
    var capturedById = {};

    function toStagePanel(schema, rect, id, label) {
      var x = (rect.left - rootRect.left) * scaleX;
      var y = (rect.top - rootRect.top) * scaleY;
      var w = rect.width * scaleX;
      var h = rect.height * scaleY;
      if (!(w > 0 && h > 0)) return null;
      return {
        id: id,
        label: label,
        x: x,
        y: y,
        w: w,
        h: h,
        tone: schema.tone,
        floating: schema.floating
      };
    }

    getSchemaForDocument(doc).forEach(function (schema) {
      var nodes = schema.element
        ? [schema.element]
        : schema.multiple
        ? Array.from(doc.querySelectorAll(schema.selector || ''))
        : [doc.querySelector(schema.selector || '')].filter(Boolean);

      nodes.forEach(function (node, index) {
        var rect = node.getBoundingClientRect();
        var id = schema.multiple ? schema.id + '-' + (index + 1) : schema.id;
        var label = schema.multiple ? schema.label + ' ' + (index + 1) : schema.label;
        var panel = toStagePanel(schema, rect, id, label);
        if (!panel) return;
        capturedById[panel.id] = panel;
      });
    });

    return Object.values(capturedById);
  }

  function getLivePageRect(doc) {
    var body = doc && doc.body ? doc.body : null;
    var documentElement = doc && doc.documentElement ? doc.documentElement : null;
    var width = Math.max(
      documentElement ? documentElement.clientWidth : 0,
      documentElement ? documentElement.scrollWidth : 0,
      body ? body.scrollWidth : 0
    );
    var height = Math.max(
      documentElement ? documentElement.clientHeight : 0,
      documentElement ? documentElement.scrollHeight : 0,
      body ? body.scrollHeight : 0
    );

    return {
      left: 0,
      top: 0,
      width: Math.max(1, width),
      height: Math.max(1, height)
    };
  }

  async function loadCurrentLayoutToRaster() {
    var targetUrl = targetInputEl && String(targetInputEl.value || '').trim()
      ? String(targetInputEl.value || '').trim()
      : 'glabs_nexus_engines_alphafold.html';
    setStatus('Loading panel geometry from ' + targetUrl + ' ...');

    var iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.left = '-200vw';
    iframe.style.top = '-200vh';
    iframe.style.width = '1600px';
    iframe.style.height = '980px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    try {
      await new Promise(function (resolve, reject) {
        var settled = false;
        var timeoutId = window.setTimeout(function () {
          if (settled) return;
          settled = true;
          reject(new Error('Timed out while opening target page.'));
        }, 7000);

        function done(err) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          if (err) reject(err);
          else resolve();
        }

        iframe.onload = function () { done(null); };
        iframe.onerror = function () { done(new Error('Could not open target page.')); };
        var connector = targetUrl.indexOf('?') >= 0 ? '&' : '?';
        iframe.src = targetUrl + connector + 'schematic_probe=1&t=' + Date.now();
        document.body.appendChild(iframe);
      });

      var ready = await waitForLiveLayout(iframe.contentWindow, 7000);
      var sourceRootRect = getLivePageRect(ready.doc);
      var targetStage = stageRect();
      var captured = capturePanelsFromLiveDocument(ready.doc, sourceRootRect, targetStage);

      if (!captured.length) {
        throw new Error('No panels were detected in the current layout.');
      }

      panels = normalizeIncomingPanels(captured);
      renderPanels();
      setStatus('Loaded ' + captured.length + ' panels from current layout.');
    } catch (err) {
      setStatus('Load failed: ' + String(err && err.message ? err.message : err), true);
    } finally {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  }

  gridSizeEl.addEventListener('change', function () {
    const next = Number(gridSizeEl.value);
    if (!Number.isFinite(next) || next <= 0) return;
    gridSize = next;
    setRaster();
    panels = normalizeIncomingPanels(panels);
    renderPanels();
    setStatus('Raster set to ' + gridSize + ' px.');
  });

  snapToggleEl.addEventListener('change', function () {
    snapEnabled = snapToggleEl.checked;
    panels = normalizeIncomingPanels(panels);
    renderPanels();
    setStatus('Snap ' + (snapEnabled ? 'enabled.' : 'disabled.'));
  });

  rasterToggleEl.addEventListener('change', function () {
    rasterVisible = rasterToggleEl.checked;
    setRaster();
    setStatus('Raster ' + (rasterVisible ? 'visible.' : 'hidden.'));
  });

  function bindFilterToggle(filterEl, key, label) {
    if (!filterEl) return;
    filterEl.addEventListener('change', function () {
      panelFilter[key] = filterEl.checked;
      renderPanels();
      setStatus(label + ' panels ' + (filterEl.checked ? 'shown.' : 'hidden.'));
    });
  }

  bindFilterToggle(filterCoreEl, 'core', 'Core');
  bindFilterToggle(filterInspectorEl, 'inspector', 'Inspector');
  bindFilterToggle(filterFloatingEl, 'floating', 'Floating');

  if (detailToggleEl) {
    detailToggleEl.addEventListener('change', function () {
      includeFineElements = detailToggleEl.checked;
      setStatus('Fine element capture ' + (includeFineElements ? 'enabled.' : 'disabled.') + ' Reload layout to apply.');
    });
  }

  resetBtn.addEventListener('click', function () {
    panels = normalizeIncomingPanels(clonePanels(DEFAULT_PANELS));
    renderPanels();
    setStatus('Layout reset to defaults.');
  });

  copyBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(formatLayoutJson());
      setStatus('Layout JSON copied to clipboard.');
    } catch (_err) {
      setStatus('Clipboard not available. Copy from the JSON area.', true);
    }
  });

  applyBtn.addEventListener('click', function () {
    try {
      const parsed = JSON.parse(jsonEl.value);
      if (!parsed || !Array.isArray(parsed.panels)) {
        throw new Error('Expected object with a panels array.');
      }
      if (Number.isFinite(Number(parsed.gridSize)) && Number(parsed.gridSize) > 0) {
        gridSize = Number(parsed.gridSize);
        gridSizeEl.value = String(gridSize);
      }
      panels = normalizeIncomingPanels(parsed.panels);
      setRaster();
      renderPanels();
      setStatus('JSON applied.');
    } catch (err) {
      setStatus('Invalid JSON: ' + String(err && err.message ? err.message : err), true);
    }
  });

  if (loadPresentBtn) {
    loadPresentBtn.addEventListener('click', function () {
      loadCurrentLayoutToRaster();
    });
  }

  if (targetHomepageBtn && targetInputEl) {
    targetHomepageBtn.addEventListener('click', function () {
      targetInputEl.value = '../../index.html';
      setStatus('Target set to homepage.');
    });
  }

  if (targetAlphaFoldBtn && targetInputEl) {
    targetAlphaFoldBtn.addEventListener('click', function () {
      targetInputEl.value = 'glabs_nexus_engines_alphafold.html';
      setStatus('Target set to AlphaFold editor.');
    });
  }

  window.addEventListener('resize', function () {
    panels = normalizeIncomingPanels(panels);
    renderPanels();
  });

  async function bootstrap() {
    setRaster();
    panels = normalizeIncomingPanels(clonePanels(DEFAULT_PANELS));
    renderPanels();
    setStatus('Schematic ready. Drag blocks to position the panels.');

    // Try one automatic import from the current AlphaFold layout so the raster
    // starts from the live UI geometry without requiring an extra click.
    if (!autoLoadTried) {
      autoLoadTried = true;
      await loadCurrentLayoutToRaster();
    }
  }

  bootstrap();
})();
