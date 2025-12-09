// nav_autohide.js
// Hide/show the PROJECTS header (pill bar) on scroll.
// HOME PAGE remains unaffected.

(function () {
  const body = document.body;

  // Only activate on the Projects page
  if (!body.classList.contains("projects-page")) return;

  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  let isHidden = false;

  function update() {
    const currentY = window.scrollY;
    const scrollingDown = currentY > lastScrollY;

    // Hide on downward scroll
    if (scrollingDown && currentY > 120 && !isHidden) {
      header.classList.add("site-header-hidden");
      isHidden = true;
    }
    // Show on upward scroll or near top
    else if ((!scrollingDown || currentY <= 120) && isHidden) {
      header.classList.remove("site-header-hidden");
      isHidden = false;
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });
})();