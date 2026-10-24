# Canvas spec: sysdesign-m21-estimate-play

- **Course and chapter:** system-design, module 21 (news feed and timelines), chapter 21.1 beat 2, "Drag the volume, find the driver".
- **Renderer:** custom beat canvas on `BeatFrame`, built on the existing `primitives/estimate-chain.tsx` (`EstimateChain`, `StepSlider`) as in `sysdesign-m20-estimate-play`. Pure model in `models/feed-estimate.ts`, shared course numbers in `models/feed-numbers.ts`, number formats reused from `models/envelope-estimate.ts` (`sig3`, `formatCount`, `formatBytes`, `flowRate`).
- **Claim:** For a feed, posts are few and reading is the load: feed opens a second dwarf posts a second, and building each feed from scratch would cost one lookup per followed account. The card with the biggest consequence is ringed.

## Model

| Quantity | Formula |
|---|---|
| Feed opens a day | daily users x opens per user |
| Feed opens a second, average / peak | opens a day / 86,400; peak = average x 3 |
| Posts a day | daily users x 0.2 |
| Posts a second, average / peak | posts a day / 86,400; peak = average x 3 |
| Lookups a second if each open builds its own list | peak feed opens x follows |
| Timeline storage | daily users x 800 ids x 8 bytes |
| Reads for each post | opens per user / 0.2 |

Default (the chapter): 50 million daily users, 10 opens, 150 follows gives 17,361 feed opens a second at peak, 347 posts a second, 2.6 million lookups a second, 320 GB, 50 reads for each post.

## Inputs

- Daily users: 10M, 25M, 50M, 100M (default 50M). The blue start card.
- Feed opens per user a day: 1, 2, 5, 10, 20 (default 10). A blue chip on the link to feed opens a day.
- Follows per account: 50, 150, 500 (default 150). A blue chip on the link to the lookups card.
- Tap a blue number, then drag it sideways, use the arrow keys, Home and End, or use the one slider under the picture (the only control outside the picture).
- Fixed and labelled "assumed" on their chips: the peak factor (x 3) and the posts per user (x 0.2). The 800 ids x 8 B chip is fixed too (chapter 21.1).

## Picture

Three chains that start at the Daily users card. Left: feed opens a day, a second on average, a second at peak, lookups a second if each open builds its own list (x follows). Middle: posts a day, a second on average, a second at peak. Right: timeline storage. Dots flow along each link at a speed that grows with the log of the value the link leads to (against 5,000 a second, one app server's plan, or against 1 TB).

## Ring and verdicts

The ring (tone warn) goes on the lookups card when it is 100,000 a second or more, otherwise on the peak feed opens card when reads for each post are 25 or more, otherwise nowhere.

| Condition (reads for each post) | Verdict (tone) |
|---|---|
| 25 or more | Reads dwarf posts: build ahead (warn) |
| 10 to 24 | Reads lead: building ahead pays (warn) |
| under 10 | Close: building on read could work (good) |

All verdicts are 38 characters or fewer.

## What the learner should notice

- Posts stay tiny (under 700 a second even at 100 million daily users); reads multiply them by the opens a day divided by 0.2.
- Opens per user moves the feed side and the lookups, never the posts or the storage; daily users moves everything.
- With 1 open a day and few follows the lookups fall to about 17,000 a second and the answer flips to "close".

## Accessibility

- Each input is a `role="slider"` (arrows, Home, End) with a value text such as "50 million daily users, 17,361 feed opens a second at peak, 347 posts a second, 2.6 million lookups a second if built on read". The ring is also written in the SVG description.
- Reduced motion: dots do not flow; the cards show their final values (the primitive draws still dots).
- Colour sits next to words (verdict, ring plus label).

## Sources

Arithmetic on course assumptions (chapter 2.3 for the method). No external source.
