# Canvas spec: sysdesign-m5-cache-path

- **Course and chapter:** system-design, 5.2 "Where caches live", beat "Add up the path". Custom beat canvas on `BeatFrame`; controls from `primitives/slider-zone.tsx`; model `models/cache-path.ts`.
- **Claim:** The layer nearest the user decides the wait; the layer nearest the database decides the database load. A design needs both numbers.
- **Picture:** Shopper (Singapore), CDN edge, App memory, Valkey and Database as `SvgNode` cards in a column. Two lanes run beside the cards: request dots go down the left lane, answers come back up the right lane, and each dot turns back at the layer that hits, in the proportion of that layer's hit rate (a low-discrepancy sequence, so a few dots already split correctly). The edge-to-origin trip is the slow stretch. A hit-rate bar with a knob sits beside each cache card.
- **Numbers beside what they describe:** "time added after the edge" by the 160 ms trip; "queries a second reach the database" by the Database card.
- **Model:** T = (1 - he) x (160 + 0 + (1 - hm) x (0.5 + (1 - hv) x 2.5)) ms; queries = 1,000 x (1 - he)(1 - hm)(1 - hv) x 5. Costs: edge to origin 160 ms (S3), memory about 0, Valkey 0.5 ms (S3), five queries of 0.5 ms (story).
- **Inputs:** three hit rates, 0 to 99 percent, step 1, snaps 0, 50, 80, 90, 95 on drag. Arrow keys step 1, Page keys 10, Home and End. Defaults 80, 0, 90.
- **Numbers to check:** defaults 32.2 ms and 100 queries a second; edge 90: 16.1 ms and 50; edge 80 with Valkey 50: 32.4 ms and 500; all zero: 163 ms and 5,000.
- **Verdicts:** under 20 ms and under 200 queries "Fast for shoppers, calm database"; fast, busy "Fast pages, busy database"; slow, calm "Calm database, slow far away"; else "Slow pages and a busy database".
- **Motion and reduced motion:** dots on the beat clock; under reduced motion no dots, the bars, numbers and verdict still show the input.
- **Accessibility:** three `role="slider"` zones (44 px tall) with value text that gives the percent, both numbers and the verdict; the SVG has a summary label.
