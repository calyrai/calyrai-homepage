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


@dataclass(frozen=True)
class SharedShell:
    impressum_html: str
    site_footer_html: str


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


def _render_nav(items: list[object]) -> str:
        out: list[str] = []
        for raw in items:
                if not isinstance(raw, dict):
                        continue
                href = _esc_attr(raw.get("href", "#"))
                label = _text_or_html(raw)
                out.append(f'<a href="{href}" class="nav-pill glow-nav">{label}</a>')
        return "\n      ".join(out)


def _render_header(nav: dict) -> str:
        nav_left = nav.get("left") if isinstance(nav.get("left"), list) else []
        nav_right = nav.get("right") if isinstance(nav.get("right"), list) else []
        return f"""
<header class=\"site-header\">
  <div class=\"nav-inner\">
    <div class=\"nav-left-row\">
      {_render_nav(nav_left)}
    </div>

    <nav class=\"nav-links\" aria-label=\"Primary\">
      {_render_nav(nav_right)}
    </nav>
  </div>
</header>
""".strip()


def _render_impressum(data: dict) -> SharedShell:
        title = _esc_html(data.get("title", "Impressum"))
        brand_html = str(data.get("brand_html", "Calyr.ai"))
        location = _esc_html(data.get("location", ""))
        body = data.get("body") if isinstance(data.get("body"), list) else []
        contact_label = _esc_html(data.get("contact_label", "Contact"))
        contact_email = _esc_attr(data.get("contact_email", ""))
        site_footer = _esc_html(data.get("site_footer", ""))

        body_html: list[str] = []
        if body:
                first = _esc_html(body[0])
                body_html.append(f"    <p><strong>{brand_html}</strong> {first}</p>")
                for item in body[1:]:
                        body_html.append(f"    <p>{_esc_html(item)}</p>")
        else:
                location_suffix = f" ({location})" if location else ""
                body_html.append(f"    <p><strong>{brand_html}</strong>{location_suffix}</p>")

        impressum = "\n".join(
                [
                        '<footer id="impressum" class="impressum">',
                        '  <div class="impressum-inner">',
                        f"    <h2 class=\"impressum-title\">{title}</h2>",
                        *body_html,
                        f"    <p class=\"impressum-contact\">{contact_label}: <a href=\"mailto:{contact_email}\">{contact_email}</a></p>",
                        "  </div>",
                        "</footer>",
                ]
        )
        site_footer_html = f'<footer class="site-footer">{site_footer}</footer>'
        return SharedShell(impressum_html=impressum, site_footer_html=site_footer_html)


def _render_index_body(data: dict) -> str:
        nav = data.get("nav") if isinstance(data.get("nav"), dict) else {}
        hero = data.get("hero") if isinstance(data.get("hero"), dict) else {}
        cta = hero.get("cta") if isinstance(hero.get("cta"), dict) else {}
        orbit = hero.get("orbit") if isinstance(hero.get("orbit"), dict) else {}

        nav_left = nav.get("left") if isinstance(nav.get("left"), list) else []
        nav_right = nav.get("right") if isinstance(nav.get("right"), list) else []

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
{_render_header(nav)}

<section class=\"hero\" id=\"hero\">
    <div class=\"hero-orbit-logo\">
        <div class=\"hero-orbit-stack\">
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

            <a href=\"{cta_href}\" class=\"hero-cta hero-cta--orbit glow-button\">{cta_text}</a>
        </div>

        <div class=\"hero-characteristics hero-characteristics--orbit\">{characteristics}</div>
    </div>

    <div class=\"hero-copy\">
        <div class=\"hero-kicker\">{kicker}</div>

        <h1 class=\"hero-title\">{title_html}</h1>

        <p class=\"hero-subtitle\">
            {subtitle}
        </p>
    </div>
