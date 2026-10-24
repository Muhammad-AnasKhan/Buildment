# Canvas spec: sysdesign-m26-host-rate-play

- **Course and chapter:** system-design, module 26 (web crawler), chapter 26.3 beat 3, "Sites in play set the speed". A predict ("20 sites, 800 slots, 1 second: how many pages a second?") sits right before it.
- **Renderer:** custom beat canvas on `BeatFrame` with two `SnapStopsRail`s inside the picture. Pure model in `models/crawl-host-rate.ts`; course numbers in `models/crawl-numbers.ts`.
- **Claim:** The crawl speed is the smaller of two limits: sites with work waiting divided by the wait, and download slots divided by the fetch time. With few sites, extra slots do nothing. A big site at one request a second takes weeks.

## Model

| Quantity | Formula |
|---|---|
| Politeness limit | sites / wait (pages a second) |
| Capacity limit | 800 slots / 0.4 s = 2,000 |
| Speed | the smaller of the two (the limit in force: sites, slots, or both when equal) |
| Sites needed for 772/s | 771.6 x wait |
| Days for the big site | 1,000,000 x wait / 86,400 |

## Inputs

- Sites with work waiting: 10, 20, 50, 100, 300, 772, 1,000, 3,000, 10,000 (default 20). Snap points are spaced evenly along the rail, not by log distance, so the labels 772 and 1,000 do not collide.
- Wait between requests to one site: 0.5, 1, 2, 5 seconds (default 1).
- Arrow keys, Home and End step one snap. No control outside the picture. Fixed: 800 slots, 0.4 s a fetch, a big site of 1,000,000 pages.

## Picture

A row of up to 24 site icons (the number beside the title is the true count) in a card, a dotted lane from each down to a Fetch slots bar. Each lane releases a dot once per wait (slower when slots are the limit). The bar fills to the speed against 2,000, with a mark at 772. A ring (warn) goes on the limiting card (both when equal). Readouts: "Speed: N pages/s", "limit: sites | slots | both", a card "Needed for 772/s: N sites" and a card "One site of 1 million pages: N days".

## Verdicts (38 characters or fewer, tested; N is the speed with a thousands comma)

| Condition | Verdict (tone) |
|---|---|
| limit is sites, speed under 386 | Too few sites: N pages a second (bad) |
| limit is sites, speed 386 to 771 | Short of 772: N pages a second (warn) |
| limit is sites, speed 772 or more | Enough sites: N pages a second (good) |
| limit is slots or both | Slots are the limit: 2,000 a second (good) |

## What the learner should notice

At 20 sites the 800 slots sit idle. Raising the wait raises the sites needed in proportion (772, 1,543, 3,858). A big site always takes days to weeks, whatever the slots.

## Accessibility

Each rail is a `role="slider"` with value text such as "20 sites, 1 second wait, 20 pages a second, limited by sites". The picture's description repeats the limits and the verdict. With reduced motion the dots stop (shown at fixed places); the fill and the readouts show final values.
