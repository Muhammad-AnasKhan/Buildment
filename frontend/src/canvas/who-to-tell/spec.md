---
artifact: canvas-spec
course: faith-and-resilience
chapter: 07.03-caring-for-body-and-mind
slug: who-to-tell
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Who to tell when it gets heavy

## Teaching claim
When you are overwhelmed, the next step is a real person: someone you trust, your mentor or the fellowship coordinator, and a doctor or counsellor; carrying it alone only makes it heavier.

## Why a canvas
The lesson is a route with a fork at the very first step. A static list of contacts hides that the hardest move is the first one ("tell anyone?"). Stepping through the two roads from the same heavy weeks lets the learner predict the first step before seeing it, watch the silent road go nowhere, and see each person on the other road do a different job (listen, cut the load, treat).

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note, outcome badge and chips.
- Rule: six states on a 3 by 2 grid. Row 0: Heavy for weeks, Someone you trust, Your mentor. Row 1: Carry it alone, A plan with care, Doctor, counsellor. Five edges: heavy to trust ("yes"), heavy to alone ("no"), trust to mentor ("also tell"), mentor to doctor ("yes"), doctor to plan ("plan care"). Seven steps; step 7 revisits "Someone you trust" with no edge, to show the first step is always still open.
- Assumptions: Yasmin's facts match chapters 7.1 and 7.3 exactly (three weeks, four or five hours of sleep, Mariam, Reem, the clinic, power from 20:00 to 02:00, sleep from about 00:30 to 07:30).
- Limitations: one order that often works; people may tell their mentor first. The canvas never diagnoses, never names a treatment and says nothing about medication (dossier: scholars differ; out of scope). It never describes self-harm.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows, a snake (left to right on row 0, down column 2, right to left on row 1), like `five-whys-chain`.
- Same-column edges carry labels of three characters or fewer ("no" in column 0, "yes" in column 2), because they become short sideways arrows on a phone. Other labels are 9 characters or fewer.
- No diagonal edges.
- State names are 18 characters or fewer ("Doctor, counsellor" is the longest).
- No Arabic script and no brand, app or service names.
- Static fallback: chapter 7.3 describes both roads and the worked example in prose.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about who to tell and in what order, not about amounts.

## Visualisation
Six labelled pills and five arrows. Tone `bad` with the text badge "heavier" on the silent road; tone `good` with text badges on the first step, the plan and the final "still open" step.

## Copy
- What this shows: two roads from the same heavy weeks, and who each person on the second road helps with.
- Try this: 1. Check the chapter's prediction before step 3. 2. At step 5, who does what in the plan?
- What changed: each step note says who Yasmin told, what they did, and the source behind it.
- Limits of the model: as in `limits`, which also carries the course's contact sentence.

## Edge cases
Step 1 has no edge (the starting state). Step 7 revisits a state with no active arrow. The contact sentence appears in `limits` and in the chapter, so it is present even if the canvas fails to load.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives both roads for screen readers; every tone has a text badge.

## Acceptance criteria
- [x] The claim is testable (the second quiz item in 7.3 asks for the next step in a new case, Salma).
- [x] The model is tested (registry consistency and label-fit tests, once the slug is registered).
- [x] The design is simple and legible.
- [x] Prediction before (Yasmin's first step), transfer check after.
- [x] Reader fallback exists (prose in 7.3).

## Build plan
`frontend/src/canvas/who-to-tell/data.ts` (export `whoToTell`), to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
