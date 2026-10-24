# Canvas spec: sysdesign-m5-versioned-file

- **Course and chapter:** system-design, 5.7 beat 5 ("Purge every edge, or change the name").
- **Renderer:** `scene` (data only).
- **Claim:** Instead of purging a changed file from every edge, ship it under a new name. Edges have never seen the new name, so they fetch the new file; the old name is never asked for again.
- **Story:** The developer uploads `app.v2.css`. A shopper's page links to v2; the edge misses ("miss: new name"), fetches v2 and serves it. The developer sent "no purge". Verdict: "New name: no purge, no stale file".
- **Numbers:** in the limits: CloudFront's first 1,000 invalidation paths a month are free [S28].
- **Sources:** CloudFront: invalidate files or use versioned file names; invalidation pricing [S28].
