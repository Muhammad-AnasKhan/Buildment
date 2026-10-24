# Canvas spec: sysdesign-m27-shards-split

- **Course and chapter:** system-design, 27.5 beat 2 ("Split one count into many rows").
- **Renderer:** `scene` (data only).
- **Claim:** Splitting a hot counter into shards spreads the writes, and the exact count is the sum of the shards.
- **Story:** Three views arrive, each added to a different shard (399, 413, 395). The watch page reads all three and adds them: 413 + 399 + 395 = 1,207. Verdict: "Writes spread, reads add up".
- **Numbers:** shard values are illustrative (412, 398, 394 before the three views).
- **Sources:** G-Counter sums per-replica slots [S74]; chapter 13.7.
