# Canvas spec: sysdesign-m5-ttl-stale

- **Course and chapter:** system-design, 5.5 beat 1 ("TTL alone: stale until expiry").
- **Renderer:** `scene` (data only).
- **Claim:** If a cache is invalidated only by TTL, a change in the database is invisible until the copy expires. The stale window is up to the whole TTL.
- **Story:** The admin sets p42 to 899 at 0 s. At 20 s a shopper still gets 999 from the cache (tag "read at 20 s: 999"). The copy expires at 60 s; the next read reloads 899. Verdict: "Stale for up to the whole TTL".
- **Numbers:** a 60-second TTL, a story choice. The worst case is drawn: the copy was stored just before the write.
- **Sources:** a TTL bounds staleness in lazy loading [S26]; TTL definition [S9, S22].
