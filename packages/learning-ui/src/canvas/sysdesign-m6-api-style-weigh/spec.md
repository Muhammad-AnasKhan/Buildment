# Canvas spec: sysdesign-m6-api-style-weigh

- **Course and chapter:** system-design, 6.2 ("API styles"), beat 4 "Weigh what matters, see who wins". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, drawn with `SvgChip`, `SvgButton`, `DotGrid` and `VerdictBanner`. Custom because the picture is three option cards over five tappable need rows, which the factor renderer does not draw.
- **Claim:** The right API style depends on the caller: weighting reach and caching picks REST, round trips from far-away screens pick GraphQL, small fast calls between services pick gRPC.
- **Model** (`models/api-style-weigh.ts`): weighted sum, total = sum over needs of (weight x score). Weights: 0 "skip" (not needed), 1 "nice", 3 "must". Scores 1 to 5 are course judgments:

  | Need | REST | GraphQL | gRPC |
  |---|---|---|---|
  | Wide reach | 5 | 4 | 2 |
  | Few round trips | 2 | 5 | 3 |
  | Fast service calls | 2 | 2 | 5 |
  | Free caching | 5 | 2 | 1 |
  | Easy to run | 5 | 3 | 3 |

- **Inputs:** tap a need row to cycle skip, nice, must. Three preset chips inside the picture: Partner API (3, 1, 0, 3, 1), Mobile screens (1, 3, 0, 1, 1), Internal services (0, 1, 3, 0, 1). Default: Partner API. No controls outside the picture.
- **Worked totals (REST / GraphQL / gRPC):** Partner API 37 / 26 / 15. Mobile screens 21 / 24 / 15. Internal services 13 / 14 / 21.
- **Picture:** three option cards with a bar that grows with the total (scale 0 to the highest possible total, 57) and the total as the one number; the leader's card gets an accent ring (an amber ring on every card within 2 points when the race is close). Under them, five need rows, each with a chip showing the weight and five dots per style showing its score; dots dim when a need is skipped.
- **Verdicts:** lead of 2 or more: "REST wins: reach and caching", "GraphQL wins: one trip per screen", "gRPC wins: small typed calls". Lead under 2: "Close: pick what your team runs".
- **Reduced motion:** nothing animates except bar growth and colour changes, which are CSS transitions turned off under reduced motion.
- **Accessibility:** every preset chip and need row is a `role="button"` with a label that says the need, the weight in words and what a tap does; preset chips use `aria-pressed`. Colour is never the only signal: the chip says skip, nice or must, and the verdict is in words.
- **Sources:** [S3] round trips; [S12] HTTP/2; [S22] caching. The scores are not sourced numbers.
