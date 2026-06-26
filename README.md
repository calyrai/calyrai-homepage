# CALYR.aí Homepage

Structured, data-driven homepage for CALYR.aí.

The site is generated from YAML content through a Python compiler into JSON artifacts, then rendered by a React/Vite frontend.

## System Flow

1. Content layer: YAML in content/
2. Compile layer: Python compiler in build/
3. Artifact layer: generated/*.json
4. Presentation layer: React app in web/src/
5. Deployment layer: deploy/ served by GitHub Pages

## Tech Stack

- Content: YAML
- Compiler: Python 3
- Frontend: React + Vite
- Deploy: GitHub Pages via .github/workflows/pages.yml

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Python 3

### Run locally

```bash
cd web
npm install
npm run dev
```

Default local URL: http://localhost:3000

### Compile content

```bash
cd /Users/rtscheliessnig/Workspace/calyrai-homepage
python3 build/compile.py
```

This regenerates:

- generated/nexus.ast.json
- generated/nexus.graph.json
- generated/nexus.theme.json
- generated/nexus.index.json

### Build frontend

```bash
cd web
npm run build
```

### Prepare deploy folder (manual)

```bash
cd /Users/rtscheliessnig/Workspace/calyrai-homepage
rm -rf deploy
cp -r web/dist deploy
```

## Repository Structure

```text
calyrai-homepage/
├── .github/
│   └── workflows/
│       └── pages.yml
├── build/
│   ├── compile.py
│   └── nexus/
│       ├── builders.py
│       ├── resolve.py
│       ├── schema.py
│       └── validate.py
├── content/
│   ├── content.yaml
│   ├── structure.yaml
│   └── theme.yaml
├── generated/
│   ├── nexus.ast.json
│   ├── nexus.graph.json
│   ├── nexus.index.json
│   └── nexus.theme.json
├── web/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.jsx
│       ├── components/
│       │   ├── DotRasterBackground.jsx
│       │   ├── Element.jsx
│       │   ├── Hero.jsx
│       │   ├── Navigation.jsx
│       │   ├── Page.jsx
│       │   ├── QuickContactRail.jsx
│       │   ├── Renderer.jsx
│       │   ├── RippleLayer.jsx
│       │   ├── Section.jsx
│       │   ├── Tile.jsx
│       │   ├── logo/
│       │   │   ├── LogoAnimation.jsx
│       │   │   ├── LogoCanvasEngine.js
│       │   │   └── LogoStateMachine.js
│       │   └── pages/
│       │       ├── BooksPage.jsx
│       │       └── ContactPage.jsx
│       ├── context/
│       │   ├── RippleContext.jsx
│       │   └── SelectionContext.jsx
│       ├── data/
│       │   ├── runtimeArtifacts.js
│       │   └── logo/
│       │       ├── logo.json
│       │       └── calyr_ring_dots_1000.json
│       ├── hooks/
│       │   ├── useIsMobile.js
│       │   └── useScrollCenter.jsx
│       ├── services/
│       │   ├── LinkItemService.js
│       │   ├── NavigationItemService.js
│       │   ├── NodeQueryService.js
│       │   ├── RouteStateService.js
│       │   ├── SectionLayoutService.js
│       │   └── ThemeVariableApplier.js
│       ├── styles/
│       │   ├── brix-photorealstickc-skin.css
│       │   ├── components.css
│       │   ├── layout.css
│       │   └── theme.css
│       └── utils/
│           └── interactionFilters.js
├── deploy/
├── docs/
├── scripts/
├── skins/
├── theme/
└── README.md
```

## Notes

- The frontend now uses a lightweight OO service layer to keep component files focused:
	- RouteStateService and NodeQueryService in App routing/data selection.
	- ThemeVariableApplier for CSS variable injection.
	- LinkItemService and NavigationItemService for link/navigation normalization.
	- SectionLayoutService for section behavior decisions.
- Reusable hooks include useIsMobile.js for responsive component behavior.
- The content model is consolidated in content/content.yaml (including graph and interaction blocks).
- Use LOCAL-README.md for personal local workflow details.
- Keep deploy/ synchronized with web/dist before pushing if deploying static output directly.
