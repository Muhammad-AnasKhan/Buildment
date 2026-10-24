# Canvas spec: sysdesign-m8-write-path

- **Course and chapter:** system-design, 8.2 beat 1 ("A write is saved once, then copied").
- **Renderer:** `scene` (data only).
- **Claim:** In single-leader replication every write goes to one node; the followers receive a copy afterwards.
- **Story:** Amna's post goes to the leader. The leader saves it as entry 7 and says ok. Only then do the copies travel: follower 1 gets entry 7 first, follower 2 later. Verdict: "Client heard OK before copies landed".
- **Numbers:** none
- **Sources:** PostgreSQL streaming replication is asynchronous by default [S38].
