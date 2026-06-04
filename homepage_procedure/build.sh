#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

SRC_GRAPH="$HERE/homepage_graph.yaml"
SRC_MD="$HERE/homepage_full.md"
OUT_YAML="$ROOT/v2/homepage.yaml"
OUT_HTML_MAIN="$ROOT/v2/index.html"
OUT_HTML_MIDDAY="$ROOT/v2/index_midday_reconstructed.html"
FONT_CFG="$ROOT/calyrai_font/calyrai-font.yml"
FONT_SCRIPT="$ROOT/calyrai_font/build_calyrai_font.py"
FONT_OUT="$ROOT/calyrai_font/out"
FONT_VENV_PY="$ROOT/calyrai_font/.venv/bin/python"

if [[ -f "$FONT_CFG" && -f "$FONT_SCRIPT" ]]; then
	if [[ -x "$FONT_VENV_PY" ]]; then
		"$FONT_VENV_PY" "$FONT_SCRIPT" --config "$FONT_CFG" --out "$FONT_OUT"
	else
		python3 "$FONT_SCRIPT" --config "$FONT_CFG" --out "$FONT_OUT"
	fi
fi

python3 "$HERE/graph_to_md.py"
python3 "$ROOT/scripts/md_to_homepage_yaml.py" --src "$SRC_MD" --out "$OUT_YAML"
python3 "$ROOT/scripts/build_homepage_v2.py" --yaml "v2/homepage.yaml" --out "v2/index.html"
python3 "$ROOT/scripts/build_homepage_v2.py" --yaml "v2/homepage.yaml" --out "v2/index_midday_reconstructed.html"

echo "Done:"
echo "- $SRC_GRAPH"
if [[ -d "$FONT_OUT" ]]; then
	echo "- $FONT_OUT"
fi
echo "- $OUT_YAML"
echo "- $OUT_HTML_MAIN"
echo "- $OUT_HTML_MIDDAY"
