# Canvas spec: sysdesign-m20-estimate-play

- **Course and chapter:** system-design, module 20 (URL shortener and paste service), chapter 20.1 beat 2, "Drag the volume, find the load".
- **Renderer:** custom beat canvas on `BeatFrame`, built on the existing `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m2-estimator`. Pure model in `models/wasla-estimate.ts`, shared course numbers in `models/wasla-numbers.ts`, number formats reused from `models/envelope-estimate.ts` (`sig3`, `formatCount`, `formatBytes`, `flowRate`).
- **Claim:** For a link shortener, creating links is small; opening them is the load, and storage over years is the second driver. The card with the biggest consequence is ringed.

## Model

| Quantity | Formula |
|---|---|
| Creates a second | new links a month / 2,592,000 |
| Redirects a second, average | creates x reads per link |
| Redirects a second, peak | average x 5 (fixed assumption) |
| Links stored | new links a month x 12 x years |
| Storage | links stored x 300 bytes (fixed assumption) |

Default (the chapter): 500 million new links, 100 reads per link, 5 years gives 193 /s creates, 19,300 /s average, 96,500 /s peak, 30 billion links and 9 TB.

## Inputs

- New links a month: 100M, 200M, 500M, 1B, 2B (default 500M). The blue start card.
- Reads per link: 10, 50, 100, 200, 1,000 (default 100). A blue chip on the link between creates and average redirects.
- Years kept: 1, 2, 5, 10 (default 5). A blue chip on the link to links stored.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed and labelled "assumed" on their chips: the peak factor (x 5) and the bytes per link (x 300 B).

## Picture

Two chains that start at the same card. Upper: New links a month, divide by 2,592,000 s, Creates a second, x reads, Redirects average, x 5 peak, Redirects at peak. Lower: New links a month, x 12 x years, Links stored, x 300 B, Storage. Dots flow along each link at a speed that grows with the log of the value the link leads to (against 5,000 a second, one app server's plan, or against 5 TB). Reads and years are chips on links, as in `sysdesign-m2-estimator`, not separate cards: this keeps the chain readable on a 420 wide picture and reuses the primitive unchanged.

## Ring and verdicts

The ring (tone warn) goes on the peak card when peak reads are 2,500 or more, otherwise on the storage card when storage is 5 TB or more, otherwise nowhere.

| Condition | Verdict (tone) |
|---|---|
| peak 50,000 or more | Reads drive it: a cache is a must (warn) |
| peak 2,500 to 49,999 | Reads matter: a cache helps a lot (warn) |
| peak under 2,500 and storage 5 TB or more | Storage drives it: spread the data (warn) |
| otherwise | One database could serve this (good) |

All verdicts are 38 characters or fewer (tested across every input combination).

## What the learner should notice

- Creates stay small (under 800 a second even at 2 billion links a month); reads multiply them by 100 and by 5.
- Reads per link moves the peak card but never the storage; years moves storage but never the rates.
- At few reads and few years, one database could serve it.

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with a value text such as "500 million new links a month, 193 creates a second, 96,451 redirects a second at peak, 9 terabytes". The ring is also written in the SVG description and the verdict.
- Reduced motion: dots do not flow; the cards show their final values (the primitive draws still dots).
- Colour sits next to words (verdict, ring plus label).

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method). No external source.
