---
artifact: canvas-spec
course: founder-interviews
chapter: 03.03-real-reasons-not-tidy-ones
slug: tidy-reason-breaks
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: A tidy reason breaks at the third why

## Teaching claim
A tidy reason invented afterwards holds at the first why and contradicts itself by the third; the real reason from the time, including "my manager asked me, and inside that I decided...", holds all the way down.

## Why a canvas
The chapter explains why memory tidies up the past. Watching the same three whys land on a tidy reason and then on a real one shows the difference in how each answer behaves under pressure. A sequence shows who says what, and the third lane (his notes from the time) shows where the real reason comes from.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, the step note, chips and an outcome badge.
- Rule: three lanes (Founder, Karam, His notes); nine steps. Steps 1 to 6 are the tidy path (reduce friction, too many fields, then "my manager asked", which contradicts the first answer). Steps 7 to 9 are the repair: Karam reads his notes from that week, then gives the real reason and the decision he made inside it.
- Assumptions: Karam's facts as in the chapter: the designer led the redesign, his manager asked him to build it, he chose one page over three steps, and he did not test which converts better.
- Limitations: one conversation; notes written later can still be wrong.

## Rendering
- Primary: the shared sequence renderer.
- Why this renderer: the claim is about who says what in order, and the contradiction is two answers by the same person.
- Arrow labels are 16 characters or fewer.
- Static fallback: the whole exchange is told in prose in 3.3.

## Controls
Shared stepper controls only.

## Visualisation
Three lanes. Warn tone on the tidy answers, bad on the contradiction, good on the notes and the real answer, each with a text badge.

## Copy
- What this shows: a tidy reason and a real reason, asked the same whys.
- Try this: 1. Predict the answer to the third why before step 6. 2. At step 9, find what was not Karam's decision and what was.
- What changed: each step note says what was added or what broke.
- Limits of the model: as in `limits`.

## Edge cases
Steps 7 to 9 use the notes lane for the first time; the renderer draws every lane from the start so nothing shifts. Labels fit the 340px layout.

## Accessibility
Shared stepper keyboard support; `summary` gives the whole exchange for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (a quiz item after the canvas asks which answer holds at the third why).
- [x] Label fit is covered by the registry test once registered.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the exchange is in prose).

## Build plan
`packages/learning-ui/src/canvas/tidy-reason-breaks/data.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
