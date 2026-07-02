#!/usr/bin/env python3
"""
CALYR.aí Nexus Compiler

The main orchestrator for semantic compilation of the CALYR.aí knowledge nexus.

Architecture:
    Source Layer (YAML)
        ↓ compile.py
    Resolution Layer (Python)
        ↓ validate, resolve, build
    Nexus Layer (JSON AST)
        ↓ React / ReactFlow / PDF / Documentation
    Presentation Layer (Output)

YAML Source Files:
    • structure.yaml    — page hierarchy and layout
    • content.yaml      — text, metadata, graph, and interactions
    • theme.yaml        — colors, typography, spacing

Build Pipeline:
    1. Parse       → Load YAML source bundle
    2. Validate    → Cross-check all references
    3. Resolve     → Merge data from all sources
    4. Build       → Generate Nexus artifacts (AST, Graph, Theme, Index, Flowchart)
    5. Bundle      → Sync local runtimeArtifacts.js for the minimal homepage build

Nexus Artifacts (generated/):
    • nexus.ast.json    — fully resolved homepage AST
    • nexus.graph.json  — knowledge graph for visualization
    • nexus.theme.json  — compiled design system
    • nexus.index.json  — searchable index
    • nexus.flowchart.json — authored page flow definitions with Mermaid output
"""

import json
import shutil
import sys
from datetime import datetime, timezone
from html import escape
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("   Install with: pip install pyyaml")
    sys.exit(1)

# Nexus semantic compiler package
from nexus import Validator, Resolver, ASTBuilder, GraphBuilder, ThemeBuilder, IndexBuilder, FlowchartBuilder


# Configuration constants
CONFIG = {
    "yaml_files": {
        "structure": "structure.yaml",
        "content": "content.yaml",
    },
    "output_files": {
        "ast": "nexus.ast.json",
        "graph": "nexus.graph.json",
        "theme": "nexus.theme.json",
        "index": "nexus.index.json",
        "flowchart": "nexus.flowchart.json",
    },
    "default_skin": "oracle",
}


