# Canvas spec: sysdesign-m1-paste-no-cache

- **Course and chapter:** system-design, 1.4 beat 6 ("Trade-offs: say no to a cache").
- **Renderer:** `scene` (data only).
- **Claim:** Every block has a cost. A trade-off compares what a block buys with what it costs at your numbers, and at 12 reads a second a cache buys almost nothing.
- **Story:** Reads flow from the app to the database, which says "under 1% busy". The app asks "add a cache?"; the cache answers "+cost, +stale" and "not yet". Verdict: "At 12 reads/s, skip the cache".
- **Numbers:** 12 reads a second from 1.4's estimate; a simple MySQL, Redis or Memcached query takes about 500 microseconds (napkin-math [S3]), so 12 reads a second keep one database connection busy about 6 ms a second, under 1%.
- **Sources:** napkin-math [S3]; cache-aside costs and staleness, ElastiCache strategies [S26].
