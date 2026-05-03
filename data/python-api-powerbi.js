// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Data Platform",
    "headline": "Python + API + Power BI",
    "tagline": "clean architecture — Python handles data and APIs, Power BI handles visualization"
  },
  {
    "type": "statement",
    "chapter": "Core concept",
    "kicker": "One sentence",
    "headline": "Python is the engine.<br>Power BI is the interface.",
    "body": "Python handles data processing and APIs. Power BI handles visualization.\nThis is not a preference — it is an architectural rule. Business logic lives in Python or the API layer. Power BI reads clean, structured output and displays it.\nEvery other principle in this system follows from this one separation.\n",
    "manifesto": "Logic in Python. Display in Power BI."
  },
  {
    "type": "statement",
    "chapter": "Python layer",
    "kicker": "What Python does",
    "headline": "Python: data, logic, APIs",
    "body": "Python pulls data from APIs using requests. It cleans and transforms data with pandas. It computes derived metrics, applies business rules, and produces structured output.\nThe output can be a CSV file, a database table, or a JSON response from an API endpoint — all three are valid handoff formats to Power BI.\nPython is the only place where logic lives. It runs outside Power BI, on a schedule or on demand, producing a clean and stable data model.\n",
    "manifesto": "Python is your engine."
  },
  {
    "type": "equation",
    "chapter": "Data flow",
    "kicker": "Full pipeline",
    "headline": "Five stages, one direction",
    "eq": "$$\\text{API / Databases} \\longrightarrow \\underbrace{\\text{Python}}_{\\text{cleaning, modeling}} \\longrightarrow \\text{Structured Data} \\longrightarrow \\text{Power BI} \\longrightarrow \\text{Dashboards}$$",
    "body": "Data enters from APIs or databases. Python cleans, models, and derives. The output is a stable structured layer — CSV, database, or API. Power BI reads from it and visualizes.\nNo step skips the layer below it. Power BI never touches raw data directly.\n"
  },
  {
    "type": "statement",
    "chapter": "Integration patterns",
    "kicker": "Four patterns",
    "headline": "File → Database → API → Embedded",
    "body": "Pattern 1 — File-based (simplest): Python writes a CSV, Power BI reads it. Works for small datasets and prototypes.\nPattern 2 — Database (real-world): Python writes to a database, Power BI connects to it. Standard production setup.\nPattern 3 — API layer (advanced): Python exposes a REST API, Power BI and other consumers query it. Fully decoupled.\nPattern 4 — Embedded dashboard: Power BI dashboard embedded into an application such as Calyr. The app controls context; Power BI renders.\n",
    "manifesto": "API enables multiple consumers."
  },
  {
    "type": "statement",
    "chapter": "Architecture",
    "kicker": "Clean architecture",
    "headline": "Sources → API Layer → Data Model → Power BI",
    "body": "Separation of concerns: Python is logic, Power BI is display. No business logic crosses the boundary into the visualization layer.\nCentralized logic: definitions live in one place. No duplication across reports or dashboards.\nReusability: the API layer exposes the same data model to Power BI, to LLMs, and to any future consumer.\nScalability: the system grows by adding consumers to the API layer — not by copying logic into each tool.\n",
    "manifesto": "One data model. Many consumers."
  },
  {
    "type": "statement",
    "chapter": "Calyr",
    "kicker": "Your system",
    "headline": "Calyr = Python + API + Data Model.<br>Power BI = Visualization.",
    "body": "This is exactly the Calyr architecture. Calyr Core is Python plus the API layer — it handles data integration, modeling, and structured output. Power BI sits on top and visualizes.\nThe same data model that feeds Power BI dashboards also feeds LLM reasoning. The semantic layer is the shared contract for both.\nMultiple tools. One foundation. No logic duplicated.\n",
    "manifesto": "Python builds it. APIs expose it. Power BI shows it."
  },
  {
    "type": "statement",
    "chapter": "Interview",
    "kicker": "Four killer sentences",
    "headline": "What you say when they ask",
    "body": "\"I would use Python to handle data integration and modeling, and Power BI as a visualization layer on top.\"\n\"APIs allow us to standardize data access and decouple systems.\"\n\"The key is to keep business logic out of Power BI and centralize it in the data layer.\"\n\"This creates a scalable architecture where multiple tools can use the same data foundation.\"\n",
    "manifesto": "Data Sources → Python/API → Data Model → Power BI."
  }
];
