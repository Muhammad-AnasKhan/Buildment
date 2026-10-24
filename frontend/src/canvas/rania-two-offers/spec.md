---
artifact: canvas-spec
course: faith-and-resilience
chapter: 05.02-take-the-means-of-knowing
slug: rania-two-offers
version: 1
owner: interaction-designer
renderer: factor (HTML controls, bars)
---

# Canvas spec: Rania's two offers: what matters most?

- **Slug:** `rania-two-offers`
- **Export:** `raniaTwoOffers` in `data.ts`

## Teaching claim
Which permissible option looks better depends on what matters most to you, so know your priorities before you consult people and pray istikhara. The canvas does not decide for you.

## Why a canvas
The chapter shows Rania's score table in prose, but a static table invites the reader to add it up once and treat the total as "the answer". Changing one weight and watching the leader flip, then flip back, makes the learner feel that the facts did not change: only the priorities did. That is the claim, and it is hard to feel from a single table.

## Model
- Inputs: one weight per criterion, three levels.

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Steady income | weight | 1 | 3 | 1 | 2 |
  | Monthly pay | weight | 1 | 3 | 1 | 2 |
  | Learning | weight | 1 | 3 | 1 | 2 |
  | Free evenings | weight | 1 | 3 | 1 | 2 |
  | Days and travel | weight | 1 | 3 | 1 | 2 |

- Scores (Rania's own judgement, 1 to 5; NGO data assistant, startup contract): steady income 5, 2; monthly pay 3, 5; learning 2, 4; free evenings 5, 2; days and travel 2, 4.
- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Total per offer | points | integer |
  | Leader and margin | points | sentence |

- Formula: total(offer) = sum over criteria of weight x score (the shared factor model, `renderers/factor/model.ts`).
- Worked values, all checked by hand:
  - Defaults (every weight 2): 34 and 34, a tie.
  - Steady income 3, rest 2: NGO 39, startup 36.
  - Learning 3, rest 2: NGO 36, startup 38.
  - Rania's weights (steady 3, pay 2, learning 3, evenings 2, days 1): NGO 39, startup 36. Matches the chapter.
  - Suha's weights (steady 1, pay 3, learning 3, evenings 1, days 2): NGO 29, startup 39. Matches the chapter.
- Assumptions: both options are already checked as permissible; the scores are fixed for the session.
- Limitations: no must-haves, no uncertainty, no future; the canvas cannot see facts that are not listed.

## Rendering
- Primary: the shared factor renderer (HTML controls and bars).
- Why this renderer: the claim is "flip a factor and see which option leads", which is exactly the factor pattern.
- Controls: HTML weight buttons, at least 44px tall.
- Static fallback: the score table, the tie at equal weights and the two flips are written out in chapter 5.2.

## Controls
Five weight controls, one per criterion, three levels each. No other controls: the scores are not editable, because the lesson is about priorities, not about re-scoring facts.

## Visualisation
Two bars (one per offer) with totals, and the shared "What changed" sentence. No colour carries meaning on its own.

## Copy
- What this shows: as in `whatThisShows`.
- Try this:
  1. Predict whether the same offer leads for a person who values steady income most and one who values learning most.
  2. Raise Steady income: NGO 39 to 36. Put it back and raise Learning: startup 38 to 36.
  3. Set Rania's weights: NGO 39 to 36, a small gap, so both are reasonable.
- What changed: the shared factor sentence names the weight that moved, the points each offer gained or lost, and whether the leader changed.
- Limits of the model: as in `limits`.

## Edge cases
At the defaults the renderer shows a tie, which is intended. Every weight at 1 or every weight at 3 also ties (17 and 17, or 51 and 51). Option and criterion names are short enough for a 375px screen.

## Accessibility
Weight buttons are keyboard reachable with visible focus; the totals and the "What changed" sentence are text, so nothing depends on colour or on seeing the bars.

## Acceptance criteria
- [ ] The claim is testable (the chapter's transfer quiz asks about two people with different priorities reading the same facts).
- [ ] The model is tested (the shared factor model tests and the registry scale checks).
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (score table and worked totals in 5.2).
- [ ] No reward, faith or decree is measured: only Rania's own priorities for two jobs.

## Build plan
`frontend/src/canvas/rania-two-offers/data.ts`, to be registered by the orchestrator in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts`; preview at `/workspace/canvases`.
