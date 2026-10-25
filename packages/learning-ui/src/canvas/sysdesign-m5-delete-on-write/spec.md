# Canvas spec: sysdesign-m5-delete-on-write

- **Course and chapter:** system-design, 5.3 beat 2 ("Write: change the database, drop the copy").
- **Renderer:** `scene` (data only).
- **Claim:** In cache-aside, a write goes to the database first, and then the app deletes the cached copy instead of updating it. The next read misses and loads the new value.
- **Story:** The admin sets p42 to 899. The app updates the database (1) and deletes the copy (2). A shopper's read misses, the app reads 899 from the database, stores it and returns it. Verdict: "Copy deleted: next read is fresh".
- **Numbers:** none beyond the story's prices.
- **Sources:** Facebook memcache: update the database, then delete the key, because deletes are idempotent [S24]; AWS lazy loading [S26].
