# Site Build and Deploy Guide

This page explains how the CALYR.aí homepage is created from YAML, how that data reaches the React app, and what is critical for deployment.

## 1. Source of Truth

The homepage starts in five YAML files under `content/`:

- `content/structure.yaml` defines the page hierarchy and layout.
- `content/content.yaml` defines titles, summaries, icons, routes, and text.
- `content/graph.yaml` defines relationships between nodes.
- `content/interaction.yaml` defines interaction behavior.
- `content/theme.yaml` defines design tokens and theme values.

These YAML files are the semantic source of truth for the homepage structure and content.

## 2. Compilation Pipeline

The YAML files are compiled by the Python build system:

```bash
python3 build/compile.py
```

The compiler does four things:

1. Parse the YAML files.
2. Validate cross-references.
3. Resolve merged node objects.
4. Build generated artifacts.

The main generated artifacts are written to `generated/`:

- `generated/nexus.ast.json`
- `generated/nexus.graph.json`
- `generated/nexus.theme.json`
- `generated/nexus.index.json`

Conceptually, the pipeline is:

```text
YAML -> Python compiler -> resolved JSON artifacts -> React renderer -> deployed HTML
```

## 3. How the React Site Uses the Data

Historically, the app fetched JSON artifacts at runtime. That no longer works well for the current single-file GitHub Pages deployment.

The production app now imports embedded runtime data from:

- `web/src/data/runtimeArtifacts.js`

The React entry point reads those exports directly in:

- `web/src/App.jsx`

Current pattern:

- `AST_DATA` becomes the page tree.
- `THEME_DATA` becomes the live theme input.
- `BOOKS_PAGE_DATA` is used for the books route.

This means the deployed site does not depend on runtime fetches for `generated/*.json`.

## 4. Rendering Model

At runtime, the React app renders the resolved AST through component dispatch:

- `web/src/components/Renderer.jsx`
- `web/src/components/Page.jsx`
- `web/src/components/Section.jsx`
- `web/src/components/Tile.jsx`
- `web/src/components/Hero.jsx`

In short:

1. YAML defines content and structure.
2. Python resolves the semantic model.
3. Runtime data is embedded into source.
4. React renders the embedded model into the final page.

## 5. Build Output for Production

The frontend is built as a self-contained single HTML page.

Build locally with:

```bash
npm --prefix web ci
npm --prefix web run build
```

The deploy preparation step is:

- `scripts/prepare-deploy.sh`

That script:

1. installs frontend dependencies,
2. builds the site,
3. clears old files from `deploy/`,
4. copies `web/dist/index.html` to `deploy/index.html`,
5. copies `CNAME` to `deploy/CNAME` if present.

The published artifact is therefore intentionally minimal:

- `deploy/index.html`
- `deploy/CNAME`

## 6. GitHub Pages Deployment

The live deployment is handled by:

- `.github/workflows/pages.yml`

Important:

- Python build scripts such as `build/compile.py`, `build/validate.py`, `build/resolve.py`, and other repository tooling are not deployed to the live GitHub Pages site.
- GitHub Pages publishes only the prepared static artifact from `deploy/`.
- For the live site, the relevant files are `deploy/index.html` and `deploy/CNAME`.

That workflow:

1. checks out the repository,
2. validates that `deploy/index.html` exists,
3. uploads `deploy/` as the Pages artifact,
4. deploys it with `actions/deploy-pages`.

The live domain is:

- `https://calyr.ai/`

## 7. Critical Deploy Requirements

These settings are important. If they are wrong, the deployment can look successful while the live site is still broken.

### Required GitHub Pages settings

Repository Settings -> Pages must be:

- Source: `GitHub Actions`
- Custom domain: `calyr.ai`
- Enforce HTTPS: enabled

Expected API state:

- `build_type: workflow`
- `cname: calyr.ai`
- `https_enforced: true`

You can verify that with:

```bash
gh api repos/calyrai/calyrai-homepage/pages
```

## 8. Known Failure Mode

A real production issue occurred on June 25, 2026.

### Symptom

- The GitHub Actions deploy run was green.
- `https://calyr.ai/` still returned the default GitHub Pages 404 page.

### Root cause

GitHub Pages was still configured in `legacy` mode instead of `workflow` mode.

That meant:

- the workflow deployed correctly,
- but the Pages site configuration still expected a different publishing model,
- so the custom domain kept serving the Pages 404 page.

### Verified fix

1. Switch Pages source to `GitHub Actions`.
2. Ensure `build_type` becomes `workflow`.
3. Enable HTTPS enforcement.
4. Trigger a fresh `workflow_dispatch` deployment.

## 9. What to Check After YAML Changes

If you change homepage content or structure:

1. update the YAML under `content/`,
2. run `python3 build/compile.py`,
3. verify the generated artifacts are correct,
4. verify `web/src/data/runtimeArtifacts.js` reflects the content meant for production,
5. run the frontend build,
6. prepare the deploy artifact,
7. deploy and verify `https://calyr.ai/` returns `200`.

## 10. Practical Commands

Compile content:

```bash
python3 build/compile.py
```

Build frontend:

```bash
npm --prefix web ci
npm --prefix web run build
```

Prepare deploy artifact:

```bash
./scripts/prepare-deploy.sh
```

Check Pages config:

```bash
gh api repos/calyrai/calyrai-homepage/pages
```

Check live domain:

```bash
curl -I https://calyr.ai/
```

## 11. Short Version

If someone asks, "How is this site made?", the shortest correct answer is:

```text
The site is defined in YAML, compiled by Python into resolved artifacts, embedded into the React app for HTML-only deployment, built into a single HTML file, copied into deploy/, and published to GitHub Pages via a GitHub Actions workflow.
```

If someone asks, "Are the Python scripts deployed to the live site?", the shortest correct answer is:

```text
No. The Python scripts stay in the repository as build tools. GitHub Pages only receives the static deploy artifact from deploy/.
```