class NexusCompiler:
    """
    Semantic compiler for CALYR.aí knowledge nexus.
    
    Orchestrates the full pipeline:
        Parse YAML → Validate → Resolve → Build Nexus artifacts
    
    Usage:
        compiler = NexusCompiler(content_dir, output_dir)
        success = compiler.compile()
    """

    def __init__(
        self,
        content_dir: Path,
        output_dir: Path,
        skin: str = CONFIG["default_skin"],
    ) -> None:
        """
        Initialize compiler.
        
        Args:
            content_dir: Path to content/ directory with YAML source files
            output_dir: Path to generated/ directory for output artifacts
            skin: Name of skin to use (default: calyrai)
        """
        self.content_dir = Path(content_dir).resolve()
        self.output_dir = Path(output_dir).resolve()
        self.skin = skin
        self.source: dict[str, Any] = {}
        self.resolved: dict[str, Any] = {}
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def compile(self) -> bool:
        """Execute full compilation pipeline."""
        self._reset_state()
        print("🏗️  CALYR.aí Nexus Compiler\n")
        for stage in (self._stage_parse, self._stage_validate, self._stage_resolve, self._stage_build):
            if not stage():
                return self._exit_failure()
        return self._exit_success()

    def _reset_state(self) -> None:
        """Reset mutable compiler state so instances can be reused safely."""
        self.source.clear()
        self.resolved.clear()
        self.errors.clear()
        self.warnings.clear()

    def _stage_parse(self) -> bool:
        """Stage 1: Parse YAML source files."""
        print("📖 Stage 1: Parsing YAML source layer...")
        try:
            self._load_required_source_bundle()
            self._load_auxiliary_sources()
            self._load_theme_bundle()

            print(f"   ✓ Parsed content bundle + theme/base.yaml + skins/{self.skin}.yaml")
            return True
        except (FileNotFoundError, ValueError) as e:
            self.errors.append(str(e))
            return False
        except yaml.YAMLError as e:
            self.errors.append(f"YAML parse error: {e}")
            return False
        except Exception as e:
            self.errors.append(f"Parse error: {e}")
            return False

    def _load_required_source_bundle(self) -> None:
        """Load required YAML files from content/."""
        for key, filename in CONFIG["yaml_files"].items():
            path = self.content_dir / filename
            self.source[key] = self._read_mapping_yaml(path, required=True)

    def _load_auxiliary_sources(self) -> None:
        """Load graph, interaction, and flowchart from inline blocks with file fallback."""
        blob = self.source.get("content", {})
        if isinstance(blob, dict):
            for key in ("graph", "interaction", "flowchart"):
                inline = blob.pop(f"__{key}", None)
                if isinstance(inline, dict):
                    self.source[key] = inline
        for key in ("graph", "interaction", "flowchart"):
            self.source.setdefault(
                key,
                self._read_mapping_yaml(self.content_dir / f"{key}.yaml", required=False),
            )

    def _load_theme_bundle(self) -> None:
        """Load base theme and selected skin overlay."""
        root = self.content_dir.parent
        self.source["theme"] = self._read_mapping_yaml(root / "theme" / "base.yaml", required=True)
        skin_yaml = self._read_mapping_yaml(root / "skins" / f"{self.skin}.yaml", required=True)
        self.source["theme"]["skin"] = skin_yaml.get("skin", {})

    def _read_mapping_yaml(self, path: Path, required: bool) -> dict[str, Any]:
        """Read a YAML file and return a mapping object."""
        if not path.exists():
            if required:
                raise FileNotFoundError(f"Source file not found: {path}")
            return {}

        with open(path, encoding="utf-8") as f:
            payload = yaml.safe_load(f)

        if payload is None:
            return {}
        if not isinstance(payload, dict):
            raise ValueError(f"Expected mapping in YAML file: {path}")
        return payload

    def _stage_validate(self) -> bool:
        """Stage 2: Validate cross-references."""
        print("✓ Stage 2: Validating cross-references...")
        try:
            validator = Validator(self.source)
            valid = validator.validate()
            self.errors.extend(validator.errors)
            self.warnings.extend(validator.warnings)
            for warn in self.warnings:
                print(f"   ⚠️  {warn}")
            if valid:
                print("   ✓ All references valid")
            return valid
        except Exception as e:
            self.errors.append(f"Validation error: {e}")
            return False

    def _stage_resolve(self) -> bool:
        """Stage 3: Resolve node data from all sources."""
        print("🔗 Stage 3: Resolving nodes...")
        try:
            resolver = Resolver(self.source)
            self.resolved = resolver.resolve_all()
            print(f"   ✓ Resolved {len(self.resolved)} nodes")
            return True
        except Exception as e:
            self.errors.append(f"Resolution error: {e}")
            return False

    def _stage_build(self) -> bool:
        """Stage 4: Build and write Nexus artifacts."""
        print("🌳 Stage 4: Building Nexus artifacts...")
        try:
            self.output_dir.mkdir(parents=True, exist_ok=True)
            for key, builder in self._artifact_builders():
                self._write_artifact(key, builder.build())
            return True
        except Exception as e:
            self.errors.append(f"Build error: {e}")
            return False

    def _artifact_builders(self):
        """Yield (artifact_key, builder) pairs in build order."""
        yield "ast",   ASTBuilder(self.source, self.resolved)
        yield "graph", GraphBuilder(self.source, self.resolved)
        yield "theme", ThemeBuilder(self.source)
        yield "index", IndexBuilder(self.resolved)
        yield "flowchart", FlowchartBuilder(self.source, self.resolved)

    def _write_artifact(self, artifact_type: str, data: dict[str, Any]) -> None:
        """Write artifact to JSON file."""
        filename = CONFIG["output_files"][artifact_type]
        path = self.output_dir / filename
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        rel_path = path.relative_to(self.output_dir.parent)
        print(f"   ✓ {rel_path}")

    def _exit_success(self) -> bool:
        print()
        print("✅ Nexus compilation complete!")
        print()
        print("📊 Pipeline:")
        print("   Source Layer     → YAML")
        print("   Resolution Layer → Python (compile.py)")
        print("   Nexus Layer      → JSON AST")
        print("   Presentation     → React / ReactFlow / PDF / Docs")
        return True

    def _exit_failure(self) -> bool:
        print()
        for err in self.errors:
            print(f"   ❌ {err}")
        for warn in self.warnings:
            print(f"   ⚠️  {warn}")
        return False


def main() -> int:
    """Main entry point."""
    try:
        # Lock to default skin to prevent accidental runtime theme switching.
        skin = CONFIG["default_skin"]

        for arg in sys.argv[1:]:
            if arg.startswith("-"):
                print(f"⚠️  Ignoring unknown flag '{arg}'")
                continue

            if arg != skin:
                print(f"⚠️  Ignoring requested skin '{arg}' (locked to '{skin}')")
        
        # Resolve paths relative to this file
        build_dir = Path(__file__).parent.resolve()
        content_dir = build_dir.parent / "content"
        output_dir = build_dir.parent / "generated"

        # Create and run compiler
        print("🧭 Compile mode: strict")
        compiler = NexusCompiler(content_dir, output_dir, skin=skin)
        success = compiler.compile()

        if success:
            _sync_books_page_from_yaml(build_dir.parent)
            _sync_positioning_page_from_yaml(build_dir.parent)
            _sync_platform_pages_from_yaml(build_dir.parent)
            _sync_route_policy_and_audit(build_dir.parent)
            # Auto-copy artifacts to web/public/generated for dev server
            _sync_artifacts_to_web_public(build_dir.parent, output_dir)
            _sync_runtime_artifacts_module(build_dir.parent, output_dir)

        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Compilation interrupted by user")
        return 130
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1


