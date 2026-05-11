# Archive

Physical storage for a queryable scientific state space

## Why archive exists

 A Nexus workflow does not produce isolated files. It produces datasets, signals, intermediate states, models, and computation graphs that must remain reproducible and linked. The archive is the durable layer that stores those artifacts without losing their relationships. It is therefore more than file storage. It is a structured, queryable scientific state space.

## What existing standards solve

| Approach | Strength | Limit for Nexus |
| --- | --- | --- |
| Folder trees | Simple and familiar | No lineage, no reproducibility, no graph semantics |
| HDF5 | Structured and fast for hierarchical data | Weak expression of workflows and cross-object provenance |
| NeXus | Strong scientific hierarchy for facility data | Too rigid for a typed DSL plus computation graph model |
| Workflow engines | Dependency tracking between steps | Usually file-oriented rather than object-oriented |

## Recommended layout

 The archive should be hybrid: content-addressed object storage for immutable scientific records, graph storage for provenance and dependency structure, and an index for fast lookup. The filesystem stores blobs efficiently, while SQLite maintains object metadata and edges.

```text
nexus_archive/
├── datasets/
│   └── <dataset_id>/
│       ├── raw/
│       └── metadata.json
├── objects/
│   └── <hash>.json
├── graphs/
│   └── <graph_id>.json
├── results/
│   └── <result_id>.json
└── index.db
```

## Core object model

 Every stored entity is an object with a declared type, its origin, and the operation that produced it. Content-addressed IDs make identical computations converge to the same stored result. New inputs generate new IDs, so history is preserved without overwriting prior states.

```text
{
  "type": "Signal(q)",
  "data": [...],
  "origin": "dataset_042",
  "operation": "saxs"
}
```

## Content addressing

 The archive should name immutable objects by the hash of their content rather than by ad hoc filenames. This gives deterministic caching and strong reproducibility: same input, same output, same object ID. The warehouse can then expose stable references and version views without mutating the archive itself.

## Graph storage

 The archive must also persist computation graphs, not only terminal results. A graph record captures which datasets entered a computation, which operators were applied, and which downstream results depend on each node.

```text
{
  "nodes": [
    {"op": "dataset", "id": "run_042"},
    {"op": "saxs"},
    {"op": "compute", "arg": "pr"}
  ]
}
```

## Archive vs warehouse

 The archive is the physical persistence layer. The warehouse is the logical view over that persistence layer. The archive stores immutable scientific state; the warehouse makes it discoverable, typed, and queryable.

## Best practice

```text
objects(id, type, created_at)
edges(source, target)
```

 Avoid using only folders, only HDF5, or only a database. The practical design is hybrid: files for blobs, a graph for provenance, and SQLite for indexing.
