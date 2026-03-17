#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# setup_pages.sh
# - Tries GitHub CLI (gh) to enable GitHub Pages + set custom domain
# - Falls back to "git-only": commit CNAME + push
#
# Usage:
#   ./setup_pages.sh /path/to/repo calyr.ai main /
#
# Example:
#   ./setup_pages.sh ~/Workspace/Calyr/Calyrai_homepage/web calyr.ai main /
# ------------------------------------------------------------

REPO_DIR="${1:-.}"
CUSTOM_DOMAIN="${2:-calyr.ai}"
BRANCH="${3:-main}"
PAGES_PATH="${4:-/}"   # "/" or "/docs"

say() { printf "\n\033[1m%s\033[0m\n" "$*"; }
warn() { printf "\n\033[33mWARN:\033[0m %s\n" "$*"; }
die() { printf "\n\033[31mERROR:\033[0m %s\n" "$*"; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || return 1
}

git_clean_check() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    warn "Working tree not clean. Continuing anyway, but commits may include extra changes."
  fi
}

ensure_repo() {
  cd "$REPO_DIR" || die "Cannot cd into: $REPO_DIR"
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not a git repo: $REPO_DIR"
}

commit_cname() {
  say "Writing CNAME (${CUSTOM_DOMAIN})"
  printf "%s\n" "$CUSTOM_DOMAIN" > CNAME

  git add CNAME

  if git diff --cached --quiet; then
    say "CNAME already up to date (nothing to commit)."
  else
    git commit -m "Add CNAME for ${CUSTOM_DOMAIN}"
  fi

  say "Pushing…"
  git push
}

try_option_a() {
  say "Option A: GitHub CLI (gh) – enable Pages + set custom domain"

  if ! need_cmd gh; then
    warn "gh not found. Skipping Option A."
    return 1
  fi

  # Ensure authenticated
  if ! gh auth status >/dev/null 2>&1; then
    warn "gh is not authenticated. Run: gh auth login"
    return 1
  fi

  # Determine owner/repo from git remote
  local remote url owner repo full
  remote="$(git remote | head -n1 || true)"
  [ -n "$remote" ] || { warn "No git remote found. Skipping Option A."; return 1; }

  url="$(git remote get-url "$remote" 2>/dev/null || true)"
  [ -n "$url" ] || { warn "Could not read remote URL. Skipping Option A."; return 1; }

  # Parse owner/repo from common remote URL forms
  # git@github.com:owner/repo.git
  # https://github.com/owner/repo.git
  full="$(printf "%s" "$url" | sed -E 's#.*github\.com[:/]+([^/]+/[^/.]+)(\.git)?$#\1#')"
  if [[ "$full" != */* ]]; then
    warn "Could not parse owner/repo from remote: $url"
    return 1
  fi

  owner="${full%%/*}"
  repo="${full##*/}"

  say "Detected repo: ${owner}/${repo}"
  gh repo set-default "${owner}/${repo}" >/dev/null 2>&1 || true

  # 1) Create/Update Pages source
  # Try POST first (create). If it fails, try PATCH.
  say "Configuring Pages source: branch=${BRANCH}, path=${PAGES_PATH}"

  if gh api -X POST "repos/${owner}/${repo}/pages" \
      -f "source.branch=${BRANCH}" \
      -f "source.path=${PAGES_PATH}" >/dev/null 2>&1; then
    say "Pages created."
  else
    say "Pages already exists or POST failed; trying PATCH…"
    gh api -X PATCH "repos/${owner}/${repo}/pages" \
      -f "source.branch=${BRANCH}" \
      -f "source.path=${PAGES_PATH}" >/dev/null
    say "Pages updated."
  fi

  # 2) Commit CNAME (still recommended)
  commit_cname

  # 3) Set custom domain via API (best-effort)
  say "Setting custom domain on GitHub Pages: ${CUSTOM_DOMAIN}"
  if gh api -X PUT "repos/${owner}/${repo}/pages" -f "cname=${CUSTOM_DOMAIN}" >/dev/null 2>&1; then
    say "Custom domain set."
  else
    warn "Could not set custom domain via API. CNAME commit is present, so GitHub usually picks it up anyway."
  fi

  # 4) Enforce HTTPS (best-effort)
  say "Enabling HTTPS enforcement (best-effort)"
  if gh api -X POST "repos/${owner}/${repo}/pages/https-enforcement" >/dev/null 2>&1; then
    say "HTTPS enforcement enabled."
  else
    warn "HTTPS enforcement not enabled (may require DNS to be correct / cert to be issued)."
  fi

  # Show status
  say "GitHub Pages status:"
  gh api "repos/${owner}/${repo}/pages" || true

  say "Option A done."
  return 0
}

try_option_b() {
  say "Option B: Git-only fallback – commit CNAME + push"
  commit_cname
  say "Option B done."
}

main() {
  ensure_repo
  git_clean_check

  # Run A; if fails, run B
  if try_option_a; then
    :
  else
    warn "Option A failed or unavailable. Falling back to Option B."
    try_option_b
  fi

  say "NEXT: Set DNS at World4You for ${CUSTOM_DOMAIN} to GitHub Pages."
  say "If you want, paste your GitHub Pages 'Your site is live at ...' URL and I’ll tell you the exact A/AAAA/CNAME records."
}

main "$@"
