#!/usr/bin/env bash
set -e

# --- config ---
BRANCH="main"
REMOTE="origin"

echo "📦 Git status:"
git status --short

echo
read -p "Commit message: " MSG

if [ -z "$MSG" ]; then
  echo "❌ Commit message required."
  exit 1
fi

echo
echo "➕ Adding changes..."
git add .

echo "📝 Committing..."
git commit -m "$MSG"

echo "🚀 Pushing to $REMOTE/$BRANCH..."
git push $REMOTE $BRANCH

echo "✅ Upload complete."
