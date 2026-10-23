---
artifact: canvas-spec
course: building-habits
chapter: 07.02-reading-your-30-days
slug: thirty-day-review
version: 1
owner: interaction-designer
renderer: state-machine (2 rows by 3 columns)
---

# Canvas spec: Reading 30 days: Samir's review

## Teaching claim
Reviewing 30 days of tracking goes in order: count the days done, find when the misses happened, find their cause from the notes, choose one change for the biggest cause, and test it for about two weeks before deciding again. Changing three things at once makes the next month impossible to read.

## Why a canvas
The review is a sequence where each step narrows the question ("how did the month go?" becomes "will a charged lamp help on dark evenings?"). Stepping through it, with Samir's numbers appearing at each stage, shows how a vague feeling of failure turns into one change and one count. A static list of five questions shows the order but not the narrowing, and not the loop back to a new month.

## Model
- Inputs: none beyond the step controls.
- Outputs: the lit state, the lit edge, the step note, outcome badges ("one change", "a hint", "three changes") and chips.
- Rule: six states form a loop. Count days done, When misses fell, Causes in notes, Choose one change, Test for 2 weeks, and Keep, change, drop, which leads back to counting a new month. A seventh step returns to Choose one change to show the trap of three changes at once.
- Case numbers (all from chapters 7.1 and 7.2): 23 of 30 done; longest run 9 (days 8 to 16); longest gap 2 (days 17 and 18); days 1 to 15: 14 done, 1 missed; days 16 to 30: 9 done, 6 missed; causes: dark evenings 4 (days 17, 18, 24, 27), Friday at his uncle's 2 (days 7, 21), late client call 1 (day 29); ordinary evenings at home with power: 22 of 23 done; dark evenings: 1 of 5 done (day 22, with a borrowed lamp).
- Assumptions: the notes on missed days are honest and complete; the biggest cause gets the first change.
- Limitations: real months can have two causes of the same size, notes can be missing, and two weeks may hold only a few of the days being tested. Stated in `limits`.

## Rendering
- Primary: the shared state machine renderer (HTML controls, inline SVG), 3 columns by 2 rows.
- Why this renderer: the review is a cycle with a fixed order and a loop back to a new month.
- Layout: a U shape like `five-whys-chain`. Row 0 runs Count, When, Causes from left to right; column 2 steps down to Choose one change; row 1 runs Choose, Test, Decide from right to left; column 0 steps up from Decide back to Count.
- Labels: "then", "why?", "try it" and "after" across rows; "so" and "new" on the two arrows inside a column (at most 3 characters). No diagonal edges. State names at most 18 characters.
- Static fallback: chapter 7.2 walks through the same review in prose, with a table of causes, so the chapter teaches the claim if the canvas fails to load.

## Controls
The shared stepper: Back, Next, Play/Pause and Start over, numbered step chips, and arrow keys, Home and End when focused. No numeric inputs; the claim is about order, not about changing a value.

## Visualisation
One loop of six pills. The active state and edge are lit; chips under the note carry the numbers for that step. Tones appear only with a text badge: good for the one change, warn for "a hint", bad for the three-changes trap.

## Copy
- What this shows: one month read in order, from counts to one change and a two-week test.
- Try this:
  1. At step 3, check the predict made above the canvas: did the notes point to his evenings or to his interest in reading?
  2. At step 7, ask what Samir would learn next month if he changed three things at once.
- What changed: each step note narrows the question and gives the number behind it, ending with one change and one count.
- Limits of the model: as in `limits`.

## Edge cases
The last step lights Choose one change a second time, with no edge, to show the trap; its badge and note make the difference clear. Labels fit the narrow layout (columns become rows 112px apart, rows become columns 150px apart). The two same-column labels ("so", "new") are 2 and 3 characters.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole review and its numbers for screen readers; every tone has a text badge; reduced motion follows the renderer (a still dot instead of the flow pulse).

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: Layla's market-day misses choose one change, and her two-week result is read as a hint).
- [ ] The model is tested (registry consistency, layout and label-overlap tests run by the orchestrator after registration).
- [x] Numbers match chapters 7.1 and 7.2 (23 of 30; 1 and 6 misses by half; causes 4, 2 and 1; 22 of 23; 1 of 5).
- [x] Prediction before (what the notes will show), transfer check after (Layla).
- [x] Reader fallback exists (chapter 7.2 does the same review in prose).

## Build plan
`frontend/src/canvas/thirty-day-review/data.ts` (export `thirtyDayReview`, typed `StateMachineSpec`), registered by the orchestrator in `registry.ts` and the shared slugs list. Preview at `/workspace/canvases`.
