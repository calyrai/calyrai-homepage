#!/usr/bin/env python3
"""Compile a full markdown source into v2/homepage.yaml.

This preserves the existing homepage layout and only changes the content/config source path.
"""

from pathlib import Path
import re
import argparse

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "v2" / "content" / "homepage_full.md"
OUT = ROOT / "v2" / "homepage.yaml"


def split_sections(md: str):
    parts = re.split(r"^##\s+", md, flags=re.MULTILINE)
    data = {}
    for part in parts[1:]:
      lines = part.splitlines()
      if not lines:
          continue
      name = lines[0].strip()
      body = "\n".join(lines[1:]).strip()
      data[name] = body
    return data


def parse_nav(block: str):
    items = []
    for line in block.splitlines():
        line = line.strip()
        if not line.startswith("- "):
            continue
        payload = line[2:].strip()
        if "|" in payload:
            label, href = payload.split("|", 1)
            items.append({"label": label.strip(), "href": href.strip()})
    return items


def parse_animation(block: str):
    result = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip()
        if re.fullmatch(r"-?\d+", val):
            result[key] = int(val)
        elif re.fullmatch(r"-?\d*\.\d+", val):
            result[key] = float(val)
        else:
            result[key] = val
    return result


def parse_key_value_block(block: str):
    result = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, val = line.split(":", 1)
        result[key.strip()] = val.strip()
    return result


