from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from .content import as_dict, as_list_of_dict


def load_tile_modules(root: Path, manifest_rel_path: str) -> list[dict[str, Any]]:
	manifest_path = (root / manifest_rel_path).resolve()
	if not manifest_path.exists():
		return []

	raw_manifest: Any = yaml.safe_load(manifest_path.read_text(encoding="utf-8")) or {}
	manifest = as_dict(raw_manifest)
	entries = as_list_of_dict(manifest.get("tiles"))

	tiles: list[dict[str, Any]] = []
	for entry in entries:
		tile_file = str(entry.get("file", "")).strip()
		if not tile_file:
			continue
		tile_path = (manifest_path.parent / tile_file).resolve()
		if not tile_path.exists():
			continue
		raw_tile: Any = yaml.safe_load(tile_path.read_text(encoding="utf-8")) or {}
		tile = as_dict(raw_tile)
		if tile:
			tiles.append(tile)

	return tiles