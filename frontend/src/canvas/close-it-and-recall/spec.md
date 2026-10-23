---
artifact: canvas-spec
course: build-with-ai
chapter: 03.02-the-fluency-trap
slug: close-it-and-recall
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Close it and recall

## Teaching claim
Reading a clear explanation feels like knowing; closing it and recalling from a blank page shows the gaps; re-studying only the gaps, then recalling again days later, is what builds memory.

## Why a canvas
The chapter explains the fluency trap and lets the learner try it on a different topic (password hashing). The canvas makes the loop itself visible on Lina's subnetting: the rating stays high while the recall shows gaps, and the last step puts the rereading route next to the recall route. Stepping one state at a time lets the learner predict the recall result before seeing it.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note, outcome badge and chips.
- Rule: six states in a snake (explanation, feels known, blank page, gaps found, re-study gaps, recall again); five transitions; seven steps, the last revisiting "Feels known" with no edge as the rereading route.
- Facts (checked twice): a /24 network has 256 addresses; four equal parts need two extra bits, so /26; each /26 has 2 to the power 6 = 64 addresses; minus the network and broadcast addresses, 62 usable. Lina rates 4 of 5, misses 2 of 5 steps, recalls 5 of 5 three days later. These match chapter 3.2 exactly.
- Assumptions: one learner, one topic, honest marking of each step.
- Limitations: one round of recall shown; real gaps can need several rounds; the three-day gap is the example's, not a rule.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back right to left on row 1).
- The edge between "Blank page" and "Gaps found" is in one column, so its label is three characters ("try"): it becomes horizontal on phones, where the gap between pills is small.
- Other edge labels are 12 characters or fewer. State names are 14 characters or fewer.
- No rejected edge: the rereading route is shown as a final step that returns to "Feels known" with a bad tone, so no loop label sits on top of a pill in the narrow layout.
- Static fallback: chapter 3.2 tells Lina's gaps and re-study in prose after the canvas, and teaches the same loop on a different topic before it.

## Controls
Shared stepper controls only. The claim is about order (read, feel, close, recall, re-study, recall later), not quantities.

## Visualisation
Six labelled pills and five arrows. Warn tone on "Feels known" (the 4 of 5 rating) and on "Gaps found"; good tone on the later recall; bad tone on the final rereading step. Every tone has a text outcome badge.

## Copy
- What this shows: a high rating next to a recall that misses two steps, and the loop that fixes them.
- Try this: 1. Before step 4, predict: will Lina write all five steps, or miss a step she followed while reading? (matches the chapter's predict) 2. At step 5, count how many steps she re-studies, and say why not all five.
- What changed: each step note says what Lina did and what it showed.
- Limits of the model: as in `limits`.

## Edge cases
Step 1 has no edge (start state). Step 7 revisits a state without an edge; the renderer shows the state with no active arrow. Long chips are kept under 25 characters.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole loop for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (two quiz items after the canvas: the next step after a high self-rating, and the next step after a recall with gaps).
- [ ] The model is tested (registry consistency and label-fit tests, run by the orchestrator after registration).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 3.2).

## Placement
Chapter 3.2, after the predict in "Lina closes the explanation" and before the paragraph on what it showed.

## Build plan
`frontend/src/canvas/close-it-and-recall/data.ts`, exporting `closeItAndRecall`. To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and the shared slug lists; covered by `frontend/tests/unit/canvas/registry.test.ts`.
