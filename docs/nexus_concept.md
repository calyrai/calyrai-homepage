# Nexus concept

The integration layer that unifies all instruments

## What is a Nexus?

 A *Nexus* is a named, versioned integration context. It holds a set of instrument-derived `Constraint` objects and a shared parameter vector $\theta$. When you `solve` a Nexus, the runtime finds $\theta^*$ that satisfies — or best satisfies — all constraints simultaneously.

## Creating a Nexus

```text
n = nexus @ {
  d_saxs > saxs > to@constraint,
  d_spr  > spr  > to@constraint,
  d_itc  > itc  > to@constraint
}
```

This expression constructs a Nexus object; no solving happens yet.

## Solving

```text
result = n > solve@MAP       -- maximum a-posteriori estimate
result = n > solve@mcmc      -- full posterior sampling
```

$$\theta^* = \arg\min_{\theta} \sum_i \ell_i(\theta) + \log p(\theta)$$

## Result structure

The `solve` output is a `Fit` with additional fields:

- `.theta` — point estimate of all parameters

- `.posterior` — posterior samples (MCMC only)

- `.constraint_residuals` — per-instrument $\chi^2$ contributions

- `.inconsistencies` — list of any detected constraint conflicts

## Provenance

 The Nexus object is stored in the warehouse with links to all its input datasets and constraints. Reproducing a result from a Nexus ID requires no additional metadata — everything is encoded in the graph.
