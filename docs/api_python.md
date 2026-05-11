# Python API

Calling Nexus from Python

## Installation

Install only what you need — each domain is a separate package:

```text
pip install nexus-language-core       # syntax + graph engine (stdlib only)
pip install nexus-language-saxs       # + numpy, scipy
pip install nexus-language-spr        # + numpy, scipy
pip install nexus-language-nexus      # + scipy, emcee (optional)
pip install nexus-language-warehouse  # stdlib only
```

## Import philosophy

Import exactly the domain modules you need — nothing more:

```text
from nexus_language_saxs import *        # registers saxs, compute, fit
from nexus_language_warehouse import *   # registers store, query, pull, push
```

**Never** do `from nexus_language import *` — the top-level package exposes only the core and does not load any domain operators.

## SAXS session

```text
from nexus_language_saxs import *
from nexus_language_warehouse import *
from nexus_language.core.graph import Graph

g = Graph.build("d > saxs > compute@pr > fit@guinier")
result = g.resolve_all()
print(result)
```

## SPR session

```text
from nexus_language_spr import *

g = Graph.build("d > spr > fit@langmuir")
result = g.resolve_all()
```

## Multi-modal (SAXS + SPR → constraint solve)

```text
from nexus_language_saxs    import *
from nexus_language_spr     import *
from nexus_language_nexus   import *

# bridge each modality into a constraint, then solve jointly
# d[saxs] > saxs > bridge@saxs
# d[spr]  > spr  > bridge@spr
# {c_saxs, c_spr} > solve@map
```

## Registering a custom operator

```text
from nexus_language.core.registry import register_op
from nexus_language.core.op import lazy_op
from nexus_language.core.node import Signal, Fit

def _my_fit(signal: Signal, model: str) -> Fit:
    # ... your fitting code ...
    return Fit(parameters={"a": 1.0}, model=model)

register_op("my_fit", _my_fit)
my_fit = lazy_op("my_fit")
```

## Graph inspection

```text
from nexus_language.core.graph import Graph

g = Graph.build("d > saxs > compute@pr > fit@guinier")
print(g.to_dot())   # Graphviz DOT format
```

## Listing registered operators

```text
from nexus_language.core.registry import registered_ops
print(registered_ops())
# ['compute', 'fit', 'saxs', ...]  — only what has been imported
```
