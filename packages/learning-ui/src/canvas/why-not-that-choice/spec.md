---
artifact: canvas-spec
course: founder-interviews
chapter: 05.05-why-this-and-not-that
slug: why-not-that-choice
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Why this service, and why not that one?

## Teaching claim
A choice holds under "why not that?" when you can name the need it served, the option you rejected and why, how hard the choice is to undo, and when you would look at it again. "It is popular" is a label, and it ends at the next why. A short decision note written at the time makes the first answer easy.

## Why a canvas
The chapter teaches the six parts in prose and a table. Stepping through one conversation twice, first with a label and then with the note, shows where the first answer fails and which part of the note answers each follow-up. Each step ends with a question that the next step answers, so the learner thinks before reading.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted arrow, the step note, an outcome badge.
- Rule: three actors (Technical founder, Candidate, Decision note). Nine steps: the question; the label answer (bad); the next why (warn); open the note; the need and options (good); the rejected option (good); the cost-to-undo question; the estimate (good); the revisit trigger (good, "the choice holds").
- Assumptions: the numbers ($50, 5,000 users, 3 days, 2 places) belong to this example.
- Limitations: one conversation. The test is fit to the need and knowing the cost, not agreement with the founder.

## Rendering
- Primary: the shared sequence renderer, three lanes. Arrow labels are 18 characters or fewer.
- Static fallback: chapter 5.5 teaches the six parts in prose and in a table before the canvas.

## Controls
Shared stepper controls only. The claim is about order and evidence, not quantities.

## Visualisation
Three lanes and nine numbered arrows. Tone: bad on the label answer, warn on the next why, good on the answers that rest on the note, each with a text badge where it means an outcome.

## Copy
- What this shows: the same choice defended twice, once with a label and once with a note.
- Try this: 1. Say your first sentence at step 1 before you press Next. 2. At step 2, decide whether "it is what I knew" would be better than "it is popular".
- Under the canvas in the chapter: two or three sentences, with no results stated.
- Limits of the model: as in `limits`.

## Edge cases
Step 2 is a loop on the candidate's lane (thinking before speaking). The last step is an arrow from the note to the founder, across the candidate lane.

## Accessibility
Shared stepper keyboard support and focus ring; the summary gives the whole flow; tone always has a text badge or a clear title.

## Acceptance criteria
- [x] The claim is testable: quiz items in 5.5 and 5.8 give a case and ask which answer holds.
- [x] The model is tested: arrow labels and lane indexes in the course test.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/why-not-that-choice/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
