#!/usr/bin/env python3

from __future__ import annotations

import argparse
import html
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import yaml


@dataclass(frozen=True)
class Page:
    src_path: Path
    slug: str
    title: str
    metadata: dict[str, object]
    body: str
    source_type: str


@dataclass(frozen=True)
class SharedShell:
    impressum_html: str
    site_footer_html: str


MD_LINK_RE = re.compile(r'(href=")([^\"#?]+)\.md([\"#?])')
TITLE_RE = re.compile(r"^\s*#\s+(.+?)\s*$", re.MULTILINE)
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)
SECTION_RE = re.compile(r"<section\b([^>]*)>(.*?)</section>", re.IGNORECASE | re.DOTALL)
CLASS_ATTR_RE = re.compile(r'class="([^"]*)"', re.IGNORECASE)
ID_ATTR_RE = re.compile(r'id="([^"]+)"', re.IGNORECASE)
HEADING_RE = re.compile(r"<h([1-6])[^>]*>(.*?)</h\1>", re.IGNORECASE | re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
LEADING_H1_RE = re.compile(r"^\s*<h1[^>]*>.*?</h1>\s*", re.IGNORECASE | re.DOTALL)
DOC_HEADING_RE = re.compile(r"<h([2-4])([^>]*)>(.*?)</h\1>", re.IGNORECASE | re.DOTALL)


def _die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(code)


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _load_shared_shell() -> SharedShell:
    data_path = Path(__file__).resolve().parent.parent / "src" / "data" / "impressum.yaml"
    if not data_path.exists():
        _die(f"Shared impressum config not found: {data_path}")

    data = yaml.safe_load(_read_text(data_path)) or {}
    if not isinstance(data, dict):
        _die("Shared impressum config must be a YAML mapping")

    title = str(data.get("title") or "Impressum")
    brand_html = str(data.get("brand_html") or "Calyr.ai")
    body = data.get("body") if isinstance(data.get("body"), list) else []
    contact_label = str(data.get("contact_label") or "Contact")
    contact_email = str(data.get("contact_email") or "")
    site_footer = str(data.get("site_footer") or "")

    body_html: list[str] = []
    if body:
        body_html.append(f"    <p><strong>{brand_html}</strong> {body[0]}</p>")
        for item in body[1:]:
            body_html.append(f"    <p>{item}</p>")
    else:
        body_html.append(f"    <p><strong>{brand_html}</strong></p>")

    impressum_html = "\n".join(
        [
            '<footer id="impressum" class="impressum">',
            '  <div class="impressum-inner">',
            f'    <h2 class="impressum-title">{title}</h2>',
            *body_html,
            f'    <p class="impressum-contact">{contact_label}: <a href="mailto:{contact_email}">{contact_email}</a></p>',
            "  </div>",
            "</footer>",
        ]
    )
    site_footer_html = f'<footer class="site-footer">{site_footer}</footer>'
    return SharedShell(impressum_html=impressum_html, site_footer_html=site_footer_html)


def _human_title(slug: str) -> str:
    slug = slug.replace("-", " ").replace("_", " ").strip()
    return slug.title() if slug else "Untitled"


def _extract_h1(md_text: str) -> str | None:
    m = TITLE_RE.search(md_text)
    if not m:
        return None
    t = m.group(1).strip()
    return t or None


def _extract_frontmatter(md_text: str) -> tuple[dict[str, object], str]:
    m = FRONTMATTER_RE.match(md_text)
    if not m:
        return {}, md_text

    raw = m.group(1)
    body = md_text[m.end() :]
    loaded = yaml.safe_load(raw) or {}
    if not isinstance(loaded, dict):
        _die("Project frontmatter must be a YAML mapping")
    return loaded, body


def _render_nexus_project(data: dict) -> tuple[dict[str, object], str]:
    metadata = {
        "layout": "project-home",
        "title": str(data.get("title") or "Untitled"),
        "project_id": str(data.get("project_id") or ""),
        "subtitle": str(data.get("subtitle") or ""),
        "primary_label": str(data.get("primary_label") or "Back to Projects"),
        "primary_href": str(data.get("primary_href") or "../projects.html"),
        "secondary_label": str(data.get("secondary_label") or "Explore Map"),
        "secondary_href": str(data.get("secondary_href") or "../explore.html"),
        "contact_subject": str(data.get("contact_subject") or data.get("title") or "Collaboration"),
    }

    hero = data.get("hero") if isinstance(data.get("hero"), dict) else {}
    sections = data.get("sections") if isinstance(data.get("sections"), list) else []

    stats = hero.get("stats") if isinstance(hero.get("stats"), list) else []
    stats_html = "\n".join(
        [
            f"""    <article class="nexus-stat-card">
      <div class="nexus-stat-label">{html.escape(str(item.get("label", "")))}</div>
      <div class="nexus-stat-value">{html.escape(str(item.get("value", "")))}</div>
      <p class="nexus-stat-body">{html.escape(str(item.get("text", "")))}</p>
    </article>"""
            for item in stats
            if isinstance(item, dict)
        ]
    )

    section_html: list[str] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        sid = html.escape(str(section.get("id", "")), quote=True)
        stitle = html.escape(str(section.get("title", "")))
        body = section.get("body") if isinstance(section.get("body"), list) else []
        cards = section.get("cards") if isinstance(section.get("cards"), list) else []
        layers = section.get("layers") if isinstance(section.get("layers"), list) else []
        merge_band = section.get("merge_band") if isinstance(section.get("merge_band"), list) else []
        formula = section.get("formula")
        steps = section.get("steps") if isinstance(section.get("steps"), list) else []
        section_type = str(section.get("type") or "")

        body_html = "\n".join([f'  <p class="nexus-body">{html.escape(str(p))}</p>' for p in body])
        parts = [f'<section id="{sid}" class="nexus-block">', f'  <h2 class="nexus-h2">{stitle}</h2>']
        if formula:
            parts.append(f'  <pre class="nexus-math">{html.escape(str(formula))}</pre>')
        if body_html:
            parts.append(body_html)

        if steps:
            nodes = []
            for idx, item in enumerate([i for i in steps if isinstance(i, dict)], start=1):
                nodes.append(
                    f"""<div class="nexus-flow-node">
      <span class="nexus-flow-step">{idx}</span>
      <strong>{html.escape(str(item.get("title", "")))}</strong>
      <span>{html.escape(str(item.get("text", "")))}</span>
    </div>"""
                )
            flow_html = "\n    <div class=\"nexus-flow-arrow\"></div>\n".join(nodes)
            parts.append(f'  <div class="nexus-flow">\n    {flow_html}\n  </div>')

        if layers:
            card_html = "\n".join(
                [
                    f"""    <article class="nexus-layer-card">
      <div class="nexus-layer-index">{idx}</div>
      <div>
        <h3 class="nexus-layer-title">{html.escape(str(item.get("title", "")))}</h3>
        <p class="nexus-layer-body">{html.escape(str(item.get("text", "")))}</p>
      </div>
    </article>"""
                    for idx, item in enumerate([i for i in layers if isinstance(i, dict)], start=1)
                ]
            )
            parts.append(f'  <div class="nexus-stack">\n{card_html}\n  </div>')

        if cards:
            card_html = "\n".join(
                [
                    (
                        f"""    <a class="nexus-card-link" href="{html.escape(str(item.get("href", "#")), quote=True)}">
      <article class="nexus-integration-card">
        <div class="nexus-integration-label">{html.escape(str(item.get("label", "")))}</div>
        <h3>{html.escape(str(item.get("title", "")))}</h3>
        <p>{html.escape(str(item.get("text", "")))}</p>
      </article>
    </a>"""
                        if item.get("href")
                        else f"""    <article class="nexus-integration-card">
      <div class="nexus-integration-label">{html.escape(str(item.get("label", "")))}</div>
      <h3>{html.escape(str(item.get("title", "")))}</h3>
      <p>{html.escape(str(item.get("text", "")))}</p>
    </article>"""
                    )
                    for item in cards
                    if isinstance(item, dict)
                ]
            )
            parts.append(f'  <div class="nexus-integration-grid">\n{card_html}\n  </div>')

        if merge_band:
            merge_html = "\n".join(
                [f'    <span class="nexus-merge-node">{html.escape(str(item))}</span>' for item in merge_band]
            )
            parts.append(f'  <div class="nexus-merge-band">\n{merge_html}\n  </div>')

        if section_type == "table":
            headers = section.get("headers") if isinstance(section.get("headers"), list) else []
            rows = section.get("rows") if isinstance(section.get("rows"), list) else []
            header_html = "".join([f"<th>{html.escape(str(h))}</th>" for h in headers])
            rows_html = "\n".join(
                [
                    "<tr>" + "".join([f"<td>{html.escape(str(cell))}</td>" for cell in row]) + "</tr>"
                    for row in rows
                    if isinstance(row, list)
                ]
            )
            parts.append(
                f'  <div class="nexus-table-shell"><table class="nexus-table"><thead><tr>{header_html}</tr></thead><tbody>{rows_html}</tbody></table></div>'
            )

        parts.append("</section>")
        section_html.append("\n".join(parts))

    content = f"""
<div class="nexus-intro">
<section id="overview" class="nexus-hero">
  <div class="nexus-kicker">{html.escape(str(hero.get("kicker", "")))}</div>
  <h2 class="nexus-title">{html.escape(str(hero.get("title", "")))}</h2>
  <p class="nexus-subtitle">{html.escape(str(hero.get("subtitle", "")))}</p>
  <div class="nexus-hero-grid">
{stats_html}
  </div>
</section>

{chr(10).join(section_html)}
</div>
""".strip()
    return metadata, content


def _rewrite_md_links(html: str, project_slug: str | None, page_slug: str) -> str:
    def repl(match: re.Match[str]) -> str:
        prefix, target, suffix = match.groups()
        rewritten = f"{target}.html"

        if project_slug:
            if page_slug == "index":
                if target == "index":
                    rewritten = f"{project_slug}.html"
                else:
                    rewritten = f"{project_slug}/{target}.html"
            else:
                if target == "index":
                    rewritten = f"../{project_slug}.html"
                else:
                    rewritten = f"{target}.html"

        return f"{prefix}{rewritten}{suffix}"

    return MD_LINK_RE.sub(repl, html)


def _convert_markdown(md_text: str, project_slug: str | None, page_slug: str) -> str:
    try:
        import markdown  # type: ignore
    except Exception:
        _die(
            "Python package 'markdown' is not installed. Run: python3 -m pip install -r scripts/requirements.txt",
            code=2,
        )

    html = markdown.markdown(md_text, extensions=["fenced_code", "tables"])
    html = _rewrite_md_links(html, project_slug=project_slug, page_slug=page_slug)
    return html


def _load_template(path: Path) -> str:
    if not path.exists():
        _die(f"Template not found: {path}")
    return _read_text(path)


def _discover_pages(project_dir: Path) -> list[Page]:
    src_files = sorted(
        [p for p in project_dir.iterdir() if p.is_file() and p.suffix.lower() in {".md", ".yaml", ".yml"}]
    )
    yaml_stems = {p.stem.lower() for p in src_files if p.suffix.lower() in {".yaml", ".yml"}}
    src_files = [
        p for p in src_files
        if not (p.suffix.lower() == ".md" and p.stem.lower() in yaml_stems)
    ]

    def sort_key(p: Path) -> tuple[int, str]:
        if p.stem.lower() == "index":
            return (0, "")
        return (1, p.name.lower())

    src_files.sort(key=sort_key)

    pages: list[Page] = []
    for src_path in src_files:
        slug = src_path.stem
        if src_path.suffix.lower() == ".md":
            md_text = _read_text(src_path)
            metadata, body = _extract_frontmatter(md_text)
            h1 = _extract_h1(body)
            title = str(metadata.get("title") or h1 or _human_title(slug))
            pages.append(Page(src_path=src_path, slug=slug, title=title, metadata=metadata, body=body, source_type="md"))
            continue

        data = yaml.safe_load(_read_text(src_path)) or {}
        if not isinstance(data, dict):
            _die(f"Project YAML root must be a mapping: {src_path}")
        kind = str(data.get("kind") or "")
        if kind != "nexus_project":
            _die(f"Unsupported project YAML kind '{kind}' in {src_path}")
        metadata, body = _render_nexus_project(data)
        title = str(metadata.get("title") or _human_title(slug))
        pages.append(Page(src_path=src_path, slug=slug, title=title, metadata=metadata, body=body, source_type="yaml"))

    return pages


def _build_sidebar(pages: list[Page], active_slug: str, project_slug: str) -> str:
    links: list[str] = ["<nav class=\"sidebar-nav\" aria-label=\"Project pages\">"]
    for page in pages:
        cls = "sidebar-link active" if page.slug == active_slug else "sidebar-link"
        if page.slug == "index":
            href = f"../{project_slug}.html"
        else:
            href = f"{page.slug}.html"
        label = page.title
        links.append(f"  <a class=\"{cls}\" href=\"{href}\">{label}</a>")
    links.append("</nav>")
    return "\n".join(links)


def _render_page(
    template: str,
    title: str,
    project_slug: str,
    project_title: str,
    page_title: str,
    sidebar_html: str,
    content_html: str,
    outline_html: str,
    shell: SharedShell,
) -> str:
    contact_subject = f"{project_title} — {page_title}" if page_title and project_title else (page_title or project_title)
    out = template
    out = out.replace("{{TITLE}}", title)
    out = out.replace("{{PROJECT_ID}}", project_slug)
    out = out.replace("{{PROJECT_SLUG}}", project_slug)
    out = out.replace("{{PROJECT_TITLE}}", project_title)
    out = out.replace("{{DOC_TITLE}}", f"{project_title} — {page_title}")
    out = out.replace("{{DOC_SUBTITLE}}", f"Working notes and secondary material for {project_title}, focused on {page_title.lower()}.")
    out = out.replace("{{CONTACT_HREF}}", f"mailto:rupert.tscheliessnig@calyr.ai?subject={contact_subject.replace(' ', '%20')}")
    out = out.replace("{{SIDEBAR}}", sidebar_html)
    out = out.replace("{{DOC_OUTLINE}}", outline_html)
    out = out.replace("{{CONTENT}}", LEADING_H1_RE.sub("", content_html, count=1))
    out = out.replace("{{IMPRESSUM}}", shell.impressum_html)
    out = out.replace("{{SITE_FOOTER}}", shell.site_footer_html)
    return out


def _render_project_home(
    template: str,
    page: Page,
    project_slug: str,
    content_html: str,
    outline_html: str,
    shell: SharedShell,
) -> str:
    title = str(page.metadata.get("title") or page.title)
    subtitle = str(page.metadata.get("subtitle") or "")
    project_id = str(page.metadata.get("project_id") or project_slug)
    primary_label = str(page.metadata.get("primary_label") or "Back to Projects")
    primary_href = str(page.metadata.get("primary_href") or f"../projects.html#project-{project_id}")
    secondary_label = str(page.metadata.get("secondary_label") or "Explore Map")
    secondary_href = str(page.metadata.get("secondary_href") or "../explore.html")
    contact_subject = str(page.metadata.get("contact_subject") or title)
    contact_href = f"mailto:rupert.tscheliessnig@calyr.ai?subject={contact_subject.replace(' ', '%20')}"

    out = template
    out = out.replace("{{TITLE}}", f"Calyr.ai – {title}")
    out = out.replace("{{PROJECT_ID}}", project_id)
    out = out.replace("{{PROJECT_TITLE}}", title)
    out = out.replace("{{PROJECT_SUBTITLE}}", subtitle)
    out = out.replace("{{PRIMARY_LABEL}}", primary_label)
    out = out.replace("{{PRIMARY_HREF}}", primary_href)
    out = out.replace("{{SECONDARY_LABEL}}", secondary_label)
    out = out.replace("{{SECONDARY_HREF}}", secondary_href)
    out = out.replace("{{CONTACT_HREF}}", contact_href)
    out = out.replace("{{PROJECT_OUTLINE}}", outline_html)
    out = out.replace("{{CONTENT}}", content_html)
    out = out.replace("{{IMPRESSUM}}", shell.impressum_html)
    out = out.replace("{{SITE_FOOTER}}", shell.site_footer_html)
    return out


def _strip_tags(text: str) -> str:
    return TAG_RE.sub("", text).strip()


def _decorate_project_home_content(content_html: str) -> str:
    def repl(match: re.Match[str]) -> str:
        attrs = match.group(1) or ""
        class_match = CLASS_ATTR_RE.search(attrs)
        desired = ["nexus-block", "project-section"]

        if class_match:
            existing = [part for part in class_match.group(1).split() if part]
            merged = desired + [part for part in existing if part not in desired]
            attrs = CLASS_ATTR_RE.sub(f'class="{" ".join(merged)}"', attrs, count=1)
        else:
            attrs = f'{attrs} class="nexus-block project-section"'

        return f"<section{attrs}>"

    return re.sub(r"<section\b([^>]*)>", repl, content_html, flags=re.IGNORECASE)


def _build_project_outline(content_html: str) -> str:
    links: list[str] = []

    for match in SECTION_RE.finditer(content_html):
        attrs, inner = match.groups()
        id_match = ID_ATTR_RE.search(attrs)
        heading_match = HEADING_RE.search(inner)
        if not id_match or not heading_match:
            continue

        target = id_match.group(1).strip()
        label = _strip_tags(html.unescape(heading_match.group(2)))
        if not target or not label:
            continue

        links.append(f'        <a class="nexus-outline-link" href="#{target}">{html.escape(label)}</a>')

    if not links:
        return ""

    return "\n".join(
        [
            '      <nav class="nexus-outline project-outline" aria-label="Project sections">',
            *links,
            "      </nav>",
        ]
    )


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "section"


def _decorate_doc_content(content_html: str) -> tuple[str, str]:
    seen: set[str] = set()
    links: list[str] = []

    def repl(match: re.Match[str]) -> str:
        level, attrs, inner = match.groups()
        attrs = attrs or ""
        id_match = ID_ATTR_RE.search(attrs)
        label = _strip_tags(html.unescape(inner))
        target = id_match.group(1).strip() if id_match else _slugify(label)

        base_target = target
        suffix = 2
        while target in seen:
            target = f"{base_target}-{suffix}"
            suffix += 1
        seen.add(target)

        if id_match:
            attrs = ID_ATTR_RE.sub(f'id="{target}"', attrs, count=1)
        else:
            attrs = f'{attrs} id="{target}"'

        links.append(f'        <a class="nexus-outline-link" href="#{target}">{html.escape(label)}</a>')
        return f"<h{level}{attrs}>{inner}</h{level}>"

    decorated = DOC_HEADING_RE.sub(repl, content_html)

    if not links:
        return decorated, ""

    outline_html = "\n".join(
        [
            '        <nav class="nexus-outline project-outline project-doc-outline" aria-label="Document sections">',
            *links,
            "        </nav>",
        ]
    )
    return decorated, outline_html


def build_projects(
    src: Path,
    out_root: Path,
    template_path: Path,
    home_template_path: Path,
    clean: bool,
    project: str | None,
) -> None:
    if not src.exists():
        _die(f"Source folder not found: {src}")

    template = _load_template(template_path)
    home_template = _load_template(home_template_path)
    shell = _load_shared_shell()

    candidates = [p for p in sorted(src.iterdir()) if p.is_dir()]
    if project:
        candidates = [p for p in candidates if p.name == project]
        if not candidates:
            _die(f"Project not found under {src}: {project}")

    if not candidates:
        _die(f"No projects found under {src}")

    for project_dir in candidates:
        pages = _discover_pages(project_dir)
        if not pages:
            continue

        project_home_page = next((page for page in pages if page.slug == "index"), pages[0])

        out_dir = out_root / project_dir.name
        flat_home = out_root / f"{project_dir.name}.html"
        if clean and flat_home.exists():
            flat_home.unlink()
        if clean and out_dir.exists():
            for child in out_dir.iterdir():
                if child.is_file() and child.suffix.lower() == ".html":
                    child.unlink()

        for page in pages:
            html = (
                _convert_markdown(page.body, project_slug=project_dir.name, page_slug=page.slug)
                if page.source_type == "md"
                else page.body
            )

            if page.slug == "index":
                decorated_html = _decorate_project_home_content(html)
                outline_html = _build_project_outline(decorated_html)
                rendered = _render_project_home(
                    home_template,
                    page,
                    project_slug=project_dir.name,
                    content_html=decorated_html,
                    outline_html=outline_html,
                    shell=shell,
                )
                out_path = flat_home
            else:
                sidebar = _build_sidebar(pages, active_slug=page.slug, project_slug=project_dir.name)
                decorated_doc_html, doc_outline_html = _decorate_doc_content(html)
                doc_title = f"Calyr.ai – {project_home_page.title} — {page.title}"
                rendered = _render_page(
                    template,
                    doc_title,
                    project_slug=project_dir.name,
                    project_title=project_home_page.title,
                    page_title=page.title,
                    sidebar_html=sidebar,
                    content_html=decorated_doc_html,
                    outline_html=doc_outline_html,
                    shell=shell,
                )
                out_path = out_dir / f"{page.slug}.html"

            _write_text(out_path, rendered)

    print(f"Built projects from {src} -> {out_root}")


def _default_out_root() -> Path:
    configured = os.environ.get("CALYRAI_PROJECTS_OUT", "").strip()
    if configured:
        return Path(configured)

    # Preferred for the new framework layout: generate into src/ so build_public.sh can copy it into public/.
    if Path("src").is_dir():
        return Path("src") / "projects"

    if Path("public").is_dir():
        return Path("public") / "projects"

    return Path("projects")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Build Calyr.ai project docs from Markdown")
    parser.add_argument("--src", default="projects_src", help="Markdown source folder")
    parser.add_argument("--out", default=None, help="Output folder (default: public/projects if public/ exists, else projects/)")
    parser.add_argument("--template", default="templates/project_template.html", help="HTML template")
    parser.add_argument("--home-template", default="templates/project_home_template.html", help="HTML template for project homepages")
    parser.add_argument("--clean", action="store_true", help="Remove previously-generated .html in each project output folder")
    parser.add_argument("--project", default=None, help="Build only one project (folder name under --src)")

    args = parser.parse_args(argv)

    src = Path(args.src)
    out_root = Path(args.out) if args.out else _default_out_root()
    template_path = Path(args.template)
    home_template_path = Path(args.home_template)

    build_projects(
        src=src,
        out_root=out_root,
        template_path=template_path,
        home_template_path=home_template_path,
        clean=args.clean,
        project=args.project,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
