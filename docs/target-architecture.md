# CALYR.aí Target Architecture

## Single source of truth

`content/content.yaml` is the only semantic source for the active website experience:

- homepage content and behavior
- teaser page and interaction graph
- Lithos presentation and slide sequence
- routes and contact intent

Theme primitives remain isolated in `theme/base.yaml` and `skins/*.yaml`; they contain design tokens, never page copy.

## Build flow

```text
content/content.yaml
        |
        v
build/compile.py -- strict validation
        |
        +--> generated/nexus.*.json
        +--> web/public/generated/teaser.config.json
        +--> web/public/generated/lithos-deck.config.json
        +--> web/src/data/runtimeArtifacts.js
        |
        v
generic React / SVG / Canvas renderers
        |
        v
Vite build --> deploy
```

## Layer boundaries

### YAML owns

- visible copy
- page hierarchy
- slide order and slide types
- routes and links
- semantic node and edge data
- behavior parameters
- interaction parameters

### Compiler owns

- schema validation
- reference validation
- normalization
- generation of runtime JSON
- generation of publication artifacts

The compiler must fail on missing required runtime configuration. It must not invent page copy.

### Renderer owns

- DOM, SVG and Canvas construction
- mathematical geometry generation
- animation execution
- pointer, keyboard and touch handling
- accessibility mechanics

Renderers consume generated JSON. They do not parse YAML and do not contain duplicate page content.

### Generated output owns nothing

Files under `generated/`, `web/public/generated/`, `web/src/data/runtimeArtifacts.js`, `web/dist/`, and `deploy/` are replaceable build artifacts. Manual edits are invalid and may be overwritten.

## Failure policy

- No content fallbacks in JavaScript.
- No silent replacement of invalid configuration.
- Missing configuration produces a visible configuration error and a failed compiler/build.
- A successful deployment must always be reproducible from YAML plus renderer code.

