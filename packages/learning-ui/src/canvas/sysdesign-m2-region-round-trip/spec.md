# Canvas spec: sysdesign-m2-region-round-trip

- **Course and chapter:** system-design, 2.2 beat 3.
- **Renderer:** `scene` (data only).
- **Claim:** A query to a cache in the same region is days of human time.
- **Story:** The app server asks Redis for one key; a ring counts 5.8 human days; tags show the network round trip (2.9 d) and the whole query (5.8 d). Verdict: "One cache query: about 6 days".
- **Numbers:** Round trip inside a region 250 microseconds; Redis, Memcached or MySQL query 500 microseconds.
- **Sources:** [S3] napkin-math. Source ids refer to `agent-ip/work/system-design/01-research-dossier.md`.
