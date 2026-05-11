# Quick start

Your first Nexus pipeline in five minutes

## 1 — Open SAS Opsis

Navigate to **Explore → SAS Opsis** or open `explore.html` in the local dev server. Select a raw scattering file (`.dat` or `.csv`) from your data directory.

## 2 — Write your first expression

```text
d = warehouse["my-sample-001"]
s = d > saxs
p = s > compute@pr
f = p > fit@guinier
```

Each line shadows the previous result into a named variable. The pipeline is lazy — nothing executes until you call `resolve(f)` or the interface requests the plot.

## 3 — Inspect the result

The interface renders four panes automatically:

- **I(q)** — raw and smoothed intensity vs. momentum transfer

- **Dimensionless** — scaled (Kratky / Zimm) curves

- **p(r)** — pair-distance distribution

- **PDB** — ab-initio envelope (if `fit@envelope` was run)

## 4 — Save to the warehouse

```text
warehouse.push(f, tags=["guinier", "my-sample-001"])
```

All intermediate objects — `s`, `p`, `f` — are versioned and linked. You can retrieve any of them later by ID or tag.

**Note:** If you are running from `file://` rather than a local server, the warehouse falls back to `localStorage` for persistence.
