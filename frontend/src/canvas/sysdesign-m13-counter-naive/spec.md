# Canvas spec: sysdesign-m13-counter-naive

- **Course and chapter:** system-design, 13.7 beat 1 ("Two likes became one").
- **Renderer:** `scene` (data only).
- **Claim:** Merging a plain counter with max or last-write loses increments that happened at the same time.
- **Story:** Both replicas show 5. A gets a like and shows 6. B gets a like and shows 6. They swap and keep the bigger: 6. Verdict: "Two likes became one: 6, not 7".
- **Numbers:** 5 + 1 + 1 = 7 likes; the merged count is 6.
- **Sources:** S74 (the grow-only counter exists to fix this), S75 (strong eventual consistency).
