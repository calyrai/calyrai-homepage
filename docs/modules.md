# Module system

Namespaced language modules — modular language = modular execution = modular dependencies

## Core idea

 The Nexus language is split into a thin **core** and a set of **domain modules**, each of which extends the core with its own operator set, types, and dependencies.

```text
Nexus Language  =  core  +  domain modules
```

| Package | Provides | Key dependencies |
| --- | --- | --- |
| nexus_language_core | Syntax, graph engine, operator registry, type system | stdlib only |
| nexus_language_saxs | saxs, compute, fit | numpy, scipy |
| nexus_language_spr | spr, fit, gillespie | numpy, scipy |
| nexus_language_nexus | bridge, constrain, solve | scipy, (emcee, cvxpy) |
| nexus_language_warehouse | store, query, pull, push | stdlib only |

**Dependency isolation:** importing `nexus_language_core` alone loads nothing from NumPy, SciPy, or any instrument library. Each module pulls in its deps only when its operators are first called.

## Import philosophy

Load only what you need:

```text
from nexus_language_saxs import *       # ✅ registers saxs / compute / fit

from nexus_language import *            # ❌ never do this
```

A session that uses only SAXS never touches SPR or warehouse code:

```text
from nexus_language_saxs import *

d = warehouse["run-042"]
d > s > c@pr > f@guinier               -- works
```

An SPR session:

```text
from nexus_language_spr import *

d > spr > fit@langmuir                 -- works
d > saxs                               -- ❌ ImportError: Operator 'saxs' not available.
                                       --    Did you import nexus_language_saxs?
```

## Operator registry

 The registry is a single global dictionary in `nexus_language.core.registry`. Every domain module registers its operators on import — the core language never imports domain modules directly.

```text
-- inside nexus_language_saxs/ops.py
from nexus_language.core.registry import register_op

register_op("saxs",    _saxs_fn)
register_op("compute", _compute_fn)
register_op("fit",     _fit_fn)
```

 At graph-execution time the engine calls `get_op("saxs")`. If the operator has not been registered, it raises a helpful `ImportError`:

```text
Operator 'saxs' not available.  Did you import nexus_language_saxs?
```

## Lazy loading

 Domain modules register their operators immediately on import, but the heavy Python libraries (NumPy, SciPy) are only imported the *first time* an operator is *called*. This means:

- importing `nexus_language_saxs` is instant,

- the first call to `saxs()` may take a fraction of a second while NumPy loads,

- every subsequent call in the session is fast.

The pattern used in each ops.py file:

```text
def _saxs_fn(d):
    import numpy as np    # ← lazy: only here, not at module top
    ...

register_op("saxs", _saxs_fn)
saxs = lazy_op("saxs")   # ← Op that calls get_op() at call time, not import time
```

## Namespace syntax (coming in v0.3)

 When two modules register an operator with the same name (e.g., both `saxs` and `spr` register `fit`), disambiguation uses the namespace prefix:

```text
from nexus_language_saxs import saxs
from nexus_language_spr  import spr

d > saxs.s > saxs.fit@guinier          -- SAXS fit
d > spr.spr > spr.fit@langmuir         -- SPR fit
```

## Package structure

```text
nexus_language/
├── __init__.py              ← re-exports from core only
├── core/
│   ├── node.py              ← Dataset / Signal / Fit / Constraint / Error
│   ├── op.py                ← Op, ParametrisedOp, ChainOp, lazy_op()
│   ├── graph.py             ← GraphNode, Graph, lazy DAG execution
│   └── registry.py          ← register_op / get_op / registered_ops
├── saxs/
│   ├── ops.py               ← saxs, compute, fit  (+aliases s, c, f)
│   └── models.py            ← Guinier, sphere, core-shell, …
├── spr/
│   └── ops.py               ← spr, fit, gillespie
├── nexus/
│   ├── constraints.py       ← MeasurementAdapter, bridge, constrain
│   └── solver.py            ← solve (map / mcmc / grid / cvx)
└── warehouse/
    └── storage.py           ← store, query, pull, push
```

## Adding a new domain module

1. Create a directory `nexus_language/<domain>/`.

2. Write `ops.py`: implement your functions, call `register_op()` at module level.

3. Expose `lazy_op()` handles as the public API.

4. Write `__init__.py` that imports from `ops.py` and sets `__all__`.

5. Add hint entries to `core/registry._HINTS` so error messages are helpful.

```text
-- third-party example
from nexus_language.core.registry import register_op
from nexus_language.core.op import lazy_op

register_op("nmr", _nmr_fn)
nmr = lazy_op("nmr")
```

## Future: pip install model

```text
pip install nexus-language-saxs       # installs numpy, scipy
pip install nexus-language-spr        # installs numpy, scipy
pip install nexus-language-nexus      # installs scipy, emcee (optional)
pip install nexus-language-warehouse  # stdlib only
```
