# Constraint system

How each instrument narrows the space of valid molecular parameters

## Definition

 A `Constraint` is a predicate $C_i : \Theta \to \{0, 1\}$ (hard constraint) or a likelihood contribution $\ell_i(\theta)$ (soft constraint). Nexus supports both; in practice most instrument constraints are soft (chi-squared penalties).

## From signal to constraint

Calling an instrument operator on a `Signal` produces a `Constraint`:

```text
c_saxs = d_saxs > saxs > to@constraint
c_spr  = d_spr  > spr  > to@constraint
```

## Instrument constraint catalogue

| Operator | Parameters constrained | Constraint type |
| --- | --- | --- |
| saxs > to@constraint | $R_g$, $D_{\max}$, $N_S$ (Shannon channels), excluded volume, oligomeric state | Soft ($\chi^2$) + hard (positivity of $P(r)$) |
| spr > to@constraint | $k_\text{on}$, $k_\text{off}$, $K_d$, stoichiometry $n$ | Soft (residual sum of squares) |
| itc > to@constraint | $\Delta H$, $K_d$, $n$ | Soft ($\chi^2$) |
| chrom > to@constraint | $R_H$, oligomeric state | Hard (elution volume bounds) |

## Combining constraints

 The `intersect` operator combines any number of constraints into a joint system:

```text
joint = { c_saxs, c_spr, c_itc } > intersect
```

 $$\mathcal{L}(\theta) = \sum_i \ell_i(\theta), \qquad \theta^* = \arg\min_\theta \mathcal{L}(\theta)$$

## Inconsistency detection

 The runtime compares the feasible sets of all hard constraints before solving. If $\bigcap_i C_i = \emptyset$, a `ConstraintError` is raised with a diagnostic listing which pair of constraints is mutually exclusive.
