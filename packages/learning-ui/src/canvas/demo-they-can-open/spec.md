---
artifact: canvas-spec
course: founder-interviews
chapter: 05.07-a-demo-they-can-open
slug: demo-they-can-open
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Two links to the same carpool app

## Teaching claim
A busy founder opens a demo only if it takes one click, and understands it only if sample data shows the core flow in about two minutes. A sign-up wall loses the founder. A guest login, made-up sample data and a short page with an honest list of what is not done keep the founder.

## Why a canvas
The chapter lists what to put in a demo. Stepping through the same founder meeting two links, in order, shows how the first minute decides the rest, which a list does not. Each step ends with a question that the next step answers.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted arrow, the step note, an outcome badge.
- Rule: three actors (Founder, Your link, Your app). Eight steps: open the first link; the sign-up form (warn); the email wall (bad, "founder leaves"); open the second link; guest login (good); the core flow in two minutes (good); the question about what is not done; the short page with gaps (good).
- Assumptions: the sample data (12 rides, 4 drivers, 3 riders) is made up and belongs to this example.
- Safe demo contract (said in the guest-login step and in the limits): made-up data only, never real users' data; each guest has their own session or space, or the demo resets on a schedule; guests get the least access, read-only where possible; no secrets in the demo.
- Limitations: one founder and one ten-minute window. Some projects cannot be hosted on a weak connection; then a recording and screenshots are the next best thing.

## Rendering
- Primary: the shared sequence renderer, three lanes. Arrow labels are 18 characters or fewer.
- Static fallback: chapter 5.7 tells both links in prose before the canvas.

## Controls
Shared stepper controls only.

## Visualisation
Three lanes and eight numbered arrows. The guest-login step states the safe demo contract in two plain sentences. Tone: warn on the sign-up form, bad on the email wall, good on the guest login, the core flow and the honest page.

## Copy
- What this shows: the same app opened through two links.
- Try this: 1. At step 3, count the steps between a stranger and the core flow of your own project. 2. At step 5, ask whether one demo login could show both kinds of users.
- Under the canvas in the chapter: two or three sentences, with no results stated.
- Limits of the model: as in `limits`.

## Edge cases
The last step shows the short page, so no private data appears in it. The sample data is said to be made up.

## Accessibility
Shared stepper keyboard support and focus ring; the summary gives the whole flow; tone has a text badge or a clear title.

## Acceptance criteria
- [x] The claim is testable: a quiz item in 5.7 asks which package works for a ten-minute founder.
- [x] The model is tested: arrow labels and lane indexes in the course test.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists in the chapter prose.

## Build plan
`packages/learning-ui/src/canvas/demo-they-can-open/data.ts`. The orchestrator registers the slug and the export line. Covered by the registry test and `frontend/tests/unit/canvas/founder-interviews-c-canvases.test.ts`.