def _sync_artifacts_to_web_public(project_root: Path, output_dir: Path) -> None:
    """Copy generated artifacts to web/public for local dev usage."""
    web_public_gen = project_root / "web" / "public" / "generated"
    if not web_public_gen.exists():
        return

    for artifact in output_dir.glob("nexus.*.json"):
        shutil.copy2(artifact, web_public_gen / artifact.name)
    print("📦 Synced to web/public/generated/")


def _sync_runtime_artifacts_module(project_root: Path, output_dir: Path) -> None:
    """Sync compiled local artifacts into the bundled runtime source used by production."""
    runtime_module = project_root / "web" / "src" / "data" / "runtimeArtifacts.js"
    books_page_path = project_root / "web" / "public" / "generated" / "books.page.json"
    route_policy_path = project_root / "web" / "public" / "generated" / "route.policy.json"
    route_audit_path = project_root / "web" / "public" / "generated" / "route.audit.json"

    ast = _read_json_file(output_dir / "nexus.ast.json")
    theme = _read_json_file(output_dir / "nexus.theme.json")
    books_page = _read_json_file(books_page_path) if books_page_path.exists() else {}
    route_policy = _read_json_file(route_policy_path) if route_policy_path.exists() else {}
    route_audit = _read_json_file(route_audit_path) if route_audit_path.exists() else {}

    content = "\n".join([
        f"export const AST_DATA = {json.dumps(ast, ensure_ascii=False)}",
        f"export const THEME_DATA = {json.dumps(theme, ensure_ascii=False)}",
        f"export const BOOKS_PAGE_DATA = {json.dumps(books_page, ensure_ascii=False)}",
        f"export const ROUTE_POLICY_DATA = {json.dumps(route_policy, ensure_ascii=False)}",
        f"export const ROUTE_AUDIT_DATA = {json.dumps(route_audit, ensure_ascii=False)}",
        "",
    ])

    runtime_module.write_text(content, encoding="utf-8")
    rel_path = runtime_module.relative_to(project_root)
    print(f"🧩 Synced bundled runtime artifacts to {rel_path}")


def _sync_books_page_from_yaml(project_root: Path) -> None:
    """Merge architecture books entries from YAML into books.page.json."""
    config = _read_optional_yaml(project_root / "content" / "books.yaml")
    if not config:
        return

    books_page_path = project_root / "web" / "public" / "generated" / "books.page.json"
    books_page = _read_json_file(books_page_path) if books_page_path.exists() else {"id": "books-home", "sections": []}
    _sync_books_page_style(books_page, config)

    architecture = config.get("architecture_books", {}) if isinstance(config, dict) else {}
    section_cfg = architecture.get("section", {}) if isinstance(architecture, dict) else {}
    item_cfg = architecture.get("item", {}) if isinstance(architecture, dict) else {}
    if not section_cfg or not item_cfg:
        return

    sections = books_page.get("sections", [])
    if not isinstance(sections, list):
        sections = []
        books_page["sections"] = sections

    section_id = str(section_cfg.get("id", "architecture_books"))
    section = next((s for s in sections if isinstance(s, dict) and s.get("id") == section_id), None)
    if not section:
        section = {
            "id": section_id,
            "title": section_cfg.get("title", "Architecture Books"),
            "description": section_cfg.get("description", ""),
            "items": [],
        }
        sections.append(section)
    else:
        section["title"] = section_cfg.get("title", section.get("title", "Architecture Books"))
        section["description"] = section_cfg.get("description", section.get("description", ""))

    items = section.get("items", [])
    if not isinstance(items, list):
        items = []
        section["items"] = items

    item_id = str(item_cfg.get("id", "calyr-positioning"))
    cta_cfg = item_cfg.get("cta", {}) if isinstance(item_cfg.get("cta"), dict) else {}
    normalized_item = {
        "id": item_id,
        "type": item_cfg.get("type", "architecture-note"),
        "authors": item_cfg.get("authors", []),
        "title": item_cfg.get("title", "CALYR.AI Positioning"),
        "year": item_cfg.get("year"),
        "tags": item_cfg.get("tags", []),
        "objective": item_cfg.get("objective", ""),
        "summary": item_cfg.get("summary", ""),
        "ctas": [
            {
                "type": cta_cfg.get("type", "open"),
                "label": cta_cfg.get("label", "Open"),
                "url": cta_cfg.get("url", "/research/positioning/"),
                "online": True,
            }
        ],
    }

    replaced = False
    for idx, item in enumerate(items):
        if isinstance(item, dict) and item.get("id") == item_id:
            items[idx] = normalized_item
            replaced = True
            break
    if not replaced:
        items.append(normalized_item)

    _sync_platform_books_section(books_page, config)

    metadata = books_page.get("metadata", {})
    if not isinstance(metadata, dict):
        metadata = {}
    unique_book_ids: set[str] = set()
    for section_entry in sections:
        if not isinstance(section_entry, dict):
            continue
        section_items = section_entry.get("items", [])
        if not isinstance(section_items, list):
            continue
        for section_item in section_items:
            if isinstance(section_item, dict) and section_item.get("id"):
                unique_book_ids.add(str(section_item.get("id")))
    metadata["book_count"] = len(unique_book_ids)
    metadata["generated_at"] = datetime.now(timezone.utc).isoformat()
    books_page["metadata"] = metadata

    with open(books_page_path, "w", encoding="utf-8") as f:
        json.dump(books_page, f, indent=2, ensure_ascii=False)

    rel_path = books_page_path.relative_to(project_root)
    print(f"📚 Synced architecture books data to {rel_path}")


