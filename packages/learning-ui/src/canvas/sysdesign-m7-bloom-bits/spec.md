# Canvas spec: sysdesign-m7-bloom-bits

- **Course and chapter:** system-design, 7.3, beat "Drag the bits per key".
- **Renderer:** custom beat canvas on `BeatFrame`, with `primitives/rail-slider.tsx` and `SliderRail` from `primitives/picture-slider.tsx` for the rail inside the picture (only the rail is the drag surface, so a phone can still scroll over the rest) and a small curve drawn in the canvas. Model: `models/bloom.ts`.
- **Claim:** A few extra bits per key make a Bloom filter's wrong "maybe" rate fall quickly, at a small memory cost.
- **Model:** b = bits per key; k = max(1, round(b x ln 2)); FP = (1 - e^(-k/b))^k; memory for a billion keys = b x 10^9 / 8 bytes; one wrong maybe in round(1 / FP) lookups [S113].
- **Input:** a rail inside the picture, linear in bits from 2 to 20, with ten snaps: 2, 3, 4, 5, 6, 8, 10, 12, 15, 20. Default 10. Arrow keys step along the ladder, Page keys jump, Home and End go to the ends.
- **Worked values (tested):** 2 bits: k 1, 39.35%, 1 in 3, 0.25 GB. 3: 2, 23.68%, 1 in 4, 0.375 GB. 4: 3, 14.69%, 1 in 7, 0.5 GB. 5: 3, 9.18%, 1 in 11, 0.625 GB. 6: 4, 5.61%, 1 in 18, 0.75 GB. 8: 6, 2.16%, 1 in 46, 1 GB. 10: 7, 0.82%, 1 in 122, 1.25 GB. 12: 8, 0.31%, 1 in 318, 1.5 GB. 15: 10, 0.07%, 1 in 1,344, 1.875 GB. 20: 14, 0.0067%, 1 in 14,895, 2.5 GB.
- **Picture:** a strip of 100 dots for 100 lookups of keys that are not stored; the first round(FP x 100) are amber (none under 0.5%), with the exact rate written beside it; a curve of the rate against bits with a dot that rides it and a drop line to the axis; a bar for the filter memory with its value in GB. A ring walks along the dots (ambient). Only the rate, the bits on the rail and the memory are written as numbers.
- **Verdicts:** FP above 5%: "Many wasted file reads"; 0.5% up to 5%: "About 1 wasted read in 100"; under 0.5%: "Few wasted reads, more memory".
- **Accessibility:** the rail is a `role="slider"` whose value text gives the bits, the rate, the wasted reads in 1,000, the memory and the verdict.
- **Limits shown to the learner:** whole-key Bloom filters help point lookups only, not range scans; real filters add some overhead, so the memory is a floor.
- **Sources:** [S113] for the formulas and the best k; RocksDB Bloom filter page: about 10 bits per key gives about 1% false positives (read 2026-10-24).
