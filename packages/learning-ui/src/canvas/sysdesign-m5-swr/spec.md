# Canvas spec: sysdesign-m5-swr

- **Course and chapter:** system-design, 5.6 beat 3 ("Serve stale, refresh once").
- **Renderer:** `scene` (data only).
- **Claim:** With stale-while-revalidate, a copy that is slightly past its fresh time is still served at once while one background request refreshes it. Nobody waits for the database, and the database sees one query.
- **Story:** The copy turns "stale, usable". A shopper's request gets the old page at once; the app starts one refresh. A second shopper also gets the old page at once. The new page comes back and is stored ("fresh again"). Verdict: "Nobody waited; one refresh ran".
- **Numbers:** none.
- **Sources:** `stale-while-revalidate` and `stale-if-error`, RFC 5861 [S23].
