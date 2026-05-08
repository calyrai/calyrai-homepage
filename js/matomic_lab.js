/* Calyr.mAtomic Lab - simulate + write with model access */

(function () {
  const API_BASE = "http://localhost:8000";
  const SESSION_KEY = "citizen_session";
  const USER_KEY = "citizen_user";

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
    modelSelect.innerHTML = "<option>Lade Modelle...</option>";
    modelInfo.textContent = "";
    try {
      const data = await fetchJson(`${API_BASE}/matomic/models`);
      models = data.models || [];
      modelSelect.innerHTML = "";

      if (!models.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Keine Modelle gefunden";
        modelSelect.appendChild(opt);
        modelInfo.textContent = "Keine mAtomic-Modelle im Backend-Scan gefunden.";
        return;
      }

      for (const m of models) {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.name} (${m.source})`;
        modelSelect.appendChild(opt);
      }
      renderModelInfo();
      log(simLog, `Modelle geladen: ${models.length}`);
    } catch (err) {
      modelSelect.innerHTML = "<option>Fehler beim Laden</option>";
      modelInfo.textContent = `Backend nicht erreichbar: ${err.message}`;
      log(simLog, `Fehler Modelle: ${err.message}`);
    }
  }

  async function loadAgoraStatus() {
    if (!agoraStatus) return;
    try {
      const data = await fetchJson(`${API_BASE}/matomic/agora2/status`);
      const base = `AGORA2: ${data.present_count}/${data.manifest_count} lokal`;
      if (data.missing_count > 0) {
        agoraStatus.textContent = `${base} | fehlend: ${data.missing_count}`;
      } else {
        agoraStatus.textContent = `${base} | komplett`;
      }
    } catch (err) {
      agoraStatus.textContent = `AGORA2 Status-Fehler: ${err.message}`;
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
      log(simLog, `AGORA2 Aktion fehlgeschlagen: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function renderModelInfo() {
    const id = modelSelect.value;
    const model = models.find((m) => m.id === id);
    if (!model) {
      modelInfo.textContent = "Kein Modell ausgewaehlt.";
      return;
    }
    modelInfo.textContent = `Pfad: ${model.path} | Typ: ${model.ext} | Quelle: ${model.source}`;
  }

  async function runSimulation() {
    const modelId = modelSelect.value;
    if (!modelId) {
      log(simLog, "Bitte zuerst ein Modell waehlen.");
      return;
    }

    let extraParams = {};
    try {
      extraParams = simParams.value.trim() ? JSON.parse(simParams.value) : {};
    } catch {
      log(simLog, "Parameter sind kein valides JSON.");
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
    log(simLog, `Starte Job fuer Modell: ${modelId}`);
    try {
      const data = await fetchJson(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      log(simLog, `Job gestartet: ${data.job_id} (${data.type})`);
    } catch (err) {
      log(simLog, `Run-Fehler: ${err.message}`);
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
