# Example scripts

Common Nexus workflows end to end

## Interactive browser examples

 The homepage now exposes a standalone [examples folder](/examples/index.html) with interactive HTML demos that can be opened without a build step. These are useful for explaining concepts before committing to a full Nexus module implementation.

| Example | What it shows | Open |
| --- | --- | --- |
| Facility of Dmax | True-versus-model SAXS curves, distortion-driven uncertainty, and an explicit assumed-versus-true Dmax control. | Open demo |
| Signal Lab | Damped synthetic signal with live parameter controls. | Open demo |
| Warehouse Lineage | Object lineage and the distinction between archive storage and warehouse view. | Open demo |
| Hash Studio | Content-addressed object IDs generated from canonicalized JSON payloads. | Open demo |

## 1 — Basic SAXS analysis

```text
-- Load, reduce, and fit a single SAXS dataset
d = warehouse["my-sample-001"]

s = d > saxs
p = s > compute@pr
g = s > fit@guinier

warehouse.push(p, tags=["pr",      "my-sample-001"])
warehouse.push(g, tags=["guinier", "my-sample-001"])
```

## 2 — SAXS + SPR joint analysis

```text
-- Build a Nexus from two instruments and solve jointly
c_saxs = warehouse["saxs-igm-001"] > saxs > compute@pr > to@constraint
c_spr  = warehouse["spr-igm-001"]  > spr  > fit@kinetic > to@constraint

n = nexus @ { c_saxs, c_spr } coupled {
  saxs.stoichiometry == spr.n
}

result = n > solve@MAP
warehouse.push(result, tags=["nexus-igm-001", "MAP"])
```

## 3 — SEC-SAXS with per-fraction analysis

```text
-- Inline SEC-SAXS: extract fractions, process each
fractions = warehouse["sec-saxs-run-07"] > chrom > extract@fractions
signals   = fractions > saxs
prs       = signals   > compute@pr
guiniers  = signals   > fit@guinier

warehouse.push(prs,      tags=["pr-all-fractions"])
warehouse.push(guiniers, tags=["guinier-all-fractions"])
```

## 4 — Iterative envelope refinement

```text
p = warehouse["my-sample-pr"]
e = p > fit@envelope >> refine@density

warehouse.push(e, tags=["envelope-refined", "my-sample-001"])
```

## 5 — Triple nexus: SAXS + SPR + ITC

```text
n = nexus@auto @ {
  warehouse["saxs-run"] > saxs > to@constraint,
  warehouse["spr-run"]  > spr  > to@constraint,
  warehouse["itc-run"]  > itc  > to@constraint
}

posterior = n > solve@mcmc
warehouse.push(posterior, tags=["triple-nexus-posterior"])
```
