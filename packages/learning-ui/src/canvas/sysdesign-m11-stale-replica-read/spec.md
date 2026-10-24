# Canvas spec: sysdesign-m11-stale-replica-read

- **Course and chapter:** system-design, 11.3 beat 2 ("A stale copy breaks it").
- **Renderer:** `scene` (data only).
- **Claim:** If a read starts after a write has finished and returns the old value, the history is not linearizable. Reading from a lagging replica allows exactly that.
- **Story:** Ada writes x = 1. The leader confirms and starts a slow copy. Ben reads from the replica while the copy is in flight and gets 0. Verdict: "Ada finished, Ben still read 0".
- **Numbers:** Course numbers.
- **Sources:** Kleppmann Cambridge notes on a read that misses a finished write [S52]; PostgreSQL standby lag [S38].
