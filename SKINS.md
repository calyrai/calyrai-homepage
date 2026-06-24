# Skin System Documentation

## Overview

The CALYR.aí homepage uses a **three-layer design system**:

1. **Structure** (`content/structure.yaml`) — *What is on the page*
2. **Theme Base** (`theme/base.yaml`) — *Foundation design tokens* (spacing, typography, radius)
3. **Skins** (`skins/*.yaml`) — *How it feels* (colors, component styling)

This separation allows the same content and layout to render with completely different visual identities without any code changes.

## Architecture

```
content/
├── structure.yaml       ← What: page hierarchy, sections, tiles
├── content.yaml         ← Text: titles, descriptions
├── graph.yaml           ← Relationships: nodes and edges
└── interaction.yaml     ← Behaviors: user interactions

theme/
└── base.yaml            ← Foundation: spacing, typography, radius, component patterns

skins/
├── calyrai.yaml         ← Calyrai Clean: light, minimal, cyan accents
├── oracle.yaml          ← Oracle Dark: dark, mysterious, violet accents
└── lithos.yaml          ← Lithos Earthy: warm, natural, earth tones

        ↓ (Compiler: theme/base.yaml + skins/{skin}.yaml)

generated/
└── nexus.theme.json     ← Merged design tokens → CSS variables
```

## How It Works

### 1. Base Theme (`theme/base.yaml`)

Contains foundational design tokens that are **skin-agnostic**:

```yaml
base:
  radius:
    tile: 18px
    md: 8px
    lg: 12px
  
  spacing:
    page: 48px
    grid_gap: 24px
    lg: 24px
  
  typography:
    font_family: Avenir, Inter, sans-serif
    heading:
      h1:
        size: 3.2rem
        weight: 700
```

These define the **structure and layout** — they never change between skins.

### 2. Skin (`skins/calyrai.yaml`)

Contains **color palette** and **component styling** decisions:

```yaml
skin:
  id: calyrai
  name: calyrai clean
  
  colors:
    background: "#f6fbfd"
    surface: "#ffffff"
    text_primary: "#0a2e45"
    accent: "#00d4ff"
    border: "#c8e8f2"
  
  components:
    tile:
      background: "{{ colors.surface }}"
      border: "1px solid {{ colors.border }}"
      shadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
    
    hero:
      background: "{{ colors.primary }}"
      text: "{{ colors.surface }}"
      accent: "{{ colors.accent }}"
```

Skins can reference colors using template syntax: `{{ colors.primary }}`

### 3. Compiler Merge

The compiler (`build/compile.py`) **merges** base + selected skin:

```python
# Loads: theme/base.yaml + skins/{skin}.yaml
# Outputs: generated/nexus.theme.json

"base": { "spacing": {...}, "typography": {...} },
"skin": { "colors": {...}, "components": {...} }
```

### 4. CSS Variables

The theme is converted to CSS custom properties:

```css
:root {
  /* From base.yaml */
  --space-lg: 24px;
  --grid-gap: 24px;
  --font-family: Avenir, Inter, sans-serif;
  
  /* From skin/calyrai.yaml */
  --color-background: #f6fbfd;
  --color-text-primary: #0a2e45;
  --color-accent: #00d4ff;
  --tile-radius: 18px;
}
```

React components use these variables:

```jsx
// components/Tile.jsx
<div style={{
  backgroundColor: 'var(--color-surface)',
  border: `1px solid var(--color-border)`,
  borderRadius: 'var(--tile-radius)',
  boxShadow: 'var(--tile-shadow)',
}}>
```

## Available Skins

