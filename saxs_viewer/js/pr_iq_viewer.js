// js/pr_iq_viewer.js
import { initPRIQViewer } from "./pr/main.js";

function boot() {
  try {
    initPRIQViewer();
  } catch (e) {
    console.error("initPRIQViewer crashed:", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}