---
artifact: canvas-spec
course: building-habits
chapter: 03.03-friction
slug: steps-to-start
version: 1
owner: interaction-designer
renderer: slider (HTML controls, inline SVG bars)
---

# Canvas spec: Steps to start: study or scroll?

## Teaching claim
Count the steps between you and a behaviour: on tired evenings, the option with fewer steps tends to win, so removing steps from the good choice and adding steps to the unwanted one both help, most of all on tired evenings.

## Why a canvas
The chapter states the idea and works one example. Moving two sliders lets the learner see that the two levers act on the same gap, and that the tired evenings are where the count moves. A static table of four scenarios would hide that every combination follows the same rule.

## Model
- Inputs:
  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Steps to start studying | steps | 0 | 10 | 1 | 6 |
  | Steps to start scrolling | steps | 0 | 10 | 1 | 0 |
- Fixed data: Khaled's energy after 10 shifts, 0 to 10, from the chapter: 3, 5, 1, 4, 8, 3, 5, 2, 7, 4. A tired evening has energy of 4 or less (6 evenings).
- Outputs:
  | Name | Unit | Format |
  |---|---|---|
  | Evenings he studies | evenings | "N of 10" |
  | Tired evenings he studies | evenings | "N of 6" |
  | Steps to study | steps | integer, with the gap in words |
- Formula or rule (toy): gap = study steps minus scroll steps. On each evening he studies when gap is no more than that evening's energy; otherwise he scrolls.
- Assumptions: the chapter's case numbers; one choice per evening; energy is fixed per evening.
- Limitations: the rule is made up for illustration and is not a research finding; real effects of friction are modest (dossier finding 9).

## Rendering
- Primary: the shared slider renderer (HTML range inputs, stat cards, horizontal SVG bars).
- Why this renderer: the claim is a numeric relationship between two inputs and a count.
- Bars (shared scale 0 to 10): your settings, old flat (6 and 0), book on table (2 and 0), phone in bedroom (6 and 3).
- Static fallback: the chapter's worked example gives every number in prose (steps 3 to 5).

## Controls
Two integer sliders. Steps to study is the "easier" lever; steps to scroll is the "harder" lever. No presets: the reference bars show the chapter's scenarios.

## Visualisation
Three stat cards and four bars. The "Your settings" bar is good at 8 or more evenings, bad at 3 or fewer, neutral otherwise; the value text is always drawn, so colour is never the only signal.

## Copy
- What this shows: how the gap between the steps to study and the steps to scroll decides, in a toy rule, which option wins on each of 10 evenings.
- Try this:
  1. Lower study steps from 6 to 2: tired evenings with study 0 to 5 of 6 (the predict asks whether tired-evening wins rise); all study evenings 2 to 9 of 10.
  2. Study back to 6, scroll steps 0 to 3: 8 of 10.
  3. Both: 2 and 3: 10 of 10.
- What changed: `describeStepsChange` names the lever moved, the gap before and after, and the change in study evenings and tired study evenings.
- Limits of the model: as in `limits`.

## Edge cases
Gap below zero (studying takes fewer steps than scrolling): every evening is a study evening. Gap of 10: no evening. Equal steps: gap 0, every evening. Non-numeric values fall back to the defaults. All outputs are integers.

## Accessibility
Labelled range inputs with visible values; the result `summary` sentence for screen readers; the "What changed" sentence is live text; bars carry text values.

## Acceptance criteria
- [x] The claim is testable (two quiz items after the canvas: Iyad's laptop and phone; Sara's phone in a drawer).
- [x] The model is tested (`frontend/tests/unit/canvas/steps-to-start.test.ts`).
- [x] The design is simple and legible.
- [x] Prediction before (tired evenings with the book on the table), transfer check after.
- [x] Reader fallback exists (worked example in chapter 3.3).

## Build plan
`packages/learning-ui/src/canvas/steps-to-start/data.ts` (exports `stepsOutcome`, `computeSteps`, `describeStepsChange`, `stepsToStart`), test `frontend/tests/unit/canvas/steps-to-start.test.ts`; to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; preview at `/workspace/canvases`.
