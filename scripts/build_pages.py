#!/usr/bin/env python3

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class SitePage:
    md_path: Path
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
            md_path=src_root / "index.md",
            template_path=template_root / "index.template.html",
            out_path=out_root / "index.html",
        ),
        SitePage(
            md_path=src_root / "team.md",
            template_path=template_root / "team.template.html",
            out_path=out_root / "team.html",
        ),
        SitePage(
            md_path=src_root / "explore.md",
            template_path=template_root / "explore.template.html",
            out_path=out_root / "explore.html",
        ),
        SitePage(
            md_path=src_root / "projects.md",
            template_path=template_root / "projects.template.html",
            out_path=out_root / "projects.html",
        ),
        SitePage(
            md_path=src_root / "pages" / "nexus.md",
            template_path=template_root / "pages" / "nexus.template.html",
            out_path=out_root / "pages" / "nexus.html",
        ),
    ]


def build_pages(src_root: Path, template_root: Path, out_root: Path) -> None:
    pages = _default_pages(src_root=src_root, template_root=template_root, out_root=out_root)

    for p in pages:
        if not p.md_path.exists():
            _die(f"Markdown source not found: {p.md_path}")
        template = _load_template(p.template_path)
        md_text = _read_text(p.md_path)
        html = _convert_markdown(md_text)
        rendered = _render(template, html)
        _write_text(p.out_path, rendered)

    print(f"Built site pages from {src_root} -> {out_root}")


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Build Calyr.ai site pages from Markdown")
    parser.add_argument("--src", default="pages_src", help="Markdown source root")
    parser.add_argument("--templates", default="templates/pages", help="HTML templates root")
    parser.add_argument("--out", default="src", help="Output root (writes .html pages)")

    args = parser.parse_args(argv)

    build_pages(src_root=Path(args.src), template_root=Path(args.templates), out_root=Path(args.out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
