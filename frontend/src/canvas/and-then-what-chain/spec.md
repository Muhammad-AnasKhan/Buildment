---
artifact: canvas-spec
course: cause-and-effect
chapter: 07.02-and-then-what
slug: and-then-what-chain
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: And then what? One branch of Hamza's map

## Teaching claim
The order of an effect is its place in the chain: a first effect comes straight from the decision, a second effect is the effect of that effect, and a third effect is further away again and harder to notice. A chain of effects can turn into a loop that feeds itself.

## Why a canvas
The chapter states the definition in prose. Stepping one link at a time makes the learner ask "then what?" before each link appears, and the loop back to "Jawad rushes" is easier to see when it lights up after the third effect than in a static drawing of the whole map.

## Model
- Inputs: none beyond the step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states (decision, first, second and third effect, loop, watch plan); six edges, one of them the loop back from "Queue grows" to "Jawad rushes"; six steps.
- Assumptions: one branch of the map (Jawad); each link is the easiest path for the people involved.
- Limitations: the other branches (customers, other shops, Hamza) are left to the chapter's prose and Mermaid diagram; every link is a guess to watch.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, back on row 1).
- Edges inside one column ("Small mistakes" to "Bicycles come back", "Queue grows" to "Jawad rushes") are labelled "so", two characters, because they become short sideways arrows on a phone.
- Static fallback: chapter 7.2 tells the Jawad branch in prose and draws the full map, with all four groups, in Mermaid.

## Controls
Shared stepper controls only. The claim is about order, not quantities.

## Visualisation
Six labelled pills. Tone: warn on the second effect, bad on the third effect and the loop, good on the watch plan, each with a text outcome badge.

## Copy
- What this shows: one branch of a consequence map, link by link.
- Try this: 1. Before step 2, predict which group reacts first: Jawad or the other shops (matches the chapter's predict). 2. At step 4, why is a third effect harder to notice?
- What changed: each note names the link and why it follows from the one before.
- Limits of the model: as in `limits`.

## Edge cases
The loop edge points back to a state already visited; the renderer draws it as a normal transition. Names are 18 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole chain for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks for a second-order effect on a new case).
- [x] The model is tested (registry consistency and label-fit tests).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and Mermaid in 7.2).

## Build plan
`frontend/src/canvas/and-then-what-chain/data.ts`, to be registered in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts` by the orchestrator; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
