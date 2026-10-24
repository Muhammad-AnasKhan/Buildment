# Canvas spec: sysdesign-m15-dlq-parks

- **Course and chapter:** system-design, 15.5 beat 7 ("Park the bad message and move on").
- **Renderer:** `scene` (data only).
- **Claim:** A dead letter queue parks a message that keeps failing so the line can move on.
- **Story:** The consumer tries m2 and fails three times. It then sends m2 and the reason to the dead letter queue, which shows 1 parked. It reads m3 and succeeds. Verdict: "Bad message parked, line moves on".
- **Numbers:** Course number: 3 tries.
- **Sources:** S85 (SQS dead-letter queues: maxReceiveCount moves a message that was received too many times).
