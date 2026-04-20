// nav_autohide.js
// Shared header behavior:
// - keep mobile header offset in sync with wrapped pill rows
// - hide on scroll down / show on scroll up on supported pages

(function () {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const navInner = header ? header.querySelector(".nav-inner") : null;

  if (!header || !navInner) return;

  const mobileQuery = window.matchMedia("(max-width: 760px)");

  let lastScrollY = window.scrollY;
  let ticking = false;
  let isHidden = false;

  function getThreshold() {
    return body.classList.contains("explore-page") ? 72 : 80;
  }

  function getShowDelta() {
    return body.classList.contains("explore-page") ? 8 : 6;
  }

  function isMobile() {
    return mobileQuery.matches;
  }

  function setHeaderOffset() {
    if (isMobile()) {
      document.documentElement.style.setProperty("--mobile-header-offset", header.offsetHeight + "px");
    } else {
      document.documentElement.style.removeProperty("--mobile-header-offset");
    }
  }

  function syncMenuMode() {
    setHeaderOffset();
  }

  function update() {
    if (!isMobile()) {
      ticking = false;
      return;
    }

    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const scrollingDown = delta > 0;
    const scrollingUpEnough = delta < -getShowDelta();

    // HIDE: only when scrolling down and sufficiently below the top.
    if (scrollingDown && currentY > getThreshold() && !isHidden) {
      header.classList.add("site-header-hidden");
      isHidden = true;
    }
    // SHOW: quickly when scrolling back up, or whenever we are near the top.
    else if ((scrollingUpEnough || currentY <= getThreshold()) && isHidden) {
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

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncMenuMode);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(syncMenuMode);
  }

  window.addEventListener("resize", setHeaderOffset, { passive: true });
  syncMenuMode();
})();