(function () {
  'use strict';

  function freezeTransform(el) {
    if (!el) return;
    var computed = window.getComputedStyle(el).transform;
    el.style.animation = 'none';
    el.style.transform = computed && computed !== 'none' ? computed : 'rotate(0deg)';
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function chooseRollVector() {
    var options = [
      { x: '-125vw', y: '0px', rot: '-420deg' },
      { x: '125vw', y: '0px', rot: '420deg' },
      { x: '0px', y: '-120vh', rot: '-420deg' },
      { x: '0px', y: '120vh', rot: '420deg' }
    ];
    return options[randomInt(options.length)];
  }

  function init() {
    var cta = document.querySelector('.hero-cta--orbit');
    var orbit = document.getElementById('orbit-logo-home');

    if (!cta || !orbit) return;

    var ringA = orbit.querySelector('.orbit-logo__ring');
    var ringB = orbit.querySelector('.orbit-logo__ring-b');
    var ringC = orbit.querySelector('.orbit-logo__ring-c');
    var accent = orbit.querySelector('.orbit-logo__accent');
    var running = false;

    cta.addEventListener('click', function (event) {
      if (running) return;

      event.preventDefault();
      running = true;

      var targetUrl = cta.getAttribute('href') || 'explore.html';
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Immediate page overblend (no white flash) so transition starts right away.
      var fadeLayer = document.createElement('div');
      fadeLayer.setAttribute('aria-hidden', 'true');
      fadeLayer.style.position = 'fixed';
      fadeLayer.style.inset = '0';
      fadeLayer.style.background = 'radial-gradient(circle at top, rgba(6, 9, 26, 0.74) 0%, rgba(2, 3, 10, 0.96) 100%)';
      fadeLayer.style.opacity = '0';
      fadeLayer.style.pointerEvents = 'none';
      fadeLayer.style.zIndex = '9999';
      fadeLayer.style.backdropFilter = 'blur(1.5px)';
      fadeLayer.style.transition = 'opacity 900ms cubic-bezier(0.2, 0.66, 0.2, 1)';
      document.body.appendChild(fadeLayer);
      requestAnimationFrame(function () {
        fadeLayer.style.opacity = '1';
      });

      if (reduced) {
        window.location.href = targetUrl;
        return;
      }

      // Choose one random lock angle and align all arc openings to exactly that degree.
      var lockDeg = randomInt(360);

      freezeTransform(ringA);
      freezeTransform(ringB);
      freezeTransform(ringC);
      freezeTransform(accent);

      cta.style.pointerEvents = 'none';
      cta.style.opacity = '0.9';

      // Force style flush so transform transitions start from the frozen matrix.
      void orbit.offsetHeight;

      if (ringA) {
        ringA.style.transition = 'transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1)';
        ringA.style.transform = 'rotate(' + (lockDeg + 3) + 'deg)';
      }
      if (ringB) {
        ringB.style.transition = 'transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1)';
        ringB.style.transform = 'rotate(' + (lockDeg + 3) + 'deg)';
      }
      if (ringC) {
        ringC.style.transition = 'transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1)';
        ringC.style.transform = 'rotate(' + (lockDeg + 3) + 'deg)';
      }

      // Final snap-in (einrasten) to exact lock angle.
      window.setTimeout(function () {
        if (ringA) {
          ringA.style.transition = 'transform 760ms cubic-bezier(0.18, 0.7, 0.24, 1)';
          ringA.style.transform = 'rotate(' + lockDeg + 'deg)';
        }
        if (ringB) {
          ringB.style.transition = 'transform 760ms cubic-bezier(0.18, 0.7, 0.24, 1)';
          ringB.style.transform = 'rotate(' + lockDeg + 'deg)';
        }
        if (ringC) {
          ringC.style.transition = 'transform 760ms cubic-bezier(0.18, 0.7, 0.24, 1)';
          ringC.style.transform = 'rotate(' + lockDeg + 'deg)';
        }
      }, 240);

      // Then let the zeiger move into the exact same lock angle.
      window.setTimeout(function () {
        if (!accent) return;
        accent.style.transition = 'transform 1400ms cubic-bezier(0.22, 0.66, 0.2, 1)';
        accent.style.transform = 'rotate(' + (lockDeg + 4) + 'deg)';
      }, 280);

      window.setTimeout(function () {
        if (!accent) return;
        accent.style.transition = 'transform 760ms cubic-bezier(0.18, 0.72, 0.24, 1)';
        accent.style.transform = 'rotate(' + lockDeg + 'deg)';
      }, 640);

      // Roll only the logo out of the viewport (keep surrounding text untouched).
      window.setTimeout(function () {
        var vector = chooseRollVector();
        orbit.style.willChange = 'transform, opacity';
        orbit.style.transition = 'none';
        orbit.animate(
          [
            { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 },
            {
              transform: 'translate(' + (vector.x === '0px' ? '0px' : (vector.x.indexOf('-') === 0 ? '-34vw' : '34vw')) + ', ' + (vector.y === '0px' ? '0px' : (vector.y.indexOf('-') === 0 ? '-28vh' : '28vh')) + ') rotate(' + (vector.rot.indexOf('-') === 0 ? '-70deg' : '70deg') + ')',
              transform: 'translate(' + (vector.x === '0px' ? '0px' : (vector.x.indexOf('-') === 0 ? '-42vw' : '42vw')) + ', ' + (vector.y === '0px' ? '0px' : (vector.y.indexOf('-') === 0 ? '-34vh' : '34vh')) + ') rotate(' + (vector.rot.indexOf('-') === 0 ? '-120deg' : '120deg') + ')',
              opacity: 0.7,
              offset: 0.22
            },
            {
              transform: 'translate(' + vector.x + ', ' + vector.y + ') rotate(' + vector.rot + ')',
              opacity: 0
            }
          ],
          {
            duration: 2400,
            easing: 'cubic-bezier(0.2, 0.86, 0.2, 1)',
            fill: 'forwards'
          }
        );
      }, 220);

      window.setTimeout(function () {
        try {
          window.sessionStorage.setItem('calyrPageBlend', '1');
        } catch (_err) {
          // Ignore storage failures; navigation should still proceed.
        }
        window.location.href = targetUrl;
      }, 620);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
