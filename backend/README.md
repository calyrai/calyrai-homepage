# Calyr.Citizen – Job Control Dashboard Backend

Web interface for controlling Calyr simulations in real-time. Hidden behind login, reveals playful but functional dashboard.

## Architecture

```
Homepage (index.html)
    ↓ [Login Button]
    ↓
localhost:8000 (FastAPI Backend)
    ↓ [Auth + Redirect]
    ↓
citizen.html (Citizen Interface)
    ↓ [Job Control]
    ├─→ calyr.eval (Feature extraction)
    ├─→ calyr.apo (Figure rendering)
    └─→ calyr.okto (Publication loop)
```

## Setup

### 1. Install Backend Dependencies

```bash
cd apps/homepage/backend
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
pip install -r requirements.txt
```

### 2. Start the Backend

```bash
python citizen_api.py
```

Output:
```
Starting Calyr.Citizen API on http://localhost:8000
Frontend: http://localhost:5173/citizen.html
```

The API docs will be available at `http://localhost:8000/docs`.

### 3. Access the Frontend

From the homepage (e.g., `localhost:5173`):
1. Click the "Login" button in the top-right nav
2. You'll be redirected to the auth endpoint (`localhost:8000/login`)
3. After authentication, you'll return to `citizen.html` with a session token
4. The auth gate will disappear and reveal the control panel

#### Demo Mode (No Backend Required)

To test the UI without a running backend, add `?demo` to the URL:

```
http://localhost:5173/citizen.html?demo
```

This loads mock data:
- 3 sample jobs (SAXS, LAMMPS, AlphaFold)
- 2 sample figures (SVG plots)
- Clickable job controls and Okto loop simulation

## API Endpoints

### Job Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/run` | POST | Launch a new simulation job |
| `/jobs` | GET | List all jobs |
| `/jobs/{job_id}` | GET | Get job status |
| `/cancel/{job_id}` | POST | Cancel a running job |

**Example Request (Run Simulation):**
```json
POST /run
Content-Type: application/json

{
  "type": "saxs",
  "params": {"temp": 300, "steps": 10000},
  "user": "alice"
}
```

**Response:**
```json
{
  "job_id": "abc12345",
  "type": "saxs",
  "status": "queued",
  "progress": 0
}
```

### Figures

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/figures` | GET | Get all rendered figures |
| `/render` | POST | Manually trigger figure rendering |

### Okto Loop (Publication Pipeline)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/loop` | POST | Trigger the publication loop |
| `/extract` | POST | Extract features from job output |

## Frontend Features

### Run Simulation Card
- Dropdown to select simulation type (SAXS, LAMMPS, OpenFOAM, AlphaFold)
- JSON params textarea for advanced configuration
- "Run" button with playful icon
- Real-time progress feedback

### View Figures Card
- Grid display of latest SVG/image outputs
- Click to expand or download
- "Refresh" button to reload figures
- Integrated with calyr.apo rendering system

### Okto Loop Card
- Visual pipeline stages (Extract → Visualize → Publish)
- Status indicator dots (queued → active → done)
- "Trigger Loop" button for automated publication workflow

### Active Jobs List
- Real-time job status and progress bars
- View/Cancel actions per job
- Colored status indicators (🟡 running, 🟢 done, 🔴 error)

## Integration Points

### calyr.eval
When a job of type "saxs" is launched:
1. Parse parameters and validate
2. Call `calyr.eval.runners.run_saxs(job_id, params)`
3. Stream progress updates back to frontend
4. On completion, trigger figure generation

### calyr.apo
When figures are requested:
1. Fetch job output data (HDF5, netCDF, etc.)
2. Call `calyr.apo.renderer.render_figure(spec, output_dir, style)`
3. Generate SVG/PDF/PNG outputs
4. Return embeddable SVG content or URL to frontend

### calyr.okto
When Okto loop is triggered:
1. Identify latest completed jobs
2. Call `calyr.okto.pipeline.extract(jobs)` → features
3. Call `calyr.okto.pipeline.visualize(features)` → figures
4. Call `calyr.okto.pipeline.publish(figures)` → nexus knowledge objects

## Session Management

The backend uses simple token-based auth:

1. Frontend redirects to `/login?user=name`
2. Backend generates UUID token and redirects back: `/citizen.html?token=UUID&user=name`
3. Frontend stores token in localStorage: `citizen_session`
4. Subsequent API calls include token in headers (future enhancement)

For production, replace with proper OAuth2/JWT authentication.

## Development Notes

- **Async Job Execution**: Jobs run in background tasks via `asyncio`. Real implementation should use a task queue (Celery, Redis, etc.)
- **CORS Enabled**: Frontend can make requests from different origins
- **Mock Data**: Current implementation simulates job progress. Replace with actual `calyr.eval` calls
- **SVG Embedding**: Figures are embedded directly in HTML for instant display without CORS issues

## Future Enhancements

- [ ] WebSocket for real-time progress streaming
- [ ] Job history and archival
- [ ] Parameter templates and saved configs
- [ ] User authentication with JWT
- [ ] Batch job submission
- [ ] Figure export to SVG/PDF/PNG
- [ ] Mobile-optimized view (already responsive CSS)
- [ ] Touch-friendly controls for iPad/iPhone
