# Canvas spec: sysdesign-m20-hit-rate-play

- **Course and chapter:** system-design, module 20, chapter 20.4 beat 2, "Drag the hit rate, watch the database".
- **Renderer:** custom beat canvas on `BeatFrame`; the hit-rate rail is `primitives/rail-slider.tsx` with `SliderRail` from `primitives/picture-slider.tsx`, drawn inside the picture; `SvgNode` cards for the Cache and the Database. Pure model in `models/wasla-read-path.ts`. The 5.4 model (`models/hit-rate.ts`) does not fit: it derives a hit rate from a cache size, and here the hit rate is the input.
- **Claim:** The average falls smoothly with the hit rate, but p99 stays at the miss time until the hit rate reaches 99%, and the database load and node count track the misses.

## Model

Hit time 0.55 ms, miss time 3.05 ms, 100,000 redirects and 1,000 creates a second at peak, a database node planned for 2,500 operations a second.

| Quantity | Formula |
|---|---|
| Average | h x 0.55 + (1 - h) x 3.05 = 3.05 - 2.5 h (ms) |
| p99 | 0.55 ms if h is 99% or more, else 3.05 ms |
| Database operations | 100,000 x (1 - h) + 1,000 a second |
| Nodes | ceil(operations / 2,500) |

The hit rate is a whole percent and every figure is computed in whole numbers (thousandths of a millisecond, whole operations), so 21,000 never becomes 20,999.999999. Checked against the spec's table: 0% 3.05/3.05 ms, 101,000, 41 nodes; 50% 1.80, 51,000, 21; 80% 1.05, 21,000, 9; 90% 0.80, 11,000, 5; 95% 0.68, 6,000, 3; 98% 0.60, 3,000, 2; 99% 0.58/0.55, 2,000, 1.

## Input

Hit rate on a rail inside the picture, 0 to 99, step 1, snap points 0, 50, 80, 90, 95, 99 (a drag within 1 point of one lands on it), default 90. Arrow keys step 1, Page keys step 10, Home and End go to the ends.

## Picture

Top: two tracks on one scale from 0 to 3.5 ms, with fixed ticks "hit 0.55 ms" and "miss 3.05 ms". The "average" marker slides with a short transition; the "p99" marker jumps from the miss tick to the hit tick at 99. Middle: Requests flow as dots into the Cache card ("hit 90%"); the dots that continue to the Database card ("11,000 /s") are spaced by the miss share, so a 90% hit rate sends one dot in ten. Bottom: "5 database nodes needed" and a grid of 41 small boxes with the needed ones lit, then the rail.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| h under 90 | N database nodes for misses (bad when N is 10 or more, else warn) |
| h from 90 to 98 | Fast on average, p99 pays a miss (warn) |
| h is 99 | p99 is now the cache time (good) |

All 38 characters or fewer (tested for every hit rate).

## Accessibility

- The rail is a `role="slider"` with value text "90 percent hits, average 0.80 ms, p99 3.05 ms, 11,000 database operations a second, 5 nodes". The SVG group has the same facts as a sentence.
- Reduced motion: the markers jump to their final place (no transition), the moving dots are replaced by a still count of dots proportional to the miss share.
- Colour sits next to words (pills, node count, verdict).

## Sources

Latency building blocks from napkin-math [S3] (0.05 ms proxy hop, 0.5 ms cache query) and cache-aside's three trips on a miss [S26]; the 2 ms database read, the 2,500 node plan and the 100,000 and 1,000 peaks are course numbers.
