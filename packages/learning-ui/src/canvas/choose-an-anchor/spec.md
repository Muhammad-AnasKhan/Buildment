---
artifact: canvas-spec
course: building-habits
chapter: 02.04-anchor-to-a-routine
slug: choose-an-anchor
version: 1
owner: interaction-designer
renderer: factor (3 options, 4 criteria, 3 weight levels)
---

# Canvas spec: Lina's anchor: change what matters

## Teaching claim
A good anchor happens every day, in the right place, ends at a clear moment and leaves a few free minutes; which anchor wins depends on what matters most in your week. Lowering the weight of "Same time every day" changes the winner, because Lina's power hours move from week to week.

## Why a canvas
Lina's choice is a trade-off: the power anchor is strong on place and on a clear moment, but it moves every week. Flipping one weight and watching the winner change shows that the choice depends on what matters in a week like hers, which a fixed table cannot show.

## Model
- Options: After Fajr and tea; When the power comes on; After the evening meal.
- Criteria and scores (1 to 5), default weights:
  | Criterion | Weight | Fajr and tea | Power on | Evening meal |
  |---|---|---|---|---|
  | Same time every day | 3 | 5 | 1 | 4 |
  | Right place | 2 | 3 | 5 | 3 |
  | Clear end moment | 2 | 5 | 5 | 2 |
  | Free minutes after | 2 | 3 | 4 | 4 |
- Weight levels: 1 Nice to have, 2 Important, 3 Very important.
- Rule: the shared factor model, total = sum of weight x score.
- Worked totals: default 37, 31, 30 (Fajr and tea leads by 6). Same time at 1: 27, 29, 22 (power wins by 2). Same time at 2: 32, 30, 26. Free minutes at 3: 40, 35, 34. Right place at 3: 40, 36, 33. With the notebook moved to the kitchen (right place 5 for Fajr and tea, chapter text only): 41.
- Reasons for the scores (chapter 2.4): the tea comes after Fajr every morning, and the prayer time moves only slowly through the year; the notebook lives in her room, two steps from the kitchen; the empty glass is a clear end; client messages start soon after. The power hours move every week; when the power comes on she is at her desk with light, the moment is clear, and the laptop charges for a while first. The evening meal is at a steady time but drifts into talk and washing up, and the notebook is not at hand.
- Assumptions: Lina's own scores and weights.
- Limitations: the model treats judgment as exact and cannot see a missing criterion (for example an anchor that disappears on some days).

## Rendering
Shared factor renderer: weight buttons above, totals as bars. Option names at most 23 characters.

## Controls
One weight control per criterion, three levels.

## Visualisation
Totals per option, with the leader and margin in words.

## Copy
- What this shows: four questions about a good anchor, weighted by what matters to Lina.
- Try this:
  1. Predict the leader with Lina's weights (matches the chapter's predict): After Fajr and tea, 37 to 31 and 30.
  2. Same time every day to Nice to have: power wins 29 to 27.
  3. Free minutes after to Very important: Fajr and tea still leads, 40 to 35 and 34.
- What changed: the shared factor `describeChange` names the weight, the points each option moved and whether the leader changed.
- Limits of the model: as in `limits`.

## Edge cases
All weights at 1: 16, 15, 13 (Fajr and tea leads by 1). All weights at 3: 48, 45, 39. A tie cannot occur from a single change from the defaults.

## Accessibility
The renderer's weight buttons are at least 44px tall; totals and the leader are stated in text.

## Acceptance criteria
- [x] The claim is testable (transfer MCQs in 2.4: Salma's anchor with no clear end and a list kept at home; Adam needs a second anchor for Fridays).
- [x] The model is tested (shared factor model tests; registry scale checks once registered).
- [x] Numbers match chapter 2.4.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 2.4 does the sums in prose).

## Build plan
`packages/learning-ui/src/canvas/choose-an-anchor/data.ts` (export `chooseAnAnchor`), registered by the orchestrator.
