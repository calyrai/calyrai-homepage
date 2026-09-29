/**
 * calyr.aí — main.js
 * Handles:
 *  - Cloudflare Stream video loading (signed tokens fetched from /api/video/:id)
 *  - Protected R2 downloads (fetched from /api/download/:key)
 */

/* ── Stream Video Player ──────────────────────────────────── */

/**
 * Initialise all <div data-stream-id="..."> containers.
 * Fetches a signed token per video, then injects the iframe.
 */
async function initStreamVideos() {
  const containers = document.querySelectorAll("[data-stream-id]");
  for (const container of containers) {
    const videoId = container.dataset.streamId;
    if (!videoId || videoId === "PENDING") continue;

    try {
      const res = await fetch(`/api/video/${encodeURIComponent(videoId)}`);
      if (!res.ok) {
        container.innerHTML = `<p class="video-error">Video nicht verfügbar (${res.status}).</p>`;
        continue;
      }
      const { embedUrl } = await res.json();
      container.innerHTML = `
        <iframe
          src="${embedUrl}"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowfullscreen
          loading="lazy"
          title="${container.dataset.title ?? "Video"}"
        ></iframe>`;
    } catch (err) {
      console.error("Stream init error:", err);
      container.innerHTML = `<p class="video-error">Video konnte nicht geladen werden.</p>`;
    }
  }
}

/* ── Protected Downloads ──────────────────────────────────── */

/**
 * Initiates an authenticated download for a file in the private R2 bucket.
 * Usage in HTML:
 *   <button onclick="downloadFile('reports/2026-q1.pdf', 'Q1 Report 2026.pdf')">
 *
 * @param {string} fileKey   - R2 object key (e.g. "reports/2026-q1.pdf")
 * @param {string} [label]   - Optional display label for the download
 */
async function downloadFile(fileKey, label) {
  const key = encodeURIComponent(fileKey);
  try {
    const res = await fetch(`/api/download/${key}`);
    if (res.status === 401) {
      alert("Bitte melden Sie sich an, um diese Datei herunterzuladen.");
      return;
    }
    if (!res.ok) {
      alert(`Download fehlgeschlagen (${res.status}).`);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = label ?? fileKey.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    console.error("Download error:", err);
    alert("Netzwerkfehler beim Download.");
  }
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initStreamVideos();
});

// Expose for inline onclick usage in protected pages
window.downloadFile = downloadFile;
