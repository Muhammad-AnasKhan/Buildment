# Canvas spec: sysdesign-m24-quadtree-split

- **Course and chapter:** system-design, module 24 (geospatial search and ride matching), chapter 24.2 beat 5, "Crowded places need smaller boxes".
- **Renderer:** custom beat canvas on `BeatFrame`. Parts reused: `SnapStopsRail` (the crowd), `RadioChipRow` (the limit), `SvgStat` (the two numbers), `VerdictBanner`. Pure model in `models/quadtree-split.ts`.
- **Claim:** A quadtree cuts only the crowded box into four again and again until no box holds too many drivers. Quiet places keep big boxes. A fixed grid puts the whole crowd in one box.

## Model

The city is the unit square holding 40 drivers spread evenly. The stadium crowd is spread evenly inside one square that is 1/16 of the city (the north-west square: the first quadrant at levels 1 and 2). Start with one box. If a box holds more than the limit, cut it into four equal boxes and divide the drivers by area; repeat down the tree, at most 12 levels. Count the boxes (leaves), the most drivers in one box and the deepest level. The fixed grid's fullest box is the crowd plus 40.

## Inputs

- Crowd in the stadium: 0, 100, 500, 1,000, 3,000, 6,000 (default 3,000). A snap rail inside the picture.
- Limit per box: 100 or 500 (default 500). Radio chips inside the picture.
- No control outside the picture.

## Numbers to check (unit tests)

| Crowd | Limit 500: boxes, fullest, levels | Limit 100: boxes, fullest, levels |
|---|---|---|
| 0 | 1, 40, 0 | 1, 40, 0 |
| 100 | 1, 140, 0 | 10, 26, 3 |
| 500 | 10, 126, 3 | 22, 31, 4 |
| 1,000 | 10, 251, 3 | 22, 63, 4 |
| 3,000 | 22, 188, 4 | 70, 47, 5 |
| 6,000 | 22, 375, 4 | 70, 94, 5 |

## Picture

The square city with the stadium square shaded and dots for the drivers (40 spread out, a crowd in the stadium). The quadtree boxes are drawn over it; deeper cuts fade in a little later than shallower ones, so the cutting can be seen. The fullest box is ringed, with its count in a pill (`188 drivers`), joined by a dashed line when the box is small. Two stat cards on the right: `Fixed grid: one big box, fullest 3,040` and `Quadtree: 22 boxes, fullest 188`.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| crowd 0 | Quiet city: one box is enough (good) |
| crowd above 0 but still one box | Below the limit: still one box (good) |
| otherwise | Dense places split deeper (good) |
| crowd 1,000 or more | A fixed grid would hold it all (warn), a second banner under the picture, with the fixed grid card ringed |

The "still one box" verdict is an addition to the spec: with a crowd of 100 and a limit of 500 the tree does not split, so "Dense places split deeper" would be wrong. All verdicts are 38 characters or fewer.

## Reduced motion and accessibility

- Reduced motion: boxes appear without the fade in.
- The crowd rail is a `role="slider"` with value text "3,000 drivers in the stadium, 22 boxes, fullest 188". The limit chips are a radio group. The picture's description gives the boxes, the fullest box and the fixed grid number.
- Colour sits next to words (verdict banner, counts in text).

## Limits

The real crowd is not even, drivers move, and a real quadtree is rebuilt as they move.

## Sources

Arithmetic on course assumptions, from the module's own model. A flat scan of 3,000 drivers took about 0.1 ms in plain JavaScript on one laptop (module benchmark, chapter 24.2).
