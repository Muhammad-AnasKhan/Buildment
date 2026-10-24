# Canvas spec: sysdesign-m12-old-leader-steps-down

- **Course and chapter:** system-design, 12.5 beat 4 (A larger term wins).
- **Renderer:** `scene` (data only).
- **Claim:** A term works like a logical clock for leaders: the larger term wins, and a server with a smaller term steps down.
- **Story:** S1 leads term 1 but is cut off. S3 wins term 2. When the link returns, S3's heartbeat shows term 2; S1 compares 2 with 1 and becomes a follower.
- **Numbers:** Terms 1 and 2.
- **Sources:** S68 (terms act as a logical clock).
