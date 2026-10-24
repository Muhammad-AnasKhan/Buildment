# Canvas spec: sysdesign-m12-lease-handover

- **Course and chapter:** system-design, 12.4 beat 1 (A lease is a lock that expires).
- **Renderer:** `scene` (data only).
- **Claim:** A lease is a lock with an expiry time, so a crashed holder cannot block everyone forever; each new holder gets a larger token.
- **Story:** A asks for the lock and gets token 33 with a 10 s lease. A crashes. The ring fills as the lease runs out, the lock is free, and B gets token 34.
- **Numbers:** Lease 10 s (course number; Spanner's Paxos leader leases are 10 s [S60]). Tokens 33 and 34 are Kleppmann's example [S70].
- **Sources:** S70, S71 (Chubby sequencers), S60.
