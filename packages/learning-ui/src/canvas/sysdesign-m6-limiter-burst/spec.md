# Canvas spec: sysdesign-m6-limiter-burst

- **Course and chapter:** system-design, 6.5 ("Rate limiting algorithms"), beat 6 "Same burst, five limiters". New slug.
- **Renderer:** custom beat canvas on `BeatFrame`, with `RailSlider` and `SliderRail` for the rail under the strips, `DotGrid`, `VerdictBanner` and `BeatButton` (Replay).
- **Claim:** With the same traffic, a fixed window lets 2 times the limit through across a boundary, while sliding windows and buckets do not.
- **Model** (`models/limiter-burst.ts`): limit 5 a minute. Burst A is 5 requests at 0:59, all allowed. Burst B is 5 requests at b seconds, dragged from 59 to 119. Allowed in B: fixed window 5 if b >= 60 else 0; sliding log 5 if b >= 119 else 0; sliding counter floor(5 (b - 60) / 60) for b >= 60 else 0; token bucket min(5, floor((b - 59) / 12)); leaky bucket 5 - max(0, 4 - floor((b - 59) / 12)), where accepted requests wait about 12 s times their place in the queue.
- **Inputs:** a rail inside the picture, 59 to 119 seconds in steps of 1, snaps at 59, 60, 75, 90 and 119, default 60. Replay outside the picture.
- **Worked values (fixed / log / counter / token / leaky):** b = 59: 0 / 0 / 0 / 0 / 1. 60: 5 / 0 / 0 / 0 / 1. 75: 5 / 0 / 1 / 1 / 2. 90: 5 / 0 / 2 / 2 / 3. 119: 5 / 5 / 4 / 5 / 5.
- **Picture:** five rows, one per limiter, each a short time strip from 0:50 to 2:00 with a dashed minute line at 1:00. Burst A and burst B are columns of five dots on every row; allowed dots are green, refused dots are red rings, dots wait grey until the replay reaches them. In the leaky row accepted dots slide right in proportion to their wait (drawn shorter than the real wait) and the label says how long the last one waits. Each row's label reads "B: n of 5". The rail handle sits under the burst B column.
- **Verdicts:** b < 60 "Same window: nobody allows more"; 60 to 74 "Only the fixed window let 10 in"; 75 to 118 "Others allow only what has expired"; 119 "A full minute later: all allow 5".
- **Playback:** 6 second loop; after any change the finished picture shows and the replay starts 1.1 seconds later. Under reduced motion the finished picture shows.
- **Accessibility:** the rail is a `role="slider"` with value text "m:ss" plus the verdict; the SVG description lists what each limiter accepted.
- **Sources:** [S29] sliding window counter; [S30] and [S32] token bucket; [S31] leaky bucket (nginx). Fixed window and sliding log are derived designs (no primary source).