def _sync_books_page_style(books_page: dict[str, Any], config: dict[str, Any]) -> None:
    """Sync YAML-driven Books page style tokens into books.page.json."""
    style_cfg = config.get("books_page_style", {}) if isinstance(config, dict) else {}
    hero_cfg = style_cfg.get("hero", {}) if isinstance(style_cfg, dict) else {}
    if not isinstance(hero_cfg, dict) or not hero_cfg:
        return

    style = books_page.get("style")
    if not isinstance(style, dict):
        style = {}

    hero_style = style.get("hero")
    if not isinstance(hero_style, dict):
        hero_style = {}

    for key in ("title_color", "title_dot_color", "title_hover_color", "title_dot_glow"):
        value = hero_cfg.get(key)
        if isinstance(value, str) and value.strip():
            hero_style[key] = value.strip()

    if hero_style:
        style["hero"] = hero_style
        books_page["style"] = style


def _sync_platform_books_section(books_page: dict[str, Any], config: dict[str, Any]) -> None:
    """Merge platform book entries from YAML into books.page.json."""
    platform_books = config.get("platform_books", {}) if isinstance(config, dict) else {}
    section_cfg = platform_books.get("section", {}) if isinstance(platform_books, dict) else {}
    items_cfg = platform_books.get("items", []) if isinstance(platform_books, dict) else []
    if not section_cfg or not isinstance(items_cfg, list) or not items_cfg:
        return

    sections = books_page.get("sections", [])
    if not isinstance(sections, list):
        sections = []
        books_page["sections"] = sections

    section_id = str(section_cfg.get("id", "platform_books"))
    section = next((s for s in sections if isinstance(s, dict) and s.get("id") == section_id), None)
    if not section:
        section = {
            "id": section_id,
            "title": section_cfg.get("title", "Platform Books"),
            "description": section_cfg.get("description", ""),
            "items": [],
        }
        sections.append(section)
    else:
        section["title"] = section_cfg.get("title", section.get("title", "Platform Books"))
        section["description"] = section_cfg.get("description", section.get("description", ""))

    section_items = section.get("items", [])
    if not isinstance(section_items, list):
        section_items = []
        section["items"] = section_items

    existing_index: dict[str, int] = {
        str(item.get("id")): idx
        for idx, item in enumerate(section_items)
        if isinstance(item, dict) and item.get("id")
    }

    for item_cfg in items_cfg:
        if not isinstance(item_cfg, dict):
            continue

        item_id = str(item_cfg.get("id", "")).strip()
        platform_id = str(item_cfg.get("platform_id", "")).strip()
        if not item_id or not platform_id:
            continue

        ctas_cfg = item_cfg.get("ctas") if isinstance(item_cfg.get("ctas"), list) else []
        if not ctas_cfg:
            ctas_cfg = [
                {
                    "type": "platform-page",
                    "label": "Open platform page",
                    "url": f"/research/platforms/{platform_id}/index.html",
                    "online": True,
                }
            ]

        normalized_item = {
            "id": item_id,
            "type": item_cfg.get("type", "platform-book"),
            "authors": item_cfg.get("authors", []),
            "title": item_cfg.get("title", platform_id),
            "year": item_cfg.get("year"),
            "tags": item_cfg.get("tags", []),
            "objective": item_cfg.get("objective", ""),
            "summary": item_cfg.get("summary", ""),
            "ctas": ctas_cfg,
        }

        if item_id in existing_index:
            section_items[existing_index[item_id]] = normalized_item
        else:
            section_items.append(normalized_item)


