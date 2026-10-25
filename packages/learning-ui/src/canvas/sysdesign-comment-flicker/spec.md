# Canvas spec: sysdesign-comment-flicker

- **Course and chapter:** system-design, 8.4 beat 1 ("Her comment vanished, then came back").
- **Renderer:** `scene` (data only), built by `buildLagScene("any")` in `models/replica-lag-scene.ts` from the tested replica lag model.
- **Claim:** With asynchronous replicas, reads that land on replicas with different lag can show a user's own write, hide it, then show it again.
- **Story:** Amna posts to the leader; copies travel to replica 1 (150 ms) and, slowly, to replica 2 (600 ms). Refresh 1 hits replica 1 and shows the comment; refresh 2 hits replica 2, which has no comment yet ("comment gone!"); refresh 3 is back on replica 1 ("it's back"). Verdict: "Her comment vanished, then came back".
- **Predict before it (in the chapter):** what Amna sees across her three refreshes.
- **Sources:** Terry et al. 1994 (session guarantees); PostgreSQL documentation (lag typically under one second); Aurora documentation (usually much less than 100 ms). See the research dossier.
