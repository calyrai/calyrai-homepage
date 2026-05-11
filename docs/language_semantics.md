# Semantics

What expressions mean at runtime

## Values and types

 Every Nexus expression evaluates to a *typed value*. The type system is strict: passing a `Signal` where a `Dataset` is expected is a compile-time error. See [Type system](#types/types) for the full type catalogue.

## Pipeline semantics ( > )

`a > f` is equivalent to function application `f(a)`. The type of `f` must declare an input type compatible with the type of `a`. Pipelines are **lazy**: the expression graph is constructed eagerly, but evaluation is deferred until a terminal operation (plot, resolve, push) demands the value.

## Application semantics ( @ )

`op @ arg` selects a *variant* of operator `op` parameterised by `arg`. Both `op` and `arg` must be known names in the operator registry at parse time.

```text
compute@pr     -- compute with arg "pr"  → P(r) transform
fit@guinier    -- fit    with arg "guinier" → Guinier analysis
```

## Iterate semantics ( >> )

`a >> f` repeatedly applies `f` to its own output until the result satisfies the convergence criterion declared by `f`, or a maximum iteration count is reached. Used for refinement loops:

```text
envelope >> refine@density
```

## Variable binding

`x = expr` binds the *expression graph node*, not the evaluated value. Reusing `x` in a later expression is a reference to the same graph node — the value is computed at most once.

## Module scope

 Operator names are resolved through the global **operator registry**, not through language-level imports. A name like `saxs` is not a variable — it is looked up in the registry at graph-build time. This means:

- an operator is available exactly when its module has been imported,

- using an unloaded operator raises an `ImportError` with a helpful module hint,

- the language session itself carries no import state — only the registry does.

```text
-- SAXs not loaded:
d > saxs
-- ❌  ImportError: Operator 'saxs' not available.  Did you import nexus_language_saxs?

-- After loading:
from nexus_language_saxs import *
d > saxs    -- ✅
```

See [Module system](#modules/modules) for the full architecture.

## Variable scope

All names live in a single flat scope within a session. There are no closures or nested namespaces at the language level — modularity is achieved through the operator registry.
