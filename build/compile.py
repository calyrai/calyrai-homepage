#!/usr/bin/env python3
"""
calyr.aí Nexus Compiler

The main orchestrator for semantic compilation of the calyr.aí knowledge nexus.

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
import re
import shutil
import sys
from abc import ABC, abstractmethod
from dataclasses import dataclass
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
    "default_skin": "pythia",
}


@dataclass(frozen=True)
class BuildPaths:
    """Immutable filesystem boundary for one compiler execution."""

    project_root: Path
    content_dir: Path
    output_dir: Path

    @classmethod
    def from_script(cls, script_path: Path) -> "BuildPaths":
        build_dir = script_path.resolve().parent
        project_root = build_dir.parent
        return cls(
            project_root=project_root,
            content_dir=project_root / "content",
            output_dir=project_root / "generated",
        )


class PublicationStep(ABC):
    """One replaceable post-compilation publication responsibility."""

    @abstractmethod
    def publish(self, context: "PublicationContext") -> None:
        raise NotImplementedError


@dataclass(frozen=True)
class PublicationContext:
    paths: BuildPaths
    source: dict[str, Any]


class RuntimeConfigPublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_site_runtime_configs(context.paths.project_root, context.source)


class BooksPublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_books_page_from_yaml(context.paths.project_root)


class PositioningPublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_positioning_page_from_yaml(context.paths.project_root)


class PlatformPublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_platform_pages_from_yaml(context.paths.project_root)


class RoutePublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_route_policy_and_audit(context.paths.project_root)


class NexusArtifactPublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_artifacts_to_web_public(context.paths.project_root, context.paths.output_dir)


class RuntimeModulePublisher(PublicationStep):
    def publish(self, context: PublicationContext) -> None:
        _sync_runtime_artifacts_module(context.paths.project_root, context.paths.output_dir)


class PublicationPipeline:
    """Executes ordered, independently testable publication steps."""

    def __init__(self, steps: list[PublicationStep]) -> None:
        self._steps = tuple(steps)

    @classmethod
    def default(cls) -> "PublicationPipeline":
        return cls([
            RuntimeConfigPublisher(),
            BooksPublisher(),
            PositioningPublisher(),
            PlatformPublisher(),
            RoutePublisher(),
            NexusArtifactPublisher(),
            RuntimeModulePublisher(),
        ])

    def publish(self, context: PublicationContext) -> None:
        for step in self._steps:
            step.publish(context)


class CompilerApplication:
    """Application service coordinating compile and publication phases."""

    def __init__(
        self,
        paths: BuildPaths,
        skin: str,
        publication_pipeline: PublicationPipeline,
    ) -> None:
        self.paths = paths
        self.skin = skin
        self.publication_pipeline = publication_pipeline

    @classmethod
    def default(cls) -> "CompilerApplication":
        return cls(
            paths=BuildPaths.from_script(Path(__file__)),
            skin=CONFIG["default_skin"],
            publication_pipeline=PublicationPipeline.default(),
        )

    def run(self, arguments: list[str]) -> int:
        self._report_ignored_arguments(arguments)
        print("🧭 Compile mode: strict")
        compiler = NexusCompiler(
            self.paths.content_dir,
            self.paths.output_dir,
            skin=self.skin,
        )
        if not compiler.compile():
            return 1

        context = PublicationContext(paths=self.paths, source=compiler.source)
        self.publication_pipeline.publish(context)
        return 0

    def _report_ignored_arguments(self, arguments: list[str]) -> None:
        for argument in arguments:
            if argument.startswith("-"):
                print(f"⚠️  Ignoring unknown flag '{argument}'")
            elif argument != self.skin:
                print(f"⚠️  Ignoring requested skin '{argument}' (locked to '{self.skin}')")


class NexusCompiler:
    """
    Semantic compiler for calyr.aí knowledge nexus.
    
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
        print("🏗️  calyr.aí Nexus Compiler\n")
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
            site_runtime = blob.pop("__site_runtime", None)
            if isinstance(site_runtime, dict):
                self.source["site_runtime"] = site_runtime
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
    """Thin process boundary delegating to the compiler application service."""
    try:
        return CompilerApplication.default().run(sys.argv[1:])
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


