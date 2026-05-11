# Warehouse

Versioned, content-addressed storage for all Nexus objects

## Concept

 The warehouse is the persistent backing store for every object produced by a Nexus pipeline: raw datasets, signals, distributions, fits, constraints, nexus objects, and envelopes. Every stored object has a stable content-addressed ID ($SHA_{256}$ of its serialised representation), a human-readable tag list, and a provenance link to the graph that produced it.

## Archive and warehouse

 In Nexus, the archive is the physical storage layer and the warehouse is the logical interface over it. The archive stores datasets, objects, graphs, and results as durable content-addressed records. The warehouse exposes that state as typed, queryable scientific objects with lineage, tags, and version control. Storage is therefore not just a folder tree. It is a structured scientific state space.

## Reading from the warehouse

```text
d = warehouse["run-042"]          -- by ID prefix (unambiguous)
d = warehouse.get(tag="sec-saxs") -- by tag (returns List)
```

## Writing to the warehouse

```text
warehouse.push(fit, tags=["guinier", "IgM-sample-001"])
-- returns: WarehouseRef { id: "3f8a...", version: 1 }
```

## Versioning

 Re-pushing an object with the same ID but different content creates a new version. The old version remains queryable via `warehouse["3f8a...", version=1]`. The default is always the latest version.

## Lineage graph

 Every write records the IDs of all warehouse objects that were inputs to the graph that produced it. The full lineage is queryable:

```text
warehouse.lineage("3f8a...")
-- returns: { inputs: [...], produced_by: "nexus_session_uuid", timestamp: ... }
```

## Backends

| Backend | Use case | Config key |
| --- | --- | --- |
| LocalStorage (JSON) | file:// / demo | NEXUS_WAREHOUSE=local |
| Filesystem (SQLite + files) | Single workstation | NEXUS_WAREHOUSE=sqlite |
| Object store (S3/GCS) | Team / cloud | NEXUS_WAREHOUSE=s3://bucket |
