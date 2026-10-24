---
artifact: canvas-spec
course: cause-and-effect
chapter: 02.02-hidden-third-factors
slug: basel-third-factor-split
version: 1
owner: chapter-writer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Where did the 9-mark gap come from?

## Teaching claim
Comparing like with like can expose a hidden third factor: inside the group of students who study a lot, app users and others score the same, so most of the gap came from who uses the app. A small gap in a small group is a hint at most.

## Why a canvas
The learner must predict the result inside one group before seeing it. Stepping from the whole class into each group, then counting who is in it, shows how a mix of groups makes a gap that is not there inside any group.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states. Row 0: whole class (77 against 68), study 10+ hours (80 against 80), who studies a lot (15 users, 4 others). Row 1: study less (68 against 65), only 5 users (a hint at most), hard work (pushes both). Five edges; seven steps.
- Assumptions: the numbers of chapter 2.2 (40 students, 20 users and 20 others).
- Limitations: one measured factor only; study hours are self-reported.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 by 2. Two edges run inside one column (whole class to study less, who studies a lot to hard work); their labels are "<10" and "why", 3 characters each, for the sideways arrows on phones. No diagonal edges.
- Static fallback: chapter 2.2 gives the same numbers in a table with the arithmetic checked.

## Controls
Shared stepper controls only (Back, Next, Play/Pause, Start over, numbered step chips). No numeric inputs: the claim is about order and evidence.

## Visualisation
Labelled pills or lanes with arrows from the shared renderer. Tones come from `primitives/tones.ts` only, and good, warn and bad always sit next to a text outcome badge.

## Copy
- What this shows: the class split by study hours, compared like with like.
- Try this: 1. Before step 2, predict how the two groups compare among heavy studiers. 2. At step 3, check the averages.
- What changed: the gap of 9 becomes 0 among heavy studiers and 3 among light studiers, and the count shows why.
- Limits of the model: as in `limits`.

## Edge cases
Step 4 and step 7 light a state with no edge. Good tone only on the third factor step, with a text badge; warn tone on the small group step.

## Accessibility
Shared stepper keyboard support (arrow keys, Home, End) and the shared focus ring; `summary` gives the whole model for screen readers; tone is never the only signal. Reduced motion follows the renderer's rule.

## Acceptance criteria
- [x] The claim is testable: the quiz items after the canvas ask for the hidden third factor in a new case and for the check that compares like with like.
- [ ] The model is tested (registry consistency and label-fit tests, once the orchestrator registers the slug).
- [x] The design is simple and legible (checked against the renderer geometry for the narrow and wide layouts).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter teaches the claim in prose).
- [x] Names, numbers and facts match the chapter exactly; no em or en dashes, idioms or brand names.

## Build plan
`packages/learning-ui/src/canvas/basel-third-factor-split/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
