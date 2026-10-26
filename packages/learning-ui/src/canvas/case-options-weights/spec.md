---
artifact: canvas-spec
course: founder-interviews
chapter: 04.03-options-and-trade-offs
slug: case-options-weights
version: 1
owner: interaction-designer
renderer: factor (HTML controls, weighted-sum table)
---

# Canvas spec: Mais's three options

## Teaching claim
Two or three real options, compared on cost, time, risk and what you learn, give an answer that depends on what matters most this month, so a good answer says what mattered and why.

## Why a canvas
The chapter shows one table of scores. Changing a single weight and watching the leader change makes the point that the choice follows what matters, and that the learner must say what mattered aloud.

## Model
- Options (3): Lower the fee, Ask ten lost customers, Loyalty discount.
- Criteria (4), default weights: Low cost 2, Fast this month 3, Low risk 2, What you learn 3. Weight levels: 1 nice to have, 2 important, 3 very important. Scores 1 to 5, where 5 is the better side.
- Scores: Lower the fee 2, 5, 2, 5. Ask ten lost customers 5, 3, 4, 3. Loyalty discount 2, 2, 3, 2.
- Rule: total = sum of weight x score. Defaults: 38, 36, 22. Low cost at 3: 40, 41, 24. Fast this month at 1: 28, 30, 18.
- Assumptions: the scores are Mais's judgment, explained in chapter 4.3.
- Limitations: stated in `limits`.

## Rendering
- Primary: the shared factor renderer (HTML table and controls).
- Static fallback: the table of scores is in the chapter.

## Controls
One weight selector per criterion, three levels each.

## Visualisation
Totals per option with the leader marked; the result changes when the learner changes Low cost or Fast this month.

## Copy
- What this shows: the weights decide the leader.
- Try this: 1. Predict the leader at the default weights. 2. Raise Low cost. 3. Lower Fast this month.
- What changed: the renderer states which weight moved and whether the leader changed.
- Limits of the model: as in `limits`.

## Edge cases
Ties are possible (for example Fast this month at 2 gives 33 and 33) and are described by the renderer as a tie.

## Accessibility
Shared factor controls with labels and keyboard support; totals are text.

## Acceptance criteria
- [x] The claim is testable (a quiz item asks which option wins when one weight changes).
- [x] Scores and weights are checked by the registry test once registered.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the table is in 4.3).

## Build plan
`packages/learning-ui/src/canvas/case-options-weights/data.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
