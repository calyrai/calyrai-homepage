# Calyr.Citizen Integration Guide

## Quick Links

- **Frontend**: `apps/homepage/citizen.html`
- **Styles**: `apps/homepage/css/citizen.css`
- **Logic**: `apps/homepage/js/citizen.js`
- **Backend**: `apps/homepage/backend/citizen_api.py`
- **Auth**: Redirects from `localhost:8000` (FastAPI backend)

## How to Access

### From Homepage

The "Login" button in the top-right nav currently points to:
```html
<a href="http://localhost:8000" class="nav-pill" target="_blank">Login</a>
```

**To integrate Citizen into the auth flow:**

1. Create a dedicated login/auth page on the backend (e.g., `/login`)
2. After successful auth, redirect to: `/citizen.html?token=SESSION_TOKEN&user=USERNAME`
3. Frontend checks for `?token=` parameter and reveals the panel

### Direct Access (Demo Mode)

```
http://localhost:5173/citizen.html?demo
```

Loads mock jobs and figures without backend.

## Navigation Integration

Add Citizen to the main navigation if desired:

```html
<!-- In index.html nav-secondary -->
<a href="citizen.html" class="nav-pill" style="display:none;" id="citizen-nav">Citizen</a>

<script>
  // Show "Citizen" link in nav only if authenticated
  if (localStorage.getItem('citizen_session')) {
    document.getElementById('citizen-nav').style.display = 'inline-block';
  }
</script>
```

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│ Homepage (calyr.ai)                         │
│ - index.html, explore.html, docs.html, etc  │
│ - "Login" button → http://localhost:8000    │
└────────────┬────────────────────────────────┘
             │
             ↓ [POST /login]
┌─────────────────────────────────────────────┐
│ Backend (FastAPI on localhost:8000)         │
│ - Auth check                                │
│ - Redirect: /citizen.html?token=X&user=Y   │
└────────────┬────────────────────────────────┘
             │
             ↓ [GET citizen.html]
┌─────────────────────────────────────────────┐
│ Calyr.Citizen (citizen.html)                │
│ - Auth gate (hidden on login)               │
│ - Control panel revealed                    │
│ - Fetch API calls to backend                │
└────────────┬─────┬──────────┬───────────────┘
             │     │          │
             ↓     ↓          ↓
        ┌────────┬──────┬─────────────┐
        │        │      │             │
   ┌────────┐ ┌──────┐ ┌─────┐ ┌──────────┐
   │calyr.  │ │calyr.│ │calyr│ │calyr.    │
   │eval    │ │apo   │ │okto │ │gram      │
   │        │ │      │ │     │ │(nexus)   │
   └────────┘ └──────┘ └─────┘ └──────────┘
```

## File Structure

```
apps/homepage/
├── citizen.html              # Main interface
├── js/
│   └── citizen.js            # Frontend logic + session mgmt
├── css/
│   └── citizen.css           # Playful, responsive styling
├── backend/
│   ├── citizen_api.py        # FastAPI app (localhost:8000)
│   ├── requirements.txt       # Dependencies
│   ├── README.md             # Backend setup
│   └── __init__.py           # Package marker
└── [existing homepage files]
```

## Starting the System

### Terminal 1: Backend

```bash
cd apps/homepage/backend
pip install -r requirements.txt
python citizen_api.py
# Starts on http://localhost:8000
```

### Terminal 2: Frontend

```bash
# Wherever you serve the homepage from (e.g., with `python -m http.server 5173`)
cd apps/homepage
python -m http.server 5173
# Opens http://localhost:5173/
```

### Browser

1. Navigate to `http://localhost:5173/index.html`
2. Click "Login" button
3. Get redirected to backend auth
4. Backend redirects you to `citizen.html?token=...`
5. Auth gate disappears, panel revealed 🎉

## Testing Checklist

- [ ] `citizen.html` loads without errors
- [ ] Auth gate displays when not authenticated
- [ ] Demo mode works: `citizen.html?demo` shows mock data
- [ ] Run Simulation form validates input
- [ ] Job appears in Active Jobs list
- [ ] Figures grid displays SVG/images
- [ ] Okto Loop stages animate correctly
- [ ] Logout clears session and shows auth gate again
- [ ] Responsive design on mobile (flex columns)

## Future: WebSocket Integration

For real-time progress without polling:

```javascript
// citizen.js
const ws = new WebSocket('ws://localhost:8000/ws/jobs');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateJobProgress(update.job_id, update.progress);
};
```

Backend (`citizen_api.py`):
```python
from fastapi import WebSocket

@app.websocket("/ws/jobs")
async def websocket_jobs(websocket: WebSocket):
    await websocket.accept()
    while True:
        # Stream job updates to all connected clients
        await websocket.send_json(job_status_update)
```

## Notes

- **Playful but Functional**: Emoji icons, gradient buttons, spinning orbit logo — but real job control underneath
- **Mobile First**: CSS uses flexbox and media queries; tested on iPhone layout
- **Demo Mode**: Works completely offline; great for presentations
- **Extensible**: Backend endpoints ready for `calyr.eval`, `calyr.apo`, `calyr.okto` integration
