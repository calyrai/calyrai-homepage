# Connectpaper & Zotero

Structured literature search from Nexus CLI with OpenAlex, Semantic Scholar, and Zotero database workflows

## What this command does

`nexus connectpaper` runs a boolean literature query across OpenAlex and/or Semantic Scholar, merges and de-duplicates the hits, and lets you export results for local analysis or Zotero database ingestion.

## From ConnectPaper to Grammateia

 Connected Papers style tools are useful for exploration, but in Calyr this is only the first layer. **Grammateia** extends literature handling into an executable knowledge system: papers become typed objects with concepts, models, assumptions, and constraints that can be linked to experiments and evaluated in the Nexus loop.

| Capability | Citation Graph Tools | Calyr Grammateia |
| --- | --- | --- |
| Citation links | Yes | Yes |
| Similarity browsing | Yes | Yes |
| Concept extraction | No | Yes |
| Model and assumption extraction | No | Yes |
| Constraint reasoning vs. runs | No | Yes |
| Feedback loop into publication | No | Yes |

```text
paper -> concepts -> models -> constraints -> experiments -> results
```

 This is why literature in Calyr is treated as an active layer in the architecture, not as a passive bibliography.

## Quick start

```text
nexus connectpaper "sbpa + keratin" --backend both --limit 25
```

 The `+` symbol is treated as `AND`. This command prints a ranked table in the terminal.

## Boolean query syntax

| Feature | Example | Meaning |
| --- | --- | --- |
| AND | sbpa AND keratin | Both terms must match |
| OR | keratin OR saxs | Either term may match |
| NOT | saxs NOT review | Exclude results containing a term |
| Parentheses | sbpa AND (keratin OR saxs) | Control precedence |
| Shortcut | sbpa + keratin | Equivalent to sbpa AND keratin |

## Backends

```text
--backend openalex
--backend semantic
--backend both
```

 Use `both` for best recall. If one backend is rate-limited (for example HTTP 429), the command keeps results from the other backend when possible.

## Output formats

```text
# terminal table (default)
nexus connectpaper "sbpa AND keratin"

# machine-readable JSON
nexus connectpaper "sbpa AND keratin" --json --out-json runs/literature/sbpa_keratin.json

# CSV for spreadsheets
nexus connectpaper "sbpa AND keratin" --out-csv runs/literature/sbpa_keratin.csv
```

## Zotero workflow (recommended)

### 1) Export import-file for Zotero

```text
nexus connectpaper "sbpa AND (keratin OR saxs) NOT review" \
  --backend both \
  --limit 50 \
  --out-zotero-json runs/literature/sbpa_keratin_zotero.json \
  --tag sbpa --tag keratin --tag nexus
```

 Import that file in Zotero via **File → Import**.

### 2) Direct Zotero API sync

```text
nexus connectpaper "sbpa AND keratin" \
  --backend both \
  --limit 25 \
  --zotero-sync \
  --zotero-library-type users \
  --zotero-library-id <LIBRARY_ID> \
  --zotero-api-key <API_KEY> \
  --tag sbpa --tag nexus
```

 This pushes results directly into your Zotero library.

## Recommended database pattern

1. Run broad query and export Zotero JSON.

2. Import into Zotero and curate duplicates/metadata.

3. Tag items by project branch (`sbpa`, `keratin`, `saxs`, `spr`).

4. Re-run focused queries and sync incrementally.

5. Track final curated sets in Nexus runs folder for reproducibility.

## Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| Invalid query syntax | Malformed boolean expression | Balance parentheses, use uppercase operators, test with smaller expression first |
| HTTP 429 | Provider rate limit | Retry with --backend openalex or --backend semantic, then run again later |
| No papers matched | Query too narrow | Remove NOT term, broaden OR group, or increase --limit |
| Zotero sync failed | Missing or wrong credentials | Check --zotero-library-id, --zotero-api-key, and library type |

## Command help

```text
nexus connectpaper --help
```
