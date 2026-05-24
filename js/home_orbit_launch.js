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
      { x: '-125vw', y: '0px', spinSign: -1 },
      { x: '125vw', y: '0px', spinSign: 1 },
      { x: '0px', y: '-120vh', spinSign: -1 },
      { x: '0px', y: '120vh', spinSign: 1 }
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
        ringA.style.transition = 'transform 190ms cubic-bezier(0.16, 0.96, 0.22, 1)';
        ringA.style.transform = 'rotate(' + (lockDeg + 96) + 'deg)';
      }
      if (ringB) {
        ringB.style.transition = 'transform 190ms cubic-bezier(0.16, 0.96, 0.22, 1)';
        ringB.style.transform = 'rotate(' + (lockDeg + 96) + 'deg)';
      }
      if (ringC) {
        ringC.style.transition = 'transform 190ms cubic-bezier(0.16, 0.96, 0.22, 1)';
        ringC.style.transform = 'rotate(' + (lockDeg + 96) + 'deg)';
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
      }, 160);

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
      }, 560);

      // Roll only after the pointer has fully rotated and locked in place.
      window.setTimeout(function () {
        var vector = chooseRollVector();
        // Pointer-driven coupling: the locked pointer angle drives full-structure rollout rotation.
        var pointerDriveDeg = lockDeg <= 180 ? lockDeg : lockDeg - 360;
        var finalRot = pointerDriveDeg * 3.6;
        finalRot = Math.max(-760, Math.min(760, finalRot));
        if (Math.abs(finalRot) < 300) {
          finalRot = finalRot < 0 ? -300 : 300;
        }
        var midRot = finalRot * 0.44;
        orbit.style.willChange = 'transform, opacity';
        orbit.style.transition = 'none';
        orbit.animate(
          [
            { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 },
            {
              transform: 'translate3d(0, 0, 0) rotate(' + midRot + 'deg)',
              opacity: 0.84,
              offset: 0.42
            },
            {
              transform: 'translate(' + (vector.x === '0px' ? '0px' : (vector.x.indexOf('-') === 0 ? '-30vw' : '30vw')) + ', ' + (vector.y === '0px' ? '0px' : (vector.y.indexOf('-') === 0 ? '-24vh' : '24vh')) + ') rotate(' + (midRot + (finalRot - midRot) * 0.26) + 'deg)',
              opacity: 0.7,
              offset: 0.66
            },
            {
              transform: 'translate(' + vector.x + ', ' + vector.y + ') rotate(' + finalRot + 'deg)',
              opacity: 0
            }
          ],
          {
            duration: 2800,
            easing: 'cubic-bezier(0.2, 0.86, 0.2, 1)',
            fill: 'forwards'
          }
        );
      }, 760);

      window.setTimeout(function () {
        try {
          window.sessionStorage.setItem('calyrPageBlend', '1');
        } catch (_err) {
          // Ignore storage failures; navigation should still proceed.
        }
        window.location.href = targetUrl;
      }, 1980);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
