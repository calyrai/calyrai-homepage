# Homepage Procedure (Single Folder)

Dieser Ordner ist der zentrale Ablauf fuer die Homepage-Erzeugung.

## Inhalt
- `homepage_graph.yaml`: zentrale Graph-Quelle fuer die gesamte Homepage
- `graph_to_md.py`: baut aus dem Graphen die Datei `homepage_full.md`
- `homepage_full.md`: abgeleitete Markdown-Zwischenstufe
- `build.sh`: kompletter Build (Graph -> MD -> YAML -> HTML)
- `../calyrai_font/`: regelbasierter Font-Ordner mit YAML + Compiler

## Graph-Flow
- `graph.flow` steuert die Reihenfolge durch die Seite.
- Alle `section`-Nodes in `graph.flow` werden genau in dieser Reihenfolge als Page-Sections ausgegeben.
- `hero` (erste zwei) und `nav` (erste und letzte) werden ebenfalls aus `graph.flow` gelesen.

## React Flow Diagramm
- In derselben Datei `homepage_graph.yaml` liegt jetzt auch `graph.reactflow`.
- Dort sind die Calyrai-Organisationsstruktur als Nodes/Edges sowie `flow_paths` abgelegt.
- Damit ist Content-Flow und Organisationsdiagramm in einer einzigen YAML gebuendelt.

## Ablauf
1. Inhalt in `homepage_graph.yaml` bearbeiten.
2. Build starten:
   ```bash
   ./build.sh
   ```
3. Ergebnis pruefen:
   - `../v2/index.html`
   - `../v2/index_midday_reconstructed.html`

## Was das Skript macht
- baut optional `../calyrai_font/out` aus `../calyrai_font/calyrai-font.yml`
- erstellt `homepage_full.md` aus `homepage_graph.yaml`
- erstellt `../v2/homepage.yaml` aus `homepage_full.md`
- erzeugt `../v2/index.html`
- erzeugt `../v2/index_midday_reconstructed.html`

## Hinweis
Die Live-Ausgabe bleibt in `v2/`, aber die gesamte Prozedur ist hier gebuendelt.
