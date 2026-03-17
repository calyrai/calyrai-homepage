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

    const cardId = p.id ? `project-${p.id}` : "";

    const openHref = p.url || (p.id ? `#project-${p.id}` : "#");

    return `
      <article class="project-card" ${cardId ? `id="${cardId}"` : ""}>
        <div class="project-card-accent"
             style="background: linear-gradient(90deg, ${accent}, rgba(255,140,255,1));">
        </div>

        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-subtitle">${p.subtitle || ""}</p>

        <div class="project-card-body">${bodyHtml}</div>

        ${p.id ? `<a href="${openHref}" class="glow-btn">OPEN PROJECT</a>` : ""}
      </article>
    `;
  }).join("");

  // If arriving with a hash, prefer routing to the project's interactive page.
  // (This preserves old deep links like projects.html#project-vaults.)
  const hash = window.location.hash || "";
  if (hash && hash.startsWith("#project-")) {
    const params = new URLSearchParams(window.location.search || "");
    const stayOnList = params.get("stay") === "1";

    if (stayOnList) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // compensate sticky header
          window.scrollBy({ top: -90, left: 0, behavior: "auto" });
        }, 0);
      }
      return;
    }

    const projectId = decodeURIComponent(hash.slice("#project-".length));
    const p = projects.find(pr => String(pr.id) === String(projectId));
    if (p && p.url) {
      window.location.replace(p.url);
      return;
    }

    // Fallback: if no page exists, scroll to the card after render.
    const el = document.querySelector(hash);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // compensate sticky header
        window.scrollBy({ top: -90, left: 0, behavior: "auto" });
      }, 0);
    }
  }
})();