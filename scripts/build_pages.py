#!/usr/bin/env python3

from __future__ import annotations

import argparse
import html
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class SitePage:
    src_path: Path
    template_path: Path
    out_path: Path


def _die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(code)


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _convert_markdown(md_text: str) -> str:
    try:
        import markdown  # type: ignore
    except Exception:
        _die(
            "Python package 'markdown' is not installed. Run: python3 -m pip install -r scripts/requirements.txt",
            code=2,
        )

    # We intentionally allow raw HTML blocks in Markdown.
    return markdown.markdown(md_text, extensions=["fenced_code", "tables"])


def _load_yaml(path: Path) -> dict:
        try:
                import yaml  # type: ignore
        except Exception:
                _die(
                        "Python package 'pyyaml' is not installed. Run: python3 -m pip install -r scripts/requirements.txt",
                        code=2,
                )

        try:
                data = yaml.safe_load(_read_text(path))
        except Exception as e:
                _die(f"Failed to parse YAML: {path} ({e})")

        if data is None:
                return {}
        if not isinstance(data, dict):
                _die(f"YAML root must be a mapping/object: {path}")
        return data


def _esc_html(value: object) -> str:
        return html.escape(str(value if value is not None else ""), quote=False)


def _esc_attr(value: object) -> str:
        # Escape for attribute context.
        return html.escape(str(value if value is not None else ""), quote=True)


def _text_or_html(item: dict, key_text: str = "text", key_html: str = "text_html") -> str:
        if key_html in item and item[key_html] is not None:
                return str(item[key_html])
        return _esc_html(item.get(key_text, ""))


