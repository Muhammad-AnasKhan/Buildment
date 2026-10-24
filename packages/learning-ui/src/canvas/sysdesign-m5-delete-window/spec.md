# Canvas spec: sysdesign-m5-delete-window

- **Course and chapter:** system-design, 5.5 beat 2 ("Delete on write shrinks the window").
- **Renderer:** `scene` (data only).
- **Claim:** Deleting the cached copy right after the database commit shrinks the stale window from up to the TTL to about the time of one cache command.
- **Story:** The app commits 899 (tag "commit 0 ms"); the cache still holds 999 ("stale: 999"). The app deletes the key; it is gone at about 0.5 ms (tag "deleted 0.5 ms"). Verdict: "Stale for about 0.5 ms, not 60 s".
- **Numbers:** a cache command costs about 500 microseconds [S3]; the 60 s compares with the TTL in the previous beat.
- **Sources:** Facebook memcache deletes on write [S24]; napkin-math [S3].
