---
artifact: canvas-spec
course: founder-interviews
chapter: 06.03-a-real-weakness-with-a-plan
slug: weakness-answer-choice
version: 1
owner: interaction-designer
renderer: factor (HTML controls, weighted-sum bars)
---

# Canvas spec: Nour's weakness answer: change what matters

## Teaching claim
People choose the humblebrag because it feels safe to say. When honesty, usefulness and a plan matter too, a real weakness with an example and a plan comes out ahead. In the one direct study, readers preferred the real weakness.

## Why a canvas
The pull of the safe answer is a feeling. Moving one weight and watching the safe answer win shows why the habit exists. Moving a second weight and watching the real answer win again shows what the habit costs.

## Model
- Inputs: one weight per criterion, three levels (1 matters a little, 2 matters, 3 matters a lot). Four criteria: honest, matters for the work, shows what you do, feels safe to say.
- Outputs: a total for each of three answers, the leader, the lead in points.
- Formula: total(answer) = sum over criteria of weight x score. Scores run from 1 to 5.
- Starting weights: all four at 1. Totals at the start: perfectionist 11, real with no plan 11, real with a plan 16.
- Safe to say at 3: perfectionist 21, real with no plan 13, real with a plan 20. Safe at 3 and honest at 3: real with a plan 30, perfectionist 25, real with no plan 23.
- Assumptions: scores are Nour's own judgment.
- Limitations: a simple illustration that cannot say which weakness to name.

## Rendering
- Primary: the shared factor renderer.
- Names are short so they fit the bar labels: Perfectionist, Real, no plan, Real, with plan.
- Static fallback: chapter 6.3 compares the three answers in prose.

## Controls
Three-level weight buttons and Reset.

## Visualisation
Three total cards and bars; the weight rows show score times weight.

## Copy
- What this shows: three weakness answers scored on four questions.
- Try this: 1. Predict the leader when all weights are equal. 2. Set Feels safe to say to Matters a lot. 3. Also set Honest to Matters a lot.
- What changed: the renderer names the moved weight, the point changes and whether the leader changed.
- Limits of the model: as in `limits`.

## Edge cases
A tie is shown as a tie (at the start, two answers are tied for second place, which is not the lead).

## Accessibility
Shared factor renderer: labelled radio buttons, keyboard use, visible focus, text alternative for bars.

## Acceptance criteria
- [x] The claim is testable: quiz items in 6.3 ask which weakness answer fits stated facts.
- [x] The model is tested in the course test (starting totals and the flip).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/weakness-answer-choice/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
