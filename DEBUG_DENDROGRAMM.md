# Calyrai Homepage: Dendrogramm und Debug-Plan

## Ziel
Dieses Dokument ist die zentrale, nachvollziehbare Struktur fuer das punktweise Debugging.

## Dendrogramm (Code-Struktur, aktuell)

calyrai-homepage/
  .github/
    workflows/
      pages.yml
  build/
    compile.py
    nexus/
      builders.py
      resolve.py
      validate.py
  content/
    content.yaml
    structure.yaml
    theme.yaml
  generated/
    nexus.ast.json
    nexus.graph.json
    nexus.index.json
    nexus.theme.json
  web/
    package.json
    vite.config.js
    src/
      App.jsx
      index.jsx
      data/
        runtimeArtifacts.js
      components/
        Renderer.jsx
        Page.jsx
        Section.jsx
        Tile.jsx
        Element.jsx
        QuickContactRail.jsx
        Navigation.jsx
        DotRasterBackground.jsx
        RippleLayer.jsx
        ContactPage.jsx
        BooksPage.jsx
        logo/
          logo-animation.jsx
          LogoCanvasEngine.js
      styles/
        brix-photorealstickc-skin.css
        components.css
        layout.css
        theme.css
      utils/
        interactionFilters.js
  deploy/
    index.html

## Abhaengigkeiten als Kette
1. content/content.yaml (inkl. __graph und __interaction) + content/structure.yaml + content/theme.yaml
2. build/compile.py + build/nexus/*
3. generated/*.json
4. web/src/data/runtimeArtifacts.js
5. web/src/components/* + web/src/styles/*
6. web build output in web/dist/index.html
7. deploy/index.html

## Content Architektur (zusammengefuehrt)
Single Source fuer fachlichen Inhalt:
1. content/content.yaml
  - Content Nodes (logo, hero, tiles, contact, legal)
  - __graph (nodes/edges)
  - __interaction (click/hover/graph actions)

Weiterhin separat:
1. content/structure.yaml (Layout-Hierarchie)
2. content/theme.yaml (Design Tokens)

Entfernt:
1. content/graph.yaml
2. content/interaction.yaml

## CSS Architektur (max 4 aktiv)
Aktiv importiert und genutzt:
1. web/src/styles/theme.css
2. web/src/styles/layout.css
3. web/src/styles/components.css
4. web/src/styles/brix-photorealstickc-skin.css

Entfernt (frueher separat, jetzt in components.css konsolidiert):
1. web/src/styles/navigation.css
2. web/src/styles/background-effects.css
3. web/src/styles/quick-contact.css
4. web/src/styles/logo.css

## Funktionsstatus (jetzt)
1. Build: OK
2. Contact Rail:
  - Klick Toggle: OK
  - Drag: OK
  - unsichtbarer Touch-Blocker: behoben
3. Section Toggles (Teaser/Platforms/Architecture): OK
4. Logo Motion: stabilisiert (kein Scale-Sprung)

Gesamturteil: funktional und schlanker. "Maximal funktional" fuer den aktuellen Scope: Ja.

## Bereits geaendert (in dieser Session)
1. Contact Rail Fix: Rail blockiert Touches nicht mehr ueber breite unsichtbare Flaeche.
2. Contact Rail Toggle/Drag: klickbar und dragbar stabil.
3. Logo Motion: transform-basierte Spruenge entfernt, nur Filter-Transitionen.
4. CSS-Konsolidierung auf 4 aktive Dateien.

## Explizit geplanter naechster Change (noch NICHT ausgefuehrt)
1. Runtime Data Chain Check ohne Verhaltensaenderung:
   - Nur Konsistenzpruefung in:
     - content/content.yaml
     - content/structure.yaml
     - build/nexus/builders.py
     - generated/nexus.ast.json
     - web/src/data/runtimeArtifacts.js
   - Wenn Inkonsistenz gefunden wird, dann exakt 1 minimaler Fix pro Schritt.

2. Falls Contact Rail auf Mobile wieder haengt:
   - Nur in web/src/components/QuickContactRail.jsx
   - Minimalfix: Klick und Drag sauber trennen, keine weiteren UI-Aenderungen.

3. Keine Aenderungen an Layout/Theming ausser explizit von dir freigegeben.

## Freigabe-Modus
Ich mache ab jetzt keine breiten Aenderungen mehr.
Ich schlage immer zuerst den exakten 1-Datei-Change vor, dann erst Umsetzung.

## Final Clean State (Team-Referenz)

### Architektur in einem Blick
1. Content:
  - content/content.yaml (inkl. __graph, __interaction)
  - content/structure.yaml
  - content/theme.yaml
2. Compiler:
  - build/compile.py
  - build/nexus/*
3. Frontend Styles (max 4 aktiv):
  - web/src/styles/theme.css
  - web/src/styles/layout.css
  - web/src/styles/components.css
  - web/src/styles/brix-photorealstickc-skin.css

### Entfernte Redundanzen
1. content/graph.yaml
2. content/interaction.yaml
3. web/src/styles/navigation.css
4. web/src/styles/background-effects.css
5. web/src/styles/quick-contact.css
6. web/src/styles/logo.css

### Funktionaler Basis-Check
1. python3 build/compile.py -> OK
2. npm run build (web) -> OK
3. Contact Rail Toggle/Drag -> OK
4. Section Toggles -> OK
5. Logo Motion (ohne Scale-Sprung) -> OK

### Rule of Change (ab jetzt)
1. Immer nur ein kleiner, isolierter Change pro Schritt.
2. Erst lokale Verifikation (compile + build), dann erst commit/push.
3. Keine neuen Style-Dateien ohne explizite Freigabe.

## Naming- und Struktur-Policy

### Naming
1. React-Komponenten: PascalCase Dateinamen (Beispiel: LogoAnimation.jsx)
2. Utility/Infra-Dateien: snake_case oder lower_case nur wenn kein React-Component-Export vorliegt
3. Kein "-broken", "-old", "-tmp" im finalen Codebestand

### Komponenten-Struktur
1. web/src/components/pages/ -> route-nahe Seitenkomponenten (BooksPage, ContactPage)
2. web/src/components/logo/ -> Logo-Subsystem (Animation, StateMachine, CanvasEngine)
3. web/src/components/ -> wiederverwendbare UI-Bausteine (Tile, Section, Navigation, usw.)

### Cleanup-Regel
1. Ungenutzte Komponenten werden entfernt, nicht archiviert im gleichen Ordner.
2. Vor Entfernung: rg-Referenzcheck + build.
