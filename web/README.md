# CALYR.aí Homepage — React Renderer

React frontend that consumes Nexus artifacts and renders the interactive, responsive homepage for CALYR.aí knowledge ecosystem.

## Overview

**Project Status:** ✅ Stage 8 Complete (Mobile Responsive) | ✅ Stage 9 Live on GitHub Pages

The homepage is built on a **semantic compiler + React renderer** architecture that separates content (YAML) from presentation (React components). This enables rapid iteration, responsive design scaling, and maintainable component reuse.

## Architecture

**Data Flow:**
```
content/          (YAML or JSON source data)
  ↓
build/compile.py  (Nexus Semantic Compiler - 867 LOC)
  ↓
generated/        (4 JSON artifacts)
  ├── nexus.ast.json       (Homepage AST - 16 nodes)
  ├── nexus.graph.json     (Knowledge graph - 5 edges, ReactFlow format)
  ├── nexus.theme.json     (Design tokens - colors, typography, spacing)
  └── nexus.index.json     (Full-text search index)
  ↓
web/              (React + Vite frontend)
  ├── src/components/
  │   ├── App.jsx           (Entry point, artifact loader, SelectionProvider)
  │   ├── Navigation.jsx    (Stage 8: Mobile hamburger menu + drawer)
  │   ├── Renderer.jsx      (AST dispatcher to React components)
  │   ├── Page.jsx          (Root container)
  │   ├── Section.jsx       (Stage 8: Collapsible sections on mobile)
  │   ├── Hero.jsx          (Large hero section with icon + text)
  │   ├── Tile.jsx          (Stage 8: Touch-draggable cards, responsive)
  │   ├── Element.jsx       (Generic container, used for footer)
  │   └── KnowledgeGraph.jsx (ReactFlow-based visualization)
  ├── src/context/
  │   └── SelectionContext.jsx (Tile ↔ Graph bidirectional sync)
  ├── src/styles/
  │   ├── theme.css          (170 LOC: CSS variables from nexus.theme.json)
  │   ├── components.css     (789 LOC: Component styles + Stage 8 collapse animations)
  │   ├── layout.css         (800+ LOC: Responsive grid + Stage 8 responsive rules)
  │   └── navigation.css     (155 LOC NEW: Hamburger + drawer animations)
  ├── vite.config.js         (Vite build configuration)
  ├── package.json           (196 npm packages: React 18.3, Vite 5.2, ReactFlow)
  └── index.html             (Entry point - must be at project root)
  ↓
Browser (localhost:3000 dev | GitHub Pages production)
```

## Components

### Renderer.jsx
Main rendering engine — recursive AST traversal with component dispatch pattern.

```jsx
// Recursive dispatcher based on node.type
switch(node.type) {
  case 'page':      return <Page {...props}>{renderChildren()}</Page>
  case 'section':   return <Section {...props}>{renderChildren()}</Section>
  case 'hero':      return <Hero {...props} />
  case 'tile':      return <Tile {...props} />
  case 'element':   return <Element {...props} />
}
```

### Navigation.jsx (Stage 8 - 107 LOC)
Mobile-responsive hamburger menu with sliding drawer.

**Features:**
- Hamburger button visible only on mobile (<768px)
- Drawer slides in from left with smooth animation
- Semi-transparent overlay
- Auto-closes on link click
- Manual close button (✕)
- Safe area support for notched devices
- Keyboard accessible

```jsx
const [isOpen, setIsOpen] = useState(false)
const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

// useEffect with resize listener to update isMobile on window resize
// Hamburger and drawer show/hide based on @media (max-width: 767px)
```

### Section.jsx (Stage 8 - Collapsible)
Converts section headers into collapsible areas on mobile.

**Features:**
- Per-section collapse state: `useState(isCollapsed)`
- Header click toggles collapse
- Collapse icon (↓) rotates 180° when open
- Smooth fadeIn/fadeOut animations
- Desktop: always expanded (collapse disabled for >768px)
- Mobile: fully collapsible for content discovery

```jsx
const [isCollapsed, setIsCollapsed] = useState(false)
// onClick handler toggles, conditional rendering for children
// Icon shows only on mobile, rotates on state change
```

### Tile.jsx (Stage 8 - Touch-Draggable)
Card component with responsive sizing and touch support.

**Features:**
- GPU-accelerated transforms (translate3d)
- Touch event handlers (touchstart/touchmove/touchend)
- Position persistence via localStorage
- SelectionContext integration for graph sync
- Responsive scaling on breakpoints
- 44px+ touch targets

