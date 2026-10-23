---
artifact: canvas-spec
course: faith-and-resilience
chapter: 06.04-after-a-failure
slug: starting-again-steps
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Starting again, one step at a time

- **Slug:** `starting-again-steps`
- **Export:** `startingAgainSteps` in `data.ts`

## Teaching claim
Starting again: name it honestly, learn what to change, leave "if only", turn back to Allah where you did wrong, and try again.

## Why a canvas
After a failure, the learner's first move is often "if only", which feels like reflection but goes nowhere. A state machine can draw that move as a refused loop that leaves the learner in the same state, next to the forward path that actually moves. Stepping through Tariq's case also keeps the setback (not a sin) apart from the wrong (his silence), because the two appear in one step, side by side.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: six states in a snake (row 0: setback, name it, put it right; row 1 right to left: learn, turn back, start again). Five forward edges and one refused loop, "if only...", on the setback. Seven steps; each step lights the edge that led into its state.
- Sources: Sahih Muslim 2664 ("if only"), Quran 7:23 (naming the wrong), Sahih al-Bukhari 6133 (not stung twice; the saying alone, no story), Quran 3:135 (ask forgiveness, do not persist), Sahih Muslim 2749 (phrased so that it never encourages wrongdoing).
- Facts carried from the chapter: nine days late, two bugs, no message, the second $600 not paid; the three changes (two projects at most, three spare days, tell the client on day one); intention line and 45-minute practice from chapters 6.2 and 6.3.
- Assumptions: this setback includes a wrong (the silence); the limits say that many setbacks do not.
- Limitations: does not measure sin, forgiveness or reward.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake like `five-whys-chain`.
- The refused loop sits on a row 0 state, so in the wide layout it is drawn above the pill and clear of every other label.
- The edge between two states in the same column ("put it right" to "learn") has a three-character label, "and".
- No diagonal edges. Checked with the registry's geometry rules in both layouts.
- Static fallback: chapter 6.4 teaches the same steps in prose and in a mermaid diagram.

## Controls
Shared stepper only. No numeric inputs.

## Visualisation
Six pills, five forward arrows and one refused loop. Tone: bad on "if only" (badge "stuck"), good on the message to the client and on starting again.

## Copy
- What this shows: the steps after a failure, and the loop that goes nowhere.
- Try this:
  1. Predict whether losing the client is itself a sin.
  2. Count how far "if only" moves Tariq.
  3. Which of the three changes would have saved the client?
- What changed: each step note names what Tariq did and the source behind it.
- Limits of the model: as in `limits`.

## Edge cases
The first step has no edge; step 2 uses the refused loop and stays on the setback. State names are 12 characters or fewer; edge labels 12 or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole path for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks about a failed exam and about "if only" after a lost file).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and diagram in 6.4).
- [x] No reward, faith, sin or decree is measured.

## Build plan
`frontend/src/canvas/starting-again-steps/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
