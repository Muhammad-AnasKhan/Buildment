---
artifact: canvas-spec
course: faith-and-resilience
chapter: 01.04-qadr-and-effort
slug: act-not-if-only
version: 1
owner: interaction-designer
renderer: sequence (HTML controls, inline SVG lanes)
---

# Canvas spec: After a setback: "if only" or the next step

- **Export:** `actNotIfOnly` in `data.ts`

## Teaching claim
After a setback, "if only" leads back into regret; "Allah decreed" plus "be keen on what benefits you" leads to the next step.

## Why a canvas
The claim is about direction: where a thought goes after a setback. Three lanes (the past, Yasmin's thoughts, today) make the direction visible. Arrows to the past either come back empty ("same pain again") or come back with one lesson; arrows to today carry steps. Stepping through in order shows the turn from looking back to acting, which a single picture flattens.

## Model
- Inputs: none beyond the shared step controls (Back, Next, Play, step chips).
- Outputs: the active arrow, the step note, chips and an outcome badge.
- Rule: three actors; eight steps: setback, "if only", same pain, "Allah decreed" (a loop in Yasmin's lane), one lesson, what benefits, seek His help (a loop), next step.
- Facts from chapter 1.4: the client replies twelve days after the draft; the first $200 was paid and the second $200 will not come; four "if only" thoughts; one lesson (send a simple sketch of the home page in the first week); two proposals, interview notes and a short reply asking for feedback. Source named in notes: Sahih Muslim 2664.
- Assumptions: one setback, one evening.
- Limitations: regret comes back over days; the canvas does not explain why the setback happened and measures nothing about decree.

## Rendering
- Primary: the shared sequence renderer.
- Three lanes, so each lane is about 96px wide on a phone. Arrow labels are 16 characters or fewer.
- Static fallback: chapter 1.4 tells the same evening in prose and turns three "if only" sentences into steps in its worked example.

## Controls
Shared stepper controls only. No numeric inputs: the claim is about where a thought leads, not about amounts.

## Visualisation
Three lanes, eight arrows. Tone: warn on "if only", bad on "same pain again", good on "next step", each with a text outcome badge.

## Copy
- What this shows: two kinds of thought after a setback, and where each one goes.
- Try this: 1. At step 5, check the prediction (one lesson versus "if only"). 2. Count the arrows back to the past and say which one is useful.
- What changed: each step note says what Yasmin thought or did, and what it gave her.
- Limits of the model: as in `limits`.

## Edge cases
Two steps are loops inside Yasmin's lane; their labels sit to the right of the lane. Quotation marks are escaped in the data. No Arabic script, no brand names, no dashes.

## Accessibility
Shared stepper keyboard support and focus ring; `summary` gives the whole evening for screen readers; tone always has a text badge.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks which response to a new setback follows Sahih Muslim 2664).
- [x] The model is tested (registry consistency and label-fit tests once registered).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose and worked example in 1.4).

## Build plan
`frontend/src/canvas/act-not-if-only/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
