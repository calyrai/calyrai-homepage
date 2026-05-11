# Overview

What Nexus is and why it exists

 Nexus is the language and runtime at the core of Calyr.aí. It expresses scientific measurement pipelines as typed, composable expressions — turning raw instrument data into constrained molecular parameters.

## Design goals

- **One language, many instruments** — SAXS, SPR, ITC, chromatography, MD all share the same operator vocabulary.

- **Lazy, graph-based execution** — nothing runs until a result is requested; the runtime can parallelise and cache automatically.

- **Constraint-first modelling** — every measurement constrains a shared parameter space; inconsistencies surface as constraint violations, not silent errors.

- **Warehouse-native** — every intermediate object is versioned and addressable; reproducibility is structural, not procedural.

## Three-minute example

```text
-- load a SAXS run and fit it
d = warehouse["run-042"]
d > saxs > compute@pr > fit@guinier
```

 The `>` operator pipes a typed value into the next stage. `compute@pr` applies the `compute` operator with argument `pr` (pair-distance distribution). The result is a `Fit` object stored back in the warehouse.

## Where to go next

- [Quick start](#start/quickstart) — run your first pipeline in five minutes.

- [Core principle](#knowledge/core) — the mathematical manifesto behind Nexus.

- [Syntax reference](#knowledge/syntax) — the full grammar.

- [Scientific infrastructure orchestration](#tilemap/scientific_infrastructure) — tile-aligned approach documentation.

---

## Internal — contributor notes

 This docs site and the internal MkDocs hub are **two separate systems**. See the full guide at [Internal → Docs system](#internal/docs_system).

|  | MkDocs hub (internal) | This site (public) |
| --- | --- | --- |
| Source files | docs/**/*.md | apps/homepage/docs/*.html |
| Nav config | mkdocs.yml | apps/homepage/data/docs.js |
| Run locally | mkdocs serve | open docs.html in browser |
| Format | Markdown | HTML <article> fragments |
| Audience | Contributors | Nexus users |

### To add a page here (public docs)

1. Create `apps/homepage/docs/<section>_<page>.html` as an `<article class="doc-article">` fragment.

2. Add an entry to `apps/homepage/data/docs.js` → `window.CALYR_DOCS`:
`{ id: 'my_page', title: 'My Page', src: 'docs/section_my_page.html' }`

3. The page is live at `docs.html#section/my_page` — no build step needed.

### To add a page to the MkDocs hub

1. Create the `.md` file under `docs/`.

2. Add it to the `nav:` section in `mkdocs.yml`.

3. Run `mkdocs serve` — hot-reloads automatically.

### Known build issue

`mkdocs build --strict` fails on broken `docs/_repo/` symlinks from a previous auto-generation run. Non-strict builds and `mkdocs serve` are unaffected. Regenerate with `python3 tools/repo/build_docs_hub.py`.
