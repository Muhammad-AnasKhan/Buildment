---
artifact: canvas-spec
course: founder-interviews
chapter: 06.04-nerves-accent-and-time-to-think
slug: time-to-think
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Nour on a video call: time to think

## Teaching claim
On a video call, saying "Let me think for a moment" and asking "Do you mean...?" costs seconds and saves the answer. Rushing into the wrong question costs the answer. When the connection freezes, asking for the question again is better than guessing it.

## Why a canvas
The two versions of the same call only make sense side by side and in order. Stepping through shows the cost of the quick start and the small cost of the pause.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted arrow, the note, the outcome badge.
- Rule: two actors, Hiring manager and Nour. Eight steps: the question; version 1, answer at once (bad); the manager corrects her (warn); version 2, "let me think" (good); "do you mean...?" (good); the manager answers; a short story (good); a frozen connection and "say it again?" (good).
- Assumptions: the seconds are made up for the example.
- Limitations: no study shows how interviewers judge a request to repeat a question; this is course advice.

## Rendering
- Primary: the shared sequence renderer, two lanes. Arrow labels 18 characters or fewer.
- Static fallback: chapter 6.4 tells both versions in prose.

## Controls
Shared stepper controls. Each step's note ends with one short question that the next step answers ("Before you press Next: ..."), so the learner thinks before each step. The chapter prose does not retell Nour's call; its worked example uses a different question (Rana, "What would you do in your first week?").

## Visualisation
Two lanes and eight numbered arrows; tone and a text badge on the toned steps.

## Copy
- What this shows: the same question answered at once and with a pause and a check.
- Try this: 1. Compare the cost of the pause with the cost of the wrong answer. 2. Write one "Do you mean" question for your own call.
- Under the canvas in the chapter: two or three sentences.
- What changed: each step note says what the pause or the check saved.
- Limits of the model: as in `limits`.

## Edge cases
The last step is separate from the first scene: a weak connection later in the call.

## Accessibility
Shared stepper keyboard support and focus ring; the summary describes both versions.

## Acceptance criteria
- [x] The claim is testable: a quiz item in 6.4 gives a frozen call and asks for the best reply.
- [x] The model is tested: arrow labels and lane indexes in the course test.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/time-to-think/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
