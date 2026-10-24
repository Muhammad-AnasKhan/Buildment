---
artifact: canvas-spec
course: founder-interviews
chapter: 03.02-how-a-why-chain-works
slug: resume-line-why-chain
version: 2
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Five whys on one resume line

## Teaching claim
A why chain on a resume line is strong when it ends at a decision you made or a fact you checked, and it breaks when it ends at blame, at a guess, or at a reason you cannot support.

## Why a canvas
The chapter tells Iyad's chain in prose. Stepping through it one why at a time makes the learner predict where it will stop. The last two steps put two broken chains next to the strong one, on the same boxes, which a single static diagram cannot do.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states named for the role of each why (the line, reason to start, cause found, options weighed, number and source, honest limit); five "why" edges; eight steps. Steps 1 to 6 are Iyad's chain (a bus times app: about 10 seconds to about 6 seconds on the cheapest test phone, the middle of ten runs each time), step 7 revisits "Cause you found" as a chain that ends at blame, step 8 revisits it as Karam's chain breaking at the second why.
- Assumptions: one chain only; every answer in the strong chain has a stated source.
- Think before each step (revision 1): every note except the last ends with one short question that the next step answers, so the learner predicts before pressing Next.
- Limitations: real problems have several causes; five is a habit; we did not find a study that tested the five whys as an interview method.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back right to left on row 1), as in the cause-and-effect five-whys canvas.
- The one edge between two states in the same column uses the 3 character label "why", so it fits on a phone.
- Static fallback: the chain is written out in the chapter before and after the canvas.

## Controls
Shared stepper controls only. The claim is about order and evidence, not quantities.

## Visualisation
Six labelled pills and five arrows. Tone good on the honest-limit step, bad on the two broken-chain steps, each with a text outcome badge.

## Copy
- What this shows: one resume line asked five whys, and two chains that break.
- Try this: 1. Predict where Iyad's chain stops before step 6. 2. At step 8, find one honest sentence Karam could say at why 2. The chapter does not retell the steps; it summarises the chain in one paragraph.
- What changed: each step note says what the answer was and where it came from.
- Limits of the model: as in `limits`.

## Edge cases
Steps 7 and 8 revisit an earlier state without an edge, so the renderer shows the state with no active arrow. State names are 17 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole chain for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas asks where a chain stops).
- [x] The model is tested by the registry label-fit test once registered.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chain is in prose in 3.2).

## Build plan
`packages/learning-ui/src/canvas/resume-line-why-chain/data.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`.