```jsx
const handleTouchStart = (e) => {
  setIsDragging(true)
  touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  e.preventDefault()
}
// Similar for touchmove (dragging) and touchend (cleanup)
// localStorage persists position across page reloads
```

### Hero.jsx
Large hero section for page introduction.

```jsx
// Renders: icon + title + subtitle + body
// Responsive typography with semantic sizing
// Full width on all breakpoints
```

### KnowledgeGraph.jsx
ReactFlow-based interactive visualization of knowledge relationships.

**Current Status:** Implemented, disabled in App.jsx during testing (can be re-enabled)

**Graph Structure:**
- 5 nodes: calyrai core, brix, aflowtex, lithos, oracle, delphi (6 total)
- 5 edges showing module relationships
- Interactive zoom, pan, drag controls
- Node click syncs selection with Tile components via SelectionContext

## Styling & Responsive Design

### theme.css (170 LOC)
CSS variables from nexus.theme.json:
- Color palette (primary, secondary, accent)
- Typography scales (heading/body sizes per breakpoint)
- Spacing grid (--space-xs through --space-xl)
- Shadows and transitions

### components.css (789 LOC)
Component-level styles:
- Hero styling (icon, title, text layout)
- Tile card styles (background, border, shadow, hover effects)
- Section header styles with collapse animation (Stage 8)
- KnowledgeGraph container
- **Stage 8 Additions (50 LOC):**
  - Collapse animations: fadeIn/fadeOut 0.3s ease-out
  - .collapse-icon: smooth rotate(180deg) transition
  - Section header active states and focus indicators

### layout.css (800+ LOC)
Responsive layout utilities:
- Mobile-first approach
- Responsive grid system (1-col → 2-col → 3-col)
- **Responsive Breakpoints (Stage 8):**
  - Mobile: <768px — 1-column grid, hamburger visible, collapsible sections
  - Tablet: 768-1023px — 2-column grid, hamburger hidden
  - Desktop: ≥1024px — 3-column grid, hamburger hidden
- Typography scaling per breakpoint
- Safe area support: `max(var(--space-lg), env(safe-area-inset-*))`
- Touch-friendly targets: ≥44px minimum
- Input font-size 16px (prevents iOS auto-zoom)
- Horizontal scroll prevention: `overflow-x: hidden`
- **Stage 8 Additions (300+ LOC):**
  - Section grid responsive columns
  - Collapse icon display/hide rules
  - Smooth transitions for breakpoint changes

### navigation.css (155 LOC - NEW)
Mobile navigation styling:
- .hamburger: Fixed top-left, 3-line animation transforms to X
- Line transforms: rotate(45°/-45°) and translate to form X shape
- .nav-overlay: Semi-transparent with fadeIn animation
- .mobile-nav: Fixed drawer with smooth cubic-bezier slide
- Media queries: Shows on mobile, hides on desktop
- All interactive elements 44px+ for touch accessibility

## State Management

### SelectionContext.jsx
React Context for tile ↔ graph bidirectional sync:

```jsx
const [selectedTileId, setSelectedTileId] = useState(null)

// When tile clicked → update context → graph re-renders with highlighted node
// When graph node clicked → update context → tile selection reflects
// Shared state across component tree without prop drilling
```

### localStorage
Tile positions persist across page reloads:

```javascript
// On tile drag: localStorage.setItem(`tile-${id}-position`, JSON.stringify(pos))
// On mount: Check localStorage and restore position if present
```

## Artifacts

### nexus.ast.json (Rendered Data)
16-node Abstract Syntax Tree:

```json
{
  "type": "page",
  "children": [
    { "type": "hero", "title": "CALYR.aí — Knowledge Nexus", ... },
    {
      "type": "section",
      "id": "platforms",
      "title": "Platforms",
      "children": [
        { "type": "tile", "id": "core", "title": "Calyrai core", ... },
        { "type": "tile", "id": "brix", "title": "brix", ... },
        // ... 4 more tiles (aflowtex, lithos, oracle, delphi)
      ]
    },
    { "type": "section", "id": "architecture", "children": [...] },
    { "type": "tile", "id": "philosophy", ... },
    { "type": "tile", "id": "contact", ... },
    { "type": "element", "id": "footer", "body": "© 2026 CALYR.aí | ..." }
  ]
}
```

### nexus.theme.json (Design Tokens)
```json
{
  "colors": { "primary": "#1a3a52", "secondary": "#5a8ca6", ... },
  "typography": { "h1": { "size": "32px", "weight": 700 }, ... },
  "spacing": { "--space-xs": "4px", "--space-sm": "8px", ... },
  "shadows": [ { "blur": 8, "spread": 0, "alpha": 0.15 } ],
  "transitions": { "duration": "300ms", "timing": "cubic-bezier(...)" }
}
```

