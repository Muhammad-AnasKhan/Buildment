---
artifact: canvas-spec
course: founder-interviews
chapter: 06.02-strengths-with-evidence
slug: broad-to-narrow-strength
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Nour's strength: from broad to checkable

## Teaching claim
A broad strength ("I am a good designer") cannot be checked. A narrow one ("I turn messy client feedback into one clear list of changes") can, with a recent example and something another person said or saw. People judge narrow skills more accurately than broad ones.

## Why a canvas
Narrowing is a sequence of questions: which part, what exactly, when, who saw it. Stepping through the questions shows the claim getting shorter to check and longer to prove, and the last step shows what to do when no one has said anything yet.

## Model
- Inputs: none beyond the step controls.
- Outputs: the lit state, the active edge, the note and chips.
- Rule: six states in a snake, five edges, seven steps. Step 1 is tone bad (cannot be checked), step 3 and 6 are tone good, step 7 revisits "Seen by others" with tone warn (an honest gap).
- Assumptions: the numbers (14 comments, 5 changes, 3 clients) are the case's own.
- Limitations: some strengths are hard to narrow.

## Rendering
- Primary: the shared state-machine renderer, 3 columns by 2 rows.
- State names 18 characters or fewer; edge labels 14 characters or fewer; the edge between the two states in the last column is "and" (3 characters).
- Static fallback: chapter 6.2 tells the same steps in prose.

## Controls
Shared stepper controls. Each step's note ends with one short question that the next step answers ("Before you press Next: ..."), so the learner thinks before each step. The chapter prose does not retell Nour's steps; its worked example uses a different case (Wael, a support lead).

## Visualisation
Six pills and five arrows, with a text badge on each toned step.

## Copy
- What this shows: one strength narrowed until it can be checked.
- Try this: 1. Write your own broad strength and narrow it with the same two questions. 2. Say why an honest gap beats a quote you invented.
- Under the canvas in the chapter: two or three sentences.
- What changed: each note says what the interviewer can now check.
- Limits of the model: as in `limits`.

## Edge cases
Step 7 reuses a state without a new edge. No hex colours, no dashes.

## Accessibility
Shared stepper keyboard support and focus ring; the summary describes the whole path.

## Acceptance criteria
- [x] The claim is testable: the quiz in 6.2 asks which strength statement an interviewer could check.
- [x] The model is tested: geometry and label-fit in the course test.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/broad-to-narrow-strength/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
