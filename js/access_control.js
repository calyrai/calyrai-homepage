(function () {
  'use strict';

  var LOGIN_URL = 'http://localhost:8000';
  var SESSION_KEY = 'citizen_session';
  var USER_KEY = 'citizen_user';

  function bootstrapSessionFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      var token = params.get('token');
      if (!token) return;

      var user = params.get('user') || localStorage.getItem(USER_KEY) || 'Researcher';
      localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, userName: user }));
      localStorage.setItem(USER_KEY, user);

      // Remove auth callback params from URL after persisting session.
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (_err) {
      // Keep page usable even if URL parsing/storage fails.
    }
  }

  function isAuthenticated() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      return !!(parsed && parsed.authenticated);
    } catch (_err) {
      return false;
    }
  }

  function redirectToLogin() {
    var next = encodeURIComponent(window.location.pathname);
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
    bootstrapSessionFromQuery();

    var authed = isAuthenticated();
    var requiresAuth = document.body && document.body.getAttribute('data-requires-auth') === 'true';

    if (requiresAuth && !authed) {
      redirectToLogin();
      return;
    }

    if (!authed) {
      hidePrivateLinks();
    }
  });
})();
