# Calyr.aí Page Design

Page Design

## Design Principle

The page system is source-first.

Markdown defines canonical content.

YAML defines projection metadata such as tile behavior, links, and page outputs.

The renderer composes both into stable HTML while preserving the existing visual layout.

## Object-Oriented Structure

The homepage architecture follows an object-oriented model:

- Content objects hold text semantics.
- Page objects define projection targets.
- Renderer objects map content to concrete layout surfaces.

This separation keeps implementation extensible while preventing accidental layout drift.

## Layout Stability Rule

Design iteration must not rewrite the visible shell by default.

Changes should prefer:

- markdown content updates,
- YAML projection updates,
- renderer internals that preserve existing structure.

This keeps the current homepage recognizable while still enabling system-level evolution.
