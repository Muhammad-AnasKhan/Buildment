# Canvas spec: sysdesign-m25-waiting-room

- **Course and chapter:** system-design, module 25, chapter 25.2 beat 7, "Let fans in at a steady rate".
- **Renderer:** custom beat canvas on `BeatFrame`. Admit rate on `primitives/snap-stops-rail.tsx` inside the picture; `SvgNode` cards for Waiting room, Booking and Seat store; `DotGrid`, `VerdictBanner`. Pure model in `models/waiting-room.ts`; flow dots from `models/server-load.ts` (`flowDots`) and `models/envelope-estimate.ts` (`flowRate`).
- **Claim:** A waiting room protects the seat store by admitting fans at a steady rate. Too fast and the store carries many times its plan; too slow and the show takes an hour to sell out. A good rule keeps about as many fans inside as there are seats, which is Little's law: fans inside = admit rate x time inside.

## Model

400,000 fans, 20,000 seats, 120 s inside, 4 requests per admitted fan, store plan 5,000 requests a second, half of the admitted fans buy. All are course assumptions.

| Quantity | Formula |
|---|---|
| Fans inside | admit rate x 120 (Little's law, L = lambda W) |
| Store load | admit rate x 4 requests a second |
| Times its plan | load / 5,000 |
| Sell-out time | 20,000 / (admit rate x 0.5) seconds |

## Input

Admit rate in fans a second on a snap rail with eight stops: 10, 33, 100, 167, 500, 1,250, 5,000, 20,000 (default 167). The stops are evenly spaced on the rail (they are close to log spaced), so the labels never touch. Arrow keys step one stop, Home and End jump to the ends. Dragging or pressing the rail freezes the motion.

## Picture

Left to right: a Waiting card for the waiting room (pill "400,000 fans"; the name is short so it fits the card), a Booking card (pill "20,040 inside") and a Seat store card (pill "13% of plan", or "16x plan" past the plan, with a red ring). Under the cards: a grid of 40 dots, each 10,000 fans, that shortens as fans are let in; a log gauge under Booking with a tick at "20,000 seats"; a log gauge under Seat store with a tick at "plan". Below: a "seats sold" bar over the first 4 minutes of the sale, sped up 20 times (one loop is 12 s on screen then a 2 s hold), the rail, and a readout "Admit 167 a second: sold out in 4 min". Dots flow along both lanes at a speed set by the store's load against its plan.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| load above plan | Store at Nx its plan (bad; one decimal below 10) |
| load at most plan, sell-out above 600 s | Safe but slow: sold out in N min (warn) |
| otherwise | Within plan: sold out in N min or N s (good) |

Sell-out is shown in seconds below 90 s, otherwise in whole minutes. Checked for all eight stops in the unit tests: 10 gives 67 min, 33 gives 20 min, 100 gives 7 min, 167 gives 4 min, 500 gives 80 s, 1,250 gives 32 s (exactly on plan), 5,000 gives 4x, 20,000 gives 16x.

## What the learner should notice

- Little's law: the fans inside grow in step with the admit rate; at 167 a second about 20,000 are inside, one shopper per seat.
- The store load is four times the admit rate, so it reaches its plan at 1,250 a second.
- Slower is safe but the sale takes an hour; faster than 1,250 breaks the plan.

## Accessibility

- The rail is a `role="slider"` with the value text "167 fans a second, 20,040 inside, store at 13 percent of plan, sold out in 4 minutes". The SVG has a title and a description with the same numbers.
- Reduced motion: no flowing dots; the line, the sold bar and the pills show the 4 minute mark and update at once with the rail.
- Colour is never the only signal: the pill, the verdict and the ring carry words.

## Sources

Little's law [S5] (as cited in chapter 25.2). The 5,000 plan, the 4 requests, the 120 s and the half who buy are course numbers.
