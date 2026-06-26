# CALYR.aí Build System

## Architecture Overview

```
Source Layer (YAML)
    ↓ compile.py (Resolution Layer)
Nexus Layer (JSON AST)
    ↓ React / ReactFlow / PDF / Documentation
Presentation Layer (Output)
```

## Terminology

- **Source Layer**: YAML configuration files (structure, content, graph, interaction, theme)
- **Resolution Layer**: Python build system that validates and compiles
- **Nexus Layer**: Unified JSON representation (AST = knowledge nexus connecting all sources)
- **Presentation Layer**: Output formats (React components, ReactFlow graphs, PDF, HTML, documentation)

## Build Pipeline

### Stage 1: Parse YAML
Load all source files:
- `structure.yaml` — page hierarchy and layout
- `content.yaml` — text, titles, descriptions, metadata
- `graph.yaml` — node relationships (edges)
- `interaction.yaml` — user behaviors, event handlers
- `theme.yaml` — design system (colors, typography, spacing)

### Stage 2: Validate
Cross-check references:
- Structure nodes must have content entries
- Graph edges must reference valid content nodes
- All node IDs consistent across layers

### Stage 3: Resolve
Resolve complete node objects by merging:
- Structure position (where in hierarchy)
- Content data (what to display)
- Graph relations (connections to other nodes)
- Interaction rules (how users interact)
- Theme styling (how to display)

### Stage 4: Build Nexus Artifacts
Generate five JSON files in `generated/`:

#### `nexus.ast.json` — Homepage AST
Fully resolved abstract syntax tree:
```json
{
  "type": "page",
  "id": "homepage",
  "children": [
    {
      "type": "header",
      "id": "logo",
      "title": "Calyrai",
      ...
    },
    {
      "type": "hero",
      "id": "hero",
      ...
    },
    {
      "type": "grid",
      "columns": 3,
      "children": [...]
    },
    ...
  ]
}
```

Used by:
- React homepage renderer (`App.jsx`)
- HTML generator
- PDF exporter

#### `nexus.graph.json` — Knowledge Graph
Graph representation for visualization and navigation:
```json
{
  "nodes": [
    {"id": "core", "label": "Calyrai core", "data": {...}},
    {"id": "brix", "label": "Brix", "data": {...}},
    ...
  ],
  "edges": [
    {"source": "core", "target": "brix", "id": "core→brix"},
    ...
  ]
}
```

Used by:
- ReactFlow visualization
- Oracle (knowledge engine)
- Delphi (decision support)
- Knowledge Atlas

#### `nexus.theme.json` — Design System
Compiled theme variables:
```json
{
  "colors": {
    "primary": "#0A2E45",
    "accent": "#00D4FF",
    ...
  },
  "typography": {
    "h1": {"size": "48px", "weight": 700, ...},
    ...
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    ...
  },
  ...
}
```

Used by:
- React component styling
- CSS generation
- Design tool exports

#### `nexus.index.json` — Search Index
Searchable index for discovery:
```json
{
  "core": {
    "title": "Calyrai core",
    "summary": "Central reasoning engine",
    "keywords": ["calyrai", "core", "reasoning", ...],
    "route": "/core"
  },
  ...
}
```

Used by:
- Search interface
- Auto-complete
- Site navigation

#### `nexus.flowchart.json` — Authored Page Flow
Flowchart-friendly representation compiled from YAML-authored flow definitions:
```json
{
  "flows": {
    "homepage": {
      "direction": "TD",
      "nodes": [
        {"id": "landing", "label": "Visitor lands", "kind": "start"},
        {"id": "hero_stage", "ref": "hero", "label": "Brand promise", "kind": "step"}
      ],
      "edges": [
        {"source": "landing", "target": "hero_stage"}
      ],
      "mermaid": "flowchart TD\n    landing([Visitor lands])\n    hero_stage[Brand promise]\n    landing --> hero_stage"
    }
  }
}
```

Used by:
- documentation
- architecture reviews
- future visual flow renderers
- explainability and authoring audits

## Build Modules

### `compile.py`
**Main entry point** — orchestrates the full pipeline.

```bash
python3 build/compile.py
```

- Parses all YAML sources
- Runs validation
- Invokes resolver
- Builds and writes Nexus artifacts
- Prints structured output with pipeline visualization

