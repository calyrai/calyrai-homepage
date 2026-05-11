# Iterate `>>`

Repeatedly apply a stage until convergence

## Concept

`a >> f` applies `f` to `a`, then applies `f` to the result, and so on until the convergence criterion of `f` is met:

$$a_0 = a,\quad a_{n+1} = f(a_n),\quad \text{stop when } \|a_{n+1} - a_n\| < \varepsilon$$

## Usage

```text
envelope >> refine@density       -- iterative density refinement
model    >> optimize@gradient    -- gradient-descent parameter search
```

## Iteration limits

Every operator that can be used with `>>` declares a `max_iter` and a `tol` in its registry entry. You can override them inline:

```text
envelope >> refine@density { max_iter: 200, tol: 1e-5 }
```

## Convergence output

The result carries convergence metadata accessible via `.meta.converged`, `.meta.iterations`, and `.meta.delta`.

**Note:**`>>` is only valid when `f` maps a type to itself (`T → T`). Applying it to a type-changing stage is a compile-time error.
