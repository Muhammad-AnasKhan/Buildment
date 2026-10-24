---
artifact: canvas-spec
course: build-with-ai
chapter: 01.04-help-or-harm
slug: answers-or-hints
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Answers or hints: same AI, two results

## Teaching claim
The same AI used two ways: asking for answers raises practice scores but leaves you weaker alone; asking for hints and checking your own steps keeps the learning.

## Why a canvas
The chapter's worked example shows one problem asked two ways, and its studies section reports the evidence in prose. The canvas puts two whole practice paths side by side and holds back the test results until the learner has seen both practice scores, so the learner commits to a prediction and then sees the practice score and the test score point in opposite directions. A static table gives all four numbers at once and removes the prediction.

## Model
- Inputs: none beyond the shared step controls.
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: two rows, three states each. Answers row: Ask for answer, Copy, Exam alone. Hints row: Ask for a hint, Try it yourself, Exam alone. Four edges, all left to right within a row. Seven steps: both practice paths first, then both tests, then a closing step.
- Numbers (the fellow's example, stated as such in the chapter and in `limits`): Kinan 20 of 20 in practice in about 2 hours, 9 of 20 in the test; Lubna 14 of 20 in practice in about 4 hours, 15 of 20 in the test.
- Grounding: the pattern follows the Bastani et al. study only as the dossier phrases it (C1): a normal AI chat raised practice scores and lowered exam scores without it; a hint version did not cause that harm. The canvas does not present its numbers as study data, and `limits` says the hint version in the study showed no clear exam gain.
- Limitations: one made-up example; real results vary by person, subject and test.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, one row per way of using the AI. No edges between rows, no diagonals, no loops.
- Edge labels: "answer given" (12), "practice done" (13), "one hint" (8), "practice done" (13), all within 14 characters. In the narrow layout the two rows become two columns of vertical edges; row 0 labels sit at x 80 to about 176 and row 1 labels at x 230 to about 326, so they never meet.
- Static fallback: chapter 1.4 states all four numbers in prose after the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Six pills, four arrows. Tones: warn with "20 of 20" on Kinan's practice (a high score that measures the AI's work), bad with "9 of 20" on his test, good with "15 of 20" on Lubna's test. Lubna's practice has the badge "14 of 20" with no tone.

## Copy
- What this shows: two practice paths with the same tool, and what each practice score did and did not predict.
- Try this:
  1. Steps 5 and 6 answer the prediction above the canvas: compare each test score with the same person's practice score in steps 2 and 4. (Points at the answering steps; does not repeat the predict.)
  2. Which practice score told you more about the test, and why?
  3. What would change on Kinan's row if he closed each answer and then redid the problem alone?
- What changed: each step note gives the practice or test result and what the fellow did.
- Limits of the model: as in `limits`.

## Edge cases
- Two states share the name "Exam alone"; their ids differ and their row tells them apart.
- Steps 2, 4 and 7 light a state with no edge.
- Every number matches chapter 1.4 exactly.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both paths and all four numbers for screen readers; tones always have a text badge.

## Acceptance criteria
- [x] The claim is testable: the quizzes after the canvas ask for a fair one-sentence report of the study and transfer the claim to a shop owner learning spreadsheet formulas.
- [x] The model is tested: registry consistency, label-fit and label-overlap tests, once registered.
- [x] The design is simple and legible: two parallel rows.
- [x] Prediction before (chapter predict, first line of `tryThis`), transfer check after.
- [x] Reader fallback exists: the prose in chapter 1.4.

## Build plan
`frontend/src/canvas/answers-or-hints/data.ts`, export `answersOrHints` (StateMachineSpec). To be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.

## Placement
Chapter 1.4, section "Kinan and Lubna's test", after the predict and before "What the studies found".
