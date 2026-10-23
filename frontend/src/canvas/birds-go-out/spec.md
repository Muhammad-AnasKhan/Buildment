---
artifact: canvas-spec
course: faith-and-resilience
chapter: 02.02-what-tawakkul-is
slug: birds-go-out
version: 1
owner: interaction-designer
renderer: state-machine (HTML controls, inline SVG states)
---

# Canvas spec: Two ways tawakkul goes wrong, and the birds

- **Export:** `birdsGoOut` in `data.ts`

## Teaching claim
Trust without means and means without trust both fail; the birds trust and go out.

## Why a canvas
The chapter names two opposite mistakes and one right way. Placing them as three paths from one need, with the two failures on the outside and the birds in the middle, lets the learner step through each path and see where it ends. A list of definitions does not show that the two mistakes are opposites with the right way between them.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the highlighted state, the active edge, the step note and chips.
- Rule: six states. "A real need" sits in the middle of the top row. Way 1 goes left ("Trust, no means", then "Stuck, asking" below it). Way 2 goes right ("Means, no trust", then "Worn out" below it). The third way goes straight down to "Birds go out". Six steps: the need, way 1 and its end, way 2 and its end, the birds.
- Facts from chapter 2.2: Khalil's interview on Thursday at 10:00 for 60 minutes; notes read until 02:00; power group checked every hour; three bad nights. Sources in notes: Sahih al-Bukhari 1523, Quran 2:197, Jami' at-Tirmidhi 2344.
- Assumptions: the three ways are shown as clean paths.
- Limitations: real people mix the two mistakes; the canvas measures nobody's trust.

## Rendering
- Primary: the shared state-machine renderer.
- Grid: 3 columns by 2 rows. The three edges that cross rows in one column are labelled "so", "so" and "or" (two characters each), because they turn sideways on phones with about 22px between the pills. No diagonal edges.
- Static fallback: chapter 2.2 tells the pilgrims, Khalil's week and the birds hadith in prose, and a mermaid diagram shows the heart and the hands.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about three paths, not quantities.

## Visualisation
Six labelled pills and five arrows. Tone: bad on "Stuck, asking" and "Worn out", good on "Birds go out", each with a text outcome badge.

## Copy
- What this shows: one need, met three ways, and where each way ends.
- Try this: 1. At step 6, check the prediction (what the birds do each morning). 2. Compare steps 3 and 5: what is missing in each?
- What changed: each step note says what the person does and what it leads to.
- Limits of the model: as in `limits`.

## Edge cases
The first step has no edge. State names are 15 characters or fewer. No Arabic script, no brand names, no dashes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives all three ways for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks the learner to name which way a new person has gone wrong).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and worked example in 2.2).

## Build plan
`frontend/src/canvas/birds-go-out/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
