# Canvas spec: sysdesign-m9-range-hot-tail

- **Course and chapter:** system-design, 9.2 beat 1 (Range by date: the newest shard takes every write).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** With range partitioning on a time-ordered key, all new writes land on the newest range.
- **Story:** Four shards by quarter. Three orders dated Nov 12 fly to shard 4. Shard 4 says 3,000 writes/s, the others 0. Verdict: The newest range takes every write.
- **Numbers:** Made-up: 3,000 writes a second; shard limit 1,000 writes a second (DynamoDB per-partition write limit [S40], used as a round number).
- **Sources:** [S40] for the limit.