### nexus.graph.json (Knowledge Graph)
ReactFlow format with 5 edges:
```json
{
  "nodes": [
    { "id": "core", "label": "Calyrai core", "type": "default", ... },
    // ... 5 more nodes
  ],
  "edges": [
    { "source": "core", "target": "brix", "animated": true },
    // ... 4 more edges
  ]
}
```

### nexus.index.json (Search Index)
Full-text search index for quick discovery (Future: search UI component).

## Build & Dev

### Development
```bash
npm install
npm run dev      # Runs Vite dev server on localhost:3000 with HMR
```

### Production Build
```bash
npm run build    # Outputs to dist/ directory
npm run preview  # Preview production build locally
```

## Stage 8: Mobile Responsive — ✅ COMPLETE

### Features Implemented & Tested
- ✅ **Hamburger Navigation** — Visible on mobile, auto-closes on navigation
- ✅ **Responsive Grid** — 3-col (desktop) → 2-col (tablet) → 1-col (mobile)
- ✅ **Collapsible Sections** — Expand/collapse per-section on mobile with smooth animations
- ✅ **Touch Support** — Draggable tiles with touch event handlers (touchstart/move/end)
- ✅ **Safe Area Support** — CSS env(safe-area-inset-*) for notched devices
- ✅ **Responsive Typography** — Font sizing scales across breakpoints
- ✅ **Touch-Friendly Targets** — All interactive elements ≥44px minimum
- ✅ **Breakpoint Detection** — Media queries and resize listeners for viewport changes

### Test Results
| Feature | Desktop (1400px) | Tablet (768-1024px) | Mobile (375px) |
|---------|------------------|-------------------|----------------|
| Hamburger Menu | Hidden | — | ✅ Visible & works |
| Navigation Drawer | — | — | ✅ Slides/closes |
| Grid Layout | ✅ 3 cols | ✅ 2 cols | ✅ 1 col |
| Collapsible Sections | ✅ Works | ✅ Works | ✅ Works |
| Touch Drag | ✅ Supported | ✅ Supported | ✅ Supported |

## Stage 9: GitHub Pages Deployment — ✅ LIVE

### Overview
Deploy production-ready homepage to GitHub Pages with automated CI/CD pipeline.

### Incident Log: June 25, 2026

**Symptom**
- The GitHub Actions deployment finished successfully.
- `https://calyr.ai/` still returned the default GitHub Pages `404` page.
- The repository Pages URL redirected to the custom domain, which made the issue look like a missing artifact even though the workflow was green.

**Root Cause**
- Repository Pages settings were still configured with `build_type: legacy`.
- The repository was already publishing through `.github/workflows/pages.yml`, so GitHub Pages source mode and actual deployment mode were out of sync.
- `https_enforced` was also disabled for the custom domain.

**Verified Fix**
- Set repository Pages source to `GitHub Actions`.
- Confirm `build_type: workflow`.
- Confirm `cname: calyr.ai`.
- Enable `https_enforced: true`.
- Trigger one fresh `workflow_dispatch` run of `pages.yml` after changing the Pages mode.

**Result**
- `https://calyr.ai/` returned `HTTP 200` again.
- The live site served the application bundle instead of the GitHub Pages 404 page.

### Step 1: Build for Production
```bash
npm run build
# Outputs optimized bundle to dist/
# - HTML, CSS, JS minified
# - Tree-shaking, code splitting
# - Vite optimizations applied
```

### Step 2: GitHub Pages Setup
```bash
# Configure GitHub Pages to deploy from:
# Repository Settings → Pages → Source: GitHub Actions
# Custom domain: calyr.ai
# Enforce HTTPS: enabled
```

### Step 3: GitHub Actions CI/CD Pipeline
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd web && npm ci
      
      - name: Build
        run: cd web && npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web/dist
          cname: calyr.ai  # Optional: if using custom domain
```

### Step 4: Deploy
```bash
# Push to main branch
git push origin main

