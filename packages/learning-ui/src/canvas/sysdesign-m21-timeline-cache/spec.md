# Canvas spec: sysdesign-m21-timeline-cache

- **Course and chapter:** system-design, 21.2 beat 6 (Keep the head of each timeline in memory).
- **Renderer:** `scene` (data only).
- **Claim:** Timelines hold only post ids, so the newest slice of every active reader fits in memory. Readers who return after a long time pay one slower read.
- **Story:** A feed request for an active reader hits the cache and gets 20 ids at once. A second request for a reader who has been away misses, reads the store and fills the cache. Verdict: "Active readers hit memory".
- **Numbers:** 50M active readers x 200 ids x 8 bytes = 80 GB in memory. 50M x 800 x 8 bytes = 320 GB in the timeline store. A cache query takes about 0.5 ms.
- **Sources:** Cache query time of 0.5 ms from napkin-math [S3]. Sizes are arithmetic on course assumptions.