def _render_index_body(data: dict) -> str:
        nav = data.get("nav") if isinstance(data.get("nav"), dict) else {}
        hero = data.get("hero") if isinstance(data.get("hero"), dict) else {}
        cta = hero.get("cta") if isinstance(hero.get("cta"), dict) else {}
        orbit = hero.get("orbit") if isinstance(hero.get("orbit"), dict) else {}

        nav_left = nav.get("left") if isinstance(nav.get("left"), list) else []
        nav_right = nav.get("right") if isinstance(nav.get("right"), list) else []

        def render_nav(items: list[object]) -> str:
                out: list[str] = []
                for raw in items:
                        if not isinstance(raw, dict):
                                continue
                        href = _esc_attr(raw.get("href", "#"))
                        label = _text_or_html(raw)
                        out.append(f'<a href="{href}" class="nav-pill glow-nav">{label}</a>')
                return "\n      ".join(out)

        kicker = _esc_html(hero.get("kicker", ""))
        subtitle = _esc_html(hero.get("subtitle", ""))
        characteristics = _esc_html(hero.get("characteristics", ""))
        cta_href = _esc_attr(cta.get("href", "pages/nexus.html"))
        cta_text = _esc_html(cta.get("text", "Explore the Nexus"))

        title_html = str(hero.get("title_html", ""))

        orbit_label = _esc_attr(orbit.get("aria_label", "Calyrai"))
        orbit_size_css = _esc_attr(orbit.get("size_css", "min(48vmin, 360px)"))
        orbit_accent_rot = _esc_attr(orbit.get("accent_rot", "140s"))

        # NOTE: SVG is intentionally inlined here (not YAML) to keep the YAML readable.
        orbit_svg = f"""
            <svg class=\"orbit-logo__svg\" viewBox=\"0 0 200 200\" role=\"img\" aria-label=\"{orbit_label}\" focusable=\"false\">
                <defs>
                    <linearGradient id=\"orbit-logo-home-whiteCyan\" x1=\"30\" y1=\"30\" x2=\"170\" y2=\"170\" gradientUnits=\"userSpaceOnUse\">
                        <stop offset=\"0%\" stop-color=\"#ffffff\" stop-opacity=\"0.96\" />
                        <stop offset=\"40%\" stop-color=\"#ffffff\" stop-opacity=\"0.96\" />
                        <stop offset=\"68%\" stop-color=\"#24f3ff\" stop-opacity=\"0.92\" />
                        <stop offset=\"100%\" stop-color=\"#ffffff\" stop-opacity=\"0.96\" />
                    </linearGradient>

                    <linearGradient id=\"orbit-logo-home-magenta\" x1=\"170\" y1=\"40\" x2=\"35\" y2=\"160\" gradientUnits=\"userSpaceOnUse\">
                        <stop offset=\"0%\" stop-color=\"#ff4df5\" stop-opacity=\"0.92\" />
                        <stop offset=\"55%\" stop-color=\"#ffffff\" stop-opacity=\"0.22\" />
                        <stop offset=\"100%\" stop-color=\"#ff4df5\" stop-opacity=\"0.82\" />
                    </linearGradient>

                    <linearGradient id=\"orbit-logo-home-soft\" x1=\"40\" y1=\"25\" x2=\"160\" y2=\"175\" gradientUnits=\"userSpaceOnUse\">
                        <stop offset=\"0%\" stop-color=\"#ffffff\" stop-opacity=\"0.42\" />
                        <stop offset=\"60%\" stop-color=\"#ffffff\" stop-opacity=\"0.06\" />
                        <stop offset=\"100%\" stop-color=\"#24f3ff\" stop-opacity=\"0.22\" />
                    </linearGradient>

                    <filter id=\"orbit-logo-home-glowWhite\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">
                        <feGaussianBlur stdDeviation=\"4.5\" result=\"b\" />
                        <feMerge>
                            <feMergeNode in=\"b\" />
                            <feMergeNode in=\"SourceGraphic\" />
                        </feMerge>
                    </filter>

                    <filter id=\"orbit-logo-home-glowMagenta\" x=\"-60%\" y=\"-60%\" width=\"220%\" height=\"220%\">
                        <feGaussianBlur stdDeviation=\"3.0\" result=\"b\" />
                        <feMerge>
                            <feMergeNode in=\"b\" />
                            <feMergeNode in=\"SourceGraphic\" />
                        </feMerge>
                    </filter>

                </defs>

                <g class=\"orbit-logo__ring-c\">
                    <circle class=\"orbit-logo__stroke\" cx=\"100\" cy=\"100\" r=\"84\"
                        stroke=\"url(#orbit-logo-home-soft)\" stroke-width=\"10\"
                        stroke-dasharray=\"420 110\" stroke-linecap=\"round\" />
                </g>

                <g class=\"orbit-logo__ring-b\" filter=\"url(#orbit-logo-home-glowMagenta)\">
                    <circle class=\"orbit-logo__stroke\" cx=\"100\" cy=\"100\" r=\"66\"
                        stroke=\"url(#orbit-logo-home-magenta)\" stroke-width=\"14\"
                        stroke-dasharray=\"300 114\" stroke-linecap=\"round\" />
                </g>

                <g class=\"orbit-logo__ring\" filter=\"url(#orbit-logo-home-glowWhite)\">
                    <circle class=\"orbit-logo__stroke\" cx=\"100\" cy=\"100\" r=\"48\"
                        stroke=\"url(#orbit-logo-home-whiteCyan)\" stroke-width=\"22\"
                        stroke-dasharray=\"235 68\" stroke-linecap=\"round\" />
                </g>

                <g class=\"orbit-logo__accent\" filter=\"url(#orbit-logo-home-glowMagenta)\">
                    <g transform=\"translate(126 98) rotate(-10)\">
                        <path d=\"M 0 -18 L 92 -18 L 76 18 L -16 18 Z\" fill=\"#ff4df5\" fill-opacity=\"0.96\" />
                        <path d=\"M 6 -22 L 96 -22 L 90 -10 L 0 -10 Z\" fill=\"#24f3ff\" fill-opacity=\"0.78\" />
                        <path d=\"M -14 -10 L 10 -10 L 4 10 L -20 10 Z\" fill=\"#ffffff\" fill-opacity=\"0.65\" />
                    </g>
                </g>
            </svg>
        """.strip()

        return f"""
<header class=\"site-header\">
    <div class=\"nav-inner\">
        <div class=\"nav-left-row\">
            {render_nav(nav_left)}
        </div>

        <nav class=\"nav-links\" aria-label=\"Primary\">
            {render_nav(nav_right)}
        </nav>
    </div>
</header>

<section class=\"hero\" id=\"hero\">
    <div class=\"hero-orbit-logo\">
        <div
            data-orbit-logo
            class=\"orbit-logo\"
            id=\"orbit-logo-home\"
            role=\"button\"
            tabindex=\"0\"
            aria-label=\"{orbit_label}\"
            style=\"--orbit-size: {orbit_size_css}; --orbit-accent-rot: {orbit_accent_rot};\"
        >
            {orbit_svg}
        </div>
    </div>

    <div class=\"hero-copy\">
        <div class=\"hero-kicker\">{kicker}</div>

        <h1 class=\"hero-title\">{title_html}</h1>

        <p class=\"hero-subtitle\">
            {subtitle}
        </p>

        <a href=\"{cta_href}\" class=\"hero-cta glow-button\">{cta_text}</a>

        <div class=\"hero-characteristics\">{characteristics}</div>
    </div>
</section>

<section class=\"home-architecture\" aria-label=\"Architecture\">
    <div id=\"home-architecture\"></div>
</section>

<footer id=\"impressum\" class=\"impressum\">
    <div class=\"impressum-inner\">
        <h2 class=\"impressum-title\">Impressum</h2>
        <p>
            <strong>CalyrAI</strong> is a private research project by Rupert Gelisnig (Vienna).
        </p>
        <p>
            It is currently not a company, involves no commercial activity, offers no services
            and sells nothing. All content is provided solely for scientific reflection,
            conceptual exploration and academic exchange.
        </p>
        <p class=\"impressum-contact\">
            Contact:
            <a href=\"mailto:rupert.tscheliessnig@calyr.ai\">rupert.tscheliessnig@calyr.ai</a>
        </p>
    </div>
</footer>

<footer class=\"site-footer\">
    © 2025 Calyr.ai™ — All rights reserved.
</footer>
""".strip()


