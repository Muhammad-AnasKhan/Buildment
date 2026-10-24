# Canvas spec: sysdesign-m22-connections-play

- **Course and chapter:** system-design, module 22, chapter 22.3 beat 3, "Restart a few gateways, spread the return".
- **Renderer:** custom beat canvas on `BeatFrame`. Pure model in `models/gateway-restart.ts`; the chips use `primitives/svg-radio-chip.tsx` and the spread rail uses `primitives/snap-stops-rail.tsx`.
- **Claim:** Restarting a gateway sends 50,000 phones to the others. If many restart at once, or the phones come back at the same moment, the fleet cannot accept the new connections. A few gateways at a time, with the phones spread over time, is a trickle the fleet absorbs.

## Model (60 gateways, 50,000 lines each, 500 new connections a second each, 100,000 lines at most)

| Quantity | Formula |
|---|---|
| Phones to move | P = 50,000 x k |
| Healthy gateways | H = 60 - k |
| Fleet accepts | C = H x 500 a second |
| Arrival rate | R = P / max(J, 1) |
| Lines on each healthy gateway | 50,000 + P / H |
| Time to return | max(max(J, 1), P / C) seconds |

## Inputs

- Gateways restarted at once k: 1, 6, 15, 30 (chips inside the picture, default 6).
- Spread of the return J: 0 (at once), 5, 15, 30 seconds on a snap rail inside the picture (default 5). Arrow keys step through the stops.
- One button outside the picture: Restart (replays the return).

## Picture

A grid of 60 cells (the gateways). The first k cells go dark; dots fly from them to the lit cells, and the lit cells turn from green towards red as their lines fill (by the share of 100,000). Three numbers: arrivals each second, what the fleet accepts, lines on each. Under them a chart of phones arriving each second against the dashed accept line: the bar is red above the line and its height is clipped at 70,000 with a small arrow. A line marks when everyone is back.

## Verdicts (the first rule that holds)

- `Gateways full: lines at the limit` (lines per healthy gateway 100,000 or more; bad)
- `Too many at once: retries pile up` (R above C; bad)
- `Back in {t} s, no overload` (otherwise; good)

All 38 characters or fewer. The first spec's table (k, J, phones, fleet accepts, arrivals, result, time, lines each) is tested row by row.

## Accessibility

The chips are radio buttons ("6 gateways restart at once, 60,000 arrivals a second"); the rail is a slider with value text "6 gateways restart, spread 15 seconds, 20,000 arrivals a second, fleet accepts 27,000"; the verdict is text.

## Reduced motion

The dots do not fly and the playhead is hidden; the chart shows the final bar, the accept line and the marker.

## Sources

Arithmetic on course numbers. The 500 new connections a second and the 50,000 and 100,000 lines are course assumptions (chapters 22.1 and 22.3).
