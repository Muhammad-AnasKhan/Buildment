# Canvas spec: sysdesign-m19-lag-loss

- **Course and chapter:** system-design, 19.4 beat 3 ("The copy lag is the data you lose").
- **Renderer:** `scene` (data only).
- **Claim:** With asynchronous copies, the writes lost when a region dies are the write rate times the copy lag. Customers were already told "ok".
- **Story:** Orders reach Region A and get "ok"; copies travel slowly to Region B. Region A crashes while copies are in flight. Region B is missing 300 writes. Verdict: "300 acknowledged writes never arrived".
- **Numbers:** 300 writes per second x 1 second lag = 300 writes (made up; typical cross-region lag of under a second is quoted for Aurora Global Database [S107]; the floor is the one-way delay, about 40 ms for EU West to North America East [S3]).
- **Sources:** [S3], [S107], 8.3 and 8.5 for the same loss on one leader.
