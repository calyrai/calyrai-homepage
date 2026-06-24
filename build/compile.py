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
    • content.yaml      — text, titles, descriptions, metadata
    • graph.yaml        — nodes and relationships
    • interaction.yaml  — user behaviors and actions
    • theme.yaml        — colors, typography, spacing

Build Pipeline:
    1. Parse       → Load all YAML source files
    2. Validate    → Cross-check all references
    3. Resolve     → Merge data from all sources
    4. Build       → Generate Nexus artifacts (AST, Graph, Theme, Index)

Nexus Artifacts (generated/):
    • nexus.ast.json    — fully resolved homepage AST
    • nexus.graph.json  — knowledge graph for visualization
    • nexus.theme.json  — compiled design system
    • nexus.index.json  — searchable index
"""

import sys
from pathlib import Path
from typing import Any

try:
    import yaml
    import json
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
        "graph": "graph.yaml",
        "interaction": "interaction.yaml",
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

    def __init__(self, content_dir: Path, output_dir: Path, skin: str = "calyrai") -> None:
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
        self._print_header()

        # Stage 1: Parse YAML
        if not self._stage_parse():
            return self._exit_failure()

        # Stage 2: Validate
        if not self._stage_validate():
            return self._exit_failure()

        # Stage 3: Resolve
        if not self._stage_resolve():
            return self._exit_failure()

        # Stage 4: Build Nexus
        if not self._stage_build():
            return self._exit_failure()

        return self._exit_success()

    def _stage_parse(self) -> bool:
        """Stage 1: Parse YAML source files."""
        print("📖 Stage 1: Parsing YAML source layer...")
        try:
            # Parse content YAML files
            for key, filename in CONFIG["yaml_files"].items():
                path = self.content_dir / filename
                if not path.exists():
                    self.errors.append(f"Source file not found: {path}")
                    return False

                with open(path, encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    self.source[key] = data if data else {}

            # Parse theme: base + skin
            theme_dir = self.content_dir.parent / "theme"
            skins_dir = self.content_dir.parent / "skins"

            # Load base theme
            base_path = theme_dir / "base.yaml"
            if not base_path.exists():
                self.errors.append(f"Base theme not found: {base_path}")
                return False

            with open(base_path, encoding="utf-8") as f:
                base_theme = yaml.safe_load(f)
                self.source["theme"] = base_theme if base_theme else {}

            # Load selected skin and merge
            skin_path = skins_dir / f"{self.skin}.yaml"
            if not skin_path.exists():
                self.errors.append(f"Skin not found: {skin_path}")
                return False

            with open(skin_path, encoding="utf-8") as f:
                skin_theme = yaml.safe_load(f)
                if skin_theme:
                    self.source["theme"]["skin"] = skin_theme.get("skin", {})

            print(f"   ✓ Parsed 5 content files + theme/base.yaml + skins/{self.skin}.yaml")
            return True
        except yaml.YAMLError as e:
            self.errors.append(f"YAML parse error: {e}")
            return False
        except Exception as e:
            self.errors.append(f"Parse error: {e}")
            return False

    def _stage_validate(self) -> bool:
        """Stage 2: Validate cross-references."""
        print("✓ Stage 2: Validating cross-references...")
        try:
            validator = Validator(self.source)
            if not validator.validate():
                self.errors.extend(validator.errors)
                self.warnings.extend(validator.warnings)
                return len(validator.errors) == 0

            self.warnings.extend(validator.warnings)
            if self.warnings:
                self._print_warnings()
            print("   ✓ All references valid")
            return True
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

            # Build AST
            ast_builder = ASTBuilder(self.source, self.resolved)
            ast = ast_builder.build()
            self._write_artifact("ast", ast)

            # Build Graph
            graph_builder = GraphBuilder(self.source, self.resolved)
            graph = graph_builder.build()
            self._write_artifact("graph", graph)

            # Build Theme
            theme_builder = ThemeBuilder(self.source)
            theme = theme_builder.build()
            self._write_artifact("theme", theme)

            # Build Index
            index_builder = IndexBuilder(self.resolved)
            index = index_builder.build()
            self._write_artifact("index", index)

            return True
        except Exception as e:
            self.errors.append(f"Build error: {e}")
            return False

    def _write_artifact(self, artifact_type: str, data: dict[str, Any]) -> None:
        """Write artifact to JSON file."""
        filename = CONFIG["output_files"][artifact_type]
        path = self.output_dir / filename
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        rel_path = path.relative_to(self.output_dir.parent)
        print(f"   ✓ {rel_path}")

    def _print_header(self) -> None:
        """Print compiler header."""
        print("🏗️  CALYR.aí Nexus Compiler")
        print()

    def _print_errors(self) -> None:
        """Print all errors."""
        for err in self.errors:
            print(f"   ❌ {err}")

    def _print_warnings(self) -> None:
        """Print all warnings."""
        for warn in self.warnings:
            print(f"   ⚠️  {warn}")

    def _print_footer(self) -> None:
        """Print compiler footer with pipeline visualization."""
        print()
        print("📊 Pipeline:")
        print("   Source Layer     → YAML")
        print("   Resolution Layer → Python (compile.py)")
        print("   Nexus Layer      → JSON AST")
        print("   Presentation     → React / ReactFlow / PDF / Docs")

    def _exit_success(self) -> bool:
        """Print success and return True."""
        print()
        print("✅ Nexus compilation complete!")
        if self.warnings:
            print()
            self._print_warnings()
        self._print_footer()
        return True

    def _exit_failure(self) -> bool:
        """Print errors and return False."""
        print()
        self._print_errors()
        if self.warnings:
            print()
            self._print_warnings()
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
            import shutil
            web_public_gen = build_dir.parent / "web" / "public" / "generated"
            if web_public_gen.exists():
                for artifact in output_dir.glob("nexus.*.json"):
                    shutil.copy2(artifact, web_public_gen / artifact.name)
                print(f"📦 Synced to web/public/generated/")

        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Compilation interrupted by user")
        return 130
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
