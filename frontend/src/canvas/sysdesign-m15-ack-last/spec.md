# Canvas spec: sysdesign-m15-ack-last

- **Course and chapter:** system-design, 15.4 beat 2 ("Ack last: a crash repeats the job").
- **Renderer:** `scene` (data only).
- **Claim:** Acknowledge after the work gives at least once: a crash repeats the job.
- **Story:** The queue sends credit 18. The worker pays the wallet, 18. It crashes before the ack. After a timeout the queue sends the job again. The worker pays again, 36. Verdict: "Ack last: a crash can repeat the job".
- **Numbers:** Course number: credit 18.
- **Sources:** S82 (Kafka design: at least once when the consumer processes before it marks the message consumed) and S83 (SQS standard queues deliver at least once).
