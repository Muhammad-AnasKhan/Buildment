---
artifact: canvas-spec
course: building-habits
chapter: 01.04-how-long-a-habit-takes
slug: habit-strength-curve
version: 1
owner: interaction-designer
renderer: slider (3 inputs, 3 stats, 3 bars)
---

# Canvas spec: How a habit grows: a toy curve

## Teaching claim
Habit strength grows fast at first and then levels off, people differ a lot in how long it takes, and one missed day does not reset it. The shape and the wide range are sourced (research dossier finding 2); the formula is a labelled toy model.

## Why a canvas
The shape is the lesson, and it is easiest to feel by moving along it: each extra week adds less, a missed day barely moves the number, and the same day count gives very different strengths at different speeds. A static curve shows one habit; the sliders let the learner compare and test the "back to day one" fear.

## Model
- Inputs:
  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Days since starting (`days`) | days | 1 | 300 | 1 | 21 |
  | How fast it forms (`speed`) | 1 fast, 2 typical, 3 slow | 1 | 3 | 1 | 2 |
  | Missed days so far (`missed`) | days | 0 | 60 | 1 | 0 |
- Outputs:
  | Name | Unit | Format |
  |---|---|---|
  | Habit strength | percent of the habit's own top level | whole percent |
  | Days done | days | integer, detail "N days, M missed" |
  | To reach 95% | days done still needed | "N more" or "reached" |
  | Bars: fast, typical, slow strength at the same days done | percent | whole percent, scale 0 to 100 |
- Formula (toy rule, exported as `habitStrength`): done = days minus missed (missed capped at days); strength = 100 x (1 - 20^(-done / T)), with T = 18, 66 or 254 for fast, typical or slow. At done = T the strength is exactly 95. Still needed = max(0, T - done).
- Worked values: typical speed at 7, 14, 21, 42 and 66 days done gives 27%, 47%, 61%, 85% and 95%. Day 21 with one miss gives 60%. At day 21 the bars are 97%, 61%, 22%; at day 66 they are 100%, 95%, 54%.
- Assumptions: a smooth curve; a missed day adds no growth and takes nothing away.
- Limitations: the formula is an illustration. The research found that many misses lowered the level reached and that a long gap made the next time less likely; the toy model shows neither, and `limits` says so.

## Rendering
- Shared slider renderer (`renderers/slider/`), HTML controls, bars on one 0 to 100 scale.

## Controls
Three sliders. Days: to walk along the curve. Speed: to show the wide range between people and habits. Missed days: to test the "back to day one" fear.

## Visualisation
Three stat cards and three bars (fast, typical, slow at the same days done), the chosen speed marked "this habit". No tone colours: no bar is good or bad.

## Copy
- What this shows: a toy curve with the researched shape, for three speeds that reach 95% at 18, 66 and 254 days done.
- Try this:
  1. One missed day at day 21: 61% to 60%, not zero (matches the chapter's predict).
  2. Day 66 at speeds 1, 2, 3: 100%, 95%, 54%.
  3. Days 7, 14, 21: 27%, 47%, 61%.
- What changed: `describeCurveChange` names the input that moved and the new strength, with the reason (a miss pauses growth, early weeks add most, speeds differ).
- Limits of the model: as in `limits`.

## Edge cases
More missed days than days: done is 0, strength 0%. Day 300 at the slow speed: "reached". Speed is snapped to 1, 2 or 3. All corners stay finite.

## Accessibility
Native range inputs with labels and units; the result summary is one sentence for screen readers; "What changed" is a live sentence.

## Acceptance criteria
- [x] The claim is testable (transfer MCQs in 1.4: Reem's stretching at day 21 after one miss; Bilal's one miss versus a 12-day gap).
- [x] The model is tested (`frontend/tests/unit/canvas/habit-strength-curve.test.ts`).
- [x] Numbers match chapter 1.4.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 1.4 gives the week-by-week numbers in prose).

## Build plan
`frontend/src/canvas/habit-strength-curve/data.ts` (exports `habitStrengthCurve`, `habitStrength`, `curvePoint`, `computeCurve`, `describeCurveChange`); test `frontend/tests/unit/canvas/habit-strength-curve.test.ts`; registered by the orchestrator.
