/* Calyr.Citizen JavaScript - Job Control Interface */

(function() {
  const API_BASE = 'http://localhost:8000';
  let csrfToken = '';
  
  // DOM Elements
  const authGate = document.getElementById('auth-gate');
  const citizenMain = document.getElementById('citizen-main');
  const logoutBtn = document.getElementById('logout-btn');
  const runForm = document.getElementById('run-form');
  const refreshFiguresBtn = document.getElementById('refresh-figures');
  const triggerLoopBtn = document.getElementById('trigger-loop');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const jobList = document.getElementById('job-list');
  const figuresContainer = document.getElementById('figures-container');
  const oktoStatus = document.getElementById('okto-status');
  
  // Session state
  let session = {
    authenticated: false,
    userName: '',
    jobs: [],
    figures: [],
  };

  // ========== INIT ==========
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkLoginStatus().then(() => {
      if (session.authenticated) {
        startPolling();
      }
    });
  });

  // ========== LOGIN CHECK ==========
  async function checkLoginStatus() {
    const auth = await callAPI('/auth/session', 'GET', null, false);
    if (auth && auth.authenticated) {
      session.authenticated = true;
      session.userName = auth.user || 'Researcher';
      csrfToken = auth.csrf || csrfToken;
      revealPanel();
      return;
    }

    // Demo mode remains available for local UI development.
    if (localStorage.getItem('citizen_demo')) {
      session.authenticated = true;
      session.userName = 'Demo Researcher';
      revealPanel();
    }
  }

  function revealPanel() {
    authGate.style.display = 'none';
    citizenMain.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    document.getElementById('user-name').textContent = session.userName;
    loadJobsAndFigures();
  }

  // ========== EVENT LISTENERS ==========
  function setupEventListeners() {
    logoutBtn.addEventListener('click', logout);
    runForm.addEventListener('submit', handleRunSimulation);
    refreshFiguresBtn.addEventListener('click', loadFigures);
    triggerLoopBtn.addEventListener('click', handleTriggerLoop);
  }

  async function logout() {
    await callAPI('/auth/logout', 'POST', {}, true);
    localStorage.removeItem('citizen_demo');
    session.authenticated = false;
    authGate.style.display = 'flex';
    citizenMain.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  // ========== UI HELPERS ==========
  function setStatus(text, type = 'ready') {
    statusText.textContent = text;
    statusDot.className = 'status-dot ' + type;
  }

  function showNotification(msg, type = 'info') {
    // Simple toast - you can enhance with a proper notification system
    console.log(`[${type.toUpperCase()}] ${msg}`);
  }

  // ========== API CALLS ==========
  async function callAPI(endpoint, method = 'GET', data = null, needsCsrf = false) {
    try {
      const options = {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      };

      if (needsCsrf && csrfToken) {
        options.headers['X-CSRF-Token'] = csrfToken;
      }
      
      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(API_BASE + endpoint, options);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const payload = await response.json();
      if (payload && payload.csrf) {
        csrfToken = payload.csrf;
      }
      return payload;
    } catch (error) {
      console.error('API Call Failed:', error);
      setStatus('Connection error', 'error');
      return null;
    }
  }

  // ========== JOB MANAGEMENT ==========
  async function handleRunSimulation(e) {
    e.preventDefault();
    
    const simType = document.getElementById('sim-type').value;
    const paramsStr = document.getElementById('sim-params').value;
    
    if (!simType) {
      showNotification('Please select a simulation type', 'warning');
      return;
    }

    let params = {};
    if (paramsStr.trim()) {
      try {
        params = JSON.parse(paramsStr);
      } catch {
        showNotification('Invalid JSON in parameters', 'error');
        return;
      }
    }

    setStatus('Launching simulation...', 'busy');
    
    const result = await callAPI('/run', 'POST', {
      type: simType,
      params: params,
      user: session.userName,
    }, true);

    if (result) {
      showNotification(`Job ${result.job_id} started`, 'success');
      addJobToList(result);
      runForm.reset();
      setStatus('Job queued', 'ready');
    } else {
      setStatus('Launch failed', 'error');
    }
  }

  function addJobToList(job) {
    if (!session.jobs.find(j => j.id === job.job_id)) {
      session.jobs.push({
        id: job.job_id,
        type: job.type || 'unknown',
        status: job.status || 'queued',
        progress: job.progress || 0,
        created: new Date().toLocaleTimeString(),
      });
      renderJobList();
    }
  }

  function renderJobList() {
    if (session.jobs.length === 0) {
      jobList.innerHTML = '<div class="empty-state">No jobs running.</div>';
      return;
    }

    jobList.innerHTML = session.jobs.map(job => {
      const statusClass = job.status === 'done' ? 'done' : 
                         job.status === 'error' ? 'error' : '';
      
      return `
        <div class="job-item">
          <div class="job-status-indicator">
            <span class="job-status-dot ${statusClass}"></span>
          </div>
          <div class="job-info">
            <span class="job-name">${job.type.toUpperCase()} - ${job.id.substring(0, 8)}</span>
            <span class="job-time">Started ${job.created}</span>
          </div>
          <div class="job-progress">
            <span>${job.progress}%</span>
            <div style="height: 6px; background: rgba(160,196,255,0.2); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #24f3ff, #ff4df5); width: ${job.progress}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <div class="job-actions">
            <button class="job-btn" onclick="window.citizenAPI.viewJob('${job.id}')">View</button>
            <button class="job-btn" onclick="window.citizenAPI.cancelJob('${job.id}')">Cancel</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ========== FIGURE LOADING ==========
  async function loadFigures() {
    setStatus('Loading figures...', 'busy');
    
    const result = await callAPI('/figures');
    
    if (result && result.figures) {
      session.figures = result.figures;
      renderFigures();
      setStatus('Ready to compute', 'ready');
    } else {
      showNotification('Failed to load figures', 'error');
      setStatus('Error loading figures', 'error');
    }
  }

  function renderFigures() {
    if (session.figures.length === 0) {
      figuresContainer.innerHTML = '<p class="empty-state">No figures yet. Run a simulation first.</p>';
      return;
    }

    figuresContainer.innerHTML = session.figures.map((fig, idx) => {
      // If SVG content, embed directly; if URL, use img
      const isInline = fig.content && fig.content.startsWith('<svg');
      
      return `
        <div class="figure-item" title="${fig.name || 'Figure ' + idx}">
          ${isInline 
            ? fig.content 
            : `<img src="${fig.url || fig.content}" alt="Figure ${idx}" />`
          }
        </div>
      `;
    }).join('');
  }

  // ========== OKTO LOOP ==========
  async function handleTriggerLoop() {
    setStatus('Starting publication loop...', 'busy');
    triggerLoopBtn.disabled = true;
    
    const result = await callAPI('/loop', 'POST', {
      user: session.userName,
    }, true);

    if (result) {
      showNotification('Okto loop started', 'success');
      updateOktoStatus('extract');
      
      // Simulate loop progression for demo
      setTimeout(() => updateOktoStatus('visualize'), 2000);
      setTimeout(() => updateOktoStatus('publish'), 4000);
      setTimeout(() => {
        updateOktoStatus(null);
        setStatus('Ready to compute', 'ready');
        triggerLoopBtn.disabled = false;
      }, 6000);
    } else {
      setStatus('Loop failed', 'error');
      triggerLoopBtn.disabled = false;
    }
  }

  function updateOktoStatus(activeStage) {
    document.querySelectorAll('.stage').forEach(stage => {
      stage.classList.remove('active', 'done');
    });

    if (activeStage) {
      const stageEl = document.querySelector(`[data-stage="${activeStage}"]`);
      if (stageEl) {
        stageEl.classList.add('active');
      }
      // Mark earlier stages as done
      document.querySelectorAll(`[data-stage]`).forEach(el => {
        const stages = ['extract', 'visualize', 'publish'];
        if (stages.indexOf(el.dataset.stage) < stages.indexOf(activeStage)) {
          el.classList.add('done');
        }
      });
    }
  }

  // ========== POLLING ==========
  function startPolling() {
    setInterval(() => {
      if (session.authenticated) {
        pollJobStatus();
      }
    }, 3000); // Poll every 3 seconds
  }

  async function pollJobStatus() {
    // In real implementation, check job status with backend
    const result = await callAPI('/jobs');
    if (result && result.jobs) {
      session.jobs = result.jobs.map(j => ({
        id: j.id,
        type: j.type,
        status: j.status,
        progress: j.progress || 0,
        created: j.created || new Date().toLocaleTimeString(),
      }));
      renderJobList();
    }
  }

  async function loadJobsAndFigures() {
    await loadFigures();
    await pollJobStatus();
  }

  // ========== PUBLIC API FOR GLOBAL SCOPE ==========
  window.citizenAPI = {
    viewJob: (jobId) => {
      console.log('View job:', jobId);
      showNotification(`Viewing job ${jobId}`, 'info');
      // Open job detail modal or redirect
    },
    
    cancelJob: (jobId) => {
      console.log('Cancel job:', jobId);
      callAPI(`/cancel/${jobId}`, 'POST', {}, true).then(r => {
        if (r) {
          showNotification(`Job ${jobId} cancelled`, 'success');
          session.jobs = session.jobs.filter(j => j.id !== jobId);
          renderJobList();
        }
      });
    },

    // Demo mode toggle
    enableDemo: () => {
      localStorage.setItem('citizen_demo', 'true');
      session.authenticated = true;
      session.userName = 'Demo Researcher';
      revealPanel();
      generateDemoData();
    },
  };

  // ========== DEMO MODE DATA ==========
  function generateDemoData() {
    session.jobs = [
      { id: 'job-001', type: 'saxs', status: 'running', progress: 45, created: new Date().toLocaleTimeString() },
      { id: 'job-002', type: 'lammps', status: 'queued', progress: 0, created: new Date().toLocaleTimeString() },
      { id: 'job-003', type: 'alphafold', status: 'done', progress: 100, created: '14:32' },
    ];

    session.figures = [
      { name: 'SAXS Curve', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ccircle cx="100" cy="100" r="80" fill="none" stroke="%2324f3ff" stroke-width="2"/%3E%3C/svg%3E' },
      { name: 'P(r) Distribution', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect x="40" y="60" width="120" height="80" fill="none" stroke="%23ff4df5" stroke-width="2"/%3E%3C/svg%3E' },
    ];

    renderJobList();
    renderFigures();
  }

  // Auto-enable demo if ?demo flag present
  if (window.location.search.includes('demo')) {
    window.citizenAPI.enableDemo();
  }

})();