</section>
""".strip()


def _render_nexus_page(data: dict) -> str:
        nav = data.get("nav") if isinstance(data.get("nav"), dict) else {}
        hero = data.get("hero") if isinstance(data.get("hero"), dict) else {}
        outline = data.get("outline") if isinstance(data.get("outline"), list) else []
        concept = data.get("concept") if isinstance(data.get("concept"), dict) else {}
        layers = data.get("layers") if isinstance(data.get("layers"), dict) else {}
        works = data.get("works") if isinstance(data.get("works"), dict) else {}
        map_block = data.get("map") if isinstance(data.get("map"), dict) else {}

        stats = hero.get("stats") if isinstance(hero.get("stats"), list) else []
        concept_body = concept.get("body") if isinstance(concept.get("body"), list) else []
        concept_steps = concept.get("steps") if isinstance(concept.get("steps"), list) else []
        layer_cards = layers.get("cards") if isinstance(layers.get("cards"), list) else []
        work_entries = works.get("entries") if isinstance(works.get("entries"), list) else []
        map_body = map_block.get("body") if isinstance(map_block.get("body"), list) else []

        stats_html = "\n".join(
                [
                        f"""<article class="nexus-stat-card">
            <div class="nexus-stat-label">{_esc_html(item.get("label", ""))}</div>
            <div class="nexus-stat-value">{_esc_html(item.get("value", ""))}</div>
            <p class="nexus-stat-body">{_esc_html(item.get("text", ""))}</p>
          </article>"""
                        for item in stats
                        if isinstance(item, dict)
                ]
        )

        outline_html = "\n        ".join(
                [
                        f'<a class="nexus-outline-link" href="#{_esc_attr(item.get("id", ""))}">{_esc_html(item.get("label", ""))}</a>'
                        for item in outline
                        if isinstance(item, dict)
                ]
        )

        concept_body_html = "\n        ".join([f'<p class="nexus-body">{_esc_html(p)}</p>' for p in concept_body])
        concept_steps_html = "\n          ".join(
                [
                        f"""<div class="nexus-flow-node">
              <span class="nexus-flow-step">{index}</span>
              <strong>{_esc_html(item.get("title", ""))}</strong>
              <span>{_esc_html(item.get("text", ""))}</span>
            </div>"""
                        for index, item in enumerate([i for i in concept_steps if isinstance(i, dict)], start=1)
                ]
        )
        concept_flow_html = concept_steps_html.replace("</div>\n          <div class=\"nexus-flow-node\">", "</div>\n          <div class=\"nexus-flow-arrow\"></div>\n          <div class=\"nexus-flow-node\">")

        layer_cards_html = "\n          ".join(
                [
                        f"""<a class="nexus-card-link" href="{_esc_attr(item.get("href", "#"))}">
            <article class="nexus-integration-card">
              <div class="nexus-integration-label">{_esc_html(item.get("label", ""))}</div>
              <h3>{_esc_html(item.get("title", ""))}</h3>
              <p>{_esc_html(item.get("text", ""))}</p>
            </article>
          </a>"""
                        for item in layer_cards
                        if isinstance(item, dict)
                ]
        )

        works_html = "\n          ".join(
                [
                        f"""<a class="nexus-card-link" href="{_esc_attr(item.get("href", "#"))}">
            <article class="nexus-integration-card">
              <div class="nexus-integration-label">Work</div>
              <h3>{_esc_html(item.get("title", ""))}</h3>
              <p>{_esc_html(item.get("text", ""))}</p>
            </article>
          </a>"""
                        for item in work_entries
                        if isinstance(item, dict)
                ]
        )

        map_body_html = "\n        ".join([f'<p class="nexus-body">{_esc_html(p)}</p>' for p in map_body])

        return f"""
{_render_header(nav)}

