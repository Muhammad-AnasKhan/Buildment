# Canvas spec: sysdesign-m5-next-door

- **Course and chapter:** system-design, 5.2 beat 3 ("Next door, a cache saves little").
- **Renderer:** `scene` (data only).
- **Claim:** Inside one data centre, a cache read and a simple database query cost about the same. A cache saves time only when one read replaces slower work: several queries, a join, a page built from parts. It always saves database load.
- **Story:** The app reads a price from Valkey (tag: 0.5 ms), then the same price with a simple query (tag: 0.5 ms): "same time". The product page needs 5 queries in a row (tag: 2.5 ms). The cache holds the whole page, so one read of 0.5 ms replaces the five. Verdict: "Cache the page, not one query".
- **Numbers:** Redis, Memcached or MySQL query about 500 microseconds [S3]. 5 queries per page is a story number; 5 x 0.5 = 2.5 ms.
- **Predict before it (in the chapter):** whether a cache in front of a simple indexed query makes the read much faster.
- **Sources:** napkin-math [S3], with its "2 to 3 times off" caveat.
