# calyrai-homepage (public)

This repository is the public Calyr.ai website.

## Homepage versioning

- Version registry and build chain (MD -> YAML -> HTML): `README_versions.md`

## Short navigation

Use this repo section when you are doing homepage-facing work.

### Edit here

- `pages_src/` for site page content
- `projects_src/` for project pages
- `templates/` for page and project shells
- `src/viewers/` for viewer code
- `src/css/` and `src/js/` for assets

### Prefer these sources

- Primary homepage source: `apps/homepage/`
- Docs mirror only when needed: `docs/_repo/apps/homepage/`

Project homepage rule:

- Canonical project homepage source: `projects_src/<project>/index.md`
- Optional project notes/pages: `projects_src/<project>/*.md`
- Generated output: `src/projects/*.html`, `src/projects/<project>/*.html`

If you are unsure where to edit homepage content, start in `pages_src/` or `projects_src/`, not in generated HTML.

Canonical path example:

- mirror path: `docs/_repo/apps/homepage/pages_src/projects.md`
- source path: `apps/homepage/pages_src/projects.md`

### Homepage-local commands

Run these commands from `apps/homepage/`.

### Instant local load

Use this when you want the homepage to open immediately with local assets and avoid `file://` loading quirks.

```bash
cd apps/homepage
./nexus.homepage-open 8011
```

Open:

- `http://localhost:8011/index.html`
- Contact page directly: `http://localhost:8011/pages/contact.html`

Expected contact QR style:

- White QR modules on a black background panel.

```bash
./nexus.homepage-build
```

- Builds canonical homepage output to `homepage_v4/output/index.html`.

```bash
./nexus.homepage-open 8011
```

- Serves the homepage locally on `http://localhost:8011/`.

```bash
./nexus.homepage-push "homepage update"
```

- Runs build, commits all homepage repo changes, and pushes the current branch.
- Typo-compatible alias is available: `./nexus.hompage-build`.

### V5 material-engine starter

```bash
./nexus.homepage-v5-open 8020
```

- Opens local server for the staged living-surface sandbox.
- Starter page: `homepage_v5/v5_living_surface/index.html`
- Layout source: `homepage_v5/v5_living_surface/tiles.layout.yaml`

### Related active paths

- Nexus app UI: `apps/nexus/`
- BMCA app: `apps/bmca/`
- Main workspace map: `docs/ACTIVE_MAP.md`

## Markdown organization

This repo is **Markdown-first**:

- **Core site pages**
	- Sources: `pages_src/*.md` and `pages_src/pages/*.md`
	- Templates (HTML shells): `templates/pages/*.template.html`
	- Builder: `scripts/build_pages.py`
	- Output: `src/*.html` and `src/pages/*.html`

- **Project documentation**
	- Sources: `projects_src/<project>/*.md`
	- Template: `templates/project_template.html`
	- Homepage template: `templates/project_home_template.html`
	- Builder: `scripts/build_projects.py`
	- Output: `src/projects/*.html` and `src/projects/<project>/*.html`

Note: the generated `src/*.html` files are reproducible build outputs; edit the Markdown sources + templates instead.


## Homepage maintenance

The homepage is designed to be **single-source-of-truth**:

- Content: `pages_src/index.yaml`
- Renderer: `scripts/build_pages.py` (index YAML kind: `index`)
- Styles: `src/css/home.css`
- Built output: `src/index.html`
- Repo-root mirror: `index.html` + `css/` + `js/` etc (synced from `src/` by `scripts/sync_root_from_src.sh`)
- Deploy output: `public/` (synced from `src/` by `scripts/build_public.sh`)

Rule of thumb: **edit `pages_src/` + `src/`, then run `bash scripts/build_all.sh`**.

## Public vs. private content

- **Public source of truth:** `src/` (committed)
- **Generated deploy output:** `public/` (generated, gitignored)
- **Local-only/private content:** `private/` (gitignored)

