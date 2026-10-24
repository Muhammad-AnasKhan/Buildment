---
artifact: canvas-spec
course: building-habits
chapter: 01.04-how-long-a-habit-takes
slug: habit-strength-curve
version: 2
owner: interaction-designer
renderer: slider (2 inputs, 3 stats, 4 bars)
---

# Canvas spec: How a habit grows: a toy curve

## Teaching claim
One claim: a habit grows fastest in the first weeks and then levels off, so each week adds less than the week before. The speed differs a lot between people and habits, but the shape is the same. The shape and the wide range are sourced (research dossier finding 2); the formula is a labelled toy model.

Version 2 (revision round 1, critic A S3-11e): the "missed days" input was removed so the canvas carries one claim. Chapter 1.4 teaches the one-missed-day finding in prose, and its second quiz item checks it.

## Why a canvas
The shape is the lesson, and it is easiest to feel as shrinking weekly gains: the bars show week 1, 4, 8 and 12 getting smaller at every speed. A static curve shows one habit; the speed slider shows that a slow habit is slower but has the same shape.

## Model
- Inputs:
  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Days done (`days`) | days | 1 | 300 | 1 | 21 |
  | How fast it forms (`speed`) | 1 fast, 2 typical, 3 slow | 1 | 3 | 1 | 2 |
- Outputs:
  | Name | Unit | Format |
  |---|---|---|
  | Habit strength | percent of the habit's own top level | whole percent |
  | Last 7 days added | points | "+N points", detail gives week 1's gain |
  | To reach 95% | days still needed | "N more days" or "reached" |
  | Bars: points added in week 1, 4, 8 and 12 at this speed | points | "+N points", scale = the largest bar |
- Formula (toy rule, exported as `habitStrength`): strength = 100 x (1 - 20^(-days / T)), with T = 18, 66 or 254 for fast, typical or slow. At days = T the strength is exactly 95. `weekGain(n)` = strength(7n) - strength(7n - 7).
- Worked values: typical speed at 7, 14, 21, 42 and 66 days gives 27%, 47%, 61%, 85% and 95%. Typical weekly gains: week 1 +27, week 4 +10, week 8 +3, week 12 +1. Slow week 1 adds +8; at day 66 slow is 54%. At day 21: fast 97%, typical 61%, slow 22%.
- Assumptions: a smooth curve, a habit done every day.
- Limitations: the formula is an illustration; real habits are not smooth; missed days are left out (the chapter covers them in prose).

## Rendering
Shared slider renderer (`renderers/slider/`), HTML controls, four bars on one scale.

## Controls
Days: walk along the curve. Speed: show that the shape holds at any speed.

## Visualisation
Three stat cards and four bars of weekly gains for the chosen speed. No tone colours.

## Copy
- What this shows: habit strength day by day, for three speeds that reach 95% at 18, 66 and 254 days.
- Try this:
  1. Check the prediction in the bars: +27, +10, +3, +1 (matches the chapter's predict on the shape).
  2. Days 7, 14, 21: 27%, 47%, 61%.
  3. Speed 3: week 1 adds 8 and gains shrink more slowly; day 66 is 54% against 95%.
- What changed: `describeCurveChange` gives the new strength and the last week's gain against week 1, or says the speed changed and the shape did not.
- Limits of the model: as in `limits`, including the word "toy" defined as a very simple made-up example.

## Edge cases
Day 1: the last seven days equal day 1's strength. Day 300 at the slow speed: "reached". Speed snaps to 1, 2 or 3; days round to a whole day of at least 1. All corners stay finite.

## Accessibility
Native range inputs with labels and units; a one-sentence result summary; "What changed" is a live sentence.

## Acceptance criteria
- [x] The claim is testable (transfer MCQ in 1.4: Reem's stretching still takes effort at day 21; Bilal's one miss against a 12-day gap checks the prose part).
- [x] The model is tested (`frontend/tests/unit/canvas/habit-strength-curve.test.ts`).
- [x] Numbers match chapter 1.4.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 1.4 gives the week-by-week numbers in prose).

## Build plan
`packages/learning-ui/src/canvas/habit-strength-curve/data.ts` (exports `habitStrengthCurve`, `habitStrength`, `weekGain`, `lastSevenDays`, `computeCurve`, `describeCurveChange`); test `frontend/tests/unit/canvas/habit-strength-curve.test.ts`.
