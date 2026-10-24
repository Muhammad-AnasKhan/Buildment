# Canvas spec: sysdesign-m2-chatty-page

- **Course and chapter:** system-design, 2.2 beat 6.
- **Renderer:** `scene` (data only).
- **Claim:** Many sequential round trips multiply distance: 20 queries across the Atlantic cost 1.6 s.
- **Story:** The app server in EU West runs 20 queries one after another against a database in NA East; the counter reaches 1,600 ms; a tag shows 10 ms for the same work inside one region. Verdict: "20 queries across the sea: 1.6 s".
- **Numbers:** 20 x 80 ms = 1,600 ms; 20 x 0.5 ms = 10 ms.
- **Sources:** [S3] napkin-math. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
