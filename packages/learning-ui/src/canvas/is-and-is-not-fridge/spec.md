---
artifact: canvas-spec
course: cause-and-effect
chapter: 05.02-describe-the-problem-exactly
slug: is-and-is-not-fridge
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Is and is not: why is fridge 2 warm?

## Teaching claim
A description that includes what is not affected rules causes out before any test that costs money: every cause must explain both what is and what is not happening. Asking what changed just before the problem started finds the cause that is left.

## Why a canvas
The order is the lesson: one fact, one cause ruled out. Stepping through lets the learner name the ruled-out cause before the note shows it, which prose can only report after the fact.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes (Majed, Fridge 2, Fridge 1, Back room); seven steps: what is affected, what is not, power, thermometer, what changed, the fix and its check, the medicines.
- Assumptions: one cause; each fact gives a clear answer.
- Limitations: real faults can have two causes or be inside the fridge; the limits say never to open a device.

## Rendering
- The shared sequence renderer, narrow layout below `sm`. Arrow labels at most 18 characters.
- Tones: good on a ruled-out cause and the confirmed fix, warn on the finding and on the medicines step, each with a text badge.

## Copy
- What this shows: each "is not" fact rules out a cause, before anything is opened or bought.
- Try this: 1. Before step 2, predict whether a hot back room could explain the problem (the chapter's predict). 2. Name the cause each fact rules out.
- What changed: each step note says what the fact ruled out.
- Limits of the model: as in `limits`.

## Edge cases
The last step is a loop on Majed's lane (setting medicines aside); it carries a warn tone and a badge. No long labels.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole story for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: which cause the "is not" side makes weakest, at a clinic).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] Facts match chapter 5.2 exactly (12 and 4 degrees, Thursday delivery, 5 degrees next morning, medicines set aside).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 5.2 tells the same steps in prose).

## Build plan
`packages/learning-ui/src/canvas/is-and-is-not-fridge/data.ts` (export `isAndIsNotFridge`), registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
