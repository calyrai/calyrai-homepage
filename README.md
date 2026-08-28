# CALYR.aí Homepage

Structured, data-driven homepage for CALYR.aí.

The site is generated from YAML content through a Python compiler into JSON artifacts, then rendered by a React/Vite frontend.

## Repository identity

- **Local source of truth:** `/Users/rtscheliessnig/Workspace/calyrai-homepage`
- **Git remote:** `https://github.com/calyrai/calyrai-homepage.git`
- **Primary branch:** `main`
- **Deployment artifact:** generated contents of `deploy/` (never hand-edited or committed)

This repository is the only active source for the Calyr.ai homepage. The former
location `/Users/rtscheliessnig/Workspace/workspace-active/calyrai-homepage` is
no longer used. Older homepage working copies are retained for history under:

`/Users/rtscheliessnig/Workspace/workspace-archive/homepage-duplicates-2026-07-17`

Do not develop or deploy the homepage from archived copies, ecosystem
placeholders, research exports, or the former `calyr-web` checkout.

## Lithos relationship

The related Lithos homepage has its own source of truth at:

`/Users/rtscheliessnig/Workspace/lithos-homepage`

The two sites share Helvetica-based typography, magenta `#ff38d1`, related
spacing and radii, and restrained motion timing. Their visual identities remain
deliberately distinct: Calyr.ai is right-oriented, semantic, and graph-led;
Lithos is left-oriented, orbital, and black/cream.

Design decision:
- Pages are defined by YAML plus rule application.
- Classic page HTML is treated as generated output, not as source of truth.

## System Flow

