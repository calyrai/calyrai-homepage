#!/usr/bin/env bash
set -euo pipefail

WEB_DIR="$(cd "$(dirname "$0")" && pwd)"

NAV_CSS="$WEB_DIR/css/nav.css"
JS_FILE="$WEB_DIR/js/nav_autohide.js"
INDEX_HTML="$WEB_DIR/index.html"

echo "📍 Using WEB_DIR = $WEB_DIR"
echo "   nav.css       = $NAV_CSS"
echo "   JS autohide   = $JS_FILE"
echo "   index.html    = $INDEX_HTML"
echo

# --------------------------------------------------------
# Helper: yes/no prompt
# --------------------------------------------------------
ask_yes_no() {
  local prompt="$1"
  local reply
  read -r -p "$prompt [y/N] " reply || reply="n"
  case "$reply" in
    y|Y|yes|YES) return 0 ;;
    *)           return 1 ;;
  esac
}

# --------------------------------------------------------
# 1) CSS patch in nav.css
# --------------------------------------------------------
if [[ ! -f "$NAV_CSS" ]]; then
  echo "❌ nav.css not found at $NAV_CSS – abort."
  exit 1
fi

if grep -q "Mobile auto-hide navigation" "$NAV_CSS"; then
  echo "ℹ️  nav.css already contains mobile auto-hide block – skipping CSS patch."
else
  echo "🔧 Will append mobile auto-hide CSS to $NAV_CSS:"
  cat <<'EOF'

/* ================================
   Mobile auto-hide navigation
   ================================ */

@media (max-width: 900px) {
  .site-header,
  .site-subnav {
    transition: transform 0.35s ease-out;
    will-change: transform;
  }

  .nav-hidden {
    transform: translateY(-140%);
  }

  .subnav-hidden {
    transform: translateY(-140%);
  }
}
EOF

  echo
  if ask_yes_no "➡️ Append this block to css/nav.css?"; then
    backup="$NAV_CSS.bak_$(date +%Y%m%d_%H%M%S)"
    cp "$NAV_CSS" "$backup"
    echo "🧷 Backup created: $backup"
    cat <<'EOF' >> "$NAV_CSS"

/* ================================
   Mobile auto-hide navigation
   ================================ */

@media (max-width: 900px) {
  .site-header,
  .site-subnav {
    transition: transform 0.35s ease-out;
    will-change: transform;
  }

  .nav-hidden {
    transform: translateY(-140%);
  }

  .subnav-hidden {
    transform: translateY(-140%);
  }
}
EOF
    echo "✅ CSS patch applied."
  else
    echo "⏭  Skipping CSS patch."
  fi
fi

# --------------------------------------------------------
# 2) JS file web/js/nav_autohide.js
# --------------------------------------------------------
JS_CONTENT='(function () {
  let lastY = window.scrollY;
  let ticking = false;

  const header = document.querySelector(".site-header");
  const subnav = document.querySelector(".site-subnav");

  if (!header) return; // safety

  function update() {
    const currentY = window.scrollY;

    if (currentY > lastY + 10) {
      // scroll down -> hide
      header.classList.add("nav-hidden");
      if (subnav) subnav.classList.add("subnav-hidden");
    } else if (currentY < lastY - 10) {
      // scroll up -> show
      header.classList.remove("nav-hidden");
      if (subnav) subnav.classList.remove("subnav-hidden");
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });
})();'

if [[ -f "$JS_FILE" ]]; then
  echo
  echo "⚠️  JS file already exists: $JS_FILE"
  if ask_yes_no "Overwrite existing js/nav_autohide.js with auto-hide logic?"; then
    backup="$JS_FILE.bak_$(date +%Y%m%d_%H%M%S)"
    cp "$JS_FILE" "$backup"
    echo "🧷 Backup created: $backup"
    printf "%s\n" "$JS_CONTENT" > "$JS_FILE"
    echo "✅ JS file updated."
  else
    echo "⏭  Keeping existing JS file."
  fi
else
  echo
  echo "🆕 Creating js/nav_autohide.js …"
  printf "%s\n" "$JS_CONTENT" > "$JS_FILE"
  echo "✅ JS file created."
fi

# --------------------------------------------------------
# 3) index.html – <script src="js/nav_autohide.js"></script>
# --------------------------------------------------------
if [[ ! -f "$INDEX_HTML" ]]; then
  echo "❌ index.html not found at $INDEX_HTML – aborting HTML patch."
  exit 1
fi

if grep -q 'js/nav_autohide.js' "$INDEX_HTML"; then
  echo "ℹ️  index.html already references nav_autohide.js – skipping HTML patch."
else
  echo
  echo "🔧 Will insert <script src=\"js/nav_autohide.js\"></script> before </body> in index.html."
  if ask_yes_no "Apply HTML patch to index.html?"; then
    backup="$INDEX_HTML.bak_$(date +%Y%m%d_%H%M%S)"
    cp "$INDEX_HTML" "$backup"
    echo "🧷 Backup created: $backup"

    python3 - "$INDEX_HTML" <<'PY'
import sys, io

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    html = f.read()

marker = "</body>"
snippet = '  <script src="js/nav_autohide.js"></script>\n'

if "js/nav_autohide.js" in html:
    sys.exit(0)

idx = html.lower().rfind(marker)
if idx == -1:
    # simple append if no </body> found
    html = html + "\n" + snippet
else:
    html = html[:idx] + snippet + html[idx:]

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
PY
    echo "✅ HTML patch applied."
  else
    echo "⏭  Skipping HTML patch."
  fi
fi

echo
echo "✨ Done. On mobile (≤900px) the top navigation will auto-hide when scrolling down and reappear when scrolling up."
