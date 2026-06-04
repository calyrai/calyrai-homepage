# Calyrai Font Compiler

This folder contains a rules-first font pipeline for homepage usage.

## Files
- `calyrai-font.yml`: source of truth for font parameters, glyph grammar, and rules.
- `build_calyrai_font.py`: compiler that generates SVG glyph assets and real TTF/WOFF2 webfont files.
- `out/`: generated assets.

## Setup
```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install fonttools brotli pyyaml
```

## Build
```bash
. .venv/bin/activate
python build_calyrai_font.py --config calyrai-font.yml
```

## Output
- `out/svg/*.svg` individual glyph files
- `out/<font-slug>.ttf` truetype font
- `out/<font-slug>.woff2` compressed webfont
- `out/<font-slug>.css` webfont CSS declaration
- `out/specimen.html` local preview page
- `out/font-manifest.json` build metadata and target artifacts

## Philosophy
Pattern -> Rules -> Projection -> Manifestation.
The font is treated as a projection layer generated from rules.
