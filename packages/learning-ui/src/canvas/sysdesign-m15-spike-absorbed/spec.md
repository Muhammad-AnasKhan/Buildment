# Canvas spec: sysdesign-m15-spike-absorbed

- **Course and chapter:** system-design, 15.2 beat 2 ("Spikes wait in line").
- **Renderer:** `scene` (data only).
- **Claim:** A queue turns a short spike into a short wait, not a crash.
- **Story:** Six jobs reach the queue at once. The queue shows 6 waiting. The mailer takes one job each second, and the count falls to 0. Nothing is dropped. Verdict: "Spike absorbed: nothing dropped".
- **Numbers:** Course numbers: 6 jobs at once, 1 job per second.
- **Sources:** None needed (course numbers); the buffering role is described in the Kafka and SQS documents, S82 and S83.
