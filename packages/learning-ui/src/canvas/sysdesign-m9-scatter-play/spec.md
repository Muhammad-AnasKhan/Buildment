# Canvas spec: sysdesign-m9-scatter-play

- **Course and chapter:** system-design, 9.6 ("Secondary indexes and cross-shard queries"), beat 4, "Drag the shard count: the tail grows".
- **Renderer:** custom beat canvas on `BeatFrame`, built on the fan-out model and layout of chapter 2.4 (`models/fan-out.ts`, `models/fan-out-layout.ts`; same fan of tiles, tally, wire and rail as `sysdesign-m2-fan-out-play`) with "backends" renamed "shards". `model.ts` adds the index mode. Uses `primitives/beat-choice.tsx` for the Local | Global switch.
- **Claim:** A search that must ask every shard is slow whenever any shard is slow, so the share of slow searches climbs with the shard count. A global index asks one shard, but each write becomes two writes.
- **Inputs:** (1) The shard count n, 1 to 100, by dragging across the picture; snaps to 1, 10, 20, 50 and 100; arrow keys step 1; default 20. (2) "Local index | Global index", default Local. (3) "Run a search" starts a search at once; searches also run on their own every 3.6 seconds.
- **Model:** each shard is slow (200 ms in the story) with chance 1 in 100, otherwise 5 ms; the fan-out model draws the searches from a seeded sequence. Local: a search asks all n shards and takes the slowest; `slowChance(n) = 1 - 0.99^n`. Global: a search asks one index shard, 1%. Writes: 1 per order under Local, 2 under Global ("Each order = 2 writes").
- **Numbers to check:** Local: n = 1 gives 1%, 10 gives 9.6%, 20 gives 18%, 50 gives 39%, 100 gives 63%. Global: 1% at every n.
- **Picture:** the fan of n shard tiles as in the fan-out canvas. Under Global one index tile (the one nearest the wire in the bottom row) is lit and ringed, the others dim, and one line goes out to it. A tally of the last 42 searches (green fast, red slow) and a counter such as "3 slow of 14". A pill under the search app says "Each order = 1 write" or "Each order = 2 writes" (amber under Global).
- **Verdicts:** "18% of searches hit a slow shard" (good under 5%, warn under 30%, bad from 30%; one decimal under 10%, for example "9.6%"). Under Global: "1% of searches hit a slow shard" (good).
- **Reduced motion:** no automatic searches; each press of "Run a search" shows the next result and adds it to the tally.
- **Accessibility:** the picture is one `role="slider"` ("20 shards, 18% slow"); the toggle is a real button pair; the SVG description says the tally in words.
- **Sources:** Dean and Barroso [S8] (100 servers, 1 in 100 slow, 63%); DynamoDB global secondary indexes are asynchronous [S41]. The times are made-up story numbers.
