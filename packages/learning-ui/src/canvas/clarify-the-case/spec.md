---
artifact: canvas-spec
course: founder-interviews
chapter: 04.02-clarify-and-assume
slug: clarify-the-case
version: 2
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Two questions narrow Mais's answer

## Teaching claim
One to three clarifying questions and a spoken assumption turn a wide case question into a narrow answer you can work on.

## Why a canvas
The chapter tells the exchange in prose. Stepping through it shows the order (say the question back, ask, hear the fact, ask again, say the assumption) and shows how the problem gets smaller after each fact, which a list of tips cannot show.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, the step note, chips and an outcome badge.
- Rule: three lanes (Founder, Mais, The facts); eight steps: the case, Mais says it back, question 1 and its answer (the drop is mostly in new customers), question 2 and its answer (the delivery fee on small orders rose from 1 dollar to 2 dollars), the assumption aloud, the narrowed answer.
- Think before each step (revision 1): every note except the last ends with one short question that the next step answers.
- Assumptions: the facts are the ones in chapters 4.1 and 4.2. A third clarifying question (one developer, about a week of work this month) is used in 4.3 and is not drawn here.
- Limitations: a real founder may not know the facts.

## Rendering
- Primary: the shared sequence renderer.
- Arrow labels are 18 characters or fewer.
- Static fallback: the exchange is written out in the chapter.

## Controls
Shared stepper controls only.

## Visualisation
Three lanes. Good tone on the answer that narrows the case and on the final step, warn on the lead that needs checking, each with a text badge.

## Copy
- What this shows: two clarifying questions and an assumption narrow the case.
- Try this: 1. Predict the answer about new and returning customers before step 4. 2. Find the assumption at step 7 and say what would change it.
- What changed: each step note says what Mais now knows.
- Limits of the model: as in `limits`.

## Edge cases
Loops (steps 2 and 7) draw beside the Mais lane with the label on the right; the registry label-fit test covers phone width.

## Accessibility
Shared stepper keyboard support; `summary` gives the whole exchange for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (a quiz item gives a case and asks which question is worth asking).
- [x] Label fit is covered by the registry test once registered.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists.

## Build plan
`packages/learning-ui/src/canvas/clarify-the-case/data.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
