# Canvas spec: sysdesign-m9-celebrity-key

- **Course and chapter:** system-design, 9.4 beat 1 (One popular seller, one overloaded shard).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Hashing spreads keys, not the traffic of one key. A key with a huge share of the load overloads whichever shard it lands on.
- **Story:** The app sends Noor orders to shard 4 and other orders elsewhere. Shards 1 to 3 say 300 writes/s, shard 4 says 2,100 writes/s. Verdict: Shard 4 runs at 210% of its limit.
- **Numbers:** Background 1,200 writes/s over many keys = 300 per shard; the sale adds 1,800/s on one key: 300 + 1,800 = 2,100; limit 1,000. The key seller:noor-crafts hashes to shard 4 with hash32 mod 4.
- **Sources:** [S40] limit; [S44] hot partitions are among the most common early problems.
