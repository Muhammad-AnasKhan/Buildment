---
artifact: canvas-spec
course: founder-interviews
chapter: 02.04-how-much-was-yours
slug: how-much-was-yours
version: 1
owner: interaction-designer
renderer: slider (HTML sliders, stat cards, three bars)
---

# Canvas spec: How much of the change was yours?

## Teaching claim
The change you can claim is the change you saw, minus what happened without your work. A comparison is a hint, not proof.

## Why a canvas
The subtraction is simple, but the learner has to see how the part they can claim shrinks, disappears or stays whole as the comparison changes. Three numbers moving at once cannot be held in prose.

## Model
- Case: Leen's packing day. About 3 hours before; about 2 hours after on the days she packed with the checklist and the new shelves; in the same four weeks, the days the part-time packer packed the old way fell by about 0.5 hour (3 to 2.5).
- Inputs:

| Name | Unit | Min | Max | Step | Default |
|---|---|---|---|---|---|
| Before: hours in a packing day | hours | 1 | 6 | 0.25 | 3 |
| After: the days with your work | hours | 0.5 | 6 | 0.25 | 2 |
| Change on the comparison days | hours | -2 | 1 | 0.25 | -0.5 |

- Outputs:

| Name | Unit | Format |
|---|---|---|
| Total change | hours | "1 hour less", with the percent from before as detail (-33% from 3 hours) |
| Seen without your work | hours | "0.5 hours less" |
| The part you can claim | hours | "0.5 hours", with the share of the total change as detail (50%) |

- Formula: saved = before - after. Saved without you = minus the comparison change. Claim = saved - max(0, saved without you), never below 0, and 0 when nothing was saved. A comparison that got slower does not add to the claim.
- Worked values: defaults 1, 0.5, 0.5 (50%). Comparison change 0: claim 1 hour. Comparison change -1: claim 0. After above before (2 to 3): "1 hour more", claim 0. Before 1, after 0.5, comparison +1: claim 0.5, 100%.
- Assumptions: the comparison days were like Leen's days before the change, with the same kind of orders.
- Limitations: simple arithmetic; a comparison is a hint, not proof. The chapter's second example (Fadi's crash fix, 12 to 5 for every 1,000 sessions, 3 from a phone version that left) is in prose only.

## Rendering
- Primary: the shared slider renderer, three bars on one scale (barMax is the total saved, at least 1). The claim bar is good-toned only when it is above 0.
- Static fallback: the chapter works the same numbers in prose before the canvas.

## Controls
Three sliders with visible values and units. Reset.

## Visualisation
Three bars: total change, seen without your work, the part you can claim.

## Copy
- What this shows: the part you can claim is the total change minus what the comparison days saved without you.
- Try this: 1. Defaults: claim 0.5 hour, half of it. 2. Comparison change 0: the whole hour is a hint that it was hers. 3. Comparison change -1: none can be claimed.
- What changed: `describeShareChange` says what moved, how the claim moved, and why.
- Limits of the model: as in `limits`.

## Edge cases
Packing day not shorter: claim 0, "nothing to claim". Comparison improved as much or more: claim 0. Comparison got slower: it does not increase the claim.

## Accessibility
Native range inputs with labels and values; the result `summary` is a plain sentence; the shared live region announces `describeChange`; no colour-only meaning.

## Acceptance criteria
- [x] The claim is testable (quiz items in 2.4 and 2.5 ask for the share that the evidence supports).
- [x] The model is tested (`frontend/tests/unit/canvas/how-much-was-yours.test.ts`).
- [x] The design is simple and legible.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (prose in 2.4).

## Build plan
`packages/learning-ui/src/canvas/how-much-was-yours/data.ts` (exports `howMuchWasYours`, `computeShare`, `describeShareChange`, `breakdown`, `claimSentence`, `formatHours`), registered by the orchestrator in `registry.ts` and `server/src/shared/canvas/slugs.ts`; tests in `frontend/tests/unit/canvas/how-much-was-yours.test.ts`; preview at `/workspace/canvases`.
