---
artifact: canvas-spec
course: cause-and-effect
chapter: 01.03-the-single-cause-trap
slug: huda-causes-add-up
version: 1
owner: chapter-writer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: How many of the 20 missing orders does each cause explain?

## Teaching claim
Most outcomes have several causes working together. Checking each named cause against evidence, and giving it a size, shows that one person's single cause (the price) explains only a small part, while a cause with no evidence explains nothing so far.

## Why a canvas
The running count is the lesson. Stepping through the checks one at a time lets the learner watch the explained total grow and predict what the check on the heat will show before it appears.

## Model
- Inputs: none beyond the step controls.
- Outputs: the active arrow between lanes, the step note, outcome badge and chips with the running count.
- Rule: four lanes (Huda, Records, Customers, Oven); eight steps: write the size, school calendar (12), ask regulars, thermometer (dry cakes 4, total 16), price and a trip (2 and 1, total 19), the summer before (heat: no sign), the new shop (not shown), add it up (20 with 1 not known).
- Assumptions: the numbers of chapters 1.2 and 1.3.
- Limitations: customers' reasons are imperfect evidence; causes that work together are not shown by a simple count.

## Rendering
- Primary: the shared sequence renderer, narrow layout below `sm`.
- Arrow labels are at most 17 characters ("the summer before").
- Static fallback: chapter 1.3 gives the same checks as a table with the evidence for each cause.

## Controls
Shared stepper controls only (Back, Next, Play/Pause, Start over, numbered step chips). No numeric inputs: the claim is about order and evidence.

## Visualisation
Labelled pills or lanes with arrows from the shared renderer. Tones come from `primitives/tones.ts` only, and good, warn and bad always sit next to a text outcome badge.

## Copy
- What this shows: each cause checked against evidence, with a running count of the 20 missing orders it explains.
- Try this: 1. Before step 6, predict what the summer before shows about the heat. 2. At step 8, compare the biggest cause with the price.
- What changed: the chip under each step gives the new count of explained orders.
- Limits of the model: as in `limits`.

## Edge cases
Steps 1 and 8 are loops inside Huda's lane. Step 5 runs from Customers back to Huda. Warn tone with a text badge on the two causes with no evidence.

## Accessibility
Shared stepper keyboard support (arrow keys, Home, End) and the shared focus ring; `summary` gives the whole model for screen readers; tone is never the only signal. Reduced motion follows the renderer's rule.

## Acceptance criteria
- [x] The claim is testable: the quiz items after the canvas ask what to do first with a single claimed cause, and how many lost students a price cut could bring back.
- [ ] The model is tested (registry consistency and label-fit tests, once the orchestrator registers the slug).
- [x] The design is simple and legible (checked against the renderer geometry for the narrow and wide layouts).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter teaches the claim in prose).
- [x] Names, numbers and facts match the chapter exactly; no em or en dashes, idioms or brand names.

## Build plan
`packages/learning-ui/src/canvas/huda-causes-add-up/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
