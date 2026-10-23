---
artifact: canvas-spec
course: cause-and-effect
chapter: 06.03-balancing-loops-and-delays
slug: order-pile-stock-flow
version: 1
owner: interaction-designer
renderer: custom (OrderPileCanvas, model.ts)
---

# Canvas spec: Huda's pile of waiting orders

## Teaching claim
A stock adds up its flows over time. Huda's pile of waiting orders keeps rising while more orders come in than cakes go out, even when the orders per day fall; it stays level when the two are equal, and drains only when fewer orders come in than cakes go out. When customers react to the wait a week late, the pile rises past where it would settle and then falls: a delay causes overshoot.

## Why a canvas
The claim is numeric and runs over time. Learners expect the pile to follow the shape of the orders. Moving the inflow and outflow and watching 24 days of bars shows the gap between them doing the work, which a single worked number in prose cannot show.

## Model
- Inputs: new orders per day (3 to 10, default 7), cakes baked per day (4 to 10, default 6), orders waiting at the start (0 to 24, default 12), and a switch "Customers react a week late" (default off).
- Rule, each working day for 24 days: orders that day = new orders per day; with the switch on, minus the wait in days (pile divided by cakes a day, rounded) that customers saw 6 working days earlier, never below 0. Baked that day = the smaller of cakes baked per day and (pile + orders). Pile = pile + orders - baked. Extra wait = pile divided by cakes baked per day.
- Outputs: the pile at the end of each day (bars), in minus out on day 1, the pile on day 24, the highest pile, the extra wait on day 24, and a "What changed" sentence.
- Defaults match chapter 6.3: 42 orders a week is 7 a day, the oven bakes 6 a day, 12 orders wait at the end of week 17, so the pile is 18 after six days.
- Assumptions: one cake per order; the same orders and baking every day; customers react by one simple rule.
- Limitations: real orders vary by day and season, and real customers react in different ways and at different times.

## Rendering
- Custom component on `primitives/controls.tsx` (RangeControl, ToggleControl, Metrics, WhatChanged, ResetButton) inside `primitives/canvas-frame.tsx`.
- An SVG bar chart in a 320 by 170 viewBox that scales to the panel, with `d3-scale` for the y axis; light gridlines, axis numbers, dotted week lines, and a caption.
- Theme tokens only (`TONES.accent`, `NEUTRAL`), no hex values.

## Controls
Three sliders and one switch, each with a visible label, value and unit, plus Reset. Touch targets are at least 44px (shared controls).

## Visualisation
24 bars, one per working day, for the orders still waiting at the end of the day. Dotted lines mark the end of each six-day week.

## Copy
- What this shows: the pile is a stock; the gap between orders in and cakes out decides whether it rises, stays or drains.
- Try this: 1. Predict what the pile does if orders fall from 7 to 6 a day, then move the slider. 2. Set orders to 5 a day: the pile of 12 is empty by day 12. 3. Set orders to 8, start at 0, switch on "react a week late": the pile rises to 17, then falls.
- What changed: a live sentence from `describeChange`, naming the input that moved, the trend in words, and the new pile on day 24.
- Limits of the model: as in `data.ts`.

## Edge cases
- Orders below baking: the pile reaches 0 and stays there; it never goes negative (tested).
- Maximum inflow and minimum baking: the pile reaches 168; the chart rescales.
- Non-numbers or out-of-range input are clamped to the bounds or the default (tested).

## Accessibility
- The chart has a title and a description listing the start and the pile at the end of each week.
- Summary cards and the "What changed" sentence are in polite live regions.
- Shared focus ring on every control; meaning is never carried by colour alone.
- Motion: only a short colour transition on bars, off under reduced motion.

## Acceptance criteria
- [x] The claim is testable (the 6.3 predict is the first "Try this"; quiz Q2, a stationery shop that orders on last week's sales, moves the delay and overshoot part to a new case).
- [x] The model is tested (`frontend/tests/unit/canvas/order-pile-stock-flow.test.ts`: default, level, falling inflow, drain to zero, overshoot, minimum and maximum, clamping, wait, change sentence).
- [x] The design is simple and legible at 375px.
- [x] Prediction before, transfer check after.
- [x] Reader fallback exists (chapter 6.3 teaches the same numbers in prose).

## Build plan
`frontend/src/canvas/order-pile-stock-flow/` with `model.ts`, `OrderPileCanvas.tsx` (export `OrderPileCanvas`), `data.ts` (export `orderPileStockFlow`, `kind: "custom"`) and this spec. The orchestrator registers the slug in `frontend/src/canvas/registry.ts` and `server/src/shared/canvas/slugs.ts`.
