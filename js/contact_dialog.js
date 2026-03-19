(function () {
  "use strict";

  const DEFAULT_EMAIL = "rupert.tscheliessnig@calyr.ai";
  const DEFAULT_MAILTO = `mailto:${DEFAULT_EMAIL}?subject=Contact&body=`;

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function isString(x) {
    return typeof x === "string" || x instanceof String;
  }

  function normalizeText(s) {
    return String(s || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function setEmail(emailEl, email) {
    const next = String(email || "").trim() || DEFAULT_EMAIL;
    emailEl.textContent = next;
    emailEl.setAttribute("href", `mailto:${next}?subject=Contact&body=`);
  }

  async function maybeLoadContactYaml() {
    try {
      if (typeof window.fetch !== "function") return null;
      if (typeof window.jsyaml === "undefined") return null;

      const url = new URL("/data/contact.yaml", window.location.origin).toString();
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) return null;

      const text = await resp.text();
      const parsed = window.jsyaml.load(text) || {};
      const contact = parsed && parsed.contact ? parsed.contact : parsed;

      const email = isString(contact?.email) ? String(contact.email).trim() : "";
      return { email };
    } catch {
      return null;
    }
  }

  function openDialog(dialog, view) {
    dialog.classList.toggle("is-email", view === "email");

    // Non-modal: keep site header clickable (escape/navigation on mobile).
    const header = document.querySelector(".site-header");
    if (header && typeof header.getBoundingClientRect === "function") {
      const r = header.getBoundingClientRect();
      const top = Math.max(0, Math.min(window.innerHeight, Math.ceil(r.bottom + 8)));
      dialog.style.setProperty("--contact-dialog-top", top + "px");
    } else {
      dialog.style.setProperty("--contact-dialog-top", "0px");
    }

    if (typeof dialog.show === "function") {
      if (!dialog.open) dialog.show();
    } else {
      dialog.setAttribute("open", "open");
    }
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function classifyTrigger(a) {
    const txt = normalizeText(a.textContent);
    const href = String(a.getAttribute("href") || "");

    if (/\bqr\b/.test(txt) || href.includes("qr_noise")) return "qr";
    if (txt === "mail" || txt === "email") return "email";

    // Treat a nav "Contact" pill (usually mailto) as QR-first.
    if (txt === "contact") return "contact";

    // Some pages use mailto contact pill without text normalization.
    if (href.startsWith("mailto:") && href.includes("subject=Contact")) return "contact";

    return null;
  }

  function init() {
    const dialog = document.getElementById("contact-dialog");
    if (!dialog) return;

    const emailEl = dialog.querySelector("#contact-dialog-email");
    if (emailEl) setEmail(emailEl, DEFAULT_EMAIL);

    // Enhance email from YAML if available.
    maybeLoadContactYaml().then((data) => {
      if (!data) return;
      if (emailEl) setEmail(emailEl, data.email);
    });

    // Close when clicking backdrop.
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) closeDialog(dialog);
    });

    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog(dialog);
    });

    // Swipe handling
    const surface = dialog.querySelector("[data-contact-swipe]") || dialog;
    let startX = 0;
    let startY = 0;
    let active = false;
    let pointerId = null;

    const threshold = 64;

    function onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      try {
        surface.setPointerCapture(pointerId);
      } catch {
        // ignore
      }
    }

    function onUp(e) {
      if (!active) return;
      if (pointerId != null && e.pointerId !== pointerId) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      active = false;
      pointerId = null;

      // Ignore mostly-vertical gestures.
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

      if (dx > threshold) {
        dialog.classList.add("is-email");
      } else if (dx < -threshold) {
        dialog.classList.remove("is-email");
      }
    }

    surface.addEventListener("pointerdown", onDown);
    surface.addEventListener("pointerup", onUp);
    surface.addEventListener("pointercancel", () => {
      active = false;
      pointerId = null;
    });

    // Triggers: intercept Contact/Mail/QR links.
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    for (const a of anchors) {
      if (a.hasAttribute("data-contact-direct-mail")) continue;

      const kind = classifyTrigger(a);
      if (!kind) continue;

      a.addEventListener("click", (e) => {
        // Allow cmd/ctrl-click to open in new tab.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();

        if (kind === "email") {
          openDialog(dialog, "email");
        } else {
          openDialog(dialog, "qr");
        }
      });
    }

    // If the user clicks the email in the dialog, open mail app and close dialog.
    if (emailEl) {
      emailEl.addEventListener("click", () => {
        setTimeout(() => closeDialog(dialog), 50);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
