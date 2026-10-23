---
artifact: canvas-spec
course: building-habits
chapter: 03.02-context-cues
slug: khaled-evening-cues
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Khaled's evening: a chain of cues

## Teaching claim
A chain of context cues (the end of the shift, the sofa, the phone in hand) runs an evening; changing one early link (where Khaled goes when the shift ends) changes the cue for the rest of the chain.

## Why a canvas
The chapter describes the chain in prose. Stepping through it link by link lets the learner name each cue as it arrives, and then see the second row replace the first after one early change. A static diagram shows both chains at once and hides the order, which is the point.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note, chips and outcome badge.
- Rule: six states on a 3 by 2 grid. Row 0 is the old chain (shift ends, sits on the sofa, phone in hand). Row 1 is the new chain (stays at the table, book is open, studies 20 min). Five edges: two "then" edges on each row and one "new" edge from "Shift ends" to "Stays at the table". Eight steps: three on the old chain, one that tries to stop at the last link ("Phone in hand", ends 23:50), three on the new chain, and a last step that revisits "Sits on the sofa" when the shift runs late.
- Assumptions: the chapter's case numbers (shift ends 22:00, scrolling until 00:30, studies 20 minutes, 4 of 5 work evenings in the first week). Numbers belong to the example.
- Limitations: real evenings have more cues; people cues can still pull Khaled back; old chains return when their first cue returns.

## Rendering
- Primary: the shared state-machine renderer.
- Why this renderer: the claim is about a sequence of states and which transition starts the rest; no numeric inputs.
- Grid: 3 columns by 2 rows. The only edge inside one column ("Shift ends" to "Stays at the table") has the three-character label "new", because on phones it becomes a short sideways arrow. No diagonals.
- Controls: shared stepper controls only.
- Static fallback: the chapter lists the cues and the new chain in prose (the worked example, steps 1 to 5) before and after the canvas.

## Controls
Shared stepper controls only. No sliders: the claim is about order and the first link, not quantities.

## Visualisation
Six labelled pills and five arrows. Tone: bad on the scrolling step (badge "00:30"), warn on the last-link attempt (badge "23:50"), good on the study step (badge "4 of 5"), warn on the last step (badge "old chain"), each with a text badge so colour is never the only signal.

## Copy
- What this shows: a chain of context cues that runs Khaled's evening, and a new chain that starts when he changes where he goes at 22:00.
- Try this:
  1. Check the prediction: compare step 4 (stopping at the last link) with step 5 (changing the first link); which cues never appear after step 5?
  2. At the last step, name the cue that pulled Khaled back: a place, a time, people or an action?
- What changed: each step note names the cue it adds; step 6 says the sofa and the phone still come, but after the study.
- Limits of the model: as in `limits`.

## Edge cases
Each step lights the arrow that led into its state. Steps 1, 4 and 8 have no edge (the start of the chain and two revisits); the renderer shows the state with no active arrow. State names are 18 characters or fewer; edge labels are 4 characters or fewer.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both chains for screen readers; tone always has a text badge; reduced motion handled by the shared renderer.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas asks the learner to find the cue in Mazen's notes).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] The design is simple and legible.
- [x] Prediction before (which change does more), transfer check after.
- [x] Reader fallback exists (worked example in chapter 3.2).

## Build plan
`frontend/src/canvas/khaled-evening-cues/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
