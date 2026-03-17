# calyrai-homepage (public)

This repository is the public Calyr.ai website.

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
	- Builder: `scripts/build_projects.py`
	- Output: `src/projects/<project>/*.html`

Note: the generated `src/*.html` files are reproducible build outputs; edit the Markdown sources + templates instead.

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
