# Homepage v3 Snapshot (Archive Only)

Status: archived snapshot source.
Daily development and canonical builds run on v4.

Dieser Ordner beschreibt den gesicherten Stand der aktuellen Tile-UI (scrollbar + expandable).

## Gesicherter Git-Stand

- Repository: `apps/homepage`
- Branch: `main`
- Commit: `64ae01f`
- Tag: `homepage-v3-snapshot-20260531`
- Commit-Message: `snapshot: preserve homepage_v3 expandable scrollable tile state`

## Enthaltene Snapshot-Dateien

- `homepage_v3/homepage.yaml`
- `homepage_v3/index.html`
- `scripts/homepage_builder/content.py`
- `scripts/homepage_builder/titlepage.py`

## So kommst du exakt auf diesen Stand zurück

```bash
cd /Users/rtscheliessnig/Workspace/Calyr/apps/homepage

# Nur ansehen (detached HEAD)
git checkout homepage-v3-snapshot-20260531

# Optional: eigener Arbeits-Branch ab Snapshot
git switch -c homepage-v3-restore-20260531 homepage-v3-snapshot-20260531
```

## Hinweis

Dieser Snapshot wurde bewusst nur für die Homepage-v3-Seite erstellt, damit andere Änderungen im Hauptprojekt unberührt bleiben.

## Historische Hinweise

1. Contact/Impressum lokal pflegen in `homepage_v3/homepage.yaml` unter `explore_sections` bei `tile_kind: visit_card`.
2. Für diese Kachel Weiß als Primärfarbe beibehalten:
	- `closed_gradient` auf weiße Töne
	- optional `closed_shadow` nur in Weiß
3. Visit-Card Inhalt aktuell halten:
	- `visit_name`
	- `visit_role`
	- `visit_email`
	- `visit_web`
	- `visit_note`
4. Rechtstext lokal in `body` halten (Impressum), nicht aus externer Seite laden.
5. Historischer Build-Befehl (nur für Snapshot-Rekonstruktion):

```bash
cd /Users/rtscheliessnig/Workspace/Calyr/apps/homepage
python3 scripts/build_homepage_v2.py --yaml homepage_v3/homepage.yaml --out homepage_v3/index.html
```

## Implementierte Regel (aktuell)

- Die komplette Impressum-Kachel ist als Visit Card umgesetzt (`visit_card`).
- Hauptfarbe für diese Kachel ist Weiß (nicht Cyan).