1. Content layer: YAML in content/
2. Compile layer: Python compiler in build/
3. Artifact layer: generated/*.json
4. Presentation layer: React app in web/src/
5. Deployment layer: ephemeral `deploy/` artifact served by GitHub Pages

Publication rule: only the minimal content generated into `deploy/` goes online. The directory is rebuilt from `web/public/` plus the Vite bundle for every release and is not a source tree.

Source-of-truth rule: never maintain behavior or content in `deploy/`. Author content under `content/`, application code under `web/src/`, and static research modules under `web/public/`; regenerate the publication artifact through `scripts/prepare-deploy.sh`.

CALYRAI/LITHOS ownership rule:
- CALYRAI page owns orientation and routing semantics.
- LITHOS page is a deep-dive target reached through authored CALYRAI route intent.
- Both are governed from YAML + compiler rules, not from hand-maintained publication HTML.

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

And syncs route governance artifacts:

- web/public/generated/route.policy.json
- web/public/generated/route.audit.json

Strict compile policy:

- The compiler requires explicit page hierarchy in content/structure.yaml.
- structure.homepage must define children explicitly.
- Legacy inferred homepage layout mode (header/hero/grid/footer synthesis) has been removed.
- If compile fails, fix the structure YAML instead of relying on compiler-side layout inference.

### YAML Route Policy and Route Audit

Route fallback behavior is source-of-truth driven from YAML.

Configure this in content/content.yaml:

- route_policy.fallback_mailto
- route_policy.spa_routes

What compile.py now does:

1. Reads all route fields recursively from content/content.yaml.
2. Writes web/public/generated/route.policy.json with fallback_mailto and spa_routes.
3. Validates internal routes against existing web/public files.
4. Writes unresolved internal routes to web/public/generated/route.audit.json.
5. Prints compile-time warnings for each unresolved internal route.

Runtime behavior:

- web/src/components/Tile.jsx reads ROUTE_POLICY_DATA and ROUTE_AUDIT_DATA from web/src/data/runtimeArtifacts.js.
- If a tile route is unresolved, routing falls back to fallback_mailto.
- This prevents unresolved internal links from going to a 404 page.

### Explicit Homepage Documentation Map

Use this as the canonical map of where each concern is defined.

Authoring (source of truth):

- Page hierarchy and section membership: `content/structure.yaml`
- Node content and semantic intent (`intent`, `render`, `behavior`, `explain`): `content/content.yaml`
- Theme tokens and skin values: `theme/base.yaml`, `skins/oracle.yaml`

Compiler (enforcement and transformation):

- Compile orchestration and artifact sync: `build/compile.py`
- Strict homepage schema enforcement (`homepage.children` required): `build/nexus/validate.py`
- AST construction from authored structure: `build/nexus/builders.py`
- Shared schema keys and validation constants: `build/nexus/schema.py`

Runtime (execution of compiled model):

- AST node renderer dispatch: `web/src/components/Renderer.jsx`
- App-level route and data wiring: `web/src/App.jsx`
- Section behavior interpretation: `web/src/services/SectionLayoutService.js`
- Route and node query services: `web/src/services/RouteStateService.js`, `web/src/services/NodeQueryService.js`
- Theme variable application: `web/src/services/ThemeVariableApplier.js`

Interaction and responsive behavior:

- Tile interaction behavior: `web/src/components/Tile.jsx`
- Quick contact rail behavior: `web/src/components/QuickContactRail.jsx`
- Mobile breakpoint behavior: `web/src/hooks/useIsMobile.js`
- Interaction filtering for background/ripple layers: `web/src/utils/interactionFilters.js`

Generated outputs:

- Compiler artifacts: `generated/nexus.ast.json`, `generated/nexus.graph.json`, `generated/nexus.theme.json`, `generated/nexus.index.json`, `generated/nexus.flowchart.json`
- Bundled runtime artifact module: `web/src/data/runtimeArtifacts.js`

System-level contracts:

- Multi-homepage architecture contract (CALYRAI + LITHOS): `docs/homepage-system-contract.md`
- React Flow Swiss design contract (YAML-first graph surface): `docs/reactflow-swiss-design-contract.md`
- Scientific AI, Numerical Recipes, prediction, and validation contract: `docs/scientific-ai-numerics-reference.md` (`CALYR-METHOD-NR-AI-001`)
- Oracling method contract: `docs/oracling.md` (`CALYR-METHOD-ORACLE-001`)
- Oracling Reading Room: `docs/oracling-reading-room.md` (`CALYR-ROOM-ORACLE-001`)
- Graphical Interface Catalog: `content/books.yaml` (`interface_catalog`) → `/research/interfaces/`
- Unified research chapters and Swiss Code: `content/research-system.yaml` → `/research/swiss-code/`

Concrete page mapping:

- CALYRAI runtime entry: `web/src/App.jsx` -> published `web/public/index.html`
- LITHOS target route authored in YAML, compiled into artifacts, published at `web/public/research/platforms/lithos/index.html`

### Build frontend

```bash
cd web
npm run build
```

### Prepare deploy folder (manual)

```bash
./scripts/prepare-deploy.sh
```

This command rebuilds `deploy/` from the canonical sources. Never edit the generated directory directly.

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

## Footer Contacts System

The footer displays structured contact information configured entirely in YAML, with no hardcoded frontend contact data. Updates can be made without touching React code.

### Configuration

Edit `content/content.yaml` under the `footer:` root node:

```yaml
footer:
  title: "Connect"
  subtitle: "CALYR.AI contact registry"
  summary: "Research, engineering, and collaboration channels."
  body: >
    Contact profile and channels are configured in YAML and can be updated without touching frontend code.

  contacts:
    - id: principal
      label: Principal
      value: Rupert Tscheliessnig
    - id: role
      label: Role
      value: CEO, Founder
    - id: email
      label: Email
      value: rupert.tscheliessnig@calyr.ai
      route: mailto:rupert.tscheliessnig@calyr.ai
    - id: phone
      label: Phone
      value: "069 919 200915"
      route: "tel:+43699192009155"
    - id: office
      label: Office
      value: TBA
      hide: true
```

### Contact Entry Schema

Each contact object supports:

- `id` (string, required): Unique identifier for the contact item.
- `label` (string, required): Display label shown to user.
- `value` (string, required): Contact value (name, number, address, etc.).
- `route` (string, optional): URL or mailto/tel URI for clickable items. Renders as `<a>` if present.
- `hide` (boolean, optional): If true, item is not rendered.

### Display Logic

The footer contact grid is rendered by `web/src/components/Element.jsx`. Each contact item is automatically hidden if:

1. `hide: true` is explicitly set
2. `value` is empty string
3. `value` is "TBD"
4. `value` is "TBA"

This allows non-technical editors to mark entries as pending without leaving them blank in YAML.

### Rendering

Contacts are displayed as a CSS Grid with cards showing:

- Label (bold)
- Value (clickable as link if `route` present, plain text otherwise)
- Optional status field (if `status` key exists)

Styling is defined in `web/src/styles/components.css`:

- `.footer-contact-grid`: Auto-fit grid with 180px min columns, 10px gap
- `.footer-contact-item`: Subtle rounded border, 12px radius, hover effects
- `.footer-contact-value`: Hover color #ff78bd, word-break for long values

### Compile and Build Flow

1. **Compile YAML**: `python3 build/compile.py` reads `content/content.yaml` and includes footer contacts in `generated/nexus.ast.json`.
2. **Build frontend**: `npm run build` in web/ transpiles JSX and bundles runtime artifacts.
3. **Renderer dispatch**: `web/src/components/Renderer.jsx` detects `type: "footer"` and routes to `Element.jsx`.
4. **Runtime rendering**: `Element.jsx` unpacks contacts array and renders card grid only if contacts present and not filtered by hide logic.

### Recent Updates (2026-06-26)

- Added CEO/Founder role designation
- Added phone number 069 919 200915 with tel: URI for calling
- Implemented conditional hiding of TBA/TBD/empty entries
- Updated schema to support `hide` flag for non-technical editors

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
	- `build/compile.py` syncs local compiler output into `web/src/data/runtimeArtifacts.js` for the minimal homepage build.
	- the deployed homepage uses the bundled runtime data and does not depend on `generated/*.json` being online.
	- `web/src/components/Renderer.jsx` dispatches nodes by `node.type` through the renderer registry.
- That means the page behaves more like a renderer for a precompiled document tree than a traditional OO widget hierarchy.
- The OO part exists mainly in helper/service classes such as `NodeQueryService`, `RouteStateService`, `ThemeVariableApplier`, and `SectionLayoutService`.

- Editability direction:
	- page intent can move into YAML through `intent`, `render`, `behavior`, and `explain` blocks,
	- compiler steps can emit inspectable metadata instead of only implicit structure,
	- authored page flow can now be represented as YAML and compiled into a flowchart artifact.

- Migration note:
	- the legacy inferred layout path has been removed from the compiler.
	- homepage composition now depends on explicit `children` declarations in `content/structure.yaml`.

- The frontend now uses a lightweight OO service layer to keep component files focused:
	- RouteStateService and NodeQueryService in App routing/data selection.
	- ThemeVariableApplier for CSS variable injection.
	- LinkItemService and NavigationItemService for link/navigation normalization.
	- SectionLayoutService for section behavior decisions.
- Reusable hooks include useIsMobile.js for responsive component behavior.
- The content model is consolidated in content/content.yaml (including graph and interaction blocks).
- The semantic construction method intended for publication is documented in `docs/calyrai-semantic-construction.md`.
- Only the minimal `deploy/` package is intended to go online.
- Use LOCAL-README.md for personal local workflow details.
- Keep deploy/ synchronized with web/dist before pushing if deploying static output directly.

## YAML project contract

All homepage application projects and their child models are authored in
`content/projects.yaml`. `content/content.yaml` contains shared navigation,
platform and page copy. The compiler merges both sources and fails when a
project is missing, duplicated, or placed in the wrong YAML file. Generated
JSON, tiles and interfaces must never become independent content sources.
