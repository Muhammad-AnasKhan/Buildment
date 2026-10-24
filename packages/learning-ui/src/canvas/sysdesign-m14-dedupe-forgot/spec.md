# Canvas spec: sysdesign-m14-dedupe-forgot

- **Course and chapter:** system-design, 14.5 beat 5 (How long to remember).
- **Renderer:** `scene` (data only).
- **Claim:** Remembering ids has a time limit. The limit must be longer than the longest delay before a copy can arrive.
- **Story:** m-7 is handled at hour 0 and saved. At hour 24 the id is forgotten. At hour 30 a copy arrives, looks new, and is applied again.
- **Numbers:** S80: Stripe idempotency keys may be removed after at least 24 hours. S86: SQS FIFO deduplication interval 5 minutes. The 30 hour copy is a course number.
- **Sources:** S80, S86.
