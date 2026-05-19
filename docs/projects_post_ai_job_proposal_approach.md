# AI Opportunity Workflow — Shared Proposal Approach (Job + Research)

Project post

 This post is focused on a **shared proposal approach**: job proposals and research proposals run under the same proposal system, with mode-specific packet fields.

 Context note: this proposal layer completes the warehousing approach for job applications by standardizing proposal artifacts as reusable records linked to the same operational pipeline.

 Current phase: private/internal use for evaluation.
 Release direction: public-facing interface once the workflow is validated.

 It is intentionally separate from:

- application operations (tracking, deadlines, packet logistics)
- evaluation/ranking internals (scoring models, warehouse ranking, computational fit)

## Proposal strategy

- Opportunity framing
   Define the proposal target as a problem-impact pair: what pain exists, for whom, and why now.

- Fit statement
   Write a concise fit argument linking the role or call to concrete evidence:
   domain proof, delivery proof, and collaboration proof.

- Value map
   Present expected outcomes in measurable terms (time-to-result, quality uplift, risk reduction, reproducibility gain).

- Execution design
   Include a practical delivery path:
   scope slices, milestones, dependencies, and review cadence.

- Risk and mitigation
   Pre-commit to risk handling with explicit fallback paths and decision points.

- Closing signal
   End with a clear next-step request: interview slot, technical discussion, or scoped pilot proposal.

## One framework, two proposal modes

- Job proposal mode
   Prioritizes role fit, team contribution, and first-90-day execution plan.

- Research proposal mode
   Prioritizes hypothesis quality, methodological rigor, milestone design, and reproducibility path.

Both use the same intake schema, ranking surface, and warehouse export format.

## Proposal packet template

- One-page role/call alignment brief
- Targeted CV version (evidence-first)
- 30-60-90 day execution concept or work package outline
- Optional appendix with domain artifacts and prior outcomes

Research mode adds:

- hypothesis and objective statement
- method and validation plan
- budget/work-package split
- dissemination and reproducibility plan

## Separation principle

- **Proposal approach** asks: "How do we articulate value and execution clearly enough to win?"
- **Application process** asks: "How do we operate submissions consistently?"
- **Evaluation layer** asks: "How are opportunities scored and ranked computationally?"

## Apply this now

- Write a one-line problem-impact framing for the target role or call.
- Draft a short fit statement with three proofs: domain proof, delivery proof, collaboration proof.
- Add a value map with measurable outcomes: speed, quality, risk reduction, reproducibility.
- Attach a compact execution path: scope slices, milestones, dependencies, review cadence.
- Add one risk table with fallback decisions before submission.
- End with one explicit next-step request: interview, technical call, or scoped pilot.

## Submission-ready artifacts

- Role or call alignment brief.
- Targeted CV variant.
- 30-60-90 plan or work package outline.
- Optional evidence appendix with links to prior outcomes.

## Related runtime

- [nexus/projects/ai_opportunity_warehouse](nexus/projects/ai_opportunity_warehouse)
