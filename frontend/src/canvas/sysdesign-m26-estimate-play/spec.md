# Canvas spec: sysdesign-m26-estimate-play

- **Course and chapter:** system-design, module 26 (web crawler), chapter 26.1 beat 2, "Drag the volume, find the load".
- **Renderer:** custom beat canvas on `BeatFrame`, built on `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m20-estimate-play`. Pure model in `models/crawl-estimate.ts`, shared course numbers in `models/crawl-numbers.ts`, number formats from `models/envelope-estimate.ts` and `models/picture-controls.ts`.
- **Claim:** For a polite crawler, bandwidth and machines are spread out and easy. The number that drives the design is how many different sites must have work ready at the same moment: pages a second times the wait between requests to one site.

## Model

| Quantity | Formula |
|---|---|
| Pages a second | pages a month / 2,592,000 |
| Data in (Mbit/s) | pages a second x page size (KB) x 8 / 1,000 |
| Sites busy at once | pages a second x wait |
| Fetches in flight | pages a second x 0.5 s (Little's law, chapter 2.5) |
| Link checks a second | pages a second x 50 |
| Stored a month (TB) | pages a month x page size (KB) / 4 / 1,000,000,000 |

Default (the chapter): 2 billion pages, 100 KB, 1 second gives 772 /s, 617 Mbit/s, 772 sites, 386 in flight, 38,580 link checks a second and 50 TB a month.

## Inputs

- Pages a month: 0.5, 1, 2, 5, 10 billion (default 2 billion). The blue start card.
- Page size: 20, 50, 100, 200, 500 KB (default 100). A blue chip on the link to data in (and the same input on the link to storage).
- Wait between requests to one site: 0.5, 1, 2, 5 seconds (default 1). A blue chip on the link to sites busy.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed, written under the picture as "Assumptions": 0.5 s a fetch, 50 links a page, 4 to 1 saving.

Changed from the written spec: the page size and the wait are chips on links, not cards, the same way `sysdesign-m20-estimate-play` does it. This keeps seven cards readable on a 420 wide picture and reuses the primitive unchanged. The three inputs are still dragged in the picture.

## Picture

Left column: pages per month, pages a second, sites busy at once. Right column: stored a month, data coming in, fetches in flight, link checks a second. Dots flow along each link at a speed that grows with the log of the value the link leads to (against 1,000 pages a second, 100 sites, 5,000 Mbit/s, 500 in flight, 50,000 link checks and 20 TB).

## Ring and verdicts

The ring (tone warn) goes on data in at 5,000 Mbit/s or more, otherwise on sites busy at 100 or more, otherwise on stored a month at 20 TB or more, otherwise nowhere.

| Ring | Verdict (tone) |
|---|---|
| Data in | Bandwidth drives it: spread the load (warn) |
| Sites busy at once | Politeness: need many sites at once (warn) |
| Stored a month | Storage drives it: plan the disks (warn) |
| none | One machine could crawl this (good) |

All verdicts are 38 characters or fewer (tested across every input combination).

## What the learner should notice

- Data in and link checks are big but easy to spread; the number that does not shrink with a faster network is sites busy at once.
- Doubling the wait doubles the sites needed; halving the page size does not change them.
- Only at 10 billion pages of 500 KB does bandwidth take the ring.

## Accessibility

Each input is a `role="slider"` (arrow keys, Home, End) with value text such as "2 billion pages a month, 772 pages a second, 772 sites busy at once, ...". The ring is written in the picture's description and the verdict. With reduced motion the dots do not flow and the cards show their final values.
