# Canvas spec: sysdesign-m5-write-through

- **Course and chapter:** system-design, 5.3 beat 3 ("Write-through fills the cache on write").
- **Renderer:** `scene` (data only).
- **Claim:** With write-through, every write updates the cache and the database before the reply. Reads find fresh copies, but every written item takes cache space, read or not.
- **Story:** The app sets p42 to 899; the cache writes it to the database and only then says ok. A read hits 899. The app writes p77; it goes into the cache too, and nobody reads it ("p77 never read"). Verdict: "Fresh reads, plus unread copies".
- **Numbers:** none.
- **Sources:** AWS ElastiCache strategies: write-through keeps data current, adds a write penalty and caches data that is never read (cache churn) [S26].
