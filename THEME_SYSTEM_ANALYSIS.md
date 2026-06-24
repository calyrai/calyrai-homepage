# CALYR.aí Theme System — Static vs. Dynamic Analysis

## 🔴 STATIC (Doesn't change per skin)

### Content Layer (YAML)
- `content/structure.yaml` — page hierarchy, layout structure
- `content/content.yaml` — text, titles, descriptions
- `content/graph.yaml` — knowledge graph nodes & edges
- `content/interaction.yaml` — user behaviors, click handlers
- `theme/base.yaml` — foundational design tokens (spacing, typography, radius)

### Compiler & Build
- `build/compile.py` — YAML parsing & validation logic (same for all skins)
- `build/nexus/` — 4-stage pipeline (Parse→Validate→Resolve→Build)
- Compilation rules for AST, Graph, Theme, Index builders

### React Components (JSX)
- `web/src/components/*.jsx` — Component structure & layout
- `web/src/App.jsx` — Entry point, artifact loading, provider setup
- `web/src/components/Renderer.jsx` — AST dispatcher logic
- Component structure: `Page` → `Section` → `Tile`, `Hero`, `Element`
- Event handlers, interaction logic, state management

### CSS Base Layer
- `web/src/styles/theme.css` — CSS variable declarations (static names)
- `web/src/styles/components.css` — Component selector structure
- `web/src/styles/layout.css` — Grid, spacing, responsive breakpoints
- `web/src/styles/navigation.css` — Mobile menu, animations
- CSS selectors, media queries, transition timings

### HTML Structure
- `web/index.html` — Entry point, React mount point
- `web/public/index.html` — Static assets reference

### Configuration
- `web/package.json` — Dependencies, build scripts
- `web/vite.config.js` — Vite build configuration
- `.gitignore` — Ignore patterns

---

## 🟢 DYNAMIC (Changes per skin)

### Skin YAML Files
- `skins/calyrai.yaml` — Light, minimalist identity
- `skins/oracle.yaml` — Dark, sophisticated identity
- `skins/lithos.yaml` — Earthy, warm identity

Each skin defines:
```yaml
skin:
  id: "oracle"
  colors:
    background: "#080812"
    text_primary: "#f4f1ff"
    accent: "#c77dff"
    # ... 15+ color properties
  components:
    hero:
      background: "#0d0d1a"
      text: "{{ colors.text_primary }}"
    tile:
      background: "{{ colors.surface }}"
    # ... component-specific styling
```

### Generated Artifacts (Output)
- `generated/nexus.ast.json` — STATIC STRUCTURE (same per skin)
- `generated/nexus.graph.json` — STATIC STRUCTURE (same per skin)
- `generated/nexus.theme.json` — **DYNAMIC CONTENT** (changes per skin)
  - Merges: `base.yaml` + `skins/{skin}.yaml`
  - Output: `{base, components, skin}`
  - Skin section contains colors + component overrides
- `generated/nexus.index.json` — STATIC STRUCTURE (same per skin)

### Runtime CSS Variables
- `--color-*` variables (set from `theme.json` colors)
- `--hero-bg`, `--hero-text` (component-specific)
- `--tile-bg`, `--tile-text` (component-specific)

### Component Inline Styles
- Hero component: `style={{ background: theme.skin.components.hero.background }}`
- Tile component: `style={{ background: theme.skin.components.tile.background }}`

---

## 📊 Data Flow

```
STATIC Content (structure.yaml, content.yaml, etc.)
        ↓
STATIC Compiler (compile.py) + DYNAMIC Skin (skins/oracle.yaml)
        ↓
DYNAMIC Theme (nexus.theme.json = base + skin)
        ↓
STATIC React Components receive DYNAMIC theme prop
        ↓
INLINE STYLES + CSS VARIABLES applied to STATIC HTML
        ↓
Final Rendered Page (different appearance per skin)
```

---

## 🔍 Current Problem

When user switches skins:
```bash
python3 build/compile.py oracle  # Generates new nexus.theme.json
```

The HTML/JSX structure **stays identical**, but:
1. ✅ `nexus.theme.json` changes (colors, component styling)
2. ✅ `web/public/generated/nexus.theme.json` auto-copied
3. ⚠️ **Browser cache may prevent fetch**
4. ⚠️ **React may not re-render if theme prop doesn't change identity**
5. ⚠️ **Inline styles only applied to `Hero` component (partial)**

---

## 🎯 Root Cause: Renderer.jsx Not Passing Theme

In `Renderer.jsx`, the theme is passed to component dispatcher:
```javascript
export function renderNode(node, theme, context = {}) {
  switch(node.type) {
    case 'hero':
      return <Hero {...props} />  // ← theme IS passed in props
```

But the problem is **each component needs to explicitly use it**. Currently only Hero does.

### Missing: Theme application to other components

- **Tile.jsx** — Receives theme but doesn't use it
- **Section.jsx** — Receives theme but doesn't use it
- **Element.jsx** — Receives theme but doesn't use it

Each needs to apply colors/styles from `theme.skin.components[type]`.

---

## ✅ What Doesn't Need to Change

### Will NOT change when switching skins:
- Page layout
- Component structure
- Text content
- Typography sizes & families
- Spacing & grid
- Responsive breakpoints
- Animations & transitions
- User interactions
- Navigation menu
- Tile positions
- Graph nodes & edges

### ONLY changes:
- Colors (background, text, accent)
- Component backgrounds
- Borders & shadows
- Component-specific styling (tile hover, hero gradient, etc.)

---

## 🚀 Action Items

1. **Update all components to use theme**:
   - Tile.jsx → apply tile styling from `theme.skin.components.tile`
   - Section.jsx → apply styling from `theme.skin.components` if available
   - Element.jsx → apply styling
   - Navigation.jsx → apply header/nav styling

2. **Fix caching issue**:
   - Cache-bust query params already in place (good)
   - Ensure Vite dev server reloads artifacts

3. **Add instant skin switcher**:
   - UI buttons to change skins without recompiling
   - Stored in localStorage
   - Fetch theme from server + apply

4. **Remove old CSS variable approach**:
   - Current theme.css has hardcoded calyrai colors
   - Switch to all-inline-styles or all-CSS-variables
