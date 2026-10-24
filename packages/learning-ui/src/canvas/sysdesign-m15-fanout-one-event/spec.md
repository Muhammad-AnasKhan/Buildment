# Canvas spec: sysdesign-m15-fanout-one-event

- **Course and chapter:** system-design, 15.7 beat 1 ("One event, many subscribers").
- **Renderer:** `scene` (data only).
- **Claim:** Publish and subscribe lets one event start many jobs without the sender knowing about them.
- **Story:** The order service publishes OrderPlaced. The topic gives a copy to Email, Receipts and Stats. Each does its own job. The order service has already moved on. Verdict: "One event, three jobs, no waiting".
- **Numbers:** No numbers.
- **Sources:** SNS to SQS fan-out page, read 2026-10-24 (see the chapter's source note); S82 (Kafka: each consumer group gets every event).