<main class="explore-page nexus-page">
  <section class="explore-shell" aria-label="Nexus">
    <div class="nexus-intro">
      <section class="nexus-hero" aria-label="Hero">
        <div class="nexus-kicker">{_esc_html(hero.get("kicker", ""))}</div>
        <h1 class="nexus-title">{_esc_html(hero.get("title", ""))}</h1>
        <p class="nexus-subtitle">{_esc_html(hero.get("subtitle", ""))}</p>
        <div class="nexus-hero-grid">
          {stats_html}
        </div>
      </section>

      <nav class="nexus-outline" aria-label="Nexus sections">
        {outline_html}
      </nav>

      <section id="concept" class="nexus-block">
        <h2 class="nexus-h2">{_esc_html(concept.get("title", ""))}</h2>
        <pre class="nexus-math">{_esc_html(concept.get("formula", ""))}</pre>
        {concept_body_html}
        <div class="nexus-flow">
          {concept_flow_html}
        </div>
      </section>

      <section id="layers" class="nexus-block">
        <h2 class="nexus-h2">{_esc_html(layers.get("title", ""))}</h2>
        <p class="nexus-body">{_esc_html(layers.get("body", ""))}</p>
        <div class="nexus-integration-grid">
          {layer_cards_html}
        </div>
      </section>

      <section id="works" class="nexus-block">
        <h2 class="nexus-h2">{_esc_html(works.get("title", ""))}</h2>
        <p class="nexus-body">{_esc_html(works.get("body", ""))}</p>
        <div class="nexus-integration-grid">
          {works_html}
        </div>
      </section>

      <section id="map" class="nexus-block">
        <div class="nexus-section-head">
          <div>
            <h2 class="nexus-h2">{_esc_html(map_block.get("title", ""))}</h2>
            {map_body_html}
          </div>
          <a class="nexus-inline-link" href="{_esc_attr(map_block.get("explore_href", "../explore.html"))}">{_esc_html(map_block.get("explore_label", "Open full explore map"))}</a>
        </div>
        <div id="nexus-graph" aria-label="Interactive system">
          <div class="explore-stage" id="explore-stage">
            <svg id="explore-svg" class="explore-svg" role="img" aria-label="Interactive nexus graph" data-collect-id="nexus-graph" data-collect-title="Nexus graph"></svg>
          </div>
          <div class="explore-links" aria-label="Node links"></div>
        </div>
      </section>
      <!-- CALYR_CONTACT_BLOCK -->
    </div>
  </section>
</main>

<script defer src="../data/projects.js"></script>
<script defer src="../js/explore_map.js"></script>
""".strip()


def _convert_source(path: Path) -> str:
        if path.suffix.lower() == ".md":
                return _convert_markdown(_read_text(path))
        if path.suffix.lower() == ".html":
                return _read_text(path)
        if path.suffix.lower() in {".yaml", ".yml"}:
                data = _load_yaml(path)
                kind = data.get("kind")
                if kind == "index":
                        return _render_index_body(data)
                if kind == "nexus_page":
                        return _render_nexus_page(data)
                _die(f"Unsupported YAML page kind '{kind}' in {path}")
        _die(f"Unsupported page source type: {path}")
        return ""


def _load_template(path: Path) -> str:
    if not path.exists():
        _die(f"Template not found: {path}")
    return _read_text(path)


def _render(template: str, content_html: str, shell: SharedShell) -> str:
    if "{{CONTENT}}" not in template:
        _die("Template missing required placeholder {{CONTENT}}")
    rendered = template.replace("{{CONTENT}}", content_html)
    rendered = rendered.replace("{{IMPRESSUM}}", shell.impressum_html)
    rendered = rendered.replace("{{SITE_FOOTER}}", shell.site_footer_html)
    return rendered


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
            src_path=src_root / "pages" / "nexus.yaml",
            template_path=template_root / "pages" / "nexus.template.html",
            out_path=out_root / "pages" / "nexus.html",
        ),
        SitePage(
            src_path=src_root / "pages" / "contact.html",
            template_path=template_root / "pages" / "contact.template.html",
            out_path=out_root / "pages" / "contact.html",
        ),
    ]


def build_pages(src_root: Path, template_root: Path, out_root: Path) -> None:
    pages = _default_pages(src_root=src_root, template_root=template_root, out_root=out_root)
    data_path = Path(__file__).resolve().parent.parent / "src" / "data" / "impressum.yaml"
    shell = _render_impressum(_load_yaml(data_path))

    for p in pages:
        if not p.src_path.exists():
            _die(f"Page source not found: {p.src_path}")
        html = _convert_source(p.src_path)
        if p.src_path.suffix.lower() == ".html":
            rendered = html
        else:
            template = _load_template(p.template_path)
            rendered = _render(template, html, shell)
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
