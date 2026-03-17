// js/slides_viewer.js
// YAML-based slide viewer with:
// - full-window slides
// - interactive iframe (zoom + fullscreen)
// - glassy cyan notes panel (draggable, Shift+N toggle)
// - notes: Mail + LaTeX+ZIP export using JSZip
// - clipboard image support: paste into notes, export as PNG + LaTeX
// - Shift + drag = select screenshot region (visual only, not exported now)
// - arrow keys only change slides when you are NOT typing in a note

(function () {
  'use strict';

  const root   = document.getElementById("slides-root");
  const navBar = document.getElementById("slides-nav");

  // SVG brush for navigation
  let navBrush = null;

  function ensureNavBrush() {
    if (!navBar) return null;

    if (navBrush) {
      if (!navBrush.parentNode) {
        navBar.appendChild(navBrush);
      }
      return navBrush;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "slides-nav-brush");
    svg.setAttribute("viewBox", "0 0 200 60");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "36");

    const defs = document.createElementNS(svgNS, "defs");

    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "brushGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "80%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "20%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#ff00b4");
    stop1.setAttribute("stop-opacity", "0.7");

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "40%");
    stop2.setAttribute("stop-color", "#ff37ff");
    stop2.setAttribute("stop-opacity", "0.8");

    const stop3 = document.createElementNS(svgNS, "stop");
    stop3.setAttribute("offset", "100%");
    stop3.setAttribute("stop-color", "#ff7ad9");
    stop3.setAttribute("stop-opacity", "0.4");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);

    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "brushBlur");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "140%");
    filter.setAttribute("height", "200%");

    const blur = document.createElementNS(svgNS, "feGaussianBlur");
    blur.setAttribute("stdDeviation", "4");
    filter.appendChild(blur);

    defs.appendChild(gradient);
    defs.appendChild(filter);
    svg.appendChild(defs);

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      "M 5 50 \
       Q 40 40 80 32 \
       T 150 20 \
       Q 175 18 195 10 \
       L 195 30 \
       Q 160 40 120 48 \
       T 35 55 Z"
    );
    path.setAttribute("fill", "url(#brushGradient)");
    path.setAttribute("filter", "url(#brushBlur)");

    svg.appendChild(path);

    navBar.appendChild(svg);
    navBrush = svg;
    return svg;
  }

  function updateBrushPosition() {
    if (!navBar) return;
    const brush = ensureNavBrush();
    if (!brush) return;

    const active = navBar.querySelector(".slides-nav-item.active");
    if (!active) return;

    const rectNav    = navBar.getBoundingClientRect();
    const rectActive = active.getBoundingClientRect();
    const rectBrush  = brush.getBoundingClientRect();

    const x = rectActive.left - rectNav.left +
              rectActive.width / 2 -
              rectBrush.width / 2;

    brush.style.left = x + "px";

    brush.style.transform = "rotate(-10deg) translateY(-3px)";
    setTimeout(() => {
      if (!brush) return;
      brush.style.transform = "rotate(-10deg) translateY(0px)";
    }, 150);
  }

  // current slide DOM node (for Shift+N notes toggle)
  let currentSlideElement = null;

  // in-memory store for clipboard images per slide
  const clipboardImages = {};

  // --------------------------------------------------------
  // Utility
  // --------------------------------------------------------

  function getDeckName() {
    const params = new URLSearchParams(window.location.search);
    return params.get("deck") || "saxs";
  }

  function renderLoading(msg) {
    root.innerHTML = '<div class="slides-loading">' + msg + '</div>';
  }

  function renderError(msg) {
    root.innerHTML =
      '<div class="slides-loading" style="color:#b00;">' + msg + '</div>';
  }

  function notesKey(deck, idx) {
    return "calyr_notes_" + deck + "_" + idx;
  }

  function stripTags(html) {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  }

  // --------------------------------------------------------
  // Export: LaTeX + clipboard PNG as ZIP
  // --------------------------------------------------------
  async function exportSlide(deckName, index, slide, noteText, container) {
    const baseName = deckName + "_slide" + (index + 1);
    const imgKey   = deckName + "_" + index;

    const clipBlob = clipboardImages[imgKey] || container.__clipboardImage || null;
    const clipName = baseName + "_clipboard.png";

    let caption = null;
    if (noteText) {
      const m = noteText.match(/caption:\s*(.+)/i);
      if (m && m[1]) {
        caption = m[1].trim();
      }
    }

    let tex = "";
    tex += "\\begin{frame}{" +
           (slide.title ? stripTags(slide.title) : "") +
           "}\n\n";

    if (slide.subtitle) {
      tex += "  \\textit{" + stripTags(slide.subtitle) + "}\\\\[0.5em]\n\n";
    }
    if (slide.big) {
      tex += "  \\textbf{" + stripTags(slide.big) + "}\\\\[0.8em]\n\n";
    }

    if (Array.isArray(slide.bullets) && slide.bullets.length > 0) {
      tex += "  \\begin{itemize}\n";
      slide.bullets.forEach(b => {
        tex += "    \\item " + stripTags(b) + "\n";
      });
      tex += "  \\end{itemize}\n\n";
    }

    if (clipBlob) {
      tex += "  \\vspace{0.8cm}\n";

      if (caption) {
        tex += "  \\begin{figure}\n";
        tex += "    \\centering\n";
        tex += "    \\includegraphics[width=0.85\\linewidth]{" +
               clipName + "}\n";
        tex += "    \\caption{" + caption.replace(/_/g, "\\_") + "}\n";
        tex += "  \\end{figure}\n\n";
      } else {
        tex += "  \\begin{center}\n";
        tex += "    \\includegraphics[width=0.85\\linewidth]{" +
               clipName + "}\n";
        tex += "  \\end{center}\n\n";
      }
    } else {
      tex += "  % No clipboard image was available for this slide.\n\n";
    }

    if (noteText && noteText.trim()) {
      tex += "  % Notes\n";
      tex += "  % " + noteText.trim().replace(/\n/g, "\n  % ") + "\n";
    }

    tex += "\\end{frame}\n";

    if (!window.JSZip) {
      console.warn("JSZip not available");
      return;
    }

    const zip = new JSZip();
    zip.file(baseName + ".tex", tex);

    if (clipBlob) {
      try {
        const ab = await clipBlob.arrayBuffer();
        zip.file(clipName, ab);
      } catch (e) {
        console.warn("Could not read clipboard image blob:", e);
      }
    }

    try {
      const blobZip = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blobZip);
      const a = document.createElement("a");
      a.href = url;
      a.download = baseName + ".zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Could not create ZIP:", e);
    }
  }

  // --------------------------------------------------------
  // Notes UI  (glassy panel, draggable, Shift+N toggle)
  // mit gespeicherter Position + Thought-Line zum Zentrum
  // --------------------------------------------------------
  function attachNotesUI(container, deckName, slideIndex, slide) {
    const key    = notesKey(deckName, slideIndex);
    const posKey = key + "_pos";   // Position der Note pro Slide merken

    // kleine, stabile Palette (Fallback-Farbe)
    const colors = ["#ff4df5", "#24f3ff", "#ffdd35", "#7bff8a", "#ff7ad9"];
    const color  = colors[slideIndex % colors.length];

    // Tail: Linie zwischen Notes-Panel und Slide-Zentrum
    const tail = document.createElement("div");
    tail.className = "slide-notes-tail";
    tail.style.position = "absolute";
    tail.style.pointerEvents = "none";
    tail.style.borderRadius = "999px";
    tail.style.opacity = "0.9";
    tail.style.background = color;
    container.appendChild(tail);

    const panel = document.createElement("div");
    panel.className = "slide-notes-panel";
    panel.style.borderColor = color;
    panel.style.boxShadow = "0 0 18px " + color + "55";

    const label = document.createElement("div");
    label.className = "slide-notes-label";
    label.textContent = "";
    panel.appendChild(label);

    const rendered = document.createElement("div");
    rendered.className = "slide-notes-rendered";

    const textarea = document.createElement("textarea");
    textarea.className = "slide-notes-textarea";

    // --- Notes-Text laden ---
    let savedText = "";
    try {
      const s = window.localStorage.getItem(key);
      if (s) savedText = s;
    } catch (e) {}
    textarea.value = savedText;
    rendered.textContent = savedText || "Hover to edit markdown notes…";

    // --- Position laden (falls vorhanden) ---
    try {
      const raw = window.localStorage.getItem(posKey);
      if (raw) {
        const pos = JSON.parse(raw);
        if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
          panel.style.left   = pos.x + "px";
          panel.style.top    = pos.y + "px";
          panel.style.right  = "auto";
          panel.style.bottom = "auto";
          panel.style.transform = "none";
        }
      }
    } catch (e) {
      // kaputte JSON einfach ignorieren
    }

    // Farbe der Thought-Line an tatsächliche Panel-Farbe koppeln
    function syncTailColor() {
      try {
        const cs = window.getComputedStyle(panel);
        let c = cs.borderColor;

        if (!c || c === "transparent") {
          const bs = cs.boxShadow || "";
          const m  = bs.match(/rgba?\([^)]+\)/);
          if (m) c = m[0];
        }
        if (!c) c = color;

        tail.style.background = c;
        tail.style.boxShadow  = "0 0 12px " + c;
      } catch (e) {}
    }

      // Tail: immer als Segment zwischen Slide-Zentrum und Panel-Rand
    function updateTail() {
      const containerRect = container.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();

      const centerX = containerRect.left + containerRect.width  / 2;
      const centerY = containerRect.top  + containerRect.height / 2;

      const panelCenterX = rect.left + rect.width  / 2;
      const panelCenterY = rect.top  + rect.height / 2;

      const dx = panelCenterX - centerX;
      const dy = panelCenterY - centerY;

      const localCenterX = centerX - containerRect.left;
      const localCenterY = centerY - containerRect.top;
      const localLeft    = rect.left   - containerRect.left;
      const localRight   = rect.right  - containerRect.left;
      const localTop     = rect.top    - containerRect.top;
      const localBottom  = rect.bottom - containerRect.top;

      // Reset
      tail.style.width  = "";
      tail.style.height = "";

      if (Math.abs(dx) >= Math.abs(dy)) {
        // stärker links/rechts versetzt → horizontale Linie
        const edgeX = (dx > 0 ? localLeft : localRight); // Rand in Richtung Zentrum
        const x1 = localCenterX;
        const x2 = edgeX;

        tail.style.left  = Math.min(x1, x2) + "px";
        tail.style.width = Math.abs(x2 - x1) + "px";

        const y = panelCenterY - containerRect.top;
        tail.style.top    = (y - 1) + "px";
        tail.style.height = "2px";
      } else {
        // stärker oben/unten versetzt → vertikale Linie
        const edgeY = (dy > 0 ? localTop : localBottom); // Rand in Richtung Zentrum
        const y1 = localCenterY;
        const y2 = edgeY;

        tail.style.top    = Math.min(y1, y2) + "px";
        tail.style.height = Math.abs(y2 - y1) + "px";

        const x = panelCenterX - containerRect.left;
        tail.style.left  = (x - 1) + "px";
        tail.style.width = "2px";
      }
    }

    // --- Clipboard-Image → Markdown-Tag einfügen ---
    textarea.addEventListener("paste", (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) return;

          const imgKey = deckName + "_" + slideIndex;

          container.__clipboardImage = blob;
          clipboardImages[imgKey] = blob;

          const clipName = `${deckName}_slide${slideIndex + 1}_clipboard.png`;
          const mdTag = `![clipboard](${clipName})`;

          const v = textarea.value;
          const start = textarea.selectionStart ?? v.length;
          const end   = textarea.selectionEnd ?? v.length;

          textarea.value = v.slice(0, start) + mdTag + v.slice(end);
          const newPos = start + mdTag.length;
          textarea.selectionStart = textarea.selectionEnd = newPos;

          textarea.dispatchEvent(new Event("input"));
          break;
        }
      }
    });

    function syncRendered() {
      const val = textarea.value;
      rendered.textContent = val || "Hover to edit markdown notes…";
      try {
        window.localStorage.setItem(key, val);
      } catch (e) {}
    }

    syncRendered();
    textarea.addEventListener("input", syncRendered);

    const actions = document.createElement("div");
    actions.className = "slide-notes-actions";

    const mailBtn = document.createElement("button");
    mailBtn.type = "button";
    mailBtn.className = "slide-notes-btn mail-btn";
    mailBtn.textContent = "Mail";
    mailBtn.addEventListener("click", () => {
      const txt = textarea.value || "";
      const subj = encodeURIComponent(
        `Slide ${slideIndex + 1} notes – ${deckName}`
      );
      const body = encodeURIComponent(txt);
      const mailto =
        `mailto:rupert.tscheliessnig@calyr.ai?subject=${subj}&body=${body}`;
      window.location.href = mailto;
    });
    actions.appendChild(mailBtn);

    const exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.className = "slide-notes-btn";
    exportBtn.textContent = "LaTeX+ZIP";
    exportBtn.addEventListener("click", () => {
      exportSlide(deckName, slideIndex, slide, textarea.value, container);
    });
    actions.appendChild(exportBtn);

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "slide-notes-btn close-btn";
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", () => {
      panel.style.display = "none";
      tail.style.display  = "none";
    });
    actions.appendChild(closeBtn);

    panel.appendChild(rendered);
    panel.appendChild(textarea);
    panel.appendChild(actions);

    container.appendChild(panel);

    // ---------- Drag-Handling + Positions-Speichern ----------
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function savePanelPos() {
      try {
        const containerRect = container.getBoundingClientRect();
        const rect = panel.getBoundingClientRect();
        const pos = {
          x: rect.left - containerRect.left,
          y: rect.top  - containerRect.top
        };
        window.localStorage.setItem(posKey, JSON.stringify(pos));
      } catch (e) {}
    }

    function onMove(e) {
      if (!dragging) return;
      const containerRect = container.getBoundingClientRect();
      const newLeft = e.clientX - containerRect.left - offsetX;
      const newTop  = e.clientY - containerRect.top  - offsetY;
      panel.style.left   = newLeft + "px";
      panel.style.top    = newTop  + "px";
      panel.style.right  = "auto";
      panel.style.bottom = "auto";
      panel.style.transform = "none";
      updateTail();
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      savePanelPos();
    }

    panel.addEventListener("mousedown", (e) => {
      const tag = e.target.tagName;

      // Textarea / Buttons nicht als Drag-Handle
      if (tag === "TEXTAREA" || tag === "BUTTON") return;

      const rect = panel.getBoundingClientRect();
      const fromRight  = rect.right  - e.clientX;
      const fromBottom = rect.bottom - e.clientY;
      if (fromRight < 24 && fromBottom < 24) {
        return;
      }

      e.preventDefault();
      const containerRect = container.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragging = true;

      panel.style.left   = (rect.left - containerRect.left) + "px";
      panel.style.top    = (rect.top  - containerRect.top)  + "px";
      panel.style.right  = "auto";
      panel.style.bottom = "auto";
      panel.style.transform = "none";

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // einmal initial setzen (nachdem Panel & Tail im DOM sind)
    requestAnimationFrame(() => {
      syncTailColor();
      updateTail();
    });

    // Shift+N toggle
    container.__toggleNotes = function () {
      const hidden = (panel.style.display === "none");
      panel.style.display = hidden ? "" : "none";
      tail.style.display  = hidden ? "" : "none";
    };
  }
  // --------------------------------------------------------
  // Screenshot region selection (Shift + drag)
  // --------------------------------------------------------

  function attachSelectionToSlide(container) {
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let overlay = null;
    let containerRect = null;

    function updateOverlay(x1, y1) {
      if (!overlay || !containerRect) return;
      const x0 = startX;
      const y0 = startY;
      const left = Math.min(x0, x1);
      const top  = Math.min(y0, y1);
      const w    = Math.abs(x1 - x0);
      const h    = Math.abs(y1 - y0);

      overlay.style.left   = left + "px";
      overlay.style.top    = top  + "px";
      overlay.style.width  = w    + "px";
      overlay.style.height = h    + "px";
    }

    function onMouseMove(e) {
      if (!isSelecting) return;
      updateOverlay(e.clientX, e.clientY);
    }

    function onMouseUp(e) {
      if (!isSelecting) return;
      isSelecting = false;

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (!overlay || !containerRect) {
        if (overlay) overlay.remove();
        overlay = null;
        container.__selection = null;
        return;
      }

      const rect = overlay.getBoundingClientRect();
      const selX = rect.left - containerRect.left;
      const selY = rect.top  - containerRect.top;
      const selW = rect.width;
      const selH = rect.height;

      overlay.remove();
      overlay = null;

      if (selW > 5 && selH > 5) {
        container.__selection = {
          x: selX,
          y: selY,
          w: selW,
          h: selH
        };
      } else {
        container.__selection = null;
      }
    }

    container.addEventListener("mousedown", (e) => {
      if (!e.shiftKey || e.button !== 0) return;

      if (e.target.closest(".slide-notes-panel")) return;
      if (e.target.tagName === "BUTTON" || e.target.tagName === "TEXTAREA") return;

      e.preventDefault();

      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      containerRect = container.getBoundingClientRect();

      overlay = document.createElement("div");
      overlay.className = "selection-overlay";
      overlay.style.position = "fixed";
      overlay.style.pointerEvents = "none";
      overlay.style.border = "2px solid #24f3ff";
      overlay.style.boxShadow = "0 0 12px rgba(255,77,245,0.8)";
      overlay.style.background = "rgba(36,243,255,0.15)";
      overlay.style.zIndex = "9999";

      document.body.appendChild(overlay);
      updateOverlay(startX, startY);

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  // --------------------------------------------------------
  // Slide creation
  // --------------------------------------------------------

  function createSlideElement(slide, deckName, slideIndex) {
    const container = document.createElement("div");
    container.className = "slide";

    const header = document.createElement("div");
    header.className = "slide-header";

    if (slide.kind === "title") {
      const h1 = document.createElement("h1");
      h1.className = "slide-title-main";
      h1.innerHTML = slide.title || "";
      header.appendChild(h1);

      if (slide.subtitle) {
        const h2 = document.createElement("h2");
        h2.className = "slide-subtitle";
        h2.innerHTML = slide.subtitle;
        header.appendChild(h2);
      }

      if (slide.meta && Array.isArray(slide.meta)) {
        const metaDiv = document.createElement("div");
        metaDiv.className = "slide-meta";
        const ul = document.createElement("ul");
        slide.meta.forEach(m => {
          const li = document.createElement("li");
          li.innerHTML = m;
          ul.appendChild(li);
        });
        metaDiv.appendChild(ul);
        header.appendChild(metaDiv);
      }
    } else {
      const h = document.createElement("h2");
      h.className = "slide-title";
      h.innerHTML = slide.title || "";
      header.appendChild(h);

      if (slide.subtitle) {
        const sub = document.createElement("p");
        sub.className = "slide-subtitle";
        sub.innerHTML = slide.subtitle;
        header.appendChild(sub);
      }
    }

    container.appendChild(header);

    const body = document.createElement("div");
    body.className = "slide-body";

    if (slide.big) {
      const big = document.createElement("div");
      big.className = "slide-big";
      big.innerHTML = slide.big;
      body.appendChild(big);
    }

    if (slide.kind === "text" && slide.body) {
      const div = document.createElement("div");
      div.className = "slide-body-text";

      slide.body.split("\n").forEach(line => {
        if (line.trim().length > 0) {
          const p = document.createElement("p");
          p.innerHTML = line;
          div.appendChild(p);
        }
      });

      body.appendChild(div);
    }

    if (
      slide.bullets &&
      Array.isArray(slide.bullets) &&
      slide.show_bullets !== false
    ) {
      const ul = document.createElement("ul");
      slide.bullets.forEach(b => {
        const li = document.createElement("li");
        li.innerHTML = b;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (slide.fig) {
      const figDiv = document.createElement("div");
      figDiv.className = "slide-figure";
      const img = document.createElement("img");
      img.src = slide.fig;
      img.alt = slide.fig_caption || "";
      figDiv.appendChild(img);
      if (slide.fig_caption) {
        const cap = document.createElement("div");
        cap.className = "slide-figure-caption";
        cap.innerHTML = slide.fig_caption;
        figDiv.appendChild(cap);
      }
      body.appendChild(figDiv);
    }

    if (slide.iframe_url) {
      const wrap = document.createElement("div");
      wrap.className = "slide-iframe-wrapper";

      const iframe = document.createElement("iframe");
      iframe.className = "slide-iframe-frame";
      iframe.src = slide.iframe_url;
      wrap.appendChild(iframe);

      const toolbar = document.createElement("div");
      toolbar.className = "slide-iframe-toolbar";

      let zoom = 1.0;

      function applyZoom() {
        iframe.style.transform = "scale(" + zoom + ")";
        iframe.style.height = (480 / zoom) + "px";
      }

      const btnZoomOut = document.createElement("button");
      btnZoomOut.className = "slide-iframe-btn";
      btnZoomOut.textContent = "Zoom –";
      btnZoomOut.addEventListener("click", () => {
        zoom = Math.max(zoom - 0.1, 0.5);
        applyZoom();
      });

      const btnZoomIn = document.createElement("button");
      btnZoomIn.className = "slide-iframe-btn";
      btnZoomIn.textContent = "Zoom +";
      btnZoomIn.addEventListener("click", () => {
        zoom = Math.min(zoom + 0.1, 2.0);
        applyZoom();
      });

      const btnFull = document.createElement("button");
      btnFull.className = "slide-iframe-btn";
      btnFull.textContent = "Fullscreen";
      btnFull.addEventListener("click", () => {
        if (wrap.requestFullscreen) {
          wrap.requestFullscreen().catch(() => {});
        } else if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      });

      toolbar.appendChild(btnZoomOut);
      toolbar.appendChild(btnZoomIn);
      toolbar.appendChild(btnFull);

      body.appendChild(wrap);
      body.appendChild(toolbar);

      applyZoom();
    }

    container.appendChild(body);

    if (slide.note || slide.note_magenta) {
      const foot = document.createElement("div");
      foot.className = "slide-footnote";
      if (slide.note) foot.innerHTML = slide.note;
      if (slide.note_magenta) {
        const span = document.createElement("span");
        span.className = "slide-footnote-magenta";
        span.innerHTML = slide.note_magenta;
        if (foot.innerHTML) foot.innerHTML += " ";
        foot.appendChild(span);
      }
      container.appendChild(foot);
    }

    attachNotesUI(container, deckName, slideIndex, slide);
    attachSelectionToSlide(container);

    const imgKey = deckName + "_" + slideIndex;
    if (clipboardImages[imgKey]) {
      container.__clipboardImage = clipboardImages[imgKey];
    }

    return container;
  }

  // --------------------------------------------------------
  // MathJax + slide nav bar
  // --------------------------------------------------------

  function enableMathJaxTypeset() {
    if (window.MathJax && window.MathJax.typesetPromise) {
      const nodes = Array.from(
        document.querySelectorAll(".slide-header, .slide-body, .slide-footnote")
      );
      window.MathJax.typesetPromise(nodes).catch(() => {});
    }
  }

  function buildNav(slides, currentIndex, gotoFn) {
    if (!navBar) return;

    navBar.innerHTML = "";

    const brush = ensureNavBrush();
    if (brush) {
      navBar.appendChild(brush);
    }

    slides.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "slides-nav-item" + (i === currentIndex ? " active" : "");
      btn.textContent = i + 1;
      btn.addEventListener("click", () => gotoFn(i));
      navBar.appendChild(btn);
    });

    requestAnimationFrame(updateBrushPosition);
  }

  // --------------------------------------------------------
  // Init
  // --------------------------------------------------------

  async function init() {
    renderLoading("Loading slides…");

    const deckName = getDeckName();
    const url = "decks/" + deckName + ".yaml";

    let yamlText;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      yamlText = await resp.text();
    } catch (err) {
      console.error(err);
      renderError("Could not load deck: " + url);
      return;
    }

    let data;
    try {
      data = jsyaml.load(yamlText);
    } catch (err) {
      console.error("YAML parse error:", err);
      renderError("Error parsing YAML in " + url);
      return;
    }

    if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
      renderError("No slides found in " + url);
      return;
    }

    const slides = data.slides;
    let index = 0;

    function gotoIndex(i) {
      index = i;
      renderCurrent();
    }

    function renderCurrent() {
      const slide = slides[index];
      const el = createSlideElement(slide, deckName, index);
      root.innerHTML = "";
      root.appendChild(el);
      currentSlideElement = el;
      buildNav(slides, index, gotoIndex);
      enableMathJaxTypeset();
    }

    function next() {
      if (index < slides.length - 1) {
        index++;
        renderCurrent();
      }
    }

    function prev() {
      if (index > 0) {
        index--;
        renderCurrent();
      }
    }

    function reset() {
      index = 0;
      renderCurrent();
    }

    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && (e.key === "n" || e.key === "N")) {
        if (currentSlideElement &&
            typeof currentSlideElement.__toggleNotes === "function") {
          e.preventDefault();
          currentSlideElement.__toggleNotes();
        }
        return;
      }

      const ae = document.activeElement;
      const isTyping =
        ae &&
        (ae.tagName === "TEXTAREA" ||
         ae.tagName === "INPUT" ||
         ae.isContentEditable);

      if (isTyping) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Escape":
          e.preventDefault();
          reset();
          break;
        case "f":
        case "F":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    });

    window.addEventListener("resize", updateBrushPosition);

    renderCurrent();
  }

  init();
})();