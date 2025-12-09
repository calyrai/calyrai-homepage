// ============================================
// 1) Header hide/show on scroll
// ============================================
(function () {
  let lastY = window.scrollY;
  let ticking = false;

  const header = document.querySelector(".site-header");
  const subnav = document.querySelector(".site-subnav");

  if (!header) return; // safety

  function update() {
    const currentY = window.scrollY;

    if (currentY > lastY + 10) {
      // scroll down -> hide
      header.classList.add("nav-hidden");
      if (subnav) subnav.classList.add("subnav-hidden");
    } else if (currentY < lastY - 10) {
      // scroll up -> show
      header.classList.remove("nav-hidden");
      if (subnav) subnav.classList.remove("subnav-hidden");
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });
})();

// ============================================
// 2) Tap-to-collapse ONLY hero-content
// ============================================
(function () {
  "use strict";

  function setupHeroTapCollapse() {
    const hero = document.querySelector(".hero");
    const content = document.querySelector(".hero-content");
    if (!hero || !content) return;

    hero.addEventListener("click", () => {
      content.classList.toggle("collapsed");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroTapCollapse);
  } else {
    setupHeroTapCollapse();
  }
})();