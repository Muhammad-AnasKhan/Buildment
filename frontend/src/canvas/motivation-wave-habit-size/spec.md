---
artifact: canvas-spec
course: building-habits
chapter: 02.02-start-small
slug: motivation-wave-habit-size
version: 1
owner: interaction-designer
renderer: slider (2 inputs, 3 stats, 4 bars)
---

# Canvas spec: Motivation goes up and down

## Teaching claim
Motivation rises and falls over two weeks; a big habit happens only on high-motivation days, while a small one happens on most days, and a hard week hurts the big habit far more.

## Why a canvas
The learner needs to see the same up-and-down fortnight meet two habit sizes. Moving the effort slider and watching the done days jump from 3 to 14 makes the claim concrete in a way a sentence cannot. The hard-week slider shows that the small habit survives a bad week too.

## Model
- Inputs:
  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Effort the habit needs (`effort`) | of 10 | 1 | 10 | 1 | 7 |
  | Hard second week (`hardWeek`) | lower | 0 | 3 | 1 | 0 |
- Outputs:
  | Name | Unit | Format |
  |---|---|---|
  | Days it happens | days of 14 | "N of 14", detail lists the days |
  | Longest gap | days in a row | "N days" or "none", detail "days A to B" |
  | Motivation needed | 0 to 10 | "N or more" |
  | Bars: this habit week 1 and week 2; smallest version (effort 2) week 1 and week 2 | days of 7 | "N of 7", scale 0 to 7 |
- Data (stated in the intro): Lina's motivation, days 1 to 14: 9, 8, 6, 5, 3, 4, 6, 7, 5, 4, 3, 2, 4, 5. Example numbers, not measurements.
- Rule (toy, exported as `habitDays`): motivation on days 8 to 14 is lowered by the hard-week value, never below 0. The habit happens on a day when motivation is at least the effort.
- Worked values: effort 7 gives days 1, 2 and 8 (3 of 14) and a 6-day gap (days 9 to 14); effort 2 gives 14 of 14; with a hard week of 2, effort 2 gives 12 and effort 7 gives 2; effort 4 gives 11 and effort 5 gives 8 in an ordinary fortnight.
- Assumptions: motivation alone decides the day.
- Limitations: real motivation is not a number; time, power, internet and other people also decide a day. `limits` says the rule is an illustration, not a research finding.

## Rendering
Shared slider renderer, HTML controls, four bars on one 0 to 7 scale. No tone colours.

## Controls
Effort: the size of the habit (Lina's plan is 7, her smallest version 2). Hard second week: a week with more deadlines or power cuts.

## Visualisation
Three stat cards (days done with the list of days, longest gap, motivation needed) and four bars comparing this habit with the smallest version, week by week.

## Copy
- What this shows: a fixed fortnight of motivation and a toy rule; the done days for any habit size.
- Try this:
  1. Effort 7: 3 of 14 days (1, 2, 8); then effort 2: 14 of 14 (matches the chapter's predict).
  2. Hard week 2: the smallest version still 12 of 14; effort 7 only 2.
  3. The largest effort that still reaches 10 of 14: 4.
- What changed: `describeWaveChange` gives the new count against the old one and why (a smaller habit fits low days; a hard week hurts a big habit more).
- Limits of the model: as in `limits`.

## Edge cases
Effort 10 with a hard week of 3: 0 of 14, gap days 1 to 14. Effort 1 with a hard week of 3: 12 of 14 (two days reach 0). Inputs are clamped and rounded before the model.

## Accessibility
Native range inputs with labels and units; a one-sentence result summary; the days are listed in words, not only in bars.

## Acceptance criteria
- [x] The claim is testable (transfer MCQs in 2.2: Bilal's 45-minute lesson on 3 of 14 days; Asma's Thursday hardest-day test).
- [x] The model is tested (`frontend/tests/unit/canvas/motivation-wave-habit-size.test.ts`).
- [x] Numbers match chapter 2.2.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 2.2 states the series and the results in prose).

## Build plan
`frontend/src/canvas/motivation-wave-habit-size/data.ts` (exports `motivationWaveHabitSize`, `habitDays`, `motivationSeries`, `computeWave`, `describeWaveChange`); test `frontend/tests/unit/canvas/motivation-wave-habit-size.test.ts`; registered by the orchestrator.
