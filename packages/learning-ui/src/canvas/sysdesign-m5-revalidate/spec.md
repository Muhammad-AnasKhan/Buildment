# Canvas spec: sysdesign-m5-revalidate

- **Course and chapter:** system-design, 5.7 beat 2 ("no-cache is not no-store").
- **Renderer:** `scene` (data only).
- **Claim:** `Cache-Control: no-cache` lets a cache store a response but requires it to check with the origin before each use. The check sends the stored ETag; if nothing changed, the origin answers 304 with no body. `no-store` is the directive that forbids storing.
- **Story:** The edge holds the page with ETag a1 under `no-cache` ("must ask first"). It sends `If-None-Match: a1`; the origin answers "304, no body"; the edge serves its stored copy. Verdict: "Stored, checked, sent: no-cache".
- **Numbers:** none.
- **Sources:** RFC 9111: `no-cache`, `no-store`, ETag revalidation and 304 [S22]; dossier misconception 19.
