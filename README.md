# calyrai-homepage (public)

This repository is the public Calyr.ai website.

## Locked homepage decisions (2026-06-14)

The following direction is approved and should be treated as the current baseline.

- Hero label: AI-Native Scientific Design
- Hero brand headline: Calyr.ai branding with larger visual weight
- Hero subtitle: Transforming simulations, experiments and data into interactive surrogate models.
- Hero tagline: Molecular Intelligence · Adaptive Systems · Reproducible Oracles
- Tile mesh direction: keep bright/white tile net rendering (do not switch to dark/black net globally)
- Cross-browser/local behavior: keep local asset paths compatible with both localhost and file loading paths

Primary implementation files for this state:

- `homepage_v5/homepage.md`
- `scripts/homepage_builder/titlepage.py`
- `scripts/homepage_builder/living_mesh.py`
- `scripts/build_homepage_v2.py`
- generated outputs: `index.html`, `pages/*.html`

## Homepage versioning

- Canonical runtime/build chain (active): `homepage_v5/homepage.md` + `homepage_v5/homepage.yaml` + `homepage_v5/tiles/*.yaml` -> `index.html`

## Canonical pipeline (2026-06)

Use this workflow as the single source of truth for homepage behavior.

- Main source markdown: `homepage_v5/homepage.md`
- Main curation yaml: `homepage_v5/homepage.yaml`
- Tile modules: `homepage_v5/tiles/*.yaml`
- Detail page markdown: `homepage_v5/content_pages/*.md`
- Detail page manifest: `homepage_v5/content_pages/content_pages.yaml`
- Main builder: `scripts/build_homepage_v2.py`
- Detail-page builder: `scripts/build_content_pages.py`
- Canonical output: `index.html` + `pages/*.html`

Commands:

```bash
cd apps/homepage
./nexus.homepage-build
./nexus.homepage-open 8011
```

Notes:

- `nexus.homepage-open` runs a build before serving to keep local state deterministic.
- The v4 TypeScript OO engine under `homepage_v4/src/` is a reference/prototyping surface, not the active homepage runtime.

## Session handoff (2026-06-12)

Use this block as the restart point for the next agent session.

### Current state

- Contact QR style was switched to white modules on black background in `pages/contact.game.js`.
- Start page behavior was updated in `index.html`:
	- Clicking the left hero brand (`Calyr.aí`) resets to start state.
	- Legal note (impressum footer) is shown only when the contact tile (`#lisnig-impressum`) is open.
	- Nested/internal side scrollbars were removed; page uses full-page wheel scrolling.

### Last pushed commits (main)

- `2af02d0` - contact QR style + instant local load docs.
- `01a405f` - remove nested side scrollbars and restore full-page wheel scrolling.

### Run and verify quickly

```bash
cd apps/homepage
./nexus.homepage-open 8011
```

Then verify:

- `http://localhost:8011/index.html`
- Click left brand area -> all tiles collapse to start state.
- Open Contact tile -> legal/impressum footer appears.
- Close Contact tile -> legal/impressum footer hides.
- Mouse-wheel scroll works on whole page without sidebars.

### Guardrails for next agent

- Keep homepage work in this repo only (`apps/homepage/`) and push to `calyrai/calyrai-homepage` only.
- Do not mix pushes with root `Calyr` repo work in the same commit flow.
- Commit only minimal files changed for the requested behavior.
- Prefer local server checks (`./nexus.homepage-open 8011`) over `file://` checks because iframe/contact resource loading differs on `file://`.

### Next likely tasks

- Projects workstream first, with AORTA as priority.
- Mobile fine-tuning: hero/menu spacing and tile sizing in narrow portrait.
- Re-check contact tile full-screen behavior in landscape mobile.
- Optional cleanup: review untracked `logo/` and `references/` before future pushes so only intentional assets are committed.

### Next focus: AORTA (projects)

AORTA source-of-truth is currently in the main Calyr docs module, not in homepage tile content yet.

- Primary source: `docs/calyr.aorta/calyr.aorta.md`
- Module readme/build: `docs/calyr.aorta/README.md`
- Load policy/register: `docs/calyr.aorta/register.md`

Recommended sequence for next agent:

1. Review and update AORTA content only in `docs/calyr.aorta/calyr.aorta.md`.
2. Build AORTA outputs from single source:
	- `cd docs/calyr.aorta`
	- `./calyr.aorta build all`
3. Decide homepage integration shape:
	- Add AORTA-specific project tile/detail link, or
	- Extend Projects page content with explicit AORTA entry.
4. Keep AORTA module separate from global autoload chain unless explicitly requested.
5. Push only minimal homepage files for UI/integration changes; keep core AORTA source commits scoped and separate.

## Short navigation

Legacy note: the `pages_src/`, `projects_src/`, `src/`, and `scripts/build_pages.py` references below are historical and are not the active pipeline in this workspace.

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

- Builds canonical homepage output to `index.html` and `pages/*.html`.

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
