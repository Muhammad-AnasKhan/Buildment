# Canvas spec: sysdesign-m8-log-order

- **Course and chapter:** system-design, 8.2 beat 2 ("Followers copy the log in order").
- **Renderer:** `scene` (data only).
- **Claim:** Followers do not replay writes in any order they like. They follow the leader's log, entry by entry.
- **Story:** Three writes reach the leader and land on its log at positions 1, 2 and 3 (top row of tags). Copies travel to the follower and appear on the bottom row in the same order. Verdict: "Same order on the follower".
- **Numbers:** none
- **Sources:** PostgreSQL log positions [S38].
