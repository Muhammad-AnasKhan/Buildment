# Canvas spec: sysdesign-m15-key-routes

- **Course and chapter:** system-design, 15.4 beat 4 ("Same key, same partition").
- **Renderer:** `scene` (data only).
- **Claim:** The same key always lands in the same partition, and a partition keeps its order.
- **Story:** The shop sends layla: placed, omar: placed, layla: paid, omar: paid. The layla events land in partition 0 in order. The omar events land in partition 1 in order. Verdict: "Same key, same partition, same order".
- **Numbers:** No numbers.
- **Sources:** S81 (Kafka: events with the same key are written to the same partition, and a consumer reads a partition in the order it was written).
