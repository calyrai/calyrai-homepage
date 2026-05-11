# Execution model

How Nexus turns expressions into results

## Four-phase pipeline

| Phase | Input | Output |
| --- | --- | --- |
| 1. Parse | Nexus source text | AST |
| 2. Type-check | AST + operator registry | Typed AST |
| 3. Graph build | Typed AST | Directed acyclic computation graph |
| 4. Execution | Graph + warehouse | Evaluated values |

## Lazy evaluation

 Phases 1–3 happen immediately when you write an expression. Phase 4 only happens when you *demand* a value — by plotting it, calling `resolve()`, or pushing to the warehouse. This means pipelines are cheap to write and can be composed freely before any I/O occurs.

## Shared sub-expressions

 The graph represents shared sub-expressions as a single node with multiple out-edges. If two pipelines both start from `d > saxs`, the SAXS processing runs once and its output is reused.

```text
s = d > saxs
p = s > compute@pr     -- s used twice
k = s > compute@kratky -- same SAXS node
```

## Error propagation

Errors are typed nodes in the graph. A failed stage produces an `Error<T>` value. Downstream stages that receive an error propagate it without executing, so the first failure is always visible without masking later failures.
