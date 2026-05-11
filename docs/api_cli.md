# CLI

Running Nexus from the command line

## Installation check

```text
nexus --version
```

## Running a script file

```text
nexus run analysis.nx
```

The `.nx` extension is conventional; any plain-text file is accepted.

## Inlining an expression

```text
nexus eval 'd = warehouse["run-042"]; d > saxs > fit@guinier'
```

## Grammateia CLI

`calyr.gram` is the literature-side CLI for the Grammateia layer. Use it to ingest literature records, extract structured fields, and build graph-ready objects that can be linked back into Nexus/Okto workflows.

```text
python -m calyr.gram --help

python -m calyr.gram ingest --id paper_123 --title "SPR-SAXS coupling"
python -m calyr.gram extract --in literature/paper_123.json
python -m calyr.gram graph --in literature/paper_123.json
```

## Warehouse commands

```text
nexus warehouse list                     # list all objects
nexus warehouse list --tag guinier       # filter by tag
nexus warehouse show 3f8a               # display object metadata
nexus warehouse push result.json        # import an external result
nexus warehouse export 3f8a output.csv  # export a Fit as CSV
```

## Metabolic method (calyr.matomic)

`calyr.matomic` is the metabolic analysis CLI for model-level workflows. The method is run in three explicit stages: analyze, inspect cycles, and export.

```text
python -m calyr.matomic.cli --help

# 1) full method run (FBA scenarios -> PCA -> cycle detection -> warehouse export)
python -m calyr.matomic.cli analyze --model models/ecoli_core.xml --output-dir results/matomic/run_001

# 2) inspect dominant metabolite cycles from a single solution
python -m calyr.matomic.cli inspect-cycles --model models/ecoli_core.xml --top 15

# 3) export compact artifacts for reporting/sharing
python -m calyr.matomic.cli export results/matomic/run_001 exports/matomic_bundle
```

 If no model path is provided, the CLI uses a default COBRA textbook model. Typical outputs include `analysis_summary.json`, `cycles.json`, `analysis_warehouse.db`, and `warehouse_export/*.csv`.

 For step-by-step workflows generated from thought snippets, see **Metabolic how-to (snippets)** and **Metabolic snippet catalog** in the API reference section.

## Operator registry

```text
nexus ops list          # show all registered operators
nexus ops show fit      # show all variants of 'fit'
nexus ops show fit@guinier  # show signature + docstring
```

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| NEXUS_WAREHOUSE | sqlite | Warehouse backend |
| NEXUS_WAREHOUSE_PATH | ~/.nexus/warehouse.db | Filesystem backend path |
| NEXUS_WORKERS | CPU count | Thread pool size |
| NEXUS_GRAPH_CACHE_MB | 512 | In-memory graph cache limit |
| NEXUS_LOG_LEVEL | WARNING | Logging verbosity |
