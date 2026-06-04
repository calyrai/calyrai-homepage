(function (global) {
  'use strict';

  var NAMESPACE = 'nexus.layouttuning';

  function toNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function clamp(value, min, max) {
    var v = toNumber(value, 0);
    return Math.max(min, Math.min(max, v));
  }

  function safeReadJSON(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeWriteJSON(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function copyText(text) {
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  }

  function isLocalHost(hostname) {
    var host = String(hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  function readQueryFlag(key) {
    try {
      var params = new URLSearchParams(global.location.search || '');
      if (!params.has(key)) return null;
      var value = String(params.get(key) || '').toLowerCase();
      if (value === '1' || value === 'true' || value === 'on' || value === 'yes') return true;
      if (value === '0' || value === 'false' || value === 'off' || value === 'no') return false;
      return null;
    } catch (_err) {
      return null;
    }
  }

  function isLocalTuningEnabled(options) {
    var queryKey = (options && options.queryKey) || 'layoutTuning';
    var storageKey = (options && options.storageKey) || (NAMESPACE + '.enabled');

    var queryFlag = readQueryFlag(queryKey);
    if (queryFlag !== null) return queryFlag;

    try {
      var stored = global.localStorage.getItem(storageKey);
      if (stored === '1' || stored === 'true' || stored === 'on') return true;
      if (stored === '0' || stored === 'false' || stored === 'off') return false;
    } catch (_err) {
      // ignore storage read failures
    }

    var protocol = String(global.location && global.location.protocol || '').toLowerCase();
    if (protocol === 'file:') return true;
    return isLocalHost(global.location && global.location.hostname);
  }

  function downloadJson(filename, jsonText) {
    try {
      var blob = new Blob([jsonText], { type: 'application/json' });
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

  function saveSnapshot(options) {
    var payload = options && options.payload ? options.payload : {};
    var filename = (options && options.filename) || 'layout_offsets.json';
    var storageKey = options && options.storageKey;
    var lastExportKey = (options && options.lastExportKey) || (NAMESPACE + '.lastExport.v1');

    if (storageKey) {
      safeWriteJSON(storageKey, payload);
    }
    safeWriteJSON(lastExportKey, payload);

    var jsonText = JSON.stringify(payload, null, 2);
    var downloaded = downloadJson(filename, jsonText);

    return copyText(jsonText).then(function (copied) {
      return {
        downloaded: downloaded,
        copied: copied,
        jsonText: jsonText
      };
    });
  }

  function clearKeys(keys) {
    if (!Array.isArray(keys)) return;
    keys.forEach(function (key) {
      try {
        global.localStorage.removeItem(String(key));
      } catch (_err) {
        // ignore storage failures
      }
    });
  }

  global.NexusLayoutTuning = {
    namespace: NAMESPACE,
    version: '1.0.0',
    toNumber: toNumber,
    clamp: clamp,
    safeReadJSON: safeReadJSON,
    safeWriteJSON: safeWriteJSON,
    isLocalTuningEnabled: isLocalTuningEnabled,
    copyText: copyText,
    downloadJson: downloadJson,
    saveSnapshot: saveSnapshot,
    clearKeys: clearKeys
  };
})(window);
