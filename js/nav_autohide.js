// nav_autohide.js
// Hide/show the PROJECTS header (pill bar) on scroll,
// with a delay: only after 150px scroll depth.
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

  // Scroll depth threshold (in px) before auto-hide kicks in
  const THRESHOLD = 150;

  function update() {
    const currentY = window.scrollY;
    const scrollingDown = currentY > lastScrollY;

    // HIDE: only when scrolling down AND below threshold
    if (scrollingDown && currentY > THRESHOLD && !isHidden) {
      header.classList.add("site-header-hidden");
      isHidden = true;
    }
    // SHOW: when scrolling up OR back near the top
    else if ((!scrollingDown || currentY <= THRESHOLD) && isHidden) {
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