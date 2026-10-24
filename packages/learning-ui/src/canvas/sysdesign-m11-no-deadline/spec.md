# Canvas spec: sysdesign-m11-no-deadline

- **Course and chapter:** system-design, 11.6 beat 3 ("A copy that is down sets the clock").
- **Renderer:** `scene` (data only).
- **Claim:** Eventual consistency has no time bound. The time to agree is set by the slowest copy and by failures, not by the sync interval alone.
- **Story:** A and B sync and agree at second 2. C is down. At second 48 C comes back, syncs, and all three agree. Verdict: "No deadline while a copy is down".
- **Numbers:** 2 s and 48 s are course numbers.
- **Sources:** Terry 2011 for guarantees that are not time-bounded [S51]; Kleppmann on partitions not being optional [S55].
