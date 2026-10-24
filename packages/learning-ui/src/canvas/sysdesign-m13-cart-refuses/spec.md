# Canvas spec: sysdesign-m13-cart-refuses

- **Course and chapter:** system-design, 13.1 beat 1 ("The cart that said try again").
- **Renderer:** `scene` (data only).
- **Claim:** A store with one leader cannot take a write while the leader is down, even if healthy copies exist.
- **Story:** Hana taps Add milk. The message goes to the leader, which is down. The read-only copy cannot take it. Hana sees an error. Verdict: "Add refused: a sale may be lost".
- **Numbers:** No numbers. Story only (a set-the-scene beat).
- **Sources:** S38 (PostgreSQL: one primary takes writes), S44 (each DynamoDB partition has one leader that takes writes).
