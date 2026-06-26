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
- generated/nexus.flowchart.json

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
│   ├── nexus.flowchart.json
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
│       │   ├── RuntimeArtifactLoader.js
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
│   └── calyrai-semantic-construction.md
├── scripts/
├── skins/
├── theme/
└── README.md
```

## Cellphone File Map

Use this as the primary mobile-debug path.

Breakpoint policy:

1. JavaScript mobile mode uses widths below `768px`.
2. CSS mobile-only behavior should use `@media (max-width: 767px)`.
3. Desktop/tablet behavior starts at `768px` and above.

1. Mobile state + route classes
	- web/src/App.jsx
	- Applies books-route/contact-route body classes that affect mobile styling branches.

2. Breakpoint detection hook
	- web/src/hooks/useIsMobile.js
	- Single source for mobile breakpoint checks in interactive components.

3. Mobile navigation shell
	- web/src/components/Navigation.jsx
	- Controls hamburger visibility, drawer open/close, and overlay behavior on mobile.

4. Contact rail touch/pointer behavior
	- web/src/components/QuickContactRail.jsx
	- Handles pointer drag/tap logic and prevents hidden-panel touch blocking.

5. Tile touch interactions
	- web/src/components/Tile.jsx
	- Handles touch drag thresholds and mobile scroll-vs-drag behavior.

6. Background pointer layer
	- web/src/components/DotRasterBackground.jsx
	- Global pointer listener behavior that can influence perceived mobile interaction feel.

7. Mobile component styling
	- web/src/styles/components.css
	- Contains hamburger/menu/contact rail rules and most @media (max-width: 768px) branches.

8. Mobile layout/responsive utilities
	- web/src/styles/layout.css
	- Contains responsive utilities, breakpoint layout changes, and touch-action utilities.

9. Skin-level pointer/visual overrides
	- web/src/styles/brix-photorealstickc-skin.css
	- Skin-specific visual and pointer-related overrides that can affect mobile UX.

Suggested review order: App -> useIsMobile -> Navigation -> QuickContactRail -> Tile -> components.css -> layout.css.

Latest phone stability note:

1. The tile "disassembly" issue on phone came from persisted desktop drag offsets being loaded back into mobile layout.
2. Mobile now ignores stored tile offsets, keeps tiles at their default origin, and does not save drag positions back while in phone mode.
3. Result: desktop free-position behavior stays desktop-only, while phone layout remains stable and deterministic.

## Logo Subsystem

Primary files:

1. web/src/components/logo/LogoAnimation.jsx
	- React wrapper for the interactive logo.
	- Connects React lifecycle, config, state machine, and canvas engine.

2. web/src/components/logo/LogoStateMachine.js
	- Owns logo interaction state transitions.
	- Current flow: idle -> active -> qr_build -> qr_show -> dissolve -> reassemble -> idle.
	- Uses a schedule table instead of hardcoded per-state branching.

3. web/src/components/logo/LogoCanvasEngine.js
	- Owns particle simulation and rendering.
	- Handles ring targets, QR targets, dissolve, entropy, and reassembly visuals.
	- Guards the resize listener and keeps subtle motion during qr_show.

4. web/src/data/logo/logo.json
	- Single source of truth for timings, interaction rules, QR payload, and activation-zone settings.

5. web/src/data/logo/calyr_ring_dots_1000.json
	- External point set used to shape the ring target field.

Current logo implementation notes:

1. Activation-zone behavior is config-driven via `upperActivationZoneFraction` in logo.json.
2. State timings are config-aligned and no longer depend on misleading hardcoded fallback values.
3. The stable logo still requires continued phone-side visual tuning if the desired final idle state differs from the current ring/line composition.

## Notes

## Architecture Classification

- The frontend is not a fully object-oriented application in the classic sense.
- It is best described as a hybrid architecture:
	- AST-driven content rendering.
	- Functional React UI composition.
	- Small OO service classes for isolated behaviors.
- The compiler is now starting to expose authored intent more explicitly through YAML policy blocks and a compiled flowchart artifact.
- The main page structure comes from compiled content data, not from hardcoded page assembly:
	- `build/compile.py` produces `generated/nexus.ast.json`.
	- `build/compile.py` also produces `generated/nexus.flowchart.json` from authored flow definitions in YAML.
	- `web/src/App.jsx` prefers compiled artifacts from `web/public/generated/` and falls back to `web/src/data/runtimeArtifacts.js` only if artifact loading fails.
	- `web/src/components/Renderer.jsx` dispatches nodes by `node.type` through the renderer registry.
- That means the page behaves more like a renderer for a precompiled document tree than a traditional OO widget hierarchy.
- The OO part exists mainly in helper/service classes such as `NodeQueryService`, `RouteStateService`, `ThemeVariableApplier`, and `SectionLayoutService`.

- Editability direction:
	- page intent can move into YAML through `intent`, `render`, `behavior`, and `explain` blocks,
	- compiler steps can emit inspectable metadata instead of only implicit structure,
	- authored page flow can now be represented as YAML and compiled into a flowchart artifact.

- The frontend now uses a lightweight OO service layer to keep component files focused:
	- RouteStateService and NodeQueryService in App routing/data selection.
	- RuntimeArtifactLoader for compiled artifact loading with fallback.
	- ThemeVariableApplier for CSS variable injection.
	- LinkItemService and NavigationItemService for link/navigation normalization.
	- SectionLayoutService for section behavior decisions.
- Reusable hooks include useIsMobile.js for responsive component behavior.
- The content model is consolidated in content/content.yaml (including graph and interaction blocks).
- The semantic construction method intended for publication is documented in `docs/calyrai-semantic-construction.md`.
- Use LOCAL-README.md for personal local workflow details.
- Keep deploy/ synchronized with web/dist before pushing if deploying static output directly.
