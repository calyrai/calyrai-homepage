#!/usr/bin/env python3
"""Compile calyrai-font.yml into real webfont assets (TTF/WOFF2) and SVG glyph previews."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import yaml

try:
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.ttLib import TTFont

    FONTTOOLS_AVAILABLE = True
except Exception:
    FONTTOOLS_AVAILABLE = False


Point = tuple[float, float]
Contour = list[Point]


def _as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _to_x(value: float, width: float, pad: float) -> float:
    return pad + (value / 100.0) * width


def _to_y(value: float, height: float, pad: float) -> float:
    # Glyph coordinates use y-up (0 bottom, 100 top)
    return pad + ((100.0 - value) / 100.0) * height


def _line_path(line: list[float], width: float, height: float, pad: float) -> str:
    x1, y1, x2, y2 = [float(v) for v in line]
    return f"M {_to_x(x1, width, pad):.2f} {_to_y(y1, height, pad):.2f} L {_to_x(x2, width, pad):.2f} {_to_y(y2, height, pad):.2f}"


def _arc_path(
    center: list[float], radius: float, start_deg: float, end_deg: float, width: float, height: float, pad: float
) -> str:
    cx = _to_x(float(center[0]), width, pad)
    cy = _to_y(float(center[1]), height, pad)
    rx = (radius / 100.0) * width
    ry = (radius / 100.0) * height

    s = math.radians(start_deg)
    e = math.radians(end_deg)

    x1 = cx + rx * math.cos(s)
    y1 = cy - ry * math.sin(s)
    x2 = cx + rx * math.cos(e)
    y2 = cy - ry * math.sin(e)

    delta = (end_deg - start_deg) % 360.0
    large_arc = 1 if delta > 180.0 else 0
    sweep = 1
    return f"M {x1:.2f} {y1:.2f} A {rx:.2f} {ry:.2f} 0 {large_arc} {sweep} {x2:.2f} {y2:.2f}"


def _arc_points(cx: float, cy: float, r: float, start_deg: float, end_deg: float, steps: int) -> list[Point]:
    out: list[Point] = []
    if steps <= 1:
        steps = 2
    for i in range(steps):
        t = i / (steps - 1)
        ang = math.radians(start_deg + (end_deg - start_deg) * t)
        out.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r))
    return out


def _norm_to_font(point: Point, advance: float, cap_height: float, lsb: float) -> Point:
    x = lsb + (point[0] / 100.0) * (advance - 2.0 * lsb)
    y = (point[1] / 100.0) * cap_height
    return x, y


def _line_contour(p1: Point, p2: Point, thickness: float, rounded: bool) -> Contour:
    x1, y1 = p1
    x2, y2 = p2
    dx = x2 - x1
    dy = y2 - y1
    length = math.hypot(dx, dy)
    if length < 1e-6:
        return []

    ux = dx / length
    uy = dy / length
    px = -uy
    py = ux
    h = thickness * 0.5

    if not rounded:
        return [
            (x1 + px * h, y1 + py * h),
            (x2 + px * h, y2 + py * h),
            (x2 - px * h, y2 - py * h),
            (x1 - px * h, y1 - py * h),
        ]

    angle = math.degrees(math.atan2(uy, ux))
    end_cap = _arc_points(x2, y2, h, angle + 90.0, angle - 90.0, 9)
    start_cap = _arc_points(x1, y1, h, angle - 90.0, angle + 90.0, 9)
    return end_cap + start_cap


def _ring_contour(center: Point, radius: float, thickness: float, start_deg: float, end_deg: float) -> Contour:
    cx, cy = center
    outer_r = radius + thickness * 0.5
    inner_r = max(1.0, radius - thickness * 0.5)

    span = (end_deg - start_deg) % 360.0
    if span == 0.0:
        span = 360.0
    steps = max(24, int(span / 10.0) + 2)

    outer = _arc_points(cx, cy, outer_r, start_deg, start_deg + span, steps)
    inner = _arc_points(cx, cy, inner_r, start_deg + span, start_deg, steps)
    return outer + inner


def _fallback_glyph(char: str, rules: dict[str, Any]) -> dict[str, Any]:
    circles_only = bool(_as_dict(rules.get("geometry")).get("circles_only", False))

    if char == "A":
        return {
            "lines": [
                [0, 0, 50, 100],
                [100, 0, 50, 100],
            ],
            "crossbar": {"enabled": False},
        }

    if circles_only or char in {"O", "C"}:
        if char == "C":
            return {"arc": {"center": [50, 50], "radius": 46, "start": 42, "end": 318}}
        return {"circle": {"center": [50, 50], "radius": 46}}

    if char == "I":
        return {"lines": [[50, 0, 50, 100]]}

    # Generic diagonal form for unspecified glyphs
    return {
        "lines": [
            [10, 0, 50, 100],
            [90, 0, 50, 100],
        ]
    }


def _glyph_to_svg(char: str, glyph_cfg: dict[str, Any], font_cfg: dict[str, Any], rules: dict[str, Any]) -> str:
    stroke_width = float(font_cfg.get("stroke_width", 80))
    terminal_style = str(font_cfg.get("terminal_style", "open")).lower()

    canvas = 1200.0
    pad = 120.0
    width = canvas - pad * 2
    height = canvas - pad * 2

    linecap = "round" if terminal_style == "open" else "butt"
    linejoin = "round"

    paths: list[str] = []

    lines = glyph_cfg.get("lines", [])
    if isinstance(lines, list):
        for line in lines:
            if isinstance(line, list) and len(line) == 4:
                paths.append(_line_path(line, width, height, pad))

    circle_cfg = _as_dict(glyph_cfg.get("circle"))
    if circle_cfg:
        center = circle_cfg.get("center", [50, 50])
        radius = float(circle_cfg.get("radius", 46))
        if isinstance(center, list) and len(center) == 2:
            paths.append(_arc_path(center, radius, 0, 359.9, width, height, pad))

    arc_cfg = _as_dict(glyph_cfg.get("arc"))
    if arc_cfg:
        center = arc_cfg.get("center", [50, 50])
        radius = float(arc_cfg.get("radius", 46))
        start = float(arc_cfg.get("start", 30))
        end = float(arc_cfg.get("end", 330))
        if isinstance(center, list) and len(center) == 2:
            paths.append(_arc_path(center, radius, start, end, width, height, pad))

    crossbar_cfg = _as_dict(glyph_cfg.get("crossbar"))
    crossbar_enabled = bool(crossbar_cfg.get("enabled", False))
    if char == "A" and crossbar_enabled:
        paths.append(_line_path([25, 46, 75, 46], width, height, pad))

    if not paths:
        fallback = _fallback_glyph(char, rules)
        return _glyph_to_svg(char, fallback, font_cfg, rules)

    body = "\n  ".join(f"<path d=\"{p}\" />" for p in paths)
    return (
        f"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {int(canvas)} {int(canvas)}\">\n"
        f"  <g fill=\"none\" stroke=\"#ffffff\" stroke-width=\"{stroke_width:.2f}\" stroke-linecap=\"{linecap}\" stroke-linejoin=\"{linejoin}\">\n"
        f"  {body}\n"
        f"  </g>\n"
        f"</svg>\n"
    )


def _glyph_to_contours(
    char: str,
    glyph_cfg: dict[str, Any],
    rules: dict[str, Any],
    *,
    advance: float,
    cap_height: float,
    lsb: float,
    stroke_thickness: float,
    rounded_terminals: bool,
) -> list[Contour]:
    cfg = glyph_cfg or _fallback_glyph(char, rules)
    contours: list[Contour] = []

    lines = cfg.get("lines", [])
    if isinstance(lines, list):
        for line in lines:
            if isinstance(line, list) and len(line) == 4:
                p1 = _norm_to_font((float(line[0]), float(line[1])), advance, cap_height, lsb)
                p2 = _norm_to_font((float(line[2]), float(line[3])), advance, cap_height, lsb)
                c = _line_contour(p1, p2, stroke_thickness, rounded_terminals)
                if len(c) >= 3:
                    contours.append(c)

    circle_cfg = _as_dict(cfg.get("circle"))
    if circle_cfg:
        center = circle_cfg.get("center", [50, 50])
        if isinstance(center, list) and len(center) == 2:
            cx, cy = _norm_to_font((float(center[0]), float(center[1])), advance, cap_height, lsb)
            r = (float(circle_cfg.get("radius", 46.0)) / 100.0) * (advance - 2.0 * lsb)
            contours.append(_ring_contour((cx, cy), r, stroke_thickness, 0.0, 360.0))

    arc_cfg = _as_dict(cfg.get("arc"))
    if arc_cfg:
        center = arc_cfg.get("center", [50, 50])
        if isinstance(center, list) and len(center) == 2:
            cx, cy = _norm_to_font((float(center[0]), float(center[1])), advance, cap_height, lsb)
            r = (float(arc_cfg.get("radius", 46.0)) / 100.0) * (advance - 2.0 * lsb)
            start = float(arc_cfg.get("start", 30.0))
            end = float(arc_cfg.get("end", 330.0))
            contours.append(_ring_contour((cx, cy), r, stroke_thickness, start, end))

    crossbar_cfg = _as_dict(cfg.get("crossbar"))
    if char == "A" and bool(crossbar_cfg.get("enabled", False)):
        p1 = _norm_to_font((25.0, 46.0), advance, cap_height, lsb)
        p2 = _norm_to_font((75.0, 46.0), advance, cap_height, lsb)
        c = _line_contour(p1, p2, stroke_thickness, rounded_terminals)
        if len(c) >= 3:
            contours.append(c)

    if not contours:
        return _glyph_to_contours(
            char,
            _fallback_glyph(char, rules),
            rules,
            advance=advance,
            cap_height=cap_height,
            lsb=lsb,
            stroke_thickness=stroke_thickness,
            rounded_terminals=rounded_terminals,
        )

    return contours


def _build_ttf_font(
    *,
    out_ttf: Path,
    font_name: str,
    style_name: str,
    chars: list[str],
    glyph_defs: dict[str, Any],
    rules: dict[str, Any],
    font_cfg: dict[str, Any],
) -> None:
    upm = int(float(font_cfg.get("upm", 1000)))
    cap_height = int(float(font_cfg.get("cap_height", 700)))
    x_height = int(float(font_cfg.get("x_height", 450)))
    tracking = float(font_cfg.get("tracking", 1.0))
    stroke_cfg = float(font_cfg.get("stroke_width", 80))
    rounded_terminals = str(font_cfg.get("terminal_style", "open")).lower() == "open"

    base_advance = int(upm * 0.72)
    advance = max(int(base_advance * max(0.5, tracking)), int(upm * 0.45))
    lsb = float(int(upm * 0.08))
    stroke_thickness = max(10.0, (stroke_cfg / 100.0) * cap_height)

    descent = int(upm * 0.2)
    ascent = upm - descent

    unique_chars: list[str] = []
    seen_chars: set[str] = set()
    for ch in chars:
        if ch in seen_chars:
            continue
        seen_chars.add(ch)
        unique_chars.append(ch)

    glyph_order = [".notdef"]
    glyphs: dict[str, Any] = {}
    hmtx: dict[str, tuple[int, int]] = {}
    cmap: dict[int, str] = {}

    # .notdef box
    pen_notdef = TTGlyphPen(None)
    n0 = lsb
    n1 = advance - lsb
    nb = 0.0
    nt = cap_height
    pen_notdef.moveTo((n0, nb))
    pen_notdef.lineTo((n1, nb))
    pen_notdef.lineTo((n1, nt))
    pen_notdef.lineTo((n0, nt))
    pen_notdef.closePath()
    glyphs[".notdef"] = pen_notdef.glyph()
    hmtx[".notdef"] = (advance, int(lsb))

    for char in unique_chars:
        name = f"uni{ord(char):04X}"
        glyph_order.append(name)
        cmap[ord(char)] = name
        cfg = _as_dict(glyph_defs.get(char))
        contours = _glyph_to_contours(
            char,
            cfg,
            rules,
            advance=advance,
            cap_height=cap_height,
            lsb=lsb,
            stroke_thickness=stroke_thickness,
            rounded_terminals=rounded_terminals,
        )
        pen = TTGlyphPen(None)
        for contour in contours:
            if len(contour) < 3:
                continue
            pen.moveTo(contour[0])
            for pt in contour[1:]:
                pen.lineTo(pt)
            pen.closePath()
        glyphs[name] = pen.glyph()
        hmtx[name] = (advance, int(lsb))

    fb = FontBuilder(upm, isTTF=True)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(hmtx)
    fb.setupHorizontalHeader(ascent=ascent, descent=-descent)
    fb.setupNameTable(
        {
            "familyName": font_name,
            "styleName": style_name,
            "uniqueFontIdentifier": f"{font_name}-{style_name}",
            "fullName": f"{font_name} {style_name}",
            "psName": f"{font_name.replace(' ', '')}-{style_name}",
            "version": "Version 1.0",
        }
    )
    fb.setupOS2(
        sTypoAscender=ascent,
        sTypoDescender=-descent,
        usWinAscent=ascent,
        usWinDescent=descent,
        sxHeight=x_height,
        sCapHeight=cap_height,
    )
    fb.setupPost()
    fb.setupMaxp()
    fb.save(str(out_ttf))


def build(config_path: Path, out_dir: Path) -> None:
    raw: Any = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    data = _as_dict(raw)

    font_cfg = _as_dict(data.get("font"))
    rules = _as_dict(data.get("rules"))
    glyph_defs = _as_dict(data.get("glyphs"))

    font_name = str(font_cfg.get("name", "Calyrai Sans"))
    style_name = str(font_cfg.get("style", "Regular"))
    font_slug = font_name.lower().replace(" ", "-")

    alphabet = str(font_cfg.get("alphabet", "CALYRAI"))
    chars = [c for c in alphabet if c.strip()]

    out_dir.mkdir(parents=True, exist_ok=True)
    glyph_out = out_dir / "svg"
    glyph_out.mkdir(parents=True, exist_ok=True)

    generated_svg: list[str] = []
    for char in chars:
        cfg = _as_dict(glyph_defs.get(char))
        if not cfg:
            cfg = _fallback_glyph(char, rules)
        svg = _glyph_to_svg(char, cfg, font_cfg, rules)
        out_file = glyph_out / f"{font_slug}-{char}.svg"
        out_file.write_text(svg, encoding="utf-8")
        generated_svg.append(out_file.name)

    ttf_file = out_dir / f"{font_slug}.ttf"
    woff2_file = out_dir / f"{font_slug}.woff2"
    font_status = "not_generated"
    woff2_status = "not_generated"

    if FONTTOOLS_AVAILABLE:
        _build_ttf_font(
            out_ttf=ttf_file,
            font_name=font_name,
            style_name=style_name,
            chars=chars,
            glyph_defs=glyph_defs,
            rules=rules,
            font_cfg=font_cfg,
        )
        font_status = "generated"

        try:
            tt = TTFont(str(ttf_file))
            tt.flavor = "woff2"
            tt.save(str(woff2_file))
            tt.close()
            woff2_status = "generated"
        except Exception:
            woff2_status = "failed"

    src_parts: list[str] = []
    if woff2_file.exists():
        src_parts.append(f"url('./{font_slug}.woff2') format('woff2')")
    if ttf_file.exists():
        src_parts.append(f"url('./{font_slug}.ttf') format('truetype')")
    if not src_parts:
        src_parts.append("local('Arial')")

    src_value = ",\n    ".join(src_parts)
    css = (
        "/* Generated by calyrai font compiler. */\n"
        "@font-face {\n"
        f"  font-family: '{font_name}';\n"
        f"  src: {src_value};\n"
        "  font-weight: 100 900;\n"
        "  font-style: normal;\n"
        "  font-display: swap;\n"
        "}\n\n"
        f".font-calyrai {{ font-family: '{font_name}', sans-serif; }}\n"
    )
    css_file = out_dir / f"{font_slug}.css"
    css_file.write_text(css, encoding="utf-8")

    specimen_lines = [
        "<!DOCTYPE html>",
        "<html>",
        "<head>",
        "  <meta charset=\"utf-8\" />",
        "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
        f"  <link rel=\"stylesheet\" href=\"./{font_slug}.css\" />",
        "  <style>body{background:#060b16;color:#fff;padding:32px;font-family:Arial,sans-serif}.sample{font-size:56px;letter-spacing:0.08em}</style>",
        "</head>",
        "<body>",
        f"  <h1>{font_name} Specimen</h1>",
        f"  <div class=\"sample font-calyrai\">{alphabet}</div>",
        "  <p>SVG glyph previews are generated in ./svg.</p>",
        f"  <p>TTF status: {font_status}; WOFF2 status: {woff2_status}.</p>",
        "</body>",
        "</html>",
        "",
    ]
    specimen_file = out_dir / "specimen.html"
    specimen_file.write_text("\n".join(specimen_lines), encoding="utf-8")

    manifest = {
        "font": font_cfg,
        "rules": rules,
        "fonttools_available": FONTTOOLS_AVAILABLE,
        "generated_svg_glyphs": generated_svg,
        "artifacts": {
            "css": css_file.name,
            "specimen": specimen_file.name,
            "svg_dir": glyph_out.name,
            "ttf": ttf_file.name if ttf_file.exists() else None,
            "woff2": woff2_file.name if woff2_file.exists() else None,
        },
        "status": {
            "ttf": font_status,
            "woff2": woff2_status,
        },
        "note": "Homepage build loads this CSS automatically when the manifest is present.",
    }
    (out_dir / "font-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="calyrai-font.yml")
    parser.add_argument("--out", default="out")
    args = parser.parse_args()

    config_path = Path(args.config).resolve()
    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = config_path.parent / out_dir
    out_dir = out_dir.resolve()

    build(config_path, out_dir)
    print(f"Generated font assets in {out_dir}")


if __name__ == "__main__":
    main()
