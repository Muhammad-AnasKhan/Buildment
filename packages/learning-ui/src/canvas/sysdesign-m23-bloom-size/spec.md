# Canvas spec: sysdesign-m23-bloom-size

- **Course and chapter:** system-design, module 23, chapter 23.4 beat 2, "Drag the bits and the hashes".
- **Renderer:** custom beat canvas on `BeatFrame` with two `RailSlider`s and `SliderRail` (`primitives/rail-slider.tsx`, `primitives/picture-slider.tsx`) inside the picture; the bit row, curve, memory bar and typo strip are drawn in the canvas. Model: `models/bloom-hashes.ts`.
- **Relation to chapter 7.3:** `models/bloom.ts` only exposes the rate at the best hash count, so `models/bloom-hashes.ts` adds `wrongMaybe(bits, hashes)` and reuses that file's bits ladder, rail mapping and `withCommas`. A test checks that both models agree at the best k. The picture is new: it varies the hash count.
- **Claim:** A Bloom filter's wrong-maybe rate falls as bits per word grow, and for each size there is a best number of hashes. Too few let typos through; too many fill the row.

## Model

- FP = (1 - e^(-k / b))^k [S113]. Best k* = max(1, round(b x ln 2)). Ratio = FP(b, k) / FP(b, k*). Share of bits set = 1 - e^(-k / b).
- Memory for 100 million words = b x 100,000,000 / 8 bytes. One wrong maybe in round(1 / FP) typos.

## Inputs

- Bits per word b: 2, 3, 4, 5, 6, 8, 10, 12, 15, 20 (default 10), a rail linear in bits.
- Hashes k: every whole number from 1 to 20 (default 7), a rail under the curve whose x positions line up with the curve.
- Arrow keys step, Page keys jump, Home and End go to the ends (both rails are `role="slider"`).

## Picture (top to bottom)

1. A row of 50 cells for the bits; the first round(share x 50) are filled; the share is written beside it (amber when above 60%).
2. A curve of FP against k for the chosen b, on a log scale from 0.001% to 100% (grid at 100%, 1% and 0.01%); a dot at the chosen k with the rate in a pill next to it, a ring at k*, and a drop line to the axis.
3. The hashes rail, then the bits rail.
4. A bar for the memory with its value in MB.
5. A strip of 100 typo dots (two rows of 50); the first round(FP x 100) are amber. A ring walks along the dots (ambient).

The curve uses a log scale because FP spans five orders of magnitude over the ladder (39% at 2 bits to 0.0067% at 20); a linear scale would flatten everything near the best k.

## Numbers checked (tested)

| b | k | FP | Ratio to best | Bits set | Memory |
|---|---|---|---|---|---|
| 10 | 7 (best) | 0.82% | 1.00 | 50.3% | 125 MB |
| 10 | 1 | 9.52% | 11.61 | 9.5% | 125 MB |
| 10 | 4 | 1.18% | 1.44 | 33.0% | 125 MB |
| 10 | 10 | 1.02% | 1.24 | 63.2% | 125 MB |
| 10 | 14 | 1.90% | 2.32 | 75.3% | 125 MB |
| 10 | 20 | 5.46% | 6.66 | 86.5% | 125 MB |
| 5 | 3 (best) | 9.18% | 1.00 | 45.1% | 62.5 MB |
| 15 | 10 (best) | 0.07% | 1.00 | 48.7% | 187.5 MB |
| 15 | 1 | 6.45% | 86.69 | 6.4% | 187.5 MB |
| 20 | 14 (best) | 0.0067% | 1.00 | 50.3% | 250 MB |

Note: the first spec gave 32.9% for b = 10, k = 4; 1 - e^(-0.4) = 0.3297 rounds to 33.0%, which is what the picture and the test use.

## Verdicts (38 characters or fewer, all five reachable, tested)

"Too few hashes: typos slip through" (ratio above 1.15, k below k*; warn), "Too many hashes: the row fills up" (ratio above 1.15, k above k*; warn), "Near the best hash count, few errors" (ratio 1.15 or less, FP under 1%; good), "Best hashes, but add more bits" (FP 1% to under 5%; warn), "Best hashes, still too many errors" (FP 5% or more; bad).

## Accessibility

Each rail is a `role="slider"` whose value text gives the bits, the hashes, the rate, about 1 typo in N, the share of bits set, the memory, the best hash count and the verdict. Reduced motion: the ring on the typo dots does not walk; values show their final state.

## Limits shown to the learner

The formula assumes independent hashes and a filter filled with exactly the planned number of words; real filters add overhead, so the memory is a floor; a Bloom filter cannot remove a word; the curve is on a log scale.

## Sources

[S113] for the formula and the best k; the sweep matches the filter measured with the chapter 23.5 code (b = 10: k = 1 gives 9.51%, k = 7 gives 0.86%, k = 20 gives 5.59%).
