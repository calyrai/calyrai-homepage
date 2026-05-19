/* Calyr.mAtomic Lab - simulate + write with model access */

(function () {
  const API_BASE = "http://localhost:8000";
  const SESSION_KEY = "citizen_session";
  const USER_KEY = "citizen_user";
  const INTERFACE_REGISTRY = window.CALYR_INTERFACES || {};
  const INTERFACE_CONFIG = (INTERFACE_REGISTRY.interfaces || {}).matomic_lab || {};
  const COPY = INTERFACE_CONFIG.copy || {};

  const authGate = document.getElementById("auth-gate");
  const mainPanel = document.getElementById("matomic-main");
  const loginBtn = document.getElementById("matomic-login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userNameEl = document.getElementById("matomic-user-name");

  const modelSelect = document.getElementById("model-select");
  const modelRefreshBtn = document.getElementById("refresh-models");
  const agoraCheckBtn = document.getElementById("agora-check");
  const agoraSyncBtn = document.getElementById("agora-sync");
  const agoraStatus = document.getElementById("agora-status");
  const runBtn = document.getElementById("run-matomic");
  const simTypeSelect = document.getElementById("sim-type");
  const simParams = document.getElementById("sim-params");
  const modelInfo = document.getElementById("model-info");
  const simLog = document.getElementById("sim-log");

  const noteTitle = document.getElementById("note-title");
  const noteBody = document.getElementById("note-body");
  const exportMdBtn = document.getElementById("export-md");
  const exportYamlBtn = document.getElementById("export-yaml");
  const openVoxBtn = document.getElementById("open-vox");

  let sessionUser = "Researcher";
  let models = [];

  function copyText(key, fallback) {
    return COPY[key] || fallback;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node && value) node.textContent = value;
  }

  function setHtml(id, value) {
    const node = document.getElementById(id);
    if (node && value) node.innerHTML = value;
  }

  function applyInterfaceCopy() {
    if (INTERFACE_CONFIG.page_title) {
      document.title = INTERFACE_CONFIG.page_title;
    }

    setText("matomic-gate-intro", copyText("gate_intro", "A combined workspace for simulation and scientific writing."));
    setText("matomic-gate-login-hint", copyText("gate_login_hint", "After login, the mAtomic Lab opens with model access."));
    setHtml("matomic-gate-rationale", copyText("gate_rationale", "Why <strong>Calyr</strong>? Calyr names the user-facing application surface. Nexus remains the internal runtime and orchestration layer underneath."));
    setText("matomic-main-subtitle", copyText("main_subtitle", "simulation and writing on one surface"));
    setText("matomic-backend-label", copyText("backend_label", "Backend"));
    setText("matomic-simulate-title", copyText("simulate_title", "Simulate with mAtomic models"));
    setText("matomic-model-label", copyText("model_label", "Model"));
    setText("model-info", copyText("model_info_empty", "No model loaded."));
    setText("refresh-models", copyText("model_reload", "Reload models"));
    setText("matomic-agora-title", copyText("agora_title", "AGORA2 Sync (Calyr Standard)"));
    setText("agora-status", copyText("agora_status_empty", "Status: not loaded yet."));
    setText("matomic-sim-type-label", copyText("simulation_type_label", "Simulation type"));
    setText("matomic-extra-params-label", copyText("extra_params_label", "Extra parameters (JSON)"));
    setText("run-matomic", copyText("run_button", "Start simulation"));
    setText("matomic-notes-title", copyText("notes_title", "Write notes and open Vox"));
    setText("matomic-note-title-label", copyText("notes_title_label", "Title"));
    setText("matomic-note-body-label", copyText("notes_body_label", "Notes"));
    setText("open-vox", copyText("open_vox", "Open Vox Studio"));
    setText("matomic-notes-hint", copyText("notes_hint", "This surface combines simulation runs with a writing flow for session notes and Vox access."));

    if (noteBody) {
      noteBody.placeholder = copyText("notes_placeholder", "Hypothesis, observation, next step...");
    }
  }

  function log(el, msg) {
    const line = document.createElement("div");
    line.textContent = msg;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
  }

  function hasSession() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token) {
      sessionUser = user || localStorage.getItem(USER_KEY) || sessionUser;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, userName: sessionUser }));
      localStorage.setItem(USER_KEY, sessionUser);
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }

    if (window.location.search.includes("demo")) {
      sessionUser = "Demo Researcher";
      localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, userName: sessionUser, demo: true }));
      localStorage.setItem(USER_KEY, sessionUser);
      return true;
    }

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.authenticated) {
        sessionUser = localStorage.getItem(USER_KEY) || parsed.userName || sessionUser;
        return true;
      }
    } catch (_) {
      return false;
    }

    return false;
  }

  function showMain() {
    authGate.style.display = "none";
    mainPanel.style.display = "block";
    logoutBtn.style.display = "inline-block";
    userNameEl.textContent = sessionUser;
  }

  function showGate() {
    authGate.style.display = "flex";
    mainPanel.style.display = "none";
    logoutBtn.style.display = "none";
  }

  async function fetchJson(url, options) {
    const resp = await fetch(url, options);
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return resp.json();
  }

  async function loadModels() {
    modelSelect.innerHTML = `<option>${copyText("loading_models", "Loading models...")}</option>`;
    modelInfo.textContent = "";
    try {
      const data = await fetchJson(`${API_BASE}/matomic/models`);
      models = data.models || [];
      modelSelect.innerHTML = "";

      if (!models.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = copyText("no_models_found", "No models found");
        modelSelect.appendChild(opt);
        modelInfo.textContent = copyText("no_backend_models", "No mAtomic models were found in the backend scan.");
        return;
      }

      for (const m of models) {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.name} (${m.source})`;
        modelSelect.appendChild(opt);
      }
      renderModelInfo();
      log(simLog, `${copyText("models_loaded", "Models loaded")}: ${models.length}`);
    } catch (err) {
      modelSelect.innerHTML = `<option>${copyText("load_error", "Load error")}</option>`;
      modelInfo.textContent = `${copyText("backend_unreachable", "Backend unreachable")}: ${err.message}`;
      log(simLog, `${copyText("model_error", "Model error")}: ${err.message}`);
    }
  }

  async function loadAgoraStatus() {
    if (!agoraStatus) return;
    try {
      const data = await fetchJson(`${API_BASE}/matomic/agora2/status`);
      const base = `${copyText("agora_status_prefix", "AGORA2")}: ${data.present_count}/${data.manifest_count} local`;
      if (data.missing_count > 0) {
        agoraStatus.textContent = `${base} | ${copyText("agora_missing", "missing")}: ${data.missing_count}`;
      } else {
        agoraStatus.textContent = `${base} | ${copyText("agora_complete", "complete")}`;
      }
    } catch (err) {
      agoraStatus.textContent = `${copyText("agora_status_error", "AGORA2 status error")}: ${err.message}`;
    }
  }

  async function runAgoraAction(checkOnly) {
    const btn = checkOnly ? agoraCheckBtn : agoraSyncBtn;
    if (btn) btn.disabled = true;
    try {
      const data = await fetchJson(`${API_BASE}/matomic/agora2/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ check_only: checkOnly, strict: false }),
      });
      const label = checkOnly ? "AGORA2 Check" : "AGORA2 Sync";
      log(simLog, `${label}: returncode=${data.returncode}`);
      const preview = (data.stdout || data.stderr || "").trim().split("\n").slice(-6).join(" | ");
      if (preview) log(simLog, preview);
      await loadAgoraStatus();
      await loadModels();
    } catch (err) {
      log(simLog, `${copyText("agora_action_failed", "AGORA2 action failed")}: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function renderModelInfo() {
    const id = modelSelect.value;
    const model = models.find((m) => m.id === id);
    if (!model) {
      modelInfo.textContent = copyText("no_model_selected", "No model selected.");
      return;
    }
    modelInfo.textContent = `${copyText("model_path_label", "Path")}: ${model.path} | ${copyText("model_type_label", "Type")}: ${model.ext} | ${copyText("model_source_label", "Source")}: ${model.source}`;
  }

  async function runSimulation() {
    const modelId = modelSelect.value;
    if (!modelId) {
      log(simLog, copyText("model_select_first", "Select a model first."));
      return;
    }

    let extraParams = {};
    try {
      extraParams = simParams.value.trim() ? JSON.parse(simParams.value) : {};
    } catch {
      log(simLog, copyText("invalid_json", "Parameters are not valid JSON."));
      return;
    }

    const payload = {
      type: simTypeSelect.value,
      user: sessionUser,
      params: {
        model_id: modelId,
        ...extraParams,
      },
    };

    runBtn.disabled = true;
    log(simLog, `${copyText("starting_job", "Starting job for model")}: ${modelId}`);
    try {
      const data = await fetchJson(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      log(simLog, `${copyText("job_started", "Job started")}: ${data.job_id} (${data.type})`);
    } catch (err) {
      log(simLog, `${copyText("run_error", "Run error")}: ${err.message}`);
    } finally {
      runBtn.disabled = false;
    }
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportMarkdown() {
    const title = noteTitle.value.trim() || "mAtomic Session Note";
    const body = noteBody.value.trim();
    const model = models.find((m) => m.id === modelSelect.value);
    const text = [
      `# ${title}`,
      "",
      `- User: ${sessionUser}`,
      `- Simulation type: ${simTypeSelect.value}`,
      `- Model: ${model ? model.name : "n/a"}`,
      `- Model path: ${model ? model.path : "n/a"}`,
      `- Timestamp: ${new Date().toISOString()}`,
      "",
      "## Notes",
      body || "(empty)",
      "",
    ].join("\n");
    downloadText("matomic_note.md", text);
  }

  function exportYaml() {
    const title = (noteTitle.value.trim() || "mAtomic Session Note").replace(/"/g, "'");
    const body = noteBody.value.trim();
    const model = models.find((m) => m.id === modelSelect.value);
    const yaml = [
      `id: note_matomic_${Date.now()}`,
      "type: note",
      "status: draft",
      `title: \"${title}\"`,
      "matomic:",
      `  model_id: \"${model ? model.id : ""}\"`,
      `  model_path: \"${model ? model.path : ""}\"`,
      `  simulation_type: \"${simTypeSelect.value}\"`,
      "content: |",
      ...((body || "(empty)").split("\n").map((line) => `  ${line}`)),
      `created: \"${new Date().toISOString()}\"`,
    ].join("\n");
    downloadText("matomic_note.yaml", yaml);
  }

  function openVox() {
    window.open("vox.html", "_blank", "noopener");
  }

  function initLoginLink() {
    const next = encodeURIComponent("/matomic_lab.html");
    loginBtn.href = `http://localhost:8000?next=${next}`;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    showGate();
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyInterfaceCopy();
    initLoginLink();

    logoutBtn.addEventListener("click", logout);
    modelRefreshBtn.addEventListener("click", loadModels);
    if (agoraCheckBtn) {
      agoraCheckBtn.addEventListener("click", () => runAgoraAction(true));
    }
    if (agoraSyncBtn) {
      agoraSyncBtn.addEventListener("click", () => runAgoraAction(false));
    }
    modelSelect.addEventListener("change", renderModelInfo);
    runBtn.addEventListener("click", runSimulation);
    exportMdBtn.addEventListener("click", exportMarkdown);
    exportYamlBtn.addEventListener("click", exportYaml);
    openVoxBtn.addEventListener("click", openVox);

    if (hasSession()) {
      showMain();
      loadModels();
      loadAgoraStatus();
    } else {
      showGate();
    }
  });
})();
