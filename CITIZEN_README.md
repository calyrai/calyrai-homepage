# Calyr.Citizen – Job Control Dashboard

**Version:** 0.1.0  
**Date:** May 3, 2026  
**Status:** ✅ Complete (Local) | ⏳ Pending Git Tracking & Backend Integration

---

## 📋 Executive Summary

**What is Calyr.Citizen?**
A web-based job control dashboard for Calyr simulation jobs. Users can:
- Launch simulations with form validation
- Monitor job progress in real-time (polling every 3 seconds)
- View rendered figures (SVG/images)
- Access publication pipeline (Okto loop)
- Work completely offline with demo mode

**Where is it?**
```
/Users/rtscheliessnig/Workspace/Calyr/apps/homepage/
├── citizen.html           ← Main UI
├── css/citizen.css        ← Styling
├── js/citizen.js          ← Frontend logic
├── backend/
│   ├── citizen_api.py     ← FastAPI server
│   └── requirements.txt    ← Python dependencies
├── README.md              ← Setup guide
└── CITIZEN_INTEGRATION.md ← Integration checklist
```

---

## 🎯 Quick Start (5 Minutes)

### 1. Start the FastAPI Backend

```bash
cd /Users/rtscheliessnig/Workspace/Calyr/apps/homepage/backend

# Create virtual environment (first time only)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python citizen_api.py

# Output should show:
# Uvicorn running on http://127.0.0.1:8000
```

### 2. Open the Frontend

In your browser:
```
http://localhost:8000/citizen.html?demo
```

**Note:** The `?demo` flag enables offline demo mode (mock data).

### 3. Test the Interface

- Click **"Run Simulation"** → Launches mock job
- Click **"View Figures"** → Shows mock figure grid
- Click **"Okto Loop"** → Shows publication pipeline
- Click job in list → Shows job details
- Click **"Cancel"** → Cancels job (demo only, no-op)

---

## 🗂️ File Inventory

### Frontend Files

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `citizen.html` | 6 KB | Main UI + auth gate | ✅ Complete |
| `css/citizen.css` | 9 KB | Responsive design | ✅ Complete |
| `js/citizen.js` | 12 KB | Session mgmt + polling | ✅ Complete |

### Backend Files

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `citizen_api.py` | ~400 lines | FastAPI server | ✅ Skeleton complete, ⏳ TODO stubs |
| `requirements.txt` | 4 lines | Dependencies | ✅ Complete |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Setup and basic usage |
| `CITIZEN_INTEGRATION.md` | Integration checklist (Okto, calyr.eval, calyr.apo) |

---

## 🎨 Frontend Architecture

### HTML Structure (`citizen.html`)

```html
<body>
  <!-- Auth Gate: Visible on first load -->
  <div id="authGate">
    <div class="orbit-logo">🌍</div>
    <button onclick="revealPanel()">Enter Calyr</button>
  </div>

  <!-- Control Panel: Revealed after login -->
  <div id="controlPanel" style="display:none;">
    <!-- Header with user info -->
    <div class="header">
      <h1>Calyr Jobs</h1>
      <span id="userName"></span>
    </div>

    <!-- Action Cards: 3 main controls -->
    <div class="card-grid">
      <div class="card action-card">
        <h3>Run Simulation</h3>
        <button onclick="handleRunSimulation()">Launch</button>
      </div>
      
      <div class="card action-card">
        <h3>View Figures</h3>
        <button onclick="loadFigures()">Browse</button>
      </div>
      
      <div class="card action-card">
        <h3>Okto Loop</h3>
        <button onclick="loadOktoLoop()">Visualize</button>
      </div>
    </div>

    <!-- Job Queue: Real-time updates -->
    <div class="job-list">
      <h3>Active Jobs</h3>
      <ul id="jobsList"></ul>
    </div>

    <!-- Figure Grid: SVG/image display -->
    <div id="figureGrid"></div>
  </div>
</body>
```

### Login Flow

