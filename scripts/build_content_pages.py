#!/usr/bin/env python3

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import yaml

from homepage_builder.content import as_dict, as_list_of_dict
from homepage_builder.content_page import build_content_page


def build(manifest_path: Path) -> list[Path]:
	root = manifest_path.parent.parent
	manifest_raw: Any = yaml.safe_load(manifest_path.read_text(encoding="utf-8")) or {}
	manifest = as_dict(manifest_raw)
	pages = as_list_of_dict(manifest.get("pages"))
	updated: list[Path] = []
	for entry in pages:
		source = str(entry.get("source", "")).strip()
		output = str(entry.get("output", "")).strip()
		if not source or not output:
			continue
		md_path = (manifest_path.parent / source).resolve()
		out_path = (manifest_path.parent.parent / output).resolve()
		build_content_page(
			root,
			md_path,
			out_path,
			back_href=str(entry.get("back_href", "../index.html")).strip() or "../index.html",
			kicker=str(entry.get("kicker", "Theory / Content Page")).strip() or "Theory / Content Page",
			brand=str(entry.get("brand", "Calyr.ai / Theory")).strip() or "Calyr.ai / Theory",
			index_note=str(entry.get("index_note", "Calyr.ai treats knowledge topology as the durable asset. Interfaces, glyphs, AI systems, and tools are downstream projections of that structure.")).strip() or "Calyr.ai treats knowledge topology as the durable asset. Interfaces, glyphs, AI systems, and tools are downstream projections of that structure.",
			footer_note=str(entry.get("footer_note", "This page is a separate content surface linked from the homepage. The markdown source remains the canonical content asset for future revisions.")).strip() or "This page is a separate content surface linked from the homepage. The markdown source remains the canonical content asset for future revisions.",
		)
		updated.append(out_path)
	return updated


def main() -> None:
	parser = argparse.ArgumentParser()
	parser.add_argument(
		"--manifest",
		default="homepage_v3/content_pages/content_pages.yaml",
		help="Path to content-pages manifest relative to apps/homepage.",
	)
	args = parser.parse_args()
	root = Path(__file__).resolve().parent.parent
	manifest_path = (root / args.manifest).resolve()
	updated = build(manifest_path)
	for path in updated:
		print(f"Updated {path}")


if __name__ == "__main__":
	main()