The build copies `src/ → public/`. If a private overlay exists at:

- `private/public_overlay/`

…it is applied on top of `public/` during local builds.

This keeps the GitHub Pages build clean: the public CI runner does not have your `private/` folder, so nothing private can be deployed from this repo.

## Recommended repo setup

### 1) Public website repo (this repo)

Remote:
- `https://github.com/calyrai/calyrai-homepage`

Contains only public code/content:
- `src/`, `scripts/`, `templates/`, `projects_src/`

### 2) Private overlay repo (your GitHub)

Create a private repo (example name):
- `ruperttscheliessnig/calyrai-homepage-private`

Clone it into this repo’s `private/` folder:

```bash
cd /path/to/ai_calyrai_homepage
rm -rf private
git clone git@github.com:ruperttscheliessnig/calyrai-homepage-private.git private
```

Then place local-only pages/assets under:

- `private/public_overlay/` (mirrors the `public/` layout)

Example:

- `private/public_overlay/pages/internal.html` → becomes `public/pages/internal.html` locally
- `private/public_overlay/data/private.json` → becomes `public/data/private.json` locally

## Build

- Full build (docs + public output):

```bash
bash scripts/build_all.sh
```

- Public output only:

```bash
bash scripts/build_public.sh
```

If `private/public_overlay/` exists, it is automatically applied.

## Local preview (serve `public/`)

This repo builds a static website into `public/`. You can preview it locally with Python’s built-in server:

```bash
cd /path/to/ai_calyrai_homepage
bash scripts/build_all.sh

# If port 8000 is busy, pick another (e.g. 8001)
python3 -m http.server 8001 --directory public
```

Then open:

- `http://localhost:8001/`
- Nexus page: `http://localhost:8001/pages/nexus.html`

## Editing pages (source of truth)

- Site pages are generated from Markdown in `pages_src/`.
- Do not edit `public/` directly (it is generated output).

### Nexus page

- Source: `pages_src/pages/nexus.md`
- Template shell: `templates/pages/pages/nexus.template.html`
- Styles: `src/css/nexus.css`

The Nexus “method” section is intentionally framed as:

- Representation → parameters → model coupling
- ML discovers structure; physics interprets extracted parameters (not raw signals)

After editing, rebuild:

```bash
bash scripts/build_all.sh
```

## Notes

### Removed pages

`art` and `pricing` pages are no longer part of the public homepage build.
They were removed from the site page build list in `scripts/build_pages.py`, so they won’t be regenerated on rebuild.

## Organizing your other private repos

If you want everything “organisable via your private git”, a clean pattern is to create a **private hub repo** (e.g. `ruperttscheliessnig/calyr-private`) and add your research repos as **git submodules**.

That gives you one private entry point (issues, notes, scripts) while keeping individual projects separated.

## Universal Layout Editing Process (All Pages)

Use this process when you want direct, in-place editing on the real page (not a separate schematic view).

Scope covered:

- Page panels (toolbar, canvas, inspector, palette, floating controls)
- Node movement/editing (graph nodes)
- Editor surfaces (inspector/editor columns and sections)

### 1) Add a layout config in the page runtime JS

Define one central config object for editable panels, drag limits, and storage keys.

Reference implementation:

- `apps/homepage/engines/alphafold/js/glabs_nexus_engines_alphafold_reactflow.js`

Required shape:

- `panelEdit.storageKey`: localStorage key for panel offsets
- `panelEdit.min` and `panelEdit.max`: drag clamps
- `panelEdit.editable[]`: list of editable panel IDs and labels

### 2) Add state + persistence

Add runtime state for:

- `layoutEditEnabled` (on/off mode)
- `panelOffsets` (x/y offsets per panel)

Persist offsets to localStorage under `panelEdit.storageKey`, and restore on load.

### 3) Add in-place drag handlers

Implement panel drag helpers:

