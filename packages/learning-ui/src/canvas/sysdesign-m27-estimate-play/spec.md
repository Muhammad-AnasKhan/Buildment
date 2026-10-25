# Canvas spec: sysdesign-m27-estimate-play

- **Course and chapter:** system-design, module 27 (video platform at scale), chapter 27.1 beat 2, "Drag the views, find the load".
- **Renderer:** custom beat canvas on `BeatFrame`, built on `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m20-estimate-play`. Pure model in `models/lamha-estimate.ts`, shared course numbers in `models/lamha-numbers.ts`, number formats reused from `models/envelope-estimate.ts`.
- **Claim:** For a video platform, views a second are small, but each view lasts minutes, so millions watch at once and the bandwidth is the load. Storage and transcoding are real costs; the ringed card is the number that drives the design.

## Model

| Quantity | Formula |
|---|---|
| Views a second | views a day / 86,400 |
| Viewers at once | views a second x minutes x 60 (Little's law, chapter 2.5) |
| Video sent, average | viewers at once x 2 Mbit/s |
| Video sent, peak | average x 3 |
| Stored a year | uploads a day x 739 MB x 365 |
| Busy machines, average | uploads a day x 15 / 1,440 |
| Busy machines, peak | average x 3 |

Default (the chapter): 1 billion views, 3 minutes, 500,000 uploads gives 11,574 /s, 2.1 million viewers, 4.2 Tbit/s average, 12.5 Tbit/s at peak, 135 PB a year, 5,200 busy machines on average and 15,600 at peak.

## Inputs

- Views a day: 100M, 500M, 1B, 2B, 5B (default 1B). The blue start card of chain 1.
- Minutes watched per view: 1, 2, 3, 5, 10 (default 3). A blue chip on the link to viewers at once.
- Uploads a day: 100k, 250k, 500k, 1M, 2M (default 500k). The blue start card of chains 2 and 3.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed and listed in a dashed "assumptions, fixed" card: 2 Mbit/s sent to a viewer, the peak factor 3, 739 MB stored per video, 15 worker-minutes per video.

## Picture

Chain 1 (left column): Views a day, divide by 86,400 s, Views a second, x minutes x 60, Viewers at once, x 2 Mbit/s, Video sent average, x 3 peak, Video sent peak. Chain 2: Uploads a day, x 739 MB x 365, Stored a year. Chain 3: Uploads a day, x 15 / 1,440, Busy machines average, x 3 peak, Busy machines peak. Dots flow along each link at a speed that grows with the log of the value the link leads to (against 1,000 a second, 100,000 viewers, 1 Tbit/s, 10 PB or 1,000 machines).

## Ring and verdicts

The ring (tone warn) goes on the peak video-sent card when it is 1 Tbit/s or more, otherwise on the stored-a-year card when it is 10 PB or more, otherwise on the busy-machines-at-peak card when it is 1,000 or more, otherwise nowhere.

| Condition | Verdict (tone) |
|---|---|
| peak sent 1 Tbit/s or more | Bandwidth drives it: a CDN is a must (warn) |
| peak sent under 1 Tbit/s, stored 10 PB or more | Storage drives it: plan cold tiers (warn) |
| the two above not met, peak machines 1,000 or more | Transcoding drives it: size the fleet (warn) |
| otherwise | A few servers could serve this (good) |

At the lowest snaps (100M views, 1 minute, 100k uploads) the peak sent is 0.42 Tbit/s and storage is 27 PB, so the storage card is ringed. "A few servers could serve this" cannot be reached inside the input ranges; it stays in the model for a builder who widens them. All verdicts are 38 characters or fewer (tested).

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with a value text such as "1 billion views a day, 11,574 views a second, 2.08 million viewers at once, 12.5 terabits a second at peak, ...". The ring is also written in the SVG description and the verdict.
- Reduced motion: dots do not flow; the cards show their final values.
- Colour sits next to words (verdict, ring plus label).

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method, chapter 2.5 for Little's law [S5]). No external source. Bit rates and the ladder are listed as source needed in the chapter.
