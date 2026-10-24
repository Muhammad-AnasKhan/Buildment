---
artifact: canvas-spec
course: cause-and-effect
chapter: 01.04-after-is-not-because
slug: after-is-not-because-timeline
version: 1
owner: chapter-writer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Did the drop come after the new shop?

## Teaching claim
The order of events is a clue, not proof. Timing can rule a claimed cause out (the drop began before the new shop opened), but timing that fits only keeps a cause on the list; other evidence makes it likely.

## Why a canvas
The claim is about time order. Stepping week by week makes the learner hold the timeline in mind and commit to when the drop should start if the shop were the cause, before the test is shown.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, step note, outcome badge and chips.
- Rule: three lanes (Events, Orders, Huda); four weekly steps (12, 9, 10 and 9 orders against a normal 15, total 40), then two tests: the shop (timing fails) and the oven (timing fits, not proof).
- Assumptions: the weekly numbers of chapter 1.4; a normal week is about 3 school and 12 home orders.
- Limitations: four weeks is a short record; slow causes can show later.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 16 characters.
- Static fallback: chapter 1.4 gives the weekly numbers and both tests in prose.

## Controls
Shared stepper controls only (Back, Next, Play/Pause, Start over, numbered step chips). No numeric inputs: the claim is about order and evidence.

## Visualisation
Labelled pills or lanes with arrows from the shared renderer. Tones come from `primitives/tones.ts` only, and good, warn and bad always sit next to a text outcome badge.

## Copy
- What this shows: Huda's month week by week, with two 'it came first' claims tested against the dates.
- Try this: 1. Before step 5, say in which week the orders should start to fall if the shop were the cause. 2. At step 6, list what besides timing makes the oven likely.
- What changed: step 5 rules the shop out of this month's drop; step 6 keeps the oven on the list.
- Limits of the model: as in `limits`.

## Edge cases
Bad tone with the text badge "timing fails"; good tone with "fits, not proof", never good alone.

## Accessibility
Shared stepper keyboard support (arrow keys, Home, End) and the shared focus ring; `summary` gives the whole model for screen readers; tone is never the only signal. Reduced motion follows the renderer's rule.

## Acceptance criteria
- [x] The claim is testable: the quiz items after the canvas ask for the fact that most weakens an 'after, so because' claim, and for the first check on a claimed cause of a crash.
- [ ] The model is tested (registry consistency and label-fit tests, once the orchestrator registers the slug).
- [x] The design is simple and legible (checked against the renderer geometry for the narrow and wide layouts).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter teaches the claim in prose).
- [x] Names, numbers and facts match the chapter exactly; no em or en dashes, idioms or brand names.

## Build plan
`packages/learning-ui/src/canvas/after-is-not-because-timeline/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
