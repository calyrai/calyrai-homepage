# Type system

The built-in types and their domains

## Primitive types

| Type | Description |
| --- | --- |
| Number | IEEE-754 double, optionally with physical unit |
| String | UTF-8 text |
| Bool | true / false |

## Scientific types

| Type | Fields | Typical domain |
| --- | --- | --- |
| Dataset | id, source, format, metadata | Raw file from instrument or warehouse |
| Signal(domain, values, units) | domain axis, values axis, physical units | $I(q)$, SPR response, ITC heat |
| Distribution(domain, values) | same as Signal | $P(r)$, elution profile |
| Model(θ) | parameter vector $\theta$, prior, log-likelihood | Guinier, Debye, kinetic |
| Fit(model, result, residuals) | fitted Model, residual Signal | Guinier result, $k_\text{on}/k_\text{off}$ |
| Constraint(C, θ) | predicate $C_i(\theta)$, feasible set | Any instrument-derived constraint |
| Envelope | 3D bead/voxel model | SAXS ab-initio reconstruction |

## Domain labels

Domains are string tags attached to `Signal` and `Distribution`:

- `q-space` — momentum transfer $q$ (Å⁻¹)

- `r-space` — real-space distance $r$ (Å)

- `time` — seconds (kinetics, chromatography)

- `concentration` — molar ratio (ITC)

- `energy` — kcal/mol or kJ/mol (MD)

Operators check domain compatibility; e.g., `compute@pr` requires `Signal(q-space, ...)` as input.

## Type coercion

There is none. All conversions are explicit operator applications. This prevents silent unit mismatches.