def _sync_platform_pages_from_yaml(project_root: Path) -> None:
    """Render one explanation page per platform from books.yaml content."""
    config = _read_optional_yaml(project_root / "content" / "books.yaml")
    if not config:
        return

    platform_pages_cfg = config.get("platform_pages", {}) if isinstance(config, dict) else {}
    page_items = platform_pages_cfg.get("items", []) if isinstance(platform_pages_cfg, dict) else []
    if not isinstance(page_items, list) or not page_items:
        return

    platform_books_cfg = config.get("platform_books", {}) if isinstance(config, dict) else {}
    book_items = platform_books_cfg.get("items", []) if isinstance(platform_books_cfg, dict) else []
    rainbow_palette = config.get("rainbow_palette", {}) if isinstance(config, dict) else {}
    book_map: dict[str, dict[str, Any]] = {
        str(item.get("id")): item
        for item in book_items
        if isinstance(item, dict) and item.get("id")
    }

    route_prefix = str(platform_pages_cfg.get("route_prefix", "/research/platforms")).strip("/")
    output_root = project_root / "web" / "public" / Path(route_prefix)
    output_root.mkdir(parents=True, exist_ok=True)

    for page_item in page_items:
        if not isinstance(page_item, dict):
            continue

        platform_id = str(page_item.get("platform_id", "")).strip()
        book_id = str(page_item.get("book_id", "")).strip()
        if not platform_id or not book_id:
            continue

        book = book_map.get(book_id)
        if not isinstance(book, dict):
            print(f"⚠️  Missing platform book '{book_id}' for platform '{platform_id}'")
            continue

        output_dir = output_root / platform_id
        output_dir.mkdir(parents=True, exist_ok=True)

        accent_color = "#d05f1f"
        if isinstance(rainbow_palette, dict):
            palette_color = rainbow_palette.get(platform_id)
            if isinstance(palette_color, str) and palette_color.strip():
                accent_color = palette_color.strip()

        css_path = output_dir / "platform.css"
        css_path.write_text(_platform_page_css(accent_color=accent_color), encoding="utf-8")

        source_cfg = book.get("source", {}) if isinstance(book.get("source"), dict) else {}
        source_rel = source_cfg.get("path")
        source_html_path = (project_root / str(source_rel)).resolve() if source_rel else None
        source_copy_path = output_dir / "platform.source.html"
        source_exists = bool(source_html_path and source_html_path.exists())
        if source_exists and source_html_path is not None:
            shutil.copy2(source_html_path, source_copy_path)

        title = escape(str(page_item.get("title", book.get("title", platform_id))))
        eyebrow = escape(str(page_item.get("eyebrow", "CALYR.AI Platform")))
        subtitle = escape(str(page_item.get("subtitle", book.get("title", platform_id))))
        lead = escape(str(page_item.get("lead", book.get("summary", ""))))
        claim = escape(str(page_item.get("claim", book.get("canonical_claim", book.get("objective", "")))))
        footer_note = escape(str(page_item.get("footer_note", f"Rooted in book '{book_id}' from content/books.yaml and regenerated on compile.")))

        sections = page_item.get("sections") if isinstance(page_item.get("sections"), list) else []
        if not sections:
            sections = book.get("sections", []) if isinstance(book.get("sections"), list) else []

        section_blocks = []
        for section in sections:
            if not isinstance(section, dict):
                continue
            class_name = "card"
            if section.get("class_name"):
                class_name = f"card {escape(str(section.get('class_name')))}"

            section_title = escape(str(section.get("title", "")))
            section_body = escape(str(section.get("body", "")))
            bullets = section.get("bullets", []) if isinstance(section.get("bullets"), list) else []
            columns = section.get("columns", []) if isinstance(section.get("columns"), list) else []

            body_html = ""
            if section_body:
                body_html += f"<p>{section_body}</p>"
            if bullets:
                bullet_html = "".join(f"<li>{escape(str(item))}</li>" for item in bullets)
                body_html += f"<ul>{bullet_html}</ul>"
            if columns:
                col_nodes = []
                for column in columns:
                    column_items = column if isinstance(column, list) else []
                    item_html = "".join(f"<li>{escape(str(item))}</li>" for item in column_items)
                    col_nodes.append(f"<div class=\"mini\"><ul>{item_html}</ul></div>")
                body_html += f"<div class=\"grid-two\">{''.join(col_nodes)}</div>"

            section_blocks.append(
                f"""
    <section class=\"{class_name}\">
      <h2>{section_title}</h2>
      {body_html}
    </section>
                """.rstrip()
            )

        source_meta = "source file not found"
        if source_exists and source_html_path is not None:
            source_mtime = datetime.fromtimestamp(source_html_path.stat().st_mtime, tz=timezone.utc).isoformat()
            source_meta = f"linked source: {escape(str(source_html_path))} | updated: {source_mtime}"

        source_link_href = "./platform.source.html" if source_exists else "/"
        source_link_label = "Open linked source snapshot" if source_exists else "Back to homepage"

        html_content = f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{title}</title>
  <link rel=\"stylesheet\" href=\"./platform.css\" />
