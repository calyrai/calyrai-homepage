# Homepage v4

Canonical homepage version: v4.
Legacy entrypoints (`index.html`, `homepage_v3/index.html`) are aligned to redirect to `homepage_v4/output/index.html`.

Unified build:
- `python3 scripts/build_unified_v4.py`

This directory is the v4 homepage workspace.

Architecture:
- Markdown = truth
- Atlas = meaning
- homepage.yaml = curation
- Arte.ts = rendering
- GSAP = behavior

Current migration objective:
- Run a canonical v4-only workflow.
- Converge UI toward Arte look-and-feel (no full reset).
- Limit Arte scope to landing page first.
- Roll out cellphone/mobile styling first, then desktop.
- Keep v3 as archived snapshot source only.

Use the CLI:
- python3 scripts/nexus_homepage.py create
- python3 scripts/nexus_homepage.py validate
- python3 scripts/nexus_homepage.py build
- python3 scripts/build_unified_v4.py

## Object-Oriented Engine (v4)

Core idea:
- The homepage is not hardcoded HTML.
- Homepage extends Experience.
- Text/content is transformed through objects and projections before rendering.

Pipeline:
- Text/Content
- Content Objects
- Page Objects
- Projection Objects
- Renderer
- Website

Object tree:
- CalyrHomepage
- HeroScene
- PrincipleScene
- ProjectionDemo
- ObjectOrientedSection
- ArteInterface
- AtlasInterface
- WorkspaceInterface
- FooterScene

Folder structure:
- src/core
	- CalyrObject.ts
	- TextObject.ts
	- PageObject.ts
	- SectionObject.ts
	- Experience.ts
- src/projections
	- Projection.ts
	- ProjectionResult.ts
	- ArteProjection.ts
	- AtlasProjection.ts
	- ArticleProjection.ts
	- MondrianProjection.ts
	- WorkspaceProjection.ts
- src/renderers
	- Renderer.ts
	- HtmlRenderer.ts
	- ArteRenderer.ts
	- AtlasRenderer.ts
- src/content
	- homepage.md
	- nexus.md
- src/app
	- CalyrHomepage.ts
	- buildHomepage.ts

Key rule:
- Homepage = first application of the engine
- Atlas = second application
- Arte = third application
- Workspace = fourth application
