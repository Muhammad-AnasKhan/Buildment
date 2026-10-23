---
artifact: canvas-spec
course: building-habits
chapter: 05.03-missed-days
slug: streak-or-done-count
version: 1
owner: interaction-designer
renderer: slider (three inputs, three stats, four bars)
---

# Canvas spec: Streak or days done: what one miss changes

## Teaching claim
One miss resets a streak counter but barely changes "days done out of 30"; the number to watch after a miss is the length of the gap, because a longer gap makes restarting harder.

## Why a canvas
The chapter does the counting for Yousef's month once in prose. Moving the misses (one miss, five in a row, five spread out, seven in a row) and watching the streak jump about while days done hardly moves makes the claim felt. A static table shows one month only.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Missed days | days | 0 | 10 | 1 | 5 |
  | Day of the first miss | day | 1 | 30 | 1 | 24 |
  | Spread out (0 no, 1 yes) | flag | 0 | 1 | 1 | 0 |

- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Days done | days of 30 | "25 of 30", detail "83% of the month" |
  | Streak on day 30 | days | "2 days", detail "longest run 23 days" |
  | Longest gap | days | "5 days" |
  | Bars | days | days done, longest run, streak on day 30, longest gap; scale 0 to 30 |

- Rule (`missedDaysFor`, `countMonth` in `data.ts`): place the misses from the first-miss day, one a day (together) or one every other day (spread out). If they would run past day 30, move the first miss earlier until they fit, and say so. Then count: days done = 30 minus misses; streak on day 30 = days done in a row counting back from day 30; longest run and longest gap = the longest runs of done and missed days.
- Worked values:

  | Misses | First | Spread | Missed days | Done | Streak day 30 | Longest run | Longest gap |
  |---|---|---|---|---|---|---|---|
  | 5 (default) | 24 | 0 | 24 to 28 | 25 | 2 | 23 | 5 |
  | 1 | 24 | 0 | 24 | 29 | 6 | 23 | 1 |
  | 5 | 24 | 1 | 22, 24, 26, 28, 30 | 25 | 0 | 21 | 1 |
  | 7 | 24 | 0 | 24 to 30 | 23 | 0 | 23 | 7 |
  | 0 | any | any | none | 30 | 30 | 30 | 0 |

- Assumptions: a 30-day month; every day that is not missed is done.
- Limitations: pure counting. It does not claim that misses in a row harm a habit more than spread misses (untested, dossier U6). The research it sits beside: one miss did not undo progress; many misses lowered the level reached; a longer gap made the next gym visit less likely (dossier findings 2 and 13).

## Rendering
- The shared slider renderer: HTML range inputs, three stat cards, four bars on one 0 to 30 scale.
- Static fallback: chapter 5.3 counts Yousef's month in prose and in a table.

## Controls
Three sliders. "Missed days" and "Day of the first miss" move the misses; the 0 or 1 slider puts the same misses together or spreads them, which is the comparison the chapter needs (same days done, different gap).

## Visualisation
Four horizontal bars on one scale, so the learner sees days done stay long while the streak bar jumps.

## Copy
- What this shows: the same month counted three ways (days done, streak, longest gap).
- Try this:
  1. One miss on day 24: streak 6, days done 29 (the chapter's predict).
  2. Five misses spread out: days done stays 25, longest gap 1 (first miss moves to day 22).
  3. Seven misses together from day 24 (waiting for next month): days done 23, gap 7.
- What changed: `describeStreakChange` names the input that moved and how days done, the streak on day 30 and the longest gap changed.
- Limits of the model: as in `limits`.

## Edge cases
Zero misses (streak 30, gap 0); ten spread misses from day 30 (moved to start on day 12); a miss on day 30 (streak 0); singular "1 day".

## Accessibility
Shared slider keyboard support and live region; `summary` names the missed days and all four counts for screen readers; bars carry text values.

## Acceptance criteria
- [x] The claim is testable (quiz after the canvas: a tracker counted by days done and longest gap).
- [x] The model is tested (`frontend/tests/unit/canvas/streak-or-done-count.test.ts`: defaults, the three "try this" values, edges, summary, describeChange).
- [x] Numbers match chapter 5.3 (days 24 to 28 missed, 25 of 30, streak 2, run 23, gap 5).
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists.

## Build plan
`frontend/src/canvas/streak-or-done-count/data.ts` (export `streakOrDoneCount`, plus `missedDaysFor`, `countMonth`, `computeStreak`, `describeStreakChange`), test in `frontend/tests/unit/canvas/streak-or-done-count.test.ts`, registered by the orchestrator.
