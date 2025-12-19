#!/usr/bin/env bash
set -e

echo "🟣 Calyr.ai — adding ART mode scaffolding"

# ---------- 1. art.html ----------
if [ ! -f art.html ]; then
  cp projects.html art.html
  echo "✔ created art.html (copy of projects.html)"
else
  echo "⚠ art.html already exists — skipped"
fi

# ---------- 2. css/art.css ----------
if [ ! -f css/art.css ]; then
  cat > css/art.css <<'EOF'
/* =========================
   ART MODE – MAGENTA GLOW
   ========================= */

/* Header pills */
.art-page .nav-pill {
  border-color: rgba(255, 77, 245, 0.7);
  box-shadow:
    0 0 10px rgba(255, 77, 245, 0.25),
    0 0 26px rgba(0, 0, 0, 0.9);
}

.art-page .nav-pill:hover {
  border-color: #ff4df5;
  box-shadow:
    0 0 18px rgba(255, 77, 245, 0.6),
    0 0 40px rgba(0, 0, 0, 1);
}

/* Section accent line */
.art-page .section-inner .bg-gradient-to-r {
  background: linear-gradient(
    to right,
    #ff4df5,
    #ff7ad9,
    #ffc2f0
  );
}

/* Project cards: magenta bias */
.art-page .project-card {
  border-color: rgba(255, 77, 245, 0.8);
}

.art-page .project-card:hover {
  border-color: #ff4df5;
  background: radial-gradient(
    circle at top left,
    rgba(255, 90, 220, 0.22),
    rgba(3, 8, 20, 0.98)
  );
}
EOF
  echo "✔ created css/art.css"
else
  echo "⚠ css/art.css already exists — skipped"
fi

# ---------- 3. data/projects_art.yaml ----------
if [ ! -f data/projects_art.yaml ]; then
  cat > data/projects_art.yaml <<'EOF'
projects:
  - title: "The Child’s Story"
    subtitle: "Narrative intuition before equations"
    description: |
      A gentle, interactive storytelling space where scientific ideas
      emerge through metaphor, motion and curiosity — without equations,
      but with structure.
    tags: ["STORY", "INTERACTIVE", "ART"]
    accent: "#ff4df5"
    href: "projects/child_story/index.html"
EOF
  echo "✔ created data/projects_art.yaml"
else
  echo "⚠ data/projects_art.yaml already exists — skipped"
fi

# ---------- 4. projects/child_story ----------
if [ ! -d projects/child_story ]; then
  mkdir -p projects/child_story/assets
  cat > projects/child_story/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>The Child’s Story — Calyr.ai</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="../../css/base.css" />
  <link rel="stylesheet" href="../../css/components.css" />
</head>

<body class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">

  <main class="max-w-xl text-center space-y-6 px-6">
    <h1 class="text-3xl font-semibold text-fuchsia-300">
      The Child’s Story
    </h1>

    <p class="text-slate-300">
      This space will become an interactive narrative experiment —
      intuition first, structure later.
    </p>

    <p class="text-slate-500 text-sm">
      (Work in progress)
    </p>

    <a href="../../art.html"
       class="inline-block mt-6 px-6 py-2 rounded-full border border-fuchsia-400/60
              text-fuchsia-300 hover:bg-fuchsia-500/10 transition">
      ← Back to Art
    </a>
  </main>

</body>
</html>
EOF
  echo "✔ created projects/child_story/index.html"
else
  echo "⚠ projects/child_story already exists — skipped"
fi

echo ""
echo "✨ ART mode scaffolding complete."
echo "Next steps:"
echo "  - add <body class=\"art-page\"> to art.html"
echo "  - include css/art.css in art.html"
echo "  - set PROJECTS_YAML=data/projects_art.yaml"