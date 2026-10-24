# Canvas spec: sysdesign-m7-fix-lock

- **Course and chapter:** system-design, 7.5 beat 1.
- **Renderer:** `scene` (data only).
- **Claim:** A row lock turns concurrent writers into a queue, so each one sees the result of the one before.
- **Story:** Dina locks and reads 1. Omar tries to lock and waits. Dina sets 0 and commits. The lock is released. Omar reads 0.
- **Numbers:** 1 ticket. Two buyers. One waits.
- **Predict before it (in the chapter):** none in this beat. The chapter's predict (one UPDATE with WHERE seats_left > 0) sits before the last beat.
- **Sources:** PostgreSQL explicit locking: FOR UPDATE blocks other writers and lockers of the same row until the transaction ends, and plain reads are not blocked (read 2026-10-24).
