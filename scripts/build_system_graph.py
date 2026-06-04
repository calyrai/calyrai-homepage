#!/usr/bin/env python3

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

import yaml

from build_content_pages import build as build_content_pages
from build_homepage_v2 import build as build_homepage
from homepage_builder.content import as_dict, as_list_of_dict


def parse_system_markdown(text: str) -> tuple[dict[str, str], dict[str, str]]:
	matches = list(re.finditer(r"^##\s+(Node|Page)\s+(.+?)\s*$", text, flags=re.M))
	nodes: dict[str, str] = {}
	pages: dict[str, str] = {}
	for index, match in enumerate(matches):
		kind = match.group(1).strip().lower()
		key = match.group(2).strip().lower()
		start = match.end()
		end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
		block = text[start:end].strip()
		if kind == "node":
			nodes[key] = block
		else:
			pages[key] = block
	return nodes, pages


def generate_tile_modules(root: Path, system: dict[str, Any], node_texts: dict[str, str]) -> None:
	homepage_v3 = root / "homepage_v3"
	tiles_dir = homepage_v3 / "tiles"
	tiles_dir.mkdir(parents=True, exist_ok=True)

	nodes = as_list_of_dict(system.get("nodes"))
	manifest_entries: list[dict[str, str]] = []
	for node in nodes:
		node_id = str(node.get("id", "")).strip().lower()
		if not node_id:
			continue
		tile_data = dict(node)
		tile_data["node_id"] = node_id
		if node_id in node_texts:
			tile_data["body"] = node_texts[node_id]
		tile_path = tiles_dir / f"{node_id}.yaml"
		tile_path.write_text(yaml.safe_dump(tile_data, sort_keys=False, allow_unicode=True), encoding="utf-8")
		manifest_entries.append({"file": f"{node_id}.yaml"})

	manifest = {"tiles": manifest_entries}
	(tiles_dir / "tiles.yaml").write_text(yaml.safe_dump(manifest, sort_keys=False, allow_unicode=True), encoding="utf-8")


def generate_content_pages(root: Path, system: dict[str, Any], page_texts: dict[str, str]) -> Path:
	homepage_v3 = root / "homepage_v3"
	content_dir = homepage_v3 / "content_pages"
	content_dir.mkdir(parents=True, exist_ok=True)

	pages = as_list_of_dict(system.get("pages"))
	manifest_entries: list[dict[str, str]] = []
	for page in pages:
		page_id = str(page.get("id", "")).strip().lower()
		title = str(page.get("title", page_id)).strip() or page_id
		if not page_id:
			continue
		body = page_texts.get(page_id, "")
		md_text = f"# {title}\n\n{body}\n"
		source_file = f"{page_id}.md"
		(content_dir / source_file).write_text(md_text, encoding="utf-8")
		manifest_entries.append(
			{
				"source": source_file,
				"output": str(page.get("output", f"pages/{page_id}.html")).strip() or f"pages/{page_id}.html",
				"back_href": str(page.get("back_href", "../index.html")).strip() or "../index.html",
				"kicker": str(page.get("kicker", "Theory / Content Page")).strip() or "Theory / Content Page",
				"brand": str(page.get("brand", "Calyr.ai / Theory")).strip() or "Calyr.ai / Theory",
				"index_note": str(page.get("index_note", "Calyr.ai treats knowledge topology as the durable asset. Interfaces, glyphs, AI systems, and tools are downstream projections of that structure.")).strip() or "Calyr.ai treats knowledge topology as the durable asset. Interfaces, glyphs, AI systems, and tools are downstream projections of that structure.",
				"footer_note": str(page.get("footer_note", "This page is a separate content surface linked from the homepage. The markdown source remains the canonical content asset for future revisions.")).strip() or "This page is a separate content surface linked from the homepage. The markdown source remains the canonical content asset for future revisions.",
			}
		)

	manifest_path = content_dir / "content_pages.yaml"
	manifest_path.write_text(yaml.safe_dump({"pages": manifest_entries}, sort_keys=False, allow_unicode=True), encoding="utf-8")
	return manifest_path


def ensure_homepage_tile_manifest(root: Path, tile_manifest_rel_path: str) -> Path:
	homepage_yaml = root / "homepage_v3" / "homepage.yaml"
	raw: Any = yaml.safe_load(homepage_yaml.read_text(encoding="utf-8")) or {}
	data = as_dict(raw)
	data["tile_modules_manifest"] = tile_manifest_rel_path
	homepage_yaml.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")
	return homepage_yaml


def main() -> None:
	parser = argparse.ArgumentParser()
	parser.add_argument("--yaml", default="homepage_v3/system.yaml", help="System YAML (single source).")
	parser.add_argument("--md", default="homepage_v3/system.md", help="System markdown (single source).")
	args = parser.parse_args()

	root = Path(__file__).resolve().parent.parent
	system_yaml = (root / args.yaml).resolve()
	system_md = (root / args.md).resolve()

	system_raw: Any = yaml.safe_load(system_yaml.read_text(encoding="utf-8")) or {}
	system = as_dict(system_raw)
	node_texts, page_texts = parse_system_markdown(system_md.read_text(encoding="utf-8"))

	generate_tile_modules(root, system, node_texts)
	content_manifest = generate_content_pages(root, system, page_texts)
	homepage_yaml = ensure_homepage_tile_manifest(root, "homepage_v3/tiles/tiles.yaml")

	build_content_pages(content_manifest)
	homepage_out = root / "homepage_v3" / "index.html"
	build_homepage(homepage_yaml, homepage_out)

	print(f"Updated {homepage_out}")


if __name__ == "__main__":
	main()