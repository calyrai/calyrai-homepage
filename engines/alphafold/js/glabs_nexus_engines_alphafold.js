(function () {
  'use strict';

  var flowRoot = document.getElementById('glabs-flow-root');
  var backpackPanelRoot = document.getElementById('backpack-panel-root');
  var brailleInputRoot = document.getElementById('braille-input-root');
  var activeNodePanelRoot = document.getElementById('active-node-panel-root');
  var connectedListRoot = document.getElementById('connected-list-root');
  var contentOutlineRoot = document.getElementById('content-outline-root');
  var terminalPanelRoot = document.getElementById('terminal-panel-root');
  var commentPanelRoot = document.getElementById('comment-panel-root');

  if (!flowRoot || !backpackPanelRoot || !brailleInputRoot || !activeNodePanelRoot || !connectedListRoot || !contentOutlineRoot || !terminalPanelRoot || !commentPanelRoot) {
    return;
  }

  var rootRegistry = {
    'glabs-flow-root': flowRoot,
    'backpack-panel-root': backpackPanelRoot,
    'braille-input-root': brailleInputRoot,
    'active-node-panel-root': activeNodePanelRoot,
    'connected-list-root': connectedListRoot,
    'content-outline-root': contentOutlineRoot,
    'terminal-panel-root': terminalPanelRoot,
    'comment-panel-root': commentPanelRoot
  };

  var pipelineSteps = [
    {
      id: 'input', label: 'Input', sublabel: 'Sequence', role: 'code',
      bits: '100000', accent: 'cyan', codeIndex: 0,
      jsonSettings: { step: 'input_sequence', accepts: 'amino_acid_string', chain: null, seeds: [1] }
    },
    {
      id: 'parse', label: 'Parse', sublabel: 'Split JSON', role: 'code',
      bits: '110000', accent: 'cyan', codeIndex: 1,
      jsonSettings: { step: 'parse_split_json', format: 'nexus.split_definition', fields: ['object_id', 'segments'] }
    },
    {
      id: 'mask', label: 'Mask', sublabel: 'Apply Policy', role: 'code',
      bits: '111000', accent: 'cyan', codeIndex: 2,
      jsonSettings: { step: 'apply_mask_policy', policies: ['withheld', 'transformed'], replacement_char: 'X' }
    },
    {
      id: 'build', label: 'Build', sublabel: 'AF3 Payload', role: 'code',
      bits: '111100', accent: 'cyan', codeIndex: 3,
      jsonSettings: { step: 'build_af3_payload', dialect: 'alphafold3', version: 1, output_fields: ['name', 'modelSeeds', 'sequences'] }
    },
    {
      id: 'submit', label: 'Submit', sublabel: 'Job', role: 'code',
      bits: '111110', accent: 'cyan', codeIndex: 4,
      jsonSettings: { step: 'submit_job', target: 'alphafoldserver.com', method: 'paste_json' }
    },
    {
      id: 'plot-seq', label: 'Seq View', role: 'plot',
      bits: '100001', accent: 'white', parentStep: 'input',
      jsonSettings: { output: 'sequence_display', format: 'linear_aa_view' }
    },
    {
      id: 'plot-seg', label: 'Seg Map', role: 'plot',
      bits: '110001', accent: 'white', parentStep: 'parse',
      jsonSettings: { output: 'segment_map', format: 'range_chart' }
    },
    {
      id: 'plot-mask', label: 'Mask View', role: 'plot',
      bits: '111001', accent: 'white', parentStep: 'mask',
      jsonSettings: { output: 'mask_preview', format: 'sequence_diff_view' }
    },
    {
      id: 'plot-score', label: 'Score', role: 'plot',
      bits: '111101', accent: 'white', parentStep: 'build',
      jsonSettings: { output: 'plddt_chart', format: 'per_residue_score' }
    }
  ];

  var state = {
    config: null,
    sequence: '',
    splitDefinitionText: '',
    jobName: '',
    chainId: 'A',
    modelSeedsText: '1',
    transformedSequence: '',
    alphafoldPayload: null,
    terminalLines: [
      '[glabs.nexus.engines.alphafold] boot sequence',
      '[layout] loading JSON definition...'
    ],
    activePanel: 'input',
    tiles: [],
    registryStepBits: (function () {
      var map = {};
      pipelineSteps.forEach(function (s) { map[s.id] = s.bits; });
      return map;
    }())
  };

  init();

  async function init() {
    try {
      var configUrl = new URL('../data/glabs_nexus_engines_alphafold_layout.json?v=20260516-pearl-r1', import.meta.url);
      var response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error('Failed to load layout JSON.');
      }

      var config = await response.json();
      state.config = config;
      hydrateDefaults(config);
      state.tiles = normalizeTiles(config);
      state.terminalLines.push('[layout] JSON loaded: ' + (config.engine || 'unknown engine'));
      state.terminalLines.push('[layout] tiles loaded from JSON: ' + state.tiles.length);
      state.terminalLines.push('[layout] composition applied to G\'labs panel layout');
      retitlePanels();
      openRequiredPanels();
      bindPanelWindows();
      render();
    } catch (error) {
      state.terminalLines.push('[error] ' + String(error && error.message ? error.message : error));
      render();
    }
  }

  function hydrateDefaults(config) {
    var defaults = config.defaults || {};
    state.sequence = String(defaults.sequence || '');
    state.jobName = String(defaults.jobName || 'NX-AF3-001');
    state.chainId = String(defaults.chainId || 'A').slice(0, 1).toUpperCase() || 'A';
    state.modelSeedsText = Array.isArray(defaults.modelSeeds) && defaults.modelSeeds.length
      ? defaults.modelSeeds.join(',')
      : '1';
    state.splitDefinitionText = JSON.stringify(defaults.splitDefinition || { object_id: 'Scientific/Object/1', segments: [] }, null, 2);
  }

  function render() {
    var tiles = state.tiles && state.tiles.length ? state.tiles : getDefaultTiles();
    tiles
      .slice()
      .sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); })
      .forEach(function (tile) {
        renderTileFromConfig(tile);
      });
  }

  function renderTileFromConfig(tile) {
    var rootId = tile.rootId;
    var parent = rootRegistry[rootId] || document.getElementById(rootId);
    if (!parent) return;

    if (tile.type === 'registry') {
      renderRegistryPanel(parent);
      return;
    }
    if (tile.type === 'input') {
      renderInputTile(parent);
      return;
    }
    if (tile.type === 'computation') {
      renderComputationTile(parent);
      return;
    }
    if (tile.type === 'selection') {
      renderSelectionPanel(parent);
      return;
    }
    if (tile.type === 'segments') {
      renderSegmentsPanel(parent);
      return;
    }
    if (tile.type === 'flow') {
      renderContentsPanel(parent);
      return;
    }
    if (tile.type === 'terminal') {
      renderTerminalTile(parent);
      return;
    }
    if (tile.type === 'split_json') {
      renderSplitEditor(parent);
      return;
    }

    parent.innerHTML = '';
    var fallback = document.createElement('div');
    fallback.className = 'af-panel-block';
    fallback.innerHTML = '<p class="af-muted-copy">Unknown tile type: ' + escapeHtml(String(tile.type || 'undefined')) + '</p>';
    parent.appendChild(fallback);
  }

  function renderRegistryPanel(parent) {
    parent.innerHTML = '';
    var block = document.createElement('div');
    block.className = 'af-panel-block';

    var title = document.createElement('h3');
    title.className = 'af-inline-title';
    title.textContent = 'Registry';
    block.appendChild(title);

    var badgeRow = document.createElement('div');
    badgeRow.className = 'af-badge-row';
    badgeRow.appendChild(makeBadge(state.config ? state.config.engine : 'glabs.nexus.engines.alphafold'));
    badgeRow.appendChild(makeBadge('status: ready'));
    block.appendChild(badgeRow);

    var stepList = document.createElement('div');
    stepList.className = 'af-registry-step-list';

    pipelineSteps.forEach(function (step) {
      var item = document.createElement('div');
      item.className = 'af-registry-step af-registry-step-' + step.role;

      var header = document.createElement('div');
      header.className = 'af-registry-step-header';

      var brailleWrap = document.createElement('div');
      brailleWrap.className = 'af-registry-step-braille';
      brailleWrap.appendChild(makeBrailleDots(state.registryStepBits[step.id] || step.bits));

      var nameLine = document.createElement('span');
      nameLine.className = 'af-registry-step-name';
      nameLine.textContent = step.label + (step.sublabel ? ' — ' + step.sublabel : '');

      var bitsLabel = document.createElement('span');
      bitsLabel.className = 'af-registry-step-bits-label';
      bitsLabel.textContent = state.registryStepBits[step.id] || step.bits;

      header.appendChild(brailleWrap);
      header.appendChild(nameLine);
      header.appendChild(bitsLabel);
      item.appendChild(header);

      var jsonBlock = document.createElement('pre');
      jsonBlock.className = 'af-registry-step-json';
      jsonBlock.textContent = JSON.stringify(step.jsonSettings, null, 2);
      item.appendChild(jsonBlock);

      stepList.appendChild(item);
    });

    block.appendChild(stepList);
    parent.appendChild(block);
  }

  function renderTerminalTile(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    var pre = document.createElement('pre');
    pre.className = 'af-terminal';
    pre.textContent = state.terminalLines.join('\n');
    wrap.appendChild(pre);

    var controls = document.createElement('div');
    controls.className = 'af-row';

    var runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.className = 'af-btn af-btn-primary';
    runBtn.textContent = 'Run Composition';
    runBtn.addEventListener('click', function () {
      computePayload();
    });

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'af-btn';
    clearBtn.textContent = 'Clear Log';
    clearBtn.addEventListener('click', function () {
      state.terminalLines = ['[glabs.nexus.engines.alphafold] log cleared'];
      render();
    });

    controls.appendChild(runBtn);
    controls.appendChild(clearBtn);
    wrap.appendChild(controls);
    parent.appendChild(wrap);
  }

  function renderInputTile(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    var sequenceLabel = document.createElement('label');
    sequenceLabel.className = 'af-field';
    sequenceLabel.innerHTML = '<span>Primary Sequence</span>';
    var sequenceInput = document.createElement('textarea');
    sequenceInput.className = 'af-textarea';
    sequenceInput.rows = 4;
    sequenceInput.value = state.sequence;
    sequenceInput.placeholder = 'Enter amino acid sequence';
    sequenceInput.addEventListener('input', function (event) {
      state.sequence = cleanSequence(event.target.value);
    });
    sequenceLabel.appendChild(sequenceInput);
    wrap.appendChild(sequenceLabel);

    var row = document.createElement('div');
    row.className = 'af-row af-row-grid';

    var jobField = makeInputField('Job Name', state.jobName, function (value) {
      state.jobName = value || 'NX-AF3-001';
    });
    var chainField = makeInputField('Chain ID', state.chainId, function (value) {
      var next = String(value || 'A').trim().toUpperCase();
      state.chainId = next ? next.slice(0, 1) : 'A';
    });
    var seedsField = makeInputField('Model Seeds (comma)', state.modelSeedsText, function (value) {
      state.modelSeedsText = value;
    });

    row.appendChild(jobField);
    row.appendChild(chainField);
    row.appendChild(seedsField);
    wrap.appendChild(row);

    var splitLabel = document.createElement('label');
    splitLabel.className = 'af-field';
    splitLabel.innerHTML = '<span>Split Definition JSON</span>';
    var splitInput = document.createElement('textarea');
    splitInput.className = 'af-textarea af-textarea-code';
    splitInput.rows = 16;
    splitInput.value = state.splitDefinitionText;
    splitInput.addEventListener('input', function (event) {
      state.splitDefinitionText = event.target.value;
    });
    splitLabel.appendChild(splitInput);
    wrap.appendChild(splitLabel);

    var actionRow = document.createElement('div');
    actionRow.className = 'af-row';
    var runBtn = document.createElement('button');
    runBtn.type = 'button';
    runBtn.className = 'af-btn af-btn-primary';
    runBtn.textContent = 'Compose AlphaFold JSON';
    runBtn.addEventListener('click', function () {
      computePayload();
    });
    actionRow.appendChild(runBtn);
    wrap.appendChild(actionRow);

    parent.appendChild(wrap);
  }

  function renderComputationTile(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    var info = document.createElement('div');
    info.className = 'af-compute-info';
    info.innerHTML = state.alphafoldPayload
      ? '<p>Payload ready for AlphaFold Server.</p><p><strong>Protected sequence:</strong> ' + escapeHtml(state.transformedSequence) + '</p>'
      : '<p>Run composition to generate AlphaFold JSON.</p>';
    wrap.appendChild(info);

    renderEvaluationGraph(wrap);

    var output = document.createElement('pre');
    output.className = 'af-json-output';
    output.textContent = state.alphafoldPayload
      ? JSON.stringify(state.alphafoldPayload, null, 2)
      : '{\n  "status": "awaiting-input"\n}';
    wrap.appendChild(output);

    var actionRow = document.createElement('div');
    actionRow.className = 'af-row';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'af-btn';
    copyBtn.textContent = 'Copy AlphaFold JSON';
    copyBtn.disabled = !state.alphafoldPayload;
    copyBtn.addEventListener('click', async function () {
      if (!state.alphafoldPayload) return;
      try {
        await navigator.clipboard.writeText(JSON.stringify(state.alphafoldPayload, null, 2));
        state.terminalLines.push('[clipboard] AlphaFold JSON copied');
      } catch (_error) {
        state.terminalLines.push('[clipboard] copy failed');
      }
      render();
    });

    var openBtn = document.createElement('a');
    openBtn.className = 'af-btn af-btn-primary';
    openBtn.href = (state.config && state.config.alphafoldServerUrl) || 'https://alphafoldserver.com';
    openBtn.target = '_blank';
    openBtn.rel = 'noopener noreferrer';
    openBtn.textContent = 'Open AlphaFold Server';

    var loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'af-btn af-btn-primary';
    loadBtn.textContent = 'Load Result Now';
    loadBtn.disabled = !state.alphafoldPayload;
    loadBtn.addEventListener('click', async function () {
      if (!state.alphafoldPayload) return;
      var payloadText = JSON.stringify(state.alphafoldPayload, null, 2);
      try {
        await navigator.clipboard.writeText(payloadText);
        state.terminalLines.push('[result] payload copied to clipboard');
      } catch (_error) {
        state.terminalLines.push('[result] clipboard unavailable, use Download Result JSON');
      }
      var targetUrl = (state.config && state.config.alphafoldServerUrl) || 'https://alphafoldserver.com';
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      state.terminalLines.push('[result] AlphaFold Server opened; paste payload there');
      render();
    });

    var downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'af-btn';
    downloadBtn.textContent = 'Download Result JSON';
    downloadBtn.disabled = !state.alphafoldPayload;
    downloadBtn.addEventListener('click', function () {
      if (!state.alphafoldPayload) return;
      var payloadText = JSON.stringify(state.alphafoldPayload, null, 2);
      var blob = new Blob([payloadText], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = (state.jobName || 'nexus-alphafold') + '.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      state.terminalLines.push('[result] downloaded ' + anchor.download);
      render();
    });

    actionRow.appendChild(copyBtn);
    actionRow.appendChild(downloadBtn);
    actionRow.appendChild(loadBtn);
    actionRow.appendChild(openBtn);
    wrap.appendChild(actionRow);

    parent.appendChild(wrap);
  }

  function renderEvaluationGraph(parent) {
    var codeSteps = pipelineSteps.filter(function (s) { return s.role === 'code'; });
    var plotByParent = {};
    pipelineSteps.filter(function (s) { return s.role === 'plot'; }).forEach(function (s) {
      plotByParent[s.parentStep] = s;
    });

    var completed = state.alphafoldPayload ? 4 : 0;

    var graph = document.createElement('div');
    graph.className = 'af-pearl-graph';
    graph.setAttribute('aria-label', 'AlphaFold evaluation pipeline');

    codeSteps.forEach(function (step, idx) {
      var col = document.createElement('div');
      col.className = 'af-pearl-col';

      var codeNode = document.createElement('div');
      codeNode.className = 'af-pearl-node is-code';
      if (idx < completed) codeNode.classList.add('is-done');
      if (idx === completed) codeNode.classList.add('is-active');

      var codeBody = document.createElement('div');
      codeBody.className = 'af-pearl-body';
      var codeRing = document.createElement('div');
      codeRing.className = 'af-pearl-ring';
      codeBody.appendChild(codeRing);
      var codeDots = makeBrailleDots(step.bits);
      codeDots.classList.add('af-pearl-inner-braille');
      codeBody.appendChild(codeDots);
      codeNode.appendChild(codeBody);

      var codeLabel = document.createElement('div');
      codeLabel.className = 'af-pearl-label';
      codeLabel.textContent = step.label;
      var codeSub = document.createElement('div');
      codeSub.className = 'af-pearl-sublabel';
      codeSub.textContent = step.sublabel || '';
      codeNode.appendChild(codeLabel);
      codeNode.appendChild(codeSub);
      col.appendChild(codeNode);

      var plotStep = plotByParent[step.id];
      if (plotStep) {
        var plotNode = document.createElement('div');
        plotNode.className = 'af-pearl-node is-plot';
        if (idx < completed) plotNode.classList.add('is-done');

        var plotBody = document.createElement('div');
        plotBody.className = 'af-pearl-body';
        var plotDots = makeBrailleDots(plotStep.bits);
        plotDots.classList.add('af-pearl-inner-braille');
        plotBody.appendChild(plotDots);
        plotNode.appendChild(plotBody);

        var plotLabel = document.createElement('div');
        plotLabel.className = 'af-pearl-label';
        plotLabel.textContent = plotStep.label;
        plotNode.appendChild(plotLabel);
        col.appendChild(plotNode);
      }

      graph.appendChild(col);

      if (idx < codeSteps.length - 1) {
        var edgeWrap = document.createElement('div');
        edgeWrap.className = 'af-pearl-edge-wrap';
        var edge = document.createElement('div');
        edge.className = 'af-pearl-edge';
        edgeWrap.appendChild(edge);
        graph.appendChild(edgeWrap);
      }
    });

    parent.appendChild(graph);
  }

  function renderSelectionPanel(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    var payload = state.alphafoldPayload;
    var seeds = parseSeeds(state.modelSeedsText);
    wrap.innerHTML = '' +
      '<h3 class="af-inline-title">Runtime Selection</h3>' +
      '<p class="af-muted-copy">Engine: glabs.nexus.engines.alphafold</p>' +
      '<p class="af-muted-copy">Job: ' + escapeHtml(state.jobName || 'NX-AF3-001') + '</p>' +
      '<p class="af-muted-copy">Chain: ' + escapeHtml(state.chainId || 'A') + '</p>' +
      '<p class="af-muted-copy">Seeds: ' + escapeHtml(String(seeds.join(', '))) + '</p>' +
      '<p class="af-muted-copy">Status: ' + (payload ? 'payload-ready' : 'awaiting-composition') + '</p>';
    parent.appendChild(wrap);
  }

  function renderSegmentsPanel(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    var segments = [];
    try {
      var parsed = JSON.parse(state.splitDefinitionText || '{}');
      segments = Array.isArray(parsed.segments) ? parsed.segments : [];
    } catch (_error) {
      segments = [];
    }

    if (!segments.length) {
      wrap.innerHTML = '<p class="af-muted-copy">No segments found.</p>';
      parent.appendChild(wrap);
      return;
    }

    var list = document.createElement('div');
    list.className = 'af-segment-list';
    for (var i = 0; i < segments.length; i += 1) {
      var item = segments[i];
      var maskPolicy = item && item.policy ? item.policy.mask_policy : 'n/a';
      var row = document.createElement('div');
      row.className = 'af-segment-item';
      row.textContent = (item.segment_id || ('segment_' + i)) + ' [' + item.start + '-' + item.end + '] · ' + maskPolicy;
      list.appendChild(row);
    }
    wrap.appendChild(list);
    parent.appendChild(wrap);
  }

  function renderContentsPanel(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    wrap.innerHTML = '' +
      '<h3 class="af-inline-title">Flow</h3>' +
      '<ol class="af-flow-list">' +
      '<li>Input primary sequence</li>' +
      '<li>Edit split-definition JSON</li>' +
      '<li>Compose protected sequence</li>' +
      '<li>Generate AlphaFold 3 payload</li>' +
      '<li>Load on AlphaFold Server</li>' +
      '</ol>';
    parent.appendChild(wrap);
  }

  function renderSplitEditor(parent) {
    parent.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'af-panel-block';
    var note = document.createElement('p');
    note.className = 'af-muted-copy';
    note.textContent = 'Use keep_positions [int] or keep_ranges [{start,end}] on a segment (or globally) to preserve relevant residues inside withheld spans.';
    wrap.appendChild(note);
    var label = document.createElement('label');
    label.className = 'af-field';
    label.innerHTML = '<span>Split Definition JSON (raw)</span>';
    var input = document.createElement('textarea');
    input.className = 'af-textarea af-textarea-code';
    input.rows = 14;
    input.value = state.splitDefinitionText;
    input.addEventListener('input', function (event) {
      state.splitDefinitionText = event.target.value;
    });
    label.appendChild(input);
    wrap.appendChild(label);
    parent.appendChild(wrap);
  }

  function computePayload() {
    var splitDefinition;
    try {
      splitDefinition = JSON.parse(state.splitDefinitionText || '{}');
    } catch (_error) {
      state.terminalLines.push('[error] split-definition JSON is invalid');
      render();
      return;
    }

    var sequence = cleanSequence(state.sequence);
    if (!sequence) {
      state.terminalLines.push('[error] sequence is empty');
      render();
      return;
    }

    var transformed = applySplitMask(sequence, splitDefinition);
    var seeds = parseSeeds(state.modelSeedsText);
    state.transformedSequence = transformed;
    state.alphafoldPayload = {
      name: state.jobName || 'NX-AF3-001',
      modelSeeds: seeds,
      sequences: [
        {
          protein: {
            id: state.chainId || 'A',
            sequence: transformed
          }
        }
      ],
      dialect: 'alphafold3',
      version: 1,
      metadata: {
        engine: 'glabs.nexus.engines.alphafold',
        engine_alias: 'nexus.engines.alphafold',
        engine_id: 'glabs_nexus_engines_alphafold',
        source_split_definition: splitDefinition.object_id || null
      }
    };

    state.terminalLines.push('[compose] sequence length=' + sequence.length);
    state.terminalLines.push('[compose] transformed=' + transformed);
    state.terminalLines.push('[compose] payload ready for AlphaFold Server');
    render();
  }

  function applySplitMask(sequence, splitDefinition) {
    var chars = sequence.split('');
    var segments = Array.isArray(splitDefinition && splitDefinition.segments)
      ? splitDefinition.segments
      : [];
    var globalKeepRanges = normalizeRanges(splitDefinition && splitDefinition.keep_ranges, chars.length);
    var globalKeepPositions = normalizePositions(splitDefinition && splitDefinition.keep_positions, chars.length);

    segments.forEach(function (segment) {
      if (!segment || !segment.policy) return;
      if (segment.policy.mask_policy !== 'withheld') return;

      var startRaw = Number(segment.start || 1);
      var endRaw = Number(segment.end || chars.length);
      if (!Number.isFinite(startRaw) || !Number.isFinite(endRaw)) return;

      var start = Math.max(1, Math.floor(startRaw));
      var end = Math.min(chars.length, Math.floor(endRaw));
      if (start > end) return;

      var keepRanges = normalizeRanges(segment.keep_ranges, chars.length).concat(globalKeepRanges);
      var keepPositions = normalizePositions(segment.keep_positions, chars.length).concat(globalKeepPositions);
      var replacement = String(segment.policy.replacement_char || splitDefinition.replacement_char || 'X').charAt(0) || 'X';

      for (var i = start - 1; i < end; i += 1) {
        var residuePosition = i + 1;
        if (isProtectedPosition(residuePosition, keepPositions, keepRanges)) continue;
        chars[i] = replacement;
      }
    });

    return chars.join('');
  }

  function normalizePositions(values, sequenceLength) {
    if (!Array.isArray(values)) return [];
    return values
      .map(function (value) { return Number(value); })
      .filter(function (value) {
        return Number.isFinite(value)
          && value >= 1
          && value <= sequenceLength;
      })
      .map(function (value) { return Math.floor(value); });
  }

  function normalizeRanges(values, sequenceLength) {
    if (!Array.isArray(values)) return [];
    return values
      .map(function (range) {
        if (!range || typeof range !== 'object') return null;
        var start = Number(range.start);
        var end = Number(range.end);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
        var clampedStart = Math.max(1, Math.floor(start));
        var clampedEnd = Math.min(sequenceLength, Math.floor(end));
        if (clampedStart > clampedEnd) return null;
        return { start: clampedStart, end: clampedEnd };
      })
      .filter(Boolean);
  }

  function isProtectedPosition(position, keepPositions, keepRanges) {
    for (var p = 0; p < keepPositions.length; p += 1) {
      if (keepPositions[p] === position) return true;
    }
    for (var r = 0; r < keepRanges.length; r += 1) {
      if (position >= keepRanges[r].start && position <= keepRanges[r].end) {
        return true;
      }
    }
    return false;
  }

  function parseSeeds(text) {
    var values = String(text || '')
      .split(',')
      .map(function (item) { return Number(item.trim()); })
      .filter(function (item) { return Number.isFinite(item) && item > 0; });

    return values.length ? values : [1];
  }

  function cleanSequence(value) {
    return String(value || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }

  function makeBrailleDots(bits) {
    var wrap = document.createElement('div');
    wrap.className = 'af-braille-dots';
    var bitsStr = String(bits || '000000').padEnd(6, '0').slice(0, 6);
    for (var i = 0; i < 6; i += 1) {
      var dot = document.createElement('span');
      dot.className = 'af-braille-dot' + (bitsStr[i] === '1' ? ' is-on' : '');
      wrap.appendChild(dot);
    }
    return wrap;
  }

  function makeBadge(label) {
    var badge = document.createElement('span');
    badge.className = 'af-badge';
    badge.textContent = label;
    return badge;
  }

  function retitlePanels() {
    var tiles = state.tiles && state.tiles.length ? state.tiles : getDefaultTiles();
    tiles.forEach(function (tile) {
      if (!tile.panelId) return;
      setPanelHeading(tile.panelId, tile.title || tile.id || tile.type || 'Tile', tile.subtitle || '');
    });
  }

  function bindPanelWindows() {
    if (document.body.dataset.afPanelsBound === '1') return;
    document.body.dataset.afPanelsBound = '1';

    var panelDock = document.getElementById('panel-dock');
    var panelMenu = document.getElementById('panel-menu');
    var panelOverlay = document.getElementById('panel-overlay');
    var panelWindows = Array.from(document.querySelectorAll('[data-panel-window]'));
    var panelHomes = new Map();
    var overlayZCounter = 30;

    if (!panelDock || !panelMenu || !panelOverlay || !panelWindows.length) return;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function ensureOverlayGeometry(panel) {
      var overlayW = Math.max(panelOverlay.clientWidth, 900);
      var overlayH = Math.max(panelOverlay.clientHeight, 680);
      var preset = panel.dataset.panelSize || 'medium';
      var width = preset === 'compact' ? Math.round(clamp(overlayW * 0.32, 320, 460)) : (preset === 'wide' ? Math.round(clamp(overlayW * 0.64, 620, 980)) : Math.round(clamp(overlayW * 0.44, 420, 680)));
      var height = preset === 'compact' ? Math.round(clamp(overlayH * 0.36, 240, 360)) : (preset === 'wide' ? Math.round(clamp(overlayH * 0.58, 380, 720)) : Math.round(clamp(overlayH * 0.48, 300, 560)));

      if (!panel.dataset.overlayW) panel.dataset.overlayW = String(width);
      if (!panel.dataset.overlayH) panel.dataset.overlayH = String(height);
      if (!panel.dataset.overlayX) panel.dataset.overlayX = String(28);
      if (!panel.dataset.overlayY) panel.dataset.overlayY = String(28);
    }

    function applyOverlayGeometry(panel) {
      panel.style.left = panel.dataset.overlayX + 'px';
      panel.style.top = panel.dataset.overlayY + 'px';
      panel.style.width = panel.dataset.overlayW + 'px';
      panel.style.height = panel.dataset.overlayH + 'px';
    }

    function bringPanelToFront(panel) {
      overlayZCounter += 1;
      panel.style.zIndex = String(overlayZCounter);
    }

    function nudgeOverlayPanel(panel) {
      var jitterX = Math.round((Math.random() * 44) - 22);
      var jitterY = Math.round((Math.random() * 36) - 18);
      var width = Number(panel.dataset.overlayW || '420');
      var height = Number(panel.dataset.overlayH || '320');
      var maxX = Math.max(8, panelOverlay.clientWidth - width - 12);
      var maxY = Math.max(8, panelOverlay.clientHeight - height - 12);
      var nextX = clamp(Number(panel.dataset.overlayX || '28') + jitterX, 8, maxX);
      var nextY = clamp(Number(panel.dataset.overlayY || '28') + jitterY, 8, maxY);
      panel.dataset.overlayX = String(Math.round(nextX));
      panel.dataset.overlayY = String(Math.round(nextY));
    }

    function syncOverlayVisibility() {
      var hasOverlay = panelOverlay.children.length > 0;
      var hasMenu = panelMenu.children.length > 0;
      var active = hasOverlay || hasMenu;
      panelOverlay.classList.toggle('is-active', active);
      panelOverlay.setAttribute('aria-hidden', String(!active));
    }

    function placeInDock(panel) {
      panel.classList.remove('is-overlay-panel');
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.height = '';
      panelDock.appendChild(panel);
      panel.setAttribute('draggable', 'true');
      syncOverlayVisibility();
    }

    function placeInMenu(panel) {
      panel.classList.remove('is-overlay-panel');
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.height = '';
      panelMenu.appendChild(panel);
      panel.setAttribute('draggable', 'false');
      syncOverlayVisibility();
    }

    function placeInOverlay(panel) {
      panel.classList.add('is-overlay-panel');
      panelOverlay.appendChild(panel);
      panel.setAttribute('draggable', 'false');
      ensureOverlayGeometry(panel);
      applyOverlayGeometry(panel);
      bringPanelToFront(panel);
      syncOverlayVisibility();
    }

    function placeAtHome(panel) {
      var home = panelHomes.get(panel);
      if (!home || !home.placeholder || !home.placeholder.parentNode) return;
      panel.classList.remove('is-overlay-panel');
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.height = '';
      home.placeholder.parentNode.insertBefore(panel, home.placeholder.nextSibling);
      panel.setAttribute('draggable', 'false');
      syncOverlayVisibility();
    }

    function setOverlayRect(panel, x, y, w, h) {
      var maxW = Math.max(220, panelOverlay.clientWidth - 24);
      var maxH = Math.max(160, panelOverlay.clientHeight - 24);
      panel.dataset.expandMode = 'overlay';
      panel.classList.remove('is-collapsed');
      panel.classList.remove('is-minimized');
      panel.dataset.overlayX = String(Math.round(clamp(x, 8, panelOverlay.clientWidth - 120)));
      panel.dataset.overlayY = String(Math.round(clamp(y, 8, panelOverlay.clientHeight - 100)));
      panel.dataset.overlayW = String(Math.round(clamp(w, 220, maxW)));
      panel.dataset.overlayH = String(Math.round(clamp(h, 160, maxH)));
      syncPanelState(panel);
    }

    function overlayTargets() {
      var overlays = panelWindows.filter(function (panel) {
        return panel.classList.contains('is-overlay-panel') && !panel.classList.contains('is-minimized');
      });
      if (overlays.length) return overlays;
      var fallback = panelWindows.find(function (panel) {
        return panel.classList.contains('is-collapsed') || panel.classList.contains('is-minimized');
      });
      if (fallback) {
        fallback.classList.remove('is-collapsed');
        fallback.classList.remove('is-minimized');
        fallback.dataset.expandMode = 'overlay';
        syncPanelState(fallback);
        return [fallback];
      }
      return [];
    }

    function applyOverlayLayout(action) {
      var targets = overlayTargets();
      if (!targets.length) return;

      var gap = 12;
      var margin = 12;
      var workW = Math.max(320, panelOverlay.clientWidth - margin * 2);
      var workH = Math.max(240, panelOverlay.clientHeight - margin * 2);
      var halfW = (workW - gap) / 2;
      var halfH = (workH - gap) / 2;

      targets.forEach(function (panel, index) {
        if (action === 'left') setOverlayRect(panel, margin, margin, halfW, workH);
        else if (action === 'right') setOverlayRect(panel, margin + halfW + gap, margin, halfW, workH);
        else if (action === 'top') setOverlayRect(panel, margin, margin, workW, halfH);
        else if (action === 'bottom') setOverlayRect(panel, margin, margin + halfH + gap, workW, halfH);
        else if (action === 'maximize') setOverlayRect(panel, margin, margin, workW, workH);
        else if (action === 'center') {
          var w = Math.max(420, workW * 0.58);
          var h = Math.max(300, workH * 0.62);
          setOverlayRect(panel, margin + (workW - w) / 2, margin + (workH - h) / 2, w, h);
        } else if (action === 'columns') {
          var colW = (workW - gap) / 2;
          var row = Math.floor(index / 2);
          var col = index % 2;
          setOverlayRect(panel, margin + col * (colW + gap), margin + row * (Math.max(220, workH / 2) + gap), colW, Math.max(220, workH / 2));
        } else if (action === 'grid') {
          var gridCol = index % 2;
          var gridRow = Math.floor(index / 2);
          var cellW = (workW - gap) / 2;
          var cellH = (workH - gap) / 2;
          setOverlayRect(panel, margin + gridCol * (cellW + gap), margin + gridRow * (cellH + gap), cellW, cellH);
        }
      });
    }

    function syncPanelState(panel) {
      if (panel.classList.contains('is-minimized')) {
        placeInMenu(panel);
        return;
      }
      if (!panel.classList.contains('is-collapsed')) {
        if ((panel.dataset.expandMode || 'overlay') === 'overlay') {
          placeInOverlay(panel);
        } else {
          placeAtHome(panel);
        }
        return;
      }
      placeInDock(panel);
    }

    function enableOverlayDragging(panel) {
      var dragHandles = [];
      var heading = panel.querySelector('.panel-heading');
      var summary = panel.querySelector('.panel-tile-summary');
      if (heading) dragHandles.push(heading);
      if (summary) dragHandles.push(summary);
      if (!dragHandles.length) return;

      var pointerId = null;
      var startX = 0;
      var startY = 0;
      var originX = 0;
      var originY = 0;
      var didDrag = false;
      var lastDragEndedAt = 0;

      function onPointerMove(event) {
        if (pointerId === null || event.pointerId !== pointerId) return;
        var dx = event.clientX - startX;
        var dy = event.clientY - startY;
        if (!didDrag && Math.sqrt(dx * dx + dy * dy) > 4) {
          didDrag = true;
        }
        var width = Number(panel.dataset.overlayW || String(panel.offsetWidth || 420));
        var height = Number(panel.dataset.overlayH || String(panel.offsetHeight || 320));
        var maxX = Math.max(8, panelOverlay.clientWidth - width - 12);
        var maxY = Math.max(8, panelOverlay.clientHeight - height - 12);
        var nextX = clamp(originX + dx, 8, maxX);
        var nextY = clamp(originY + dy, 8, maxY);
        panel.dataset.overlayX = String(Math.round(nextX));
        panel.dataset.overlayY = String(Math.round(nextY));
        applyOverlayGeometry(panel);
      }

      function stopPointerDrag(event) {
        if (pointerId === null || event.pointerId !== pointerId) return;
        pointerId = null;
        panel.classList.remove('is-dragging');
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopPointerDrag);
        window.removeEventListener('pointercancel', stopPointerDrag);
        if (didDrag) lastDragEndedAt = Date.now();
        didDrag = false;
      }

      dragHandles.forEach(function (handle) {
        handle.style.cursor = 'move';
        handle.addEventListener('pointerdown', function (event) {
          if (event.button !== 0) return;
          if (event.target && event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
          if (!panel.classList.contains('is-overlay-panel')) return;
          event.preventDefault();
          event.stopPropagation();
          didDrag = false;
          pointerId = event.pointerId;
          startX = event.clientX;
          startY = event.clientY;
          originX = Number(panel.dataset.overlayX || '0');
          originY = Number(panel.dataset.overlayY || '0');
          bringPanelToFront(panel);
          panel.classList.add('is-dragging');
          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', stopPointerDrag);
          window.addEventListener('pointercancel', stopPointerDrag);
        });
      });

      panel.addEventListener('pointerdown', function () {
        if (panel.classList.contains('is-overlay-panel')) {
          bringPanelToFront(panel);
        }
      });
    }

    panelWindows.forEach(function (panel) {
      var placeholder = document.createComment('panel-home');
      if (panel.parentNode) panel.parentNode.insertBefore(placeholder, panel);
      panelHomes.set(panel, { placeholder: placeholder });

      if (!panel.classList.contains('is-collapsed') && !panel.dataset.expandMode) {
        panel.dataset.expandMode = 'overlay';
      }

      enableOverlayDragging(panel);

      var heading = panel.querySelector('.panel-heading');
      if (heading) {
        heading.addEventListener('click', function (event) {
          if (Date.now() - lastDragEndedAt < 220) return;
          event.preventDefault();
          event.stopPropagation();
          if (panel.classList.contains('is-overlay-panel')) {
            panel.classList.toggle('is-minimized');
            syncPanelState(panel);
          }
        });
      }

      panel.addEventListener('dblclick', function (event) {
        if (event.target && event.target.closest('.panel-pin')) return;
        if (panel.classList.contains('is-collapsed')) {
          panel.classList.remove('is-collapsed');
          panel.classList.remove('is-minimized');
          panel.dataset.expandMode = 'overlay';
        } else {
          panel.classList.add('is-collapsed');
          panel.classList.remove('is-minimized');
        }
        syncPanelState(panel);
      });

      var pinButtons = Array.from(panel.querySelectorAll('.panel-pin'));
      pinButtons.forEach(function (pinButton) {
        function handlePinClick(event) {
          event.preventDefault();
          event.stopPropagation();
          var action = pinButton.dataset.pin;
          if (action === 'close') {
            panel.classList.add('is-collapsed');
            panel.classList.remove('is-minimized');
            syncPanelState(panel);
            return;
          }
          if (action === 'minimize') {
            panel.classList.add('is-minimized');
            panel.classList.add('is-collapsed');
            panel.dataset.expandMode = 'overlay';
            syncPanelState(panel);
            return;
          }
          if (action === 'maximize') {
            panel.classList.remove('is-collapsed');
            panel.classList.remove('is-minimized');
            panel.dataset.expandMode = 'overlay';
            nudgeOverlayPanel(panel);
            syncPanelState(panel);
          }
        }

        pinButton.addEventListener('click', handlePinClick);
        pinButton.addEventListener('mousedown', handlePinClick);
        pinButton.addEventListener('touchstart', handlePinClick);
      });

      syncPanelState(panel);
    });

    var workspaceWindowTools = document.getElementById('workspace-window-tools');
    if (workspaceWindowTools) {
      workspaceWindowTools.addEventListener('click', function (event) {
        var button = event.target && event.target.closest('[data-layout-action]');
        if (!button) return;
        var action = button.getAttribute('data-layout-action');
        if (!action) return;
        event.preventDefault();
        event.stopPropagation();
        applyOverlayLayout(action);
      });
    }
  }

  function openRequiredPanels() {
    var requiredPanelIds = ['panel-registry', 'panel-compose', 'panel-graph'];
    var offsets = [
      { x: 28, y: 60 },
      { x: 88, y: 90 },
      { x: 148, y: 120 }
    ];

    requiredPanelIds.forEach(function (panelId, index) {
      var panel = document.getElementById(panelId);
      if (!panel) return;
      panel.classList.remove('is-collapsed');
      panel.classList.remove('is-minimized');
      panel.dataset.overlayX = String(offsets[index].x);
      panel.dataset.overlayY = String(offsets[index].y);
    });
  }

  function normalizeTiles(config) {
    var defaultsByType = getDefaultTileMapByType();
    var sourceTiles = Array.isArray(config && config.tiles) ? config.tiles : [];
    if (!sourceTiles.length) return getDefaultTiles();

    return sourceTiles.map(function (tile, index) {
      var type = String(tile.type || 'unknown');
      var fallback = defaultsByType[type] || {};
      return {
        id: String(tile.id || ('tile_' + index)),
        type: type,
        title: String(tile.title || fallback.title || tile.id || type || ('Tile ' + (index + 1))),
        subtitle: String(tile.subtitle || ''),
        panelId: String(tile.panelId || fallback.panelId || ''),
        rootId: String(tile.rootId || fallback.rootId || ''),
        order: Number.isFinite(Number(tile.order)) ? Number(tile.order) : (index + 1)
      };
    });
  }

  function getDefaultTileMapByType() {
    var map = {};
    getDefaultTiles().forEach(function (tile) {
      map[tile.type] = tile;
    });
    return map;
  }

  function getDefaultTiles() {
    return [
      { id: 'registry', type: 'registry', panelId: 'panel-registry', rootId: 'backpack-panel-root', title: 'Registry', subtitle: 'Engine identity and layout metadata', order: 1 },
      { id: 'input', type: 'input', panelId: 'panel-compose', rootId: 'braille-input-root', title: 'Input Tile', subtitle: 'Primary sequence and split-definition JSON', order: 2 },
      { id: 'computation', type: 'computation', panelId: 'panel-graph', rootId: 'glabs-flow-root', title: 'Computation Tile', subtitle: 'AlphaFold input JSON output and launch', order: 3 },
      { id: 'selection', type: 'selection', panelId: 'panel-selection', rootId: 'active-node-panel-root', title: 'Runtime Selection', subtitle: 'Job metadata and status', order: 4 },
      { id: 'segments', type: 'segments', panelId: 'panel-linked', rootId: 'connected-list-root', title: 'Segments', subtitle: 'Split segments and masking policy', order: 5 },
      { id: 'flow', type: 'flow', panelId: 'panel-contents', rootId: 'content-outline-root', title: 'Flow', subtitle: 'Pipeline steps and execution order', order: 6 },
      { id: 'terminal', type: 'terminal', panelId: 'panel-terminal', rootId: 'terminal-panel-root', title: 'Terminal', subtitle: 'Engine logs and composition controls', order: 7 },
      { id: 'split_json', type: 'split_json', panelId: 'panel-comment', rootId: 'comment-panel-root', title: 'Split JSON', subtitle: 'Raw editable split-definition payload', order: 8 }
    ];
  }

  function setPanelHeading(panelId, title, description) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var info = panel.querySelector('.panel-tile-info');
    if (!info) return;
    var titleNode = info.querySelector('h2');
    var descriptionNode = info.querySelector('p');
    if (titleNode) titleNode.textContent = title;
    if (descriptionNode) descriptionNode.textContent = description;
  }

  function makeInputField(labelText, value, onInput) {
    var label = document.createElement('label');
    label.className = 'af-field';

    var title = document.createElement('span');
    title.textContent = labelText;
    label.appendChild(title);

    var input = document.createElement('input');
    input.className = 'af-input';
    input.type = 'text';
    input.value = value;
    input.addEventListener('input', function (event) {
      onInput(event.target.value);
    });
    label.appendChild(input);

    return label;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
