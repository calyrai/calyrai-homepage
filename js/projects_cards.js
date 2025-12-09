// js/projects_cards.js
(function () {
  const container = document.getElementById("projects-grid");

  if (!container) return;

  const projects = window.CALYR_PROJECTS || [];

  container.innerHTML = projects.map(p => {
    const bodyHtml = (p.text || [])
      .map(t => `<p>${t}</p>`)
      .join("");

    const accent = p.color || "#78f0ff";

    return `
      <article class="project-card">
        <div class="project-card-accent"
             style="background: linear-gradient(90deg, ${accent}, rgba(255,140,255,1));">
        </div>

        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-subtitle">${p.subtitle || ""}</p>

        <div class="project-card-body">${bodyHtml}</div>

        ${p.url ? `<a href="${p.url}" class="glow-btn">OPEN PROJECT</a>` : ""}
      </article>
    `;
  }).join("");
})();