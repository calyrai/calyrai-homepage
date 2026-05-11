# Graph & cache

Parallelism and memoisation in the execution graph

## Graph structure

 The computation graph is a directed acyclic graph (DAG). Nodes are typed values or operator applications; edges are data dependencies. Leaf nodes are warehouse references or literal values.

## Parallelism

 Nodes with no data dependency between them can execute in parallel. The runtime uses a thread pool (Python `ThreadPoolExecutor` by default) sized to the number of available logical cores. No extra syntax is needed — the graph topology determines what can run concurrently.

```text
-- These two SAXS analyses run in parallel automatically
s1 = d1 > saxs > compute@pr
s2 = d2 > saxs > compute@pr
combined = {s1, s2} > compare@pr
```

## Content-addressed cache

 Every graph node is hashed by its operator identity and the hashes of all its inputs. If the hash already exists in the warehouse cache, execution is skipped and the stored output is returned directly.

$$\text{hash}(n) = H\!\left(\text{op\_id}(n) \,\|\, \bigoplus_i \text{hash}(\text{input}_i)\right)$$

 This means re-running an identical pipeline — even after restarting the session — costs only a cache lookup.

## Invalidation

 When a raw dataset is updated in the warehouse (new version), all downstream cache entries that depend on it are automatically invalidated. Cache entries can also be explicitly invalidated with `warehouse.invalidate(id)`.

## Memory limits

 The in-memory graph is bounded by `NEXUS_GRAPH_CACHE_MB` (default 512 MB). LRU eviction applies to computed-but-not-saved intermediates.