</head>
<body>
  <main class=\"layout\">
    <section class=\"card\">
      <div class=\"eyebrow\">{eyebrow}</div>
      <h1>{subtitle}</h1>
      <p class=\"lead\">{lead}</p>
      <div class=\"pipeline\"><pre>{claim}</pre></div>
      <p class=\"link-meta\">{source_meta}</p>
              <p><a class=\"source-link\" href=\"{source_link_href}\" target=\"_blank\" rel=\"noreferrer\">Open linked source snapshot</a></p>
    </section>
    {''.join(section_blocks)}
    <p class=\"footer-note\">{footer_note}</p>
  </main>
</body>
</html>
"""

        output_html_path = output_dir / "index.html"
        output_html_path.write_text(html_content, encoding="utf-8")
        rel_path = output_html_path.relative_to(project_root)
        print(f"📘 Synced platform page ({platform_id}) to {rel_path}")


def _sync_positioning_page_from_yaml(project_root: Path) -> None:
    """Render linked positioning page from YAML and sync source HTML copy."""
    books_cfg = _read_optional_yaml(project_root / "content" / "books.yaml")
    page_cfg = _read_optional_yaml(project_root / "content" / "positioning.yaml")
    if not books_cfg or not page_cfg:
        return

    source_cfg = books_cfg.get("positioning_source", {}) if isinstance(books_cfg, dict) else {}
    source_rel = source_cfg.get("path") if isinstance(source_cfg, dict) else None
    source_html_path = (project_root / str(source_rel)).resolve() if source_rel else None

    output_dir = project_root / "web" / "public" / "research" / "positioning"
    output_dir.mkdir(parents=True, exist_ok=True)

    source_copy_path = output_dir / "positioning.source.html"
    source_exists = bool(source_html_path and source_html_path.exists())
    if source_exists and source_html_path is not None:
        shutil.copy2(source_html_path, source_copy_path)

    css_path = output_dir / "positioning.css"
    css_path.write_text(_positioning_css(), encoding="utf-8")

    page = page_cfg.get("page", {}) if isinstance(page_cfg, dict) else {}
    sections = page_cfg.get("sections", []) if isinstance(page_cfg.get("sections"), list) else []
    title = escape(str(page.get("title", "CALYR.AI Positioning")))
    eyebrow = escape(str(page.get("eyebrow", "CALYR.AI Positioning")))
    subtitle = escape(str(page.get("subtitle", "")))
    lead = escape(str(page.get("lead", "")))
    claim = escape(str(page.get("claim", "")))
    footer_note = escape(str(page_cfg.get("footer_note", "")))

    section_blocks = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        class_name = "card"
        if section.get("class_name"):
            class_name = f"card {escape(str(section.get('class_name')))}"

        section_title = escape(str(section.get("title", "")))
        section_body = escape(str(section.get("body", "")))
        bullets = section.get("bullets", []) if isinstance(section.get("bullets"), list) else []
        columns = section.get("columns", []) if isinstance(section.get("columns"), list) else []

        body_html = ""
        if section_body:
            body_html += f"<p>{section_body}</p>"
        if bullets:
            bullet_html = "".join(f"<li>{escape(str(item))}</li>" for item in bullets)
            body_html += f"<ul>{bullet_html}</ul>"
        if columns:
            col_nodes = []
            for column in columns:
                column_items = column if isinstance(column, list) else []
                item_html = "".join(f"<li>{escape(str(item))}</li>" for item in column_items)
                col_nodes.append(f"<div class=\"mini\"><ul>{item_html}</ul></div>")
            body_html += f"<div class=\"grid-two\">{''.join(col_nodes)}</div>"

        section_blocks.append(
            f"""
    <section class=\"{class_name}\">
      <h2>{section_title}</h2>
      {body_html}
    </section>
            """.rstrip()
        )

    source_meta = "source file not found"
    if source_exists and source_html_path is not None:
        source_mtime = datetime.fromtimestamp(source_html_path.stat().st_mtime, tz=timezone.utc).isoformat()
        source_meta = f"linked source: {escape(str(source_html_path))} | updated: {source_mtime}"

    html_content = f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{title}</title>
  <link rel=\"stylesheet\" href=\"./positioning.css\" />
</head>
<body>
  <main class=\"layout\">
    <section class=\"card\">
      <div class=\"eyebrow\">{eyebrow}</div>
      <h1>{subtitle}</h1>
      <p class=\"lead\">{lead}</p>
      <div class=\"pipeline\"><pre>{claim}</pre></div>
      <p class=\"link-meta\">{source_meta}</p>
      <p><a class=\"source-link\" href=\"./positioning.source.html\" target=\"_blank\" rel=\"noreferrer\">Open linked source snapshot</a></p>
    </section>
    {''.join(section_blocks)}
    <p class=\"footer-note\">{footer_note}</p>
  </main>
</body>
</html>
"""

    output_html_path = output_dir / "index.html"
    output_html_path.write_text(html_content, encoding="utf-8")
    print(f"🧠 Synced positioning page to {output_html_path.relative_to(project_root)}")