1. User visits `http://localhost:8000/citizen.html?demo`
2. Auth gate displayed (orbit logo + button)
3. Click "Enter Calyr" → Calls `revealPanel()`
4. Panel checks for `?token=SESSION&user=NAME` in URL
5. If found → Show username, start polling jobs
6. If not found in demo mode → Generate mock session

---

## 🔌 Backend Architecture (`citizen_api.py`)

### FastAPI Endpoints

| Method | Endpoint | Purpose | TODO Status |
|--------|----------|---------|-------------|
| GET | `/citizen.html` | Serve frontend | ✅ |
| POST | `/login` | Redirect to auth | ✅ |
| POST | `/run` | Launch simulation | ⏳ Connect `calyr.eval` |
| GET | `/jobs` | List all jobs | ✅ Mock data |
| GET | `/jobs/{job_id}` | Get job details | ✅ Mock data |
| POST | `/cancel/{job_id}` | Cancel job | ✅ Mock data |
| GET | `/figures` | Get rendered figures | ⏳ Connect `calyr.apo` |
| POST | `/render` | Trigger rendering | ⏳ Connect `calyr.apo` |
| POST | `/loop` | Publication pipeline | ⏳ Connect `calyr.okto` |
| POST | `/extract` | Feature extraction | ⏳ Connect `calyr.eval` |
| GET | `/health` | Health check | ✅ |

### Job Simulation (Mock)

```python
# citizen_api.py: Job simulation structure
async def simulate_job_progress(job_id: str):
    """Async job simulation with progress tracking."""
    for progress in range(0, 101, 10):
        jobs[job_id]["progress"] = progress
        jobs[job_id]["status"] = "running" if progress < 100 else "done"
        await asyncio.sleep(1)  # 1 second per step
```

---

## 🎮 Frontend Logic (`js/citizen.js`)

### Key Functions

#### 1. Session Management
```javascript
checkLoginStatus()
  ├─ Reads URL: ?token=SESSION&user=NAME
  ├─ Stores in sessionStorage
  └─ If demo mode: generates mock session

revealPanel()
  ├─ Hides auth gate
  ├─ Shows control panel
  ├─ Displays user name
  └─ Starts polling loop
```

#### 2. Job Polling
```javascript
pollJobStatus()
  ├─ Runs every 3 seconds (configurable)
  ├─ Fetches GET /jobs
  ├─ Updates job list in DOM
  ├─ Shows status (🟡 running, 🟢 done, 🔴 error)
  └─ Auto-stops when all jobs done
```

#### 3. Public API
```javascript
// Users can control Citizen from browser console:
window.citizenAPI.viewJob(job_id)      // Show job details
window.citizenAPI.cancelJob(job_id)    // Cancel running job
window.citizenAPI.enableDemo()         // Enable demo mode
```

---

## 🎨 CSS Design (`css/citizen.css`)

### Design Philosophy
- **Playful:** Gradient buttons, emoji status indicators 🟡🟢🔴
- **Responsive:** Mobile-first, CSS Grid, flexbox
- **Performant:** Minimal repaints, CSS animations (not JS)
- **Accessible:** Semantic HTML, ARIA labels, color-independent indicators

### Key Classes

```css
/* Auth Gate */
.auth-gate          /* Centered, overlay */
.orbit-logo         /* Spinning animation */
.auth-button        /* Gradient button, hover effect */

/* Control Panel */
.header             /* Logo + title + user name */
.card-grid          /* 3-column grid (responsive) */
.action-card        /* Action buttons */

/* Job List */
.job-item           /* Status dot + job name + progress */
.job-status         /* Color-coded: running/done/error */
.job-progress       /* CSS progress bar */

/* Figure Grid */
.figure-grid        /* 2-4 column grid (responsive) */
.figure-card        /* SVG/image container */
```

---

## ⚙️ Integration Checklist

### Phase 1: Backend Stubs (DONE ✅)
- [x] FastAPI server skeleton created
- [x] All endpoints stubbed with mock data
- [x] CORS enabled for frontend
- [x] Demo mode works offline

