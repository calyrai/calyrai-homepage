// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Data Platform",
    "headline": "From Legacy BI<br>to Structured Data Platforms",
    "tagline": "migration of Oracle Warehouse Builder & SAP BO to Power BI — and why structured data is the foundation for reliable LLMs"
  },
  {
    "type": "statement",
    "chapter": "Problem",
    "kicker": "Current situation",
    "headline": "Coupled tools,<br>no central semantics",
    "body": "Oracle Warehouse Builder handles ETL while SAP Business Objects handles reporting — but data, logic, and visualization are entangled in both.\nKPI definitions are inconsistent across reports. The system is difficult to maintain and not extensible.\nThe root cause is structural: there is no central semantic layer where meaning is defined once and shared everywhere.\n",
    "manifesto": "No central semantic structure."
  },
  {
    "type": "statement",
    "chapter": "Architecture",
    "kicker": "Target architecture",
    "headline": "Sources → Warehouse → Semantics → BI",
    "body": "The target separates concerns cleanly. Data sources feed a data warehouse responsible only for storage. A semantic layer defines all KPIs and business logic once. Power BI reads from semantics and contains no business logic of its own.\nThis separation is not a tool choice — it is a design rule. Power BI contains no business logic.\n",
    "manifesto": "Power BI contains no business logic."
  },
  {
    "type": "equation",
    "chapter": "Design",
    "kicker": "System design",
    "headline": "Semantics connects BI and AI",
    "eq": "$$\\text{SOURCES} \\rightarrow \\text{WAREHOUSE} \\rightarrow \\underbrace{\\text{SEMANTIC LAYER}}_{\\text{KPIs defined once}} \\rightarrow \\begin{cases} \\text{Power BI} \\\\ \\text{LLM} \\end{cases}$$",
    "body": "The semantic layer is the shared foundation for both the BI layer and the AI layer.\nWithout it, every consumer re-derives meaning independently — producing drift, inconsistency, and unverifiable outputs.\n"
  },
  {
    "type": "statement",
    "chapter": "Migration",
    "kicker": "Migration strategy",
    "headline": "Four-phase rollout,<br>no big bang",
    "body": "Phase 1 — Analysis: extract all ETL logic, identify KPIs, catalogue every report.\nPhase 2 — Data Warehouse: build a clean schema, centralize data, establish single source of truth.\nPhase 3 — Semantic Layer: define each KPI exactly once, standardize all business logic.\nPhase 4 — Iterative migration: domain by domain, with parallel operation until each domain is validated.\n",
    "manifesto": "No big bang."
  },
  {
    "type": "statement",
    "chapter": "Risks",
    "kicker": "Risks and solutions",
    "headline": "Architecture-first<br>mitigates every major risk",
    "body": "KPI inconsistency is solved by the central semantic layer — definitions live in one place.\nData quality problems are caught by validation and profiling stages in the warehouse.\nTool-driven thinking is blocked by the architecture-first rule: tools serve the design, not the other way around.\nBig bang failure risk is eliminated by iterative domain-by-domain rollout with parallel operation.\nUser resistance is managed through parallel system access and structured training.\n"
  },
  {
    "type": "equation",
    "chapter": "Insight",
    "kicker": "From BI to AI — Nexus perspective",
    "headline": "A structured warehouse<br>is essential for reliable LLMs",
    "eq": "$$\\text{DATA} \\rightarrow \\text{WAREHOUSE} \\xrightarrow{\\text{Nexus}} \\text{SEMANTIC LAYER} \\rightarrow \\text{LLM}$$",
    "body": "Without structure, an LLM produces inconsistent answers, no traceability, and unreliable outputs. Every query re-derives meaning from raw data.\nWith structure, queries are deterministic, KPIs are consistent, and results are explainable. The warehouse is the foundation. The semantic layer — Nexus — is where meaning lives. The LLM is the reasoning layer on top.\n"
  }
];
