# Canvas spec: sysdesign-m19-failback

- **Course and chapter:** system-design, 19.4 beat 5 ("Failing back is a second, planned move").
- **Renderer:** `scene` (data only).
- **Claim:** The old primary cannot simply take back its role. It holds writes the new primary never saw, so it must resync as a copy first; users then move back in a quiet period.
- **Story:** Region A returns with 300 extra writes. B sends A its data, A sets the 300 aside, becomes a copy of B, then customers are moved back and A is the primary again. Verdict: "Failback is a second, planned move".
- **Numbers:** 300 matches the 19.4 lag-loss scene (300 writes per second x 1 second).
- **Sources:** PostgreSQL docs on rebuilding the old primary and `pg_rewind` [S38] (as taught in 8.5); GitHub 2018 chose to fail forward rather than back [S134].
