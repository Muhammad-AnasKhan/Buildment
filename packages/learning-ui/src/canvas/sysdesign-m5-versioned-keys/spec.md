# Canvas spec: sysdesign-m5-versioned-keys

- **Course and chapter:** system-design, 5.5 beat 6 ("Versioned keys never go stale").
- **Renderer:** `scene` (data only).
- **Claim:** If the cache key includes a version that grows with every write, a write needs no delete: readers ask for the current version and use the new key, and the old copy is never read again. A late set of an old version writes an old key that nobody reads.
- **Story:** The app writes 899 and the row's version goes from v7 to v8. A shopper read asks the database for the version (v8), misses on `p42:v8`, and sets it. The cache still holds `p42:v7`, which is never read again. Verdict: "The old key is never read again".
- **Numbers:** none.
- **Sources:** versioned names as an alternative to invalidation, for CDN files [S28]. Versioned keys for data caches are taught here as reasoning from the same idea; a primary source for data caches is not in the dossier.
