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

/* Mobile auto-hide for top hero */
(function () {
  "use strict";

  function setupHeroHideOnScroll() {
    var hero =
      document.querySelector(".home-hero") ||
      document.querySelector(".hero") ||
      document.querySelector(".intro-block") ||
      document.querySelector(".intro") ||
      document.querySelector(".hero-section");

    if (!hero) return;

    hero.classList.add("hero-hide-on-scroll");

    var lastHidden = false;

    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      var hide = y > 80;

      if (hide !== lastHidden) {
        hero.classList.toggle("hero-hide-on-scroll--hidden", hide);
        lastHidden = hide;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroHideOnScroll);
  } else {
    setupHeroHideOnScroll();
  }
})();
