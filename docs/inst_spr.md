# SPR instrument layer

Surface plasmon resonance kinetics in Nexus

## Input

A `Dataset` with response units (RU) vs. time (s). Multi-cycle data is supported — each concentration cycle is a named series in the dataset.

## Pipeline

```text
d > spr                -- Dataset → Signal(time) (RU vs. t, all cycles)
  > fit@kinetic        -- → Fit  {kon, koff, Kd, n}
  > to@constraint      -- → Constraint(spr)
```

## Kinetic models

| Variant | Model | Parameters |
| --- | --- | --- |
| fit@kinetic | Langmuir 1:1 | $k_{\rm on}$, $k_{\rm off}$, $R_{\max}$ |
| fit@kinetic_2state | Two-state conformational change | $k_{\rm on}$, $k_{\rm off}$, $k_2$, $k_{-2}$, $R_{\max}$ |
| fit@steady_state | Equilibrium (Scatchard) | $K_d$, $R_{\max}$ |

## Equilibrium constant

$$K_d = \frac{k_{\rm off}}{k_{\rm on}}$$

## Multi-cycle global fit

 When the input dataset contains multiple analyte concentrations, the fit is global by default: $k_{\rm on}$, $k_{\rm off}$, and $R_{\max}$ are shared; only the expected equilibrium response varies per cycle. This improves parameter accuracy and avoids per-cycle overfitting.
