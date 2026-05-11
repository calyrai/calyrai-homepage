# Metabolic How-To (from thought snippets)

Operational workflow pages generated from snippet YAML definitions.

## Run the method end-to-end

```text
python -m calyr.matomic.cli analyze --model models/ecoli_core.xml --output-dir results/matomic/run_001
python -m calyr.matomic.cli inspect-cycles --model models/ecoli_core.xml --top 15
python -m calyr.matomic.cli export results/matomic/run_001 exports/matomic_bundle
```

## Source snippet coverage

This page compiles curated method/theory snippets into executable, copy-paste workflows.

**Generated:** 2026-05-04

## Flux Balance Analysis with COBRApy — standard protocol

*Snippet ID: method_fba_cobra | Type: method | Source: calyrai_modelling/snippets/method/method_fba_cobra.yaml*

Flux Balance Analysis (FBA) finds a steady-state flux distribution v that maximises an objective function (typically biomass) subject to:

### Method details

```text
Flux Balance Analysis (FBA) finds a steady-state flux distribution v that
maximises an objective function (typically biomass) subject to:

  S · v = 0        (mass balance: stoichiometric matrix S, reactions v)
  lb ≤ v ≤ ub      (thermodynamic + exchange bounds)

COBRApy implementation:

  import cobra
  model = cobra.io.load_model("textbook")   # or SBML: cobra.io.read_sbml_model(...)
  solution = model.optimize()
  # solution.fluxes  → pd.Series, reaction_id → mmol/gDW/h
  # solution.objective_value  → biomass rate

Key parameters:
  - Objective: set via model.objective = "BIOMASS_Ecoli_core_w_GAM"
  - Exchange bounds: model.reactions.EX_glc__D_e.lower_bound = -10  (uptake rate)
  - Block reactions: reaction.knock_out() or set bounds to (0, 0)
```

### Context

FBA finds one optimal solution but the feasible space may contain many equally optimal solutions (degeneracy). Use FVA (Flux Variability Analysis) to bound the range of each reaction at optimality. cobra.flux_analysis.flux_variability_analysis(model, fraction_of_optimum=0.9)

## FluxWarehouse — DuckDB-backed flux run storage and comparison

*Snippet ID: method_flux_warehouse_duckdb | Type: method | Source: calyrai_modelling/snippets/method/method_flux_warehouse_duckdb.yaml*

FluxWarehouse stores FBA solutions (flux_runs + flux_values) in DuckDB. DuckDB is an embedded analytical database — no server required.

### Method details

```text
FluxWarehouse stores FBA solutions (flux_runs + flux_values) in DuckDB.
DuckDB is an embedded analytical database — no server required.

Schema:

  flux_runs(flux_id PK, condition_id, model_id, run_date, objective, status, notes)
  flux_values(flux_id FK, reaction_id, value, lower_bound, upper_bound, unit)

Usage:

  from engines.metabolic.flux.flux_warehouse import FluxWarehouse

  wh = FluxWarehouse("data/processed/flux_warehouse.duckdb")

  # Store
  wh.store_cobra_solution(
      flux_id="run_01",
      condition_id="glucose_aerobic",
      solution=cobra_solution,
  )

  # Retrieve
  fluxes = wh.get_fluxes("run_01")          # → dict[str, float]
  meta   = wh.get_run_meta("run_01")         # → dict
  runs   = wh.list_runs()                    # → pd.DataFrame

  # Compare two conditions
  delta  = wh.compare("run_01", "run_02")    # → pd.DataFrame sorted by |delta|

  # Raw SQL access
  wh.con.execute("SELECT * FROM flux_values WHERE reaction_id = 'PFK'").df()

The warehouse is the single source of truth for all flux runs.
reaction_data for Escher is derived from wh.get_fluxes() at query time.
```

### Context

DuckDB can directly query Parquet files alongside the warehouse table: wh.con.execute("SELECT * FROM 'data/raw/fluxes.parquet'") This enables hybrid analytical workflows without ETL overhead. For versioning: use flux_id = f"run_{condition}_{model_version}_{date}" to make runs reproducible and traceable.

## eQuilibrator API: InChI-Based Reaction ΔG Estimation

*Snippet ID: method_equilibrator_inchi | Type: method | Source: calyrai_modelling/snippets/method_equilibrator_inchi.yaml*

