// data/deck.js
// Generated from data/deck.yaml by scripts/build_deck.py
// DO NOT EDIT DIRECTLY — edit deck.yaml instead.

window.CALYR_DECK = [
  {
    "type": "title",
    "kicker": "Calyr.ai · Data Platform",
    "headline": "Power BI + Python<br>for Calyr",
    "tagline": "Mac-native workflow — Python as the analytical core, Power BI as the visualization layer on top of a structured data foundation"
  },
  {
    "type": "statement",
    "chapter": "Reality",
    "kicker": "Mac reality",
    "headline": "Power BI Desktop is Windows-only.<br>That is not a blocker.",
    "body": "Power BI Desktop runs on Windows 10/11 only. On macOS the productive route is Power BI Service in the browser at app.powerbi.com, combined with Python locally for all data preparation, cleaning, and modeling.\nThis is not a limitation — it reinforces the correct architecture: Python is the analytical layer, Power BI is only the visualization layer.\nA Windows VM via Parallels or a remote Windows machine provides full Power BI Desktop access when needed.\n",
    "manifesto": "Python prepares. Power BI shows."
  },
  {
    "type": "statement",
    "chapter": "Setup",
    "kicker": "Python on Mac",
    "headline": "Setup in four steps",
    "body": "Step 1: verify Python is available — python3 --version.\nStep 2: create the project folder — mkdir calyr_powerbi_demo && cd calyr_powerbi_demo.\nStep 3: create and activate a virtual environment — python3 -m venv .venv && source .venv/bin/activate.\nStep 4: install the required packages — pip install pandas numpy matplotlib openpyxl requests.\nThe virtual environment isolates dependencies and mirrors the Calyr production setup exactly.\n"
  },
  {
    "type": "statement",
    "chapter": "Demo data",
    "kicker": "Demo dataset",
    "headline": "Python generates the structured data model",
    "body": "A minimal demo script creates a structured dataset: BOKU student counts and the 18–25 population from 2020 to 2025, with a derived student_ratio column.\nThe script outputs both calyr_boku_demo.csv and calyr_boku_demo.xlsx ready for upload.\nThis illustrates the core principle: Python computes, derives, and defines. The output file is already clean and semantically correct before Power BI ever sees it.\n",
    "manifesto": "Structure is created in Python, not in Power BI."
  },
  {
    "type": "equation",
    "chapter": "Architecture",
    "kicker": "Calyr architecture",
    "headline": "Three clean layers",
    "eq": "$$\\text{Calyr Core} \\;\\longrightarrow\\; \\underbrace{\\text{Structured Data Layer}}_{\\text{CSV / Excel / Database / API}} \\;\\longrightarrow\\; \\text{Power BI Web}$$",
    "body": "Calyr Core — Python — handles modeling, cleaning, and derivation. It is the only place where business logic lives.\nThe Structured Data Layer is the output: clean tables with defined columns, correct types, and derived metrics already computed.\nPower BI Web reads from the structured layer and visualizes. It contains no logic of its own.\n"
  },
  {
    "type": "statement",
    "chapter": "Power BI Web",
    "kicker": "Power BI Web workflow",
    "headline": "Upload, chart, KPI card, dashboard",
    "body": "Open app.powerbi.com and sign in with a Microsoft or organization account. Upload calyr_boku_demo.xlsx.\nBuild four minimal visuals: a line chart of year vs boku_students, a line chart of year vs population_18_25, a KPI card showing student_ratio, and a table with all values.\nSave as a dashboard. This confirms the full pipeline end-to-end: Python created the data, Power BI only drew the charts.\n"
  },
  {
    "type": "statement",
    "chapter": "Windows options",
    "kicker": "Full Power BI Desktop on Mac",
    "headline": "Two routes to Windows",
    "body": "Option A — Parallels: install Parallels Desktop, install Windows 11 inside it, then download and install Power BI Desktop from Microsoft. This gives a local Windows environment with full Power BI Desktop capabilities including Python scripting integration.\nOption B — Remote Windows: use a university Windows machine, a cloud VM, Windows 365, or an Azure VM. No local installation required.\nPython scripting inside Power BI Desktop is available under File → Options → Python scripting. Scripts must return pandas DataFrames and complete within 30 minutes.\n"
  },
  {
    "type": "statement",
    "chapter": "Interview",
    "kicker": "Interview sentence",
    "headline": "Python is the analytical core.<br>Power BI is the visualization layer.",
    "body": "\"I would use Python as the analytical and data-processing layer, and Power BI as the reporting and visualization layer on top of a structured data foundation.\"\nThe key is the separation: Calyr — Python — creates the clean data model. Power BI does not contain business logic. It only visualizes a clean and well-defined structure.\nThis architecture is tool-independent. If Power BI were replaced by another visualization tool tomorrow, the data model would not change.\n",
    "manifesto": "Power BI does not contain business logic."
  }
];
