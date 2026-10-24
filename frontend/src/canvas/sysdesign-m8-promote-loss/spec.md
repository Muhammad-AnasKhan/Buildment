# Canvas spec: sysdesign-m8-promote-loss

- **Course and chapter:** system-design, 8.5 beat 2 ("Promotion can lose acknowledged writes").
- **Renderer:** `scene` (data only).
- **Claim:** Failover under asynchronous replication loses the writes that were not yet copied.
- **Story:** The old leader's log reaches position 8, the follower's only 6. The leader crashes. The follower is promoted and its log ends at 6. Verdict: "Writes 7 and 8 are lost".
- **Numbers:** positions 6 and 8 are illustrative.
- **Sources:** PostgreSQL failover and promotion [S38]; GitHub 2018 incident, writes not yet replicated [S134].
