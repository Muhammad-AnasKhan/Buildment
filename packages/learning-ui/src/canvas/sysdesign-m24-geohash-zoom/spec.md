# Canvas spec: sysdesign-m24-geohash-zoom

- **Course and chapter:** system-design, module 24 (geospatial search and ride matching), chapter 24.2 beat 2, "A short code for every box".
- **Renderer:** custom beat canvas on `BeatFrame` (a tappable grid in the picture). Controls outside the picture: Back one letter and Reset, built from `BeatActionButton`. Pure model in `models/geohash-zoom.ts`.
- **Claim:** A geohash names a box. Each added letter picks one of 32 sub-boxes, so a longer code names a smaller box inside the bigger one.

## Model

- Odd letters (1, 3, 5, 7) cut the current box into 8 columns by 4 rows (3 longitude bits and 2 latitude bits). Even letters (2, 4, 6) cut it into 4 columns by 8 rows. North at the top, west at the left.
- The letters of each grid are computed from the bit order of a geohash (bits alternate longitude, latitude, starting with longitude), not typed in; the unit tests compare them with the spec grids:
  - odd: `b c f g u v y z` / `8 9 d e s t w x` / `2 3 6 7 k m q r` / `0 1 4 5 h j n p`
  - even (columns west to east, rows north to south): `p r x z` / `n q w y` / `j m t v` / `h k s u` / `5 7 e g` / `4 6 d f` / `1 3 9 c` / `0 2 8 b`
- Box size at the equator, from the bit counts and 111,195 m a degree: 1 letter 5,004 km by 5,004 km; 2 letters 1,251 km by 625 km; 3 letters 156 km by 156 km; 4 letters 39.1 km by 19.5 km; 5 letters 4.9 km by 4.9 km; 6 letters 1.2 km by 0.6 km; 7 letters 153 m by 153 m. The unit tests check each against the bit counts.

## Input

- Tap a sub-box to zoom into it. Or press on the map, slide to aim (the box under the finger lights up) and let go to zoom. Or move with the arrow keys and press Enter or Space.
- Start at the whole world (0 letters), with the grid of the first letter shown. At 7 letters the map shows one big final box (no more taps).
- Back one letter (Backspace also works) and Reset sit under the picture; both are off at 0 letters.

## Picture

The current box fills the map as 32 tappable boxes, each showing the letter it adds. Above it: the code so far as letter chips (the newest in the accent colour), the line `Box: 1.2 km by 0.6 km`, and a small inset where each smaller box is drawn inside the last. On a tap the old grid glides toward the box that was tapped while the new grid grows out of it, so the boxes visibly subdivide. Back plays the same glide in reverse.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| Start, no letters | Tap a box to add a letter (accent) |
| After any zoom | Longer code, smaller box (good) |
| After Back one letter, then a different sub-box | Same start, same neighbourhood (accent) |

All verdicts are 38 characters or fewer.

## Reduced motion and accessibility

- Reduced motion: zooming jumps without the glide (CSS transitions off).
- Each of the 32 boxes is a `role="button"` named "letter s, zoom in", with arrow-key movement (roving tab stop), Enter or Space to zoom and Backspace to go back. After a keyboard zoom, focus lands on the first box of the new grid. A screen reader's activate (a click with no pointer) also zooms.
- The code chips and the size line are live text (a polite region).
- Colour sits next to words (verdict banner, letters in the boxes).

## Limits

All 32 boxes are drawn the same size so the letters stay big enough to tap. The true boxes are not that shape. Sizes are for the equator; boxes are narrower away from it.

## Sources

Geohash alphabet, 5 bits per letter and box sizes: Wikipedia "Geohash", read 2026-10-24 (source needed in the dossier). The grids and sizes were computed with the module's own code.
