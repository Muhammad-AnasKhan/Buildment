# Canvas spec: sysdesign-m15-order-per-key

- **Course and chapter:** system-design, 15.4 beat 6 ("Order holds per key, not across keys").
- **Renderer:** `scene` (data only).
- **Claim:** Order is kept inside a partition, not across partitions.
- **Story:** Partition 0 holds layla 1 and layla 2. Partition 1 holds omar 1 and omar 2. The reader pulls from both and sees o1, l1, l2, o2. Each customer is in order. Verdict: "Order holds per key, not across keys".
- **Numbers:** No numbers.
- **Sources:** S81 (Kafka: order is kept within a partition) and S132 (Kinesis: records in a shard carry a sequence number).
