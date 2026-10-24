---
artifact: canvas-spec
course: founder-interviews
chapter: 01.02-one-time-not-usually
slug: story-or-usually
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: From 'usually' to one time

## Teaching claim
There are three kinds of answer to "Tell me about a time...": a self-description, a pseudo-story and a story. Each weaker kind draws the probe "Can you give me an example?" or "Which time?" and costs a turn; a story carries its own evidence, so the next "why?" has something to hold.

## Why a canvas
The chapter tells the difference in prose. Stepping through Samer's answer one turn at a time makes the learner see the cost of each weaker answer in turns, and lets them predict the founder's next question before it appears. A static table of three answer types would hide the order and the cost.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips (turn counter, "no day", "source: call sheet").
- Rule: six states (the question, self-description, pseudo-story, "Which time?", a story, "Can be checked"); five edges; six steps. The edge into "a story" is labelled "one time".
- Assumptions: the founder probes every answer that has no one day; the numbers (about 12 and about 5 address calls a week, from the dispatch call sheet) are the case's own and match chapters 1.1 and 1.4.
- Limitations: real interviewers differ, and some accept a habit and move on. Dossier finding 5 (Bangerter and colleagues, 62 recorded interviews, 23 percent stories) is given in the chapter prose, not in the canvas.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake: row 0 left to right (question, self-description, pseudo-story), row 1 right to left ("Which time?", a story, "Can be checked").
- Edge labels: at most 14 characters. The only edge between two states in the same column (pseudo-story to "Which time?") has the label "ask" (3 characters), as the phone layout needs.
- State names are 18 characters or fewer ("Self-description" is 16).
- Static fallback: the chapter tells the same sequence in prose before the canvas.

## Controls
Shared stepper controls only. The claim is about order and cost, not quantities.

## Visualisation
Six labelled pills and five arrows. Tone: warn on the self-description and the pseudo-story, good on the story and the "Can be checked" step, each with a text outcome badge.

## Copy
- What this shows: three kinds of answer to the same question, and the follow-up each one draws.
- Try this: 1. At step 3, check the prediction made above the canvas ("Whenever dispatch complained, I checked the logs first": a habit). 2. Count the turns Samer spent before his first real answer.
- What changed: each step says what the founder can check.
- Limits of the model: as in `limits`.

## Edge cases
Step 6 has no outgoing edge; the renderer shows the last state with no active arrow. Long sub-lines are kept short for the phone layout.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole sequence for screen readers; tone always has a text badge. No colour-only meaning.

## Acceptance criteria
- [x] The claim is testable (quiz items in 1.2 and 1.5 ask for the story among habit answers).
- [x] The model is tested (registry consistency and label-fit tests, run by the orchestrator).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 1.2).

## Build plan
`packages/learning-ui/src/canvas/story-or-usually/data.ts` (export `storyOrUsually`), registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
