# Canvas spec: sysdesign-band-overlap

- **Course and chapter:** system-design, 10.6 beat 3 ("If the bands overlap, nobody knows the order").
- **Renderer:** custom beat canvas on `BeatFrame`. No motion: the idea is a comparison, and the learner moves it.
- **Claim:** Two timestamps can only be ordered with certainty when their bands do not overlap, that is when they are more than 2 times epsilon apart.
- **Input:** B's centre, 2 to 38 ms in 0.5 ms steps, default 20 (overlapping A at 16). Drag anywhere on the picture; arrow keys when focused.
- **Rule:** `bandOverlap(a, b, eps)` in `model.ts`: the overlap is `[max(a, b) - eps, min(a, b) + eps]` when non-empty; otherwise the order is certain. Tested at the boundary (gap exactly 2 eps counts as overlapping, because the bands touch).
- **Verdict in the picture:** "Order unknown" (amber), "A first, for sure" or "B first, for sure" (green).
