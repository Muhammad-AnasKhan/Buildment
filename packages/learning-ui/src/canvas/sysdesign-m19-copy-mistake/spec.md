# Canvas spec: sysdesign-m19-copy-mistake

- **Course and chapter:** system-design, 19.3 beat 3 ("A replica copies the mistake").
- **Renderer:** `scene` (data only).
- **Claim:** Replication protects against losing a machine, not against a wrong change. A bad DELETE is a valid change, so every replica applies it.
- **Story:** The developer's "delete all" reaches the primary, which drops from 5,000 orders to 0. The copy reaches both replicas, which also drop to 0. Verdict: "Replicas copied the mistake too".
- **Numbers:** 5,000 orders is made up. Copy time of about a second matches PostgreSQL's "typically under one second" [S38].
- **Sources:** [S38]; the AWS DR whitepaper says continuous replication may not protect against data corruption or destruction without versioning or point-in-time recovery [S107].
