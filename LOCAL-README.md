# Local README

Diese Datei erklaert die praktische lokale Bedienung des Projekts.

## Ziel

Wenn du lokal an der Homepage arbeiten willst, brauchst du im Alltag nur vier Dinge:

1. den Dev-Server starten,
2. die richtigen Dateien bearbeiten,
3. bei YAML-Aenderungen kompilieren,
4. vor dem Deploy das `deploy/`-Artefakt pruefen.

## Voraussetzungen

- Node.js 18+
- npm
- Python 3.8+

## Projekt lokal starten

Vom Repo-Root:

```bash
npm --prefix web install
npm --prefix web run dev
```

Danach laeuft die Seite lokal unter:

```text
http://localhost:3000
```

Wenn Port 3000 schon belegt ist, waehlt Vite automatisch z. B. `3001`.

## Was du wo aenderst

### 1. Inhalt und Struktur

Dafuer bearbeitest du die YAML-Dateien in:

- `content/structure.yaml`
- `content/content.yaml`
- `content/graph.yaml`
- `content/interaction.yaml`
- `content/theme.yaml`

Danach kompilierst du neu:

```bash
python3 build/compile.py
```

Alternativ ueber das Web-Package:

```bash
npm --prefix web run compile
```

Das erzeugt bzw. aktualisiert die generierten Artefakte in `generated/`.

### 2. React-Oberflaeche

Dafuer bearbeitest du vor allem:

- `web/src/App.jsx`
- `web/src/components/*`
- `web/src/styles/*`

Bei React- und CSS-Aenderungen reicht normalerweise der laufende Dev-Server. Vite laedt die Aenderungen automatisch nach.

## Wichtige Besonderheit

Die aktuelle App liest produktionsnah eingebettete Daten aus:

- `web/src/data/runtimeArtifacts.js`

Das bedeutet:

- `build/compile.py` aktualisiert die JSON-Artefakte in `generated/`
- die lokal sichtbare React-App nutzt aber direkt `runtimeArtifacts.js`

Wenn du also YAML aenderst und die Aenderung lokal im Browser nicht auftaucht, liegt das meist daran, dass die eingebetteten Runtime-Daten noch nicht zum neuen YAML-Stand passen.

Fuer den technischen Hintergrund siehe:

- `docs/site-build-and-deploy-guide.md`

## Typischer lokaler Arbeitsablauf

### Nur Styling oder Verhalten aendern

```bash
npm --prefix web run dev
```

Dann bearbeiten:

- `web/src/components/*`
- `web/src/styles/*`

### Inhalt in YAML aendern

```bash
python3 build/compile.py
npm --prefix web run dev
```

Dann pruefen:

- ob `generated/` korrekt aktualisiert wurde
- ob die App den gewuenschten Stand wirklich anzeigt
- falls nicht: `runtimeArtifacts.js` mitpruefen

## Produktions-Build lokal testen

```bash
npm --prefix web run build
npm --prefix web run preview
```

Damit kannst du den gebauten Stand lokal pruefen.

## Deploy-Artefakt vorbereiten

Fuer GitHub Pages ist das relevante Ausgabeziel nicht `web/dist/` allein, sondern `deploy/`.

Vorbereitung:

```bash
./scripts/prepare-deploy.sh
```

Das Script macht folgendes:

1. installiert Web-Abhaengigkeiten,
2. baut die Single-HTML-Version,
3. leert alte Dateien aus `deploy/`,
4. kopiert `web/dist/index.html` nach `deploy/index.html`,
5. kopiert `CNAME` nach `deploy/CNAME`.

Danach sollten mindestens diese Dateien existieren:

- `deploy/index.html`
- `deploy/CNAME`

## Was fuer Deploy wirklich wichtig ist

Wichtig:

- Die Python-Skripte werden nicht auf die live Seite deployed.
- Sie bleiben lokal bzw. im Repository als Build-Werkzeuge.
- Auf GitHub Pages landet nur das vorbereitete statische Artefakt aus `deploy/`.

### Im Repo

- `.github/workflows/pages.yml` muss vorhanden sein
- `deploy/index.html` muss existieren
- `CNAME` bzw. `deploy/CNAME` muss `calyr.ai` enthalten

### In GitHub Pages

Repository Settings -> Pages:

- Source: `GitHub Actions`
- Custom domain: `calyr.ai`
- Enforce HTTPS: aktiviert

### Schneller Check

```bash
gh api repos/calyrai/calyrai-homepage/pages
curl -I https://calyr.ai/
```

Erwartet:

- `build_type: workflow`
- `https_enforced: true`
- `HTTP/2 200` auf `https://calyr.ai/`

## Wenn etwas nicht funktioniert

### Dev-Server startet nicht

```bash
npm --prefix web install
npm --prefix web run dev
```

### YAML-Aenderung erscheint nicht

1. `python3 build/compile.py` ausfuehren
2. `generated/` pruefen
3. `web/src/data/runtimeArtifacts.js` pruefen

### Live-Seite zeigt GitHub Pages 404

Dann ist oft nicht der Code kaputt, sondern die Pages-Konfiguration falsch.

Pruefen:

```bash
gh api repos/calyrai/calyrai-homepage/pages
```

Wenn dort `build_type: legacy` steht, muss GitHub Pages auf `GitHub Actions` umgestellt werden.

## Kurzfassung

Die kuerzeste lokale Bedienung ist:

```bash
npm --prefix web run dev
```

Fuer YAML-Aenderungen zusaetzlich:

```bash
python3 build/compile.py
```

Fuer Deploy-Vorbereitung:

```bash
./scripts/prepare-deploy.sh
```
