---
artifact: canvas-spec
course: building-habits
chapter: 04.03-same-need-new-routine
slug: maha-night-loop
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Maha's night: same cue, new routine

## Teaching claim
Find the cue and the need (winding down after a long day) behind the scrolling, and swap the routine for one that meets the same need (a paper book, a downloaded audio story) while the cue stays.

## Why a canvas
The chapter explains the idea and works the example in prose. Stepping through it puts the old routine and the new one on two rows from the same cue, with the "why" arrow between the cue and the need. The learner sees that the cue does not move and the need does not change; only the routine does. The last step shows the honest limit: the old cue still pulls.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: six states on a 3 by 2 grid. Row 0: in bed at 23:00 (cue), scrolls videos (old routine), asleep at 1:00 (cost). Row 1: mind slows down (need), reads a story (new routine), asleep by 23:45. Edges: "old" and "costs" on row 0; "why" from the cue down to the need (inside column 0, three characters); "new" and "then" on row 1. No diagonals. Seven steps; each lights the arrow that led into its state; the last step revisits "Scrolls videos".
- Assumptions: the chapter's case (lies down at 23:00, scrolls until about 1:00, alarm 6:45, start 8:00; book on 4 of 6 nights in the first week, asleep by about 23:45 on those nights).
- Limitations: needs are often mixed; a one-night test is a practical method, not a research procedure; a replacement is weaker when the old cue stays close.

## Rendering
- Primary: the shared state-machine renderer.
- Why this renderer: the claim is about which state follows the same cue, and the one transition that changes.
- Grid: 3 columns by 2 rows; the only edge inside one column is "why" (3 characters), as the phone layout requires.
- Static fallback: the worked example in chapter 4.3 gives every step in prose.

## Controls
Shared stepper controls only.

## Visualisation
Six pills, five arrows. Tone bad on the cost step ("about 1:00"), good on the new routine's result ("4 of 6"), warn on the last step ("old routine"), each with a text badge.

## Copy
- What this shows: the cue and the need behind Maha's scrolling, and a new routine that meets the same need at the same cue.
- Try this:
  1. Check the prediction: at step 5, which replacement met the need found at step 4?
  2. At the last step, name what is still in the bedroom that starts the old routine.
- What changed: step notes name the need, the replacement and the result; the last step says the cue is still beside her.
- Limits of the model: as in `limits`.

## Edge cases
Steps 1 and 7 have no edge (start, revisit). State names are 18 characters or fewer; edge labels 5 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole loop for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz items on Hiba's lunch hour and Mazen's afternoon).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] The design is simple and legible.
- [x] Prediction before (which replacement meets the need), transfer check after.
- [x] Reader fallback exists (worked example in chapter 4.3).

## Build plan
`frontend/src/canvas/maha-night-loop/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