### Phase 2: Job Execution (TODO ⏳)
- [ ] Replace `POST /run` stub with `calyr.eval.runners.run_saxs()`
- [ ] Replace `POST /extract` stub with `calyr.eval.extract_features()`
- [ ] Test job submission → Verify status polling works

### Phase 3: Figure Rendering (TODO ⏳)
- [ ] Replace `GET /figures` stub with `calyr.apo.renderer.list_figures()`
- [ ] Replace `POST /render` stub with `calyr.apo.renderer.render_figure()`
- [ ] Test figure loading → Verify SVG/PNG display in frontend

### Phase 4: Publication Pipeline (TODO ⏳)
- [ ] Replace `POST /loop` stub with `calyr.okto.pipeline.extract_publish_visualize()`
- [ ] Add WebSocket for real-time pipeline updates
- [ ] Test publication workflow visualization

### Phase 5: Deployment (TODO ⏳)
- [ ] Move from localhost:8000 → production server
- [ ] Add authentication (OAuth, API tokens)
- [ ] Configure SSL/TLS
- [ ] Set up logging/monitoring

---

## 🚀 Running Citizen

### Run Full Stack (Recommended)

```bash
#!/bin/bash
# Start backend in background
cd /Users/rtscheliessnig/Workspace/Calyr/apps/homepage/backend
python citizen_api.py &
BACKEND_PID=$!

# Wait for server to start
sleep 2

# Open frontend in browser
open "http://localhost:8000/citizen.html?demo"

# Keep running until Ctrl+C
trap "kill $BACKEND_PID" EXIT
wait
```

### Save as Script

```bash
cat > start_citizen.sh << 'EOF'
#!/bin/bash
cd /Users/rtscheliessnig/Workspace/Calyr/apps/homepage/backend
source venv/bin/activate
python citizen_api.py
EOF

chmod +x start_citizen.sh
./start_citizen.sh
```

---

## 🧪 Testing Checklist

### Frontend Testing (No Backend Needed)

```javascript
// Open browser console and run:
window.citizenAPI.enableDemo()              // Load demo data
window.citizenAPI.viewJob("job-1")          // Show job details
window.citizenAPI.cancelJob("job-1")        // Cancel job (demo no-op)
```

### Backend Testing

```bash
# Health check
curl http://localhost:8000/health

# List jobs
curl http://localhost:8000/jobs

# Launch job
curl -X POST http://localhost:8000/run \
  -H "Content-Type: application/json" \
  -d '{"job_type": "saxs", "param1": "value1"}'

# Get job details
curl http://localhost:8000/jobs/job-123

# Get figures
curl http://localhost:8000/figures
```

### Full Stack Test

1. Start backend: `python citizen_api.py`
2. Open `http://localhost:8000/citizen.html?demo`
3. Click "Run Simulation"
4. Watch job progress bar (updates every 3s)
5. Click "View Figures" (should show mock images)
6. Verify all buttons work without errors

---

## 📁 Directory Tree

```
/Users/rtscheliessnig/Workspace/Calyr/
├── apps/
│   └── homepage/
│       ├── citizen.html           (6 KB, main UI)
│       ├── css/
│       │   └── citizen.css        (9 KB, styling)
│       ├── js/
│       │   └── citizen.js         (12 KB, logic)
│       ├── backend/
│       │   ├── citizen_api.py     (400 lines, FastAPI)
│       │   ├── requirements.txt    (4 lines)
│       │   └── venv/              (virtual env, created on first run)
│       ├── README.md              (setup guide)
│       ├── CITIZEN_INTEGRATION.md (integration checklist)
│       └── CONSOLIDATION_README.md (you're reading this!)
│       └── start_citizen.sh       (optional launch script)
```

---

## 🔗 Integration Points (TODO)

### 1. Job Execution (`calyr.eval`)
```python
# citizen_api.py, line ~XX, in POST /run handler:
from calyr.eval import runners

# TODO: Replace stub with:
results = await runners.run_saxs(
    job_params=request.model_dump()
)
```