- `getPanelOffsetStyle(panelId)`
- `startPanelOffsetDrag(panelId, pointerEvent)`
- `resetPanelOffsets()`

Apply offsets by adding `style={getPanelOffsetStyle('<id>')}` directly on the real panel element.

### 4) Expose controls in the real toolbar

Add two buttons where users already work:

- `Layout` (toggle in-place panel editing)
- `Reset Panels` (clear offsets)

This keeps editing directly inside the actual page workflow.

### 5) Add drag grips on real panels

For each editable panel:

- Add a small grip button rendered only in layout mode
- Bind grip pointer down to `startPanelOffsetDrag(panelId, event)`

Current AlphaFold grip targets:

- toolbar
- mode ruler
- canvas panel
- inspector panel
- palette panel

### 6) Keep node editing in-page too

For graph pages:

- Keep `nodesDraggable` bound to a mode toggle (for safe accidental-drag prevention)
- Keep node editor/inspector visible in the same page
- Keep node reset/fit actions local to the page

Current AlphaFold node editing reference:

- `Move mode` control in flow controls
- active node JSON editor in inspector sections

### 7) CSS requirements

Add three style layers:

- Layout mode affordance (dashed outlines on editable panels)
- Grip styles (`.af-layout-panel-grip`)
- Hidden-by-default grip visibility (`.is-layout-edit` parent class enables grips)

Reference styles:

- `apps/homepage/engines/alphafold/css/glabs_nexus_engines_alphafold.css`

### 8) Page integration checklist (copy for every page)

1. Add page-level `LAYOUT_CONFIG` / `WORKFLOW_LAYOUT.panelEdit`
2. Add `layoutEditEnabled` and `panelOffsets` state
3. Add localStorage restore/save effects
4. Add toolbar buttons: `Layout`, `Reset Panels`
5. Add grips to target panels
6. Add per-panel transform styles
7. Add CSS for outlines + grips
8. Bump script query version in HTML (`?v=...`) to force browser refresh
9. Validate with `get_errors`
10. Verify in browser: toggle mode, drag panels, reload, confirm persistence

### 9) Storage key convention (recommended)

Use one key per page:

- `af.workflow.layoutPanelOffsets.v1` (AlphaFold)
- `<page>.layoutPanelOffsets.v1` (for new pages)

Use one key for floating utility offsets if needed:

- `<page>.panelDrag.v1`

### 10) Why this process

This gives the easiest editing flow:

- Users edit in the real context
- Panels, nodes, and editor move in one place
- Layout survives refresh automatically
- Same pattern can be repeated quickly across all pages

## Homepage Direct Layout Editing (In-Page)

Standard runtime:

- `apps/homepage/js/nexus_layouttuning.js` (`nexus.layouttuning`)

This is the shared layout refinement runtime for page-level tuning (storage, JSON snapshot, save/download/copy helpers).

The homepage now supports direct in-page layout editing (same pattern, no separate editor required).

Entry point:

- `apps/homepage/index.html`

Runtime + styles:

- `apps/homepage/js/home_layout_editor.js`
- `apps/homepage/css/home.css`

Toolbar controls on the live homepage:

- `Layout`: toggle edit mode and show raster + draggable overlay boxes
- `Reset`: clear saved offsets and restore default positions
- `Save`: persist current offsets and download `home_layout_offsets.json`
- `Copy JSON`: copy current offsets for handoff or versioning

Persistence key:

- `calyr.home.layout.offsets.v1`

Current editable homepage targets:

- `#hero`
- `.hero-copy`
- `.hero-kicker`
- `.hero-title`
- `.hero-subtitle`
- `.hero-orbit-logo`
- `.hero-cta`
- `.hero-characteristics`
- `.site-footer`

Notes:

- Dragging snaps to a 16px raster.
- Offsets are applied via `transform: translate(...)` on target elements.
- Offsets persist through refresh and can be reset at any time.
