# Coupling

Linking parameters across instruments within a Nexus

## Shared parameters

 By default, each instrument operator registers its own parameter namespace. SAXS registers `saxs.Rg`, SPR registers `spr.Kd`, and so on. Coupling declares that two parameters in different namespaces are the same physical quantity.

## Declaring couplings

```text
n = nexus @ { c_saxs, c_spr } coupled {
  saxs.stoichiometry == spr.n,     -- oligomeric state must agree
  saxs.Rg            ~  chrom.Rh   -- soft coupling: Rg ≈ f(Rh)
}
```

`==` is a hard coupling (identical parameter). `~` is a soft coupling (deviation penalised by a Gaussian prior).

## Why coupling matters

 Without coupling, two instruments might independently converge to contradictory stoichiometries. Declaring the coupling forces the solver to find a single $\theta$ that satisfies both — or raise a `ConstraintError` if no such $\theta$ exists.

## Automatic coupling inference

 If a Nexus is created with `nexus@auto`, the runtime inspects the parameter registries of all instruments and couples parameters that share a canonical name in the SI biophysics vocabulary (e.g., `Kd`, `n`, `Rg`).

```text
n = nexus@auto @ { c_saxs, c_spr, c_itc }
```

**Note:**`nexus@auto` coupling inference is heuristic. Always review the inferred couplings before running a solve on real data.
