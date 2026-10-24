# Canvas spec: sysdesign-m15-ack-first

- **Course and chapter:** system-design, 15.4 beat 1 ("Ack first: a crash loses the job").
- **Renderer:** `scene` (data only).
- **Claim:** Acknowledge before the work gives at most once: a crash loses the job.
- **Story:** The queue sends credit 18. The worker acks at once and the queue deletes the job. The worker crashes before it pays. Nobody will ever send the job again. Verdict: "Ack first: a crash loses the job".
- **Numbers:** Course number: credit 18.
- **Sources:** S82 (Kafka design: delivery semantics; at most once when a message is marked consumed before it is processed).
