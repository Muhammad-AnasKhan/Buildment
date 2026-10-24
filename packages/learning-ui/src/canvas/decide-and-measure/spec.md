---
artifact: canvas-spec
course: founder-interviews
chapter: 04.04-decide-and-measure
slug: decide-and-measure
version: 1
owner: interaction-designer
renderer: slider (HTML sliders, stat cards and bars)
---

# Canvas spec: Set the line first, then read the result

## Teaching claim
Decide before you look at the result: say the number you will watch, its baseline, and the line that would make you change course, and allow for the normal swing, because a small change can be noise.

## Why a canvas
The chapter says to set the line in advance. Moving the result and the swing shows why: the same 34 percent is "change course" with no allowance for chance and "too close to call" with a normal swing of 2 points. The learner sees that the line and the swing must be fixed before the result is known.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Repeat rate before | % | 10 | 60 | 1 | 30 |
  | Repeat rate after 4 weeks | % | 10 | 70 | 1 | 34 |
  | Rise you need to keep it | points | 1 | 15 | 1 | 5 |
  | Normal month-to-month swing | points | 0 | 6 | 1 | 2 |

- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Verdict | text | Keep it, Change course, or Too close to call |
  | Change so far | points | signed, for example +4 points |
  | Your line | % | baseline plus rise |

- Rule: line = before + rise. gap = result - line. Keep if gap is 0 or more and at least the swing. Change course if gap is below 0 and its size is more than the swing. Otherwise too close to call.
- Assumptions: one rate, one change, one four-week window; the swing is taken from past months (in the chapter, the rate stayed between 38 and 42 percent in the six months before the fall, so about 2 points either way).
- Limitations: arithmetic only; says nothing about why the rate moved; real results are noisy.

## Rendering
- Primary: the shared slider renderer (HTML sliders, stat cards, bars).
- Bars share one scale (the largest of before, line and result).
- Static fallback: the chapter explains the rule and works three examples in prose.

## Controls
Four sliders with visible values and units. Defaults give "too close to call", the interesting case.

## Visualisation
Three bars: before, the line you set, after four weeks. The result bar is green, amber or red with the verdict as text.

## Copy
- What this shows: the verdict follows a line set in advance, not the feeling when the number arrives.
- Try this: 1. Predict at the default. 2. Result 38, then 31. 3. Swing 0 with result 34.
- What changed: the delta in words, including whether the verdict changed.
- Limits of the model: a simple illustration; results move up and down.

## Edge cases
Swing 0: the line decides. Result below before: allowed, gives change course. Very high line (60 + 15): bars scale to the largest value.

## Accessibility
Shared slider controls with labels, units and keyboard support; `summary` gives the whole result as a sentence; the verdict is text, not only colour.

## Acceptance criteria
- [x] The claim is testable (a quiz item gives a baseline, a line and a result and asks for the verdict).
- [x] The model is tested in `frontend/tests/unit/canvas/decide-and-measure.test.ts`.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the rule and three examples are in 4.4).

## Build plan
`packages/learning-ui/src/canvas/decide-and-measure/data.ts`; test at `frontend/tests/unit/canvas/decide-and-measure.test.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