# GitHub Actions automatically:
# 1. Checks out code
# 2. Installs npm dependencies
# 3. Runs npm run build
# 4. Deploys dist/ to gh-pages branch
# 5. GitHub Pages serves from custom domain or username.github.io/repo
```

### Step 5: Verify Deployment
- Visit deployed URL (e.g., calyrai-homepage.pages.github.io or custom domain)
- Verify all Stage 8 features work on deployed version:
  - Hamburger menu on mobile
  - Responsive grid at all breakpoints
  - Tile interactions and persistence
  - Graph visualization (if enabled)

### Configuration Files
- `vite.config.js` — Already configured with correct base path for GitHub Pages
- `package.json` — Has build script: `"build": "vite build"`
- `.github/workflows/deploy.yml` — Will create for automated deployment

### Deployment Checklist
- [ ] npm run build succeeds locally
- [ ] dist/ folder generated with optimized files
- [ ] .github/workflows/deploy.yml created
- [ ] Push to main triggers GitHub Actions
- [ ] GitHub Actions workflow completes successfully
- [ ] Repository Settings → Pages uses GitHub Actions, not Deploy from branch
- [ ] Deployed site accessible and responsive
- [ ] All Stage 8 features verified on live site
- [ ] CNAME configured (if using custom domain)
- [ ] HTTPS enforcement enabled for the custom domain

### Deployment Verification Commands

```bash
# Check the live custom domain
curl -I https://calyr.ai/

# Check Pages configuration through GitHub CLI
gh api repos/calyrai/calyrai-homepage/pages
```

Expected Pages fields:
- `build_type: workflow`
- `cname: calyr.ai`
- `https_enforced: true`
- `html_url: https://calyr.ai/`

---

## Project Stats

| Metric | Value |
|--------|-------|
| React Components | 8 (Page, Section, Hero, Tile, Element, Navigation, KnowledgeGraph, Renderer) |
| CSS Styling | 1,500+ LOC across 4 files |
| npm Packages | 196 installed |
| React Version | 18.3.1 |
| Vite Version | 5.2.0 |
| Compiler LOC | 867 (Nexus Semantic Compiler) |
| Generated Artifacts | 4 JSON files (AST, graph, theme, index) |
| Responsive Breakpoints | 3 (mobile, tablet, desktop) |

## Technologies

- **Frontend Framework:** React 18.3.1
- **Build Tool:** Vite 5.2.0 with HMR
- **Visualization:** ReactFlow (knowledge graph)
- **State Management:** React Context + localStorage
- **Styling:** CSS (custom properties, responsive grid, animations)
- **Compiler:** Python Nexus Semantic Compiler (generates artifacts from YAML)
- **Deployment:** GitHub Pages + GitHub Actions

## Navigation & Sync

### Tile Selection ↔ Graph Highlighting
When a tile is clicked:
1. Click handler fires in Tile.jsx
2. Update SelectionContext with tile ID
3. KnowledgeGraph receives context update via useContext
4. Graph re-renders with selected node highlighted
5. SelectionContext provides bidirectional flow: tile → graph → tile

### Responsive Breakpoint Detection
- React useEffect in Navigation.jsx monitors window.innerWidth
- Updates isMobile state on resize
- Layout.css media queries handle CSS-level breakpoint changes
- Both approaches ensure consistent behavior across components

## Future Enhancements

- **Stage 10:** Search functionality (full-text search using nexus.index.json)
- **Stage 11:** Dark mode toggle with theme switching
- **Stage 12:** Animated transitions between pages
- **Stage 13:** Integration with real backend API
- **Performance:** Service Worker caching, lazy loading, code splitting optimization

---

**Last Updated:** June 23, 2026 | **Status:** Stage 8 ✅ Complete | Stage 9 🚀 Ready for Deployment

### Page, Section, Hero, Tile, Element
Components that render different node types. Each consumes `nexus.ast.json` data and `nexus.theme.json` styling.

## Setup

### Install dependencies
```bash
cd web
npm install
```

### Development server
```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build for production
```bash
npm run build
```

Creates optimized bundle in `dist/`

## Styling

All CSS comes from `nexus.theme.json` converted to CSS variables.

**Key variables:**
- `--color-primary` — Main brand color
- `--color-secondary` — Secondary color
- `--color-accent` — Accent/CTA color
- `--font-size-h1`, `--font-size-h2`, etc.
- `--space-md`, `--space-lg`, etc. — Spacing scale
- `--shadow-md`, `--shadow-lg` — Elevation shadows
- `--transition-normal`, `--transition-slow` — Animation timing

## Responsive Design

- **Desktop (1920px+):** 3-column grid, full graph
- **Tablet (768px-1919px):** 2-column grid, compact graph
- **Mobile (<768px):** 1-column grid, simplified graph

Media queries in `components.css`

## Next Steps

1. ✅ **React Renderer** (Stage 3) — COMPLETE
2. Tile grid layout (Stage 4)
3. ReactFlow knowledge graph (Stage 5)
4. Tile ↔ Graph interaction (Stage 6)
5. Mobile responsive (Stage 8)
6. Deploy (Stage 9)
