# Canvas spec: sysdesign-m11-eventually

- **Course and chapter:** system-design, 11.6 beat 1 ("Stop writing, and the copies agree").
- **Renderer:** `scene` (data only).
- **Claim:** Eventual consistency promises one thing: if writes stop, all copies end up with the same value. It says nothing about how long that takes.
- **Story:** Copy A gets x = 5. It syncs with B, then B syncs with C. All three hold 5. Verdict: "No new writes: all copies agree".
- **Numbers:** Course numbers.
- **Sources:** Convergence as defined for eventually consistent stores [S75]; anti-entropy in Dynamo [S45].