def _positioning_css(accent_color: str = "#d05f1f") -> str:
    """CSS for positioning page rendered in homepage workflow."""
    css = """
:root {
  --ink: #11223a;
  --ink-soft: #2f4666;
  --paper: #f6f3ec;
  --card: rgba(255, 255, 255, 0.84);
  --line: rgba(17, 34, 58, 0.14);
        --accent: __ACCENT_COLOR__;
  --focus: #0e7a6b;
  --shadow: 0 18px 40px rgba(17, 34, 58, 0.12);
  --radius: 18px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  color: var(--ink);
  font-family: Avenir, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
  background:
    radial-gradient(1200px 700px at 6% 8%, rgba(208, 95, 31, 0.2), transparent 55%),
    radial-gradient(900px 600px at 92% 16%, rgba(14, 122, 107, 0.2), transparent 58%),
    repeating-linear-gradient(
      135deg,
      rgba(17, 34, 58, 0.02) 0,
      rgba(17, 34, 58, 0.02) 5px,
      transparent 5px,
      transparent 16px
    ),
    var(--paper);
  min-height: 100vh;
  line-height: 1.5;
}

.layout {
  width: min(1080px, 92vw);
  margin: 42px auto 64px;
  display: grid;
  gap: 18px;
}

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(6px);
  padding: 26px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--focus);
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

h1, h2 { margin: 0 0 10px; line-height: 1.15; letter-spacing: -0.02em; }
h1 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); max-width: 26ch; }
h2 { font-size: clamp(1.15rem, 2.4vw, 1.6rem); }
p { margin: 8px 0; color: var(--ink-soft); }

.lead { font-size: clamp(1.04rem, 1.8vw, 1.2rem); max-width: 72ch; }
.pipeline {
  margin-top: 14px;
  border: 1px dashed var(--line);
  border-radius: 14px;
  padding: 14px;
  background: rgba(17, 34, 58, 0.03);
  overflow-x: auto;
}
.pipeline pre { margin: 0; color: var(--ink); white-space: pre-wrap; }

.grid-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.mini {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  padding: 14px;
}

ul { margin: 8px 0 0; padding-left: 18px; color: var(--ink-soft); }
li { margin: 4px 0; }

.avoid {
  border-left: 4px solid var(--focus);
  background: rgba(14, 122, 107, 0.09);
}

.link-meta { font-size: 0.85rem; }
.source-link { color: var(--accent); font-weight: 700; }
.footer-note { font-size: 0.93rem; color: var(--ink-soft); text-align: center; }

@media (max-width: 820px) {
  .layout { width: min(1120px, 94vw); margin-top: 20px; }
  .card { padding: 18px; }
  .grid-two { grid-template-columns: 1fr; }
}
""".strip() + "\n"
    return css.replace("__ACCENT_COLOR__", accent_color)


def _platform_page_css(accent_color: str = "#00c7ff") -> str:
        """Dark CSS for platform detail pages linked from homepage tiles."""
        css = """
:root {
    --ink: #f2f7ff;
    --ink-soft: rgba(242, 247, 255, 0.82);
    --paper: #05070b;
    --card: rgba(8, 12, 20, 0.88);
    --line: rgba(255, 255, 255, 0.2);
    --accent: __ACCENT_COLOR__;
    --focus: rgba(255, 255, 255, 0.9);
    --shadow: 0 18px 42px rgba(0, 0, 0, 0.46);
    --radius: 18px;
}

* { box-sizing: border-box; }

body {
    margin: 0;
    color: var(--ink);
    font-family: Avenir, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
    background:
        radial-gradient(1100px 680px at 10% 10%, rgba(255, 255, 255, 0.05), transparent 56%),
        radial-gradient(900px 580px at 88% 18%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%),
        radial-gradient(circle at center, rgba(255, 255, 255, 0.13) 0 1px, transparent 1px 100%),
        var(--paper);
    background-size: auto, auto, 20px 20px, auto;
    min-height: 100vh;
    line-height: 1.5;
}

.layout {
    width: min(1080px, 92vw);
    margin: 42px auto 64px;
    display: grid;
    gap: 18px;
}

.card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    backdrop-filter: blur(4px);
    padding: 26px;
}

.eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 8px;
}

h1, h2 { margin: 0 0 10px; line-height: 1.15; letter-spacing: -0.02em; color: var(--ink); }
h1 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); max-width: 26ch; }
h2 { font-size: clamp(1.15rem, 2.4vw, 1.6rem); }
p { margin: 8px 0; color: var(--ink-soft); }

.lead { font-size: clamp(1.04rem, 1.8vw, 1.2rem); max-width: 72ch; }
.pipeline {
    margin-top: 14px;
    border: 1px dashed color-mix(in srgb, var(--accent) 50%, rgba(255, 255, 255, 0.35));
    border-radius: 14px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
    overflow-x: auto;
}
.pipeline pre { margin: 0; color: var(--ink); white-space: pre-wrap; }

.grid-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.mini {
    border: 1px solid var(--line);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    padding: 14px;
}

ul { margin: 8px 0 0; padding-left: 18px; color: var(--ink-soft); }
li { margin: 4px 0; }

.avoid {
    border-left: 4px solid var(--focus);
    background: rgba(255, 255, 255, 0.04);
}

.link-meta { font-size: 0.85rem; }
.source-link { color: var(--accent); font-weight: 700; }
.footer-note { font-size: 0.93rem; color: var(--ink-soft); text-align: center; }

@media (max-width: 820px) {
    .layout { width: min(1120px, 94vw); margin-top: 20px; }
    .card { padding: 18px; }
    .grid-two { grid-template-columns: 1fr; }
}
""".strip() + "\n"
        return css.replace("__ACCENT_COLOR__", accent_color)


