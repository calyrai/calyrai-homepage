from __future__ import annotations

import re
from pathlib import Path
from typing import Any, cast

import yaml


def as_dict(value: Any) -> dict[str, Any]:
	return cast(dict[str, Any], value) if isinstance(value, dict) else {}


def as_list_of_dict(value: Any) -> list[dict[str, Any]]:
	if not isinstance(value, list):
		return []
	out: list[dict[str, Any]] = []
	for item in cast(list[Any], value):
		if isinstance(item, dict):
			out.append(cast(dict[str, Any], item))
	return out


def _parse_md_scalar(value: str) -> Any:
	text = value.strip()
	if not text:
		return ""
	if text.startswith("#"):
		return text
	try:
		parsed: Any = yaml.safe_load(text)
	except Exception:
		return text
	if isinstance(parsed, (dict, list)):
		return text
	return parsed


def _parse_md_key_value_block(block: str) -> dict[str, Any]:
	parsed: dict[str, Any] = {}
	for raw_line in block.splitlines():
		line = raw_line.strip()
		if not line or ":" not in line:
			continue
		key, raw_value = line.split(":", 1)
		parsed[key.strip()] = _parse_md_scalar(raw_value)
	return parsed


def _parse_md_nav_block(block: str) -> list[dict[str, Any]]:
	items: list[dict[str, Any]] = []
	for raw_line in block.splitlines():
		line = raw_line.strip()
		if not line.startswith("-"):
			continue
		payload = line[1:].strip()
		if not payload:
			continue
		label, sep, href = payload.partition("|")
		entry: dict[str, Any] = {"label": label.strip()}
		if sep:
			entry["href"] = href.strip()
		items.append(entry)
	return items


def _parse_md_section_block(title: str, block: str) -> dict[str, Any]:
	meta: dict[str, Any] = {"title": title}
	body_lines: list[str] = []
	in_meta = True
	for raw_line in block.splitlines():
		stripped = raw_line.strip()
		if in_meta and stripped and re.match(r"^[A-Za-z0-9_-]+\s*:", stripped):
			key, raw_value = stripped.split(":", 1)
			meta[key.strip()] = _parse_md_scalar(raw_value)
			continue
		if in_meta and not stripped and not body_lines:
			continue
		in_meta = False
		body_lines.append(raw_line)
	meta["body"] = "\n".join(line.rstrip() for line in body_lines).strip()
	return meta


def load_markdown_data(md_path: Path) -> dict[str, Any]:
	if not md_path.exists():
		return {}
	text = md_path.read_text(encoding="utf-8")
	matches = list(re.finditer(r"^##\s+(.+?)\s*$", text, flags=re.M))
	if not matches:
		return {}
	data: dict[str, Any] = {}
	explore_sections: list[dict[str, Any]] = []
	for index, match in enumerate(matches):
		heading = match.group(1).strip()
		start = match.end()
		end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
		block = text[start:end].strip()
		normalized = heading.lower()
		if normalized == "page mode":
			data.setdefault("layout", {})["mode"] = str(_parse_md_scalar(block))
		elif normalized == "page title":
			data.setdefault("meta", {})["page_title"] = block
		elif normalized == "hero label":
			data.setdefault("hero", {})["label"] = block
		elif normalized == "hero title":
			data.setdefault("hero", {})["title"] = block
		elif normalized == "hero subtitle":
			data.setdefault("hero", {})["subtitle"] = block
		elif normalized == "cta text":
			data.setdefault("hero", {}).setdefault("cta", {})["text"] = block
		elif normalized == "cta href":
			data.setdefault("hero", {}).setdefault("cta", {})["href"] = block
		elif normalized == "tagline":
			data.setdefault("meta", {})["tagline"] = block
		elif normalized == "structure":
			data["structure"] = _parse_md_key_value_block(block)
		elif normalized == "top nav":
			data.setdefault("nav", {})["top"] = _parse_md_nav_block(block)
		elif normalized == "bottom nav":
			data.setdefault("nav", {})["bottom"] = _parse_md_nav_block(block)
		elif normalized == "animation":
			data.setdefault("animation", {})["particle_runtime"] = _parse_md_key_value_block(block)
		elif normalized.startswith("section "):
			section_title = heading[8:].strip() or f"Section {len(explore_sections) + 1}"
			explore_sections.append(_parse_md_section_block(section_title, block))
	if explore_sections:
		data["explore_sections"] = explore_sections
	return data


def merge_data(base: Any, override: Any) -> Any:
	if isinstance(base, dict) and isinstance(override, dict):
		merged: dict[str, Any] = {**cast(dict[str, Any], base)}
		for key, value in cast(dict[str, Any], override).items():
			if key in merged:
				merged[key] = merge_data(merged[key], value)
			else:
				merged[key] = value
		return merged
	if isinstance(base, list) and isinstance(override, list):
		base_list = cast(list[Any], base)
		override_list = cast(list[Any], override)
		if all(isinstance(item, dict) and "title" in cast(dict[str, Any], item) for item in base_list + override_list):
			base_by_title: dict[str, dict[str, Any]] = {}
			for item in base_list:
				entry = cast(dict[str, Any], item)
				title_key = str(entry.get("title", "")).strip().lower()
				if title_key:
					base_by_title[title_key] = entry

			merged_list: list[dict[str, Any]] = []
			for item in override_list:
				override_entry = cast(dict[str, Any], item)
				title_key = str(override_entry.get("title", "")).strip().lower()
				if title_key and title_key in base_by_title:
					merged_entry = cast(dict[str, Any], merge_data(base_by_title[title_key], override_entry))
					merged_list.append(merged_entry)
				else:
					merged_list.append(override_entry)
			return merged_list
		return override
	return override