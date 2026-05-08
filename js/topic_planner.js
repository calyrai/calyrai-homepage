(() => {
  const STORAGE_KEY = "calyr_topic_planner_mvp_v1";

  const topicListEl = document.getElementById("topic-list");
  const addTopicBtn = document.getElementById("add-topic-btn");
  const generatePlanBtn = document.getElementById("generate-plan-btn");
  const downloadTopicJsonBtn = document.getElementById("download-topic-json-btn");
  const downloadDayJsonBtn = document.getElementById("download-day-json-btn");
  const importTopicJsonBtn = document.getElementById("import-topic-json-btn");
  const topicJsonInput = document.getElementById("topic-json-input");
  const copySyncCommandBtn = document.getElementById("copy-sync-command-btn");
  const newTopicNameEl = document.getElementById("new-topic-name");
  const dailyStartEl = document.getElementById("daily-start");
  const dailyEndEl = document.getElementById("daily-end");
  const reviewStartEl = document.getElementById("review-start");
  const reviewEndEl = document.getElementById("review-end");
  const dayPlanEl = document.getElementById("day-plan");

  const weekdays = [
    { code: "MO", phase: "Topic Mapping" },
    { code: "TU", phase: "Linking Day" },
    { code: "WE", phase: "Concept Day" },
    { code: "TH", phase: "Critic Day" },
    { code: "FR", phase: "Argument Day" },
    { code: "SA", phase: "Document Compile" },
    { code: "SU", phase: "Weekly Synthesis" }
  ];

  const defaults = {
    topics: [
      { id: crypto.randomUUID(), name: "Structural Epistemics", work: 78, meaning: 92 },
      { id: crypto.randomUUID(), name: "Apparatus and Freedom", work: 64, meaning: 88 },
      { id: crypto.randomUUID(), name: "Language Games and AI", work: 58, meaning: 76 }
    ],
    settings: {
      daily_start: "09:00",
      daily_end: "10:30",
      review_start: "18:00",
      review_end: "18:30"
    }
  };

  let topics = [];
  let settings = { ...defaults.settings };
  let lastPlan = [];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        topics = defaults.topics;
        settings = { ...defaults.settings };
        return;
      }
      const parsed = JSON.parse(raw);
      topics = Array.isArray(parsed.topics) && parsed.topics.length ? parsed.topics : defaults.topics;
      settings = { ...defaults.settings, ...(parsed.settings || {}) };
    } catch (_error) {
      topics = defaults.topics;
      settings = { ...defaults.settings };
    }
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ topics, settings }));
  }

  function topicScore(topic) {
    // Meaning drives scientific priority; work keeps it executable.
    return topic.meaning * 0.62 + topic.work * 0.38;
  }

  function pickTopicForDay(sortedTopics, dayIdx) {
    if (!sortedTopics.length) {
      return null;
    }
    const topSlice = sortedTopics.slice(0, Math.max(1, Math.min(4, sortedTopics.length)));
    return topSlice[dayIdx % topSlice.length];
  }

  function buildWeeklyPlan() {
    const sorted = [...topics].sort((a, b) => topicScore(b) - topicScore(a));
    return weekdays.map((day, idx) => {
      const topic = pickTopicForDay(sorted, idx);
      if (!topic) {
        return {
          ...day,
          topicName: "Kein Topic",
          work: 0,
          meaning: 0,
          focus: "Topic definieren"
        };
      }

      const focus = `${day.phase}: ${topic.name}`;
      return {
        ...day,
        topicId: topic.id,
        topicName: topic.name,
        work: topic.work,
        meaning: topic.meaning,
        focus
      };
    });
  }

  function buildWeekdayLabels(plan) {
    const out = {};
    plan.forEach((entry) => {
      out[entry.code] = `${entry.phase} - ${entry.topicName}`;
    });
    return out;
  }

  function renderCircle(el, value, color) {
    el.style.background = `conic-gradient(${color} ${value * 3.6}deg, #d6dfe8 0deg)`;
    el.textContent = `${value}`;
  }

  function renderTopics() {
    topicListEl.innerHTML = "";

    topics.forEach((topic) => {
      const card = document.createElement("article");
      card.className = "topic-card";

      const meta = document.createElement("div");
      meta.className = "topic-meta";
      meta.innerHTML = `
        <h3>${topic.name}</h3>
        <p>Score: ${topicScore(topic).toFixed(1)} | Arbeit steuert Aufwand, Bedeutung steuert Prioritaet.</p>
      `;

      const removeBtn = document.createElement("button");
      removeBtn.className = "topic-remove";
      removeBtn.type = "button";
      removeBtn.textContent = "Entfernen";
      removeBtn.addEventListener("click", () => {
        topics = topics.filter((t) => t.id !== topic.id);
        renderTopics();
        saveState();
      });
      meta.appendChild(removeBtn);

      const controls = document.createElement("div");
      controls.className = "circle-controls";

      const workControl = document.createElement("div");
      workControl.className = "circle-control";
      const workCircle = document.createElement("div");
      workCircle.className = "circle-visual";
      const workRange = document.createElement("input");
      workRange.type = "range";
      workRange.min = "0";
      workRange.max = "100";
      workRange.step = "1";
      workRange.value = String(topic.work);
      workRange.addEventListener("input", () => {
        topic.work = clamp(Number(workRange.value), 0, 100);
        renderCircle(workCircle, topic.work, "#f08f4f");
        renderTopics();
        saveState();
      });
      const workLabel = document.createElement("span");
      workLabel.className = "circle-label";
      workLabel.textContent = "Arbeit";
      renderCircle(workCircle, topic.work, "#f08f4f");
      workControl.append(workCircle, workRange, workLabel);

      const meaningControl = document.createElement("div");
      meaningControl.className = "circle-control";
      const meaningCircle = document.createElement("div");
      meaningCircle.className = "circle-visual";
      const meaningRange = document.createElement("input");
      meaningRange.type = "range";
      meaningRange.min = "0";
      meaningRange.max = "100";
      meaningRange.step = "1";
      meaningRange.value = String(topic.meaning);
      meaningRange.addEventListener("input", () => {
        topic.meaning = clamp(Number(meaningRange.value), 0, 100);
        renderCircle(meaningCircle, topic.meaning, "#2f7b7b");
        renderTopics();
        saveState();
      });
      const meaningLabel = document.createElement("span");
      meaningLabel.className = "circle-label";
      meaningLabel.textContent = "Bedeutung";
      renderCircle(meaningCircle, topic.meaning, "#2f7b7b");
      meaningControl.append(meaningCircle, meaningRange, meaningLabel);

      controls.append(workControl, meaningControl);
      card.append(meta, controls);
      topicListEl.appendChild(card);
    });

    if (!topics.length) {
      topicListEl.innerHTML = "<p>Noch keine Topics. Fuege oben eins hinzu.</p>";
    }
  }

  function renderPlan(plan) {
    dayPlanEl.innerHTML = "";
    plan.forEach((entry) => {
      const row = document.createElement("article");
      row.className = "day-row";
      row.innerHTML = `
        <h4>${entry.code} - ${entry.phase}</h4>
        <p><strong>Topic:</strong> ${entry.topicName}</p>
        <p><strong>Deep Work:</strong> ${settings.daily_start}-${settings.daily_end} | <strong>Review:</strong> ${settings.review_start}-${settings.review_end}</p>
      `;
      dayPlanEl.appendChild(row);
    });
  }

  function topicPlanJsonFromPlan(plan) {
    return {
      source_tag: "calyr_topic_weekly_plan",
      daily_block: {
        start: settings.daily_start,
        end: settings.daily_end
      },
      review_block: {
        enabled: true,
        start: settings.review_start,
        end: settings.review_end
      },
      weekday_labels: buildWeekdayLabels(plan),
      topic_scores: Object.fromEntries(topics.map((t) => [t.name, {
        work: t.work,
        meaning: t.meaning,
        score: Number(topicScore(t).toFixed(2))
      }]))
    };
  }

  function dayPlanJson(plan) {
    return {
      generated_at: new Date().toISOString(),
      settings,
      days: plan.map((entry) => ({
        day: entry.code,
        phase: entry.phase,
        topic: entry.topicName,
        work: entry.work,
        meaning: entry.meaning,
        focus: entry.focus
      }))
    };
  }

  function downloadJson(content, fileName) {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  addTopicBtn.addEventListener("click", () => {
    const name = (newTopicNameEl.value || "").trim();
    if (!name) {
      return;
    }
    topics.push({
      id: crypto.randomUUID(),
      name,
      work: 50,
      meaning: 50
    });
    newTopicNameEl.value = "";
    renderTopics();
    saveState();
  });

  [dailyStartEl, dailyEndEl, reviewStartEl, reviewEndEl].forEach((el) => {
    el.addEventListener("change", () => {
      settings.daily_start = dailyStartEl.value;
      settings.daily_end = dailyEndEl.value;
      settings.review_start = reviewStartEl.value;
      settings.review_end = reviewEndEl.value;
      if (lastPlan.length) {
        renderPlan(lastPlan);
      }
      saveState();
    });
  });

  generatePlanBtn.addEventListener("click", () => {
    lastPlan = buildWeeklyPlan();
    renderPlan(lastPlan);
    saveState();
  });

  downloadTopicJsonBtn.addEventListener("click", () => {
    const plan = lastPlan.length ? lastPlan : buildWeeklyPlan();
    const jsonPayload = topicPlanJsonFromPlan(plan);
    downloadJson(jsonPayload, "topic_plan.json");
  });

  downloadDayJsonBtn.addEventListener("click", () => {
    const plan = lastPlan.length ? lastPlan : buildWeeklyPlan();
    downloadJson(dayPlanJson(plan), "day_plan.json");
  });

  importTopicJsonBtn.addEventListener("click", () => {
    topicJsonInput.click();
  });

  topicJsonInput.addEventListener("change", async () => {
    const [file] = topicJsonInput.files || [];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const scores = data.topic_scores || {};
      const nextTopics = Object.keys(scores).map((name) => {
        const item = scores[name] || {};
        return {
          id: crypto.randomUUID(),
          name,
          work: clamp(Number(item.work || 50), 0, 100),
          meaning: clamp(Number(item.meaning || 50), 0, 100)
        };
      });
      if (nextTopics.length) {
        topics = nextTopics;
      }
      settings.daily_start = data.daily_block?.start || settings.daily_start;
      settings.daily_end = data.daily_block?.end || settings.daily_end;
      settings.review_start = data.review_block?.start || settings.review_start;
      settings.review_end = data.review_block?.end || settings.review_end;

      dailyStartEl.value = settings.daily_start;
      dailyEndEl.value = settings.daily_end;
      reviewStartEl.value = settings.review_start;
      reviewEndEl.value = settings.review_end;

      renderTopics();
      lastPlan = buildWeeklyPlan();
      renderPlan(lastPlan);
      saveState();
    } catch (_error) {
      window.alert("Import fehlgeschlagen: Datei ist kein gueltiges topic_plan.json");
    } finally {
      topicJsonInput.value = "";
    }
  });

  copySyncCommandBtn.addEventListener("click", async () => {
    const command = "python administration/google_calendar_sync.py --config administration/google_calendar_config.json --sync-topic-plan --topic-plan-json /Pfad/zu/topic_plan.json";
    try {
      await navigator.clipboard.writeText(command);
      copySyncCommandBtn.textContent = "Command kopiert";
      setTimeout(() => {
        copySyncCommandBtn.textContent = "Sync Command kopieren";
      }, 1400);
    } catch (_error) {
      window.alert(command);
    }
  });

  loadState();
  dailyStartEl.value = settings.daily_start;
  dailyEndEl.value = settings.daily_end;
  reviewStartEl.value = settings.review_start;
  reviewEndEl.value = settings.review_end;

  renderTopics();
  lastPlan = buildWeeklyPlan();
  renderPlan(lastPlan);
})();
