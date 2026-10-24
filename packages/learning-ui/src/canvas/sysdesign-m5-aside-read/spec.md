# Canvas spec: sysdesign-m5-aside-read

- **Course and chapter:** system-design, 5.3 beat 1 ("Cache-aside: the app does the work").
- **Renderer:** `scene` (data only).
- **Claim:** In cache-aside (lazy loading), the app talks to both the cache and the database. A miss costs three trips: ask the cache, read the database, store the copy. A hit costs one.
- **Story:** The app needs product p42. Trip 1: get from the cache, miss. Trip 2: read the database, 999. Trip 3: set the copy with a 60-second TTL. The next get is a hit. Verdict: "Miss: 3 trips. Hit: 1 trip".
- **Numbers:** three trips on a miss [S26]; about 0.5 ms per trip [S3] (stated in the limits, not drawn).
- **Sources:** AWS ElastiCache caching strategies (lazy loading, three trips, staleness) [S26]; Facebook's demand-filled look-aside cache [S24].
