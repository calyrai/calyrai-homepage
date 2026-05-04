/* Calyr.Vox Gate - login-protected wrapper */

(function () {
  const LOGIN_URL = "http://localhost:8000";
  const SESSION_KEY = "citizen_session";
  const USER_KEY = "citizen_user";

  const authGate = document.getElementById("auth-gate");
  const mainPanel = document.getElementById("vox-main");
  const logoutBtn = document.getElementById("logout-btn");
  const userNameEl = document.getElementById("vox-user-name");
  const loginBtn = document.getElementById("vox-login-btn");

  let userName = "Researcher";

  function hasSession() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token) {
      userName = user || localStorage.getItem(USER_KEY) || userName;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, userName }));
      localStorage.setItem(USER_KEY, userName);
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }

    if (window.location.search.includes("demo")) {
      userName = "Demo Researcher";
      localStorage.setItem(SESSION_KEY, JSON.stringify({ authenticated: true, userName, demo: true }));
      localStorage.setItem(USER_KEY, userName);
      return true;
    }

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.authenticated) {
        userName = localStorage.getItem(USER_KEY) || parsed.userName || userName;
        return true;
      }
    } catch (_) {
      return false;
    }

    return false;
  }

  function showMain() {
    authGate.style.display = "none";
    mainPanel.style.display = "block";
    logoutBtn.style.display = "inline-block";
    userNameEl.textContent = userName;
  }

  function showGate() {
    authGate.style.display = "flex";
    mainPanel.style.display = "none";
    logoutBtn.style.display = "none";
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    showGate();
  }

  function initLoginLink() {
    // Keep return URL explicit for future backend support.
    const next = encodeURIComponent("/vox.html");
    loginBtn.href = `${LOGIN_URL}?next=${next}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoginLink();
    logoutBtn.addEventListener("click", logout);

    if (hasSession()) {
      showMain();
    } else {
      showGate();
    }
  });
})();
