# Canvas spec: sysdesign-m21-page-cache

- **Course and chapter:** system-design, 21.4 beat 4 (Cache the finished page for a few seconds).
- **Renderer:** `scene` (data only).
- **Claim:** Caching the ranked page trades freshness for speed. The age of the page is bounded by the time to live, here 10 seconds, the same as the freshness promise in chapter 21.1.
- **Story:** First open: miss, rank, save, reply. Second open: hit, reply fast. Dina posts and Maya still sees the old page. Verdict: "Fast now, fresh within 10 s".
- **Numbers:** 60 ms build, 5 ms hit, 10 s time to live. All course assumptions.
- **Sources:** Cache-aside and delete-on-write from chapters 5.3 and 5.5; Facebook's memcache paper deletes on write [S24]. The times are course numbers.
