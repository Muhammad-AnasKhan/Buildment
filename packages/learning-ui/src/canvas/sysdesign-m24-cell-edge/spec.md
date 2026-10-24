# Canvas spec: sysdesign-m24-cell-edge

- **Course and chapter:** system-design, module 24 (geospatial search and ride matching), chapter 24.2 beat 3, "Close drivers can have different codes".
- **Renderer:** custom beat canvas on `BeatFrame`. Parts reused: `RadioChipRow` (letters, radius and what is read, all inside the picture), `VerdictBanner`. The rider is a `role="slider"` group with its own pointer handling (the same idea as `picture-slider.tsx`, in two directions). Pure model in `models/cell-edge.ts`. No control outside the picture.
- **Claim:** A driver 30 m away can sit in another box. Reading only the rider's box misses nearby drivers; the rings needed grow with the radius and shrink with the box size.

## World (metres)

The equator and the 0 degree meridian run through the origin, so x = 0 and y = 0 are box edges at every letter count. Rider starts at (-15, 10). D1 (15, 10) is 30 m east, across the meridian edge. D2 (-15, 410), D3 (-15, 1590), D4 (700, 10), D5 (-15, 2610). Box width by height in metres: 5 letters 4,887 by 4,887; 6 letters 1,222 by 611; 7 letters 153 by 153 (checked against the geohash bit counts within a metre in the unit tests).

## Model

The search circle has the chosen radius around the rider. Modes: Own box only (0 rings), Nine boxes (1 ring), Rings to reach (k = max(ceil(radius / width), ceil(radius / height)) rings, so (2k + 1) squared boxes). A driver inside the circle is found when its box is within k rings of the rider's box (box column and row differ by at most k), otherwise it is missed; a driver outside the circle is never counted. The rider's box follows the rider: dragging across an edge changes the box read. Boxes read, area read (boxes x width x height, shown to 3 figures: 215, 18.7, 5.3 km2) and drivers to measure (that area x 100 drivers a km2) are shown.

## Inputs

- Drag the rider anywhere on the map (press, slide, let go), or use the arrow keys (50 m a step; Home returns to the start). The rider can cross a box edge.
- Letters: 5, 6, 7. Radius: 0.5, 1, 2 km. Read: Own box only, Nine boxes, Rings to reach. All radio chips in the picture. Defaults: 6 letters, 1 km, Nine boxes.

## Picture

A map of box edges (the two through the origin drawn heavier), the boxes read shaded as one block, the search circle (dashed), the rider as a ring, and the five drivers as numbered dots: green found, red with a ring missed, grey outside the circle. The map shows the rider's starting box and the circle all round it, so the scale follows the letters and the radius. Under the map: `9 boxes read, 21,500 drivers to measure`, then one card per driver with its distance and `found`, `missed` or `outside`.

## Numbers to check (unit tests)

Rider at the start (-15, 10):

| Letters | Radius | Rings to reach | Own box | Nine boxes | Rings to reach |
|---|---|---|---|---|---|
| 5 | 1 km | 1 | misses D1, D4 | finds D1, D2, D4 | finds D1, D2, D4 (9 boxes) |
| 6 | 0.5 km | 1 | misses D1 | finds D1, D2 | finds D1, D2 (9 boxes) |
| 6 | 1 km | 2 | misses D1, D4 | finds D1, D2, D4 | finds D1, D2, D4 (25 boxes) |
| 7 | 0.5 km | 4 | misses D1, D2 | finds D1, misses D2 | finds D1, D2 (81 boxes) |

Rider dragged north to (-15, 600), the top of its 6-letter box: 6 letters, 1 km, nine boxes finds D1, D2, D4 and misses D3 (990 m); rings to reach finds all four (25 boxes). 6 letters, 2 km, nine boxes misses D3; rings to reach finds all four (81 boxes). 5 letters, 1 km, nine boxes finds all four (9 boxes). Cost at 100 drivers a km2, rings to reach, 1 km: 5 letters 9 boxes 215 km2 21,500 drivers; 6 letters 25 boxes 18.7 km2 1,870; 7 letters 225 boxes 5.3 km2 530. A further test drags the rider to nine places in each box and checks that rings to reach never misses a driver in the circle.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| any driver inside the circle is outside the boxes read | Missed a driver across the edge (bad) |
| every driver inside the circle is in the boxes read and more than 5,000 drivers to measure | Found, but a very big box to scan (warn) |
| every driver inside the circle is in the boxes read | All drivers in range were found (good) |

All verdicts are 38 characters or fewer.

## Reduced motion and accessibility

- Reduced motion: the rider moves with no trail (there is no trail or other motion; only colour changes, which are off under reduced motion).
- The rider is a `role="slider"` with value text that gives its place, the cost and every driver ("D1 found, 30 m"); each driver card is also text. Letters, radius and read are radio groups.
- Colour sits next to words (the verdict, `found`, `missed`, `outside`) and the missed dot also gets a ring.

## Limits

Boxes are measured at the equator. The map shows five drivers, but the drivers to measure comes from the density, not from those five. Near the poles and the 180 degree line the neighbour rules change.

## Sources

Arithmetic and geohash code from the module (scratch folder). Box sizes: Wikipedia "Geohash" (source needed in the dossier).
