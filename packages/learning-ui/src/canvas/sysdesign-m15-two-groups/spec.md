# Canvas spec: sysdesign-m15-two-groups

- **Course and chapter:** system-design, 15.3 beat 4 ("Each group reads at its own speed").
- **Renderer:** `scene` (data only).
- **Claim:** Each consumer group has its own positions, so groups do not affect each other.
- **Story:** A new event 9 is written. Email reads it at once and moves to 9. Stats is slow, reads event 4, and moves to 4. The log holds all of them for both groups. Verdict: "Each group reads at its own speed".
- **Numbers:** No numbers beyond the positions.
- **Sources:** S82 (Kafka: each partition is consumed by exactly one consumer in each subscribing group at a time).
