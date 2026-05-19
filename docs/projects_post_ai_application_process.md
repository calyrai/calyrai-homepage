# AI Opportunity Workflow — Application Process (separate from evaluation)

Project post

 This post is intentionally focused on the **application process** layer.

 Context note: this workflow is part of finishing the warehousing approach for job applications, where each submission step is stored as a structured, queryable operational record.

 The evaluation and ranking logic (scoring profiles, normalization, warehouse ranking, posterior comparisons) is maintained as a separate technical track. Application operations should remain practical, fast, and auditable without forcing users to interpret model internals before acting.

## What this process covers

- Source collection
   Gather opportunities from jobs, startups, proposals, calls, and publications.

- Structured intake
   Convert each item into a consistent record: title, organization, location, URL, deadline, eligibility, and action notes.

- Application packet preparation
   Build a repeatable packet for each opportunity:
   CV variant, motivation context, project fit statement, references, and due-date checklist.

- Action tracking
   Record status transitions: identified, shortlisted, packet-ready, submitted, follow-up, outcome.

- Feedback loop
   Feed outcomes back into process quality notes (timing, fit quality, response rate), while keeping model-scoring logic independent.

## Separation principle

- **Application process** answers: "What do we submit, when, and with which evidence?"
- **Evaluation layer** answers: "How do we score and rank opportunities computationally?"

Both are useful, but they should not be collapsed into one workflow.

## Apply this now

- Create one opportunity record with: title, organization, URL, deadline, and location.
- Add eligibility and constraints as short bullet points.
- Prepare one packet bundle with: CV version, fit statement, references, and due-date checklist.
- Move the record through status steps: identified, shortlisted, packet-ready, submitted, follow-up, outcome.
- After outcome, capture one feedback note: fit quality, response signal, and timing quality.

## Minimum weekly cadence

- Monday: collect and normalize new opportunities.
- Tuesday: build or update packet bundles.
- Wednesday to Thursday: submit and log transitions.
- Friday: review outcomes and update feedback notes.

## Related project runtime

Backend data warehouse and ranking runtime:

- [nexus/projects/ai_opportunity_warehouse](nexus/projects/ai_opportunity_warehouse)
