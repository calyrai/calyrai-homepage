# Evidence Reading Workflow

**Reference ID:** `CALYR-METHOD-EVIDENCE-WORKFLOW-001`  
**Status:** Working contract  
**Scope:** From a source discovered in Safari to traceable evidence, reusable ideas, and citation-ready scientific writing

## Purpose

This workflow separates collecting a source from making a scientific claim. Safari is the discovery surface, Zotero is the private source and annotation system, and the calyr.aí catalog is the reviewed layer of claims, evidence, relations, and methods.

The contract is:

`discover → preserve → read → mark → extract → relate → write → verify`

A saved tab is not evidence. A highlight is not yet a claim. A generated paragraph is not publishable until its assertions resolve to reviewed sources and exact locations.

## System location

| Layer | Responsibility | Stored material |
|---|---|---|
| Safari | Discovery and capture | Current page and source URL |
| Zotero | Private library and reading record | Metadata, PDFs, snapshots, annotations, notes, collections, tags |
| calyr.aí catalog | Reviewed knowledge layer | Claims, interpretations, evidence level, relations, applicability, citation keys |
| Git | Versioned publication source | YAML records, schemas, prose, validation rules; normally no copyrighted PDFs |

This method belongs to **Methods / Research practice**. Reading rooms use it, but do not own it. Oracling, scientific machine learning, numerical methods, SAXS, SPR, cryo-EM, and future catalogs can therefore share one evidence contract.

## Capture from Safari

1. Save the publisher or repository landing page with the Zotero Connector whenever possible.
2. Let Zotero attach the original PDF and extract its bibliographic metadata.
3. If only a PDF is available, retrieve or create its parent item and verify title, authors, year, venue, DOI, and canonical URL.
4. Preserve an ordinary webpage as a Zotero webpage item or snapshot. Create a PDF only when a fixed rendering is required.
5. Put the item into a purposeful collection and assign a workflow status.

Suggested status tags are `inbox`, `to-read`, `reading`, `annotated`, `extracted`, `verified`, and `used`.

## Read and mark

Use a stable color vocabulary across the library:

| Color | Semantic role | Extraction target |
|---|---|---|
| Yellow | Claim or finding | What does the source assert? |
| Blue | Method or definition | How is the result obtained or a term defined? |
| Green | Data or evidence | Which observation, dataset, or experiment supports it? |
| Red | Limitation or contradiction | Where does it fail, disagree, or remain uncertain? |
| Purple | Interpretation or application | Why might this matter to the active calyr.aí question? |

Every consequential highlight receives a short annotation note stating why it matters. Preserve the page or section locator. Paraphrases must remain visibly distinct from verbatim excerpts.

## Extract an evidence record

Only reviewed annotations cross from Zotero into Git. Each record must be atomic enough to evaluate independently and rich enough to return to its source.

```yaml
- id: claim-guo-2017-calibration-001
  source:
    zotero_key: ""
    citation_key: guo2017calibration
    doi: 10.48550/arXiv.1706.04599
    url: https://proceedings.mlr.press/v70/guo17a.html
    locator:
      type: page
      value: "2"
  claim: Modern neural-network confidence can be poorly calibrated even when predictive accuracy is high.
  excerpt: ""
  interpretation: Calibration must be validated independently from accuracy.
  evidence_type: empirical
  evidence_level: published
  applicability:
    domains: [classification, scientific machine learning]
    limits: [dataset shift, task-specific recalibration]
  relations:
    supports: [calibration-check-per-trait]
    challenges: []
  topics: [calibration, uncertainty, oracling]
  review:
    status: pending
    reviewer: ""
    verified_at: ""
```

The Zotero key provides a local return path. DOI and canonical URL provide portable identity. The locator makes the assertion auditable. Empty review fields prevent unreviewed extraction from appearing finished.

## Build text from ideas

Write from a question or argument, not from a sequence of papers.

1. Select reviewed claims relevant to the section objective.
2. Group supporting, limiting, and contradictory records.
3. Draft the argument in original language.
4. Attach a citation to every externally checkable assertion.
5. Return to Zotero for exact context before quoting.
6. Verify that the cited source supports the sentence as written.
7. Keep uncertainty, applicability, and disagreement visible in the finished text.

AI may cluster, compare, retrieve, and draft from the reviewed records. It must not invent locators, silently merge distinct claims, or upgrade an interpretation into source evidence.

## API and synchronization boundary

Begin with a local, read-only Zotero integration. Read items, collections, tags, notes, annotations, attachment metadata, and indexed text through the Zotero local API. Transform selected records into the catalog schema only after an explicit review action.

Do not commit API keys, authentication tokens, the Zotero database, or private attachments. Do not publish full PDFs unless their license and repository policy explicitly permit redistribution. A later web integration may use the Zotero Web API with a narrowly scoped credential stored outside Git.

The first implementation boundary is one-way:

`Zotero → reviewed extraction → YAML → generated catalog`

Bidirectional synchronization is deferred until conflicts, deletion, permissions, and provenance can be handled without ambiguity.

## Validation gates

A record can move to `verified` only when:

- bibliographic identity has been checked;
- the claim resolves to an exact source location;
- excerpt and paraphrase are distinguished;
- evidence type and level are explicit;
- applicability and important limitations are recorded;
- the source actually supports the local interpretation;
- redistribution of stored material is permitted;
- a human reviewer is named and the review date is recorded.

## Output

The workflow produces three distinct outputs:

1. a private, annotated source in Zotero;
2. a versioned evidence record in the calyr.aí catalog;
3. citation-ready prose whose claims can be traced back through the evidence record to the source.

This separation allows the literature base to grow without turning Git into a document archive or turning generated prose into an unreviewed authority.

## Sources and further reading

- [Zotero Connector](https://www.zotero.org/support/connector)
- [Zotero PDF reader and annotations](https://www.zotero.org/support/pdf_reader)
- [Zotero notes](https://www.zotero.org/support/notes)
- [Zotero Web API v3](https://www.zotero.org/support/dev/web_api/v3/)
- [Zotero Web API full-text access](https://www.zotero.org/support/dev/web_api/v3/fulltext_content)