def _convert_source(path: Path) -> str:
        if path.suffix.lower() == ".md":
                return _convert_markdown(_read_text(path))
        if path.suffix.lower() in {".yaml", ".yml"}:
                data = _load_yaml(path)
                kind = data.get("kind")
                if kind != "index":
                        _die(f"Unsupported YAML page kind '{kind}' in {path} (expected kind: index)")
                return _render_index_body(data)
        _die(f"Unsupported page source type: {path}")
        return ""


def _load_template(path: Path) -> str:
    if not path.exists():
        _die(f"Template not found: {path}")
    return _read_text(path)


def _render(template: str, content_html: str) -> str:
    if "{{CONTENT}}" not in template:
        _die("Template missing required placeholder {{CONTENT}}")
    return template.replace("{{CONTENT}}", content_html)


def _default_pages(src_root: Path, template_root: Path, out_root: Path) -> list[SitePage]:
    return [
        SitePage(
            src_path=src_root / "index.yaml",
            template_path=template_root / "index.template.html",
            out_path=out_root / "index.html",
        ),
        SitePage(
            src_path=src_root / "team.md",
            template_path=template_root / "team.template.html",
            out_path=out_root / "team.html",
        ),
        SitePage(
            src_path=src_root / "explore.md",
            template_path=template_root / "explore.template.html",
            out_path=out_root / "explore.html",
        ),
        SitePage(
            src_path=src_root / "projects.md",
            template_path=template_root / "projects.template.html",
            out_path=out_root / "projects.html",
        ),
        SitePage(
            src_path=src_root / "pages" / "nexus.md",
            template_path=template_root / "pages" / "nexus.template.html",
            out_path=out_root / "pages" / "nexus.html",
        ),
        SitePage(
            src_path=src_root / "pages" / "qr_noise.md",
            template_path=template_root / "pages" / "qr_noise.template.html",
            out_path=out_root / "pages" / "qr_noise.html",
        ),
    ]


def build_pages(src_root: Path, template_root: Path, out_root: Path) -> None:
    pages = _default_pages(src_root=src_root, template_root=template_root, out_root=out_root)

    for p in pages:
        if not p.src_path.exists():
            _die(f"Page source not found: {p.src_path}")
        template = _load_template(p.template_path)
        html = _convert_source(p.src_path)
        rendered = _render(template, html)
        _write_text(p.out_path, rendered)

    print(f"Built site pages from {src_root} -> {out_root}")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Build Calyr.ai site pages from page sources (Markdown/YAML)")
    parser.add_argument("--src", default="pages_src", help="Page sources root")
    parser.add_argument("--templates", default="templates/pages", help="HTML templates root")
    parser.add_argument("--out", default="src", help="Output root (writes .html pages)")

    args = parser.parse_args(argv)

    build_pages(src_root=Path(args.src), template_root=Path(args.templates), out_root=Path(args.out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