def scalar(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return f'"{str(v).replace("\"", "\\\"")}"'


def emit_block(lines, key, text, indent=0):
    pad = "  " * indent
    lines.append(f"{pad}{key}: |")
    for ln in text.splitlines():
        lines.append(f"{pad}  {ln}")


def build_yaml(sections):
    theory = sections.get("Section Theory", "")
    calyrai = sections.get("Section Calyrai", "")
    access = sections.get("Section Access", "")
    engine = sections.get("Section Engine", "")

    top_nav = parse_nav(sections.get("Top Nav", ""))
    bottom_nav = parse_nav(sections.get("Bottom Nav", ""))
    anim = parse_animation(sections.get("Animation", ""))
    page_mode = (sections.get("Page Mode", "design") or "design").strip().lower()
    page_title = sections.get("Page Title", "CALYRAI – Adaptive surrogate systems")
    hero_label = sections.get("Hero Label", "")
    cta_text = sections.get("CTA Text", "Explore the system")
    cta_href = sections.get("CTA Href", "#explore")
    tagline = sections.get("Tagline", "")
    structure = parse_key_value_block(sections.get("Structure", ""))

    lines = []
    lines.append("layout:")
    lines.append(f"  mode: {scalar(page_mode)}")
    lines.append("  grid:")
    lines.append("    spacing_cm: 1")
    lines.append("    color: \"#fff\"")
    lines.append("    dot_radius_px: 0.7")

    lines.append("layers:")
    lines.append("  swirl_joystick:")
    lines.append("    enabled: true")
    lines.append("    sensitivity: 1.0")
    lines.append("    color_mode: section")
    lines.append("  particle_field:")
    lines.append("    enabled: true")
    lines.append("    particle_count: 1")
    lines.append("    levy_jump_prob: 0.08")
    lines.append("    field_strength: 0.7")

    lines.append("hero:")
    lines.append(f"  label: {scalar(hero_label)}")
    lines.append(f"  title: {scalar(sections.get('Hero Title', ''))}")
    emit_block(lines, "subtitle", sections.get("Hero Subtitle", ""), indent=1)
    lines.append("  cta:")
    lines.append(f"    text: {scalar(cta_text)}")
    lines.append(f"    href: {scalar(cta_href)}")

    lines.append("meta:")
    lines.append(f"  page_title: {scalar(page_title)}")
    lines.append(f"  tagline: {scalar(tagline)}")

    lines.append("structure:")
    lines.append(f"  template: {scalar(structure.get('template', 'calyr_titlepage_orbit'))}")
    lines.append(f"  hero_class: {scalar(structure.get('hero_class', 'hero'))}")
    lines.append(f"  hero_copy_class: {scalar(structure.get('hero_copy_class', 'hero-copy'))}")
    lines.append(f"  hero_kicker_class: {scalar(structure.get('hero_kicker_class', 'hero-kicker'))}")
    lines.append(f"  hero_title_class: {scalar(structure.get('hero_title_class', 'hero-title'))}")
    lines.append(f"  hero_subtitle_class: {scalar(structure.get('hero_subtitle_class', 'hero-subtitle'))}")
    lines.append(f"  hero_orbit_class: {scalar(structure.get('hero_orbit_class', 'hero-orbit-logo'))}")
    lines.append(f"  hero_stack_class: {scalar(structure.get('hero_stack_class', 'hero-orbit-stack'))}")
    lines.append(f"  hero_cta_class: {scalar(structure.get('hero_cta_class', 'hero-cta hero-cta--orbit glow-button'))}")
    lines.append(f"  hero_characteristics_class: {scalar(structure.get('hero_characteristics_class', 'hero-characteristics hero-characteristics--orbit'))}")
    lines.append(f"  grid_spacing_px: {scalar(structure.get('grid_spacing_px', '30'))}")
    lines.append(f"  grid_major_step: {scalar(structure.get('grid_major_step', '4'))}")
    lines.append(f"  grid_base_r_major: {scalar(structure.get('grid_base_r_major', '1.25'))}")
    lines.append(f"  grid_base_r_minor: {scalar(structure.get('grid_base_r_minor', '0.42'))}")
    lines.append(f"  grid_max_r_major: {scalar(structure.get('grid_max_r_major', '6.2'))}")
    lines.append(f"  grid_max_r_minor: {scalar(structure.get('grid_max_r_minor', '1.9'))}")
    lines.append(f"  grid_hover_radius_px: {scalar(structure.get('grid_hover_radius_px', '88'))}")
    lines.append(f"  grid_base_op_major: {scalar(structure.get('grid_base_op_major', '0.62'))}")
    lines.append(f"  grid_base_op_minor: {scalar(structure.get('grid_base_op_minor', '0.16'))}")
    lines.append(f"  grid_max_op_major: {scalar(structure.get('grid_max_op_major', '0.96'))}")
    lines.append(f"  grid_max_op_minor: {scalar(structure.get('grid_max_op_minor', '0.34'))}")
    lines.append(f"  label_hover_radius_px: {scalar(structure.get('label_hover_radius_px', '22'))}")
    lines.append(f"  label_reveal_ms: {scalar(structure.get('label_reveal_ms', '2000'))}")
    lines.append(f"  label_font_px: {scalar(structure.get('label_font_px', '6'))}")
    lines.append(f"  label_visible_opacity: {scalar(structure.get('label_visible_opacity', '0.72'))}")
    lines.append(f"  label_color: {scalar(structure.get('label_color', '#24f3ff'))}")
    lines.append(f"  label_mode: {scalar(structure.get('label_mode', 'hover'))}")

    lines.append("nav:")
    lines.append("  top:")
    for item in top_nav:
        lines.append("    - label: " + scalar(item["label"]))
        lines.append("      href: " + scalar(item["href"]))
    lines.append("  bottom:")
    for item in bottom_nav:
        lines.append("    - label: " + scalar(item["label"]))
        lines.append("      href: " + scalar(item["href"]))

    lines.append("explore_sections:")
    for title, color, body in [
        ("Theory", "#24f3ff", theory),
        ("Calyrai", "#ff4df5", calyrai),
        ("Access", "#f3f8ff", access),
        ("Engine", "#9fb4c9", engine),
    ]:
        lines.append("  - title: " + scalar(title))
        lines.append("    color: " + scalar(color))
        emit_block(lines, "body", body, indent=2)

    lines.append("animation:")
    lines.append("  particle_runtime:")
    for key, value in anim.items():
        lines.append(f"    {key}: {scalar(value)}")
    lines.append("  flow_patterns:")
    lines.append("    mode: \"auto\"")
    lines.append("    adaptivity: 0.7")
    lines.append("    blend_strength: 0.75")
    lines.append("    presets:")
    lines.append("      spiral:")
    lines.append("        strength: 0.058")
    lines.append("        inward_pull: 0.018")
    lines.append("      beam:")
    lines.append("        strength: 0.046")
    lines.append("        line_pull: 0.024")
    lines.append("      vortex:")
    lines.append("        strength: 0.052")
    lines.append("        inward_pull: 0.02")
    lines.append("      weave:")
    lines.append("        strength: 0.036")
    lines.append("        frequency: 0.028")
    lines.append("      radial:")
    lines.append("        strength: 0.03")

    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--src",
        default=str(SRC),
        help="Path to markdown source.",
    )
    parser.add_argument(
        "--out",
        default=str(OUT),
        help="Path to YAML output.",
    )
    args = parser.parse_args()

    src_path = Path(args.src).resolve()
    out_path = Path(args.out).resolve()

    sections = split_sections(src_path.read_text(encoding="utf-8"))
    yaml_text = build_yaml(sections)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(yaml_text, encoding="utf-8")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
