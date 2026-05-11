# MD / LAMMPS instrument layer

Molecular dynamics trajectories as Nexus signals

## Input

A `Dataset` pointing to a LAMMPS dump file, DCD trajectory, or XTC/TRR file plus a topology.

## Pipeline

```text
d > md                    -- Dataset → Trajectory
  > compute@rg_trajectory -- → Signal(time)  [Rg vs. frame]
  > fit@ensemble          -- → Model(θ)  [ensemble-averaged observables]
  > to@constraint         -- → Constraint(md)
```

## Ensemble observables

| Operator | Observable | Units |
| --- | --- | --- |
| compute@rg_trajectory | $R_g(t)$ | Å |
| compute@saxs_theoretical | $\langle I(q) \rangle_{\rm ensemble}$ | a.u. |
| compute@sasa | Solvent-accessible surface area | Å² |
| compute@contacts | Contact map | binary matrix |

## Comparing MD to experiment

```text
-- compare theoretical SAXS from MD to experimental SAXS
s_exp  = d_exp  > saxs
s_md   = d_traj > md > compute@saxs_theoretical
{ s_exp, s_md } > compare@chi2
```

A $\chi^2 < 2$ indicates the MD ensemble is consistent with the measured scattering data.
