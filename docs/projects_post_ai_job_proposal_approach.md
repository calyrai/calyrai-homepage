# AI Opportunity Workflow — Shared Proposal Approach (Job + Research)

Project post

 This post is focused on a **shared proposal approach**: job proposals and research proposals run under the same proposal system, with mode-specific packet fields.

 Current phase: private/internal use for evaluation.
 Release direction: public-facing interface once the workflow is validated.

 It is intentionally separate from:

- application operations (tracking, deadlines, packet logistics)
- evaluation/ranking internals (scoring models, warehouse ranking, computational fit)

## Proposal strategy

1. Opportunity framing
   Define the proposal target as a problem-impact pair: what pain exists, for whom, and why now.

2. Fit statement
   Write a concise fit argument linking the role or call to concrete evidence:
   domain proof, delivery proof, and collaboration proof.

3. Value map
   Present expected outcomes in measurable terms (time-to-result, quality uplift, risk reduction, reproducibility gain).

4. Execution design
   Include a practical delivery path:
   scope slices, milestones, dependencies, and review cadence.

5. Risk and mitigation
   Pre-commit to risk handling with explicit fallback paths and decision points.

6. Closing signal
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

## Related runtime

- [nexus/projects/ai_opportunity_warehouse](nexus/projects/ai_opportunity_warehouse)
