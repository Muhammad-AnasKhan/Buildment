# Canvas spec: sysdesign-m24-batch-match

- **Course and chapter:** system-design, module 24 (geospatial search and ride matching), chapter 24.4 beat 5, "Match together, not one by one".
- **Renderer:** custom beat canvas on `BeatFrame`. Parts reused: `TightRailSlider` (Driver 1 is a slider drawn as a car on the road), `BeatChoice` and `BeatActionButton` (the two controls under the picture), `VerdictBanner`, `useBeatClock`. Pure model in `models/batch-match.ts`.
- **Claim:** Giving each rider the nearest free driver in turn can leave the next rider a far driver. Matching two riders together can pick a shorter total.

## World and model

Kilometres along a straight road (kept as whole tenths of a kilometre so sums never carry float noise). Rider A at 0, rider B at 1.0, Driver 2 at -0.5, Driver 1 draggable from 0.1 to 0.9 in steps of 0.1 (default 0.4). Speed for the time: 30 km/h.

- **One by one:** A takes the nearer of the two drivers (a tie goes to Driver 1); B gets the other. Total = A's distance plus B's distance.
- **Together:** total = the smaller of (A to Driver 1 + B to Driver 2) and (A to Driver 2 + B to Driver 1).
- **Saved** = one by one minus together. Minutes = saved km / 30 x 60 (for example 0.8 km is 1.6 min).

## Numbers to check (unit tests)

| Driver 1 at | One by one | Together | Saved |
|---|---|---|---|
| 0.1 | 1.6 km | 1.4 km | 0.2 km |
| 0.2 | 1.7 km | 1.3 km | 0.4 km |
| 0.3 | 1.8 km | 1.2 km | 0.6 km |
| 0.4 | 1.9 km | 1.1 km | 0.8 km |
| 0.5 | 2.0 km | 1.0 km | 1.0 km |
| 0.6 | 0.9 km | 0.9 km | 0 |
| 0.7 | 0.8 km | 0.8 km | 0 |
| 0.8 | 0.7 km | 0.7 km | 0 |
| 0.9 | 0.6 km | 0.6 km | 0 |

## Inputs

- Driver 1 slides along the road: drag the car, tap the road, or use the arrow keys (Home and End jump to 0.1 and 0.9).
- Under the picture, two controls: the two-way toggle (One by one, Together) and a chip that resets Driver 1 to 0.4 km.

## Picture

A road with rider A and rider B beside it, Driver 2 fixed on it and Driver 1 (the accent car) sliding. Below the road, two pairing lines drawn for the chosen mode, each with end markers (the rider letter and the driver number), the distance in words (for example `1. A gets Driver 1: 0.4 km`), and a small dot that drives from the driver to the rider. One by one numbers the steps 1 then 2 and the dots drive in that order; together drives both at once. When one by one wastes distance, the second line is red. A total chip and a saving chip (`0.8 km saved, 1.6 min`, or in One by one `Together saves 0.8 km, 1.6 min`) sit under the lines.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| saved is 0 | Same pairing either way (good) |
| One by one and saved above 0 | One by one wastes `<km>` km (bad); the number follows the model |
| Together and saved above 0 | Together: `<km>` km in total (good) |

All verdicts are 38 characters or fewer (tested for every position and both modes).

## Reduced motion and accessibility

- Reduced motion: the dots rest at the riders, so the picture shows the pairings made.
- The loop opens on the arrived picture, so a paused clock still shows the pairings.
- Driver 1 is a `role="slider"` with value text "Driver 1 at 0.4 km, one by one 1.9 km, together 1.1 km". The toggle buttons use `aria-pressed`. The pairings and totals are written in the picture's description.
- Colour sits next to words (verdict, distances in text).

## Limits

Two riders and two drivers on a line; real roads are not straight lines, and a window of thousands of riders needs a proper assignment method.

## Sources

Arithmetic on a course example (chapter 24.4 quiz and beat text).
