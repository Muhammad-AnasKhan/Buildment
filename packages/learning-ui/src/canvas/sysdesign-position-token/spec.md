# Canvas spec: sysdesign-position-token

- **Course and chapter:** system-design, 8.4 beat 4 ("Carry your position, not a clock").
- **Renderer:** `scene` (data only, in `data.ts`).
- **Claim:** A read router can guarantee read-your-writes by comparing log positions: the client carries the position of its last write, and the router only uses a replica whose applied position is at least that.
- **Story:** Amna's app carries position 1. The router knows replica 2 is at 0 ("too old") and replica 1 is at 1 ("OK"), sends the read to replica 1, and Amna sees her comment. The strip shows Amna's write and each replica's position. Verdict: "Replica at 1 or more: safe to read".
- **Sources:** PostgreSQL documentation (`pg_current_wal_lsn()` on the primary, `pg_last_wal_replay_lsn()` on a standby); Terry et al. 1994 (session guarantees).
- **Transfer:** code exercise 8.8 (a read router with position tokens) and challenge 7.
