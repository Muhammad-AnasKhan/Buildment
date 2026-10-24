---
artifact: canvas-spec
course: founder-interviews
chapter: 02.03-find-your-numbers
slug: find-your-numbers
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Bilal looks for his numbers

## Teaching claim
When you never measured, the evidence often already exists in a source: the database, the logs, the support inbox or a bill. Ask one question per source and write each number with where it came from. A source that gives nothing becomes an honest gap with a plan.

## Why a canvas
The chapter lists the places to look. A sequence shows the order of the work: a question, permission, a count, a note with a source, a second source, and the one source that gave nothing. It makes the learner see that every path ends with something written down.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, the step note and chips ("ask your lead first", "124 / 2,480 = 5%", "source: payment log", "do not claim cost").
- Rule: four actors (You, The data, The people, Your notes); nine steps: the question, permission and a counts-only rule, the log before (124 of 2,480, 5%), the log after (52 of 2,600, 2%), the note with its source, the question to support, the inbox (19 before, 6 after), the cloud bill (no change, nothing to claim), the honest gap with a plan.
- Arithmetic check: 124 / 2,480 = 0.05 and 52 / 2,600 = 0.02 exactly.
- Assumptions: Bilal's lead agrees to counts only; four weeks on each side; the numbers are the case's own.
- Limitations: one developer's example; a before and after count is a hint, not proof. The chapter's rules apply: ask your lead first, use only data you may see, count and do not copy, never paste private data into the AI interviewer.

## Rendering
- Primary: the shared sequence renderer, four lanes.
- Arrow labels are 18 characters or fewer ("ask one question" is 16). Loops show work inside an actor.
- Static fallback: the chapter writes the same steps in prose after the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Four lanes with numbered arrows. Tone: good on the counts and the gap, warn on the bill that gave nothing, each with a text badge.

## Copy
- What this shows: one question per source, each answer written down with where it came from.
- Try this: 1. Before step 1, decide whether Bilal can still find a number if he never measured, then count how many sources gave him one. 2. At step 2, find the two rules Bilal followed before he read any data.
- What changed: the log gave two counts, the inbox two more, and the bill nothing to claim.
- Limits of the model: as in `limits`.

## Edge cases
Steps 1 and 5 use loops and a long arrow to the Notes lane; labels stay short for the narrow layout.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` describes the whole flow; no colour-only meaning.

## Acceptance criteria
- [x] The claim is testable (quiz items in 2.3 and 2.5 ask for the safe first step and the claim the sources support).
- [x] The model is checked by the registry and label-fit tests (run by the orchestrator).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 2.3).

## Build plan
`packages/learning-ui/src/canvas/find-your-numbers/data.ts` (export `findYourNumbers`), registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by the registry tests; preview at `/workspace/canvases`.
