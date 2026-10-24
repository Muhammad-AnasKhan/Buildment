# Canvas spec: sysdesign-m5-stale-set-race

- **Course and chapter:** system-design, 5.5 beat 3 ("The race: a slow reader wins").
- **Renderer:** `scene` (data only).
- **Claim:** Delete-on-write has a race. A reader that missed and read the old value before the write can store that old value after the writer's delete. The stale copy then stays until its TTL ends. Facebook calls this a stale set.
- **Story:** The reader misses and reads 999 at 10 ms, then is slow. The writer commits 899 at 20 ms and deletes the key at 25 ms. At 40 ms the reader sets 999 into the empty cache. Verdict: "The old price is back until TTL".
- **Numbers:** made-up timings (10, 20, 25 and 40 ms) that show the order of events.
- **Predict before it (in the chapter):** what the cache holds after the reader's late set.
- **Sources:** Nishtala et al., "Scaling Memcache at Facebook", NSDI 2013: stale sets, and leases as the fix [S24].
