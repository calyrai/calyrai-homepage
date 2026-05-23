"""
Calyr.Citizen Backend - Job Control & Figure Rendering API
Integrates calyr.eval, calyr.apo, and calyr.okto for real-time job control.
"""

from fastapi import FastAPI, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import uuid
from datetime import datetime
import asyncio
import json
import os
import subprocess
from pathlib import Path
import hmac
import hashlib
import secrets
import base64
import time
import smtplib
from email.message import EmailMessage
from urllib import request as urlrequest
from urllib import error as urlerror

app = FastAPI(title="Calyr.Citizen", version="0.1.0")

SESSION_COOKIE = "calyr_session"
CSRF_COOKIE = "calyr_csrf"
SESSION_TTL_SECONDS = int(os.getenv("CALYR_SESSION_TTL_SECONDS", "43200"))
SESSION_SECRET = os.getenv("CALYR_SESSION_SECRET", "dev-only-change-me")
COOKIE_SECURE = os.getenv("CALYR_COOKIE_SECURE", "false").lower() == "true"
ENABLE_PASSWORD_LOGIN = os.getenv("CALYR_ENABLE_PASSWORD_LOGIN", "false").lower() == "true"
MAGIC_LINK_TTL_SECONDS = int(os.getenv("CALYR_MAGIC_LINK_TTL_SECONDS", "900"))
PUBLIC_BASE_URL = os.getenv("CALYR_PUBLIC_BASE_URL", "http://localhost:8000").rstrip("/")
MAGIC_LINK_DEV_MODE = os.getenv("CALYR_MAGIC_LINK_DEV_MODE", "true").lower() == "true"
MAGIC_EMAIL_FROM = os.getenv("CALYR_MAGIC_EMAIL_FROM", "Calyr Citizen <no-reply@calyr.ai>")
SMTP_HOST = os.getenv("CALYR_SMTP_HOST", "")
SMTP_PORT = int(os.getenv("CALYR_SMTP_PORT", "587"))
SMTP_USER = os.getenv("CALYR_SMTP_USER", "")
SMTP_PASSWORD = os.getenv("CALYR_SMTP_PASSWORD", "")
SMTP_USE_TLS = os.getenv("CALYR_SMTP_USE_TLS", "true").lower() == "true"
ALLOWED_LOGIN_EMAILS = {
    v.strip().lower()
    for v in os.getenv("CALYR_AUTH_ALLOWED_EMAILS", "").split(",")
    if v.strip()
}
REQUIRE_GITHUB_ACCOUNT = os.getenv("CALYR_REQUIRE_GITHUB_ACCOUNT", "true").lower() == "true"
ALLOWED_GITHUB_USERS = {
    v.strip().lower()
    for v in os.getenv("CALYR_AUTH_ALLOWED_GITHUB_USERS", "").split(",")
    if v.strip()
}
ALPHAFOLD_LINK_TOKEN = os.getenv("CALYR_ALPHAFOLD_LINK_TOKEN", "calyr-alpha-private-link")

# Development default user. Override via environment in non-dev setups.
AUTH_USER = os.getenv("CALYR_AUTH_USER", "researcher")
AUTH_PASSWORD = os.getenv("CALYR_AUTH_PASSWORD", "citizen-change-me")
PBKDF2_ITERATIONS = int(os.getenv("CALYR_AUTH_PBKDF2_ITERS", "320000"))

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8123",
    "http://127.0.0.1:8123",
]
ALLOW_ORIGINS = [o.strip() for o in os.getenv("CALYR_ALLOW_ORIGINS", ",".join(DEFAULT_ALLOWED_ORIGINS)).split(",") if o.strip()]

# Enable CORS for homepage integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== MODELS ==========

class SimulationRequest(BaseModel):
    type: str  # saxs, lammps, openfoam, alphafold
    params: Dict = {}
    user: str = "unknown"

class JobResponse(BaseModel):
    job_id: str
    type: str
    status: str
    progress: int = 0
    output_url: Optional[str] = None

class JobStatus(BaseModel):
    id: str
    type: str
    status: str
    progress: int
    created: str

class FigureResponse(BaseModel):
    name: str
    content: str  # SVG content or URL
    job_id: Optional[str] = None

class OktoLoopRequest(BaseModel):
    user: str = "unknown"
    extract_config: Optional[Dict] = None

class MatomicModel(BaseModel):
    id: str
    name: str
    source: str
    path: str
    ext: str


class AgoraSyncRequest(BaseModel):
    strict: bool = False
    check_only: bool = False


class ShellCommandRequest(BaseModel):
    session_id: str
    command: str
    shell: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str
    csrf: str


class MagicLinkRequest(BaseModel):
    email: str
    github_username: Optional[str] = None
    csrf: str
    next: Optional[str] = "/citizen.html"

# ========== IN-MEMORY JOB STORE ==========
jobs_db: Dict[str, Dict] = {}
figures_db: Dict[str, List[FigureResponse]] = {}
shell_sessions_db: Dict[str, Dict[str, str]] = {}
auth_sessions_db: Dict[str, Dict[str, str]] = {}
login_attempts_db: Dict[str, List[float]] = {}
magic_links_db: Dict[str, Dict[str, str]] = {}


