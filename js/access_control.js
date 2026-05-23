(function () {
  'use strict';

  var API_BASE = 'http://localhost:8000';
  var LOGIN_URL = API_BASE + '/login';

  function fetchSession() {
    return fetch(API_BASE + '/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (!res.ok) {
        return { authenticated: false };
      }
      return res.json();
    }).catch(function () {
      return { authenticated: false };
    });
  }

  function redirectToLogin() {
    var next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = LOGIN_URL + '?next=' + next;
  }

  function hidePrivateLinks() {
    var privateLinks = document.querySelectorAll('[data-private-link]');
    privateLinks.forEach(function (el) {
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('tabindex', '-1');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var requiresAuth = document.body && document.body.getAttribute('data-requires-auth') === 'true';

    fetchSession().then(function (session) {
      var authed = !!(session && session.authenticated);
      if (requiresAuth && !authed) {
        redirectToLogin();
        return;
      }
      if (!authed) {
        hidePrivateLinks();
      }
    });
  });
})();