def _read_optional_yaml(path: Path) -> dict[str, Any]:
    """Read optional mapping YAML file."""
    if not path.exists():
        return {}

    with open(path, encoding="utf-8") as f:
        payload = yaml.safe_load(f)

    if payload is None:
        return {}
    if not isinstance(payload, dict):
        raise ValueError(f"Expected mapping in YAML file: {path}")
    return payload


def _sync_route_policy_and_audit(project_root: Path) -> None:
    """Build route policy + unresolved internal route audit from YAML source."""
    content_cfg = _read_optional_yaml(project_root / "content" / "content.yaml")
    if not content_cfg:
        return

    route_policy_cfg = content_cfg.get("route_policy", {}) if isinstance(content_cfg, dict) else {}
    contact_cfg = content_cfg.get("contact", {}) if isinstance(content_cfg.get("contact"), dict) else {}
    contact_route = str(contact_cfg.get("route", "")).strip()

    fallback_mailto = str(route_policy_cfg.get("fallback_mailto", "")).strip() if isinstance(route_policy_cfg, dict) else ""
    if not fallback_mailto:
        fallback_mailto = contact_route if contact_route.startswith("mailto:") else "mailto:rupert.tscheliessnig@calyr.ai"

    spa_routes_cfg = route_policy_cfg.get("spa_routes", []) if isinstance(route_policy_cfg, dict) else []
    if not isinstance(spa_routes_cfg, list):
        spa_routes_cfg = []
    spa_routes = [str(route).strip() for route in spa_routes_cfg if isinstance(route, str) and str(route).strip()]
    if not spa_routes:
        spa_routes = ["/books", "/philosophy", "/contact"]

    collected_routes: list[str] = []

    def collect_routes(obj: Any) -> None:
        if isinstance(obj, dict):
            route = obj.get("route")
            if isinstance(route, str) and route.strip():
                collected_routes.append(route.strip())
            for value in obj.values():
                collect_routes(value)
            return
        if isinstance(obj, list):
            for item in obj:
                collect_routes(item)

    collect_routes(content_cfg)

    public_root = project_root / "web" / "public"
    unresolved: list[str] = []

    for route in sorted(set(collected_routes)):
        if not route.startswith("/"):
            continue
        if route in spa_routes:
            continue

        normalized = route.lstrip("/")
        direct_file = public_root / normalized
        index_file = public_root / normalized / "index.html"
        if direct_file.exists() or index_file.exists():
            continue
        unresolved.append(route)

    generated_dir = public_root / "generated"
    generated_dir.mkdir(parents=True, exist_ok=True)

    policy_payload = {
        "fallback_mailto": fallback_mailto,
        "spa_routes": spa_routes,
    }
    audit_payload = {
        "checked_routes": sorted(set(collected_routes)),
        "unresolved_routes": unresolved,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    policy_path = generated_dir / "route.policy.json"
    audit_path = generated_dir / "route.audit.json"
    policy_path.write_text(json.dumps(policy_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    audit_path.write_text(json.dumps(audit_payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    rel_policy = policy_path.relative_to(project_root)
    rel_audit = audit_path.relative_to(project_root)
    print(f"📬 Synced route policy to {rel_policy}")
    print(f"🚨 Synced route audit to {rel_audit}")
    for route in unresolved:
        print(f"   ⚠️  Unresolved internal route in YAML: {route}")


def _read_json_file(path: Path) -> Any:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


if __name__ == "__main__":
    sys.exit(main())
