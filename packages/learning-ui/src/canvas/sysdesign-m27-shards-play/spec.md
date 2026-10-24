# Canvas spec: sysdesign-m27-shards-play

- **Course and chapter:** system-design, module 27, chapter 27.5 beat 3, "Drag the views, count the shards".
- **Renderer:** custom beat canvas on `BeatFrame`: two `SnapStopsRail` rails inside the picture, shard boxes drawn in SVG (the suggested `picture-slider` and `block-map` are not needed). Pure model in `models/lamha-shards.ts`, course numbers in `models/lamha-numbers.ts`.
- **Claim:** One row takes at most 1,000 writes a second, so a viral video needs enough shards that the busiest shard stays under half of that (500). More shards fix the writes and make a full read touch more rows, which is why the page reads a merged total.

## Model

- Writes a second per shard = views / shards (even spread; no random number at play time).
- Share of the row limit = per shard / 1,000 [S40]. Share of the plan = per shard / 500.
- Rows touched by one full read of the count = shards.
- Fewest shards that fit the plan = ceil(views / 500).

## Inputs

- Views a second for one video, on a snap rail: 500, 1,000, 2,000, 5,000, 10,000, 30,000 (default 5,000).
- Shards, on a snap rail: 1, 2, 4, 8, 16, 32, 64 (default 4).
- Arrow keys step one snap; Home and End jump to the ends. No control outside the picture.

## Picture

A row of shard boxes (up to 64, wrapped in rows of 16), each filled from the bottom in proportion to its share of the 1,000 limit, with a dashed line across at half. A box above the limit is drawn in the bad tone, between the plan and the limit (the limit itself included) in the warn tone, at or under the plan in the good tone. Views run along a bus above the row as dots. Under the row: "per shard: N writes a second" and "a full read: N rows" (in the warn tone when there are too many shards for the rate). A dashed marker "fewest that fit: N" stands over the shard rail at the log position of N.

## Numbers (tested)

Writes a second per shard, rounded:

| Views a second | 1 | 2 | 4 | 8 | 16 | 32 | 64 | Fewest that fit |
|---|---|---|---|---|---|---|---|---|
| 500 | 500 | 250 | 125 | 63 | 31 | 16 | 8 | 1 |
| 1,000 | 1,000 | 500 | 250 | 125 | 63 | 31 | 16 | 2 |
| 2,000 | 2,000 | 1,000 | 500 | 250 | 125 | 63 | 31 | 4 |
| 5,000 | 5,000 | 2,500 | 1,250 | 625 | 313 | 156 | 78 | 10 |
| 10,000 | 10,000 | 5,000 | 2,500 | 1,250 | 625 | 313 | 156 | 20 |
| 30,000 | 30,000 | 15,000 | 7,500 | 3,750 | 1,875 | 938 | 469 | 60 |

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| per shard above 1,000 | Throttled: 5x the row limit (bad; the multiple is per shard / 1,000, one decimal under 10) |
| per shard 501 to 1,000 | Over its plan: busy seconds throttle (warn) |
| per shard 50 to 500 | Each shard under half its limit (good) |
| per shard under 50 | Too many shards for this rate (warn; the picture says "a full read: N rows") |

All verdicts are 38 characters or fewer for every pair of snaps (tested).

Spec change: the brief drew boxes "at or above the limit" in the bad tone. A box at exactly 1,000 is full but not throttled, and its verdict is the warn "Over its plan", so it is drawn warn to agree with the verdict.

## Accessibility

- Each rail is a `role="slider"` with value text such as "5,000 views a second, 16 shards, 313 writes a second each, 31 percent of the row limit, a full read touches 16 rows, boxes are green"; the colour of the boxes is written as a word in that text and in the verdict.
- Reduced motion: the boxes fill at once; no dots move.

## Sources

DynamoDB allows 1,000 write units a second per partition [S40]; planning at half follows chapter 2.5. The even spread is a simplification (stated in the chapter fold).
