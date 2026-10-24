---
artifact: canvas-spec
course: faith-and-resilience
chapter: 02.03-tie-it-and-trust
slug: interview-power-plan
version: 1
owner: interaction-designer
renderer: slider (HTML range inputs, stat cards, bars)
---

# Canvas spec: Will the power cover Khalil's interview?

- **Export:** `interviewPowerPlan` in `data.ts` (with `powerPlan` and `describePowerPlanChange`)

## Teaching claim
With limited grid power, a battery and a power bank, a plan with a backup covers the interview; trust does not replace counting the hours.

## Why a canvas
"Tie it and trust" is easy to agree with and easy to skip in practice. The slider makes the learner count: 40% sounds like plenty, but it is 3 minutes short. Moving one input at a time shows how much each means adds, and how a plan that leans on grid power looks safe but has no backup. A worked example in prose gives one set of numbers; the slider lets the learner test the edges of the plan.

## Model
- Inputs:

  | Name | Unit | Min | Max | Step | Default |
  |---|---|---|---|---|---|
  | Laptop charge at 10:00 | % | 0 | 100 | 10 | 40 |
  | Power bank | min | 0 | 60 | 30 | 0 |
  | Grid power during the call | min | 0 | 75 | 15 | 0 |

- Outputs:

  | Name | Unit | Format |
  |---|---|---|
  | Needed from your own power | minutes | "75 min" |
  | Battery and power bank | minutes | "72 min", with the split in the detail |
  | Plan status | text | "Covered" or "Short by 3 min", with the reason in the detail |
  | Bars: needed, battery, power bank, battery and bank | minutes | shared scale up to 240 |

- Formula: `needed = 60 + 15 - grid`; `battery = round(charge / 100 x 180)`; `own = battery + bank`; `spare = own - needed`. Status: "battery" when battery alone is at least `needed`; "bank" when `own` is at least `needed`; otherwise "short" by `needed - own`, and the backup is the call from the uncle's shop (solar power).
- Worked values: default 40%, no bank, no grid: 72 of 75 minutes, short by 3. Adding the 30-minute power bank: 102 minutes, covered with 27 to spare. 50% alone: 90 minutes, covered with 15 to spare. All minimums: short by 75. All maximums: needed 0, battery 180 spare. Edge: 0%, 60-minute bank, 15 minutes of grid: needed 60, own 60, covered with 0 to spare.
- Assumptions: a full battery lasts 180 minutes on a video call (Khalil timed it); the battery drains evenly; the power bank adds 30 or 60 minutes of laptop time; grid power during the call replaces battery use minute for minute. All are this example's numbers.
- Limitations: real batteries drain unevenly; the phone that shares the internet also needs charge and data (the chapter plans for it in prose); the model says nothing about the interview's result, which only Allah knows. Non-finite input falls back to the default; values are clamped to their range.

## Rendering
- Primary: the shared slider renderer: HTML range inputs, three stat cards, four bars.
- Static fallback: chapter 2.3 gives the same arithmetic in prose (72 of 75 minutes; 50% or more covers it alone; the power bank and the uncle's shop as backups) and a mermaid diagram of the plan.

## Controls
Three sliders, each for one means in the plan: the charge (what Khalil does with grid hours before Thursday), the power bank (his uncle's help), and grid power during the call (the unknown, kept in the model to show why a plan must not depend on it).

## Visualisation
Four bars on one scale: needed, battery, power bank, and battery and bank together (good when covered, bad when short, always with the status in text).

## Copy
- What this shows: the minutes Khalil needs from his own power and the minutes he has, and when the backup is needed.
- Try this: 1. Check the prediction: 40% is 72 minutes, 3 short. 2. Add the 30-minute power bank: covered, 27 spare. 3. 50% alone: covered, 15 spare. 4. Set the grid to 75, then back to 0: the grid cannot be planned this week.
- What changed: a live sentence names the input that moved, its effect in minutes, and the new status; a change to the grid adds that a plan which needs grid power has no backup.
- Limits of the model: as in `limits`.

## Edge cases
Zero charge, zero bank and zero grid: "Short by 75 min". Grid at 75: nothing is needed from own power, and the change sentence warns that the grid cannot be planned. Exact cover (spare 0) counts as covered. NaN, infinity and negative values fall back or clamp; no output shows NaN.

## Accessibility
Native range inputs with labels and units; the summary sentence describes the whole result for screen readers; bar tone always comes with the status in text.

## Acceptance criteria
- [ ] The claim is testable (the chapter's quiz transfers it to a new plan with a missing backup).
- [ ] The model is tested: `frontend/tests/unit/canvas/interview-power-plan.test.ts` covers the default, the minimums, the maximums, the exact-cover edge case, the try-this numbers, non-numeric input and the change sentences.
- [ ] The design is simple and legible.
- [ ] Prediction before, transfer check after.
- [ ] Reader fallback exists (prose arithmetic and worked plan in 2.3).

## Build plan
`packages/learning-ui/src/canvas/interview-power-plan/data.ts`, to be registered by the orchestrator in `packages/learning-ui/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`; covered by `frontend/tests/unit/canvas/registry.test.ts` and `frontend/tests/unit/canvas/interview-power-plan.test.ts`; preview at `/workspace/canvases`.
