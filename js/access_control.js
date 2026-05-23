(function () {
  'use strict';

  var API_BASE = 'http://localhost:8000';

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

  document.addEventListener('DOMContentLoaded', function () {
    fetchSession().then(function (session) {
      var authed = !!(session && session.authenticated);
      if (document.body) {
        document.body.setAttribute('data-authenticated', authed ? 'true' : 'false');
      }
    });
  });
})();
