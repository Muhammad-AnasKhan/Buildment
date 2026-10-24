# Canvas spec: sysdesign-m13-hot-partition

- **Course and chapter:** system-design, 13.4 ("DynamoDB today versus the Dynamo paper"), beat 5, "A hot partition stays capped".
- **Renderer:** custom beat canvas on `BeatFrame` with `BeatChoice`, `DotGrid`, `VerdictBanner`. The whole hot card is the vertical drag surface, so it is a bespoke slider rather than `PictureSlider`.
- **Claim:** A table's write throughput is shared over its partitions, so a hot partition can be throttled while the table is far under its total. Adaptive capacity lets it borrow unused throughput, but one partition has a ceiling of 1,000 writes per second.
- **Model** (`model.ts`, illustrative): 2,000 write units a second, 4 partitions, share 500; three background partitions at 200 each (600); hot demand d. Off: accepted = min(d, 500). On: accepted = min(d, 1,000, 2,000 - 600). Table use = 600 + accepted.
- **Inputs:** drag the hot bar's handle 0 to 2,000 in steps of 100 (arrows 100, Page keys 500, default 800). Outside the picture: Adaptive off | on.
- **Numbers to check** (tests): d 300, 500, 800, 1,000, 1,500, 2,000: off accepted 300, 500, 500, 500, 500, 500; on 300, 500, 800, 1,000, 1,000, 1,000; table use off 900, then 1,100 five times; on 900, 1,100, 1,400, then 1,600 three times.
- **Verdicts:** "Within its share: nothing rejected"; "Rejects 300/s: share is only 500"; "Borrowed spare capacity: none rejected"; "Ceiling 1,000/s: 500 still rejected". The spec's "500/s still rejected" would be 39 characters at 1,000 rejected, so the second "/s" is dropped.
- **Picture:** four partition cards; the hot bar splits into an accepted part and a dashed red rejected cap above the line; the line is at the share (500, grey) or at the ceiling (1,000, green) when adaptive is on; a pill by the line and a "lost" pill by the cap; request dots fall into the partitions and the rejected ones turn red at the line; a table bar underneath against the 2,000 paid for.
- **Reduced motion:** no falling dots; bars and caps jump to their values.
- **Accessibility:** the drag is a `role="slider"` with value text "hot key 800 writes a second, 300 rejected".
- **Sources:** [S40], [S44]. The share and borrowing rules are flagged `source needed` in the chapter.
