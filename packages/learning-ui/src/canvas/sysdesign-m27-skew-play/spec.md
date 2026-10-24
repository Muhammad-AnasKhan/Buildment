# Canvas spec: sysdesign-m27-skew-play

- **Course and chapter:** system-design, module 27, chapter 27.4 beat 5, "Drag the skew, watch the origin".
- **Renderer:** custom beat canvas on `BeatFrame`: `SvgNode` cards, two `SnapStopsRail` rails inside the picture (the cache rail spaced by the log of the size), a popularity curve drawn in SVG. Pure model in `models/lamha-skew.ts`, course numbers in `models/lamha-numbers.ts`. The suggested `log-ruler` primitive is a rung picker with its own SVG, so a log-spaced snap rail is used instead.
- **Claim:** The CDN hit rate depends on how views are spread over the catalogue (the skew) and on the size of the cache. A steep skew needs a small cache; a mild skew leaves a large share of plays to the origin, whatever the cache size within reach.

## Model

Catalogue N = 1 billion videos; peak sent 12.5 Tbit/s; origin budget 1 Tbit/s. The video ranked r gets views in proportion to 1 / r^s. The edge keeps the C most-watched videos.

- Hit rate = H(C, s) / H(N, s), with H(n, s) = sum of r^-s for r from 1 to n.
- H is exact up to n = 100,000. Beyond, H(n, s) = H(K, s) + the integral from K to n of x^-s (natural log of n / K for s = 1) + (n^-s - K^-s) / 2 + s / 12 x (K^(-s-1) - n^(-s-1)), with K = 100,000.
- Origin = 12.5 x (1 - hit rate) Tbit/s.
- Checks (tested): H(200,000, 1.0) = 12.78329081 both exactly and by the formula; H(300,000, 0.8) = 57.84902932 both ways.

## Inputs

- Skew s on a snap rail: 0.8, 0.9, 1.0, 1.1, 1.2, 1.3 (default 1.0).
- Cache size C on a snap rail spaced by log: 100 thousand, 1 million, 10 million, 100 million (default 1 million).
- Arrow keys step one snap; Home and End jump to the ends. No control outside the picture.

## Picture

Top: the popularity curve, views per video against rank, both on log scales (so the curve is a straight line whose slope is the skew). The first C ranks are shaded and carry the share of plays they cover ("68% of plays kept at the edge"). Middle: a CDN edge card (hit rate) and an Origin card (Tbit/s, ringed in the verdict tone). Below: a bar from 0 to the 12.5 Tbit/s sent with no cache, a tick at the 1 Tbit/s budget and a dot at the origin load. Requests flow as dots; the share that goes on to the origin is 1 minus the hit rate.

## Numbers (tested)

Each cell is hit rate, then origin Tbit/s at peak.

| Skew | 100 thousand | 1 million | 10 million | 100 million |
|---|---|---|---|---|
| 0.8 | 14.6%, 10.67 | 24.1%, 9.49 | 39.0%, 7.63 | 62.6%, 4.68 |
| 0.9 | 31.7%, 8.54 | 43.4%, 7.08 | 58.1%, 5.23 | 76.7%, 2.92 |
| 1.0 | 56.8%, 5.41 | 67.6%, 4.05 | 78.4%, 2.70 | 89.2%, 1.35 |
| 1.1 | 79.6%, 2.55 | 86.6%, 1.68 | 92.1%, 0.99 | 96.5%, 0.44 |
| 1.2 | 92.4%, 0.95 | 95.7%, 0.54 | 97.8%, 0.27 | 99.2%, 0.11 |
| 1.3 | 97.5%, 0.31 | 98.8%, 0.15 | 99.5%, 0.06 | 99.8%, 0.02 |

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| origin 1.0 Tbit/s or less | Origin under its 1 Tbit/s budget (good) |
| origin above 1.0 and up to 3.0 | Origin sends 1.7 Tbit/s: over budget (warn) |
| origin above 3.0 | Origin sends 7.1 Tbit/s: over budget (bad) |

The number has one decimal (two when one decimal would round to 1.0). All verdicts are 38 characters or fewer for every pair of snaps (tested).

## Accessibility

- Each rail is a `role="slider"` with value text such as "skew 1.0, cache of 1 million videos, 67.6 percent of plays answered at the edge, the origin sends 4.05 terabits a second, 4 times its budget".
- Reduced motion: no flowing dots (a few still dots mark the share that misses); the curve and the numbers update at once.
- Colour sits next to words (verdict, the percentage on the shaded part).

## Sources

Arithmetic on a Zipf shape with invented exponents (source needed for a real figure, listed in the chapter). Origin budget and catalogue size are course numbers. The 80 ms read and 160 ms round trip used in the next beat are napkin math [S3].
