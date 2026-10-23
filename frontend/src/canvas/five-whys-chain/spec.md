---
artifact: canvas-spec
course: cause-and-effect
chapter: 04.03-five-whys
slug: five-whys-chain
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Five whys: why are the deliveries late?

## Teaching claim
Asking "why?" again and again, with evidence at each step, leads from a symptom to a cause in a process you can change; a chain that stops at a person to blame fixes nothing.

## Why a canvas
The chapter tells the chain in prose. Stepping through it one why at a time makes the learner predict the next cause before seeing it, and the last step puts the blame chain next to the real one, which a single static diagram flattens.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states in a fixed chain (problem, four intermediate causes, root cause); five "why" edges from effect to cause; seven steps, the last revisiting "Rider leaves late" as the blame stop.
- Assumptions: one chain only; each why is supported by a stated piece of evidence.
- Limitations: real problems can have several chains; "five" is a habit, not a rule.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back right to left on row 1), so the narrow layout fits 340px.
- Edge label "why" is three characters: the edge from column 2 row 0 to column 2 row 1 becomes horizontal on phones, where the gap between pills is only about 22px.
- Static fallback: the chain is written out in prose in chapter 4.3 before the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about order and evidence, not quantities.

## Visualisation
Six labelled pills and five arrows. Tone: good on the root cause step, bad on the blame step, each with a text outcome badge.

## Copy
- What this shows: one problem traced back through five whys.
- Try this: 1. Predict the root cause before step 6. 2. Would a sixth why still lead to something the shop can change?
- What changed: each step note says which cause was found and the evidence for it.
- Limits of the model: as in `limits`.

## Edge cases
Step 7 revisits an earlier state without an edge; the renderer shows the state with no active arrow. Long names are kept to 18 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole chain for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas asks where a chain went wrong).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose chain in 4.3).

## Build plan
`frontend/src/canvas/five-whys-chain/data.ts`, registered in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