### 2. Figure Rendering (`calyr.apo`)
```python
# citizen_api.py, line ~XX, in GET /figures handler:
from calyr.apo import renderer

# TODO: Replace stub with:
figures = renderer.list_figures(job_id=job_id)
```

### 3. Publication Pipeline (`calyr.okto`)
```python
# citizen_api.py, line ~XX, in POST /loop handler:
from calyr.okto import pipeline

# TODO: Replace stub with:
results = pipeline.extract_publish_visualize(job_id=job_id)
```

---

## 🐛 Troubleshooting

### Q: Backend won't start ("Address already in use")
**A:** Port 8000 is already taken.
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
python citizen_api.py --port 8001
```

### Q: Frontend shows 404 in browser
**A:** Make sure you're using the correct URL:
- ✅ `http://localhost:8000/citizen.html?demo`
- ✅ `http://localhost:8000/citizen.html?token=ABC&user=John`
- ❌ `file:///path/to/citizen.html` (won't work, needs backend)
- ❌ `http://localhost:8000/` (wrong path)

### Q: Jobs aren't polling / no real-time updates
**A:** Check console for errors:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Should see polling requests every 3 seconds
4. Check Network tab for `/jobs` responses

### Q: Backend stubs are too slow
**A:** Reduce polling interval in `citizen.js`:
```javascript
const POLLING_INTERVAL = 1000;  // 1 second instead of 3
```

### Q: Demo mode not working
**A:** Add `?demo` flag to URL:
```
http://localhost:8000/citizen.html?demo
```

### Q: Files not synced to Git
**A:** Known issue. To manually track:
```bash
# In Calyr root:
git add apps/homepage/
git commit -m "feat: add Calyr.Citizen job control dashboard"
git push origin main
```

---

## 📊 Technical Specs

| Component | Spec |
|-----------|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (no jQuery) |
| Backend | FastAPI 0.110+, uvicorn 0.27+, Python 3.11+ |
| Polling | 3-second intervals, cancellable |
| Demos Jobs | ~10 seconds per job (mock) |
| Auth | URL parameters (?token=X&user=Y) |
| Figure Format | SVG, PNG, JPEG (auto-detected) |
| Demo Data | 5 mock jobs, 8 mock figures |
| CORS | Enabled for localhost:3000, 8000 |
| Max Concurrent | 100 jobs (configurable) |

---

## 📚 Related Files

- **Main Calyr README:** `/Users/rtscheliessnig/Workspace/Calyr/README.md`
- **Backend Doc:** `/Users/rtscheliessnig/Workspace/Calyr/apps/homepage/backend/README.md`
- **API Spec:** Inline in `citizen_api.py` (FastAPI auto-generates `/docs`)

---

## 🎯 Next Steps (Priority Order)

1. **Test End-to-End:** Run backend + open frontend, verify demo mode works
2. **Integrate Job Execution:** Connect `calyr.eval` to `/run` endpoint
3. **Integrate Figure Rendering:** Connect `calyr.apo` to `/figures` endpoint
4. **Test with Real Data:** Launch actual simulations, render real figures
5. **Deploy to Production:** Move from localhost to calyr.ai server
6. **Document API:** Generate OpenAPI spec from FastAPI (`/docs`)

---

## 📄 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | AI Assistant | Initial documentation for Citizen |

---

## 📝 Quick Reference

### Start Backend
```bash
cd /Users/rtscheliessnig/Workspace/Calyr/apps/homepage/backend
python citizen_api.py
```

### Open Frontend
```
http://localhost:8000/citizen.html?demo
```

### Check Endpoints
```
http://localhost:8000/docs  (interactive API docs)
```

### View Logs
```bash
# Backend logs print to console
# Browser console (F12) shows frontend logs
```

---

## ❓ Questions or Issues?

1. Check **Troubleshooting** section above
2. Review `CITIZEN_INTEGRATION.md` for integration details
3. Check browser console for JavaScript errors (F12)
4. Check terminal for Python errors (backend logs)

