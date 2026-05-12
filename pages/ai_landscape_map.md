Calyr · AI Landscape Map

Who works in AI — live via OpenAlex

Status: currently used for internal evaluation only. Target state is a public-facing proposal warehouse interface.

## Filters

Domain

AI

Struct. Bio

Drug Discovery

Biophysics

Protein Folding

ML

Comp. Bio

Bioinformatics

Institution Type

All

University

Company

Government

Non-Profit

Country

All

Austria

Germany

USA

UK

Switzerland

↻ Fetch Live Data

## About

 Live data from [OpenAlex](https://openalex.org) — open scholarly knowledge graph. Ranks institutions by AI-related works count in the selected domain.

Calyr relevance: institutions whose research overlaps with typed-object modelling, transformation ontologies, and semantic normalization.

—

Institutions

—

AI Works

—

Countries

⌕

## AI Works Density

Select a domain and fetch data

## Institutions

Awaiting fetch…

DetailApplications

 Click an institution to see details, concept profile, and links.

Opportunity Interface

Single proposal interface. All proposal types are normalized into one warehouse stream.

Type

Proposals (Jobs + Research + Funding Calls)

[🔗 Search on LinkedIn Jobs ↗](#)

↻ Remote Jobs (Remotive)

Proposal Warehouse Feed

No direct dataset loaded yet. Source links above are launchers; all proposal records are normalized into one warehouse core for ranking and action pipelines.

Export JSONExport SQL batchCopy loader commandCopy feedCopy ranking JSONCopy packet JSONSuggest keyword refinementApply suggested keywords

Waiting for records…

Loader command will appear here.

No keyword refinement suggestion yet.

Manual Proposal Intake

Paste details to feed structured proposal records for downstream ranking and action packets.

Title

Company

Location

Source

LinkedInXINGStepStoneIndeedOther

Deadline (optional)

Eligibility (optional)

URL

Description / Requirements

Notes for Action

Add to feedClear form

Scoring Profile JSON

Ranking runs only from this JSON input profile. Switching mode loads the matching profile template.

Scoring Config

Apply scoring configReset default config

Use source launchers above, then store everything in the single proposals warehouse mode.

## Backend project (Nexus)

Unified data warehousing runtime for this page:

- `nexus/projects/ai_opportunity_warehouse/`

Orchestrated run command:

- `python3 nexus/projects/ai_opportunity_warehouse/scripts/orchestrate_proposals.py --mode proposals --data-root nexus/projects/ai_opportunity_warehouse/data`

Explore placement: listed under Projects as **AI Proposal Warehouse**.
