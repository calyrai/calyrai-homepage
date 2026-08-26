import content from "../../content/calyr.md?raw";

const commented = [...content.matchAll(/<!--[\s\S]*?-->/g)].map(match => match[0]).join("\n");
const activeContent = content.replace(/<!--[\s\S]*?-->/g, "");
const hiddenTiles = [...commented.matchAll(/^###\s+(.+)$/gm)].map(match => match[1].trim().toLowerCase());
const hiddenSections = [...commented.matchAll(/^##\s+\d+\s*·\s*(.+)$/gm)].map(match => match[1].trim().toLowerCase());
const tileContent = Object.fromEntries([...activeContent.matchAll(/^###\s+(.+)\nlabel:\s*(.+)\ntitle:\s*(.+)\nsummary:\s*(.+)\nhow:\s*(.+)\ndetails:\s*(.+)\nnext:\s*(.+)$/gm)].map(match => [match[1].trim().toLowerCase(), {label: match[2].trim(), title: match[3].trim(), summary: match[4].trim(), how: match[5].trim(), details: match[6].trim(), next: match[7].trim()}]));
const applicationsBlock = activeContent.match(/##\s+03\s*·\s*Applications\n([\s\S]*?)(?=\n## |$)/i)?.[1] ?? "";
const applications = [...applicationsBlock.matchAll(/^###\s+(.+)\nlabel:\s*(.+)\nsummary:\s*(.+)$/gm)].map(match => ({title: match[1].trim(), label: match[2].trim(), summary: match[3].trim()}));
const plain = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const sectionFields = (heading: string) => {
  const block = activeContent.match(new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`, "i"))?.[1] ?? "";
  return Object.fromEntries([...block.matchAll(/^([a-z_]+):\s*(.+)$/gm)].map(match => [match[1], match[2].trim()]));
};
const links = sectionFields("Links");
const imprint = sectionFields("Impressum");
const heroBlock = activeContent.match(/##\s+01\s*·[^\n]*\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";
const hero = Object.fromEntries([...heroBlock.matchAll(/^([a-z_]+):\s*(.+)$/gm)].map(match => [match[1], match[2].trim()]));

function applyMarkdownVisibility(frame: HTMLIFrameElement) {
  const document = frame.contentDocument;
  if (!document) return;
  if (document.body && document.body.dataset.calyrMenuObserver !== "true") {
    document.body.dataset.calyrMenuObserver = "true";
    const observer = new MutationObserver(() => {
      const menu = document.querySelector<HTMLUListElement>("#site-navigation-drawer .nav-list");
      if (menu && menu.dataset.calyrMenu !== "true") applyMarkdownVisibility(frame);
    });
    observer.observe(document.body, {childList: true, subtree: true});
  }

  let style = document.getElementById("calyr-markdown-visibility") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "calyr-markdown-visibility";
    document.head.appendChild(style);
  }
  style.textContent = [
    ...hiddenTiles.map(tile => `#explore_${tile}{display:none!important}`),
    `.tile-summary{white-space:pre-line}.tile-link-indicator{width:auto!important;top:auto!important;right:24px!important;bottom:22px!important;font-size:10px!important;letter-spacing:.08em;white-space:nowrap}`,
    `.calyr-mondrian-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-auto-rows:minmax(340px,auto)!important;width:100%!important;max-width:none!important;gap:18px!important;overflow:visible!important}.calyr-mondrian-grid>.tile{grid-column:1!important;grid-row:auto!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:340px!important;transform:none!important;margin:0!important;padding:28px!important;border:1px solid #eee!important}.calyr-mondrian-grid .tile-icon{width:100%!important;max-width:calc(100% - 190px)!important;padding-right:0!important;font-size:clamp(22px,3vw,44px)!important;white-space:normal!important}.calyr-mondrian-grid .tile-title{margin-top:auto!important}.calyr-mondrian-grid .tile-link-indicator{top:auto!important;right:28px!important;bottom:24px!important;left:auto!important;max-width:170px!important;text-align:right!important;white-space:normal!important}.page-main #movie .section-grid.calyr-mondrian-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important;padding:0 24px 18px!important;overflow:visible!important}.page-main #movie .section-grid.calyr-mondrian-grid>.tile{display:grid!important;grid-column:1!important;flex:none!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:340px!important}.page-main #movie .section-grid.calyr-mondrian-grid>.tile .tile-link-indicator{top:auto!important;right:28px!important;bottom:24px!important;left:auto!important}.page-main #movie .calyr-workflow-tile .tile-summary{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;width:100%!important;max-width:none!important;gap:clamp(32px,6vw,88px)!important}.calyr-copy-column{display:flex!important;flex-direction:column!important;gap:24px!important;min-width:0!important}.calyr-copy-block{display:block!important;white-space:pre-line!important}.calyr-imprint-tile{border-color:#168cff!important;background:linear-gradient(135deg,rgba(22,140,255,.16),#000 58%)!important}.calyr-imprint-tile .tile-icon{color:#168cff!important}.page-main #movie .calyr-imprint-tile .tile-title{position:absolute!important;top:145px!important;left:28px!important;margin:0!important}.calyr-imprint-tile .tile-summary{white-space:pre-line}.calyr-imprint-tile .tile-link-indicator{color:#168cff!important;text-decoration:none}@media(max-width:700px){.page-main #movie .section-grid.calyr-mondrian-grid{display:grid!important;padding:0 16px 18px!important;overflow:visible!important}.page-main #movie .section-grid.calyr-mondrian-grid>.tile{width:100%!important;min-width:0!important;min-height:360px!important}.calyr-mondrian-grid .tile-icon{max-width:100%!important;padding-right:0!important}.page-main #movie .calyr-workflow-tile .tile-summary{grid-template-columns:1fr!important;gap:24px!important}.page-main #movie .calyr-imprint-tile .tile-title{top:125px!important;left:20px!important}.page-main #movie .section-grid.calyr-mondrian-grid>.tile .tile-link-indicator{right:20px!important;bottom:18px!important;max-width:140px!important}}`
    ,`@media(max-width:700px){.page-main #movie .calyr-imprint-tile .tile-title{position:static!important;top:auto!important;left:auto!important;margin:0 0 22px!important}}`
  ].join("\n");

  const heroActions = document.querySelector<HTMLElement>(".calyr-hero-actions");
  const heroEyebrow = document.querySelector<HTMLElement>(".calyr-hero-eyebrow");
  const heroTagline = document.querySelector<HTMLElement>(".calyr-logo-tagline span:first-child");
  const heroDescription = document.querySelector<HTMLElement>(".calyr-hero-description");
  if (heroEyebrow) heroEyebrow.innerHTML = `<span class="calyr-hero-number">01</span> · ${hero.eyebrow}`;
  if (heroTagline) heroTagline.textContent = hero.tagline;
  if (heroDescription) heroDescription.textContent = hero.description;
  const searchButton = document.querySelector<HTMLButtonElement>(".site-search-trigger");
  const privateSearchUrl = `${links.explore_url}/search?q=`;
  if (searchButton && searchButton.dataset.privateGitSearch !== "true") {
    searchButton.dataset.privateGitSearch = "true";
    searchButton.setAttribute("aria-label", "Search the private CALYR Git repository");
    searchButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.defaultView?.open(privateSearchUrl, "_blank", "noopener,noreferrer");
    }, true);
    document.addEventListener("keydown", event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopImmediatePropagation();
        document.defaultView?.open(privateSearchUrl, "_blank", "noopener,noreferrer");
      }
    }, true);
  }
  if (heroActions && heroActions.dataset.calyrEntrypoints !== "true") {
    heroActions.dataset.calyrEntrypoints = "true";
    const template = heroActions.querySelector<HTMLAnchorElement>("a");
    const challengeHref = `mailto:${links.challenge_email}?subject=${encodeURIComponent(links.challenge_subject)}&body=${encodeURIComponent(links.challenge_body)}`;
    const entries = [
      {number: "01", label: links.start_label, href: "#movie", external: false},
      {number: "02", label: links.email_label, href: challengeHref, external: false}
    ];
    if (template) heroActions.replaceChildren(...entries.map(entry => {
      const anchor = template.cloneNode(true) as HTMLAnchorElement;
      anchor.href = entry.href;
      const number = anchor.children[0];
      const text = anchor.childNodes[1];
      if (number) number.textContent = entry.number;
      if (text) text.textContent = entry.label;
      if (entry.external) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      } else {
        anchor.removeAttribute("target");
        anchor.removeAttribute("rel");
      }
      return anchor;
    }));
  }

  const drawer = document.getElementById("site-navigation-drawer");
  const menuList = drawer?.querySelector<HTMLUListElement>(".nav-list");
  if (menuList && menuList.dataset.calyrMenu !== "true") {
    menuList.dataset.calyrMenu = "true";
    const challengeHref = `mailto:${links.challenge_email}?subject=${encodeURIComponent(links.challenge_subject)}&body=${encodeURIComponent(links.challenge_body)}`;
    const menuItems = [
      {label: links.explore_label, href: links.explore_url, external: true},
      {label: links.challenge_label, href: challengeHref, external: false},
      {label: "Impressum", href: "#impressum_tile", external: false}
    ];
    menuList.replaceChildren(...menuItems.map(item => {
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.className = "nav-link";
      anchor.href = item.href;
      anchor.textContent = item.label;
      anchor.style.color = "rgb(255, 255, 255)";
      if (item.external) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      if (item.href.startsWith("#")) anchor.addEventListener("click", () => document.querySelector<HTMLButtonElement>(".hamburger")?.click());
      listItem.appendChild(anchor);
      return listItem;
    }));
    drawer?.querySelector(".nav-contact-cluster")?.remove();
  }

  const main = document.querySelector("main");
  if (main && !document.getElementById("impressum_tile")) {
    const section = document.createElement("section");
    section.id = "impressum";
    section.className = "calyr-imprint";
    const tile = document.createElement("article");
    tile.id = "impressum_tile";
    tile.className = "tile calyr-imprint-tile";
    const icon = document.createElement("div");
    icon.className = "tile-icon";
    const marker = document.createElement("span");
    marker.textContent = imprint.label;
    icon.appendChild(marker);
    const content = document.createElement("div");
    content.className = "tile-content";
    const heading = document.createElement("h3");
    heading.className = "tile-title";
    heading.textContent = imprint.title;
    const details = document.createElement("p");
    details.className = "tile-summary";
    details.textContent = `${imprint.description}\n\n${imprint.name}\n${imprint.role}\n${imprint.address}`;
    const email = document.createElement("a");
    email.className = "tile-link-indicator";
    email.href = `mailto:${imprint.email}`;
    email.textContent = `${imprint.email} ↗`;
    content.append(heading, details);
    tile.append(icon, content, email);
    section.appendChild(tile);
    main.appendChild(section);
  }

  for (const tile of document.querySelectorAll<HTMLElement>(".tile")) {
    if (tile.id === "impressum_tile") continue;
    tile.setAttribute("role", "group");
    tile.removeAttribute("tabindex");
    tile.style.cursor = "default";
    if (tile.dataset.localStatic === "true") continue;
    tile.dataset.localStatic = "true";
    tile.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    tile.addEventListener("keydown", event => event.stopImmediatePropagation(), true);
  }

  for (const [tile, copy] of Object.entries(tileContent)) {
    const element = document.getElementById(`explore_${tile}`);
    const label = element?.querySelector(".tile-icon span");
    const title = element?.querySelector(".tile-title");
    const summary = element?.querySelector(".tile-summary");
    const next = element?.querySelector(".tile-link-indicator");
    if (label) label.textContent = copy.label;
    if (title) title.textContent = copy.title;
    if (summary) {
      const left = document.createElement("span");
      const right = document.createElement("span");
      left.className = "calyr-copy-column";
      right.className = "calyr-copy-column";
      for (const value of [copy.summary, copy.how]) {
        const block = document.createElement("span");
        block.className = "calyr-copy-block";
        block.textContent = value;
        left.appendChild(block);
      }
      const details = document.createElement("span");
      details.className = "calyr-copy-block";
      details.textContent = copy.details.replaceAll(" | ", "\n\n");
      right.appendChild(details);
      summary.replaceChildren(left, right);
    }
    if (next) next.textContent = copy.next;
  }
  for (const tile of hiddenTiles) {
    document.getElementById(`explore_${tile}`)?.style.setProperty("display", "none", "important");
  }
  const workflowTiles = ["explore_data", "explore_surrogate", "explore_oracle"].map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
  if (workflowTiles.length) {
    workflowTiles.forEach(tile => tile.classList.add("calyr-workflow-tile"));
    const grid = workflowTiles[0].parentElement;
    grid?.classList.add("calyr-mondrian-grid");
    const imprintTile = document.getElementById("impressum_tile");
    const imprintSection = document.getElementById("impressum");
    if (grid && imprintTile && imprintTile.parentElement !== grid) grid.appendChild(imprintTile);
    if (imprintSection && !imprintSection.children.length) imprintSection.remove();
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>(".section-collapse-toggle")) {
    const label = plain(button.getAttribute("aria-label") ?? button.textContent ?? "");
    if (hiddenSections.some(section => label.includes(plain(section)))) {
      button.parentElement?.remove();
    }
    if (label.includes("company")) {
      const number = button.querySelector(".section-sequence");
      if (number) number.textContent = "04";
    }
    if (label.includes("examples")) {
      const section = button.parentElement;
      const number = button.querySelector(".section-sequence");
      const heading = button.querySelector(".section-collapse-label");
      if (number) number.textContent = "03";
      if (heading) heading.textContent = "Applications";
      const tiles = [...(section?.querySelectorAll<HTMLElement>(".tile") ?? [])];
      tiles.forEach((tile, index) => {
        const copy = applications[index];
        if (!copy) return tile.remove();
        const tileLabel = tile.querySelector(".tile-icon span");
        const title = tile.querySelector(".tile-title");
        const summary = tile.querySelector(".tile-summary");
        if (tileLabel) tileLabel.textContent = copy.label;
        if (title) title.textContent = copy.title;
        if (summary) summary.textContent = copy.summary;
      });
      if (button.getAttribute("aria-expanded") === "false") button.click();
    }
  }
}

const frame = document.querySelector<HTMLIFrameElement>("#calyr-live-frame");

if (frame) {
  let passes = 0;
  const apply = () => applyMarkdownVisibility(frame);
  frame.addEventListener("load", apply);
  const timer = window.setInterval(() => {
    apply();
    if (++passes >= 20) window.clearInterval(timer);
  }, 100);
}
