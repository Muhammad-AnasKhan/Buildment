---
artifact: canvas-spec
course: founder-interviews
chapter: 05.04-the-engineer-version
slug: engineer-depth-ladder
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: The engineer's ladder: Yazan's report job

## Teaching claim
An engineer goes down a ladder of follow-ups: what you built, why this way, why not the other way, what happens if it fails, how you tested it, what you would change. Each rung needs a decision or a test you can name, or an honest "I did not test that" with what you would do.

## Why a canvas
The ladder is an order. Stepping down it one rung at a time lets the learner try to answer each question before the note shows Yazan's answer, which a list of questions does not make them do.

## Model
- Inputs: none beyond the step controls.
- Outputs: the lit state, the active edge, the note and chips.
- Rule: six states in a snake (three across the top row, three back along the bottom row); five edges; six steps, one per rung.
- Assumptions: each answer uses only Yazan's facts from the chapter.
- Limitations: real engineers ask in other orders and ask other questions.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows. State names are 18 characters or fewer. Edge labels are 14 characters or fewer. The edge between two states in the same column ("if") is 2 characters.
- Static fallback: chapter 5.4 writes the six answers in prose.

## Controls
Shared stepper controls.

## Visualisation
Six pills and five arrows. Tone good on the trade-off rung and on the honest-gap rung, each with a text badge.

## Copy
- What this shows: six follow-up questions and what each one needs.
- Try this: 1. Name the option Yazan did not choose at rung 3. 2. Say why the answer at rung 5 is strong even without a test.
- What changed: each step note names the decision, the test or the gap.
- Limits of the model: as in `limits`.

## Edge cases
The last rung has no outgoing edge. Apostrophe in "What I'd change" is plain text.

## Accessibility
Shared stepper keyboard support and focus ring; the summary describes the ladder; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable: the quiz in 5.4 asks which answer to a "what if" question is honest.
- [x] The model is tested: geometry and label-fit in the course test.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/engineer-depth-ladder/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
