(function () {
  'use strict';

  var sequenceInput = document.getElementById('af-sequence');
  var jobNameInput = document.getElementById('af-job-name');
  var chainIdInput = document.getElementById('af-chain-id');
  var modelSeedsInput = document.getElementById('af-model-seeds');
  var payloadOutput = document.getElementById('af-payload');
  var logOutput = document.getElementById('af-log');

  var generateButton = document.getElementById('af-generate');
  var copyButton = document.getElementById('af-copy');
  var loadLegacyButton = document.getElementById('af-load-legacy');
  var legacyRoot = document.getElementById('af-legacy-root');

  if (!sequenceInput || !jobNameInput || !chainIdInput || !modelSeedsInput || !payloadOutput || !logOutput || !generateButton || !copyButton || !loadLegacyButton || !legacyRoot) {
    return;
  }

  var state = {
    payload: null,
    legacyLoaded: false
  };

  sequenceInput.value = 'MGAGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGA';

  function addLog(message) {
    var item = document.createElement('li');
    item.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
    logOutput.prepend(item);
  }

  function cleanSequence(raw) {
    return String(raw || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .trim();
  }

  function parseModelSeeds(raw) {
    var values = String(raw || '1')
      .split(',')
      .map(function (chunk) { return parseInt(chunk.trim(), 10); })
      .filter(function (num) { return Number.isFinite(num) && num > 0; });

    return values.length ? values : [1];
  }

  function buildPayload() {
    var sequence = cleanSequence(sequenceInput.value);
    var chain = String(chainIdInput.value || 'A').toUpperCase().slice(0, 1) || 'A';
    var name = String(jobNameInput.value || 'NX-AF3-001').trim() || 'NX-AF3-001';
    var seeds = parseModelSeeds(modelSeedsInput.value);

    if (!sequence) {
      throw new Error('Sequence is empty. Paste a protein sequence first.');
    }

    return {
      name: name,
      modelSeeds: seeds,
      sequences: [
        {
          protein: {
            id: chain,
            sequence: sequence
          }
        }
      ],
      dialect: 'alphafold3',
      version: 1
    };
  }

  function renderPayload(payload) {
    payloadOutput.textContent = JSON.stringify(payload, null, 2);
  }

  function generatePayload() {
    try {
      state.payload = buildPayload();
      renderPayload(state.payload);
      addLog('Payload generated for ' + state.payload.name + '.');
    } catch (error) {
      payloadOutput.textContent = String(error && error.message ? error.message : error);
      addLog('Generation error: ' + payloadOutput.textContent);
    }
  }

  async function copyPayload() {
    if (!state.payload) {
      addLog('No payload to copy yet. Generate first.');
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(state.payload, null, 2));
      addLog('Payload copied to clipboard.');
    } catch (error) {
      addLog('Clipboard copy failed. Browser blocked clipboard access.');
    }
  }

  async function loadLegacyEditor() {
    if (state.legacyLoaded) {
      addLog('Legacy editor already loaded.');
      return;
    }

    state.legacyLoaded = true;
    legacyRoot.hidden = false;
    loadLegacyButton.disabled = true;
    loadLegacyButton.textContent = 'Loading Legacy Editor...';
    addLog('Loading ReactFlow legacy editor on demand.');

    try {
      await import('./glabs_nexus_engines_alphafold_reactflow.js?v=20260517-r15');
      addLog('Legacy editor ready.');
      loadLegacyButton.textContent = 'Legacy Editor Loaded';
    } catch (error) {
      addLog('Legacy editor failed to load.');
      loadLegacyButton.disabled = false;
      loadLegacyButton.textContent = 'Load Legacy Workflow Editor';
      state.legacyLoaded = false;
    }
  }

  generateButton.addEventListener('click', generatePayload);
  copyButton.addEventListener('click', copyPayload);
  loadLegacyButton.addEventListener('click', loadLegacyEditor);

  generatePayload();
  addLog('Fast interface booted without ReactFlow startup cost.');
})();
