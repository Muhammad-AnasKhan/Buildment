---
artifact: canvas-spec
course: founder-interviews
chapter: 05.03-the-founder-version
slug: founder-version-first
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Yazan's two answers to a founder

## Teaching claim
Give the founder version first: the problem in user terms, what you built in one sentence, the key choice and the result. Then let the listener ask for depth. A jargon answer gives a founder nothing to ask about except the words.

## Why a canvas
The chapter tells both answers in prose. Stepping through them in order shows the moment the founder stops following, and then the moment the founder asks a business question, which a flat table of two answers does not show.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted arrow, the step note, chips and an outcome badge.
- Rule: two actors, Founder and Yazan. Seven steps: the question, the jargon answer (bad), the founder cannot follow (warn), Yazan picks four parts, the founder version (good), the founder's business question, Yazan explains one term in use (good).
- Assumptions: the founder asks a helpful question at step 6.
- Limitations: one founder, one conversation, Yazan's own numbers.

## Rendering
- Primary: the shared sequence renderer, two lanes.
- Arrow labels are 18 characters or fewer (checked in the course test).
- Static fallback: chapter 5.3 writes both answers in prose before the canvas.

## Controls
Shared stepper controls only. The claim is about order, not quantities.

## Visualisation
Two lanes and seven numbered arrows. Tone: bad on the jargon answer, warn on the founder not following, good on the founder version and the final explanation, each with a text badge.

## Copy
- What this shows: the same work, told twice; the second telling lets the listener lead.
- Try this: 1. Say the four parts yourself before step 5. 2. At step 2, list the words a founder would need explained.
- What changed: each step note says what the founder can or cannot do next.
- Limits of the model: as in `limits`.

## Edge cases
Step 4 is a loop on Yazan's lane (thinking before he speaks). Long answers are in the note, not on the arrow.

## Accessibility
Shared stepper keyboard support and focus ring; the summary describes the whole flow; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable: quiz items in 5.3 ask for the first part to cut or add.
- [x] The model is tested: arrow labels and lane indexes checked in the course test.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/founder-version-first/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
