# Canvas spec: sysdesign-m23-estimate-play

- **Course and chapter:** system-design, module 23 (search, typeahead and probabilistic data structures), chapter 23.1 beat 2, "Drag the shoppers, find the load".
- **Renderer:** custom beat canvas on `BeatFrame`, built on `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) unchanged, as in `sysdesign-m20-estimate-play`. Pure model in `models/search-estimate.ts`; number formats from `models/envelope-estimate.ts` (`sig3`, `formatCount`, `flowRate`).
- **Claim:** For a search box, the suggestion calls and the index size shape the design; the search rate alone does not. The cards that matter are ringed.

## Model

| Quantity | Formula |
|---|---|
| Searches a day | shoppers x searches each |
| Searches a second, peak | searches a day / 86,400 x 3 |
| Suggestion calls a day | searches a day x calls each |
| Suggestion calls a second, peak | suggestion calls a day / 86,400 x 3 |
| Index size | products x 100 words x 4 bytes |
| Shards | max(1, ceil(index GB / 10)) |

Default (chapter 23.1): 50M shoppers, 4 searches each, 5 calls each, 200M products gives 6,944 searches a second at peak, 34,722 suggestion calls a second at peak, 80 GB and 8 shards. Fixed and shown on grey chips: the peak factor (3), the words per product (100), the bytes per entry (4) and the shard size (10 GB).

## Inputs

- Shoppers a day: 10M, 25M, 50M, 100M, 200M (default 50M). A blue card.
- Searches for each shopper: 1, 2, 4, 8 (default 4). A blue chip on the link to searches a day.
- Suggestion calls for each search: 1, 2, 3, 5, 8 (default 5). A blue chip on the link to the suggestion card.
- Products: 20M, 50M, 200M, 500M, 1B (default 200M). A blue card.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).

## Picture

Three chains. Left column: Shoppers a day, x searches each, Searches a day, / 86,400 x 3 peak, Searches a second at peak. Middle: from Searches a day, x calls each, then / 86,400 x 3 peak, Suggestions a second at peak. Right column: Products, x 100 words x 4 B, Index size, / 10 GB a shard, Shards. Dots flow along each link at a speed that grows with the log of the value the link leads to. The suggestion-calls-a-day number is a hidden step (the chip carries the multiplication); it is not drawn as a card so the picture stays at three columns on a phone.

## Rings and verdicts

Ring (tone warn) on the suggestions card when its peak is 10,000 or more; on the shards card when shards are 4 or more.

| Condition | Verdict (tone) |
|---|---|
| both rings | Suggestions and index size drive it (warn) |
| suggestion peak 10,000 or more, shards under 4 | Suggestions drive the traffic (warn) |
| shards 4 or more, suggestion peak under 10,000 | Index size drives: shard it (warn) |
| otherwise | One machine could serve this (good) |

All verdicts are 38 characters or fewer (tested across all 600 input combinations; all four appear).

## Numbers checked (tested)

50M/4/5/200M: 6,944 and 34,722 a second, 80 GB, 8 shards. 10M/2/3/50M: 694 and 2,083, 20 GB, 2 shards. 100M/8/5/500M: 27,778 and 138,889, 200 GB, 20 shards. 25M/1/1/20M: 868 and 868, 8 GB, 1 shard. 200M/4/5/200M: 27,778 and 138,889, 80 GB, 8 shards. 50M/4/2/200M: 6,944 and 13,889, 80 GB, 8 shards. 50M/4/5/1B: 6,944 and 34,722, 400 GB, 40 shards.

## What the learner should notice

- Search stays near 7,000 a second at the default; suggestions are five times that.
- Calls for each search moves the suggestion card but never the index; products moves the index and the shards but never the rates.
- At small inputs, one machine could serve it.

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with a value text such as "50 million shoppers a day, 6,944 searches a second at peak, 34,722 suggestion calls a second, 80 GB index, 8 shards". The rings are written in the SVG description and in the verdict.
- Reduced motion: dots do not flow; the cards show their final values (the primitive draws still dots).
- Colour sits next to words (verdict, ring plus card).

## Limits shown to the learner

Averages and guesses; one peak factor for both kinds of traffic; real apps wait before asking for suggestions; the index size leaves out compression and copies; the marks of 10,000 calls a second and 4 shards are rules of thumb for the picture.

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method). No external source.
