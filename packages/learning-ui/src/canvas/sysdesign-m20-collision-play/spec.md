# Canvas spec: sysdesign-m20-collision-play

- **Course and chapter:** system-design, module 20, chapter 20.3 beat 2, "Drag the length, watch the clashes".
- **Renderer:** custom beat canvas on `BeatFrame`, with two rails drawn inside the picture: `primitives/rail-slider.tsx` (stored links, log scale, drawn here) and `primitives/snap-stops-rail.tsx` (code length). Pure model in `models/wasla-collision.ts`.
- **Claim:** For random codes, the share of codes already taken is the chance that a new code clashes. At 30 billion links 6 characters is more than half full and 7 is under 1%. The first clash comes after about the square root of the keyspace, long before it is full.

## Model

| Quantity | Formula |
|---|---|
| Possible codes | 62^L |
| Share taken f | n / 62^L (full when f is 1 or more) |
| Extra tries per create | f / (1 - f); one create in 1 / f must retry |
| Extra tries a second | 193 x f / (1 - f) (193 creates a second) |
| First clash expected after | about 1.2533 x sqrt(62^L) links |

Checks (share taken at L = 7): 1M 0.000028%, 100M 0.0028%, 1B 0.028%, 30B 0.85% (1 in 117, 0.0086 extra tries, 1.66 a second). At L = 6 and 30B: 53%, 1 create in 2, 216 extra tries a second. Full table in `tests/unit/canvas/sysdesign-m20-playables.test.ts`.

## Inputs

- Code length L: snap rail 4 to 9 (default 6). Arrow keys step 1.
- Stored links n: log rail with snap points 1 million, 100 million, 1 billion, 10 billion, 30 billion (default 30 billion). A drag away from a snap point keeps two figures. Arrow keys move one snap.
- Deliberate extension of the spec: the rail starts at 1,000 links, and 1,000 is the first key stop, so the first-clash marker is always on the rail for every length (it sits at 4,818 for L = 4 and 298,696 for L = 6).

## Picture

A wide bar is the whole keyspace, labelled with its size ("3.52 trillion codes"); the taken share is shaded from the left with a 4 unit minimum so a tiny share is still seen, labelled with its percentage ("almost none taken" under one in a hundred million). Two cards under it: "1 in N creates must retry" and "extra tries a second". Below, the stored-links rail with an amber marker "first clash expected here" and its count; below that, the code-length rail. No animation.

## Verdicts

| Condition | Verdict (tone) |
|---|---|
| f is 1 or more | More links than codes (bad) |
| f of 0.25 or more | 1 create in N must retry, N = round(1 / f) (bad); "Every create must retry" when N rounds to 1 |
| f from 0.01 to 0.25 | 1 create in N must retry (warn) |
| f under 0.01 | Clashes are rare; a retry covers it (good) |

All 38 characters or fewer (tested for every length and snap point).

## Accessibility

- Each rail is a `role="slider"` with a value text such as "7 characters, 30 billion links, 0.85 percent of codes taken, 1 create in 117 retries". The SVG group has a text summary including the first-clash count.
- Reduced motion: nothing animates; the bar, numbers and knobs update at once.
- Colour sits next to words (the bar label, the verdict).

## Sources

Arithmetic. The square-root bound is the standard birthday bound (source listed in the chapter). Possible codes 62^L are exact.
