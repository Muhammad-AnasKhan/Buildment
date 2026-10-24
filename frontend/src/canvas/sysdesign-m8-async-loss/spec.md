# Canvas spec: sysdesign-m8-async-loss

- **Course and chapter:** system-design, 8.3 beat 1 ("Asynchronous: OK before the copy").
- **Renderer:** `scene` (data only).
- **Claim:** Asynchronous replication can lose acknowledged writes when the leader fails.
- **Story:** Nour's order #8 is saved on the leader, and the client is told OK. The leader has not copied it yet. The leader crashes. The follower, which has up to #7, is promoted. Nour asks for order #8 and it is not there. Verdict: "Told OK, but order #8 is gone".
- **Numbers:** none
- **Sources:** PostgreSQL: asynchronous log shipping copies after commit; the synchronous guarantee [S38].
