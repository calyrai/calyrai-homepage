// Calyr.ai – SAXS Engine (Model + Parameter-Pills + Plot)

const MODELS_URL = "../../data/sasmodels_models.json";
const API_URL    = "http://localhost:8000/compute/iq";

let models = [];
let chart  = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadModels();
  setupChart();
  setupEvents();
});

// Load models from JSON
async function loadModels() {
  const select = document.getElementById("model-select");
  const res = await fetch(MODELS_URL);
  const data = await res.json();
  models = data.models || [];

  models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.name;
    opt.textContent = m.label || m.name;
    select.appendChild(opt);
  });

  if (models.length > 0) {
    select.value = models[0].name;
    updateParameterFields(models[0]);
  }
}

// Build parameter inputs in pill 2
function updateParameterFields(model) {
  const container = document.getElementById("param-fields");
  container.innerHTML = "";

  (model.params || []).forEach(p => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <label class="control-label block mb-0.5">${p.name}</label>
      <input type="number" step="any"
             value="${p.default ?? 0}"
             data-param="${p.name}"
             class="control-input" />
    `;
    container.appendChild(wrap);
  });
}

function setupEvents() {
  const select  = document.getElementById("model-select");
  const button  = document.getElementById("compute-btn");

  select.addEventListener("change", () => {
    const m = models.find(mm => mm.name === select.value);
    if (m) updateParameterFields(m);
  });

  button.addEventListener("click", () => {
    computeIq().catch(err => {
      console.error(err);
      const status = document.getElementById("status");
      if (status) status.textContent = "Fehler – Details in der Konsole.";
    });
  });
}

function buildQGrid() {
  const q = [];
  const qmin = 0.001, qmax = 0.3, n = 300;
  const step = (qmax - qmin) / (n - 1);
  for (let i = 0; i < n; i++) q.push(qmin + i * step);
  return q;
}

async function computeIq() {
  const status = document.getElementById("status");
  const select = document.getElementById("model-select");
  const model  = models.find(m => m.name === select.value);

  if (!model) {
    if (status) status.textContent = "Kein Modell gewählt.";
    return;
  }

  const params = {};
  document.querySelectorAll("[data-param]").forEach(el => {
    const key = el.getAttribute("data-param");
    const val = parseFloat(el.value);
    params[key] = isNaN(val) ? 0 : val;
  });

  const q = buildQGrid();
  const payload = { model: model.name, q, params };

  // Try backend
  try {
    if (status) status.textContent = "Berechne über Backend…";

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!Array.isArray(data.q) || !Array.isArray(data.I)) {
      throw new Error("Invalid backend response");
    }
    updateChart(data.q, data.I);
    if (status) status.textContent = "Backend-Resultat empfangen.";
    return;
  } catch (err) {
    console.warn("Backend failed, using fallback sphere:", err);
    if (status) {
      status.textContent = "Backend-Fehler → lokale Sphere-Näherung.";
    }
  }

  // Fallback: analytic sphere
  const radius = params.radius ?? 50;
  const I = fallbackSphere(q, radius);
  updateChart(q, I);
}

function fallbackSphere(q, R) {
  const I = [];
  const Rv = R || 50;
  for (const qi of q) {
    const x = qi * Rv;
    const v = (Math.sin(x) - x * Math.cos(x)) / (Math.pow(x, 3) + 1e-12);
    I.push(v * v + 1e-12);
  }
  return I;
}

function setupChart() {
  const ctx = document.getElementById("iq-chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "I(q)",
        data: [],
        borderColor: "#22d3ee",
        pointRadius: 0,
        borderWidth: 1.6,
        tension: 0.12
      }]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: {
          type: "logarithmic",
          title: { display: true, text: "q [Å⁻¹]" }
        },
        y: {
          type: "logarithmic",
          title: { display: true, text: "I(q)" }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function updateChart(q, I) {
  chart.data.labels = q;
  chart.data.datasets[0].data = I;
  chart.update();
}