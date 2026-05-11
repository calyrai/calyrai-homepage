# Chromatography instrument layer

SEC, IEX, and affinity chromatography in Nexus

## Input

A `Dataset` with elution volume (mL) or time (min) vs. absorbance (mAU) at one or more wavelengths, plus an optional light-scattering or refractive-index trace.

## Pipeline (SEC-SAXS example)

```text
d > chrom              -- Dataset → Signal(time) (UV + SAXS inline)
  > extract@fractions  -- → List<Dataset> (per-fraction sub-datasets)
  > saxs               -- → List<Signal(q-space)>
  > compute@pr         -- → List<Distribution(r-space)>
```

## Oligomeric state from SEC

```text
elution = d > chrom > fit@elution_volume
-- compare to calibration curve → hydrodynamic radius Rh, apparent MW
```

## SEC-MALS

When a multi-angle light-scattering trace is available in the dataset, use:

```text
d > chrom > fit@mals   -- → Fit  {Mw, Rh, dn/dc}
```

## Constraint output

```text
d > chrom > fit@elution_volume > to@constraint
-- Constraint: oligomeric state ∈ {monomer, dimer, tetramer} (hard)
-- Constraint: Rh within ± 10% of fitted value (soft)
```
