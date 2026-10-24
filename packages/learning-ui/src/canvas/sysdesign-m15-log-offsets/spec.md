# Canvas spec: sysdesign-m15-log-offsets

- **Course and chapter:** system-design, 15.3 beat 2 ("A log keeps everything").
- **Renderer:** `scene` (data only).
- **Claim:** In a log, reading deletes nothing; each reader keeps a position called an offset.
- **Story:** Email is at 4 and Stats is at 2. Email reads event 5 and moves to 5. Stats reads event 3 and moves to 3. The log still holds events 1 to 6. Verdict: "Two readers, two places, nothing gone".
- **Numbers:** No numbers beyond the positions.
- **Sources:** S82 (Kafka: a consumer's position is a single integer, the offset of the next message to consume; messages are not deleted when consumed).
