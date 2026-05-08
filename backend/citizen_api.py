"""
Calyr.Citizen Backend - Job Control & Figure Rendering API
Integrates calyr.eval, calyr.apo, and calyr.okto for real-time job control.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import uuid
from datetime import datetime
import asyncio
import json
import subprocess
from pathlib import Path

app = FastAPI(title="Calyr.Citizen", version="0.1.0")

# Enable CORS for homepage integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# ========== IN-MEMORY JOB STORE ==========
jobs_db: Dict[str, Dict] = {}
figures_db: Dict[str, List[FigureResponse]] = {}


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

@app.post("/login")
async def login(user: str):
    """Placeholder login endpoint - redirects back to citizen.html with token"""
    token = str(uuid.uuid4())
    return {
        "token": token,
        "redirect": f"/citizen.html?token={token}&user={user}",
    }

@app.post("/run")
async def run_simulation(request: SimulationRequest):
    """
    Run a new simulation job.
    
    Delegates to calyr.eval based on simulation type:
    - saxs: Compute SAXS scattering profile
    - lammps: MD simulation via LAMMPS
    - openfoam: CFD simulation
    - alphafold: Protein structure prediction
    """
    job_id = str(uuid.uuid4())[:8]
    
    # Create job record
    job = {
        "id": job_id,
        "type": request.type,
        "status": "queued",
        "progress": 0,
        "user": request.user,
        "params": request.params,
        "model_id": request.params.get("model_id") if isinstance(request.params, dict) else None,
        "created": datetime.now().isoformat(),
        "started": None,
        "completed": None,
    }
    jobs_db[job_id] = job
    
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

@app.get("/jobs")
async def list_jobs():
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
async def list_matomic_models():
    """List discoverable mAtomic model files available to simulation workflows."""
    models = _scan_matomic_models()
    return {
        "count": len(models),
        "models": [m.model_dump() for m in models],
    }


@app.get("/matomic/models/{model_id}")
async def get_matomic_model(model_id: str):
    """Get one model record by id."""
    models = _scan_matomic_models()
    for model in models:
        if model.id == model_id:
            return model
    raise HTTPException(status_code=404, detail=f"mAtomic model {model_id} not found")


@app.get("/matomic/agora2/status")
async def agora2_status():
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
async def agora2_sync(request: AgoraSyncRequest):
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
async def get_job(job_id: str):
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

@app.post("/cancel/{job_id}")
async def cancel_job(job_id: str):
    """Cancel a running job"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    jobs_db[job_id]["status"] = "cancelled"
    return {"status": "cancelled", "job_id": job_id}

@app.get("/figures")
async def get_figures(job_id: Optional[str] = None):
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
async def render_figure(job_id: str, figure_type: str):
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
async def trigger_okto_loop(request: OktoLoopRequest):
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
async def extract_features(job_id: str, feature_config: Optional[Dict] = None):
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
    """API documentation"""
    return {
        "name": "Calyr.Citizen API",
        "version": "0.1.0",
        "endpoints": {
            "POST /run": "Launch simulation job",
            "GET /matomic/models": "List mAtomic model files",
            "GET /matomic/models/{model_id}": "Get one mAtomic model",
            "GET /jobs": "List all jobs",
            "GET /jobs/{job_id}": "Get job status",
            "POST /cancel/{job_id}": "Cancel job",
            "GET /figures": "Get rendered figures",
            "POST /render": "Manually render figure",
            "POST /loop": "Trigger Okto publication loop",
            "POST /extract": "Extract features from job",
        },
        "integrations": [
            "calyr.eval - Feature extraction",
            "calyr.apo - Figure rendering",
            "calyr.okto - Publication loop",
        ],
    }

# ========== MAIN ==========

if __name__ == "__main__":
    import uvicorn
    print("Starting Calyr.Citizen API on http://localhost:8000")
    print("Frontend: http://localhost:5173/citizen.html")
    uvicorn.run(app, host="0.0.0.0", port=8000)
