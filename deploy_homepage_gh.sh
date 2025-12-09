#!/bin/bash
set -e

MSG="${1:-"Update homepage"}"

echo "📦 Deploying Calyr.ai homepage (web-only repo)…"

# Sicherstellen, dass wir im web-Ordner sind
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Git initialisieren falls nötig
if [ ! -d ".git" ]; then
    echo "Initializing git repo..."
    git init
    git branch -M main
    git remote add origin https://github.com/calyrai/calyrai-homepage.git
fi

# Stage changes
echo "➕ Staging changes…"
git add -A

# Commit
echo "💾 Commit message: $MSG"
git commit -m "$MSG" || echo "No changes to commit."

# Push with force (overwrite old repo)
echo "🚀 Force-pushing to GitHub…"
git push -u origin main --force

echo "🌐 Done! Open:"
echo "   https://calyrai.github.io/calyrai-homepage/"
