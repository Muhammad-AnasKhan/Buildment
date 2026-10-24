# Canvas spec: sysdesign-m7-path-shard

- **Course and chapter:** system-design, 7.6 beat 5.
- **Renderer:** `scene` (data only).
- **Claim:** Partitioning is the first step that adds write capacity, because each partition takes a share of the writes. It costs you cross-partition queries.
- **Story:** The app sends an event 5 request to partition B only. Then it asks for the top prices across all events, and all three partitions must answer.
- **Numbers:** 3 partitions: events 1 to 3, 4 to 6, 7 to 9 (example).
- **Predict before it (in the chapter):** none. The beat text asks the learner what to notice.
- **Sources:** Course example. DynamoDB hashes the partition key to pick a partition [S40]. Full treatment in module 9.
