# Canvas spec: sysdesign-m9-hash-spread

- **Course and chapter:** system-design, 9.2 beat 2 (Hash by order id: writes spread evenly).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** Hashing the key sends neighbouring keys to different shards, so writes spread out.
- **Story:** The same app hashes each order id; four orders fly to four different shards; each says 750 writes/s. Verdict: Writes spread evenly.
- **Numbers:** 3,000 / 4 = 750 writes a second per shard. A 100,000 key test with the course hash gave 25.0, 24.9, 25.2 and 25.0 percent.
- **Sources:** [S40] DynamoDB hashes the partition key to choose a partition.
