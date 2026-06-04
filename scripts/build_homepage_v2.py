#!/usr/bin/env python3

"""Build homepage HTML from YAML + Markdown sources via homepage_builder library."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import yaml

from homepage_builder.content import as_dict, load_markdown_data, merge_data
from homepage_builder.tile_modules import load_tile_modules
from homepage_builder.titlepage import render_titlepage_html


def _load_font_css_href(root: Path) -> str:
	manifest_path = root / "calyrai_font" / "out" / "font-manifest.json"
	if not manifest_path.exists():
		return ""
	try:
		raw: Any = json.loads(manifest_path.read_text(encoding="utf-8"))
		manifest = as_dict(raw)
		artifacts = as_dict(manifest.get("artifacts"))
		css_file = str(artifacts.get("css", "")).strip()
		if not css_file:
			return ""
		return f"../calyrai_font/out/{css_file}"
	except Exception:
		return ""


def build(yaml_path: Path, html_path: Path) -> None:
	root = yaml_path.parent.parent
	raw_data: Any = yaml.safe_load(yaml_path.read_text(encoding="utf-8")) or {}
	markdown_data = load_markdown_data(yaml_path.with_suffix(".md"))
	data = as_dict(merge_data(raw_data, markdown_data))
	tile_manifest_rel = str(data.get("tile_modules_manifest", "")).strip()
	if tile_manifest_rel:
		tile_sections = load_tile_modules(root, tile_manifest_rel)
		if tile_sections:
			data["explore_sections"] = tile_sections

	layout = as_dict(data.get("layout"))
	mode = str(layout.get("mode", "design")).strip().lower()
	font_css_href = _load_font_css_href(root)

	if mode != "titlepage":
		raise ValueError(
			"Strict separation mode supports titlepage rendering only in build_homepage_v2.py."
		)

	html_path.write_text(
		render_titlepage_html(data, font_css_href, ""),
		encoding="utf-8",
	)


def main() -> None:
	parser = argparse.ArgumentParser()
	parser.add_argument(
		"--yaml",
		default="v2/homepage.yaml",
		help="Path to homepage YAML configuration.",
	)
	parser.add_argument(
		"--out",
		default="v2/index.html",
		help="Path to output HTML file.",
	)
	args = parser.parse_args()

	root = Path(__file__).resolve().parent.parent
	yaml_path = (root / args.yaml).resolve()
	out_path = (root / args.out).resolve()

	build(yaml_path, out_path)
	print(f"Updated {out_path}")


if __name__ == "__main__":
	main()
