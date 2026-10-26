---
artifact: canvas-spec
course: founder-interviews
chapter: 01.04-decisions-and-what-you-would-change
slug: samer-decision-weights
version: 1
owner: interaction-designer
renderer: factor (HTML controls, weighted-sum bars)
---

# Canvas spec: Samer's choice: what mattered then?

## Teaching claim
A decision story must say what mattered at the time: change how much one factor mattered and the choice changes.

## Why a canvas
Prose says that a choice depends on its weights. Changing one weight and watching the winner move makes the learner feel why "it was the obvious choice" is not an answer, and why the founder asks "what mattered then?".

## Model
- Options: Block the order, Flag it for dispatch, Fix by hand each morning.
- Criteria and scores (1 to 5, higher is better on every criterion):

| Criterion | Block | Flag | Fix by hand | Start weight |
|---|---|---|---|---|
| No lost orders | 1 | 4 | 4 | 3 (matters most) |
| Driver calls saved | 5 | 3 | 2 | 3 (matters most) |
| Quick to build | 1 | 3 | 5 | 1 (matters a little) |
| Little dispatch work | 3 | 2 | 1 | 2 (matters) |

- Weight levels: 1 Matters a little, 2 Matters, 3 Matters most.
- Rule: total = sum of weight x score. Defaults: Block 25, Flag 28, Fix by hand 25, so flagging wins by 3, as in the case.
- Worked values: No lost orders to 1 gives Block 23, Flag 20, Fix by hand 17 (blocking wins). With No lost orders at 3 and Quick to build at 3, Fix by hand 35 beats Flag 34. All weights at 1 gives Block 10, Flag 12, Fix by hand 12 (a tie).
- Assumptions: the scores are Samer's judgements, not measurements.
- Limitations: stated in `limits`; the table cannot hold what dispatch said or how many days Samer had.

## Rendering
- Primary: the shared factor renderer (weight buttons at least 44px tall, bars on one scale).
- Static fallback: the chapter explains the three options and what mattered in prose before the canvas.

## Controls
One weight selector per criterion with three levels, and Reset.

## Visualisation
Three bars with totals and a standing line that names the leader or a tie.

## Copy
- What this shows: the same three options give different winners when what mattered is different.
- Try this: 1. No lost orders to Matters a little (blocking wins, 23 to 20). 2. Quick to build to Matters most (fixing by hand wins 35 to 34). 3. Every weight to Matters a little (a tie at 12).
- What changed: the leader and the margin.
- Limits of the model: as in `limits`.

## Edge cases
A tie shows two leaders and a margin of zero. The weight the chapter asks about (No lost orders) changes the winner.

## Accessibility
Shared factor controls with the shared focus ring; text totals beside every bar; no colour-only meaning.

## Acceptance criteria
- [x] The claim is testable (quiz items in 1.4 ask for the answer that uses what mattered then).
- [x] The model is tested (factor model tests, registry tests, run by the orchestrator).
- [x] The design is simple and legible.
- [x] Prediction before (the chapter predict asks about lower weight on lost orders), transfer check after.
- [x] Reader fallback exists (prose in 1.4).

## Build plan
`packages/learning-ui/src/canvas/samer-decision-weights/data.ts` (export `samerDecisionWeights`), registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/factor-model.test.ts` and the registry tests; preview at `/workspace/canvases`.
