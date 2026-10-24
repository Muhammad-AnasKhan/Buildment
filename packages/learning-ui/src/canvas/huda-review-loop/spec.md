---
artifact: canvas-spec
course: cause-and-effect
chapter: 06.02-reinforcing-loops
slug: huda-review-loop
version: 1
owner: interaction-designer
renderer: state-machine (2 rows by 3 columns)
---

# Canvas spec: Huda's review loop: more leads to more

## Teaching claim
In a reinforcing loop, an effect becomes a new cause of itself, so each turn adds more than the one before (4, 6, 9, 13 cakes a week), until the loop meets a limit. The first push starts the loop but does not keep it going.

## Why a canvas
Going round the loop several times, with the number growing on each turn, shows why growth speeds up. A static diagram shows the circle but not the turns.

## Model
- Inputs: none beyond the step controls.
- Outputs: the lit state, the lit edge, the note, outcome badges (+4, +6, +9, limit) and chips.
- Rule: four states form the loop (Reviews posted, New orders, Cakes delivered, Happy customers); the Engagement party gives the first push; the Oven limit is where the loop is held back. Each four weeks the loop adds half of current weekly sales: 8, 12, 18, 27, about 40; without the limit, about 60 by week 20.
- Assumptions: a fixed share each turn.
- Limitations: real loops are uneven and have more links; the loop can run in reverse.

## Rendering
- The shared state machine renderer, 3 columns by 2 rows. The loop is a square on columns 0 and 1; the party and the oven sit in column 2.
- Labels: "photos", "more", "meets" across rows; "so" on the two arrows inside a column (at most 3 characters). No diagonal edges.

## Copy
- What this shows: each turn of the loop adds more than the last, until a limit.
- Try this: 1. Before the last step, predict week 20 with no limit (the chapter's predict). 2. Count the jumps.
- What changed: each step note gives the new weekly number and the jump.
- Limits of the model: as in `limits`.

## Edge cases
The loop passes the same states twice; each pass has its own step note and badge. Labels fit the narrow layout (columns become rows 150px apart).

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole loop and the numbers for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: a bag seller's ratings loop turning down).
- [x] The model is tested (registry consistency, layout and label-overlap tests).
- [x] Numbers match chapters 6.1 and 6.2 (8, 12, 18, 27, about 40; oven 36 a week).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 6.2 does the same arithmetic in prose).

## Build plan
`packages/learning-ui/src/canvas/huda-review-loop/data.ts` (export `hudaReviewLoop`), registered by the orchestrator.
