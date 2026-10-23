---
artifact: canvas-spec
course: cause-and-effect
chapter: 05.03-guess-test-repeat
slug: laptop-charging-detective
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Why will Nour's laptop not charge?

## Teaching claim
Describe the problem exactly, then test one cause at a time, with the cheapest likely one first as a rule of thumb; a well-chosen test can rule out half the chain at once, and a fix counts only when a test confirms it.

## Why a canvas
The order of the tests is the lesson. Stepping through them makes the learner predict what each test rules out before the answer appears, which prose alone reports after the fact.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips.
- Rule: four lanes along the power path (Nour, Socket, Charger and cable, Laptop); seven steps: describe, list causes, three tests in order of cost, confirm the fix, log.
- Assumptions: one fault; each test gives a clear yes or no.
- Limitations: real faults can have two causes or be intermittent; some faults need a repair shop.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 16 characters.
- Safety copy: the port is checked switched off and unplugged, and cleaned with a wooden toothpick, never metal; the limits say never to open a device or charger.
- Static fallback: chapter 5.3 describes the same tests in prose before the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Four lanes, one arrow per step; good on tests that rule a part out and on the confirmed fix, warn on the finding, each with a text badge.

## Copy
- What this shows: a fault found by cheap tests in a sensible order.
- Try this: 1. Predict what the phone test rules out before step 4. 2. What makes a test cheap?
- What changed: each step note says what the test ruled out.
- Limits of the model: as in `limits`.

## Edge cases
Loop steps on Nour's lane (describe, list, log) carry no outcome except the log. No long labels.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole investigation for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas asks for the best next test in a new case).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 5.3).

## Build plan
`frontend/src/canvas/laptop-charging-detective/data.ts`, registered in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
