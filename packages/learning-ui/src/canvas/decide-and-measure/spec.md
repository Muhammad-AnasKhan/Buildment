---
artifact: canvas-spec
course: founder-interviews
chapter: 04.04-decide-and-measure
slug: decide-and-measure
version: 2
owner: interaction-designer
renderer: slider (HTML sliders, stat cards and bars)
---

# Canvas spec: Set the target first, then read the result

## Teaching claim
Decide before you look at the result: say the number you will watch, its baseline, and the target that would make you keep or change course, and allow for the normal swing, because a small change can be chance.

## Why a canvas
The chapter says to set the target in advance. Moving the result and the swing shows why: the same 34 percent is "change course" with no allowance for chance and "keep watching" with a normal swing of 2 points. The learner sees that the target and the swing must be fixed before the result is known.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Repeat rate before | % | 10 | 60 | 1 | 30 |
  | Repeat rate after 4 weeks | % | 10 | 70 | 1 | 34 |
  | Rise you need over baseline | points | 1 | 15 | 1 | 5 |
  | Normal month-to-month swing | points | 0 | 6 | 1 | 2 |

  The label "Rise you need over baseline" is 27 characters because the registry test limits input labels to 28.

- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Verdict | text | Keep it, Change course, or Keep watching |
  | Change so far | points | signed, for example +4 points |
  | Your target | % | baseline plus rise, with the keep and change-course edges in the detail |

- Rule (one vocabulary, used in 4.4 to 4.6, 7.3 and 7.4): target = baseline + rise. Keep it if the result is at or above target + swing. Change course if the result is at or below target - swing. Otherwise keep watching. The keep check comes first, so with a swing of 0 a result exactly on the target keeps the change.
- Assumptions: one rate, one change, one four-week window; the swing is taken from past months (in the chapter, the rate stayed between 38 and 42 percent in the six months before the fall, so about 2 points either way).
- Limitations: arithmetic only; a rule of thumb, not statistics; says nothing about why the rate moved; real results are noisy.

## Rendering
- Primary: the shared slider renderer (HTML sliders, stat cards, bars).
- Bars share one scale (the largest of before, target and result).
- Static fallback: the chapter explains the rule and works examples in prose.

## Controls
Four sliders with visible values and units. Defaults give "keep watching", the interesting case.

## Visualisation
Three bars: before, the target you set, after four weeks. The result bar is green, amber or red with the verdict as text.

## Copy
- What this shows: the verdict follows a target set in advance, not the feeling when the number arrives.
- Try this: 1. Predict at the default. 2. Result 37, then 33. 3. Swing 0 with result 34.
- What changed: the delta in words, including the keep and change-course edges and whether the verdict changed.
- Limits of the model: a simple illustration and a rule of thumb.

## Edge cases
Swing 0: the target decides, and exactly on the target keeps the change. Result exactly on the target with a swing above 0: keep watching. Result exactly at target minus swing: change course. Result below the baseline: allowed, gives change course. Largest target (60 + 15): bars scale to the largest value.

## Accessibility
Shared slider controls with labels, units and keyboard support; `summary` gives the whole result as a sentence; the verdict is text, not only colour.

## Acceptance criteria
- [x] The claim is testable (a quiz item gives a baseline, a target, a swing and a result and asks for the verdict).
- [x] The model is tested in `frontend/tests/unit/canvas/decide-and-measure.test.ts`, including a result exactly on the target and exactly at target minus swing.
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (the rule and examples are in 4.4).

## Build plan
`packages/learning-ui/src/canvas/decide-and-measure/data.ts`; test at `frontend/tests/unit/canvas/decide-and-measure.test.ts`; registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
