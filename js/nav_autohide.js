// nav_autohide.js
// Hide/show the site header on supported pages while scrolling.
// Home remains unaffected unless a page explicitly opts in via body class.

(function () {
  const body = document.body;

  const isProjectsPage = body.classList.contains("projects-page");
  const isExplorePage = body.classList.contains("explore-page");

  if (!isProjectsPage && !isExplorePage) return;

  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  let isHidden = false;

  const THRESHOLD = isExplorePage ? 72 : 150;
  const SHOW_DELTA = isExplorePage ? 8 : 0;

  function update() {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const scrollingDown = delta > 0;
    const scrollingUpEnough = delta < -SHOW_DELTA;

    // HIDE: only when scrolling down and sufficiently below the top.
    if (scrollingDown && currentY > THRESHOLD && !isHidden) {
      header.classList.add("site-header-hidden");
      isHidden = true;
    }
    // SHOW: quickly when scrolling back up, or whenever we are near the top.
    else if ((scrollingUpEnough || currentY <= THRESHOLD) && isHidden) {
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
  }, { passive: true });
})();