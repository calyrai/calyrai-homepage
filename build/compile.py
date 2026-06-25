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
    4. Build       → Generate Nexus artifacts (AST, Graph, Theme, Index)

Nexus Artifacts (generated/):
    • nexus.ast.json    — fully resolved homepage AST
    • nexus.graph.json  — knowledge graph for visualization
    • nexus.theme.json  — compiled design system
    • nexus.index.json  — searchable index
"""

import json
import shutil
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("   Install with: pip install pyyaml")
    sys.exit(1)

# Nexus semantic compiler package
from nexus import Validator, Resolver, ASTBuilder, GraphBuilder, ThemeBuilder, IndexBuilder


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

    def __init__(self, content_dir: Path, output_dir: Path, skin: str = CONFIG["default_skin"]) -> None:
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
            self._load_graph_and_interaction()
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

    def _load_graph_and_interaction(self) -> None:
        """Load graph and interaction from inline blocks with legacy fallback."""
        blob = self.source.get("content", {})
        if isinstance(blob, dict):
            for key in ("graph", "interaction"):
                inline = blob.pop(f"__{key}", None)
                if isinstance(inline, dict):
                    self.source[key] = inline
        for key in ("graph", "interaction"):
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
        if len(sys.argv) > 1 and sys.argv[1] != skin:
            print(f"⚠️  Ignoring requested skin '{sys.argv[1]}' (locked to '{skin}')")
        
        # Resolve paths relative to this file
        build_dir = Path(__file__).parent.resolve()
        content_dir = build_dir.parent / "content"
        output_dir = build_dir.parent / "generated"

        # Create and run compiler
        compiler = NexusCompiler(content_dir, output_dir, skin=skin)
        success = compiler.compile()

        if success:
            # Auto-copy artifacts to web/public/generated for dev server
            _sync_artifacts_to_web_public(build_dir.parent, output_dir)

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


if __name__ == "__main__":
    sys.exit(main())
