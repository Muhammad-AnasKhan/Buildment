---
artifact: canvas-spec
course: cause-and-effect
chapter: 02.03-reverse-cause-and-chance
slug: drift-back-to-normal
version: 1
owner: chapter-writer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: Did the free app lift the weakest students?

## Teaching claim
Cases picked for an unusually bad result usually move back toward normal on their own. Only a comparison group that started in the same place, without the change, shows how much of the rise the change caused.

## Why a canvas
The learner must commit to what happened to the group without the app before seeing it. Seeing both groups improve, side by side, is what makes the drift back to normal visible; a before-and-after number alone hides it.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow, step note, outcome badge and chips.
- Rule: four lanes (Rawan, Basel, App group, Other section); six steps: free app for the lowest 10, 8 of 10 improve, Rawan's claim, find a matching group, 7 of 10 improve without the app, compare.
- Assumptions: the numbers of chapter 2.3; the two sections have the same teacher and exams.
- Limitations: groups of 10; the sections are alike but not the same.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 13 characters.
- Static fallback: chapter 2.3 tells the same comparison in prose.

## Controls
Shared stepper controls only (Back, Next, Play/Pause, Start over, numbered step chips). No numeric inputs: the claim is about order and evidence.

## Visualisation
Labelled pills or lanes with arrows from the shared renderer. Tones come from `primitives/tones.ts` only, and good, warn and bad always sit next to a text outcome badge.

## Copy
- What this shows: two groups picked for low marks, one with the app and one without.
- Try this: 1. Before step 5, predict what happened to the group without the app. 2. At step 6, what can Basel tell Rawan?
- What changed: step 5 shows the group without the app improving too; step 6 shows the difference is one student.
- Limits of the model: as in `limits`.

## Edge cases
Steps 2 and 5 are loops inside a group's lane. Warn tone with text badges on steps 5 and 6.

## Accessibility
Shared stepper keyboard support (arrow keys, Home, End) and the shared focus ring; `summary` gives the whole model for screen readers; tone is never the only signal. Reduced motion follows the renderer's rule.

## Acceptance criteria
- [x] The claim is testable: the quiz items after the canvas ask for the best reply to a fix credited after a very bad month, and for the check that shows which way a cause runs.
- [ ] The model is tested (registry consistency and label-fit tests, once the orchestrator registers the slug).
- [x] The design is simple and legible (checked against the renderer geometry for the narrow and wide layouts).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter teaches the claim in prose).
- [x] Names, numbers and facts match the chapter exactly; no em or en dashes, idioms or brand names.

## Build plan
`packages/learning-ui/src/canvas/drift-back-to-normal/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
