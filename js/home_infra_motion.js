(function () {
  'use strict';

  function revealImmediately(items) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal-item'));
    if (!items.length) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealImmediately(items);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      revealImmediately(items);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(function (item, idx) {
      item.style.transitionDelay = Math.min(idx % 6, 4) * 60 + 'ms';
      observer.observe(item);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
