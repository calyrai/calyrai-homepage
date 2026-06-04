// js/analytics.js
(function () {
  // ---- CONFIG ----
  const ENDPOINT = "/api/track"; // you must implement this on your server
  const SITE_ID = "calyr-ai";

  // ---- Helpers ----
  function getOrCreateVisitorId() {
    const key = "calyr_vid";
    let vid = localStorage.getItem(key);
    if (!vid) {
      vid = (crypto?.randomUUID?.() || ("vid_" + Math.random().toString(16).slice(2) + Date.now()));
      localStorage.setItem(key, vid);
    }
    return vid;
  }

  function getSessionId() {
    const key = "calyr_sid";
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = (crypto?.randomUUID?.() || ("sid_" + Math.random().toString(16).slice(2) + Date.now()));
      sessionStorage.setItem(key, sid);
    }
    return sid;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function send(eventType, data) {
    const payload = {
      siteId: SITE_ID,
      eventType,
      ts: nowISO(),
      visitorId: getOrCreateVisitorId(),
      sessionId: getSessionId(),
      url: location.href,
      path: location.pathname,
      referrer: document.referrer || null,
      // keep it privacy-friendly: do NOT send raw IP/user-agent handling here
      ...data,
    };

    const body = JSON.stringify(payload);

    // sendBeacon is best for navigation/unload
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
      return;
    }

    // fallback
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }

  // ---- Track page view ----
  send("pageview", {});

  // ---- Track link clicks (so you know where they went next) ----
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;

      // only track same-origin links (avoid logging external)
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let targetUrl;
      try {
        targetUrl = new URL(href, location.href);
      } catch {
        return;
      }
      if (targetUrl.origin !== location.origin) return;

      send("click", {
        to: targetUrl.pathname + targetUrl.search + targetUrl.hash,
        linkText: (a.textContent || "").trim().slice(0, 120) || null,
      });
    },
    { capture: true }
  );

  // Optional: track SPA-like back/forward changes if you ever add history pushes
  window.addEventListener("popstate", () => send("pageview", { via: "popstate" }));
})();