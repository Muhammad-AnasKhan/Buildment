# Canvas spec: sysdesign-m5-edge-hit

- **Course and chapter:** system-design, 5.2 beat 2 ("A hit returns early").
- **Renderer:** `scene` (data only).
- **Claim:** Each cache layer a request reaches can answer it and stop the trip there. A hit at a CDN edge near the user removes the long trip to a far origin.
- **Story:** A shopper in Singapore asks the CDN edge in Singapore for a product page. Miss: the edge fetches it from the origin in EU West and keeps it for 60 seconds; a tag puts the miss at +160 ms. The next shopper asks the same edge: hit, no trip, a tag at +0 ms. Verdict: "A hit skips the 160 ms trip".
- **Numbers:** EU West to Singapore round trip about 160 ms [S3]. The phone-to-edge trip is not drawn, because both requests pay it. The 60-second lifetime is a story choice that matches `max-age=60` in chapter 5.7.
- **Sources:** napkin-math latency table [S3]; Cache-Control freshness [S22].