def _hash_password(password: str, salt: bytes) -> str:
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return base64.b64encode(derived).decode("ascii")


def _encode_auth_secret(password: str) -> str:
    salt = secrets.token_bytes(16)
    return "{}${}".format(base64.b64encode(salt).decode("ascii"), _hash_password(password, salt))


AUTH_SECRET = _encode_auth_secret(AUTH_PASSWORD)


def _verify_password(password: str, encoded_secret: str) -> bool:
    try:
      salt_b64, expected = encoded_secret.split("$", 1)
      salt = base64.b64decode(salt_b64.encode("ascii"))
      candidate = _hash_password(password, salt)
      return hmac.compare_digest(candidate, expected)
    except Exception:
      return False


def _signed_session(user: str, nonce: str, expiry: int) -> str:
    payload = "{}|{}|{}".format(user, nonce, expiry)
    signature = hmac.new(SESSION_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode((payload + "|" + signature).encode("utf-8")).decode("ascii")


def _verify_signed_session(token: str) -> Optional[Dict[str, str]]:
    try:
        raw = base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8")
        user, nonce, expiry_raw, signature = raw.split("|", 3)
        payload = "{}|{}|{}".format(user, nonce, expiry_raw)
        expected = hmac.new(SESSION_SECRET.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            return None
        expiry = int(expiry_raw)
        now = int(time.time())
        if now >= expiry:
            return None
        return {"user": user, "nonce": nonce, "expiry": expiry}
    except Exception:
        return None


def _purge_expired_sessions() -> None:
    now = int(time.time())
    expired = [sid for sid, meta in auth_sessions_db.items() if int(meta.get("expiry", 0)) <= now]
    for sid in expired:
        auth_sessions_db.pop(sid, None)


def _set_auth_cookies(response: Response, token: str, csrf: str) -> None:
    cookie_kwargs = {
        "httponly": True,
        "secure": COOKIE_SECURE,
        "samesite": "lax",
        "max_age": SESSION_TTL_SECONDS,
        "path": "/",
    }
    response.set_cookie(SESSION_COOKIE, token, **cookie_kwargs)
    response.set_cookie(CSRF_COOKIE, csrf, httponly=False, secure=COOKIE_SECURE, samesite="lax", max_age=SESSION_TTL_SECONDS, path="/")


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")
    response.delete_cookie(CSRF_COOKIE, path="/")


def _is_rate_limited(key: str, limit: int = 5, window_seconds: int = 300) -> bool:
    now = time.time()
    attempts = [ts for ts in login_attempts_db.get(key, []) if now - ts < window_seconds]
    login_attempts_db[key] = attempts
    return len(attempts) >= limit


def _record_failed_attempt(key: str) -> None:
    now = time.time()
    attempts = [ts for ts in login_attempts_db.get(key, []) if now - ts < 300]
    attempts.append(now)
    login_attempts_db[key] = attempts


def _clear_failed_attempts(key: str) -> None:
    login_attempts_db.pop(key, None)


def _get_request_client_key(request: Request, username: str = "") -> str:
    ip = request.client.host if request.client else "unknown"
    return "{}:{}".format(ip, username or "anon")


def _safe_next_path(next_path: str) -> str:
    candidate = (next_path or "").strip()
    if not candidate.startswith("/"):
        return "/citizen.html"
    if candidate.startswith("//"):
        return "/citizen.html"
    return candidate


def _normalize_email(value: str) -> str:
    return (value or "").strip().lower()


def _normalize_github_username(value: str) -> str:
    return (value or "").strip().lower().lstrip("@")


def _valid_email(value: str) -> bool:
    email = _normalize_email(value)
    if not email or "@" not in email:
        return False
    local, _, domain = email.partition("@")
    return bool(local and domain and "." in domain)


def _email_allowed(email: str) -> bool:
    if not ALLOWED_LOGIN_EMAILS:
        return True
    return email in ALLOWED_LOGIN_EMAILS


def _github_user_allowed(username: str) -> bool:
    if not ALLOWED_GITHUB_USERS:
        return True
    return username in ALLOWED_GITHUB_USERS


def _github_user_exists(username: str) -> bool:
    if not username:
        return False
    req = urlrequest.Request(
        "https://api.github.com/users/{}".format(username),
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "Calyr-Citizen-Auth",
        },
    )
    try:
        with urlrequest.urlopen(req, timeout=4) as resp:
            return resp.status == 200
    except urlerror.HTTPError as exc:
        if exc.code in {401, 403, 404}:
            return False
        return False
    except Exception:
        return False


def _hash_magic_token(raw_token: str) -> str:
    return hashlib.sha256((raw_token + SESSION_SECRET).encode("utf-8")).hexdigest()


def _purge_expired_magic_links() -> None:
    now = int(time.time())
    expired = [key for key, meta in magic_links_db.items() if int(meta.get("expiry", 0)) <= now]
    for key in expired:
        magic_links_db.pop(key, None)


def _create_magic_link(email: str, next_path: str) -> str:
    raw = secrets.token_urlsafe(32)
    token_hash = _hash_magic_token(raw)
    expiry = int(time.time()) + MAGIC_LINK_TTL_SECONDS
    magic_links_db[token_hash] = {
        "email": email,
        "next": _safe_next_path(next_path),
        "expiry": str(expiry),
        "created": str(int(time.time())),
    }
    return "{}/auth/magic/consume?token={}".format(PUBLIC_BASE_URL, raw)


def _send_magic_link_email(recipient: str, link: str) -> None:
    friendly = recipient.split("@", 1)[0].replace(".", " ").replace("_", " ").strip() or "researcher"
    subject = "Your secure Calyr sign-in link"
    text = (
        "Hello {},\n\n"
        "Use this one-time sign-in link to access Calyr Citizen:\n{}\n\n"
        "This link expires in {} minutes and can be used once.\n"
        "If you did not request this, you can ignore this email.\n"
    ).format(friendly, link, max(1, MAGIC_LINK_TTL_SECONDS // 60))

    if not SMTP_HOST:
        print("[magic-link] SMTP not configured; generated link for {}: {}".format(recipient, link))
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = MAGIC_EMAIL_FROM
    message["To"] = recipient
    message.set_content(text)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        if SMTP_USER:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(message)


def _csrf_from_header(request: Request) -> str:
    return request.headers.get("x-csrf-token", "")


def _ensure_csrf_cookie(response: Response, request: Request) -> str:
    existing = request.cookies.get(CSRF_COOKIE)
    token = existing or secrets.token_urlsafe(24)
    if not existing:
        response.set_cookie(CSRF_COOKIE, token, httponly=False, secure=COOKIE_SECURE, samesite="lax", max_age=SESSION_TTL_SECONDS, path="/")
    return token


def _authenticate_request(request: Request) -> Dict[str, str]:
    _purge_expired_sessions()
    token = request.cookies.get(SESSION_COOKIE, "")
    verified = _verify_signed_session(token)
    if not verified:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_id = token
    db_session = auth_sessions_db.get(session_id)
    if not db_session:
        raise HTTPException(status_code=401, detail="Session not found")

    if db_session.get("user") != verified["user"]:
        raise HTTPException(status_code=401, detail="Invalid session")

    return {"session_id": session_id, "user": verified["user"]}


def require_auth(request: Request) -> Dict[str, str]:
    auth = _authenticate_request(request)
    if request.method.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
        cookie_csrf = request.cookies.get(CSRF_COOKIE, "")
        header_csrf = _csrf_from_header(request)
        if not cookie_csrf or not header_csrf or not hmac.compare_digest(cookie_csrf, header_csrf):
            raise HTTPException(status_code=403, detail="CSRF validation failed")
    return auth


def _find_workspace_root() -> Path:
    """Best effort workspace root detection from backend script location."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "engines").exists() and (parent / "src").exists():
            return parent
    # Fallback to repo relative parent when running from apps/homepage/backend
    return here.parents[3]


def _scan_matomic_models() -> List[MatomicModel]:
    """Scan known mAtomic model folders and return lightweight model references."""
    root = _find_workspace_root()
    scan_roots = [
        (
            root / "engines" / "metabolic" / "models" / "agora2",
            "AGORA2",
            {".xml", ".sbml"},
        ),
        (
            root / "engines" / "metabolic" / "models",
            "engines/metabolic/models",
            {".xml", ".sbml", ".json", ".yaml", ".yml", ".csv", ".txt"},
        ),
        (
            root / "experiments" / "metabolic_cases",
            "experiments/metabolic_cases",
            {".xml", ".sbml", ".json", ".yaml", ".yml", ".csv", ".txt"},
        ),
        (
            root / "src" / "calyr" / "matomic",
            "src/calyr/matomic",
            {".py"},
        ),
    ]

    found: List[MatomicModel] = []
    seen: set[str] = set()

    for folder, source_label, allowed_ext in scan_roots:
        if not folder.exists():
            continue
        for path in folder.rglob("*"):
            if not path.is_file():
                continue
            rel_path = path.relative_to(folder)
            if any(part.startswith(".") or part in {"__pycache__", "trash", ".trash"} for part in rel_path.parts):
                continue
            if path.suffix.lower() not in allowed_ext:
                continue
            rel = str(path.relative_to(root))
            model_id = rel.replace("/", "__")
            if model_id in seen:
                continue
            seen.add(model_id)
            found.append(
                MatomicModel(
                    id=model_id,
                    name=path.stem,
                    source=source_label,
                    path=rel,
                    ext=path.suffix.lower(),
                )
            )

    found.sort(key=lambda m: (m.source, m.name.lower()))
    return found


def _agora_paths() -> tuple[Path, Path, Path]:
    root = _find_workspace_root()
    script = root / "scripts" / "download_agora2_models.sh"
    dest_dir = root / "engines" / "metabolic" / "models" / "agora2"
    manifest = dest_dir / "model_manifest.txt"
    return script, dest_dir, manifest


def _resolve_shell(shell_name: Optional[str] = None) -> str:
    candidates = []
    if shell_name:
        normalized = shell_name.strip().lower().replace("/bin/", "")
        if normalized == "zsh":
            candidates.append("/bin/zsh")
        elif normalized == "bash":
            candidates.append("/bin/bash")
        elif normalized == "sh":
            candidates.append("/bin/sh")
    candidates.extend(["/bin/zsh", "/bin/bash", "/bin/sh"])
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    return "/bin/sh"


def _shell_session(session_id: str, shell_name: Optional[str] = None) -> Dict[str, str]:
    session = shell_sessions_db.setdefault(
        session_id,
        {
            "cwd": str(_find_workspace_root()),
            "shell": _resolve_shell(shell_name),
        },
    )
    if shell_name:
        session["shell"] = _resolve_shell(shell_name)
    return session


def _resolve_cwd(current_cwd: str, target: str) -> Path:
    raw_target = target.strip() or "~"
    candidate = Path(raw_target).expanduser()
    if not candidate.is_absolute():
        candidate = Path(current_cwd) / candidate
    candidate = candidate.resolve()
    if not candidate.exists() or not candidate.is_dir():
        raise HTTPException(status_code=400, detail=f"Directory not found: {raw_target}")
    return candidate


def _read_agora_manifest(manifest: Path) -> List[str]:
    if not manifest.exists():
        return []
    entries: List[str] = []
    for raw in manifest.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        entries.append(line)
    return entries

# ========== ENDPOINTS ==========

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/auth/csrf")
async def get_csrf(request: Request, response: Response):
        token = _ensure_csrf_cookie(response, request)
        return {"csrf": token}


@app.get("/auth/session")
async def auth_session(request: Request, response: Response):
        token = request.cookies.get(SESSION_COOKIE, "")
        verified = _verify_signed_session(token)
        if not verified:
                _clear_auth_cookies(response)
                csrf = _ensure_csrf_cookie(response, request)
                return {"authenticated": False, "user": None, "csrf": csrf}

        db_session = auth_sessions_db.get(token)
        if not db_session:
                _clear_auth_cookies(response)
                csrf = _ensure_csrf_cookie(response, request)
                return {"authenticated": False, "user": None, "csrf": csrf}

        csrf = _ensure_csrf_cookie(response, request)
        return {"authenticated": True, "user": verified["user"], "csrf": csrf}


@app.post("/auth/login")
async def auth_login(payload: LoginRequest, request: Request, response: Response):
    if not ENABLE_PASSWORD_LOGIN:
        raise HTTPException(status_code=404, detail="Password login disabled")

        cookie_csrf = request.cookies.get(CSRF_COOKIE, "")
        if not cookie_csrf or not hmac.compare_digest(cookie_csrf, payload.csrf):
                raise HTTPException(status_code=403, detail="CSRF validation failed")

        client_key = _get_request_client_key(request, payload.username)
        if _is_rate_limited(client_key):
                raise HTTPException(status_code=429, detail="Too many failed login attempts. Please retry later.")

        if payload.username != AUTH_USER or not _verify_password(payload.password, AUTH_SECRET):
                _record_failed_attempt(client_key)
                raise HTTPException(status_code=401, detail="Invalid credentials")

        _clear_failed_attempts(client_key)
        nonce = secrets.token_urlsafe(16)
        expiry = int(time.time()) + SESSION_TTL_SECONDS
        token = _signed_session(payload.username, nonce, expiry)
        csrf = secrets.token_urlsafe(24)
        auth_sessions_db[token] = {"user": payload.username, "expiry": str(expiry), "created": str(int(time.time()))}
        _set_auth_cookies(response, token, csrf)
        return {"authenticated": True, "user": payload.username}


    @app.post("/auth/magic/request")
    async def auth_magic_request(payload: MagicLinkRequest, request: Request):
        cookie_csrf = request.cookies.get(CSRF_COOKIE, "")
        if not cookie_csrf or not hmac.compare_digest(cookie_csrf, payload.csrf):
            raise HTTPException(status_code=403, detail="CSRF validation failed")

        email = _normalize_email(payload.email)
        github_username = _normalize_github_username(payload.github_username or "")
        if not _valid_email(email):
            raise HTTPException(status_code=400, detail="Enter a valid email address")

        if REQUIRE_GITHUB_ACCOUNT and not github_username:
            raise HTTPException(status_code=400, detail="GitHub username is required")

        if github_username and not _github_user_exists(github_username):
            raise HTTPException(status_code=403, detail="GitHub account not found")

        client_key = _get_request_client_key(request, email)
        if _is_rate_limited("magic:" + client_key, limit=6, window_seconds=300):
            raise HTTPException(status_code=429, detail="Too many requests. Please retry later.")

        _record_failed_attempt("magic:" + client_key)
        _purge_expired_magic_links()

        # Return generic success even if account is not authorized to avoid account enumeration.
        if not _email_allowed(email) or (github_username and not _github_user_allowed(github_username)):
            return {"ok": True, "delivered": True}

        next_path = _safe_next_path(payload.next or "/citizen.html")
        link = _create_magic_link(email, next_path)
        _send_magic_link_email(email, link)

        if MAGIC_LINK_DEV_MODE and not SMTP_HOST:
            return {"ok": True, "delivered": True, "debug_link": link}
        return {"ok": True, "delivered": True}


    @app.get("/auth/magic/consume")
    async def auth_magic_consume(token: str, response: Response):
        _purge_expired_magic_links()
        token_hash = _hash_magic_token(token)
        entry = magic_links_db.pop(token_hash, None)
        if not entry:
            raise HTTPException(status_code=400, detail="Magic link is invalid or expired")

        email = entry.get("email", "")
        next_path = _safe_next_path(entry.get("next", "/citizen.html"))
        nonce = secrets.token_urlsafe(16)
        expiry = int(time.time()) + SESSION_TTL_SECONDS
        session_token = _signed_session(email, nonce, expiry)
        csrf = secrets.token_urlsafe(24)
        auth_sessions_db[session_token] = {
            "user": email,
            "expiry": str(expiry),
            "created": str(int(time.time())),
        }

        redirect = RedirectResponse(url=next_path, status_code=303)
        _set_auth_cookies(redirect, session_token, csrf)
        return redirect


@app.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
        token = request.cookies.get(SESSION_COOKIE, "")
        if token:
                auth_sessions_db.pop(token, None)
        _clear_auth_cookies(response)
        _ensure_csrf_cookie(response, request)
        return {"ok": True}


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Magic-link login form for development/private routes."""
    next_path = request.query_params.get("next", "/citizen.html")
    safe_next = _safe_next_path(next_path)
    html = f"""
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>Calyr Login</title>
    <style>
        body {{ font-family: system-ui, -apple-system, sans-serif; background:#070c16; color:#eaf6ff; min-height:100vh; margin:0; display:grid; place-items:center; }}
        .card {{ width:min(92vw,380px); background:#0f1726; border:1px solid #1f2d43; border-radius:12px; padding:1rem; }}
        input, button {{ width:100%; box-sizing:border-box; margin-top:0.5rem; border-radius:8px; border:1px solid #2a3b56; padding:0.7rem; }}
        input {{ background:#0b1320; color:#eaf6ff; }}
        button {{ background:#24f3ff; color:#06202d; font-weight:700; cursor:pointer; }}
        .err {{ color:#ff99ad; min-height:1.2rem; margin-top:0.6rem; }}
    </style>
</head>
<body>
    <form class=\"card\" id=\"login-form\">
        <h2>Calyr Secure Login</h2>
        <p>Enter your GitHub account and email to receive a one-time secure sign-in link.</p>
        <label>GitHub Username</label>
        <input id=\"github\" autocomplete=\"username\" placeholder=\"e.g. octocat\" required />
        <label>Email</label>
        <input id=\"email\" type=\"email\" autocomplete=\"email\" required />
        <button type=\"submit\">Send Magic Link</button>
        <div class=\"err\" id=\"error\"></div>
    </form>
    <script>
        (async function() {{
            async function getCsrf() {{
                const r = await fetch('/auth/csrf', {{ credentials:'include' }});
                const j = await r.json();
                return j.csrf;
            }}
            let csrf = await getCsrf();
            document.getElementById('login-form').addEventListener('submit', async function(e) {{
                e.preventDefault();
                const github_username = document.getElementById('github').value.trim();
                const email = document.getElementById('email').value.trim();
                const err = document.getElementById('error');
                err.textContent = '';
                const res = await fetch('/auth/magic/request', {{
                    method:'POST',
                    credentials:'include',
                    headers:{{'Content-Type':'application/json'}},
                    body: JSON.stringify({{ email, github_username, csrf, next: {json.dumps(safe_next)} }})
                }});
                if (!res.ok) {{
                    const data = await res.json().catch(() => ({{ detail:'Login failed' }}));
                    err.textContent = data.detail || 'Login failed';
                    csrf = await getCsrf();
                    return;
                }}
                const payload = await res.json().catch(() => ({{}}));
                if (payload.debug_link) {{
                    err.innerHTML = 'Magic link generated (dev mode): <a href="' + payload.debug_link + '">open sign-in link</a>';
                    return;
                }}
                err.textContent = 'Check your email for a personalized sign-in link.';
            }});
        }})();
    </script>
</body>
</html>
"""
    return HTMLResponse(content=html)


@app.post("/shell")
async def run_shell_command(request: ShellCommandRequest, _auth: Dict[str, str] = Depends(require_auth)):
    """Execute one shell command inside a lightweight persistent shell session."""
    command = request.command.strip()
    if not command:
        return {
            "ok": True,
            "exit_code": 0,
            "stdout": "",
            "stderr": "",
            "cwd": _shell_session(request.session_id, request.shell)["cwd"],
            "shell": Path(_shell_session(request.session_id, request.shell)["shell"]).name,
        }

    session = _shell_session(request.session_id, request.shell)
    shell_path = session["shell"]

    if command in {"exit", "logout"}:
        shell_sessions_db.pop(request.session_id, None)
        return {
            "ok": True,
            "exit_code": 0,
            "stdout": "Shell session closed.",
            "stderr": "",
            "cwd": str(_find_workspace_root()),
            "shell": Path(shell_path).name,
        }

    if command == "pwd":
        return {
            "ok": True,
            "exit_code": 0,
            "stdout": session["cwd"],
            "stderr": "",
            "cwd": session["cwd"],
            "shell": Path(shell_path).name,
        }

    if command == "cd" or command.startswith("cd "):
        destination = command[2:].strip()
        next_cwd = _resolve_cwd(session["cwd"], destination)
        session["cwd"] = str(next_cwd)
        return {
            "ok": True,
            "exit_code": 0,
            "stdout": "",
            "stderr": "",
            "cwd": session["cwd"],
            "shell": Path(shell_path).name,
        }

    try:
        result = subprocess.run(
            [shell_path, "-lc", command],
            cwd=session["cwd"],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
            env={**os.environ, "TERM": "xterm-256color"},
        )
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=504, detail=f"Command timed out after {exc.timeout} seconds")

    return {
        "ok": result.returncode == 0,
        "exit_code": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "cwd": session["cwd"],
        "shell": Path(shell_path).name,
    }


def _create_job_record(sim_request: SimulationRequest, *, visibility: str) -> str:
    job_id = str(uuid.uuid4())[:8]
    job = {
        "id": job_id,
        "type": sim_request.type,
        "status": "queued",
        "progress": 0,
        "user": sim_request.user,
        "params": sim_request.params,
        "model_id": sim_request.params.get("model_id") if isinstance(sim_request.params, dict) else None,
        "created": datetime.now().isoformat(),
        "started": None,
        "completed": None,
        "visibility": visibility,
    }
    jobs_db[job_id] = job
    return job_id


def _strip_private_transform(params: Dict) -> Dict:
    safe = dict(params or {})
    safe["privacy_mode"] = "public_prediction"

    pipeline = safe.get("pipeline")
    if isinstance(pipeline, list):
        safe["pipeline"] = [
            step for step in pipeline
            if str(step.get("id", "")) not in {"parse", "mask"}
        ]

    for key in ["transformed_sequence", "split_definition", "mask_policy", "segment_map", "qty_transform"]:
        safe.pop(key, None)
    return safe


def _verify_alphafold_link(access: str) -> None:
    token = str(access or "").strip()
    if not token or not hmac.compare_digest(token, ALPHAFOLD_LINK_TOKEN):
        raise HTTPException(status_code=403, detail="Invalid access link")

@app.post("/run")
async def run_simulation(request: SimulationRequest, _auth: Dict[str, str] = Depends(require_auth)):
    """
    Run a new simulation job.
    
    Delegates to calyr.eval based on simulation type:
    - saxs: Compute SAXS scattering profile
    - lammps: MD simulation via LAMMPS
    - openfoam: CFD simulation
    - alphafold: Protein structure prediction
    """
    job_id = _create_job_record(request, visibility="private")
    
    # TODO: Integrate with calyr.eval
    # call_eval_runner(job_id, request.type, request.params)
    
    # Simulate async execution
    asyncio.create_task(simulate_job_execution(job_id, request.type))
    
    return JobResponse(
        job_id=job_id,
        type=request.type,
        status="queued",
        progress=0,
    )


@app.post("/public/alphafold/run")
async def run_public_alphafold(request: SimulationRequest):
    """Public AlphaFold prediction entrypoint. Private transform fields are stripped server-side."""
    if request.type != "alphafold":
        raise HTTPException(status_code=400, detail="Public endpoint supports type='alphafold' only")

    params = request.params if isinstance(request.params, dict) else {}
    public_request = SimulationRequest(
        type="alphafold",
        params=_strip_private_transform(params),
        user=request.user or "public",
    )
    job_id = _create_job_record(public_request, visibility="public")
    asyncio.create_task(simulate_job_execution(job_id, "alphafold"))

    return JobResponse(
        job_id=job_id,
        type="alphafold",
        status="queued",
        progress=0,
    )


@app.post("/public/alphafold/link/run")
async def run_link_alphafold(request: SimulationRequest, access: str = Query(default="")):
    """Private-transform AlphaFold entrypoint unlocked only by a particular access link."""
    _verify_alphafold_link(access)
    if request.type != "alphafold":
        raise HTTPException(status_code=400, detail="Link endpoint supports type='alphafold' only")

    params = request.params if isinstance(request.params, dict) else {}
    link_request = SimulationRequest(
        type="alphafold",
        params=dict(params),
        user=request.user or "link",
    )
    job_id = _create_job_record(link_request, visibility="link")
    asyncio.create_task(simulate_job_execution(job_id, "alphafold"))

    return JobResponse(
        job_id=job_id,
        type="alphafold",
        status="queued",
        progress=0,
    )

@app.get("/jobs")
async def list_jobs(_auth: Dict[str, str] = Depends(require_auth)):
    """Get all active jobs"""
    jobs = list(jobs_db.values())
    return {
        "jobs": [
            {
                "id": j["id"],
                "type": j["type"],
                "status": j["status"],
                "progress": j["progress"],
                "created": j["created"],
                "user": j["user"],
            }
            for j in jobs
        ]
    }


@app.get("/matomic/models")
async def list_matomic_models(_auth: Dict[str, str] = Depends(require_auth)):
    """List discoverable mAtomic model files available to simulation workflows."""
    models = _scan_matomic_models()
    return {
        "count": len(models),
        "models": [m.model_dump() for m in models],
    }


@app.get("/matomic/models/{model_id}")
async def get_matomic_model(model_id: str, _auth: Dict[str, str] = Depends(require_auth)):
    """Get one model record by id."""
    models = _scan_matomic_models()
    for model in models:
        if model.id == model_id:
            return model
    raise HTTPException(status_code=404, detail=f"mAtomic model {model_id} not found")


@app.get("/matomic/agora2/status")
async def agora2_status(_auth: Dict[str, str] = Depends(require_auth)):
    """Return AGORA2 manifest coverage and local file status."""
    script, dest_dir, manifest = _agora_paths()
    entries = _read_agora_manifest(manifest)

    present = []
    missing = []
    for name in entries:
        if (dest_dir / name).exists():
            present.append(name)
        else:
            missing.append(name)

    return {
        "script_exists": script.exists(),
        "manifest_exists": manifest.exists(),
        "dest_dir": str(dest_dir.relative_to(_find_workspace_root())),
        "manifest_count": len(entries),
        "present_count": len(present),
        "missing_count": len(missing),
        "present": present,
        "missing": missing,
    }


@app.post("/matomic/agora2/sync")
async def agora2_sync(request: AgoraSyncRequest, _auth: Dict[str, str] = Depends(require_auth)):
    """Run the standard AGORA2 download procedure used by Calyr.ai."""
    script, _dest_dir, _manifest = _agora_paths()
    if not script.exists():
        raise HTTPException(status_code=404, detail="AGORA2 sync script not found")

    cmd = [str(script)]
    if request.check_only:
        cmd.append("--check")
    if request.strict:
        cmd.append("--strict")

    try:
        result = subprocess.run(
            cmd,
            cwd=str(_find_workspace_root()),
            capture_output=True,
            text=True,
            timeout=300,
            check=False,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="AGORA2 sync timed out")

    return {
        "ok": result.returncode == 0,
        "returncode": result.returncode,
        "command": " ".join(cmd),
        "stdout": result.stdout,
        "stderr": result.stderr,
    }

@app.get("/jobs/{job_id}")
async def get_job(job_id: str, _auth: Dict[str, str] = Depends(require_auth)):
    """Get status of a specific job"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    job = jobs_db[job_id]
    return JobStatus(
        id=job["id"],
        type=job["type"],
        status=job["status"],
        progress=job["progress"],
        created=job["created"],
    )


@app.get("/public/alphafold/jobs/{job_id}")
async def get_public_alphafold_job(job_id: str):
    """Public status endpoint for public AlphaFold jobs only."""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    job = jobs_db[job_id]
    if job.get("visibility") != "public" or job.get("type") != "alphafold":
        raise HTTPException(status_code=403, detail="Job is not public")

    return JobStatus(
        id=job["id"],
        type=job["type"],
        status=job["status"],
        progress=job["progress"],
        created=job["created"],
    )


@app.get("/public/alphafold/link/jobs/{job_id}")
async def get_link_alphafold_job(job_id: str, access: str = Query(default="")):
    """Status endpoint for access-link AlphaFold jobs only."""
    _verify_alphafold_link(access)
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    job = jobs_db[job_id]
    if job.get("visibility") != "link" or job.get("type") != "alphafold":
        raise HTTPException(status_code=403, detail="Job is not available for link access")

    return JobStatus(
        id=job["id"],
        type=job["type"],
        status=job["status"],
        progress=job["progress"],
        created=job["created"],
    )

@app.post("/cancel/{job_id}")
async def cancel_job(job_id: str, _auth: Dict[str, str] = Depends(require_auth)):
    """Cancel a running job"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    jobs_db[job_id]["status"] = "cancelled"
    return {"status": "cancelled", "job_id": job_id}

@app.get("/figures")
async def get_figures(job_id: Optional[str] = None, _auth: Dict[str, str] = Depends(require_auth)):
    """
    Get rendered figures.
    Calls calyr.apo to render latest simulation outputs as SVG.
    
    If job_id provided, return figures for that job.
    Otherwise, return latest figures from all jobs.
    """
    figs = []
    
    if job_id:
        figs = figures_db.get(job_id, [])
    else:
        # Return latest from all jobs
        for figures in figures_db.values():
            figs.extend(figures)
    
    return {
        "figures": [
            {
                "name": f.name,
                "content": f.content,
                "job_id": f.job_id,
            }
            for f in figs
        ]
    }

@app.post("/render")
async def render_figure(job_id: str, figure_type: str, _auth: Dict[str, str] = Depends(require_auth)):
    """
    Manually trigger figure rendering for a job.
    Calls calyr.apo renderer with job output data.
    
    figure_type: 'line', 'scatter', 'heatmap'
    """
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    # TODO: Integrate with calyr.apo
    # svg_content = render_figure_with_apo(job_id, figure_type)
    
    # For now, return placeholder SVG
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#0a0e27"/>
        <text x="200" y="150" text-anchor="middle" fill="#24f3ff" font-size="16">
            {figure_type.upper()} Figure - {job_id}
        </text>
    </svg>'''
    
    fig = FigureResponse(name=f"{figure_type.title()} Plot", content=svg, job_id=job_id)
    
    if job_id not in figures_db:
        figures_db[job_id] = []
    figures_db[job_id].append(fig)
    
    return fig

@app.post("/loop")
async def trigger_okto_loop(request: OktoLoopRequest, _auth: Dict[str, str] = Depends(require_auth)):
    """
    Trigger the Okto publication loop:
    1. Extract features from latest job outputs (calyr.eval)
    2. Visualize results (calyr.apo)
    3. Publish to knowledge base (calyr.okto)
    """
    loop_id = str(uuid.uuid4())[:8]
    
    # TODO: Integrate with calyr.okto
    # okto_pipeline(
    #     extract_config=request.extract_config,
    #     visualize=True,
    #     publish=True,
    # )
    
    asyncio.create_task(simulate_okto_execution(loop_id))
    
    return {
        "loop_id": loop_id,
        "status": "started",
        "stages": ["extract", "visualize", "publish"],
    }

@app.post("/extract")
async def extract_features(job_id: str, feature_config: Optional[Dict] = None, _auth: Dict[str, str] = Depends(require_auth)):
    """
    Extract structural/thermodynamic features from job output.
    Calls calyr.eval.
    """
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    # TODO: Call calyr.eval.extract_features(job_data, config)
    
    return {
        "job_id": job_id,
        "features": {
            "scattering_curve": "q vs I(q)",
            "pair_distribution": "p(r) function",
            "molar_mass": "42 kDa",
            "radius_of_gyration": "32 Å",
        },
    }

# ========== SIMULATION HELPERS ==========

async def simulate_job_execution(job_id: str, job_type: str):
    """Simulate job execution with status updates"""
    job = jobs_db[job_id]
    job["started"] = datetime.now().isoformat()
    job["status"] = "running"
    
    # Simulate progress
    for progress in range(0, 101, 10):
        await asyncio.sleep(1)
        job["progress"] = progress
        jobs_db[job_id] = job
    
    job["status"] = "done"
    job["completed"] = datetime.now().isoformat()
    job["progress"] = 100
    
    # Generate figures upon completion
    await asyncio.sleep(0.5)
    
    # Trigger figure rendering
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#0a0e27"/>
        <circle cx="200" cy="150" r="80" fill="none" stroke="#24f3ff" stroke-width="2"/>
        <text x="200" y="160" text-anchor="middle" fill="#ff4df5" font-size="12">
            {job_type.upper()} Result
        </text>
    </svg>'''
    
    fig = FigureResponse(name=f"{job_type.title()} Output", content=svg, job_id=job_id)
    figures_db[job_id] = [fig]

async def simulate_okto_execution(loop_id: str):
    """Simulate Okto publication loop execution"""
    stages = ["extract", "visualize", "publish"]
    
    for stage in stages:
        await asyncio.sleep(2)
        # In real implementation, call respective stages
    
    print(f"[OKTO] Loop {loop_id} completed all stages")

# ========== ROOT ==========

@app.get("/")
async def root():
        """Login gateway for existing links to localhost:8000."""
        return HTMLResponse(
                content="""
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>Calyr.Citizen API</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background:#070c16; color:#eaf6ff; min-height:100vh; margin:0; display:grid; place-items:center; }
        .card { width:min(92vw,460px); background:#0f1726; border:1px solid #1f2d43; border-radius:12px; padding:1rem; }
        a { display:inline-block; margin-top:0.8rem; color:#0d2b38; background:#24f3ff; text-decoration:none; padding:0.6rem 0.9rem; border-radius:8px; font-weight:700; }
        code { background:#0b1320; padding:0.1rem 0.35rem; border-radius:6px; }
    </style>
</head>
<body>
    <div class=\"card\">
        <h2>Calyr.Citizen API</h2>
        <p>Secure login is available at <code>/login</code>.</p>
        <a href=\"/login?next=/citizen.html\">Open Login</a>
    </div>
</body>
</html>
                """
        )

# ========== MAIN ==========

if __name__ == "__main__":
    import uvicorn
    print("Starting Calyr.Citizen API on http://localhost:8000")
    print("Frontend: http://localhost:5173/citizen.html")
    uvicorn.run(app, host="0.0.0.0", port=8000)
