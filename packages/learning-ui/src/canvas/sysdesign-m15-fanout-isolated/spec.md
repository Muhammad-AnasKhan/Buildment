# Canvas spec: sysdesign-m15-fanout-isolated

- **Course and chapter:** system-design, 15.7 beat 3 ("Each subscriber has its own line").
- **Renderer:** `scene` (data only).
- **Claim:** Giving each subscriber its own queue keeps one subscriber's failure from reaching the others.
- **Story:** The topic sends a copy of OrderPlaced to Email and to Receipts. Email sends. Receipts fails and retries. The next event goes to both: Email sends again while Receipts parks the bad one in its own dead letter queue. Verdict: "One subscriber fails, others go on".
- **Numbers:** No numbers.
- **Sources:** SNS to SQS fan-out page, read 2026-10-24 (see the chapter's source note); S85 (a dead letter queue belongs to a source queue).