def _sync_site_runtime_configs(project_root: Path, source: dict[str, Any]) -> None:
    """Validate and emit browser runtime configs from the single content YAML source."""
    runtime = source.get("site_runtime")
    if not isinstance(runtime, dict):
        raise ValueError("content/content.yaml must define __site_runtime")

    required = {
        "teaser": ("meta", "page", "copy", "nodes", "edges", "story_rules"),
        "lithos_deck": ("seed", "page", "interaction", "ui", "formation_steps", "cluster_centers", "cluster_amounts", "slides"),
    }
    output_dir = project_root / "web" / "public" / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_names = {"teaser": "teaser.config.json", "lithos_deck": "lithos-deck.config.json"}

    for config_name, fields in required.items():
        config = runtime.get(config_name)
        if not isinstance(config, dict):
            raise ValueError(f"__site_runtime.{config_name} must be a mapping")
        missing = [field for field in fields if field not in config]
        if missing:
            raise ValueError(f"__site_runtime.{config_name} missing: {', '.join(missing)}")
        target = output_dir / output_names[config_name]
        target.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"🧭 Synced runtime config to {target.relative_to(project_root)}")


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

    home_route = str(config.get("home_route", "/")).strip() if isinstance(config, dict) else "/"
    if not home_route:
        home_route = "/"
    books_page["home_route"] = home_route

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
        "title": item_cfg.get("title", "calyr.aí positioning"),
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

    method_reference = _sync_method_reference_page(project_root, config)

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
        eyebrow = escape(str(page_item.get("eyebrow", "calyr.aí platform")))
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

        if page_item.get("show_method_reference") and method_reference:
            method_title = escape(str(method_reference.get("title", "Scientific AI and Numerical Methods")))
            method_summary = escape(str(method_reference.get("summary", "Read the numerical, probabilistic, and validation contract used by calyr.aí scientific prediction.")))
            method_label = escape(str(method_reference.get("label", "Open method reference")))
            method_route = escape(str(method_reference.get("route", "/research/methods/scientific-ai-numerics/")), quote=True)
            section_blocks.append(
                f"""
    <section class=\"card method-reference\">
      <div class=\"eyebrow\">calyr.aí method contract</div>
      <h2>{method_title}</h2>
      <p>{method_summary}</p>
      <p><a class=\"source-link\" href=\"{method_route}\">{method_label} →</a></p>
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
                  <p><a class=\"source-link\" href=\"{source_link_href}\">Back to homepage</a></p>
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


def _inline_markdown(value: str) -> str:
    """Render the small inline Markdown subset used by repository references."""
    rendered = escape(value)
    rendered = re.sub(r"`([^`]+)`", r"<code>\1</code>", rendered)
    rendered = re.sub(r"\[([^\]]+)\]\((https?://[^)]+|#[^)]+)\)", r'<a href="\2" rel="noreferrer">\1</a>', rendered)
    rendered = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", rendered)
    rendered = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", rendered)
    return rendered


def _heading_anchor(value: str) -> str:
    anchor = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return anchor or "section"


def _markdown_document_html(markdown: str) -> str:
    """Render the repository's method-reference Markdown without runtime dependencies."""
    lines = markdown.splitlines()
    nodes: list[str] = []
    paragraph: list[str] = []
    list_kind: str | None = None
    in_code = False
    code_lines: list[str] = []
    index = 0

    def flush_paragraph() -> None:
        if paragraph:
            metadata_lines = [re.match(r"^\*\*([^*]+):\*\*\s*(.+?)\s{0,2}$", line) for line in paragraph]
            if all(metadata_lines):
                metadata_items = "".join(
                    f"<div><dt>{_inline_markdown(match.group(1))}</dt><dd>{_inline_markdown(match.group(2).rstrip())}</dd></div>"
                    for match in metadata_lines
                    if match
                )
                nodes.append(f'<dl class="method-meta">{metadata_items}</dl>')
            else:
                nodes.append(f"<p>{_inline_markdown(' '.join(paragraph))}</p>")
            paragraph.clear()

    def close_list() -> None:
        nonlocal list_kind
        if list_kind:
            nodes.append(f"</{list_kind}>")
            list_kind = None

    while index < len(lines):
        line = lines[index]
        stripped = line.strip()
        if stripped.startswith("```"):
            flush_paragraph()
            close_list()
            if in_code:
                nodes.append(f"<pre><code>{escape(chr(10).join(code_lines))}</code></pre>")
                code_lines.clear()
            in_code = not in_code
            index += 1
            continue
        if in_code:
            code_lines.append(line)
            index += 1
            continue
        if not stripped:
            flush_paragraph()
            close_list()
            index += 1
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if heading:
            flush_paragraph()
            close_list()
            level = len(heading.group(1))
            text = heading.group(2)
            nodes.append(f'<h{level} id="{_heading_anchor(text)}">{_inline_markdown(text)}</h{level}>')
            index += 1
            continue

        if stripped.startswith("|") and index + 1 < len(lines) and re.match(r"^\|?[\s:|-]+\|?$", lines[index + 1].strip()):
            flush_paragraph()
            close_list()
            headers = [cell.strip() for cell in stripped.strip("|").split("|")]
            index += 2
            rows: list[list[str]] = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                rows.append([cell.strip() for cell in lines[index].strip().strip("|").split("|")])
                index += 1
            head_html = "".join(f"<th>{_inline_markdown(cell)}</th>" for cell in headers)
            row_html = "".join("<tr>" + "".join(f"<td>{_inline_markdown(cell)}</td>" for cell in row) + "</tr>" for row in rows)
            nodes.append(f"<div class=\"table-wrap\"><table><thead><tr>{head_html}</tr></thead><tbody>{row_html}</tbody></table></div>")
            continue

        list_match = re.match(r"^(?:[-*]|\d+\.)\s+(.+)$", stripped)
        if list_match:
            flush_paragraph()
            wanted = "ol" if re.match(r"^\d+\.", stripped) else "ul"
            if list_kind != wanted:
                close_list()
                list_kind = wanted
                nodes.append(f"<{wanted}>")
            nodes.append(f"<li>{_inline_markdown(list_match.group(1))}</li>")
            index += 1
            continue

        paragraph.append(stripped)
        index += 1

    flush_paragraph()
    close_list()
    if code_lines:
        nodes.append(f"<pre><code>{escape(chr(10).join(code_lines))}</code></pre>")
    return "\n".join(nodes)


def _sync_method_reference_page(project_root: Path, config: dict[str, Any]) -> dict[str, Any]:
    """Publish the YAML-defined method catalog and its Markdown method pages."""
    catalog = config.get("method_catalog", {}) if isinstance(config, dict) else {}
    references = catalog.get("items", []) if isinstance(catalog, dict) else []
    if not isinstance(catalog, dict) or not isinstance(references, list) or not references:
        return {}

    reference = references[0] if isinstance(references[0], dict) else {}
    source_rel = str(reference.get("source", "")).strip()
    route = str(reference.get("route", "")).strip()
    if not source_rel or not route:
        return {}
    source_path = (project_root / source_rel).resolve()
    if not source_path.exists():
        print(f"⚠️  Missing method reference source: {source_rel}")
        return {}

    output_dir = project_root / "web" / "public" / route.strip("/")
    output_dir.mkdir(parents=True, exist_ok=True)
    markdown = source_path.read_text(encoding="utf-8")
    rendered_body = _markdown_document_html(markdown)
    body_parts = re.split(r"(?=<h2\s)", rendered_body)
    intro = body_parts[0]
    section_nodes = []
    for part in body_parts[1:]:
        section_class = "method-section method-section--references" if 'id="sources-and-further-reading"' in part else "method-section"
        section_nodes.append(f'<section class="{section_class}">{part}</section>')
    sections = "".join(section_nodes)
    body = f'<section class="method-hero">{intro}</section>{sections}'
    toc_items = []
    for heading in re.findall(r"^##\s+(.+)$", markdown, flags=re.MULTILINE):
        toc_items.append(f'<li><a href="#{_heading_anchor(heading)}">{_inline_markdown(heading)}</a></li>')
    toc = "".join(toc_items)
    title = escape(str(reference.get("title", "Scientific AI and Numerical Methods Reference")))
    html = f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <meta name=\"description\" content=\"calyr.aí scientific prediction method contract for numerics, AI, SAXS, SPR, and cryo-EM.\" />
  <title>{title} · calyr.aí</title>
  <link rel=\"stylesheet\" href=\"./method.css\" />
</head>
<body>
  <header class=\"site-header\">
    <a class=\"brand\" href=\"/\">calyr.aí</a>
    <div class=\"header-context\"><a href=\"/research/methods/\">Method Catalog</a><a href=\"/research/platforms/pythia/\">Pythia</a></div>
  </header>
  <div class=\"page-shell\">
    <aside class=\"contents\">
      <p class=\"contents-label\">On this page</p>
      <nav aria-label=\"Method reference sections\"><ol>{toc}</ol></nav>
    </aside>
    <main class=\"method-layout\"><article>{body}</article></main>
  </div>
</body>
</html>
"""
    (output_dir / "index.html").write_text(html, encoding="utf-8")
    (output_dir / "method.css").write_text(_method_reference_css(), encoding="utf-8")
    print(f"📐 Synced method reference to {(output_dir / 'index.html').relative_to(project_root)}")

    catalog_route = str(catalog.get("route", "/research/methods/")).strip()
    catalog_dir = project_root / "web" / "public" / catalog_route.strip("/")
    catalog_dir.mkdir(parents=True, exist_ok=True)
    cards: list[str] = []
    published_count = 0
    for item in references:
        if not isinstance(item, dict):
            continue
        item_title = escape(str(item.get("title", "Untitled method")))
        item_id = escape(str(item.get("id", "")))
        item_summary = escape(str(item.get("summary", "")))
        raw_route = str(item.get("route", "")).strip()
        item_route = escape(raw_route, quote=True)
        family = escape(str(item.get("family", "Method")))
        status = escape(str(item.get("status", "Draft")))
        tags = item.get("tags", []) if isinstance(item.get("tags"), list) else []
        domains = item.get("domains", []) if isinstance(item.get("domains"), list) else []
        chips = "".join(f"<span>{escape(str(tag))}</span>" for tag in [*domains, *tags])
        informed_by = escape(str(item.get("informed_by", "")))
        boundary = escape(str(item.get("boundary", "")))
        lineage_html = ""
        if informed_by or boundary:
            origin_html = f"<p><strong>Informed by</strong>{informed_by}</p>" if informed_by else ""
            boundary_html = f"<p><strong>Boundary</strong>{boundary}</p>" if boundary else ""
            lineage_html = f'<div class="method-lineage">{origin_html}{boundary_html}</div>'
        if raw_route:
            published_count += 1
            action_html = f'<a class="open-method" href="{item_route}">Open method contract →</a>'
        else:
            action_html = '<span class="open-method open-method--planned">Contract structure in development</span>'
        cards.append(f"""
      <article class=\"catalog-card\">
        <div class=\"card-meta\"><span>{family}</span><span>{status}</span></div>
        <p class=\"method-id\">{item_id}</p>
        <h2>{item_title}</h2>
        <p>{item_summary}</p>
        <div class=\"chips\">{chips}</div>
{lineage_html}
        {action_html}
      </article>""")
    catalog_title = escape(str(catalog.get("title", "calyr.aí method catalog")))
    catalog_summary = escape(str(catalog.get("summary", "A growing collection of reusable scientific methods.")))
    catalog_html = f"""<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <meta name=\"description\" content=\"{catalog_summary}\" />
  <title>{catalog_title} · calyr.aí</title>
  <link rel=\"stylesheet\" href=\"./catalog.css\" />
</head>
<body>
  <header><a class=\"brand\" href=\"/\">calyr.aí</a><a href=\"/research/platforms/pythia/\">Pythia</a></header>
  <main>
    <section class=\"catalog-hero\"><p class=\"eyebrow\">Research system</p><h1>{catalog_title}</h1><p>{catalog_summary}</p><div class=\"catalog-stats\"><strong>{published_count:02d}</strong><span>published</span><strong>{len(cards) - published_count:02d}</strong><span>structures defined</span></div></section>
    <section class=\"catalog-index\"><div class=\"index-heading\"><p>Catalog index</p><span>Designed to grow by method family and domain</span></div>{''.join(cards)}</section>
  </main>
</body>
</html>"""
    (catalog_dir / "index.html").write_text(catalog_html, encoding="utf-8")
    (catalog_dir / "catalog.css").write_text(_method_catalog_css(), encoding="utf-8")
    print(f"🗂️  Synced method catalog to {(catalog_dir / 'index.html').relative_to(project_root)}")
    return {**catalog, "route": catalog_route}


def _method_catalog_css() -> str:
    return """
:root { color-scheme: dark; --ink:#f5f5f2; --soft:#a7abb0; --paper:#050505; --card:#090909; --line:#343434; --accent:#39bfff; }
* { box-sizing:border-box; }
body { margin:0; color:var(--ink); background:var(--paper); font:16px/1.55 Helvetica Neue,Helvetica,Arial,sans-serif; }
header { min-height:64px; display:flex; align-items:center; justify-content:space-between; padding:0 max(5vw,calc((100vw - 1200px)/2)); border-bottom:1px solid var(--line); background:var(--paper); }
a { color:var(--accent); } header a { font-weight:700; text-decoration:none; } .brand { color:var(--ink); letter-spacing:.04em; } .brand span { color:var(--accent); }
main { width:min(1200px,92vw); margin:0 auto 100px; }
.catalog-hero { display:grid; grid-template-columns:repeat(12,1fr); column-gap:20px; min-height:460px; padding:72px 0 58px; border-bottom:1px solid var(--line); } .eyebrow,.method-id { color:var(--accent); font-size:.72rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
.catalog-hero .eyebrow { grid-column:1/4; } h1 { grid-column:4/12; max-width:11ch; margin:0 0 1.2rem; font-size:clamp(3.4rem,8vw,7rem); line-height:.88; letter-spacing:-.065em; } .catalog-hero>p:not(.eyebrow) { grid-column:4/10; max-width:65ch; color:var(--soft); font-size:1.08rem; }
.catalog-stats { grid-column:10/13; display:flex; align-items:baseline; gap:10px; color:var(--soft); align-self:end; } .catalog-stats strong { color:var(--ink); font-size:2.2rem; font-weight:500; }
.catalog-index { display:grid; grid-template-columns:repeat(12,1fr); gap:0; border-left:1px solid var(--line); } .index-heading { grid-column:1/-1; display:grid; grid-template-columns:3fr 9fr; padding:18px 20px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); color:var(--soft); } .index-heading p { margin:0; color:var(--ink); font-weight:700; }
.catalog-card { grid-column:1/-1; display:grid; grid-template-columns:3fr 6fr 3fr; min-height:330px; padding:28px 20px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); background:var(--card); }
.card-meta { display:flex; justify-content:space-between; color:#718197; font-size:.78rem; } .catalog-card h2 { margin:.4rem 0 1rem; font-size:clamp(1.6rem,3vw,2.25rem); line-height:1.12; } .catalog-card>p:not(.method-id) { color:var(--soft); }
.catalog-card .method-id { grid-column:1; grid-row:2/6; margin-top:.65rem; }.catalog-card h2,.catalog-card>p:not(.method-id),.catalog-card .chips,.catalog-card .method-lineage { grid-column:2; }.catalog-card .card-meta { grid-column:1/-1; border-bottom:1px solid var(--line); padding-bottom:14px; }.catalog-card h2 { font-size:clamp(2rem,4vw,3.6rem); letter-spacing:-.04em; }.catalog-card .open-method { grid-column:3; grid-row:2/6; align-self:end; justify-self:end; }
.chips { display:flex; flex-wrap:wrap; gap:0; margin:20px 0 28px; } .chips span { padding:5px 9px; border:1px solid var(--line); color:#9eb0c4; font-size:.72rem; margin:-1px 0 0 -1px; }
.method-lineage { display:grid; gap:8px; margin:0 0 24px; padding-top:16px; border-top:1px solid var(--line); }.method-lineage p { margin:0; color:#7f8993; font-size:.75rem; }.method-lineage strong { display:block; margin-bottom:2px; color:var(--soft); font-size:.64rem; letter-spacing:.1em; text-transform:uppercase; }
.open-method { font-weight:700; text-decoration:none; }
.open-method--planned { max-width:18ch; color:#747c85; font-size:.78rem; font-weight:600; line-height:1.35; text-align:right; }
@media(max-width:760px){.catalog-hero{display:block;min-height:0;padding:48px 0}.catalog-stats{margin-top:40px}.index-heading{display:block}.catalog-card{display:block;min-height:380px}.catalog-card .open-method{display:block;margin-top:36px}h1{margin-top:18px;font-size:3.6rem}}
""".strip() + "\n"


def _method_reference_css() -> str:
    return """
:root { color-scheme: dark; --ink: #f5f5f2; --soft: #a7abb0; --paper: #050505; --card: #090909; --line: #343434; --accent: #39bfff; --accent-strong: #39bfff; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.62 Helvetica Neue, Helvetica, Arial, sans-serif; }
.site-header { position: sticky; top: 0; z-index: 3; display: flex; align-items: center; justify-content: space-between; min-height: 64px; padding: 0 max(4vw, calc((100vw - 1240px)/2)); background: rgba(5,5,5,.96); border-bottom: 1px solid var(--line); }
a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 3px; }
.site-header a { font-weight: 700; text-decoration: none; }
.brand { color: var(--ink); letter-spacing: .04em; }
.brand span { color: var(--accent-strong); }
.header-context { display: flex; align-items: center; gap: 18px; font-size: .88rem; }
.header-context span { color: #718197; }
.page-shell { width: min(1240px, 94vw); margin: 0 auto; display: grid; grid-template-columns: 3fr 9fr; gap: 0; align-items: start; border-left: 1px solid var(--line); border-right: 1px solid var(--line); }
.contents { position: sticky; top: 64px; max-height: calc(100vh - 64px); overflow-y: auto; padding: 28px 22px; border-right: 1px solid var(--line); }
.contents-label { margin: 0 0 12px; color: var(--ink); font-size: .75rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.contents ol { margin: 0; padding: 0; list-style: none; border-left: 1px solid var(--line); }
.contents li { margin: 0; }
.contents a { display: block; padding: 6px 0 6px 16px; color: #8e9db0; font-size: .83rem; line-height: 1.35; text-decoration: none; border-left: 2px solid transparent; transform: translateX(-1px); }
.contents a:hover, .contents a:focus { color: var(--accent); border-left-color: var(--accent); }
.method-layout { min-width: 0; margin: 0; }
article { display: block; counter-reset: method-section; }
.method-hero, .method-section { background: var(--card); border-bottom: 1px solid var(--line); padding: clamp(30px, 5vw, 72px); }
.method-hero { position: relative; overflow: hidden; min-height: 520px; padding-top: clamp(48px, 8vw, 100px); }
.method-hero::before { content: "calyr.aí method contract · 001"; display: inline-block; margin-bottom: 20px; color: var(--accent); font-size: .72rem; font-weight: 800; letter-spacing: .15em; }
.method-hero::after { display: none; }
.method-meta { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); margin:42px 0 0; border-top:1px solid var(--line); border-left:1px solid var(--line); }
.method-meta div { min-width:0; padding:14px 16px; border-right:1px solid var(--line); border-bottom:1px solid var(--line); }
.method-meta dt { margin-bottom:5px; color:#747c85; font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.method-meta dd { margin:0; color:var(--ink); font-size:.82rem; line-height:1.4; overflow-wrap:anywhere; }
.method-meta code { font-size:.75rem; }
.method-section { counter-increment: method-section; position: relative; padding-left: clamp(72px, 9vw, 130px); }
.method-section::before { content: counter(method-section, decimal-leading-zero); position: absolute; left: 28px; top: clamp(34px, 5vw, 72px); color: var(--accent); font-size: .74rem; font-weight: 700; letter-spacing: .1em; }
.method-section--references { margin-top: 48px; border-top: 4px solid var(--accent); }
h1, h2, h3 { line-height: 1.18; letter-spacing: -.025em; scroll-margin-top: 88px; }
h1 { max-width: 14ch; font-size: clamp(2.4rem, 6vw, 4.4rem); margin: 0 0 1.7rem; }
h2 { margin: 0 0 1.25rem; font-size: clamp(1.5rem, 3vw, 2.15rem); }
h3 { margin: 2.25rem 0 .6rem; color: #d9eaff; font-size: 1.08rem; letter-spacing: .01em; }
p, li { color: var(--soft); }
p { max-width: 76ch; }
strong { color: var(--ink); }
code { color: #d6f1ff; background: #111c29; border: 1px solid #24364a; border-radius: 5px; padding: .1em .3em; }
pre { overflow-x: auto; padding: 22px; border: 1px solid #2d4055; border-radius: 12px; background: #060a10; box-shadow: inset 3px 0 0 var(--accent-strong); }
pre code { border: 0; padding: 0; background: transparent; }
.table-wrap { overflow-x: auto; margin: 1.5rem 0; }
table { width: 100%; border-collapse: collapse; min-width: 620px; }
th, td { padding: 12px 14px; border: 1px solid var(--line); text-align: left; vertical-align: top; }
th { color: var(--ink); background: #111b28; }
td { color: var(--soft); }
.method-section ul, .method-section ol { display: grid; gap: 7px; padding-left: 1.3rem; }
.method-section li::marker { color: var(--accent-strong); }
@media (max-width: 980px) { .page-shell { display: block; width: min(900px, 94vw); } .contents { position: static; max-height: none; border-right: 0; border-bottom: 1px solid var(--line); } .contents ol { columns: 2; column-gap: 28px; } }
@media (max-width: 620px) { body { font-size: 15.5px; } .site-header { padding-inline: 5vw; } .header-context a:first-child { display: none; } .contents ol { columns: 1; } .method-hero, .method-section { min-height:0; padding: 34px 20px; } .method-section { padding-left: 54px; } .method-section::before { left: 18px; top: 38px; } .method-meta { grid-template-columns:1fr; } h1 { font-size: 2.5rem; } }
""".strip() + "\n"


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
    title = escape(str(page.get("title", "calyr.aí positioning")))
    eyebrow = escape(str(page.get("eyebrow", "calyr.aí positioning")))
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
          <p><a class=\"source-link\" href=\"/\">Back to homepage</a></p>
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

    home_route = str(route_policy_cfg.get("home_route", "/")).strip() if isinstance(route_policy_cfg, dict) else "/"
    if not home_route:
        home_route = "/"

    unresolved_internal_fallback = str(route_policy_cfg.get("unresolved_internal_fallback", home_route)).strip() if isinstance(route_policy_cfg, dict) else home_route
    if not unresolved_internal_fallback:
        unresolved_internal_fallback = home_route

    allow_404 = bool(route_policy_cfg.get("allow_404", False)) if isinstance(route_policy_cfg, dict) else False

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
        if not allow_404:
            unresolved.append(route)

    generated_dir = public_root / "generated"
    generated_dir.mkdir(parents=True, exist_ok=True)

    policy_payload = {
        "home_route": home_route,
        "unresolved_internal_fallback": unresolved_internal_fallback,
        "allow_404": allow_404,
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
