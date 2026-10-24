# Canvas spec: sysdesign-m9-scatter-gather

- **Course and chapter:** system-design, 9.6 beat 1 (Search by buyer asks every shard).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A query on something other than the partition key must ask every shard, and its time is the slowest shard's time.
- **Story:** A search for buyer Sara goes to four shards; three answer in 5 ms and one takes 200 ms; the app waits 200 ms. Verdict: Search waits for its slowest shard.
- **Numbers:** Made-up 5 ms and 200 ms; with n shards each slow 1 in 100, the chance a search is slow is 1 - 0.99^n (63% at 100 shards).
- **Sources:** [S8] Dean and Barroso, The Tail at Scale.