### Calyrai Clean
```bash
npm run compile calyrai
```
- **Background:** Light blue (#f6fbfd)
- **Text:** Dark blue (#0a2e45)
- **Accent:** Cyan (#00d4ff)
- **Mood:** Minimalist, professional, clean
- **Use Case:** Corporate, SaaS, business

### Oracle Dark
```bash
npm run compile oracle
```
- **Background:** Deep purple (#080812)
- **Text:** Light lavender (#f4f1ff)
- **Accent:** Violet (#c77dff)
- **Mood:** Mysterious, sophisticated, knowledge-oriented
- **Use Case:** Research, academia, mysterious/magical

### Lithos Earthy
```bash
npm run compile lithos
```
- **Background:** Warm beige (#f5ede0)
- **Text:** Deep brown (#3e2817)
- **Accent:** Golden brown (#d4a574)
- **Mood:** Natural, organic, earthy
- **Use Case:** Environmental, sustainability, consequence

## Building with Different Skins

### Default (Calyrai Clean)
```bash
npm run compile
# or explicitly:
npm run compile calyrai
```

### Oracle Dark
```bash
npm run compile oracle
```

### Lithos Earthy
```bash
npm run compile lithos
```

## Creating a New Skin

1. Create a new file `skins/myskin.yaml`:

```yaml
skin:
  id: myskin
  name: My Custom Skin
  description: A beautiful custom theme
  
  colors:
    background: "#1a1a1a"
    surface: "#2a2a2a"
    text_primary: "#ffffff"
    accent: "#ff00ff"
    # ... more colors
  
  components:
    tile:
      background: "{{ colors.surface }}"
      border: "1px solid {{ colors.border }}"
      # ... more styling
    # ... other components
```

2. Compile with your skin:
```bash
npm run compile myskin
```

## Key Rules

✅ **Structure** (`structure.yaml`) defines **what** is on the page
✅ **Base theme** (`theme/base.yaml`) defines **where** it sits
✅ **Skin** (`skins/*.yaml`) defines **how** it feels
✅ The same content works with any skin — just recompile!

## File Organization

```
calyrai-homepage/
├── build/
│   └── compile.py                 ← Compiler (loads base + skin, merges, outputs)
├── content/
│   ├── structure.yaml             ← What: page structure
│   ├── content.yaml               ← Text
│   ├── graph.yaml                 ← Relationships
│   └── interaction.yaml           ← Behaviors
├── theme/
│   └── base.yaml                  ← Foundation tokens (spacing, typography, etc.)
├── skins/
│   ├── calyrai.yaml               ← Light, minimal skin
│   ├── oracle.yaml                ← Dark, violet skin
│   └── lithos.yaml                ← Earthy, warm skin
├── generated/
│   ├── nexus.theme.json           ← Output: merged theme
│   ├── nexus.ast.json             ← Output: AST
│   ├── nexus.graph.json           ← Output: Graph
│   └── nexus.index.json           ← Output: Index
└── web/
    └── src/
        ├── styles/
        │   └── theme.css          ← CSS variables from nexus.theme.json
        └── components/
            └── Tile.jsx           ← Uses CSS variables for styling
```

## Example: Switching Themes

**Before (hardcoded colors in code):**
```jsx
// ❌ Bad: hardcoded colors spread everywhere
<div style={{ backgroundColor: '#00d4ff', color: '#0a2e45' }}>
  Hello
</div>
```

**After (CSS variables from skins):**
```jsx
// ✅ Good: uses CSS variables from theme
<div style={{ 
  backgroundColor: 'var(--color-accent)', 
  color: 'var(--color-text-primary)' 
}}>
  Hello
</div>
```

Now change the skin and all colors update automatically!

```bash
npm run compile oracle
# Page now uses Oracle Dark colors (purple, lavender)

npm run compile lithos
# Page now uses Lithos Earthy colors (brown, gold)

npm run compile calyrai
# Page back to Calyrai Clean (cyan, blue)
```

**No code changes needed!**

## Technical Details

### Variable Naming Convention

CSS variables follow this pattern:

```
--{category}-{property}: {value};

--color-background: #f6fbfd;        ← Color category
--space-lg: 24px;                   ← Spacing category
--font-family: Avenir;              ← Typography category
--tile-radius: 18px;                ← Component category
--nav-height: 80px;                 ← Component category
```

### Template Syntax in Skins

Skins can reference other values:

```yaml
colors:
  primary: "#0a2e45"
  accent: "#00d4ff"

components:
  tile:
    border: "1px solid {{ colors.border }}"    ← References colors.border
    background: "{{ colors.surface }}"          ← References colors.surface
```

This is resolved during compilation.

### Merging Rules

Base + Skin = Final Theme

```
theme/base.yaml
  ├── base.radius
  ├── base.spacing
  ├── base.typography
  └── components (patterns)
  
  + skins/calyrai.yaml
  ├── skin.colors
  ├── skin.components (styling)
  
  = generated/nexus.theme.json
  ├── base (everything from base.yaml)
  ├── skin (everything from calyrai.yaml)
```

The compiler outputs both `base` and `skin` to JSON, which can be consumed by both CSS and React components.

---

**Status:** ✅ Skin system fully implemented | 🚀 Ready for use

**Next Steps:**
- Add more skins (glass morphic, neon cyberpunk, etc.)
- Create skin designer UI for live theme preview
- Export skins as downloadable CSS files
- Add skin variants (light/dark toggle)
