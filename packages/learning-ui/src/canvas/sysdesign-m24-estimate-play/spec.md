# Canvas spec: sysdesign-m24-estimate-play

- **Course and chapter:** system-design, module 24 (geospatial search and ride matching), chapter 24.1 beat 2, "Drag the crowd, find the load".
- **Renderer:** custom beat canvas on `BeatFrame`, built on the existing `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m20-estimate-play`. Pure model in `models/safar-estimate.ts`; number formats reused from `models/envelope-estimate.ts` (`sig3`, `formatCount`, `formatBytes`, `flowRate`).
- **Claim:** For a ride service the stream of location reports is the load. Searches matter less and ride requests are tiny. The ringed card is the number that drives the design.

## Model

| Quantity | Formula |
|---|---|
| Reports a second | drivers online / seconds between reports |
| Bandwidth in | reports a second x 50 B |
| Searches a second | riders with the app open / 5 |
| Ride requests a second at peak | 10,000,000 / 86,400 x 5 (about 579, fixed) |
| Latest places in memory | drivers online x 100 B |

Default (the chapter): 1 million drivers, a report every 4 seconds, 200,000 riders gives 250,000 reports a second, 12.5 MB/s in, 40,000 searches a second, about 580 ride requests a second at peak and 100 MB of latest places.

## Inputs

- Drivers online: 100K, 250K, 500K, 1M, 2M (default 1M). The blue card at the top left.
- Seconds between reports: 1, 2, 4, 8, 15 (default 4). A blue chip on the link between drivers and reports.
- Riders with the app open: 50K, 100K, 200K, 500K (default 200K). The blue card at the top right.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed and labelled "assumed": 50 B a report, the 5 s map refresh, 10 million rides a day, the peak factor of 5 and 100 B a driver.

## Picture

Four chains. Left column: Drivers online, divide by the seconds between reports, Reports a second, x 50 B, Bandwidth in. The fourth chain also starts at Drivers online: its line runs down the gutter between the columns, x 100 B, to Latest places. Right column: Riders with the app open, divide by 5 s, Searches a second; Rides a day, divide by 86,400 and x 5 peak, Ride requests at peak. Dots flow along each link at a speed that grows with the log of the value the link leads to.

## Ring and verdicts

The ring (tone warn) goes on the Reports card when reports are 25,000 a second or more and at least the searches. It goes on the Searches card when searches are larger than the reports and 10,000 or more. Otherwise nowhere.

| Condition | Verdict (tone) |
|---|---|
| reports 25,000 or more and at least the searches | Updates drive it: keep them in memory (warn) |
| searches larger than the reports and 10,000 or more | Searches drive it: cache the map (warn) |
| reports and searches both under 2,500 | One database could serve this (good) |
| otherwise | Busy, but a few servers can do it (warn) |

All verdicts are 38 characters or fewer (tested across every input combination).

## What the learner should notice

- Reports (250,000 a second) are far above searches (40,000) and ride requests (about 580). Most systems are read heavy; Safar is not.
- Halving the gap doubles the reports and the bandwidth, and never changes the memory.
- Drivers move memory and reports; riders move only searches.

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with a value text such as "1 million drivers, a report every 4 seconds, 250,000 reports a second, 40,000 searches a second". The ring is also written in the SVG description and the verdict.
- Reduced motion: dots do not flow; the cards show their final values (the primitive draws still dots).
- Colour sits next to words (verdict, ring plus label).

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method). No external source.
