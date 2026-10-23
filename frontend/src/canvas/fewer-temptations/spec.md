---
artifact: canvas-spec
course: building-habits
chapter: 04.02-willpower-is-not-the-plan
slug: fewer-temptations
version: 1
owner: interaction-designer
renderer: slider (HTML controls, inline SVG bars)
---

# Canvas spec: Fewer temptations or more willpower?

## Teaching claim
Give-ins per week = temptations per day x 7 x the share you do not resist, so halving the temptations you face does what would otherwise take much more resisting, every night (at 50% resisted, matching it needs 75%).

## Why a canvas
The chapter works one example. The canvas shows, for any setting, the resistance level at which resisting alone would match halving the temptations, so the learner compares like with like instead of a 50% cut against a smaller one. Moving the sliders also shows where ten more points would catch up (80% and above).

## Model
- Inputs:
  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Temptations a day | a day | 0 | 20 | 1 | 8 |
  | Share resisted | % | 0 | 90 | 5 | 50 |
- Outputs:
  | Name | Unit | Format |
  |---|---|---|
  | Give-ins a week now | give-ins | whole number |
  | Half the temptations | give-ins | whole number, with "N fewer" |
  | To match halving, resist | % | (100 + share resisted) / 2, with "instead of N%, every night" |
- Formula: give-ins a week = temptations a day x 7 x (1 minus share resisted). Resistance to match halving: (100 + share resisted) / 2. Third bar: share resisted plus 10 points, capped at 100.
- Assumptions: the chapter's case (Maha, 8 temptations a night, half resisted, 28 give-ins a week); every temptation is the same size; the share resisted does not change when temptations fall.
- Limitations: arithmetic on example numbers, not a research finding. At 80% resisted the two changes tie; above it, ten more points cut more.

## Rendering
- Primary: the shared slider renderer.
- Why this renderer: a numeric relationship between two inputs.
- Bars (shared scale): now, half the temptations, resist N% (the current share plus 10). The bar that cuts more is marked good; on a tie neither is marked. Values are always drawn as text.
- Static fallback: the chapter's worked example gives 28, 14 and about 22 in prose.

## Controls
Two sliders. The share resisted stops at 90% so that "10 points more" stays at or below 100%.

## Visualisation
Three stat cards and three bars. Tone good only on the bar that cuts more, next to its number.

## Copy
- What this shows: give-ins a week from temptations and resistance, and the two ways to cut them.
- Try this:
  1. Defaults: the resistance needed to match halving is 75% (matches the predict, which asks 60% or 75%); ten more points gives about 22.
  2. Temptations 8 to 4: 28 to 14 with no extra willpower.
  3. Resistance 80%: the two changes tie; how many nights could you resist 8 out of 10?
- What changed: `describeTemptationChange` gives the old and new total, which change cuts more at the new settings (including the high-resistance case), and the resistance needed to match halving.
- Limits of the model: as in `limits`.

## Edge cases
Zero temptations: every total is 0, and the sentence says there is nothing to cut. Zero resistance: the formula still holds. 90% resisted: the third bar uses 100% and shows 0. Half of an odd number of temptations gives a fraction a day; totals are rounded only for display.

## Accessibility
Labelled range inputs with visible values; the result `summary` for screen readers; live "What changed" text; bar values as text.

## Acceptance criteria
- [x] The claim is testable (the quiz after the canvas: Hiba's tally card by source, and Anas's phones in the locker room).
- [x] The model is tested (`frontend/tests/unit/canvas/fewer-temptations.test.ts`).
- [x] The design is simple and legible.
- [x] Prediction before (how much resistance matches halving: 60% or 75%), transfer check after.
- [x] Reader fallback exists (worked example in chapter 4.2).

## Build plan
`frontend/src/canvas/fewer-temptations/data.ts` (exports `giveInsPerWeek`, `resistanceToMatchHalving`, `compareTemptations`, `computeTemptations`, `describeTemptationChange`, `fewerTemptations`), test `frontend/tests/unit/canvas/fewer-temptations.test.ts`; to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; preview at `/workspace/canvases`.
