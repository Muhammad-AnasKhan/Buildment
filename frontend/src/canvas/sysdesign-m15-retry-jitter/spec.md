# Canvas spec: sysdesign-m15-retry-jitter

- **Course and chapter:** system-design, 15.5 beat 5 ("A random wait spreads them out").
- **Renderer:** `scene` (data only).
- **Claim:** Jitter spreads retries over time so a recovering service is not hit by a crowd.
- **Story:** Worker 1 retries after 1.2 s, worker 2 after 2.0 s, worker 3 after 2.9 s. The database takes each one in turn and stays up. Verdict: "Random waits spread the retries out".
- **Numbers:** Course numbers: waits 1.2 s, 2.0 s, 2.9 s.
- **Sources:** S90 (Brooker, 2015: full jitter reduces the work and the clumping).
