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
"Small and often beats big and rare" sounds like a slogan until the learner moves the numbers. The slider shows where the claim holds (bad days come, and a short session can move to a good day while a long one cannot) and where it does not (no bad days at all, or a tiny daily habit), so the learner learns the reason, not the slogan.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Small plan: minutes a day | min | 10 | 120 | 5 | 45 |
  | Small plan: days a week | days | 1 | 7 | 1 | 6 |
  | Long plan: hours on Friday | h | 1 | 8 | 1 | 5 |
  | Bad days a week | days | 0 | 4 | 1 | 1 |

- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Small and often, 4 weeks | time | "18 h", "40 min", "17 h 9 min"; detail: sessions and minutes |
  | Long and rare, 4 weeks | time | same; detail: sessions (an average, one decimal) and hours, or "no Friday is free" |
  | Ahead in time | text | "Small plan", "Long plan" or "Level"; detail: by how much |

- Rule (revision 1, after the critique that bad days only hit the long plan): bad days remove sessions from both plans. A bad day takes the whole day. A short session can move to another good day in the same week, so the small plan keeps min(days, 7 - bad) sessions a week. A long session needs a whole free day and Friday is the only one, so it is lost when Friday is bad; with every day equally likely to be bad, the long plan keeps 4 x (7 - bad) / 7 sessions on average.
- Formula: small minutes = minutes x min(days, 7 - bad) x 4; long minutes = hours x 60 x 4 x (7 - bad) / 7; difference = small - long. Two bars in hours on one scale.
- Worked values (all in the unit test):
  - Default (45 min, 6 days, 5 h, 1 bad day): 24 sessions, 18 h; on average 3.4 sessions, 17 h 9 min; small ahead by 51 min.
  - Bad days 0: 18 h against 20 h; long ahead by 2 h.
  - Bad days 2: 15 h against 14 h 17 min; small ahead by 43 min.
  - Bad days 3: 16 sessions, 12 h, against 11 h 26 min.
  - Minutes 20: 8 h against 17 h 9 min; long ahead.
  - All minimums (10 min, 1 day, 1 h, 0 bad): 40 min against 4 h; long ahead by 3 h 20 min.
  - All maximums (120 min, 7 days, 8 h, 4 bad): 12 sessions, 24 h, against 13 h 43 min.
- Assumptions: a bad day takes the whole day; each day is equally likely to be bad; short sessions can always move within the week, long ones cannot.
- Limitations: the long plan's figure is an average, not a promise for one month; no tiredness, memory or quality of work. It measures practice time only, never faith or reward.

## Rendering
- Primary: the shared slider renderer.
- Why this renderer: the claim is a small numeric model with four inputs and two totals to compare.
- Controls: four HTML range inputs with visible values and units.
- Static fallback: the default comparison and the two counter-cases are written out in chapter 6.3.

## Controls
Two inputs size the small plan (minutes, days), one sizes the long plan (hours), and one sets how many bad days each week brings, which both plans feel.

## Visualisation
Three stat cards and two bars on one scale, labelled with their values. No colour carries meaning.

## Copy
- What this shows: two ways to put in practice time over 4 weeks, and what bad days do to each.
- Try this:
  1. Predict which plan gives more time with one bad day a week.
  2. Bad days 0: long ahead by 2 h.
  3. Bad days 3: the small plan is capped at 4 sessions a week, 12 h against 11 h 26 min.
  4. Minutes 20: long ahead, 17 h 9 min to 8 h.
- What changed: `describeLittleAndOftenChange` names the input that moved, what it did to each plan over 4 weeks with the reason (short sessions move to good days; a bad Friday cancels a whole session; fewer good days cap the small plan), and who is ahead now.
- Limits of the model: as in `limits`.

## Edge cases
Seven bad days (only reachable outside the slider range) gives "no Friday is free" and zero sessions. Gaps under a minute show "Level". Non-numbers fall back to the defaults; values are clamped; nothing renders NaN or Infinity (tested).

## Accessibility
Native range inputs with labels and values; the result `summary` is one plain sentence for screen readers; the "What changed" sentence is text in a live region.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz asks about a learner who plans six hours every Saturday).
- [ ] The model is tested (`frontend/tests/unit/canvas/little-and-often.test.ts`: default, minimum, maximum, bad days on both plans, no bad days, fallbacks, try-this numbers, "What changed" sentences).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (numbers in 6.3).
- [ ] No reward, faith or decree is measured.

## Build plan
`packages/learning-ui/src/canvas/little-and-often/data.ts` and `frontend/tests/unit/canvas/little-and-often.test.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
