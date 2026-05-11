# Apply `@`

Select a named variant of an operator

## Concept

 Many Nexus operators are families — `compute` can compute $P(r)$, Kratky plots, distance distributions, and more. The `@` operator selects the variant at parse time and returns a *stage* (a typed function) that can be used in a pipeline.

## Signature

```text
op @ arg   →   Stage<T_in, T_out>
```

## Built-in variants

| Expression | Input | Output | Algorithm |
| --- | --- | --- | --- |
| compute@pr | Signal(q-space) | Distribution(r-space) | IFT via Shannon / BIFT |
| compute@kratky | Signal(q-space) | Signal(q-space) | $q^2 I(q)$ vs $q$ |
| fit@guinier | Signal(q-space) | Fit | Linear Guinier plot, $R_g$, $I(0)$ |
| fit@debye | Signal(q-space) | Fit | Debye chain model |
| fit@envelope | Distribution(r-space) | Envelope | Ab-initio bead modelling (DAMMIF-style) |
| fit@kinetic | Signal(time) | Fit | Langmuir 1:1 kinetic model |
| refine@density | Envelope | Envelope | Density-regularised refinement |

## Custom operators

Register a new variant in the Python API:

```text
@nexus.operator("fit", "my_model")
def fit_my_model(signal: Signal) -> Fit:
    ...
```

After registration, `fit@my_model` is available in all Nexus sessions.
