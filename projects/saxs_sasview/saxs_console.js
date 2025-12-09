// saxs_sasview frontend
// - Tries to use a backend API (FastAPI + sasmodels DirectModel)
// - Falls back to a local pseudo-sphere model if API_URL is empty or fails.

const API_URL = "http://localhost:8000/compute/iq"; 
// For pure interface mode, set to "".
// For Mac backend:    "http://localhost:8000/compute/iq"
// For online server:  "https://your-domain/compute/iq"

let iqChart = null;

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("iq-chart");
  if (!canvas) {
    console.error("Canvas #iq-chart not found.");
    return;
  }

  const ctx = canvas.getContext("2d");

  iqChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "I(q)",
          data: [],
          borderColor: "#22d3ee",
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: {
          type: "logarithmic",
          title: { display: true, text: "q [Å⁻¹]" },
          ticks: { min: 1e-4 }
        },
        y: {
          type: "logarithmic",
          title: { display: true, text: "I(q)" },
          ticks: { min: 1e-8 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  const form = document.getElementById("saxs-form");
  const statusEl = document.getElementById("status");

  if (!form) {
    console.error("Form #saxs-form not found.");
    return;
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const radius = parseFloat(document.getElementById("radius")?.value || "50") || 50;
    const qmin = parseFloat(document.getElementById("qmin")?.value || "0.001") || 0.001;
    const qmax = parseFloat(document.getElementById("qmax")?.value || "0.3") || 0.3;

    const q = buildGrid(qmin, qmax, 200);

    // Try backend if configured
    if (API_URL) {
      try {
        if (statusEl) statusEl.textContent = "Calling sasmodels backend …";
        const result = await callBackend("sphere", q, {
          radius: radius,
          sld: 4.0,
          sld_solvent: 1.0,
          background: 0.0,
          scale: 1.0
        });

        updateChart(result.q, result.I);
        if (statusEl) statusEl.textContent = "I(q) from backend (sasmodels).";
        return;
      } catch (err) {
        console.error("Backend error, falling back to local curve:", err);
        if (statusEl) {
          statusEl.textContent = "Backend failed – using local pseudo-sphere curve.";
        }
      }
    } else {
      if (statusEl) {
        statusEl.textContent = "API_URL empty – using local pseudo-sphere curve.";
      }
    }

    // Fallback: local analytic sphere-like curve
    const I = sphereFF(q, radius);
    updateChart(q, I);
  });

  // Initial curve (local)
  const q0 = buildGrid(0.001, 0.3, 200);
  const I0 = sphereFF(q0, 50);
  updateChart(q0, I0);
  if (statusEl) {
    statusEl.textContent = API_URL
      ? "Initial local curve. Submit to query backend."
      : "Initial local curve (backend disabled).";
  }
});

function updateChart(q, I) {
  if (!iqChart) return;
  iqChart.data.labels = q;
  iqChart.data.datasets[0].data = I;
  iqChart.update();
}

function buildGrid(a, b, n) {
  const arr = [];
  const step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) arr.push(a + i * step);
  return arr;
}

// Simple analytic sphere-like form factor as fallback
function sphereFF(q, R) {
  const I = [];
  const radius = R || 50;
  for (const qi of q) {
    const x = qi * radius;
    const v = (Math.sin(x) - x * Math.cos(x)) / (Math.pow(x, 3) + 1e-12);
    I.push(v * v + 1e-12);
  }
  return I;
}

async function callBackend(modelName, qArray, params) {
  const payload = {
    model: modelName,
    q: qArray,
    params: params
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("HTTP " + res.status + " – " + text);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.q) || !Array.isArray(data.I)) {
    throw new Error("Invalid backend response format");
  }

  return data;
}