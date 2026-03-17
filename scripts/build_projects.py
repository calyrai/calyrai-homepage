#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Page:
    md_path: Path
    slug: str
    title: str


MD_LINK_RE = re.compile(r'(href=")([^\"#?]+)\.md([\"#?])')
TITLE_RE = re.compile(r"^\s*#\s+(.+?)\s*$", re.MULTILINE)


def _die(msg: str, code: int = 1) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(code)


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _human_title(slug: str) -> str:
    slug = slug.replace("-", " ").replace("_", " ").strip()
    return slug.title() if slug else "Untitled"


def _extract_h1(md_text: str) -> str | None:
    m = TITLE_RE.search(md_text)
    if not m:
        return None
    t = m.group(1).strip()
    return t or None


def _convert_markdown(md_text: str) -> str:
    try:
        import markdown  # type: ignore
    except Exception:
        _die(
            "Python package 'markdown' is not installed. Run: python3 -m pip install -r scripts/requirements.txt",
            code=2,
        )

    html = markdown.markdown(md_text, extensions=["fenced_code", "tables"])
    html = MD_LINK_RE.sub(r"\1\2.html\3", html)
    return html


def _load_template(path: Path) -> str:
    if not path.exists():
        _die(f"Template not found: {path}")
    return _read_text(path)


def _discover_pages(project_dir: Path) -> list[Page]:
    md_files = sorted([p for p in project_dir.iterdir() if p.is_file() and p.suffix.lower() == ".md"])

    def sort_key(p: Path) -> tuple[int, str]:
        if p.name.lower() == "index.md":
            return (0, "")
        return (1, p.name.lower())

    md_files.sort(key=sort_key)

    pages: list[Page] = []
    for md_path in md_files:
        slug = md_path.stem
        md_text = _read_text(md_path)
        h1 = _extract_h1(md_text)
        title = h1 if h1 else _human_title(slug)
        pages.append(Page(md_path=md_path, slug=slug, title=title))

    return pages


def _build_sidebar(pages: list[Page], active_slug: str) -> str:
    links: list[str] = ["<nav class=\"sidebar-nav\" aria-label=\"Project pages\">"]
    for page in pages:
        cls = "sidebar-link active" if page.slug == active_slug else "sidebar-link"
        href = f"{page.slug}.html"
        label = page.title
        links.append(f"  <a class=\"{cls}\" href=\"{href}\">{label}</a>")
    links.append("</nav>")
    return "\n".join(links)


def _render_page(template: str, title: str, sidebar_html: str, content_html: str) -> str:
    out = template
    out = out.replace("{{TITLE}}", title)
    out = out.replace("{{SIDEBAR}}", sidebar_html)
    out = out.replace("{{CONTENT}}", content_html)
    return out


def build_projects(src: Path, out_root: Path, template_path: Path, clean: bool, project: str | None) -> None:
    if not src.exists():
        _die(f"Source folder not found: {src}")

    template = _load_template(template_path)

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

        out_dir = out_root / project_dir.name
        if clean and out_dir.exists():
            for child in out_dir.iterdir():
                if child.is_file() and child.suffix.lower() == ".html":
                    child.unlink()

        for page in pages:
            md_text = _read_text(page.md_path)
            html = _convert_markdown(md_text)

            sidebar = _build_sidebar(pages, active_slug=page.slug)
            doc_title = f"{page.title} — {project_dir.name}"
            rendered = _render_page(template, doc_title, sidebar, html)

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
    parser.add_argument("--clean", action="store_true", help="Remove previously-generated .html in each project output folder")
    parser.add_argument("--project", default=None, help="Build only one project (folder name under --src)")

    args = parser.parse_args(argv)

    src = Path(args.src)
    out_root = Path(args.out) if args.out else _default_out_root()
    template_path = Path(args.template)

    build_projects(src=src, out_root=out_root, template_path=template_path, clean=args.clean, project=args.project)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
