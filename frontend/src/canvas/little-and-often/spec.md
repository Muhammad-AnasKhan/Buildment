---
artifact: canvas-spec
course: faith-and-resilience
chapter: 06.03-good-work-little-and-often
slug: little-and-often
version: 1
owner: interaction-designer
renderer: slider (HTML controls, stat cards, bars)
---

# Canvas spec: A little and often, or long and rare?

- **Slug:** `little-and-often`
- **Export:** `littleAndOften` in `data.ts` (model: `practiceTotals`, `describeLittleAndOftenChange`, `formatTime`)

## Teaching claim
Small daily work kept up through bad days adds up to more than rare long sessions.

## Why a canvas
"Small and often beats big and rare" sounds like a slogan until the learner moves the numbers. The slider shows where the claim holds (with bad days landing on the long sessions) and where it does not (a tiny daily habit, or a month with no bad Fridays), so the learner learns the reason, not the slogan: a long plan puts a whole week on one day, and one bad day removes it.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Small plan: minutes a day | min | 10 | 120 | 5 | 45 |
  | Small plan: days a week | days | 1 | 7 | 1 | 6 |
  | Long plan: hours on Friday | h | 1 | 8 | 1 | 5 |
  | Fridays lost to bad days | of 4 | 0 | 4 | 1 | 1 |

- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Small and often, 4 weeks | time | "18 h", "40 min", "3 h 20 min"; detail: sessions and minutes |
  | Long and rare, 4 weeks | time | same; detail: sessions and hours, or "no session happened" |
  | Ahead in hours | text | "Small plan", "Long plan" or "Level"; detail: by how much |

- Formula: small minutes = minutes x days x 4; long minutes = hours x 60 x (4 - Fridays lost); difference = small - long. Two bars in hours on one scale.
- Worked values (all in the unit test):
  - Default: 24 sessions, 18 h; 3 sessions, 15 h; small ahead by 3 h.
  - Minutes 20: small 8 h; long ahead by 7 h.
  - Fridays lost 0: long 20 h; long ahead by 2 h.
  - Days 5: 15 h each, level (20 sessions against 3).
  - All minimums (10 min, 1 day, 1 h, 0 lost): 40 min against 4 h; long ahead by 3 h 20 min.
  - All maximums (120 min, 7 days, 8 h, 4 lost): 56 h against 0 h, "no session happened".
- Assumptions: small sessions happen on their planned days; bad days fall on Fridays only (the chapter's example).
- Limitations: no tiredness in long sessions, no memory between sessions, no quality of work. It measures practice time only, never faith or reward.

## Rendering
- Primary: the shared slider renderer.
- Why this renderer: the claim is a small numeric model with four inputs and two totals to compare.
- Controls: four HTML range inputs with visible values and units.
- Static fallback: the default comparison (18 h against 15 h) and the two counter-cases are written out in chapter 6.3.

## Controls
Two inputs size the small plan (minutes, days), one sizes the long plan (hours), and one sets how many Fridays bad days take. Each exists because the claim depends on it.

## Visualisation
Three stat cards and two bars on one scale, labelled with their values. No colour carries meaning.

## Copy
- What this shows: two ways to put in practice time over 4 weeks, and what bad days do to each.
- Try this:
  1. Predict which plan gives more hours with one lost Friday.
  2. Minutes 20: long ahead, 15 h to 8 h, but 3 days against 24.
  3. Fridays lost 0: long ahead by 2 h, only when no bad day lands on it.
  4. Days 5: level at 15 h, 20 sessions against 3.
- What changed: `describeLittleAndOftenChange` names the input that moved, the time it added or removed over 4 weeks, and who is ahead now; for lost Fridays it gives the reason (one bad Friday cancels a whole session).
- Limits of the model: as in `limits`.

## Edge cases
All four Fridays lost: the long plan shows 0 h and "no session happened". A tie shows "Level" and "same hours". Non-numbers fall back to the defaults; negative values are clamped; nothing renders NaN or Infinity (tested).

## Accessibility
Native range inputs with labels and values; the result `summary` is one plain sentence for screen readers; the "What changed" sentence is text in a live region.

## Acceptance criteria
- [x] The claim is testable (the chapter's quiz asks about a learner who plans six hours every Saturday).
- [x] The model is tested (`frontend/tests/unit/canvas/little-and-often.test.ts`: default, minimum, maximum, a tie and all-Fridays-lost edge cases, fallbacks, try-this numbers, "What changed" sentences).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (numbers in 6.3).
- [x] No reward, faith or decree is measured.

## Build plan
`frontend/src/canvas/little-and-often/data.ts` and `frontend/tests/unit/canvas/little-and-often.test.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