### `validate.py`
**Validation layer** — ensures source coherence.

Classes:
- `Validator` — cross-check all references

Checks:
- Structure nodes have content entries
- Content entries referenced in structure
- Graph nodes/edges are valid

### `resolve.py`
**Resolution layer** — merges data from all sources.

Classes:
- `Resolver` — resolve complete node objects

Methods:
- `resolve_all()` — resolve all nodes
- `resolve_node(node_id)` — resolve single node by merging structure position + content + graph relations + interaction rules

### `builders.py`
**Builders** — construct Nexus artifacts.

Classes:
- `ASTBuilder` — build homepage AST
- `GraphBuilder` — build knowledge graph
- `ThemeBuilder` — compile theme (pass-through currently)
- `IndexBuilder` — build search index
- `FlowchartBuilder` — compile YAML-authored page flows into JSON + Mermaid

## Running the Build

```bash
cd /Users/rtscheliessnig/Workspace/calyrai-homepage
python3 build/compile.py
```

Output:
```
🏗️  CALYR.aí Nexus Compiler

📖 Stage 1: Parsing YAML source layer...
   ✓ structure, content, graph, interaction, theme
✓ Stage 2: Validating references...
   ✓ All references valid
🔗 Stage 3: Resolving nodes...
   ✓ Resolved 15 nodes
🌳 Stage 4: Building Nexus artifacts...
   ✓ generated/nexus.ast.json
   ✓ generated/nexus.graph.json
   ✓ generated/nexus.theme.json
  ✓ generated/nexus.index.json
  ✓ generated/nexus.flowchart.json

✅ Nexus compilation complete!

📊 Pipeline:
   Source Layer     → YAML
   Resolution Layer → Python (compile.py)
   Nexus Layer      → JSON AST
   Presentation     → React / ReactFlow / PDF / Docs
```

## Design Principles

### 1. Single Source of Truth
- YAML defines everything (structure, content, relationships, styling)
- No hardcoding anywhere
- Build system compiles to Nexus AST

### 2. Semantic Compilation
- Not a generic YAML→JSON converter
- Understands node semantics (position, relations, interaction)
- Produces typed AST with full context

### 3. Modular Architecture
- Each build module has single responsibility
- Validation independent from resolution
- Builders independent from each other
- Easy to add new outputs (PDF, LaTeX, etc.)

### 4. Layer Separation
- Source (YAML) remains unchanged
- Resolution (Python) transforms to AST
- Presentation (React/HTML/PDF) consumes Nexus
- Clear boundaries and interfaces

## Extending the Build System

To add new output format (e.g., PDF):

1. Create `builders/pdf_builder.py` with `PDFBuilder` class
2. Add to `compile.py`:
   ```python
   pdf_builder = PDFBuilder(self.source, resolved)
   pdf = pdf_builder.build()
   with open(self.output_dir / "nexus.pdf", "wb") as f:
       f.write(pdf)
   ```

To add new YAML source:

1. Add file to `content/`
2. Add parse in `compile.py`
3. Update `Validator` to check new source
4. Update `Resolver` to incorporate new data
5. Update builders as needed

## File Structure

```
calyrai-homepage/

content/
    structure.yaml      — WHERE things go
    content.yaml        — WHAT things are
    graph.yaml          — HOW things connect
    interaction.yaml    — HOW things behave
    theme.yaml          — HOW things look

build/
    compile.py          — Main orchestrator
    validate.py         — Validation layer
    resolve.py          — Resolution layer
    builders.py         — AST/Graph/Theme/Index builders
    README.md           — This file

generated/
    nexus.ast.json      — Homepage AST
    nexus.graph.json    — Knowledge graph
    nexus.theme.json    — Design system
    nexus.index.json    — Search index
```

## Key Insights

**YAML = Source**  
Configuration is declarative, version-controlled, human-readable.

**NEXUS = Truth**  
AST is single source of truth for all downstream consumers. No transformation logic in presenters.

**React = View**  
Components are dumb: `render(node) { switch(node.type) { case 'hero': return <Hero /> ... } }`

This architecture enables:
- Multiple output formats from same source
- Easy maintenance (all changes in YAML or build logic)
- Type safety (AST is strongly typed)
- Extensibility (add new builders without changing others)
