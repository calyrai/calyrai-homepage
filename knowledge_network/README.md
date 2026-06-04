# Knowledge Network First

This directory reorganizes homepage development around linked papers.

## Core Principle

Do not design a homepage first.
Design the knowledge graph first.

- Paper is the atomic unit.
- Section is an addressable semantic subnode.
- Links are first-class relations.
- Interface is a projection of graph topology.

## Folder Layout

- `papers/`: source-of-truth markdown papers
- `build/atlas.json`: generated graph projection
- `../scripts/build_knowledge_network.py`: graph builder

## Paper Contract

Each paper is one markdown file with YAML frontmatter.

Required frontmatter fields:

- `id`: stable paper id (e.g. `nexus`)
- `title`: human title
- `subtitle`: concise semantic subtitle

Recommended frontmatter fields:

- `glyph`: short glyph token
- `cluster`: optional human cluster hint
- `tags`: list of semantic tags
- `references`: optional list of paper ids

Derived graph fields (generated):

- `deeper_structure`: section/subsection tree from markdown headings
- `position`: x/y coordinates computed from connectivity
- `color`: connectivity-dependent color (low degree -> cyan, high degree -> magenta)

Links inside paper text:

- `[[paper-id]]`
- `[[paper-id#section name]]`
- `[[#section name]]` (section in current paper)

## Build

Run from `apps/homepage`:

```bash
python3 scripts/build_knowledge_network.py
```

Output:

- `knowledge_network/build/atlas.json`

## Current Scope

This stage is content + topology only.
Interactive graph rendering is intentionally deferred.
