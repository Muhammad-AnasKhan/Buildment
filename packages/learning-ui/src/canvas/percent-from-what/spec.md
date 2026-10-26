---
artifact: canvas-spec
course: founder-interviews
chapter: 02.02-a-number-needs-a-before
slug: percent-from-what
version: 1
owner: interaction-designer
renderer: slider (HTML sliders, stat cards, two bars)
---

# Canvas spec: Percent from what?

## Teaching claim
A percentage needs a before, an after and a time window. The same two numbers give different percentages depending on where you count from, and a big percentage can sit on a small number.

## Why a canvas
The chapter states the rule. Moving the before and after numbers shows how the percentage, the plain difference and the other-way percentage move together, which a worked example with one pair of numbers cannot.

## Model
- Inputs:

| Name | Unit | Min | Max | Step | Default |
|---|---|---|---|---|---|
| Before: your first number | (the number's own unit) | 1 | 100 | 1 | 3 |
| After: your second number | (the number's own unit) | 0 | 100 | 1 | 2 |
| Weeks measured on each side | weeks | 1 | 12 | 1 | 4 |

- Outputs:

| Name | Unit | Format |
|---|---|---|
| Change from before | percent | signed whole number, for example -33% or +300% |
| Change in the number | the number's unit | signed whole number, for example -1 or +6 |
| Counted from after | percent | whole number, with a plain sentence such as "3 is 50% more than 2"; "n/a" when after is 0 |
| (in the first card detail) Window | weeks | "4 weeks", with a note ("long enough to see normal ups and downs", "short: a hint, not a pattern", "too short: one week can be an unusual week") |

- Formula: change from before = (after - before) / before x 100. Counted from after = (before - after) / after x 100. A big percentage on a small base is flagged when the change from before is at least 100% and the plain difference is 10 or fewer. Windows: under 2 weeks is "too short", under 4 is "short", otherwise "long enough". The window note is course advice, not a research finding.
- Worked values: 3 to 2 over 4 weeks gives -33%, -1, 50%. 2 to 8 gives +300%, +6, 75% (flagged as a small base). After 0 gives -100% and "n/a". Before 1, after 100 gives +9900%.
- Assumptions: both numbers are measured the same way.
- Limitations: arithmetic only. It cannot say whether the work caused the change.

## Rendering
- Primary: the shared slider renderer, with two bars (Before, After) on one scale.
- Static fallback: the chapter works the 3 to 2 example in prose before the canvas.

## Controls
Three sliders with visible values. Reset.

## Visualisation
Two horizontal bars and four stat cards. No colour is used for meaning.

## Copy
- What this shows: one change counted from two directions, and how a big percentage can sit on a small number.
- Try this: 1. Check the prediction at the defaults (33% less, and 50% counted from after). 2. Set before 2 and after 8 (+300%, but only 6). 3. Set weeks to 1 (the percentage does not change, the window is too short).
- What changed: `describePercentChange` names the inputs that moved, the old and new percentage, and the plain difference.
- Limits of the model: as in `limits`.

## Edge cases
After 0 gives "n/a" for the other-way percentage. Equal numbers give 0% and "the same number". Non-numeric input falls back to the defaults.

## Accessibility
Native range inputs with labels and values; the result `summary` is a plain sentence for screen readers; the shared live region announces `describeChange`.

## Acceptance criteria
- [x] The claim is testable (quiz items in 2.2 and 2.5 ask for the line with a base).
- [x] The model is tested (`frontend/tests/unit/canvas/percent-from-what.test.ts`).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 2.2).

## Build plan
`packages/learning-ui/src/canvas/percent-from-what/data.ts` (exports `percentFromWhat`, `computePercent`, `describePercentChange`, `percentChange`, `reverseChange`, `isSmallBase`), registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; tests in `frontend/tests/unit/canvas/percent-from-what.test.ts`; preview at `/workspace/canvases`.
