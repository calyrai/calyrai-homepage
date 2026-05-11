# ITC instrument layer

Isothermal titration calorimetry in Nexus

## Input

A `Dataset` with molar ratio (or injection number) vs. differential heat $\delta Q$ (µcal or kJ/mol injected).

## Pipeline

```text
d > itc                -- Dataset → Signal(concentration)
  > fit@one_site       -- → Fit  {ΔH, Kd, n}
  > to@constraint      -- → Constraint(itc)
```

## Binding models

| Variant | Model | Parameters |
| --- | --- | --- |
| fit@one_site | Independent single binding site | $\Delta H$, $K_d$, $n$ |
| fit@two_site | Two independent site classes | $\Delta H_1$, $K_{d1}$, $n_1$, $\Delta H_2$, $K_{d2}$, $n_2$ |
| fit@sequential | Sequential binding | $K_{d1}$, $K_{d2}$, $\Delta H_1$, $\Delta H_2$ |

## Thermodynamic output

$$\Delta G = RT \ln K_d, \qquad -T\Delta S = \Delta G - \Delta H$$

These derived quantities are available on the `Fit` object as `.thermodynamics`.
