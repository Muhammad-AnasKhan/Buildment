# Canvas spec: sysdesign-m8-detect

- **Course and chapter:** system-design, 8.5 beat 1 ("Silence: dead or only slow?").
- **Renderer:** `scene` (data only).
- **Claim:** Failure detection is a guess made from silence.
- **Story:** The leader sends a heartbeat to both followers, twice. Then it goes quiet. Follower 1 counts the silence up to 10 s. Both followers wonder if the leader is dead. Verdict: "Dead, or only slow? Nobody knows".
- **Numbers:** 10 s is illustrative; Raft election timeouts are 150 to 300 ms [S68]; Spanner leader leases are 10 s [S60].
- **Sources:** [S68] Raft; [S60] Spanner; [S72] SWIM failure detection; PostgreSQL does not detect failure itself [S38].
