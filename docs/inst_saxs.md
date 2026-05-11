# SAXS instrument layer

Small-angle X-ray scattering in Nexus

## Input

A `Dataset` pointing to a two-column ASCII file: $q$ (Å⁻¹) and $I(q)$ (arbitrary units), optionally a third column of errors $\sigma(q)$.

## Pipeline

```text
d > saxs               -- Dataset → Signal(q-space)
  > compute@pr         -- → Distribution(r-space) via indirect Fourier transform
  > fit@guinier        -- → Fit  {Rg, I(0)}
  > fit@envelope       -- → Envelope (3D reconstruction)
```

## Shannon channels

 The information content of a SAXS dataset is quantified by the number of Shannon channels:

 $$N_S = \frac{2\,\Delta q\,D_{\max}}{\pi}$$

 where $\Delta q = q_{\max} - q_{\min}$. Nexus computes $N_S$ automatically and warns if a requested fit has more free parameters than $N_S$.

## Non-$D_\text{max}$ analytical approach

 Traditional $P(r)$ analyses require an estimate of $D_{\max}$ (maximum particle diameter). Nexus implements a non-$D_{\max}$ analytical transform: the pair-distance distribution is obtained by Bayesian indirect Fourier transformation (BIFT) with an automatically regularised kernel, removing the need to specify $D_{\max}$ as a user input. The inferred $D_{\max}$ is reported as an output parameter with a credible interval.

## Operator reference

| Expression | Output type | Key output parameters |
| --- | --- | --- |
| d > saxs | Signal(q-space) | background-subtracted $I(q)$, $\sigma(q)$ |
| s > compute@pr | Distribution(r-space) | $P(r)$, $D_{\max}$, $R_g$, $\alpha$ (regularisation) |
| s > fit@guinier | Fit | $R_g$, $I(0)$, $q_{\max} R_g$ check |
| p > fit@envelope | Envelope | bead model, packing fraction, $\chi^2$ |
