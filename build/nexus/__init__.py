"""
CALYR.aí Nexus Compiler Package

The semantic compilation system that transforms YAML sources into a unified
knowledge nexus (abstract syntax tree).

Module Architecture:
    validate  — Cross-reference validation
    resolve   — Node data resolution from multiple sources
    builders  — Nexus artifact construction (AST, Graph, Theme, Index, Flowchart)

Usage:
    from nexus.validate import Validator
    from nexus.resolve import Resolver
    from nexus.builders import ASTBuilder, GraphBuilder, ThemeBuilder, IndexBuilder, FlowchartBuilder
"""

__version__ = "1.0.0"
__all__ = [
    "Validator",
    "Resolver",
    "ASTBuilder",
    "GraphBuilder",
    "ThemeBuilder",
    "IndexBuilder",
    "FlowchartBuilder",
]

from .validate import Validator
from .resolve import Resolver
from .builders import ASTBuilder, GraphBuilder, ThemeBuilder, IndexBuilder, FlowchartBuilder
