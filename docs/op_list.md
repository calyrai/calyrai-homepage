# List `{ }`

Collect multiple expressions into a typed set

## Concept

 Curly braces collect any number of same-typed expressions into a `List<T>`. Lists can be piped into operators that accept multi-input — e.g., `merge`, `nexus`, `compare`.

## Syntax

```text
{ expr , expr , ... }
```

## Examples

```text
-- merge three SAXS datasets before processing
{ d1, d2, d3 } > merge > saxs

-- build a nexus constraint system from two instruments
nexus @ { d_saxs > saxs, d_spr > spr }

-- compare two Fit objects
{ fit_a, fit_b } > compare@guinier
```

## Homogeneity requirement

All elements inside `{ }` must resolve to the same type. Mixed lists are a type error.

## Destructuring

A `List<T>` returned by an operator can be destructured by name if the operator declares output labels:

```text
{ rg, i0 } = fit > extract@guinier_params
```
