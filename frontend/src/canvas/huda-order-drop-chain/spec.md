---
artifact: canvas-spec
course: cause-and-effect
chapter: 01.02-chains-of-cause-and-effect
slug: huda-order-drop-chain
version: 1
owner: chapter-writer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Why did Huda's orders drop?

## Teaching claim
A cause chain runs back from the effect, part by part. Each part has its own direct cause, and a direct cause can need two contributing causes together; you stop at a cause you can act on.

## Why a canvas
The chapter states the chain in prose. Stepping through it makes the learner say the next cause before it appears, and makes them decide whether the hot oven is the whole cause before the second contributing cause is shown. A static diagram shows everything at once and gives that answer away.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states. Row 0 runs from the effect to the school branch (no class parties, school holidays). Row 1 runs from the dry cakes to the two contributing causes (oven runs 20 degrees Celsius hot, old baking times). Five edges: four "why" and one "and" between the two contributing causes. Seven steps.
- Assumptions: the numbers of chapter 1.2: 20 of about 60 orders missing; 12 school, 7 regular, 1 new; 4 of the 7 regulars named dry cakes.
- Limitations: only the two biggest branches (16 of 20 orders); the price (2), the customer away (1) and the unknown new-customer order (1) are left out.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows. The edge from "20 orders missing" to "Cakes come out dry" is in one column, so its label is "why" (3 characters) for the sideways arrow on phones. The edge between the two contributing causes is labelled "and" to show they work together, not that one causes the other.
- No diagonal edges.
- Static fallback: chapter 1.2 walks through the same chain in prose, step by step, after the canvas.

## Controls
Shared stepper controls only (Back, Next, Play/Pause, Start over, numbered step chips). No numeric inputs: the claim is about order and evidence.

## Visualisation
Labelled pills or lanes with arrows from the shared renderer. Tones come from `primitives/tones.ts` only, and good, warn and bad always sit next to a text outcome badge.

## Copy
- What this shows: the two biggest parts of Huda's drop, each traced back to its causes.
- Try this: 1. Before step 6, decide whether the hot oven is the whole cause of the dry cakes; check at step 7. 2. At step 3, what can Huda still do about a cause she cannot change?
- What changed: each step names the cause found and the evidence for it (teachers' messages, school calendar, customer messages, oven thermometer).
- Limits of the model: as in `limits`.

## Edge cases
Steps 1 and 4 both light the effect, each with a different outgoing edge. Step 3 and step 7 have no edge; the renderer shows the state alone. Every name is 18 characters or fewer.

## Accessibility
Shared stepper keyboard support (arrow keys, Home, End) and the shared focus ring; `summary` gives the whole model for screen readers; tone is never the only signal. Reduced motion follows the renderer's rule.

## Acceptance criteria
- [x] The claim is testable: the quiz items after the canvas ask for a contributing cause and for a link the team can act on, on new cases.
- [ ] The model is tested (registry consistency and label-fit tests, once the orchestrator registers the slug).
- [x] The design is simple and legible (checked against the renderer geometry for the narrow and wide layouts).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the chapter teaches the claim in prose).
- [x] Names, numbers and facts match the chapter exactly; no em or en dashes, idioms or brand names.

## Build plan
`frontend/src/canvas/huda-order-drop-chain/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
