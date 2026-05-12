# AI Opportunity Workflow — Application Process (separate from evaluation)

Project post

 This post is intentionally focused on the **application process** layer.

 The evaluation and ranking logic (scoring profiles, normalization, warehouse ranking, posterior comparisons) is maintained as a separate technical track. Application operations should remain practical, fast, and auditable without forcing users to interpret model internals before acting.

## What this process covers

1. Source collection
   Gather opportunities from jobs, startups, proposals, calls, and publications.

2. Structured intake
   Convert each item into a consistent record: title, organization, location, URL, deadline, eligibility, and action notes.

3. Application packet preparation
   Build a repeatable packet for each opportunity:
   CV variant, motivation context, project fit statement, references, and due-date checklist.

4. Action tracking
   Record status transitions: identified, shortlisted, packet-ready, submitted, follow-up, outcome.

5. Feedback loop
   Feed outcomes back into process quality notes (timing, fit quality, response rate), while keeping model-scoring logic independent.

## Separation principle

- **Application process** answers: "What do we submit, when, and with which evidence?"
- **Evaluation layer** answers: "How do we score and rank opportunities computationally?"

Both are useful, but they should not be collapsed into one workflow.

## Related project runtime

Backend data warehouse and ranking runtime:

- [nexus/projects/ai_opportunity_warehouse](nexus/projects/ai_opportunity_warehouse)
