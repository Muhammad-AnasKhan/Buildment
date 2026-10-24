---
artifact: canvas-spec
course: cause-and-effect
chapter: 08.02-blameless-reviews
slug: review-without-blame-steps
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: A review without blame, step by step

## Teaching claim
A review without blame moves in a fixed order: a timeline of facts, the impact, causes in steps, tools and information, actions that each have one owner and one date, and a check later. A cause that ends at a person is refused, because it changes nothing in the system.

## Why a canvas
The chapter teaches the parts as a list and then works the case in prose. A lifecycle with a refused move ("who did it?") shows the one wrong turn as a request the review says no to, which a list cannot show.

## Model
- Inputs: none beyond the step controls.
- Outputs: the highlighted state, the active edge, note, chips and badge.
- Rule: six states (timeline, impact, causes, actions, owner and date, check later); five transitions and one refused loop on "Causes"; seven steps.
- Assumptions: the Young Coders Club case of chapters 8.1 and 8.2 (about 140 lost, 95 back, about 45 not reached; three branches of causes; owners Wael, Nadia and Ruba).
- Limitations: honest mistakes only; deliberate or reckless harm is handled separately, as the chapter explains.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake. The edge inside column 2 ("Causes" to "Actions") is labelled "fix", three characters.
- The refused loop uses `kind: "rejected"` on "Causes".
- Static fallback: chapter 8.2 lists the parts and works the whole review in prose and a timeline table.

## Controls
Shared stepper controls only.

## Visualisation
Bad on the refused blame cause, good on the final check, each with a text badge.

## Copy
- What this shows: the order of a review and the one move it refuses.
- Try this: 1. Before step 3, predict which cause statement the review keeps (matches the chapter's predict). 2. At step 6, which action would still happen if nobody owned it?
- What changed: each note says what the review adds at that step.
- Limits of the model: as in `limits`.

## Edge cases
Step 4 stays on "Causes" with no active edge; the renderer shows the state without an arrow.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole review; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks which action is ready to go into a review, on a new case).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and timeline table in 8.2).

## Build plan
`packages/learning-ui/src/canvas/review-without-blame-steps/data.ts`, to be registered by the orchestrator in `registry.ts` and `slugs.ts`; covered by the registry test; preview at `/workspace/canvases`.
