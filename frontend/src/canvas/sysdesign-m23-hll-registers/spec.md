# Canvas spec: sysdesign-m23-hll-registers

- **Course and chapter:** system-design, module 23, chapter 23.4 beat 4, "HyperLogLog counts different shoppers".
- **Renderer:** custom beat canvas on `BeatFrame` with one `RailSlider` and `SliderRail` inside the picture; the number line, bands and bars are drawn in the canvas. Model: `models/hll-registers.ts`.
- **Claim:** HyperLogLog counts different items with a fixed, tiny memory, and its error shrinks as the square root of the number of registers; 12 KB gives under 1% for 50 million shoppers.

## Model

- True distinct shoppers N = 50,000,000 (chapter 23.1). Standard error s = 1.04 / sqrt(m) [S114].
- One-error band = N x (1 - s) to N x (1 + s); two-error band = N x (1 - 2s) to N x (1 + 2s).
- Memory = 6 bits x m / 8 bytes (Redis: 16,384 registers, 12 KB, 0.81% [S115]); a KB is 1,024 bytes, as in the chapter. Exact set = 50,000,000 x 8 bytes = 400 MB.

## Input

The registers m: 16, 64, 256, 1,024, 4,096, 16,384 (default 1,024), six evenly spaced rungs. Arrow keys step, Home and End go to the ends.

## Picture

A number line from 0 to 100 million with a thin marker at 50 million ("True count: 50 million shoppers"); a dark band for one error and a light band for two (true scale, so at 16,384 registers the dark band is about 3 units wide); the error written below ("± 3.25%"); a small diamond that wobbles inside the bands as an example of one run's estimate (ambient; deterministic, within 1.4 errors); a legend; the rail; two bars at the bottom, the HyperLogLog memory (a sliver) and the exact 400 MB (full), and the ratio written ("1 / 32,552 of the exact memory" at 12 KB).

## Numbers checked (tested)

| Registers | Memory | Standard error | One-error band (millions) | Two-error band (millions) |
|---|---|---|---|---|
| 16 | 12 B | 26% | 37.00 to 63.00 | 24.00 to 76.00 |
| 64 | 48 B | 13% | 43.50 to 56.50 | 37.00 to 63.00 |
| 256 | 192 B | 6.5% | 46.75 to 53.25 | 43.50 to 56.50 |
| 1,024 | 768 B | 3.25% | 48.38 to 51.63 | 46.75 to 53.25 |
| 4,096 | 3 KB | 1.63% | 49.19 to 50.81 | 48.38 to 51.63 |
| 16,384 | 12 KB | 0.81% | 49.59 to 50.41 | 49.19 to 50.81 |

## Verdicts (38 characters or fewer)

"Too rough to trust" (s above 5%; bad), "Fine for a dashboard" (s from 1% to 5%; warn), "Under 1% error in 12 KB" (s under 1%; good).

## Accessibility

The rail is a `role="slider"` whose value text gives the registers, the memory, the typical error, the one-error range and the verdict. Reduced motion: no diamond wobbles, the bands jump to their size when the rail moves, and everything shows its final state.

## Limits shown to the learner

The error is a typical (standard) error, so a single count can fall outside the dark band, and now and then outside the light one; HyperLogLog cannot list or remove a shopper; the formula holds for large counts, tiny counts use a built-in correction; the wobbling diamond is a made-up repeat to show the spread.

## Sources

[S114] for 1.04 / sqrt(m) and about 2% with 1.5 KB; [S115] for Redis (12 KB, 0.81%).