Use ComponentContribution (eQuilibrator Python API) to estimate standard Gibbs free energy (ΔG'°) for arbitrary reactions. Supports BiGG, KEGG, ChEBI, MetaNetX, and InChI-based custom compounds. Results include uncertainty covariance for robust constraint-based analysis.

### Protocol

1. **Install & initialize**

```text
from equilibrator_api import ComponentContribution, Q_
cc = ComponentContribution()  # ~1.3GB local DB, downloaded once
cc.p_h = Q_(7.4)
cc.ionic_strength = Q_("0.25M")
cc.p_mg = Q_(3.0)
cc.temperature = Q_("298.15K")
```

2. **Parse reaction (BiGG IDs)**

```text
rxn = cc.parse_reaction_formula(
    "bigg.metabolite:atp + bigg.metabolite:h2o = "
    "bigg.metabolite:adp + bigg.metabolite:pi"
)
assert rxn.is_balanced()  # Check chemical balance + charge
```

3. **Estimate single reaction**

```text
dg_result = cc.standard_dg_prime(rxn)  # Returns Measurement object
dg_value = dg_result.value.m_as("kJ/mol")
dg_error = dg_result.error.m_as("kJ/mol")  # 1σ uncertainty
```

4. **Batch estimation with covariance**

```text
reactions = [rxn1, rxn2, rxn3]
dg_mean, dg_cov = cc.standard_dg_prime_multi(
    reactions, uncertainty_representation="cov"
)  # Returns (Quantity, Quantity) with full covariance matrix
```

5. **Custom compound from InChI**

```text
ethanol_inchi = "InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3"
compound = cc.get_compound_by_inchi(ethanol_inchi)
# Can now use in reaction formulas
```

6. **Multi-compartment reactions (transport + pH)**

```text
dg_transport = cc.multicompartmental_standard_dg_prime(
    reaction_inner="...",  # Cytoplasm
    reaction_outer="...",  # Periplasm
    e_potential_difference=Q_("0.15V"),
    p_h_outer=Q_(6.5),
)
```

#### Limitations

- InChI-based compounds require equilibrator-assets package + online lookup

- Group contributions less accurate for novel scaffolds (>5σ error possible)

- Uncertainties reflect CC method variability, not metabolic conditions

- Transport reactions require explicit compartment + membrane potential data

## Integrating ΔG'° with FBA: Flux + Thermodynamics Co-Storage

*Snippet ID: method_thermo_flux_integration | Type: method | Source: calyrai_modelling/snippets/method_thermo_flux_integration.yaml*

Store flux solutions and thermodynamic estimates in a unified schema: flux_runs (condition metadata) + flux_values (per-reaction v) + thermo_values (per-reaction ΔG'°, uncertainty, feasibility). Enable joint queries: find active reactions that carry unfavorable flux or couple to favorable ones.

### Protocol

1. **Initialize warehouse**

```text
from engines.metabolic.flux.flux_warehouse import FluxWarehouse
wh = FluxWarehouse("path/to/warehouse.duckdb")
```

2. **Store flux run**

```text
wh.store_cobra_solution(
    flux_id="aerobic_baseline",
    condition_id="aerobic",
    solution=sol,  # cobra.Solution
)
```

3. **Estimate & store thermo**

```text
from engines.metabolic.thermo.thermo_engine import ThermoEngine
engine = ThermoEngine(p_h=7.4, ionic_strength=0.25)
thermo_df = engine.estimate_model_dg(model)
wh.store_thermo("aerobic_baseline", thermo_df)
```

4. **Query merged data (flux + ΔG)**

```text
fluxes = wh.get_fluxes("aerobic_baseline")
thermo = wh.get_thermo("aerobic_baseline")
# Join on reaction_id for co-analysis
```

5. **Find coupling relationships**

```text
# Identify reactions where flux > 0 but ΔG > 0
# These are energetically unfavorable and require coupling
merged = thermo.merge(fluxes, on='reaction_id')
coupled = merged[(merged['dg_prime'] > 0) & (merged['flux'] > 0)]
```

6. **Export for Escher visualization**

```text
from engines.metabolic.thermo.thermo_engine import build_thermo_map
reaction_data = build_thermo_map(
    fluxes=fluxes,
    thermo_df=thermo,
    coloring_mode="sign",  # green<0, red>0, gray=unknown
)
builder = escher.Builder(
    map_name="e_coli_core.Core metabolism",
    reaction_data=reaction_data
)
```

#### Useful queries

- List active reactions with ΔG > 0 (require coupling)

- Find cofactor redox couples (NADH/NAD, FADH2/FAD) in pathway

- Compare thermodynamic feasibility across growth conditions

- Predict metabolic engineering targets: low-ΔG sinks for product formation

- Validate flux distributions against thermodynamic constraints

## Thermodynamic Constraints on Metabolic Fluxes

*Snippet ID: theory_thermodynamic_fba | Type: theory | Source: calyrai_modelling/snippets/theory_thermodynamic_fba.yaml*

FBA assumes only stoichiometric constraints (S·v=0), but thermodynamics restricts feasible flux distributions further: reactions must satisfy ΔG'° < 0 in the forward direction (spontaneous). Coupling of unfavorable (ΔG'>0) reactions to favorable ones enables metabolic flexibility.
