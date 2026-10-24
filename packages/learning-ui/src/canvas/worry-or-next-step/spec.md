---
artifact: canvas-spec
course: faith-and-resilience
chapter: 01.02-what-only-allah-knows
slug: worry-or-next-step
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: From a worry loop to one step for today

- **Export:** `worryOrNextStep` in `data.ts`

## Teaching claim
Sorting what only Allah knows from what is yours to do turns a loop of worry into one step for today.

## Why a canvas
The chapter tells the sort in prose. Stepping through it one move at a time lets the learner see the loop, the list, the sort and the step as separate moves, and the last step returns to the loop to show what happens when the sort is skipped. A static diagram shows the shape but not the order of the moves.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states in a fixed snake (loop, list, only Allah knows, mine to do, today's step, step taken); five edges; seven steps, the last revisiting the loop as the outcome of skipping the sort.
- Facts from chapter 1.2: the client has been silent for 7 days; about 6 hours of power a day; six questions, five of them about the unseen; the follow-up is sent at 10:00; two proposals the next day. Sources named in notes: Quran 6:59.
- Assumptions: one person, one week, one step chosen for today.
- Limitations: real questions can be partly known; some steps take more than a day. The canvas measures nothing about faith or decree; it models the learner's own sorting and steps.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, right to left on row 1), so the narrow layout fits 340px.
- The edge between column 2 row 0 and column 2 row 1 is labelled "and" (three characters), because it turns sideways on phones with about 22px between the pills.
- Static fallback: chapter 1.2 walks through the same sort in prose and in a worked example before and after the canvas.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about the order of the moves, not about quantities.

## Visualisation
Six labelled pills and five arrows. Tone: good on "Step taken", bad on the last step back in the loop, each with a text outcome badge.

## Copy
- What this shows: one worrying week sorted into what only Allah knows and what is Yasmin's to do, ending in one step.
- Try this: 1. Recall the prediction about Rami and check it against step 4. 2. Match one question from step 3 with its part in step 4.
- What changed: each step note says which move was made and what it gave her.
- Limits of the model: as in `limits`.

## Edge cases
Step 7 revisits the first state without an edge; the renderer shows the state with no active arrow. State names are 16 characters or fewer. No Arabic script, no brand names, no dashes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole sort for screen readers; tone always has a text badge.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz asks which step is the learner's own in a new case).
- [ ] The model is tested (registry consistency and label-fit tests once registered).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose sort and worked example in 1.2).

## Build plan
`packages/learning-ui/src/canvas/worry-or-next-step/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
