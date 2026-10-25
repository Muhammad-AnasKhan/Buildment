# Canvas spec: sysdesign-m20-cache-loss

- **Course and chapter:** system-design, 20.4 beat 6 ("A cold cache drowns the database").
- **Renderer:** `scene` (data only).
- **Claim:** When the cache restarts empty, every redirect misses, and the database receives about nine times the load it was sized for.
- **Story:** The service sends lookups to the cache, which hits. The cache restarts empty and the lookups miss. The service sends about 101,000 operations a second to the database. Verdict: "Cold cache: database drowns".
- **Numbers:** 100,000 redirects + 1,000 new links a second at peak = 101,000. Database sized for 90% hits: 10,000 misses + 1,000 writes = 11,000. 101,000 / 11,000 = 9.2, shown as 9x.
- **Sources:** S24 (leases and cache failure at Facebook); course numbers.
