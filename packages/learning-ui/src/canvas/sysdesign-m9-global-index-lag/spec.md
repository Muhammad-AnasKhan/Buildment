# Canvas spec: sysdesign-m9-global-index-lag

- **Course and chapter:** system-design, 9.6 beat 3 (A global index can miss a new write).
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A global secondary index is updated after the write, so a search made right away can miss the new item.
- **Story:** The order is saved on the order shard; an index-it-later message crawls to the index shard; a search of the index returns empty. Verdict: The index read missed the new order.
- **Numbers:** No figures: the delay is drawn long for the picture.
- **Sources:** [S41] DynamoDB global secondary indexes are updated asynchronously and are eventually consistent.
