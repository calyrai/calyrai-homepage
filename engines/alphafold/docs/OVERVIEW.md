# glabs_nexus_engines_alphafold Overview

## Purpose
This module is the sandboxed AlphaFold engine surface for testing and iteration.

- Semantic namespace: `glabs.nexus.engines.alphafold`
- Alias namespace: `nexus.engines.alphafold`
- Runtime ID: `glabs_nexus_engines_alphafold`

## File Structure

- `glabs_nexus_engines_alphafold.html`
  - Canonical page entry for this engine module.
- `js/glabs_nexus_engines_alphafold.js`
  - Runtime behavior, panel rendering, payload composition.
- `css/glabs_nexus_engines_alphafold.css`
  - Engine-specific visual layer.
- `data/glabs_nexus_engines_alphafold_layout.json`
  - Source-of-truth layout and defaults consumed by JS.

## JSON Source-Of-Truth
The page is created from `data/glabs_nexus_engines_alphafold_layout.json`.

Main sections:
- `engine`, `engine_alias`, `engine_id`: naming contract across semantic and runtime layers.
- `tiles[]`: defines panel composition and order.
- `defaults`: default sequence, split-definition, chain, and seeds.
- `steps[]` and panel-oriented blocks: step metadata used to render registry and flow views.

## Runtime Generation Flow
1. HTML loads module script `js/glabs_nexus_engines_alphafold.js`.
2. Script fetches `data/glabs_nexus_engines_alphafold_layout.json`.
3. Script hydrates defaults and builds panel tiles from JSON.
4. Script renders registry, compose, selection, links, contents, terminal, comments.
5. User actions generate transformed sequence and composed AlphaFold payload.

## ReactFlow Context
- The standalone AlphaFold page uses a custom panel renderer and does not instantiate ReactFlow directly.
- ReactFlow is used in the main SAS interface (`glabs_os.html` via `js/glabs_os_reactflow.js`) to power the graph-oriented workspace.
- This separation keeps engine testing isolated while preserving graph orchestration in the main interface.

## Compatibility Entrypoints
Root-level aliases redirect to the canonical module page:
- `nexus_engine_alphafold.html`
- `glab_nexus_engines_alphafold.html`
- `glabs_nexus_engines_alphafold.html`
